# Sidebar Component

Collapsible navigation sidebar with responsive mobile drawer, keyboard shortcuts, collapsible sections, and localStorage state persistence.

## Features

- Collapsible/expandable sidebar with smooth animations
- Responsive mobile drawer with backdrop overlay
- Collapsed state shows icon-only navigation with tooltips
- Collapsible sections for grouping navigation items
- Keyboard shortcut hints
- Badge support for counts and labels
- localStorage persistence for collapsed/expanded state
- Three visual variants (default, bordered, minimal)
- Dark mode support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/sidebar/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/sidebar/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/sidebar/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `storageKey` | String | `"sidebarOpen"` | LocalStorage key for persisting state |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `desktopSidebar` | Yes | The `<details>` element for desktop sidebar |
| `mobileSidebar` | Yes | Mobile overlay container |
| `contentTemplate` | Yes | Template for shared sidebar content |
| `sharedContent` | Yes | Container for cloned mobile content |
| `desktopContent` | Yes | Container for cloned desktop content |
| `mobileBackdrop` | Yes | Mobile backdrop overlay |
| `mobilePanel` | Yes | Mobile sidebar panel |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `open` | `click->sidebar#open` | Opens desktop sidebar |
| `close` | `click->sidebar#close` | Closes desktop sidebar |
| `toggle` | `click->sidebar#toggle` | Toggles desktop sidebar |
| `openMobile` | `click->sidebar#openMobile` | Opens mobile drawer |
| `closeMobile` | `click->sidebar#closeMobile` | Closes mobile drawer |

---

## Plain ERB

Copy the code block from `app/views/components/sidebar/` into your view and customize as needed.

### Key Modifications

**Different storage key:** Change `data-sidebar-storage-key-value` to a unique key for each sidebar.

**Different widths:** Modify `w-13 open:w-64` classes for collapsed/expanded widths.

**No collapse:** Remove the `<details>` structure and use a static `<div>` instead.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/sidebar/sidebar",
  items: [
    { label: "Dashboard", href: "/dashboard", icon: "...", active: true },
    { label: "Settings", href: "/settings", icon: "..." }
  ]
%>
```

### With Sections and Footer

```erb
<%= render "shared/components/sidebar/sidebar",
  items: [
    { label: "Dashboard", href: "/", icon: "...", shortcut: "⌘1", active: true },
    { label: "Contacts", href: "/contacts", icon: "...", shortcut: "⌘2" }
  ],
  sections: [
    {
      title: "Projects",
      items: [
        { label: "Rails Blocks", href: "#", badge: "12" },
        { label: "Design System", href: "#", badge: "5" }
      ]
    }
  ],
  logo: '<a href="/">Your Logo</a>',
  footer: '<button>User Profile</button>',
  variant: "bordered",
  storage_key: "mySidebar"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `items` | Array | `[]` | Main navigation items |
| `sections` | Array | `[]` | Collapsible sections |
| `variant` | String | `"default"` | `"default"`, `"bordered"`, `"minimal"` |
| `collapsible` | Boolean | `true` | Enable collapse/expand |
| `default_collapsed` | Boolean | `false` | Start collapsed |
| `position` | String | `"left"` | `"left"` or `"right"` |
| `storage_key` | String | `"sidebarOpen"` | LocalStorage key |
| `width` | String | `"w-64"` | Expanded width class |
| `collapsed_width` | String | `"w-13"` | Collapsed width class |
| `min_height_class` | String | `"min-h-screen"` | Min-height utility applied to the sidebar rail and main content area |
| `show_mobile_toggle` | Boolean | `true` | Show mobile menu button |
| `logo` | String | `nil` | HTML for logo area |
| `footer` | String | `nil` | HTML for footer area |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `label` | String | required | Item display text |
| `href` | String | `"#"` | Link URL |
| `icon` | String | `nil` | SVG icon HTML |
| `shortcut` | String | `nil` | Keyboard shortcut (e.g., "⌘1") |
| `active` | Boolean | `false` | Currently active |
| `disabled` | Boolean | `false` | Disabled state |
| `badge` | String | `nil` | Badge text (count, price) |
| `classes` | String | `nil` | Additional item classes |

### Section Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `title` | String | required | Section header |
| `default_open` | Boolean | `true` | Start expanded |
| `items` | Array | `[]` | Section items (same as Item Hash) |
| `classes` | String | `nil` | Additional section classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Sidebar::Component.new) do |sidebar| %>
  <% sidebar.with_item(label: "Dashboard", href: "/dashboard", active: true) %>
  <% sidebar.with_item(label: "Settings", href: "/settings") %>
<% end %>
```

### With All Options

```erb
<%= render(Sidebar::Component.new(
  variant: :bordered,
  collapsible: true,
  storage_key: "appSidebar",
  width: "w-72",
  collapsed_width: "w-16"
)) do |sidebar| %>
  <% sidebar.with_logo do %>
    <a href="/">Your Logo</a>
  <% end %>

  <% sidebar.with_item(
    label: "Dashboard",
    href: "/",
    icon: '<svg>...</svg>',
    shortcut: "⌘1",
    active: true
  ) %>

  <% sidebar.with_section(title: "Projects") do |section| %>
    <% section.with_item(label: "Project A", href: "#", badge: "12") %>
    <% section.with_item(label: "Project B", href: "#", badge: "5") %>
  <% end %>

  <% sidebar.with_footer do %>
    <button>User Profile</button>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `variant` | Symbol | `:default` | `:default`, `:bordered`, `:minimal` |
| `collapsible` | Boolean | `true` | Enable collapse/expand |
| `default_collapsed` | Boolean | `false` | Start collapsed |
| `position` | Symbol | `:left` | `:left` or `:right` |
| `storage_key` | String | `"sidebarOpen"` | LocalStorage key |
| `width` | String | `"w-64"` | Expanded width class |
| `collapsed_width` | String | `"w-13"` | Collapsed width class |
| `min_height_class` | String | `"min-h-screen"` | Min-height utility applied to the sidebar rail and main content area |
| `show_mobile_toggle` | Boolean | `true` | Show mobile menu button |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | required | Item display text |
| `href` | String | `"#"` | Link URL |
| `icon` | String | `nil` | SVG icon HTML |
| `shortcut` | String | `nil` | Keyboard shortcut |
| `active` | Boolean | `false` | Currently active |
| `disabled` | Boolean | `false` | Disabled state |
| `badge` | String | `nil` | Badge text |
| `classes` | String | `nil` | Additional classes |

### Section Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `title` | String | required | Section header |
| `default_open` | Boolean | `true` | Start expanded |
| `classes` | String | `nil` | Additional classes |

### Slots

| Slot | Type | Description |
| ---- | ---- | ----------- |
| `logo` | Single | Logo/brand area in header |
| `footer` | Single | Footer content area |
| `items` | Many | Main navigation items |
| `sections` | Many | Collapsible sections |

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `default` | Border-separated with neutral background |
| `bordered` | Same as default, explicit border styling |
| `minimal` | Clean white/dark background without borders |

---

## Accessibility

- Uses native `<details>` element for collapse behavior
- `aria-label` on all navigation links
- `aria-expanded` on toggle buttons
- Mobile drawer accessible via button
- Keyboard navigable

---

## Troubleshooting

**Sidebar doesn't persist state:** Ensure each sidebar has a unique `storage_key` value.

**Mobile drawer doesn't close on backdrop click:** Verify `data-action="click->sidebar#closeMobile"` is on the backdrop element.

**Content doesn't clone correctly:** Check that `data-sidebar-target="contentTemplate"` contains a `<template>` element.

**Tooltips not showing in collapsed state:** Ensure the tooltip controller is available and items have proper `data-controller="tooltip"` attributes.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/sidebar/`
- **Shared partial files**: `app/views/shared/components/sidebar/`
- **shared partial**: `render "shared/components/sidebar/sidebar"`
- **ViewComponent**: `render Sidebar::Component.new(...)`
- **ViewComponent files**: `app/components/sidebar/`

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