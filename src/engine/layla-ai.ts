// ── Layla AI ──────────────────────────────────────────────
// Powered by OpenRouter

const KEY = import.meta.env['VITE_OPENROUTER_KEY'] as string;
const TIMEOUT_MS = 22000; // 22s per model — skip slow ones faster

// Models in priority order — skips unavailable/overloaded automatically
const MODELS = [
  'qwen/qwen3.8-27b:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
];

async function callModel(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
): Promise<{ html: string; finishReason: string }> {
  let lastError = '';

  for (const model of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://disow2026-eng.github.io/Layla/',
          'X-Title': 'Layla AI',
        },
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
      });
    } catch (e) {
      clearTimeout(timer);
      const msg = (e as Error).message;
      if (msg.includes('abort') || msg.includes('signal')) {
        lastError = `${model} timed out`;
      } else {
        lastError = `Network: ${msg}`;
      }
      continue;
    }
    clearTimeout(timer);

    if (res.status === 429) { lastError = 'Rate limited'; continue; }
    if (res.status === 401) throw new Error('Invalid API key — check VITE_OPENROUTER_KEY in .env');
    if (res.status === 402) throw new Error('OpenRouter credits exhausted.');

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      error?: { message: string };
    };

    if (data.error?.message && /No endpoints|not a valid model|unavailable|overloaded|upstream/i.test(data.error.message)) {
      lastError = data.error.message;
      continue;
    }
    if (data.error) throw new Error(data.error.message);

    const choice = data.choices?.[0];
    let html = choice?.message?.content?.trim() ?? '';
    html = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
    return { html, finishReason: choice?.finish_reason ?? '' };
  }
  throw new Error(`All models unavailable or timed out: ${lastError}`);
}

const SYSTEM_PROMPT = `You are Layla AI. Generate a COMPLETE, SELF-CONTAINED HTML file for a stunning 3D website.

REQUIRED STRUCTURE — always include all of these:
1. <link> for Google Fonts (Space Grotesk for dark/tech, Inter for clean, Syne for cyber/neon, Cormorant Garamond for luxury)
2. <style> with: body{overflow:hidden;margin:0}, canvas{position:fixed;inset:0;z-index:0}, frosted glass nav (position:fixed, backdrop-filter:blur(20px)), hero overlay (position:absolute;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;text-align:center;z-index:10), headline clamp(52px,8vw,96px) bold, fadeUp @keyframes on all text
3. <canvas id="c"> as the 3D background
4. <nav> with brand name and 3 relevant links
5. .hero with a big REAL headline (not lorem ipsum — write something specific to the prompt topic), subheadline 1-2 sentences, a CTA button
6. The LAYLA badge: <div id="badge" style="position:fixed;bottom:18px;right:18px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);font-size:11px;padding:6px 14px;border-radius:100px;font-family:'Courier New',monospace;letter-spacing:2px;pointer-events:none;z-index:999">LAY<span style="color:#6c63ff">L</span>A ✦</div>
7. <script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
8. Three.js scene in <script>: scene+camera+renderer on canvas#c, 10-16 mixed 3D objects, lights, per-mesh rotation+float animation, mouse parallax, resize handler

GEOMETRY — pick based on topic (mix 2-3 types):
- Portfolio/minimal → IcosahedronGeometry, OctahedronGeometry
- Product/SaaS/tech → TorusKnotGeometry(0.8,0.28,100,16), IcosahedronGeometry
- Space/galaxy → SphereGeometry + THREE.Points (1000 stars)
- Luxury/jewelry → TorusGeometry(1,0.3,16,60) rings
- Neon/cyber → BoxGeometry + EdgesGeometry wireframes
- Nature/organic → DodecahedronGeometry, SphereGeometry
- Default → mix Icosahedron + TorusKnot + Octahedron

COLORS — match the vibe: dark bg for space/cyber/portfolio (#050510, #0d0221, #080810), light bg for minimal (#f4f4f8)
MeshStandardMaterial: metalness 0.6, roughness 0.2. Add 3 PointLights with theme colors.

OUTPUT: ONLY raw HTML starting with <!DOCTYPE html> — no markdown, no code fences, no explanation.
Start your response with exactly: <!DOCTYPE html>`;

// ── Fast JSON config (used as primary path) ───────────────
// Asks AI for a tiny JSON object (~200 tokens) instead of full HTML (~3000 tokens)
// The generator then builds the HTML from this config — 10x faster

const CONFIG_PROMPT = `Read the user's prompt and respond with ONLY a JSON object — no markdown, no explanation, no code fences. Just raw JSON.

{
  "brand": "SHORT BRAND NAME IN CAPS (2-3 words max)",
  "headline": "Punchy 2-5 word headline (use \\n for line break)",
  "sub": "One compelling sentence describing this site.",
  "cta": "Button text",
  "nav": ["Link1", "Link2", "Link3"],
  "theme": "space|cyber|luxury|minimal|ocean|fire|nature|pink|purple|default",
  "layout": "hero-center|hero-split|minimal-object|grid-feature",
  "geometry": "icosahedron|torusknot|torus|sphere|box|octahedron|dodecahedron|mixed",
  "accent": "#hexcolor",
  "features": [
    {"icon": "emoji", "title": "Feature title", "desc": "One sentence."},
    {"icon": "emoji", "title": "Feature title", "desc": "One sentence."},
    {"icon": "emoji", "title": "Feature title", "desc": "One sentence."}
  ]
}`;

export interface AIConfig {
  brand?: string;
  headline?: string;
  sub?: string;
  cta?: string;
  nav?: string[];
  theme?: string;
  layout?: string;
  geometry?: string;
  accent?: string;
  features?: Array<{ icon: string; title: string; desc: string }>;
}

export async function laylaAIConfig(
  prompt: string,
  onStatus: (msg: string) => void
): Promise<AIConfig> {
  if (!KEY) throw new Error('No API key');
  onStatus('Layla AI is reading your prompt…');

  const { html: raw } = await callModel(
    [{ role: 'system', content: CONFIG_PROMPT }, { role: 'user', content: prompt }],
    600  // JSON only — tiny response
  );

  // Extract JSON even if model wraps it in backticks or text
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]) as AIConfig;
}

// ── Full HTML generation (fallback for edit mode) ─────────

export async function laylaAI(
  prompt: string,
  onStatus: (msg: string) => void
): Promise<string> {
  if (!KEY) throw new Error('No API key configured. Add VITE_OPENROUTER_KEY to .env');

  onStatus('Layla AI is thinking…');
  const { html, finishReason } = await callModel(
    [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }],
    10000
  );

  if (finishReason === 'length') throw new Error('Response cut off — using fallback.');
  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html'))
    throw new Error('Invalid output from AI — using fallback.');
  if (!html.includes('three') && !html.includes('THREE'))
    throw new Error('AI did not include Three.js — using fallback.');

  onStatus('Rendering your site…');
  return html;
}

// ── Edit existing site ────────────────────────────────────

const EDIT_PROMPT = `You are Layla AI in edit mode. You receive an existing HTML website and ONE instruction from the user.

Your job: apply ONLY the requested change — do not redesign or rewrite the whole site.

Rules:
- Return the COMPLETE updated HTML file (not just the changed part)
- Make targeted, surgical edits
- If asked to change colors: update the relevant CSS color values, CSS variables, and Three.js colors
- If asked to change text/headline: update only that text in the HTML
- If asked to change 3D shapes: update the Three.js geometry constructors (e.g. BoxGeometry → IcosahedronGeometry)
- If asked to change fonts: update the Google Fonts <link> href and CSS font-family declarations
- If asked to add shapes: add more mesh objects to the Three.js scene, following the existing per-mesh pattern (_rx, _ry, _rz, _fs, _fo properties)
- If asked about speed/animation: adjust the rotation speed values (_rx, _ry, _rz) or float speed (_fs)
- If asked to change layout: restructure the HTML/CSS while keeping the Three.js scene intact
- If asked to change materials: update the THREE.MeshStandardMaterial / MeshPhysicalMaterial / MeshNormalMaterial constructors
- If asked to add a section: add it while keeping the existing layout and 3D scene
- Keep all existing structure, layout, badge, and content unless specifically asked to change it
- The LAYLA badge must always remain in the output

CRITICAL: Return ONLY the raw HTML. No markdown. No code fences. No explanation.
Start with exactly: <!DOCTYPE html>`;

// Compress HTML before sending to save tokens
function compressHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')          // strip comments
    .replace(/\n\s*\n/g, '\n')                // collapse blank lines
    .replace(/  +/g, ' ')                     // collapse spaces
    .replace(/new Float32Array\([^)]{30,}\)/g, 'new Float32Array([/*…*/])')  // strip large arrays
    .trim();
}

// ── Streaming edit (live progress) ───────────────────────

export async function laylaAIEdit(
  currentHtml: string,
  instruction: string,
  onStatus: (msg: string) => void,
  onLiveChars?: (chars: number) => void
): Promise<string> {
  if (!KEY) throw new Error('No OpenRouter API key set. Add VITE_OPENROUTER_KEY to .env');

  onStatus('Applying your change…');
  // Compress aggressively — the AI needs structure, not whitespace
  const htmlToSend = compressHtml(currentHtml);
  const messages = [
    { role: 'system', content: EDIT_PROMPT },
    { role: 'user', content: `Current HTML:\n\n${htmlToSend}\n\nInstruction: ${instruction}` },
  ];

  let lastError = '';

  for (const model of MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let res: Response;
    try {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://disow2026-eng.github.io/Layla/',
          'X-Title': 'Layla AI',
        },
        body: JSON.stringify({ model, messages, max_tokens: 7000, temperature: 0.5, stream: true }),
      });
    } catch (e) {
      clearTimeout(timer);
      const msg = (e as Error).message;
      lastError = msg.includes('abort') || msg.includes('signal') ? `${model} timed out` : `Network: ${msg}`;
      continue;
    }
    clearTimeout(timer);

    if (res.status === 429) { lastError = 'Rate limited'; continue; }
    if (res.status === 401) throw new Error('Invalid API key — check VITE_OPENROUTER_KEY in .env');
    if (res.status === 402) throw new Error('OpenRouter credits exhausted.');

    // Check for model-level errors in the first chunk
    if (!res.body) throw new Error('No response body from API');

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let accumulated = '';
    let finishReason = '';
    let modelError = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;

          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
              error?: { message: string };
            };

            if (parsed.error?.message) {
              if (/No endpoints|not a valid model|unavailable|overloaded|upstream/i.test(parsed.error.message)) {
                modelError = parsed.error.message;
                break;
              }
              throw new Error(parsed.error.message);
            }

            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              accumulated += delta;
              if (onLiveChars) onLiveChars(accumulated.length);
            }
            const fr = parsed.choices?.[0]?.finish_reason;
            if (fr) finishReason = fr;
          } catch (parseErr) {
            // Skip malformed SSE lines
          }
        }

        if (modelError) break;
      }
    } finally {
      reader.releaseLock();
    }

    if (modelError) {
      lastError = modelError;
      continue;
    }

    let html = accumulated.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();

    if (finishReason === 'length') throw new Error('Response cut off — try a more specific instruction.');
    if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html'))
      throw new Error(`AI returned unexpected output. Started with: "${html.slice(0, 80)}"`);

    onStatus('Updating preview…');
    return html;
  }

  throw new Error(`All models unavailable or timed out: ${lastError}`);
}
