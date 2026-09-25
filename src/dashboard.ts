import { getUser, signOut } from './lib/supabase';
import { generateSite } from './engine/generator';
import { laylaAI } from './engine/layla-ai';

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

  modal.querySelector('.preview-dl-btn')!.addEventListener('click', () => downloadHTML(p));
  modal.querySelector('.preview-fs-btn')!.addEventListener('click', () => openFullscreen(p));
}

function closePreviewModal(): void {
  const modal = document.getElementById('previewModal');
  if (!modal) return;
  modal.classList.remove('open');
  setTimeout(() => modal.remove(), 250);
}

function downloadHTML(p: Project): void {
  const blob = new Blob([p.html], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `layla-${p.id}.html`;
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

  const showPreview = (project: Project) => {
    const previewPanel = document.getElementById('dashInlinePreview');
    const previewFrame = document.getElementById('dashInlineFrame') as HTMLIFrameElement | null;
    if (previewPanel && previewFrame) {
      previewFrame.srcdoc = project.html;
      previewPanel.style.display = 'block';
      previewPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    document.getElementById('inlineDownloadBtn')?.addEventListener('click', () => downloadHTML(project), { once: true });
    document.getElementById('inlineFullscreenBtn')?.addEventListener('click', () => openFullscreen(project), { once: true });
    document.getElementById('inlineSaveBtn')?.addEventListener('click', () => showDashSection('projects'), { once: true });
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
