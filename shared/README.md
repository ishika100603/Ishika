# Shared site assets

Scripts and styles used across every portfolio page.

## Files

| File | Purpose |
|------|---------|
| `site-nav.js` / `site-nav.css` | Top navigation bar |
| `site-chat.js` / `site-chat.css` | Portfolio assistant chat panel |
| `site-page-about.js` / `site-page-about.css` | “About the page” button and panel |
| `chatbot.js` | Chat message handling (Firebase endpoint) |
| `canvas-base.css` | Black backdrop layer for canvas pages |
| `canvas-video.js` | Canvas-based video renderer (hides browser controls) |
| `site-back.css` | Back-button styling for older pages |

## Reference

`reference/` holds unused or legacy assets kept for archive (sketches, CSV data, alternate images).

## Usage

From any page folder, include shared assets with relative paths:

```html
<link rel="stylesheet" href="../shared/site-nav.css">
<script src="../shared/site-nav.js"></script>
```

Navigation hrefs are resolved automatically from the script location in `site-nav.js`.
