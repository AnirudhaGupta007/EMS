import React, { useState, useEffect } from "react";
import api from "../api/axios";
import PopupNotification from "../components/PopupNotification";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showPopup, setShowPopup] = useState(null);

  useEffect(() => {
    setTimeout(() => setMounted(true), 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      console.log("Logged in user:", data);

      console.log(data.role);
      if (data.role == "admin") {
        navigate("/admin/dashboard");
      } else if (data.role == "employee") {
        navigate("/employee/profile");
      }

      setShowPopup({
        type: "success",
        message: `Welcome ${data.name}! Login successful.`,
      });
    } catch (err) {
      console.error(err.response?.data?.message || err.message);
      setShowPopup({
        type: "error",
        message:
          err.response?.data?.message || "Login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <>
      {showPopup && (
        <PopupNotification
          type={showPopup.type}
          message={showPopup.message}
          onClose={() => setShowPopup(null)}
        />
      )}

      <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-gradient-to-br from-indigo-400 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${
                  5 + Math.random() * 10
                }s ease-in-out infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        <div
          className={`w-full max-w-sm relative z-10 transition-all duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ fontFamily: "'Manrope', sans-serif" }}
        >
          {/* Header Section */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-4 relative">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center rounded-lg shadow-lg transform hover:rotate-12 transition-all duration-500 ease-out">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Eastern Prints Pvt Ltd
              </span>
            </div>
            <h1 className="text-lg font-bold text-gray-800 mb-1">
              Welcome Back
            </h1>
            <p className="text-xs text-gray-600">Employee Management System</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/80 backdrop-blur-xl border-2 border-white/50 rounded-xl p-6 shadow-2xl transform hover:scale-[1.02] transition-all duration-500 ease-out">
            {/* Gradient Bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mb-5"></div>

            <h2 className="text-sm font-bold text-gray-800 mb-5">
              Sign In to Continue
            </h2>

            <div className="space-y-4">
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 text-xs bg-white/50 text-gray-800 border-2 border-gray-200 rounded-lg transition-all duration-500 ease-out focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg"
                  placeholder=" "
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 text-xs text-gray-500 pointer-events-none transition-all duration-500 ease-out ${
                    email || emailFocused
                      ? "-top-2 text-[10px] bg-white px-1.5 text-purple-600 font-semibold"
                      : "top-2"
                  }`}
                >
                  Email Address
                </label>
              </div>

              <div className="relative group">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 text-xs bg-white/50 text-gray-800 border-2 border-gray-200 rounded-lg transition-all duration-500 ease-out focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-lg"
                  placeholder=" "
                />
                <label
                  htmlFor="password"
                  className={`absolute left-3 text-xs text-gray-500 pointer-events-none transition-all duration-500 ease-out ${
                    password || passwordFocused
                      ? "-top-2 text-[10px] bg-white px-1.5 text-purple-600 font-semibold"
                      : "top-2"
                  }`}
                >
                  Password
                </label>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2.5 text-xs font-bold tracking-wide rounded-lg transition-all duration-500 ease-out hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-700 ease-out"></span>
                <span className="relative flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-3.5 w-3.5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <span className="text-sm transition-transform duration-300 ease-out group-hover:translate-x-1">
                        →
                      </span>
                    </>
                  )}
                </span>
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center text-[10px] text-gray-500">
                <span>Secure and encrypted connection</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4 space-y-1">
            <p className="text-[10px] text-gray-600 font-medium">
              EMS System Designed by Ahmed Maajid
            </p>
          </div>
        </div>

        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        <style>{`
          @keyframes blob {
            0%, 100% {
              transform: translate(0, 0) scale(1);
            }
            25% {
              transform: translate(20px, -50px) scale(1.1);
            }
            50% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            75% {
              transform: translate(50px, 50px) scale(1.05);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            50% {
              transform: translateY(-20px) translateX(10px);
            }
          }
          
          .animate-blob {
            animation: blob 7s infinite;
          }
          
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    </>
  );
};

export default Login;
