/**
 * THE ARCHIVE - CLICK DETECTION MODULE
 * Handles raycasting for celestial body clicks (separate from scene.js to avoid circular imports)
 */

import { getMoon, triggerMoonFormation } from './moon.js';
import { getEarth } from './earth.js';

// Will be set by scene.js
export let camera = null;
export let raycaster = null;
export let mouse = null;

// Will be set after click-detection is imported
let transitionToMoon = null;
let transitionToEarth = null;

/**
 * Set transition functions (called from body-navigation.js to break circular imports)
 */
export function setTransitionFunctions(moonTransition, earthTransition) {
  transitionToMoon = moonTransition;
  transitionToEarth = earthTransition;
}

/**
 * Initialize raycaster (called from scene.js)
 */
export function initClickDetection(cameraRef) {
  camera = cameraRef;
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
}

/**
 * Detect clicks on celestial bodies using raycaster
 */
export function detectBodyClick(event, rect) {
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  console.log('🖱️ Click detected at:', mouse.x, mouse.y);
  
  // Update raycaster
  raycaster.setFromCamera(mouse, camera);
  
  // Get clickable objects
  const clickableObjects = [];
  
  const moon = getMoon();
  const earth = getEarth();
  
  if (moon && moon.visible) clickableObjects.push(moon);
  if (earth) clickableObjects.push(earth);
  
  console.log('📦 Clickable objects:', { moonVisible: moon?.visible, earthExists: !!earth, count: clickableObjects.length });
  
  // Check for intersections
  const intersects = raycaster.intersectObjects(clickableObjects);
  
  console.log('🎯 Raycaster intersections:', intersects.length);
  
  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    console.log('✅ Object clicked:', clickedObject.name || 'unnamed');
    
    // Determine which body was clicked
    if (clickedObject === moon) {
      console.log('🌙 MOON CLICKED!');
      triggerMoonFormation();
      if (transitionToMoon) transitionToMoon();
    } else if (clickedObject === earth) {
      console.log('🌍 EARTH CLICKED!');
      if (transitionToEarth) transitionToEarth();
    }
  } else {
    console.log('❌ No objects intersected');
  }
}
