
let isTransitioning = false;
let currentBody = 'earth';  // ← THIS WAS MISSING

export function setIsTransitioning(value) {
  isTransitioning = value;
}

export function getIsTransitioning() {
  return isTransitioning;
}

export function setCurrentBody(body) {
  currentBody = body;
}

export function getCurrentBody() {
  return currentBody;
}