# Date Picker Component

A flexible date and time picker with support for single dates, ranges, time selection, week selection, and inline display modes.

## Features

- Single date, date range, and multiple date selection
- Time picker with 12/24-hour format support
- Time-only mode for selecting just time
- Week picker mode for week selection
- Inline calendar display (always visible)
- Month and year selector views
- Date constraints (min/max dates)
- Disabled dates support
- Customizable date and time formats
- Floating UI positioning for optimal dropdown placement
- Full keyboard navigation
- Dark mode support

## Dependencies

This component uses **AirDatepicker** for the calendar functionality and **Floating UI** for dropdown positioning.

Install via npm/yarn:
```bash
npm install air-datepicker @floating-ui/dom
# or
yarn add air-datepicker @floating-ui/dom
```

Import in your JavaScript:
```javascript
import AirDatepicker from "air-datepicker";
import localeEn from "air-datepicker/locale/en";
import "air-datepicker/air-datepicker.css";
```

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/date_picker/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/date_picker/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/date_picker/` | Ruby-centric, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `placement` | String | `"bottom-start"` | Dropdown placement relative to input |
| `range` | Boolean | `false` | Enable date range selection |
| `disabledDates` | Array | `[]` | Array of disabled dates (YYYY-MM-DD) |
| `timepicker` | Boolean | `false` | Enable time selection |
| `timeOnly` | Boolean | `false` | Show only time picker |
| `weekPicker` | Boolean | `false` | Enable week selection |
| `timeFormat` | String | `"hh:mm AA"` | Time display format |
| `minHours` | Number | — | Minimum selectable hour |
| `maxHours` | Number | — | Maximum selectable hour |
| `minutesStep` | Number | — | Minutes increment step |
| `showTodayButton` | Boolean | `false` | Show Today/Now button |
| `showClearButton` | Boolean | `false` | Show Clear button |
| `showThisMonthButton` | Boolean | `false` | Show This Month button |
| `showThisYearButton` | Boolean | `false` | Show This Year button |
| `dateFormat` | String | — | Date display format |
| `startView` | String | `"days"` | Initial view: days, months, years |
| `minView` | String | `"days"` | Minimum navigable view |
| `initialDate` | String | — | Pre-selected date (YYYY-MM-DD) |
| `minDate` | String | — | Minimum selectable date |
| `maxDate` | String | — | Maximum selectable date |
| `inline` | Boolean | `false` | Display calendar inline |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `input` | Yes | The input element that displays selected value |
| `inlineCalendar` | No | Container for inline calendar mode |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `setToday` | `click->date-picker#setToday` | Select today's date |
| `setYesterday` | `click->date-picker#setYesterday` | Select yesterday's date |
| `setLastDays` | `click->date-picker#setLastDays` | Select last N days (use `data-days`) |
| `setPreset` | `click->date-picker#setPreset` | Set preset (use `data-preset-type`) |
| `clearSelection` | `click->date-picker#clearSelection` | Clear selected dates |
| `syncFromInlineCalendar` | `change->date-picker#syncFromInlineCalendar` | Sync from inline calendar |
| `syncToMainPicker` | — | Sync inline calendar to main picker |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div data-controller="date-picker"
     data-date-picker-show-today-button-value="true"
     data-date-picker-show-clear-button-value="true"
     class="relative w-full max-w-sm">
  <input class="block w-full rounded-lg border-0 px-3 py-2 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 placeholder:text-neutral-500 focus:ring-2 focus:ring-neutral-600 outline-hidden dark:bg-neutral-700 dark:ring-neutral-600 dark:placeholder-neutral-300 dark:text-white dark:focus:ring-neutral-500 text-base/6 sm:text-sm/6 pr-10"
         readonly
         data-date-picker-target="input"
         placeholder="Select date...">
  <div class="pointer-events-none absolute inset-y-0 right-3 flex items-center justify-center opacity-80">
    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 18 18">
      <g fill="currentColor">
        <path d="M5.75,3.5c-.414,0-.75-.336-.75-.75V.75c0-.414,.336-.75,.75-.75s.75,.336,.75,.75V2.75c0,.414-.336,.75-.75,.75Z"></path>
        <path d="M12.25,3.5c-.414,0-.75-.336-.75-.75V.75c0-.414,.336-.75,.75-.75s.75,.336,.75,.75V2.75c0,.414-.336,.75-.75,.75Z"></path>
        <path d="M13.75,2H4.25c-1.517,0-2.75,1.233-2.75,2.75V13.25c0,1.517,1.233,2.75,2.75,2.75H13.75c1.517,0,2.75-1.233,2.75-2.75V4.75c0-1.517-1.233-2.75-2.75-2.75Zm0,12.5H4.25c-.689,0-1.25-.561-1.25-1.25V7H15v6.25c0,.689-.561,1.25-1.25,1.25Z"></path>
      </g>
    </svg>
  </div>
</div>
```

### Key Modifications

**Enable date range:** Add `data-date-picker-range-value="true"` to the controller element.

**Enable time picker:** Add `data-date-picker-timepicker-value="true"`.

**Set initial date:** Add `data-date-picker-initial-date-value="2025-01-15"`.

**Set constraints:** Add `data-date-picker-min-date-value` and `data-date-picker-max-date-value`.

**Inline calendar:** Add `data-date-picker-inline-value="true"` and make the input hidden.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/date_picker/date_picker",
  id: "appointment_date",
  placeholder: "Select date...",
  show_today_button: true,
  show_clear_button: true
%>
```

### Date Range

```erb
<%= render "shared/components/date_picker/date_picker",
  id: "date_range",
  placeholder: "Select date range...",
  range: true,
  show_today_button: true,
  show_clear_button: true
%>
```

### Date Time Picker

```erb
<%= render "shared/components/date_picker/date_picker",
  id: "datetime",
  placeholder: "Select date & time...",
  timepicker: true,
  value: Time.current,
  show_today_button: true,
  show_clear_button: true
%>
```

### With Constraints

```erb
<%= render "shared/components/date_picker/date_picker",
  id: "booking_date",
  placeholder: "Select date...",
  min_date: Date.today,
  max_date: Date.today + 90.days,
  disabled_dates: [
    (Date.today + 7.days).strftime("%Y-%m-%d"),
    (Date.today + 14.days).strftime("%Y-%m-%d")
  ],
  show_today_button: true,
  show_clear_button: true
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `id` | String | auto | Unique identifier |
| `name` | String | `nil` | Form input name attribute |
| `value` | String/Date/Time | `nil` | Initial selected value |
| `placeholder` | String | `"Select date..."` | Input placeholder text |
| `range` | Boolean | `false` | Enable date range mode |
| `timepicker` | Boolean | `false` | Enable time selection |
| `time_only` | Boolean | `false` | Time picker only |
| `week_picker` | Boolean | `false` | Week selection mode |
| `inline` | Boolean | `false` | Always-visible calendar |
| `date_format` | String | `nil` | Custom date format |
| `time_format` | String | `nil` | Custom time format |
| `min_date` | String/Date | `nil` | Minimum selectable date |
| `max_date` | String/Date | `nil` | Maximum selectable date |
| `disabled_dates` | Array | `[]` | Dates to disable |
| `start_view` | String | `"days"` | Initial view |
| `min_view` | String | `"days"` | Minimum view |
| `placement` | String | `"bottom-start"` | Dropdown placement |
| `show_today_button` | Boolean | `false` | Show Today button |
| `show_clear_button` | Boolean | `false` | Show Clear button |
| `show_this_month_button` | Boolean | `false` | Show This Month button |
| `show_this_year_button` | Boolean | `false` | Show This Year button |
| `min_hours` | Integer | `nil` | Min hour for timepicker |
| `max_hours` | Integer | `nil` | Max hour for timepicker |
| `minutes_step` | Integer | `nil` | Minutes increment |
| `readonly` | Boolean | `true` | Make input readonly |
| `required` | Boolean | `false` | Make input required |
| `disabled` | Boolean | `false` | Disable the input |
| `show_icon` | Boolean | `true` | Show calendar icon |
| `input_class` | String | `nil` | Additional input classes |
| `classes` | String | `nil` | Additional wrapper classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render DatePicker::Component.new(
  id: "appointment_date",
  placeholder: "Select date...",
  show_today_button: true,
  show_clear_button: true
) %>
```

### Date Range

```erb
<%= render DatePicker::Component.new(
  id: "date_range",
  placeholder: "Select date range...",
  range: true,
  show_today_button: true,
  show_clear_button: true
) %>
```

### Date Time Picker

```erb
<%= render DatePicker::Component.new(
  id: "datetime",
  placeholder: "Select date & time...",
  timepicker: true,
  value: Time.current,
  show_today_button: true,
  show_clear_button: true
) %>
```

### With Form Builder

```erb
<%= form_with model: @appointment do |f| %>
  <%= render DatePicker::Component.new(
    id: "appointment_scheduled_at",
    name: "appointment[scheduled_at]",
    value: @appointment.scheduled_at,
    timepicker: true,
    required: true,
    show_today_button: true,
    show_clear_button: true
  ) %>
<% end %>
```

### Inline Calendar

```erb
<%= render DatePicker::Component.new(
  id: "inline_calendar",
  value: Date.today,
  inline: true,
  show_today_button: true,
  show_clear_button: true
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `id` | String | auto | Unique identifier |
| `name` | String | `nil` | Form input name |
| `value` | String/Date/Time | `nil` | Initial value |
| `placeholder` | String | `"Select date..."` | Placeholder text |
| `range` | Boolean | `false` | Date range mode |
| `timepicker` | Boolean | `false` | Enable time picker |
| `time_only` | Boolean | `false` | Time only mode |
| `week_picker` | Boolean | `false` | Week selection mode |
| `inline` | Boolean | `false` | Inline calendar |
| `date_format` | String | `nil` | Date format |
| `time_format` | String | `nil` | Time format |
| `min_date` | String/Date | `nil` | Min date |
| `max_date` | String/Date | `nil` | Max date |
| `disabled_dates` | Array | `[]` | Disabled dates |
| `start_view` | String | `"days"` | Initial view |
| `min_view` | String | `"days"` | Minimum view |
| `placement` | String | `"bottom-start"` | Dropdown placement |
| `show_today_button` | Boolean | `false` | Today button |
| `show_clear_button` | Boolean | `false` | Clear button |
| `show_this_month_button` | Boolean | `false` | This Month button |
| `show_this_year_button` | Boolean | `false` | This Year button |
| `min_hours` | Integer | `nil` | Min hour |
| `max_hours` | Integer | `nil` | Max hour |
| `minutes_step` | Integer | `nil` | Minutes step |
| `readonly` | Boolean | `true` | Readonly input |
| `required` | Boolean | `false` | Required input |
| `disabled` | Boolean | `false` | Disabled input |
| `show_icon` | Boolean | `true` | Show icon |
| `input_class` | String | `nil` | Input classes |
| `classes` | String | `nil` | Wrapper classes |

---

## Selection Modes

| Mode | Value Config | Description |
| ---- | ------------ | ----------- |
| Single Date | default | Select one date |
| Date Range | `range: true` | Select start and end dates |
| Date Time | `timepicker: true` | Select date and time |
| Time Only | `time_only: true` | Select only time |
| Week | `week_picker: true` | Select entire week |
| Month | `start_view: "months", min_view: "months"` | Select month |
| Year | `start_view: "years", min_view: "years"` | Select year |

---

## Date Format Tokens

AirDatepicker uses the following format tokens:

| Token | Description | Example |
| ----- | ----------- | ------- |
| `d` | Day of month | 1-31 |
| `dd` | Day with leading zero | 01-31 |
| `E` | Short day name | Mon |
| `EEEE` | Full day name | Monday |
| `M` | Month | 1-12 |
| `MM` | Month with leading zero | 01-12 |
| `MMM` | Short month name | Jan |
| `MMMM` | Full month name | January |
| `yy` | 2-digit year | 25 |
| `yyyy` | 4-digit year | 2025 |
| `h` | Hours (12-hour) | 1-12 |
| `hh` | Hours with zero (12-hour) | 01-12 |
| `H` | Hours (24-hour) | 0-23 |
| `HH` | Hours with zero (24-hour) | 00-23 |
| `m` | Minutes | 0-59 |
| `mm` | Minutes with zero | 00-59 |
| `AA` | AM/PM | AM, PM |

---

## Accessibility

- Input is readonly by default to prevent invalid manual entry
- Keyboard navigation within the calendar
- Focus management when opening/closing
- Clear button for easy date removal

---

## Troubleshooting

**Calendar doesn't appear:** Ensure AirDatepicker CSS is imported and the Stimulus controller is connected.

**Wrong date format:** Use the `date_format` option with valid AirDatepicker format tokens.

**Time not showing:** Ensure `timepicker: true` is set and `time_only` is `false` if you want both date and time.

**Calendar position issues:** Check that Floating UI is properly imported and the `placement` value is valid.

**Disabled dates not working:** Ensure dates are in `YYYY-MM-DD` format as strings.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/date_picker/`
- **Shared partial files**: `app/views/shared/components/date_picker/`
- **shared partial**: `render "shared/components/date_picker/date_picker"`
- **ViewComponent**: `render DatePicker::Component.new(...)`
- **ViewComponent files**: `app/components/date_picker/`

### Implementation Checklist

- Pick one implementation path first, then stay consistent within that example.
- Use only documented locals, initializer arguments, variants, and slot names.
- Copy the base example before adding app-specific styling or behavior.
- If the component is interactive, keep the documented Stimulus controller, targets, values, and ARIA wiring intact.
- Keep variant names, enum values, and option formats exactly as documented.

### Common Patterns

- **Vanilla / plain ERB**: Best for one-off pages, direct markup edits, and quick adaptations of the shipped examples.
- **shared partial**: Best for reusable Rails view partials driven by locals or collections.
- **ViewComponent**: Best for reusable component implementations that benefit from Ruby-side defaults, slots, or testable composition.

### Common Mistakes

- Do not mix shared partial locals with ViewComponent initializer arguments in the same example.
- Do not invent undocumented variants, sizes, slot names, or helper methods.
- Do not remove required wrapper elements, IDs, or data attributes when copying the component.
- Do not swap the documented render path for a guessed partial or component name.