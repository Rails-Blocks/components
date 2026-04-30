import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["digit", "form", "submitButton"];
  static values = {
    autoSubmit: { type: Boolean, default: false }, // Whether to automatically submit the form
    autofocus: { type: Boolean, default: true }, // Whether to autofocus the first input
    numericOnly: { type: Boolean, default: true }, // Whether to allow only digits (0-9)
  };

  connect() {
    const inputs = this._getInputTargets();

    // Set autofocus on the first input if autofocus is enabled
    if (this.autofocusValue && inputs[0]) {
      inputs[0].focus();
    }

    // Keep a stable function reference for proper listener cleanup.
    this.boundHandleFocus = this.handleFocus.bind(this);

    // Add focus event listeners to all input targets.
    inputs.forEach((input) => {
      input.addEventListener("focus", this.boundHandleFocus);
    });
  }

  disconnect() {
    // Clean up event listeners
    this._getInputTargets().forEach((input) => {
      input.removeEventListener("focus", this.boundHandleFocus);
    });
  }

  handleFocus(event) {
    const input = event.target;
    // Move cursor to end of input value
    setTimeout(() => {
      input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  }

  isNumber(value) {
    return /^[0-9]$/.test(value);
  }

  handleInput(event) {
    const currentInput = event.target;
    const nextInput = this._getNextInput(currentInput);
    const normalizedValue = this._normalizeSingleValue(currentInput.value);
    currentInput.value = normalizedValue;

    if (this._isValidCharacter(normalizedValue)) {
      if (nextInput) {
        nextInput.focus();
      } else {
        // Last input filled
        this.handleSubmit();
      }
    }
  }

  handleKeydown(event) {
    const currentInput = event.target;

    // Handle backspace navigation
    if (event.key === "Backspace" && currentInput.value === "") {
      const prevInput = this._getPreviousInput(currentInput);
      if (prevInput) {
        prevInput.focus();
      }
    }

    // Handle arrow key navigation
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const prevInput = this._getPreviousInput(currentInput);
      if (prevInput) {
        prevInput.focus();
      }
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextInput = this._getNextInput(currentInput);
      if (nextInput) {
        nextInput.focus();
      }
    }
  }

  handlePaste(event) {
    event.preventDefault();
    const paste = this._normalizePasteValue((event.clipboardData || window.clipboardData).getData("text"));
    const inputs = this._getInputTargets();

    if (!paste.length || !inputs.length) {
      return;
    }

    const characters = paste.slice(0, inputs.length).split("");
    characters.forEach((character, index) => {
      inputs[index].value = character;
    });

    if (characters.length === inputs.length) {
      this.handleSubmit();
      return;
    }

    const nextInput = inputs[characters.length];
    if (nextInput) {
      nextInput.focus();
    }
  }

  handleSubmit(event) {
    if (event) {
      // If triggered by form submit event
      event.preventDefault();
    }
    if (this.hasSubmitButtonTarget && this._isComplete()) {
      this.submitButtonTarget.focus();
    }

    // Submit form if autoSubmit is true
    if (this.autoSubmitValue) {
      if (this.hasFormTarget) {
        this.formTarget.submit();
      }
    }
  }

  _getInputTargets() {
    if (this.hasDigitTarget) {
      return this.digitTargets;
    }

    // Backward-compatible fallback for older markup using num1..numN targets.
    return Array.from(this.element.querySelectorAll('[data-two-factor-target^="num"]'));
  }

  _getNextInput(currentInput) {
    const inputs = this._getInputTargets();
    const currentIndex = inputs.indexOf(currentInput);
    if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
      return inputs[currentIndex + 1];
    }
    return null;
  }

  _getPreviousInput(currentInput) {
    const inputs = this._getInputTargets();
    const currentIndex = inputs.indexOf(currentInput);
    if (currentIndex > 0) {
      return inputs[currentIndex - 1];
    }
    return null;
  }

  _isComplete() {
    const inputs = this._getInputTargets();
    return inputs.length > 0 && inputs.every((input) => this._isValidCharacter(input.value));
  }

  _normalizeSingleValue(value) {
    const withoutWhitespace = value.replace(/\s/g, "");
    if (this.numericOnlyValue) {
      return withoutWhitespace.replace(/\D/g, "").slice(-1);
    }

    return withoutWhitespace.slice(-1);
  }

  _normalizePasteValue(value) {
    const withoutWhitespace = value.replace(/\s/g, "");
    if (this.numericOnlyValue) {
      return withoutWhitespace.replace(/\D/g, "");
    }

    return withoutWhitespace;
  }

  _isValidCharacter(value) {
    if (this.numericOnlyValue) {
      return this.isNumber(value);
    }

    return value.length === 1;
  }
}
