/**
 * THE ARCHIVE - TIMELINE MODULE
 * Timeline rendering, dots generation, and date display
 */

import { timelineData } from '../data/timeline-data.js';
import { formatYear } from './utils.js';

// Current timeline state
let currentLevel = timelineData;

/**
 * Render timeline dots for current level
 */
export function renderTimelineDots() {
  const track = document.getElementById('timelineTrack');
  const slider = document.getElementById('timelineSlider');
  
  // Remove existing dots
  const existingDots = track.querySelectorAll('.timeline-marker-dot');
  existingDots.forEach(dot => dot.remove());
  
  // Create dots for current level items
  currentLevel.items.forEach(item => {
    const dot = document.createElement('div');
    dot.className = 'timeline-marker-dot';
    
    // Add type-specific class for styling (eon, era, period, epoch)
    if (item.type) {
      dot.classList.add(item.type);
    }
    
    dot.style.left = `${item.value}%`;
    dot.setAttribute('data-id', item.id);
    track.appendChild(dot);
  });
  
  // Update slider to show last item by default
  if (currentLevel.items.length > 0) {
    const lastItem = currentLevel.items[currentLevel.items.length - 1];
    slider.value = lastItem.value;
    updateTimelineDate(lastItem);
  }
}

/**
 * Update timeline date display
 * @param {object} item - Timeline item to display
 * @param {boolean} isHover - Whether this is a hover preview
 */
export function updateTimelineDate(item, isHover = false) {
  const dateDisplay = document.getElementById('timelineDate');
  const yearStr = formatYear(item.yearStart);
  
  dateDisplay.textContent = `${item.name} - ${yearStr}`;
  dateDisplay.style.opacity = isHover ? '0.7' : '0.9';
}

/**
 * Update timeline display based on slider value
 * @param {number} value - Slider value (0-100)
 * @param {boolean} isHover - Whether this is hover preview
 */
export function updateTimeline(value, isHover = false) {
  const items = currentLevel.items;
  
  // Find closest item to slider value
  let closestItem = items[0];
  let minDiff = Math.abs(value - items[0].value);
  
  for (let item of items) {
    const diff = Math.abs(value - item.value);
    if (diff < minDiff) {
      minDiff = diff;
      closestItem = item;
    }
  }
  
  // Only update if meaningful change (avoid flicker on small movements)
  const slider = document.getElementById('timelineSlider');
  if (!isHover || Math.abs(value - parseFloat(slider.value)) > 2) {
    updateTimelineDate(closestItem, isHover);
  }
  
  return closestItem;
}

/**
 * Find item at specific timeline value
 * @param {number} value - Timeline value (0-100)
 * @returns {object} Closest timeline item
 */
export function getItemAtValue(value) {
  const items = currentLevel.items;
  let closestItem = items[0];
  let minDiff = Math.abs(value - items[0].value);
  
  for (let item of items) {
    const diff = Math.abs(value - item.value);
    if (diff < minDiff) {
      minDiff = diff;
      closestItem = item;
    }
  }
  
  return closestItem;
}

/**
 * Set current timeline level
 */
export function setCurrentLevel(level) {
  currentLevel = level;
}

/**
 * Get current timeline level
 */
export function getCurrentLevel() {
  return currentLevel;
}

/**
 * Get timeline data root
 */
export function getTimelineData() {
  return timelineData;
}
