import requests
from bs4 import BeautifulSoup
import urllib3
urllib3.disable_warnings()

res = requests.get('https://csed.thapar.edu/faculty', verify=False)
soup = BeautifulSoup(res.text, 'html.parser')

cards = soup.find_all('div', class_='faculty-item')
if not cards:
    # Try finding div with class containing faculty
    cards = [div for div in soup.find_all('div') if div.get('class') and any('faculty' in c for c in div.get('class'))]

print(f"Found {len(cards)} potential faculty cards")
for card in cards[:5]:
    name_tag = card.find('h3') or card.find('h4') or card.find('a', class_='name')
    if not name_tag:
        # maybe an a tag inside an h3
        name_tag = card.find('a')
        
    img = card.find('img')
    if img and name_tag:
        print(f"Name: {name_tag.text.strip()} | Image: {img.get('src')}")

