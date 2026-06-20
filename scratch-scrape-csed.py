import requests
from bs4 import BeautifulSoup
import urllib3
urllib3.disable_warnings()

res = requests.get('https://csed.thapar.edu/faculty', verify=False)
soup = BeautifulSoup(res.text, 'html.parser')

faculties = []
for div in soup.select('div.tpo-person-card'):
    name_el = div.select_one('h3')
    img_el = div.select_one('img')
    if name_el and img_el:
        faculties.append((name_el.text.strip(), img_el['src']))

print(f"Found {len(faculties)} via tpo-person-card")

# Thapar CSED uses a different layout sometimes. Let's just look for any image tags that might be faculty
imgs = soup.find_all('img')
fac_imgs = [img for img in imgs if 'microfaculty' in img.get('src', '')]
print(f"Found {len(fac_imgs)} microfaculty images")
if len(fac_imgs) > 0:
    for img in fac_imgs[:5]:
        parent = img.find_parent('div', class_='team-box') or img.find_parent('div')
        name = parent.text.strip() if parent else "Unknown"
        print(f"Image: {img.get('src')} - Parent Text Snippet: {name[:50]}")

