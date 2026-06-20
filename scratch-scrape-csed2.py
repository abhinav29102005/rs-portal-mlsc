import requests
from bs4 import BeautifulSoup
import urllib3
urllib3.disable_warnings()

res = requests.get('https://csed.thapar.edu/faculty', verify=False)
soup = BeautifulSoup(res.text, 'html.parser')

imgs = soup.find_all('img')
fac_imgs = [img for img in imgs if 'microfaculty' in img.get('src', '')]
for img in fac_imgs[:5]:
    parent = img.find_parent('div')
    # Try finding an <a> tag nearby or an <h3> tag in the same generic container
    card = img.find_parent('div', class_='col-md-3') or img.find_parent('div', class_='col-sm-6') or img.find_parent('li')
    if card:
        name_tag = card.find('h4') or card.find('h3') or card.find('a')
        name = name_tag.text.strip() if name_tag else "No name found"
        print(f"Name: {name} | Image: {img.get('src')}")
    else:
        print(f"Could not find card for {img.get('src')}")
