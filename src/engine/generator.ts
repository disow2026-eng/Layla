// ── Layla Site Generator (fallback) ──────────────────────
// Used when AI is unavailable — still generates beautiful sites

interface Theme {
  bg: string;
  accent: string;
  colors: string[];
  light1: string;
  light2: string;
  light3: string;
  font: string;
  fontUrl: string;
}

interface Content {
  brand: string;
  headline: string;
  sub: string;
  cta: string;
  nav: string[];
  features: Array<{ icon: string; title: string; desc: string }>;
  stats: Array<{ value: string; label: string }>;
}

type Layout = 'hero-center' | 'hero-split' | 'minimal-object' | 'grid-feature';

// ── Theme detection ───────────────────────────────────────

function getTheme(p: string): Theme {
  if (/neon|cyberpunk|cyber|hack|matrix/.test(p))
    return {
      bg: '#0d0221', accent: '#ff00ff',
      colors: ['#ff00ff', '#00ffff', '#ff006e', '#00ff41', '#ff00ff'],
      light1: '#ff00ff', light2: '#00ffff', light3: '#ff006e',
      font: 'Syne', fontUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&display=swap',
    };
  if (/space|galaxy|cosmos|star|universe|nebula|astro/.test(p))
    return {
      bg: '#050510', accent: '#6c63ff',
      colors: ['#6c63ff', '#4facfe', '#a78bfa', '#818cf8', '#00d4ff'],
      light1: '#4facfe', light2: '#6c63ff', light3: '#a78bfa',
      font: 'Space Grotesk', fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&display=swap',
    };
  if (/fire|lava|flame|hot|volcano|inferno/.test(p))
    return {
      bg: '#1a0500', accent: '#ff4500',
      colors: ['#ff4500', '#ff6b35', '#f9c74f', '#ff0000', '#ff8c00'],
      light1: '#ff4500', light2: '#f9c74f', light3: '#ff6b35',
      font: 'Syne', fontUrl: 'https://fonts.googleapis.com/css2?family=Syne:wght@400;800&display=swap',
    };
  if (/ocean|sea|water|wave|aqua|marine|dive/.test(p))
    return {
      bg: '#001830', accent: '#0ea5e9',
      colors: ['#0ea5e9', '#22d3ee', '#0284c7', '#38bdf8', '#06b6d4'],
      light1: '#0ea5e9', light2: '#22d3ee', light3: '#0284c7',
      font: 'Inter', fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap',
    };
  if (/forest|nature|leaf|tree|jungle|botanical|green/.test(p))
    return {
      bg: '#021a04', accent: '#10b981',
      colors: ['#10b981', '#22c55e', '#84cc16', '#4ade80', '#34d399'],
      light1: '#10b981', light2: '#84cc16', light3: '#22c55e',
      font: 'Inter', fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap',
    };
  if (/gold|luxury|royal|elegant|rich|jewelry|watch|haute/.test(p))
    return {
      bg: '#0a0800', accent: '#f59e0b',
      colors: ['#f59e0b', '#fbbf24', '#d97706', '#fde68a', '#e9a820'],
      light1: '#f59e0b', light2: '#fde68a', light3: '#d97706',
      font: 'Cormorant Garamond', fontUrl: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600&display=swap',
    };
  if (/pink|rose|cherry|blossom|magenta|beauty|cosmetic/.test(p))
    return {
      bg: '#1a0010', accent: '#ec4899',
      colors: ['#ec4899', '#f472b6', '#e879f9', '#db2777', '#f9a8d4'],
      light1: '#ec4899', light2: '#e879f9', light3: '#f472b6',
      font: 'Space Grotesk', fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&display=swap',
    };
  if (/minimal|clean|white|light|pure|simple/.test(p))
    return {
      bg: '#f4f4f8', accent: '#6c63ff',
      colors: ['#6c63ff', '#64748b', '#94a3b8', '#475569', '#818cf8'],
      light1: '#6c63ff', light2: '#94a3b8', light3: '#818cf8',
      font: 'Inter', fontUrl: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap',
    };
  if (/purple|violet|lavender|mystical|magic/.test(p))
    return {
      bg: '#0a0515', accent: '#7c3aed',
      colors: ['#6c63ff', '#9d97ff', '#a78bfa', '#7c3aed', '#c084fc'],
      light1: '#6c63ff', light2: '#a78bfa', light3: '#7c3aed',
      font: 'Space Grotesk', fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&display=swap',
    };
  if (/cyber|future|digital|tech|software|saas|app|platform/.test(p))
    return {
      bg: '#060612', accent: '#00d4ff',
      colors: ['#00d4ff', '#6c63ff', '#a78bfa', '#4facfe', '#38bdf8'],
      light1: '#00d4ff', light2: '#6c63ff', light3: '#4facfe',
      font: 'Space Grotesk', fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&display=swap',
    };
  // default dark
  return {
    bg: '#080810', accent: '#6c63ff',
    colors: ['#6c63ff', '#9d97ff', '#a78bfa', '#818cf8', '#4facfe'],
    light1: '#6c63ff', light2: '#9d97ff', light3: '#a78bfa',
    font: 'Space Grotesk', fontUrl: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;700&display=swap',
  };
}

// ── Layout selector ───────────────────────────────────────

function getLayout(p: string): Layout {
  if (/product|saas|app|software|startup|platform|launch|tool/.test(p)) return 'hero-split';
  if (/luxury|jewelry|watch|minimal|single|art|sculpture|object/.test(p)) return 'minimal-object';
  if (/agency|studio|service|creative|design firm|we build/.test(p)) return 'grid-feature';
  return 'hero-center';
}

// ── Content extraction ────────────────────────────────────

function getContent(prompt: string): Content {
  const p = prompt.toLowerCase();

  const defaultFeatures = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Built for speed from the ground up. Performance that sets new standards.' },
    { icon: '✦', title: 'Pixel Perfect', desc: 'Every detail crafted with obsessive attention to quality and craft.' },
    { icon: '∞', title: 'Infinite Scale', desc: 'Grows with your ambition. No ceilings, no limits, no compromises.' },
  ];

  if (/portfolio/.test(p)) {
    const nameMatch = prompt.match(/(?:for|by|'s)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
    const name = nameMatch?.[1] ?? 'Creative';
    const first = name.split(' ')[0];
    return {
      brand: first.toUpperCase(),
      headline: `${name}'s\nCreative Work`,
      sub: 'Designer. Developer. Storyteller. Building digital experiences that leave a lasting impression.',
      cta: 'View My Work',
      nav: ['Work', 'About', 'Contact'],
      features: [
        { icon: '◈', title: 'UI Design', desc: 'Interfaces that feel natural and delight users at every interaction.' },
        { icon: '⟨⟩', title: 'Development', desc: 'Clean, maintainable code that ships fast and scales effortlessly.' },
        { icon: '◐', title: 'Branding', desc: 'Visual identities that tell compelling stories and build recognition.' },
      ],
      stats: [{ value: '48+', label: 'Projects' }, { value: '12', label: 'Awards' }, { value: '6yr', label: 'Experience' }, { value: '98%', label: 'Satisfaction' }],
    };
  }

  if (/product|showcase|app|saas|software|platform|startup/.test(p)) {
    const nameMatch = prompt.match(/(?:called|named|for|app)\s+([A-Z][a-zA-Z]+)/);
    const name = nameMatch?.[1] ?? 'Nexus';
    return {
      brand: name.toUpperCase(),
      headline: 'Ship 10x\nFaster',
      sub: `${name} is the platform that takes your team from zero to production in record time. No friction, just results.`,
      cta: 'Get Early Access',
      nav: ['Features', 'Pricing', 'Docs'],
      features: [
        { icon: '⚡', title: 'Instant Deploy', desc: 'Push to production in seconds. Automated pipelines that just work.' },
        { icon: '◈', title: 'Team Sync', desc: 'Real-time collaboration built in. Your whole team, one workflow.' },
        { icon: '∞', title: 'Auto Scale', desc: 'Handle any load. Infrastructure that grows with your user base.' },
      ],
      stats: [{ value: '10x', label: 'Faster Deploys' }, { value: '99.9%', label: 'Uptime' }, { value: '50k+', label: 'Teams' }, { value: '<50ms', label: 'Latency' }],
    };
  }

  if (/agency|studio|creative|design/.test(p)) {
    return {
      brand: 'STUDIO',
      headline: 'We Build\nDigital Worlds',
      sub: 'A creative studio crafting brands, websites, and digital experiences that inspire action and build legacies.',
      cta: 'See Our Work',
      nav: ['Work', 'Services', 'About'],
      features: [
        { icon: '◐', title: 'Brand Identity', desc: 'Visual systems that communicate your essence at a glance.' },
        { icon: '⟨⟩', title: 'Web & Digital', desc: 'Experiences that feel native to the web and native to humans.' },
        { icon: '✦', title: 'Strategy', desc: 'Ideas backed by research, intuition, and decades of pattern recognition.' },
      ],
      stats: [{ value: '200+', label: 'Brands Built' }, { value: '14yr', label: 'In Business' }, { value: '38', label: 'Awards Won' }, { value: '4', label: 'Continents' }],
    };
  }

  if (/restaurant|food|cafe|coffee|kitchen|dining|bistro/.test(p)) {
    return {
      brand: 'TASTE',
      headline: 'Food That\nTells a Story',
      sub: 'Locally sourced, expertly crafted, and served with intention. Every plate is a conversation.',
      cta: 'Reserve a Table',
      nav: ['Menu', 'About', 'Reserve'],
      features: [
        { icon: '◎', title: 'Seasonal Menu', desc: 'Ingredients chosen at peak flavor, changed with every season.' },
        { icon: '♦', title: 'Private Dining', desc: 'Exclusive spaces for intimate gatherings and celebrations.' },
        { icon: '∿', title: 'Wine Cellar', desc: 'A curated selection of over 300 natural and organic wines.' },
      ],
      stats: [{ value: '★4.9', label: 'Rating' }, { value: '12yr', label: 'Open' }, { value: '2', label: 'Michelin Stars' }, { value: '48', label: 'Covers' }],
    };
  }

  if (/music|band|artist|album|sound|record/.test(p)) {
    return {
      brand: 'SOUND',
      headline: 'Feel Every\nNote',
      sub: 'Original music that moves you somewhere new. New album available everywhere now.',
      cta: 'Listen Now',
      nav: ['Music', 'Tour', 'Contact'],
      features: [
        { icon: '♩', title: 'New Album', desc: 'Twelve tracks recorded live. Raw, honest, unforgettable.' },
        { icon: '◉', title: 'World Tour', desc: '28 cities. One summer. Be there when history happens.' },
        { icon: '∿', title: 'Merch', desc: 'Limited edition drops. Each piece designed by the artist.' },
      ],
      stats: [{ value: '2.4M', label: 'Monthly Listeners' }, { value: '12', label: 'Tracks' }, { value: '28', label: 'Tour Dates' }, { value: '3×', label: 'Platinum' }],
    };
  }

  if (/space|galaxy|cosmos|universe|astro|nasa|star/.test(p)) {
    return {
      brand: 'COSMOS',
      headline: 'Explore\nthe Universe',
      sub: 'Journey beyond the edge of the known. Navigate galaxies, nebulae, and the infinite depths of deep space.',
      cta: 'Begin Journey',
      nav: ['Explore', 'Missions', 'About'],
      features: [
        { icon: '◎', title: 'Deep Space Maps', desc: 'Charted galaxies rendered from real telescope data at 4K resolution.' },
        { icon: '✦', title: 'Live Missions', desc: 'Track active spacecraft and missions across the solar system in real time.' },
        { icon: '∞', title: 'Infinite Scale', desc: 'From sub-atomic to cosmic — explore every scale of the universe.' },
      ],
      stats: [{ value: '4.6B', label: 'Light Years' }, { value: '2T+', label: 'Galaxies Mapped' }, { value: '8', label: 'Active Missions' }, { value: '24/7', label: 'Live Data' }],
    };
  }

  if (/game|gaming|play|esport|rpg/.test(p)) {
    return {
      brand: 'PLAY',
      headline: 'Enter\nthe Game',
      sub: 'Immersive worlds, epic battles, and stories worth telling. Your adventure starts right now.',
      cta: 'Play Now',
      nav: ['Games', 'Community', 'Store'],
      features: [
        { icon: '◈', title: 'Open World', desc: 'A living, breathing world that evolves with every decision you make.' },
        { icon: '⚡', title: 'Multiplayer', desc: 'Team up or go head-to-head with players across the globe.' },
        { icon: '✦', title: 'Tournaments', desc: 'Compete in weekly events with real prizes and global rankings.' },
      ],
      stats: [{ value: '40M+', label: 'Players' }, { value: '120fps', label: 'Gameplay' }, { value: '6', label: 'Worlds' }, { value: '$2M', label: 'Prize Pool' }],
    };
  }

  if (/luxury|gold|elegant|jewelry|watch|haute|couture/.test(p)) {
    return {
      brand: 'LUMIÈRE',
      headline: 'Where Art Meets\nExcellence',
      sub: 'Crafted for the few who understand that true luxury is the mastery of every single detail.',
      cta: 'Discover More',
      nav: ['Collection', 'Artisans', 'Contact'],
      features: defaultFeatures,
      stats: [{ value: '1842', label: 'Est.' }, { value: 'Hand', label: 'Crafted' }, { value: '18k', label: 'Gold' }, { value: '∞', label: 'Warranty' }],
    };
  }

  // generic fallback
  const words = prompt.split(/\s+/).filter(w => w.length > 3);
  const titleWords = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  const headline = titleWords.length > 0 ? titleWords.join('\n') : 'Build the\nFuture';
  return {
    brand: 'LAYLA',
    headline: headline,
    sub: 'A stunning 3D experience built in seconds. Describe anything — Layla brings it to life.',
    cta: 'Get Started',
    nav: ['Home', 'Work', 'Contact'],
    features: defaultFeatures,
    stats: [{ value: '10x', label: 'Faster' }, { value: '∞', label: 'Possibilities' }, { value: '0', label: 'Code Written' }, { value: '100%', label: 'Yours' }],
  };
}

// ── Geometry + scene code ─────────────────────────────────

function getSceneCode(p: string, theme: Theme, layout: Layout): string {
  const isLight = theme.bg === '#f4f4f8';
  const camZ = layout === 'minimal-object' ? 10 : layout === 'hero-split' ? 18 : 22;

  // Particle stars
  const useStars = /space|galaxy|cosmos|star|universe|nebula/.test(p);
  const useParticles = /cyber|digital|data|matrix|code|tech/.test(p);
  const particleCode = useStars ? `
// Star field
const starGeo = new THREE.BufferGeometry();
const starCount = 1800;
const starPos = new Float32Array(starCount * 3);
for(let i=0;i<starCount*3;i++) starPos[i] = (Math.random()-0.5)*200;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color:0xffffff,size:0.14,transparent:true,opacity:0.8})));
` : useParticles ? `
// Data particles
const pGeo = new THREE.BufferGeometry();
const pCount = 1500;
const pPos = new Float32Array(pCount * 3);
for(let i=0;i<pCount*3;i++) pPos[i] = (Math.random()-0.5)*60;
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({color:'${theme.accent}',size:0.08,transparent:true,opacity:0.5})));
` : '';

  // Choose geometry mix based on keywords
  let geoLines: string;

  if (/space|galaxy|cosmos|star|universe|nebula/.test(p)) {
    // Planets + moons (spheres) + orbital rings
    geoLines = `
const geoFactories = [
  ()=> new THREE.SphereGeometry(0.4+Math.random()*0.9, 32, 32),
  ()=> new THREE.SphereGeometry(0.3+Math.random()*0.6, 24, 24),
  ()=> new THREE.DodecahedronGeometry(0.5+Math.random()*0.7, 0),
  ()=> new THREE.IcosahedronGeometry(0.4+Math.random()*0.6, 1),
];
`;
  } else if (/product|saas|tech|software|app|platform|startup/.test(p)) {
    geoLines = `
const geoFactories = [
  ()=> new THREE.TorusKnotGeometry(0.8, 0.28, 120, 16),
  ()=> new THREE.TorusKnotGeometry(0.6+Math.random()*0.3, 0.2+Math.random()*0.1, 100, 16),
  ()=> new THREE.IcosahedronGeometry(0.5+Math.random()*0.7, 1),
  ()=> new THREE.OctahedronGeometry(0.5+Math.random()*0.7, 0),
];
`;
  } else if (/luxury|gold|elegant|jewelry|watch/.test(p)) {
    geoLines = `
const geoFactories = [
  ()=> new THREE.TorusGeometry(0.8+Math.random()*0.5, 0.18+Math.random()*0.1, 16, 80),
  ()=> new THREE.TorusGeometry(0.6+Math.random()*0.4, 0.14, 16, 60),
  ()=> new THREE.OctahedronGeometry(0.5+Math.random()*0.6, 0),
  ()=> new THREE.IcosahedronGeometry(0.4+Math.random()*0.5, 1),
];
`;
  } else if (/neon|cyber|grid|hack|matrix/.test(p)) {
    geoLines = `
const geoFactories = [
  ()=> new THREE.BoxGeometry(0.7+Math.random()*0.8, 0.7+Math.random()*0.8, 0.7+Math.random()*0.8),
  ()=> new THREE.TetrahedronGeometry(0.6+Math.random()*0.7, 0),
  ()=> new THREE.OctahedronGeometry(0.5+Math.random()*0.7, 0),
  ()=> new THREE.BoxGeometry(0.5+Math.random()*0.6, 0.5+Math.random()*0.6, 0.5+Math.random()*0.6),
];
`;
  } else if (/minimal|clean|white/.test(p)) {
    geoLines = `
const geoFactories = [
  ()=> new THREE.IcosahedronGeometry(0.5+Math.random()*0.9, 1),
  ()=> new THREE.OctahedronGeometry(0.4+Math.random()*0.8, 0),
  ()=> new THREE.IcosahedronGeometry(0.3+Math.random()*0.5, 0),
  ()=> new THREE.DodecahedronGeometry(0.4+Math.random()*0.6, 0),
];
`;
  } else if (/nature|organic|forest|ocean|botanical/.test(p)) {
    geoLines = `
const geoFactories = [
  ()=> new THREE.SphereGeometry(0.4+Math.random()*0.8, 32, 32),
  ()=> new THREE.DodecahedronGeometry(0.5+Math.random()*0.8, 0),
  ()=> new THREE.IcosahedronGeometry(0.4+Math.random()*0.7, 1),
  ()=> new THREE.SphereGeometry(0.3+Math.random()*0.5, 24, 24),
];
`;
  } else if (/portfolio|creative|design|art/.test(p)) {
    geoLines = `
const geoFactories = [
  ()=> new THREE.IcosahedronGeometry(0.5+Math.random()*0.8, 1),
  ()=> new THREE.OctahedronGeometry(0.4+Math.random()*0.7, 0),
  ()=> new THREE.DodecahedronGeometry(0.5+Math.random()*0.7, 0),
  ()=> new THREE.TorusKnotGeometry(0.55+Math.random()*0.2, 0.18, 100, 16),
];
`;
  } else {
    // Default: impressive mix
    geoLines = `
const geoFactories = [
  ()=> new THREE.IcosahedronGeometry(0.5+Math.random()*0.8, 1),
  ()=> new THREE.TorusKnotGeometry(0.7+Math.random()*0.3, 0.22, 100, 16),
  ()=> new THREE.OctahedronGeometry(0.5+Math.random()*0.7, 0),
  ()=> new THREE.SphereGeometry(0.4+Math.random()*0.7, 32, 32),
];
`;
  }

  // Material strategy: mix standard + occasional glass
  const isNeon = /neon|cyber|grid|hack|matrix/.test(p);
  const isLuxury = /luxury|gold|elegant|jewelry|watch/.test(p);
  const isMinimal = /minimal|clean|white/.test(p);

  let materialCode: string;
  if (isNeon) {
    materialCode = `
  // Neon wireframe style
  const useWire = i % 3 === 0;
  let mat;
  if(useWire) {
    const edges = new THREE.EdgesGeometry(geo);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({color: COLORS[i%COLORS.length]}));
    line.position.set((Math.random()-.5)*30,(Math.random()-.5)*20,(Math.random()-.5)*14);
    line.rotation.set(Math.random()*6.28,Math.random()*6.28,Math.random()*6.28);
    line._rx=(Math.random()-.5)*.022; line._ry=(Math.random()-.5)*.022; line._rz=(Math.random()-.5)*.01;
    line._fs=Math.random()*.005+.003; line._fo=Math.random()*6.28;
    scene.add(line); meshes.push(line);
    continue;
  }
  mat = new THREE.MeshStandardMaterial({color:COLORS[i%COLORS.length],roughness:0.15,metalness:0.8,emissive:COLORS[i%COLORS.length],emissiveIntensity:0.15});
`;
  } else if (isLuxury) {
    materialCode = `
  const useGlass = i % 4 === 0;
  let mat;
  if(useGlass) {
    mat = new THREE.MeshPhysicalMaterial({color:COLORS[i%COLORS.length],metalness:0.1,roughness:0.05,transmission:0.85,transparent:true,ior:1.5});
  } else {
    mat = new THREE.MeshStandardMaterial({color:COLORS[i%COLORS.length],roughness:0.1,metalness:0.85});
  }
`;
  } else if (isMinimal) {
    materialCode = `
  const useNormal = i % 4 === 0;
  let mat;
  if(useNormal) {
    mat = new THREE.MeshNormalMaterial({transparent:true,opacity:0.85});
  } else {
    mat = new THREE.MeshStandardMaterial({color:COLORS[i%COLORS.length],roughness:${isLight ? 0.4 : 0.25},metalness:${isLight ? 0.3 : 0.6}});
  }
`;
  } else {
    materialCode = `
  const matType = i % 5;
  let mat;
  if(matType===0) {
    mat = new THREE.MeshPhysicalMaterial({color:COLORS[i%COLORS.length],metalness:0.15,roughness:0.08,transmission:0.8,transparent:true,ior:1.5});
  } else if(matType===1) {
    mat = new THREE.MeshNormalMaterial({transparent:true,opacity:0.9});
  } else {
    mat = new THREE.MeshStandardMaterial({color:COLORS[i%COLORS.length],roughness:${isLight ? 0.3 : 0.18},metalness:${isLight ? 0.4 : 0.72}});
  }
`;
  }

  const objCount = layout === 'minimal-object' ? 2 : 14;
  const spreadX = layout === 'hero-split' ? 18 : 30;
  const spreadY = layout === 'hero-split' ? 14 : 20;

  const parallaxCode = layout === 'minimal-object' ? `
  camera.position.x = Math.sin(t*0.12) * 5;
  camera.position.z = Math.cos(t*0.12) * 5 + ${camZ};
  camera.lookAt(0,0,0);
` : `
  camera.position.x += (mx*3 - camera.position.x) * 0.028;
  camera.position.y += (-my*2 - camera.position.y) * 0.028;
  camera.lookAt(0,0,0);
`;

  return `
const scene = new THREE.Scene();
scene.background = new THREE.Color('${theme.bg}');
const camera = new THREE.PerspectiveCamera(60, ${layout === 'hero-split' ? 'container.offsetWidth/container.offsetHeight' : 'innerWidth/innerHeight'}, 0.1, 300);
camera.position.z = ${camZ};
const renderer = new THREE.WebGLRenderer({canvas: document.getElementById('c'), antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
${layout === 'hero-split'
  ? `const container = document.getElementById('canvas-wrap');
renderer.setSize(container.offsetWidth, container.offsetHeight);`
  : `renderer.setSize(innerWidth, innerHeight);`}
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, ${isLight ? 1.1 : 0.45}));
const l1 = new THREE.PointLight('${theme.light1}', ${isLight ? 2 : 3.5}, 90);
l1.position.set(15, 10, 10); scene.add(l1);
const l2 = new THREE.PointLight('${theme.light2}', ${isLight ? 1.5 : 2.8}, 90);
l2.position.set(-12, -8, 8); scene.add(l2);
const l3 = new THREE.PointLight('${theme.light3}', ${isLight ? 1 : 2}, 70);
l3.position.set(0, 18, -8); scene.add(l3);
${particleCode}
// Objects
const COLORS = ${JSON.stringify(theme.colors)};
const meshes = [];
const COUNT = ${objCount};
${geoLines}
for(let i=0; i<COUNT; i++){
  const geo = geoFactories[i % geoFactories.length]();
${materialCode}
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(
    (Math.random()-.5)*${spreadX},
    (Math.random()-.5)*${spreadY},
    (Math.random()-.5)*14
  );
  ${layout === 'minimal-object' ? `mesh.position.set(0, 0, 0); mesh.scale.setScalar(2.2 + Math.random()*0.6);` : ''}
  mesh.rotation.set(Math.random()*6.28, Math.random()*6.28, Math.random()*6.28);
  mesh._rx=(Math.random()-.5)*${layout === 'minimal-object' ? 0.006 : 0.02};
  mesh._ry=(Math.random()-.5)*${layout === 'minimal-object' ? 0.006 : 0.02};
  mesh._rz=(Math.random()-.5)*0.008;
  mesh._fs=Math.random()*0.005+0.003;
  mesh._fo=Math.random()*6.28;
  scene.add(mesh); meshes.push(mesh);
}

// Resize
${layout === 'hero-split' ? `
new ResizeObserver(()=>{
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect=container.offsetWidth/container.offsetHeight;
  camera.updateProjectionMatrix();
}).observe(container);
window.addEventListener('resize',()=>{
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect=container.offsetWidth/container.offsetHeight;
  camera.updateProjectionMatrix();
});
` : `
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
});
`}

${layout !== 'minimal-object' ? `let mx=0,my=0;
document.addEventListener('mousemove',e=>{mx=(e.clientX/innerWidth-.5)*2;my=(e.clientY/innerHeight-.5)*2;});` : ''}

let t=0;
(function animate(){
  requestAnimationFrame(animate);
  t+=.008;
  meshes.forEach(m=>{
    m.rotation.x+=m._rx;
    m.rotation.y+=m._ry;
    m.rotation.z+=m._rz;
    m.position.y+=Math.sin(t+m._fo)*m._fs*0.1;
  });
${parallaxCode}
  renderer.render(scene,camera);
})();
`;
}

// ── CSS helpers ───────────────────────────────────────────

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ── Layout HTML builders ──────────────────────────────────

function buildHeroCenter(content: Content, theme: Theme, isLight: boolean): string {
  const textColor = isLight ? '#0a0a0a' : '#ffffff';
  const subColor  = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)';
  const navBg     = isLight ? 'rgba(244,244,248,0.75)' : `rgba(${hexToRgb(theme.bg)},0.5)`;
  const navBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const navLinks  = content.nav.map(n => `<li><a href="#">${n}</a></li>`).join('');

  return `<canvas id="c" style="position:fixed;inset:0;z-index:0;width:100%;height:100%"></canvas>
<nav>
  <div class="nav-logo">${content.brand}</div>
  <ul class="nav-links">${navLinks}</ul>
</nav>
<div class="hero">
  <h1>${content.headline.replace(/\n/g, '<br>')}</h1>
  <p>${content.sub}</p>
  <button class="hero-cta">${content.cta}</button>
</div>
<style>
body{background:${theme.bg};overflow:hidden;font-family:'${theme.font}',sans-serif}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:${navBg};border-bottom:1px solid ${navBorder};animation:fadeIn .6s ease both}
.nav-logo{font-size:17px;font-weight:700;color:${textColor};letter-spacing:2px}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{color:${subColor};text-decoration:none;font-size:13px;font-weight:500;letter-spacing:.4px;transition:color .2s}
.nav-links a:hover{color:${textColor}}
.hero{position:absolute;inset:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 24px}
.hero h1{font-size:clamp(52px,8vw,100px);font-weight:800;color:${textColor};line-height:1.02;letter-spacing:-3px;animation:fadeUp .8s ease both}
.hero p{margin-top:22px;font-size:18px;font-weight:300;color:${subColor};max-width:520px;line-height:1.65;animation:fadeUp .8s .15s ease both}
.hero-cta{margin-top:36px;padding:14px 42px;background:${theme.accent};color:#fff;border:none;border-radius:100px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:transform .2s,box-shadow .2s;animation:fadeUp .8s .3s ease both}
.hero-cta:hover{transform:scale(1.04);box-shadow:0 8px 32px ${theme.accent}55}
@keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
</style>`;
}

function buildHeroSplit(content: Content, theme: Theme, isLight: boolean): string {
  const textColor = isLight ? '#0a0a0a' : '#ffffff';
  const subColor  = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)';
  const navBg     = isLight ? 'rgba(244,244,248,0.75)' : `rgba(${hexToRgb(theme.bg)},0.5)`;
  const navBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const navLinks  = content.nav.map(n => `<li><a href="#">${n}</a></li>`).join('');
  const featureItems = content.features.map(f =>
    `<div class="feat-item"><span class="feat-icon">${f.icon}</span><div><strong>${f.title}</strong><span>${f.desc.split('.')[0]}.</span></div></div>`
  ).join('');

  return `<nav>
  <div class="nav-logo">${content.brand}</div>
  <ul class="nav-links">${navLinks}</ul>
</nav>
<div class="split-wrap">
  <div class="split-left">
    <div class="split-tag">New Release</div>
    <h1>${content.headline.replace(/\n/g, '<br>')}</h1>
    <p>${content.sub}</p>
    <button class="hero-cta">${content.cta}</button>
    <div class="feat-list">${featureItems}</div>
  </div>
  <div class="split-right" id="canvas-wrap">
    <canvas id="c"></canvas>
  </div>
</div>
<style>
body{background:${theme.bg};overflow:hidden;font-family:'${theme.font}',sans-serif}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:18px 48px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:${navBg};border-bottom:1px solid ${navBorder};animation:fadeIn .6s ease both}
.nav-logo{font-size:17px;font-weight:700;color:${textColor};letter-spacing:2px}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{color:${subColor};text-decoration:none;font-size:13px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:${textColor}}
.split-wrap{display:flex;height:100vh;padding-top:0}
.split-left{flex:1;display:flex;flex-direction:column;justify-content:center;padding:80px 56px 56px 72px;min-width:0}
.split-tag{font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${theme.accent};margin-bottom:20px;animation:fadeUp .6s ease both}
h1{font-size:clamp(40px,5.5vw,80px);font-weight:800;color:${textColor};line-height:1.02;letter-spacing:-2.5px;animation:fadeUp .7s .05s ease both}
p{margin-top:18px;font-size:17px;font-weight:300;color:${subColor};max-width:420px;line-height:1.65;animation:fadeUp .7s .1s ease both}
.hero-cta{margin-top:28px;align-self:flex-start;padding:13px 36px;background:${theme.accent};color:#fff;border:none;border-radius:100px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;transition:transform .2s,box-shadow .2s;animation:fadeUp .7s .18s ease both}
.hero-cta:hover{transform:scale(1.04);box-shadow:0 8px 28px ${theme.accent}55}
.feat-list{margin-top:36px;display:flex;flex-direction:column;gap:16px;animation:fadeUp .7s .28s ease both}
.feat-item{display:flex;align-items:flex-start;gap:14px}
.feat-icon{font-size:18px;line-height:1.4;opacity:0.9}
.feat-item strong{display:block;font-size:13px;font-weight:600;color:${textColor};margin-bottom:2px}
.feat-item span{font-size:12px;color:${subColor}}
.split-right{flex:1;padding:64px 40px 40px 20px;min-width:0}
#canvas-wrap{width:100%;height:100%;border-radius:24px;overflow:hidden;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)}
#c{width:100%;height:100%;display:block}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
</style>`;
}

function buildMinimalObject(content: Content, theme: Theme, isLight: boolean): string {
  const textColor = isLight ? '#0a0a0a' : '#ffffff';
  const subColor  = isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)';

  return `<canvas id="c" style="position:fixed;inset:0;z-index:0;width:100%;height:100%"></canvas>
<div class="minimal-text">
  <div class="brand-name">${content.brand}</div>
  <div class="brand-sub">${content.sub.split('.')[0]}</div>
  <button class="hero-cta">${content.cta}</button>
</div>
<style>
body{background:${theme.bg};overflow:hidden;font-family:'${theme.font}',sans-serif}
.minimal-text{position:fixed;bottom:12vh;left:0;right:0;z-index:10;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;animation:fadeIn 1.2s ease both}
.brand-name{font-size:clamp(28px,5vw,64px);font-weight:300;color:${textColor};letter-spacing:10px;text-transform:uppercase}
.brand-sub{font-size:14px;font-weight:300;color:${subColor};letter-spacing:4px;text-transform:uppercase;max-width:380px}
.hero-cta{margin-top:8px;padding:11px 34px;background:transparent;color:${textColor};border:1px solid rgba(255,255,255,0.25);border-radius:100px;font-size:12px;font-weight:500;font-family:inherit;letter-spacing:2px;text-transform:uppercase;cursor:pointer;transition:background .2s,border-color .2s}
.hero-cta:hover{background:${theme.accent};border-color:${theme.accent}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
</style>`;
}

function buildGridFeature(content: Content, theme: Theme, isLight: boolean): string {
  const textColor = isLight ? '#0a0a0a' : '#ffffff';
  const subColor  = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.65)';
  const navBg     = isLight ? 'rgba(244,244,248,0.75)' : `rgba(${hexToRgb(theme.bg)},0.5)`;
  const navBorder = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)';
  const navLinks  = content.nav.map(n => `<li><a href="#">${n}</a></li>`).join('');

  const cards = content.features.map(f => `
<div class="feat-card">
  <div class="feat-icon">${f.icon}</div>
  <h3>${f.title}</h3>
  <p>${f.desc}</p>
</div>`).join('');

  return `<canvas id="c" style="position:fixed;inset:0;z-index:0;width:100%;height:100%"></canvas>
<nav>
  <div class="nav-logo">${content.brand}</div>
  <ul class="nav-links">${navLinks}</ul>
</nav>
<div class="hero">
  <h1>${content.headline.replace(/\n/g, '<br>')}</h1>
  <p>${content.sub}</p>
  <button class="hero-cta">${content.cta}</button>
</div>
<div class="feat-grid">
${cards}
</div>
<style>
body{background:${theme.bg};overflow:hidden;font-family:'${theme.font}',sans-serif}
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);background:${navBg};border-bottom:1px solid ${navBorder};animation:fadeIn .6s ease both}
.nav-logo{font-size:17px;font-weight:700;color:${textColor};letter-spacing:2px}
.nav-links{display:flex;gap:28px;list-style:none}
.nav-links a{color:${subColor};text-decoration:none;font-size:13px;font-weight:500;transition:color .2s}
.nav-links a:hover{color:${textColor}}
.hero{position:absolute;top:0;left:0;right:0;z-index:10;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;text-align:center;padding:160px 24px 0}
.hero h1{font-size:clamp(44px,7vw,88px);font-weight:800;color:${textColor};line-height:1.02;letter-spacing:-2.5px;animation:fadeUp .8s ease both}
.hero p{margin-top:18px;font-size:17px;font-weight:300;color:${subColor};max-width:480px;line-height:1.65;animation:fadeUp .8s .12s ease both}
.hero-cta{margin-top:28px;padding:13px 38px;background:${theme.accent};color:#fff;border:none;border-radius:100px;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:transform .2s,box-shadow .2s;animation:fadeUp .8s .24s ease both}
.hero-cta:hover{transform:scale(1.04);box-shadow:0 8px 32px ${theme.accent}55}
.feat-grid{position:absolute;bottom:0;left:0;right:0;z-index:20;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:0 40px 32px}
.feat-card{background:rgba(255,255,255,0.06);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px 24px;animation:fadeUp .9s .35s ease both;transition:transform .3s,background .3s}
.feat-card:hover{background:rgba(255,255,255,0.1);transform:translateY(-4px)}
.feat-icon{font-size:22px;margin-bottom:12px}
.feat-card h3{font-size:15px;font-weight:600;color:${textColor};margin-bottom:8px}
.feat-card p{font-size:13px;color:${subColor};line-height:1.55}
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
</style>`;
}

// ── Main HTML builder ────────────────────────────────────

export function generateSite(prompt: string): string {
  const p = prompt.toLowerCase();
  const theme   = getTheme(p);
  const content = getContent(prompt);
  const layout  = getLayout(p);
  const isLight = theme.bg === '#f4f4f8';
  const sceneCode = getSceneCode(p, theme, layout);

  let bodyContent: string;
  switch (layout) {
    case 'hero-split':
      bodyContent = buildHeroSplit(content, theme, isLight);
      break;
    case 'minimal-object':
      bodyContent = buildMinimalObject(content, theme, isLight);
      break;
    case 'grid-feature':
      bodyContent = buildGridFeature(content, theme, isLight);
      break;
    default:
      bodyContent = buildHeroCenter(content, theme, isLight);
  }

  const badgeTextColor = isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.6)';
  const badgeBg        = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)';
  const badgeBorder    = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.15)';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${prompt.slice(0, 60)} — Built with Layla</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${theme.fontUrl}" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
</style>
</head>
<body>
${bodyContent}
<div id="badge" style="position:fixed;bottom:18px;right:18px;background:${badgeBg};border:1px solid ${badgeBorder};color:${badgeTextColor};font-size:11px;padding:6px 14px;border-radius:100px;font-family:'Courier New',monospace;letter-spacing:2px;pointer-events:none;z-index:999;backdrop-filter:blur(8px)">LAY<span style="color:#6c63ff">L</span>A ✦</div>
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script>
${sceneCode}
</script>
</body>
</html>`;
}
