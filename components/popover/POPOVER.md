# Popover Component

Floating content panels triggered by click or hover, positioned intelligently using Floating UI.

## Features

- Multiple trigger types (hover, click)
- 12 placement positions with automatic flipping
- Interactive mode for menus and forms
- Configurable arrow with automatic positioning
- Smooth fade and scale animations
- Delay option for hover triggers
- Close button support inside content
- Works inside dialogs and modals
- Auto-hides when trigger scrolls out of view

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/popover/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/popover/` | Reusable partials, quick setup |
| **ViewComponent** | `app/components/popover/` | Custom triggers, block content |

---

## Stimulus Controller

### Dependencies

Requires Floating UI library:

```javascript
import { computePosition, offset, flip, shift, autoUpdate, arrow } from "@floating-ui/dom";
```

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `placement` | String | `"top"` | Position relative to trigger (see Placements) |
| `trigger` | String | `"mouseenter focus"` | Event(s) that open the popover |
| `interactive` | Boolean | `false` | Allow interaction with popover content |
| `offset` | Number | `10` | Distance from trigger in pixels |
| `maxWidth` | Number | `300` | Maximum width in pixels |
| `hasArrow` | Boolean | `true` | Show arrow pointing to trigger |
| `animation` | String | `"fade"` | Animation type: `"fade"`, `"origin"`, `"fade origin"`, `"none"` |
| `delay` | Number | `0` | Delay before showing (milliseconds) |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `content` | Yes | Template element containing popover content |
| `button` | No | Custom trigger element (defaults to controller element) |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `show` | `popover#show` | Opens the popover |
| `hide` | `popover#hide` | Closes the popover |
| `close` | `popover#close` | Alias for hide (for close buttons) |

### Placements

Supports all 12 Floating UI placements:

| Position | Variations |
| -------- | ---------- |
| Top | `top`, `top-start`, `top-end` |
| Bottom | `bottom`, `bottom-start`, `bottom-end` |
| Left | `left`, `left-start`, `left-end` |
| Right | `right`, `right-start`, `right-end` |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div class="inline-block relative" data-controller="popover">
  <button type="button" class="px-3 py-2 bg-neutral-100 rounded-lg hover:bg-neutral-200">
    Hover me
  </button>

  <template data-popover-target="content">
    <p class="border-b border-b-neutral-100 bg-neutral-50 px-3 py-2.5 rounded-t-[0.4375rem] font-semibold dark:border-neutral-700/75 dark:bg-neutral-700/25 text-neutral-700 dark:text-neutral-200">
      Help Information
    </p>
    <div class="p-3 text-neutral-500 dark:text-neutral-300">
      <p>This is helpful information about the feature.</p>
    </div>
  </template>
</div>
```

### Key Modifications

**Click trigger:** Add `data-popover-trigger-value="click"` to the controller element.

**Interactive content:** Add `data-popover-interactive-value="true"` for forms or menus.

**Change position:** Add `data-popover-placement-value="bottom"` (or any placement).

**No arrow:** Add `data-popover-has-arrow-value="false"`.

**Close button:** Add `data-popover-close-button` attribute to any button inside the content.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/popover/popover",
  title: "Help",
  trigger_text: "Hover for help" do %>
  <p>This popover provides helpful information.</p>
<% end %>
```

### With Options

```erb
<%= render "shared/components/popover/popover",
  placement: "bottom",
  trigger_type: "click",
  interactive: true,
  animation: "fade origin",
  title: "Quick Actions",
  trigger_text: "Open Menu" do %>
  <div class="space-y-1">
    <button class="w-full text-left px-3 py-2 hover:bg-neutral-100">Edit</button>
    <button class="w-full text-left px-3 py-2 hover:bg-neutral-100">Delete</button>
    <button data-popover-close-button class="w-full text-left px-3 py-2 hover:bg-neutral-100">Cancel</button>
  </div>
<% end %>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `placement` | String | `"top"` | Popover position (see Placements) |
| `trigger_type` | String | `"hover"` | `"hover"` or `"click"` |
| `interactive` | Boolean | `false` | Allow content interaction |
| `offset` | Integer | `10` | Distance from trigger (pixels) |
| `max_width` | Integer | `300` | Maximum width (pixels) |
| `arrow` | Boolean | `true` | Show arrow |
| `animation` | String | `"fade"` | Animation type |
| `delay` | Integer | `0` | Show delay (milliseconds) |
| `trigger_text` | String | `"Open Popover"` | Trigger button text |
| `trigger_classes` | String | `nil` | Additional trigger classes |
| `classes` | String | `nil` | Additional wrapper classes |
| `title` | String | `nil` | Optional header title |
| `content_text` | String | `nil` | Simple text content (alternative to block) |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Popover::Component.new(
  trigger_text: "Hover me",
  title: "Help Information"
)) do |popover| %>
  <% popover.with_panel do %>
    <p>This popover provides additional context and information.</p>
  <% end %>
<% end %>
```

### With Options

```erb
<%= render(Popover::Component.new(
  trigger_type: "click",
  interactive: true,
  placement: "bottom-start",
  animation: "fade origin",
  trigger_text: "Open Settings",
  title: "Settings"
)) do |popover| %>
  <% popover.with_panel do %>
    <div class="py-1">
      <a href="#" class="block px-4 py-2 hover:bg-neutral-100">Profile</a>
      <a href="#" class="block px-4 py-2 hover:bg-neutral-100">Settings</a>
      <button data-popover-close-button class="w-full text-left px-4 py-2 text-red-500">
        Close
      </button>
    </div>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `placement` | String | `"top"` | Popover position (see Placements) |
| `trigger_type` | String | `"hover"` | `"hover"` or `"click"` |
| `interactive` | Boolean | `false` | Allow content interaction |
| `offset` | Integer | `10` | Distance from trigger (pixels) |
| `max_width` | Integer | `300` | Maximum width (pixels) |
| `arrow` | Boolean | `true` | Show arrow |
| `animation` | String | `"fade"` | Animation type |
| `delay` | Integer | `0` | Show delay (milliseconds) |
| `trigger_text` | String | `"Open Popover"` | Default trigger text (when no slot) |
| `trigger_classes` | String | `nil` | Additional trigger classes |
| `classes` | String | `nil` | Additional wrapper classes |
| `title` | String | `nil` | Optional panel header title |

### Slots

| Slot | Description |
| ---- | ----------- |
| `trigger` | Custom trigger element (button, link, icon, etc.) |
| `panel` | Popover content |

---

## Animation Types

| Animation | Description |
| --------- | ----------- |
| `fade` | Opacity transition only |
| `origin` | Scale from placement origin |
| `fade origin` | Combined fade and scale |
| `none` | No animation |

---

## Common Patterns

### Help Icon Popover

```erb
<div class="inline-block relative" data-controller="popover">
  <button type="button" class="cursor-help flex items-center justify-center size-5 rounded-full border border-neutral-200 bg-neutral-50 text-xs font-semibold">
    ?
  </button>
  <template data-popover-target="content">
    <div class="p-3 text-sm max-w-xs">
      <p>Helpful explanation text goes here.</p>
    </div>
  </template>
</div>
```

### Share Menu

```erb
<div class="inline-block relative" data-controller="popover" data-popover-trigger-value="click" data-popover-interactive-value="true">
  <button class="px-3 py-2 bg-neutral-100 rounded-lg">Share</button>
  <template data-popover-target="content">
    <p class="border-b px-3 py-2 font-semibold bg-neutral-50">Share via</p>
    <div class="p-2 flex gap-2">
      <a href="#" class="p-2 hover:bg-neutral-100 rounded">Twitter</a>
      <a href="#" class="p-2 hover:bg-neutral-100 rounded">Facebook</a>
      <a href="#" class="p-2 hover:bg-neutral-100 rounded">Email</a>
    </div>
  </template>
</div>
```

### Filter Form

```erb
<div class="inline-block relative" data-controller="popover" data-popover-trigger-value="click" data-popover-interactive-value="true" data-popover-placement-value="bottom-start">
  <button class="px-3 py-2 bg-neutral-100 rounded-lg">Filters</button>
  <template data-popover-target="content">
    <form class="p-3 space-y-3">
      <label class="flex items-center gap-2">
        <input type="checkbox" /> Option 1
      </label>
      <label class="flex items-center gap-2">
        <input type="checkbox" /> Option 2
      </label>
      <div class="flex gap-2 pt-2 border-t">
        <button type="reset" class="px-3 py-1 border rounded">Clear</button>
        <button data-popover-close-button type="button" class="px-3 py-1 bg-neutral-800 text-white rounded">Apply</button>
      </div>
    </form>
  </template>
</div>
```

---

## Accessibility

- Trigger element receives focus outline
- Content is hidden from screen readers when closed
- Interactive content is keyboard navigable
- Close buttons are clearly labeled

---

## Troubleshooting

**Popover doesn't appear:** Ensure the `<template data-popover-target="content">` element exists inside the controller element.

**Popover closes immediately on interactive content:** Add `data-popover-interactive-value="true"` to the controller.

**Arrow doesn't position correctly:** The arrow needs the Floating UI `arrow` middleware. Ensure it's imported.

**Popover appears behind other elements:** The popover is appended to the nearest open `dialog` (or `document.body`) and forced to `z-index: 2147483647` in the controller for stable layering above sticky UI.

**Click trigger doesn't toggle:** Verify `data-popover-trigger-value="click"` is set correctly.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/popover/`
- **Shared partial files**: `app/views/shared/components/popover/`
- **shared partial**: `render "shared/components/popover/popover"`
- **ViewComponent**: `render Popover::Component.new(...)`
- **ViewComponent files**: `app/components/popover/`

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