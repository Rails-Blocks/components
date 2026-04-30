# Navbar Component

Responsive navigation bar with dropdown menus, smooth transitions, keyboard navigation, and mobile support.

## Features

- Smooth animated dropdown menus with indicator arrow
- Hover-to-open with intelligent delays (desktop)
- Click-to-toggle support (mobile/touch)
- Mobile hamburger menu with responsive breakpoints
- Smooth transitions between dropdown panels
- Full keyboard navigation (↑↓ arrows, Tab, Enter/Space, Escape)
- ARIA accessibility support
- Multiple visual variants (default, bordered, transparent)
- Sticky positioning option
- Dark mode support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/navbar/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/navbar/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/navbar/` | Block-style content, testing |

---

## Stimulus Controller

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `menu` | Yes | The main navigation menu `<ul>` element |
| `trigger` | Yes | Clickable buttons that toggle dropdown panels |
| `content` | Yes | Dropdown content panels |
| `viewport` | Yes | Container for dropdown panels with animations |
| `indicator` | No | Arrow indicator that points to active trigger |
| `background` | No | Background container for dropdown panels |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggleMenu` | `click->navbar#toggleMenu` | Toggles dropdown open/closed |
| `handlePointerEnter` | `pointerenter->navbar#handlePointerEnter` | Prepares hover state |
| `handlePointerMove` | `pointermove->navbar#handlePointerMove` | Opens dropdown on hover |
| `handlePointerLeave` | `pointerleave->navbar#handlePointerLeave` | Starts close delay |
| `cancelClose` | `pointerenter->navbar#cancelClose` | Cancels pending close |
| `handleTriggerKeydown` | `keydown->navbar#handleTriggerKeydown` | Keyboard navigation |

### Data Attributes

| Attribute | Element | Description |
| --------- | ------- | ----------- |
| `data-content-id` | trigger | ID of the dropdown content panel to show |
| `data-align` | trigger | Dropdown alignment: `start`, `center`, `end` |
| `data-state` | multiple | Current state: `open`, `closed`, `closing` |

---

## Plain ERB

Copy the code block from `app/views/components/navbar/` into your view and customize as needed.

### Key Modifications

**Add a logo:** Include a logo element as the first list item.

**Add actions:** Add profile buttons or CTAs after the nav items.

**Change alignment:** Set `data-align="start"` or `data-align="end"` on triggers.

**Remove mobile menu:** Remove the hamburger button `<li>` and mobile content panel.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/navbar/navbar",
  items: [
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "About", href: "/about" }
  ]
%>
```

### With Dropdown Menus

```erb
<%= render "shared/components/navbar/navbar",
  items: [
    { label: "Home", href: "/" },
    { label: "Products", dropdown: true, content_id: "products-dropdown", mobile_hidden: true },
    { label: "Resources", dropdown: true, content_id: "resources-dropdown", mobile_hidden: true }
  ],
  dropdown_contents: [
    {
      id: "products-dropdown",
      width: "w-[calc(100vw-2rem)] sm:w-[500px]",
      columns: 2,
      content: '<a href="/software">Software</a><a href="/hardware">Hardware</a>'
    },
    {
      id: "resources-dropdown",
      width: "w-[calc(100vw-2rem)] sm:w-[400px]",
      columns: 1,
      content: '<a href="/blog">Blog</a><a href="/docs">Docs</a>'
    },
    {
      id: "mobile-menu-content",
      width: "w-[calc(100vw-2rem)]",
      content: '<a href="/products">Products</a><a href="/resources">Resources</a>'
    }
  ]
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `items` | Array | `[]` | Navigation items (see below) |
| `variant` | String | `"default"` | `"default"`, `"bordered"`, `"transparent"` |
| `sticky` | Boolean | `false` | Stick to top on scroll |
| `show_mobile_menu` | Boolean | `true` | Show hamburger button on mobile |
| `mobile_menu_content_id` | String | `"mobile-menu-content"` | ID for mobile menu dropdown |
| `logo` | String | `nil` | HTML for logo element |
| `actions` | String | `nil` | HTML for right-side actions |
| `dropdown_contents` | Array | `[]` | Dropdown content panels (see below) |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `label` | String | required | Display text |
| `href` | String | `nil` | URL for link items |
| `dropdown` | Boolean | `false` | Whether this triggers a dropdown |
| `content_id` | String | `nil` | ID of dropdown content (required if dropdown) |
| `align` | String | `"center"` | `"start"`, `"center"`, `"end"` |
| `mobile_hidden` | Boolean | `false` | Hide on mobile (use mobile menu instead) |
| `classes` | String | `nil` | Additional item classes |

### Dropdown Content Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `id` | String | required | Unique ID matching `content_id` |
| `width` | String | `"w-[calc(100vw-2rem)] sm:w-[400px]"` | Width classes |
| `columns` | Integer | `1` | Grid columns (1-4) |
| `content` | String | `nil` | HTML content for dropdown |
| `classes` | String | `nil` | Additional classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Navbar::Component.new) do |navbar| %>
  <% navbar.with_item(label: "Home", href: "/") %>
  <% navbar.with_item(label: "Products", href: "/products") %>
  <% navbar.with_item(label: "About", href: "/about") %>
<% end %>
```

### With Dropdown Menus

```erb
<%= render(Navbar::Component.new) do |navbar| %>
  <% navbar.with_item(label: "Home", href: "/") %>
  <% navbar.with_item(label: "Products", dropdown: true, content_id: "products-dropdown", mobile_hidden: true) %>

  <% navbar.with_dropdown_content(id: "products-dropdown", columns: 2) do %>
    <a href="/software" class="block rounded-lg p-3 hover:bg-neutral-100">Software</a>
    <a href="/hardware" class="block rounded-lg p-3 hover:bg-neutral-100">Hardware</a>
  <% end %>

  <% navbar.with_dropdown_content(id: "mobile-menu-content") do %>
    <a href="/products" class="block p-3">Products</a>
  <% end %>
<% end %>
```

### With Logo and Actions

```erb
<%= render(Navbar::Component.new) do |navbar| %>
  <% navbar.with_logo do %>
    <a href="/" class="flex items-center gap-2 px-2">
      <%= image_tag "logo.svg", class: "h-8" %>
    </a>
  <% end %>

  <% navbar.with_item(label: "Features", href: "/features") %>
  <% navbar.with_item(label: "Pricing", href: "/pricing") %>

  <% navbar.with_actions do %>
    <li class="ml-2 pl-2 border-l border-neutral-200 dark:border-neutral-700">
      <a href="/login" class="px-3 py-2 text-sm font-medium">Sign in</a>
    </li>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `variant` | Symbol | `:default` | `:default`, `:bordered`, `:transparent` |
| `sticky` | Boolean | `false` | Stick to top on scroll |
| `show_mobile_menu` | Boolean | `true` | Show hamburger button |
| `mobile_menu_content_id` | String | `"mobile-menu-content"` | Mobile menu dropdown ID |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | required | Display text |
| `href` | String | `nil` | URL for link items |
| `dropdown` | Boolean | `false` | Whether this triggers a dropdown |
| `content_id` | String | `nil` | ID of dropdown content |
| `align` | Symbol | `:center` | `:start`, `:center`, `:end` |
| `mobile_hidden` | Boolean | `false` | Hide on mobile |
| `classes` | String | `nil` | Additional item classes |

### Dropdown Content Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `id` | String | required | Unique ID |
| `width` | String | `nil` | Custom width class |
| `columns` | Integer | `1` | Grid columns (1-4) |
| `classes` | String | `nil` | Additional classes |

### Slots

| Slot | Type | Description |
| ---- | ---- | ----------- |
| `logo` | Single | Logo/brand element (appears first) |
| `items` | Many | Navigation items (links or dropdown triggers) |
| `dropdown_contents` | Many | Dropdown content panels |
| `actions` | Single | Right-side actions (sign in, profile, etc.) |

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `default` | Bordered card style with shadow |
| `bordered` | Same as default (alias) |
| `transparent` | No background, ideal for hero sections |

---

## Accessibility

Implements WAI-ARIA patterns for navigation menus:

- `aria-expanded` on dropdown triggers
- `aria-controls` linking each trigger to its dropdown content panel
- Keyboard navigation with Arrow keys, Tab, Enter/Space
- Escape key closes open dropdown
- Focus management when opening/closing
- `data-state` attributes for CSS styling hooks

---

## Troubleshooting

**Dropdown doesn't open:** Ensure `data-content-id` matches the dropdown content `id`.

**Mobile menu not working:** Check that mobile menu content has `id="mobile-menu-content"` (or your custom ID).

**Indicator arrow misaligned:** Verify the indicator target is present and positioned correctly.

**Transitions stutter:** Ensure no conflicting CSS transitions on the viewport element.

**Hover doesn't work on mobile:** This is intentional - touch devices use click-to-toggle instead.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/navbar/`
- **Shared partial files**: `app/views/shared/components/navbar/`
- **shared partial**: `render "shared/components/navbar/navbar"`
- **ViewComponent**: `render Navbar::Component.new(...)`
- **ViewComponent files**: `app/components/navbar/`

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