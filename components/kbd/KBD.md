# Kbd Component

Display keyboard keys and shortcuts with styled `<kbd>` elements. Perfect for documentation, tooltips, and interactive elements that show keyboard shortcuts.

## Features

- Single key and key combination support
- Multiple sizes (xs, sm, md, lg)
- Multiple style variants (default, light, dark, outline)
- **OS-aware display** - Automatically show ⌘ on Mac, Ctrl on Windows/Linux
- Customizable separators
- **Hotkey integration** - Trigger actions with keyboard shortcuts
- Dark mode support
- Zero JavaScript for display (JavaScript only for OS detection and hotkeys)
- Accessibility-friendly `<kbd>` semantic markup

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/kbd/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/kbd/` | Reusable partial with locals |
| **ViewComponent** | `app/components/kbd/` | Ruby-based, testable, object-oriented |

### Plain ERB

Use semantic `<kbd>` markup directly. The default styling comes from the global `kbd { ... }` rule in `app/assets/tailwind/application.css`:

```erb
<kbd>Ctrl</kbd>
```

### Shared Partial

Use the reusable partial for consistent kbd styling:

```erb
<%= render "shared/components/kbd/kbd",
  key: "Ctrl+S" %>
```

### ViewComponent

Use the object-oriented ViewComponent approach:

```erb
<%= render Kbd::Component.new(
  key: "Ctrl+S"
) %>
```

---

## Basic Usage

### Single Key

```erb
<%= render "shared/components/kbd/kbd", key: "A" %>
<%= render "shared/components/kbd/kbd", key: "Enter" %>
<%= render "shared/components/kbd/kbd", key: "Esc" %>
```

### Key Combinations

Pass a string with `+` separator or an array of keys:

```erb
<!-- String format -->
<%= render "shared/components/kbd/kbd", key: "Ctrl+S" %>
<%= render "shared/components/kbd/kbd", key: "Ctrl+Shift+P" %>

<!-- Array format -->
<%= render "shared/components/kbd/kbd", key: ["Ctrl", "Shift", "P"] %>
```

---

## Sizes

`size` is an optional modifier on top of the global `<kbd>` style:

| Size | Effect | Use Case |
| ---- | ------ | -------- |
| `:xs` | Compact key size | Dense UIs, helper text |
| `:sm` | Small key size | Inline with body text |
| `:md` | No extra size class (global default) | Standard usage |
| `:lg` | Large key size | Prominent display, headers |

```erb
<%= render "shared/components/kbd/kbd", key: "Esc", size: "xs" %>
<%= render "shared/components/kbd/kbd", key: "Esc", size: "sm" %>
<%= render "shared/components/kbd/kbd", key: "Esc", size: "md" %>
<%= render "shared/components/kbd/kbd", key: "Esc", size: "lg" %>
```

---

## Variants

### Default

Uses the global `<kbd>` style with no additional variant class.

```erb
<%= render "shared/components/kbd/kbd", key: "Enter", variant: "default" %>
```

### Light

Lighter background, ideal for dark contexts in light mode.

```erb
<%= render "shared/components/kbd/kbd", key: "Enter", variant: "light" %>
```

### Dark

Dark background, stands out on light backgrounds.

```erb
<%= render "shared/components/kbd/kbd", key: "Enter", variant: "dark" %>
```

### Outline

Transparent background with border only.

```erb
<%= render "shared/components/kbd/kbd", key: "Enter", variant: "outline" %>
```

---

## OS-Aware Shortcuts

Automatically display the correct modifier key based on the user's operating system. Uses the `os-detect` Stimulus controller to show ⌘ on Mac and Ctrl on Windows/Linux.

```erb
<!-- Shows "⌘ + S" on Mac, "Ctrl + S" on Windows/Linux -->
<%= render "shared/components/kbd/kbd",
  key: "S",
  os_aware: true,
  mac_key: "⌘",
  non_mac_key: "Ctrl" %>

<!-- With multiple modifier keys -->
<%= render "shared/components/kbd/kbd",
  key: ["Shift", "P"],
  os_aware: true,
  mac_key: "⌘",
  non_mac_key: "Ctrl" %>
```

### How It Works

1. The component wraps the keys in a container with `data-controller="os-detect"`
2. Mac and non-Mac modifier keys are rendered with `hidden` class
3. The `os-detect` controller detects the OS and shows/hides the appropriate key

---

## Special Key Symbols

Use Unicode symbols for a polished look:

| Key | Symbol | Description |
| --- | ------ | ----------- |
| Command (Mac) | `⌘` | &#8984; |
| Option (Mac) | `⌥` | &#8997; |
| Shift | `⇧` | &#8679; |
| Control | `⌃` | &#8963; |
| Return/Enter | `↵` | &#8629; |
| Delete/Backspace | `⌫` | &#9003; |
| Tab | `⇥` | &#8677; |
| Escape | `⎋` | &#9099; |
| Arrow Up | `↑` | &#8593; |
| Arrow Down | `↓` | &#8595; |
| Arrow Left | `←` | &#8592; |
| Arrow Right | `→` | &#8594; |

```erb
<%= render "shared/components/kbd/kbd", key: "⌘" %>
<%= render "shared/components/kbd/kbd", key: ["⌘", "⇧", "P"] %>
```

---

## Hotkey Integration

Combine kbd display with the `hotkey` Stimulus controller to create functional keyboard shortcuts.

### Basic Hotkey Button

```erb
<button class="btn"
  data-controller="hotkey"
  data-action="keydown.ctrl+s@document->hotkey#click"
  onclick="saveDocument()">
  Save
  <%= render "shared/components/kbd/kbd", key: "Ctrl+S", size: "sm" %>
</button>
```

### Cross-Platform Hotkeys

Handle both Mac (⌘) and Windows/Linux (Ctrl) with multiple actions:

```erb
<button class="btn"
  data-controller="hotkey"
  data-action="keydown.meta+k@document->hotkey#click keydown.ctrl+k@document->hotkey#click"
  onclick="openSearch()">
  Search
  <%= render "shared/components/kbd/kbd",
    key: "K",
    size: "sm",
    os_aware: true,
    mac_key: "⌘",
    non_mac_key: "Ctrl" %>
</button>
```

### Hotkey Controller Options

The `hotkey` controller supports:

- `data-action="keydown.[key]@document->hotkey#click"` - Triggers element click
- Modifier keys: `ctrl`, `meta` (⌘), `shift`, `alt` (⌥)
- `data-hotkey-allow-while-typing-value="true"` - Allow hotkey even when in input fields

```erb
<!-- Allow hotkey while typing -->
<button data-controller="hotkey"
  data-hotkey-allow-while-typing-value="true"
  data-action="keydown.escape@document->hotkey#click">
  Close
</button>
```

---

## Options Reference

### Shared Partial Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `key` | String/Array | (required) | Key(s) to display |
| `size` | String | `"md"` | Optional size modifier: `"xs"`, `"sm"`, `"md"`, `"lg"` |
| `variant` | String | `"default"` | Optional color modifier: `"default"`, `"light"`, `"dark"`, `"outline"` |
| `separator` | String | `"+"` | Separator for parsing/displaying combinations |
| `show_separator` | Boolean | `true` | Whether to show separator between keys |
| `os_aware` | Boolean | `false` | Enable OS-specific key display |
| `mac_key` | String | `nil` | Key to show on Mac (requires `os_aware`) |
| `non_mac_key` | String | `nil` | Key to show on non-Mac (requires `os_aware`) |
| `classes` | String | `nil` | Additional CSS classes |

### ViewComponent Options

Same as Shared Partial, but use symbols for `size` and `variant`:

```erb
<%= render Kbd::Component.new(
  key: "Ctrl+S",
  size: :sm,
  variant: :light
) %>
```

---

## Styling Reference

### Global Base Style

```css
kbd {
  @apply rounded-md border border-black/10 bg-white px-1 font-mono text-[11px] text-neutral-800 shadow-[0px_1.5px_0px_0px_rgba(0,0,0,0.05)] dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200 dark:shadow-[0px_1px_0px_0px_rgba(255,255,255,0.1)];
}
```

### Size Modifiers

| Size | Classes |
| ---- | ------- |
| xs | `min-w-[1.25rem] h-5 px-1 text-[10px]` |
| sm | `min-w-[1.5rem] h-6 px-1.5 text-xs` |
| md | _(none; uses global base style)_ |
| lg | `min-w-[2.25rem] h-9 px-3 text-base` |

### Variant Modifiers

| Variant | Light Mode | Dark Mode |
| ------- | ---------- | --------- |
| default | _(none; uses global base style)_ | _(none; uses global base style)_ |
| light | `bg-white` | `dark:bg-neutral-800 dark:text-neutral-300` |
| dark | `bg-neutral-800 text-neutral-100` | `dark:bg-neutral-900` |
| outline | `bg-transparent text-neutral-600` | `dark:text-neutral-400` |

---

## Common Use Cases

### In Navigation/Menu Items

```erb
<a href="#" class="flex items-center justify-between px-4 py-2 hover:bg-neutral-100">
  <span>Save</span>
  <%= render "shared/components/kbd/kbd",
    key: "S",
    size: "xs",
    os_aware: true,
    mac_key: "⌘",
    non_mac_key: "Ctrl" %>
</a>
```

### In Documentation

```erb
<p class="text-sm text-neutral-600">
  Press <%= render "shared/components/kbd/kbd", key: "Ctrl+Shift+P", size: "sm" %>
  to open the command palette.
</p>
```

### In Tooltips

```erb
<button data-controller="tooltip"
  data-tooltip-content="Save document (Ctrl+S)">
  Save
</button>
```

### Command Palette Hints

```erb
<div class="flex items-center justify-between">
  <span>New file</span>
  <%= render "shared/components/kbd/kbd",
    key: "N",
    size: "xs",
    os_aware: true,
    mac_key: "⌘",
    non_mac_key: "Ctrl" %>
</div>
```

---

## Accessibility

- Uses semantic `<kbd>` element for proper screen reader support
- Keyboard shortcuts should always have visual labels or be documented
- Consider providing alternative ways to access functionality
- Test with both keyboard and screen reader users

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/kbd/`
- **Shared partial files**: `app/views/shared/components/kbd/`
- **shared partial**: `render "shared/components/kbd/kbd"`
- **ViewComponent**: `render Kbd::Component.new(...)`
- **ViewComponent files**: `app/components/kbd/`

### Implementation Checklist

- Pick one implementation path first, then stay consistent within that example.
- Use only documented locals, initializer arguments, variants, and slot names.
- Copy the base example before adding app-specific styling or behavior.
- Keep the documented structure and class names intact so the visual styling remains correct.
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