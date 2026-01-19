/**
 * THE ARCHIVE - BODY NAVIGATION MODULE
 * Handle camera transitions when bodies are clicked
 * (Click detection is in click-detection.js)
 */

import { setTransitionFunctions } from './click-detection.js';
import { scene, camera, renderer } from './scene.js';
import { getMoon, setMoonOrbitActive, positionMoonForFocus } from './moon.js';

// Register transition functions with click-detection module
setTransitionFunctions(transitionToMoon, transitionToEarth);

// Current focused body
let currentBody = 'earth'; // 'earth' or 'moon'

/**
 * Transition camera to Moon-centric view
 * Called from scene.js when Moon is clicked
 */
export function transitionToMoon() {
  if (currentBody === 'moon') return;
  
  console.log('📡 Transitioning to Moon view...');
  currentBody = 'moon';
  
  const moon = getMoon();
  if (!moon) return;
  
  // Stop the Moon from orbiting while we're focused on it
  setMoonOrbitActive(false);
  
  // Position Moon in front so it's clearly visible
  positionMoonForFocus();
  
  const moonPos = moon.position.clone();
  
  // Position camera closer to Moon for a more zoomed-in view
  const targetCameraPos = moonPos.clone();
  targetCameraPos.z += 0.8; // Zoomed in closer than Earth view
  
  animateCameraToPosition(targetCameraPos, moonPos, 1500);
  updateBodyBreadcrumb('moon');
  openMoonPanel();
}

/**
 * Transition camera back to Earth-centric view
 */
export function transitionToEarth() {
  if (currentBody === 'earth') return;
  
  console.log('📡 Transitioning to Earth view...');
  currentBody = 'earth';
  
  // Resume Moon orbiting
  setMoonOrbitActive(true);
  
  const targetCameraPos = new THREE.Vector3(0, 0, 3.5);
  const targetLookAt = new THREE.Vector3(0, 0, 0);
  
  animateCameraToPosition(targetCameraPos, targetLookAt, 1500);
  updateBodyBreadcrumb('earth');
  openEarthPanel();
}

/**
 * Animate camera to target position
 */
function animateCameraToPosition(targetPosition, targetLookAt, duration) {
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
