const jwt = require("jsonwebtoken");

/**
 * ✅ Authenticate JWT token and attach decoded user info to req.user
 */
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader)
      return res
        .status(401)
        .json({ message: "Authorization header missing" });

    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "Access token missing" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err)
        return res
          .status(403)
          .json({ message: "Invalid or expired access token" });
      req.user = decoded; // contains { id, role }
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication error" });
  }
};

/**
 * ✅ Role-based access control (supports single role or array of roles)
 * @param {string|string[]} roles - Allowed role(s) e.g., 'ADMIN' or ['ADMIN', 'CUSTOMER']
 */
const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user)
        return res.status(401).json({ message: "Not authenticated" });

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      if (!allowedRoles.includes(req.user.role))
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient privileges" });

      next();
    } catch (error) {
      console.error("Role check error:", error);
      res.status(500).json({ message: "Authorization error" });
    }
  };
};

/**
 * ✅ Optional helper for admins only (shortcut)
 */
const requireAdmin = requireRole("ADMIN");

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
};
