/**
 * THE ARCHIVE - LAYERS MODULE
 * Layer toggle controls (satellites, city lights, grid, trade routes, etc)
 */

import { layerStates } from './earth.js';
import { createSatellites, removeSatellites } from './satellites.js';
import { camera } from './scene.js';
import { getCurrentTimelineYear } from './timeline.js';

// Current timeline year for time-based filtering
let currentYear = 2026;

/**
 * Update current year (called from timeline)
 */
export function updateCurrentYear(year) {
  currentYear = year;
}

/**
 * Toggle layer visibility
 * @param {string} layerName - Name of layer to toggle
 */
export function toggleLayer(layerName) {
  console.log(`🎚️ Toggling layer: ${layerName}`);
  
  const toggle = document.getElementById(`toggle-${layerName}`);
  if (!toggle) {
    console.warn(`Toggle element not found: toggle-${layerName}`);
    return;
  }
  
  if (layerName === 'satellites') {
    layerStates.satellites = !layerStates.satellites;
    
    if (layerStates.satellites) {
      toggle.classList.add('active');
      createSatellites();
      zoomToLEO();
    } else {
      toggle.classList.remove('active');
      removeSatellites();
      zoomToOrbit();
    }
  } 
  else if (layerName === 'cityLights') {
    layerStates.cityLights = !layerStates.cityLights;
    
    if (layerStates.cityLights) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
    
    // Visibility is handled by updateTimelineVisibility in earth.js
  }
  else if (layerName === 'grid') {
    layerStates.grid = !layerStates.grid;
    
    if (layerStates.grid) {
      toggle.classList.add('active');
    } else {
      toggle.classList.remove('active');
    }
  }
  else if (layerName === 'populationDensity') {
    // Only available in recent times
    if (currentYear > -10000) {
      layerStates.populationDensity = !layerStates.populationDensity;
      
      if (layerStates.populationDensity) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    } else {
      showLayerInfo('populationDensity');
    }
  }
  else if (layerName === 'tradeRoutes') {
    // Only available after civilization
    if (currentYear > -5000) {
      layerStates.tradeRoutes = !layerStates.tradeRoutes;
      
      if (layerStates.tradeRoutes) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    } else {
      showLayerInfo('tradeRoutes');
    }
  }
  else if (layerName === 'flightRoutes') {
    // Only available after aviation
    if (currentYear > -150) {
      layerStates.flightRoutes = !layerStates.flightRoutes;
      
      if (layerStates.flightRoutes) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    } else {
      showLayerInfo('flightRoutes');
    }
  }
}

/**
 * Show layer info popup
 */
function showLayerInfo(layerName) {
  const messages = {
    populationDensity: '📊 Population Density\n\nAvailable in recent history (last 10,000 years)\n\nShows where people live on Earth today.',
    tradeRoutes: '🚢 Trade Routes\n\nAvailable after civilization began (~5,000 years ago)\n\nShows major historical and modern trade routes.',
    flightRoutes: '✈️ Flight Routes\n\nAvailable after aviation era (~150 years ago)\n\nShows major commercial air traffic routes.'
  };
  
  alert(messages[layerName] || 'Layer information not available');
}

/**
 * Toggle layers panel visibility
 */
export function toggleLayersPanel() {
  console.log('🎛️ Toggling layers panel');
  
  const panel = document.getElementById('layersPanel');
  const button = document.getElementById('toggleButton');
  
  if (!panel) {
    console.warn('Layers panel not found');
    return;
  }
  
  panel.classList.toggle('visible');
  if (button) button.classList.toggle('active');
}

/**
 * Zoom camera to LEO view (for satellites)
 */
function zoomToLEO() {
  transitionCamera(1.8, 1000);
}

/**
 * Zoom camera back to orbit view
 */
function zoomToOrbit() {
  transitionCamera(3.5, 1000);
}

/**
 * Transition camera with animation
 */
function transitionCamera(targetZ, duration) {
  const startZ = camera.position.z;
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    camera.position.z = startZ + (targetZ - startZ) * progress;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

// Make globally accessible
window.toggleLayer = toggleLayer;
window.toggleLayersPanel = toggleLayersPanel;

/**
* Zoom camera to orbit view (default)
*/
//function zoomToOrbit() {
//  transitionCamera(3.5, 1000);
//}

/**
 * Transition camera to target position
 * @param {number} targetZ - Target Z position
 * @param {number} duration - Duration in ms
 */
function transitionCamera(targetZ, duration) {
  const startZ = camera.position.z;
  const startTime = Date.now();
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease in-out
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    camera.position.z = startZ + (targetZ - startZ) * eased;
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}

// Make globally accessible for onclick handlers
window.toggleLayer = toggleLayer;
window.toggleLayersPanel = toggleLayersPanel;
