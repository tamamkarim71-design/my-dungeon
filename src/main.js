
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x303040);

const hdrLoader = new HDRLoader();

hdrLoader.load(
  '/textures/environment.hdr',
  (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;

    scene.environment = texture;
    scene.background = texture;

    console.log('HDR loaded successfully!');
  },
  undefined,
  (error) => {
    console.error('HDR loading error:', error);
  }
);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.innerHTML = '';
document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

const torchLight = new THREE.PointLight(
  0xff7722,
  80,
  15
);

scene.add(torchLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Load Dungeon
const loader = new GLTFLoader();

loader.load('/models/dungeon.glb', (gltf) => {
  const dungeon = gltf.scene;
  scene.add(dungeon);

  const box = new THREE.Box3().setFromObject(dungeon);
  const center = box.getCenter(new THREE.Vector3());
  torchLight.position.set(
    center.x,
    box.min.y + 2.5,
    center.z
  );
  const size = box.getSize(new THREE.Vector3());
  console.log('Dungeon dimensions in meters:', size);
  const distance = Math.max(size.x, size.y, size.z);

  camera.position.set(
    center.x + distance * 0.65,
    center.y + distance * 0.35,
    center.z + distance * 0.65
  );

  camera.lookAt(center);
  controls.target.copy(center);
  controls.update();

  console.log('Dungeon loaded successfully!');
}, undefined, (error) => {
  console.error('Error loading Dungeon:', error);
});

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
