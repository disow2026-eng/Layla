import './style.css';
import { LaylaScene } from './scene';
import { showPage, showDoc, toggleDrawer } from './navigation';
import type { PageName, DocName } from './navigation';
import { openModal, updateNavForUser } from './auth';
import { initDashboard, showDashSection } from './dashboard';
import { getUser } from './lib/supabase';

// ── Check auth state on load ──
updateNavForUser();

// ── Init 3D Scene ──
const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
const scene = new LaylaScene(canvas);

// ── Dashboard init ──
let dashboardReady = false;
async function openDashboard(): Promise<void> {
  showPage('dashboard', scene);
  if (!dashboardReady) {
    dashboardReady = true;
    await initDashboard(() => { location.reload(); });
  }
  showDashSection('overview');
}

// ── Auto-redirect to dashboard if already logged in ──
(async () => {
  const user = await getUser();
  if (user) openDashboard();
})();

// ── Go to dashboard after sign-in ──
window.addEventListener('layla:goto-dashboard', async () => {
  await openDashboard();
  // Auto-build if user had a pending prompt from the landing page
  const pending = sessionStorage.getItem('layla_pending_prompt');
  if (pending) {
    sessionStorage.removeItem('layla_pending_prompt');
    const dashInput = document.getElementById('dashPromptInput') as HTMLInputElement | null;
    if (dashInput) dashInput.value = pending;
    showDashSection('new');
    setTimeout(() => document.getElementById('dashBuildBtn')?.click(), 150);
  }
});


// ── Nav links (desktop) ──
document.querySelectorAll<HTMLElement>('.nav-links a, .logo').forEach(el => {
  el.addEventListener('click', async () => {
    const page = el.dataset['page'] as PageName | undefined;
    if (!page) return;
    if (page === 'home') {
      const user = await getUser();
      if (user) { openDashboard(); return; }
    }
    showPage(page, scene);
  });
});

// ── Sidebar doc links ──
document.querySelectorAll<HTMLElement>('.sidebar-link').forEach(el => {
  el.addEventListener('click', () => {
    const doc = el.dataset['doc'] as DocName | undefined;
    if (doc) showDoc(doc, el);
  });
});

// ── Mobile drawer links ──
document.querySelectorAll<HTMLElement>('.mobile-drawer a').forEach(el => {
  el.addEventListener('click', async () => {
    const page = el.dataset['page'] as PageName | undefined;
    if (!page) return;
    toggleDrawer();
    if (page === 'home') {
      const user = await getUser();
      if (user) { openDashboard(); return; }
    }
    showPage(page, scene);
  });
});

// ── "Back to Dashboard" buttons (on docs/examples when logged in) ──
document.querySelectorAll<HTMLElement>('.back-to-dash').forEach(btn => {
  btn.addEventListener('click', () => openDashboard());
});

// ── Hamburger ──
document.getElementById('hamburger')?.addEventListener('click', toggleDrawer);

// ── Auth buttons (desktop) ──
document.querySelector('.btn-ghost')?.addEventListener('click', openModal);
document.querySelector('.btn-solid')?.addEventListener('click', () => {
  const btn = document.querySelector<HTMLElement>('.btn-solid');
  if (btn?.dataset['action'] === 'dashboard') {
    openDashboard();
  } else {
    openModal();
  }
});

// ── Auth buttons (mobile drawer) ──
document.getElementById('drawerSignIn')?.addEventListener('click', () => {
  toggleDrawer();
  openModal();
});
document.getElementById('drawerGetStarted')?.addEventListener('click', () => {
  const btn = document.querySelector<HTMLElement>('.btn-solid');
  toggleDrawer();
  if (btn?.dataset['action'] === 'dashboard') {
    openDashboard();
  } else {
    openModal();
  }
});

// ── Example cards ──
document.querySelectorAll<HTMLElement>('.ex-card').forEach(card => {
  card.addEventListener('click', () => {
    const prompt = card.dataset['prompt'];
    if (prompt) {
      showPage('home', scene);
      const input = document.getElementById('promptInput') as HTMLInputElement;
      input.value = prompt;
      input.focus();
    }
  });
});

// ── Prompt chips (home page only) ──
document.querySelectorAll<HTMLElement>('#page-home .chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const input = document.getElementById('promptInput') as HTMLInputElement;
    input.value = chip.textContent?.trim() ?? '';
    input.focus();
  });
});

// ── Build button (home page) ──
const buildBtn = document.getElementById('buildBtn');
const promptInput = document.getElementById('promptInput') as HTMLInputElement;

async function handleBuild(): Promise<void> {
  const val = promptInput.value.trim();
  if (!val) { promptInput.focus(); return; }

  const user = await getUser();
  if (!user) {
    // Save prompt, open auth — after login the pending prompt auto-builds
    sessionStorage.setItem('layla_pending_prompt', val);
    openModal();
    return;
  }

  // Logged in — go to dashboard and auto-build
  await openDashboard();
  const dashInput = document.getElementById('dashPromptInput') as HTMLInputElement | null;
  if (dashInput) dashInput.value = val;
  showDashSection('new');
  setTimeout(() => document.getElementById('dashBuildBtn')?.click(), 150);
}

buildBtn?.addEventListener('click', handleBuild);
promptInput?.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') handleBuild();
});
