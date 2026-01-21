/**
 * THE ARCHIVE - BODY NAVIGATION MODULE
 * Handle camera transitions when bodies are clicked
 */

import { setIsTransitioning, getIsTransitioning, setCurrentBody, getCurrentBody } from './transition-state.js';
import { scene, camera, renderer, setCameraTarget } from './scene.js';
import { getMoon, setMoonOrbitActive, resetMoonSize } from './moon.js';

/**
 * Transition camera to Moon-centric view
 */
export function transitionToMoon() {
  if (getCurrentBody() === 'moon' || getIsTransitioning()) return;

  console.log('📡 Transitioning to Moon view...');
  setIsTransitioning(true);
  setCurrentBody('moon');

  const moon = getMoon();
  if (!moon) return;

  setMoonOrbitActive(false);

  const moonPos = moon.position.clone();
  moon.scale.set(2.5, 2.5, 2.5);

  setCameraTarget(moonPos);

  const targetCameraPos = moonPos.clone();
  targetCameraPos.z += 1.2;

  animateCameraToPosition(targetCameraPos, moonPos, 1500, () => {
    setIsTransitioning(false);
  });

  updateBodyBreadcrumb('moon');
  openMoonPanel();
}

/**
 * Transition camera back to Earth-centric view
 */
export function transitionToEarth() {
  if (getCurrentBody() === 'earth' || getIsTransitioning()) return;

  console.log('📡 Transitioning to Earth view...');
  setIsTransitioning(true);
  setCurrentBody('earth');

  setMoonOrbitActive(true);
  resetMoonSize();

  setCameraTarget(new THREE.Vector3(0, 0, 0));

  const targetCameraPos = new THREE.Vector3(0, 0, 3.5);
  const targetLookAt = new THREE.Vector3(0, 0, 0);

  animateCameraToPosition(targetCameraPos, targetLookAt, 1500, () => {
    setIsTransitioning(false);
  });

  updateBodyBreadcrumb('earth');
  openEarthPanel();
}

function animateCameraToPosition(targetPosition, targetLookAt, duration, onComplete) {
  const startPosition = camera.position.clone();
  const startLookAt = new THREE.Vector3(0, 0, 0);
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    camera.position.lerpVectors(startPosition, targetPosition, eased);
    const currentLookAt = new THREE.Vector3();
    currentLookAt.lerpVectors(startLookAt, targetLookAt, eased);
    camera.lookAt(currentLookAt);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else if (onComplete) {
      onComplete();
    }
  }
  animate();
}

function updateBodyBreadcrumb(body) {
  console.log('🗺️ Current body:', body);
}

function openMoonPanel() {
  const panel = document.getElementById('infoPanel');
  const panelTitle = document.getElementById('panelTitle');
  const panelDate = document.getElementById('panelDate');
  const panelDescription = document.getElementById('panelDescription');
  const panelEvents = document.getElementById('panelEvents');
  const eventsSection = document.getElementById('eventsSection');
  const breadcrumb = document.getElementById('panelBreadcrumb');

  panelTitle.textContent = 'The Moon';
  panelDate.textContent = 'Formed ~4.5 Billion Years Ago';
  panelDescription.textContent = 'Earth\'s only natural satellite. Formed from debris after a Mars-sized body (Theia) collided with early Earth. The Moon stabilizes Earth\'s axial tilt and creates tides.';

  if (panelEvents) panelEvents.innerHTML = '';
  if (eventsSection) eventsSection.style.display = 'none';

  breadcrumb.innerHTML = `
    <span class="breadcrumb-item" onclick="window.transitionToEarth()" style="cursor: pointer;">Earth</span>
    <span class="breadcrumb-separator">›</span>
    <span class="breadcrumb-item current">Moon</span>
  `;

  panel.style.setProperty('--panel-accent', '#c0c0c0');
  panel.setAttribute('data-body', 'moon');
  panel.classList.add('visible');
}

function openEarthPanel() {
  const panel = document.getElementById('infoPanel');
  if (panel && panel.classList.contains('visible')) {
    panel.classList.remove('visible');
  }
}

window.transitionToEarth = transitionToEarth;