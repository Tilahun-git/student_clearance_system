"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function NotificationModal({
  notificationId,
  onClose,
}: {
  notificationId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      const res = await fetch(
        `/api/notifications/details?id=${notificationId}`
      );
      const result = await res.json();
      setData(result);
    };

    fetchDetails();
  }, [notificationId]);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      
      {/* ✨ Animated Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
      >

        {/* ❌ Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black transition"
        >
          <X size={20} />
        </button>

        {/* 🔔 Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Notification
          </h2>
          <p className="text-xs text-gray-400">
            {new Date(data.notification.createdAt).toLocaleString()}
          </p>
        </div>

        {/* 📄 Message */}
        <div className="bg-gray-50 p-4 rounded-lg border">
          <p className="text-sm text-gray-700 leading-relaxed">
            {data.notification.message}
          </p>
        </div>

        {/* ⚠️ Rejection Reason */}
        {data.extraData?.comment && (
          <div className="mt-4 p-4 rounded-lg border border-red-200 bg-red-50">
            <p className="text-sm font-semibold text-red-600 mb-1">
              Rejection Reason
            </p>
            <p className="text-sm text-red-700">
              {data.extraData.comment}
            </p>
          </div>
        )}

        {/* 🎯 Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border text-gray-600 hover:bg-gray-100 transition"
          >
            Close
          </button>

          {/* Optional future button */}
          {/* <button className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            View Details
          </button> */}
        </div>
      </motion.div>
    </div>
  );
}