/**
 * THE ARCHIVE - NAVIGATION MODULE  
 * Drill-down logic, breadcrumb navigation, and level traversal
 */

import { getTimelineData, setCurrentLevel, getCurrentLevel, renderTimelineDots, getItemAtValue } from './timeline.js';
import { openPanel, closePanel, getCurrentDisplayedItem } from './panel.js';
import { changeEarthTexture, updateTimelineVisibility } from './earth.js';

// Navigation state
let navigationHistory = [];
let breadcrumbPath = [];

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

// Make functions globally accessible for onclick handlers
window.navigateToLevel = navigateToLevel;
window.returnToPresent = returnToPresent;
window.drillDown = drillDown;
