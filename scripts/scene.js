/**
 * THE ARCHIVE - SCENE MODULE
 * Three.js scene, camera, renderer setup and animation loop
 */

import { initClickDetection, detectBodyClick } from './click-detection.js';

// Scene globals
export let scene, camera, renderer;

// Mouse interaction state
let isDragging = false;
let previousMouse = { x: 0, y: 0 };
let mouseDownPos = { x: 0, y: 0 };

/**
 * Initialize Three.js scene, camera, and renderer
 */
export function initScene() {
  const earthCanvas = document.getElementById('earthCanvas');
  
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 3.5;

  renderer = new THREE.WebGLRenderer({ 
    canvas: earthCanvas,
    antialias: true, 
    alpha: true 
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Initialize click detection
  initClickDetection(camera);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(5, 2, 3);
  scene.add(sunLight);
  
  // Mouse controls
  earthCanvas.addEventListener('mousedown', onMouseDown);
  earthCanvas.addEventListener('mousemove', onMouseMove);
  earthCanvas.addEventListener('mouseup', onMouseUp);
  earthCanvas.addEventListener('wheel', onWheel);
  
  return { scene, camera, renderer };
}

/**
 * Handle window resize
 */
export function handleResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

/**
 * Mouse interaction handlers
 */
function onMouseDown(e) {
  isDragging = true;
  previousMouse = { x: e.clientX, y: e.clientY };
  mouseDownPos = { x: e.clientX, y: e.clientY };
}

function onMouseMove(e) {
  if (!isDragging) return;
  
  const deltaX = e.clientX - previousMouse.x;
  const deltaY = e.clientY - previousMouse.y;
  
  // Debug: log dragging
  if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
    console.log('🎬 Dragging:', { deltaX, deltaY, earth: !!window.earth, moon: !!window.moon });
  }
  
  // Rotate whichever body is being viewed
  if (window.earth) {
    window.earth.rotation.y += deltaX * 0.005;
    window.earth.rotation.x += deltaY * 0.005;
  }
  if (window.nightLights) {
    window.nightLights.rotation.y += deltaX * 0.005;
    window.nightLights.rotation.x += deltaY * 0.005;
  }
  if (window.moon) {
    window.moon.rotation.y += deltaX * 0.005;
    window.moon.rotation.x += deltaY * 0.005;
  }
  
  previousMouse = { x: e.clientX, y: e.clientY };
}

function onMouseUp(e) {
  isDragging = false;
  
  // Check if it was a click (not a drag)
  const moveThreshold = 5;
  const moved = Math.abs(e.clientX - mouseDownPos.x) > moveThreshold || 
                Math.abs(e.clientY - mouseDownPos.y) > moveThreshold;
  
  if (!moved) {
    // Handle body click
    const rect = e.target.getBoundingClientRect();
    detectBodyClick(e, rect);
  }
}

function onWheel(e) {
  e.preventDefault();
  camera.position.z += e.deltaY * 0.001;
  camera.position.z = Math.max(1.5, Math.min(5, camera.position.z));
}

/**
 * Check if user is currently dragging
 */
export function getIsDragging() {
  return isDragging;
}
