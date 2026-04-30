# Table Component

Styled data tables with support for striping, hovering, sticky headers, and responsive scrolling.

## Features

- Striped and hoverable row styles
- Compact/condensed density option
- Sticky header for scrollable tables
- Responsive horizontal scrolling
- Column alignment (left, center, right)
- Primary cell highlighting
- Table captions and footers
- Dark mode support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/table/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/table/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/table/` | Block-style content, testing |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div class="bg-white dark:bg-neutral-900 rounded-xl border border-black/10 dark:border-white/10 shadow-xs overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full">
      <thead class="bg-neutral-100 dark:bg-neutral-800">
        <tr class="*:py-3 *:text-left *:[box-shadow:inset_0_-1px_0_0_rgb(229_229_229)] dark:*:[box-shadow:inset_0_-1px_0_0_rgb(46_46_46)]">
          <th scope="col" class="pl-6 pr-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Name</th>
          <th scope="col" class="px-3 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Email</th>
          <th scope="col" class="pl-3 pr-6 text-sm font-semibold text-neutral-900 dark:text-neutral-50">Role</th>
        </tr>
      </thead>
      <tbody class="*:*:py-4">
        <tr class="[box-shadow:inset_0_-1px_0_0_rgb(229_229_229)] dark:[box-shadow:inset_0_-1px_0_0_rgb(46_46_46)]">
          <td class="pl-6 pr-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">Alex Johnson</td>
          <td class="px-3 text-sm text-neutral-500 dark:text-neutral-400">alex@example.com</td>
          <td class="pl-3 pr-6 text-sm text-neutral-500 dark:text-neutral-400">Admin</td>
        </tr>
        <tr>
          <td class="pl-6 pr-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">Sarah Miller</td>
          <td class="px-3 text-sm text-neutral-500 dark:text-neutral-400">sarah@example.com</td>
          <td class="pl-3 pr-6 text-sm text-neutral-500 dark:text-neutral-400">Editor</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Key Modifications

**Striped rows:** Add `*:even:bg-neutral-50 dark:*:even:bg-neutral-800/50` to `<tbody>`.

**Hoverable rows:** Add `hover:bg-neutral-50 dark:hover:bg-neutral-800/50` to each `<tr>`.

**Compact density:** Change `*:*:py-4` to `*:*:py-3` on tbody and `*:py-3` to `*:py-2.5` on thead row.

**Sticky header:** Add `sticky top-0 z-10 bg-neutral-100/75 dark:bg-neutral-800/75 backdrop-blur-sm backdrop-filter` to `<thead>` and wrap the scroll container with `max-height` and `overflow-y-auto`.

**Right-aligned cells:** Add `text-right` to the `<th>` and `<td>` classes.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/table/table",
  columns: ["Name", "Email", "Role"],
  rows: [
    [{ content: "Alex Johnson", primary: true }, "alex@example.com", "Admin"],
    [{ content: "Sarah Miller", primary: true }, "sarah@example.com", "Editor"]
  ]
%>
```

### With Options

```erb
<%= render "shared/components/table/table",
  columns: [
    { label: "Product", align: "left" },
    { label: "Price", align: "right" },
    { label: "Stock", align: "right" }
  ],
  rows: [
    [{ content: "Headphones", primary: true }, "$129.99", "245"],
    [{ content: "Mouse", primary: true }, "$49.99", "512"]
  ],
  striped: true,
  hoverable: true,
  density: "compact",
  sticky_header: true,
  max_height: "400px"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `columns` | Array | `[]` | Column definitions (strings or hashes) |
| `rows` | Array | `[]` | Row data arrays |
| `striped` | Boolean | `false` | Alternate row backgrounds |
| `hoverable` | Boolean | `false` | Highlight rows on hover |
| `bordered` | Boolean | `true` | Show borders |
| `density` | String | `"default"` | `"default"` or `"compact"` |
| `sticky_header` | Boolean | `false` | Sticky header on scroll |
| `rounded` | String | `"xl"` | Border radius size |
| `max_height` | String | `nil` | Max height for scrolling |
| `container` | Boolean | `true` | Wrap in styled container |
| `caption` | String | `nil` | Table caption text |
| `classes` | String | `nil` | Additional table classes |
| `container_classes` | String | `nil` | Additional container classes |

### Column Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `label` | String | required | Column header text |
| `align` | String | `"left"` | `"left"`, `"center"`, `"right"` |
| `classes` | String | `nil` | Additional header classes |

### Cell Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `content` | String/HTML | required | Cell content |
| `primary` | Boolean | `false` | Bold text style |
| `align` | String | `"left"` | `"left"`, `"center"`, `"right"` |
| `classes` | String | `nil` | Additional cell classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(Table::Component.new) do |table| %>
  <% table.with_column(label: "Name") %>
  <% table.with_column(label: "Email") %>
  <% table.with_column(label: "Role") %>

  <% table.with_row do |row| %>
    <% row.with_cell(primary: true) { "Alex Johnson" } %>
    <% row.with_cell { "alex@example.com" } %>
    <% row.with_cell { "Admin" } %>
  <% end %>
<% end %>
```

### With Options

```erb
<%= render(Table::Component.new(
  striped: true,
  hoverable: true,
  density: :compact,
  sticky_header: true,
  max_height: "400px"
)) do |table| %>
  <% table.with_column(label: "Product") %>
  <% table.with_column(label: "Price", align: :right) %>

  <% table.with_row do |row| %>
    <% row.with_cell(primary: true) { "Headphones" } %>
    <% row.with_cell(align: :right) { "$129.99" } %>
  <% end %>
<% end %>
```

### Using Head/Body Slots (Full Control)

```erb
<%= render(Table::Component.new) do |table| %>
  <% table.with_head do %>
    <tr class="*:py-3 *:text-left *:[box-shadow:inset_0_-1px_0_0_rgb(229_229_229)]">
      <th class="pl-6 pr-3 text-sm font-semibold">Name</th>
      <th class="pl-3 pr-6 text-sm font-semibold">Role</th>
    </tr>
  <% end %>
  <% table.with_body do %>
    <tr>
      <td class="pl-6 pr-3 text-sm font-medium">Alex</td>
      <td class="pl-3 pr-6 text-sm">Admin</td>
    </tr>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `striped` | Boolean | `false` | Alternate row backgrounds |
| `hoverable` | Boolean | `false` | Highlight rows on hover |
| `bordered` | Boolean | `true` | Show borders |
| `density` | Symbol | `:default` | `:default` or `:compact` |
| `sticky_header` | Boolean | `false` | Sticky header on scroll |
| `rounded` | Symbol | `:xl` | `:none`, `:sm`, `:md`, `:lg`, `:xl` |
| `full_width` | Boolean | `true` | Table spans container |
| `responsive` | Boolean | `true` | Enable horizontal scroll |
| `max_height` | String | `nil` | Max height for scrolling |
| `container` | Boolean | `true` | Wrap in styled container |
| `classes` | String | `nil` | Additional table classes |
| `container_classes` | String | `nil` | Additional container classes |

### Column Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | required | Column header text |
| `align` | Symbol | `:left` | `:left`, `:center`, `:right` |
| `classes` | String | `nil` | Additional header classes |

### Cell Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `primary` | Boolean | `false` | Bold text style |
| `align` | Symbol | `:left` | `:left`, `:center`, `:right` |
| `classes` | String | `nil` | Additional cell classes |

---

## Slots Reference

| Slot | Type | Description |
| ---- | ---- | ----------- |
| `caption` | Single | Table caption |
| `head` | Single | Custom thead content |
| `body` | Single | Custom tbody content |
| `foot` | Single | Custom tfoot content |
| `columns` | Many | Column definitions |
| `rows` | Many | Row containers |
| `cells` | Many (on row) | Cell contents |

---

## Styling Reference

### Cell Padding Classes

| Density | Header | Body Cells |
| ------- | ------ | ---------- |
| Default | `py-3` | `py-4` |
| Compact | `py-2.5` | `py-3` |

### Row Border Style

```css
[box-shadow:inset_0_-1px_0_0_rgb(229_229_229)]
dark:[box-shadow:inset_0_-1px_0_0_rgb(46_46_46)]
```

### Text Colors

| Type | Light Mode | Dark Mode |
| ---- | ---------- | --------- |
| Header | `text-neutral-900` | `text-neutral-50` |
| Primary Cell | `text-neutral-900` | `text-neutral-100` |
| Secondary Cell | `text-neutral-500` | `text-neutral-400` |

---

## Accessibility

- Uses semantic `<table>`, `<thead>`, `<tbody>`, `<tfoot>` elements
- Column headers use `<th scope="col">`
- Row headers can use `<th scope="row">`
- Proper caption support with `<caption>`
- Sufficient color contrast in both light and dark modes

---

## Troubleshooting

**Table overflows container:** Ensure the scroll wrapper has `overflow-x-auto` class.

**Sticky header not working:** Check that `max_height` is set and the scroll wrapper has `overflow-y-auto`.

**Striping not visible:** Verify the `striped` option is set to `true` and rows don't have background colors.

**Hover effect missing:** Ensure `hoverable` is `true` and no conflicting background styles.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/table/`
- **Shared partial files**: `app/views/shared/components/table/`
- **shared partial**: `render "shared/components/table/table"`
- **ViewComponent**: `render Table::Component.new(...)`
- **ViewComponent files**: `app/components/table/`

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