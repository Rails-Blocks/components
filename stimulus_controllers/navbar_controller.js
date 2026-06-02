import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["trigger", "content", "viewport", "indicator", "menu", "background"];

  connect() {
    this.isOpen = false;
    this.currentContentId = null;
    this.closeTimeout = null;
    this.closeAnimationTimeout = null;
    this.transitionTimeout = null;
    this.openDelayTimeout = null;
    this.skipDelayTimeout = null;
    this.justOpened = false;
    this.justOpenedTimeout = null;
    this.isAnimating = false; // Track if an animation is in progress
    this.isOpenDelayed = true; // Whether to apply delay when opening
    this.pendingTransition = null; // Queue pending transition while animating
    this.hasPointerMoveOpened = new Map(); // Track which triggers have opened via pointer movement
    this.targetDimensions = null; // Track the target dimensions we're animating to

    // Delay durations
    this.delayDuration = 200; // Initial open delay
    this.skipDelayDuration = 300; // Time window to skip delay after closing
    this.closeLockDuration = 300; // Minimum time menu stays open before click-toggle can close

    // Detect if this is a touch device
    this.isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Setup click outside listener
    this.handleClickOutside = this.handleClickOutside.bind(this);
    document.addEventListener("click", this.handleClickOutside);

    // Setup keyboard listeners
    this.handleKeydown = this.handleKeydown.bind(this);
    document.addEventListener("keydown", this.handleKeydown);

    this.syncTriggerAriaAttributes();
  }

  disconnect() {
    document.removeEventListener("click", this.handleClickOutside);
    document.removeEventListener("keydown", this.handleKeydown);
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }
    if (this.closeAnimationTimeout) {
      clearTimeout(this.closeAnimationTimeout);
    }
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
    }
    if (this.openDelayTimeout) {
      clearTimeout(this.openDelayTimeout);
    }
    if (this.skipDelayTimeout) {
      clearTimeout(this.skipDelayTimeout);
    }
    if (this.justOpenedTimeout) {
      clearTimeout(this.justOpenedTimeout);
    }
  }

  syncTriggerAriaAttributes() {
    this.triggerTargets.forEach((trigger) => {
      const contentId = trigger.dataset.contentId;
      if (!contentId) return;

      trigger.setAttribute("aria-controls", contentId);
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-expanded", this.isOpen && trigger.dataset.state === "open" ? "true" : "false");
    });
  }

  isMobileViewport() {
    return window.innerWidth < 640;
  }

  toggleMenu(event) {
    const trigger = event.currentTarget;
    const contentId = trigger.dataset.contentId;

    // Clear any pending open delay - clicks should be instant
    if (this.openDelayTimeout) {
      clearTimeout(this.openDelayTimeout);
      this.openDelayTimeout = null;
    }

    // Clear any pending close timeout
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    // If clicking the same trigger, close it
    if (this.isOpen && this.currentContentId === contentId) {
      // Ignore close toggles immediately after open to prevent hover/click race jank
      if (this.justOpened) {
        return;
      }
      this.closeMenu();
      return;
    }

    // If a different menu is open, close it first
    if (this.isOpen && this.currentContentId !== contentId) {
      this.closeMenu(false);
    }

    // Open the new menu (clicks are always instant, no delay)
    this.openMenu(trigger, contentId);
  }

  handlePointerEnter(event) {
    // Hover behavior is desktop-only. Mobile layout uses the hamburger menu and
    // nested click triggers, so viewport pointerleave events should not close it.
    if (this.isMobileViewport()) {
      return;
    }

    // Skip hover behavior on touch devices to prevent conflicts with tap/click
    if (this.isTouchDevice) {
      return;
    }

    // Only handle mouse pointers, not touch or pen
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    const trigger = event.currentTarget;
    const contentId = trigger.dataset.contentId;

    // Reset the pointer move flag when entering a new trigger
    this.hasPointerMoveOpened.set(contentId, false);

    // Clear any pending open delay
    if (this.openDelayTimeout) {
      clearTimeout(this.openDelayTimeout);
      this.openDelayTimeout = null;
    }

    // Clear any pending close timeouts
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    // Clear any pending close animation
    if (this.closeAnimationTimeout) {
      clearTimeout(this.closeAnimationTimeout);
      this.closeAnimationTimeout = null;
    }

    // If viewport is in closing state, immediately reset it
    // BUT ONLY if we're re-entering the SAME content that's closing
    if (this.hasViewportTarget && this.viewportTarget.dataset.state === "closing") {
      if (contentId === this.currentContentId) {
        this.viewportTarget.dataset.state = "open";
        // Also restore isOpen state since we're preventing the close
        this.isOpen = true;
        trigger.dataset.state = "open";
        this.syncTriggerAriaAttributes();
      }
    }
  }

  handlePointerMove(event) {
    if (this.isMobileViewport()) {
      return;
    }

    // Skip hover behavior on touch devices to prevent conflicts with tap/click
    if (this.isTouchDevice) {
      return;
    }

    // Only respond to mouse pointers, not touch or pen
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    const trigger = event.currentTarget;
    const contentId = trigger.dataset.contentId;

    // If we've already opened via pointer movement for this trigger, don't do it again
    if (this.hasPointerMoveOpened.get(contentId)) {
      return;
    }

    // Mark that we've opened via pointer movement
    this.hasPointerMoveOpened.set(contentId, true);

    // If a different menu is open, smoothly transition to the new one (no delay)
    if (this.isOpen && this.currentContentId !== contentId) {
      // Don't transition if still animating - queue it for when animation completes
      if (this.isAnimating) {
        this.pendingTransition = { trigger, contentId };
        return;
      }
      this.transitionToMenu(trigger, contentId);
      return;
    }

    // Opening from closed state - apply delay if needed
    if (!this.isOpen) {
      if (this.isOpenDelayed) {
        // Apply delay before opening
        this.openDelayTimeout = setTimeout(() => {
          this.openMenu(trigger, contentId);
          this.openDelayTimeout = null;
        }, this.delayDuration);
      } else {
        // No delay - open immediately (within skip delay window)
        this.openMenu(trigger, contentId);
      }
    }
  }

  handlePointerLeave(event) {
    if (this.isMobileViewport()) {
      return;
    }

    // Skip hover behavior on touch devices to prevent conflicts with tap/click
    if (this.isTouchDevice) {
      return;
    }

    // Only handle mouse pointers, not touch or pen
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    const trigger = event.currentTarget;
    const contentId = trigger.dataset.contentId;

    // Reset the pointer move flag when leaving the trigger
    this.hasPointerMoveOpened.set(contentId, false);

    // Clear any pending open delay - user moved away before it opened
    if (this.openDelayTimeout) {
      clearTimeout(this.openDelayTimeout);
      this.openDelayTimeout = null;
    }

    // Clear any existing close timeout
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
    }

    // Close after a delay
    const delay = this.justOpened ? 350 : 150;

    this.closeTimeout = setTimeout(() => {
      this.closeMenu();
    }, delay);
  }

  cancelClose(event) {
    if (this.isMobileViewport()) {
      return;
    }

    // Skip hover behavior on touch devices to prevent conflicts with tap/click
    if (this.isTouchDevice) {
      return;
    }

    // Only handle mouse pointers, not touch or pen
    if (event.pointerType && event.pointerType !== "mouse") {
      return;
    }

    // Cancel close when mouse enters the viewport
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    // Cancel any pending close animation
    if (this.closeAnimationTimeout) {
      clearTimeout(this.closeAnimationTimeout);
      this.closeAnimationTimeout = null;
    }

    // If viewport is in closing state, immediately reset it
    if (this.hasViewportTarget && this.viewportTarget.dataset.state === "closing") {
      this.viewportTarget.dataset.state = "open";
    }
  }

  openMenu(trigger, contentId) {
    const content = this.contentTargets.find((c) => c.id === contentId);
    if (!content) return;

    // Clear any pending close timeouts to prevent interference from mouse events
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    if (this.closeAnimationTimeout) {
      clearTimeout(this.closeAnimationTimeout);
      this.closeAnimationTimeout = null;
    }

    // Clear skip delay timer since we're opening
    if (this.skipDelayTimeout) {
      clearTimeout(this.skipDelayTimeout);
      this.skipDelayTimeout = null;
    }

    this.isOpen = true;
    this.isAnimating = true; // Mark that we're animating
    this.isOpenDelayed = false; // No delay for subsequent opens (within skip delay window)
    this.currentContentId = contentId;

    // Set flag to prevent mouse events from closing menu immediately after opening
    this.justOpened = true;
    if (this.justOpenedTimeout) {
      clearTimeout(this.justOpenedTimeout);
    }
    this.justOpenedTimeout = setTimeout(() => {
      this.justOpened = false;
      this.justOpenedTimeout = null;
    }, this.closeLockDuration);

    // Clean up ALL content first - ensure no leftover styles
    this.contentTargets.forEach((c) => {
      if (c.id !== contentId) {
        c.classList.add("hidden");
        c.dataset.state = "closed";
      }
      // Reset any transition styles from previous animations
      c.style.position = "";
      c.style.width = "";
      c.style.top = "";
      c.style.left = "";
      c.style.opacity = "";
      c.style.transition = "";
      c.style.filter = "";
    });

    // Mark trigger as active and close all others
    this.triggerTargets.forEach((t) => {
      t.dataset.state = t === trigger ? "open" : "closed";
    });
    this.syncTriggerAriaAttributes();

    // CRITICAL: Clear viewport dimensions from any previous menu
    if (this.hasViewportTarget) {
      this.viewportTarget.style.width = "";
      this.viewportTarget.style.height = "";
      this.viewportTarget.style.transition = "";
      // On mobile, clear left style to allow CSS centering
      const isMobile = window.innerWidth < 640;
      if (isMobile) {
        this.viewportTarget.style.left = "";
      }
    }

    if (this.hasBackgroundTarget) {
      this.backgroundTarget.style.width = "";
      this.backgroundTarget.style.height = "";
      this.backgroundTarget.style.overflow = "";
      this.backgroundTarget.style.transition = "";
    }

    // Show content first (before viewport for proper height calculation)
    content.classList.remove("hidden");
    content.dataset.state = "open";

    // Store dimensions for potential transitions
    requestAnimationFrame(() => {
      if (content && !content.classList.contains("hidden")) {
        const contentRect = content.getBoundingClientRect();
        this.targetDimensions = { width: contentRect.width, height: contentRect.height };
      }
    });

    // Position viewport and indicator before showing
    if (this.hasIndicatorTarget && this.hasViewportTarget) {
      // Find the effective trigger for indicator positioning
      // If opening from within mobile menu, use the hamburger button instead
      const effectiveTrigger = this.getEffectiveTrigger(trigger, contentId);

      // Disable transitions for positioning to prevent horizontal slide
      this.viewportTarget.style.transition = "none";

      // Position immediately
      this.positionIndicator(effectiveTrigger);

      // Re-enable transition and show viewport with animation
      requestAnimationFrame(() => {
        this.viewportTarget.style.transition = "";

        // Show viewport on next frame to ensure transition is active
        requestAnimationFrame(() => {
          this.viewportTarget.dataset.state = "open";

          // Clear animation flag after the viewport animation completes (200ms)
          setTimeout(() => {
            this.isAnimating = false;
            this.executePendingTransition();
          }, 200);
        });
      });
    } else if (this.hasViewportTarget) {
      // If no indicator, just show viewport
      this.viewportTarget.dataset.state = "open";

      // Clear animation flag after a short delay
      setTimeout(() => {
        this.isAnimating = false;
        this.executePendingTransition();
      }, 200);
    }
  }

  executePendingTransition() {
    if (this.pendingTransition) {
      const { trigger, contentId } = this.pendingTransition;
      this.pendingTransition = null;
      // The normal hover-out logic will handle closing if the user has moved away
      this.transitionToMenu(trigger, contentId);
    }
  }

  getEffectiveTrigger(trigger, contentId) {
    // Check if the trigger is inside the mobile menu content
    const mobileMenuContent = document.getElementById("mobile-menu-content");
    if (mobileMenuContent && mobileMenuContent.contains(trigger)) {
      // Find the hamburger menu button (the trigger for mobile-menu-content)
      const hamburgerTrigger = this.triggerTargets.find((t) => t.dataset.contentId === "mobile-menu-content");
      if (hamburgerTrigger) {
        return hamburgerTrigger;
      }
    }

    return trigger;
  }

  transitionToMenu(trigger, contentId) {
    // Store the old content reference BEFORE any cleanup
    const oldContentId = this.currentContentId;
    const newContent = this.contentTargets.find((c) => c.id === contentId);
    const oldContent = this.contentTargets.find((c) => c.id === oldContentId);
    if (!newContent || !this.hasViewportTarget) return;

    // Mark that we're animating
    this.isAnimating = true;

    // Update current state immediately to prevent race conditions
    this.currentContentId = contentId;

    // Set flag to prevent mouse events from closing menu during transition
    this.justOpened = true;
    if (this.justOpenedTimeout) {
      clearTimeout(this.justOpenedTimeout);
    }
    this.justOpenedTimeout = setTimeout(() => {
      this.justOpened = false;
      this.justOpenedTimeout = null;
    }, 400);

    // Clear any pending transition cleanup to prevent interference
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
      // Note: Don't clear isAnimating here - we're starting a new animation immediately

      // Immediately clean up any in-progress transition state
      // Reset all content that might be mid-transition (except the ones we're transitioning between)
      this.contentTargets.forEach((content) => {
        if (content.id !== contentId && content.id !== oldContentId) {
          content.classList.add("hidden");
          content.dataset.state = "closed";
          content.style.position = "";
          content.style.width = "";
          content.style.top = "";
          content.style.left = "";
          content.style.opacity = "";
          content.style.transition = "";
          content.style.filter = "";
        }
      });

      // Clean up old content that was mid-transition
      if (oldContent) {
        // Hide it temporarily so it doesn't affect viewport measurements
        oldContent.classList.add("hidden");
        oldContent.style.position = "";
        oldContent.style.width = "";
        oldContent.style.top = "";
        oldContent.style.left = "";
        oldContent.style.opacity = "";
        oldContent.style.transition = "";
        oldContent.style.filter = "";
      }

      // DON'T reset viewport/background dimensions - we need them for smooth measurement
      // Disable transitions completely so CSS transition-all doesn't interfere
      this.viewportTarget.style.transition = "none";

      if (this.hasBackgroundTarget) {
        this.backgroundTarget.style.overflow = "";
        this.backgroundTarget.style.transition = "none";
      }

      if (this.hasIndicatorTarget) {
        this.indicatorTarget.style.transition = "none";
      }

      // Force a reflow to ensure all cleanup styles are applied before starting new transition
      void this.viewportTarget.offsetHeight;
    }

    // Update trigger states
    this.triggerTargets.forEach((t) => {
      t.dataset.state = t === trigger ? "open" : "closed";
    });
    this.syncTriggerAriaAttributes();

    // Use requestAnimationFrame to ensure cleanup is rendered before measuring
    requestAnimationFrame(() => {
      // IMPORTANT: Use stored target dimensions from previous transition if available
      // This ensures we start from the correct dimensions even if we're mid-transition
      // Use getBoundingClientRect for subpixel precision to avoid stuttering
      let currentWidth, currentHeight;

      if (this.targetDimensions) {
        // Use the stored target dimensions from the previous transition
        // This is more reliable than reading mid-transition values from the DOM
        currentWidth = this.targetDimensions.width;
        currentHeight = this.targetDimensions.height;
      } else {
        // No stored dimensions - measure from current content
        // This happens on the first transition or after menu was fully closed
        const currentContent = oldContent && !oldContent.classList.contains("hidden") ? oldContent : null;
        if (currentContent) {
          const currentContentRect = currentContent.getBoundingClientRect();
          currentWidth = currentContentRect.width;
          currentHeight = currentContentRect.height;
        } else {
          // Fallback to viewport size
          const viewportRect = this.viewportTarget.getBoundingClientRect();
          currentWidth = viewportRect.width;
          currentHeight = viewportRect.height;
        }
      }

      // NOW clear viewport size constraints so new content can measure at natural size
      this.viewportTarget.style.width = "";
      this.viewportTarget.style.height = "";

      if (this.hasBackgroundTarget) {
        this.backgroundTarget.style.width = "";
        this.backgroundTarget.style.height = "";
      }

      // Ensure new content has no lingering transition styles
      newContent.style.position = "";
      newContent.style.width = "";
      newContent.style.top = "";
      newContent.style.left = "";
      newContent.style.filter = "";
      newContent.style.transition = "";

      newContent.classList.remove("hidden");
      newContent.style.opacity = "0";
      newContent.style.position = "absolute";
      newContent.dataset.state = "open";

      // Force a reflow before measuring
      void newContent.offsetHeight;

      // Force layout and measure new dimensions at natural size
      // Use getBoundingClientRect for subpixel precision to avoid stuttering
      const newContentRect = newContent.getBoundingClientRect();
      const newWidth = newContentRect.width;
      const newHeight = newContentRect.height;

      // Store the target dimensions for the next potential transition
      this.targetDimensions = { width: newWidth, height: newHeight };

      // Reset new content positioning
      newContent.style.position = "";

      // Hide new content again (will show it with animation)
      newContent.classList.add("hidden");

      // Calculate new position to determine movement direction
      const effectiveTrigger = this.getEffectiveTrigger(trigger, contentId);
      const triggerRect = effectiveTrigger.getBoundingClientRect();
      const parentRect = this.viewportTarget.parentElement.getBoundingClientRect();
      const align = effectiveTrigger.dataset.align || "center";

      // Check if we're on mobile
      const isMobile = window.innerWidth < 640;

      let newLeft;
      let newRelativeLeft;

      if (isMobile) {
        // On mobile, CSS handles centering - don't override it
        // Just use current left position for smooth transition
        newRelativeLeft = parseFloat(this.viewportTarget.style.left) || 0;
      } else {
        // On desktop, position based on trigger alignment
        switch (align) {
          case "start":
            newLeft = triggerRect.left;
            break;
          case "end":
            newLeft = triggerRect.right - newWidth;
            break;
          case "center":
          default:
            const triggerCenter = triggerRect.left + triggerRect.width / 2;
            newLeft = triggerCenter - newWidth / 2;
            break;
        }
        newRelativeLeft = newLeft - parentRect.left;
      }

      // Set explicit dimensions on viewport for smooth transition
      this.viewportTarget.style.width = `${currentWidth}px`;
      this.viewportTarget.style.height = `${currentHeight}px`;

      // On mobile, don't animate left since CSS centering handles it
      if (isMobile) {
        this.viewportTarget.style.transition =
          "width 300ms cubic-bezier(0.22, 0.61, 0.36, 1), height 300ms cubic-bezier(0.22, 0.61, 0.36, 1)";
      } else {
        this.viewportTarget.style.transition =
          "left 250ms cubic-bezier(0.22, 0.61, 0.36, 1), width 300ms cubic-bezier(0.22, 0.61, 0.36, 1), height 300ms cubic-bezier(0.22, 0.61, 0.36, 1)";
      }

      // Also set dimensions on background container if it exists
      if (this.hasBackgroundTarget) {
        this.backgroundTarget.style.width = `${currentWidth}px`;
        this.backgroundTarget.style.height = `${currentHeight}px`;
        this.backgroundTarget.style.overflow = "hidden";
        this.backgroundTarget.style.transition =
          "width 300ms cubic-bezier(0.22, 0.61, 0.36, 1), height 300ms cubic-bezier(0.22, 0.61, 0.36, 1)";
      }

      // Position the content absolutely within viewport during transition
      if (oldContent) {
        oldContent.style.position = "absolute";
        oldContent.style.width = "100%";
        oldContent.style.top = "0";
        oldContent.style.left = "0";
        oldContent.style.filter = "blur(0px)";
      }

      // Show new content positioned absolutely
      newContent.classList.remove("hidden");
      newContent.style.position = "absolute";
      newContent.style.width = `${newWidth}px`;
      newContent.style.top = "0";
      newContent.style.left = "0";
      newContent.style.opacity = "0";

      // Position the viewport and indicator for the new content
      if (this.hasIndicatorTarget) {
        // Add smooth transition to indicator movement
        this.indicatorTarget.style.transition = "left 250ms cubic-bezier(0.22, 0.61, 0.36, 1)";
        this.positionIndicator(effectiveTrigger, newWidth);
      }

      // Use another requestAnimationFrame to ensure styles are applied before animating
      requestAnimationFrame(() => {
        // Transition viewport dimensions
        this.viewportTarget.style.width = `${newWidth}px`;
        this.viewportTarget.style.height = `${newHeight}px`;

        // Also transition background dimensions if it exists
        if (this.hasBackgroundTarget) {
          this.backgroundTarget.style.width = `${newWidth}px`;
          this.backgroundTarget.style.height = `${newHeight}px`;
        }

        // Blur and fade out old content
        if (oldContent) {
          oldContent.style.transition =
            "opacity 250ms cubic-bezier(0.22, 0.61, 0.36, 1), filter 250ms cubic-bezier(0.22, 0.61, 0.36, 1)";
          oldContent.style.opacity = "0";
          oldContent.style.filter = "blur(4px)";
        }

        // Fade in new content
        newContent.style.transition = "opacity 250ms cubic-bezier(0.22, 0.61, 0.36, 1) 50ms";
        newContent.style.opacity = "1";

        // After transition, clean up
        // Small buffer to ensure all transitions complete before cleanup
        this.transitionTimeout = setTimeout(() => {
          // Clear animation flag
          this.isAnimating = false;

          // Execute any pending transition
          this.executePendingTransition();

          // Disable transitions completely to prevent CSS transition-all from causing stutter
          this.viewportTarget.style.transition = "none";

          if (this.hasBackgroundTarget) {
            this.backgroundTarget.style.overflow = "";
            this.backgroundTarget.style.transition = "none";
          }

          if (this.hasIndicatorTarget) {
            this.indicatorTarget.style.transition = "none";
          }

          // Reset new content positioning
          newContent.style.position = "";
          newContent.style.width = "";
          newContent.style.top = "";
          newContent.style.left = "";
          newContent.style.opacity = "";
          newContent.style.transition = "none";

          // Hide and reset old content
          if (oldContent) {
            oldContent.classList.add("hidden");
            oldContent.dataset.state = "closed";
            oldContent.style.position = "";
            oldContent.style.width = "";
            oldContent.style.top = "";
            oldContent.style.left = "";
            oldContent.style.opacity = "";
            oldContent.style.transition = "none";
            oldContent.style.filter = "";
          }

          this.transitionTimeout = null;
        }, 300);
      });
    });
  }

  closeMenu(animate = true) {
    if (!this.isOpen) return;

    // Clear any pending transition cleanup
    if (this.transitionTimeout) {
      clearTimeout(this.transitionTimeout);
      this.transitionTimeout = null;
    }

    const closingContentId = this.currentContentId; // Save before clearing
    const content = this.contentTargets.find((c) => c.id === closingContentId);
    this.triggerTargets.forEach((trigger) => {
      if (trigger.dataset.state === "open" || trigger.dataset.contentId === closingContentId) {
        trigger.dataset.state = "closed";
      }
    });

    // Mark as closed immediately so new hovers know we're closing
    this.isOpen = false;
    this.justOpened = false;
    if (this.justOpenedTimeout) {
      clearTimeout(this.justOpenedTimeout);
      this.justOpenedTimeout = null;
    }
    this.isAnimating = false; // Clear animation flag when closing
    this.pendingTransition = null; // Clear any pending transitions
    this.targetDimensions = null; // Clear stored dimensions
    this.syncTriggerAriaAttributes();

    // Start skip delay timer - if user reopens within this window, no delay applied
    if (this.skipDelayTimeout) {
      clearTimeout(this.skipDelayTimeout);
    }
    this.skipDelayTimeout = setTimeout(() => {
      this.isOpenDelayed = true;
    }, this.skipDelayDuration);

    // Hide viewport with animation
    if (this.hasViewportTarget) {
      if (animate) {
        // Clear inline transition to allow CSS transition-all to handle the close animation
        this.viewportTarget.style.transition = "";

        // Also clear content transitions
        if (content) {
          content.style.transition = "";
        }

        // Set closing state for CSS animation
        this.viewportTarget.dataset.state = "closing";

        // Hide after animation completes
        this.closeAnimationTimeout = setTimeout(() => {
          this.viewportTarget.dataset.state = "closed";

          // Hide content after viewport is hidden
          if (content) {
            content.classList.add("hidden");
            content.dataset.state = "closed";
          }

          // Reset viewport position after animation completes
          // On mobile, clear the left style to allow CSS centering; on desktop set to 0
          const isMobile = window.innerWidth < 640;
          this.viewportTarget.style.left = isMobile ? "" : "0px";
          if (this.hasIndicatorTarget) {
            this.indicatorTarget.style.left = "0px";
          }

          // Clear currentContentId ONLY after animation completes
          this.currentContentId = null;
          this.closeAnimationTimeout = null;
        }, 200);
      } else {
        this.viewportTarget.dataset.state = "closed";

        if (content) {
          content.classList.add("hidden");
          content.dataset.state = "closed";
        }

        // Reset viewport position immediately when not animating
        // On mobile, clear the left style to allow CSS centering; on desktop set to 0
        const isMobile = window.innerWidth < 640;
        this.viewportTarget.style.left = isMobile ? "" : "0px";
        if (this.hasIndicatorTarget) {
          this.indicatorTarget.style.left = "0px";
        }

        // Clear currentContentId immediately when not animating
        this.currentContentId = null;
      }
    }
  }

  handleClickOutside(event) {
    if (!this.isOpen) return;

    // Check if click is outside the navbar
    if (!this.element.contains(event.target)) {
      this.closeMenu();
    }
  }

  handleKeydown(event) {
    // Handle Escape key
    if (event.key === "Escape" && this.isOpen) {
      event.preventDefault();
      const activeTrigger = this.triggerTargets.find((t) => t.dataset.state === "open");
      this.closeMenu();
      // Return focus to the active trigger
      if (activeTrigger) activeTrigger.focus();
      return;
    }

    // Only handle arrow keys and Tab when menu is open
    if (!this.isOpen) return;

    const focusableItems = this.getFocusableItems();
    if (focusableItems.length === 0) return;

    const currentIndex = focusableItems.indexOf(document.activeElement);

    // Handle Arrow Down or Arrow Right - next item
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const nextIndex = currentIndex < focusableItems.length - 1 ? currentIndex + 1 : 0;
      focusableItems[nextIndex].focus();
    }

    // Handle Arrow Up or Arrow Left - previous item
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : focusableItems.length - 1;
      focusableItems[prevIndex].focus();
    }

    // Handle Tab key - close menu and move to next navbar item
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();

      // Get all visible, focusable elements in the navbar menu (not inside dropdown content)
      const menuElement = this.hasMenuTarget ? this.menuTarget : this.element.querySelector("ul");
      if (menuElement) {
        // Only get direct children of the menu, excluding items inside dropdown content
        const visibleNavItems = Array.from(
          menuElement.querySelectorAll(":scope > li > a, :scope > li > button"),
        ).filter((el) => {
          // Check if element is visible
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        // Find the currently active trigger (that opened this menu) among visible items
        // Important: filter triggers to only visible ones to handle responsive layouts
        const visibleTriggers = this.triggerTargets.filter((t) => {
          const rect = t.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && t.dataset.contentId === this.currentContentId;
        });

        const currentTrigger = visibleTriggers[0]; // Get the first visible trigger for this content

        this.closeMenu(false); // Close without animation for immediate focus shift

        const currentIndex = currentTrigger ? visibleNavItems.indexOf(currentTrigger) : -1;

        if (currentIndex !== -1 && currentIndex + 1 < visibleNavItems.length) {
          // Focus next visible nav item
          visibleNavItems[currentIndex + 1].focus();
        } else {
          // If no next item in navbar, tab out to content after navbar
          const allFocusable = Array.from(
            document.querySelectorAll(
              'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          );
          const nextElement = allFocusable.find((el) => {
            return !this.element.contains(el);
          });
          if (nextElement) nextElement.focus();
        }
      }
    }

    // Handle Shift+Tab - close menu and move to previous navbar item
    if (event.key === "Tab" && event.shiftKey) {
      event.preventDefault();

      // Get all visible, focusable elements in the navbar menu (not inside dropdown content)
      const menuElement = this.hasMenuTarget ? this.menuTarget : this.element.querySelector("ul");
      if (menuElement) {
        // Only get direct children of the menu, excluding items inside dropdown content
        const visibleNavItems = Array.from(
          menuElement.querySelectorAll(":scope > li > a, :scope > li > button"),
        ).filter((el) => {
          // Check if element is visible
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        // Find the currently active trigger (that opened this menu) among visible items
        const visibleTriggers = this.triggerTargets.filter((t) => {
          const rect = t.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && t.dataset.contentId === this.currentContentId;
        });

        const currentTrigger = visibleTriggers[0]; // Get the first visible trigger for this content

        this.closeMenu(false); // Close without animation for immediate focus shift

        const currentIndex = currentTrigger ? visibleNavItems.indexOf(currentTrigger) : -1;

        if (currentIndex > 0) {
          // Focus previous visible nav item
          visibleNavItems[currentIndex - 1].focus();
        } else {
          // If at first item in navbar, tab out to content before navbar
          const allFocusable = Array.from(
            document.querySelectorAll(
              'a[href]:not([disabled]), button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          );
          // Find the last focusable element before the navbar
          const navbarStart = this.element.getBoundingClientRect().top;
          const navbarElements = Array.from(this.element.querySelectorAll("*"));
          const previousElement = allFocusable.reverse().find((el) => {
            const rect = el.getBoundingClientRect();
            return rect.bottom <= navbarStart || (!navbarElements.includes(el) && !this.element.contains(el));
          });
          if (previousElement) previousElement.focus();
        }
      }
    }
  }

  getFocusableItems() {
    if (!this.isOpen) return [];

    const content = this.contentTargets.find((c) => c.id === this.currentContentId);
    if (!content) return [];

    return Array.from(content.querySelectorAll("a[href]:not([disabled]), button:not([disabled])"));
  }

  handleTriggerKeydown(event) {
    const trigger = event.currentTarget;
    const contentId = trigger.dataset.contentId;

    // Clear any pending open delay - keyboard should be instant
    if (this.openDelayTimeout) {
      clearTimeout(this.openDelayTimeout);
      this.openDelayTimeout = null;
    }

    // Open menu and focus first item on Enter, Space, ArrowDown, or ArrowRight
    if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();

      // Open menu if not open (keyboard is always instant, no delay)
      if (!this.isOpen || this.currentContentId !== contentId) {
        this.openMenu(trigger, contentId);
      }

      // Focus first item after menu opens
      requestAnimationFrame(() => {
        const focusableItems = this.getFocusableItems();
        if (focusableItems.length > 0) {
          focusableItems[0].focus();
        }
      });
    }

    // Open menu and focus last item on ArrowUp or ArrowLeft
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();

      // Open menu if not open (keyboard is always instant, no delay)
      if (!this.isOpen || this.currentContentId !== contentId) {
        this.openMenu(trigger, contentId);
      }

      // Focus last item after menu opens
      requestAnimationFrame(() => {
        const focusableItems = this.getFocusableItems();
        if (focusableItems.length > 0) {
          focusableItems[focusableItems.length - 1].focus();
        }
      });
    }
  }

  positionIndicator(trigger, providedWidth = null) {
    if (!this.hasIndicatorTarget || !this.hasViewportTarget) return;

    const triggerRect = trigger.getBoundingClientRect();

    // Get viewport width (use provided width during transitions, otherwise read from DOM)
    const viewportWidth = providedWidth !== null ? providedWidth : this.viewportTarget.offsetWidth;

    // Check if we're on mobile (screen width < 640px, sm breakpoint)
    const isMobile = window.innerWidth < 640;

    let viewportLeft;
    let indicatorLeft;

    if (isMobile) {
      // On mobile, CSS handles centering with left-1/2 -translate-x-1/2
      // Don't override the CSS positioning
      // Just hide the indicator and return early
      this.indicatorTarget.style.opacity = "0";
      return;
    } else {
      // On desktop, position relative to trigger
      // Get alignment from trigger's data attribute (defaults to "center")
      const align = trigger.dataset.align || "center";

      // Show indicator on desktop
      this.indicatorTarget.style.opacity = "1";

      // Calculate positions based on alignment
      switch (align) {
        case "start":
          // Align viewport left edge with trigger left edge
          viewportLeft = triggerRect.left;
          // Position indicator at the trigger center relative to viewport
          indicatorLeft = triggerRect.width / 2 - 20;
          break;

        case "end":
          // Align viewport right edge with trigger right edge
          viewportLeft = triggerRect.right - viewportWidth;
          // Position indicator at the trigger center relative to viewport
          const offsetFromRight = triggerRect.width / 2;
          indicatorLeft = viewportWidth - offsetFromRight - 20;
          break;

        case "center":
        default:
          // Center viewport on trigger
          const triggerCenter = triggerRect.left + triggerRect.width / 2;
          viewportLeft = triggerCenter - viewportWidth / 2;
          // Position indicator at center of viewport
          indicatorLeft = viewportWidth / 2 - 20;
          break;
      }
    }

    // Calculate position relative to the parent element
    const parentRect = this.viewportTarget.parentElement.getBoundingClientRect();
    const relativeLeft = viewportLeft - parentRect.left;

    // Position the viewport
    this.viewportTarget.style.left = `${relativeLeft}px`;

    // Position the indicator
    // w-10 = 40px (2.5rem), so subtract 20px to center the arrow
    this.indicatorTarget.style.left = `${indicatorLeft}px`;
  }
}
