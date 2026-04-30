import { Controller } from "@hotwired/stimulus";

// Connects to data-controller="checkbox-select-all"
export default class extends Controller {
  static targets = [
    "selectAll", // The "select all" checkbox that toggles all other checkboxes
    "checkbox", // Individual checkboxes to be selected/deselected
    "child", // Child checkboxes within a parent group (for nested hierarchies)
    "parent", // Container element for parent-child checkbox groups
    "actionBar", // Element shown/hidden based on selection state (e.g., bulk actions toolbar)
    "count", // Element displaying the count of selected items
    "total", // Element displaying the calculated total from selected amounts
    "amount", // Elements containing numeric values to sum when their checkbox is selected
    "pageSelectionInfo", // Shows "X of Y row(s) selected." (visible when NOT in all-pages mode)
    "selectAllPagesPrompt", // Shows "Select all Y rows" button (when all on page selected but not all pages)
    "allPagesSelectedInfo", // Shows "All Y row(s) selected." (when all pages are selected)
    "allPagesInput", // Hidden input to pass all-pages selection state to server
  ];
  static values = {
    toggleKey: { type: String, default: "" }, // Keyboard shortcut to toggle focused checkbox (recommended: "x")
    baseAmount: { type: Number, default: 0 }, // Base amount for total calculation
    totalItems: { type: Number, default: 0 }, // Total items across all pages (for "select all pages" feature)
  };

  connect() {
    this.lastCheckedIndex = null;
    this.lastCheckedState = null;
    this.lastShiftEnd = null; // Track the endpoint of the last shift-selection
    this.allPagesSelected = false; // Virtual "all pages" selection state
    this.shiftHeld = false; // Track if shift key is currently held
    this.updateSelectAllState();
    this.updateActionBarVisibility();
    this.updateTotal();

    // Bind keyboard navigation
    this.handleKeydown = this.handleKeydown.bind(this);
    this.element.addEventListener("keydown", this.handleKeydown);

    // Bind global shift key listeners for anchor indicator
    this.handleGlobalKeydown = this.handleGlobalKeydown.bind(this);
    this.handleGlobalKeyup = this.handleGlobalKeyup.bind(this);
    this.handleWindowBlur = this.handleWindowBlur.bind(this);
    document.addEventListener("keydown", this.handleGlobalKeydown);
    document.addEventListener("keyup", this.handleGlobalKeyup);
    window.addEventListener("blur", this.handleWindowBlur);
  }

  disconnect() {
    this.element.removeEventListener("keydown", this.handleKeydown);
    document.removeEventListener("keydown", this.handleGlobalKeydown);
    document.removeEventListener("keyup", this.handleGlobalKeyup);
    window.removeEventListener("blur", this.handleWindowBlur);
    this.clearAnchorIndicator();
  }

  // Handle global keydown to show anchor indicator when shift is pressed
  handleGlobalKeydown(event) {
    if (event.key === "Shift" && !this.shiftHeld) {
      this.shiftHeld = true;
      this.updateAnchorIndicator();
    }
  }

  // Handle global keyup to hide anchor indicator when shift is released
  handleGlobalKeyup(event) {
    if (event.key === "Shift") {
      this.shiftHeld = false;
      this.clearAnchorIndicator();
    }
  }

  // Handle window blur to clear shift state (in case shift is released while window is not focused)
  handleWindowBlur() {
    this.shiftHeld = false;
    this.clearAnchorIndicator();
  }

  // Show dashed outline on the anchor checkbox when shift is held
  updateAnchorIndicator() {
    this.clearAnchorIndicator();

    if (this.shiftHeld && this.lastCheckedIndex !== null) {
      const anchorCheckbox = this.checkboxTargets[this.lastCheckedIndex];
      if (anchorCheckbox) {
        anchorCheckbox.classList.add("checkbox-anchor");
      }
    }
  }

  // Remove anchor indicator from all checkboxes
  clearAnchorIndicator() {
    this.checkboxTargets.forEach((cb) => {
      cb.classList.remove("checkbox-anchor");
    });
  }

  // Check if we have more items than visible on current page
  get hasMultiplePages() {
    return this.hasTotalItemsValue && this.totalItemsValue > this.checkboxTargets.length;
  }

  // Check if all checkboxes on current page are selected
  get allOnPageSelected() {
    const enabledCheckboxes = this.checkboxTargets.filter((cb) => !cb.disabled);
    return enabledCheckboxes.length > 0 && enabledCheckboxes.every((cb) => cb.checked);
  }

  // Toggle all checkboxes when the select-all checkbox is clicked
  toggleAll(event) {
    const isChecked = event.target.checked;

    // Reset "all pages" selection when manually toggling
    this.allPagesSelected = false;

    // Select ALL checkboxes including nested ones
    this.checkboxTargets.forEach((checkbox) => {
      if (!checkbox.disabled) {
        checkbox.checked = isChecked;
        checkbox.indeterminate = false;
      }
    });

    // Also update any parent checkboxes that aren't in the checkbox targets
    this.element
      .querySelectorAll('[data-checkbox-select-all-target="parent"] input[type="checkbox"]')
      .forEach((parentCheckbox) => {
        if (!parentCheckbox.disabled) {
          parentCheckbox.checked = isChecked;
          parentCheckbox.indeterminate = false;
        }
      });

    this.lastCheckedIndex = null;
    this.lastCheckedState = null;
    this.lastShiftEnd = null;
    this.clearAnchorIndicator();
    this.updateSelectAllState();
    this.updateActionBarVisibility();
    this.updateTotal();
  }

  // Select all items across ALL pages (virtual selection)
  // This doesn't load any data, just sets a flag that can be passed to the server
  selectAllPages() {
    // First, ensure all checkboxes on current page are selected
    this.checkboxTargets.forEach((checkbox) => {
      if (!checkbox.disabled) {
        checkbox.checked = true;
        checkbox.indeterminate = false;
      }
    });

    if (this.hasSelectAllTarget) {
      this.selectAllTarget.checked = true;
      this.selectAllTarget.indeterminate = false;
    }

    // Set virtual "all pages" selection
    this.allPagesSelected = true;

    this.updateActionBarVisibility();
    this.updateTotal();
  }

  // Clear "all pages" selection and uncheck everything
  clearAllPages() {
    this.allPagesSelected = false;
    this.clearAll();
  }

  // Clear all selections (current page only, resets all-pages state)
  clearAll() {
    // Reset "all pages" selection
    this.allPagesSelected = false;

    this.checkboxTargets.forEach((checkbox) => {
      if (!checkbox.disabled) {
        checkbox.checked = false;
        checkbox.indeterminate = false;
      }
    });

    // Clear parent checkboxes too
    this.element
      .querySelectorAll('[data-checkbox-select-all-target="parent"] input[type="checkbox"]')
      .forEach((parentCheckbox) => {
        if (!parentCheckbox.disabled) {
          parentCheckbox.checked = false;
          parentCheckbox.indeterminate = false;
        }
      });

    if (this.hasSelectAllTarget) {
      this.selectAllTarget.checked = false;
      this.selectAllTarget.indeterminate = false;
    }

    this.lastCheckedIndex = null;
    this.lastCheckedState = null;
    this.lastShiftEnd = null;
    this.clearAnchorIndicator();
    this.updateActionBarVisibility();
    this.updateTotal();
  }

  // Handle individual checkbox clicks
  toggle(event) {
    const checkbox = event.target;
    const currentIndex = this.checkboxTargets.indexOf(checkbox);

    // If the clicked element isn't one of our targets, ignore
    if (currentIndex === -1) return;

    // Reset "all pages" selection when manually toggling individual items
    this.allPagesSelected = false;

    // Handle shift-click for batch selection
    if (event.shiftKey && this.lastCheckedIndex !== null) {
      const anchor = this.lastCheckedIndex;
      const targetState = this.lastCheckedState;

      const newStart = Math.min(anchor, currentIndex);
      const newEnd = Math.max(anchor, currentIndex);

      // If we had a previous shift selection, handle items outside the new range
      if (this.lastShiftEnd !== null) {
        const prevStart = Math.min(anchor, this.lastShiftEnd);
        const prevEnd = Math.max(anchor, this.lastShiftEnd);

        // Deselect items that were in the previous range but not in the new range
        this.checkboxTargets.forEach((cb, index) => {
          if (!cb.disabled) {
            const wasInPrevRange = index >= prevStart && index <= prevEnd;
            const isInNewRange = index >= newStart && index <= newEnd;

            if (wasInPrevRange && !isInNewRange) {
              // This item was selected by previous shift-click but is outside new range
              cb.checked = !targetState;
              cb.indeterminate = false;
            }
          }
        });
      }

      // Apply the target state to all items in the new range
      this.checkboxTargets.forEach((cb, index) => {
        if (!cb.disabled && index >= newStart && index <= newEnd) {
          cb.checked = targetState;
          cb.indeterminate = false;
        }
      });

      // Remember this shift end for future shift-clicks
      this.lastShiftEnd = currentIndex;

      // We do NOT update lastCheckedIndex on shift-click, preserving the original anchor
    } else {
      // Normal click - this becomes the new anchor
      this.lastCheckedIndex = currentIndex;
      this.lastCheckedState = checkbox.checked;
      this.lastShiftEnd = null; // Reset shift selection tracking
      this.updateAnchorIndicator(); // Update visual indicator for new anchor
    }

    this.updateAllParentStates();
    this.updateSelectAllState();
    this.updateActionBarVisibility();
    this.updateTotal();
  }

  // Update the select-all checkbox state based on individual checkboxes
  updateSelectAllState() {
    if (!this.hasSelectAllTarget) return;

    // Get all leaf checkboxes (checkboxes that don't have children)
    // These are checkboxes that are NOT parent checkboxes
    const leafCheckboxes = this.checkboxTargets.filter((cb) => {
      if (cb.disabled) return false;
      // Check if this checkbox is a parent (has a parent container with children)
      const parentContainer = cb.closest('[data-checkbox-select-all-target="parent"]');
      if (!parentContainer) return true; // Not in a parent container, so it's a leaf

      // If it's in a parent container, check if it's the parent checkbox itself
      const parentCheckbox = parentContainer.querySelector('input[type="checkbox"]');
      return cb !== parentCheckbox; // Only include if it's not the parent checkbox
    });

    const checkedCount = leafCheckboxes.filter((cb) => cb.checked).length;

    if (checkedCount === 0) {
      this.selectAllTarget.checked = false;
      this.selectAllTarget.indeterminate = false;
    } else if (checkedCount === leafCheckboxes.length) {
      this.selectAllTarget.checked = true;
      this.selectAllTarget.indeterminate = false;
    } else {
      this.selectAllTarget.checked = false;
      this.selectAllTarget.indeterminate = true;
    }
  }

  // Update visibility of action bar based on selection state
  updateActionBarVisibility() {
    if (!this.hasActionBarTarget) return;

    const checkedCount = this.checkboxTargets.filter((cb) => cb.checked && !cb.disabled).length;
    const hasSelection = checkedCount > 0 || this.allPagesSelected;

    // Show/hide action bar
    this.actionBarTargets.forEach((actionBar) => {
      actionBar.hidden = !hasSelection;
    });

    // Update "select all pages" UI elements
    this.updateSelectAllPagesUI(checkedCount);

    // Update hidden input for form submission
    this.updateAllPagesInput();

    this.updateCount();
  }

  // Update the "select all pages" UI elements
  updateSelectAllPagesUI(checkedCount) {
    const showSelectAllPrompt = this.allOnPageSelected && this.hasMultiplePages && !this.allPagesSelected;
    const showAllPagesSelected = this.allPagesSelected;
    const showPageSelection = !showAllPagesSelected;

    // "X of Y row(s) selected." - shown when NOT in all-pages mode
    this.pageSelectionInfoTargets.forEach((el) => {
      el.classList.toggle("hidden", !showPageSelection);
    });

    // "Select all Y rows" prompt - shown when all on page selected but not all pages
    this.selectAllPagesPromptTargets.forEach((el) => {
      el.classList.toggle("hidden", !showSelectAllPrompt);
    });

    // "All Y row(s) selected." - shown when all pages selected
    this.allPagesSelectedInfoTargets.forEach((el) => {
      el.classList.toggle("hidden", !showAllPagesSelected);
    });
  }

  // Update hidden input for form submission
  // This allows the server to know if "all pages" is selected
  updateAllPagesInput() {
    this.allPagesInputTargets.forEach((input) => {
      input.value = this.allPagesSelected ? "true" : "false";
      input.disabled = !this.allPagesSelected;
    });
  }

  // Update the count display
  updateCount() {
    if (!this.hasCountTarget) return;

    // When all pages selected, show total count; otherwise show checked count
    const displayCount = this.allPagesSelected
      ? this.totalItemsValue
      : this.checkboxTargets.filter((cb) => cb.checked && !cb.disabled).length;

    this.countTargets.forEach((count) => {
      count.textContent = `${displayCount}`;
    });
  }

  // Update the total by summing amounts from checked items
  updateTotal() {
    if (!this.hasTotalTarget) return;

    // Start with the base amount (e.g., subscription fee)
    let total = this.baseAmountValue;

    // For each checked checkbox, find its associated amount element
    this.checkboxTargets.forEach((checkbox) => {
      if (checkbox.checked && !checkbox.disabled) {
        // Find the amount target in the same container as the checkbox
        const container = checkbox.closest('[data-controller*="checkbox-select-all"]') || this.element;
        const allAmounts = Array.from(container.querySelectorAll('[data-checkbox-select-all-target*="amount"]'));

        // Find the amount that's in the same parent as this checkbox
        const checkboxParent = checkbox.closest("label, div, tr, li");
        if (checkboxParent) {
          const amount = allAmounts.find((amt) => checkboxParent.contains(amt));
          if (amount) {
            // Parse the number from the amount's text content
            // Remove currency symbols, commas, /mo, /year, etc.
            const text = amount.textContent.trim();
            const numberMatch = text.match(/[\d,]+\.?\d*/);
            if (numberMatch) {
              const value = parseFloat(numberMatch[0].replace(/,/g, ""));
              if (!isNaN(value)) {
                total += value;
              }
            }
          }
        }
      }
    });

    // Update all total targets with the calculated sum
    this.totalTargets.forEach((totalElement) => {
      // Get the original format from the element (to preserve currency symbols, etc.)
      const originalText = totalElement.textContent;
      const currencyMatch = originalText.match(/^[^\d]*/);
      const suffixMatch = originalText.match(/[^\d,.]+$/);

      const prefix = currencyMatch ? currencyMatch[0] : "$";
      const suffix = suffixMatch ? suffixMatch[0] : "";

      // Format with 2 decimal places
      const formattedTotal = total.toFixed(2);

      totalElement.textContent = `${prefix}${formattedTotal}${suffix}`;
    });
  }

  // Update state of all parent groups
  updateAllParentStates() {
    this.element.querySelectorAll('[data-checkbox-select-all-target="parent"]').forEach((container) => {
      this.updateChildrenState(container);
    });
  }

  // Update children checkboxes when parent is toggled
  toggleChildren(event) {
    const parentCheckbox = event.target;
    const isChecked = parentCheckbox.checked;

    const container = parentCheckbox.closest('[data-checkbox-select-all-target="parent"]');
    if (!container) return;

    // Select ALL child checkboxes at ALL nesting levels within this parent
    const allChildCheckboxes = container.querySelectorAll('input[type="checkbox"]');
    allChildCheckboxes.forEach((checkbox) => {
      // Skip the parent checkbox itself
      if (checkbox !== parentCheckbox && !checkbox.disabled) {
        checkbox.checked = isChecked;
        checkbox.indeterminate = false;
      }
    });

    // Ensure parent stays in the correct state (checked or unchecked, not indeterminate)
    parentCheckbox.indeterminate = false;

    this.updateAllParentStates();
    this.updateSelectAllState();
    this.updateActionBarVisibility();
    this.updateTotal();
  }

  // Update parent state based on children
  updateChildrenState(container) {
    const parentCheckboxInput = container.querySelector('input[type="checkbox"]');
    if (!parentCheckboxInput) return;

    // Get all checkboxes in the container
    const allCheckboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));

    // Filter to get only children (exclude the parent itself)
    const childCheckboxes = allCheckboxes.filter((cb) => cb !== parentCheckboxInput && !cb.disabled);

    const checkedChildren = childCheckboxes.filter((cb) => cb.checked).length;

    if (checkedChildren === 0) {
      parentCheckboxInput.checked = false;
      parentCheckboxInput.indeterminate = false;
    } else if (checkedChildren === childCheckboxes.length) {
      parentCheckboxInput.checked = true;
      parentCheckboxInput.indeterminate = false;
    } else {
      parentCheckboxInput.checked = false;
      parentCheckboxInput.indeterminate = true;
    }
  }

  // Keyboard navigation handler
  handleKeydown(event) {
    const activeElement = document.activeElement;

    // Check if the active element is the select-all checkbox
    const isSelectAll = this.hasSelectAllTarget && activeElement === this.selectAllTarget;

    // Check if the active element is one of our checkboxes
    const currentIndex = this.checkboxTargets.indexOf(activeElement);

    // If it's neither, ignore
    if (!isSelectAll && currentIndex === -1) return;

    // Handle arrow key navigation (ArrowDown and ArrowRight move forward, ArrowUp and ArrowLeft move backward)
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      if (isSelectAll) {
        // From select-all, go to first visible checkbox
        this.focusFirstVisibleCheckbox();
      } else {
        // Try to go to next checkbox, or loop back if at end
        const moved = this.focusNextCheckbox(currentIndex);
        if (!moved) {
          // At the last visible checkbox, loop back to select-all or first checkbox
          if (this.hasSelectAllTarget) {
            this.selectAllTarget.focus();
          } else {
            this.focusFirstVisibleCheckbox();
          }
        }
      }
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      if (isSelectAll) {
        // From select-all, loop to last visible checkbox
        this.focusLastVisibleCheckbox();
      } else {
        // Try to go to previous checkbox, or loop back if at start
        const moved = this.focusPreviousCheckbox(currentIndex);
        if (!moved) {
          // At the first visible checkbox, go to select-all or loop to last
          if (this.hasSelectAllTarget) {
            this.selectAllTarget.focus();
          } else {
            this.focusLastVisibleCheckbox();
          }
        }
      }
    }
    // Handle toggle key (if configured) - case insensitive
    else if (this.hasToggleKeyValue && event.key.toLowerCase() === this.toggleKeyValue.toLowerCase()) {
      event.preventDefault();

      // Only handle toggle for regular checkboxes (not select-all)
      if (!isSelectAll) {
        // Shift + toggle key: batch toggle like shift-click
        if (event.shiftKey && this.lastCheckedIndex !== null) {
          const anchor = this.lastCheckedIndex;
          const targetState = this.lastCheckedState;

          const newStart = Math.min(anchor, currentIndex);
          const newEnd = Math.max(anchor, currentIndex);

          // If we had a previous shift selection, handle items outside the new range
          if (this.lastShiftEnd !== null) {
            const prevStart = Math.min(anchor, this.lastShiftEnd);
            const prevEnd = Math.max(anchor, this.lastShiftEnd);

            // Deselect items that were in the previous range but not in the new range
            this.checkboxTargets.forEach((cb, index) => {
              if (!cb.disabled) {
                const wasInPrevRange = index >= prevStart && index <= prevEnd;
                const isInNewRange = index >= newStart && index <= newEnd;

                if (wasInPrevRange && !isInNewRange) {
                  cb.checked = !targetState;
                  cb.indeterminate = false;
                }
              }
            });
          }

          // Apply the target state to all items in the new range
          this.checkboxTargets.forEach((cb, index) => {
            if (!cb.disabled && index >= newStart && index <= newEnd) {
              cb.checked = targetState;
              cb.indeterminate = false;
            }
          });

          // Remember this shift end
          this.lastShiftEnd = currentIndex;

          this.updateAllParentStates();
          this.updateSelectAllState();
          this.updateActionBarVisibility();
          this.updateTotal();
        } else {
          // Normal toggle: just click the focused checkbox
          activeElement.click();
        }
      } else {
        // For select-all, just click it
        activeElement.click();
      }
    }
  }

  // Check if a checkbox is hidden (e.g., inside a collapsed folder)
  isCheckboxHidden(checkbox) {
    let current = checkbox;
    while (current && current !== this.element) {
      if (current.hasAttribute("hidden") || current.classList.contains("hidden")) {
        return true;
      }
      // Check for collapsed state via data-state attribute
      if (current.getAttribute("data-state") === "closed") {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }

  // Check if a checkbox can be focused (not disabled and not hidden)
  isCheckboxFocusable(checkbox) {
    return !checkbox.disabled && !this.isCheckboxHidden(checkbox);
  }

  // Focus a checkbox at a specific index (returns true if successful)
  focusCheckboxAtIndex(index) {
    if (index >= 0 && index < this.checkboxTargets.length) {
      const checkbox = this.checkboxTargets[index];
      if (this.isCheckboxFocusable(checkbox)) {
        checkbox.focus();
        this.scrollToCheckbox(checkbox);
        return true;
      } else {
        // If disabled or hidden, try the next one
        if (index < this.checkboxTargets.length - 1) {
          return this.focusCheckboxAtIndex(index + 1);
        }
      }
    }
    return false;
  }

  // Focus the first visible and enabled checkbox
  focusFirstVisibleCheckbox() {
    for (let i = 0; i < this.checkboxTargets.length; i++) {
      if (this.isCheckboxFocusable(this.checkboxTargets[i])) {
        this.checkboxTargets[i].focus();
        this.scrollToCheckbox(this.checkboxTargets[i]);
        return true;
      }
    }
    return false;
  }

  // Focus the last visible and enabled checkbox
  focusLastVisibleCheckbox() {
    for (let i = this.checkboxTargets.length - 1; i >= 0; i--) {
      if (this.isCheckboxFocusable(this.checkboxTargets[i])) {
        this.checkboxTargets[i].focus();
        this.scrollToCheckbox(this.checkboxTargets[i]);
        return true;
      }
    }
    return false;
  }

  // Focus the next enabled and visible checkbox (returns true if moved)
  focusNextCheckbox(currentIndex) {
    for (let i = currentIndex + 1; i < this.checkboxTargets.length; i++) {
      const checkbox = this.checkboxTargets[i];
      if (this.isCheckboxFocusable(checkbox)) {
        checkbox.focus();
        this.scrollToCheckbox(checkbox);
        return true;
      }
    }
    return false;
  }

  // Focus the previous enabled and visible checkbox (returns true if moved)
  focusPreviousCheckbox(currentIndex) {
    for (let i = currentIndex - 1; i >= 0; i--) {
      const checkbox = this.checkboxTargets[i];
      if (this.isCheckboxFocusable(checkbox)) {
        checkbox.focus();
        this.scrollToCheckbox(checkbox);
        return true;
      }
    }
    return false;
  }

  // Scroll checkbox into view with padding
  scrollToCheckbox(checkbox) {
    // Find the row element (for table layouts)
    const row = checkbox.closest("tr");
    const element = row || checkbox;

    // Find the scrollable container
    const content = element.closest(".overflow-y-auto, .overflow-auto");
    if (!content) return;

    const contentRect = content.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Find sticky elements that reduce visible scroll area
    const stickyHeader = content.querySelector(".sticky.top-0, thead .sticky");
    const stickyFooter = content.querySelector(".sticky.bottom-0");

    const stickyHeaderHeight = stickyHeader ? stickyHeader.offsetHeight : 0;
    const stickyFooterHeight = stickyFooter && !stickyFooter.hidden ? stickyFooter.offsetHeight : 0;

    // Calculate the element's position relative to the scrollable content
    const elementRelativeTop = elementRect.top - contentRect.top;
    const elementRelativeBottom = elementRelativeTop + elementRect.height;
    const contentScrollTop = content.scrollTop;
    const contentHeight = contentRect.height;

    // Define padding: scroll when the element is within this distance from the edge
    const scrollPadding = elementRect.height * 1;

    // Adjust visible area by excluding sticky elements
    const visibleTop = stickyHeaderHeight + scrollPadding;
    const visibleBottom = contentHeight - stickyFooterHeight - scrollPadding;

    // Check if we need to scroll down (element is too far down)
    if (elementRelativeBottom > visibleBottom) {
      content.scrollTop = contentScrollTop + (elementRelativeBottom - visibleBottom);
    }
    // Check if we need to scroll up (element is too far up)
    else if (elementRelativeTop < visibleTop) {
      content.scrollTop = contentScrollTop + (elementRelativeTop - visibleTop);
    }
  }
}
