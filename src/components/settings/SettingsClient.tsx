"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Moon, Bell, Shield, LogOut, CheckCircle, Smartphone } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

export function SettingsClient({ user }: { user: { name: string; email: string; role: string } }) {
  const [activeTab, setActiveTab] = useState("account");
  const { theme, setTheme } = useTheme();
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    updates: true,
  });

  const tabs = [
    { id: "account", label: "Account", icon: <User size={18} /> },
    { id: "appearance", label: "Appearance", icon: <Moon size={18} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
    { id: "security", label: "Security", icon: <Shield size={18} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-5xl">
      {/* Sidebar Tabs */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-red-500/10 text-red-400"
                : "text-noir-300 hover:bg-white/5 hover:text-noir-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </aside>

      {/* Content Area */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          
          {activeTab === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="card-glass p-8">
                <h2 className="text-xl font-bold text-noir-50 font-heading mb-6">Profile Details</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="text-label block mb-2">Full Name</label>
                    <input type="text" value={user.name} disabled className="input-noir opacity-75 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-label block mb-2">Email Address</label>
                    <input type="email" value={user.email} disabled className="input-noir opacity-75 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="text-label block mb-2">Role</label>
                    <input type="text" value={user.role.toUpperCase()} disabled className="input-noir opacity-75 cursor-not-allowed" />
                    <p className="text-xs text-noir-400 mt-2">
                      Your basic information is synced with your Google account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card-glass p-8 border-red-500/20">
                <h2 className="text-xl font-bold text-red-400 font-heading mb-2">Sign Out</h2>
                <p className="text-sm text-noir-400 mb-6">Log out of your current session.</p>
                <button onClick={() => signOut()} className="btn btn-destructive">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "appearance" && (
            <motion.div
              key="appearance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="card-glass p-8">
                <h2 className="text-xl font-bold text-noir-50 font-heading mb-6">Theme Settings</h2>
                <p className="text-sm text-noir-400 mb-6">
                  Customize the look and feel of the platform.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: "light", label: "Light Mode", icon: <User size={24} /> },
                    { id: "dark", label: "Dark Mode", icon: <Moon size={24} /> },
                    { id: "system", label: "System Sync", icon: <Smartphone size={24} /> },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`relative flex flex-col items-center justify-center gap-4 p-6 rounded-2xl border transition-all ${
                        theme === t.id
                          ? "border-red-500 bg-red-500/10 text-red-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                          : "border-white/10 bg-noir-900 text-noir-400 hover:bg-noir-800 hover:text-noir-200 hover:border-white/20"
                      }`}
                    >
                      {theme === t.id && (
                        <span className="absolute top-3 right-3 text-red-400">
                          <CheckCircle size={16} />
                        </span>
                      )}
                      {t.icon}
                      <span className="font-medium">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="card-glass p-8">
                <h2 className="text-xl font-bold text-noir-50 font-heading mb-6">Notification Preferences</h2>
                <div className="space-y-6">
                  {[
                    { key: "email", title: "Email Notifications", desc: "Receive email alerts when you receive a message or proposal." },
                    { key: "push", title: "Browser Push", desc: "Get real-time browser notifications for important events." },
                    { key: "updates", title: "Platform Updates", desc: "Occasional emails about new features and portal updates." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-noir-50">{item.title}</p>
                        <p className="text-sm text-noir-400">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications] ? "bg-red-500" : "bg-noir-600"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform mt-1 ${
                            notifications[item.key as keyof typeof notifications] ? "translate-x-7 ml-0.5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="card-glass p-8">
                <h2 className="text-xl font-bold text-noir-50 font-heading mb-6">Security Settings</h2>
                <div className="card-glass-static bg-noir-900/50 p-6 flex items-start gap-4 border-dashed border-white/10">
                  <Shield className="text-noir-500 flex-shrink-0" size={24} />
                  <div>
                    <p className="font-medium text-noir-200">OAuth Authentication</p>
                    <p className="text-sm text-noir-400 mt-1">
                      Your account security is managed by your Google Workspace provider. Passwords and 2FA settings should be managed directly through Google.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
