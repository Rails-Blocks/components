import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "input",
    "toggleIcon",
    "strengthBar",
    "strengthText",
    "lengthCheck",
    "lowercaseCheck",
    "uppercaseCheck",
    "numberCheck",
    "confirm",
    "confirmToggleIcon",
    "matchIndicator",
    "matchText",
  ];

  static values = {
    strength: { type: Boolean, default: false },
    requirements: { type: Boolean, default: false },
    confirm: { type: Boolean, default: false },
    confirmDelay: { type: Number, default: 300 },
  };

  connect() {
    this.isVisible = false;
    this.confirmVisible = false;

    if (this.hasInputTarget) {
      if (this.strengthValue) {
        this.checkStrength();
      }
      if (this.requirementsValue) {
        this.checkRequirements();
      }
    }
  }

  disconnect() {
    // Clear any pending timeout when the controller is disconnected
    if (this.confirmValue) {
      clearTimeout(this.checkTimeout);
    }
  }

  toggle() {
    this.isVisible = !this.isVisible;

    if (this.isVisible) {
      this.inputTarget.type = "text";
      this.updateIcon(this.toggleIconTarget, true);
    } else {
      this.inputTarget.type = "password";
      this.updateIcon(this.toggleIconTarget, false);
    }
  }

  toggleConfirm() {
    if (!this.confirmValue) return;

    this.confirmVisible = !this.confirmVisible;

    if (this.confirmVisible) {
      this.confirmTarget.type = "text";
      this.updateIcon(this.confirmToggleIconTarget, true);
    } else {
      this.confirmTarget.type = "password";
      this.updateIcon(this.confirmToggleIconTarget, false);
    }
  }

  // Called on input event
  handleInput() {
    if (this.strengthValue) {
      this.checkStrength();
    }
    if (this.requirementsValue) {
      this.checkRequirements();
    }
    if (this.confirmValue && this.hasConfirmTarget && this.confirmTarget.value) {
      this.checkMatch();
    }
  }

  // Strength checking functionality
  checkStrength() {
    const password = this.inputTarget.value;
    let strength = 0;
    const feedback = [];

    // Length check
    if (password.length >= 8) {
      strength += 25;
    } else if (password.length > 0) {
      feedback.push("At least 8 characters");
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      strength += 25;
    } else if (password.length > 0) {
      feedback.push("Include lowercase letter");
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      strength += 25;
    } else if (password.length > 0) {
      feedback.push("Include uppercase letter");
    }

    // Number or special character check
    if (/[0-9!@#$%^&*]/.test(password)) {
      strength += 25;
    } else if (password.length > 0) {
      feedback.push("Include number or special character");
    }

    this.updateStrengthIndicator(strength);
  }

  updateStrengthIndicator(strength) {
    if (!this.hasStrengthBarTarget) return;

    // Update bar width and color
    this.strengthBarTarget.style.width = `${strength}%`;

    // Update color classes
    this.strengthBarTarget.classList.remove(
      "bg-red-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "dark:bg-red-400",
      "dark:bg-yellow-400",
      "dark:bg-lime-400",
      "dark:bg-green-400",
      "bg-neutral-300",
      "dark:bg-neutral-600"
    );

    if (strength === 0) {
      this.strengthBarTarget.classList.add("bg-neutral-300", "dark:bg-neutral-600");
    } else if (strength <= 25) {
      this.strengthBarTarget.classList.add("bg-red-500", "dark:bg-red-400");
    } else if (strength <= 50) {
      this.strengthBarTarget.classList.add("bg-yellow-500", "dark:bg-yellow-400");
    } else if (strength < 100) {
      this.strengthBarTarget.classList.add("bg-lime-500", "dark:bg-lime-400");
    } else {
      this.strengthBarTarget.classList.add("bg-green-500", "dark:bg-green-400");
    }

    // Update text
    if (this.hasStrengthTextTarget) {
      if (strength === 0) {
        this.strengthTextTarget.textContent = "";
        this.strengthTextTarget.classList.add("hidden");
      } else {
        this.strengthTextTarget.classList.remove("hidden");

        // Remove all text color classes
        this.strengthTextTarget.classList.remove(
          "text-red-600",
          "text-yellow-600",
          "text-lime-600",
          "text-green-600",
          "dark:text-red-400",
          "dark:text-yellow-400",
          "dark:text-lime-400",
          "dark:text-green-400"
        );

        // Update text content and color classes
        if (strength <= 25) {
          this.strengthTextTarget.textContent = "Weak";
          this.strengthTextTarget.classList.add("text-red-600", "dark:text-red-400");
        } else if (strength <= 50) {
          this.strengthTextTarget.textContent = "Fair";
          this.strengthTextTarget.classList.add("text-yellow-600", "dark:text-yellow-400");
        } else if (strength < 100) {
          this.strengthTextTarget.textContent = "Good";
          this.strengthTextTarget.classList.add("text-lime-600", "dark:text-lime-400");
        } else {
          this.strengthTextTarget.textContent = "Strong";
          this.strengthTextTarget.classList.add("text-green-600", "dark:text-green-400");
        }
      }
    }
  }

  // Requirements checking functionality
  checkRequirements() {
    const password = this.inputTarget.value;

    // Check length
    this.updateRequirement(this.lengthCheckTarget, password.length >= 8);

    // Check lowercase
    this.updateRequirement(this.lowercaseCheckTarget, /[a-z]/.test(password));

    // Check uppercase
    this.updateRequirement(this.uppercaseCheckTarget, /[A-Z]/.test(password));

    // Check number or special character
    this.updateRequirement(this.numberCheckTarget, /[0-9!@#$%^&*]/.test(password));
  }

  updateRequirement(target, met) {
    if (!target) return;

    const icons = target.querySelectorAll("svg");
    const uncheckedIcon = icons[0]; // First SVG is the unchecked circle
    const checkedIcon = icons[1]; // Second SVG is the checked circle
    const text = target.querySelector("span");

    if (met) {
      // Requirement is met - show checked icon
      target.classList.remove("text-neutral-500", "dark:text-neutral-400");
      target.classList.add("text-green-600", "dark:text-green-500");

      // Toggle icons
      if (uncheckedIcon) uncheckedIcon.classList.add("hidden");
      if (checkedIcon) checkedIcon.classList.remove("hidden");

      if (text) text.classList.add("line-through");
    } else {
      // Requirement is not met - show unchecked icon
      target.classList.remove("text-green-600", "dark:text-green-500");
      target.classList.add("text-neutral-500", "dark:text-neutral-400");

      // Toggle icons
      if (uncheckedIcon) uncheckedIcon.classList.remove("hidden");
      if (checkedIcon) checkedIcon.classList.add("hidden");

      if (text) text.classList.remove("line-through");
    }
  }

  // Confirmation matching functionality
  checkMatch() {
    // Clear any existing timeout
    clearTimeout(this.checkTimeout);

    // Set a new timeout to check after the delay
    this.checkTimeout = setTimeout(() => {
      this.performCheck();
    }, this.confirmDelayValue);
  }

  performCheck() {
    const password = this.inputTarget.value;
    const confirm = this.confirmTarget.value;

    if (!confirm) {
      this.hideMatchIndicator();
      return;
    }

    if (password === confirm) {
      this.showMatch();
    } else {
      this.showMismatch();
    }
  }

  showMatch() {
    if (this.hasMatchIndicatorTarget) {
      this.matchIndicatorTarget.classList.remove("hidden", "text-red-600", "dark:text-red-400");
      this.matchIndicatorTarget.classList.add("text-green-600", "dark:text-green-400");

      // Update icon to checkmark
      const iconElement = this.matchIndicatorTarget.querySelector("svg");
      if (iconElement) {
        iconElement.innerHTML = `
          <g fill="currentColor">
            <path d="M5.25,11.75h-.002c-.177,0-.344-.081-.454-.219L1.794,7.531c-.202-.252-.161-.62,.092-.821,.253-.202,.621-.161,.821,.092l2.544,3.18L10.411,2.549c.204-.251,.571-.29,.822-.086,.251,.204,.29,.572,.086,.822l-5.611,8.246c-.111,.138-.278,.219-.458,.219Z" fill="currentColor"></path>
          </g>
        `;
      }
    }

    if (this.hasMatchTextTarget) {
      this.matchTextTarget.textContent = "Passwords match";
    }

    // Update confirm input border
    this.confirmTarget.classList.remove("input-error");
    this.confirmTarget.classList.add("input-success");
  }

  showMismatch() {
    if (this.hasMatchIndicatorTarget) {
      this.matchIndicatorTarget.classList.remove("hidden", "text-green-600", "dark:text-green-400");
      this.matchIndicatorTarget.classList.add("text-red-600", "dark:text-red-400");

      // Update icon to X mark
      const iconElement = this.matchIndicatorTarget.querySelector("svg");
      if (iconElement) {
        iconElement.innerHTML = `
          <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
            <path d="M10 4L4 10M4 4l6 6"></path>
          </g>
        `;
      }
    }

    if (this.hasMatchTextTarget) {
      this.matchTextTarget.textContent = "Passwords do not match";
    }

    // Update confirm input border
    this.confirmTarget.classList.remove("input-success");
    this.confirmTarget.classList.add("input-error");
  }

  hideMatchIndicator() {
    if (this.hasMatchIndicatorTarget) {
      this.matchIndicatorTarget.classList.add("hidden");
    }

    // Reset confirm input border
    if (this.hasConfirmTarget) {
      this.confirmTarget.classList.remove("input-success", "input-error");
    }
  }

  // Shared icon update functionality
  updateIcon(target, visible) {
    if (!target) return;

    if (visible) {
      // Show eye-off icon when password is visible
      target.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" width="18" height="18" viewBox="0 0 18 18"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M4.8077 13.1923C3.4687 12.267 2.56488 11.0325 2.04418 10.1133C1.65178 9.42061 1.65178 8.57951 2.04418 7.88681C2.99118 6.21511 5.2055 3.50009 8.9999 3.50009C10.708 3.50009 12.0959 4.0503 13.1921 4.8078"></path> <path d="M15.327 6.9151C15.578 7.2579 15.7869 7.58889 15.9556 7.88669C16.348 8.57939 16.348 9.42049 15.9556 10.1132C15.0086 11.7849 12.7943 14.4999 8.99994 14.4999C8.59234 14.4999 8.20304 14.4686 7.83154 14.4106"></path> <path d="M7.05551 10.9446C6.55781 10.4469 6.25 9.7594 6.25 9C6.25 7.4812 7.4812 6.25 9 6.25C9.7594 6.25 10.4469 6.55779 10.9445 7.05539"></path> <path d="M2 16L16 2"></path></g></svg>
      `;
    } else {
      // Show eye icon when password is hidden
      target.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" width="18" height="18" viewBox="0 0 18 18"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M9 11.75C10.5188 11.75 11.75 10.5188 11.75 9C11.75 7.48122 10.5188 6.25 9 6.25C7.48122 6.25 6.25 7.48122 6.25 9C6.25 10.5188 7.48122 11.75 9 11.75Z"></path> <path d="M15.9557 7.88669C16.3481 8.57939 16.3481 9.42049 15.9557 10.1132C15.0087 11.7849 12.7944 14.4999 9 14.4999C5.2056 14.4999 2.9912 11.7849 2.0443 10.1132C1.6519 9.42049 1.6519 8.57939 2.0443 7.88669C2.9913 6.21499 5.2056 3.5 9 3.5C12.7944 3.5 15.0088 6.21499 15.9557 7.88669Z"></path></g></svg>
      `;
    }
  }
}
