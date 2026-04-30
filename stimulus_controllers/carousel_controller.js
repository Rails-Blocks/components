import { Controller } from "@hotwired/stimulus";
import EmblaCarousel from "embla-carousel";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

export default class extends Controller {
  static targets = ["viewport", "prevButton", "nextButton", "dotsContainer", "thumbnailButton"];
  static values = {
    loop: { type: Boolean, default: false }, // Whether to loop the carousel
    dragFree: { type: Boolean, default: false }, // Whether to allow dragging
    dots: { type: Boolean, default: true }, // Whether to show dots
    buttons: { type: Boolean, default: true }, // Whether to show buttons
    axis: { type: String, default: "x" }, // Axis of the carousel
    thumbnails: { type: Boolean, default: false }, // Whether to show thumbnails
    mainCarousel: { type: String, default: "" }, // ID of main carousel for thumbnail sync
    wheelGestures: { type: Boolean, default: false }, // Whether to enable wheel gestures
  };

  connect() {
    const options = {
      loop: this.loopValue,
      dragFree: this.dragFreeValue,
      axis: this.axisValue,
    };
    if (this.shouldCenterFirstSlide()) {
      options.align = "center";
      options.containScroll = false;
    }
    if (this.thumbnailsValue) {
      // Keep one snap per thumbnail so dot count matches thumbnail count.
      options.align = "start";
      options.containScroll = false;
    }

    const plugins = [];
    if (this.wheelGesturesValue) {
      plugins.push(WheelGesturesPlugin());
    }

    this.embla = EmblaCarousel(this.viewportTarget, options, plugins);
    this.boundHandleKeydown = this.handleKeydown.bind(this);

    if (this.buttonsValue) {
      this.setupButtons();
    }
    if (this.dotsValue) {
      this.setupDots();
    }
    if (this.thumbnailsValue) {
      this.setupThumbnails();
    }
    this.setupKeyboardNavigation(); // Always setup keyboard nav for viewport

    this.embla.on("select", this.updateControls);
    this.embla.on("reInit", this.updateControls);

    // Safari compatibility: Ensure viewport is ready for focus
    requestAnimationFrame(() => {
      if (this.viewportTarget && !this.viewportTarget.getAttribute("aria-label")) {
        this.viewportTarget.setAttribute("aria-label", "Image carousel, use arrow keys to navigate");
      }
    });

    // If this is a thumbnail carousel, find and connect to main carousel
    if (this.mainCarouselValue) {
      this.connectToMainCarousel();
    }

    // Try to establish connections after a delay to ensure all carousels are initialized
    setTimeout(() => {
      this.establishConnections();
    }, 200);
  }

  shouldCenterFirstSlide() {
    return !this.loopValue && !this.thumbnailsValue;
  }

  disconnect() {
    if (this.embla) {
      this.embla.destroy();
    }
    this.teardownKeyboardNavigation();

    // Clean up carousel connections
    if (this.thumbnailCarousel) {
      this.thumbnailCarousel = null;
    }
    if (this.mainCarousel) {
      this.mainCarousel = null;
    }
  }

  // --- Thumbnail Carousel Connection ---
  connectToMainCarousel() {
    // Use a small delay to ensure the main carousel is fully initialized
    setTimeout(() => {
      const mainElement = document.getElementById(this.mainCarouselValue);
      if (mainElement) {
        const mainController = this.application.getControllerForElementAndIdentifier(mainElement, "carousel");
        if (mainController) {
          this.mainCarousel = mainController;
          mainController.thumbnailCarousel = this;

          // Set up sync from thumbnail carousel to main carousel when dragging
          if (this.embla) {
            this.embla.on("select", this.syncWithMainCarousel.bind(this));
          }

          // Immediately sync thumbnail state with main carousel
          if (this.hasThumbnailButtonTarget && mainController.embla) {
            const selectedIndex = mainController.embla.selectedScrollSnap();
            this.updateThumbnails(selectedIndex);
          }
        } else {
          console.warn("Main carousel controller not found for ID:", this.mainCarouselValue);
        }
      } else {
        console.warn("Main carousel element not found with ID:", this.mainCarouselValue);
      }
    }, 100);
  }

  establishConnections() {
    // If this is a thumbnail carousel and not yet connected
    if (this.mainCarouselValue && !this.mainCarousel) {
      this.connectToMainCarousel();
    }

    // If this is a main carousel, look for any thumbnail carousels that should connect to it
    if (this.element.id && !this.mainCarouselValue) {
      const thumbnailCarousels = document.querySelectorAll(`[data-carousel-main-carousel-value="${this.element.id}"]`);
      thumbnailCarousels.forEach((thumbnailElement) => {
        const thumbnailController = this.application.getControllerForElementAndIdentifier(thumbnailElement, "carousel");
        if (thumbnailController && !thumbnailController.mainCarousel) {
          thumbnailController.mainCarousel = this;
          this.thumbnailCarousel = thumbnailController;

          // Set up sync from thumbnail carousel to main carousel when dragging
          if (thumbnailController.embla) {
            thumbnailController.embla.on("select", thumbnailController.syncWithMainCarousel.bind(thumbnailController));
          }

          // Sync initial state
          if (thumbnailController.hasThumbnailButtonTarget && this.embla) {
            const selectedIndex = this.embla.selectedScrollSnap();
            thumbnailController.updateThumbnails(selectedIndex);
          }
        }
      });
    }
  }

  // --- Thumbnail Navigation ---
  setupThumbnails() {
    if (this.hasThumbnailButtonTarget) {
      this.thumbnailButtonTargets.forEach((button, index) => {
        button.addEventListener("click", () => this.onThumbnailClick(index));
        button.addEventListener("keydown", this.boundHandleKeydown);
      });
      // Set initial thumbnail state
      this.updateThumbnails();
    }
  }

  onThumbnailClick(index) {
    if (!this.embla) return;

    // If this is a thumbnail carousel, sync with main carousel
    if (this.mainCarousel && this.mainCarousel.embla) {
      this.mainCarousel.embla.scrollTo(index);
      // Don't change focus on click, let user continue with thumbnails if they want
    } else {
      // This is the main carousel with thumbnails
      this.embla.scrollTo(index);
      // Don't change focus on click, let user continue with thumbnails if they want
    }
  }

  syncWithMainCarousel() {
    // This method is called when the thumbnail carousel's selection changes (including drag)
    if (!this.embla || !this.mainCarousel || !this.mainCarousel.embla) return;

    const selectedIndex = this.embla.selectedScrollSnap();
    // Only sync if the main carousel is not already at this index to avoid infinite loops
    if (this.mainCarousel.embla.selectedScrollSnap() !== selectedIndex) {
      this.mainCarousel.embla.scrollTo(selectedIndex);
    }
  }

  updateThumbnails(selectedIndex = null) {
    if (!this.hasThumbnailButtonTarget) {
      return;
    }

    // If no selectedIndex provided, get it from the appropriate carousel
    if (selectedIndex === null) {
      if (this.mainCarousel && this.mainCarousel.embla) {
        // This is a thumbnail carousel, get index from main carousel
        selectedIndex = this.mainCarousel.embla.selectedScrollSnap();
      } else if (this.embla) {
        // This is a main carousel with thumbnails
        selectedIndex = this.embla.selectedScrollSnap();
      } else {
        selectedIndex = 0;
      }
    }

    // Scroll the thumbnail carousel to show the active thumbnail
    if (this.embla && selectedIndex >= 0 && selectedIndex < this.thumbnailButtonTargets.length) {
      this.embla.scrollTo(selectedIndex);
    }

    this.thumbnailButtonTargets.forEach((button, index) => {
      if (index === selectedIndex) {
        // Active thumbnail styling
        button.classList.remove("border-neutral-200", "dark:border-neutral-700");
        button.classList.add("border-neutral-600", "dark:border-neutral-200");

        // Update hover colors for active state
        button.classList.remove("hover:border-neutral-400", "dark:hover:border-neutral-500");
        button.classList.add("hover:border-neutral-700", "dark:hover:border-neutral-300");
      } else {
        // Inactive thumbnail styling
        button.classList.remove("border-neutral-600", "hover:border-neutral-700", "dark:hover:border-neutral-300");
        button.classList.add("border-neutral-200", "dark:border-neutral-700");

        // Reset hover colors for inactive state
        button.classList.add("hover:border-neutral-400", "dark:hover:border-neutral-500");
      }
    });
  }

  // --- Previous/Next Buttons ---
  setupButtons() {
    // Guard clauses moved to connect, but keep checks for target presence
    if (this.hasPrevButtonTarget) {
      this.prevButtonTarget.addEventListener("click", this.scrollPrev.bind(this), false);
      this.prevButtonTarget.addEventListener("keydown", this.boundHandleKeydown);
    } else if (this.buttonsValue) {
      console.warn("Embla Carousel: 'buttonsValue' is true, but 'prevButtonTarget' is missing.");
    }

    if (this.hasNextButtonTarget) {
      this.nextButtonTarget.addEventListener("click", this.scrollNext.bind(this), false);
      this.nextButtonTarget.addEventListener("keydown", this.boundHandleKeydown);
    } else if (this.buttonsValue) {
      console.warn("Embla Carousel: 'buttonsValue' is true, but 'nextButtonTarget' is missing.");
    }
    this.updateButtonStates();
  }

  scrollPrev() {
    if (!this.embla) return;
    this.embla.scrollPrev();
    // Transfer focus to viewport for immediate keyboard navigation
    this.viewportTarget.focus();
  }

  scrollNext() {
    if (!this.embla) return;
    this.embla.scrollNext();
    // Transfer focus to viewport for immediate keyboard navigation
    this.viewportTarget.focus();
  }

  updateButtonStates() {
    if (!this.embla || !this.buttonsValue) return; // Only run if buttons are enabled

    const activeElement = document.activeElement;
    let elementToFocus = null;

    const canGoPrev = this.embla.canScrollPrev();
    const canGoNext = this.embla.canScrollNext();

    if (this.hasPrevButtonTarget) {
      const willBeDisabled = !canGoPrev;
      if (willBeDisabled && activeElement === this.prevButtonTarget) {
        if (this.hasNextButtonTarget && canGoNext) {
          elementToFocus = this.nextButtonTarget;
        } else {
          elementToFocus = this.viewportTarget;
        }
      }
      this.prevButtonTarget.disabled = willBeDisabled;
    }

    if (this.hasNextButtonTarget) {
      const willBeDisabled = !canGoNext;
      if (willBeDisabled && activeElement === this.nextButtonTarget) {
        if (this.hasPrevButtonTarget && canGoPrev) {
          if (elementToFocus !== this.viewportTarget || activeElement !== this.prevButtonTarget) {
            elementToFocus = this.prevButtonTarget;
          }
        } else if (!elementToFocus) {
          elementToFocus = this.viewportTarget;
        }
      }
      this.nextButtonTarget.disabled = willBeDisabled;
    }

    if (elementToFocus && typeof elementToFocus.focus === "function") {
      elementToFocus.focus();
    }
  }

  // --- Dot Navigation ---
  setupDots() {
    // Guard clause moved to connect, but keep checks for target presence
    if (!this.hasDotsContainerTarget && this.dotsValue) {
      console.warn("Embla Carousel: 'dotsValue' is true, but 'dotsContainerTarget' is missing.");
      return;
    }
    if (this.hasDotsContainerTarget) {
      this.generateDots();
      this.updateDots();
    }
  }

  generateDots() {
    if (!this.embla || !this.hasDotsContainerTarget) return;
    this.dotsContainerTarget.innerHTML = "";
    this.embla.scrollSnapList().forEach((_, index) => {
      const button = document.createElement("button");
      button.classList.add(
        "appearance-none",
        "bg-transparent",
        "touch-manipulation",
        "inline-flex",
        "no-underline",
        "border-0",
        "p-0",
        "m-0",
        "size-4",
        "items-center",
        "justify-center",
        "rounded-full",
        "outline-hidden",
        "bg-white",
        "dark:bg-neutral-800",
        "focus-visible:outline-offset-1.5",
        "focus-visible:outline-neutral-500",
        "dark:focus-visible:outline-neutral-200",
        "hover:bg-neutral-100",
        "dark:hover:bg-neutral-700/75",
      );
      const dot = document.createElement("div");
      dot.classList.add(
        "w-4",
        "h-4",
        "rounded-full",
        "shadow-[inset_0_0_0_0.15rem_#ccc]",
        "dark:shadow-[inset_0_0_0_0.15rem_#fff]",
      );
      button.appendChild(dot);
      button.type = "button";
      button.setAttribute("aria-label", `Go to slide ${index + 1}`);
      button.addEventListener("click", () => this.onDotButtonClick(index));
      button.addEventListener("keydown", this.boundHandleKeydown);
      this.dotsContainerTarget.appendChild(button);
    });
  }

  updateDots() {
    if (!this.embla || !this.dotsValue || !this.hasDotsContainerTarget) return; // Only run if dots are enabled and target exists

    const activeElement = document.activeElement;
    const selectedIndex = this.embla.selectedScrollSnap();
    let newlySelectedDotButton = null;

    let aDotHadFocus = false;
    if (activeElement && this.dotsContainerTarget.contains(activeElement)) {
      aDotHadFocus = Array.from(this.dotsContainerTarget.children).includes(activeElement);
    }

    Array.from(this.dotsContainerTarget.children).forEach((dotButton, index) => {
      const dot = dotButton.firstChild;
      if (index === selectedIndex) {
        dot.classList.remove("shadow-[inset_0_0_0_0.15rem_#ccc]", "dark:shadow-[inset_0_0_0_0.15rem_#404040]");
        dot.classList.add("shadow-[inset_0_0_0_0.15rem_#333]", "dark:shadow-[inset_0_0_0_0.15rem_#fff]");
        dotButton.setAttribute("aria-label", `Slide ${index + 1} (current)`);
        dotButton.setAttribute("aria-current", "true");
        if (aDotHadFocus) {
          newlySelectedDotButton = dotButton;
        }
      } else {
        dot.classList.remove("shadow-[inset_0_0_0_0.15rem_#333]", "dark:shadow-[inset_0_0_0_0.15rem_#fff]");
        dot.classList.add("shadow-[inset_0_0_0_0.15rem_#ccc]", "dark:shadow-[inset_0_0_0_0.15rem_#404040]");
        dotButton.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dotButton.removeAttribute("aria-current");
      }
    });

    if (
      newlySelectedDotButton &&
      newlySelectedDotButton !== activeElement &&
      typeof newlySelectedDotButton.focus === "function"
    ) {
      newlySelectedDotButton.focus();
    }
  }

  onDotButtonClick(index) {
    if (!this.embla) return;
    this.embla.scrollTo(index);
    // Transfer focus to viewport for immediate keyboard navigation
    this.viewportTarget.focus();
  }

  // --- Combined Controls Update ---
  updateControls = () => {
    const selectedIndex = this.embla ? this.embla.selectedScrollSnap() : 0;

    if (this.buttonsValue) {
      this.updateButtonStates();
    }
    if (this.dotsValue) {
      this.updateDots();
    }

    // Update thumbnails for this carousel (if it has them)
    if (this.hasThumbnailButtonTarget) {
      this.updateThumbnails(selectedIndex);
    }

    // Sync with connected thumbnail carousel
    if (this.thumbnailCarousel && this.thumbnailCarousel.updateThumbnails) {
      this.thumbnailCarousel.updateThumbnails(selectedIndex);
    }
  };

  // --- Keyboard Navigation ---
  setupKeyboardNavigation() {
    // Make the viewport explicitly focusable and add visual focus styles
    this.viewportTarget.setAttribute("tabindex", "0");
    this.viewportTarget.setAttribute("role", "region");
    this.viewportTarget.setAttribute("aria-label", "Carousel");

    // Add focus styles for better Safari compatibility
    this.viewportTarget.style.outline = "none";

    // Set up keyboard event listeners with proper options for Safari
    this.viewportTarget.addEventListener("keydown", this.boundHandleKeydown, { passive: false });

    // Add click listener to ensure viewport can receive focus in Safari
    this.viewportTarget.addEventListener("click", (event) => {
      if (event.target === this.viewportTarget) {
        this.viewportTarget.focus();
      }
    });

    // Safari-specific: Ensure the element can receive focus
    if (navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")) {
      // Force focus capability in Safari
      this.viewportTarget.style.webkitUserSelect = "none";
      this.viewportTarget.style.userSelect = "none";
    }
  }

  teardownKeyboardNavigation() {
    this.viewportTarget.removeEventListener("keydown", this.boundHandleKeydown);
    if (this.buttonsValue) {
      if (this.hasPrevButtonTarget) {
        this.prevButtonTarget.removeEventListener("keydown", this.boundHandleKeydown);
      }
      if (this.hasNextButtonTarget) {
        this.nextButtonTarget.removeEventListener("keydown", this.boundHandleKeydown);
      }
    }
    if (this.dotsValue && this.hasDotsContainerTarget) {
      Array.from(this.dotsContainerTarget.children).forEach((dotButton) => {
        dotButton.removeEventListener("keydown", this.boundHandleKeydown);
      });
    }
    if (this.thumbnailsValue && this.hasThumbnailButtonTarget) {
      this.thumbnailButtonTargets.forEach((button) => {
        button.removeEventListener("keydown", this.boundHandleKeydown);
      });
    }
  }

  handleKeydown(event) {
    if (!this.embla) return;

    // Enhanced Safari compatibility: Check for both event.key and event.keyCode
    const key = event.key || event.keyCode;
    const isVertical = this.axisValue === "y";
    const fromThumbnailButton = this.isThumbnailButtonEvent(event);

    // Determine which carousel should handle the navigation
    const targetCarousel = this.getNavigationTarget();

    switch (key) {
      case "ArrowLeft":
      case 37: // Left arrow keyCode for older Safari versions
        if (isVertical) break;
        event.preventDefault();
        event.stopPropagation();
        targetCarousel.scrollPrev();
        this.focusViewportAfterThumbnailNavigation(fromThumbnailButton);
        break;
      case "ArrowRight":
      case 39: // Right arrow keyCode for older Safari versions
        if (isVertical) break;
        event.preventDefault();
        event.stopPropagation();
        targetCarousel.scrollNext();
        this.focusViewportAfterThumbnailNavigation(fromThumbnailButton);
        break;
      case "ArrowUp":
      case 38: // Up arrow keyCode for older Safari versions
        if (!isVertical) break;
        event.preventDefault();
        event.stopPropagation();
        targetCarousel.scrollPrev();
        this.focusViewportAfterThumbnailNavigation(fromThumbnailButton);
        break;
      case "ArrowDown":
      case 40: // Down arrow keyCode for older Safari versions
        if (!isVertical) break;
        event.preventDefault();
        event.stopPropagation();
        targetCarousel.scrollNext();
        this.focusViewportAfterThumbnailNavigation(fromThumbnailButton);
        break;
      case "Home":
      case 36:
        event.preventDefault();
        event.stopPropagation();
        targetCarousel.scrollTo(0);
        this.focusViewportAfterThumbnailNavigation(fromThumbnailButton);
        break;
      case "End":
      case 35:
        event.preventDefault();
        event.stopPropagation();
        targetCarousel.scrollTo(targetCarousel.scrollSnapList().length - 1);
        this.focusViewportAfterThumbnailNavigation(fromThumbnailButton);
        break;
    }
  }

  getNavigationTarget() {
    // If this is a thumbnail carousel, navigation should control the main carousel
    if (this.mainCarousel && this.mainCarousel.embla) {
      return this.mainCarousel.embla;
    }
    // Otherwise, control this carousel
    return this.embla;
  }

  isThumbnailButtonEvent(event) {
    return (
      this.thumbnailsValue && this.hasThumbnailButtonTarget && this.thumbnailButtonTargets.includes(event.currentTarget)
    );
  }

  focusViewportAfterThumbnailNavigation(fromThumbnailButton) {
    if (!fromThumbnailButton) return;

    if (this.mainCarousel && this.mainCarousel.viewportTarget) {
      this.mainCarousel.viewportTarget.focus();
    } else if (this.viewportTarget) {
      this.viewportTarget.focus();
    }
  }
}
