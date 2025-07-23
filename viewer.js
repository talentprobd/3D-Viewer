
import * as THREE from 'https://cdn.skypack.dev/three@0.150.1';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.150.1/examples/jsm/controls/OrbitControls.js';

const modelList = ['models/Duck.glb'];
let currentModel = null;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);

// Camera
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(2, 2, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.screenSpacePanning = true;

// Lighting
const ambientLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

// Grid Helper
const gridHelper = new THREE.GridHelper(10, 10);
scene.add(gridHelper);

// Loader
const loader = new GLTFLoader();

function loadModel(path) {
  if (currentModel) {
    scene.remove(currentModel);
  }

  loader.load(path, (gltf) => {
    currentModel = gltf.scene;
    scene.add(currentModel);
    fitCameraToObject(currentModel);
  }, undefined, (error) => {
    console.error("Error loading model:", error);
  });
}

function fitCameraToObject(object) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  const distance = maxDim / (2 * Math.tan(fov / 2));

  camera.position.set(center.x, center.y, center.z + distance * 2);
  camera.near = distance / 10;
  camera.far = distance * 10;
  camera.updateProjectionMatrix();

  controls.target.copy(center);
  controls.update();
}

// Populate dropdown
const selector = document.getElementById('modelSelector');
modelList.forEach((modelPath, index) => {
  const option = document.createElement('option');
  option.value = modelPath;
  option.textContent = modelPath.split('/').pop();
  selector.appendChild(option);
});
selector.addEventListener('change', (e) => {
  loadModel(e.target.value);
});

// Load first model
loadModel(modelList[0]);

// Animate
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Responsive canvas
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
