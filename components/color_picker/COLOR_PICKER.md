# Color Picker Component

A Shoelace-powered color picker for Rails with support for swatches, multiple output formats, alpha channel, and form submission.

## Features

- Shoelace `<sl-color-picker>` with modern UI
- Multiple output formats (hex, RGB, HSL, HSV)
- Optional alpha/opacity support
- Optional custom swatch buttons under the picker
- Hidden input sync for form submissions
- Two-way sync via Stimulus (`shoelace-color-picker`)
- Disabled and required states
- Dark mode support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/color_picker/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/color_picker/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/color_picker/` | Ruby API + testability |

---

## Dependencies

Add Shoelace to your layout:

```erb
<script type="module" src="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/components/color-picker/color-picker.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/light.css" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.20.1/cdn/themes/dark.css" />
```

---

## Stimulus Controller

`app/javascript/controllers/shoelace_color_picker_controller.js`

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `defaultValue` | String | `"#3b82f6"` | Fallback color if picker value is blank |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `picker` | Yes | The `<sl-color-picker>` element |
| `value` | No | Text node/code that displays current value |
| `input` | No | Hidden input synced for form submits |
| `swatch` | No | Custom swatch buttons (`data-color`) |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `change` | `sl-change->shoelace-color-picker#change` | Syncs value on picker change |
| `selectSwatch` | `click->shoelace-color-picker#selectSwatch` | Updates picker from custom swatch button |

### Events

| Event | Detail | Description |
| ----- | ------ | ----------- |
| `color-picker:change` | `{ color }` | Dispatched after each change |

---

## Plain ERB

### Basic Example

```erb
<div data-controller="shoelace-color-picker" data-shoelace-color-picker-default-value-value="#3b82f6">
  <sl-color-picker
    label="Brand Color"
    value="#3b82f6"
    format="hex"
    size="medium"
    data-shoelace-color-picker-target="picker"
    data-action="sl-change->shoelace-color-picker#change"
  ></sl-color-picker>

  <code data-shoelace-color-picker-target="value">#3b82f6</code>
</div>
```

### With Opacity + Swatches

```erb
<div data-controller="shoelace-color-picker" data-shoelace-color-picker-default-value-value="#f5a623ff">
  <sl-color-picker
    label="Background"
    value="#f5a623ff"
    format="hex"
    opacity
    no-format-toggle
    swatches="#f5a623ff; #3b82f6ff; #10b981ff"
    data-shoelace-color-picker-target="picker"
    data-action="sl-change->shoelace-color-picker#change"
  ></sl-color-picker>

  <input type="hidden" name="settings[background_color]" value="#f5a623ff" data-shoelace-color-picker-target="input">
  <code data-shoelace-color-picker-target="value">#f5a623ff</code>
</div>
```

### With Custom Swatch Buttons

```erb
<div data-controller="shoelace-color-picker" data-shoelace-color-picker-default-value-value="#4a5568">
  <sl-color-picker
    label="Brand Color"
    value="#4a5568"
    format="hex"
    size="medium"
    data-shoelace-color-picker-target="picker"
    data-action="sl-change->shoelace-color-picker#change"
  ></sl-color-picker>

  <input type="hidden" name="settings[brand_color]" value="#4a5568" data-shoelace-color-picker-target="input">
  <code data-shoelace-color-picker-target="value">#4a5568</code>

  <div class="flex gap-2 flex-wrap">
    <% ["#1a202c", "#2d3748", "#4a5568", "#718096", "#e53e3e", "#742a2a"].each do |color| %>
      <button
        type="button"
        class="h-8 w-8 rounded-md border border-black/15 dark:border-white/20 ring-2 ring-offset-2 ring-transparent"
        style="background-color: <%= color %>;"
        data-color="<%= color %>"
        data-shoelace-color-picker-target="swatch"
        data-action="click->shoelace-color-picker#selectSwatch"
        aria-label="Pick <%= color %>"
        aria-pressed="false"
      ></button>
    <% end %>
  </div>
</div>
```

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/color_picker/color_picker",
  id: "my_color",
  label: "Choose a color",
  value: "#3b82f6"
%>
```

### With Options

```erb
<%= render "shared/components/color_picker/color_picker",
  id: "brand_color",
  name: "settings[brand_color]",
  label: "Brand Color",
  value: "#8b5cf6",
  format: "hex",
  size: "medium",
  opacity: true,
  show_swatches: true,
  swatches: ["#1a202c", "#2d3748", "#4a5568", "#718096"],
  required: true
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `id` | String | auto-generated | Unique identifier |
| `name` | String | `nil` | Hidden input name for form submissions |
| `value` | String | `"#3b82f6"` | Initial color value |
| `label` | String | `"Color"` | Shoelace label |
| `format` | String | `"hex"` | `"hex"`, `"rgb"`, `"hsl"`, `"hsv"` |
| `size` | String | `"medium"` | `"small"`, `"medium"`, `"large"` |
| `opacity` | Boolean | `false` | Enable alpha channel |
| `no_format_toggle` | Boolean | `false` | Hide format selector |
| `swatches` | Array/String | default palette | Array or semicolon string |
| `show_value` | Boolean | `true` | Show selected value text |
| `show_swatches` | Boolean | `false` | Render custom swatch buttons |
| `disabled` | Boolean | `false` | Disable picker |
| `required` | Boolean | `false` | Mark picker as required |
| `classes` | String | `nil` | Additional wrapper classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render ColorPicker::Component.new(
  id: "my_color",
  label: "Choose a color",
  value: "#3b82f6"
) %>
```

### With Options

```erb
<%= render ColorPicker::Component.new(
  id: "brand_color",
  name: "settings[brand_color]",
  label: "Brand Color",
  value: "#8b5cf6",
  format: :hex,
  size: :medium,
  opacity: true,
  no_format_toggle: true,
  show_swatches: true,
  swatches: ["#1a202c", "#2d3748", "#4a5568", "#718096"],
  required: true
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `id` | String | auto-generated | Unique identifier |
| `name` | String | `nil` | Hidden input name for form submissions |
| `value` | String | `"#3b82f6"` | Initial color value |
| `label` | String | `"Color"` | Shoelace label |
| `format` | Symbol/String | `:hex` | `:hex`, `:rgb`, `:hsl`, `:hsv` |
| `size` | Symbol/String | `:medium` | `:small`, `:medium`, `:large` |
| `opacity` | Boolean | `false` | Enable alpha channel |
| `no_format_toggle` | Boolean | `false` | Hide format selector |
| `swatches` | Array/String | default palette | Array or semicolon string |
| `show_value` | Boolean | `true` | Show selected value text |
| `show_swatches` | Boolean | `false` | Render custom swatch buttons |
| `disabled` | Boolean | `false` | Disable picker |
| `required` | Boolean | `false` | Mark picker as required |
| `classes` | String | `nil` | Additional wrapper classes |

---

## Size Variants

| Size | Description |
| ---- | ----------- |
| `small` | Compact picker |
| `medium` | Default size |
| `large` | Prominent picker |

---

## Output Formats

| Format | Example Output |
| ------ | -------------- |
| `hex` | `#3b82f6` |
| `rgb` | `rgb(59, 130, 246)` |
| `hsl` | `hsl(217, 91%, 60%)` |
| `hsv` | `hsv(217, 76%, 96%)` |

---

## Accessibility

- Use meaningful `label` text for each picker
- Swatch buttons expose `aria-label` and `aria-pressed`
- Focus styles are visible for keyboard navigation
- Disabled state is propagated to picker and swatches

---

## Listening to Changes

```javascript
// Shoelace native event
document.querySelector("sl-color-picker")?.addEventListener("sl-change", (event) => {
  console.log("Color changed:", event.target.value)
})

// Rails Blocks wrapper event (shared partial + ViewComponent)
document.addEventListener("color-picker:change", (event) => {
  console.log("Color changed:", event.detail.color)
})
```

---

## Troubleshooting

**Picker does not render:** Ensure Shoelace script + theme CSS are loaded in your layout.

**Custom swatches do not highlight:** Verify each custom swatch button has `data-color` and `data-shoelace-color-picker-target="swatch"`.

**Hidden input does not update:** Add `name:` so the hidden input is rendered and includes `data-shoelace-color-picker-target="input"`.

**Format not applied:** Use only valid formats: `hex`, `rgb`, `hsl`, `hsv`.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/color_picker/`
- **Shared partial files**: `app/views/shared/components/color_picker/`
- **shared partial**: `render "shared/components/color_picker/color_picker"`
- **ViewComponent**: `render ColorPicker::Component.new(...)`
- **ViewComponent files**: `app/components/color_picker/`

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