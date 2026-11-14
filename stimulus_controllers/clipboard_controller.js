import { Controller } from "@hotwired/stimulus";
import { computePosition, offset, flip, shift, arrow, autoUpdate } from "@floating-ui/dom";

const ENTER_EASE = "cubic-bezier(0.23, 1, 0.32, 1)"; // Strong ease-out: content lands fast, then settles
const RESIZE_EASE = "cubic-bezier(0.32, 0.72, 0, 1)";
const WIDTH_DURATION_MS = 240;
const TOOLTIP_FADE_MS = 150; // Matches the tooltip's duration-150 transition

export default class extends Controller {
  static values = {
    successMessage: { type: String, default: "Copied!" }, // Success message to show when text is copied
    errorMessage: { type: String, default: "Failed to copy!" }, // Error message to show when text is not copied
    showTooltip: { type: Boolean, default: true }, // Whether to show the tooltip
    tooltipPlacement: { type: String, default: "top" }, // Placement(s) of the tooltip, e.g., "top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "left-start", "left-end", "right", "right-start", "right-end"
    tooltipOffset: { type: Number, default: 8 }, // Offset of the tooltip
    tooltipDuration: { type: Number, default: 2000 }, // Duration of the tooltip
    source: String, // CSS selector of an element whose text is copied when there is no data-clipboard-text (e.g. "#answer-42")
  };

  static targets = ["copyContent", "copiedContent"];

  connect() {
    this.boundCopyTextToClipboard = this._copyTextToClipboard.bind(this);
    this.element.addEventListener("click", this.boundCopyTextToClipboard);

    this.cleanupAutoUpdate = null;
    this.tooltipElement = null;
    this.arrowElement = null;
    this.hideTooltipTimeout = null;
    this.finalizeHideTooltipTimeout = null;
    this.copiedStateTimeout = null;
    this.intersectionObserver = null;
  }

  disconnect() {
    // if (this.clipboard) {
    //   this.clipboard.destroy();
    // }
    if (this.boundCopyTextToClipboard) {
      this.element.removeEventListener("click", this.boundCopyTextToClipboard);
    }
    clearTimeout(this.copiedStateTimeout);
    clearTimeout(this.revertTimeout);
    clearTimeout(this.revealTimeout);
    clearTimeout(this.hideTooltipTimeout);
    clearTimeout(this.finalizeHideTooltipTimeout);
    this._finishSwap();
    this._removeTooltipDOM(); // This also handles cleanupAutoUpdate
  }

  handleSuccess(e) {
    clearTimeout(this.revealTimeout);
    const resizing = this.showCopiedState();

    // While the button resizes, wait for it to settle so the tooltip appears centred on its new width.
    this.revealTimeout = setTimeout(
      () => {
        if (this.showTooltipValue) {
          this._showFloatingTooltip(this.successMessageValue);
        }
        if (this.hasCopyContentTarget && this.hasCopiedContentTarget) {
          clearTimeout(this.copiedStateTimeout);
          this.copiedStateTimeout = setTimeout(() => this._revertCopiedState(), this.tooltipDurationValue);
        }
      },
      resizing ? WIDTH_DURATION_MS : 0,
    );
    // if (e && typeof e.clearSelection === "function") {  Removed e.clearSelection()
    //   e.clearSelection();
    // }
  }

  handleError(e) {
    if (this.showTooltipValue) {
      this._showFloatingTooltip(this.errorMessageValue);
    }
  }

  // Swaps "copy" for "copied" with a blur crossfade while the button resizes, then swaps back
  // once the tooltip has faded out. Returns true when the button is resizing.
  showCopiedState() {
    if (!this.hasCopyContentTarget || !this.hasCopiedContentTarget) return false;

    clearTimeout(this.copiedStateTimeout);
    clearTimeout(this.revertTimeout);
    return this._swapContent(this.copyContentTarget, this.copiedContentTarget);
  }

  _revertCopiedState() {
    if (!this.hasCopyContentTarget || !this.hasCopiedContentTarget) return;

    // The tooltip's own timer hides it at this same moment; wait out its fade before swapping back,
    // so it never slides along with the shrinking button.
    this._hideFloatingTooltip();
    this.revertTimeout = setTimeout(
      () => this._swapContent(this.copiedContentTarget, this.copyContentTarget),
      this.showTooltipValue ? TOOLTIP_FADE_MS : 0,
    );
  }

  _swapContent(from, to) {
    if (from.classList.contains("hidden") && !to.classList.contains("hidden")) return false;

    this._finishSwap();
    const element = this.element;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const elementRect = element.getBoundingClientRect();
    const fromRect = from.getBoundingClientRect();

    from.classList.add("hidden");
    to.classList.remove("hidden");

    // Reduced motion keeps a plain fade: no blur, scale or resize.
    if (reduceMotion) {
      this.swapAnimations = [to.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: "ease-out" })];
      return false;
    }

    // Incoming content comes into focus. The blur bridges the two states so the eye reads one
    // change rather than two overlapping labels.
    this.swapAnimations = [
      to.animate(
        [
          { opacity: 0, filter: "blur(2px)", transform: "scale(0.95)" },
          { opacity: 1, filter: "blur(0)", transform: "none" },
        ],
        { duration: 220, easing: ENTER_EASE, delay: 40, fill: "backwards" },
      ),
    ];

    // Outgoing content stays where it was, out of the flow, and blurs away.
    if (getComputedStyle(element).position === "static") element.style.position = "relative";
    from.classList.remove("hidden");
    Object.assign(from.style, {
      position: "absolute",
      left: `${fromRect.left - elementRect.left - element.clientLeft}px`,
      top: `${fromRect.top - elementRect.top - element.clientTop}px`,
      width: `${fromRect.width}px`,
      height: `${fromRect.height}px`,
      margin: "0",
      pointerEvents: "none",
    });
    this.outgoing = from;
    const outAnimation = from.animate(
      [
        { opacity: 1, filter: "blur(0)", transform: "none" },
        { opacity: 0, filter: "blur(2px)", transform: "scale(0.95)" },
      ],
      { duration: 140, easing: "ease-out", fill: "forwards" },
    );
    outAnimation.finished.then(() => this._releaseOutgoing(from), () => {});
    this.swapAnimations.push(outAnimation);

    // The button grows or shrinks to its new width instead of jumping.
    const toWidth = element.getBoundingClientRect().width;
    if (Math.abs(toWidth - elementRect.width) < 1) return false;

    this.previousOverflow = element.style.overflow;
    element.style.overflow = "hidden";
    const widthAnimation = element.animate([{ width: `${elementRect.width}px` }, { width: `${toWidth}px` }], {
      duration: WIDTH_DURATION_MS,
      easing: RESIZE_EASE,
    });
    this.widthAnimation = widthAnimation;
    const restoreOverflow = () => {
      if (this.widthAnimation !== widthAnimation) return;
      element.style.overflow = this.previousOverflow;
      this.widthAnimation = null;
    };
    widthAnimation.finished.then(restoreOverflow, restoreOverflow);
    return true;
  }

  // Jumps a running swap to its end state (another click, a revert, or disconnect).
  _finishSwap() {
    this.swapAnimations?.forEach((animation) => animation.cancel());
    this.swapAnimations = null;
    if (this.widthAnimation) {
      this.element.style.overflow = this.previousOverflow;
      this.widthAnimation.cancel();
      this.widthAnimation = null;
    }
    if (this.outgoing) this._releaseOutgoing(this.outgoing);
  }

  // Puts the faded-out content back in the flow, hidden.
  _releaseOutgoing(element) {
    if (this.outgoing !== element) return;
    element.getAnimations().forEach((animation) => animation.cancel());
    element.classList.add("hidden");
    ["position", "left", "top", "width", "height", "margin", "pointerEvents"].forEach((property) => {
      element.style[property] = "";
    });
    this.outgoing = null;
  }

  // Text of the element matched by data-clipboard-source-value, so long or streamed content
  // does not have to be duplicated in an attribute.
  _sourceText() {
    if (!this.hasSourceValue) return undefined;
    const source = document.querySelector(this.sourceValue);
    return source ? source.innerText.trim() : undefined;
  }

  async _copyTextToClipboard() {
    const textToCopy = this.element.dataset.clipboardText ?? this._sourceText();
    if (textToCopy === null || typeof textToCopy === "undefined") {
      console.warn("No text to copy. Missing data-clipboard-text attribute on element:", this.element);
      this.handleError({ message: "No text to copy specified." }); // Pass a mock error object or just the message
      return;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.handleSuccess(); // Removed 'e' argument as it's not provided by navigator.clipboard
    } catch (err) {
      console.error("Failed to copy text: ", err);
      this.handleError(err); // Pass the actual error object
    }
  }

  _createOrUpdateTooltipDOMSafer(message) {
    if (!this.tooltipElement) {
      this.tooltipElement = document.createElement("div");
      this.tooltipElement.className =
        "tooltip-content pointer-events-none shadow-sm border rounded-lg border-white/10 absolute bg-[#333333] text-white text-sm py-1 px-2 z-[1000] opacity-0";
      // Example: this.tooltipElement.style.maxWidth = `${this.maxWidthValue}px`; // If you add a maxWidthValue

      const messageSpan = document.createElement("span");
      messageSpan.setAttribute("data-tooltip-message-span", "");
      this.tooltipElement.appendChild(messageSpan);

      // Create arrow container with padding to prevent clipping at viewport edges
      this.arrowContainer = document.createElement("div");
      this.arrowContainer.className = "absolute z-[1000]";

      this.arrowElement = document.createElement("div");
      this.arrowElement.className = "tooltip-arrow-element bg-[#333333] w-2 h-2 border-white/10";
      this.arrowElement.style.transform = "rotate(45deg)";

      this.arrowContainer.appendChild(this.arrowElement);
      this.tooltipElement.appendChild(this.arrowContainer);

      this.tooltipElement.style.visibility = "hidden";
      // Fades and grows in slightly from the side facing the button (origin set while positioning).
      this.tooltipElement.style.transition = `opacity ${TOOLTIP_FADE_MS}ms ease-out, transform ${TOOLTIP_FADE_MS}ms ${ENTER_EASE}`;
      this.tooltipElement.style.transform = this._tooltipHiddenTransform();
    }

    const messageSpan = this.tooltipElement.querySelector("[data-tooltip-message-span]");
    if (messageSpan) {
      messageSpan.textContent = message;
    }
  }

  _ensureTooltipAppendTarget() {
    if (!this.tooltipElement) return;
    const appendTarget = this.element.closest("dialog[open]") || document.body;
    if (this.tooltipElement.parentElement !== appendTarget) {
      appendTarget.appendChild(this.tooltipElement);
    }
  }

  _cleanupObservers() {
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
  }

  _removeTooltipDOM() {
    this._cleanupObservers();
    if (this.tooltipElement && this.tooltipElement.parentElement) {
      this.tooltipElement.remove();
    }
    this.tooltipElement = null;
    this.arrowContainer = null;
    this.arrowElement = null;
  }

  async _showFloatingTooltip(message) {
    if (!this.showTooltipValue) return;

    clearTimeout(this.hideTooltipTimeout);
    clearTimeout(this.finalizeHideTooltipTimeout);
    this._createOrUpdateTooltipDOMSafer(message);

    if (!this.tooltipElement) return; // Should not happen if _createOrUpdateTooltipDOMSafer worked

    this._ensureTooltipAppendTarget();

    this.tooltipElement.style.visibility = "visible";

    // Ensure autoUpdate is cleaned up if it was somehow active without a tooltipElement (defensive)
    this._cleanupObservers();

    const referenceElement = this.element;
    this.cleanupAutoUpdate = autoUpdate(
      referenceElement,
      this.tooltipElement,
      async () => {
        if (!this.tooltipElement || !this.arrowContainer) {
          this._cleanupObservers();
          return;
        }

        this._ensureTooltipAppendTarget();

        // Parse placement value to support multiple placements
        const placements = this.tooltipPlacementValue.split(/[\s,]+/).filter(Boolean);
        const primaryPlacement = placements[0] || "top";
        const fallbackPlacements = placements.slice(1);

        const middleware = [
          offset(this.tooltipOffsetValue),
          flip({
            fallbackPlacements: fallbackPlacements.length > 0 ? fallbackPlacements : undefined,
          }),
          shift({ padding: 5 }),
        ];
        middleware.push(arrow({ element: this.arrowContainer, padding: 2 }));

        const { x, y, placement, middlewareData } = await computePosition(referenceElement, this.tooltipElement, {
          placement: primaryPlacement,
          middleware: middleware,
        });

        Object.assign(this.tooltipElement.style, {
          left: `${x}px`,
          top: `${y}px`,
        });

        if (this.arrowContainer && this.arrowElement && middlewareData.arrow) {
          const { x: arrowX, y: arrowY } = middlewareData.arrow;
          const basePlacement = placement.split("-")[0];
          const staticSide = { top: "bottom", right: "left", bottom: "top", left: "right" }[basePlacement];
          this.tooltipElement.style.transformOrigin = staticSide;

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
            [staticSide]: "-0.28rem", // Matches tooltip_controller.js arrow positioning
          });

          // Style the arrow element within the container
          this.arrowElement.classList.remove("border-t", "border-r", "border-b", "border-l");
          if (staticSide === "bottom") this.arrowElement.classList.add("border-b", "border-r");
          else if (staticSide === "top") this.arrowElement.classList.add("border-t", "border-l");
          else if (staticSide === "left") this.arrowElement.classList.add("border-b", "border-l");
          else if (staticSide === "right") this.arrowElement.classList.add("border-t", "border-r");
        }
      },
      { animationFrame: true },
    );

    // Setup intersection observer to hide tooltip when trigger element goes out of view
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            this._hideFloatingTooltip();
          }
        });
      },
      { threshold: 0 }, // Hide as soon as any part goes out of view
    );
    this.intersectionObserver.observe(this.element);

    requestAnimationFrame(() => {
      if (this.tooltipElement) {
        this.tooltipElement.classList.remove("opacity-0");
        this.tooltipElement.classList.add("opacity-100");
        this.tooltipElement.style.transform = "none";
      }
    });

    this.hideTooltipTimeout = setTimeout(() => {
      this._hideFloatingTooltip();
    }, this.tooltipDurationValue);
  }

  _hideFloatingTooltip() {
    if (!this.tooltipElement || !this.tooltipElement.classList.contains("opacity-100")) {
      return;
    }

    this.tooltipElement.classList.remove("opacity-100");
    this.tooltipElement.classList.add("opacity-0");
    this.tooltipElement.style.transform = this._tooltipHiddenTransform();
    this._cleanupObservers();

    clearTimeout(this.finalizeHideTooltipTimeout);
    this.finalizeHideTooltipTimeout = setTimeout(() => {
      if (this.tooltipElement) {
        this.tooltipElement.style.visibility = "hidden";
      }
    }, 150); // Transition duration (duration-150)
  }

  _tooltipHiddenTransform() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "none" : "scale(0.97)";
  }
}
