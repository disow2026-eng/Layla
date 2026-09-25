import type { LaylaScene } from './scene';

export type PageName = 'home' | 'docs' | 'examples' | 'dashboard';
export type DocName = 'intro' | 'quickstart' | 'prompts' | 'customize' | 'templates' | 'download' | 'github';

export function showPage(name: PageName, scene: LaylaScene): void {
  document.querySelectorAll<HTMLElement>('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll<HTMLElement>('.nav-links a').forEach(a => a.classList.remove('active'));

  document.getElementById(`page-${name}`)?.classList.add('active');
  document.getElementById(`nav-${name}`)?.classList.add('active');

  name === 'home' ? scene.show() : scene.hide();
}

export function showDoc(name: DocName, clickedLink: HTMLElement): void {
  document.querySelectorAll<HTMLElement>('.doc-section').forEach(d => d.classList.remove('active'));
  document.querySelectorAll<HTMLElement>('.sidebar-link').forEach(l => l.classList.remove('active'));

  document.getElementById(`doc-${name}`)?.classList.add('active');
  clickedLink.classList.add('active');
}

export function toggleDrawer(): void {
  document.getElementById('mobileDrawer')?.classList.toggle('open');
  document.getElementById('hamburger')?.classList.toggle('open');
}
