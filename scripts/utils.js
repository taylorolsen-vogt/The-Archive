/**
 * THE ARCHIVE - UTILITY FUNCTIONS
 * Helper functions for formatting, calculations, and conversions
 */

/**
 * Format year into human-readable string
 * @param {number} year - Year value (negative for past, positive for CE)
 * @returns {string} Formatted year string
 */
export function formatYear(year) {
  if (year < -1000000000) {
    return `${Math.abs(year / 1000000000).toFixed(1)} Billion Years Ago`;
  } else if (year < -1000000) {
    return `${Math.abs(year / 1000000).toFixed(0)} Million Years Ago`;
  } else if (year < 0) {
    return `${Math.abs(year).toLocaleString()} Years Ago`;
  } else {
    return `${year} CE`;
  }
}

/**
 * Convert latitude/longitude to Three.js Vector3 position on sphere
 * @param {number} lat - Latitude in degrees (-90 to 90)
 * @param {number} lon - Longitude in degrees (-180 to 180)
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3} Position vector
 */
export function latLonToVector3(lat, lon, radius) {
  // Standard spherical to cartesian
  const phi = (90 - lat) * (Math.PI / 180); // Angle from north pole
  const theta = (lon) * (Math.PI / 180); // Longitude angle
  
  // Three.js uses Z-up for spheres by default, but we need Y-up
  // Standard sphere mapping for Three.js with Y-up
  const x = -radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  const z = radius * Math.sin(phi) * Math.cos(theta);
  
  return new THREE.Vector3(x, y, z);
}

/**
 * Calculate Earth rotation angles from lat/lon
 * @param {number} lat - Latitude in degrees
 * @param {number} lon - Longitude in degrees
 * @returns {object} Object with rotX and rotY in radians
 */
export function calculateEarthRotation(lat, lon) {
  const targetRotY = lon * (Math.PI / 180);
  const targetRotX = -lat * (Math.PI / 180);
  
  return {
    rotX: targetRotX,
    rotY: targetRotY,
    rotXDeg: (targetRotX * (180 / Math.PI)).toFixed(1),
    rotYDeg: (targetRotY * (180 / Math.PI)).toFixed(1)
  };
}

/**
 * Update coordinate display UI
 * @param {string} target - Target location string
 * @param {string} rotation - Rotation string
 */
export function updateCoordinateDisplay(target, rotation) {
  const coordDisplay = document.getElementById('coordDisplay');
  const coordTarget = document.getElementById('coordTarget');
  const coordRotation = document.getElementById('coordRotation');
  
  if (target) coordTarget.textContent = target;
  if (rotation) coordRotation.textContent = rotation;
  
  coordDisplay.classList.add('visible');
}

/**
 * Hide coordinate display
 */
export function hideCoordinateDisplay() {
  const coordDisplay = document.getElementById('coordDisplay');
  coordDisplay.classList.remove('visible');
}

/**
 * Linear interpolation
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} t - Progress (0-1)
 * @returns {number} Interpolated value
 */
export function lerp(start, end, t) {
  return start * (1 - t) + end * t;
}

/**
 * Clamp value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
