// ── Layla AI ──────────────────────────────────────────────
// Powered by OpenRouter

const KEY   = import.meta.env['VITE_OPENROUTER_KEY'] as string;
const MODEL = 'google/gemini-2.0-flash-exp:free';

const SYSTEM_PROMPT = `You are Layla AI — you generate COMPLETE, STUNNING, STANDALONE HTML websites with Three.js 3D backgrounds and real content overlaid on top.

READ the user's prompt carefully and extract:
- The TOPIC/PURPOSE (portfolio, product, agency, restaurant, app, SaaS, etc.)
- The STYLE VIBE (dark, minimal, neon, space, ocean, luxury, etc.)
- Any NAMES, BRANDS, or specific things mentioned

== LAYOUT STRUCTURE ==
Generate a full HTML page where:
- The Three.js canvas fills the ENTIRE screen as the background (position:fixed, z-index:0)
- A frosted-glass NAV bar is overlaid at the top (position:fixed, z-index:100)
- A HERO section is centered on screen (position:absolute, z-index:10) with:
  * A large bold HEADLINE (extract or create from prompt — make it real, not generic)
  * A compelling subheadline (1-2 sentences about the topic)
  * A CTA button styled with the theme color
- The LAYLA badge fixed bottom-right

== 3D SCENE — choose geometry based on prompt ==
- Portfolio / creative / minimal → IcosahedronGeometry(r, 1) or OctahedronGeometry — smooth, professional
- Space / galaxy / stars → SphereGeometry for planet + THREE.Points particle system for stars
- Product / showcase / tech → TorusKnotGeometry(0.8, 0.3, 100, 16) — elegant, complex
- Nature / organic / ocean → SphereGeometry with slight displacement + particle mist
- Neon / cyber / grid → BoxGeometry + EdgesGeometry wireframes with glow
- Luxury / gold / elegant → TorusGeometry(1.2, 0.4, 16, 100) rings floating
- DEFAULT (no clear style) → mix of IcosahedronGeometry + SphereGeometry + TorusGeometry

ALWAYS have 6-15 shapes, not just 1. Vary sizes. Vary rotation speeds.

== CSS DESIGN RULES ==
1. Use Google Fonts — pick based on vibe:
   - Dark/tech/space: 'Space Grotesk' weights 400,700
   - Minimal/portfolio/clean: 'Inter' weights 300,400,600
   - Luxury/elegant: 'Cormorant Garamond' weights 300,400,600
   - Cyber/neon: 'Syne' weights 400,700,800
2. Nav: backdrop-filter:blur(16px), semi-transparent background, logo left + 3 links right
3. Hero headline: 72-96px font size, bold or 800 weight, tight letter-spacing
4. Hero sub: 18-20px, light weight, opacity 0.7, max-width 520px, centered
5. CTA button: padding 14px 36px, border-radius 100px, solid accent color, hover scale(1.04)
6. Smooth entrance: hero elements fade in with CSS @keyframes fadeUp (translateY 30px → 0, opacity 0→1)

== THREE.JS RULES ==
1. CDN: https://unpkg.com/three@0.160.0/build/three.min.js
2. Renderer: antialias:true, alpha:true (so it blends with body background color)
3. body background = the scene background color (match them so there's no flash)
4. MeshStandardMaterial: metalness 0.6-0.8, roughness 0.15-0.35
5. Lighting: AmbientLight(0xffffff, 0.5) + 2-3 colored PointLights or DirectionalLights
6. Every mesh: smooth rotation (different axes) + floating (sin wave on Y)
7. Mouse parallax: camera.position.x/y shifts gently toward mouse
8. Resize handler always included

== MANDATORY BADGE ==
<div id="badge" style="position:fixed;bottom:18px;right:18px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);font-size:11px;padding:6px 14px;border-radius:100px;font-family:'Courier New',monospace;letter-spacing:2px;pointer-events:none;z-index:999;backdrop-filter:blur(8px)">LAY<span style="color:#6c63ff">L</span>A ✦</div>

== EXAMPLE OUTPUT STRUCTURE ==
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>[Topic] — Built with Layla</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#050510;overflow:hidden;font-family:'Space Grotesk',sans-serif}
canvas{position:fixed;inset:0;z-index:0}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(16px);background:rgba(5,5,16,0.4);border-bottom:1px solid rgba(255,255,255,0.06)}
.nav-logo{font-size:18px;font-weight:700;color:#fff;letter-spacing:1px}
.nav-links{display:flex;gap:32px;list-style:none}
.nav-links a{color:rgba(255,255,255,0.6);text-decoration:none;font-size:14px;transition:color .2s}
.nav-links a:hover{color:#fff}
.hero{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24px}
.hero h1{font-size:clamp(48px,8vw,96px);font-weight:700;color:#fff;line-height:1.05;letter-spacing:-2px;animation:fadeUp .8s ease both}
.hero p{margin-top:20px;font-size:18px;color:rgba(255,255,255,0.65);max-width:520px;line-height:1.6;animation:fadeUp .8s .15s ease both}
.hero-cta{margin-top:36px;padding:14px 40px;background:#6c63ff;color:#fff;border:none;border-radius:100px;font-size:16px;font-weight:600;cursor:pointer;transition:transform .2s,box-shadow .2s;animation:fadeUp .8s .3s ease both}
.hero-cta:hover{transform:scale(1.04);box-shadow:0 8px 32px rgba(108,99,255,0.4)}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<canvas id="c"></canvas>
<nav>
  <div class="nav-logo">BRAND</div>
  <ul class="nav-links"><li><a href="#">Work</a></li><li><a href="#">About</a></li><li><a href="#">Contact</a></li></ul>
</nav>
<div class="hero">
  <h1>YOUR HEADLINE HERE</h1>
  <p>Your compelling subheadline goes here, 1-2 sentences max.</p>
  <button class="hero-cta">Get Started</button>
</div>
<div id="badge" style="position:fixed;bottom:18px;right:18px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);font-size:11px;padding:6px 14px;border-radius:100px;font-family:'Courier New',monospace;letter-spacing:2px;pointer-events:none;z-index:999;backdrop-filter:blur(8px)">LAY<span style="color:#6c63ff">L</span>A ✦</div>
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script>
// Three.js scene code here
</script>
</body>
</html>

CRITICAL: Your response must be ONLY the raw HTML. No markdown. No code fences. No explanation.
Start your response with exactly: <!DOCTYPE html>`;

// ── Main call ─────────────────────────────────────────────

export async function laylaAI(
  prompt: string,
  onStatus: (msg: string) => void
): Promise<string> {
  if (!KEY) throw new Error('No API key configured.');

  onStatus('Layla AI is thinking…');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://disow2026-eng.github.io/Layla/',
      'X-Title': 'Layla AI',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: prompt },
      ],
      max_tokens: 8000,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Layla AI error ${res.status}: ${err}`);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message: string };
  };

  if (data.error) throw new Error(data.error.message);

  let html = data.choices?.[0]?.message?.content?.trim() ?? '';

  // Strip markdown code fences if model wraps output
  html = html
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
    throw new Error('Layla AI returned invalid output — retrying with fallback.');
  }

  onStatus('Rendering your site…');
  return html;
}
