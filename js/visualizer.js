/* ============================================
   3D VISUALIZER - JAVASCRIPT (Three.js)
   ============================================ */

let scene, camera, renderer, furniture;
let controls;

// Material colors
const materialColors = {
  oak: 0xD2B48C,
  walnut: 0x5C4033,
  white: 0xF5F5F5,
  taupe: 0xA89968
};

// Finish properties
const finishProps = {
  matte: { roughness: 0.9, metalness: 0 },
  gloss: { roughness: 0.1, metalness: 0.1 },
  natural: { roughness: 0.6, metalness: 0 }
};

// Configuration state
let config = {
  type: 'kitchen',
  width: 120,
  depth: 60,
  height: 90,
  material: 'taupe',
  finish: 'matte'
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
  scene.add(directionalLight);
  
  // Grid
  const gridHelper = new THREE.GridHelper(10, 10, 0x444444, 0x222222);
  gridHelper.position.y = 0;
  scene.add(gridHelper);
  
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
  
  // Material
  const color = materialColors[config.material];
  const finish = finishProps[config.finish];
  const material = new THREE.MeshStandardMaterial({
    color: color,
    ...finish
  });
  
  // Main cabinet body
  const bodyGeometry = new THREE.BoxGeometry(scaledWidth, scaledHeight, scaledDepth);
  const bodyMesh = new THREE.Mesh(bodyGeometry, material);
  bodyMesh.position.y = scaledHeight / 2;
  bodyMesh.castShadow = true;
  bodyMesh.receiveShadow = true;
  furniture.add(bodyMesh);
  
  // Cabinet doors
  if (config.type === 'kitchen' || config.type === 'wardrobe') {
    // Left door
    const doorGeometry = new THREE.BoxGeometry(scaledWidth / 2.2, scaledHeight * 0.9, 0.02);
    const leftDoor = new THREE.Mesh(doorGeometry, material);
    leftDoor.position.set(-scaledWidth / 4, scaledHeight / 2, scaledDepth / 2 + 0.01);
    leftDoor.castShadow = true;
    furniture.add(leftDoor);
    
    // Right door
    const rightDoor = new THREE.Mesh(doorGeometry, material);
    rightDoor.position.set(scaledWidth / 4, scaledHeight / 2, scaledDepth / 2 + 0.01);
    rightDoor.castShadow = true;
    furniture.add(rightDoor);
  }
  
  // Shelves for shelving unit
  if (config.type === 'shelving') {
    const shelfGeometry = new THREE.BoxGeometry(scaledWidth * 0.95, 0.02, scaledDepth * 0.95);
    for (let i = 0; i < 3; i++) {
      const shelf = new THREE.Mesh(shelfGeometry, material);
      shelf.position.y = scaledHeight * (0.25 + i * 0.25);
      shelf.castShadow = true;
      furniture.add(shelf);
    }
  }
  
  // Base/feet
  const feetGeometry = new THREE.BoxGeometry(0.08, 0.1, 0.08);
  const feetPositions = [
    [-scaledWidth / 3, 0.05, -scaledDepth / 3],
    [scaledWidth / 3, 0.05, -scaledDepth / 3],
    [-scaledWidth / 3, 0.05, scaledDepth / 3],
    [scaledWidth / 3, 0.05, scaledDepth / 3]
  ];
  
  feetPositions.forEach(pos => {
    const foot = new THREE.Mesh(feetGeometry, material);
    foot.position.set(...pos);
    foot.castShadow = true;
    furniture.add(foot);
  });
  
  scene.add(furniture);
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
    camera.position.x = zoomRadius * Math.sin(rotation.y + autoRotateAngle) * Math.cos(rotation.x);
    camera.position.y = zoomRadius * Math.sin(rotation.x) + 1;
    camera.position.z = zoomRadius * Math.cos(rotation.y + autoRotateAngle) * Math.cos(rotation.x);
    
    camera.lookAt(0, 1, 0);
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
});

function resetVisualizer() {
  config = {
    type: 'kitchen',
    width: 120,
    depth: 60,
    height: 90,
    material: 'taupe',
    finish: 'matte'
  };
  
  // Reset form
  document.getElementById('furniture-type-3d').value = 'kitchen';
  document.getElementById('material-3d').value = 'taupe';
  document.getElementById('finish-3d').value = 'matte';
  document.getElementById('width-slider').value = 120;
  document.getElementById('depth-slider').value = 60;
  document.getElementById('height-slider').value = 90;
  document.getElementById('width-display').textContent = '120';
  document.getElementById('depth-display').textContent = '60';
  document.getElementById('height-display').textContent = '90';
  
  createFurniture();
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
