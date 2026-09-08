import urllib.request
import urllib.parse
import json

page = urllib.parse.quote("ولاية_الوادي")
url = f"https://ar.wikipedia.org/w/api.php?action=parse&page={page}&prop=text&format=json"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
response = urllib.request.urlopen(req)
data = json.loads(response.read().decode('utf-8'))
text = data['parse']['text']['*']

with open("wiki_eloued.html", "w", encoding="utf-8") as f:
    f.write(text)
