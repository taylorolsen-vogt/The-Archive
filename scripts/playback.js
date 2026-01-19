/**
 * THE ARCHIVE - PLAYBACK MODULE
 * Auto-play functionality for timeline animation
 */

import { getTimelineData } from './timeline.js';
import { openPanelForTimelineValue } from './navigation.js';
import { changeEarthTexture } from './earth.js';

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
    name: 'Present Day',
    yearStart: 2026,
    value: 100
  });
  
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
  
  // Change Earth texture based on the era
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

// Make globally accessible for onclick handler
window.togglePlayback = togglePlayback;
