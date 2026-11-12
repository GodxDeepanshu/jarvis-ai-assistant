/**
 * News Intelligence Layer: Geographically Anchored Events & Investigation Mode.
 * Visualizes global events with category-colored tactical beacons on 3D Earth.
 */
class NewsIntelligenceLayer {
  constructor(globeScene, earthGroup, globeRadius, onSelectCallback) {
    this.scene = globeScene;
    this.earthGroup = earthGroup;
    this.globeRadius = globeRadius;
    this.onSelect = onSelectCallback;

    this.events = [];
    this.eventMeshes = [];
    this.newsGroup = new THREE.Group();
    this.earthGroup.add(this.newsGroup);
    this.visible = true;

    this.categoryColors = {
      science_space: 0x00f0ff,
      artificial_intelligence: 0x00ff88,
      defense_aerospace: 0xff3344,
      climate_environment: 0x33bbff,
      world_affairs: 0xffaa00,
    };
  }

  latLonToVector3(lat, lon) {
    const r = this.globeRadius + 1.2;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  loadEvents(eventData) {
    this.events = eventData;
    this.clearEvents();

    eventData.forEach((ev) => {
      const pos = this.latLonToVector3(ev.lat, ev.lon);
      const color = this.categoryColors[ev.category] || 0x00f0ff;

      // Event central marker
      const pinGeo = new THREE.SphereGeometry(1.4, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color: color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);

      // Event radiating pulse ring
      const ringGeo = new THREE.RingGeometry(2.0, 3.2, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(new THREE.Vector3(0, 0, 0));

      const group = new THREE.Group();
      group.add(pinMesh);
      group.add(ringMesh);
      group.userData = { eventData: ev };

      this.newsGroup.add(group);
      this.eventMeshes.push(group);
    });
  }

  clearEvents() {
    this.eventMeshes.forEach((m) => this.newsGroup.remove(m));
    this.eventMeshes = [];
  }

  animatePulse() {
    const pulse = 1.0 + 0.35 * Math.sin(Date.now() * 0.008);
    this.eventMeshes.forEach((em) => {
      em.children[1].scale.set(pulse, pulse, pulse);
    });
  }

  toggleVisibility(show) {
    this.visible = show;
    this.newsGroup.visible = show;
  }
}
