import json
import subprocess
import re

# Load JSON
with open('public/projects_seed.json', 'r') as f:
    data = json.load(f)

# Run pdftotext
proc = subprocess.Popen(['pdftotext', 'Project Details for Students.pdf', '-'], stdout=subprocess.PIPE)
stdout, _ = proc.communicate()
pdf_text = stdout.decode('utf-8')

# Clean up text
pdf_text = re.sub(r'\n+', '\n', pdf_text)

# We will try to find the description for each title
for project in data['projects']:
    title = project['title']
    
    # Try to find the title in the text. Sometimes titles have newlines in the PDF.
    # We create a regex for the title that allows whitespace/newlines between words.
    words = title.split()
    regex_title = r'\s+'.join([re.escape(w) for w in words])
    
    # We look for the title, followed by some spaces, followed by the description.
    # A description usually starts with a capital letter and ends with a period, before the mentor names.
    # It might be hard to perfectly regex it, but let's try grabbing the next paragraph (until a mentor name or email).
    
    pattern = re.compile(regex_title + r'\s+(.*?)(?:Dr\.|Mr\.|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', re.IGNORECASE | re.DOTALL)
    
    match = pattern.search(pdf_text)
    if match:
        desc = match.group(1).strip()
        # Clean up description (remove newlines, extra spaces)
        desc = re.sub(r'\s+', ' ', desc)
        
        # Sometimes it matches too much, so if length > 1500, we might have an issue, but let's see.
        if len(desc) > 0 and len(desc) < 2000:
             project['description'] = desc
        else:
             project['description'] = "Description not found."
    else:
        project['description'] = "Description not found."

with open('public/projects_seed_with_desc.json', 'w') as f:
    json.dump(data, f, indent=2)

print("Done extracting descriptions.")
