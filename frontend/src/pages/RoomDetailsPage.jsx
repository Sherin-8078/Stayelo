import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  CalendarIcon,
  UserIcon,
  WifiIcon,
  FireIcon,
  HomeIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export default function RoomDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState(2);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/rooms/${id}`);
        const roomData = res.data.room || res.data;

        if (!roomData.reviews || roomData.reviews.length === 0) {
          roomData.reviews = [
            { user: "John Doe", rating: 5, comment: "Amazing stay! Highly recommend." },
            { user: "Jane Smith", rating: 4, comment: "Very comfortable and clean." },
            { user: "Alex Johnson", rating: 5, comment: "Excellent service and location." },
          ];
        }

        if (!roomData.amenities || roomData.amenities.length === 0) {
          roomData.amenities = [
            { icon: <WifiIcon className="w-5 h-5 text-blue-600" />, text: "Free High-Speed Wi-Fi" },
            { icon: <FireIcon className="w-5 h-5 text-blue-600" />, text: "Outdoor Swimming Pool" },
            { icon: <HomeIcon className="w-5 h-5 text-blue-600" />, text: "Free Parking" },
            { icon: <SparklesIcon className="w-5 h-5 text-blue-600" />, text: "On-site Restaurant" },
            { icon: <HeartIcon className="w-5 h-5 text-blue-600" />, text: "Full-Service Spa" },
          ];
        }

        setRoom(roomData);
      } catch (err) {
        console.error("Error fetching room details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleBooking = async () => {
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please log in to book a room.");
      navigate("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates.");
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      setError("Check-out date must be after check-in date.");
      return;
    }

    if (guests < 1) {
      setError("Please enter at least one guest.");
      return;
    }

    try {
      setBookingLoading(true);

      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      const totalPrice = nights * (room?.price || 0);

      const res = await axios.post(
        "http://localhost:4000/api/bookings",
        { roomId: id, checkIn, checkOut, guests, totalPrice, status: "confirmed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        const booking = res.data.booking || res.data;
        setSuccess("Booking successful! Redirecting...");
        setTimeout(() => {
          navigate(`/booking-confirmation/${booking._id}`, {
            state: { booking, room, checkIn, checkOut, guests, totalPrice },
          });
        }, 1500);
      }
    } catch (err) {
      console.error("Booking error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Booking failed. Please try again later.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading)
    return <div className="text-center py-32 text-gray-600 text-lg">Loading room details...</div>;

  if (!room)
    return <div className="text-center py-32 text-red-600 text-lg">Room not found.</div>;

  const mainImage =
    room.images?.length > 0
      ? room.images[mainImageIndex]
      : "https://via.placeholder.com/800x600?text=No+Image+Available";

  return (
    <div className="min-h-screen pt-24 px-6 md:px-12
      bg-gradient-to-b from-cyan-50 via-white to-cyan-100
      dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 
      dark:text-gray-100 text-gray-800">
      {/* Room Title */}
      <div className="px-4 md:px-12 py-3 text-gray-800 dark:text-white font-semibold text-2xl">{room.name}</div>

      {/* Image + Booking Section */}
      <div className="px-4 md:px-12 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Images + Details */}
        <div className="md:col-span-2">
          <div className="rounded-2xl overflow-hidden relative">
            <img src={mainImage} alt="Room" className="w-full h-72 md:h-96 object-cover" />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto">
            {room.images?.map((img, i) => (
              <div
                key={i}
                className={`w-20 md:w-36 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-all duration-200 ${
                  mainImageIndex === i ? "ring-2 ring-blue-500 scale-105 dark:ring-fuchsia-500" : ""
                }`}
                onClick={() => setMainImageIndex(i)}
              >
                <img src={img} alt={`Thumbnail ${i}`} className="h-16 md:h-24 w-full object-cover" />
              </div>
            ))}
          </div>

          {/* Description & Amenities */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {room.details?.description || room.description || "No description available."}
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {room.amenities.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                  {a.icon || <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-fuchsia-400" />} <span>{a.text || a}</span>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800 dark:text-white">Details</h3>
            <div className="grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-300 text-sm">
              <p><strong>Price per night:</strong> ₹{room.price}</p>
              <p><strong>Capacity:</strong> {room.details?.capacity || room.capacity || "N/A"} guests</p>
              <p><strong>Bed Type:</strong> {room.details?.bedType || room.bedType || "N/A"}</p>
              <p><strong>Category:</strong> {room.details?.category || room.category || "N/A"}</p>
            </div>

            {/* Reviews */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">Reviews</h3>
              <div className="space-y-4">
                {room.reviews.map((review, i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800 dark:text-white">{review.user || "Anonymous"}</span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(review.rating || 5)].map((_, idx) => (
                          <StarIcon key={idx} className="w-4 h-4" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <div className="md:sticky top-20">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{room.name}</h2>
            <div className="text-3xl font-bold text-blue-600 dark:text-fuchsia-500">₹{room.price}</div>
            <div className="text-gray-500 dark:text-gray-300 text-sm mb-4">per night</div>

            <div className="space-y-3">
              <div>
                <label className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" /> Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  min={today}
                  className="mt-1 w-full border rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" /> Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  min={checkIn || today}
                  className="mt-1 w-full border rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-1">
                  <UserIcon className="w-4 h-4" /> Guests
                </label>
                <input
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  min={1}
                  className="mt-1 w-full border rounded-md px-2 py-1 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && <p className="text-green-600 text-sm mt-2">{success}</p>}

            <div className="mt-3 text-red-500 text-sm font-medium">
              Hurry! Only 2 rooms left at this price.
            </div>

            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="mt-5 w-full bg-gradient-to-r from-cyan-500 to-indigo-600 dark:from-violet-600 dark:to-fuchsia-500 hover:opacity-90 text-white py-2 rounded-lg font-semibold shadow-md transition-all duration-200 disabled:opacity-70"
            >
              {bookingLoading ? "Processing..." : "Book Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
