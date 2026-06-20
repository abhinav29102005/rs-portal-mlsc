import requests
from bs4 import BeautifulSoup
import urllib3
urllib3.disable_warnings()

res = requests.get('https://csed.thapar.edu/faculty', verify=False)
soup = BeautifulSoup(res.text, 'html.parser')

imgs = soup.find_all('img')
fac_imgs = [img for img in imgs if 'microfaculty' in img.get('src', '')]
for img in fac_imgs[:2]:
    print("--- IMAGE TAG ---")
    print(img)
    print("--- PARENT TAG ---")
    print(img.find_parent('div').prettify()[:500])
