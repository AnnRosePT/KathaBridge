import re
import os
import hashlib

# Let's map each downloaded file by content hash or direct url
with open('code.html', 'r', encoding='utf-8') as f:
    code_html = f.read()

# We already downloaded them to KathaBridge/public/images/landing/
# Let's check which landing asset corresponds to which URL
with open('download_all_assets.py', 'r', encoding='utf-8') as f:
    pass

# Read App.tsx
with open('KathaBridge/src/App.tsx', 'r', encoding='utf-8') as f:
    app_text = f.read()

# Let's see what urls in App.tsx match the ones we downloaded
import json
with open('KathaBridge/src/data/stories.json', 'r', encoding='utf-8') as f:
    stories = json.load(f)

print("Stories have local images:")
for s in stories:
    print(s['id'], s['image'])

