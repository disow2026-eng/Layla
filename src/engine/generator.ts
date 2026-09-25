// ── Layla Site Generator ─────────────────────────────────
// Parses a user prompt → generates a standalone Three.js HTML site

interface SceneConfig {
  title: string;
  bgColor: string;
  cubeColors: string[];
  lightColor1: string;
  lightColor2: string;
  cubeCount: number;
  cubeMinSize: number;
  cubeMaxSize: number;
  spread: number;
  rotSpeed: number;
  floatSpeed: number;
  fog: boolean;
}

// ── Color themes ─────────────────────────────────────────

function parseColors(p: string): Pick<SceneConfig, 'bgColor' | 'cubeColors' | 'lightColor1' | 'lightColor2'> {
  if (/neon|cyberpunk|cyber/.test(p))
    return { bgColor: '#0d0221', cubeColors: ['#ff00ff','#00ffff','#ff3800','#00ff41','#ff006e'], lightColor1: '#ff00ff', lightColor2: '#00ffff' };
  if (/space|galaxy|cosmos|star|universe/.test(p))
    return { bgColor: '#050510', cubeColors: ['#6c63ff','#4facfe','#a78bfa','#818cf8','#38bdf8'], lightColor1: '#4facfe', lightColor2: '#6c63ff' };
  if (/fire|lava|flame|hot|volcano/.test(p))
    return { bgColor: '#1a0500', cubeColors: ['#ff4500','#ff6b35','#f9c74f','#ff0000','#ff8800'], lightColor1: '#ff4500', lightColor2: '#f9c74f' };
  if (/ocean|sea|water|wave|aqua/.test(p))
    return { bgColor: '#001830', cubeColors: ['#0ea5e9','#22d3ee','#0284c7','#38bdf8','#06b6d4'], lightColor1: '#0ea5e9', lightColor2: '#22d3ee' };
  if (/forest|nature|leaf|tree|jungle/.test(p))
    return { bgColor: '#021a04', cubeColors: ['#10b981','#22c55e','#84cc16','#16a34a','#4ade80'], lightColor1: '#10b981', lightColor2: '#84cc16' };
  if (/gold|luxury|royal|elegant|rich/.test(p))
    return { bgColor: '#0a0800', cubeColors: ['#f59e0b','#fbbf24','#d97706','#fde68a','#ca8a04'], lightColor1: '#f59e0b', lightColor2: '#fde68a' };
  if (/pink|rose|cherry|bloss|magenta/.test(p))
    return { bgColor: '#1a0010', cubeColors: ['#ec4899','#f472b6','#e879f9','#db2777','#f9a8d4'], lightColor1: '#ec4899', lightColor2: '#e879f9' };
  if (/red|crimson|ruby|blood/.test(p))
    return { bgColor: '#1a0000', cubeColors: ['#ef4444','#f43f5e','#dc2626','#ff6b6b','#fca5a5'], lightColor1: '#ef4444', lightColor2: '#f43f5e' };
  if (/blue|navy|azure/.test(p))
    return { bgColor: '#000d1a', cubeColors: ['#3b82f6','#60a5fa','#2563eb','#93c5fd','#1d4ed8'], lightColor1: '#3b82f6', lightColor2: '#60a5fa' };
  if (/green|emerald|jade|mint/.test(p))
    return { bgColor: '#001a08', cubeColors: ['#10b981','#34d399','#059669','#6ee7b7','#065f46'], lightColor1: '#10b981', lightColor2: '#34d399' };
  if (/orange|sunset|amber/.test(p))
    return { bgColor: '#1a0800', cubeColors: ['#f97316','#fb923c','#f59e0b','#ea580c','#fdba74'], lightColor1: '#f97316', lightColor2: '#f59e0b' };
  if (/purple|violet|lavender/.test(p))
    return { bgColor: '#0a0515', cubeColors: ['#6c63ff','#9d97ff','#a78bfa','#7c3aed','#c4b5fd'], lightColor1: '#6c63ff', lightColor2: '#a78bfa' };
  if (/minimal|clean|white|light/.test(p))
    return { bgColor: '#f0f0f0', cubeColors: ['#6c63ff','#64748b','#94a3b8','#475569','#334155'], lightColor1: '#6c63ff', lightColor2: '#94a3b8' };
  if (/dark|black|shadow|night/.test(p))
    return { bgColor: '#050505', cubeColors: ['#334155','#6c63ff','#475569','#1e293b','#9d97ff'], lightColor1: '#6c63ff', lightColor2: '#334155' };

  // Default — Layla brand
  return { bgColor: '#0a0a0a', cubeColors: ['#6c63ff','#9d97ff','#a78bfa','#818cf8','#7c3aed'], lightColor1: '#6c63ff', lightColor2: '#9d97ff' };
}

function parseCount(p: string): number {
  const match = p.match(/(\d+)\s*(cube|box|block|shape)/);
  if (match) return Math.min(30, Math.max(3, parseInt(match[1])));
  if (/few|simple|one|single|just a/.test(p)) return 4;
  if (/many|lots|tons|full|packed|crowded|hundred/.test(p)) return 22;
  if (/dozen/.test(p)) return 12;
  return 10;
}

function parseSize(p: string): { cubeMinSize: number; cubeMaxSize: number } {
  if (/tiny|small|little|mini/.test(p)) return { cubeMinSize: 0.2, cubeMaxSize: 0.7 };
  if (/big|large|huge|giant|massive/.test(p)) return { cubeMinSize: 1.5, cubeMaxSize: 3.5 };
  if (/mixed|varied|different size/.test(p)) return { cubeMinSize: 0.2, cubeMaxSize: 3.0 };
  return { cubeMinSize: 0.5, cubeMaxSize: 1.5 };
}

function parseSpeed(p: string): { rotSpeed: number; floatSpeed: number } {
  if (/fast|quick|rapid|speedy/.test(p)) return { rotSpeed: 0.04, floatSpeed: 0.014 };
  if (/slow|gentle|calm|lazy|peaceful/.test(p)) return { rotSpeed: 0.004, floatSpeed: 0.003 };
  if (/still|static|frozen/.test(p)) return { rotSpeed: 0.0005, floatSpeed: 0.001 };
  return { rotSpeed: 0.015, floatSpeed: 0.006 };
}

// ── Config builder ────────────────────────────────────────

function buildConfig(prompt: string): SceneConfig {
  const p = prompt.toLowerCase();
  const colors = parseColors(p);
  const { cubeMinSize, cubeMaxSize } = parseSize(p);
  const { rotSpeed, floatSpeed } = parseSpeed(p);
  const count = parseCount(p);
  const title = prompt.length > 50 ? prompt.slice(0, 50) + '…' : prompt;

  return {
    title,
    ...colors,
    cubeCount: count,
    cubeMinSize,
    cubeMaxSize,
    spread: count > 15 ? 32 : count > 8 ? 24 : 18,
    rotSpeed,
    floatSpeed,
    fog: /fog|mist|haze|smoke/.test(p),
  };
}

// ── HTML generator ────────────────────────────────────────

function buildScript(cfg: SceneConfig): string {
  const colors = JSON.stringify(cfg.cubeColors);
  const fogLine = cfg.fog
    ? `scene.fog = new THREE.FogExp2('${cfg.bgColor}', 0.045);`
    : '';

  return [
    `const scene = new THREE.Scene();`,
    `scene.background = new THREE.Color('${cfg.bgColor}');`,
    fogLine,
    ``,
    `const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 300);`,
    `camera.position.z = 22;`,
    ``,
    `const renderer = new THREE.WebGLRenderer({ antialias: true });`,
    `renderer.setSize(innerWidth, innerHeight);`,
    `renderer.setPixelRatio(Math.min(devicePixelRatio, 2));`,
    `document.body.appendChild(renderer.domElement);`,
    ``,
    `// Lights`,
    `scene.add(new THREE.AmbientLight(0xffffff, 0.4));`,
    `const dl1 = new THREE.DirectionalLight('${cfg.lightColor1}', 2.5);`,
    `dl1.position.set(10, 10, 10); scene.add(dl1);`,
    `const dl2 = new THREE.DirectionalLight('${cfg.lightColor2}', 2.0);`,
    `dl2.position.set(-10, -5, 8); scene.add(dl2);`,
    `const dl3 = new THREE.DirectionalLight(0xffffff, 0.5);`,
    `dl3.position.set(0, -10, -5); scene.add(dl3);`,
    ``,
    `// Cubes`,
    `const COLORS = ${colors};`,
    `const cubes = [];`,
    `const wires = [];`,
    `for (let i = 0; i < ${cfg.cubeCount}; i++) {`,
    `  const s = ${cfg.cubeMinSize} + Math.random() * ${(cfg.cubeMaxSize - cfg.cubeMinSize).toFixed(2)};`,
    `  const geo = new THREE.BoxGeometry(s, s, s);`,
    `  const mat = new THREE.MeshStandardMaterial({`,
    `    color: COLORS[i % COLORS.length],`,
    `    roughness: 0.25,`,
    `    metalness: 0.65,`,
    `  });`,
    `  const mesh = new THREE.Mesh(geo, mat);`,
    `  mesh.position.set(`,
    `    (Math.random() - 0.5) * ${cfg.spread},`,
    `    (Math.random() - 0.5) * ${(cfg.spread * 0.6).toFixed(1)},`,
    `    (Math.random() - 0.5) * 12`,
    `  );`,
    `  mesh.rotation.set(Math.random()*6.28, Math.random()*6.28, Math.random()*6.28);`,
    `  mesh._rx = (Math.random()-0.5) * ${cfg.rotSpeed.toFixed(4)};`,
    `  mesh._ry = (Math.random()-0.5) * ${cfg.rotSpeed.toFixed(4)};`,
    `  mesh._rz = (Math.random()-0.5) * ${(cfg.rotSpeed * 0.5).toFixed(4)};`,
    `  mesh._fs = Math.random() * ${cfg.floatSpeed.toFixed(4)} + ${(cfg.floatSpeed * 0.3).toFixed(4)};`,
    `  mesh._fo = Math.random() * 6.28;`,
    `  scene.add(mesh);`,
    `  cubes.push(mesh);`,
    ``,
    `  // Wireframe overlay`,
    `  const wm = new THREE.MeshBasicMaterial({ color: COLORS[i % COLORS.length], wireframe: true, transparent: true, opacity: 0.12 });`,
    `  const wf = new THREE.Mesh(geo, wm);`,
    `  wf._ref = mesh;`,
    `  scene.add(wf);`,
    `  wires.push(wf);`,
    `}`,
    ``,
    `// Mouse parallax`,
    `let mx = 0, my = 0;`,
    `document.addEventListener('mousemove', e => {`,
    `  mx = (e.clientX / innerWidth - 0.5) * 2;`,
    `  my = (e.clientY / innerHeight - 0.5) * 2;`,
    `});`,
    ``,
    `// Resize`,
    `window.addEventListener('resize', () => {`,
    `  camera.aspect = innerWidth / innerHeight;`,
    `  camera.updateProjectionMatrix();`,
    `  renderer.setSize(innerWidth, innerHeight);`,
    `});`,
    ``,
    `// Animate`,
    `let t = 0;`,
    `(function animate() {`,
    `  requestAnimationFrame(animate);`,
    `  t += 0.008;`,
    `  cubes.forEach(c => {`,
    `    c.rotation.x += c._rx;`,
    `    c.rotation.y += c._ry;`,
    `    c.rotation.z += c._rz;`,
    `    c.position.y += Math.sin(t + c._fo) * c._fs * 0.1;`,
    `  });`,
    `  wires.forEach(w => {`,
    `    w.position.copy(w._ref.position);`,
    `    w.rotation.copy(w._ref.rotation);`,
    `  });`,
    `  camera.position.x += (mx * 3 - camera.position.x) * 0.025;`,
    `  camera.position.y += (-my * 2 - camera.position.y) * 0.025;`,
    `  camera.lookAt(0, 0, 0);`,
    `  renderer.render(scene, camera);`,
    `})();`,
  ].join('\n');
}

function buildHTML(cfg: SceneConfig): string {
  const textColor = cfg.bgColor === '#f0f0f0' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)';
  const badgeBg   = cfg.bgColor === '#f0f0f0' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.07)';
  const badgeBorder = cfg.bgColor === '#f0f0f0' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';

  return [
    `<!DOCTYPE html>`,
    `<html lang="en">`,
    `<head>`,
    `<meta charset="UTF-8"/>`,
    `<meta name="viewport" content="width=device-width,initial-scale=1"/>`,
    `<title>${cfg.title} — Built with Layla</title>`,
    `<style>`,
    `*{margin:0;padding:0;box-sizing:border-box}`,
    `body{background:${cfg.bgColor};overflow:hidden}`,
    `canvas{display:block}`,
    `#badge{`,
    `  position:fixed;bottom:18px;right:18px;`,
    `  background:${badgeBg};`,
    `  border:1px solid ${badgeBorder};`,
    `  color:${textColor};`,
    `  font-size:11px;padding:6px 14px;border-radius:100px;`,
    `  backdrop-filter:blur(8px);letter-spacing:2px;`,
    `  font-family:'Courier New',monospace;pointer-events:none;`,
    `}`,
    `#badge span{color:#6c63ff}`,
    `</style>`,
    `</head>`,
    `<body>`,
    `<div id="badge">LAY<span>L</span>A ✦</div>`,
    `<script src="https://unpkg.com/three@0.160.0/build/three.min.js"><\/script>`,
    `<script>`,
    buildScript(cfg),
    `<\/script>`,
    `</body>`,
    `</html>`,
  ].join('\n');
}

// ── Public API ────────────────────────────────────────────

export function generateSite(prompt: string): string {
  return buildHTML(buildConfig(prompt));
}
