import requests
from bs4 import BeautifulSoup
import urllib3
import re

urllib3.disable_warnings()
subdomains = ["csed", "eced", "eied", "med", "ced", "ched", "bt"]

updates = []

for sub in subdomains:
    url = f"https://{sub}.thapar.edu/faculty"
    try:
        res = requests.get(url, verify=False, timeout=5)
        if res.status_code != 200:
            continue
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
                if nameNode and nameNode.find('strong'):
                    rawName = nameNode.find('strong').text.strip()
                    cleanName = re.sub(r'(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)', '', rawName, flags=re.IGNORECASE).strip()
                    updates.append((cleanName, src))
            else:
                # Fallback for other layouts
                card = img.find_parent('div', class_='team-box') or img.find_parent('div', class_='tpo-person-card')
                if card:
                    name_tag = card.find(['h3', 'h4']) or card.find('a', class_='name')
                    if name_tag:
                        cleanName = re.sub(r'(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)', '', name_tag.text.strip(), flags=re.IGNORECASE).strip()
                        updates.append((cleanName, src))
    except Exception as e:
        pass

with open("update_images_all.sql", "w") as f:
    for name, url in updates:
        name_esc = name.replace("'", "''")
        f.write(f"UPDATE users SET image = '{url}' WHERE name LIKE '%{name_esc}%' AND role = 'faculty';\n")

print(f"Generated {len(updates)} SQL updates for all departments.")
