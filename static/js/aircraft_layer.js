/**
 * Aircraft Layer: High-Fidelity 3D Jet Aircraft with Twin Engines, Swept Wings & Altitude Vectors.
 * Replaces cartoon markers with authentic commercial/tactical jetliner geometry & navigation strobes.
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

    // Cache the realistic 3D jet geometry
    this.jetGeometry = this.buildRealisticJetGeometry();
    this.jetMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0f6fc,
      metalness: 0.85,
      roughness: 0.2,
    });

    this.engineMaterial = new THREE.MeshStandardMaterial({
      color: 0x334455,
      metalness: 0.9,
      roughness: 0.3,
    });
  }

  buildRealisticJetGeometry() {
    // Composite geometry for an authentic twin-engine jet airliner
    const planeGroup = new THREE.Group();

    // 1. Fuselage (Stretched sleek cylinder + nose cone)
    const bodyGeo = new THREE.CylinderGeometry(0.22, 0.16, 2.8, 14);
    bodyGeo.rotateX(Math.PI / 2);
    const bodyMesh = new THREE.Mesh(bodyGeo);
    bodyMesh.position.z = 0;

    const noseGeo = new THREE.ConeGeometry(0.22, 0.7, 14);
    noseGeo.rotateX(Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo);
    noseMesh.position.z = 1.75;

    // 2. Swept Main Wings with Winglets
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0, 0.3);
    wingShape.lineTo(1.8, -0.6);   // Starboard wing tip
    wingShape.lineTo(1.8, -0.8);
    wingShape.lineTo(0.3, -0.4);
    wingShape.lineTo(-0.3, -0.4);
    wingShape.lineTo(-1.8, -0.8);  // Port wing tip
    wingShape.lineTo(-1.8, -0.6);
    wingShape.lineTo(0, 0.3);

    const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.02, bevelThickness: 0.02 };
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, extrudeSettings);
    wingGeo.rotateX(Math.PI / 2);
    const wingMesh = new THREE.Mesh(wingGeo);
    wingMesh.position.set(0, 0, 0.1);

    // 3. Twin Turbofan Jet Engines under wings
    const engineGeo = new THREE.CylinderGeometry(0.1, 0.09, 0.65, 10);
    engineGeo.rotateX(Math.PI / 2);

    const leftEngine = new THREE.Mesh(engineGeo);
    leftEngine.position.set(-0.65, -0.15, 0.1);

    const rightEngine = new THREE.Mesh(engineGeo);
    rightEngine.position.set(0.65, -0.15, 0.1);

    // 4. Vertical Tail Fin (Stabilizer)
    const finShape = new THREE.Shape();
    finShape.moveTo(0, -0.9);
    finShape.lineTo(0, -1.5);
    finShape.lineTo(0.7, -1.6);
    finShape.lineTo(0, -0.9);

    const finGeo = new THREE.ExtrudeGeometry(finShape, { depth: 0.03, bevelEnabled: false });
    finGeo.rotateY(Math.PI / 2);
    const finMesh = new THREE.Mesh(finGeo);
    finMesh.position.set(0.015, 0, 0);

    // 5. Horizontal Tail Stabilizers
    const hTailShape = new THREE.Shape();
    hTailShape.moveTo(0, -1.1);
    hTailShape.lineTo(0.75, -1.45);
    hTailShape.lineTo(0.75, -1.55);
    hTailShape.lineTo(0, -1.4);
    hTailShape.lineTo(-0.75, -1.55);
    hTailShape.lineTo(-0.75, -1.45);
    hTailShape.lineTo(0, -1.1);

    const hTailGeo = new THREE.ExtrudeGeometry(hTailShape, { depth: 0.03, bevelEnabled: false });
    hTailGeo.rotateX(Math.PI / 2);
    const hTailMesh = new THREE.Mesh(hTailGeo);
    hTailMesh.position.set(0, 0.12, 0);

    return {
      body: bodyMesh.geometry,
      nose: noseMesh.geometry,
      wing: wingMesh.geometry,
      engine: engineGeo,
      fin: finMesh.geometry,
      hTail: hTailMesh.geometry,
    };
  }

  latLonToSurfaceVector(lat, lon, radius) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  createSingleJetMesh(flight) {
    const jet = new THREE.Group();

    const body = new THREE.Mesh(this.jetGeometry.body, this.jetMaterial);
    const nose = new THREE.Mesh(this.jetGeometry.nose, this.jetMaterial);
    const wing = new THREE.Mesh(this.jetGeometry.wing, this.jetMaterial);
    const fin = new THREE.Mesh(this.jetGeometry.fin, this.jetMaterial);
    const hTail = new THREE.Mesh(this.jetGeometry.hTail, this.jetMaterial);

    const engL = new THREE.Mesh(this.jetGeometry.engine, this.engineMaterial);
    engL.position.set(-0.65, -0.15, 0.1);
    const engR = new THREE.Mesh(this.jetGeometry.engine, this.engineMaterial);
    engR.position.set(0.65, -0.15, 0.1);

    // Strobe / Navigation lights
    const portLightGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const portLight = new THREE.Mesh(portLightGeo, new THREE.MeshBasicMaterial({ color: 0xff2233 })); // Red (port)
    portLight.position.set(-1.8, 0, -0.7);

    const stbdLightGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const stbdLight = new THREE.Mesh(stbdLightGeo, new THREE.MeshBasicMaterial({ color: 0x00ff66 })); // Green (starboard)
    stbdLight.position.set(1.8, 0, -0.7);

    jet.add(body);
    jet.add(nose);
    jet.add(wing);
    jet.add(fin);
    jet.add(hTail);
    jet.add(engL);
    jet.add(engR);
    jet.add(portLight);
    jet.add(stbdLight);

    // Scale to balanced, realistic tactical size
    jet.scale.set(0.75, 0.75, 0.75);
    return jet;
  }

  loadFlights(flightData) {
    this.flights = flightData;
    this.clearFlights();

    flightData.forEach((flight) => {
      // 1. Calculate ground position and flight altitude position
      const groundPos = this.latLonToSurfaceVector(flight.lat, flight.lon, this.globeRadius);
      
      // Scale altitude realistically: 10,000m (~33,000 ft) -> 2.5 to 5.0 units above surface
      const altClearance = 1.2 + (Math.min(flight.altitude_m, 14000.0) / 14000.0) * 3.5;
      const flightPos = this.latLonToSurfaceVector(flight.lat, flight.lon, this.globeRadius + altClearance);

      // 2. Create Realistic 3D Jet Mesh
      const jetMesh = this.createSingleJetMesh(flight);
      jetMesh.position.copy(flightPos);

      // 3. Orient Aircraft along heading and tangent to spherical Earth surface
      const normal = flightPos.clone().normalize(); // Up vector from Earth center
      
      // Calculate East and North unit vectors at this position
      const worldUp = new THREE.Vector3(0, 1, 0);
      const east = new THREE.Vector3().crossVectors(worldUp, normal).normalize();
      const north = new THREE.Vector3().crossVectors(normal, east).normalize();

      // Heading angle from True North (clockwise in radians)
      const hdgRad = THREE.MathUtils.degToRad(flight.heading_deg || 0);
      const forward = north.clone().multiplyScalar(Math.cos(hdgRad)).add(east.clone().multiplyScalar(Math.sin(hdgRad))).normalize();

      // Matrix to point aircraft in direction of travel, with cabin roof pointing away from Earth
      const m = new THREE.Matrix4();
      const right = new THREE.Vector3().crossVectors(normal, forward).normalize();
      m.makeBasis(right, normal, forward);
      jetMesh.quaternion.setFromRotationMatrix(m);

      // 4. Tactical Altitude Drop-Vector Line (connects aircraft to ground point)
      const lineGeo = new THREE.BufferGeometry().setFromPoints([groundPos, flightPos]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.35,
      });
      const dropLine = new THREE.Line(lineGeo, lineMat);

      // Group together for click raycasting
      const itemGroup = new THREE.Group();
      itemGroup.add(jetMesh);
      itemGroup.add(dropLine);
      itemGroup.userData = { flightData: flight };

      this.flightGroup.add(itemGroup);
      this.flightMeshes.push(itemGroup);
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
