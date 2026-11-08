with open('KathaBridge/src/App.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # Detect the starburst behind BEYOND (top-24 or top-28 with -left-12 or left-2)
    if 'top-24' in line and 'pointer-events-none' in line and ('left-2' in line or 'left-10' in line):
        skip = True
        continue
    if skip:
        if '</div>' in line:
            skip = False
        continue
    new_lines.append(line)

with open('KathaBridge/src/App.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print('Removed element behind BEYOND successfully!')

