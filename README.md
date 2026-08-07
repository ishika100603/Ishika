# Muse Create Portfolio

Interactive art portfolio for **Muse Create**, built with vanilla HTML, CSS, and JavaScript.

## Repository layout

| Folder | Menu label | Description |
|--------|------------|-------------|
| [`home/`](home/) | Home | Drive-through Three.js scene with headlight text reveals |
| [`2d-canvas-1/`](2d-canvas-1/) | 2D Canvas.1 | Scrollable artwork grid with hover previews |
| [`2d-canvas-2/`](2d-canvas-2/) | 2D Canvas.2 | Animated sketch playback on torn paper |
| [`2d-canvas-3/`](2d-canvas-3/) | 2D Canvas.3 | AI-generated video, centered |
| [`2d-canvas-4/`](2d-canvas-4/) | 2D Canvas.4 | AI-generated video, fullscreen |
| [`3d-canvas-1/`](3d-canvas-1/) | 3D Canvas.1 | Draggable textured cubes on a mirror floor |
| [`3d-canvas-2/`](3d-canvas-2/) | 3D Canvas.2 | Art on a lampshade in a small 3D gallery |
| [`timeline/`](timeline/) | Timeline | Month-by-month studio work scroll |
| [`relational-structures/`](relational-structures/) | Relational Structures | D3 network of materials and decisions |
| [`geospatial/`](geospatial/) | Geospatial | Mapbox delivery network from Raipur |
| [`interactive/`](interactive/) | Interactive | Visitor drawing canvas with Firebase gallery |
| [`shared/`](shared/) | — | Navigation, chat, about panel, and shared styles |
| [`chatbot-backend/`](chatbot-backend/) | — | Firebase Cloud Function for the portfolio assistant |

Each page folder contains its own `index.html`, assets, scripts, and a `README.md`.

## Preview locally

Open [`index.html`](index.html) (redirects to `home/`), or serve the repo root with any static file server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/home/`.

## Notes

- No build step required for the front end.
- Geospatial requires a Mapbox access token in `geospatial/index.html`.
- The chatbot calls a Firebase Cloud Function configured in `shared/chatbot.js`.

See also [`STYLE_AND_CONCEPT.md`](STYLE_AND_CONCEPT.md) for the visual direction of the home experience.
