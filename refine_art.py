from PIL import Image

im = Image.open('KathaBridge/public/images/landing/exact_intro_art.png').convert('RGBA')
datas = im.getdata()

new_data = []
for p in datas:
    # If pixel is dark near-black (r < 25 and g < 25 and b < 25)
    brightness = (p[0] + p[1] + p[2]) / 3
    if brightness < 20:
        new_data.append((0, 0, 0, 0))
    elif brightness < 35:
        # soft edge fade
        alpha = int((brightness - 20) / 15 * 255)
        new_data.append((p[0], p[1], p[2], alpha))
    else:
        new_data.append(p)

im.putdata(new_data)
# Upscale to high resolution
hi_res = im.resize((im.width * 3, im.height * 3), Image.Resampling.LANCZOS)
hi_res.save('KathaBridge/public/images/landing/hero_collage_transparent.png', 'PNG')
print('Saved hero_collage_transparent.png:', hi_res.size)

