/**
 * Globe Core Engine: Photorealistic 4K Earth, Atmosphere, Starfield & Multi-Layer Raycasting.
 * Incorporates Anisotropic Texture Filtering and Atmospheric Shading.
 */
class StarkGlobeCore {
  constructor(containerId, onSelectObjectCallback) {
    this.container = document.getElementById(containerId);
    this.onSelectObject = onSelectObjectCallback;
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

    this.satelliteLayer = null;
    this.aircraftLayer = null;
    this.newsLayer = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3500);
    this.camera.position.z = 280;

    // 2. Renderer with High-DPI support
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setClearColor(0x000000, 0); // Transparent to show white gold background
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.container.appendChild(this.renderer.domElement);

    // 3. Space Starfield Background
    this.createStarfield();

    // 4. Photorealistic Directional & Ambient Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.35);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(380, 200, 260);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.75);
    rimLight.position.set(-350, -120, -250);
    this.scene.add(rimLight);

    // 5. Earth Root Group
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);

    // 6. 4K Earth Core with Maximum Anisotropic Texture Filtering
    const maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const textureLoader = new THREE.TextureLoader();

    const dayTexture = textureLoader.load("/static/textures/earth_day.jpg");
    dayTexture.anisotropy = maxAnisotropy;
    dayTexture.generateMipmaps = true;
    dayTexture.minFilter = THREE.LinearMipmapLinearFilter;
    dayTexture.magFilter = THREE.LinearFilter;
    dayTexture.wrapS = THREE.ClampToEdgeWrapping;
    dayTexture.wrapT = THREE.ClampToEdgeWrapping;

    const earthGeo = new THREE.SphereGeometry(this.globeRadius, 96, 96);
    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      roughness: 0.62,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(earthMesh);

    // 7. Revolving Clouds Sphere
    const cloudTexture = textureLoader.load("/static/textures/earth_clouds.png");
    cloudTexture.anisotropy = maxAnisotropy;
    const cloudGeo = new THREE.SphereGeometry(this.globeRadius + 1.2, 80, 80);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
    });
    this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.earthGroup.add(this.cloudsMesh);

    // 8. Atmospheric Cyan Halo Shell
    const glowGeo = new THREE.SphereGeometry(this.globeRadius + 3.8, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00c8ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.earthGroup.add(glowMesh);

    // 9. Attach Satellite, Aircraft, and News Layers
    this.satelliteLayer = new SatelliteLayer(this.scene, this.earthGroup, this.globeRadius, this.onSelectObject);
    this.aircraftLayer = new AircraftLayer(this.scene, this.earthGroup, this.globeRadius, this.onSelectObject);
    this.newsLayer = new NewsIntelligenceLayer(this.scene, this.earthGroup, this.globeRadius, this.onSelectObject);

    // 10. Setup User Interaction
    this.setupEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createStarfield() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2400;
      positions[i + 1] = (Math.random() - 0.5) * 2400;
      positions[i + 2] = (Math.random() - 0.5) * 2400;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x90c0e0, size: 1.2, transparent: true, opacity: 0.75 });
    const starField = new THREE.Points(starGeo, starMat);
    this.scene.add(starField);
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

    // Multi-Layer Object Raycaster Click
    el.addEventListener("click", () => {
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // 1. Check Aircraft (realistic 3D jetliners)
      if (this.aircraftLayer && this.aircraftLayer.visible) {
        const planeHits = this.raycaster.intersectObjects(this.aircraftLayer.flightMeshes, true);
        if (planeHits.length > 0) {
          const hit = this.findParentUserData(planeHits[0].object);
          if (hit && hit.flightData) {
            this.onSelectObject("aircraft", hit.flightData);
            return;
          }
        }
      }

      // 2. Check News Markers
      if (this.newsLayer && this.newsLayer.visible) {
        const newsHits = this.raycaster.intersectObjects(this.newsLayer.eventMeshes, true);
        if (newsHits.length > 0) {
          const hit = this.findParentUserData(newsHits[0].object);
          if (hit && hit.eventData) {
            this.onSelectObject("news", hit.eventData);
            return;
          }
        }
      }

      // 3. Check Satellites
      if (this.satelliteLayer && this.satelliteLayer.visible) {
        const satHits = this.raycaster.intersectObjects(this.satelliteLayer.satMeshes, true);
        if (satHits.length > 0) {
          const hit = this.findParentUserData(satHits[0].object);
          if (hit && hit.satData) {
            this.onSelectObject("satellite", hit.satData);
            return;
          }
        }
      }
    });

    // Smooth Mouse Wheel Zoom
    el.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.camera.position.z = THREE.MathUtils.clamp(
        this.camera.position.z + e.deltaY * 0.12,
        130,
        500
      );
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

  findParentUserData(obj) {
    let curr = obj;
    while (curr) {
      if (curr.userData && Object.keys(curr.userData).length > 0) {
        return curr.userData;
      }
      curr = curr.parent;
    }
    return null;
  }

  flyToCoordinates(lat, lon, zoomLevel = 210) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const targetY = -theta + Math.PI / 2;
    const targetX = phi - Math.PI / 2;

    this.earthGroup.rotation.y = targetY;
    this.earthGroup.rotation.x = targetX;
    this.camera.position.z = zoomLevel;
  }

  animate() {
    requestAnimationFrame(this.animate);

    if (!this.isDragging) {
      this.earthGroup.rotation.y += 0.001;
    }

    if (this.cloudsMesh) {
      this.cloudsMesh.rotation.y += 0.0003;
    }

    if (this.newsLayer) {
      this.newsLayer.animatePulse();
    }

    this.renderer.render(this.scene, this.camera);
  }
}
