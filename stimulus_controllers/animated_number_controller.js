import { Controller } from "@hotwired/stimulus";
import "number-flow";
import { continuous } from "number-flow";

export default class extends Controller {
  static values = {
    start: { type: Number, default: 0 }, // Start value of the animation
    end: { type: Number, default: 0 }, // End value of the animation
    duration: { type: Number, default: 700 }, // Duration of the animation for each number change
    trigger: { type: String, default: "viewport" }, // Trigger for the animation (load, viewport, manual)
    prefix: String, // Prefix for the number
    suffix: String, // Suffix for the number
    formatOptions: String, // Go here to learn more: https://number-flow.barvian.me/vanilla#properties
    trend: Number, // Trend for the animation
    realtime: { type: Boolean, default: false }, // If true, uses interval for timed updates
    updateInterval: { type: Number, default: 1000 }, // Interval in ms for realtime updates
    continuous: { type: Boolean, default: true }, // If true, uses continuous plugin for smooth transitions
    spinEasing: { type: String, default: "ease-in-out" }, // Easing for digit spin animations
    transformEasing: { type: String, default: "ease-in-out" }, // Easing for layout transforms
    opacityEasing: { type: String, default: "ease-out" }, // Easing for fade in/out
  };

  connect() {
    this.element.innerHTML = "<number-flow></number-flow>";
    this.flow = this.element.querySelector("number-flow");
    this.currentValue = this.startValue || 0;

    // Set initial properties from data attributes
    if (this.hasPrefixValue) this.flow.numberPrefix = this.prefixValue;
    if (this.hasSuffixValue) this.flow.numberSuffix = this.suffixValue;

    if (this.hasFormatOptionsValue) {
      try {
        this.flow.format = JSON.parse(this.formatOptionsValue);
      } catch (e) {
        console.error("Error parsing formatOptions JSON:", e);
        // Apply default or no formatting if parsing fails
      }
    }

    if (this.hasTrendValue) {
      this.flow.trend = this.trendValue;
    } else {
      // Default trend for continuous plugin if not specified
      this.flow.trend = Math.sign(this.endValue - this.currentValue) || 1;
    }

    // Initialize with start value without animation for non-realtime, or let realtime handle first update
    if (!this.realtimeValue) {
      this.flow.update(this.currentValue);
    }

    // Configure timing with customizable easing
    this.configureTimings();

    // Apply continuous plugin if enabled
    if (this.continuousValue) {
      this.flow.plugins = [continuous];
    }

    this.handleTrigger();
  }

  configureTimings() {
    const animationDuration = this.durationValue || 700;

    // Configure spin timing (for digit animations)
    this.flow.spinTiming = {
      duration: animationDuration,
      easing: this.spinEasingValue,
    };

    // Configure transform timing (for layout changes)
    this.flow.transformTiming = {
      duration: animationDuration,
      easing: this.transformEasingValue,
    };

    // Configure opacity timing (for fade effects)
    this.flow.opacityTiming = {
      duration: 350,
      easing: this.opacityEasingValue,
    };
  }

  handleTrigger() {
    const trigger = this.triggerValue || "viewport";

    switch (trigger) {
      case "load":
        this.startAnimation();
        break;
      case "viewport":
        this.observeViewport();
        break;
      case "manual":
        // Don't auto-start for manual trigger
        break;
      default:
        this.startAnimation();
        break;
    }
  }

  startAnimation() {
    if (this.realtimeValue) {
      this.flow.update(this.currentValue); // Initial update for realtime
      this.timerInterval = setInterval(() => {
        this.tick();
      }, this.updateIntervalValue);
    } else {
      this.animateToEnd();
    }
  }

  tick() {
    const step = Math.sign(this.endValue - this.startValue) || (this.startValue > this.endValue ? -1 : 1);
    this.currentValue += step;
    this.flow.update(this.currentValue);

    if ((step > 0 && this.currentValue >= this.endValue) || (step < 0 && this.currentValue <= this.endValue)) {
      clearInterval(this.timerInterval);
    }
  }

  animateToEnd() {
    if (!this.flow) return;
    // For non-realtime, the duration value from HTML (or default) applies to the whole animation.
    // Reconfigure timings if duration was specifically set for the full range
    if (!this.realtimeValue && this.hasDurationValue) {
      const overallDuration = this.durationValue || 2000;

      this.flow.spinTiming = {
        duration: overallDuration,
        easing: this.spinEasingValue,
      };

      this.flow.transformTiming = {
        duration: overallDuration,
        easing: this.transformEasingValue,
      };

      this.flow.opacityTiming = {
        duration: 350,
        easing: this.opacityEasingValue,
      };
    }
    this.flow.update(this.endValue);
  }

  observeViewport() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.startAnimation();
          this.observer.unobserve(this.element);
        }
      });
    });

    this.observer.observe(this.element);
  }

  // Method for manual triggering (can be called externally)
  triggerAnimation() {
    // Reset to start value first
    this.currentValue = this.startValue || 0;
    this.flow.update(this.currentValue);

    // Small delay to ensure reset is visible
    setTimeout(() => {
      this.startAnimation();
    }, 50);
  }

  disconnect() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.flow && typeof this.flow.destroy === "function") {
      // Assuming number-flow might have a cleanup/destroy method
      // If not, this line might need adjustment based on the library's API
      // For now, we'll assume it doesn't to prevent errors if 'destroy' doesn't exist.
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}
