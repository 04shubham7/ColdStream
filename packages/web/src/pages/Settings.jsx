import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, User, Mail, Server, Shield, Key } from "lucide-react";
import api from "../lib/api";
import { useAuthStore } from "../store/authStore";

const Settings = () => {
  const { user, setUser } = useAuthStore();
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [smtpForm, setSmtpForm] = useState({ host: "smtp.gmail.com", port: 587, user: "", pass: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || "", email: user.email || "" });
    }
    const fetchSmtp = async () => {
      try {
        const { data } = await api.get("/users/smtp");
        if (data.data) {
          setSmtpForm({
            host: data.data.host || "smtp.gmail.com",
            port: data.data.port || 587,
            user: data.data.user || "",
            pass: "", // Never display password
          });
        }
      } catch (err) {
        console.error("Failed to fetch SMTP config", err);
      }
    };
    fetchSmtp();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const { data } = await api.put("/users/profile", profileForm);
      setUser(data.data);
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update profile" });
    } finally {
      setLoading(false);
    }
  };

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await api.put("/users/smtp", smtpForm);
      setMessage({ type: "success", text: "SMTP configuration updated successfully!" });
      setSmtpForm(prev => ({ ...prev, pass: "" })); // Clear pass field after save
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to update SMTP" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-gray-400">Manage your profile and email sending configuration.</p>
      </div>

      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            message.type === "success" 
              ? "bg-green-500/10 border-green-500/20 text-green-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Profile</h2>
              <p className="text-sm text-gray-400">Update your personal details.</p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </form>
        </motion.div>

        {/* SMTP Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Email Configuration</h2>
              <p className="text-sm text-gray-400">Configure SMTP to send cold emails.</p>
            </div>
          </div>

          <form onSubmit={handleSmtpSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-500" />
                  Host
                </label>
                <input
                  type="text"
                  value={smtpForm.host}
                  onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Port</label>
                <input
                  type="number"
                  value={smtpForm.port}
                  onChange={(e) => setSmtpForm({ ...smtpForm, port: parseInt(e.target.value) })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                SMTP Email (Username)
              </label>
              <input
                type="email"
                value={smtpForm.user}
                onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                placeholder="you@gmail.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Key className="w-4 h-4 text-gray-500" />
                App Password
              </label>
              <input
                type="password"
                value={smtpForm.pass}
                onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                placeholder="16-character app password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              />
              <div className="text-xs text-gray-400 bg-purple-500/5 border border-purple-500/10 p-3 rounded-lg mt-2 space-y-2">
                <p className="font-medium text-purple-300/90 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  How to get a Gmail App Password:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Go to your <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Google Account Security page</a>.</li>
                  <li>Ensure <strong>2-Step Verification</strong> is turned on.</li>
                  <li>Search for <strong>"App passwords"</strong> in the top search bar.</li>
                  <li>Create a new password (name it "ColdStream") and paste the 16 characters here.</li>
                </ol>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              <Shield className="w-4 h-4" />
              Save SMTP Configuration
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
