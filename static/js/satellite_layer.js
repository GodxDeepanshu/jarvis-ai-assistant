/**
 * Satellite Layer: CelesTrak & SGP4 Orbital Objects on 3D Earth.
 * Manages category filtering, 3D orbits, NORAD inspection, and trajectory arcs.
 */
class SatelliteLayer {
  constructor(globeScene, earthGroup, globeRadius, onSelectCallback) {
    this.scene = globeScene;
    this.earthGroup = earthGroup;
    this.globeRadius = globeRadius;
    this.onSelect = onSelectCallback;

    this.satellites = [];
    this.activeCategory = "all";
    this.satGroup = new THREE.Group();
    this.earthGroup.add(this.satGroup);

    this.trajectoryLine = null;
    this.satMeshes = [];
    this.visible = true;

    this.categoryColors = {
      space_station: 0x00f0ff,     // Cyan
      navigation: 0xffd700,        // Gold
      earth_observation: 0x00ff88, // Emerald Green
      weather: 0x33bbff,           // Ice Blue
      communications: 0xff9900,    // Amber
      science: 0xff33bb,           // Magenta
    };
  }

  latLonAltToVector3(lat, lon, altKm) {
    // Earth radius is 6378 km -> scale to globeRadius = 100
    const scaledAlt = (altKm / 6378.0) * this.globeRadius;
    const r = this.globeRadius + Math.max(scaledAlt, 2.5);

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  loadSatellites(satData) {
    this.satellites = satData;
    this.clearSatellites();

    satData.forEach((sat) => {
      if (this.activeCategory !== "all" && sat.category !== this.activeCategory) {
        return;
      }

      const pos = this.latLonAltToVector3(sat.lat, sat.lon, sat.alt_km);
      const color = this.categoryColors[sat.category] || 0x00f0ff;

      // Satellite geometry
      const isStation = sat.category === "space_station";
      const size = isStation ? 1.8 : 0.9;
      const satGeo = isStation
        ? new THREE.BoxGeometry(size * 1.5, size * 0.8, size * 2.2)
        : new THREE.SphereGeometry(size, 8, 8);

      const satMat = new THREE.MeshBasicMaterial({ color: color });
      const mesh = new THREE.Mesh(satGeo, satMat);
      mesh.position.copy(pos);
      mesh.userData = { satData: sat };

      this.satGroup.add(mesh);
      this.satMeshes.push(mesh);
    });
  }

  clearSatellites() {
    this.satMeshes.forEach((m) => this.satGroup.remove(m));
    this.satMeshes = [];
  }

  setCategoryFilter(category) {
    this.activeCategory = category;
    this.loadSatellites(this.satellites);
  }

  toggleVisibility(show) {
    this.visible = show;
    this.satGroup.visible = show;
    if (this.trajectoryLine) {
      this.trajectoryLine.visible = show;
    }
  }

  renderTrajectory(arcPoints) {
    if (this.trajectoryLine) {
      this.earthGroup.remove(this.trajectoryLine);
      this.trajectoryLine = null;
    }

    if (!arcPoints || arcPoints.length < 2) return;

    const points = arcPoints.map((p) => this.latLonAltToVector3(p.lat, p.lon, p.alt_km));
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 100, 0.35, 6, false);
    const material = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75,
    });

    this.trajectoryLine = new THREE.Mesh(geometry, material);
    this.earthGroup.add(this.trajectoryLine);
  }
}
