import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const Settings = () => {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout");

      localStorage.clear();
      sessionStorage.clear();

      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error.response?.data?.message || "Failed to logout");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <div>
        <h2 className="text-2xl font-semibold text-black mb-1">Settings</h2>
        <p className="text-sm text-gray-500">Manage your account</p>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <div className="max-w-2xl">
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-black mb-2">
                Account Management
              </h3>
              <p className="text-sm text-gray-600">
                Sign out of your account and end your current session
              </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-black text-white px-6 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </div>
  );
};

export default Settings;
