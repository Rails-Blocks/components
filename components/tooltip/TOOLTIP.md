# Tooltip Component

Contextual information displayed on hover, focus, or click. Built with Floating UI for intelligent positioning and auto-flipping.

## Features

- 12 placement positions (top, bottom, left, right with -start/-end variants)
- Smart auto-positioning and flipping
- Three text sizes (small, regular, large)
- Multiple animation styles (fade, origin, combined)
- Configurable delay before showing
- Optional arrow indicator
- Touch-friendly click trigger support
- Global state management (only one tooltip visible at a time)
- Works inside modals and dialogs

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/tooltip/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/tooltip/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/tooltip/` | Block-style content, testing |

---

## Stimulus Controller

**Requires:** Floating UI library (`@floating-ui/dom`)

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `placement` | String | `"top"` | Tooltip position |
| `offset` | Number | `8` | Distance from trigger element in pixels |
| `maxWidth` | Number | `200` | Maximum tooltip width in pixels |
| `delay` | Number | `0` | Delay before showing (milliseconds) |
| `size` | String | `"regular"` | Text size: `"small"`, `"regular"`, `"large"` |
| `animation` | String | `"fade"` | Animation: `"fade"`, `"origin"`, `"fade origin"`, `"none"` |
| `trigger` | String | `"auto"` | Trigger events: `"mouseenter"`, `"focus"`, `"click"`, `"auto"` |
| `kbd` | String | `""` | Optional keyboard shortcut rendered as a styled `<kbd>` at the end |
| `macKbd` | String | `""` | Optional Mac-specific shortcut. Use `cmd` or `command` for the Command icon |
| `nonMacKbd` | String | `""` | Optional Windows/Linux shortcut |

### Data Attributes

| Attribute | Description |
| --------- | ----------- |
| `data-tooltip-content` | The tooltip text content (required) |
| `data-tooltip-kbd-value` | Optional keyboard shortcut shown at the end. Empty values are ignored |
| `data-tooltip-mac-kbd-value` | Optional Mac-specific shortcut. Overrides `data-tooltip-kbd-value` on Mac |
| `data-tooltip-non-mac-kbd-value` | Optional Windows/Linux shortcut. Overrides `data-tooltip-kbd-value` outside Mac |
| `data-tooltip-arrow` | Set to `"false"` to hide the arrow |

### Placement Values

```
top-start    top    top-end
left-start  [    ]  right-start
left        [elem]  right
left-end    [    ]  right-end
bottom-start bottom bottom-end
```

---

## Plain ERB

Copy the code and add `data-controller="tooltip"` with `data-tooltip-content` to any element.

### Basic Example

```erb
<button
  data-controller="tooltip"
  data-tooltip-content="This is a simple tooltip"
  class="px-4 py-2 bg-neutral-100 rounded-lg">
  Hover me
</button>
```

### With Options

```erb
<button
  data-controller="tooltip"
  data-tooltip-content="Tooltip on bottom with delay"
  data-tooltip-mac-kbd-value="cmd K"
  data-tooltip-non-mac-kbd-value="Ctrl K"
  data-tooltip-placement-value="bottom"
  data-tooltip-delay-value="300"
  data-tooltip-arrow="false"
  class="px-4 py-2 bg-neutral-100 rounded-lg">
  Custom Tooltip
</button>
```

### Icon Button Example

```erb
<button
  data-controller="tooltip"
  data-tooltip-content="Settings"
  data-tooltip-placement-value="bottom"
  class="p-2 rounded-lg hover:bg-neutral-100">
  <svg class="size-5"><!-- icon --></svg>
</button>
```

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/tooltip/tooltip", text: "Helpful info" do %>
  <button class="btn">Hover me</button>
<% end %>
```

### With Options

```erb
<%= render "shared/components/tooltip/tooltip",
  text: "This tooltip appears below after a delay",
  placement: "bottom",
  delay: 300,
  max_width: 250,
  size: "small",
  animation: "fade origin",
  mac_kbd: "cmd K",
  non_mac_kbd: "Ctrl K"
do %>
  <button class="btn">Custom Options</button>
<% end %>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `text` | String | required | Tooltip text content |
| `placement` | String | `"top"` | Position (see placement values above) |
| `offset` | Integer | `8` | Distance from element in pixels |
| `max_width` | Integer | `200` | Maximum width in pixels |
| `delay` | Integer | `0` | Show delay in milliseconds |
| `size` | String | `"regular"` | `"small"`, `"regular"`, `"large"` |
| `animation` | String | `"fade"` | `"fade"`, `"origin"`, `"fade origin"`, `"none"` |
| `trigger` | String | `"auto"` | `"mouseenter"`, `"focus"`, `"click"`, `"auto"` |
| `kbd` | String | `nil` | Optional keyboard shortcut shown at the end |
| `mac_kbd` | String | `nil` | Optional Mac-specific shortcut |
| `non_mac_kbd` | String | `nil` | Optional Windows/Linux shortcut |
| `arrow` | Boolean | `true` | Show arrow indicator |
| `classes` | String | `nil` | Additional wrapper classes |
| `tag` | String | `"span"` | HTML tag for wrapper |

---

## ViewComponent

### Basic Usage

```erb
<%= render Tooltip::Component.new(text: "Helpful info") do %>
  <button class="btn">Hover me</button>
<% end %>
```

### With Options

```erb
<%= render Tooltip::Component.new(
  text: "This tooltip appears below after a delay",
  placement: "bottom",
  delay: 300,
  max_width: 250,
  size: :small,
  animation: "fade origin",
  mac_kbd: "cmd K",
  non_mac_kbd: "Ctrl K"
) do %>
  <button class="btn">Custom Options</button>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `text` | String | required | Tooltip text content |
| `placement` | String | `"top"` | Position |
| `offset` | Integer | `8` | Distance from element in pixels |
| `max_width` | Integer | `200` | Maximum width in pixels |
| `delay` | Integer | `0` | Show delay in milliseconds |
| `size` | Symbol | `:regular` | `:small`, `:regular`, `:large` |
| `animation` | String | `"fade"` | `"fade"`, `"origin"`, `"fade origin"`, `"none"` |
| `trigger` | String | `"auto"` | `"mouseenter"`, `"focus"`, `"click"`, `"auto"` |
| `kbd` | String | `nil` | Optional keyboard shortcut shown at the end |
| `mac_kbd` | String | `nil` | Optional Mac-specific shortcut |
| `non_mac_kbd` | String | `nil` | Optional Windows/Linux shortcut |
| `arrow` | Boolean | `true` | Show arrow indicator |
| `classes` | String | `nil` | Additional wrapper classes |
| `tag` | String | `"span"` | HTML tag for wrapper |

---

## Trigger Modes

| Trigger | Description |
| ------- | ----------- |
| `auto` | Auto-detects: hover+focus on desktop, click on touch devices |
| `mouseenter` | Show on hover |
| `focus` | Show on focus (keyboard navigation) |
| `click` | Show/hide on click (toggle mode) |
| `mouseenter focus` | Show on hover or focus |

---

## Animations

| Animation | Description |
| --------- | ----------- |
| `fade` | Opacity transition (default) |
| `origin` | Scale from origin point |
| `fade origin` | Combined fade and scale |
| `none` | No animation, instant show/hide |

---

## Accessibility

- Tooltips are announced to screen readers via `aria-labelledby`
- Focus trigger ensures keyboard users can access tooltip content
- Auto mode provides appropriate interaction for touch devices
- Tooltips hide when trigger element scrolls out of view

---

## Common Patterns

### Help Icon

```erb
<%= render "shared/components/tooltip/tooltip",
  text: "Learn more about this feature",
  placement: "right"
do %>
  <button type="button" class="cursor-help size-5 rounded-full border text-xs">?</button>
<% end %>
```

### Table Action Buttons

```erb
<div class="flex gap-1">
  <%= render "shared/components/tooltip/tooltip", text: "Edit", delay: 300 do %>
    <button class="p-1 hover:bg-neutral-100 rounded">
      <svg class="size-4"><!-- edit icon --></svg>
    </button>
  <% end %>

  <%= render "shared/components/tooltip/tooltip", text: "Delete", delay: 300 do %>
    <button class="p-1 hover:bg-red-100 text-red-600 rounded">
      <svg class="size-4"><!-- delete icon --></svg>
    </button>
  <% end %>
</div>
```

### Truncated Text

```erb
<%= render "shared/components/tooltip/tooltip",
  text: @item.full_description,
  max_width: 300
do %>
  <span class="truncate max-w-xs block"><%= @item.full_description %></span>
<% end %>
```

### Status Indicator

```erb
<%= render "shared/components/tooltip/tooltip",
  text: "System operational",
  classes: "inline-flex items-center gap-2"
do %>
  <div class="size-2 rounded-full bg-green-500"></div>
  <span>Online</span>
<% end %>
```

---

## Troubleshooting

**Tooltip not appearing:** Ensure `data-tooltip-content` has a value and the Stimulus controller is loaded.

**Positioning issues:** Check that Floating UI is properly imported. The tooltip auto-flips when near viewport edges.

**Multiple tooltips showing:** The global state manager should handle this automatically. Ensure you're not creating multiple tooltip instances on the same element.

**Not working in modals:** The controller automatically detects open dialogs and appends the tooltip to the dialog element.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/tooltip/`
- **Shared partial files**: `app/views/shared/components/tooltip/`
- **shared partial**: `render "shared/components/tooltip/tooltip"`
- **ViewComponent**: `render Tooltip::Component.new(...)`
- **ViewComponent files**: `app/components/tooltip/`

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