# Link Collection Reader PWA

A Progressive Web Application for reading and filtering link collections from GNU recfiles.

## Features

- **📖 Recfile Parser**: Client-side parser for GNU recfile format
- **🔍 Advanced Filtering**: Filter by all fields including category, title, tags, body, and date
- **⚙️ Configurable URL**: Set any recfile URL to load records from
- **💾 Offline Capability**: Service worker provides offline access to cached data
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🎨 Modern UI**: Clean and intuitive interface with card-based layout
- **🔒 Client-Side Processing**: All data processing happens in your browser

## Live Demo

Open `index.html` in your browser to start using the application.

Default URL: `https://raw.githubusercontent.com/alvarogarcia7/link-collection/master/data/links.rec`

## Installation

### As a PWA

1. Open the application in a modern browser (Chrome, Edge, Safari, Firefox)
2. Click the install button when prompted, or use the browser's "Install" option
3. The app will be installed on your device and can run offline

### Local Development

Simply clone the repository and open `index.html`:

```bash
git clone <repository-url>
cd link-collection-pwa
# Open index.html in your browser
```

Or serve with a local web server:

```bash
# Python 3
python -m http.server 8000

# Node.js (with npx)
npx http-server -p 8000

# Then visit http://localhost:8000
```

## Usage

### Loading Records

1. Enter a recfile URL in the configuration section
2. Click "Load Records" or press Enter
3. Records will be fetched and parsed on the client-side

### Filtering Records

Use any combination of filters:

- **Search All Fields**: Search across all record fields simultaneously
- **Category**: Filter by category (e.g., "craftsmanship", "finance")
- **Title**: Search in record titles
- **Tags**: Filter by tags (e.g., "security", "testing")
- **Body**: Search in record content/body
- **Date Range**: Filter by date (e.g., "2018" or "2018-06")

Filters update in real-time as you type (300ms debounce).

### Configuring URLs

The application supports:

- GitHub raw URLs (automatically converts blob URLs to raw URLs)
- Direct recfile URLs from any accessible source
- URLs are saved to localStorage for persistence

## Recfile Format

The application parses GNU recfiles with the following fields:

- **Id**: Unique identifier (UUID)
- **Date**: RFC 2822 formatted date
- **Category**: Record category/classification
- **Title**: Record title
- **Link**: Optional URL link
- **Body**: Multi-line content (uses `+` for paragraph breaks)
- **Tags**: Comma-separated tags
- **Origin**: Optional source URL

Example record:

```
Id: a1a6925a-7958-11e8-a87f-0242ac110002
Date: Tue, 26 Jun 2018 15:50:21 +0000
Category: craftsmanship
Title: Don't look, don't tell
Link: https://example.com/article
Body: Security disclosure strategies article.
+
+ Second paragraph of content.
Tags: security, full-disclosure
Origin: https://source.com
```

## Architecture

### Client-Side Only

All processing happens in the browser:

- ✅ No backend server required
- ✅ No database needed
- ✅ Privacy-focused (data never leaves your browser)
- ✅ Fast and responsive
- ✅ Works offline after initial load

### File Structure

```
link-collection-pwa/
├── index.html          # Main HTML file
├── app.js              # Application logic and recfile parser
├── styles.css          # Responsive styling
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline capability
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
└── README.md          # This file
```

### Technologies

- **Vanilla JavaScript**: No frameworks, just modern ES6+
- **CSS Grid & Flexbox**: Responsive layout
- **Service Worker API**: Offline capability
- **Cache API**: Asset and data caching
- **LocalStorage API**: URL persistence
- **Fetch API**: Loading recfiles

## Browser Support

Modern browsers with PWA support:

- ✅ Chrome/Edge (88+)
- ✅ Safari (14+)
- ✅ Firefox (90+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Adding Features

The codebase is well-commented and structured:

- **Recfile Parser**: See `parseRecfile()` in `app.js:100`
- **Filtering Logic**: See `applyFilters()` in `app.js:220`
- **UI Rendering**: See `displayRecords()` and `createRecordCard()` in `app.js:280`

### Modifying Styles

All styles are in `styles.css` with CSS variables for easy theming:

```css
:root {
    --primary-color: #4A90E2;
    --secondary-color: #50C878;
    /* ... */
}
```

### Updating the Service Worker

When you modify cached files, update the cache version in `sw.js`:

```javascript
const CACHE_NAME = 'link-collection-reader-v2'; // Increment version
```

## Security

- XSS Protection: All user content is escaped before rendering
- HTTPS: PWAs require HTTPS in production (localhost works for development)
- No server-side code: Eliminates server-side vulnerabilities
- CORS: Respects CORS policies when fetching external recfiles

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions welcome! Please feel free to submit pull requests or open issues.

## Credits

Created for reading link collections from GNU recfiles, specifically designed for the [link-collection](https://github.com/alvarogarcia7/link-collection) repository format.
