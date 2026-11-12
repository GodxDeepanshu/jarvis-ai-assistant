/**
 * Aircraft Layer: OpenSky Network Live ADS-B Flight Tracking on 3D Earth.
 * Renders airborne commercial & cargo flights with heading orientation & telemetry.
 */
class AircraftLayer {
  constructor(globeScene, earthGroup, globeRadius, onSelectCallback) {
    this.scene = globeScene;
    this.earthGroup = earthGroup;
    this.globeRadius = globeRadius;
    this.onSelect = onSelectCallback;

    this.flights = [];
    this.flightMeshes = [];
    this.flightGroup = new THREE.Group();
    this.earthGroup.add(this.flightGroup);
    this.visible = true;
  }

  latLonAltToVector3(lat, lon, altM) {
    // Flight altitude: 10,000m (~10km) scaled to subtle clearance above surface
    const clearance = 0.8 + (altM / 15000.0) * 1.5;
    const r = this.globeRadius + clearance;

    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(r * Math.sin(phi) * Math.cos(theta));
    const z = r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  loadFlights(flightData) {
    this.flights = flightData;
    this.clearFlights();

    flightData.forEach((flight) => {
      const pos = this.latLonAltToVector3(flight.lat, flight.lon, flight.altitude_m);

      // Stylized chevron aircraft representation
      const planeGeo = new THREE.ConeGeometry(0.7, 1.8, 4);
      planeGeo.rotateX(Math.PI / 2);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0xffaa00, // Tactical Amber
      });
      const mesh = new THREE.Mesh(planeGeo, planeMat);
      mesh.position.copy(pos);
      mesh.lookAt(new THREE.Vector3(0, 0, 0));
      mesh.rotateZ(THREE.MathUtils.degToRad(-flight.heading_deg));

      mesh.userData = { flightData: flight };

      this.flightGroup.add(mesh);
      this.flightMeshes.push(mesh);
    });
  }

  clearFlights() {
    this.flightMeshes.forEach((m) => this.flightGroup.remove(m));
    this.flightMeshes = [];
  }

  toggleVisibility(show) {
    this.visible = show;
    this.flightGroup.visible = show;
  }
}
