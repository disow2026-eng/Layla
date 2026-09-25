import { getUser, signOut } from './lib/supabase';
import { generateSite } from './engine/generator';
import { laylaAI, laylaAIEdit } from './engine/layla-ai';
import { makeZip } from './lib/zip';

export interface Project {
  id: string;
  prompt: string;
  createdAt: string;
  gradient: string;
  emoji: string;
  html: string;
}

const GRADIENTS = [
  'linear-gradient(135deg,#0a0a1a,#1a0a3a)',
  'linear-gradient(135deg,#f0eeff,#dde9ff)',
  'linear-gradient(135deg,#0a0a0a,#1a1a2e)',
  'linear-gradient(135deg,#0d0221,#190d3a)',
  'linear-gradient(135deg,#001f3f,#0074d9)',
  'linear-gradient(135deg,#1a0a00,#3a1500)',
  'linear-gradient(135deg,#0a1a00,#1a3a10)',
  'linear-gradient(135deg,#1a0a1a,#3a0a3a)',
];
const EMOJIS = ['🌌', '🟪', '🪐', '⚡', '🌊', '✦', '🔮', '💎', '🌀', '🎯'];

export type DashSection = 'overview' | 'projects' | 'new' | 'settings';

// ── Storage ──────────────────────────────────────────────

function storageKey(userId: string): string {
  return `layla_projects_${userId}`;
}

export function loadProjects(userId: string): Project[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(userId)) ?? '[]');
  } catch {
    return [];
  }
}

function saveProjects(userId: string, projects: Project[]): void {
  localStorage.setItem(storageKey(userId), JSON.stringify(projects));
}

export function addProject(userId: string, prompt: string, html?: string): Project {
  const project: Project = {
    id: Date.now().toString(),
    prompt,
    createdAt: new Date().toISOString(),
    gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    html: html ?? generateSite(prompt),
  };
  const list = loadProjects(userId);
  list.unshift(project);
  saveProjects(userId, list);
  return project;
}

export function removeProject(userId: string, id: string): void {
  saveProjects(userId, loadProjects(userId).filter(p => p.id !== id));
}

export function updateProjectHtml(userId: string, id: string, html: string): void {
  const list = loadProjects(userId);
  const idx = list.findIndex(p => p.id === id);
  if (idx !== -1) { list[idx].html = html; saveProjects(userId, list); }
}

// ── Helpers ──────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Editor ────────────────────────────────────────────────

let _editorProject: Project | null = null;
let _editorHtml = '';
let _editorWired = false;

export function openEditor(project: Project, userId: string): void {
  _editorProject = project;
  _editorHtml    = project.html;

  const el = document.getElementById('editorMode')!;
  el.style.display = 'flex';

  // Update labels
  const label = document.getElementById('editorProjectLabel');
  if (label) label.textContent = project.prompt.slice(0, 44) + (project.prompt.length > 44 ? '…' : '');
  const urlLabel = document.getElementById('editorUrlLabel');
  if (urlLabel) urlLabel.textContent = 'layla://preview — ' + project.prompt.slice(0, 32);

  // Load iframe
  const frame = document.getElementById('editorFrame') as HTMLIFrameElement | null;
  if (frame) frame.srcdoc = _editorHtml;

  // Reset chat
  const msgs = document.getElementById('editorMessages')!;
  msgs.innerHTML = `
    <div class="editor-welcome">
      <div class="editor-welcome-icon">✦</div>
      <p>Your site is ready. Ask Layla to make any changes.</p>
      <span>Try: "make the headline red" or "add more floating spheres"</span>
    </div>`;

  _wireEditor(userId);
}

function _addMsg(role: 'user' | 'ai' | 'status', text: string): HTMLElement {
  const msgs = document.getElementById('editorMessages')!;
  msgs.querySelector('.editor-welcome')?.remove();
  const div = document.createElement('div');
  div.className = `editor-msg editor-msg-${role}`;
  div.textContent = text;
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  return div;
}

async function _sendEdit(msg: string): Promise<void> {
  if (!msg.trim()) return;
  _addMsg('user', msg);
  const statusEl = _addMsg('status', 'Layla AI is thinking…');

  try {
    const newHtml = await laylaAIEdit(_editorHtml, msg, (s) => { statusEl.textContent = s; });
    _editorHtml = newHtml;
    statusEl.remove();
    const frame = document.getElementById('editorFrame') as HTMLIFrameElement | null;
    if (frame) frame.srcdoc = _editorHtml;
    _addMsg('ai', '✓ Done! Your site has been updated.');
  } catch (err: unknown) {
    statusEl.remove();
    const message = err instanceof Error ? err.message : String(err);
    // Classify the error so user knows what to do
    let friendly = `⚠ ${message}`;
    if (/rate limit/i.test(message)) friendly = '⏳ Rate limit — wait a few seconds and try again.';
    else if (/network/i.test(message)) friendly = '📡 Network error — check your connection and retry.';
    else if (/api key/i.test(message)) friendly = '🔑 API key issue — the OpenRouter key may be invalid.';
    else if (/cut off|too long/i.test(message)) friendly = '✂ Response cut off — try a more specific instruction like "change headline to X" instead of a big change.';
    else if (/unexpected output|misunderstood/i.test(message)) friendly = '🤔 AI misunderstood — try being more specific, e.g. "change the headline color to red" or "make cubes blue".';
    _addMsg('ai', friendly);
  }
}

function _wireEditor(userId: string): void {
  if (_editorWired) return;
  _editorWired = true;

  // Back
  document.getElementById('editorBackBtn')?.addEventListener('click', () => {
    document.getElementById('editorMode')!.style.display = 'none';
  });

  // Fullscreen
  document.getElementById('editorFullBtn')?.addEventListener('click', () => {
    if (!_editorHtml) return;
    const url = URL.createObjectURL(new Blob([_editorHtml], { type: 'text/html' }));
    window.open(url, '_blank');
  });

  // Download as ZIP
  document.getElementById('editorDlBtn')?.addEventListener('click', () => {
    if (!_editorProject) return;
    downloadZip({ ..._editorProject, html: _editorHtml });
  });

  // Save
  document.getElementById('editorSaveBtn')?.addEventListener('click', () => {
    if (!_editorProject) return;
    updateProjectHtml(userId, _editorProject.id, _editorHtml);
    _editorProject = { ..._editorProject, html: _editorHtml };
    const btn = document.getElementById('editorSaveBtn') as HTMLButtonElement;
    if (btn) { const t = btn.textContent; btn.textContent = '✓ Saved!'; setTimeout(() => { btn.textContent = t; }, 2000); }
  });

  // Send input
  const input = document.getElementById('editorInput') as HTMLInputElement | null;
  document.getElementById('editorSendBtn')?.addEventListener('click', () => {
    const val = input?.value.trim() ?? '';
    if (!val) return;
    if (input) input.value = '';
    _sendEdit(val);
  });
  input?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const val = input.value.trim();
      if (!val) return;
      input.value = '';
      _sendEdit(val);
    }
  });

  // Quick chips
  document.querySelectorAll<HTMLElement>('.editor-chip').forEach(chip => {
    chip.addEventListener('click', () => _sendEdit(chip.dataset['msg'] ?? chip.textContent ?? ''));
  });
}

// ── Render ────────────────────────────────────────────────

function renderCard(p: Project, userId: string, onDelete: () => void): HTMLElement {
  const card = document.createElement('div');
  card.className = 'dash-project-card';
  card.innerHTML = `
    <div class="dash-project-preview" style="background:${p.gradient}">${p.emoji}</div>
    <div class="dash-project-body">
      <div class="dash-project-prompt">${p.prompt}</div>
      <div class="dash-project-meta">
        <span class="dash-project-time">${timeAgo(p.createdAt)}</span>
        <div class="dash-card-actions">
          <button class="dash-edit-btn" title="Edit with AI">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="dash-open-btn" title="Open preview">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
          <button class="dash-delete-btn" title="Delete">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;

  card.querySelector('.dash-edit-btn')!.addEventListener('click', (e) => {
    e.stopPropagation();
    openEditor(p, userId);
  });

  card.querySelector('.dash-open-btn')!.addEventListener('click', (e) => {
    e.stopPropagation();
    openPreviewModal(p);
  });

  card.querySelector('.dash-delete-btn')!.addEventListener('click', (e) => {
    e.stopPropagation();
    card.classList.add('dash-card-removing');
    setTimeout(() => {
      removeProject(userId, p.id);
      onDelete();
    }, 200);
  });
  return card;
}

// ── Preview modal ─────────────────────────────────────────

function openPreviewModal(p: Project): void {
  const existing = document.getElementById('previewModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'previewModal';
  modal.className = 'preview-modal';
  modal.innerHTML = `
    <div class="preview-modal-backdrop"></div>
    <div class="preview-modal-box">
      <div class="preview-modal-bar">
        <span class="preview-modal-title">${p.prompt}</span>
        <div class="preview-modal-actions">
          <button class="btn-ghost preview-dl-btn" style="font-size:12px;padding:7px 16px">Download</button>
          <button class="btn-ghost preview-fs-btn" style="font-size:12px;padding:7px 16px">⛶ Fullscreen</button>
          <button class="preview-close-btn">✕</button>
        </div>
      </div>
      <iframe class="preview-modal-frame" sandbox="allow-scripts"></iframe>
    </div>
  `;

  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('open'));

  const frame = modal.querySelector<HTMLIFrameElement>('.preview-modal-frame')!;
  frame.srcdoc = p.html;

  modal.querySelector('.preview-modal-backdrop')!.addEventListener('click', () => closePreviewModal());
  modal.querySelector('.preview-close-btn')!.addEventListener('click', () => closePreviewModal());

  modal.querySelector('.preview-dl-btn')!.addEventListener('click', () => downloadZip(p));
  modal.querySelector('.preview-fs-btn')!.addEventListener('click', () => openFullscreen(p));
}

function closePreviewModal(): void {
  const modal = document.getElementById('previewModal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => modal.remove(), 250);
}

function downloadZip(p: Project): void {
  const slug = p.prompt.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/-$/, '');
  const readme = `# ${p.prompt}\n\nBuilt with Layla AI — https://disow2026-eng.github.io/Layla/\n\n## How to use\n\nOpen \`index.html\` in any browser to view your 3D site.\nNo server needed — it works offline.\n\n## Built on\n- Three.js (loaded from CDN)\n- Pure HTML + CSS + JS\n`;
  const blob = makeZip([
    { name: 'index.html', text: p.html },
    { name: 'README.md', text: readme },
  ]);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `layla-${slug}.zip`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function openFullscreen(p: Project): void {
  const blob = new Blob([p.html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

function renderGrid(userId: string, gridEl: HTMLElement, emptyEl: HTMLElement, limit?: number): void {
  let projects = loadProjects(userId);
  if (limit !== undefined) projects = projects.slice(0, limit);

  gridEl.innerHTML = '';

  if (projects.length === 0) {
    gridEl.style.display = 'none';
    emptyEl.style.display = 'flex';
  } else {
    gridEl.style.display = 'grid';
    emptyEl.style.display = 'none';
    for (const p of projects) {
      gridEl.appendChild(renderCard(p, userId, () => refreshDashboard(userId)));
    }
  }
}

// ── Public API ────────────────────────────────────────────

export function showDashSection(name: DashSection): void {
  document.querySelectorAll<HTMLElement>('.dash-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll<HTMLElement>('.dash-nav-item[data-dash]').forEach(n => n.classList.remove('active'));
  document.getElementById(`dash-${name}`)?.classList.add('active');
  document.querySelector<HTMLElement>(`.dash-nav-item[data-dash="${name}"]`)?.classList.add('active');
}

export function refreshDashboard(userId: string): void {
  const projects = loadProjects(userId);

  // Stats
  const el = (id: string) => document.getElementById(id);
  if (el('stat-projects')) el('stat-projects')!.textContent = String(projects.length);
  if (el('stat-prompts')) el('stat-prompts')!.textContent = String(projects.length);

  // Grids
  const overviewGrid  = el('overviewProjectsGrid') as HTMLElement | null;
  const overviewEmpty = el('overviewEmpty') as HTMLElement | null;
  const projectsGrid  = el('projectsGrid') as HTMLElement | null;
  const projectsEmpty = el('projectsEmpty') as HTMLElement | null;

  if (overviewGrid && overviewEmpty) renderGrid(userId, overviewGrid, overviewEmpty, 6);
  if (projectsGrid && projectsEmpty) renderGrid(userId, projectsGrid, projectsEmpty);
}

export async function initDashboard(onSignOut: () => void): Promise<string | null> {
  const user = await getUser();
  if (!user) return null;

  const userId = user.id;
  const username = user.email?.split('@')[0] ?? 'User';

  // Profile info
  const set = (id: string, val: string) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };
  set('dashAvatar', username[0].toUpperCase());
  set('dashUsername', username);
  set('settingsEmail', user.email ?? '');
  set('settingsJoined',
    new Date(user.created_at).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  );

  // Sidebar nav tabs
  document.querySelectorAll<HTMLElement>('.dash-nav-item[data-dash]').forEach(item => {
    item.addEventListener('click', () => {
      showDashSection(item.dataset['dash'] as DashSection);
    });
  });

  // Sign out
  const doSignOut = async () => { await signOut(); onSignOut(); };
  document.getElementById('dashSignOut')?.addEventListener('click', doSignOut);
  document.getElementById('settingsSignOut')?.addEventListener('click', doSignOut);

  // "New project" shortcuts
  const goNew = () => {
    showDashSection('new');
    (document.getElementById('dashPromptInput') as HTMLInputElement | null)?.focus();
  };
  document.getElementById('overviewNewBtn')?.addEventListener('click', goNew);
  document.getElementById('projectsNewBtn')?.addEventListener('click', goNew);
  document.getElementById('overviewBuildBtn')?.addEventListener('click', goNew);
  document.getElementById('projectsBuildBtn')?.addEventListener('click', goNew);

  // Chips
  document.querySelectorAll<HTMLElement>('.dash-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('dashPromptInput') as HTMLInputElement;
      input.value = chip.dataset['prompt'] ?? chip.textContent?.trim() ?? '';
      showDashSection('new');
      input.focus();
    });
  });

  // Build button
  const buildBtn   = document.getElementById('dashBuildBtn') as HTMLButtonElement | null;
  const buildInput = document.getElementById('dashPromptInput') as HTMLInputElement | null;

  const setBtn = (text: string, disabled: boolean) => {
    if (buildBtn) { buildBtn.textContent = text; buildBtn.disabled = disabled; }
  };

  // After build: open the editor directly instead of inline preview
  const showPreview = (project: Project) => {
    openEditor(project, userId);
  };

  const handleBuild = async () => {
    const val = buildInput?.value.trim() ?? '';
    if (!val) { buildInput?.focus(); return; }

    setBtn('Connecting to Layla AI…', true);

    let html: string;
    try {
      html = await laylaAI(val, (status) => setBtn(status, true));
    } catch (err) {
      console.warn('Layla AI failed, using fallback generator:', err);
      setBtn('Generating with fallback…', true);
      await new Promise(r => setTimeout(r, 400));
      html = generateSite(val);
    }

    if (buildInput) buildInput.value = '';
    setBtn('Build →', false);

    const project = addProject(userId, val, html);
    refreshDashboard(userId);
    showPreview(project);
  };

  buildBtn?.addEventListener('click', () => { handleBuild(); });
  buildInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') handleBuild();
  });

  refreshDashboard(userId);
  return userId;
}
