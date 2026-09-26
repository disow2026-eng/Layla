// ── Layla AI ──────────────────────────────────────────────
// Primary: Groq (fast, simple, no streaming)
// Fallback: OpenRouter free models

const KEY      = import.meta.env['VITE_OPENROUTER_KEY'] as string;
const GROQ_KEY = import.meta.env['VITE_GROQ_KEY'] as string | undefined;

const GROQ_FAST  = 'llama-3.1-8b-instant';    // patches + config
const GROQ_SMART = 'llama-3.3-70b-versatile'; // full HTML edits

// OpenRouter fallback models
const MODELS = [
  'qwen/qwen3.8-27b:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'google/gemma-3-27b-it:free',
  'google/gemma-4-31b-it:free',
];

const OR_TIMEOUT  = 20000; // 20s per OpenRouter model
const OR_DEADLINE = 35000; // 35s total across all models

// ── Simple Groq fetch (no streaming — avoids all SSE bugs) ─

async function groqFetch(
  messages: Array<{ role: string; content: string }>,
  model: string,
  maxTokens: number,
  temperature = 0.2
): Promise<string> {
  if (!GROQ_KEY) throw new Error('No Groq key');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  let res: Response;
  try {
    res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${GROQ_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
    });
  } finally {
    clearTimeout(timer);
  }

  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message: string };
  };

  if (data.error?.message) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

// ── OpenRouter fetch (non-streaming) ──────────────────────

async function orFetch(
  messages: Array<{ role: string; content: string }>,
  maxTokens: number,
  temperature = 0.5
): Promise<string> {
  if (!KEY) throw new Error('No OpenRouter key');

  const deadline = Date.now() + OR_DEADLINE;
  let lastError = '';

  for (const model of MODELS) {
    if (Date.now() > deadline) break;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), OR_TIMEOUT);

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
        body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature }),
      });
    } catch (e) {
      clearTimeout(timer);
      lastError = (e as Error).message;
      continue;
    }
    clearTimeout(timer);

    if (res.status === 429) { lastError = 'rate-limited'; await new Promise(r => setTimeout(r, 800)); continue; }
    if (res.status === 401) throw new Error('Invalid OpenRouter API key');
    if (res.status === 402) throw new Error('OpenRouter credits exhausted');

    const data = await res.json() as {
      choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      error?: { message: string };
    };

    if (data.error?.message) {
      if (/No endpoints|not a valid model|unavailable|overloaded|upstream/i.test(data.error.message)) {
        lastError = data.error.message; continue;
      }
      throw new Error(data.error.message);
    }

    return data.choices?.[0]?.message?.content?.trim() ?? '';
  }

  throw new Error(lastError.includes('rate') ? 'rate-limited' : `All models failed: ${lastError}`);
}

// ── Prompts ───────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Layla AI. Generate a COMPLETE, SELF-CONTAINED HTML file for a stunning 3D website.

REQUIRED STRUCTURE:
1. <link> for Google Fonts (Space Grotesk for dark/tech, Syne for cyber/neon, Cormorant Garamond for luxury)
2. <style>: body{overflow:hidden;margin:0}, canvas{position:fixed;inset:0;z-index:0}, frosted glass nav, hero overlay centered, headline clamp(52px,8vw,96px), fadeUp animation
3. <canvas id="c"> as 3D background
4. <nav> with brand + 3 links
5. .hero with real headline, subheadline, CTA button
6. Layla badge: <div id="badge" style="position:fixed;bottom:18px;right:18px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);font-size:11px;padding:6px 14px;border-radius:100px;font-family:'Courier New',monospace;letter-spacing:2px;pointer-events:none;z-index:999">LAY<span style="color:#6c63ff">L</span>A ✦</div>
7. <script src="https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.min.js"></script>
8. Three.js scene: 10-14 objects, lights, rotation+float animation, mouse parallax

OUTPUT: ONLY raw HTML starting with <!DOCTYPE html>`;

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
  try {
    raw = GROQ_KEY ? await groqFetch(messages, GROQ_FAST, 600) : await orFetch(messages, 600);
  } catch {
    throw new Error('AI config failed');
  }

  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]) as AIConfig;
}

export async function laylaAI(
  prompt: string,
  onStatus: (msg: string) => void
): Promise<string> {
  onStatus('Layla AI is thinking…');
  const messages = [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: prompt }];
  const raw = GROQ_KEY ? await groqFetch(messages, GROQ_SMART, 8000, 0.7) : await orFetch(messages, 8000, 0.7);
  const idx = raw.search(/<!doctype|<html/i);
  if (idx < 0) throw new Error('Invalid output from AI');
  return raw.slice(idx);
}

// ── Edit existing site ────────────────────────────────────

const EDIT_PROMPT = `You are Layla AI in edit mode. You receive an existing HTML website and ONE instruction.
Apply ONLY the requested change. Return the COMPLETE updated HTML file.
- Color changes: update CSS color values AND Three.js COLORS array
- Text changes: update only that text
- Shape changes: update THREE geometry constructors
- Keep all structure, layout, badge intact
CRITICAL: Return ONLY raw HTML starting with <!DOCTYPE html>. No markdown. No explanation.`;

const PATCH_PROMPT = `You receive HTML and ONE instruction. Return ONLY a JSON array of find/replace operations.
- "find": exact string from the HTML
- "replace": replacement string
- 1-4 operations max
- For colors: find the hex like #6c63ff, replace with new hex
- For text: find exact text content
Return raw JSON array only. Example: [{"find":"#6c63ff","replace":"#ff0000"}]`;

interface Patch { find: string; replace: string; }

function compressHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\n\s*\n/g, '\n')
    .replace(/  +/g, ' ')
    .trim();
}

function applyPatches(html: string, patches: Patch[]): { html: string; applied: number } {
  let result = html;
  let applied = 0;
  for (const p of patches) {
    if (!p.find || p.find === p.replace) continue;
    // Try exact match
    if (result.includes(p.find)) {
      result = result.split(p.find).join(p.replace);
      applied++; continue;
    }
    // Try with unescaped newlines
    const unescaped = p.find.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
    if (unescaped !== p.find && result.includes(unescaped)) {
      result = result.split(unescaped).join(p.replace);
      applied++;
    }
  }
  return { html: result, applied };
}

function extractHtml(raw: string): string {
  const clean = raw.replace(/^```html\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
  const idx = clean.search(/<!doctype|<html/i);
  return idx >= 0 ? clean.slice(idx) : '';
}

export async function laylaAIPatch(
  currentHtml: string,
  instruction: string,
  _onLiveChars?: (chars: number) => void
): Promise<{ html: string; method: 'patch' | 'fallback' }> {
  const htmlForPatch = currentHtml.length > 12000 ? compressHtml(currentHtml) : currentHtml;
  const messages = [
    { role: 'system', content: PATCH_PROMPT },
    { role: 'user', content: `HTML:\n${htmlForPatch}\n\nInstruction: ${instruction}` },
  ];

  const tryPatches = (raw: string) => {
    const match = raw.match(/\[[\s\S]*?\]/);
    if (!match) return null;
    try {
      const patches = JSON.parse(match[0]) as Patch[];
      const { html, applied } = applyPatches(currentHtml, patches);
      return applied > 0 ? html : null;
    } catch { return null; }
  };

  // Try Groq first
  if (GROQ_KEY) {
    try {
      const raw = await groqFetch(messages, GROQ_FAST, 500);
      const result = tryPatches(raw);
      if (result) return { html: result, method: 'patch' };
    } catch { /* fall through */ }
  }

  // OpenRouter fallback
  try {
    const raw = await orFetch(messages, 500, 0.2);
    const result = tryPatches(raw);
    if (result) return { html: result, method: 'patch' };
  } catch { /* fall through */ }

  throw new Error('No patches matched');
}

export async function laylaAIEdit(
  currentHtml: string,
  instruction: string,
  onStatus: (msg: string) => void,
  _onLiveChars?: (chars: number) => void
): Promise<string> {
  onStatus('Applying your change…');
  const htmlToSend = compressHtml(currentHtml);
  const messages = [
    { role: 'system', content: EDIT_PROMPT },
    { role: 'user', content: `Current HTML:\n\n${htmlToSend}\n\nInstruction: ${instruction}` },
  ];

  // Try Groq first
  if (GROQ_KEY) {
    try {
      const raw = await groqFetch(messages, GROQ_SMART, 6000, 0.5);
      const html = extractHtml(raw);
      if (html) { onStatus('Updating preview…'); return html; }
    } catch (e) {
      console.warn('Groq edit failed:', e);
    }
  }

  // OpenRouter fallback
  const raw = await orFetch(messages, 6000, 0.5);
  const html = extractHtml(raw);
  if (html) { onStatus('Updating preview…'); return html; }

  throw new Error(`AI returned unexpected output. Started with: "${raw.slice(0, 80)}"`);
}
