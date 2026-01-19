/**
 * THE ARCHIVE - PLAYBACK MODULE
 * Auto-play functionality for timeline animation
 */

import { getTimelineData } from './timeline.js';
import { openPanelForTimelineValue } from './navigation.js';

// Playback state
let isPlaying = false;
let playbackQueue = [];
let playbackIndex = 0;
let playbackInterval = null;

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
    
    // Jump to present day first (2026) - find the closest item to present
    const presentYear = 2026;
    playbackIndex = playbackQueue.findIndex(item => item.yearStart >= presentYear);
    if (playbackIndex === -1) {
      // If no future items, start from the end (most recent)
      playbackIndex = playbackQueue.length - 1;
    }
    
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
 * Build queue of all timeline items in chronological order
 */
function buildPlaybackQueue() {
  const timelineData = getTimelineData();
  const queue = [];
  
  function addItemsRecursively(items) {
    for (const item of items) {
      queue.push(item);
      if (item.children && item.children.length > 0) {
        addItemsRecursively(item.children);
      }
    }
  }
  
  addItemsRecursively(timelineData.items);
  
  // Sort by year (oldest first)
  queue.sort((a, b) => a.yearStart - b.yearStart);
  
  playbackQueue = queue;
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
  
  // Update playback indicator position on timeline
  const playbackIndicator = document.getElementById('playbackIndicator');
  playbackIndicator.style.left = `${item.value}%`;
  
  // Open panel for this item
  openPanelForTimelineValue(item.value);
  
  playbackIndex++;
  
  // Calculate pause duration (shorter for recent history, longer for deep time)
  const pauseDuration = item.yearStart < -1000000 ? 2000 : 1500;
  
  // Schedule next item
  playbackInterval = setTimeout(() => {
    playNextItem();
  }, pauseDuration);
}

// Make globally accessible for onclick handler
window.togglePlayback = togglePlayback;
