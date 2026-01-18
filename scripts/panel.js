/**
 * THE ARCHIVE - PANEL MODULE
 * Info panel with glassmorphic shader background and content population
 */

import { formatYear } from './utils.js';

// Panel Three.js scene for glassmorphic shader
let panelScene, panelCamera, panelRenderer, panelAtmosphere;

// Current displayed item reference
let currentDisplayedItem = null;

/**
 * Initialize glassmorphic shader background for panel
 */
export function initPanelAtmosphere() {
  const panelCanvas = document.getElementById('panelCanvas');
  const panel = document.getElementById('infoPanel');
  
  if (!panelCanvas || !panel) return;
  
  panelScene = new THREE.Scene();
  
  const height = window.innerHeight - 48 - 120;
  
  panelCamera = new THREE.PerspectiveCamera(
    45,
    380 / height,
    0.1,
    10
  );
  panelCamera.position.z = 2;
  
  panelRenderer = new THREE.WebGLRenderer({ 
    canvas: panelCanvas,
    alpha: true,
    antialias: true
  });
  panelRenderer.setSize(380, height);
  panelRenderer.setPixelRatio(window.devicePixelRatio);
  panelRenderer.setClearColor(0x000000, 0);
  
  const geometry = new THREE.PlaneGeometry(4, 6);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      colorR: { value: 0.3 },
      colorG: { value: 0.6 },
      colorB: { value: 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float colorR;
      uniform float colorG;
      uniform float colorB;
      varying vec2 vUv;
      
      void main() {
        vec2 center = vec2(0.0, 0.5);
        float dist = distance(vUv, center);
        
        float glow1 = 1.0 - smoothstep(0.0, 1.2, dist);
        glow1 = pow(glow1, 0.8);
        
        float glow2 = 1.0 - smoothstep(0.0, 0.6, dist);
        glow2 = pow(glow2, 2.0);
        
        float edgeGlow = 1.0 - smoothstep(0.0, 0.3, vUv.x);
        edgeGlow = pow(edgeGlow, 2.0);
        
        float totalGlow = glow1 * 0.8 + glow2 * 1.2 + edgeGlow * 0.6;
        
        float wave1 = sin(vUv.y * 8.0 + time * 0.5) * 0.08;
        float wave2 = sin(vUv.y * 12.0 - time * 0.3) * 0.05;
        totalGlow += wave1 + wave2;
        
        vec3 color = vec3(colorR, colorG, colorB);
        
        gl_FragColor = vec4(color * totalGlow * 1.5, totalGlow * 0.85);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  panelAtmosphere = new THREE.Mesh(geometry, material);
  panelScene.add(panelAtmosphere);
  
  animatePanelAtmosphere();
}

/**
 * Update panel shader color based on current body
 * @param {string} body - 'earth', 'moon', or 'mars'
 */
export function updatePanelTheme(body) {
  if (!panelAtmosphere) return;
  
  const colors = {
    earth: { r: 0.3, g: 0.6, b: 1.0 },   // Blue
    moon: { r: 0.75, g: 0.75, b: 0.75 },  // Light grey
    mars: { r: 0.8, g: 0.4, b: 0.2 }      // Orange/red
  };
  
  const color = colors[body] || colors.earth;
  
  panelAtmosphere.material.uniforms.colorR.value = color.r;
  panelAtmosphere.material.uniforms.colorG.value = color.g;
  panelAtmosphere.material.uniforms.colorB.value = color.b;
}

/**
 * Animate panel shader background
 */
function animatePanelAtmosphere() {
  requestAnimationFrame(animatePanelAtmosphere);
  
  if (panelAtmosphere) {
    panelAtmosphere.material.uniforms.time.value += 0.01;
    panelRenderer.render(panelScene, panelCamera);
  }
}

/**
 * Open info panel with item details
 * @param {object} item - Timeline item to display
 * @param {function} updateBreadcrumbCallback - Callback to update breadcrumb
 * @param {function} changeEarthTextureCallback - Callback to change Earth texture
 * @param {function} drillDownCallback - Callback for drilling down into subdivisions
 */
export function openPanel(item, updateBreadcrumbCallback, changeEarthTextureCallback, drillDownCallback) {
  const panel = document.getElementById('infoPanel');
  const earthCanvas = document.getElementById('earthCanvas');
  
  // Store the item we're displaying
  currentDisplayedItem = item;
  
  // Change Earth texture based on the era
  if (item.id && changeEarthTextureCallback) {
    changeEarthTextureCallback(item.id);
  }
  
  // Update breadcrumb
  if (updateBreadcrumbCallback) {
    updateBreadcrumbCallback();
  }
  
  document.getElementById('panelTitle').textContent = item.name;
  const yearStr = formatYear(item.yearStart);
  document.getElementById('panelDate').textContent = yearStr;
  document.getElementById('panelDescription').textContent = item.description;
  
  // Show subdivisions if this item has children
  const subdivisionsSection = document.getElementById('subdivisionsSection');
  const subdivisionsContainer = document.getElementById('panelSubdivisions');
  
  if (item.children && item.children.length > 0) {
    subdivisionsSection.style.display = 'block';
    
    // Update section title based on what this item contains
    const sectionTitle = subdivisionsSection.querySelector('.panel-section-title');
    sectionTitle.textContent = getSubdivisionLabel(item.type);
    
    subdivisionsContainer.innerHTML = item.children.map((child) => `
      <div class="subdivision-item" data-child-id="${child.id}">
        <div class="subdivision-info">
          <div class="subdivision-name">
            ${child.name}
          </div>
          <div class="subdivision-date">${formatYear(child.yearStart)}</div>
        </div>
        <div class="subdivision-arrow">›</div>
      </div>
    `).join('');
    
    // Add click handlers after rendering
    subdivisionsContainer.querySelectorAll('.subdivision-item').forEach(el => {
      el.addEventListener('click', () => {
        const childId = el.getAttribute('data-child-id');
        if (drillDownCallback) {
          drillDownCallback(childId);
        }
      });
    });
  } else {
    subdivisionsSection.style.display = 'none';
  }
  
  // Show events section
  const eventsSection = document.getElementById('eventsSection');
  const eventsContainer = document.getElementById('panelEvents');
  
  if (item.events && item.events.length > 0) {
    eventsSection.style.display = 'block';
    eventsContainer.innerHTML = item.events.map((event, i) => {
      // Only show location icon for events with specific coordinates (not "Global")
      const hasSpecificLocation = event.location !== "Global" && event.lat !== 0;
      const locationIcon = hasSpecificLocation ? '<span class="location-icon">📍</span>' : '';
      
      // Check if this is the Moon Formation event
      const isMoonFormation = event.name.includes('Moon Formation');
      const clickHandler = isMoonFormation ? 'onclick="triggerMoonFormation()"' : '';
      const cursorStyle = isMoonFormation ? 'cursor: pointer;' : '';
      
      return `
        <div class="event-item" ${clickHandler} style="${cursorStyle}">
          <div class="event-name">
            ${locationIcon}
            ${event.name}
            ${isMoonFormation ? ' <span style="font-size: 0.8em; opacity: 0.7;">(▶ Play)</span>' : ''}
          </div>
          <div class="event-location">${event.location}</div>
        </div>
      `;
    }).join('');
  } else {
    eventsSection.style.display = 'none';
  }
  
  panel.classList.add('visible');
  earthCanvas.classList.add('panel-open');
  document.getElementById('timeline').classList.add('panel-open');
  
  // Check if panel is scrollable and add indicator
  setTimeout(() => {
    if (panel.scrollHeight > panel.clientHeight) {
      panel.classList.add('scrollable');
    } else {
      panel.classList.remove('scrollable');
    }
  }, 100);
}

/**
 * Close info panel
 */
export function closePanel() {
  document.getElementById('infoPanel').classList.remove('visible');
  document.getElementById('earthCanvas').classList.remove('panel-open');
  document.getElementById('timeline').classList.remove('panel-open');
}

/**
 * Get subdivision label based on parent type
 * @param {string} parentType - Type of parent (eon, era, period, epoch)
 * @returns {string} Label for subdivisions
 */
function getSubdivisionLabel(parentType) {
  const labelMap = {
    'eon': 'Eras',
    'era': 'Periods',
    'period': 'Epochs',
    'epoch': 'Ages'
  };
  return labelMap[parentType] || 'Sub-Divisions';
}

/**
 * Get current displayed item
 * @returns {object} Current item being displayed in panel
 */
export function getCurrentDisplayedItem() {
  return currentDisplayedItem;
}
