// 📁 routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../modals/UserData");
const { sendMail } = require("../utils/mailer");
const multer = require("multer");
const cloudinary = require("../utils/cloudinary");

const router = express.Router();

//
// 🔐 Middleware: Verify JWT & Role
//
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Authorization header missing" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.user = decoded;
    next();
  });
};

const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied: Admin only" });
    next();
  });
};

//
// 🔹 Multer Memory Storage for Cloudinary
//
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Cloudinary upload helper
const uploadToCloudinary = (fileBuffer, folder = "stayelo/profile_pics") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
};

//
// ✅ USER AUTHENTICATION
//

// 🔹 Signup (optional profilePic)
router.post("/signup", upload.single("profilePic"), async (req, res) => {
  try {
    const { email, password, role, name, phone, location } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashedPassword,
      role: role || "CUSTOMER",
      phone,
      location,
    };

    if (req.file) {
      const profilePicUrl = await uploadToCloudinary(req.file.buffer);
      userData.profilePic = profilePicUrl;
    }

    const user = new User(userData);
    await user.save();

    // Send Welcome Email
    const welcomeEmailText = `
Hello ${name || "User"},

Welcome to Stayleo! 🎉

Your account has been successfully created with the email: ${email}.

You can now log in and start exploring our hotel booking platform.

Best regards,  
Stayleo Team
`;
    await sendMail(email, "Welcome to Stayleo 🎉", welcomeEmailText);

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profilePic: user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        profilePic: user.profilePic || "",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

//
// 🔄 PASSWORD RESET FLOW (OTP)
//
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    await sendMail(
      user.email,
      "Stayleo Password Reset OTP",
      `Your OTP is ${otp}. It is valid for 10 minutes.`
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Request-reset error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.resetOtp !== otp || Date.now() > user.resetOtpExpiry)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Reset-password error:", err);
    res.status(500).json({ error: err.message });
  }
});

//
// 👤 USER PROFILE
//

// ✅ Get currently logged-in user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("pastBookings")
      .select("-password -resetOtp -resetOtpExpiry");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update currently logged-in user profile (fields + optional profile picture)
router.put("/update-profile", verifyToken, upload.single("profilePic"), async (req, res) => {
  try {
    const { name, phone, location } = req.body;
    const updateData = { name, phone, location };

    if (req.file) {
      const cloudUrl = await uploadToCloudinary(req.file.buffer);
      updateData.profilePic = cloudUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password -resetOtp -resetOtpExpiry");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
});

//
// 🔹 Get user by ID (Admin or Self)
router.get("/users/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "ADMIN")
      return res.status(403).json({ message: "Access denied" });

    const user = await User.findById(req.params.id)
      .populate("pastBookings")
      .select("-password -resetOtp -resetOtpExpiry");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: err.message });
  }
});

//
// 🧑‍💼 ADMIN: CUSTOMER MANAGEMENT
//
router.get("/customers", verifyAdmin, async (req, res) => {
  try {
    const customers = await User.find({ role: "CUSTOMER" }).select(
      "-password -resetOtp -resetOtpExpiry"
    );
    res.json(customers);
  } catch (err) {
    console.error("Get customers error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/customers/:id", verifyAdmin, async (req, res) => {
  try {
    const customer = await User.findById(req.params.id)
      .populate("pastBookings")
      .select("-password -resetOtp -resetOtpExpiry");

    if (!customer) return res.status(404).json({ message: "Customer not found" });

    res.json(customer);
  } catch (err) {
    console.error("Get customer error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put("/customers/:id", verifyAdmin, async (req, res) => {
  try {
    const { name, email, phone, location, status } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, location, status },
      { new: true, runValidators: true }
    ).select("-password -resetOtp -resetOtpExpiry");

    if (!updated) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer updated", user: updated });
  } catch (err) {
    console.error("Update customer error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/customers/:id", verifyAdmin, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    console.error("Delete customer error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
