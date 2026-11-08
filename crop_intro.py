from PIL import Image

src_path = 'C:/Users/Annrose PT/.gemini/antigravity/brain/93d071da-2e07-4ddd-9823-d7dbdf9a756a/.user_uploaded/media_1794155895324_12df404d.jpg'
im = Image.open(src_path)

# Let's crop the right-hand side illustration from the smaller or larger view
# In the image, the full art group is between x=650 to 860, y=200 to 520
# Let's crop and check
crop_art = im.crop((650, 190, 860, 530))
crop_art.save('KathaBridge/public/images/landing/intro_hero_art.png')

print('Saved crop_art:', crop_art.size)

