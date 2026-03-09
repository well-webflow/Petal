# Petal

Webflow Popups powered by attributes

## Installation

### CDN (jsDelivr)

Add this script tag to your Webflow project (or any HTML page):

```html
<!-- Latest version -->
<script src="https://cdn.jsdelivr.net/gh/well-webflow/Petal@latest/dist/petal.min.js"></script>

<!-- Specific version (recommended for production) -->
<script src="https://cdn.jsdelivr.net/gh/well-webflow/Petal@0.0.88/dist/petal.min.js"></script>
```

Replace `USERNAME/REPO` with your GitHub username and repository name.

### NPM

```bash
npm install well-petal
```

## Building

```bash
# Development build
npm run build

# Production build (minified)
npm run build:prod

# Development server
npm run dev
```

The production build creates `dist/petal.min.js` (85KB minified).
