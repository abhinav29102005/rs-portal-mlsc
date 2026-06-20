import requests
from bs4 import BeautifulSoup
import urllib3
import re
import uuid
import time

urllib3.disable_warnings()

subdomains = {
    "csed": "Computer Science & Engineering",
    "eced": "Electronics & Communication Engineering",
    "eied": "Electrical & Instrumentation Engineering",
    "med": "Mechanical Engineering",
    "ced": "Civil Engineering",
    "ched": "Chemical Engineering",
    "bt": "Biotechnology"
}

faculty_list = []

for sub, dept_name in subdomains.items():
    url = f"https://{sub}.thapar.edu/faculty"
    try:
        res = requests.get(url, verify=False, timeout=10)
        if res.status_code != 200: continue
        soup = BeautifulSoup(res.text, 'html.parser')

        imgs = soup.find_all('img')
        fac_imgs = [img for img in imgs if 'microfaculty' in img.get('src', '')]
        
        for img in fac_imgs:
            src = img.get('src')
            if not src.startswith('http'):
                src = f"https://{sub}.thapar.edu{src}"
            
            parentBox = img.find_parent('div', class_='faculty-box')
            if parentBox:
                nameNode = parentBox.find('div', class_='faculty-design')
                if nameNode:
                    strong = nameNode.find('strong')
                    if not strong: continue
                    rawName = strong.text.strip()
                    cleanName = re.sub(r'(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)', '', rawName, flags=re.IGNORECASE).strip()
                    if not cleanName: continue

                    p_tags = nameNode.find_all('p')
                    designation = "Faculty"
                    if len(p_tags) > 1:
                        designation = p_tags[1].text.strip()
                    
                    acadNode = parentBox.find('div', class_='faculty-acad')
                    email = f"{cleanName.lower().replace(' ', '.')}@thapar.edu" # fallback
                    if acadNode:
                        email_p = acadNode.find(lambda tag: tag.name == 'p' and '@thapar.edu' in tag.text)
                        if email_p:
                            email = email_p.text.strip()
                    
                    faculty_list.append({
                        "name": cleanName, 
                        "email": email, 
                        "designation": designation, 
                        "image": src, 
                        "department": dept_name
                    })
    except Exception as e:
        pass

print(f"Scraped {len(faculty_list)} faculties.")

with open("create_all_faculty.sql", "w") as f:
    for fac in faculty_list:
        user_id = str(uuid.uuid4())
        profile_id = str(uuid.uuid4())
        name = fac['name'].replace("'", "''")
        email = fac['email'].replace("'", "''")
        image = fac['image'].replace("'", "''")
        dept = fac['department'].replace("'", "''")
        desig = fac['designation'].replace("'", "''")
        now = int(time.time() * 1000)

        # INSERT user (ignore if email exists)
        f.write(f"INSERT OR IGNORE INTO users (id, name, email, image, role, status, email_verified, created_at, updated_at) VALUES ('{user_id}', '{name}', '{email}', '{image}', 'faculty', 'active', NULL, {now}, {now});\n")
        
        # We need the user_id of the row whether it was inserted or ignored.
        # But SQLite doesn't easily return the ID on IGNORE. So we will just use a subquery for the user_id!
        f.write(f"INSERT OR IGNORE INTO faculty_profiles (id, user_id, designation, department, contact_preference, has_doctorate, seeded_from, needs_review, is_manually_edited, profile_completeness, onboarding_complete, created_at, updated_at) VALUES ('{profile_id}', (SELECT id FROM users WHERE email='{email}'), '{desig}', '{dept}', 'portal_dm', 1, 'scraper', 1, 0, 50, 1, {now}, {now});\n")

print("Generated create_all_faculty.sql")
