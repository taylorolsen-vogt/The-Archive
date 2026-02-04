/**
 * THE ARCHIVE - LAYER SYSTEM MODULE
 * Complete layer management: UI toggles, satellites, starfield
 * CONSOLIDATED FROM: layers.js + satellites.js + starfield.js
 */

import { scene, camera } from './scene.js';
import { layerStates } from './earth.js';

/* ============================
   Starfield (from starfield.js)
============================ */

// Canvas and context
const spaceCanvas = document.getElementById('spaceCanvas');
const spaceCtx = spaceCanvas.getContext('2d');

// State
let stars = [];
let time = 0;
let shootingStar = null;

/**
 * Star class - individual twinkling star
 */
class Star {
  constructor() {
    this.x = Math.random() * spaceCanvas.width;
    this.y = Math.random() * spaceCanvas.height;
    this.isShootingStar = false;

    const layer = Math.random();

    // Bright foreground stars
    if (layer > 0.96) {
      this.size = Math.random() * 0.9 + 0.6;
      this.baseOpacity = Math.random() * 0.35 + 0.35;
      this.glimmer = 0.015;
    } 
    // Mid-layer stars
    else if (layer > 0.65) {
      this.size = Math.random() * 0.45 + 0.2;
      this.baseOpacity = Math.random() * 0.25 + 0.15;
      this.glimmer = 0.01;
    } 
    // Background stars
    else {
      this.size = Math.random() * 0.35 + 0.1;
      this.baseOpacity = Math.random() * 0.18 + 0.05;
      this.glimmer = 0.005;
    }

    this.phase = Math.random() * Math.PI * 2;
    this.frequency = Math.random() * 0.006 + 0.002;
    this.amplitude = Math.random() * 0.1 + 0.03;
    this.drift = Math.random() * 0.00025 + 0.0001;

    this.opacity = this.baseOpacity;
  }

  update() {
    this.phase += this.drift;

    const breath = Math.sin(time * this.frequency + this.phase);
    const noise = (Math.random() - 0.5) * this.glimmer;

    this.opacity = this.baseOpacity + breath * this.amplitude + noise;

    if (this.opacity < 0.02) this.opacity = 0.02;
    if (this.opacity > 1) this.opacity = 1;
  }

  draw() {
    spaceCtx.globalAlpha = this.opacity;
    spaceCtx.fillStyle = '#ffffff';
    spaceCtx.beginPath();
    spaceCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    spaceCtx.fill();
  }
}

/**
 * Create initial star field
 */
function createStars() {
  stars = [];
  const count = Math.floor((spaceCanvas.width * spaceCanvas.height) / 3300);
  for (let i = 0; i < count; i++) stars.push(new Star());
}

/**
 * Resize canvas and regenerate stars
 */
export function resizeStarfield() {
  spaceCanvas.width = window.innerWidth;
  spaceCanvas.height = window.innerHeight;
  createStars();
}

/**
 * Main animation loop for starfield
 */
export function animateStars() {
  time += 0.0028;

  // Clear canvas
  spaceCtx.globalAlpha = 1;
  spaceCtx.fillStyle = '#000';
  spaceCtx.fillRect(0, 0, spaceCanvas.width, spaceCanvas.height);

  // Update and draw all stars
  for (const star of stars) {
    star.update();
    star.draw();
  }

  // Randomly spawn shooting star (rare)
  if (!shootingStar && Math.random() < 0.002) {
    shootingStar = {
      x: Math.random() * spaceCanvas.width,
      y: Math.random() * spaceCanvas.height * 0.6,
      length: Math.random() * 80 + 40,
      angle: Math.random() * Math.PI / 4 + Math.PI / 6,
      speed: Math.random() * 8 + 6,
      opacity: 1,
      life: 0
    };
  }

  // Draw shooting star
  if (shootingStar) {
    shootingStar.life += 0.05;
    shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
    shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
    shootingStar.opacity = Math.max(0, 1 - shootingStar.life);

    if (shootingStar.opacity > 0) {
      const gradient = spaceCtx.createLinearGradient(
        shootingStar.x,
        shootingStar.y,
        shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
        shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
      gradient.addColorStop(0.3, `rgba(220, 240, 255, ${shootingStar.opacity * 0.8})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      spaceCtx.strokeStyle = gradient;
      spaceCtx.lineWidth = 2.5;
      spaceCtx.shadowBlur = 8;
      spaceCtx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      spaceCtx.beginPath();
      spaceCtx.moveTo(shootingStar.x, shootingStar.y);
      spaceCtx.lineTo(
        shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
        shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
      );
      spaceCtx.stroke();
      spaceCtx.shadowBlur = 0;
    } else {
      shootingStar = null;
    }
  }

  requestAnimationFrame(animateStars);
}

/**
 * Initialize starfield
 */
export function initStarfield() {
  resizeStarfield();
  animateStars();
}

/* ============================
   Satellites (from satellites.js)
============================ */

// Satellite array
let satellites = [];

// Satellite configuration
const heroSatellites = [
  { name: 'ISS', image: './textures/satellites/iss.png', size: 0.08, radius: 1.08, speed: 0.002, phase: 0 },
  { name: 'Hubble', image: './textures/satellites/hubble.png', size: 0.06, radius: 1.1, speed: 0.0018, phase: Math.PI }
];

const orbitalLayers = [
  { name: 'LEO', image: './textures/satellites/generic-satellite.png', count: 12, size: 0.04, radius: 1.08, speed: 0.002 },
  { name: 'MEO', image: './textures/satellites/communication-sat.png', count: 6, size: 0.05, radius: 1.3, speed: 0.001 },
  { name: 'GEO', image: './textures/satellites/communication-sat.png', count: 4, size: 0.06, radius: 1.6, speed: 0.0003 }
];

/**
 * Create satellite sprites
 */
export function createSatellites() {
  const textureLoader = new THREE.TextureLoader();
  
  // Create hero satellites (ISS, Hubble)
  heroSatellites.forEach(hero => {
    const texture = textureLoader.load(hero.image);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 1.0,
      sizeAttenuation: true
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(hero.size, hero.size, 1);
    
    sprite.userData = {
      orbitRadius: hero.radius,
      orbitSpeed: hero.speed,
      orbitPhase: hero.phase,
      orbitTilt: (Math.random() - 0.5) * 0.3,
      layer: 'HERO',
      name: hero.name
    };
    
    scene.add(sprite);
    satellites.push(sprite);
  });
  
  // Create orbital layer constellations
  orbitalLayers.forEach(layer => {
    const texture = textureLoader.load(layer.image);
    
    for (let i = 0; i < layer.count; i++) {
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.85,
        sizeAttenuation: true
      });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(layer.size, layer.size, 1);
      
      // Random orbital parameters
      sprite.userData = {
        orbitRadius: layer.radius + (Math.random() - 0.5) * 0.05,
        orbitSpeed: layer.speed * (0.8 + Math.random() * 0.4),
        orbitPhase: Math.random() * Math.PI * 2,
        orbitTilt: (Math.random() - 0.5) * 0.4,
        layer: layer.name
      };
      
      scene.add(sprite);
      satellites.push(sprite);
    }
  });
}

/**
 * Remove all satellites from scene
 */
export function removeSatellites() {
  satellites.forEach(sat => {
    scene.remove(sat);
    if (sat.material.map) sat.material.map.dispose();
    sat.material.dispose();
  });
  satellites = [];
}

/**
 * Update satellite orbital positions
 */
export function updateSatellites() {
  if (!layerStates.satellites) return;
  
  const time = Date.now() * 0.001;
  satellites.forEach(satellite => {
    const data = satellite.userData;
    const angle = time * data.orbitSpeed + data.orbitPhase;
    
    // Circular orbit in X-Z plane with tilt
    satellite.position.x = Math.cos(angle) * data.orbitRadius;
    satellite.position.z = Math.sin(angle) * data.orbitRadius;
    satellite.position.y = Math.sin(angle * 2) * data.orbitTilt;
  });
}

/**
 * Get all satellites
 */
export function getSatellites() {
  return satellites;
}

/* ============================
   Layer UI Controls (from layers.js)
============================ */

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

/* ============================
   Global Functions
============================ */

// Make globally accessible for onclick handlers
window.toggleLayer = toggleLayer;
window.toggleLayersPanel = toggleLayersPanel;
