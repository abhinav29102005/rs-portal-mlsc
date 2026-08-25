import os

filepath = "src/app/(portal)/template.tsx"
with open(filepath, "r") as f:
    content = f.read()

target = """      transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}"""
replacement = """      transition={{ type: "spring", stiffness: 260, damping: 20 }}"""

new_content = content.replace(target, replacement)
with open(filepath, "w") as f:
    f.write(new_content)
