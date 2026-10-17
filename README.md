# The Tree That Holds My Love — Prototype

An early mobile-first Three.js prototype for a romantic 3D garden.

## Included in this prototype

- One procedural 3D blossom tree and meadow
- A symbolic silhouette beneath the tree
- Hybrid orbit camera controls
- Three clickable blossoms and one floating petal
- Message overlays and browser-local discovery storage
- A basic twilight transition hook
- Responsive mobile interface and reduced-motion CSS

## Run locally

Because this project uses JavaScript modules, run it through a local web server rather than opening `index.html` directly.

For example, with Python installed:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000` in a modern browser.

Three.js is imported from jsDelivr, so the first run requires an internet connection.

## Publish on GitHub Pages

1. Upload the contents of this folder to the root of a GitHub repository.
2. Open **Settings → Pages**.
3. Select deployment from the `main` branch and `/ (root)`.
4. Save and wait for GitHub Pages to publish.

If publishing from a repository project path, keep all asset and module URLs relative as they are in this prototype.

## Important prototype notes

- The love notes are placeholders and should be replaced with personal writing.
- Audio controls are placeholders; no audio file is bundled.
- The current scene uses procedural geometry rather than an imported high-detail model.
- The root chamber, river geometry, constellation interaction, full finale, and refined unlock sequence remain future development items.
- This is a visual/interaction prototype, not the finished experience.
