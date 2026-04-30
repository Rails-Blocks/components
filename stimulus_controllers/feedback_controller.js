import { Controller } from "@hotwired/stimulus";
import { animate, stagger, spring, delay } from "motion";

export default class extends Controller {
  static targets = ["button", "buttonText", "form", "textarea"];
  static values = {
    expanded: { type: Boolean, default: false },
    anchorPoint: { type: String, default: "center" },
  };

  // Get anchor point configuration (transform origin, positioning, and transforms)
  getAnchorConfig() {
    switch (this.anchorPointValue) {
      case "top-left":
        return {
          transformOrigin: "top left",
          positioning: { top: "0", left: "0" },
          baseTransform: "",
        };
      case "top":
        return {
          transformOrigin: "top center",
          positioning: { top: "0", left: "50%" },
          baseTransform: "translateX(-50%)",
        };
      case "top-right":
        return {
          transformOrigin: "top right",
          positioning: { top: "0", right: "0" },
          baseTransform: "",
        };
      case "left":
        return {
          transformOrigin: "center left",
          positioning: { top: "50%", left: "0" },
          baseTransform: "translateY(-50%)",
        };
      case "right":
        return {
          transformOrigin: "center right",
          positioning: { top: "50%", right: "0" },
          baseTransform: "translateY(-50%)",
        };
      case "bottom-left":
        return {
          transformOrigin: "bottom left",
          positioning: { bottom: "0", left: "0" },
          baseTransform: "",
        };
      case "bottom":
        return {
          transformOrigin: "bottom center",
          positioning: { bottom: "0", left: "50%" },
          baseTransform: "translateX(-50%)",
        };
      case "bottom-right":
        return {
          transformOrigin: "bottom right",
          positioning: { bottom: "0", right: "0" },
          baseTransform: "",
        };
      case "center":
      default:
        return {
          transformOrigin: "center center",
          positioning: { top: "50%", left: "50%" },
          baseTransform: "translate(-50%, -50%)",
        };
    }
  }

  // Reset positioning and transform styles
  resetPositioningStyles(element) {
    element.style.top = "";
    element.style.left = "";
    element.style.right = "";
    element.style.bottom = "";
    element.style.transform = "";
  }

  // Apply positioning styles to the form based on anchor point value
  applyPositioning() {
    if (!this.hasFormTarget) return;

    const config = this.getAnchorConfig();

    // Reset all positioning first
    this.resetPositioningStyles(this.formTarget);

    // Apply positioning from config
    Object.entries(config.positioning).forEach(([property, value]) => {
      this.formTarget.style[property] = value;
    });

    // Apply base transform if present
    if (config.baseTransform) {
      this.formTarget.style.transform = config.baseTransform;
    }
  }

  // Measure and cache the button's natural size (without inline overrides)
  measureInitialButtonSize() {
    if (!this.hasButtonTarget) return;

    // Ensure the button is visible and has computed styles
    if (this.buttonTarget.offsetParent === null || this.buttonTarget.offsetWidth === 0) {
      // Element not visible yet, defer measurement
      return false;
    }

    const rect = this.buttonTarget.getBoundingClientRect();
    this.initialButtonWidth = Math.round(rect.width);
    this.initialButtonHeight = Math.round(rect.height);

    // Store and immediately apply the original button width to prevent any layout shifts
    this.buttonTarget.style.width = `${this.initialButtonWidth}px`;

    return true;
  }

  // Deferred initialization that waits for the DOM to be ready
  deferredInitialization() {
    // Use requestAnimationFrame to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      const measured = this.measureInitialButtonSize();
      if (!measured) {
        // If measurement failed, try again after a short delay
        delay(() => {
          this.measureInitialButtonSize();
        }, 0.05);
      }
    });
  }

  setupInitialState() {
    this.resetToButtonState();
    this.resetToFormState();
  }

  resetToFormState() {
    if (this.hasFormTarget) {
      // Hide form initially and reset all properties
      this.formTarget.style.display = "none";
      this.formTarget.style.opacity = "0";
      this.formTarget.style.transformOrigin = "";
      this.formTarget.style.width = "";
      this.formTarget.style.height = "";
      this.formTarget.style.zIndex = "";
      this.formTarget.style.borderRadius = "";

      // Apply positioning based on position value
      this.applyPositioning();

      // Set initial state for form elements to enable stagger animation
      const formElements = [
        this.formTarget.querySelector("textarea"),
        this.formTarget.querySelector('button[type="submit"]'),
      ].filter(Boolean);

      formElements.forEach((element) => {
        if (element) {
          element.style.opacity = "0";
          element.style.transform = "translateY(10px)";
        }
      });
    }
  }

  resetToButtonState() {
    if (this.hasButtonTarget) {
      // Keep CSS hover/focus color transitions, but avoid transition-all conflicts
      // with transform/opacity animations (Safari can flash on close/reset).
      this.buttonTarget.style.transitionProperty = "background-color, color, border-color, box-shadow";
      this.buttonTarget.style.transform = "scale(1)";
      this.buttonTarget.style.opacity = "1";
      this.buttonTarget.style.pointerEvents = "auto";
      this.buttonTarget.style.display = "flex";
      // Keep the measured width instead of resetting to auto
      if (this.initialButtonWidth) {
        this.buttonTarget.style.width = `${this.initialButtonWidth}px`;
      }
      this.buttonTarget.style.height = "auto";
      this.buttonTarget.style.borderRadius = "8px";

      // Force a reflow to ensure the button is interactive
      this.buttonTarget.offsetHeight;
    }

    if (this.hasButtonTextTarget) {
      this.buttonTextTarget.style.transform = "none";
      this.buttonTextTarget.style.opacity = "1";
      this.buttonTextTarget.style.pointerEvents = "none";
    }
  }

  async toggle() {
    if (this.expandedValue) {
      await this.collapse();
    } else {
      await this.expand();
    }
  }

  async expand() {
    if (this.expandedValue) return;

    this.expandedValue = true;

    // Show form
    this.formTarget.style.display = "block";
    this.formTarget.style.zIndex = "50";

    // Temporarily disable button clicks during animation
    this.buttonTarget.style.pointerEvents = "none";
    this.buttonTextTarget.style.pointerEvents = "none";

    // Get button dimensions for smooth transition
    const buttonRect = this.buttonTarget.getBoundingClientRect();

    // Ensure form is properly measured by forcing a layout
    this.formTarget.offsetHeight;

    // Measure target form dimensions from CSS (ignores transforms)
    const formWidth = this.formTarget.offsetWidth;
    const formHeight = this.formTarget.offsetHeight;

    // Calculate scale factors for performant transform-based animation
    const scaleX = formWidth / buttonRect.width;
    const scaleY = formHeight / buttonRect.height;

    // Apply positioning and set form to final size but scaled down to button size initially
    this.applyPositioning();
    this.formTarget.style.width = `${formWidth}px`;
    this.formTarget.style.height = `${formHeight}px`;
    this.formTarget.style.transformOrigin = this.getAnchorConfig().transformOrigin;

    // Handle positioning with existing transforms
    const baseTransform = this.getAnchorConfig().baseTransform;
    this.formTarget.style.transform = `${baseTransform} scale(${1 / scaleX}, ${1 / scaleY})`;
    this.formTarget.style.opacity = "0";

    // Use transform-based animation for better performance (avoids layout recalculation)
    const finalTransform = `${baseTransform} scale(1, 1)`;
    const formAnimation = animate(
      this.formTarget,
      {
        opacity: 1,
        transform: finalTransform,
      },
      {
        type: spring,
        stiffness: 300,
        damping: 25,
      }
    );

    // Animate border radius on the form
    const borderAnimation = animate(
      this.formTarget,
      {
        borderRadius: "12px",
      },
      {
        type: spring,
        stiffness: 300,
        damping: 25,
      }
    );

    // Simply fade out the button instead of resizing it
    const buttonAnimation = animate(
      this.buttonTarget,
      {
        opacity: 0,
        transform: "scale(0.90)",
      },
      {
        type: spring,
        stiffness: 420,
        damping: 32,
        onComplete: () => {
          // Ensure button stays in the final state
          this.buttonTarget.style.opacity = "0";
          this.buttonTarget.style.transform = "scale(0.90)";
        },
      }
    );

    // Stagger animate form elements for polished entrance
    delay(() => {
      if (this.hasTextareaTarget) {
        const formElements = [
          this.formTarget.querySelector("textarea"),
          this.formTarget.querySelector('button[type="submit"]'),
        ].filter(Boolean);

        if (formElements.length > 0) {
          animate(
            formElements,
            {
              opacity: [0, 1],
              y: [10, 0],
            },
            {
              type: spring,
              bounce: 0.35,
              duration: 0.25,
              delay: stagger(0.0, { startDelay: 0.15 }),
            }
          );
        }
      }
    }, 0.05);

    // Animate textarea focus
    if (this.hasTextareaTarget) {
      delay(() => {
        this.textareaTarget.focus();
      }, 0.3);
    }

    await Promise.all([formAnimation.finished, borderAnimation.finished, buttonAnimation.finished]);

    // Re-enable form interactions once fully expanded
    this.formTarget.style.pointerEvents = "auto";
  }

  async collapse() {
    if (!this.expandedValue) return;

    this.expandedValue = false;
    this.formTarget.style.zIndex = "50";
    this.formTarget.style.pointerEvents = "none";

    // Use the cached button dimensions measured on page load
    // Fallback to current measurements if initial size wasn't captured
    if (!this.initialButtonWidth || !this.initialButtonHeight) {
      this.measureInitialButtonSize();
    }

    // Fade out form contents
    const formInnerElements = [
      this.formTarget.querySelector("textarea"),
      this.formTarget.querySelector('button[type="submit"]'),
    ].filter(Boolean);

    if (formInnerElements.length > 0) {
      animate(
        formInnerElements,
        {
          opacity: 0,
        },
        {
          duration: 0.15,
        }
      );
    }

    // Use performant transform-based collapse animation
    const currentFormRect = this.formTarget.getBoundingClientRect();
    const scaleToButtonX = this.initialButtonWidth / currentFormRect.width;
    const scaleToButtonY = this.initialButtonHeight / currentFormRect.height;

    const animationOptions = {
      type: spring,
      stiffness: 300,
      damping: 30,
    };

    // Scale down the form to button size and fade out
    const baseTransform = this.getAnchorConfig().baseTransform;
    const collapseTransform = `${baseTransform} scale(${scaleToButtonX}, ${scaleToButtonY})`;

    const formAnimation = animate(
      this.formTarget,
      {
        transform: collapseTransform,
        opacity: 0,
        borderRadius: "8px",
      },
      animationOptions
    );

    // Show the button by scaling it back up and fading in
    const buttonAnimation = animate(
      this.buttonTarget,
      {
        opacity: 1,
        transform: "scale(1)",
      },
      {
        ...animationOptions,
        onComplete: () => {
          // Ensure button stays in the final state
          this.buttonTarget.style.opacity = "1";
          this.buttonTarget.style.transform = "scale(1)";
        },
      }
    );

    // Wait for both animations to finish
    await Promise.all([buttonAnimation.finished, formAnimation.finished]);

    // Reset form state
    this.resetToFormState();

    // Set final button state after animation completes
    if (this.hasButtonTarget) {
      this.buttonTarget.style.pointerEvents = "auto";
      this.buttonTarget.style.display = "flex";
      if (this.initialButtonWidth) {
        this.buttonTarget.style.width = `${this.initialButtonWidth}px`;
      }
      this.buttonTarget.style.height = "auto";
      this.buttonTarget.style.borderRadius = "8px";
    }

    if (this.hasButtonTextTarget) {
      this.buttonTextTarget.style.pointerEvents = "none";
    }
  }

  // Show success state with smooth animation
  async showSuccessState() {
    if (!this.hasButtonTextTarget) return;

    // Store original text if not already stored
    if (!this.originalButtonText) {
      this.originalButtonText = this.buttonTextTarget.textContent.trim();
    }

    // Animate text fade out
    await animate(
      this.buttonTextTarget,
      {
        opacity: 0,
        y: -5,
      },
      {
        duration: 0,
      }
    ).finished;

    // Change content to success state
    this.buttonTextTarget.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="inline-block size-3.5" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" fill="none" stroke="currentColor" class="nc-icon-wrapper" d="M2.75 9.25L6.75 14.25 15.25 3.75"></path></g></svg>
      Sent
    `;

    // Animate text fade in
    await animate(
      this.buttonTextTarget,
      {
        opacity: 1,
        y: 0,
      },
      {
        duration: 0.2,
      }
    ).finished;
  }

  // Reset button text to original state
  async resetButtonText() {
    if (!this.hasButtonTextTarget || !this.originalButtonText) return;

    // Animate text fade out
    await animate(
      this.buttonTextTarget,
      {
        opacity: 0,
        y: 5,
      },
      {
        duration: 0.25,
        type: spring,
        bounce: 0.25,
      }
    ).finished;

    // Reset to original text
    this.buttonTextTarget.textContent = this.originalButtonText;

    // Animate text fade in
    await animate(
      this.buttonTextTarget,
      {
        opacity: 1,
        y: 0,
      },
      {
        duration: 0.2,
        type: spring,
        bounce: 0.25,
      }
    ).finished;
  }

  // Handle form submission
  async submit(event) {
    event.preventDefault();

    // Show success state on button
    this.showSuccessState();

    // Add submit logic here
    console.log("Feedback submitted:", this.textareaTarget.value);

    // Collapse after showing success
    await this.collapse();

    // Clear the form
    if (this.hasTextareaTarget) {
      this.textareaTarget.value = "";
    }

    // Reset button to original state after a delay
    await this.resetButtonText();
  }

  // Close when clicking outside
  handleOutsideClick(event) {
    if (this.expandedValue && !this.element.contains(event.target)) {
      this.collapse();
    }
  }

  // Close when mouse down outside
  handleOutsideMouseDown(event) {
    if (this.expandedValue && !this.element.contains(event.target)) {
      this.collapse();
    }
  }

  // Handle escape key
  async handleEscapeKey(event) {
    if (event.key === "Escape" && this.expandedValue) {
      await this.collapse();
      // Focus the button after collapsing with escape
      if (this.hasButtonTarget) {
        this.buttonTarget.focus();
      }
    }
  }

  // Handle keyboard shortcuts on textarea
  handleTextareaKeyDown(event) {
    // Check for Ctrl+Enter or Cmd+Enter to submit
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      // Trigger the form's submit event to respect validation
      const form = this.formTarget.querySelector("form");
      if (form) {
        form.requestSubmit();
      }
    }
  }

  // Handle Turbo navigation cleanup
  beforeCache() {
    // Ensure component is in collapsed state before page caching
    if (this.expandedValue) {
      this.expandedValue = false;
      this.resetToButtonState();
      this.resetToFormState();
    }

    // Reset button text to original state
    if (this.hasButtonTextTarget && this.originalButtonText) {
      this.buttonTextTarget.textContent = this.originalButtonText;
      this.buttonTextTarget.style.opacity = "1";
      this.buttonTextTarget.style.transform = "none";
    }

    // Maintain button width
    if (this.hasButtonTarget && this.initialButtonWidth) {
      this.buttonTarget.style.width = `${this.initialButtonWidth}px`;
    }
  }

  beforeVisit() {
    // Clean up any ongoing animations before navigation
    if (this.expandedValue) {
      this.expandedValue = false;
    }
  }

  // Add event listeners when component mounts
  connect() {
    // Initialize state
    this.expandedValue = false;
    this.initialButtonWidth = null;
    this.initialButtonHeight = null;
    this.originalButtonText = null;

    this.setupInitialState();

    if (this.hasButtonTarget) {
      // Ensure motion animations control transform/opacity without CSS transition interference.
      this.buttonTarget.style.transitionProperty = "background-color, color, border-color, box-shadow";
    }

    // Use deferred initialization to handle Turbo timing issues
    this.deferredInitialization();

    // Bind event handlers
    this.boundHandleOutsideClick = this.handleOutsideClick.bind(this);
    this.boundHandleOutsideMouseDown = this.handleOutsideMouseDown.bind(this);
    this.boundHandleEscapeKey = this.handleEscapeKey.bind(this);
    this.boundHandleTextareaKeyDown = this.handleTextareaKeyDown.bind(this);
    this.boundBeforeCache = this.beforeCache.bind(this);
    this.boundBeforeVisit = this.beforeVisit.bind(this);

    // Add document event listeners
    document.addEventListener("click", this.boundHandleOutsideClick);
    document.addEventListener("mousedown", this.boundHandleOutsideMouseDown);
    document.addEventListener("keydown", this.boundHandleEscapeKey);

    // Add textarea-specific event listener for keyboard shortcuts
    if (this.hasTextareaTarget) {
      this.textareaTarget.addEventListener("keydown", this.boundHandleTextareaKeyDown);
    }

    // Add Turbo event listeners
    document.addEventListener("turbo:before-cache", this.boundBeforeCache);
    document.addEventListener("turbo:before-visit", this.boundBeforeVisit);
  }

  // Remove event listeners when component unmounts
  disconnect() {
    // Clean up component state
    if (this.expandedValue) {
      this.expandedValue = false;
    }

    // Reset button text to original state
    if (this.hasButtonTextTarget && this.originalButtonText) {
      this.buttonTextTarget.textContent = this.originalButtonText;
      this.buttonTextTarget.style.opacity = "1";
      this.buttonTextTarget.style.transform = "none";
    }

    // Maintain button width
    if (this.hasButtonTarget && this.initialButtonWidth) {
      this.buttonTarget.style.width = `${this.initialButtonWidth}px`;
    }

    // Remove all event listeners
    document.removeEventListener("click", this.boundHandleOutsideClick);
    document.removeEventListener("mousedown", this.boundHandleOutsideMouseDown);
    document.removeEventListener("keydown", this.boundHandleEscapeKey);
    document.removeEventListener("turbo:before-cache", this.boundBeforeCache);
    document.removeEventListener("turbo:before-visit", this.boundBeforeVisit);

    // Remove textarea-specific event listener
    if (this.hasTextareaTarget) {
      this.textareaTarget.removeEventListener("keydown", this.boundHandleTextareaKeyDown);
    }
  }
}
