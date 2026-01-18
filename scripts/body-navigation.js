/**
 * THE ARCHIVE - BODY NAVIGATION MODULE
 * Handle clicking on celestial bodies and camera transitions
 */

import { scene, camera, renderer } from './scene.js';
import { getMoon } from './moon.js';
import { getEarth } from './earth.js';

// Current focused body
let currentBody = 'earth'; // 'earth' or 'moon'

// Raycaster for click detection
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/**
 * Initialize body click detection
 */
export function initBodyNavigation() {
  const earthCanvas = document.getElementById('earthCanvas');
  
  // Track mouse position on move
  earthCanvas.addEventListener('mousemove', onMouseMove);
  
  // Detect click (short click without dragging)
  earthCanvas.addEventListener('mouseup', onMouseUp);
}

/**
 * Track mouse position for raycasting
 */
let mouseDownPos = { x: 0, y: 0 };

function onMouseMove(event) {
  const rect = event.target.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
}

/**
 * Handle mouse up - detect if it was a click (not a drag)
 */
function onMouseUp(event) {
  // Record mouse down position to detect drags vs clicks
  if (!mouseDownPos.hasOwnProperty('isDragging')) {
    // Check if movement was minimal (click, not drag)
    const rect = event.target.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    
    // If mouse moved very little, treat as click
    const moveThreshold = 5;
    const moved = Math.abs(currentX - mouseDownPos.x) > moveThreshold || 
                  Math.abs(currentY - mouseDownPos.y) > moveThreshold;
    
    if (!moved) {
      onBodyClick(event);
    }
  }
}

/**
 * Handle clicks on canvas to detect body selection
 */
function onBodyClick(event) {
  console.log('Body click detected at:', mouse.x, mouse.y);
  
  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  
  // Get clickable objects
  const clickableObjects = [];
  
  const moon = getMoon();
  const earth = getEarth();
  
  console.log('Moon:', moon, 'visible:', moon?.visible);
  console.log('Earth:', earth);
  
  if (moon && moon.visible) clickableObjects.push(moon);
  if (earth) clickableObjects.push(earth);
  
  // Check for intersections
  const intersects = raycaster.intersectObjects(clickableObjects);
  
  console.log('Intersections found:', intersects.length);
  
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    console.log('Clicked object:', clickedObject);
    
    // Determine which body was clicked
    if (clickedObject === moon) {
      console.log('Moon clicked!');
      transitionToMoon();
    } else if (clickedObject === earth) {
      console.log('Earth clicked!');
      transitionToEarth();
    }
  }
}

/**
 * Transition camera to Moon-centric view
 */
function transitionToMoon() {
  if (currentBody === 'moon') return; // Already viewing Moon
  
  console.log('Transitioning to Moon...');
  currentBody = 'moon';
  
  const moon = getMoon();
  if (!moon) return;
  
  // Get Moon's current position
  const moonPos = moon.position.clone();
  
  // Calculate camera position (slightly offset from Moon)
  const targetCameraPos = moonPos.clone();
  targetCameraPos.z += 0.5; // Move camera closer to Moon
  
  // Animate camera transition
  animateCameraToPosition(targetCameraPos, moonPos, 1500);
  
  // Update breadcrumb
  updateBodyBreadcrumb('moon');
  
  // Open Moon panel
  openMoonPanel();
}

/**
 * Transition camera back to Earth-centric view
 */
function transitionToEarth() {
  if (currentBody === 'earth') return; // Already viewing Earth
  
  console.log('Transitioning to Earth...');
  currentBody = 'earth';
  
  // Return to default Earth view
  const targetCameraPos = new THREE.Vector3(0, 0, 3.5);
  const targetLookAt = new THREE.Vector3(0, 0, 0);
  
  // Animate camera transition
  animateCameraToPosition(targetCameraPos, targetLookAt, 1500);
  
  // Update breadcrumb
  updateBodyBreadcrumb('earth');
  
  // Close any open panels (or open Earth panel if needed)
  const panel = document.getElementById('infoPanel');
  if (panel.classList.contains('visible')) {
    panel.classList.remove('visible');
  }
}

/**
 * Animate camera to target position
 * @param {THREE.Vector3} targetPosition - Target camera position
 * @param {THREE.Vector3} targetLookAt - Target look-at point
 * @param {number} duration - Animation duration in ms
 */
function animateCameraToPosition(targetPosition, targetLookAt, duration) {
  const startPosition = camera.position.clone();
  const startLookAt = new THREE.Vector3(0, 0, 0); // Assume looking at origin
  
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease in-out
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    // Interpolate camera position
    camera.position.lerpVectors(startPosition, targetPosition, eased);
    
    // Interpolate look-at target
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
 * Update breadcrumb to show current body
 * @param {string} body - Current body ('earth' or 'moon')
 */
function updateBodyBreadcrumb(body) {
  // This will be integrated with the existing breadcrumb system
  // For now, just log it
  console.log('Current body:', body);
  
  // TODO: Update UI breadcrumb
  // Show: Earth › Moon (with clickable Earth to go back)
}

/**
 * Open Moon-specific panel with grey theme
 */
function openMoonPanel() {
  const panel = document.getElementById('infoPanel');
  const panelTitle = document.getElementById('panelTitle');
  const panelDate = document.getElementById('panelDate');
  const panelDescription = document.getElementById('panelDescription');
  const breadcrumb = document.getElementById('panelBreadcrumb');
  
  // Set Moon content
  panelTitle.textContent = 'The Moon';
  panelDate.textContent = 'Formed ~4.5 Billion Years Ago';
  panelDescription.textContent = 'Earth\'s only natural satellite. Formed from debris after a Mars-sized body (Theia) collided with early Earth. The Moon stabilizes Earth\'s axial tilt and creates tides.';
  
  // Update breadcrumb
  breadcrumb.innerHTML = `
    <span class="breadcrumb-item" onclick="transitionToEarth()" style="cursor: pointer;">Earth</span>
    <span class="breadcrumb-separator">›</span>
    <span class="breadcrumb-item current">Moon</span>
  `;
  
  // Apply Moon theme (light grey)
  panel.style.setProperty('--panel-accent', '#c0c0c0');
  panel.setAttribute('data-body', 'moon');
  
  // Show panel
  panel.classList.add('visible');
  
  // TODO: Add Moon-specific content sections
}

/**
 * Get current focused body
 */
export function getCurrentBody() {
  return currentBody;
}

// Make transitionToEarth globally accessible for breadcrumb onclick
window.transitionToEarth = transitionToEarth;
