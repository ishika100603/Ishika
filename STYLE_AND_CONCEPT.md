# Style and Concept

## What this site is

This is the portfolio of **Muse Create**, an art studio. The site is not a catalogue of finished images. It is a set of rooms you move through — each one built around a different way of encountering the work: by driving, scrolling, watching, rearranging, mapping, or making something yourself.

The title on the home page — *creating art that outlives us* — sets the tone. The work is meant to feel present, physical, and lasting, even when it lives on a screen.

---

## Core concept

**Experience before explanation.**

Across every page, the site asks you to do something rather than only read something. Text and context are there, but they are often hidden until you explore — in darkness on the home drive-through, in the “About the page” panel beside the chatbot, or in side panels that appear as you interact. The studio introduces itself through motion, light, and participation.

Recurring ideas:

- **Reveal** — information and artwork emerge as you move (headlights, scroll, orbit, zoom).
- **Process** — showing how work is made, not just the final piece (sketch animation, relational web, timeline).
- **Physicality** — flat art given weight, form, and space (cubes, lampshade, mirror floor, falling strokes).
- **Connection** — invisible histories made visible (materials, cities, months, categories).
- **Openness** — one page is deliberately left blank for the visitor.

---

## Visual direction

### Atmosphere

The default mood is **dark, cinematic, and minimal**. Most pages sit on a near-black ground (`#000` / `#060606`) so the artwork and interaction carry the focus. Canvas and 3D pages use an opaque black base so nothing bleeds through the scene.

Where color appears, it is restrained and purposeful:

- **Warm cream and parchment** (`#f0e9d8`, `#f3efe4`) — titles, paper, studio copy on data pages.
- **Soft white at low opacity** — borders, panels, navigation (`rgba(255, 255, 255, 0.08–0.14)`).
- **Cool blue** (`#8ec5ff`, `#2d7cff`) — chat, about panel, and interactive accents.

### Typography

**Instrument Sans** is the site-wide typeface — clean, modern, slightly neutral. Navigation and labels use **uppercase, wide letter-spacing, and small sizes** (around 11–13px), so wayfinding feels quiet and gallery-like rather than loud or corporate.

Page titles on data experiences (Timeline, Relational Structures) follow the same restrained header style: small caps, generous tracking, fixed to the top beneath the nav.

### UI chrome

Shared elements repeat across pages:

- **Top nav** — frosted dark bar, evenly spaced links, active page highlighted in warm grey.
- **About the page + chat** — bottom-right pill and icon buttons; panels use the same dark glass treatment (blur, thin border, rounded corners).
- **Canvas pages** — fullscreen or centered stage; copy kept minimal and offset so it does not compete with the work.

The UI stays out of the way. Controls appear where needed (drive panel, speed button, orbit hints) but the art and the interaction remain central.

---

## Interaction philosophy

Each section of the site tests a different relationship between viewer and work:

| Section | Interaction | Concept |
|---------|-------------|---------|
| **Home** | Drive a car; headlights reveal studio text | Walking into the space; discovery through movement and light |
| **2D Canvas.1** | Scroll a wall of framed works; hover to preview | Moving along a gallery wall, not paging through a list |
| **2D Canvas.2** | Watch a sketch build stroke by stroke | Experiencing process and making; optional 2× speed |
| **2D Canvas.3 / .4** | AI-generated video on canvas (small / fullscreen) | Still art given motion — *feels real* / *feels alive* |
| **3D Canvas.1** | Drag, stack, and duplicate textured cubes on a mirror | Your composition from the studio’s pieces; depth and reflection |
| **3D Canvas.2** | Orbit a lampshade printed with a painting | Art as object; light tells the story |
| **Timeline** | Scroll month by month | Studio growth over time |
| **Relational Structures** | Explore a force-directed web from the studio outward | Materials, colors, and decisions behind each piece |
| **Geospatial** | Map deliveries from Raipur to destination cities | Where the work actually travels |
| **Interactive** | Draw on a blank canvas; submit to a growing gallery | Visitor as collaborator; each stroke handled with care on submit |

The through-line: **you are not passively browsing**. You steer, scroll, watch, rearrange, search, map, or draw.

---

## Page-by-page mood

### Home
A nighttime forest road. Almost no readable light until the car’s narrow beams reach the 3D typography on the road. Mysterious, cinematic, slightly haunting. The viewer discovers who Muse Create is by driving, not by reading a hero block.

### 2D canvases
Canvas.1 is spatial and rhythmic — geometry frames the work, scroll carries you forward. Canvas.2 shifts to intimacy: torn paper, ink, the rhythm of a hand drawing. Canvas.3 and .4 push toward liveness — generated motion embedded directly in the page.

### 3D canvases
Canvas.1 treats paintings as blocks you can own and arrange — playful, tactile, reflective. Canvas.2 is quieter and more domestic: a single object in a small room, lit from within, meant to be walked around.

### Timeline, Relational Structures, Geospatial
These pages share a **data-as-studio-archive** feel: black field, warm type, glass panels. They answer questions the artwork alone cannot — *when*, *what went into it*, *where it went*. Interaction is exploratory (scroll, click nodes, pan the map) rather than gamified.

### Interactive
The outlier in warmth — paper-toned canvas, drawing tools, physics when strokes fall away on submit. It is the most open and vulnerable page: the studio asking visitors for ideas it would not have found alone.

---

## Lighting and motion

- **Home** — no ambient fill; spotlights only. Reveal is literal.
- **3D scenes** — warm gold or neutral studio lighting on objects; black backdrop; fog used sparingly for depth.
- **Video canvases** — playback through a canvas renderer so the browser UI stays hidden and the frame feels intentional.
- **Motion** — used for process (sketch replay), liveness (AI video), feedback (timeline scroll, graph physics, falling strokes), never as decoration alone.

---

## Tone and intent

The site should feel:

- **Like a studio**, not a template — personal copy, uneven experiments, curiosity visible in the structure.
- **Careful** — strokes fall separately on submit; about text lives in a panel so it does not cover the work.
- **Confident in darkness** — comfortable letting large areas stay black or empty.
- **Inviting** — chatbot and about panel on every page for anyone who wants context while exploring.

---

## Technical character (and why it matters to the concept)

Built with **vanilla HTML, CSS, and JavaScript** — no framework, no build step. Pages load as self-contained experiences (Three.js, D3, Mapbox, Matter.js, Firebase where needed). That matches the studio ethos: direct, handmade, each page its own small world rather than one uniform app shell.

The repo is organized **one folder per page** with local images, scripts, and a README — the structure mirrors the site’s idea of separate rooms, each with its own assets and logic.

---

## Summary

Muse Create’s site is a **dark, minimal portfolio turned into a journey**. Style is consistent — black ground, Instrument Sans, glass UI, warm accents — but each page has its own concept and interaction. The whole site argues that art is not only what you see at the end; it is also the space you enter, the process you witness, the connections you trace, and the mark you might leave on the one page left open for you.
