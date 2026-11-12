/**
 * Three.js 4K Photorealistic Earth Globe Visualizer with Atmospheric Clouds & City Beacons.
 * Renders NASA Blue Marble Earth textures, cloud layers, and interactive city targets.
 */
class PlanetaryGlobeVisualizer {
  constructor(containerId, onCitySelectCallback) {
    this.container = document.getElementById(containerId);
    this.onCitySelect = onCitySelectCallback;
    this.cities = [];
    this.cityMeshes = [];
    this.globeRadius = 100;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.earthGroup = null;
    this.cloudsMesh = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2500);
    this.camera.position.z = 270;

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(300, 150, 250);
    this.scene.add(sunLight);

    const backRimLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
    backRimLight.position.set(-300, -100, -200);
    this.scene.add(backRimLight);

    // 4. Earth Group
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);

    // 5. Texture Loader
    const textureLoader = new THREE.TextureLoader();

    // 6. Photorealistic 4K Earth Core Mesh
    const earthGeo = new THREE.SphereGeometry(this.globeRadius, 64, 64);
    
    // Load Day texture
    const dayTexture = textureLoader.load(
      "/static/textures/earth_day.jpg",
      () => this.renderer.render(this.scene, this.camera)
    );
    dayTexture.wrapS = THREE.ClampToEdgeWrapping;
    dayTexture.wrapT = THREE.ClampToEdgeWrapping;

    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      roughness: 0.65,
      metalness: 0.1,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(earthMesh);

    // 7. Revolving Atmospheric Clouds Sphere
    const cloudGeo = new THREE.SphereGeometry(this.globeRadius + 1.2, 64, 64);
    const cloudTexture = textureLoader.load(
      "/static/textures/earth_clouds.png",
      () => this.renderer.render(this.scene, this.camera)
    );
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.earthGroup.add(this.cloudsMesh);

    // 8. Glowing Atmospheric Halo Shell
    const glowGeo = new THREE.SphereGeometry(this.globeRadius + 3.8, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00c8ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.earthGroup.add(glowMesh);

    // 9. Holographic Orbital Ring
    const ringGeo = new THREE.RingGeometry(this.globeRadius + 22, this.globeRadius + 23.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 3;
    this.earthGroup.add(ringMesh);

    // 10. Setup Events & Start Loop
    this.setupEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupEvents() {
    const el = this.renderer.domElement;

    el.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / el.clientWidth) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / el.clientHeight) * 2 + 1;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.earthGroup.rotation.y += deltaX * 0.005;
        this.earthGroup.rotation.x += deltaY * 0.005;

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    el.addEventListener("click", () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(this.cityMeshes, true);

      if (intersects.length > 0) {
        let selectedObj = intersects[0].object;
        while (selectedObj && !selectedObj.userData.cityData && selectedObj.parent) {
          selectedObj = selectedObj.parent;
        }
        if (selectedObj && selectedObj.userData.cityData) {
          if (this.onCitySelect) {
            this.onCitySelect(selectedObj.userData.cityData);
          }
        }
      }
    });

    window.addEventListener("resize", () => {
      if (!this.container) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  latLonToVector3(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  loadCities(citiesData) {
    this.cities = citiesData;

    this.cityMeshes.forEach((m) => this.earthGroup.remove(m));
    this.cityMeshes = [];

    citiesData.forEach((city) => {
      const pos = this.latLonToVector3(city.lat, city.lon, this.globeRadius + 1.8);

      // 1. Center pulsing beacon dot
      const beaconGeo = new THREE.SphereGeometry(1.6, 16, 16);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
      });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      beaconMesh.position.copy(pos);

      // 2. Targeting concentric reticle ring
      const ringGeo = new THREE.RingGeometry(2.4, 3.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      const cityGroup = new THREE.Group();
      cityGroup.add(beaconMesh);
      cityGroup.add(ringMesh);
      cityGroup.userData = { cityData: city, basePos: pos };

      this.earthGroup.add(cityGroup);
      this.cityMeshes.push(cityGroup);
    });
  }

  focusCity(cityData) {
    const phi = (90 - cityData.lat) * (Math.PI / 180);
    const theta = (cityData.lon + 180) * (Math.PI / 180);

    const targetY = -theta + Math.PI / 2;
    const targetX = phi - Math.PI / 2;

    this.earthGroup.rotation.y = targetY;
    this.earthGroup.rotation.x = targetX;
  }

  animate() {
    requestAnimationFrame(this.animate);

    // Auto rotate earth slowly
    if (!this.isDragging) {
      this.earthGroup.rotation.y += 0.0012;
    }

    // Clouds rotate independently
    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += 0.0004;
    }

    // Pulse city beacons
    const pulseScale = 1.0 + 0.3 * Math.sin(Date.now() * 0.007);
    this.cityMeshes.forEach((cm) => {
      cm.children[1].scale.set(pulseScale, pulseScale, pulseScale);
    });

    this.renderer.render(this.scene, this.camera);
  }
}
