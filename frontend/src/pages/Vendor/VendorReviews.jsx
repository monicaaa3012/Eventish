"use client";
import { useEffect, useState } from "react";

const VendorReviews = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/reviews/my-reviews", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        setReviews(data.reviews || []);
      } catch (err) {
        console.error("Error loading reviews", err);
      }
    };

    fetchReviews();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Reviews</h1>

      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="p-4 bg-white rounded-lg shadow-md border border-gray-200"
            >
              <div className="flex items-center space-x-2 mt-1">
                <span className="font-semibold">{r.user?.name || "Anonymous"}</span>
                <span className="text-yellow-500">
                  {"⭐".repeat(r.rating)}
                </span>
              </div>

              <p className="text-gray-700 mt-2">{r.comment}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(r.date).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorReviews;
