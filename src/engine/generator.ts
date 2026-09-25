// ── Layla Site Generator (fallback) ──────────────────────
// Used when AI is unavailable — still generates beautiful sites

interface Theme {
  bg: string;
  accent: string;
  colors: string[];
  light1: string;
  light2: string;
  font: string;
  fontUrl: string;
}

// ── Themes ───────────────────────────────────────────────

function getTheme(p: string): Theme {
  if (/neon|cyberpunk|cyber/.test(p))
    return { bg:'#0d0221', accent:'#ff00ff', colors:['#ff00ff','#00ffff','#ff3800','#00ff41'], light1:'#ff00ff', light2:'#00ffff', font:'Syne', fontUrl:'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap' };
  if (/space|galaxy|cosmos|star|universe/.test(p))
    return { bg:'#050510', accent:'#6c63ff', colors:['#6c63ff','#4facfe','#a78bfa','#818cf8'], light1:'#4facfe', light2:'#6c63ff', font:'Space Grotesk', fontUrl:'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap' };
  if (/fire|lava|flame|hot|volcano/.test(p))
    return { bg:'#1a0500', accent:'#ff4500', colors:['#ff4500','#ff6b35','#f9c74f','#ff0000'], light1:'#ff4500', light2:'#f9c74f', font:'Syne', fontUrl:'https://fonts.googleapis.com/css2?family=Syne:wght@400;800&display=swap' };
  if (/ocean|sea|water|wave|aqua/.test(p))
    return { bg:'#001830', accent:'#0ea5e9', colors:['#0ea5e9','#22d3ee','#0284c7','#38bdf8'], light1:'#0ea5e9', light2:'#22d3ee', font:'Inter', fontUrl:'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap' };
  if (/forest|nature|leaf|tree|jungle/.test(p))
    return { bg:'#021a04', accent:'#10b981', colors:['#10b981','#22c55e','#84cc16','#4ade80'], light1:'#10b981', light2:'#84cc16', font:'Inter', fontUrl:'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap' };
  if (/gold|luxury|royal|elegant|rich/.test(p))
    return { bg:'#0a0800', accent:'#f59e0b', colors:['#f59e0b','#fbbf24','#d97706','#fde68a'], light1:'#f59e0b', light2:'#fde68a', font:'Cormorant Garamond', fontUrl:'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap' };
  if (/pink|rose|cherry|blossom|magenta/.test(p))
    return { bg:'#1a0010', accent:'#ec4899', colors:['#ec4899','#f472b6','#e879f9','#db2777'], light1:'#ec4899', light2:'#e879f9', font:'Space Grotesk', fontUrl:'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap' };
  if (/minimal|clean|white|light/.test(p))
    return { bg:'#f4f4f8', accent:'#6c63ff', colors:['#6c63ff','#64748b','#94a3b8','#475569'], light1:'#6c63ff', light2:'#94a3b8', font:'Inter', fontUrl:'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap' };
  if (/purple|violet|lavender/.test(p))
    return { bg:'#0a0515', accent:'#7c3aed', colors:['#6c63ff','#9d97ff','#a78bfa','#7c3aed'], light1:'#6c63ff', light2:'#a78bfa', font:'Space Grotesk', fontUrl:'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap' };
  // default dark
  return { bg:'#080810', accent:'#6c63ff', colors:['#6c63ff','#9d97ff','#a78bfa','#818cf8'], light1:'#6c63ff', light2:'#9d97ff', font:'Space Grotesk', fontUrl:'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap' };
}

// ── Text content ─────────────────────────────────────────

function getContent(prompt: string): { headline: string; sub: string; cta: string; brand: string; nav: string[] } {
  const p = prompt.toLowerCase();

  if (/portfolio/.test(p)) {
    const name = prompt.match(/(?:for|by|'s)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)/)?.[1] ?? 'Creative';
    return { brand: name.split(' ')[0].toUpperCase(), headline: `${name}'s Portfolio`, sub: 'Designer. Developer. Creator. Building experiences that matter.', cta: 'View Work', nav: ['Work','About','Contact'] };
  }
  if (/product|showcase|app|saas|software/.test(p)) {
    const name = prompt.match(/(?:called|named|for)\s+([A-Z][a-zA-Z]+)/)?.[1] ?? 'Launch';
    return { brand: name.toUpperCase(), headline: 'Ship Faster.\nBuild Better.', sub: 'The platform that helps teams move from idea to production in record time.', cta: 'Get Early Access', nav: ['Features','Pricing','Docs'] };
  }
  if (/agency|studio|creative/.test(p)) {
    return { brand: 'STUDIO', headline: 'We Build\nDigital Worlds', sub: 'A creative studio crafting brands, websites, and digital experiences that inspire.', cta: 'See Our Work', nav: ['Work','Services','About'] };
  }
  if (/restaurant|food|cafe|coffee|kitchen/.test(p)) {
    return { brand: 'TASTE', headline: 'Food That\nTells a Story', sub: 'Locally sourced. Expertly crafted. Unforgettably delicious.', cta: 'Reserve a Table', nav: ['Menu','About','Reserve'] };
  }
  if (/music|band|artist|album/.test(p)) {
    return { brand: 'SOUND', headline: 'Feel Every\nNote', sub: 'Original music that moves you. New album out now.', cta: 'Listen Now', nav: ['Music','Tour','Contact'] };
  }
  if (/space|galaxy|cosmos|universe/.test(p)) {
    return { brand: 'COSMOS', headline: 'Explore\nthe Universe', sub: 'Journey through galaxies, nebulae, and the infinite depths of space.', cta: 'Begin Journey', nav: ['Explore','Missions','About'] };
  }
  if (/game|gaming/.test(p)) {
    return { brand: 'PLAY', headline: 'Enter\nthe Game', sub: 'Immersive worlds. Endless adventures. Your story starts here.', cta: 'Play Now', nav: ['Games','Community','Store'] };
  }

  // generic
  const words = prompt.split(' ').filter(w => w.length > 3);
  const headline = words.slice(0,3).map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ');
  return { brand: 'LAYLA', headline: headline || 'Build the\nFuture', sub: 'A stunning 3D website built in seconds with Layla AI. Describe anything — we build it.', cta: 'Get Started', nav: ['Home','Work','Contact'] };
}

// ── Geometry selector ────────────────────────────────────

function getGeometryCode(p: string): string {
  if (/product|tech|saas|software|app/.test(p))
    return `new THREE.TorusKnotGeometry(0.7 + Math.random()*0.4, 0.22 + Math.random()*0.1, 100, 16)`;
  if (/luxury|gold|elegant|ring/.test(p))
    return `Math.random()>.5 ? new THREE.TorusGeometry(0.8+Math.random()*0.5, 0.25, 16, 60) : new THREE.IcosahedronGeometry(0.5+Math.random()*0.6, 1)`;
  if (/minimal|clean|portfolio/.test(p))
    return `Math.random()>.5 ? new THREE.IcosahedronGeometry(0.4+Math.random()*0.8, 1) : new THREE.OctahedronGeometry(0.4+Math.random()*0.7)`;
  if (/neon|cyber|grid/.test(p))
    return `new THREE.BoxGeometry(0.6+Math.random()*0.9, 0.6+Math.random()*0.9, 0.6+Math.random()*0.9)`;
  // default: mix
  return `[new THREE.IcosahedronGeometry(0.4+Math.random()*0.8,1), new THREE.OctahedronGeometry(0.4+Math.random()*0.7), new THREE.TorusGeometry(0.6+Math.random()*0.4,0.2,12,40)][Math.floor(Math.random()*3)]`;
}

// ── Main HTML builder ────────────────────────────────────

export function generateSite(prompt: string): string {
  const p = prompt.toLowerCase();
  const theme = getTheme(p);
  const content = getContent(prompt);
  const geoCode = getGeometryCode(p);
  const isLight = theme.bg === '#f4f4f8';
  const textColor = isLight ? '#0a0a0a' : '#ffffff';
  const subColor  = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)';
  const navBg     = isLight ? 'rgba(244,244,248,0.7)' : `rgba(${parseInt(theme.bg.slice(1,3),16)},${parseInt(theme.bg.slice(3,5),16)},${parseInt(theme.bg.slice(5,7),16)},0.5)`;
  const navBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const badgeBg   = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
  const badgeBorder = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';
  const badgeColor  = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)';

  const navLinks = content.nav.map(n => `<li><a href="#">${n}</a></li>`).join('');

  // Particle stars for dark space/galaxy themes
  const starCode = /space|galaxy|cosmos|star|universe/.test(p) ? `
// Stars
const starGeo = new THREE.BufferGeometry();
const starCount = 1200;
const starPos = new Float32Array(starCount * 3);
for(let i=0;i<starCount*3;i++) starPos[i] = (Math.random()-0.5)*200;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos,3));
const starMat = new THREE.PointsMaterial({color:0xffffff,size:0.18,transparent:true,opacity:0.7});
scene.add(new THREE.Points(starGeo,starMat));` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${prompt.slice(0,60)} — Built with Layla</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${theme.fontUrl}" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:${theme.bg};overflow:hidden;font-family:'${theme.font}',sans-serif}
canvas{position:fixed;inset:0;z-index:0}
nav{
  position:fixed;top:0;left:0;right:0;z-index:100;
  padding:18px 48px;display:flex;align-items:center;justify-content:space-between;
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  background:${navBg};border-bottom:1px solid ${navBorder};
}
.nav-logo{font-size:17px;font-weight:700;color:${textColor};letter-spacing:2px}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{color:${subColor};text-decoration:none;font-size:13px;font-weight:500;letter-spacing:.5px;transition:color .2s}
.nav-links a:hover{color:${textColor}}
.hero{
  position:absolute;inset:0;z-index:10;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  text-align:center;padding:0 24px;
}
.hero h1{
  font-size:clamp(44px,8vw,92px);font-weight:700;
  color:${textColor};line-height:1.05;letter-spacing:-2px;
  white-space:pre-line;
  animation:fadeUp .8s ease both;
}
.hero h1 span{color:${theme.accent}}
.hero p{
  margin-top:22px;font-size:18px;font-weight:300;
  color:${subColor};max-width:500px;line-height:1.65;
  animation:fadeUp .8s .15s ease both;
}
.hero-cta{
  margin-top:36px;padding:14px 40px;
  background:${theme.accent};color:#fff;border:none;border-radius:100px;
  font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;
  transition:transform .2s,box-shadow .2s;
  animation:fadeUp .8s .3s ease both;
}
.hero-cta:hover{transform:scale(1.05);box-shadow:0 8px 32px ${theme.accent}55}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
#badge{
  position:fixed;bottom:18px;right:18px;
  background:${badgeBg};border:1px solid ${badgeBorder};
  color:${badgeColor};font-size:11px;padding:6px 14px;border-radius:100px;
  font-family:'Courier New',monospace;letter-spacing:2px;
  pointer-events:none;z-index:999;backdrop-filter:blur(8px);
}
#badge span{color:#6c63ff}
</style>
</head>
<body>
<canvas id="c"></canvas>
<nav>
  <div class="nav-logo">${content.brand}</div>
  <ul class="nav-links">${navLinks}</ul>
</nav>
<div class="hero">
  <h1>${content.headline.replace(/\n/,'<br>')}</h1>
  <p>${content.sub}</p>
  <button class="hero-cta">${content.cta}</button>
</div>
<div id="badge">LAY<span>L</span>A ✦</div>
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script>
const scene = new THREE.Scene();
scene.background = new THREE.Color('${theme.bg}');
const camera = new THREE.PerspectiveCamera(60,innerWidth/innerHeight,0.1,300);
camera.position.z = 22;
const renderer = new THREE.WebGLRenderer({canvas:document.getElementById('c'),antialias:true});
renderer.setSize(innerWidth,innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio,2));

// Lights
scene.add(new THREE.AmbientLight(0xffffff,${isLight ? 1.2 : 0.5}));
const l1 = new THREE.PointLight('${theme.light1}',${isLight ? 1.5 : 3},80);
l1.position.set(15,10,10); scene.add(l1);
const l2 = new THREE.PointLight('${theme.light2}',${isLight ? 1.2 : 2.5},80);
l2.position.set(-12,-8,8); scene.add(l2);
const l3 = new THREE.DirectionalLight(0xffffff,${isLight ? 0.8 : 0.4});
l3.position.set(0,-10,-5); scene.add(l3);

${starCode}

// Shapes
const COLORS = ${JSON.stringify(theme.colors)};
const meshes = [];
const COUNT = 12;
for(let i=0;i<COUNT;i++){
  const geo = ${geoCode};
  const mat = new THREE.MeshStandardMaterial({
    color: COLORS[i%COLORS.length],
    roughness: ${isLight ? 0.35 : 0.2},
    metalness: ${isLight ? 0.4 : 0.7},
  });
  const mesh = new THREE.Mesh(geo,mat);
  mesh.position.set(
    (Math.random()-.5)*28,
    (Math.random()-.5)*18,
    (Math.random()-.5)*14
  );
  mesh.rotation.set(Math.random()*6.28,Math.random()*6.28,Math.random()*6.28);
  mesh._rx = (Math.random()-.5)*.018;
  mesh._ry = (Math.random()-.5)*.018;
  mesh._rz = (Math.random()-.5)*.008;
  mesh._fs = Math.random()*.006+.003;
  mesh._fo = Math.random()*6.28;
  scene.add(mesh);
  meshes.push(mesh);
}

// Mouse parallax
let mx=0,my=0;
document.addEventListener('mousemove',e=>{
  mx=(e.clientX/innerWidth-.5)*2;
  my=(e.clientY/innerHeight-.5)*2;
});

// Resize
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});

// Animate
let t=0;
(function animate(){
  requestAnimationFrame(animate);
  t+=.008;
  meshes.forEach(m=>{
    m.rotation.x+=m._rx;
    m.rotation.y+=m._ry;
    m.rotation.z+=m._rz;
    m.position.y+=Math.sin(t+m._fo)*m._fs*.1;
  });
  camera.position.x+=(mx*3-camera.position.x)*.025;
  camera.position.y+=(-my*2-camera.position.y)*.025;
  camera.lookAt(0,0,0);
  renderer.render(scene,camera);
})();
</script>
</body>
</html>`;
}
