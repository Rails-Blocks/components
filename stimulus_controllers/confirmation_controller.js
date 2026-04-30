import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "confirmButton", "checkbox"];
  static values = {
    confirmText: { type: String, default: "" },
    caseSensitive: { type: Boolean, default: false },
  };

  connect() {
    this.confirmed = false;
    this.confirmTextArray = this.parseConfirmText();
    this.updateConfirmButton();

    // Add form submission prevention
    const form = this.element.closest("form");
    if (form) {
      this.boundHandleSubmit = this.handleSubmit.bind(this);
      form.addEventListener("submit", this.boundHandleSubmit);
    }

    // Add input listeners
    if (this.hasInputTarget) {
      this.inputTarget.addEventListener("input", () => this.checkConfirmation());
      this.inputTarget.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          if (this.confirmed) {
            event.preventDefault();
            this.confirm();
          } else {
            // Prevent form submission when confirmation is not valid
            event.preventDefault();
          }
        }
      });
    }

    // Add checkbox listeners
    if (this.hasCheckboxTarget) {
      this.checkboxTargets.forEach((checkbox) => {
        checkbox.addEventListener("change", () => this.checkConfirmation());
      });
    }
  }

  disconnect() {
    // Remove form submission listener
    const form = this.element.closest("form");
    if (form && this.boundHandleSubmit) {
      form.removeEventListener("submit", this.boundHandleSubmit);
    }

    if (this.hasInputTarget) {
      this.inputTarget.removeEventListener("input", () => this.checkConfirmation());
    }

    if (this.hasCheckboxTarget) {
      this.checkboxTargets.forEach((checkbox) => {
        checkbox.removeEventListener("change", () => this.checkConfirmation());
      });
    }
  }

  parseConfirmText() {
    if (!this.confirmTextValue) return [];

    // Simple comma-separated approach for arrays
    if (this.confirmTextValue.includes(",")) {
      return this.confirmTextValue
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }

    return [this.confirmTextValue];
  }

  checkConfirmation() {
    // Check text confirmation
    let textConfirmed = false;
    if (this.hasInputTarget && this.confirmTextArray.length > 0) {
      const inputValue = this.caseSensitiveValue ? this.inputTarget.value : this.inputTarget.value.toLowerCase();

      if (this.confirmTextArray.length === 1) {
        const confirmValue = this.caseSensitiveValue
          ? this.confirmTextArray[0]
          : this.confirmTextArray[0].toLowerCase();
        textConfirmed = inputValue === confirmValue;
      } else {
        textConfirmed = this.confirmTextArray.some((text) => {
          const confirmValue = this.caseSensitiveValue ? text : text.toLowerCase();
          return inputValue === confirmValue;
        });
      }
    } else {
      textConfirmed = this.hasInputTarget ? this.inputTarget.value.trim().length > 0 : true;
    }

    // Check checkbox confirmation
    let checkboxConfirmed = true;
    if (this.hasCheckboxTarget && this.checkboxTargets.length > 0) {
      checkboxConfirmed = this.checkboxTargets.every((checkbox) => checkbox.checked);
    }

    this.confirmed = textConfirmed && checkboxConfirmed;
    this.updateConfirmButton();
  }

  updateConfirmButton() {
    if (this.hasConfirmButtonTarget) {
      this.confirmButtonTarget.disabled = !this.confirmed;

      if (this.confirmed) {
        this.confirmButtonTarget.classList.remove("opacity-50", "cursor-not-allowed");
      } else {
        this.confirmButtonTarget.classList.add("opacity-50", "cursor-not-allowed");
      }
    }
  }

  confirm() {
    if (!this.confirmed) return false;

    const beforeConfirmEvent = new CustomEvent("confirmation:before", {
      detail: {
        value: this.getConfirmationValue(),
        controller: this,
      },
      cancelable: true,
    });

    if (!this.element.dispatchEvent(beforeConfirmEvent)) {
      return false;
    }

    this.performConfirmation();

    this.element.dispatchEvent(
      new CustomEvent("confirmation:confirmed", {
        detail: {
          value: this.getConfirmationValue(),
          controller: this,
        },
      })
    );

    return true;
  }

  handleSubmit(event) {
    // Only allow form submission if confirmation is valid
    if (!this.confirmed) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }

  cancel() {
    this.reset();
    this.element.dispatchEvent(
      new CustomEvent("confirmation:cancelled", {
        detail: { controller: this },
      })
    );
  }

  reset() {
    this.confirmed = false;

    if (this.hasInputTarget) {
      this.inputTarget.value = "";
    }

    if (this.hasCheckboxTarget) {
      this.checkboxTargets.forEach((checkbox) => {
        checkbox.checked = false;
      });
    }

    this.updateConfirmButton();
  }

  performConfirmation() {
    const form = this.element.closest("form");
    if (form) {
      form.submit();
    }
  }

  getConfirmationValue() {
    const textValue = this.hasInputTarget ? this.inputTarget.value : "";
    const checkboxValues = this.hasCheckboxTarget
      ? this.checkboxTargets.map((checkbox) => ({
          id: checkbox.id,
          checked: checkbox.checked,
        }))
      : [];

    return {
      text: textValue,
      checkboxes: checkboxValues,
    };
  }
}
