import requests
from bs4 import BeautifulSoup
import urllib3
import re

urllib3.disable_warnings()
subdomains = ["csed", "eced", "eied", "med", "ced", "ched", "bt"]

faculty_list = []

for sub in subdomains:
    url = f"https://{sub}.thapar.edu/faculty"
    try:
        res = requests.get(url, verify=False, timeout=5)
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
                    
                    # Designation is usually the next <p>
                    p_tags = nameNode.find_all('p')
                    designation = "Faculty"
                    if len(p_tags) > 1:
                        designation = p_tags[1].text.strip()
                    
                    # Email is usually in faculty-acad
                    acadNode = parentBox.find('div', class_='faculty-acad')
                    email = f"{cleanName.lower().replace(' ', '.')}@thapar.edu" # fallback
                    if acadNode:
                        email_p = acadNode.find(lambda tag: tag.name == 'p' and '@thapar.edu' in tag.text)
                        if email_p:
                            email = email_p.text.strip()
                    
                    faculty_list.append({"name": cleanName, "email": email, "designation": designation, "image": src, "department": sub.upper()})
    except Exception as e:
        pass

print(f"Successfully parsed {len(faculty_list)} faculty members.")
if len(faculty_list) > 0:
    print(faculty_list[0])
    print(faculty_list[-1])
