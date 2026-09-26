// ── Layla AI ──────────────────────────────────────────────
// Primary: Groq (fast LPU inference, free tier)
// Fallback: OpenRouter free models

const KEY      = import.meta.env['VITE_OPENROUTER_KEY'] as string;
const GROQ_KEY = import.meta.env['VITE_GROQ_KEY'] as string | undefined;
const TIMEOUT_MS = 22000; // 22s per OpenRouter model attempt

// Groq models — LPU hardware, 10-20x faster than free OpenRouter
const GROQ_FAST  = 'llama-3.1-8b-instant';    // patches + config (~1-3s)
const GROQ_SMART = 'llama-3.3-70b-versatile'; // full HTML edits (~5-10s)
const GROQ_TIMEOUT = 15000; // 15s — Groq is fast, bail early if something's wrong

// ── Groq streaming helper ─────────────────────────────────

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  model: string,
  maxTokens: number,
  temperature = 0.2,
  onChunk?: (chars: number) => void
): Promise<string> {
  if (!GROQ_KEY) throw new Error('No Groq key');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), GROQ_TIMEOUT);

  let res: Response;
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature, stream: true }),
    });
    clearTimeout(timer);
  } catch (e) {
    clearTimeout(timer);
    throw e; // network error or abort — let caller fall back to OpenRouter
  }

  if (res.status === 429) throw new Error('rate-limited');
  if (res.status === 401) throw new Error('Invalid Groq API key');
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      for (const line of decoder.decode(value, { stream: true }).split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') break;
        try {
          const delta = (JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> })
            .choices?.[0]?.delta?.content;
          if (delta) { result += delta; if (onChunk) onChunk(result.length); }
        } catch { /* skip malformed SSE line */ }
      }
    }
  } finally {
    reader.releaseLock();
  }
  return result;
}

// OpenRouter fallback models — only used if Groq fails
const MODELS = [
  'qwen/qwen3.8-27b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-4-31b-it:free',
];

const TOTAL_TIMEOUT_MS = 35000; // hard cap — never wait more than 35s total across all models

async function callModel(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number
): Promise<{ html: string; finishReason: string }> {
  let lastError = '';
  let rateLimitCount = 0;
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;

  for (const model of MODELS) {
    if (Date.now() > deadline) break; // hard stop
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

    if (res.status === 429) {
      rateLimitCount++;
      lastError = 'rate-limited';
      await new Promise(r => setTimeout(r, 800)); // brief pause before next model
      continue;
    }
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
  if (rateLimitCount > 0 && rateLimitCount >= MODELS.length - 2)
    throw new Error('rate-limited');
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
7. <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js"></script>
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
  onStatus('Layla AI is reading your prompt…');
  const messages = [{ role: 'system', content: CONFIG_PROMPT }, { role: 'user', content: prompt }];

  let raw: string;
  if (GROQ_KEY) {
    // Fast path: Groq (~1-2s)
    raw = await callGroq(messages, GROQ_FAST, 600);
  } else {
    if (!KEY) throw new Error('No API key');
    const { html } = await callModel(messages, 600);
    raw = html;
  }

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

// ── Fast patch system ─────────────────────────────────────
// Asks AI for find→replace pairs (~200 tokens, ~3-6s) instead of full HTML rewrite (~7000 tokens, ~30-50s)

const PATCH_PROMPT = `You receive an HTML file and ONE user instruction.
Return ONLY a JSON array of find→replace operations.

Rules:
- "find" must be an EXACT string copied verbatim from the HTML (including quotes/semicolons)
- "replace" is what to substitute in its place
- Use the minimum patches needed — usually 1 to 4 operations
- For color changes: find the hex color value e.g. "#6c63ff" and replace with new hex
- For text changes: find the exact text string and replace it
- For 3D colors: find the COLORS array e.g. ["#6c63ff","#9d97ff",...] and replace with new colors
- For font-size changes: find the exact CSS value e.g. "font-size:clamp(52px,8vw,100px)" and replace
- For geometry: find the THREE.IcosahedronGeometry (or whatever) constructor and replace

Return raw JSON only — no markdown, no explanation, no code fences.
Example output: [{"find":"color:#6c63ff","replace":"color:#ff3300"},{"find":"Build the\\nFuture","replace":"Hello\\nWorld"}]`;

interface Patch { find: string; replace: string; }

function applyPatches(html: string, patches: Patch[]): { html: string; applied: number } {
  let result = html;
  let applied = 0;
  for (const p of patches) {
    if (result.includes(p.find)) {
      // replaceAll via split/join to avoid regex escape issues
      result = result.split(p.find).join(p.replace);
      applied++;
    }
  }
  return { html: result, applied };
}

export async function laylaAIPatch(
  currentHtml: string,
  instruction: string,
  onLiveChars?: (chars: number) => void
): Promise<{ html: string; method: 'patch' | 'fallback' }> {
  // Send original HTML for patches (not compressed) so AI find-strings match exactly
  // Truncate only if extremely long
  const htmlForPatch = currentHtml.length > 14000 ? compressHtml(currentHtml) : currentHtml;
  const messages = [
    { role: 'system', content: PATCH_PROMPT },
    { role: 'user', content: `HTML:\n${htmlForPatch}\n\nInstruction: ${instruction}` },
  ];

  // Fast path: Groq (~1-3s)
  if (GROQ_KEY) {
    try {
      const raw = await callGroq(messages, GROQ_FAST, 500, 0.2, onLiveChars);
      const match = raw.match(/\[[\s\S]*\]/);
      if (match) {
        const patches = JSON.parse(match[0]) as Patch[];
        const { html, applied } = applyPatches(currentHtml, patches);
        if (applied > 0) return { html, method: 'patch' };
      }
    } catch { /* fall through to OpenRouter */ }
  }

  let lastError = '';
  let rateLimitCount = 0;
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;
  for (const model of MODELS) {
    if (Date.now() > deadline) break;
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
        body: JSON.stringify({ model, messages, max_tokens: 500, temperature: 0.2, stream: true }),
      });
    } catch (e) {
      clearTimeout(timer);
      const msg = (e as Error).message;
      lastError = msg.includes('abort') || msg.includes('signal') ? `${model} timed out` : `Network: ${msg}`;
      continue;
    }
    clearTimeout(timer);

    if (res.status === 429) {
      rateLimitCount++;
      lastError = 'rate-limited';
      await new Promise(r => setTimeout(r, 800));
      continue;
    }
    if (res.status === 401) throw new Error('Invalid API key');
    if (res.status === 402) throw new Error('OpenRouter credits exhausted.');
    if (!res.body) continue;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let raw = '';
    let modelError = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data) as {
              choices?: Array<{ delta?: { content?: string } }>;
              error?: { message: string };
            };
            if (parsed.error?.message) {
              if (/No endpoints|not a valid model|unavailable|overloaded|upstream/i.test(parsed.error.message)) {
                modelError = parsed.error.message; break;
              }
              throw new Error(parsed.error.message);
            }
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) { raw += delta; if (onLiveChars) onLiveChars(raw.length); }
          } catch { /* skip */ }
        }
        if (modelError) break;
      }
    } finally { reader.releaseLock(); }

    if (modelError) { lastError = modelError; continue; }

    // Parse JSON patches
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) { lastError = 'No JSON array in response'; continue; }

    let patches: Patch[];
    try { patches = JSON.parse(match[0]) as Patch[]; }
    catch { lastError = 'Invalid JSON'; continue; }

    const { html, applied } = applyPatches(currentHtml, patches);
    if (applied === 0) { lastError = 'No patches matched HTML'; continue; }

    return { html, method: 'patch' };
  }

  if (rateLimitCount > 0 && rateLimitCount >= MODELS.length - 2)
    throw new Error('rate-limited');
  throw new Error(`Patch failed: ${lastError}`);
}

// ── Streaming edit (live progress) ───────────────────────

export async function laylaAIEdit(
  currentHtml: string,
  instruction: string,
  onStatus: (msg: string) => void,
  onLiveChars?: (chars: number) => void
): Promise<string> {
  onStatus('Applying your change…');
  const htmlToSend = compressHtml(currentHtml);
  const messages = [
    { role: 'system', content: EDIT_PROMPT },
    { role: 'user', content: `Current HTML:\n\n${htmlToSend}\n\nInstruction: ${instruction}` },
  ];

  // Fast path: Groq 70B (~5-10s vs 30-50s on free OpenRouter)
  if (GROQ_KEY) {
    try {
      const html = await callGroq(messages, GROQ_SMART, 7000, 0.5, onLiveChars);
      const clean = html.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim();
      if (clean.startsWith('<!DOCTYPE') || clean.startsWith('<html')) {
        onStatus('Updating preview…');
        return clean;
      }
    } catch { /* fall through to OpenRouter */ }
  }

  if (!KEY) throw new Error('No API key set. Add VITE_GROQ_KEY or VITE_OPENROUTER_KEY to .env');

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
    // Strip any BOM or leading whitespace/text before the doctype
    const doctypeIdx = html.search(/<!doctype|<html/i);
    if (doctypeIdx > 0) html = html.slice(doctypeIdx);

    if (finishReason === 'length') throw new Error('Response cut off — try a more specific instruction.');
    if (!/^<!doctype|^<html/i.test(html))
      throw new Error(`AI returned unexpected output. Started with: "${html.slice(0, 80)}"`);

    onStatus('Updating preview…');
    return html;
  }

  throw new Error(`All models unavailable or timed out: ${lastError}`);
}
