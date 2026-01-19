/**
 * THE ARCHIVE - LAYERS MODULE
 * Layer toggle controls (satellites, city lights)
 */

import { layerStates } from './earth.js';
import { createSatellites, removeSatellites } from './satellites.js';
import { camera } from './scene.js';

/**
 * Toggle layer visibility
 * @param {string} layerName - Name of layer to toggle ('satellites' or 'cityLights')
 */
export function toggleLayer(layerName) {
  const toggle = document.getElementById(`toggle-${layerName}`);

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
}

/**
 * Toggle layers panel visibility
 */
export function toggleLayersPanel() {
  const panel = document.getElementById('layersPanel');
  const button = document.getElementById('toggleButton');

  panel.classList.toggle('visible');
  button.classList.toggle('active');
}

/**
 * Zoom camera to LEO view (for satellites)
 */
function zoomToLEO() {
  transitionCamera(1.8, 1000);
}

/**
 * Zoom camera to orbit view (default)
 */
function zoomToOrbit() {
  transitionCamera(3.5, 1000);
}

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