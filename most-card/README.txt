MOST CARD FOLDER (optional)
===========================

Put images of your BasicMOST data card in this folder and list them in cards.json.
They then appear as built-in tabs in the app's "MOST card" popup on every device.

1. Save each card page as a JPG or PNG (about 1800 px wide is plenty), for example:
     card-1-general-controlled.jpg
     card-2-tool-equipment.jpg
   Turn upside-down pages upright before saving.

2. List them in cards.json:
     [
       { "name": "General / Controlled / Tool", "file": "card-1-general-controlled.jpg" },
       { "name": "Tool / Equipment", "file": "card-2-tool-equipment.jpg" }
     ]

3. Commit and deploy. Update CACHE_VERSION in ../sw.js so devices fetch the new images.

IMPORTANT
- Files in this folder are public to anyone with the site address. Use a private GitHub repository,
  and only publish the card if you are licensed to share it.
- If you would rather not publish it, leave cards.json as [] and have each user add the card inside
  the app (+ Add image). Those images stay on that device only.
- This folder is NOT the app icon. The home-screen icon lives in ../icons/.
