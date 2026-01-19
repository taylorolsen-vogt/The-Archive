/**
 * THE ARCHIVE - MOON MODULE
 * Moon creation, orbital mechanics, and formation animation
 */

import { scene } from './scene.js';

// Moon mesh
let moon = null;

// Moon formation animation state
let moonFormationActive = false;
let theiaImpactor = null;
let moonFormationParticles = [];

// Track if moon should orbit
let moonOrbitActive = true;

/**
 * Create Moon mesh
 */
export function createMoon() {
  const textureLoader = new THREE.TextureLoader();
  
  const moonGeometry = new THREE.SphereGeometry(0.068, 64, 64); // 8% of Earth size
  const moonMaterial = new THREE.MeshPhongMaterial({
    map: textureLoader.load('./textures/moon.jpg'),
    specular: 0x111111,
    shininess: 5
  });
  
  moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.position.set(3.0, 0, 0); // Starting orbital position
  moon.visible = true; // Visible and clickable
  scene.add(moon);
  
  // Make globally accessible
  window.moon = moon;
  
  return moon;
}

/**
 * Update Moon orbital motion
 * Moon orbits in X-Z plane (like a clock face) at 3 units radius
 */
export function updateMoonOrbit() {
  if (moon && moon.visible && moonOrbitActive) {
    const time = Date.now() * 0.00002; // Slow orbit
    const orbitRadius = 3.0; // User's preferred distance
    
    // Circular motion in X-Z plane
    moon.position.x = Math.cos(time) * orbitRadius;
    moon.position.z = Math.sin(time) * orbitRadius;
    moon.position.y = 0; // Keep at equator level
    
    // Rotate Moon on its axis
    moon.rotation.y += 0.001;
  }
}

/**
 * Set Moon orbit state
 */
export function setMoonOrbitActive(active) {
  moonOrbitActive = active;
}

/**
 * Position Moon in front of camera when focusing on it
 */
export function positionMoonForFocus() {
  if (moon) {
    // Move Moon: lifted up on Y axis, and back slightly on Z so it's visible
    // Y: lifted up so it peeks over Earth
    // Z: slightly back so camera can see it better
    moon.position.set(2.0, 1.5, 0.5);
    // Scale Moon to 2.5x - smaller than Earth but still prominent
    moon.scale.set(2.5, 2.5, 2.5);
  }
}

/**
 * Reset Moon to normal size and position
 */
export function resetMoonSize() {
  if (moon) {
    moon.scale.set(1, 1, 1);
  }
}

/**
 * Trigger Moon formation animation (Theia impact)
 */
export function triggerMoonFormation() {
  if (moonFormationActive) return;
  
  moonFormationActive = true;
  
  // Hide existing moon
  if (moon) {
    moon.visible = false;
  }
  
  // Create Theia (Mars-sized impactor)
  const theiaGeometry = new THREE.SphereGeometry(0.35, 32, 32);
  const theiaMaterial = new THREE.MeshPhongMaterial({
    color: 0xff5522,
    emissive: 0xff3300,
    emissiveIntensity: 0.4
  });
  theiaImpactor = new THREE.Mesh(theiaGeometry, theiaMaterial);
  
  // Start position: upper right, visible to camera
  theiaImpactor.position.set(3.5, 1.2, 1.0);
  scene.add(theiaImpactor);
  
  // Create Theia label
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 256;
  canvas.height = 64;
  context.fillStyle = 'rgba(255, 255, 255, 0.9)';
  context.font = 'bold 32px Arial';
  context.textAlign = 'center';
  context.fillText('THEIA', 128, 40);
  
  const labelTexture = new THREE.CanvasTexture(canvas);
  const labelMaterial = new THREE.SpriteMaterial({ 
    map: labelTexture,
    transparent: true
  });
  const label = new THREE.Sprite(labelMaterial);
  label.scale.set(0.4, 0.1, 1);
  theiaImpactor.add(label);
  label.position.set(0, 0.5, 0);
  
  // Start animation sequence
  animateMoonFormationSequence();
}

/**
 * Animate the Moon formation sequence
 * Phase 1: Theia approaches (3.5s)
 * Phase 2: Impact flash (0.3s)
 * Phase 3: Debris expansion (5s)
 * Phase 4: Moon appears
 */
function animateMoonFormationSequence() {
  const startTime = Date.now();
  const approachDuration = 3500;
  const impactFlashDuration = 300;
  const debrisDuration = 5000;
  
  let impactFlash = null;
  
  function animate() {
    if (!moonFormationActive) return;
    
    const elapsed = Date.now() - startTime;
    
    // Phase 1: Theia approaches Earth
    if (elapsed < approachDuration) {
      const progress = elapsed / approachDuration;
      const eased = 1 - Math.pow(1 - progress, 2);
      
      // Move toward Earth at 45° angle
      theiaImpactor.position.x = 3.5 - eased * 4.0;
      theiaImpactor.position.y = 1.2 - eased * 1.0;
      theiaImpactor.position.z = 1.0 - eased * 1.0;
      
      // Rotate for effect
      theiaImpactor.rotation.y += 0.03;
      theiaImpactor.rotation.x += 0.02;
      
      requestAnimationFrame(animate);
    }
    // Phase 2: Impact flash
    else if (elapsed < approachDuration + impactFlashDuration) {
      // Remove Theia on first frame
      if (theiaImpactor) {
        scene.remove(theiaImpactor);
        theiaImpactor = null;
        
        // Create bright flash
        const flashGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const flashMaterial = new THREE.MeshBasicMaterial({
          color: 0xffddaa,
          transparent: true,
          opacity: 1
        });
        impactFlash = new THREE.Mesh(flashGeometry, flashMaterial);
        impactFlash.position.set(-0.5, 0.2, 0);
        scene.add(impactFlash);
        
        // Create debris explosion
        createImpactDebris();
      }
      
      // Fade flash
      if (impactFlash) {
        const flashProgress = (elapsed - approachDuration) / impactFlashDuration;
        impactFlash.material.opacity = 1 - flashProgress;
      }
      
      requestAnimationFrame(animate);
    }
    // Phase 3: Debris expansion
    else if (elapsed < approachDuration + impactFlashDuration + debrisDuration) {
      // Remove flash
      if (impactFlash) {
        scene.remove(impactFlash);
        impactFlash = null;
      }
      
      // Animate debris
      updateMoonDebris();
      
      requestAnimationFrame(animate);
    }
    // Phase 4: Moon appears
    else {
      // Clean up debris
      cleanupMoonDebris();
      
      // Show Moon in orbit
      if (moon) {
        moon.visible = true;
        moon.position.set(3.0, 0, 0);
      }
      
      moonFormationActive = false;
    }
  }
  
  animate();
}

/**
 * Create impact debris particles
 */
function createImpactDebris() {
  for (let i = 0; i < 300; i++) {
    const size = 0.008 + Math.random() * 0.025;
    const geometry = new THREE.SphereGeometry(size, 6, 6);
    const color = Math.random() > 0.6 ? 0xff5522 : 0x999999;
    const material = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 1
    });
    const particle = new THREE.Mesh(geometry, material);
    
    // Start at impact point
    particle.position.set(-0.5, 0.2, 0);
    
    // Cone-shaped explosion
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.6 + Math.PI * 0.2;
    const speed = 0.004 + Math.random() * 0.009;
    
    particle.userData = {
      velocity: {
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed * 0.5
      },
      life: 1.0,
      rotSpeed: {
        x: (Math.random() - 0.5) * 0.1,
        y: (Math.random() - 0.5) * 0.1,
        z: (Math.random() - 0.5) * 0.1
      }
    };
    
    scene.add(particle);
    moonFormationParticles.push(particle);
  }
}

/**
 * Update debris particle positions and fade
 */
function updateMoonDebris() {
  moonFormationParticles.forEach(particle => {
    // Move particle
    particle.position.x += particle.userData.velocity.x;
    particle.position.y += particle.userData.velocity.y;
    particle.position.z += particle.userData.velocity.z;
    
    // Apply slight gravity toward Earth
    const toCenter = new THREE.Vector3(0, 0, 0).sub(particle.position).normalize();
    particle.userData.velocity.x += toCenter.x * 0.00002;
    particle.userData.velocity.y += toCenter.y * 0.00002;
    particle.userData.velocity.z += toCenter.z * 0.00002;
    
    // Fade out
    particle.userData.life -= 0.003;
    particle.material.opacity = Math.max(0, particle.userData.life);
    
    // Rotate
    particle.rotation.x += particle.userData.rotSpeed.x;
    particle.rotation.y += particle.userData.rotSpeed.y;
    particle.rotation.z += particle.userData.rotSpeed.z;
  });
}

/**
 * Clean up debris particles
 */
function cleanupMoonDebris() {
  moonFormationParticles.forEach(particle => {
    scene.remove(particle);
    particle.geometry.dispose();
    particle.material.dispose();
  });
  moonFormationParticles = [];
}

/**
 * Get Moon mesh
 */
export function getMoon() {
  return moon;
}

// Make triggerMoonFormation globally accessible for onclick handlers
window.triggerMoonFormation = triggerMoonFormation;
