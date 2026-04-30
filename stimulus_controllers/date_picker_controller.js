import { Controller } from "@hotwired/stimulus";
import { computePosition, offset, flip, shift, arrow, autoUpdate } from "@floating-ui/dom";
import AirDatepicker from "air-datepicker";
import localeEn from "air-datepicker/locale/en";

// AirDatepicker CSS is now imported directly.
// Ensure air-datepicker is added to your package.json and your build system handles these imports.

export default class extends Controller {
  static targets = ["input", "inlineCalendar"];
  static values = {
    placement: { type: String, default: "bottom-start" }, // Placement of the datepicker
    range: { type: Boolean, default: false }, // Whether to allow selecting a range of dates
    disabledDates: { type: Array, default: [] }, // Expects array of 'YYYY-MM-DD' strings
    timepicker: { type: Boolean, default: false },
    timeOnly: { type: Boolean, default: false }, // New value for time-only selection
    weekPicker: { type: Boolean, default: false }, // New value for week selection
    timeFormat: { type: String, default: "" }, // Default empty, logic will apply 'hh:mm AA' if timepicker is true and this is empty
    minHours: Number, // Undefined if not set, AirDatepicker uses its default
    maxHours: Number, // Undefined if not set
    minutesStep: Number, // Undefined if not set
    showTodayButton: { type: Boolean, default: false },
    showClearButton: { type: Boolean, default: false },
    showThisMonthButton: { type: Boolean, default: false },
    showThisYearButton: { type: Boolean, default: false },
    dateFormat: { type: String, default: "" }, // e.g., 'MM/dd/yyyy', AirDatepicker default if empty
    startView: { type: String, default: "days" }, // 'days', 'months', 'years'
    minView: { type: String, default: "days" }, // 'days', 'months', 'years'
    initialDate: { type: String, default: "" }, // 'YYYY-MM-DD' or JSON array of 'YYYY-MM-DD' for range
    minDate: { type: String, default: "" }, // 'YYYY-MM-DD'
    maxDate: { type: String, default: "" }, // 'YYYY-MM-DD'
    inline: { type: Boolean, default: false }, // Makes the calendar permanently visible
  };

  // CSS classes for preset buttons
  static PRESET_CLASSES = {
    active: [
      "bg-neutral-900",
      "text-white",
      "hover:!bg-neutral-700",
      "dark:bg-neutral-100",
      "dark:hover:!bg-neutral-200",
      "dark:text-neutral-900",
    ],
    inactive: ["text-neutral-700", "hover:bg-neutral-100", "dark:text-neutral-300", "dark:hover:bg-neutral-700/50"],
  };

  connect() {
    // Check if this element also has dropdown-popover controller
    // If so, don't initialize the datepicker (it's just used for preset methods)
    const hasDropdownController =
      this.element.hasAttribute("data-controller") &&
      this.element.getAttribute("data-controller").includes("dropdown-popover");

    if (!hasDropdownController) {
      this.initializeDatepicker();
      this.inputTarget.addEventListener("keydown", this.handleKeydown.bind(this));
    } else {
      // Listen for input click to detect active preset when dropdown opens
      this.inputTarget.addEventListener("click", () => {
        // Small delay to ensure dropdown is fully rendered
        setTimeout(() => {
          this._detectActivePreset();
        }, 50);
      });
    }
  }

  initializeDatepicker() {
    if (this.datepickerInstance) {
      this.datepickerInstance.destroy();
      // Ensure autoUpdate cleanup is robustly handled if destroy didn't trigger position's cleanup
      if (this.cleanupAutoUpdate) {
        this.cleanupAutoUpdate();
        this.cleanupAutoUpdate = null;
      }
      // Also clear the specific one for the current position call, if any
      if (this.currentPositionCleanupAutoUpdate) {
        this.currentPositionCleanupAutoUpdate();
        this.currentPositionCleanupAutoUpdate = null;
      }
    }

    const options = this._buildDatepickerOptions();

    if (!this.inlineValue) {
      options.position = this._createPositionFunction();
    }

    this.datepickerInstance = new AirDatepicker(this.inputTarget, options);

    // Format initial value for week picker
    if (this.weekPickerValue) {
      setTimeout(() => this._updateWeekDisplay(), 0);
    }

    // Trigger change for inline calendars
    if (this.inlineValue) {
      setTimeout(() => this._triggerChangeEvent(), 0);
    }
  }

  _buildDatepickerOptions() {
    const options = {
      locale: localeEn,
      autoClose: !this.inlineValue,
      inline: this.inlineValue,
      container: this.inputTarget.closest("dialog") || undefined,
    };

    // Date/Time format
    if (this.timeOnlyValue) {
      options.dateFormat = "";
      options.onSelect = this._createTimeOnlySelectHandler();
    } else if (this.weekPickerValue) {
      options.dateFormat = "";
      options.onSelect = this._createWeekSelectHandler();
    } else if (this.hasDateFormatValue && this.dateFormatValue) {
      options.dateFormat = this.dateFormatValue;
    }

    // Views
    if (this.hasStartViewValue) options.view = this.startViewValue;
    if (this.hasMinViewValue) options.minView = this.minViewValue;

    // Date constraints
    this._setDateConstraint(options, "minDate", this.minDateValue);
    this._setDateConstraint(options, "maxDate", this.maxDateValue);

    // Initial dates
    const initialDates = this._parseInitialDates();
    if (initialDates.length > 0) options.selectedDates = initialDates;

    // Range mode
    if (this.rangeValue) {
      options.range = true;
      options.multipleDatesSeparator = " - ";
    }

    // Timepicker
    if (this.timepickerValue || this.timeOnlyValue) {
      Object.assign(options, {
        timepicker: true,
        timeFormat: this.timeFormatValue || "hh:mm AA",
        ...(this.hasMinHoursValue && { minHours: this.minHoursValue }),
        ...(this.hasMaxHoursValue && { maxHours: this.maxHoursValue }),
        ...(this.hasMinutesStepValue && { minutesStep: this.minutesStepValue }),
      });
      if (this.timeOnlyValue) options.classes = "only-timepicker";
    }

    // Buttons
    const buttons = this._buildButtons();
    if (buttons.length > 0) options.buttons = buttons;

    // Disabled dates handling
    const disabledDates = this._parseDisabledDates();
    if (disabledDates.length > 0) {
      options.onRenderCell = this._createRenderCellHandler(disabledDates);
    }

    // General onSelect for inline calendars
    if (!this.timeOnlyValue && !this.weekPickerValue && this.inlineValue) {
      const originalOnSelect = options.onSelect;
      options.onSelect = (params) => {
        originalOnSelect?.(params);
        setTimeout(() => this.syncToMainPicker(), 10);
        this._triggerChangeEvent();
      };
    }

    // Special handling for inline time-only picker
    if (this.timeOnlyValue && this.inlineValue) {
      const originalOnSelect = options.onSelect;
      options.onSelect = ({ date, datepicker }) => {
        if (originalOnSelect) {
          originalOnSelect({ date, datepicker });
        }
        this._triggerChangeEvent();
      };
    }

    return options;
  }

  _setDateConstraint(options, key, value) {
    if (value) {
      const date = this._parseDate(value);
      if (date) options[key] = date;
    }
  }

  _parseInitialDates() {
    if (!this.hasInitialDateValue || !this.initialDateValue) return [];

    try {
      if (this.initialDateValue.startsWith("[") && this.initialDateValue.endsWith("]")) {
        const dateStrings = JSON.parse(this.initialDateValue);
        return dateStrings.map((str) => this._parseDate(str)).filter(Boolean);
      }
      const date = this._parseDate(this.initialDateValue);
      return date ? [date] : [];
    } catch (e) {
      console.error("Error parsing initialDateValue:", e, "Value was:", this.initialDateValue);
      return [];
    }
  }

  _buildButtons() {
    const buttons = [];
    const buttonConfigs = [
      { condition: this.showTodayButtonValue, button: this._createTodayButton() },
      { condition: this.showThisMonthButtonValue, button: this._createMonthButton() },
      { condition: this.showThisYearButtonValue, button: this._createYearButton() },
      { condition: this.showClearButtonValue, button: "clear" },
    ];

    buttonConfigs.forEach(({ condition, button }) => {
      if (condition && button) buttons.push(button);
    });

    return buttons;
  }

  _createTodayButton() {
    const isTimepickerEnabled = this.timepickerValue || this.timeOnlyValue || this.weekPickerValue;
    const buttonText = this.weekPickerValue ? "This week" : isTimepickerEnabled ? "Now" : "Today";

    return {
      content: buttonText,
      onClick: (dp) => {
        const currentDate = new Date();
        const dates = this.rangeValue ? [currentDate, currentDate] : currentDate;

        if (isTimepickerEnabled && !this.weekPickerValue) {
          dp.clear();
          setTimeout(() => dp.selectDate(dates, { updateTime: true }), 0);
        } else {
          dp.selectDate(dates);
        }
      },
    };
  }

  _createMonthButton() {
    return {
      content: "This month",
      onClick: (dp) => {
        const currentDate = new Date();
        dp.selectDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      },
    };
  }

  _createYearButton() {
    return {
      content: "This year",
      onClick: (dp) => {
        const currentDate = new Date();
        dp.selectDate(new Date(currentDate.getFullYear(), 0, 1));
      },
    };
  }

  _parseDisabledDates() {
    if (!this.disabledDatesValue?.length) return [];

    return this.disabledDatesValue.map((str) => this._parseDate(str)).filter(Boolean);
  }

  _createRenderCellHandler(disabledDates) {
    return ({ date, cellType }) => {
      if (cellType !== "day") return {};

      const cellDateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const isDisabled = disabledDates.some((disabledDate) => disabledDate.getTime() === cellDateUTC.getTime());

      return isDisabled ? { disabled: true } : {};
    };
  }

  _createTimeOnlySelectHandler() {
    return ({ date, datepicker }) => {
      if (date) {
        const timeFormat = this.timeFormatValue || "hh:mm AA";
        this.inputTarget.value = datepicker.formatDate(date, timeFormat);
        this._triggerChangeEvent();
      }
    };
  }

  _createWeekSelectHandler() {
    return ({ date }) => {
      if (date) {
        const weekNumber = this._getWeekNumber(date);
        const year = date.getFullYear();
        this.inputTarget.value = `${year}-W${weekNumber.toString().padStart(2, "0")}`;
        this._triggerChangeEvent();
      }
    };
  }

  _createPositionFunction() {
    return ({ $datepicker, $target, $pointer, done }) => {
      const middleware = [offset(8), flip(), shift({ padding: 8 })];

      if ($pointer instanceof HTMLElement) {
        middleware.push(arrow({ element: $pointer, padding: 5 }));
      }

      this._cleanupPositioning();

      this.currentPositionCleanupAutoUpdate = autoUpdate(
        $target,
        $datepicker,
        () => {
          computePosition($target, $datepicker, {
            placement: this.placementValue,
            middleware: middleware,
          }).then(({ x, y, middlewareData }) => {
            Object.assign($datepicker.style, { left: `${x}px`, top: `${y}px` });

            if ($pointer instanceof HTMLElement && middlewareData.arrow) {
              const { x: arrowX, y: arrowY } = middlewareData.arrow;
              Object.assign($pointer.style, {
                left: arrowX != null ? `${arrowX}px` : "",
                top: arrowY != null ? `${arrowY}px` : "",
              });
            }
          });
        },
        { animationFrame: true }
      );

      this.cleanupAutoUpdate = this.currentPositionCleanupAutoUpdate;

      return () => {
        this._cleanupPositioning();
        done();
      };
    };
  }

  _getWeekNumber(date) {
    const tempDate = new Date(date.getTime());
    const dayNumber = (tempDate.getDay() + 6) % 7;
    tempDate.setDate(tempDate.getDate() - dayNumber + 3);

    const firstThursday = new Date(tempDate.getFullYear(), 0, 4);
    firstThursday.setDate(firstThursday.getDate() - ((firstThursday.getDay() + 6) % 7) + 3);

    return Math.round((tempDate.getTime() - firstThursday.getTime()) / 86400000 / 7) + 1;
  }

  _parseDate(dateString) {
    if (!dateString || typeof dateString !== "string") return null;

    // First check if it's a datetime string (YYYY-MM-DD HH:MM)
    if (dateString.includes(" ")) {
      const [datePart, timePart] = dateString.split(" ");
      const dateParts = datePart.split("-");

      if (dateParts.length === 3 && timePart) {
        const [year, month, day] = dateParts.map(Number);
        const [hours, minutes] = timePart.split(":").map(Number);

        if (!isNaN(year) && !isNaN(month) && !isNaN(day) && !isNaN(hours) && !isNaN(minutes)) {
          return new Date(year, month - 1, day, hours, minutes);
        }
      }
    }

    // Otherwise try to parse as date only (YYYY-MM-DD)
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts.map(Number);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(Date.UTC(year, month - 1, day));
      }
    }

    console.warn(`Invalid date string format: ${dateString}. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM.`);
    return null;
  }

  handleKeydown(event) {
    if (event.key === "Delete" || event.key === "Backspace") {
      this.datepickerInstance?.clear();
      this.inputTarget.value = "";
    }
  }

  disconnect() {
    if (this.datepickerInstance) {
      this.datepickerInstance.destroy(); // This should trigger the cleanup returned by position()
      this.datepickerInstance = null;
    }
    // Fallback cleanup for autoUpdate, in case destroy() didn't clear it or it was managed outside position's return.
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }
    if (this.currentPositionCleanupAutoUpdate) {
      // Also ensure any lingering position-specific cleanup is called
      this.currentPositionCleanupAutoUpdate();
      this.currentPositionCleanupAutoUpdate = null;
    }

    // Only remove event listener if it was added
    if (this.inputTarget && !this.element.getAttribute("data-controller").includes("dropdown-popover")) {
      this.inputTarget.removeEventListener("keydown", this.handleKeydown.bind(this));
    }
  }

  // Preset time range methods
  setToday(event) {
    const today = new Date();
    // Set hours to noon to avoid any timezone edge cases
    today.setHours(12, 0, 0, 0);
    this._applyPreset(event.currentTarget, today, today);
  }

  setYesterday(event) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    this._applyPreset(event.currentTarget, yesterday, yesterday);
  }

  setLastDays(event) {
    const days = parseInt(event.currentTarget.dataset.days, 10);
    if (isNaN(days) || days <= 0) {
      console.warn("Invalid number of days specified in data-days attribute");
      return;
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1)); // days - 1 because we include today
    this._applyPreset(event.currentTarget, startDate, endDate);
  }

  setPreset(event) {
    const presetType = event.currentTarget.dataset.presetType;

    switch (presetType) {
      case "this-month":
        this._setThisMonth();
        break;
      case "last-month":
        this._setLastMonth();
        break;
      case "this-year":
        this._setThisYear();
        break;
      default:
        console.warn(`Unknown preset type: ${presetType}`);
    }
    this._setActivePreset(event.currentTarget);
  }

  _setThisMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this._applyPreset(event.currentTarget, startDate, endDate);
  }

  _setLastMonth() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    this._applyPreset(event.currentTarget, startDate, endDate);
  }

  _setThisYear() {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    const endDate = new Date(now.getFullYear(), 11, 31);
    this._applyPreset(event.currentTarget, startDate, endDate);
  }

  clearSelection() {
    if (this.datepickerInstance) {
      this.datepickerInstance.clear();
    }
    this.inputTarget.value = "";
    this._syncToInlineCalendar();
    this._triggerChangeEvent();
    this._clearActivePreset();
  }

  syncFromInlineCalendar(event) {
    // Sync the main input from the inline calendar when it changes
    const inlineInput = event.target;
    if (inlineInput.value) {
      this.inputTarget.value = inlineInput.value;
      this._triggerChangeEvent();
    }
  }

  syncToMainPicker(event = null) {
    // This method is called from the inline calendar to sync to main picker
    // Find the main date picker controller in the parent dropdown
    const dropdownElement = this.element.closest(
      '[data-controller*="dropdown-popover"][data-controller*="date-picker"]'
    );
    if (dropdownElement) {
      const mainController = this.application.getControllerForElementAndIdentifier(dropdownElement, "date-picker");
      if (mainController && mainController !== this) {
        // Get the selected dates from the inline calendar
        const selectedDates = this.datepickerInstance ? this.datepickerInstance.selectedDates : [];

        if (selectedDates.length > 0) {
          // Format the dates for the main input
          const formattedValue = mainController._formatDateRange(
            selectedDates[0],
            selectedDates[selectedDates.length - 1]
          );
          mainController.inputTarget.value = formattedValue;

          // If the main controller has a datepicker instance, sync the selected dates
          if (mainController.datepickerInstance) {
            // For range pickers, ensure we complete the range selection properly
            if (mainController.rangeValue) {
              if (selectedDates.length === 1) {
                // Select the same date twice to complete the range selection
                mainController.datepickerInstance.selectDate([selectedDates[0], selectedDates[0]]);
              } else {
                mainController.datepickerInstance.selectDate(selectedDates);
              }
            } else {
              mainController.datepickerInstance.selectDate(selectedDates[0]);
            }
          }
        } else {
          // Clear the main input if no dates selected
          mainController.inputTarget.value = "";
          if (mainController.datepickerInstance) {
            mainController.datepickerInstance.clear();
          }
        }

        mainController._triggerChangeEvent();

        // Clear active preset when dates are manually selected
        mainController._clearActivePreset();

        // Close the dropdown after selection if we have a complete range or single date
        if (mainController.rangeValue ? selectedDates.length >= 2 : selectedDates.length >= 1) {
          const dropdownController = this.application.getControllerForElementAndIdentifier(
            dropdownElement,
            "dropdown-popover"
          );
          if (dropdownController) {
            dropdownController.close();
          }
        }
      }
    }
  }

  // Helper methods
  _applyPreset(button, startDate, endDate) {
    this._setDateRange(startDate, endDate);
    this._setActivePreset(button);
  }

  _setDateRange(startDate, endDate) {
    if (this.datepickerInstance) {
      const dates = this.rangeValue ? [startDate, endDate] : [startDate];
      this.datepickerInstance.selectDate(dates);
    } else {
      this.inputTarget.value = this._formatDateRange(startDate, endDate);
    }

    this._syncToInlineCalendar();
    this._triggerChangeEvent();
  }

  _formatDateRange(startDate, endDate) {
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${month}/${day}/${year}`;
    };

    return this.rangeValue ? `${formatDate(startDate)} - ${formatDate(endDate)}` : formatDate(startDate);
  }

  _syncToInlineCalendar() {
    // Find inline calendar in the same dropdown and sync its value
    const dropdownMenu = this.element.querySelector('[data-dropdown-popover-target="menu"]');
    if (dropdownMenu) {
      const inlineCalendar = dropdownMenu.querySelector('.inline-calendar[data-controller="date-picker"]');
      if (inlineCalendar) {
        const inlineController = this.application.getControllerForElementAndIdentifier(inlineCalendar, "date-picker");
        if (inlineController && inlineController.datepickerInstance) {
          // Get selected dates from main picker and apply to inline calendar
          if (this.datepickerInstance && this.datepickerInstance.selectedDates.length > 0) {
            // If it's a range picker and both dates are the same, only select one date
            const datesToSelect =
              this.rangeValue &&
              this.datepickerInstance.selectedDates.length === 2 &&
              this.datepickerInstance.selectedDates[0].getTime() === this.datepickerInstance.selectedDates[1].getTime()
                ? [this.datepickerInstance.selectedDates[0]]
                : this.datepickerInstance.selectedDates;
            inlineController.datepickerInstance.selectDate(datesToSelect);
          } else {
            // If no main datepicker instance, parse the input value and set dates
            if (this.inputTarget.value) {
              const dates = this._parseDateRangeValue(this.inputTarget.value);
              if (dates.length > 0) {
                // Clear any existing selection first to ensure clean state
                inlineController.datepickerInstance.clear();

                // If it's a range picker and we have a single date or both parsed dates are the same
                if (inlineController.rangeValue) {
                  if (dates.length === 1) {
                    // For single date in range mode, select it twice to complete the range
                    inlineController.datepickerInstance.selectDate([dates[0], dates[0]]);
                  } else if (dates.length === 2 && dates[0].getTime() === dates[1].getTime()) {
                    // For identical start/end dates, select twice to complete the range
                    inlineController.datepickerInstance.selectDate([dates[0], dates[0]]);
                  } else {
                    // For different dates, select normally
                    inlineController.datepickerInstance.selectDate(dates);
                  }
                } else {
                  // Non-range mode, select normally
                  inlineController.datepickerInstance.selectDate(dates);
                }
              }
            } else {
              inlineController.datepickerInstance.clear();
            }
          }
        }
      }
    }
  }

  _parseDateRangeValue(value) {
    // Parse a date range string like "01/15/2025 - 01/20/2025" or "01/15/2025"
    const dates = [];
    if (value.includes(" - ")) {
      const [startStr, endStr] = value.split(" - ");
      const startDate = this._parseFormattedDate(startStr.trim());
      const endDate = this._parseFormattedDate(endStr.trim());
      if (startDate) dates.push(startDate);
      if (endDate) dates.push(endDate);
    } else {
      const date = this._parseFormattedDate(value.trim());
      if (date) dates.push(date);
    }
    return dates;
  }

  _parseFormattedDate(dateStr) {
    // Parse MM/DD/YYYY format
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
      const day = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  }

  _triggerChangeEvent() {
    this.inputTarget.dispatchEvent(new Event("change", { bubbles: true }));
  }

  _setActivePreset(button) {
    this._clearActivePreset();
    if (button) {
      button.classList.remove(...this.constructor.PRESET_CLASSES.inactive);
      button.classList.add(...this.constructor.PRESET_CLASSES.active);
    }
  }

  _clearActivePreset() {
    const dropdownMenu = this.element.querySelector('[data-dropdown-popover-target="menu"]');
    const presetButtons =
      dropdownMenu?.querySelectorAll('[data-menu-target="item"]:not([data-action*="clearSelection"])') || [];

    presetButtons.forEach((button) => {
      button.classList.remove(...this.constructor.PRESET_CLASSES.active);
      button.classList.add(...this.constructor.PRESET_CLASSES.inactive);
    });
  }

  _detectActivePreset() {
    const dateRangeValue = this.inputTarget.value;
    if (!dateRangeValue) return;

    const dates = this._parseDateRangeValue(dateRangeValue);
    if (dates.length !== 2) return;

    const [startDate, endDate] = dates;
    const today = new Date();
    [startDate, endDate, today].forEach((date) => date.setHours(0, 0, 0, 0));

    const dropdownMenu = this.element.querySelector('[data-dropdown-popover-target="menu"]');
    const presetButtons =
      dropdownMenu?.querySelectorAll('[data-menu-target="item"]:not([data-action*="clearSelection"])') || [];

    presetButtons.forEach((button) => {
      const isMatch = this._checkPresetMatch(button, startDate, endDate, today);
      if (isMatch) this._setActivePreset(button);
    });
  }

  _checkPresetMatch(button, startDate, endDate, today) {
    const action = button.dataset.action;

    if (action?.includes("setToday")) {
      return this._isSameDay(startDate, today) && this._isSameDay(endDate, today);
    }

    if (action?.includes("setYesterday")) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return this._isSameDay(startDate, yesterday) && this._isSameDay(endDate, yesterday);
    }

    if (action?.includes("setLastDays")) {
      const days = parseInt(button.dataset.days, 10);
      const expectedStart = new Date(today);
      expectedStart.setDate(expectedStart.getDate() - (days - 1));
      return this._isSameDay(startDate, expectedStart) && this._isSameDay(endDate, today);
    }

    if (action?.includes("setPreset")) {
      const presetType = button.dataset.presetType;
      const presetRanges = {
        "this-month": [
          new Date(today.getFullYear(), today.getMonth(), 1),
          new Date(today.getFullYear(), today.getMonth() + 1, 0),
        ],
        "last-month": [
          new Date(today.getFullYear(), today.getMonth() - 1, 1),
          new Date(today.getFullYear(), today.getMonth(), 0),
        ],
        "this-year": [new Date(today.getFullYear(), 0, 1), new Date(today.getFullYear(), 11, 31)],
      };

      const range = presetRanges[presetType];
      return range && this._isSameDay(startDate, range[0]) && this._isSameDay(endDate, range[1]);
    }

    return false;
  }

  _isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  _updateWeekDisplay() {
    if (!this.datepickerInstance) return;

    const selectedDates = this.datepickerInstance.selectedDates;
    if (selectedDates.length > 0) {
      const initialDate = selectedDates[0];
      const weekNumber = this._getWeekNumber(initialDate);
      const year = initialDate.getFullYear();
      this.inputTarget.value = `${year}-W${weekNumber.toString().padStart(2, "0")}`;
      this._triggerChangeEvent();
    } else {
      this.inputTarget.value = "";
      this._triggerChangeEvent();
    }
  }

  _cleanup() {
    if (this.datepickerInstance) {
      this.datepickerInstance.destroy();
      this.datepickerInstance = null;
    }
    this._cleanupPositioning();
  }

  _cleanupPositioning() {
    [this.cleanupAutoUpdate, this.currentPositionCleanupAutoUpdate].forEach((cleanup) => {
      if (cleanup) cleanup();
    });
    this.cleanupAutoUpdate = null;
    this.currentPositionCleanupAutoUpdate = null;
  }
}
