import { SPIDER_EFFECTS_CONFIG } from '../config/spiderEffectsConfig';

export interface ScrollPhysicsState {
  scrollY: number;
  velocity: number; // Smoothed scroll velocity in px/frame
  swingAngle: number; // Current physical pendulum swing in degrees
  normalizedVelocity: number; // -1 to 1 normalized velocity
}

type ScrollPhysicsListener = (state: ScrollPhysicsState) => void;

class GlobalScrollPhysics {
  private listeners: Set<ScrollPhysicsListener> = new Set();
  private prevScrollY: number = 0;
  private currentScrollY: number = 0;
  private velocity: number = 0;
  private targetAngle: number = 0;
  private currentAngle: number = 0;
  private rafId: number | null = null;
  private isRunning: boolean = false;
  private isReducedMotion: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.currentScrollY = window.scrollY || document.documentElement.scrollTop;
      this.prevScrollY = this.currentScrollY;

      this.isReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      window.addEventListener('scroll', this.handleScroll, { passive: true });
    }
  }

  private handleScroll = () => {
    if (typeof window === 'undefined') return;
    this.currentScrollY = window.scrollY || document.documentElement.scrollTop;

    // Start physics loop if not already running
    if (!this.isRunning) {
      this.isRunning = true;
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  private tick = () => {
    // 1. Calculate raw delta between frames
    const rawDelta = this.currentScrollY - this.prevScrollY;
    this.prevScrollY = this.currentScrollY;

    // 2. Smooth velocity using exponential damping
    const smoothing = SPIDER_EFFECTS_CONFIG.SCROLL_VELOCITY_SMOOTHING;
    this.velocity = this.velocity * (1 - smoothing) + rawDelta * smoothing;

    // 3. Device capability & rotation limits
    const isMobile =
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768);

    const maxRotation = this.isReducedMotion
      ? 0
      : isMobile
      ? SPIDER_EFFECTS_CONFIG.SCROLL_ROTATION_MAX_MOBILE
      : SPIDER_EFFECTS_CONFIG.SCROLL_ROTATION_MAX;

    // 4. Map velocity to target rotation (clamped)
    // Scrolling down (delta > 0) swings positive (right); scrolling up (delta < 0) swings negative (left)
    const velocityScale = 14;
    const rawTarget = (this.velocity / velocityScale) * 1.5;
    this.targetAngle = Math.max(-maxRotation, Math.min(maxRotation, rawTarget));

    // 5. Spring momentum interpolation toward targetAngle
    const stiffness = SPIDER_EFFECTS_CONFIG.SCROLL_SPRING_STIFFNESS;
    this.currentAngle += (this.targetAngle - this.currentAngle) * stiffness;

    // 6. Natural momentum decay when scroll stops
    this.velocity *= SPIDER_EFFECTS_CONFIG.SCROLL_SPRING_DAMPING;

    // 7. Normalized velocity (-1 to 1) for web tension calculations
    const normalizedVelocity = Math.max(-1, Math.min(1, this.velocity / 20));

    const state: ScrollPhysicsState = {
      scrollY: this.currentScrollY,
      velocity: this.velocity,
      swingAngle: this.isReducedMotion ? 0 : this.currentAngle,
      normalizedVelocity,
    };

    // Notify all active listeners
    this.listeners.forEach((listener) => {
      try {
        listener(state);
      } catch (err) {
        console.error('Scroll physics listener error:', err);
      }
    });

    // 8. Idle threshold check: pause RAF loop when motion has completely settled
    const isIdle =
      Math.abs(rawDelta) < 0.05 &&
      Math.abs(this.velocity) < 0.05 &&
      Math.abs(this.currentAngle) < 0.02;

    if (isIdle) {
      this.currentAngle = 0;
      this.velocity = 0;
      this.isRunning = false;
      this.rafId = null;

      // Send a final settled frame to ensure exact 0 state
      const settledState: ScrollPhysicsState = {
        scrollY: this.currentScrollY,
        velocity: 0,
        swingAngle: 0,
        normalizedVelocity: 0,
      };
      this.listeners.forEach((listener) => listener(settledState));
    } else {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };

  public subscribe(listener: ScrollPhysicsListener): () => void {
    this.listeners.add(listener);

    // Immediately send current state
    listener({
      scrollY: this.currentScrollY,
      velocity: this.velocity,
      swingAngle: this.currentAngle,
      normalizedVelocity: 0,
    });

    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0 && this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.isRunning = false;
        this.rafId = null;
      }
    };
  }

  public getSnapshot(): ScrollPhysicsState {
    return {
      scrollY: this.currentScrollY,
      velocity: this.velocity,
      swingAngle: this.currentAngle,
      normalizedVelocity: 0,
    };
  }
}

// Global Singleton Instance
export const globalScrollPhysics = new GlobalScrollPhysics();
