/**
 * THE ARCHIVE - TIMELINE SYSTEM MODULE
 * Complete timeline management: drill-down navigation, rendering, playback
 * CONSOLIDATED FROM: navigation.js + timeline.js + playback.js
 */

import { timelineData } from '../data/timeline-data.js';
import { formatYear } from './utils.js';
import { openPanel, closePanel, getCurrentDisplayedItem } from './panel.js';
import { changeEarthTexture, updateTimelineVisibility } from './earth.js';

/* ============================
   Timeline State
============================ */

// Current timeline state
let currentLevel = timelineData;
let currentYear = 2026; // Start at present

// Navigation history (from navigation.js)
let navigationHistory = [];
let breadcrumbPath = [];

// Playback state (from playback.js)
let isPlaying = false;
let playbackQueue = [];
let playbackIndex = 0;
let playbackInterval = null;

/* ============================
   Timeline Rendering (from timeline.js)
============================ */

/**
 * Get current timeline year
 */
export function getCurrentTimelineYear() {
  return currentYear;
}

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
  
  // Update current year for layer filtering
  currentYear = closestItem.yearStart;
  
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

/* ============================
   Timeline Navigation (from navigation.js)
============================ */

/**
 * Drill down into a child item (navigate deeper in hierarchy)
 * @param {string} childId - ID of child item to navigate to
 */
export function drillDown(childId) {
  const currentDisplayedItem = getCurrentDisplayedItem();
  
  if (!currentDisplayedItem || !currentDisplayedItem.children) {
    return;
  }
  
  const childItem = currentDisplayedItem.children.find(item => item.id === childId);
  
  if (!childItem) {
    return;
  }
  
  // Save current level to history
  const currentLevel = getCurrentLevel();
  navigationHistory.push({
    level: currentLevel.level,
    items: currentLevel.items,
    parent: currentDisplayedItem
  });
  
  // Update breadcrumb path
  breadcrumbPath.push(childItem.name);
  
  // Update current level to this child
  const newLevel = {
    level: childItem.type + 's', // 'eon' -> 'eons', 'era' -> 'eras'
    items: childItem.children || [],
    parent: childItem
  };
  
  setCurrentLevel(newLevel);
  
  // Re-render timeline with new level's items
  renderTimelineDots();
  
  // Update panel to show this child's details
  openPanel(childItem, updateBreadcrumb, changeEarthTexture, drillDown);
}

/**
 * Navigate to a specific level in breadcrumb
 * @param {number} levelIndex - Index of level to navigate to (0 = top)
 */
export function navigateToLevel(levelIndex) {
  const timelineData = getTimelineData();
  
  // Reset to that level
  while (navigationHistory.length > levelIndex) {
    navigationHistory.pop();
    breadcrumbPath.pop();
  }
  
  // Restore level from history or reset to top
  if (levelIndex === 0) {
    setCurrentLevel(timelineData);
  } else if (navigationHistory[levelIndex - 1]) {
    const historyEntry = navigationHistory[levelIndex - 1];
    setCurrentLevel({
      level: historyEntry.level,
      items: historyEntry.items,
      parent: historyEntry.parent
    });
  }
  
  renderTimelineDots();
  closePanel();
}

/**
 * Return to present day (reset everything)
 */
export function returnToPresent() {
  const timelineData = getTimelineData();
  
  // Reset to top level
  setCurrentLevel(timelineData);
  breadcrumbPath = [];
  navigationHistory = [];
  
  // Update timeline
  renderTimelineDots();
  
  // Update slider to present (100%)
  const slider = document.getElementById('timelineSlider');
  slider.value = 100;
  
  // Change Earth texture to modern
  changeEarthTexture('holocene');
  
  // Update timeline visibility to present day
  updateTimelineVisibility(2026);
  
  // Close panel
  closePanel();
  
  // Update date display
  document.getElementById('timelineDate').textContent = 'Present Day - 2026 CE';
}

/**
 * Open panel for timeline value (from slider)
 * @param {number} value - Timeline slider value (0-100)
 */
export function openPanelForTimelineValue(value) {
  const item = getItemAtValue(value);
  openPanel(item, updateBreadcrumb, changeEarthTexture, drillDown);
}

/**
 * Update breadcrumb display
 */
export function updateBreadcrumb() {
  const breadcrumbEl = document.getElementById('panelBreadcrumb');
  const currentDisplayedItem = getCurrentDisplayedItem();
  
  // Build breadcrumb HTML
  const hierarchyLevels = getHierarchyLevels();
  const currentIndex = getCurrentLevelIndex();
  
  const breadcrumbHTML = hierarchyLevels.map((levelName, index) => {
    const separator = index < hierarchyLevels.length - 1 ? '<span class="breadcrumb-separator">›</span>' : '';
    
    let itemClass = 'breadcrumb-item';
    if (index === currentIndex) {
      itemClass += ' current';
    } else if (index > currentIndex) {
      itemClass += ' future';
    }
    
    return `
      <span class="${itemClass}" onclick="navigateToLevel(${index})">${levelName}</span>
      ${separator}
    `;
  }).join('');
  
  breadcrumbEl.innerHTML = breadcrumbHTML;
}

/**
 * Get hierarchy levels for breadcrumb
 */
function getHierarchyLevels() {
  const allLevels = ['Eons', 'Eras', 'Periods', 'Epochs'];
  const depth = navigationHistory.length;
  return allLevels.slice(0, Math.min(depth + 2, allLevels.length));
}

/**
 * Get current level index (for breadcrumb highlighting)
 */
function getCurrentLevelIndex() {
  return navigationHistory.length;
}

/**
 * Get navigation history
 */
export function getNavigationHistory() {
  return navigationHistory;
}

/* ============================
   Playback System (from playback.js)
============================ */

/**
 * Toggle auto-play on/off
 */
export function togglePlayback() {
  const playButton = document.getElementById('playButton');
  const dateDisplay = document.getElementById('timelineDate');
  const playbackIndicator = document.getElementById('playbackIndicator');
  
  if (!isPlaying) {
    // Start playback
    isPlaying = true;
    playButton.textContent = '⏸';
    playButton.classList.add('playing');
    dateDisplay.classList.add('playback-active');
    playbackIndicator.classList.add('visible');
    
    buildPlaybackQueue();
    playbackIndex = 0;
    playNextItem();
  } else {
    // Stop playback
    pausePlayback();
  }
}

/**
 * Pause playback
 */
export function pausePlayback() {
  isPlaying = false;
  const playButton = document.getElementById('playButton');
  const dateDisplay = document.getElementById('timelineDate');
  const playbackIndicator = document.getElementById('playbackIndicator');
  
  playButton.textContent = '▶';
  playButton.classList.remove('playing');
  dateDisplay.classList.remove('playback-active');
  playbackIndicator.classList.remove('visible');
  
  if (playbackInterval) {
    clearTimeout(playbackInterval);
    playbackInterval = null;
  }
}

/**
 * Build queue of only top-level timeline items (the 4 eras + present)
 */
function buildPlaybackQueue() {
  const timelineData = getTimelineData();
  const queue = [];
  
  // Add only top-level items (the 4 major eras)
  if (timelineData.items && timelineData.items.length > 0) {
    queue.push(...timelineData.items);
  }
  
  // Add present day marker
  queue.push({
    id: 'presentday',
    name: 'Present Day',
    yearStart: 2026,
    value: 100
  });
  
  // Sort by year (oldest first)
  queue.sort((a, b) => a.yearStart - b.yearStart);
  
  playbackQueue = queue;
  
  console.log('📺 Playback queue built:', playbackQueue.map(item => ({ id: item.id, name: item.name })));
}

/**
 * Play next item in queue
 */
function playNextItem() {
  if (!isPlaying || playbackIndex >= playbackQueue.length) {
    pausePlayback();
    return;
  }
  
  const item = playbackQueue[playbackIndex];
  
  console.log(`▶️ Playing item ${playbackIndex + 1}/${playbackQueue.length}:`, { id: item.id, name: item.name });
  
  // Update playback indicator position on timeline
  const playbackIndicator = document.getElementById('playbackIndicator');
  playbackIndicator.style.left = `${item.value}%`;
  
  // Change Earth texture based on the era
  console.log(`🌍 Changing texture to: ${item.id}`);
  changeEarthTexture(item.id);
  
  // Open panel for this item
  openPanelForTimelineValue(item.value);
  
  playbackIndex++;
  
  // Longer pause for each era (3 seconds per era for better viewing)
  const pauseDuration = 3000;
  
  // Schedule next item
  playbackInterval = setTimeout(() => {
    playNextItem();
  }, pauseDuration);
}

/* ============================
   Global Functions
============================ */

// Make functions globally accessible for onclick handlers
window.navigateToLevel = navigateToLevel;
window.returnToPresent = returnToPresent;
window.drillDown = drillDown;
window.togglePlayback = togglePlayback;
