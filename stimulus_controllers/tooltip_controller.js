import { Controller } from "@hotwired/stimulus";
import { computePosition, offset, flip, shift, arrow, autoUpdate } from "@floating-ui/dom";

// Global tooltip state manager for intelligent behavior
class TooltipGlobalState {
  constructor() {
    this.visibleCount = 0;
    this.isFastMode = false;
    this.resetTimeout = null;
    this.fastModeResetDelay = 100; // 0.1 seconds
    this.visibleTooltips = new Set(); // Track currently visible tooltip controllers
    this.closingTooltips = new Set(); // Track tooltips currently in closing animation
  }

  // Called when a tooltip becomes visible
  onTooltipShow(tooltipController) {
    this.visibleTooltips.add(tooltipController);
    this.closingTooltips.delete(tooltipController); // Remove from closing if it was there
    this.visibleCount = this.visibleTooltips.size;
    if (this.visibleCount > 0 && !this.isFastMode) {
      this.isFastMode = true;
    }
    this.clearResetTimeout();
  }

  // Called when a tooltip starts hiding
  onTooltipStartHide(tooltipController) {
    this.visibleTooltips.delete(tooltipController);
    this.visibleCount = this.visibleTooltips.size;
  }

  // Called when a tooltip starts its closing animation
  onTooltipClosing(tooltipController) {
    this.closingTooltips.add(tooltipController);
  }

  // Called when a tooltip has fully closed
  onTooltipClosed(tooltipController) {
    this.closingTooltips.delete(tooltipController);

    // If no tooltips are visible or closing, start countdown to exit fast mode
    if (this.visibleCount === 0 && this.closingTooltips.size === 0) {
      this.startResetTimeout();
    }
  }

  // Hide all currently visible tooltips and interrupt closing animations
  hideAllTooltipsInstantly(exceptController) {
    // Instantly hide all visible tooltips
    const visibleToHide = [...this.visibleTooltips].filter((controller) => controller !== exceptController);
    visibleToHide.forEach((controller) => {
      controller._hideTooltip(true); // true = instant hide
    });

    // Instantly finish all closing animations
    const closingToHide = [...this.closingTooltips].filter((controller) => controller !== exceptController);
    closingToHide.forEach((controller) => {
      controller._finishClosingAnimation();
    });
  }

  // Check if we're in fast mode
  isInFastMode() {
    return this.isFastMode;
  }

  // Start timeout to reset fast mode
  startResetTimeout() {
    this.clearResetTimeout();
    this.resetTimeout = setTimeout(() => {
      this.isFastMode = false;
    }, this.fastModeResetDelay);
  }

  // Clear the reset timeout
  clearResetTimeout() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
      this.resetTimeout = null;
    }
  }
}

// Global instance
const tooltipGlobalState = new TooltipGlobalState();

const tooltipKbdClasses =
  "shrink-0 flex items-center gap-0.5 rounded-md border px-1 font-mono text-[10px] border-white/25 bg-neutral-700 text-neutral-200 shadow-[0px_1px_0px_0px_rgba(255,255,255,0.08)]";

const commandKeySvg = `
  <svg xmlns="http://www.w3.org/2000/svg" class="size-2.5" width="18" height="18" viewBox="0 0 18 18" aria-label="Command">
    <g fill="currentColor">
      <path d="M13.25,10.5h-1.25v-3h1.25c1.517,0,2.75-1.233,2.75-2.75s-1.233-2.75-2.75-2.75-2.75,1.233-2.75,2.75v1.25h-3v-1.25c0-1.517-1.233-2.75-2.75-2.75s-2.75,1.233-2.75,2.75,1.233,2.75,2.75,2.75h1.25v3h-1.25c-1.517,0-2.75,1.233-2.75,2.75s1.233,2.75,2.75,2.75,2.75-1.233,2.75-2.75v-1.25h3v1.25c0,1.517,1.233,2.75,2.75,2.75s2.75-1.233,2.75-2.75-1.233-2.75-2.75-2.75Zm-1.25-5.75c0-.689,.561-1.25,1.25-1.25s1.25,.561,1.25,1.25-.561,1.25-1.25,1.25h-1.25v-1.25Zm-8.5,0c0-.689,.561-1.25,1.25-1.25s1.25,.561,1.25,1.25v1.25h-1.25c-.689,0-1.25-.561-1.25-1.25Zm2.5,8.5c0,.689-.561,1.25-1.25,1.25s-1.25-.561-1.25-1.25,.561-1.25,1.25-1.25h1.25v1.25Zm1.5-5.75h3v3h-3v-3Zm5.75,7c-.689,0-1.25-.561-1.25-1.25v-1.25h1.25c.689,0,1.25,.561,1.25,1.25s-.561,1.25-1.25,1.25Z"></path>
    </g>
  </svg>
`;

export default class extends Controller {
  // placement and offset can still be configured via data-tooltip-placement-value etc. if desired,
  // but will use defaults if the original HTML (using data-tooltip-*) doesn't provide them.
  static values = {
    placement: { type: String, default: "top" }, // Placement(s) of the tooltip, e.g., "top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "left-start", "left-end", "right", "right-start", "right-end"
    offset: { type: Number, default: 8 }, // Offset of the tooltip
    maxWidth: { type: Number, default: 200 }, // Default max width for tooltips
    delay: { type: Number, default: 0 }, // Delay before showing the tooltip (in ms)
    size: { type: String, default: "regular" }, // Size of the tooltip, e.g., "small", "regular", "large"
    animation: { type: String, default: "fade" }, // e.g., "fade", "origin", "fade origin", "none"
    trigger: { type: String, default: "auto" }, // space-separated: mouseenter, focus, click, or "auto" (auto-detects based on device)
    kbd: { type: String, default: "" }, // Optional keyboard shortcut displayed at the end of the tooltip
    macKbd: { type: String, default: "" }, // Optional Mac-specific keyboard shortcut
    nonMacKbd: { type: String, default: "" }, // Optional Windows/Linux keyboard shortcut
    // tooltipContent and tooltipArrow are read directly from element attributes in connect()
  };

  _hasAnimationType(type) {
    return this.animationValue.split(" ").includes(type);
  }

  connect() {
    this.tooltipContent = this.element.getAttribute("data-tooltip-content") || "";
    this.showArrow = this.element.getAttribute("data-tooltip-arrow") !== "false";
    this.showTimeoutId = null;
    this.hideTimeoutId = null;
    this.isVisible = false;

    if (!this.tooltipContent) {
      console.warn("Tooltip initialized without data-tooltip-content", this.element);
      return;
    }

    this.tooltipElement = document.createElement("div");
    this.tooltipElement.className =
      "tooltip-content pointer-events-none wrap-break-word shadow-sm border rounded-lg border-white/10 absolute bg-[#333333] text-white py-1 px-2 z-[1000]";

    const sizeClasses = {
      small: "text-xs",
      regular: "text-sm",
      large: "text-base",
    };
    const sizeClass = sizeClasses[this.sizeValue] || sizeClasses.regular;
    this.tooltipElement.classList.add(sizeClass);

    this.tooltipElement.classList.add("opacity-0");
    this.tooltipElement.style.visibility = "hidden";

    const hasFade = this._hasAnimationType("fade");
    const hasOrigin = this._hasAnimationType("origin");

    if (hasFade && hasOrigin) {
      this.tooltipElement.style.transition = "opacity 150ms ease-out, transform 150ms ease-out";
      this.tooltipElement.style.transform = "scale(0.95)";
    } else if (hasOrigin) {
      this.tooltipElement.style.transition = "transform 150ms ease-out";
      this.tooltipElement.style.transform = "scale(0.95)";
    } else if (hasFade) {
      this.tooltipElement.style.transition = "opacity 150ms ease-out";
    }

    this._renderTooltipContent();
    this.tooltipElement.style.maxWidth = `${this.maxWidthValue}px`;

    if (this.showArrow) {
      // Create arrow container with padding to prevent clipping at viewport edges
      this.arrowContainer = document.createElement("div");
      this.arrowContainer.className = "absolute z-[1000]";

      // Create the arrow element within the container
      this.arrowElement = document.createElement("div");
      this.arrowElement.className = "tooltip-arrow-element bg-[#333333] w-2 h-2 border-white/10";
      this.arrowElement.style.transform = "rotate(45deg)";

      this.arrowContainer.appendChild(this.arrowElement);
      this.tooltipElement.appendChild(this.arrowContainer);
    }

    // Append target logic is handled in _showTooltip to ensure it's correct at showtime
    // const appendTarget = this.element.closest("dialog[open]") || document.body;
    // appendTarget.appendChild(this.tooltipElement);

    this.showTooltipBound = this._showTooltip.bind(this);
    this.hideTooltipBound = this._hideTooltip.bind(this);
    this.clickHideTooltipBound = this._handleClick.bind(this);
    this.clickToggleTooltipBound = this._handleClickToggle.bind(this);
    this.clickOutsideBound = this._handleClickOutside.bind(this);

    // Auto-detect trigger based on device capability
    let triggerValue = this.triggerValue;
    if (triggerValue === "auto") {
      // Use click on touch devices, mouseenter+focus on others
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      triggerValue = isTouchDevice ? "click" : "mouseenter focus";
    }

    const triggers = triggerValue.split(" ");
    this.hasMouseEnterTrigger = triggers.includes("mouseenter");
    this.hasClickTrigger = triggers.includes("click");

    triggers.forEach((event_type) => {
      if (event_type === "mouseenter") {
        this.element.addEventListener("mouseenter", this.showTooltipBound);
        this.element.addEventListener("mouseleave", this.hideTooltipBound);
      }
      if (event_type === "focus") {
        this.element.addEventListener("focusin", this.showTooltipBound);
        this.element.addEventListener("focusout", this.hideTooltipBound);
      }
      if (event_type === "click") {
        this.element.addEventListener("click", this.clickToggleTooltipBound);
      }
    });

    // Add click event to close tooltip but allow event to bubble up (only for hover triggers)
    if (this.hasMouseEnterTrigger && !this.hasClickTrigger) {
      this.element.addEventListener("click", this.clickHideTooltipBound);
    }

    this.cleanupAutoUpdate = null;
    this.intersectionObserver = null;
  }

  _renderTooltipContent() {
    if (!this.tooltipElement) return;

    const kbdValue = this._resolvedKbdValue();

    if (!kbdValue) {
      this.tooltipElement.innerHTML = this.tooltipContent;
      return;
    }

    const contentElement = document.createElement("span");
    contentElement.className = "min-w-0";
    contentElement.innerHTML = this.tooltipContent;

    const kbdElement = document.createElement("span");
    kbdElement.className = tooltipKbdClasses;
    this._renderKbdValue(kbdElement, kbdValue);

    const contentWrapper = document.createElement("span");
    contentWrapper.className = "flex items-center gap-1.5";
    contentWrapper.append(contentElement, kbdElement);

    this.tooltipElement.replaceChildren(contentWrapper);
  }

  _resolvedKbdValue() {
    if (this._isMac()) {
      return (this.macKbdValue || this.kbdValue).trim();
    }

    return (this.nonMacKbdValue || this.kbdValue).trim();
  }

  _renderKbdValue(kbdElement, kbdValue) {
    const parts = kbdValue.split(/(\s+|\+)/).filter((part) => part.trim());
    const hasCommandKey = parts.some((part) => this._isCommandKey(part));

    if (!hasCommandKey) {
      kbdElement.textContent = kbdValue;
      return;
    }

    kbdElement.classList.add("inline-flex", "items-center", "gap-0.5");

    parts.forEach((part) => {
      if (this._isCommandKey(part)) {
        kbdElement.insertAdjacentHTML("beforeend", commandKeySvg);
      } else {
        kbdElement.append(document.createTextNode(part));
      }
    });
  }

  _isCommandKey(value) {
    return ["cmd", "command", "⌘"].includes(value.trim().toLowerCase());
  }

  _isMac() {
    if (navigator.userAgentData && navigator.userAgentData.platform) {
      return navigator.userAgentData.platform === "macOS";
    }

    return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  disconnect() {
    clearTimeout(this.showTimeoutId);
    clearTimeout(this.hideTimeoutId);

    // Remove from global state if visible or closing
    if (this.isVisible) {
      tooltipGlobalState.onTooltipStartHide(this);
      this.isVisible = false;
    }
    tooltipGlobalState.onTooltipClosed(this);

    // Auto-detect trigger (same logic as connect)
    let triggerValue = this.triggerValue;
    if (triggerValue === "auto") {
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      triggerValue = isTouchDevice ? "click" : "mouseenter focus";
    }

    triggerValue.split(" ").forEach((event_type) => {
      if (event_type === "mouseenter") {
        this.element.removeEventListener("mouseenter", this.showTooltipBound);
        this.element.removeEventListener("mouseleave", this.hideTooltipBound);
      }
      if (event_type === "focus") {
        this.element.removeEventListener("focusin", this.showTooltipBound);
        this.element.removeEventListener("focusout", this.hideTooltipBound);
      }
      if (event_type === "click") {
        this.element.removeEventListener("click", this.clickToggleTooltipBound);
      }
    });

    // Remove click event listener only if it was added for hover-enabled tooltips
    if (this.hasMouseEnterTrigger && !this.hasClickTrigger) {
      this.element.removeEventListener("click", this.clickHideTooltipBound);
    }

    this._cleanupObservers();

    if (this.tooltipElement && this.tooltipElement.parentElement) {
      this.tooltipElement.remove();
    }
  }

  async _updatePositionAndArrow() {
    if (!this.element || !this.tooltipElement) return;

    // Parse placement value to support multiple placements
    const placements = this.placementValue.split(/[\s,]+/).filter(Boolean);
    const primaryPlacement = placements[0] || "top";
    const fallbackPlacements = placements.slice(1);

    const middleware = [
      offset(this.offsetValue),
      flip({
        fallbackPlacements: fallbackPlacements.length > 0 ? fallbackPlacements : undefined,
      }),
      shift({ padding: 5 }),
    ];
    if (this.showArrow && this.arrowContainer) {
      middleware.push(arrow({ element: this.arrowContainer, padding: 2 }));
    }

    const { x, y, placement, middlewareData } = await computePosition(this.element, this.tooltipElement, {
      placement: primaryPlacement,
      middleware: middleware,
    });

    Object.assign(this.tooltipElement.style, {
      left: `${x}px`,
      top: `${y}px`,
    });

    if (this._hasAnimationType("origin")) {
      const basePlacement = placement.split("-")[0];
      this.tooltipElement.classList.remove("origin-top", "origin-bottom", "origin-left", "origin-right");
      if (basePlacement === "top") {
        this.tooltipElement.classList.add("origin-bottom");
      } else if (basePlacement === "bottom") {
        this.tooltipElement.classList.add("origin-top");
      } else if (basePlacement === "left") {
        this.tooltipElement.classList.add("origin-right");
      } else if (basePlacement === "right") {
        this.tooltipElement.classList.add("origin-left");
      }
    }

    if (this.showArrow && this.arrowContainer && this.arrowElement && middlewareData.arrow) {
      const { x: arrowX, y: arrowY } = middlewareData.arrow;
      const currentPlacement = placement; // Use the resolved placement from computePosition
      const basePlacement = currentPlacement.split("-")[0];
      const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
      }[basePlacement];

      // Apply appropriate padding based on placement direction
      this.arrowContainer.classList.remove("px-1", "py-1");
      if (basePlacement === "top" || basePlacement === "bottom") {
        this.arrowContainer.classList.add("px-1"); // Horizontal padding for top/bottom
      } else {
        this.arrowContainer.classList.add("py-1"); // Vertical padding for left/right
      }

      // Position the arrow container
      Object.assign(this.arrowContainer.style, {
        left: arrowX != null ? `${arrowX}px` : "",
        top: arrowY != null ? `${arrowY}px` : "",
        right: "",
        bottom: "",
        [staticSide]: "-0.275rem", // Adjusted to -0.275rem as often seen with 0.5rem arrows
      });

      // Style the arrow element within the container
      // Reset existing border classes before adding new ones
      this.arrowElement.classList.remove("border-t", "border-r", "border-b", "border-l");

      // Apply new borders based on placement
      if (staticSide === "bottom") {
        // Arrow points up
        this.arrowElement.classList.add("border-b", "border-r");
      } else if (staticSide === "top") {
        // Arrow points down
        this.arrowElement.classList.add("border-t", "border-l");
      } else if (staticSide === "left") {
        // Arrow points right
        this.arrowElement.classList.add("border-b", "border-l");
      } else if (staticSide === "right") {
        // Arrow points left
        this.arrowElement.classList.add("border-t", "border-r");
      }
    }
  }

  async _showTooltip() {
    if (!this.tooltipElement) return;

    clearTimeout(this.hideTimeoutId); // Cancel any pending hide finalization
    clearTimeout(this.showTimeoutId); // Cancel any pending show

    // Always hide all other visible tooltips and interrupt closing animations IMMEDIATELY
    // This must happen synchronously before scheduling the show to prevent multiple tooltips
    // from appearing simultaneously when hovering quickly
    tooltipGlobalState.hideAllTooltipsInstantly(this);

    // Determine if we should use fast mode (no delay, no animations)
    const isFastMode = tooltipGlobalState.isInFastMode();
    const effectiveDelay = isFastMode ? 0 : this.delayValue;

    this.showTimeoutId = setTimeout(async () => {
      // Ensure tooltip is appended to the correct target (body or open dialog)
      // This is done here to handle cases where the element might move into/out of a dialog
      const currentAppendTarget = this.element.closest("dialog[open]") || document.body;
      if (this.tooltipElement.parentElement !== currentAppendTarget) {
        currentAppendTarget.appendChild(this.tooltipElement);
      }

      // Tooltip is already opacity-0 and visibility-hidden from connect()
      // 1. Calculate and apply position
      await this._updatePositionAndArrow();

      // 2. Make it visible
      this.tooltipElement.style.visibility = "visible";

      // 3. Apply opacity and scale based on animation type
      const applyVisibleState = () => {
        this.tooltipElement.classList.remove("opacity-0");
        this.tooltipElement.classList.add("opacity-100");

        if (this._hasAnimationType("origin")) {
          this.tooltipElement.style.transform = "scale(1)";
        }
      };

      if (isFastMode) {
        // Fast mode: apply changes instantly without transitions
        this.tooltipElement.setAttribute("data-instant", "");
        this._withoutTransition(applyVisibleState);
        // Remove data-instant after the instant show is complete
        // This prevents it from interfering with hover state changes
        requestAnimationFrame(() => {
          if (this.tooltipElement) {
            this.tooltipElement.removeAttribute("data-instant");
          }
        });
      } else {
        // Normal mode: use requestAnimationFrame for smooth animations
        this.tooltipElement.removeAttribute("data-instant");
        requestAnimationFrame(applyVisibleState);
      }

      // 4. Setup autoUpdate for continuous positioning
      if (this.cleanupAutoUpdate) {
        this.cleanupAutoUpdate();
      }
      this.cleanupAutoUpdate = autoUpdate(
        this.element,
        this.tooltipElement,
        async () => {
          // Re-check append target in case DOM changes during interaction
          const appendTargetRecurring = this.element.closest("dialog[open]") || document.body;
          if (this.tooltipElement.parentElement !== appendTargetRecurring) {
            appendTargetRecurring.appendChild(this.tooltipElement);
          }
          await this._updatePositionAndArrow();
        },
        { animationFrame: true }, // Use animationFrame for smoother updates
      );

      // 5. Setup intersection observer to hide tooltip when trigger element goes out of view
      if (this.intersectionObserver) {
        this.intersectionObserver.disconnect();
      }
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              this._hideTooltip();
            }
          });
        },
        { threshold: 0 }, // Hide as soon as any part goes out of view
      );
      this.intersectionObserver.observe(this.element);

      // 6. Register with global state that this tooltip is now visible
      if (!this.isVisible) {
        this.isVisible = true;
        tooltipGlobalState.onTooltipShow(this);
      }

      // 7. Add click-outside listener for click triggers
      if (this.hasClickTrigger) {
        // Use setTimeout to avoid immediately triggering the click-outside handler
        setTimeout(() => {
          document.addEventListener("click", this.clickOutsideBound);
        }, 0);
      }
    }, effectiveDelay);
  }

  _handleClick() {
    // Hide the tooltip but allow the event to bubble up
    this._hideTooltip();
    // Don't call event.preventDefault() or event.stopPropagation()
    // so the event can bubble up to parent elements (like kanban cards)
  }

  _handleClickToggle(event) {
    // Toggle tooltip visibility on click
    if (this.isVisible) {
      this._hideTooltip();
    } else {
      this._showTooltip();
    }

    // Prevent the click from bubbling only if the element is interactive (button, a, etc.)
    // Otherwise allow it to bubble for non-interactive elements
    const isInteractive = this.element.matches("button, a, [role='button'], input, select, textarea");
    if (!isInteractive) {
      event.stopPropagation();
    }
  }

  _handleClickOutside(event) {
    // Hide tooltip when clicking outside of trigger element
    if (!this.element.contains(event.target)) {
      this._hideTooltip();
    }
  }

  // Helper: Apply instant changes without transitions
  _withoutTransition(callback) {
    if (!this.tooltipElement) return;

    // Ensure data-instant is set (caller should set it, but we ensure it's there)
    this.tooltipElement.setAttribute("data-instant", "");
    this.tooltipElement.offsetHeight; // Force reflow

    callback();

    // Don't remove data-instant here - let the show/hide logic manage it
    // This keeps the attribute on for the entire duration of instant mode
  }

  // Helper: Apply hidden state (opacity, scale, visibility)
  _applyHiddenState() {
    if (!this.tooltipElement) return;

    this.tooltipElement.classList.remove("opacity-100");
    this.tooltipElement.classList.add("opacity-0");
    if (this._hasAnimationType("origin")) {
      this.tooltipElement.style.transform = "scale(0.95)";
    }
    this.tooltipElement.style.visibility = "hidden";
  }

  // Helper: Cleanup observers and auto-update
  _cleanupObservers() {
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    // Remove click-outside listener
    if (this.hasClickTrigger) {
      document.removeEventListener("click", this.clickOutsideBound);
    }
  }

  _hideTooltip(isInstantHide = false) {
    clearTimeout(this.showTimeoutId); // Cancel any pending show operation
    clearTimeout(this.hideTimeoutId); // Cancel any pending hide finalization

    if (!this.tooltipElement) return;

    // Register with global state that this tooltip is starting to hide
    if (this.isVisible) {
      this.isVisible = false;
      tooltipGlobalState.onTooltipStartHide(this);
    }

    this._cleanupObservers();

    if (isInstantHide) {
      // Instant hide: apply hidden state without transitions
      this.tooltipElement.setAttribute("data-instant", "");
      this._withoutTransition(() => {
        this._applyHiddenState();
      });
      tooltipGlobalState.onTooltipClosed(this);
      return;
    }

    // Remove data-instant for normal animated hide
    this.tooltipElement.removeAttribute("data-instant");

    // Normal hide with animations
    tooltipGlobalState.onTooltipClosing(this);

    const needsAnimation = this._hasAnimationType("fade") || this._hasAnimationType("origin");

    if (needsAnimation || this.animationValue === "none") {
      // Apply opacity/scale changes for animation
      this.tooltipElement.classList.remove("opacity-100");
      this.tooltipElement.classList.add("opacity-0");
      if (this._hasAnimationType("origin")) {
        this.tooltipElement.style.transform = "scale(0.95)";
      }
    }

    // Calculate animation duration (match the 150ms transition)
    const animationDelay = needsAnimation ? 150 : 0;

    this.hideTimeoutId = setTimeout(() => {
      if (this.tooltipElement) {
        this.tooltipElement.style.visibility = "hidden";
      }
      tooltipGlobalState.onTooltipClosed(this);
    }, animationDelay);
  }

  // Instantly finish a closing animation (called when another tooltip is being shown)
  _finishClosingAnimation() {
    clearTimeout(this.hideTimeoutId);

    if (!this.tooltipElement) return;

    this.tooltipElement.setAttribute("data-instant", "");
    this._withoutTransition(() => {
      this._applyHiddenState();
    });

    tooltipGlobalState.onTooltipClosed(this);
  }
}
