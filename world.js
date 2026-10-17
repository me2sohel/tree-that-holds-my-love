import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js";

export class GardenWorld {
  constructor(canvas, onObjectTap) {
    this.canvas = canvas;
    this.onObjectTap = onObjectTap;
    this.clock = new THREE.Clock();
    this.interactives = [];
    this.petals = [];
    this.blossoms = [];
    this.isNight = false;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#806076");
    this.scene.fog = new THREE.Fog("#806076", 17, 54);

    this.camera = new THREE.PerspectiveCamera(48, innerWidth / innerHeight, 0.1, 100);
    this.camera.position.set(0, 4.5, 13);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.055;
    this.controls.target.set(0, 3.3, 0);
    this.controls.minDistance = 5.5;
    this.controls.maxDistance = 19;
    this.controls.minPolarAngle = 0.35;
    this.controls.maxPolarAngle = Math.PI * 0.48;
    this.controls.enablePan = false;

    this.makeLights();
    this.makeGround();
    this.makeHills();
    this.makeTree();
    this.makeFireflies();
    this.makePetal();
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();
    this.down = null;
    this.bindPointer();
    this.resize = this.resize.bind(this);
    addEventListener("resize", this.resize);
    this.animate();
  }

  makeLights() {
    this.ambient = new THREE.HemisphereLight("#ffe5f0", "#3e493c", 2.1);
    this.scene.add(this.ambient);
    this.sun = new THREE.DirectionalLight("#ffe0e8", 3.0);
    this.sun.position.set(-5, 11, 7);
    this.scene.add(this.sun);
    this.rim = new THREE.PointLight("#ed8bb7", 1.7, 20);
    this.rim.position.set(2, 6, -2);
    this.scene.add(this.rim);
  }

  makeGround() {
    const groundGeo = new THREE.PlaneGeometry(100, 100, 1, 1);
    const groundMat = new THREE.MeshStandardMaterial({ color: "#62765b", roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.05;
    this.scene.add(ground);

    const meadowGeo = new THREE.CircleGeometry(15, 80);
    const meadowMat = new THREE.MeshStandardMaterial({ color: "#7d8b69", roughness: 1 });
    const meadow = new THREE.Mesh(meadowGeo, meadowMat);
    meadow.rotation.x = -Math.PI / 2;
    meadow.position.y = -0.015;
    this.scene.add(meadow);
  }

  makeHills() {
    const mat = new THREE.MeshStandardMaterial({ color: "#665067", roughness: 1 });
    for (let i = 0; i < 9; i++) {
      const radius = 4 + (i % 3) * 2;
      const hill = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 12), mat);
      const angle = i / 9 * Math.PI * 2;
      hill.scale.y = 0.55;
      hill.position.set(Math.cos(angle) * 24, -1.7, Math.sin(angle) * 24 - 3);
      this.scene.add(hill);
    }
  }

  makeTree() {
    const trunkMat = new THREE.MeshStandardMaterial({ color: "#594036", roughness: 0.92 });
    const barkLight = new THREE.MeshStandardMaterial({ color: "#755244", roughness: 1 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.85, 5.6, 12, 5), trunkMat);
    trunk.position.set(0, 2.8, 0);
    trunk.rotation.z = -0.06;
    this.scene.add(trunk);

    // Thick branches create a recognisable spreading canopy.
    for (let i = 0; i < 7; i++) {
      const angle = i * Math.PI * 2 / 7;
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.25, 4.5, 8), barkLight);
      branch.position.set(Math.cos(angle) * 1.45, 4.65 + (i % 3) * 0.35, Math.sin(angle) * 1.25);
      branch.rotation.z = Math.cos(angle) * 0.8;
      branch.rotation.x = Math.sin(angle) * 0.55;
      this.scene.add(branch);
    }

    const canopyMat = new THREE.MeshStandardMaterial({ color: "#c96891", roughness: 0.85, transparent: true, opacity: 0.93 });
    const canopyLight = new THREE.MeshStandardMaterial({ color: "#e48eae", roughness: 0.8, transparent: true, opacity: 0.9 });
    // Overlapping organic masses create the dense pink canopy silhouette.
    for (let i = 0; i < 34; i++) {
      const angle = i * 2.39996;
      const ring = 2.2 + (i % 5) * 0.53;
      const y = 5.8 + Math.sin(i * 1.7) * 1.35 + (i % 4) * 0.18;
      const size = 1.45 + (i % 4) * 0.22;
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), i % 3 ? canopyMat : canopyLight);
      puff.position.set(Math.cos(angle) * ring, y, Math.sin(angle) * ring * 0.72);
      puff.scale.set(1.05, 0.76, 0.95);
      this.scene.add(puff);
    }

    // Three highlighted blossoms are genuine clickable 3D objects.
    const blossomPositions = [
      [-2.5, 7.0, 1.6], [2.45, 7.6, 0.7], [0.8, 6.2, 2.45]
    ];
    blossomPositions.forEach((p, i) => {
      const group = new THREE.Group();
      group.position.set(...p);
      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 16, 12),
        new THREE.MeshBasicMaterial({ color: i === 1 ? "#fff0f6" : "#ffb8d3" })
      );
      group.add(glow);
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 12, 8),
        new THREE.MeshBasicMaterial({ color: "#f48db8", transparent: true, opacity: 0.18, depthWrite: false })
      );
      group.add(halo);
      this.scene.add(group);
      group.userData = { id: `blossom_0${i + 1}`, type: "blossom", halo, glow, baseY: p[1], index: i };
      this.blossoms.push(group);
      this.interactives.push(group);
    });

    // Tiny symbolic silhouette beneath the tree.
    const figureMat = new THREE.MeshStandardMaterial({ color: "#49313d", roughness: 1 });
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.55, 4, 7), figureMat);
    body.position.set(-1.45, 0.58, 1.8);
    this.scene.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), figureMat);
    head.position.set(-1.45, 1.08, 1.8);
    this.scene.add(head);

    // Small grass-like strokes around the tree base.
    const grassMat = new THREE.MeshStandardMaterial({ color: "#9aa078", roughness: 1 });
    for (let i = 0; i < 80; i++) {
      const a = i * 2.4;
      const r = 2.1 + (i % 9) * 0.15;
      const blade = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.35 + (i % 4) * 0.05, 4), grassMat);
      blade.position.set(Math.cos(a) * r, 0.12, Math.sin(a) * r);
      blade.rotation.z = Math.sin(a) * 0.25;
      this.scene.add(blade);
    }
  }

  makeFireflies() {
    const geo = new THREE.SphereGeometry(0.045, 6, 6);
    const mat = new THREE.MeshBasicMaterial({ color: "#ffe4a6" });
    for (let i = 0; i < 30; i++) {
      const dot = new THREE.Mesh(geo, mat);
      dot.position.set((Math.random() - .5) * 18, 0.4 + Math.random() * 5, (Math.random() - .5) * 15);
      dot.userData.phase = Math.random() * Math.PI * 2;
      this.scene.add(dot);
      this.petals.push(dot);
    }
  }

  makePetal() {
    const petalGeo = new THREE.SphereGeometry(0.14, 8, 6);
    petalGeo.scale(1.5, 0.35, 0.9);
    const petal = new THREE.Mesh(petalGeo, new THREE.MeshBasicMaterial({ color: "#ffd0e1" }));
    petal.position.set(3.2, 2.0, 2.2);
    petal.userData = { id: "petal_01", type: "petal", baseY: 2, phase: 0 };
    this.scene.add(petal);
    this.interactives.push(petal);
    this.floatingPetal = petal;
  }

  bindPointer() {
    this.canvas.addEventListener("pointerdown", e => { this.down = { x: e.clientX, y: e.clientY, t: performance.now() }; });
    this.canvas.addEventListener("pointerup", e => {
      if (!this.down) return;
      const distance = Math.hypot(e.clientX - this.down.x, e.clientY - this.down.y);
      const duration = performance.now() - this.down.t;
      this.down = null;
      if (distance > 9 || duration > 700) return;
      const rect = this.canvas.getBoundingClientRect();
      this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);
      const hits = this.raycaster.intersectObjects(this.interactives, true);
      if (!hits.length) return;
      let obj = hits[0].object;
      while (obj && !obj.userData.id) obj = obj.parent;
      if (obj?.userData?.id) this.onObjectTap(obj.userData);
    });
  }

  focusObject(id) {
    const obj = this.interactives.find(o => o.userData.id === id);
    if (!obj) return;
    const target = obj.position.clone();
    const direction = this.camera.position.clone().sub(this.controls.target).normalize();
    const destination = target.clone().add(direction.multiplyScalar(3.8));
    this.animateCamera(destination, target, 950);
  }

  animateCamera(position, target, duration = 1000) {
    this.controls.enabled = false;
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const start = performance.now();
    const ease = t => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
    const tick = now => {
      const t = Math.min(1, (now - start) / duration);
      const e = ease(t);
      this.camera.position.lerpVectors(startPos, position, e);
      this.controls.target.lerpVectors(startTarget, target, e);
      if (t < 1) requestAnimationFrame(tick);
      else this.controls.enabled = true;
    };
    requestAnimationFrame(tick);
  }

  setNight() {
    if (this.isNight) return;
    this.isNight = true;
    this.scene.background = new THREE.Color("#24263f");
    this.scene.fog.color.set("#24263f");
    this.scene.fog.near = 12;
    this.scene.fog.far = 44;
    this.ambient.color.set("#b5b8f3");
    this.ambient.groundColor.set("#26273b");
    this.ambient.intensity = 1.25;
    this.sun.color.set("#b8a8e8");
    this.sun.intensity = 1.15;
    this.rim.color.set("#f08ebd");
    this.rim.intensity = 2.7;
    this.blossoms.forEach(b => b.userData.glow.material.color.set("#fff0f8"));
  }

  resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.7));
    this.renderer.setSize(innerWidth, innerHeight);
  }

  animate() {
    this.frame = requestAnimationFrame(() => this.animate());
    const t = this.clock.getElapsedTime();
    this.blossoms.forEach((b, i) => {
      b.position.y = b.userData.baseY + Math.sin(t * 1.2 + i) * 0.08;
      b.rotation.y = Math.sin(t * .7 + i) * .14;
      b.userData.halo.scale.setScalar(1 + (Math.sin(t * 2.1 + i) + 1) * .12);
    });
    if (this.floatingPetal) {
      this.floatingPetal.position.y = 2 + Math.sin(t * 1.1) * .28;
      this.floatingPetal.position.x = 3.2 + Math.sin(t * .5) * .45;
      this.floatingPetal.rotation.y = t * .65;
      this.floatingPetal.rotation.z = Math.sin(t) * .4;
    }
    this.petals.forEach(dot => {
      dot.position.y += Math.sin(t * 1.3 + dot.userData.phase) * .0018;
      dot.material.opacity = .4 + (Math.sin(t * 2 + dot.userData.phase) + 1) * .25;
    });
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    removeEventListener("resize", this.resize);
    this.controls.dispose();
    this.renderer.dispose();
  }
}
