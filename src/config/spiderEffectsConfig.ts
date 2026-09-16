/**
 * Centralized configuration parameters for the Spider-Man Interaction System.
 * All effect intensities, distances, and cooldowns are tuned for subtlety and performance.
 */
export const SPIDER_EFFECTS_CONFIG = {
  // 1. Cursor-reactive Web Network
  WEB_NODE_COUNT_DESKTOP: 32,
  WEB_NODE_COUNT_MOBILE: 16,
  WEB_CONNECTION_DISTANCE: 170,
  WEB_REACTION_RADIUS: 160,
  WEB_REACTION_STRENGTH: 7, // Max node shift in px towards cursor
  WEB_DRIFT_SPEED: 0.15,

  // 2. Web-line Cursor Connection
  WEB_LINE_MAX_DISTANCE: 140, // Max distance to snap a web strand from element to cursor
  WEB_LINE_CURVE_FACTOR: 0.2,

  // 3. Character Tension & Entrances
  CHARACTER_TENSION_MAX_DISPLACEMENT: 2.5, // Subtle 1-3px push away
  CHARACTER_TENSION_RADIUS: 180,
  CHARACTER_ENTRANCE_DISTANCE: 120, // Starting offset in px outside edge

  // 4. Project Card 3D Tilt & Web Capture
  CARD_TILT_MAX: 2.5, // Max 2.5 degrees tilt
  CARD_TILT_PERSPECTIVE: 1000,
  WEB_CAPTURE_STRAND_COUNT: 3,

  // 5. Achievement Unlock & Coding Scan
  ACHIEVEMENT_UNLOCK_DURATION: 1100, // ms
  CODING_SCAN_DURATION: 1400, // ms

  // 6. Navigation Web Trail & Scroll Spider
  NAV_WEB_LINE_HEIGHT: 1.5,
  SPIDER_PROGRESS_SIZE: 16, // px

  // 7. Click Web Ripple
  CLICK_RIPPLE_DURATION: 380, // ms
  CLICK_RIPPLE_MAX_SIZE: 70, // px

  // 8. General Performance & Safety
  SMOOTHING_FACTOR: 0.08
} as const;
