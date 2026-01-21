/**
 * THE ARCHIVE - SCENE MODULE (UPDATED)
 * Three.js scene, camera, renderer setup and interaction loop
 */

import { initClickDetection, detectBodyClick } from './click-detection.js';

// Scene globals
export let scene, camera, renderer;

/* ============================
   Camera orbit (mobile-first)
============================ */

const cameraTarget = new THREE.Vector3(0, 0, 0);

let spherical = {
  radius: 3.5,
  theta: Math.PI / 2,
  phi: Math.PI / 2
};

const CAMERA_LIMITS = {
  minRadius: 1.6,
  maxRadius: 6.0,
  minPhi: 0.2,
  maxPhi: Math.PI - 0.2
};

/**
 * NEW: Update camera orbit target (for moon rotation)
 */
export function setCameraTarget(newTarget) {
  cameraTarget.copy(newTarget);
  updateCameraFromSpherical();
}

function updateCameraFromSpherical() {
  camera.position.x =
    cameraTarget.x +
    spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta);

  camera.position.y =
    cameraTarget.y +
    spherical.radius * Math.cos(spherical.phi);

  camera.position.z =
    cameraTarget.z +
    spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta);

  camera.lookAt(cameraTarget);
}

/* ============================
   Interaction state
============================ */

let isDragging = false;
let previousPoint = { x: 0, y: 0 };
let pointerDownPos = { x: 0, y: 0 };
let lastPinchDistance = null;

/* ============================
   Init Scene
============================ */

export function initScene() {
  const earthCanvas = document.getElementById('earthCanvas');

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    canvas: earthCanvas,
    antialias: true,
    alpha: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  updateCameraFromSpherical();

  // Click detection (raycasting etc.)
  initClickDetection(camera);

  // Lighting
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(5, 2, 3);
  scene.add(sunLight);

  // Desktop input
  earthCanvas.addEventListener('mousedown', onPointerDown);
  earthCanvas.addEventListener('mousemove', onPointerMove);
  earthCanvas.addEventListener('mouseup', onPointerUp);
  earthCanvas.addEventListener('wheel', onWheel, { passive: false });

  // Mobile input
  earthCanvas.addEventListener('touchstart', onTouchStart, { passive: false });
  earthCanvas.addEventListener('touchmove', onTouchMove, { passive: false });
  earthCanvas.addEventListener('touchend', onTouchEnd);

  return { scene, camera, renderer };
}

/* ============================
   Resize
============================ */

export function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

/* ============================
   Desktop (mouse)
============================ */

function onPointerDown(e) {
  isDragging = true;
  previousPoint = { x: e.clientX, y: e.clientY };
  pointerDownPos = { ...previousPoint };
}

function onPointerMove(e) {
  if (!isDragging) return;

  const dx = e.clientX - previousPoint.x;
  const dy = e.clientY - previousPoint.y;

  const ROTATE_SPEED = 0.005;

  spherical.theta += dx * ROTATE_SPEED;
  spherical.phi -= dy * ROTATE_SPEED;

  spherical.phi = clamp(
    spherical.phi,
    CAMERA_LIMITS.minPhi,
    CAMERA_LIMITS.maxPhi
  );

  updateCameraFromSpherical();
  previousPoint = { x: e.clientX, y: e.clientY };
}

function onPointerUp(e) {
  isDragging = false;

  const moved =
    Math.abs(e.clientX - pointerDownPos.x) > 5 ||
    Math.abs(e.clientY - pointerDownPos.y) > 5;

  if (!moved) {
    const rect = e.target.getBoundingClientRect();
    detectBodyClick(e, rect);
  }
}

function onWheel(e) {
  e.preventDefault();

  spherical.radius += e.deltaY * 0.002;
  spherical.radius = clamp(
    spherical.radius,
    CAMERA_LIMITS.minRadius,
    CAMERA_LIMITS.maxRadius
  );

  updateCameraFromSpherical();
}

/* ============================
   Mobile (touch)
============================ */

function onTouchStart(e) {
  if (e.touches.length === 1) {
    isDragging = true;
    previousPoint = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    pointerDownPos = { ...previousPoint };
  } else if (e.touches.length === 2) {
    lastPinchDistance = pinchDistance(e.touches);
  }
}

function onTouchMove(e) {
  e.preventDefault();

  // Pinch zoom
  if (e.touches.length === 2) {
    const dist = pinchDistance(e.touches);
    const delta = dist - lastPinchDistance;

    spherical.radius -= delta * 0.01;
    spherical.radius = clamp(
      spherical.radius,
      CAMERA_LIMITS.minRadius,
      CAMERA_LIMITS.maxRadius
    );

    updateCameraFromSpherical();
    lastPinchDistance = dist;
    return;
  }

  // One finger orbit
  if (!isDragging || e.touches.length !== 1) return;

  const dx = e.touches[0].clientX - previousPoint.x;
  const dy = e.touches[0].clientY - previousPoint.y;

  const ROTATE_SPEED = 0.005;

  spherical.theta += dx * ROTATE_SPEED;
  spherical.phi -= dy * ROTATE_SPEED;

  spherical.phi = clamp(
    spherical.phi,
    CAMERA_LIMITS.minPhi,
    CAMERA_LIMITS.maxPhi
  );

  updateCameraFromSpherical();

  previousPoint = {
    x: e.touches[0].clientX,
    y: e.touches[0].clientY
  };
}

function onTouchEnd(e) {
  isDragging = false;

  if (!e.changedTouches || e.changedTouches.length === 0) return;

  const touch = e.changedTouches[0];
  const moved =
    Math.abs(touch.clientX - pointerDownPos.x) > 10 ||
    Math.abs(touch.clientY - pointerDownPos.y) > 10;

  if (!moved) {
    const rect = e.target.getBoundingClientRect();
    detectBodyClick(touch, rect);
  }

  lastPinchDistance = null;
}

/* ============================
   Utils
============================ */

function pinchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function getIsDragging() {
  return isDragging;
}