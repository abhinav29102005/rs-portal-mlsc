import os

filepath = "src/components/proposals/ProposalModal.tsx"
with open(filepath, "r") as f:
    content = f.read()

target = """        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          className="relative w-full max-w-2xl bg-noir-950 p-6 md:p-8 shadow-2xl rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto outreach-modal"
        >"""

replacement = """        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }} 
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-noir-950 p-6 md:p-8 shadow-2xl rounded-2xl border border-white/10 max-h-[90vh] overflow-y-auto outreach-modal"
        >"""

target2 = """        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />"""

replacement2 = """        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />"""

new_content = content.replace(target, replacement).replace(target2, replacement2)
with open(filepath, "w") as f:
    f.write(new_content)
