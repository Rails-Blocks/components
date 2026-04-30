import { Controller } from "@hotwired/stimulus";
import "emoji-mart"; // Use this if you installed emoji-mart with importmap
// import { Picker } from "emoji-mart"; // Use this if you installed emoji-mart with npm or yarn
import data from "@emoji-mart/data";

export default class extends Controller {
  static targets = ["input", "pickerContainer", "button"]; // Targets for the input field, picker container, and button
  static values = {
    autoSubmit: { type: Boolean, default: false }, // Whether to automatically submit the form when an emoji is selected
    insertMode: { type: Boolean, default: false }, // Whether to insert emoji at cursor position instead of replacing entire value
    targetSelector: { type: String, default: "" }, // CSS selector for a specific input/textarea to insert emoji into
  };

  currentTheme = null; // Store the current theme
  lastCursorPosition = { start: 0, end: 0 }; // Store cursor position
  lastFocusedField = null; // Store the last focused field

  connect() {
    // Prevent duplicate initialization
    if (this.element.dataset.emojiPickerInitialized === "true") {
      return;
    }

    // Mark as initialized
    this.element.dataset.emojiPickerInitialized = "true";

    // Use setTimeout to ensure DOM is fully rendered after Turbo navigation
    setTimeout(() => {
      this.initializePicker();
      this.setupEventListeners();
      this.findForm();
      this.setupThemeObserver();
    }, 0);
  }

  findForm() {
    // Find the closest form element
    this.form = this.element.closest("form") || this.element.querySelector("form");
  }

  setupEventListeners() {
    // Prevent duplicate event listeners
    if (this.eventListenersSetup) {
      return;
    }
    this.eventListenersSetup = true;

    // Add document click event listener to handle outside clicks
    this.outsideClickHandler = this.handleOutsideClick.bind(this);
    document.addEventListener("click", this.outsideClickHandler);

    // Add keyboard event listener for escape key and navigation
    this.keydownHandler = this.handleKeydown.bind(this);
    document.addEventListener("keydown", this.keydownHandler);

    // Add keydown listener to button for backspace/delete functionality
    if (this.hasButtonTarget) {
      this.buttonKeydownHandler = this.handleButtonKeydown.bind(this);
      this.buttonTarget.addEventListener("keydown", this.buttonKeydownHandler);
      // Make button focusable
      this.buttonTarget.setAttribute("tabindex", "0");
      // Add tooltip hint for backspace functionality only when not in insert mode
      if (!this.insertModeValue) {
        this.buttonTarget.setAttribute("title", "Press Backspace or Delete to remove emoji");
      }
    }

    // Track focus on target fields
    this.setupFieldTracking();
  }

  setupFieldTracking() {
    const targetField = this.getTargetField();
    if (targetField) {
      // Track focus events
      this.focusHandler = () => {
        this.lastFocusedField = targetField;
      };

      // Track selection changes
      this.selectionHandler = () => {
        if (targetField === document.activeElement) {
          this.lastCursorPosition = {
            start: targetField.selectionStart,
            end: targetField.selectionEnd,
          };
        }
      };

      targetField.addEventListener("focus", this.focusHandler);
      targetField.addEventListener("click", this.selectionHandler);
      targetField.addEventListener("keyup", this.selectionHandler);
      targetField.addEventListener("select", this.selectionHandler);
    }
  }

  handleButtonKeydown(event) {
    // Delete emoji if backspace or delete is pressed (only when not in insert mode)
    if ((event.key === "Backspace" || event.key === "Delete") && !this.insertModeValue) {
      event.preventDefault();
      this.clearEmoji();
    }
  }

  clearEmoji() {
    if (this.hasInputTarget) {
      // Clear the input value
      this.inputTarget.value = "";

      // Update button HTML to show default icon
      if (this.hasButtonTarget) {
        this.updateButtonToDefault();
      }

      // Submit the form to save the change only if auto-submit is enabled
      if (this.autoSubmitValue && this.form) {
        this.form.requestSubmit();
      }
    }
  }

  updateButtonToDefault() {
    // Default emoji face icon
    const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" class="size-5" width="18" height="18" viewBox="0 0 18 18"><g fill="currentColor"><path d="M9,1C4.589,1,1,4.589,1,9s3.589,8,8,8,8-3.589,8-8S13.411,1,9,1Zm-4,7c0-.552,.448-1,1-1s1,.448,1,1-.448,1-1,1-1-.448-1-1Zm4,6c-1.531,0-2.859-1.14-3.089-2.651-.034-.221,.039-.444,.193-.598,.151-.15,.358-.217,.572-.185,1.526,.24,3.106,.24,4.638,.001h0c.217-.032,.428,.036,.583,.189,.153,.153,.225,.373,.192,.589-.229,1.513-1.557,2.654-3.089,2.654Zm3-5c-.552,0-1-.448-1-1s.448-1,1-1,1,.448,1,1-.448,1-1,1Z"></path></g></svg>`;
    this.buttonTarget.innerHTML = iconHtml;
  }

  initializePicker() {
    try {
      // Check if we have the pickerContainer target
      if (!this.hasPickerContainerTarget) {
        return;
      }

      // Prevent duplicate picker initialization
      if (this.picker) {
        return;
      }

      // Detect the current theme from the document
      const isDarkMode = document.documentElement.classList.contains("dark");
      this.currentTheme = isDarkMode ? "dark" : "light";

      // Use imported emoji data instead of CDN to avoid network issues
      this.picker = new EmojiMart.Picker({
        data: data,
        onEmojiSelect: this.onEmojiSelect.bind(this),
        emojiButtonColors: "#FF9E66",
        emojiVersion: 15,
        previewPosition: "none",
        dynamicWidth: true,
        theme: this.currentTheme,
      });

      this.pickerContainerTarget.innerHTML = "";
      this.pickerContainerTarget.appendChild(this.picker);
    } catch (error) {
      console.error("Error initializing emoji picker:", error);
    }
  }

  toggle(event) {
    event.preventDefault();
    event.stopPropagation(); // Prevent this click from being caught by the document listener

    try {
      // Check if we have the pickerContainer target
      if (!this.hasPickerContainerTarget) {
        return;
      }

      // Store cursor position before opening picker (for insert mode)
      if (this.insertModeValue) {
        const targetField = this.getTargetField();
        if (targetField) {
          // If the field was never focused, don't update cursor position
          if (targetField === document.activeElement || this.lastFocusedField === targetField) {
            this.lastFocusedField = targetField;
            this.lastCursorPosition = {
              start: targetField.selectionStart || 0,
              end: targetField.selectionEnd || 0,
            };
          }
        }
      }

      this.pickerContainerTarget.classList.toggle("hidden");
    } catch (error) {
      console.error("Error toggling emoji picker:", error);
    }
  }

  handleOutsideClick(event) {
    // If picker is visible and click is outside picker and outside the toggle button
    if (
      this.hasPickerContainerTarget &&
      !this.pickerContainerTarget.classList.contains("hidden") &&
      !this.pickerContainerTarget.contains(event.target) &&
      (!this.hasButtonTarget || !this.buttonTarget.contains(event.target))
    ) {
      this.pickerContainerTarget.classList.add("hidden");
    }
  }

  handleKeydown(event) {
    // Close picker when Escape key is pressed
    if (
      event.key === "Escape" &&
      this.hasPickerContainerTarget &&
      !this.pickerContainerTarget.classList.contains("hidden")
    ) {
      this.pickerContainerTarget.classList.add("hidden");
      return;
    }

    // Focus on search input when picker is open and navigation/typing occurs
    if (
      this.hasPickerContainerTarget &&
      !this.pickerContainerTarget.classList.contains("hidden") &&
      this.shouldFocusSearch(event)
    ) {
      this.focusSearchInput();
    }
  }

  shouldFocusSearch(event) {
    // Check for arrow keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      return true;
    }

    // Check for typing (alphanumeric characters, space, etc.)
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      return true;
    }

    return false;
  }

  focusSearchInput() {
    try {
      // The emoji picker uses shadow DOM, so we need to access the search input through it
      if (this.picker && this.picker.shadowRoot) {
        const searchInput = this.picker.shadowRoot.querySelector('input[type="search"]');
        if (searchInput) {
          searchInput.focus();
        }
      }
    } catch (error) {
      console.error("Error focusing search input:", error);
    }
  }

  onEmojiSelect(emoji) {
    try {
      const targetField = this.getTargetField();

      if (!targetField && !this.hasInputTarget) {
        return;
      }

      // Insert or replace based on mode
      if (this.insertModeValue && targetField) {
        // Insert emoji at cursor position
        this.insertAtCursor(targetField, emoji.native);
      } else if (this.hasInputTarget) {
        // Replace entire value (original behavior)
        this.inputTarget.value = emoji.native;
      }

      // Update the button with the selected emoji
      if (this.hasButtonTarget && !this.insertModeValue) {
        this.buttonTarget.innerHTML = `<span class="size-6 text-xl shrink-0 flex items-center justify-center">${emoji.native}</span>`;
      }

      if (this.hasPickerContainerTarget) {
        this.pickerContainerTarget.classList.add("hidden");
      }

      // Submit the form if it exists and auto-submit is enabled
      if (this.autoSubmitValue && this.form) {
        this.form.requestSubmit();
      }
    } catch (error) {
      console.error("Error selecting emoji:", error);
    }
  }

  disconnect() {
    // Clean up initialization flag
    if (this.element) {
      delete this.element.dataset.emojiPickerInitialized;
    }

    // Clean up event listeners when controller disconnects
    if (this.outsideClickHandler) {
      document.removeEventListener("click", this.outsideClickHandler);
      this.outsideClickHandler = null;
    }
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }

    // Remove button keydown listener if it exists
    if (this.hasButtonTarget && this.buttonKeydownHandler) {
      this.buttonTarget.removeEventListener("keydown", this.buttonKeydownHandler);
      this.buttonKeydownHandler = null;
    }

    // Clean up field tracking listeners
    const targetField = this.getTargetField();
    if (targetField) {
      if (this.focusHandler) {
        targetField.removeEventListener("focus", this.focusHandler);
      }
      if (this.selectionHandler) {
        targetField.removeEventListener("click", this.selectionHandler);
        targetField.removeEventListener("keyup", this.selectionHandler);
        targetField.removeEventListener("select", this.selectionHandler);
      }
    }

    // Clean up picker
    if (this.picker && this.hasPickerContainerTarget && this.pickerContainerTarget.contains(this.picker)) {
      this.pickerContainerTarget.removeChild(this.picker);
      this.picker = null;
    }

    // Reset flags
    this.eventListenersSetup = false;
    this.currentTheme = null;
    this.lastCursorPosition = { start: 0, end: 0 };
    this.lastFocusedField = null;

    // Clean up mutation observer
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
  }

  setupThemeObserver() {
    // Create a mutation observer to watch for theme changes
    this.themeObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          const newTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";

          // If theme changed, re-initialize the picker
          if (newTheme !== this.currentTheme) {
            this.reinitializePicker();
          }
        }
      });
    });

    // Start observing the document element for class changes
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  reinitializePicker() {
    // Clean up existing picker
    if (this.picker) {
      this.picker = null;
      if (this.hasPickerContainerTarget) {
        this.pickerContainerTarget.innerHTML = "";
      }
    }

    // Re-initialize with new theme
    this.initializePicker();
  }

  // Get the actual input/textarea element to insert emoji into
  getTargetField() {
    // If a custom selector is provided, use that
    if (this.targetSelectorValue) {
      const customTarget = document.querySelector(this.targetSelectorValue);
      if (customTarget && (customTarget.tagName === "INPUT" || customTarget.tagName === "TEXTAREA")) {
        return customTarget;
      }
    }

    // Otherwise use the input target
    return this.hasInputTarget ? this.inputTarget : null;
  }

  // Insert text at cursor position in input/textarea
  insertAtCursor(field, text) {
    if (!field) return;

    // Save current scroll position
    const scrollPos = field.scrollTop;

    // If field was never focused/selected, append at the end
    let startPos, endPos;
    if (this.lastFocusedField !== field && this.lastCursorPosition.start === 0 && this.lastCursorPosition.end === 0) {
      // Field was never selected, append at end
      startPos = field.value.length;
      endPos = field.value.length;
    } else {
      // Use stored cursor position if available, otherwise use current
      startPos = this.lastCursorPosition.start || field.selectionStart || 0;
      endPos = this.lastCursorPosition.end || field.selectionEnd || 0;
    }

    // Insert the text
    const beforeText = field.value.substring(0, startPos);
    const afterText = field.value.substring(endPos);
    field.value = beforeText + text + afterText;

    // Set cursor position after the inserted text
    const newCursorPos = startPos + text.length;
    field.setSelectionRange(newCursorPos, newCursorPos);

    // Update stored position
    this.lastCursorPosition = {
      start: newCursorPos,
      end: newCursorPos,
    };

    // Restore scroll position
    field.scrollTop = scrollPos;

    // Focus the field
    field.focus();

    // Trigger input event for any listeners (like autogrow)
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }
}
