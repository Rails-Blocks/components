# Badge Component

Display status labels, tags, and categories with semantic colors. Perfect for indicating status, categorizing content, showing counts, or highlighting important attributes.

## Features

- 8 color variants (neutral, red, orange, yellow, green, blue, purple, pink)
- 2 sizes (sm, md)
- 2 shapes (rounded corners, pill)
- Optional dot indicator for status
- Optional remove button for tags/filters
- Dark mode support
- Zero JavaScript required
- Accessibility-friendly markup

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/badge/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/badge/` | Reusable partial with locals |
| **ViewComponent** | `app/components/badge/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the badge HTML directly into your views for maximum flexibility and customization. Best when you need one-off badges or want to modify the markup.

### Shared Partial

Use the reusable partial for consistent badges across your app:

```erb
<%= render "shared/components/badge/badge",
  text: "Published",
  variant: "green",
  dot: true %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render Badge::Component.new(
  text: "Published",
  variant: :green,
  dot: true
) %>
```

---

## Options Reference

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `text` | String | **required** | The badge text content |
| `variant` | String/Symbol | `"neutral"` | Color: `neutral`, `red`, `orange`, `yellow`, `green`, `blue`, `purple`, `pink` |
| `size` | String/Symbol | `"md"` | Size: `sm` (small), `md` (regular) |
| `pill` | Boolean | `false` | Use pill shape (fully rounded) instead of rounded corners |
| `dot` | Boolean | `false` | Show a colored dot indicator |
| `removable` | Boolean | `false` | Show a remove/close button |
| `classes` | String | `nil` | Additional CSS classes |

---

## Variants

### Color Variants

All 8 color options with their semantic meanings:

```erb
<!-- Neutral - default, general purpose -->
<%= render "shared/components/badge/badge", text: "Default", variant: "neutral" %>

<!-- Green - success, active, positive -->
<%= render "shared/components/badge/badge", text: "Active", variant: "green" %>

<!-- Red - error, critical, negative -->
<%= render "shared/components/badge/badge", text: "Error", variant: "red" %>

<!-- Yellow - warning, pending, caution -->
<%= render "shared/components/badge/badge", text: "Pending", variant: "yellow" %>

<!-- Blue - info, primary, new -->
<%= render "shared/components/badge/badge", text: "New", variant: "blue" %>

<!-- Orange - warning alternative, in-progress -->
<%= render "shared/components/badge/badge", text: "In Progress", variant: "orange" %>

<!-- Purple - special, premium, featured -->
<%= render "shared/components/badge/badge", text: "Pro", variant: "purple" %>

<!-- Pink - highlight, promotion -->
<%= render "shared/components/badge/badge", text: "Sale", variant: "pink" %>
```

### Size Variants

```erb
<!-- Regular size (default) -->
<%= render "shared/components/badge/badge", text: "Regular", variant: "blue" %>

<!-- Small size -->
<%= render "shared/components/badge/badge", text: "Small", variant: "blue", size: "sm" %>
```

### Shape Variants

```erb
<!-- Rounded corners (default) -->
<%= render "shared/components/badge/badge", text: "Rounded", variant: "green" %>

<!-- Pill shape -->
<%= render "shared/components/badge/badge", text: "Pill", variant: "green", pill: true %>
```

---

## With Dot Indicator

Add a colored dot to indicate real-time status:

```erb
<!-- Status indicators -->
<%= render "shared/components/badge/badge", text: "Online", variant: "green", dot: true %>
<%= render "shared/components/badge/badge", text: "Away", variant: "yellow", dot: true %>
<%= render "shared/components/badge/badge", text: "Offline", variant: "neutral", dot: true %>

<!-- Pill with dot -->
<%= render "shared/components/badge/badge", text: "Live", variant: "red", pill: true, dot: true %>
```

---

## Removable Badges

Add a remove button for filter tags or dismissible labels:

```erb
<!-- Basic removable -->
<%= render "shared/components/badge/badge", text: "React", variant: "blue", removable: true %>

<!-- Removable pill -->
<%= render "shared/components/badge/badge", text: "JavaScript", variant: "yellow", pill: true, removable: true %>

<!-- Small removable -->
<%= render "shared/components/badge/badge", text: "Filter", variant: "neutral", size: "sm", removable: true %>
```

**Note:** The remove button is a plain `<button>` element. Add your own click handler or Stimulus controller to implement the removal logic.

---

## Color Scheme Reference

| Variant | Background (Light) | Text (Light) | Background (Dark) | Text (Dark) |
| ------- | ------------------ | ------------ | ----------------- | ----------- |
| **Neutral** | `bg-neutral-50` | `text-neutral-700` | `bg-neutral-400/10` | `text-neutral-400` |
| **Red** | `bg-red-50` | `text-red-700` | `bg-red-400/10` | `text-red-400` |
| **Orange** | `bg-orange-50` | `text-orange-700` | `bg-orange-400/10` | `text-orange-400` |
| **Yellow** | `bg-yellow-50` | `text-yellow-700` | `bg-yellow-400/10` | `text-yellow-500` |
| **Green** | `bg-green-50` | `text-green-700` | `bg-green-400/10` | `text-green-400` |
| **Blue** | `bg-blue-50` | `text-blue-700` | `bg-blue-400/10` | `text-blue-400` |
| **Purple** | `bg-purple-50` | `text-purple-700` | `bg-purple-400/10` | `text-purple-400` |
| **Pink** | `bg-pink-50` | `text-pink-700` | `bg-pink-400/10` | `text-pink-400` |

---

## Common Use Cases

### Status Indicators

```erb
<%= render "shared/components/badge/badge", text: "Published", variant: "green", dot: true %>
<%= render "shared/components/badge/badge", text: "Draft", variant: "yellow", dot: true %>
<%= render "shared/components/badge/badge", text: "Archived", variant: "neutral", dot: true %>
```

### User Roles

```erb
<%= render "shared/components/badge/badge", text: "Admin", variant: "purple" %>
<%= render "shared/components/badge/badge", text: "Editor", variant: "blue" %>
<%= render "shared/components/badge/badge", text: "Viewer", variant: "neutral" %>
```

### Pricing Tiers

```erb
<%= render "shared/components/badge/badge", text: "Free", variant: "neutral", pill: true %>
<%= render "shared/components/badge/badge", text: "Pro", variant: "blue", pill: true %>
<%= render "shared/components/badge/badge", text: "Enterprise", variant: "purple", pill: true %>
```

### Tag Filters

```erb
<div class="flex flex-wrap gap-2">
  <%= render "shared/components/badge/badge", text: "Ruby", variant: "red", removable: true %>
  <%= render "shared/components/badge/badge", text: "Rails", variant: "red", removable: true %>
  <%= render "shared/components/badge/badge", text: "JavaScript", variant: "yellow", removable: true %>
</div>
```

### Table Status Column

```erb
<td>
  <% case record.status %>
  <% when "active" %>
    <%= render "shared/components/badge/badge", text: "Active", variant: "green", size: "sm" %>
  <% when "pending" %>
    <%= render "shared/components/badge/badge", text: "Pending", variant: "yellow", size: "sm" %>
  <% when "inactive" %>
    <%= render "shared/components/badge/badge", text: "Inactive", variant: "neutral", size: "sm" %>
  <% end %>
</td>
```

---

## Customization

### Custom Colors

Create custom badge variants by copying the base HTML and changing the color classes:

```erb
<!-- Indigo Badge Example -->
<span class="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 outline outline-indigo-600/20 dark:bg-indigo-400/10 dark:text-indigo-400 dark:outline-indigo-400/25">
  Custom
</span>
```

### With Icon

Add an icon before or after the text:

```erb
<span class="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 outline outline-green-600/20 dark:bg-green-400/10 dark:text-green-400 dark:outline-green-400/25">
  <svg class="size-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
  Verified
</span>
```

---

## Best Practices

1. **Use semantic colors**: Green for success/active, red for errors/critical, yellow for warnings/pending
2. **Keep text short**: Badges work best with 1-2 words
3. **Use dots for real-time status**: Indicates live/dynamic state
4. **Size appropriately**: Use small badges in tables and dense UIs
5. **Pill shape for tags**: Pills work well for removable filter tags
6. **Don't overuse**: Too many badges can overwhelm the interface
7. **Test dark mode**: Ensure badges remain readable in both themes

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/badge/`
- **Shared partial files**: `app/views/shared/components/badge/`
- **shared partial**: `render "shared/components/badge/badge"`
- **ViewComponent**: `render Badge::Component.new(...)`
- **ViewComponent files**: `app/components/badge/`

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