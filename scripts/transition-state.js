/**
 * THE ARCHIVE - TRANSITION STATE MODULE
 * Manages global transition state to prevent circular imports
 */

let isTransitioning = false;

export function setIsTransitioning(value) {
  isTransitioning = value;
}

export function getIsTransitioning() {
  return isTransitioning;
}
