/**
 * THE ARCHIVE - SATELLITES MODULE
 * Satellite sprites with orbital mechanics (LEO/MEO/GEO)
 */

import { scene } from './scene.js';
import { layerStates } from './earth.js';

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
