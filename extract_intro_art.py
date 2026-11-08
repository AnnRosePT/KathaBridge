from PIL import Image

src_path = 'C:/Users/Annrose PT/.gemini/antigravity/brain/93d071da-2e07-4ddd-9823-d7dbdf9a756a/.user_uploaded/media_1794155895324_12df404d.jpg'
im = Image.open(src_path).convert('RGBA')

# The full mini-mockup card is in the right area
# Let's crop the art from x=655 to 855, y=210 to 525
art_crop = im.crop((655, 210, 855, 525))

# The background of that art is dark/black (around (4, 4, 4) to (15, 15, 15))
# Let's make pure dark pixels transparent so it can sit cleanly on any dark background
art_data = art_crop.getdata()
new_data = []
for p in art_data:
    # If pixel is close to black (r < 18 and g < 18 and b < 18)
    if p[0] < 18 and p[1] < 18 and p[2] < 18:
        new_data.append((0, 0, 0, 0))
    else:
        new_data.append(p)

art_crop.putdata(new_data)
# Let's upscale slightly with high-quality resampling for crisp display
art_crop_scaled = art_crop.resize((art_crop.width * 2, art_crop.height * 2), Image.Resampling.LANCZOS)
art_crop_scaled.save('KathaBridge/public/images/landing/intro_exact_collage.png')

print('Saved intro_exact_collage.png:', art_crop_scaled.size)

