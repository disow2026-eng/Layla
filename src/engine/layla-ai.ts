// ── Layla AI ──────────────────────────────────────────────
// Powered by OpenRouter — uses the best available free model

const KEY   = import.meta.env['VITE_OPENROUTER_KEY'] as string;
const MODEL = 'google/gemini-2.0-flash-exp:free';

const SYSTEM_PROMPT = `You are Layla AI — a creative AI that generates stunning, interactive 3D websites using Three.js.

When the user describes a website, you generate a COMPLETE, STANDALONE HTML file.

Rules you MUST follow:
1. Use Three.js from this exact CDN: https://unpkg.com/three@0.160.0/build/three.min.js
2. Create animated 3D cubes/boxes (BoxGeometry) as the main shapes for now
3. Match colors, lighting, and background to the user's theme (dark for space/cyber/night, light for minimal/clean)
4. Every cube must have: smooth rotation animation + floating up/down movement
5. Add mouse parallax — camera shifts gently when the user moves their mouse
6. Use MeshStandardMaterial with metalness: 0.6 and roughness: 0.3 for shiny look
7. Add ambient light + 2 colored directional lights that match the theme
8. Place this badge fixed at bottom-right — do NOT skip it:
   <div id="badge" style="position:fixed;bottom:18px;right:18px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);color:rgba(255,255,255,0.6);font-size:11px;padding:6px 14px;border-radius:100px;font-family:'Courier New',monospace;letter-spacing:2px;pointer-events:none;">LAY<span style="color:#6c63ff">L</span>A ✦</div>
9. The canvas must fill the entire screen with overflow:hidden on body
10. Handle window resize properly

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
        { role: 'user',   content: `Build a 3D website: ${prompt}` },
      ],
      max_tokens: 6000,
      temperature: 0.7,
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
    .replace(/\s*```$/,  '')
    .trim();

  if (!html.startsWith('<!DOCTYPE') && !html.startsWith('<html')) {
    throw new Error('Layla AI returned invalid output — retrying with fallback.');
  }

  onStatus('Rendering your site…');
  return html;
}
