import * as THREE from 'three';

interface FloatingSphere extends THREE.Mesh {
  _speed: number;
  _offset: number;
}

export class LaylaScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private mesh: THREE.Mesh;
  private wireMesh: THREE.Mesh;
  private spheres: FloatingSphere[] = [];
  private t: number = 0;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    // Torus knot
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.38, 128, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0x6c63ff, roughness: 0.3, metalness: 0.6 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(3.2, 0, 0);
    this.scene.add(this.mesh);

    // Wireframe overlay
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x9d97ff, wireframe: true, transparent: true, opacity: 0.15 });
    this.wireMesh = new THREE.Mesh(geometry, wireMat);
    this.wireMesh.position.set(3.2, 0, 0);
    this.scene.add(this.wireMesh);

    // Floating spheres
    const sphereGeo = new THREE.SphereGeometry(0.08, 16, 16);
    for (let i = 0; i < 12; i++) {
      const s = new THREE.Mesh(
        sphereGeo,
        new THREE.MeshStandardMaterial({ color: 0x6c63ff, roughness: 0.4, metalness: 0.5 })
      ) as unknown as FloatingSphere;
      s.position.set(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 3
      );
      s._speed = Math.random() * 0.005 + 0.002;
      s._offset = Math.random() * Math.PI * 2;
      this.scene.add(s);
      this.spheres.push(s);
    }

    // Lights
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dl1 = new THREE.DirectionalLight(0x6c63ff, 1.5);
    dl1.position.set(5, 5, 5);
    this.scene.add(dl1);
    const dl2 = new THREE.DirectionalLight(0xffffff, 0.8);
    dl2.position.set(-5, -3, 2);
    this.scene.add(dl2);

    this.bindEvents();
    this.animate();
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    this.t += 0.008;

    this.mesh.rotation.x += 0.004;
    this.mesh.rotation.y += 0.007;
    this.mesh.position.y = Math.sin(this.t) * 0.18;

    this.wireMesh.rotation.x = this.mesh.rotation.x;
    this.wireMesh.rotation.y = this.mesh.rotation.y;
    this.wireMesh.position.y = this.mesh.position.y;

    this.spheres.forEach(s => {
      s.position.y += Math.sin(this.t + s._offset) * s._speed;
      s.position.x += Math.cos(this.t * 0.5 + s._offset) * s._speed * 0.5;
    });

    this.renderer.render(this.scene, this.camera);
  }

  private bindEvents(): void {
    window.addEventListener('resize', () => this.onResize());
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private onMouseMove(e: MouseEvent): void {
    const x = (e.clientX / window.innerWidth - 0.5) * 0.4;
    const y = (e.clientY / window.innerHeight - 0.5) * 0.4;
    this.mesh.rotation.x += (-y - this.mesh.rotation.x) * 0.02;
    this.mesh.rotation.y += (x - this.mesh.rotation.y) * 0.02;
  }

  show(): void { this.canvas.style.display = 'block'; }
  hide(): void { this.canvas.style.display = 'none'; }
}
