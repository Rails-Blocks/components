import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["icon", "content"];
  static values = {
    animate: { type: Boolean, default: true }, // Whether to animate the tree view
  };

  connect() {
    // Initialize any folders that should start open
    this.element.querySelectorAll('[data-state="open"]').forEach((el) => {
      const button = el.previousElementSibling;
      if (button) {
        const icon = button.querySelector('[data-tree-view-target="icon"]');
        if (icon) {
          icon.classList.add("folder-open");
          icon.innerHTML = this.openFolderSvg;
        }
      }
    });

    // Initialize closed folders with hidden attribute
    this.element.querySelectorAll('[data-tree-view-target="content"][data-state="closed"]').forEach((el) => {
      el.setAttribute("hidden", "");
    });

    this.addKeyboardListeners();
  }

  disconnect() {
    this.element.removeEventListener("keydown", this.handleKeydownBound);
    // Clean up transition listeners
    this.contentTargets.forEach((content) => {
      content.removeEventListener("transitionend", content._onTransitionEnd);
    });
  }

  addKeyboardListeners() {
    this.handleKeydownBound = this.handleKeydown.bind(this);
    this.element.addEventListener("keydown", this.handleKeydownBound);
  }

  handleKeydown(event) {
    const triggers = Array.from(
      this.element.querySelectorAll('button[data-action="click->tree-view#toggle"], [data-tree-view-item]'),
    );
    const currentIndex = triggers.indexOf(document.activeElement);
    if (currentIndex === -1) return;

    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        let prevIndex = currentIndex;
        do {
          prevIndex = (prevIndex - 1 + triggers.length) % triggers.length;
        } while (prevIndex !== currentIndex && this.isElementHidden(triggers[prevIndex]));
        triggers[prevIndex].focus();
        break;
      case "ArrowDown":
        event.preventDefault();
        let nextIndex = currentIndex;
        do {
          nextIndex = (nextIndex + 1) % triggers.length;
        } while (nextIndex !== currentIndex && this.isElementHidden(triggers[nextIndex]));
        triggers[nextIndex].focus();
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        triggers[currentIndex].click();
        break;
    }
  }

  isElementHidden(element) {
    let current = element;
    while (current && current !== this.element) {
      // Check if inside a closed tree content (grid-rows-[0fr])
      const content = current.closest('[data-tree-view-target="content"]');
      if (content && content.getAttribute("data-state") === "closed") {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  toggle(event) {
    const button = event.currentTarget;
    const contentId = button.getAttribute("aria-controls");
    if (!contentId) return;

    // Use getElementById instead of querySelector to support ids that may begin with digits.
    const content = document.getElementById(contentId);
    if (!content || !this.element.contains(content)) return;

    const icon = button.querySelector('[data-tree-view-target="icon"]');

    const isOpen = button.getAttribute("aria-expanded") === "true";

    // Toggle aria attributes
    button.setAttribute("aria-expanded", !isOpen);

    if (isOpen) {
      // Closing: set state first, then hide after transition
      content.setAttribute("data-state", "closed");

      // Remove any existing listener
      if (content._onTransitionEnd) {
        content.removeEventListener("transitionend", content._onTransitionEnd);
      }

      // Add hidden after transition completes
      content._onTransitionEnd = (e) => {
        if (e.propertyName === "grid-template-rows" && content.getAttribute("data-state") === "closed") {
          content.setAttribute("hidden", "");
        }
        content.removeEventListener("transitionend", content._onTransitionEnd);
      };
      content.addEventListener("transitionend", content._onTransitionEnd);
    } else {
      // Opening: remove hidden first, then change state
      content.removeAttribute("hidden");
      // Force reflow to ensure hidden is removed before animation starts
      content.offsetHeight;
      content.setAttribute("data-state", "open");
    }

    // Update icons
    if (icon) {
      if (isOpen) {
        icon.classList.remove("folder-open");
        icon.innerHTML = this.closedFolderSvg;
      } else {
        icon.classList.add("folder-open");
        icon.innerHTML = this.openFolderSvg;
      }
    }

    // Update button state
    button.setAttribute("data-state", isOpen ? "closed" : "open");
  }

  // Toggle the checkbox associated with a file item
  selectFile(event) {
    const button = event.currentTarget;
    const checkbox = button.previousElementSibling;
    if (checkbox && checkbox.type === "checkbox" && !checkbox.disabled) {
      checkbox.click();
    }
  }

  get openFolderSvg() {
    return `<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
      <path d="M5,14.75h-.75c-1.105,0-2-.895-2-2V4.75c0-1.105,.895-2,2-2h1.825c.587,0,1.144,.258,1.524,.705l1.524,1.795h4.626c1.105,0,2,.895,2,2v1"></path>
      <path d="M16.148,13.27l.843-3.13c.257-.953-.461-1.89-1.448-1.89H6.15c-.678,0-1.272,.455-1.448,1.11l-.942,3.5c-.257,.953,.461,1.89,1.448,1.89H14.217c.904,0,1.696-.607,1.931-1.48Z"></path>
    </g>`;
  }

  get closedFolderSvg() {
    return `<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
      <path d="M13.75,5.25c1.105,0,2,.895,2,2v5.5c0,1.105-.895,2-2,2H4.25c-1.105,0-2-.895-2-2V4.75c0-1.105,.895-2,2-2h1.825c.587,0,1.144,.258,1.524,.705l1.524,1.795h4.626Z"></path>
    </g>`;
  }
}
