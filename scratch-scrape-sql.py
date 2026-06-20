import requests
from bs4 import BeautifulSoup
import urllib3
import re

urllib3.disable_warnings()
res = requests.get('https://csed.thapar.edu/faculty', verify=False)
soup = BeautifulSoup(res.text, 'html.parser')

imgs = soup.find_all('img')
fac_imgs = [img for img in imgs if 'microfaculty' in img.get('src', '')]

updates = []
for img in fac_imgs:
    src = img.get('src')
    if not src.startswith('http'):
        src = f"https://csed.thapar.edu{src}"
    
    parentBox = img.find_parent('div', class_='faculty-box')
    if parentBox:
        nameNode = parentBox.find('div', class_='faculty-design')
        if nameNode and nameNode.find('strong'):
            rawName = nameNode.find('strong').text.strip()
            cleanName = re.sub(r'(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)', '', rawName, flags=re.IGNORECASE).strip()
            updates.append((cleanName, src))

with open("update_images.sql", "w") as f:
    for name, url in updates:
        # Very simple partial match for SQLite:
        # UPDATE users SET image = 'url' WHERE name LIKE '%cleanName%' AND role = 'faculty';
        name_esc = name.replace("'", "''")
        f.write(f"UPDATE users SET image = '{url}' WHERE name LIKE '%{name_esc}%' AND role = 'faculty';\n")

print(f"Generated {len(updates)} SQL updates.")
