from PIL import Image

src_path = 'C:/Users/Annrose PT/.gemini/antigravity/brain/93d071da-2e07-4ddd-9823-d7dbdf9a756a/.user_uploaded/media_1794155895324_12df404d.jpg'
im = Image.open(src_path)

# Let's save a crop of the whole right mockup to inspect coordinates
mockup = im.crop((480, 150, 870, 590))
mockup.save('KathaBridge/public/images/landing/intro_mockup_full.png')
print('Saved intro_mockup_full.png:', mockup.size)

