# JavaScript Extraction Guide

This document maps where each section of the original JavaScript should go.

## Original File Structure (line numbers)

```
Line    926: <script> tag starts
Lines   927-1063: Starfield animation → starfield.js
Lines 1066-1165: Panel atmosphere shader → panel.js
Lines 1166-1446: Timeline data → ✅ DONE (timeline-data.js)
Lines 1447-1510: Navigation state & functions → navigation.js
Lines 1511-1648: Timeline rendering → timeline.js
Lines 1649-1845: Info panel population → panel.js
Lines 1846-1998: Earth rendering & layers → earth.js
Lines 1999-2121: Timeline marker generation → timeline.js
Lines 2122-2282: Event handlers & interactions → navigation.js
Lines 2283-2413: Playback system → playback.js (new)
Lines 2414-2589: Camera transitions → camera.js
Lines 2590-2689: Moon rendering & orbit → moon.js
Lines 2690-2821: Satellite system → satellites.js
Lines 2822-2879: Coordinate display → utils.js
Lines 2880-2936: Initialization & boot sequence → main.js
```

## Module Breakdown

### 1. starfield.js
**Lines:** 927-1063 (137 lines)
**Exports:**
- `initStarfield()`
- `resizeStarfield()`

**Contains:**
- Star class definition
- Shooting star logic
- Canvas animation loop
- Atmospheric star rendering

---

### 2. panel.js
**Lines:** 1066-1165 + 1649-1845 (296 lines combined)
**Exports:**
- `initPanelAtmosphere()`
- `openPanel(itemData, path)`
- `closePanel()`
- `populatePanel(itemData)`

**Contains:**
- Glassmorphic shader background
- Panel content population
- Breadcrumb rendering
- Event/subdivision display logic

---

### 3. timeline.js
**Lines:** 1511-1648 + 1999-2121 (258 lines combined)
**Exports:**
- `renderTimeline(items, levelType)`
- `updateTimelineDate(year, description)`
- `generateTimelineMarkers()`

**Contains:**
- Timeline dot generation
- Position calculation
- Hover states
- Date formatting
- Marker sizing by level

---

### 4. navigation.js
**Lines:** 1447-1510 + 2122-2282 (223 lines combined)
**Exports:**
- `drillDown(item)`
- `navigateToBreadcrumb(index)`
- `returnToPresent()`
- `handleTimelineClick(event)`

**Contains:**
- Breadcrumb path management
- Level traversal
- Click handlers
- Navigation state

---

### 5. earth.js
**Lines:** 1846-1998 (153 lines)
**Exports:**
- `createEarth()`
- `updateEarthTexture(year)`
- `updateCityLights(enabled)`
- `updateAtmosphere(year)`

**Contains:**
- Earth mesh creation
- Texture loading & switching
- Atmosphere shader
- City lights layer
- Rotation logic

---

### 6. moon.js
**Lines:** 2590-2689 (100 lines)
**Exports:**
- `createMoon()`
- `updateMoonVisibility(year)`
- `updateMoonOrbit()`
- `playMoonImpact()`

**Contains:**
- Moon mesh creation
- Orbital mechanics
- Formation event logic
- Theia impact animation

---

### 7. satellites.js
**Lines:** 2690-2821 (132 lines)
**Exports:**
- `createSatellites()`
- `updateSatelliteVisibility(enabled)`
- `updateSatelliteFade(cameraDistance)`

**Contains:**
- Satellite sprite creation
- Orbital paths
- Distance-based opacity
- LEO/MEO/GEO positioning

---

### 8. camera.js
**Lines:** 2414-2589 (176 lines)
**Exports:**
- `initCamera()`
- `transitionCamera(targetZ, duration)`
- `updateCameraControls()`

**Contains:**
- Camera setup
- Orbit controls
- Zoom transitions
- View state management

---

### 9. playback.js (NEW - extracted from timeline logic)
**Lines:** 2283-2413 (131 lines)
**Exports:**
- `togglePlayback()`
- `updatePlayback()`
- `pausePlayback()`

**Contains:**
- Auto-play functionality
- Timeline slider sync
- Playback speed control
- Progress indicator

---

### 10. layers.js
**Lines:** Part of earth.js + panel interaction (80 lines estimated)
**Exports:**
- `toggleLayer(layerName)`
- `toggleLayersPanel()`
- `updateLayerState(layerName, state)`

**Contains:**
- Layer toggle logic
- Panel visibility
- Layer state management
- UI synchronization

---

### 11. scene.js
**Lines:** Part of initialization (100 lines estimated)
**Exports:**
- `initScene()`
- `setupRenderer()`
- `setupLighting()`
- `animate()`

**Contains:**
- Three.js scene creation
- Renderer configuration
- Lighting setup
- Main animation loop
- Resize handlers

---

### 12. utils.js
**Lines:** 2822-2879 + scattered helper functions (120 lines)
**Exports:**
- `formatYearDisplay(year)`
- `updateCoordinateDisplay(target, rotation)`
- `latLonToVector3(lat, lon, radius)`
- `calculateEarthRotation(lat, lon)`

**Contains:**
- Date formatting functions
- Coordinate conversions
- Math utilities
- Display helpers

---

### 13. main.js (Orchestrator)
**Lines:** 2880-2936 + imports + initialization (150 lines)
**Exports:** None (entry point)

**Imports ALL other modules and:**
- Initializes all systems
- Runs boot sequence
- Sets up global event listeners
- Starts animation loops
- Handles window resize

---

## Extraction Order (Recommended)

1. ✅ **config.js** - DONE
2. ✅ **timeline-data.js** - DONE
3. **utils.js** - No dependencies
4. **starfield.js** - Standalone
5. **scene.js** - Needs THREE.js
6. **earth.js** - Needs scene, config
7. **moon.js** - Needs scene, config
8. **satellites.js** - Needs scene, config
9. **camera.js** - Needs scene
10. **timeline.js** - Needs data, utils
11. **panel.js** - Needs data, utils
12. **navigation.js** - Needs timeline, panel, camera
13. **playback.js** - Needs timeline, navigation
14. **layers.js** - Needs earth, satellites, camera
15. **main.js** - Last (imports everything)

---

## Testing Strategy

After each module extraction:
1. Verify no syntax errors
2. Check exports are correct
3. Update main.js imports
4. Test on GitHub Pages
5. Verify functionality preserved

---

## Current Status

✅ Completed:
- config.js
- timeline-data.js

⏳ Next up:
- utils.js (no dependencies, good starting point)
- starfield.js (standalone, easy win)

---

## Notes

- All texture paths in config.js use absolute paths from root
- ES6 modules use `type="module"` in script tag
- GitHub Pages serves from root, so paths are `/textures/...`
- Remember to preserve all comments explaining WHY things work
- Each module should be <500 lines for maintainability
