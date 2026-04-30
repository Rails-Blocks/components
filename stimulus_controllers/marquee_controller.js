import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["track", "list"]; // Required DOM targets: moving track and original content list.
  static speedSmoothingPerSecond = 9; // Higher values react faster; lower values feel softer.
  static values = {
    speed: { type: Number, default: 20 }, // Base loop duration in seconds (lower = faster).
    hoverSpeed: { type: Number, default: 0 }, // Hover loop duration in seconds; `0` means target speed is 0.
    direction: { type: String, default: "left" }, // Scroll direction: `left`, `right`, `up`, or `down`.
    clones: { type: Number, default: 2 }, // Number of duplicated lists to keep looping seamless.
  };

  connect() {
    this.isHovering = false; // Tracks hover state to choose target speed.
    this.seamGap = 0; // Pixel gap between list clones, derived from the list's flex gap.
    this.contentSize = 0; // Width/height in pixels of a single marquee list depending on direction.
    this.lastContentSize = 0; // Last measured size used by resize restart guard.
    this.progress = 0; // Current cycle progress in pixels [0, contentSize).
    this.currentSpeed = 0; // Current speed in pixels/second (smoothed).
    this.rafId = null; // requestAnimationFrame handle for the marquee loop.
    this.lastFrameTime = null; // Timestamp of previous frame for delta-time integration.

    this.setupMarquee();

    // Safari/mobile can trigger many resizes; we only restart when size truly changed.
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.listTarget);
  }

  disconnect() {
    this.stopLoop();
    this.cleanupAnimation();
    if (this.resizeObserver) this.resizeObserver.disconnect();
  }

  setupMarquee() {
    // Remove previous clones before rebuilding.
    this.removeClones();

    // Ensure the source list cannot shrink, then duplicate it.
    this.listTarget.style.flexShrink = "0";
    for (let i = 0; i < this.clonesValue; i++) {
      const clone = this.listTarget.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.classList.add("marquee-clone");
      clone.style.flexShrink = "0";
      clone.removeAttribute("data-marquee-target");
      this.trackTarget.appendChild(clone);
    }

    this.trackTarget.style.display = "flex";
    this.trackTarget.style.flexWrap = "nowrap";
    this.trackTarget.style.flexDirection = this.isVerticalDirection() ? "column" : "row";

    this.injectBaseStyles();

    // Measure after layout settles, then start loop.
    requestAnimationFrame(() => {
      const size = this.measureContentSize();
      if (size === 0) return;

      this.contentSize = size;
      this.lastContentSize = size;
      this.progress = 0;
      this.currentSpeed = this.targetSpeedPxPerSecond();

      this.applyTransform();
      this.startLoop();
    });
  }

  startLoop() {
    this.stopLoop();
    this.lastFrameTime = null;
    this.rafId = requestAnimationFrame((time) => this.tick(time));
  }

  stopLoop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastFrameTime = null;
  }

  tick(timestamp) {
    if (!this.hasTrackTarget || !this.hasListTarget || this.contentSize === 0) {
      this.rafId = requestAnimationFrame((time) => this.tick(time));
      return;
    }

    if (this.lastFrameTime === null) {
      this.lastFrameTime = timestamp;
      this.rafId = requestAnimationFrame((time) => this.tick(time));
      return;
    }

    // Clamp dt so tab-switch/frame drops do not create visible jumps.
    const dt = Math.min(0.05, (timestamp - this.lastFrameTime) / 1000);
    this.lastFrameTime = timestamp;

    const targetSpeed = this.targetSpeedPxPerSecond();
    const smoothing = 1 - Math.exp(-this.constructor.speedSmoothingPerSecond * dt);
    this.currentSpeed += (targetSpeed - this.currentSpeed) * smoothing;

    if (Math.abs(targetSpeed - this.currentSpeed) < 0.05) {
      this.currentSpeed = targetSpeed;
    }

    this.progress = (this.progress + this.currentSpeed * dt) % this.contentSize;
    if (this.progress < 0) this.progress += this.contentSize;

    this.applyTransform();
    this.rafId = requestAnimationFrame((time) => this.tick(time));
  }

  applyTransform() {
    if (!this.hasTrackTarget || this.contentSize === 0) return;

    const negativeDirection = this.directionValue === "left" || this.directionValue === "up";
    const offset = negativeDirection ? -this.progress : -this.contentSize + this.progress;

    if (this.isVerticalDirection()) {
      // Up: 0 -> -size. Down: -size -> 0.
      this.trackTarget.style.transform = `translate3d(0, ${offset}px, 0)`;
    } else {
      // Left: 0 -> -size. Right: -size -> 0.
      this.trackTarget.style.transform = `translate3d(${offset}px, 0, 0)`;
    }
  }

  targetSpeedPxPerSecond() {
    if (this.contentSize === 0) return 0;

    const speedDuration = Math.max(0.001, this.speedValue);
    const base = this.contentSize / speedDuration;

    if (!this.isHovering) return base;
    if (this.hoverSpeedValue === 0) return 0;

    const hoverDuration = Math.max(0.001, this.hoverSpeedValue);
    return this.contentSize / hoverDuration;
  }

  isVerticalDirection() {
    return this.directionValue === "up" || this.directionValue === "down";
  }

  measureContentSize() {
    if (!this.hasListTarget) return 0;

    // Keep clone seams visually consistent with in-list spacing.
    this.seamGap = this.measureSeamGap();
    if (this.hasTrackTarget) this.trackTarget.style.gap = `${this.seamGap}px`;

    const listSize = this.isVerticalDirection() ? this.listTarget.offsetHeight : this.listTarget.offsetWidth;
    return listSize + this.seamGap;
  }

  measureSeamGap() {
    if (!this.hasListTarget) return 0;

    const styles = getComputedStyle(this.listTarget);
    const rawGap = this.isVerticalDirection() ? styles.rowGap : styles.columnGap;
    const parsedGap = Number.parseFloat(rawGap);
    return Number.isFinite(parsedGap) ? parsedGap : 0;
  }

  pauseAnimation() {
    this.isHovering = true;
  }

  resumeAnimation() {
    this.isHovering = false;
  }

  restartAnimation() {
    if (!this.hasTrackTarget || !this.hasListTarget) return;
    this.stopLoop();
    this.setupMarquee();
  }

  cleanupAnimation() {
    this.stopLoop();
    this.removeClones();
  }

  removeClones() {
    if (!this.hasTrackTarget) return;
    const clones = this.trackTarget.querySelectorAll(".marquee-clone");
    clones.forEach((clone) => clone.remove());
  }

  handleResize() {
    if (!this.hasListTarget) return;

    const size = this.measureContentSize();
    if (size === 0) return;
    if (size === this.lastContentSize) return;

    this.lastContentSize = size;
    this.restartAnimation();
  }

  injectBaseStyles() {
    const baseStyleId = "marquee-base-styles";
    if (document.getElementById(baseStyleId)) return;

    const style = document.createElement("style");
    style.id = baseStyleId;
    style.textContent = `
      [data-marquee-target="track"] {
        will-change: transform;
        backface-visibility: hidden;
        perspective: 1000px;
      }

      [data-marquee-target="list"],
      .marquee-clone {
        flex-shrink: 0;
        min-width: max-content;
        min-height: max-content;
      }
    `;

    document.head.appendChild(style);
  }

  // Value change callbacks
  speedValueChanged() {
    if (this.hasTrackTarget) this.restartAnimation();
  }

  directionValueChanged() {
    if (this.hasTrackTarget) this.restartAnimation();
  }

  clonesValueChanged() {
    if (this.hasTrackTarget) this.restartAnimation();
  }
}
