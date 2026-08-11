import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, X, Trash2, CheckCheck } from "lucide-react";
import api from "../api/axios";

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const { data } = await api.get("/notifications"); // api is your axios instance
      setNotifications(data);

      console.log(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
    setLoading(false);
  };

  const fetchUnreadCount = async () => {
    try {
      const { data } = await api.get("/notifications/unread-count");
      setUnreadCount(data.count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      const notification = notifications.find((n) => n._id === id);
      if (!notification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      leave_request: "📝",
      leave_approved: "✅",
      leave_rejected: "❌",
      salary_paid: "💰",
      general: "📢",
    };
    return icons[type] || "🔔";
  };

  const getNotificationColor = (type) => {
    const colors = {
      leave_request: "bg-blue-50 border-blue-200",
      leave_approved: "bg-green-50 border-green-200",
      leave_rejected: "bg-red-50 border-red-200",
      salary_paid: "bg-purple-50 border-purple-200",
      general: "bg-gray-50 border-gray-200",
    };
    return colors[type] || "bg-gray-50 border-gray-200";
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap');
          * {
            font-family: 'Manrope', sans-serif;
          }
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
          .dropdown-animate {
            animation: slideDown 0.2s ease-out;
          }
          .badge-pulse {
            animation: pulse 2s infinite;
          }
        `}
      </style>

      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 group"
      >
        <Bell size={18} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white badge-pulse px-1 z-10">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 shadow-lg z-50 dropdown-animate">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-gray-500 mt-2">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell size={32} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50/30" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 flex items-center justify-center flex-shrink-0 border ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      <span className="text-lg">
                        {getNotificationIcon(notification.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-xs font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                              title="Mark as read"
                            >
                              <Check size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
