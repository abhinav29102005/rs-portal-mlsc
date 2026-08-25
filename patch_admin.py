import os

filepath = "src/components/dashboard/AdminDashboard.tsx"
with open(filepath, "r") as f:
    content = f.read()

target = """  const [activeTab, setActiveTab] = useState<"overview" | "users" | "system">("overview");"""

replacement = """  const [activeTab, setActiveTab] = useState<"overview" | "users" | "system">("overview");

  const isSpecialAdmin = user.name?.toLowerCase().includes("ojasvi") || user.name?.toLowerCase().includes("abhinav");"""

target2 = """      {/* Greeting */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={20} className="text-red-400" />
          <p className="text-label">System Administration</p>
        </div>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            {user.name?.split(" ")[0] || "Admin"}
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Platform health and user management console
        </p>
      </motion.div>"""

replacement2 = """      {/* Greeting */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 mb-1">
          <ShieldCheck size={20} className="text-red-400" />
          <p className="text-label">System Administration</p>
        </div>
        <h1 className="heading-1 text-noir-50" style={{ fontFamily: "var(--font-heading)" }}>
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-red-400 to-red-300 bg-clip-text text-transparent">
            {user.name?.split(" ")[0] || "Admin"}
          </span>
        </h1>
        <p className="text-noir-400 mt-2">
          Platform health and user management console
        </p>
      </motion.div>

      {/* Special Admin Integrations */}
      {isSpecialAdmin && (
        <motion.div variants={itemVariants} className="bg-gradient-to-r from-red-500/20 to-amber-500/20 border border-red-500/30 p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <ShieldCheck size={100} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">🚀 Cross-Role Integrations Active</h2>
          <p className="text-sm text-red-100 mb-4">
            Hello {user.name?.split(" ")[0]}! Special cross-role simulator is enabled. Use the Role Switcher in the sidebar to seamlessly transition between Student, Faculty, and Admin views to test end-to-end proposal and mentorship flows.
          </p>
          <div className="flex gap-4">
             <button className="btn btn-primary text-sm shadow-red-500/20">Launch Role Simulator</button>
             <button className="btn btn-secondary text-sm border-white/20">View Sync Logs</button>
          </div>
        </motion.div>
      )}"""

new_content = content.replace(target, replacement).replace(target2, replacement2)
with open(filepath, "w") as f:
    f.write(new_content)
