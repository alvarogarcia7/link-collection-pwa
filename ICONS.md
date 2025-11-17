# App Icons

The PWA requires two icon sizes:
- `icon-192.png` (192x192 pixels)
- `icon-512.png` (512x512 pixels)

## How to Generate Icons

### Option 1: Using the Icon Generator (Recommended)

1. Open `generate-icons.html` in your browser
2. Click the "Generate 192x192 Icon" button
3. Click the "Generate 512x512 Icon" button
4. Both PNG files will be automatically downloaded
5. Save them in the project root directory

### Option 2: Using Online Tools

1. Upload `icon.svg` to an online SVG to PNG converter like:
   - https://cloudconvert.com/svg-to-png
   - https://www.svgviewer.dev/
   - https://svgtopng.com/

2. Export at these sizes:
   - 192x192 pixels → save as `icon-192.png`
   - 512x512 pixels → save as `icon-512.png`

3. Place both files in the project root directory

### Option 3: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Generate 192x192 icon
convert -background none icon.svg -resize 192x192 icon-192.png

# Generate 512x512 icon
convert -background none icon.svg -resize 512x512 icon-512.png
```

### Option 4: Using Inkscape (Command Line)

If you have Inkscape installed:

```bash
# Generate 192x192 icon
inkscape icon.svg --export-type=png --export-filename=icon-192.png -w 192 -h 192

# Generate 512x512 icon
inkscape icon.svg --export-type=png --export-filename=icon-512.png -w 512 -h 512
```

## Temporary Fallback

Until the PNG icons are generated, the PWA will still function but may not have proper icons when installed. The manifest.json references these files, so generate them before deploying to production.

The browser will gracefully handle missing icons and may use a default icon or the first letter of the app name instead.
