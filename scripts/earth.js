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
let currentTimelineYear = 2026; // Start at present

// Layer states
export const layerStates = {
  satellites: false,
  cityLights: true
};

// Era texture mapping
const eraTextures = {
  // Eons (oldest to newest)
  'hadean': './textures/hadean.jpg',
  'archean': './textures/archean.jpg',
  'proterozoic': './textures/ice_planet.jpg',
  'phanerozoic': './textures/pangaea.jpg',
  
  // Paleozoic Era
  'paleozoic': './textures/pangaea.jpg',
  
  // Mesozoic Era
  'mesozoic': './textures/pangaea.jpg',
  
  // Cenozoic Era
  'cenozoic': './textures/earth_day.jpg',
  'paleogene': './textures/earth_day.jpg',
  'neogene': './textures/earth_day.jpg',
  'quaternary': './textures/earth_day.jpg',
  'pleistocene': './textures/ice_planet.jpg',
  'holocene': './textures/earth_day.jpg',
  
  // Present day
  'presentday': './textures/earth_day.jpg',
  
  // Default
  'default': './textures/earth_day.jpg'
};

/**
 * Create Earth mesh with textures and atmosphere
 */
export function createEarth() {
  const textureLoader = new THREE.TextureLoader();
  
  // Scale Earth smaller on mobile devices
  //const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const earthScale = isMobile ? 0.55 : 0.85;
  
  // Earth with day texture
  const earthGeometry = new THREE.SphereGeometry(earthScale, 128, 128);
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('./textures/earth_day.jpg'),
    specular: 0x333333,
    shininess: 15
  });
  earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);
  
  // Make globally accessible for rotation
  window.earth = earth;

  // Night lights layer with shader
  const nightGeometry = new THREE.SphereGeometry(earthScale + 0.001, 128, 128);
  const nightTexture = textureLoader.load('./textures/earth_night.jpg');
  const nightMaterial = new THREE.ShaderMaterial({
    uniforms: {
      nightTexture: { value: nightTexture },
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
        vec3 dayNightMix = texture2D(nightTexture, vUv).rgb;
        float cosineAngleSunToNormal = dot(normalize(vNormal), sunDirection);
        cosineAngleSunToNormal = clamp(cosineAngleSunToNormal * 10.0, -1.0, 1.0);
        float mixAmount = cosineAngleSunToNormal * 0.5 + 0.5;
        mixAmount = 1.0 - mixAmount;
        mixAmount = pow(mixAmount, 3.0);
        gl_FragColor = vec4(dayNightMix * mixAmount * 1.0, mixAmount * 0.8);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true
  });
  nightLights = new THREE.Mesh(nightGeometry, nightMaterial);
  scene.add(nightLights);
  
  // Make globally accessible for rotation
  window.nightLights = nightLights;

  // Atmosphere glow shader
  const EARTH_RADIUS = 1.0;
  const ATMOSPHERE_FACTOR_DESKTOP = 1.025;
  const ATMOSPHERE_FACTOR_MOBILE = 1.015;

  const isMobile = matchMedia("(pointer: coarse)").matches;

  const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);

  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {},
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
      float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
      vec3 atmosphere = vec3(0.4, 0.7, 0.95) * intensity;
      gl_FragColor = vec4(atmosphere, 1.0) * intensity * 0.8;
    }
  `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0
  });

  atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

  const atmosphereScale =
    isMobile
      ? ATMOSPHERE_FACTOR_MOBILE
      : ATMOSPHERE_FACTOR_DESKTOP;

  atmosphere.scale.setScalar(atmosphereScale);

  atmosphere.visible = false; // Start hidden, shows after Great Oxidation
  scene.add(atmosphere);

  return { earth, atmosphere, nightLights };
}

/**
 * Change Earth texture based on geological era
 * @param {string} itemId - Era/period ID
 */
export function changeEarthTexture(itemId) {
  const newTexturePath = eraTextures[itemId] || eraTextures['default'];
  
  console.log(`🎨 changeEarthTexture called with itemId: "${itemId}", path: ${newTexturePath}`);
  
  if (newTexturePath === currentTexture) {
    console.log('⏭️ Already using this texture, skipping');
    return; // Already using this texture
  }
  
  // Load new texture with fade transition
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(newTexturePath, (newTexture) => {
    console.log(`✅ Texture loaded: ${newTexturePath}`);
    const oldOpacity = earth.material.opacity !== undefined ? earth.material.opacity : 1;
    earth.material.transparent = true;
    
    // Fade out
    let opacity = oldOpacity;
    const fadeOut = setInterval(() => {
      opacity -= 0.05;
      earth.material.opacity = opacity;
      
      if (opacity <= 0) {
        clearInterval(fadeOut);
        
        // Swap texture
        earth.material.map = newTexture;
        earth.material.needsUpdate = true;
        currentTexture = newTexturePath;
        
        // Fade in
        const fadeIn = setInterval(() => {
          opacity += 0.05;
          earth.material.opacity = opacity;
          
          if (opacity >= 1) {
            clearInterval(fadeIn);
            earth.material.transparent = false;
            earth.material.opacity = 1;
          }
        }, 30);
      }
    }, 30);
  });
}

/**
 * Update visibility of Moon, atmosphere, and city lights based on timeline year
 * @param {number} year - Current timeline year
 */
export function updateTimelineVisibility(year) {
  currentTimelineYear = year;
  
  // Update Moon visibility (appears after formation ~4.5 billion years ago)
  if (window.moon) {
    window.moon.visible = year > TIMELINE_THRESHOLDS.MOON_FORMATION;
  }
  
  // Update Atmosphere visibility with gradual fade (Great Oxidation Event ~2.4 billion years ago)
  if (atmosphere) {
    if (year > TIMELINE_THRESHOLDS.ATMOSPHERE_FORMATION) {
      const targetOpacity = 1.0;
      if (atmosphere.material.opacity < targetOpacity) {
        atmosphere.material.opacity = Math.min(targetOpacity, atmosphere.material.opacity + 0.02);
      }
      atmosphere.visible = true;
    } else {
      const targetOpacity = 0.0;
      if (atmosphere.material.opacity > targetOpacity) {
        atmosphere.material.opacity = Math.max(targetOpacity, atmosphere.material.opacity - 0.02);
      }
      atmosphere.visible = atmosphere.material.opacity > 0.01;
    }
  }
  
  // Update City Lights visibility (respects toggle AND timeline - only last ~150 years)
  if (nightLights) {
    nightLights.visible = (year > TIMELINE_THRESHOLDS.CITY_LIGHTS_START && layerStates.cityLights);
  }
  
  // Force disable satellites if before space age (1957)
  if (year < 1957 && layerStates.satellites) {
    layerStates.satellites = false;
    const toggle = document.getElementById('toggle-satellites');
    if (toggle) toggle.classList.remove('active');
  }
}

/**
 * Animate Earth rotation
 * @param {boolean} isDragging - Whether user is currently dragging
 */
export function animateEarthRotation(isDragging) {
  if (earth && nightLights) {
    if (!isDragging) {
      earth.rotation.y += 0.003;
      nightLights.rotation.y += 0.003;
    }
  }
}

/**
 * Getters
 */
export function getEarth() {
  return earth;
}

export function getAtmosphere() {
  return atmosphere;
}

export function getNightLights() {
  return nightLights;
}

export function getCurrentTimelineYear() {
  return currentTimelineYear;
}
