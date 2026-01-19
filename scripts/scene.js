/**
 * THE ARCHIVE - SCENE MODULE
 * Three.js scene, camera, renderer setup and animation loop
 */

import { initClickDetection, detectBodyClick } from './click-detection.js';
import { getCurrentBody } from './body-navigation.js';

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
  
  // Touch controls for mobile
  earthCanvas.addEventListener('touchstart', onTouchStart);
  earthCanvas.addEventListener('touchmove', onTouchMove);
  earthCanvas.addEventListener('touchend', onTouchEnd);
  
  return { scene, camera, renderer };
}

/**
 * Detect if device is mobile
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
  
  // Only rotate the currently focused body
  const currentBody = getCurrentBody();
  
  if (currentBody === 'earth') {
    // Rotate Earth and night lights
    if (window.earth) {
      window.earth.rotation.y += deltaX * 0.005;
      window.earth.rotation.x += deltaY * 0.005;
    }
    if (window.nightLights) {
      window.nightLights.rotation.y += deltaX * 0.005;
      window.nightLights.rotation.x += deltaY * 0.005;
    }
  } else if (currentBody === 'moon') {
    // Rotate only the Moon
    if (window.moon) {
      window.moon.rotation.y += deltaX * 0.005;
      window.moon.rotation.x += deltaY * 0.005;
    }
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
 * Touch handlers for mobile
 */
function onTouchStart(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    mouseDownPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
}

function onTouchMove(e) {
  if (!isDragging || e.touches.length !== 1) return;
  
  const deltaX = e.touches[0].clientX - previousMouse.x;
  const deltaY = e.touches[0].clientY - previousMouse.y;
  
  // Get current focused body
  //const { getCurrentBody } = await import('./body-navigation.js');
  //const currentBody = getCurrentBody?.() || 'earth';
  
  if (currentBody === 'earth') {
    if (window.earth) {
      window.earth.rotation.y += deltaX * 0.005;
      window.earth.rotation.x += deltaY * 0.005;
    }
    if (window.nightLights) {
      window.nightLights.rotation.y += deltaX * 0.005;
      window.nightLights.rotation.x += deltaY * 0.005;
    }
  } else if (currentBody === 'moon') {
    if (window.moon) {
      window.moon.rotation.y += deltaX * 0.005;
      window.moon.rotation.x += deltaY * 0.005;
    }
  }
  
  previousMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
}

function onTouchEnd(e) {
  isDragging = false;
  
  // Check if it was a tap (not a drag)
  const moveThreshold = 10;
  const moved = Math.abs(e.changedTouches[0].clientX - mouseDownPos.x) > moveThreshold || 
                Math.abs(e.changedTouches[0].clientY - mouseDownPos.y) > moveThreshold;
  
  if (!moved && e.changedTouches.length === 0) {
    // Handle body tap
    const rect = e.target.getBoundingClientRect();
    detectBodyClick(e.changedTouches[0], rect);
  }
}

/**
 * Check if user is currently dragging
 */
export function getIsDragging() {
  return isDragging;
}
