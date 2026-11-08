from PIL import Image
import os

for f in sorted(os.listdir('KathaBridge/public/images/landing')):
    if f.startswith('asset_') and f.endswith('.png'):
        im = Image.open(f'KathaBridge/public/images/landing/{f}')
        print(f, im.size)

