/**
 * THE ARCHIVE - MAIN ORCHESTRATOR
 * Imports all modules and initializes the application
 */

// Import all modules
import { initStarfield, resizeStarfield } from './starfield.js';
import { initScene, handleResize, scene, camera, renderer } from './scene.js';
import { createEarth, animateEarthRotation, updateTimelineVisibility } from './earth.js';
import { createMoon, updateMoonOrbit } from './moon.js';
import { updateSatellites } from './satellites.js';
import { initPanelAtmosphere, closePanel } from './panel.js';
import { renderTimelineDots, updateTimeline } from './timeline.js';
import { openPanelForTimelineValue } from './navigation.js';
import { getIsDragging } from './scene.js';

// UI Elements
const bootTitle = document.getElementById('bootTitle');
const toolbar = document.getElementById('toolbar');
const earthCanvas = document.getElementById('earthCanvas');

/**
 * Main animation loop
 */
function animate() {
  requestAnimationFrame(animate);
  
  const isDragging = getIsDragging();
  
  // Animate Earth rotation (unless user is dragging)
  animateEarthRotation(isDragging);
  
  // Update Moon orbit
  updateMoonOrbit();
  
  // Update satellites if active
  updateSatellites();
  
  // Render scene
  renderer.render(scene, camera);
}

/**
 * Set up timeline slider event listeners
 */
function initTimelineControls() {
  const slider = document.getElementById('timelineSlider');
  
  // Update on drag
  slider.addEventListener('input', (e) => {
    const value = parseFloat(e.target.value);
    updateTimeline(value);
  });
  
  // Open panel on click/release
  slider.addEventListener('mouseup', (e) => {
    const value = parseFloat(slider.value);
    openPanelForTimelineValue(value);
  });
  
  // Preview on hover
  slider.addEventListener('mousemove', (e) => {
    const isDragging = getIsDragging();
    if (!isDragging) {
      const rect = slider.getBoundingClientRect();
      const value = ((e.clientX - rect.left) / rect.width) * 100;
      updateTimeline(value, true);
    }
  });
}

/**
 * Handle window resize
 */
function onResize() {
  resizeStarfield();
  handleResize();
}

/**
 * Initialize application
 */
function init() {
  // 1. Initialize starfield background
  initStarfield();
  
  // 2. Initialize Three.js scene
  initScene();
  
  // 3. Create Earth, Moon, and atmosphere
  createEarth();
  createMoon();
  
  // 4. Initialize panel glassmorphic background
  initPanelAtmosphere();
  
  // 5. Render initial timeline dots
  renderTimelineDots();
  
  // 6. Initialize timeline controls
  initTimelineControls();
  
  // 7. Set initial visibility for present day
  updateTimelineVisibility(2026);
  
  // 8. Start main animation loop
  animate();
  
  // 9. Boot sequence animation
  setTimeout(() => {
    bootTitle.classList.add('hidden');
    toolbar.classList.add('active');
    earthCanvas.classList.add('visible');
  }, 1000);
}

// Set up resize handler
window.addEventListener('resize', onResize);

// Make closePanel globally accessible for onclick
window.closePanel = closePanel;

// Start application when page loads
window.addEventListener('load', init);
