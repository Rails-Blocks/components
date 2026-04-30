import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="sidebar"
export default class extends Controller {
  static targets = [
    "desktopSidebar",
    "mobileSidebar",
    "contentTemplate",
    "sharedContent",
    "desktopContent",
    "mobileBackdrop",
    "mobilePanel",
  ];
  static values = {
    storageKey: { type: String, default: "sidebarOpen" },
  };

  connect() {
    // Bind the handler once so we can properly remove it later
    this.boundHandleToggle = this.handleToggle.bind(this);

    // Clone the sidebar content for both mobile and desktop
    if (this.hasContentTemplateTarget) {
      // Clone content for desktop (only if not already cloned)
      // Check if nav element exists (the actual cloned content)
      if (this.hasDesktopContentTarget && !this.desktopContentTarget.querySelector("nav")) {
        const desktopClone = this.contentTemplateTarget.content.cloneNode(true);
        this.desktopContentTarget.appendChild(desktopClone);
      }

      // Clone content for mobile (only if not already cloned)
      if (this.hasSharedContentTarget && !this.sharedContentTarget.querySelector("nav")) {
        const mobileClone = this.contentTemplateTarget.content.cloneNode(true);
        this.sharedContentTarget.appendChild(mobileClone);

        // Update the close button in mobile view to show X icon and have mobile close action
        const mobileNav = this.sharedContentTarget.querySelector("nav");
        if (mobileNav) {
          const closeButton = mobileNav.querySelector('[data-action*="sidebar#close"]');
          if (closeButton) {
            closeButton.setAttribute("data-action", "click->sidebar#closeMobile");
            closeButton.classList.remove("cursor-w-resize");
            closeButton.setAttribute("aria-label", "Close sidebar");

            // Replace the collapse icon with an X icon
            const svg = closeButton.querySelector("svg");
            if (svg) {
              svg.innerHTML =
                '<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><line x1="13.25" y1="4.75" x2="4.75" y2="13.25"></line><line x1="13.25" y1="13.25" x2="4.75" y2="4.75"></line></g>';
            }
          }
        }
      }
    }

    if (this.hasDesktopSidebarTarget) {
      // Temporarily disable transitions to prevent animation on page load
      this.desktopSidebarTarget.style.transition = "none";

      // Restore the saved state from localStorage, default to open if no saved state
      const savedState = localStorage.getItem(this.storageKeyValue);

      if (savedState !== null) {
        this.desktopSidebarTarget.open = savedState === "true";
      } else {
        // Default to open for first-time visitors
        this.desktopSidebarTarget.open = true;
      }

      // Re-enable transitions after a brief delay
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.desktopSidebarTarget.style.transition = "";
        });
      });

      // Listen for toggle events to save the state
      this.desktopSidebarTarget.addEventListener("toggle", this.boundHandleToggle);
    }
  }

  disconnect() {
    if (this.hasDesktopSidebarTarget && this.boundHandleToggle) {
      this.desktopSidebarTarget.removeEventListener("toggle", this.boundHandleToggle);
    }
  }

  handleToggle(event) {
    // Save the current state to localStorage
    localStorage.setItem(this.storageKeyValue, this.desktopSidebarTarget.open.toString());
  }

  open() {
    if (this.hasDesktopSidebarTarget) {
      this.desktopSidebarTarget.open = true;
    }
  }

  close() {
    if (this.hasDesktopSidebarTarget) {
      this.desktopSidebarTarget.open = false;
    }
  }

  toggle() {
    if (this.hasDesktopSidebarTarget) {
      this.desktopSidebarTarget.open = !this.desktopSidebarTarget.open;
    }
  }

  openMobile() {
    if (this.hasMobileSidebarTarget) {
      // Set initial hidden states
      if (this.hasMobileBackdropTarget) {
        this.mobileBackdropTarget.style.opacity = "0";
      }
      if (this.hasMobilePanelTarget) {
        this.mobilePanelTarget.style.transform = "translateX(-100%)";
      }

      // Remove hidden class
      this.mobileSidebarTarget.classList.remove("hidden");

      // Trigger transition on next frame
      requestAnimationFrame(() => {
        if (this.hasMobileBackdropTarget) {
          this.mobileBackdropTarget.style.opacity = "1";
        }
        if (this.hasMobilePanelTarget) {
          this.mobilePanelTarget.style.transform = "translateX(0)";
        }
      });
    }
  }

  closeMobile() {
    if (this.hasMobileSidebarTarget) {
      // Trigger closing transition
      if (this.hasMobileBackdropTarget) {
        this.mobileBackdropTarget.style.opacity = "0";
      }
      if (this.hasMobilePanelTarget) {
        this.mobilePanelTarget.style.transform = "translateX(-100%)";
      }

      // Wait for transition to complete before hiding
      setTimeout(() => {
        if (this.hasMobileSidebarTarget) {
          this.mobileSidebarTarget.classList.add("hidden");
        }
      }, 300); // Match the transition duration
    }
  }
}
