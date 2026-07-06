# Bruno Simon Portfolio Style

## Overview
A WebGL-driven portfolio experience built as an interactive 3D playground. The site uses vehicle-style movement, spatial discovery, and minimal UI chrome to invite users to explore content by driving around a surreal world.

## Core Experience
- Fullscreen canvas with 3D scene rendered in real time (Three.js or similar)
- Player controls a draggable object/car using keyboard input
- Exploration is the navigation model: users discover pages by physically moving through the scene rather than clicking a menu
- The interface is intentionally minimal: no visible menu, few buttons, and a focus on world exploration

## Visual Style
- Dark neon palette with deep gradients and moody ambient lighting
- Stylized low-poly environment, floating islands, and playful geometry
- Soft glows, fog, and subtle bloom-like highlights
- Objects and labels appear as physical elements in the scene instead of a traditional UI panel
- Clean, uppercase typography and sparse text overlays

## Movement & Controls
- Keyboard-driven movement: arrow keys and/or WASD
- Smooth acceleration, drift, and inertia for a responsive feeling
- Cursor or vehicle rotates based on movement direction
- Driving to objects triggers interactions and transitions
- Physics-inspired movement rather than instant teleports

## Interaction Model
- Islands or targets represent portfolio sections (About, Work, Contact)
- Entering an island area or aligning with an object reveals content
- Hidden surprises and Easter eggs reward exploration
- Objects respond to the user’s position and heading, often using raycasting or aim-based reveal
- Page transitions feel spatial and immersive rather than UI-driven

## Scene Structure
- Central hub or starting area with several floating worlds/islands
- Each island contains a different content theme or interactive page
- Landmarks and directional cues point users toward sections
- Background and terrain provide depth with layered planes, fog, and gradients
- Ambient objects and decorative elements populate the space without overwhelming

## Content Presentation
- Content is integrated into the scene as objects, labels, and subtle overlays
- When activated, a section may show a full-screen panel or keep the experience in-world
- Text is concise, poetic, and oriented to discovery
- Work pieces are presented as interactive nodes or miniature worlds
- Contact details are revealed as part of exploration rather than as a standard form

## Navigation Feedback
- Minimal HUD or hint text appears only when needed
- A status line can inform the player about controls and nearby interactions
- Visual emphasis shifts to the current target via glow, scale, or lighting
- Sound and motion enhance the sensation of discovery (optional)

## Recommended Implementation
- Use Three.js for scene rendering and animation
- Manage movement with a lightweight input state system
- Use raycasting or angle-based checks for headlight/aim reveals
- Animate transitions by shifting the world camera and depth of panels
- Keep DOM UI minimal and use CSS transforms for depth effects when needed

## Key Features to Model
- Drive-to-explore navigation
- Spatial, rather than click-based, page discovery
- Car or man cursor that changes mode when sections are entered
- Headlight/light-beam reveal mechanics for content
- Dark, moody atmosphere with neon accents and subtle motion
- Dynamic transitions that feel like moving through a 3D world

## Notes
This document is a style and behavior spec inspired by bruno-simon.com. The goal is to recreate the feeling of a creative portfolio built around movement, interactivity, and spatial storytelling.
