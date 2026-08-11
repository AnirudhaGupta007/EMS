import React, { useEffect, useState, useRef } from "react";
import { Toaster } from "react-hot-toast";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit2,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Loader2,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const { profile, setProfile } = useOutletContext();

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [editedProfile, setEditedProfile] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle profile update
  const handleSave = async () => {
    try {
      setIsUpdating(true);
      const formData = new FormData();

      formData.append("name", editedProfile.name);
      formData.append("email", editedProfile.email);
      formData.append("phone", editedProfile.phone);
      formData.append("address", editedProfile.address);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await api.put(`/employees/me`, formData);

      const { data } = await api.get("/employees/me");
      setProfile({
        name: data.userId.name,
        role: data.position,
        department: data.department.name,
        email: data.userId.email,
        phone: data.phone,
        address: data.address,
        joinDate: new Date(data.dateJoined).toLocaleDateString(),
        employeeId: data._id,
        employeeCode: data.employeeCode,
        status: data.status,
        profileImage: data.profileImage,
        salary: data.salary,
        gender: data.gender,
      });

      setIsEditing(false);
      setProfileImage(null);
      setImagePreview(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setProfileImage(null);
    setImagePreview(null);
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsChangingPassword(true);
      await api.put(`/employees/me/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success("Password updated successfully");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getImageUrl = () => {
    if (imagePreview) return imagePreview;
    if (profile?.profileImage) {
      return `http://localhost:5000/uploads/employee-profiles/${profile.profileImage}`;
    }
    return null;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <Toaster position="top-right" />
      {/* Header Card */}
      <div className="bg-white border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 relative">
            {/* Profile Image with Upload */}
            <div className="relative group">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-600 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                {getImageUrl() ? (
                  <img
                    className="w-full h-full object-cover"
                    src={getImageUrl()}
                    alt="Profile"
                  />
                ) : (
                  <span className="text-white text-3xl font-bold">
                    {profile?.name?.charAt(0) || "U"}
                  </span>
                )}
              </div>

              {isEditing && (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera size={24} className="text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div className="flex-1 mt-4 sm:mt-0">
              <div className="flex items-start justify-between">
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile?.name || ""}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          name: e.target.value,
                        })
                      }
                      className="text-2xl font-bold text-gray-900 tracking-tight px-2 py-1 border border-gray-300 focus:border-gray-900 focus:outline-none"
                    />
                  ) : (
                    <h1 className="text-2xl font-semibold text-yellow-50 tracking-tight">
                      {profile?.name}
                    </h1>
                  )}
                  <p className="text-sm capitalize text-gray-600 mt-1">
                    {profile?.role}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium">
                      {profile?.department}
                    </span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium">
                      Active
                    </span>
                  </div>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Edit2 size={14} />
                    Edit Profile
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Information */}
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User size={16} />
            Personal Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile?.email || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        email: e.target.value,
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none"
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                    <Mail size={14} className="text-gray-400" />
                    {profile?.email}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile?.phone || ""}
                    onChange={(e) =>
                      setEditedProfile({
                        ...editedProfile,
                        phone: e.target.value,
                      })
                    }
                    className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none"
                  />
                ) : (
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                    <Phone size={14} className="text-gray-400" />
                    {profile?.phone}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile?.address || ""}
                  onChange={(e) =>
                    setEditedProfile({
                      ...editedProfile,
                      address: e.target.value,
                    })
                  }
                  className="mt-1 w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none"
                />
              ) : (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                  <MapPin size={14} className="text-gray-400" />
                  {profile?.address}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="px-4 py-2 bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Employment Details */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase size={16} />
              Employment Details
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Employee ID
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {profile?.employeeCode}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Join Date
                </label>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-900">
                  <Calendar size={14} className="text-gray-400" />
                  {profile?.joinDate}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Department
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.department}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Lock size={16} />
              Security
            </h2>
            <p className="text-xs text-gray-600 mb-4">
              Keep your account secure by updating your password regularly
            </p>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full px-4 py-2 bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        current: !showPassword.current,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.current ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        new: !showPassword.new,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.new ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Confirm New Password
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 focus:border-gray-900 focus:outline-none pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword({
                        ...showPassword,
                        confirm: !showPassword.confirm,
                      })
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword.confirm ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-gray-700">
                Password must be at least 6 characters long
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                  }}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-xs font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
