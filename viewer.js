import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';

// Models to load
const models = ['model1.glb', 'model2.glb', 'model3.glb'];
let currentIndex = 0;
let currentModel = null;

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = true;
controls.enablePan = true;
controls.enableRotate = true;
controls.screenSpacePanning = true;
controls.autoRotate = false;

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
scene.add(hemiLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
dirLight.position.set(10, 10, 10);
scene.add(dirLight);

// Grid
const grid = new THREE.GridHelper(10, 10);
scene.add(grid);

// Loader
const loader = new GLTFLoader();

// Load model and center camera
function loadModel(index) {
  const modelPath = models[index];

  if (currentModel) {
    scene.remove(currentModel);
  }

  loader.load(modelPath, (gltf) => {
    currentModel = gltf.scene;
    scene.add(currentModel);
    focusCameraOnModel(currentModel);
    updateModelName(modelPath);
  }, undefined, (err) => {
    console.error('Error loading model:', err);
  });
}

// Focus camera on model's bounding box
function focusCameraOnModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
  cameraZ *= 2.5;

  camera.position.set(center.x, center.y, cameraZ);
  camera.near = 0.1;
  camera.far = 1000;
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

// Update model name on screen
function updateModelName(name) {
  const label = document.getElementById('modelName');
  label.textContent = `Viewing: ${name}`;
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize listener
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Button controls
document.getElementById('next').addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % models.length;
  loadModel(currentIndex);
});

document.getElementById('prev').addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + models.length) % models.length;
  loadModel(currentIndex);
});

// Initial load
loadModel(currentIndex);
