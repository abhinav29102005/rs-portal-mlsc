import os

files = [
    "src/components/discovery/FacultyDiscovery.tsx",
    "src/components/discovery/ProjectDiscovery.tsx"
]

for filepath in files:
    with open(filepath, "r") as f:
        content = f.read()

    target = """  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },"""
    replacement = """  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 20 } },"""
    
    new_content = content.replace(target, replacement)
    
    with open(filepath, "w") as f:
        f.write(new_content)

