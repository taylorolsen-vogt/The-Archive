/**
 * THE ARCHIVE - BODY NAVIGATION MODULE
 * Handle camera transitions when bodies are clicked
 */

import { setIsTransitioning, getIsTransitioning } from './transition-state.js';
import { scene, camera, renderer } from './scene.js';
import { getMoon, setMoonOrbitActive, positionMoonForFocus, resetMoonSize } from './moon.js';

// Current focused body
let currentBody = 'earth'; // 'earth' or 'moon'

/**
 * Transition camera to Moon-centric view
 * Called from scene.js when Moon is clicked
 */
export function transitionToMoon() {
  if (currentBody === 'moon' || getIsTransitioning()) return;
  
  console.log('📡 Transitioning to Moon view...');
  setIsTransitioning(true);

  currentBody = 'moon';
  
  const moon = getMoon();
  if (!moon) return;
  
  // Stop the Moon from orbiting while we're focused on it
  setMoonOrbitActive(false);
  
  // Position Moon in front so it's clearly visible
  positionMoonForFocus();
  
  const moonPos = moon.position.clone();
  
  // Position camera further from Moon due to 4.5x scale
  const targetCameraPos = moonPos.clone();
  targetCameraPos.z += 2.0; // Further back to see the scaled Moon
  
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
  if (currentBody === 'earth' || getIsTransitioning()) return;
  
  console.log('📡 Transitioning to Earth view...');
  setIsTransitioning(true);
  currentBody = 'earth';
  
  // Resume Moon orbiting and reset size
  setMoonOrbitActive(true);
  resetMoonSize();
  
  const targetCameraPos = new THREE.Vector3(0, 0, 3.5);
  const targetLookAt = new THREE.Vector3(0, 0, 0);
  
  animateCameraToPosition(targetCameraPos, targetLookAt, 1500, () => {
    setIsTransitioning(false);
  });
  updateBodyBreadcrumb('earth');
  openEarthPanel();
}

/**
 * Animate camera to target position
 */
function animateCameraToPosition(targetPosition, targetLookAt, duration, onComplete) {
  const startPosition = camera.position.clone();
  const startLookAt = new THREE.Vector3(0, 0, 0);
  
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease in-out
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

/**
 * Update breadcrumb display
 */
function updateBodyBreadcrumb(body) {
  console.log('🗺️ Current body:', body);
  // TODO: Update UI breadcrumb
}

/**
 * Open Moon info panel with grey theme
 */
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
  
  // Clear events section (no clickable animation buttons on Moon panel)
  if (panelEvents) {
    panelEvents.innerHTML = '';
  }
  if (eventsSection) {
    eventsSection.style.display = 'none';
  }
  
  breadcrumb.innerHTML = `
    <span class="breadcrumb-item" onclick="window.transitionToEarth()" style="cursor: pointer;">Earth</span>
    <span class="breadcrumb-separator">›</span>
    <span class="breadcrumb-item current">Moon</span>
  `;
  
  panel.style.setProperty('--panel-accent', '#c0c0c0');
  panel.setAttribute('data-body', 'moon');
  panel.classList.add('visible');
}

/**
 * Open Earth info panel (restore when returning from Moon)
 */
function openEarthPanel() {
  const panel = document.getElementById('infoPanel');
  
  // Simply hide the panel when back at Earth
  // The timeline/Earth info will be shown through other UI elements
  if (panel && panel.classList.contains('visible')) {
    panel.classList.remove('visible');
  }
}

/**
 * Get current focused body
 */
export function getCurrentBody() {
  return currentBody;
}

// Make globally accessible for breadcrumb onclick
window.transitionToEarth = transitionToEarth;
