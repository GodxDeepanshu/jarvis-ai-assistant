/**
 * Globe Core Engine: Photorealistic 4K Earth, Atmosphere, Starfield & Multi-Layer Raycasting.
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
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 3000);
    this.camera.position.z = 280;

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 3. Space Starfield Background
    this.createStarfield();

    // 4. Photorealistic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(350, 180, 250);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f0ff, 0.9);
    rimLight.position.set(-350, -120, -250);
    this.scene.add(rimLight);

    // 5. Earth Root Group
    this.earthGroup = new THREE.Group();
    this.scene.add(this.earthGroup);

    // 6. 4K NASA Blue Marble Earth Sphere
    const textureLoader = new THREE.TextureLoader();
    const earthGeo = new THREE.SphereGeometry(this.globeRadius, 64, 64);
    const dayTexture = textureLoader.load("/static/textures/earth_day.jpg");
    dayTexture.wrapS = THREE.ClampToEdgeWrapping;
    dayTexture.wrapT = THREE.ClampToEdgeWrapping;

    const earthMat = new THREE.MeshStandardMaterial({
      map: dayTexture,
      roughness: 0.65,
      metalness: 0.08,
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    this.earthGroup.add(earthMesh);

    // 7. Revolving Clouds Sphere
    const cloudGeo = new THREE.SphereGeometry(this.globeRadius + 1.2, 64, 64);
    const cloudTexture = textureLoader.load("/static/textures/earth_clouds.png");
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    this.cloudsMesh = new THREE.Mesh(cloudGeo, cloudMat);
    this.earthGroup.add(this.cloudsMesh);

    // 8. Atmospheric Halo Shell
    const glowGeo = new THREE.SphereGeometry(this.globeRadius + 3.8, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x00c8ff,
      transparent: true,
      opacity: 0.16,
      side: THREE.BackSide,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.earthGroup.add(glowMesh);

    // 9. Attach Layers
    this.satelliteLayer = new SatelliteLayer(this.scene, this.earthGroup, this.globeRadius, this.onSelectObject);
    this.aircraftLayer = new AircraftLayer(this.scene, this.earthGroup, this.globeRadius, this.onSelectObject);
    this.newsLayer = new NewsIntelligenceLayer(this.scene, this.earthGroup, this.globeRadius, this.onSelectObject);

    // 10. Event Listeners
    this.setupEvents();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  createStarfield() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2200;
      positions[i + 1] = (Math.random() - 0.5) * 2200;
      positions[i + 2] = (Math.random() - 0.5) * 2200;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x88bbdd, size: 1.2, transparent: true, opacity: 0.7 });
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

      // Check news markers
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

      // Check satellites
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

      // Check aircraft
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
    });

    // Mouse Wheel Zoom
    el.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.camera.position.z = THREE.MathUtils.clamp(
        this.camera.position.z + e.deltaY * 0.12,
        135,
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

  flyToCoordinates(lat, lon, zoomLevel = 220) {
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
