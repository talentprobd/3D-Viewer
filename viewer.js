import * as THREE from 'https://unpkg.com/three@0.150.1/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.150.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.150.1/examples/jsm/controls/OrbitControls.js';

// MODEL LIST (can expand!)
const models = [
  'models/Duck.glb',
  'models/Car.glb',
  'models/Robot.glb'
];

let currentModel;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lighting
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Loader
const loader = new GLTFLoader();

function loadModel(url) {
  if (currentModel) scene.remove(currentModel);

  loader.load(url, (gltf) => {
    currentModel = gltf.scene;
    scene.add(currentModel);
    centerModel(currentModel);
  });
}

function centerModel(model) {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  controls.target.copy(center);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Populate dropdown
const selector = document.getElementById('modelSelector');
models.forEach(path => {
  const option = document.createElement('option');
  option.value = path;
  option.textContent = path.split('/').pop();
  selector.appendChild(option);
});
selector.addEventListener('change', e => loadModel(e.target.value));

// Load first model
loadModel(models[0]);

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
