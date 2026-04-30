import { Controller } from "@hotwired/stimulus";
import { computePosition, offset, flip, shift, arrow, autoUpdate } from "@floating-ui/dom";

export default class extends Controller {
  static values = {
    successMessage: { type: String, default: "Copied!" }, // Success message to show when text is copied
    errorMessage: { type: String, default: "Failed to copy!" }, // Error message to show when text is not copied
    showTooltip: { type: Boolean, default: true }, // Whether to show the tooltip
    tooltipPlacement: { type: String, default: "top" }, // Placement(s) of the tooltip, e.g., "top", "top-start", "top-end", "bottom", "bottom-start", "bottom-end", "left", "left-start", "left-end", "right", "right-start", "right-end"
    tooltipOffset: { type: Number, default: 8 }, // Offset of the tooltip
    tooltipDuration: { type: Number, default: 2000 }, // Duration of the tooltip
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
    clearTimeout(this.hideTooltipTimeout);
    clearTimeout(this.finalizeHideTooltipTimeout);
    this._removeTooltipDOM(); // This also handles cleanupAutoUpdate
  }

  handleSuccess(e) {
    if (this.hasCopyContentTarget && this.hasCopiedContentTarget) {
      this.showCopiedState();
    }
    if (this.showTooltipValue) {
      this._showFloatingTooltip(this.successMessageValue);
    }
    // if (e && typeof e.clearSelection === "function") {  Removed e.clearSelection()
    //   e.clearSelection();
    // }
  }

  handleError(e) {
    if (this.showTooltipValue) {
      this._showFloatingTooltip(this.errorMessageValue);
    }
  }

  showCopiedState() {
    if (this.hasCopyContentTarget && this.hasCopiedContentTarget) {
      this.copyContentTarget.classList.add("hidden");
      this.copiedContentTarget.classList.remove("hidden");
      clearTimeout(this.copiedStateTimeout);
      this.copiedStateTimeout = setTimeout(() => {
        if (this.hasCopyContentTarget && this.hasCopiedContentTarget) {
          // Check targets still exist
          this.copyContentTarget.classList.remove("hidden");
          this.copiedContentTarget.classList.add("hidden");
        }
      }, this.tooltipDurationValue);
    }
  }

  async _copyTextToClipboard() {
    const textToCopy = this.element.dataset.clipboardText || this.element.getAttribute("data-clipboard-text");
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
        "tooltip-content pointer-events-none shadow-sm border rounded-lg border-white/10 absolute bg-[#333333] text-white text-sm py-1 px-2 z-[1000] opacity-0 transition-opacity duration-150";
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
    this._cleanupObservers();

    clearTimeout(this.finalizeHideTooltipTimeout);
    this.finalizeHideTooltipTimeout = setTimeout(() => {
      if (this.tooltipElement) {
        this.tooltipElement.style.visibility = "hidden";
      }
    }, 150); // Transition duration (duration-150)
  }
}
