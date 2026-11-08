import re

with open('code.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'class="[^"]*max-w-[^"]*"', text)
for m in sorted(list(set(matches))):
    print(m)

