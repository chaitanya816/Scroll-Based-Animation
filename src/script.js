import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

// Base
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)


let mixer = null

gltfLoader.load(
    '/models/main.glb',
    (gltf) => {
        const children = [...gltf.scene.children];

        gltf.scene.rotation.set(80, 20, -10)
        gltf.scene.scale.set(.04,.04,.04)
        gltf.scene.position.set(-1, 1, 2)
        mixer = new THREE.AnimationMixer(gltf.scene)

        if (gltf.animations && gltf.animations.length > 0) {
            for (let i = 0; i < gltf.animations.length; i++) {
                mixer.clipAction(gltf.animations[i]).play();

            }
        }

        scene.add(gltf.scene)
    }
)

/**
 * Star
 */


const textureLoader = new THREE.TextureLoader()
const startextures=textureLoader.load('/textures/9.png')
const pointGeometry = new THREE.BufferGeometry()
const pointMaterial = new THREE.PointsMaterial()
pointMaterial.size = .3
pointMaterial.sizeAttenuation = true
pointMaterial.transparent=true
pointMaterial.alphaMap=startextures
const point = new THREE.Points(pointGeometry, pointMaterial)



/**
 * Custom Particels
 */

const count = 20000

const positions = new Float32Array(count * 3)
const colors= new Float32Array(count * 3)

for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random()-0.5)*100
    colors[i] = Math.random()
}

pointGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
)
pointGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
)
 pointMaterial.alphaTest=0.001
 pointMaterial.depthTest=0.001
pointMaterial.depthWrite=true

scene.add(point)









// Lights
const light = new THREE.DirectionalLight();
light.position.set(1, 1, 0);
scene.add(light);

// Textures
const texturesLoader = new THREE.TextureLoader();
const textures = [
  'textures/mercury.jpg',
  'textures/venus.jpg',
  'textures/earth.jpg',
  'textures/8k_mars.jpg',
  'textures/8k_jupiter.jpg',
  'textures/8k_saturn.jpg',
  'textures/2k_uranus.jpg',
  'textures/2k_neptune.jpg',
];

const textureMap = {};
textures.forEach((texturePath) => {
  const texture = texturesLoader.load(texturePath);
  texture.magFilter = THREE.NearestFilter;
  textureMap[texturePath] = texture;
});

// Materials
const materials = {};
textures.forEach((texturePath) => {
  materials[texturePath] = new THREE.MeshBasicMaterial({ map: textureMap[texturePath] });
});

// Objects
const objects = {};
textures.forEach((texturePath, index) => {
  const object = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), materials[texturePath]);
  object.position.x = (index % 2 === 0 ? 1 : -1) * 3;
  object.position.y = -index * 5;
  scene.add(object);
  objects[texturePath] = object;
});

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Camera
const cameraGroup = new THREE.Group();

scene.add(cameraGroup);

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
// camera.position.set(0, 0, 20);
camera.position.z = 10;
cameraGroup.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scroll
let scrollY;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
});

// Cursor
const cursor = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

// Animate
const clock = new THREE.Clock();
let previousTime = 0
const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Rotate objects
  for (const object of Object.values(objects)) {
    object.rotation.y = elapsedTime * 0.3;
  }

  // Camera animation
  camera.position.y = -scrollY / innerHeight * 5;

  // Cursor animation
  const parallaxX = cursor.x;
  const parallaxY = -cursor.y;
  cameraGroup.position.x = parallaxX;
  cameraGroup.position.y = parallaxY;


  if (mixer != null) {
    mixer.update(deltaTime)
}

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();


