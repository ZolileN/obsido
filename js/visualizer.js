/* ============================================
   3D VISUALIZER - JAVASCRIPT (Three.js)
   ============================================ */

let scene;
let camera;
let renderer;
let furniture;
let floorMesh;
let backWallMesh;
let leftWallMesh;
let rightWallMesh;
let rugMesh;

const cameraState = {
  yaw: -0.65,
  pitch: 0.22,
  radius: 5.2,
  minRadius: 3.2,
  maxRadius: 7.4,
  dragging: false,
  pointerX: 0,
  pointerY: 0
};

const materialColors = {
  oak: 0xc6a67b,
  walnut: 0x5f4638,
  white: 0xf3f0ea,
  taupe: 0x9a8366,
  charcoal: 0x44413e
};

const frontAccentColors = {
  slab: 0xd8c9b3,
  shaker: 0xe4d7c4,
  glass: 0x9ca4aa,
  slatted: 0xae8d63
};

const wallTones = {
  'soft-ivory': 0xf3eee6,
  'warm-greige': 0xcfc3b3,
  stone: 0xb6aea3,
  'deep-olive': 0x676e61
};

const floorTones = {
  'oak-floor': 0x8e6f4f,
  'walnut-floor': 0x654836,
  'concrete-floor': 0x8d8f92,
  'charcoal-floor': 0x454545
};

const finishProps = {
  matte: { roughness: 0.86, metalness: 0.04 },
  gloss: { roughness: 0.22, metalness: 0.1 },
  natural: { roughness: 0.6, metalness: 0.03 }
};

const presets = {
  kitchen: {
    type: 'kitchen',
    width: 260,
    depth: 60,
    height: 92,
    material: 'taupe',
    finish: 'matte',
    frontStyle: 'slab',
    hardware: 'finger',
    wallTone: 'warm-greige',
    floorTone: 'oak-floor',
    roomWidth: 460,
    roomDepth: 560,
    roomHeight: 285,
    placement: 'back-center',
    cameraMode: 'perspective'
  },
  wardrobe: {
    type: 'wardrobe',
    width: 280,
    depth: 65,
    height: 240,
    material: 'walnut',
    finish: 'natural',
    frontStyle: 'shaker',
    hardware: 'bar',
    wallTone: 'soft-ivory',
    floorTone: 'walnut-floor',
    roomWidth: 420,
    roomDepth: 500,
    roomHeight: 290,
    placement: 'back-center',
    cameraMode: 'perspective'
  },
  shelving: {
    type: 'shelving',
    width: 210,
    depth: 42,
    height: 220,
    material: 'oak',
    finish: 'natural',
    frontStyle: 'slatted',
    hardware: 'push',
    wallTone: 'stone',
    floorTone: 'oak-floor',
    roomWidth: 440,
    roomDepth: 540,
    roomHeight: 280,
    placement: 'back-left',
    cameraMode: 'perspective'
  },
  media: {
    type: 'media',
    width: 240,
    depth: 45,
    height: 62,
    material: 'walnut',
    finish: 'matte',
    frontStyle: 'slab',
    hardware: 'push',
    wallTone: 'deep-olive',
    floorTone: 'walnut-floor',
    roomWidth: 520,
    roomDepth: 620,
    roomHeight: 290,
    placement: 'back-center',
    cameraMode: 'perspective'
  },
  desk: {
    type: 'desk',
    width: 220,
    depth: 65,
    height: 76,
    material: 'white',
    finish: 'matte',
    frontStyle: 'shaker',
    hardware: 'bar',
    wallTone: 'soft-ivory',
    floorTone: 'oak-floor',
    roomWidth: 400,
    roomDepth: 500,
    roomHeight: 275,
    placement: 'side-right',
    cameraMode: 'perspective'
  }
};

let config = { ...presets.kitchen };

function getElement(id) {
  return document.getElementById(id);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function initThreeJS() {
  const canvas = getElement('canvas3d');
  const placeholder = getElement('canvas-placeholder');
  if (!canvas || !window.THREE) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0f0d0b);
  scene.fog = new THREE.Fog(0x0f0d0b, 6, 14);

  const width = canvas.clientWidth || canvas.parentElement.clientWidth;
  const height = canvas.clientHeight || canvas.parentElement.clientHeight;

  camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const ambientLight = new THREE.AmbientLight(0xf5ead8, 0.8);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff4df, 1.05);
  keyLight.position.set(4.6, 6.4, 4.4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 1024;
  keyLight.shadow.mapSize.height = 1024;
  keyLight.shadow.camera.left = -6;
  keyLight.shadow.camera.right = 6;
  keyLight.shadow.camera.top = 6;
  keyLight.shadow.camera.bottom = -6;
  scene.add(keyLight);

  const fillLight = new THREE.PointLight(0xd9c6a5, 0.45, 20);
  fillLight.position.set(-3.2, 3.4, 2.6);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x8ea1b8, 0.24);
  rimLight.position.set(-5, 4, -4);
  scene.add(rimLight);

  buildRoom();
  createFurniture();
  setupControls(canvas);
  updateEnvironment();
  applyCameraMode();

  if (placeholder) {
    placeholder.style.display = 'none';
  }

  window.addEventListener('resize', onWindowResize);
  animate();
}

function buildRoom() {
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x8e6f4f, roughness: 0.8, metalness: 0.02 });
  floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  scene.add(floorMesh);

  const wallGeometry = new THREE.PlaneGeometry(10, 10);
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xd7cdc0, roughness: 0.95 });

  backWallMesh = new THREE.Mesh(wallGeometry, wallMaterial.clone());
  backWallMesh.position.z = -3.5;
  backWallMesh.position.y = 2.5;
  scene.add(backWallMesh);

  leftWallMesh = new THREE.Mesh(wallGeometry, wallMaterial.clone());
  leftWallMesh.rotation.y = Math.PI / 2;
  leftWallMesh.position.x = -4.2;
  leftWallMesh.position.y = 2.5;
  scene.add(leftWallMesh);

  rightWallMesh = new THREE.Mesh(wallGeometry, wallMaterial.clone());
  rightWallMesh.rotation.y = -Math.PI / 2;
  rightWallMesh.position.x = 4.2;
  rightWallMesh.position.y = 2.5;
  scene.add(rightWallMesh);

  const rugGeometry = new THREE.PlaneGeometry(3.2, 2.1);
  const rugMaterial = new THREE.MeshStandardMaterial({ color: 0x5c4b43, roughness: 1 });
  rugMesh = new THREE.Mesh(rugGeometry, rugMaterial);
  rugMesh.rotation.x = -Math.PI / 2;
  rugMesh.position.y = 0.01;
  rugMesh.position.z = 0.7;
  scene.add(rugMesh);
}

function createFurniture() {
  if (furniture) {
    scene.remove(furniture);
  }

  furniture = new THREE.Group();

  const width = config.width / 100;
  const depth = config.depth / 100;
  const height = config.height / 100;

  const carcassMaterial = new THREE.MeshStandardMaterial({
    color: materialColors[config.material] || materialColors.taupe,
    ...finishProps[config.finish]
  });

  const accentMaterial = new THREE.MeshStandardMaterial({
    color: frontAccentColors[config.frontStyle] || frontAccentColors.slab,
    roughness: config.frontStyle === 'glass' ? 0.18 : 0.5,
    metalness: config.frontStyle === 'glass' ? 0.18 : 0.04,
    transparent: config.frontStyle === 'glass',
    opacity: config.frontStyle === 'glass' ? 0.65 : 1
  });

  const topHeight = config.type === 'wardrobe' || config.type === 'shelving' ? height : height - 0.1;
  addCabinetShell(width, topHeight, depth, carcassMaterial);

  if (config.type === 'kitchen') {
    addKitchenDetails(width, depth, height, carcassMaterial, accentMaterial);
  } else if (config.type === 'wardrobe') {
    addWardrobeDetails(width, depth, height, carcassMaterial, accentMaterial);
  } else if (config.type === 'shelving') {
    addShelvingDetails(width, depth, height, carcassMaterial, accentMaterial);
  } else if (config.type === 'media') {
    addMediaConsoleDetails(width, depth, height, carcassMaterial, accentMaterial);
  } else if (config.type === 'desk') {
    addDeskDetails(width, depth, height, carcassMaterial, accentMaterial);
  }

  updateFurniturePlacement(width, depth, height);
  scene.add(furniture);
  updateMeasurementOverlay();
}

function addPanel(width, height, depth, material, x, y, z) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  furniture.add(mesh);
  return mesh;
}

function addCabinetShell(width, height, depth, material) {
  const thickness = 0.035;
  addPanel(width, thickness, depth, material, 0, height - thickness / 2, 0);
  addPanel(width, thickness, depth, material, 0, thickness / 2, 0);
  addPanel(thickness, height, depth, material, -width / 2 + thickness / 2, height / 2, 0);
  addPanel(thickness, height, depth, material, width / 2 - thickness / 2, height / 2, 0);
  addPanel(width - thickness * 2, height - thickness * 2, 0.02, material, 0, height / 2, -depth / 2 + 0.01);
}

function addHandle(x, y, z, vertical = true) {
  if (config.hardware !== 'bar') return;
  const geometry = vertical
    ? new THREE.BoxGeometry(0.018, 0.24, 0.018)
    : new THREE.BoxGeometry(0.24, 0.018, 0.018);
  const handle = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.78 }));
  handle.position.set(x, y, z);
  furniture.add(handle);
}

function addFingerPull(width, height, z) {
  if (config.hardware !== 'finger') return;
  const groove = new THREE.Mesh(
    new THREE.BoxGeometry(width, 0.018, 0.01),
    new THREE.MeshStandardMaterial({ color: 0x292725, roughness: 0.9, metalness: 0.08 })
  );
  groove.position.set(0, height, z);
  furniture.add(groove);
}

function addFrontTreatment(panelWidth, panelHeight, x, y, z, accentMaterial) {
  const front = new THREE.Mesh(new THREE.BoxGeometry(panelWidth, panelHeight, 0.024), accentMaterial);
  front.position.set(x, y, z);
  front.castShadow = true;
  furniture.add(front);

  if (config.frontStyle === 'shaker') {
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0xc9b79b, roughness: 0.55, metalness: 0.03 });
    const railThickness = 0.028;
    addPanel(panelWidth, railThickness, 0.012, frameMaterial, x, y + panelHeight / 2 - railThickness / 2, z + 0.01);
    addPanel(panelWidth, railThickness, 0.012, frameMaterial, x, y - panelHeight / 2 + railThickness / 2, z + 0.01);
    addPanel(railThickness, panelHeight - railThickness * 2, 0.012, frameMaterial, x - panelWidth / 2 + railThickness / 2, y, z + 0.01);
    addPanel(railThickness, panelHeight - railThickness * 2, 0.012, frameMaterial, x + panelWidth / 2 - railThickness / 2, y, z + 0.01);
  }

  if (config.frontStyle === 'slatted') {
    const slatMaterial = new THREE.MeshStandardMaterial({ color: 0x8d6f49, roughness: 0.65, metalness: 0.02 });
    const slatCount = Math.max(4, Math.floor(panelWidth / 0.12));
    const gap = panelWidth / slatCount;
    for (let index = 0; index < slatCount - 1; index += 1) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.028, panelHeight * 0.92, 0.02), slatMaterial);
      slat.position.set(x - panelWidth / 2 + gap * (index + 1), y, z + 0.016);
      furniture.add(slat);
    }
  }
}

function addKitchenDetails(width, depth, height, carcassMaterial, accentMaterial) {
  addPanel(width + 0.06, 0.05, depth + 0.08, new THREE.MeshStandardMaterial({ color: 0x918072, roughness: 0.34, metalness: 0.1 }), 0, height - 0.025, 0);
  addPanel(width, 0.1, depth - 0.06, new THREE.MeshStandardMaterial({ color: 0x2a2826, roughness: 0.9, metalness: 0.05 }), 0, 0.05, 0.02);

  const bayWidth = width / 3;
  for (let bay = 0; bay < 3; bay += 1) {
    const centerX = -width / 2 + bayWidth * bay + bayWidth / 2;
    addPanel(0.02, height - 0.14, depth - 0.08, carcassMaterial, centerX - bayWidth / 2 + 0.01, (height - 0.1) / 2 + 0.1, 0);
    if (bay < 2) {
      addFrontTreatment(bayWidth - 0.05, height * 0.54, centerX, height * 0.36, depth / 2 + 0.015, accentMaterial);
      addHandle(centerX + bayWidth * 0.24, height * 0.36, depth / 2 + 0.034);
      addFingerPull(bayWidth - 0.07, height * 0.64, depth / 2 + 0.022);
    } else {
      for (let drawer = 0; drawer < 3; drawer += 1) {
        const y = height * 0.2 + drawer * height * 0.18;
        addFrontTreatment(bayWidth - 0.05, height * 0.15, centerX, y, depth / 2 + 0.015, accentMaterial);
        addHandle(centerX, y, depth / 2 + 0.034, false);
      }
    }
  }

  const decorTop = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 24), new THREE.MeshStandardMaterial({ color: 0xc9c5bf, roughness: 0.45 }));
  decorTop.position.set(width * 0.24, height + 0.12, -0.05);
  furniture.add(decorTop);
}

function addWardrobeDetails(width, depth, height, carcassMaterial, accentMaterial) {
  const doorCount = width > 2.5 ? 4 : 3;
  const doorWidth = width / doorCount;
  for (let door = 0; door < doorCount; door += 1) {
    const centerX = -width / 2 + doorWidth * door + doorWidth / 2;
    addFrontTreatment(doorWidth - 0.03, height - 0.08, centerX, height / 2, depth / 2 + 0.015, accentMaterial);
    addHandle(centerX + doorWidth * 0.33, height / 2, depth / 2 + 0.033);
  }

  const shelfLevels = [height * 0.28, height * 0.58];
  shelfLevels.forEach((y) => {
    addPanel(width - 0.08, 0.02, depth - 0.08, carcassMaterial, 0, y, 0);
  });

  addPanel(0.03, height - 0.08, depth - 0.08, carcassMaterial, 0, height / 2, 0);

  const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, width * 0.42, 20), new THREE.MeshStandardMaterial({ color: 0x1b1a18, roughness: 0.2, metalness: 0.8 }));
  rail.rotation.z = Math.PI / 2;
  rail.position.set(-width * 0.18, height * 0.72, 0);
  furniture.add(rail);

  const box = new THREE.Mesh(new THREE.BoxGeometry(width * 0.26, 0.18, depth * 0.42), new THREE.MeshStandardMaterial({ color: 0xbca98c, roughness: 0.7 }));
  box.position.set(width * 0.18, 0.12, depth * 0.06);
  furniture.add(box);
}

function addShelvingDetails(width, depth, height, carcassMaterial, accentMaterial) {
  const columns = 3;
  const rows = 4;
  const bayWidth = width / columns;
  const shelfGap = height / rows;

  for (let column = 1; column < columns; column += 1) {
    addPanel(0.024, height - 0.06, depth - 0.05, carcassMaterial, -width / 2 + bayWidth * column, height / 2, 0);
  }

  for (let row = 1; row < rows; row += 1) {
    addPanel(width - 0.06, 0.022, depth - 0.05, carcassMaterial, 0, shelfGap * row, 0);
  }

  for (let column = 0; column < columns; column += 1) {
    const x = -width / 2 + bayWidth * column + bayWidth / 2;
    const decor = new THREE.Mesh(new THREE.BoxGeometry(bayWidth * 0.36, shelfGap * 0.34, depth * 0.34), accentMaterial);
    decor.position.set(x, shelfGap * 1.45, depth * 0.1);
    furniture.add(decor);
  }

  const sculpture = new THREE.Mesh(new THREE.TorusKnotGeometry(0.08, 0.028, 64, 8), new THREE.MeshStandardMaterial({ color: 0xd9cfbf, roughness: 0.3, metalness: 0.1 }));
  sculpture.position.set(width * 0.26, height * 0.77, 0.04);
  furniture.add(sculpture);
}

function addMediaConsoleDetails(width, depth, height, carcassMaterial, accentMaterial) {
  addPanel(width + 0.02, 0.05, depth + 0.04, new THREE.MeshStandardMaterial({ color: 0x847163, roughness: 0.35 }), 0, height - 0.025, 0);

  const bayWidth = width / 3;
  for (let bay = 0; bay < 3; bay += 1) {
    const centerX = -width / 2 + bayWidth * bay + bayWidth / 2;
    addFrontTreatment(bayWidth - 0.04, height * 0.7, centerX, height * 0.38, depth / 2 + 0.014, accentMaterial);
    addFingerPull(bayWidth - 0.08, height * 0.72, depth / 2 + 0.022);
  }

  const screenFrame = new THREE.Mesh(new THREE.BoxGeometry(width * 0.72, height * 1.32, 0.04), new THREE.MeshStandardMaterial({ color: 0x151515, roughness: 0.4 }));
  screenFrame.position.set(0, height * 1.24, -depth / 2 + 0.04);
  furniture.add(screenFrame);

  const screen = new THREE.Mesh(new THREE.BoxGeometry(width * 0.67, height * 1.22, 0.016), new THREE.MeshStandardMaterial({ color: 0x1f262f, roughness: 0.28, metalness: 0.06 }));
  screen.position.set(0, height * 1.24, -depth / 2 + 0.065);
  furniture.add(screen);
}

function addDeskDetails(width, depth, height, carcassMaterial, accentMaterial) {
  addPanel(width, 0.05, depth, new THREE.MeshStandardMaterial({ color: 0xa48e74, roughness: 0.38 }), 0, height - 0.025, 0);

  addPanel(0.08, height - 0.05, depth, carcassMaterial, -width / 2 + 0.04, (height - 0.05) / 2, 0);
  addPanel(0.08, height - 0.05, depth, carcassMaterial, width / 2 - 0.04, (height - 0.05) / 2, 0);

  addPanel(width * 0.28, height * 0.64, depth * 0.92, carcassMaterial, width * 0.28, height * 0.32, 0);
  for (let drawer = 0; drawer < 3; drawer += 1) {
    const y = height * 0.18 + drawer * 0.17;
    addFrontTreatment(width * 0.24, 0.14, width * 0.28, y, depth / 2 + 0.015, accentMaterial);
    addHandle(width * 0.28, y, depth / 2 + 0.034, false);
  }

  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.46), new THREE.MeshStandardMaterial({ color: 0x847a6d, roughness: 0.72 }));
  chairSeat.position.set(-width * 0.08, 0.45, 0.05);
  furniture.add(chairSeat);

  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.5, 0.06), new THREE.MeshStandardMaterial({ color: 0x847a6d, roughness: 0.72 }));
  chairBack.position.set(-width * 0.08, 0.73, -0.15);
  furniture.add(chairBack);
}

function updateEnvironment() {
  if (!floorMesh || !backWallMesh || !leftWallMesh || !rightWallMesh || !rugMesh) return;

  const roomWidth = config.roomWidth / 100;
  const roomDepth = config.roomDepth / 100;
  const roomHeight = config.roomHeight / 100;

  floorMesh.scale.set(roomWidth / 10, roomDepth / 10, 1);
  backWallMesh.scale.set(roomWidth / 10, roomHeight / 10, 1);
  backWallMesh.position.set(0, roomHeight / 2, -roomDepth / 2);

  leftWallMesh.scale.set(roomDepth / 10, roomHeight / 10, 1);
  leftWallMesh.position.set(-roomWidth / 2, roomHeight / 2, 0);

  rightWallMesh.scale.set(roomDepth / 10, roomHeight / 10, 1);
  rightWallMesh.position.set(roomWidth / 2, roomHeight / 2, 0);

  const wallColor = wallTones[config.wallTone] || wallTones['soft-ivory'];
  backWallMesh.material.color.setHex(wallColor);
  leftWallMesh.material.color.setHex(wallColor);
  rightWallMesh.material.color.setHex(wallColor);

  floorMesh.material.color.setHex(floorTones[config.floorTone] || floorTones['oak-floor']);
  rugMesh.position.z = Math.min(roomDepth / 2 - 0.8, 0.8);
}

function updateFurniturePlacement(width, depth, height) {
  if (!furniture) return;

  const roomWidth = config.roomWidth / 100;
  const roomDepth = config.roomDepth / 100;

  furniture.rotation.y = 0;
  let x = 0;
  let z = -roomDepth / 2 + depth / 2 + 0.02;

  if (config.placement === 'back-left') {
    x = -roomWidth / 2 + width / 2 + 0.18;
  }

  if (config.placement === 'back-right') {
    x = roomWidth / 2 - width / 2 - 0.18;
  }

  if (config.placement === 'side-left') {
    x = -roomWidth / 2 + depth / 2 + 0.02;
    z = -roomDepth / 2 + width / 2 + 0.24;
    furniture.rotation.y = Math.PI / 2;
  }

  if (config.placement === 'side-right') {
    x = roomWidth / 2 - depth / 2 - 0.02;
    z = -roomDepth / 2 + width / 2 + 0.24;
    furniture.rotation.y = -Math.PI / 2;
  }

  furniture.position.set(x, 0, z);

  const targetY = config.type === 'media' ? height * 0.55 : Math.max(height * 0.55, 0.95);
  camera.lookAt(new THREE.Vector3(x, targetY, z));
}

function applyCameraMode() {
  if (!camera) return;

  const target = new THREE.Vector3(furniture?.position.x || 0, Math.max(config.height / 100 * 0.55, 0.9), furniture?.position.z || -1.2);

  if (config.cameraMode === 'front') {
    camera.position.set(target.x, target.y + 0.3, target.z + 4.7);
    camera.lookAt(target);
    return;
  }

  if (config.cameraMode === 'side') {
    camera.position.set(target.x + 4.7, target.y + 0.25, target.z + 0.2);
    camera.lookAt(target);
    return;
  }

  if (config.cameraMode === 'top') {
    camera.position.set(target.x, target.y + 5.8, target.z + 0.1);
    camera.lookAt(target);
    return;
  }

  const x = target.x + cameraState.radius * Math.sin(cameraState.yaw) * Math.cos(cameraState.pitch);
  const y = target.y + cameraState.radius * Math.sin(cameraState.pitch) + 0.55;
  const z = target.z + cameraState.radius * Math.cos(cameraState.yaw) * Math.cos(cameraState.pitch);
  camera.position.set(x, y, z);
  camera.lookAt(target);
}

function updateMeasurementOverlay() {
  const furnitureText = `${config.width} x ${config.depth} x ${config.height} cm`;
  const roomText = `${config.roomWidth} x ${config.roomDepth} x ${config.roomHeight} cm`;
  const placementText = {
    'back-center': 'Back wall centered',
    'back-left': 'Back wall left',
    'back-right': 'Back wall right',
    'side-left': 'Left wall',
    'side-right': 'Right wall'
  }[config.placement];

  const furnitureNode = getElement('measurement-furniture');
  const roomNode = getElement('measurement-room');
  const placementNode = getElement('measurement-placement');

  if (furnitureNode) furnitureNode.textContent = furnitureText;
  if (roomNode) roomNode.textContent = roomText;
  if (placementNode) placementNode.textContent = placementText;
}

function onWindowResize() {
  const canvas = getElement('canvas3d');
  if (!canvas || !camera || !renderer) return;

  const width = canvas.clientWidth || canvas.parentElement.clientWidth;
  const height = canvas.clientHeight || canvas.parentElement.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

function animate() {
  requestAnimationFrame(animate);
  if (!renderer || !scene || !camera) return;
  if (config.cameraMode === 'perspective') {
    applyCameraMode();
  }
  renderer.render(scene, camera);
}

function setupControls(canvas) {
  canvas.addEventListener('mousedown', (event) => {
    if (config.cameraMode !== 'perspective') return;
    cameraState.dragging = true;
    cameraState.pointerX = event.clientX;
    cameraState.pointerY = event.clientY;
  });

  canvas.addEventListener('mousemove', (event) => {
    if (!cameraState.dragging || config.cameraMode !== 'perspective') return;
    const deltaX = event.clientX - cameraState.pointerX;
    const deltaY = event.clientY - cameraState.pointerY;
    cameraState.yaw -= deltaX * 0.01;
    cameraState.pitch = clamp(cameraState.pitch - deltaY * 0.008, -0.2, 0.6);
    cameraState.pointerX = event.clientX;
    cameraState.pointerY = event.clientY;
  });

  ['mouseup', 'mouseleave'].forEach((eventName) => {
    canvas.addEventListener(eventName, () => {
      cameraState.dragging = false;
    });
  });

  canvas.addEventListener('wheel', (event) => {
    if (config.cameraMode !== 'perspective') return;
    event.preventDefault();
    cameraState.radius = clamp(cameraState.radius + (event.deltaY > 0 ? 0.35 : -0.35), cameraState.minRadius, cameraState.maxRadius);
  }, { passive: false });
}

function syncInputs() {
  const inputMap = {
    'furniture-type-3d': config.type,
    'material-3d': config.material,
    'finish-3d': config.finish,
    'front-style-3d': config.frontStyle,
    'hardware-3d': config.hardware,
    'placement-3d': config.placement,
    'wall-tone-3d': config.wallTone,
    'floor-tone-3d': config.floorTone,
    'width-slider': String(config.width),
    'depth-slider': String(config.depth),
    'height-slider': String(config.height),
    'room-width-slider': String(config.roomWidth),
    'room-depth-slider': String(config.roomDepth),
    'room-height-slider': String(config.roomHeight)
  };

  Object.entries(inputMap).forEach(([id, value]) => {
    const node = getElement(id);
    if (node) node.value = value;
  });

  getElement('width-display').textContent = String(config.width);
  getElement('depth-display').textContent = String(config.depth);
  getElement('height-display').textContent = String(config.height);
  getElement('room-width-display').textContent = String(config.roomWidth);
  getElement('room-depth-display').textContent = String(config.roomDepth);
  getElement('room-height-display').textContent = String(config.roomHeight);
}

function syncPresetButtons() {
  document.querySelectorAll('.preset-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.preset === config.type);
  });
}

function syncCameraButtons() {
  document.querySelectorAll('.camera-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.camera === config.cameraMode);
  });
}

function refreshScene() {
  updateEnvironment();
  createFurniture();
  applyCameraMode();
}

function applyPreset(name) {
  if (!presets[name]) return;
  config = { ...presets[name] };
  cameraState.radius = 5.2;
  cameraState.yaw = -0.65;
  cameraState.pitch = 0.22;
  syncInputs();
  syncPresetButtons();
  syncCameraButtons();
  refreshScene();
}

function exportDesign() {
  const configData = JSON.stringify(config, null, 2);
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(configData)}`);
  element.setAttribute('download', 'obsido-visualizer-design.json');
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

function buildVisualizerSummary() {
  const furnitureNames = {
    kitchen: 'Kitchen Cabinet',
    wardrobe: 'Wardrobe',
    shelving: 'Shelving Unit',
    media: 'Media Console',
    desk: 'Built-In Desk'
  };

  const placementNames = {
    'back-center': 'back wall centered',
    'back-left': 'back wall left',
    'back-right': 'back wall right',
    'side-left': 'left wall',
    'side-right': 'right wall'
  };

  return [
    furnitureNames[config.type],
    `${config.width}x${config.depth}x${config.height}cm`,
    `${config.material} ${config.finish}`,
    `${config.frontStyle} fronts`,
    `${config.hardware} hardware`,
    `${config.roomWidth}x${config.roomDepth} room`,
    placementNames[config.placement]
  ].join(' • ');
}

function getEstimatorFurnitureType() {
  if (config.type === 'kitchen') return config.width >= 240 ? 'kitchen-premium' : 'kitchen-basic';
  if (config.type === 'wardrobe') return config.width >= 260 ? 'wardrobe-luxury' : 'wardrobe-standard';
  if (config.type === 'shelving') return 'custom-shelving';
  if (config.type === 'desk') return 'custom-desk';
  if (config.type === 'media') return 'custom-shelving';
  return 'custom-shelving';
}

function sendDesignToEstimator() {
  const request = {
    furnitureType: getEstimatorFurnitureType(),
    quantity: 1,
    visualizerSummary: buildVisualizerSummary()
  };

  localStorage.setItem('visualizerEstimateRequest', JSON.stringify(request));
  window.location.href = 'estimator.html?source=visualizer';
}

function bindSelect(id, key) {
  const node = getElement(id);
  if (!node) return;
  node.addEventListener('change', (event) => {
    config[key] = event.target.value;
    syncPresetButtons();
    if (key === 'cameraMode') {
      syncCameraButtons();
    }
    refreshScene();
  });
}

function bindSlider(id, displayId, key) {
  const node = getElement(id);
  const displayNode = getElement(displayId);
  if (!node) return;
  node.addEventListener('input', (event) => {
    config[key] = Number(event.target.value);
    if (displayNode) displayNode.textContent = String(config[key]);
    syncPresetButtons();
    refreshScene();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  syncInputs();
  syncPresetButtons();
  syncCameraButtons();
  setTimeout(initThreeJS, 100);

  bindSelect('furniture-type-3d', 'type');
  bindSelect('material-3d', 'material');
  bindSelect('finish-3d', 'finish');
  bindSelect('front-style-3d', 'frontStyle');
  bindSelect('hardware-3d', 'hardware');
  bindSelect('placement-3d', 'placement');
  bindSelect('wall-tone-3d', 'wallTone');
  bindSelect('floor-tone-3d', 'floorTone');

  bindSlider('width-slider', 'width-display', 'width');
  bindSlider('depth-slider', 'depth-display', 'depth');
  bindSlider('height-slider', 'height-display', 'height');
  bindSlider('room-width-slider', 'room-width-display', 'roomWidth');
  bindSlider('room-depth-slider', 'room-depth-display', 'roomDepth');
  bindSlider('room-height-slider', 'room-height-display', 'roomHeight');

  document.querySelectorAll('.preset-button').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.preset));
  });

  document.querySelectorAll('.camera-button').forEach((button) => {
    button.addEventListener('click', () => {
      config.cameraMode = button.dataset.camera;
      syncCameraButtons();
      applyCameraMode();
    });
  });

  const resetButton = getElement('reset-visualizer');
  if (resetButton) {
    resetButton.addEventListener('click', () => applyPreset('kitchen'));
  }

  const exportButton = getElement('export-visualizer');
  if (exportButton) {
    exportButton.addEventListener('click', exportDesign);
  }

  const estimateButton = getElement('send-to-estimate');
  if (estimateButton) {
    estimateButton.addEventListener('click', sendDesignToEstimator);
  }
});
