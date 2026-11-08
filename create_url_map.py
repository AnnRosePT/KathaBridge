import os
import re
import json
import urllib.request
import hashlib

asset_hashes = {}
landing_dir = 'KathaBridge/public/images/landing'
for fname in os.listdir(landing_dir):
    fpath = os.path.join(landing_dir, fname)
    with open(fpath, 'rb') as f:
        h = hashlib.sha256(f.read()).hexdigest()
        asset_hashes[h] = f'/images/landing/{fname}'

story_dir = 'KathaBridge/public/images/stories'
for fname in os.listdir(story_dir):
    fpath = os.path.join(story_dir, fname)
    with open(fpath, 'rb') as f:
        h = hashlib.sha256(f.read()).hexdigest()
        asset_hashes[h] = f'/images/stories/{fname}'

with open('code.html', 'r', encoding='utf-8') as f:
    code = f.read()

urls = list(set(re.findall(r'src=["\'](https://lh3\.googleusercontent\.com/[^"\']+)["\']', code)))

url_map = {}
for u in urls:
    req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read()
            h = hashlib.sha256(data).hexdigest()
            if h in asset_hashes:
                url_map[u] = asset_hashes[h]
                print(f'Matched {asset_hashes[h]}')
            else:
                print('No hash match')
    except Exception as e:
        print('Error:', e)

with open('url_map.json', 'w', encoding='utf-8') as f:
    json.dump(url_map, f, indent=2)

print('Done, total mapped:', len(url_map))

