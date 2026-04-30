import { Controller } from "@hotwired/stimulus";
export default class extends Controller {
  static targets = ["select"];
  static values = {
    delay: { type: Number, default: 300 }, // Delay in ms before submitting
  };

  connect() {
    // Handle select elements
    this.selectTargets.forEach((select) => {
      select.addEventListener("change", () => {
        this.element.requestSubmit();
      });
    });

    // Handle input events for search fields
    this.element.querySelectorAll('input[type="search"], input[type="text"]').forEach((input) => {
      input.addEventListener("input", (e) => this.debouncedSubmit(e));
    });

    // Restore focus immediately on connect
    this.restoreFocusFromStorage();
  }

  disconnect() {
    clearTimeout(this.timeout);
  }

  // Called directly from data-action="autosubmit#submit"
  submit() {
    this.saveFocusState();
    this.element.requestSubmit();
  }

  debouncedSubmit(event) {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.saveFocusState();
      this.element.requestSubmit();
    }, this.delayValue);
  }

  saveFocusState() {
    const activeElement = document.activeElement;
    if (activeElement && this.element.contains(activeElement) && activeElement.name) {
      // Store focus data in sessionStorage so it survives controller reconnection
      const focusData = {
        inputName: activeElement.name,
        timestamp: Date.now(),
      };
      sessionStorage.setItem("autosubmit_focus_restore", JSON.stringify(focusData));
    }
  }

  restoreFocusFromStorage() {
    const stored = sessionStorage.getItem("autosubmit_focus_restore");
    if (!stored) return;

    try {
      const focusData = JSON.parse(stored);
      // Only restore if it was saved recently (within 3 seconds)
      if (Date.now() - focusData.timestamp > 3000) {
        sessionStorage.removeItem("autosubmit_focus_restore");
        return;
      }

      // Find the input by name
      const input = this.element.querySelector(`[name="${focusData.inputName}"]`);
      if (input) {
        // Clear the stored data first to prevent re-triggering
        sessionStorage.removeItem("autosubmit_focus_restore");

        // Focus immediately
        input.focus();

        // Move cursor to end of input value
        if (input.type === "text" || input.type === "search") {
          try {
            const valueLength = input.value.length;
            input.setSelectionRange(valueLength, valueLength);
          } catch (e) {
            // Some inputs don't support setSelectionRange
          }
        }
      }
    } catch (e) {
      sessionStorage.removeItem("autosubmit_focus_restore");
    }
  }
}

/**
 * Autosubmit Controller
 *
 * Automatically submits a form when inputs change, with debouncing for text inputs.
 * Maintains focus on the active input after Turbo replaces the content.
 *
 * Usage:
 *   <form data-controller="autosubmit"
 *         data-autosubmit-delay-value="300"
 *         data-turbo-frame="my-frame">
 *
 *     <select data-autosubmit-target="select">...</select>
 *     <input type="text" name="search">
 *   </form>
 */
