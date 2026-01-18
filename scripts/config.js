/**
 * THE ARCHIVE - CONFIGURATION
 * Central configuration file for all constants and settings
 */

// ===== CAMERA POSITIONS =====
export const CAMERA_POSITIONS = {
  ORBIT: 3.5,      // Default view - Moon visible
  LEO: 1.8,        // Low Earth Orbit - Satellites visible
  STREET: 0.01,    // Future: Street level
  BUILDING: 0.001  // Future: Building interior
};

// ===== LAYER STATES (Initial) =====
export const INITIAL_LAYER_STATES = {
  satellites: false,
  cityLights: true
};

// ===== TIMELINE THRESHOLDS =====
export const TIMELINE_THRESHOLDS = {
  MOON_FORMATION: -4500000000,       // Moon appears after this year
  ATMOSPHERE_FORMATION: -2400000000, // Atmosphere appears after Great Oxidation Event
  CITY_LIGHTS_START: -150            // City lights appear in last 150 years
};

// ===== EARTH TEXTURES =====
export const EARTH_TEXTURES = {
  MODERN_DAY: '/textures/earth/earth_day.jpg',
  MODERN_NIGHT: '/textures/earth/earth_night.jpg',
  HADEAN: '/textures/earth/hadean.jpg',
  ARCHEAN: '/textures/earth/archean.jpg',
  PROTEROZOIC: '/textures/earth/ice_planet.jpg',
  PANGAEA: '/textures/earth/pangaea.jpg'
};

// ===== MOON TEXTURES =====
export const MOON_TEXTURES = {
  SURFACE: '/textures/moon/moon.jpg'
};

// ===== SATELLITE TEXTURES =====
export const SATELLITE_TEXTURES = {
  ISS: '/textures/satellites/iss.png',
  HUBBLE: '/textures/satellites/hubble.png',
  GENERIC: '/textures/satellites/generic-satellite.png',
  COMMUNICATION: '/textures/satellites/communication-sat.png'
};

// ===== EVENT MEDIA =====
export const EVENT_MEDIA = {
  MOON_IMPACT: '/textures/events/moon-impact.mp4'
};

// ===== COLORS =====
export const COLORS = {
  PRIMARY: '#4d99cc',           // Main blue
  PRIMARY_LIGHT: '#81d4fa',     // Light blue
  ACCENT: '#4fc3f7',            // Bright cyan
  WHITE: '#ffffff',
  BLACK: '#000000'
};

// ===== ANIMATION TIMINGS =====
export const ANIMATION = {
  BOOT_DELAY: 2000,              // ms before boot sequence starts
  TOOLBAR_DELAY: 1600,           // ms for toolbar slide in
  CAMERA_TRANSITION: 1000,       // ms for camera zoom transitions
  PANEL_SLIDE: 500               // ms for info panel slide
};

// ===== PLAYBACK =====
export const PLAYBACK = {
  SPEED: 50,                     // Playback speed multiplier
  UPDATE_INTERVAL: 50            // ms between playback updates
};

// ===== MOON ORBIT =====
export const MOON = {
  ORBITAL_RADIUS: 3,             // Units from Earth center
  ORBITAL_SPEED: 0.0005          // Radians per frame
};

// ===== SATELLITE ORBITS =====
export const SATELLITES = {
  LEO: {
    ALTITUDE: 1.08,              // Low Earth Orbit (400-1000km scaled)
    SPEED: 0.002
  },
  MEO: {
    ALTITUDE: 1.3,               // Medium Earth Orbit (~20,000km scaled)
    SPEED: 0.001
  },
  GEO: {
    ALTITUDE: 1.6,               // Geostationary Orbit (~36,000km scaled)
    SPEED: 0.0003
  }
};
