import React, { useState, useEffect } from "react";

const PopupNotification = ({ type = "info", message = "", onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!message) return;

    setIsVisible(true);
    setProgress(100);

    const duration = 3000;
    const interval = 30;
    const decrement = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - decrement;
        if (newProgress <= 0) {
          clearInterval(progressTimer);
          return 0;
        }
        return newProgress;
      });
    }, interval);

    const closeTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(closeTimer);
    };
  }, [message]); // run effect when message changes

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const typeConfig = {
    success: {
      bgColor: "bg-white",
      borderColor: "border-white-200",
      textColor: "text-black",
      progressColor: "bg-black",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    error: {
      bgColor: "bg-white",
      borderColor: "border-white-200",
      textColor: "text-black",
      progressColor: "bg-black",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
    info: {
      bgColor: "bg-white",
      borderColor: "border-white-200",
      textColor: "text-black",
      progressColor: "bg-black",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div
      className="fixed inset-0 flex items-start justify-center pt-20 px-4 z-50 pointer-events-none"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      <div
        className={`w-full max-w-md pointer-events-auto transition-all duration-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        {/* Black Header */}
        <div className="bg-black text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${config.textColor} bg-white p-1`}>
              {config.icon}
            </div>
            <span className="font-semibold text-sm tracking-wide uppercase">
              {type === "success"
                ? "Success"
                : type === "error"
                ? "Error"
                : "Info"}
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-300 transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div
          className={`bg-white border-l border-r border-b ${config.borderColor} px-5 py-4`}
        >
          <p className="text-black text-sm leading-relaxed">{message}</p>
        </div>

        <div className="bg-gray-200 h-1 w-full overflow-hidden">
          <div
            className={`h-full ${config.progressColor} transition-all duration-100 ease-linear`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default PopupNotification;
