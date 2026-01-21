/**
 * THE ARCHIVE - EARTH MODULE
 * Earth mesh, textures, atmosphere, and timeline-based visibility
 */

import { scene } from './scene.js';
import { TIMELINE_THRESHOLDS } from './config.js';

// Earth and related meshes
let earth, atmosphere, nightLights;

// Texture management
let currentTexture = './textures/earth_day.jpg';
let currentTimelineYear = 2026;


// Layer states
export const layerStates = {
  satellites: false,
  cityLights: true
};

export function changeEarthTexture(itemId) {
  const path = eraTextures[itemId] || eraTextures.default;
  if (!earth) return;

  new THREE.TextureLoader().load(path, texture => {
    earth.material.map = texture;
    earth.material.needsUpdate = true;
  });
}

// Era texture mapping
const eraTextures = {
  hadean: './textures/hadean.jpg',
  archean: './textures/archean.jpg',
  proterozoic: './textures/ice_planet.jpg',
  phanerozoic: './textures/pangaea.jpg',
  paleozoic: './textures/pangaea.jpg',
  mesozoic: './textures/pangaea.jpg',
  cenozoic: './textures/earth_day.jpg',
  paleogene: './textures/earth_day.jpg',
  neogene: './textures/earth_day.jpg',
  quaternary: './textures/earth_day.jpg',
  pleistocene: './textures/ice_planet.jpg',
  holocene: './textures/earth_day.jpg',
  presentday: './textures/earth_day.jpg',
  default: './textures/earth_day.jpg'
};

/**
 * Create Earth mesh with textures and atmosphere
 */
export function createEarth() {
  const textureLoader = new THREE.TextureLoader();

  // Mobile detection (ONE place only)
  const isMobile = matchMedia('(pointer: coarse)').matches;

  // ---------------------------
  // Earth
  // ---------------------------
  const earthScale = isMobile ? 0.55 : 0.85;

  const earthGeometry = new THREE.SphereGeometry(earthScale, 128, 128);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('./textures/earth_day.jpg'),
    specular: 0x333333,
    shininess: 15
  });

  earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);
  window.earth = earth;

  // ---------------------------
  // Night lights
  // ---------------------------
  const nightGeometry = new THREE.SphereGeometry(earthScale + 0.001, 128, 128);
  const nightMaterial = new THREE.ShaderMaterial({
    uniforms: {
      nightTexture: { value: textureLoader.load('./textures/earth_night.jpg') },
      sunDirection: { value: new THREE.Vector3(5, 2, 3).normalize() }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D nightTexture;
      uniform vec3 sunDirection;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        float d = dot(normalize(vNormal), sunDirection);
        float mixAmount = pow(clamp(1.0 - (d * 0.5 + 0.5), 0.0, 1.0), 3.0);
        vec3 color = texture2D(nightTexture, vUv).rgb * mixAmount;
        gl_FragColor = vec4(color, mixAmount * 0.8);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
  });

  nightLights = new THREE.Mesh(nightGeometry, nightMaterial);
  scene.add(nightLights);
  window.nightLights = nightLights;

  // ---------------------------
  // Atmosphere (FIXED)
  // ---------------------------
  // ---------------------------
  // Atmosphere (SAFE + STABLE)
  // ---------------------------

  // Slightly larger than Earth — mobile tighter, desktop wider
  const ATMOSPHERE_FACTOR = isMobile ? 1.08 : 1.08;

  // Geometry matches Earth, scale pushes it outward
  const atmosphereGeometry = new THREE.SphereGeometry(earthScale, 64, 64);

  const atmosphereMaterial = new THREE.ShaderMaterial({
    vertexShader: `
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.55 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      vec3 color = vec3(0.35, 0.6, 0.9) * intensity;
      gl_FragColor = vec4(color, intensity);
    }
  `,
    side: THREE.BackSide,
    transparent: true,
    blending: THREE.AdditiveBlending,
    opacity: 0
  });

  atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  atmosphere.scale.setScalar(ATMOSPHERE_FACTOR);
  atmosphere.visible = false;

  scene.add(atmosphere);

  scene.add(atmosphere);

  return { earth, atmosphere, nightLights };
}

/**
 * Timeline-driven visibility
 */
export function updateTimelineVisibility(year) {
  if (typeof year !== 'number') return;
  currentTimelineYear = year;

  if (window.moon) {
    window.moon.visible = year > TIMELINE_THRESHOLDS.MOON_FORMATION;
  }

  if (atmosphere) {
    if (year > TIMELINE_THRESHOLDS.ATMOSPHERE_FORMATION) {
      atmosphere.visible = true;
      atmosphere.material.opacity = Math.min(1.0, atmosphere.material.opacity + 0.02);
    } else {
      atmosphere.material.opacity = Math.max(0.0, atmosphere.material.opacity - 0.02);
      atmosphere.visible = atmosphere.material.opacity > 0.01;
    }
  }

  if (nightLights) {
    nightLights.visible =
      year > TIMELINE_THRESHOLDS.CITY_LIGHTS_START && layerStates.cityLights;
  }
}

/**
 * Idle rotation
 */
export function animateEarthRotation(isDragging) {
  if (!isDragging && earth && nightLights) {
    earth.rotation.y += 0.003;
    nightLights.rotation.y += 0.003;
  }
}

/**
 * Getters
 */
export const getEarth = () => earth;
export const getAtmosphere = () => atmosphere;
export const getNightLights = () => nightLights;
export const getCurrentTimelineYear = () => currentTimelineYear;
