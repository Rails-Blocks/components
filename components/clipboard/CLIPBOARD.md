# Clipboard Component

Copy text to clipboard with visual feedback, floating tooltips, and customizable button styles.

## Features

- One-click copy to clipboard using the Clipboard API
- Floating tooltip feedback with Floating UI positioning
- Visual state change (copy icon → check icon)
- Multiple button variants (primary, secondary, outline, ghost)
- Three sizes (sm, md, lg)
- Icon-only mode for compact UIs
- Customizable tooltip placement (12 positions)
- Configurable tooltip duration and offset

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/clipboard/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/clipboard/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/clipboard/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `successMessage` | String | `"Copied!"` | Message shown in tooltip on successful copy |
| `errorMessage` | String | `"Failed to copy!"` | Message shown in tooltip on copy failure |
| `showTooltip` | Boolean | `true` | Whether to show the floating tooltip |
| `tooltipPlacement` | String | `"top"` | Tooltip position (see Placements below) |
| `tooltipOffset` | Number | `8` | Distance from trigger element in pixels |
| `tooltipDuration` | Number | `2000` | How long tooltip stays visible (ms) |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `copyContent` | No | Element shown in default state (before copy) |
| `copiedContent` | No | Element shown after successful copy |

### Data Attributes

| Attribute | Required | Description |
| --------- | -------- | ----------- |
| `data-clipboard-text` | Yes | The text content to copy to clipboard |

### Tooltip Placements

Supported values for `tooltipPlacement`:
- `top`, `top-start`, `top-end`
- `bottom`, `bottom-start`, `bottom-end`
- `left`, `left-start`, `left-end`
- `right`, `right-start`, `right-end`

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<button
  class="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-400/30 bg-neutral-800 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-all duration-100 ease-in-out select-none hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus-visible:outline-neutral-200"
  data-controller="clipboard"
  data-clipboard-text="Hello from Rails Blocks!">
  Copy Text
</button>
```

### With Icon State Change

```erb
<button
  class="flex items-center justify-center gap-1.5 rounded-lg border border-neutral-400/30 bg-neutral-800 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-all duration-100 ease-in-out select-none hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-neutral-800 dark:hover:bg-neutral-100 dark:focus-visible:outline-neutral-200"
  data-controller="clipboard"
  data-clipboard-text="https://railsblocks.com"
  data-clipboard-success-message-value="URL Copied!">
  <div data-clipboard-target="copyContent" class="flex items-center gap-1.5">
    <span>Copy URL</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 18 18">
      <g fill="currentColor">
        <path d="M12.75,2h-.275c-.123-.846-.845-1.5-1.725-1.5h-3.5c-.879,0-1.602,.654-1.725,1.5h-.275c-1.517,0-2.75,1.233-2.75,2.75V14.25c0,1.517,1.233,2.75,2.75,2.75h7.5c1.517,0,2.75-1.233,2.75-2.75V4.75c0-1.517-1.233-2.75-2.75-2.75Zm-5.75,.25c0-.138,.112-.25,.25-.25h3.5c.138,0,.25,.112,.25,.25v1c0,.138-.112,.25-.25,.25h-3.5c-.138,0-.25-.112-.25-.25v-1Zm4.75,10.25H6.25c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75h5.5c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Zm0-3H6.25c-.414,0-.75-.336-.75-.75s.336-.75,.75-.75h5.5c.414,0,.75,.336,.75,.75s-.336,.75-.75,.75Z"></path>
      </g>
    </svg>
  </div>
  <div data-clipboard-target="copiedContent" class="hidden flex items-center gap-1.5 text-green-400">
    <span>Copied!</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 18 18">
      <g fill="currentColor">
        <path d="M6.75,15h-.002c-.227,0-.442-.104-.583-.281L2.165,9.719c-.259-.324-.207-.795,.117-1.054,.325-.259,.796-.206,1.054,.117l3.418,4.272L14.667,3.278c.261-.322,.732-.373,1.055-.111,.322,.261,.372,.733,.111,1.055L7.333,14.722c-.143,.176-.357,.278-.583,.278Z"></path>
      </g>
    </svg>
  </div>
</button>
```

### Key Modifications

**Custom tooltip position:** Add `data-clipboard-tooltip-placement-value="bottom"` (or any valid placement).

**Disable tooltip:** Add `data-clipboard-show-tooltip-value="false"`.

**Longer tooltip duration:** Add `data-clipboard-tooltip-duration-value="5000"` (in milliseconds).

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/clipboard/clipboard",
  content: "Hello from Rails Blocks!"
%>
```

### With Options

```erb
<%= render "shared/components/clipboard/clipboard",
  content: "https://railsblocks.com",
  button_text: "Copy URL",
  copied_text: "URL Copied!",
  success_message: "Link copied to clipboard!",
  variant: "secondary",
  tooltip_placement: "bottom"
%>
```

### Icon Only

```erb
<%= render "shared/components/clipboard/clipboard",
  content: "Secret text",
  icon_only: true,
  variant: "ghost"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `content` | String | required | Text to copy to clipboard |
| `button_text` | String | `"Copy"` | Button label text |
| `copied_text` | String | `"Copied!"` | Text shown after successful copy |
| `success_message` | String | `"Copied!"` | Tooltip success message |
| `error_message` | String | `"Failed to copy!"` | Tooltip error message |
| `show_tooltip` | Boolean | `true` | Show floating tooltip |
| `tooltip_placement` | String | `"top"` | Tooltip position |
| `tooltip_offset` | Integer | `8` | Tooltip offset in pixels |
| `tooltip_duration` | Integer | `2000` | Tooltip display time (ms) |
| `show_icon` | Boolean | `true` | Show copy/check icons |
| `show_copied_state` | Boolean | `true` | Show visual state change |
| `variant` | String | `"primary"` | `"primary"`, `"secondary"`, `"outline"`, `"ghost"` |
| `size` | String | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `icon_only` | Boolean | `false` | Show only icon, no text |
| `classes` | String | `nil` | Additional CSS classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render Clipboard::Component.new(
  text: "Hello from Rails Blocks!"
) %>
```

### With Options

```erb
<%= render Clipboard::Component.new(
  text: "https://railsblocks.com",
  button_text: "Copy URL",
  copied_text: "URL Copied!",
  success_message: "Link copied to clipboard!",
  variant: :secondary,
  tooltip_placement: "bottom"
) %>
```

### Icon Only

```erb
<%= render Clipboard::Component.new(
  text: "Secret text",
  icon_only: true,
  variant: :ghost
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `text` | String | required | Text to copy to clipboard |
| `button_text` | String | `"Copy"` | Button label text |
| `copied_text` | String | `"Copied!"` | Text shown after successful copy |
| `success_message` | String | `"Copied!"` | Tooltip success message |
| `error_message` | String | `"Failed to copy!"` | Tooltip error message |
| `show_tooltip` | Boolean | `true` | Show floating tooltip |
| `tooltip_placement` | String | `"top"` | Tooltip position |
| `tooltip_offset` | Integer | `8` | Tooltip offset in pixels |
| `tooltip_duration` | Integer | `2000` | Tooltip display time (ms) |
| `show_icon` | Boolean | `true` | Show copy/check icons |
| `show_copied_state` | Boolean | `true` | Show visual state change |
| `variant` | Symbol | `:primary` | `:primary`, `:secondary`, `:outline`, `:ghost` |
| `size` | Symbol | `:md` | `:sm`, `:md`, `:lg` |
| `icon_only` | Boolean | `false` | Show only icon, no text |
| `classes` | String | `nil` | Additional CSS classes |

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `primary` | Dark filled button |
| `secondary` | Light filled button |
| `outline` | Transparent with border |
| `ghost` | Minimal hover-only surface |

---

## Sizes

| Size | Description |
| ---- | ----------- |
| `sm` | Compact, smaller padding and text |
| `md` | Default size, balanced proportions |
| `lg` | Larger, more prominent button |

---

## Accessibility

- Uses `<button type="button">` for proper semantics
- Focus states with visible outline
- Keyboard accessible (Enter/Space to trigger)
- Tooltip provides visual feedback for screen reader users
- `disabled` state styling included

---

## Dependencies

This component requires Floating UI for tooltip positioning. Ensure it's available:

```js
// In importmap.rb or package.json
import { computePosition, offset, flip, shift, arrow, autoUpdate } from "@floating-ui/dom";
```

---

## Troubleshooting

**Tooltip doesn't appear:** Check that `showTooltip` value is `true` and Floating UI is properly imported.

**Copy fails silently:** The Clipboard API requires HTTPS in production. Check browser console for errors.

**State doesn't change:** Ensure `copyContent` and `copiedContent` targets are present with correct `data-clipboard-target` attributes.

**Tooltip in wrong position:** Check `tooltipPlacement` value is valid. Try `"top"` or `"bottom"` for simpler positioning.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/clipboard/`
- **Shared partial files**: `app/views/shared/components/clipboard/`
- **shared partial**: `render "shared/components/clipboard/clipboard"`
- **ViewComponent**: `render Clipboard::Component.new(...)`
- **ViewComponent files**: `app/components/clipboard/`

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