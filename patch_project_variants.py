import os

filepath = "src/components/discovery/ProjectDiscovery.tsx"
with open(filepath, "r") as f:
    content = f.read()

target1 = """const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.02 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};"""

replacement1 = """const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
};"""

target2 = """                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="card-glass p-6 group hover:border-red-500/30 transition-all flex flex-col md:flex-row gap-6 items-start"
                >"""
replacement2 = """                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  className="card-glass p-6 group hover:border-red-500/30 transition-all flex flex-col md:flex-row gap-6 items-start"
                >"""

new_content = content.replace(target1, replacement1).replace(target2, replacement2)
with open(filepath, "w") as f:
    f.write(new_content)
