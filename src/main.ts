import './style.css';
import { LaylaScene } from './scene';
import { showPage, showDoc, toggleDrawer } from './navigation';
import type { PageName, DocName } from './navigation';

// ── Init 3D Scene ──
const canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
const scene = new LaylaScene(canvas);

// ── Nav links (desktop) ──
document.querySelectorAll<HTMLElement>('.nav-links a, .logo').forEach(el => {
  el.addEventListener('click', () => {
    const page = el.dataset['page'] as PageName | undefined;
    if (page) showPage(page, scene);
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
  el.addEventListener('click', () => {
    const page = el.dataset['page'] as PageName | undefined;
    if (page) {
      showPage(page, scene);
      toggleDrawer();
    }
  });
});

// ── Hamburger ──
document.getElementById('hamburger')?.addEventListener('click', toggleDrawer);
document.getElementById('drawerClose')?.addEventListener('click', toggleDrawer);

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

// ── Prompt chips ──
document.querySelectorAll<HTMLElement>('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    const input = document.getElementById('promptInput') as HTMLInputElement;
    input.value = chip.textContent?.trim() ?? '';
    input.focus();
  });
});

// ── Build button ──
const buildBtn = document.getElementById('buildBtn');
const promptInput = document.getElementById('promptInput') as HTMLInputElement;

function handleBuild(): void {
  const val = promptInput.value.trim();
  if (!val) return;
  alert(`Layla is thinking...\n\n"${val}"\n\n(AI coming soon)`);
}

buildBtn?.addEventListener('click', handleBuild);
promptInput?.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') handleBuild();
});
