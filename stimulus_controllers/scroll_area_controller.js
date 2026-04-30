import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="scroll-area"
export default class extends Controller {
  static targets = ["viewport", "scrollbar", "thumb", "root"];
  static values = {
    hideDelay: { type: Number, default: 600 }, // The delay in milliseconds before hiding the scrollbars
  };

  connect() {
    this.scrolling = false;
    this.hovering = false;
    this.hideTimeout = null;
    this.isDragging = false;
    this.initialRefreshFrame = null;
    this.secondaryInitialRefreshFrame = null;
    this.initialRefreshTimeout = null;
    this.onWindowLoad = this.onWindowLoad.bind(this);

    this.refreshMeasurements();
    this.scheduleInitialRefreshes();
    this.refreshAfterFontsLoad();

    // Observe viewport/root size changes
    this.resizeObserver = new ResizeObserver(() => {
      this.refreshMeasurements();
    });

    if (this.hasViewportTarget) {
      this.resizeObserver.observe(this.viewportTarget);
    }
    if (this.hasRootTarget) {
      this.resizeObserver.observe(this.rootTarget);
    }

    // Observe content changes inside viewport (dynamic content, lazy renders)
    if (this.hasViewportTarget) {
      this.mutationObserver = new MutationObserver(() => {
        this.refreshMeasurements();
      });
      this.mutationObserver.observe(this.viewportTarget, {
        childList: true,
        subtree: true,
      });
    }

    window.addEventListener("load", this.onWindowLoad);
  }

  disconnect() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    this.clearScheduledRefreshes();
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    window.removeEventListener("load", this.onWindowLoad);
  }

  // Viewport events
  onViewportScroll(event) {
    this.refreshMeasurements();
    this.setScrolling(true);

    // Clear previous timeout
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }

    // Set new timeout - only hide if not hovering
    this.hideTimeout = setTimeout(() => {
      // Keep scrollbar visible if still hovering
      if (!this.hovering) {
        this.setScrolling(false);
      }
    }, this.hideDelayValue);
  }

  // Mouse enter/leave on root
  onRootMouseEnter() {
    this.refreshMeasurements();
    this.setHovering(true);
  }

  onRootMouseLeave() {
    if (!this.isDragging) {
      this.setHovering(false);
      // Also clear scrolling state when mouse leaves
      this.setScrolling(false);
    }
  }

  // Scrollbar track click - jump to position
  onScrollbarClick(event) {
    // Don't handle if clicking on thumb
    if (event.target.dataset.scrollAreaTarget === "thumb") return;

    const scrollbar = event.currentTarget;
    const orientation = this.getOrientation(scrollbar);
    const isVertical = orientation === "vertical";
    const viewport = this.viewportTarget;

    // Get click position relative to scrollbar
    const rect = scrollbar.getBoundingClientRect();
    const clickPos = isVertical ? event.clientY - rect.top : event.clientX - rect.left;

    const scrollbarSize = isVertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
    const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
    const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;
    const maxScrollableDistance = contentSize - viewportSize;

    if (maxScrollableDistance <= 0 || scrollbarSize <= 0 || contentSize <= 0) return;

    // Calculate thumb size
    const thumbSize = Math.max((viewportSize / contentSize) * scrollbarSize, 20);
    const clampedThumbSize = Math.min(thumbSize, scrollbarSize);

    // Calculate scroll position (center thumb on click position)
    const maxScroll = Math.max(scrollbarSize - clampedThumbSize, 0);
    if (maxScroll <= 0) return;

    const thumbPosition = Math.max(0, Math.min(clickPos - clampedThumbSize / 2, maxScroll));
    const scrollRatio = thumbPosition / maxScroll;

    // Apply scroll
    if (isVertical) {
      viewport.scrollTop = scrollRatio * maxScrollableDistance;
    } else {
      viewport.scrollLeft = scrollRatio * maxScrollableDistance;
    }
  }

  // Thumb drag events
  onThumbMouseDown(event) {
    // Ignore right-click
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation(); // Prevent scrollbar click from firing
    this.isDragging = true;
    this.setHovering(true);

    const thumb = event.currentTarget;
    const scrollbar = thumb.closest('[data-scroll-area-target="scrollbar"]');
    const orientation = this.getOrientation(scrollbar);
    const isVertical = orientation === "vertical";
    const viewport = this.viewportTarget;

    // Get initial positions
    const startPos = isVertical ? event.clientY : event.clientX;
    const startScroll = isVertical ? viewport.scrollTop : viewport.scrollLeft;

    // Calculate scrollbar metrics
    const scrollbarSize = isVertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
    const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
    const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;
    const maxScrollableDistance = contentSize - viewportSize;
    const rawThumbSize = Math.max((viewportSize / contentSize) * scrollbarSize, 20);
    const thumbSize = Math.min(rawThumbSize, scrollbarSize);
    const maxThumbTravel = scrollbarSize - thumbSize;

    if (maxScrollableDistance <= 0 || scrollbarSize <= 0 || maxThumbTravel <= 0) {
      this.isDragging = false;
      this.setHovering(false);
      return;
    }

    const onMouseMove = (e) => {
      const currentPos = isVertical ? e.clientY : e.clientX;
      const delta = currentPos - startPos;
      const scrollDelta = (delta / maxThumbTravel) * maxScrollableDistance;

      if (isVertical) {
        viewport.scrollTop = startScroll + scrollDelta;
      } else {
        viewport.scrollLeft = startScroll + scrollDelta;
      }
    };

    const onMouseUp = (e) => {
      this.isDragging = false;

      // Check if mouse is still over the root element
      if (this.hasRootTarget) {
        const rect = this.rootTarget.getBoundingClientRect();
        const isStillInside =
          e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;

        // Only set hovering to false if mouse left the container
        if (!isStillInside) {
          this.setHovering(false);
        }
      }

      cleanup();
    };

    const onContextMenu = (e) => {
      // Cancel drag on right-click
      this.isDragging = false;
      this.setHovering(false);
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("contextmenu", onContextMenu);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("contextmenu", onContextMenu);
  }

  // Update methods
  refreshMeasurements() {
    this.updateOverflow();
    this.updateAllScrollbars();
  }

  onWindowLoad() {
    this.refreshMeasurements();
  }

  refreshAfterFontsLoad() {
    if (!document.fonts?.ready) return;

    document.fonts.ready
      .then(() => {
        if (this.isConnected) {
          this.refreshMeasurements();
        }
      })
      .catch(() => {
        // Ignore font loading errors; fall back to resize/scroll observers.
      });
  }

  scheduleInitialRefreshes() {
    this.clearScheduledRefreshes();

    // Run after first and second paint to capture late layout changes.
    this.initialRefreshFrame = requestAnimationFrame(() => {
      this.refreshMeasurements();
      this.secondaryInitialRefreshFrame = requestAnimationFrame(() => {
        this.refreshMeasurements();
      });
    });

    // Catch slower layout shifts (e.g., async content or class toggles).
    this.initialRefreshTimeout = setTimeout(() => {
      this.refreshMeasurements();
      this.initialRefreshTimeout = null;
    }, 150);
  }

  clearScheduledRefreshes() {
    if (this.initialRefreshFrame) {
      cancelAnimationFrame(this.initialRefreshFrame);
      this.initialRefreshFrame = null;
    }
    if (this.secondaryInitialRefreshFrame) {
      cancelAnimationFrame(this.secondaryInitialRefreshFrame);
      this.secondaryInitialRefreshFrame = null;
    }
    if (this.initialRefreshTimeout) {
      clearTimeout(this.initialRefreshTimeout);
      this.initialRefreshTimeout = null;
    }
  }

  updateOverflow() {
    if (!this.hasViewportTarget) return;

    const viewport = this.viewportTarget;
    const hasOverflowX = viewport.scrollWidth > viewport.clientWidth;
    const hasOverflowY = viewport.scrollHeight > viewport.clientHeight;

    // Update root data attributes
    if (this.hasRootTarget) {
      this.rootTarget.dataset.hasOverflowX = hasOverflowX;
      this.rootTarget.dataset.hasOverflowY = hasOverflowY;

      // Calculate overflow distances
      const overflowXStart = viewport.scrollLeft;
      const overflowXEnd = viewport.scrollWidth - viewport.clientWidth - viewport.scrollLeft;
      const overflowYStart = viewport.scrollTop;
      const overflowYEnd = viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;

      // Add small threshold to handle rounding errors (1px tolerance)
      const threshold = 1;

      // Set data attributes for overflow edges
      if (overflowXStart > threshold) {
        this.rootTarget.dataset.overflowXStart = "";
      } else {
        delete this.rootTarget.dataset.overflowXStart;
      }

      if (overflowXEnd > threshold) {
        this.rootTarget.dataset.overflowXEnd = "";
      } else {
        delete this.rootTarget.dataset.overflowXEnd;
      }

      if (overflowYStart > threshold) {
        this.rootTarget.dataset.overflowYStart = "";
      } else {
        delete this.rootTarget.dataset.overflowYStart;
      }

      if (overflowYEnd > threshold) {
        this.rootTarget.dataset.overflowYEnd = "";
      } else {
        delete this.rootTarget.dataset.overflowYEnd;
      }

      // Set CSS variables for overflow distances
      this.rootTarget.style.setProperty("--scroll-area-overflow-x-start", `${overflowXStart}px`);
      this.rootTarget.style.setProperty("--scroll-area-overflow-x-end", `${overflowXEnd}px`);
      this.rootTarget.style.setProperty("--scroll-area-overflow-y-start", `${overflowYStart}px`);
      this.rootTarget.style.setProperty("--scroll-area-overflow-y-end", `${overflowYEnd}px`);
    }
  }

  updateAllScrollbars() {
    if (!this.hasScrollbarTarget) return;

    this.scrollbarTargets.forEach((scrollbar) => {
      this.updateScrollbarPosition(scrollbar);
      this.updateScrollbarVisibility(scrollbar);
    });
  }

  updateScrollbarPosition(scrollbar) {
    if (!this.hasViewportTarget) return;

    const viewport = this.viewportTarget;
    const thumb = this.getThumbForScrollbar(scrollbar);
    if (!thumb) return;

    const orientation = this.getOrientation(scrollbar);
    const isVertical = orientation === "vertical";

    const scrollbarSize = isVertical ? scrollbar.offsetHeight : scrollbar.offsetWidth;
    const viewportSize = isVertical ? viewport.clientHeight : viewport.clientWidth;
    const contentSize = isVertical ? viewport.scrollHeight : viewport.scrollWidth;
    const maxScrollableDistance = contentSize - viewportSize;

    const scrollRatio =
      maxScrollableDistance > 0 ? (isVertical ? viewport.scrollTop : viewport.scrollLeft) / maxScrollableDistance : 0;

    if (scrollbarSize <= 0 || contentSize <= 0) return;

    // Calculate thumb size
    const thumbSize = Math.max((viewportSize / contentSize) * scrollbarSize, 20); // Minimum 20px
    const clampedThumbSize = Math.min(thumbSize, scrollbarSize);
    const maxScroll = Math.max(scrollbarSize - clampedThumbSize, 0);
    const thumbPosition = scrollRatio * maxScroll;

    if (isVertical) {
      thumb.style.height = `${clampedThumbSize}px`;
      thumb.style.transform = `translateY(${thumbPosition}px)`;
    } else {
      thumb.style.width = `${clampedThumbSize}px`;
      thumb.style.transform = `translateX(${thumbPosition}px)`;
    }
  }

  updateScrollbarVisibility(scrollbar) {
    if (!this.hasViewportTarget) return;

    const viewport = this.viewportTarget;
    const orientation = this.getOrientation(scrollbar);
    const isVertical = orientation === "vertical";

    const hasOverflow = isVertical
      ? viewport.scrollHeight > viewport.clientHeight
      : viewport.scrollWidth > viewport.clientWidth;

    scrollbar.dataset.visible = hasOverflow;
  }

  setScrolling(scrolling) {
    this.scrolling = scrolling;
    this.updateScrollbarState();
  }

  setHovering(hovering) {
    this.hovering = hovering;
    this.updateScrollbarState();
  }

  updateScrollbarState() {
    if (!this.hasScrollbarTarget) return;

    this.scrollbarTargets.forEach((scrollbar) => {
      if (this.scrolling) {
        scrollbar.dataset.scrolling = "";
      } else {
        delete scrollbar.dataset.scrolling;
      }

      if (this.hovering) {
        scrollbar.dataset.hovering = "";
      } else {
        delete scrollbar.dataset.hovering;
      }
    });
  }

  // Helper methods
  getOrientation(element) {
    return element.dataset.scrollAreaOrientationValue || "vertical";
  }

  getThumbForScrollbar(scrollbar) {
    return scrollbar.querySelector('[data-scroll-area-target="thumb"]');
  }
}
