# Questioning Everything Always

This project is a single-page interactive web experience built with vanilla HTML, CSS, and JavaScript, using Three.js from a CDN.

## Overview
The scene creates a dark cinematic forest at night. A road stretches into the distance, dense trees line both sides, and a car moves along the road while two forward-facing headlights reveal a large block of 3D text only when the light reaches it.

## Core Features
- A fully 3D nighttime forest environment with fog and a dark road surface
- Large 3D typography generated with Three.js TextGeometry and a bold font loaded via FontLoader
- A custom car assembled from basic Three.js primitives such as boxes, cylinders, and a windshield
- Two narrow spotlights attached to the front of the car that act as the only visible light source
- Mouse-based driving control with smooth camera follow and keyboard steering using arrow keys or WASD
- A minimal scene that avoids extra UI, overlays, or build tools

## Project Structure
- index.html — the entry page that loads the module-based Three.js scene
- styles.css — minimal page styling to remove browser defaults and ensure the canvas fills the screen
- script.js — scene setup, geometry creation, fog, camera motion, car controls, and headlight logic

## How It Works
1. The page loads the Three.js scene in a single HTML file.
2. A dark road and a field of trees are created in 3D space.
3. The text is placed flat on the road and remains dark and nearly unreadable until illuminated.
4. The car moves based on mouse position and keyboard input.
5. The headlights reveal the text only when the beam directly reaches it, creating a dramatic hidden-message effect.

## Controls
- Move the mouse to steer the car across the road
- Use the arrow keys or WASD to drive forward, backward, and steer

## Preview
Open index.html in a browser, or serve the project folder from a local server such as Python's built-in HTTP server.

## Notes
- No frameworks or build tools are used.
- The experience relies entirely on vanilla JavaScript and Three.js.
- The scene intentionally keeps the environment dark so the headlights are the only source of readable light.
