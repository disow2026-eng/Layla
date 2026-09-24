# LAYLA

> Describe your 3D website. We build it. You ship it.

Layla is an AI-powered 3D website builder. Users type a simple prompt, Layla generates a fully working 3D website, and they can download the folder or publish it live to GitHub Pages — no coding required.

---

## What's Built So Far

- [x] Landing page with LAYLA branding
- [x] Prompt input box with example chips
- [x] 3D floating shape (Three.js torus knot + spheres)
- [x] Mouse parallax on 3D object
- [x] Docs page with sidebar navigation + scrollable modules
- [x] Examples page with template cards
- [x] Mobile responsive layout + hamburger menu
- [x] GitHub repo setup

---

## What's Next

### Phase 1 — Core Engine
- [ ] Migrate codebase to **TypeScript**
- [ ] Set up project structure (`/src`, `/public`, `/components`)
- [ ] Build the AI prompt handler (Claude API or OpenAI)
- [ ] Generate real 3D websites from prompts using Three.js
- [ ] Live preview panel inside Layla

### Phase 2 — Editor
- [ ] Follow-up prompt refining (change colors, shapes, layout)
- [ ] Visual panel to tweak 3D settings (speed, color, shape type)
- [ ] Undo / redo history

### Phase 3 — Export & Publish
- [ ] Download site as ZIP folder (HTML + CSS + JS)
- [ ] GitHub OAuth login
- [ ] One-click publish to GitHub Pages
- [ ] Custom domain support

### Phase 4 — Polish
- [ ] User accounts + saved projects
- [ ] Pricing page
- [ ] Template library expansion
- [ ] Analytics dashboard

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Language | TypeScript |
| 3D Engine | Three.js |
| AI | Claude API / OpenAI |
| Frontend | Vanilla TS + HTML/CSS |
| Auth | GitHub OAuth |
| Hosting | GitHub Pages / Vercel |

---

## Project Structure (Planned)

```
layla/
├── src/
│   ├── components/
│   │   ├── nav.ts
│   │   ├── hero.ts
│   │   └── preview.ts
│   ├── engine/
│   │   ├── generator.ts      # AI prompt → 3D site
│   │   └── scene.ts          # Three.js scene builder
│   ├── pages/
│   │   ├── home.ts
│   │   ├── docs.ts
│   │   └── examples.ts
│   └── main.ts
├── public/
│   └── index.html
├── layla.html                # current prototype
└── README.md
```

---

## Running Locally

For now, just open `layla.html` in your browser — no build step needed.

Once migrated to TypeScript:

```bash
npm install
npm run dev
```

---

Built by [@disow2026-eng](https://github.com/disow2026-eng)
