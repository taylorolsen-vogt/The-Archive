/**
 * THE ARCHIVE - STARFIELD MODULE
 * Animated star background with shooting stars
 */

// Canvas and context
const spaceCanvas = document.getElementById('spaceCanvas');
const spaceCtx = spaceCanvas.getContext('2d');

// State
let stars = [];
let time = 0;
let shootingStar = null;

/**
 * Star class - individual twinkling star
 */
class Star {
  constructor() {
    this.x = Math.random() * spaceCanvas.width;
    this.y = Math.random() * spaceCanvas.height;
    this.isShootingStar = false;

    const layer = Math.random();

    // Bright foreground stars
    if (layer > 0.96) {
      this.size = Math.random() * 0.9 + 0.6;
      this.baseOpacity = Math.random() * 0.35 + 0.35;
      this.glimmer = 0.015;
    } 
    // Mid-layer stars
    else if (layer > 0.65) {
      this.size = Math.random() * 0.45 + 0.2;
      this.baseOpacity = Math.random() * 0.25 + 0.15;
      this.glimmer = 0.01;
    } 
    // Background stars
    else {
      this.size = Math.random() * 0.35 + 0.1;
      this.baseOpacity = Math.random() * 0.18 + 0.05;
      this.glimmer = 0.005;
    }

    this.phase = Math.random() * Math.PI * 2;
    this.frequency = Math.random() * 0.006 + 0.002;
    this.amplitude = Math.random() * 0.1 + 0.03;
    this.drift = Math.random() * 0.00025 + 0.0001;

    this.opacity = this.baseOpacity;
  }

  update() {
    this.phase += this.drift;

    const breath = Math.sin(time * this.frequency + this.phase);
    const noise = (Math.random() - 0.5) * this.glimmer;

    this.opacity = this.baseOpacity + breath * this.amplitude + noise;

    if (this.opacity < 0.02) this.opacity = 0.02;
    if (this.opacity > 1) this.opacity = 1;
  }

  draw() {
    spaceCtx.globalAlpha = this.opacity;
    spaceCtx.fillStyle = '#ffffff';
    spaceCtx.beginPath();
    spaceCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    spaceCtx.fill();
  }
}

/**
 * Create initial star field
 */
function createStars() {
  stars = [];
  const count = Math.floor((spaceCanvas.width * spaceCanvas.height) / 3300);
  for (let i = 0; i < count; i++) stars.push(new Star());
}

/**
 * Resize canvas and regenerate stars
 */
export function resizeStarfield() {
  spaceCanvas.width = window.innerWidth;
  spaceCanvas.height = window.innerHeight;
  createStars();
}

/**
 * Main animation loop for starfield
 */
export function animateStars() {
  time += 0.0028;

  // Clear canvas
  spaceCtx.globalAlpha = 1;
  spaceCtx.fillStyle = '#000';
  spaceCtx.fillRect(0, 0, spaceCanvas.width, spaceCanvas.height);

  // Update and draw all stars
  for (const star of stars) {
    star.update();
    star.draw();
  }

  // Randomly spawn shooting star (rare)
  if (!shootingStar && Math.random() < 0.002) {
    shootingStar = {
      x: Math.random() * spaceCanvas.width,
      y: Math.random() * spaceCanvas.height * 0.6,
      length: Math.random() * 80 + 40,
      angle: Math.random() * Math.PI / 4 + Math.PI / 6,
      speed: Math.random() * 8 + 6,
      opacity: 1,
      life: 0
    };
  }

  // Draw shooting star
  if (shootingStar) {
    shootingStar.life += 0.05;
    shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
    shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
    shootingStar.opacity = Math.max(0, 1 - shootingStar.life);

    if (shootingStar.opacity > 0) {
      const gradient = spaceCtx.createLinearGradient(
        shootingStar.x,
        shootingStar.y,
        shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
        shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
      );
      gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`);
      gradient.addColorStop(0.3, `rgba(220, 240, 255, ${shootingStar.opacity * 0.8})`);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      spaceCtx.strokeStyle = gradient;
      spaceCtx.lineWidth = 2.5;
      spaceCtx.shadowBlur = 8;
      spaceCtx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      spaceCtx.beginPath();
      spaceCtx.moveTo(shootingStar.x, shootingStar.y);
      spaceCtx.lineTo(
        shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length,
        shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length
      );
      spaceCtx.stroke();
      spaceCtx.shadowBlur = 0;
    } else {
      shootingStar = null;
    }
  }

  requestAnimationFrame(animateStars);
}

/**
 * Initialize starfield
 */
export function initStarfield() {
  resizeStarfield();
  animateStars();
}
