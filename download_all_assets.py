import re
import os
import urllib.request
import json

os.makedirs('KathaBridge/public/images/stories', exist_ok=True)
os.makedirs('KathaBridge/public/images/landing', exist_ok=True)

# 1. Download story images
with open('KathaBridge/src/data/stories.json', 'r', encoding='utf-8') as f:
    stories = json.load(f)

for s in stories:
    sid = s['id']
    url = s.get('image')
    local_path = f'KathaBridge/public/images/stories/{sid}.png'
    web_path = f'/images/stories/{sid}.png'
    print(f'Downloading story {sid} -> {local_path}...')
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            with open(local_path, 'wb') as out_f:
                out_f.write(data)
        print(f'Saved {local_path} ({len(data)} bytes)')
        s['image'] = web_path
    except Exception as e:
        print(f'Error downloading {sid}: {e}')

with open('KathaBridge/src/data/stories.json', 'w', encoding='utf-8') as f:
    json.dump(stories, f, indent=2, ensure_ascii=False)

# 2. Check code.html for landing images
with open('code.html', 'r', encoding='utf-8') as f:
    code_html = f.read()

urls = list(set(re.findall(r'src=["\'](https://lh3\.googleusercontent\.com/[^"\']+)["\']', code_html)))
print(f'Found {len(urls)} distinct images in code.html')

url_to_local = {}
for i, u in enumerate(urls):
    filename = f'asset_{i+1}.png'
    local_path = f'KathaBridge/public/images/landing/{filename}'
    web_path = f'/images/landing/{filename}'
    print(f'Downloading landing asset {i+1}...')
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            with open(local_path, 'wb') as out_f:
                out_f.write(data)
        print(f'Saved {local_path} ({len(data)} bytes)')
        url_to_local[u] = web_path
    except Exception as e:
        print(f'Error downloading asset {i+1}: {e}')

print('Downloaded all images successfully!')

