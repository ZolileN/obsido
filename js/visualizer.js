/* ============================================
   3D VISUALIZER - JAVASCRIPT (Three.js)
   ============================================ */

let scene, camera, renderer, furniture, floorMesh, backWallMesh, leftWallMesh, rightWallMesh, rugMesh;

// Material colors
const materialColors = {
  oak: 0xD2B48C,
  walnut: 0x5C4033,
  white: 0xF5F5F5,
  taupe: 0xA89968,
  charcoal: 0x44413e
};

// Finish properties
const finishProps = {
  matte: { roughness: 0.9, metalness: 0 },
  gloss: { roughness: 0.1, metalness: 0.1 },
  natural: { roughness: 0.6, metalness: 0 }
};

const wallTones = {
  charcoal: 0x181613,
  'warm-white': 0xe8dfd2,
  sand: 0xc7b79d,
  olive: 0x7b7d63
};

const floorTones = {
  walnut: 0x2b261f,
  oak: 0x8c6f4e,
  stone: 0x6d6a67
};

// Configuration state
let config = {
  type: 'kitchen',
  width: 120,
  depth: 60,
  height: 90,
  material: 'taupe',
  finish: 'matte',
  frontStyle: 'slab',
  hardware: 'bar',
  wallTone: 'charcoal',
  floorTone: 'walnut',
  roomWidth: 420,
  roomDepth: 520,
  roomHeight: 280,
  placement: 'back',
  cameraMode: 'perspective'
};

const presets = {
  kitchen: { type: 'kitchen', width: 180, depth: 62, height: 92, material: 'taupe', finish: 'matte', frontStyle: 'slab', hardware: 'bar', wallTone: 'warm-white', floorTone: 'oak', roomWidth: 420, roomDepth: 520, roomHeight: 280, placement: 'back', cameraMode: 'perspective' },
  wardrobe: { type: 'wardrobe', width: 160, depth: 58, height: 220, material: 'walnut', finish: 'natural', frontStyle: 'shaker', hardware: 'bar', wallTone: 'sand', floorTone: 'walnut', roomWidth: 380, roomDepth: 480, roomHeight: 290, placement: 'back', cameraMode: 'front' },
  shelving: { type: 'shelving', width: 140, depth: 36, height: 210, material: 'oak', finish: 'matte', frontStyle: 'slatted', hardware: 'push', wallTone: 'warm-white', floorTone: 'oak', roomWidth: 420, roomDepth: 520, roomHeight: 280, placement: 'left', cameraMode: 'perspective' },
  media: { type: 'media', width: 220, depth: 42, height: 55, material: 'walnut', finish: 'matte', frontStyle: 'slab', hardware: 'finger', wallTone: 'charcoal', floorTone: 'walnut', roomWidth: 520, roomDepth: 620, roomHeight: 280, placement: 'back', cameraMode: 'perspective' },
  desk: { type: 'desk', width: 180, depth: 60, height: 76, material: 'white', finish: 'matte', frontStyle: 'shaker', hardware: 'push', wallTone: 'sand', floorTone: 'oak', roomWidth: 360, roomDepth: 460, roomHeight: 280, placement: 'right', cameraMode: 'side' }
};

// Initialize Three.js scene
function initThreeJS() {
  const canvas = document.getElementById('canvas3d');
  const placeholder = document.getElementById('canvas-placeholder');
  
  // Check if canvas is available
  if (!canvas) return;
  
  // Scene setup
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0c0b);
  
  // Camera setup
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.set(3, 2, 3);
  
  // Renderer setup
  renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  
  // Hide placeholder
  if (placeholder) placeholder.style.display = 'none';
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  scene.add(directionalLight);

  const rimLight = new THREE.DirectionalLight(0xd8c49c, 0.5);
  rimLight.position.set(-4, 3, -2);
  scene.add(rimLight);
  
  // Room base
  floorMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 14),
    new THREE.MeshStandardMaterial({ color: 0x2b261f, roughness: 0.95, metalness: 0 })
  );
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  backWallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 8),
    new THREE.MeshStandardMaterial({ color: 0x181613, roughness: 1 })
  );
  backWallMesh.position.set(0, 4, -3.2);
  scene.add(backWallMesh);

  leftWallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 8),
    new THREE.MeshStandardMaterial({ color: 0x141311, roughness: 1 })
  );
  leftWallMesh.rotation.y = Math.PI / 2;
  leftWallMesh.position.set(-4.5, 4, 0);
  scene.add(leftWallMesh);

  rightWallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 8),
    new THREE.MeshStandardMaterial({ color: 0x141311, roughness: 1 })
  );
  rightWallMesh.rotation.y = -Math.PI / 2;
  rightWallMesh.position.set(4.5, 4, 0);
  scene.add(rightWallMesh);

  rugMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 3.2),
    new THREE.MeshStandardMaterial({ color: 0xb7a589, roughness: 1 })
  );
  rugMesh.rotation.x = -Math.PI / 2;
  rugMesh.position.set(0, 0.01, 0.5);
  scene.add(rugMesh);

  updateEnvironment();
  
  // Create initial furniture
  createFurniture();
  
  // Simple orbit controls (manual implementation)
  setupControls(canvas);
  
  // Handle window resize
  window.addEventListener('resize', onWindowResize);
  
  // Start animation loop
  animate();
}

function createFurniture() {
  // Remove old furniture if exists
  if (furniture) {
    scene.remove(furniture);
  }
  
  furniture = new THREE.Group();
  
  // Scale dimensions for visualization
  const scaledWidth = config.width / 100;
  const scaledDepth = config.depth / 100;
  const scaledHeight = config.height / 100;
  const panelThickness = 0.035;
  const brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xc9a96e,
    roughness: 0.35,
    metalness: 0.85
  });
  const darkMaterial = new THREE.MeshStandardMaterial({
    color: 0x121110,
    roughness: 0.9,
    metalness: 0.05
  });
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xd7d0c5,
    roughness: 0.22,
    metalness: 0.04
  });
  
  // Material
  const color = materialColors[config.material];
  const finish = finishProps[config.finish];
  const material = new THREE.MeshStandardMaterial({
    color: color,
    ...finish
  });
  
  if (config.type === 'kitchen') {
    addKitchenDetails(furniture, material, brassMaterial, darkMaterial, stoneMaterial, scaledWidth, scaledHeight, scaledDepth, panelThickness);
  }

  if (config.type === 'wardrobe') {
    addWardrobeDetails(furniture, material, brassMaterial, darkMaterial, scaledWidth, scaledHeight, scaledDepth, panelThickness);
  }

  if (config.type === 'shelving') {
    addShelvingDetails(furniture, material, brassMaterial, darkMaterial, scaledWidth, scaledHeight, scaledDepth, panelThickness);
  }

  if (config.type === 'media') {
    addMediaConsoleDetails(furniture, material, brassMaterial, darkMaterial, scaledWidth, scaledHeight, scaledDepth, panelThickness);
  }

  if (config.type === 'desk') {
    addDeskDetails(furniture, material, brassMaterial, darkMaterial, stoneMaterial, scaledWidth, scaledHeight, scaledDepth, panelThickness);
  }
  
  updateFurniturePlacement(scaledWidth, scaledDepth);
  scene.add(furniture);
}

function updateEnvironment() {
  if (!floorMesh || !backWallMesh || !leftWallMesh || !rightWallMesh || !rugMesh) return;
  const roomWidth = config.roomWidth / 100;
  const roomDepth = config.roomDepth / 100;
  const roomHeight = config.roomHeight / 100;

  floorMesh.material.color.setHex(floorTones[config.floorTone]);
  backWallMesh.material.color.setHex(wallTones[config.wallTone]);
  leftWallMesh.material.color.setHex(wallTones[config.wallTone]);
  rightWallMesh.material.color.setHex(wallTones[config.wallTone]);
  rugMesh.material.color.setHex(config.wallTone === 'charcoal' ? 0x8d816f : 0xb7a589);
  floorMesh.scale.set(roomWidth / 14, roomDepth / 14, 1);
  backWallMesh.scale.set(roomWidth / 14, roomHeight / 8, 1);
  backWallMesh.position.set(0, roomHeight / 2, -roomDepth / 2 + 0.01);
  leftWallMesh.scale.set(roomDepth / 14, roomHeight / 8, 1);
  leftWallMesh.position.set(-roomWidth / 2 + 0.01, roomHeight / 2, 0);
  rightWallMesh.scale.set(roomDepth / 14, roomHeight / 8, 1);
  rightWallMesh.position.set(roomWidth / 2 - 0.01, roomHeight / 2, 0);
  rugMesh.position.set(0, 0.01, roomDepth * 0.1);
}

function updateFurniturePlacement(width, depth) {
  if (!furniture) return;
  const roomWidth = config.roomWidth / 100;
  const roomDepth = config.roomDepth / 100;

  furniture.rotation.y = 0;

  if (config.placement === 'back') {
    furniture.position.set(0, 0, -roomDepth / 2 + depth / 2 + 0.02);
  }

  if (config.placement === 'left') {
    furniture.rotation.y = Math.PI / 2;
    furniture.position.set(-roomWidth / 2 + depth / 2 + 0.02, 0, 0);
  }

  if (config.placement === 'right') {
    furniture.rotation.y = -Math.PI / 2;
    furniture.position.set(roomWidth / 2 - depth / 2 - 0.02, 0, 0);
  }

  if (config.placement === 'center') {
    furniture.position.set(0, 0, 0);
  }
}

function getCameraTargetY() {
  return Math.max(0.9, config.height / 160);
}

function getCameraTarget() {
  return new THREE.Vector3(
    furniture ? furniture.position.x : 0,
    getCameraTargetY(),
    furniture ? furniture.position.z : 0
  );
}

function addPanel(group, geometry, material, x, y, z) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function addCabinetShell(group, material, width, height, depth, panelThickness, options = {}) {
  const hasBack = options.hasBack !== false;
  const raisedBase = options.raisedBase || 0;
  const innerWidth = width - panelThickness * 2;
  const innerHeight = height - panelThickness * 2 - raisedBase;
  const innerDepth = depth - panelThickness;

  addPanel(group, new THREE.BoxGeometry(panelThickness, height, depth), material, -width / 2 + panelThickness / 2, height / 2, 0);
  addPanel(group, new THREE.BoxGeometry(panelThickness, height, depth), material, width / 2 - panelThickness / 2, height / 2, 0);
  addPanel(group, new THREE.BoxGeometry(innerWidth, panelThickness, depth), material, 0, panelThickness / 2 + raisedBase, 0);
  addPanel(group, new THREE.BoxGeometry(innerWidth, panelThickness, depth), material, 0, height - panelThickness / 2, 0);

  if (hasBack) {
    addPanel(group, new THREE.BoxGeometry(innerWidth, height - panelThickness * 2, panelThickness * 0.7), material, 0, height / 2, -depth / 2 + panelThickness * 0.35);
  }

  return { innerWidth, innerHeight, innerDepth };
}

function addHandle(group, brassMaterial, x, y, z, length, horizontal = false) {
  const geometry = horizontal
    ? new THREE.BoxGeometry(length, 0.018, 0.018)
    : new THREE.BoxGeometry(0.018, length, 0.018);
  addPanel(group, geometry, brassMaterial, x, y, z);
}

function addFingerPull(group, brassMaterial, x, y, z, width) {
  addPanel(group, new THREE.BoxGeometry(width, 0.014, 0.014), brassMaterial, x, y, z);
}

function addFrontTreatment(group, baseMaterial, accentMaterial, width, height, z) {
  if (config.frontStyle === 'slab') return;

  if (config.frontStyle === 'shaker') {
    addPanel(group, new THREE.BoxGeometry(width * 0.78, height * 0.82, 0.012), accentMaterial, 0, 0, z);
  }

  if (config.frontStyle === 'glass') {
    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.76, height * 0.8, 0.01),
      new THREE.MeshStandardMaterial({ color: 0xcfd5d9, roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.35 })
    );
    glass.position.set(0, 0, z);
    glass.castShadow = true;
    group.add(glass);
  }

  if (config.frontStyle === 'slatted') {
    const slatCount = 5;
    for (let index = 0; index < slatCount; index += 1) {
      const y = (-height * 0.3) + index * (height * 0.15);
      addPanel(group, new THREE.BoxGeometry(width * 0.72, 0.018, 0.012), baseMaterial, 0, y, z);
    }
  }
}

function addHardware(group, brassMaterial, x, y, z, length, horizontal = false) {
  if (config.hardware === 'push') return;
  if (config.hardware === 'finger') {
    addFingerPull(group, brassMaterial, x, horizontal ? y + 0.02 : y + length / 2 - 0.05, z, horizontal ? length * 0.8 : 0.1);
    return;
  }
  addHandle(group, brassMaterial, x, y, z, length, horizontal);
}

function addDecorBox(group, material, x, y, z, width, height, depth) {
  addPanel(group, new THREE.BoxGeometry(width, height, depth), material, x, y, z);
}

function addKitchenDetails(group, material, brassMaterial, darkMaterial, stoneMaterial, width, height, depth, panelThickness) {
  const shell = addCabinetShell(group, material, width, height, depth, panelThickness, { raisedBase: 0.12 });

  const top = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.08, 0.05, depth + 0.04),
    stoneMaterial
  );
  top.position.y = height + 0.025;
  top.castShadow = true;
  top.receiveShadow = true;
  group.add(top);

  addPanel(group, new THREE.BoxGeometry(width * 0.92, 0.12, depth * 0.78), darkMaterial, 0, 0.06, 0);
  addPanel(group, new THREE.BoxGeometry(panelThickness, shell.innerHeight * 0.78, depth - panelThickness * 1.2), material, 0, shell.innerHeight * 0.39 + 0.12, 0);

  const doorWidth = width / 2.18;
  const doorHeight = height * 0.72;
  [-1, 1].forEach(direction => {
    const doorGroup = new THREE.Group();
    doorGroup.position.set(direction * width * 0.24, height * 0.48, depth / 2 + 0.02);
    addPanel(doorGroup, new THREE.BoxGeometry(doorWidth, doorHeight, 0.026), material, 0, 0, 0);
    addFrontTreatment(doorGroup, material, darkMaterial, doorWidth, doorHeight, 0.015);
    addHardware(doorGroup, brassMaterial, direction * (doorWidth * 0.36), 0, 0.035, doorHeight * 0.42);
    group.add(doorGroup);
  });

  const drawerY = height * 0.84;
  const drawerGroup = new THREE.Group();
  drawerGroup.position.set(0, drawerY, depth / 2 + 0.02);
  addPanel(drawerGroup, new THREE.BoxGeometry(width * 0.92, height * 0.14, 0.026), material, 0, 0, 0);
  addFrontTreatment(drawerGroup, material, darkMaterial, width * 0.92, height * 0.14, 0.015);
  addHardware(drawerGroup, brassMaterial, 0, 0, 0.035, width * 0.32, true);
  group.add(drawerGroup);

  addPanel(group, new THREE.BoxGeometry(width * 0.28, 0.02, depth * 0.36), stoneMaterial, 0, height + 0.07, 0);
  addPanel(group, new THREE.CylinderGeometry(0.015, 0.015, 0.25, 16), brassMaterial, width * 0.08, height + 0.14, 0.02).rotation.z = Math.PI / 2;
}

function addWardrobeDetails(group, material, brassMaterial, darkMaterial, width, height, depth, panelThickness) {
  const shell = addCabinetShell(group, material, width, height, depth, panelThickness);
  const doorSpan = width / 3;

  [-doorSpan, 0, doorSpan].forEach((x, index) => {
    const doorWidth = width / 3.25;
    const doorHeight = height * 0.94;
    const doorGroup = new THREE.Group();
    doorGroup.position.set(x, height * 0.5, depth / 2 + 0.018);
    addPanel(doorGroup, new THREE.BoxGeometry(doorWidth, doorHeight, 0.026), material, 0, 0, 0);
    addFrontTreatment(doorGroup, material, darkMaterial, doorWidth, doorHeight, 0.015);
    addHardware(doorGroup, brassMaterial, index === 2 ? -0.12 : 0.12, 0, 0.032, height * 0.42);
    group.add(doorGroup);
  });

  addPanel(group, new THREE.BoxGeometry(panelThickness, shell.innerHeight * 0.94, depth - panelThickness), material, -width / 6, shell.innerHeight * 0.5 + panelThickness, 0);
  addPanel(group, new THREE.BoxGeometry(panelThickness, shell.innerHeight * 0.94, depth - panelThickness), material, width / 6, shell.innerHeight * 0.5 + panelThickness, 0);

  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, width * 0.22, 18), brassMaterial);
  rail.rotation.z = Math.PI / 2;
  rail.position.set(-width / 3, height * 0.74, 0);
  group.add(rail);

  [0.24, 0.42, 0.6, 0.78].forEach(level => {
    addPanel(group, new THREE.BoxGeometry(width * 0.26, 0.025, depth * 0.84), material, width / 3, height * level, 0);
  });

  addPanel(group, new THREE.BoxGeometry(width * 0.26, height * 0.18, depth * 0.84), darkMaterial, -width / 3, height * 0.18, 0);
  addDecorBox(group, darkMaterial, width / 3, height * 0.18, depth * 0.08, width * 0.12, height * 0.08, depth * 0.24);
  addDecorBox(group, brassMaterial, width / 3, height * 0.86, 0, width * 0.08, height * 0.12, width * 0.08);
}

function addShelvingDetails(group, material, brassMaterial, darkMaterial, width, height, depth, panelThickness) {
  addCabinetShell(group, material, width, height, depth, panelThickness, { hasBack: true });
  addPanel(group, new THREE.BoxGeometry(panelThickness, height * 0.94, depth * 0.9), material, -width / 6, height * 0.5, 0);
  addPanel(group, new THREE.BoxGeometry(panelThickness, height * 0.94, depth * 0.9), material, width / 6, height * 0.5, 0);

  const shelfLevels = [0.2, 0.38, 0.56, 0.74];

  shelfLevels.forEach(level => {
    addPanel(group, new THREE.BoxGeometry(width * 0.92, 0.03, depth * 0.9), material, 0, height * level, 0);
  });

  addPanel(group, new THREE.BoxGeometry(width * 0.16, 0.02, depth * 0.92), brassMaterial, 0, height * 0.12, 0);
  addDecorBox(group, darkMaterial, -width * 0.27, height * 0.29, 0, width * 0.12, height * 0.14, depth * 0.22);
  addDecorBox(group, darkMaterial, -width * 0.02, height * 0.47, 0, width * 0.1, height * 0.18, depth * 0.2);
  addDecorBox(group, brassMaterial, width * 0.28, height * 0.66, 0, width * 0.08, height * 0.16, width * 0.08);
  addDecorBox(group, material, width * 0.02, height * 0.84, 0, width * 0.14, 0.02, depth * 0.22);
}

function addMediaConsoleDetails(group, material, brassMaterial, darkMaterial, width, height, depth, panelThickness) {
  addCabinetShell(group, material, width, height, depth, panelThickness, { hasBack: true });
  addPanel(group, new THREE.BoxGeometry(panelThickness, height * 0.92, depth * 0.9), material, -width / 6, height * 0.48, 0);
  addPanel(group, new THREE.BoxGeometry(panelThickness, height * 0.92, depth * 0.9), material, width / 6, height * 0.48, 0);

  [-width * 0.32, 0, width * 0.32].forEach((x, index) => {
    const doorWidth = width * 0.26;
    const doorHeight = height * 0.62;
    const frontGroup = new THREE.Group();
    frontGroup.position.set(x, height * 0.45, depth / 2 + 0.02);
    addPanel(frontGroup, new THREE.BoxGeometry(doorWidth, doorHeight, 0.022), material, 0, 0, 0);
    addFrontTreatment(frontGroup, material, darkMaterial, doorWidth, doorHeight, 0.013);
    if (index !== 1) {
      addHardware(frontGroup, brassMaterial, 0, 0, 0.03, width * 0.12, true);
    }
    group.add(frontGroup);
  });

  addDecorBox(group, darkMaterial, 0, height * 0.8, 0, width * 0.22, height * 0.12, depth * 0.16);
  addDecorBox(group, brassMaterial, width * 0.32, height * 0.78, 0, width * 0.07, height * 0.18, width * 0.07);
}

function addDeskDetails(group, material, brassMaterial, darkMaterial, stoneMaterial, width, height, depth) {
  addPanel(group, new THREE.BoxGeometry(width, 0.045, depth), stoneMaterial, 0, height, 0);
  addPanel(group, new THREE.BoxGeometry(width * 0.28, height * 0.9, depth * 0.88), material, -width * 0.3, height * 0.45, 0);
  addPanel(group, new THREE.BoxGeometry(width * 0.28, height * 0.9, depth * 0.88), material, width * 0.3, height * 0.45, 0);
  addPanel(group, new THREE.BoxGeometry(width * 0.36, 0.028, depth * 0.86), material, 0, height * 0.56, 0);
  addPanel(group, new THREE.BoxGeometry(width * 0.36, 0.028, depth * 0.86), material, 0, height * 0.28, 0);
  addHardware(group, brassMaterial, -width * 0.3, height * 0.64, depth / 2 + 0.04, width * 0.1, true);
  addHardware(group, brassMaterial, width * 0.3, height * 0.64, depth / 2 + 0.04, width * 0.1, true);
  addDecorBox(group, darkMaterial, 0, height + 0.16, 0, width * 0.18, height * 0.18, depth * 0.12);
}

function setupControls(canvas) {
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let rotation = { x: 0, y: 0 };
  const minZoomRadius = 2.4;
  const maxZoomRadius = 4.2;
  let zoomRadius = Math.sqrt(
    camera.position.x ** 2 +
    (camera.position.y - 1) ** 2 +
    camera.position.z ** 2
  );
  
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;
      
      rotation.y += deltaX * 0.01;
      rotation.x += deltaY * 0.01;
      
      // Limit vertical rotation
      if (rotation.x > Math.PI / 2) rotation.x = Math.PI / 2;
      if (rotation.x < -Math.PI / 2) rotation.x = -Math.PI / 2;
      
      previousMousePosition = { x: e.clientX, y: e.clientY };
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });
  
  // Zoom with scroll
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomStep = 0.3;
    if (e.deltaY < 0) {
      zoomRadius = Math.max(minZoomRadius, zoomRadius - zoomStep);
    } else {
      zoomRadius = Math.min(maxZoomRadius, zoomRadius + zoomStep);
    }
  }, { passive: false });
  
  // Auto-rotate
  let autoRotateAngle = 0;
  
  function updateCamera() {
    autoRotateAngle += 0.003;
    const target = getCameraTarget();

    if (config.cameraMode === 'perspective') {
      camera.position.x = zoomRadius * Math.sin(rotation.y + autoRotateAngle) * Math.cos(rotation.x);
      camera.position.y = zoomRadius * Math.sin(rotation.x) + target.y;
      camera.position.z = zoomRadius * Math.cos(rotation.y + autoRotateAngle) * Math.cos(rotation.x);
    }

    if (config.cameraMode === 'front') {
      camera.position.set(target.x, target.y + 0.5, target.z + 4.2);
    }

    if (config.cameraMode === 'side') {
      camera.position.set(target.x + 4.2, target.y + 0.45, target.z);
    }

    if (config.cameraMode === 'top') {
      camera.position.set(target.x, 6.5, target.z + 0.001);
    }
    
    camera.lookAt(target);
  }
  
  // Store updateCamera for animation loop
  window.updateCamera = updateCamera;
}

function animate() {
  requestAnimationFrame(animate);
  
  if (window.updateCamera) {
    window.updateCamera();
  }
  
  renderer.render(scene, camera);
}

function onWindowResize() {
  const canvas = document.getElementById('canvas3d');
  if (!canvas) return;
  
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Event listeners for controls
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Three.js
  setTimeout(initThreeJS, 100);
  
  // Furniture type
  const typeSelect = document.getElementById('furniture-type-3d');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      config.type = e.target.value;
      syncPresetButtons();
      createFurniture();
    });
  }
  
  // Material
  const materialSelect = document.getElementById('material-3d');
  if (materialSelect) {
    materialSelect.addEventListener('change', (e) => {
      config.material = e.target.value;
      createFurniture();
    });
  }
  
  // Finish
  const finishSelect = document.getElementById('finish-3d');
  if (finishSelect) {
    finishSelect.addEventListener('change', (e) => {
      config.finish = e.target.value;
      createFurniture();
    });
  }

  const frontStyleSelect = document.getElementById('front-style-3d');
  if (frontStyleSelect) {
    frontStyleSelect.addEventListener('change', (e) => {
      config.frontStyle = e.target.value;
      createFurniture();
    });
  }

  const hardwareStyleSelect = document.getElementById('hardware-style-3d');
  if (hardwareStyleSelect) {
    hardwareStyleSelect.addEventListener('change', (e) => {
      config.hardware = e.target.value;
      createFurniture();
    });
  }

  const wallToneSelect = document.getElementById('wall-tone-3d');
  if (wallToneSelect) {
    wallToneSelect.addEventListener('change', (e) => {
      config.wallTone = e.target.value;
      updateEnvironment();
    });
  }

  const floorToneSelect = document.getElementById('floor-tone-3d');
  if (floorToneSelect) {
    floorToneSelect.addEventListener('change', (e) => {
      config.floorTone = e.target.value;
      updateEnvironment();
    });
  }
  
  // Dimensions
  const widthSlider = document.getElementById('width-slider');
  if (widthSlider) {
    widthSlider.addEventListener('input', (e) => {
      config.width = parseInt(e.target.value);
      document.getElementById('width-display').textContent = config.width;
      createFurniture();
    });
  }
  
  const depthSlider = document.getElementById('depth-slider');
  if (depthSlider) {
    depthSlider.addEventListener('input', (e) => {
      config.depth = parseInt(e.target.value);
      document.getElementById('depth-display').textContent = config.depth;
      createFurniture();
    });
  }
  
  const heightSlider = document.getElementById('height-slider');
  if (heightSlider) {
    heightSlider.addEventListener('input', (e) => {
      config.height = parseInt(e.target.value);
      document.getElementById('height-display').textContent = config.height;
      createFurniture();
    });
  }

  const roomWidthSlider = document.getElementById('room-width-slider');
  if (roomWidthSlider) {
    roomWidthSlider.addEventListener('input', (e) => {
      config.roomWidth = parseInt(e.target.value);
      document.getElementById('room-width-display').textContent = String(config.roomWidth);
      updateEnvironment();
      createFurniture();
    });
  }

  const roomDepthSlider = document.getElementById('room-depth-slider');
  if (roomDepthSlider) {
    roomDepthSlider.addEventListener('input', (e) => {
      config.roomDepth = parseInt(e.target.value);
      document.getElementById('room-depth-display').textContent = String(config.roomDepth);
      updateEnvironment();
      createFurniture();
    });
  }

  const roomHeightSlider = document.getElementById('room-height-slider');
  if (roomHeightSlider) {
    roomHeightSlider.addEventListener('input', (e) => {
      config.roomHeight = parseInt(e.target.value);
      document.getElementById('room-height-display').textContent = String(config.roomHeight);
      updateEnvironment();
      createFurniture();
    });
  }

  const placementSelect = document.getElementById('placement-3d');
  if (placementSelect) {
    placementSelect.addEventListener('change', (e) => {
      config.placement = e.target.value;
      updateFurniturePlacement(config.width / 100, config.depth / 100);
    });
  }

  document.querySelectorAll('.preset-button').forEach(button => {
    button.addEventListener('click', () => {
      applyPreset(button.getAttribute('data-preset'));
    });
  });

  document.querySelectorAll('.camera-button').forEach(button => {
    button.addEventListener('click', () => {
      config.cameraMode = button.getAttribute('data-camera');
      syncCameraButtons();
      if (window.updateCamera) {
        window.updateCamera();
      }
    });
  });

  const advancedToggle = document.getElementById('advanced-toggle');
  const advancedControls = document.getElementById('advanced-controls');
  if (advancedToggle && advancedControls) {
    advancedControls.style.display = 'none';
  }

  syncFormControls();
  syncPresetButtons();
  syncCameraButtons();
});

function toggleAdvancedOptions() {
  const advancedToggle = document.getElementById('advanced-toggle');
  const advancedControls = document.getElementById('advanced-controls');
  if (!advancedToggle || !advancedControls) return;

  const isOpen = advancedToggle.getAttribute('aria-expanded') === 'true';
  advancedToggle.setAttribute('aria-expanded', String(!isOpen));
  advancedControls.style.display = isOpen ? 'none' : 'grid';

  const icon = advancedToggle.querySelector('.advanced-toggle-icon');
  if (icon) {
    icon.textContent = isOpen ? '+' : '−';
  }
}

function toggleFinishOptions() {
  const finishToggle = document.getElementById('finish-toggle');
  const finishControls = document.getElementById('finish-controls');
  if (!finishToggle || !finishControls) return;

  const isOpen = finishToggle.getAttribute('aria-expanded') === 'true';
  finishToggle.setAttribute('aria-expanded', String(!isOpen));
  finishControls.style.display = isOpen ? 'none' : 'grid';

  const icon = finishToggle.querySelector('.advanced-toggle-icon');
  if (icon) {
    icon.textContent = isOpen ? '+' : '−';
  }
}

function resetVisualizer() {
  applyPreset('kitchen');
}

function exportDesign() {
  const configData = JSON.stringify(config, null, 2);
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(configData));
  element.setAttribute('download', 'furniture-design.json');
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  
  alert('Design configuration exported as furniture-design.json');
}

function sendDesignToEstimator() {
  const estimatorMapping = {
    kitchen: 'kitchen-premium',
    wardrobe: 'wardrobe-standard',
    shelving: 'custom-shelving',
    media: 'custom-shelving',
    desk: 'custom-desk'
  };

  const estimatorPayload = {
    furnitureType: estimatorMapping[config.type] || 'custom-shelving',
    quantity: 1,
    visualizerConfig: config,
    visualizerSummary: [
      `${config.type} concept`,
      `${config.width}w x ${config.depth}d x ${config.height}h cm`,
      `${config.material} / ${config.finish}`,
      `${config.frontStyle} fronts`,
      `${config.hardware} hardware`,
      `${config.placement} placement`
    ].join(' | ')
  };

  localStorage.setItem('visualizerEstimateRequest', JSON.stringify(estimatorPayload));
  window.location.href = 'estimator.html?source=visualizer';
}

function applyPreset(name) {
  const preset = presets[name];
  if (!preset) return;

  config = { ...preset };
  syncFormControls();
  syncPresetButtons();
  syncCameraButtons();
  updateEnvironment();
  createFurniture();
}

function syncFormControls() {
  document.getElementById('furniture-type-3d').value = config.type;
  document.getElementById('material-3d').value = config.material;
  document.getElementById('finish-3d').value = config.finish;
  document.getElementById('front-style-3d').value = config.frontStyle;
  document.getElementById('hardware-style-3d').value = config.hardware;
  document.getElementById('wall-tone-3d').value = config.wallTone;
  document.getElementById('floor-tone-3d').value = config.floorTone;
  document.getElementById('placement-3d').value = config.placement;
  document.getElementById('width-slider').value = String(config.width);
  document.getElementById('depth-slider').value = String(config.depth);
  document.getElementById('height-slider').value = String(config.height);
  document.getElementById('room-width-slider').value = String(config.roomWidth);
  document.getElementById('room-depth-slider').value = String(config.roomDepth);
  document.getElementById('room-height-slider').value = String(config.roomHeight);
  document.getElementById('width-display').textContent = String(config.width);
  document.getElementById('depth-display').textContent = String(config.depth);
  document.getElementById('height-display').textContent = String(config.height);
  document.getElementById('room-width-display').textContent = String(config.roomWidth);
  document.getElementById('room-depth-display').textContent = String(config.roomDepth);
  document.getElementById('room-height-display').textContent = String(config.roomHeight);
}

function syncPresetButtons() {
  document.querySelectorAll('.preset-button').forEach(button => {
    button.classList.toggle('is-active', button.getAttribute('data-preset') === config.type);
  });
}

function syncCameraButtons() {
  document.querySelectorAll('.camera-button').forEach(button => {
    button.classList.toggle('is-active', button.getAttribute('data-camera') === config.cameraMode);
  });
}
