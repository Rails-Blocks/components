# Skeleton Component

Display loading placeholder animations while content is being fetched. Skeleton screens improve perceived performance by showing a preview of the content structure before data loads.

## Features

- Multiple shape variants (text, circle, rectangle, image, button, input)
- Customizable dimensions with Tailwind classes
- Configurable border radius options
- Pulse animation (can be disabled)
- Render multiple skeletons at once with `count`
- Dark mode support
- Zero JavaScript required
- Composable for complex layouts

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/skeleton/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/skeleton/` | Reusable partial with locals |
| **ViewComponent** | `app/components/skeleton/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the skeleton HTML directly into your views for maximum flexibility:

```erb
<div class="animate-pulse">
  <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full mb-2"></div>
  <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
</div>
```

### Shared Partial

Use the reusable partial for consistent skeletons across your app:

```erb
<%= render "shared/components/skeleton/skeleton",
  variant: "text",
  width: "w-full",
  count: 3 %>
```

### ViewComponent

Use the object-oriented ViewComponent approach:

```erb
<%= render Skeleton::Component.new(
  variant: :text,
  width: "w-full",
  count: 3
) %>
```

---

## Options Reference

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `variant` | String/Symbol | `"text"` | Shape variant: `text`, `circle`, `rectangle`, `image`, `button`, `input` |
| `width` | String | *varies* | Width class (e.g., `"w-full"`, `"w-1/2"`, `"w-32"`) |
| `height` | String | *varies* | Height class (e.g., `"h-4"`, `"h-10"`, `"h-48"`) |
| `rounded` | String/Symbol | *varies* | Border radius: `none`, `sm`, `md`, `lg`, `xl`, `2xl`, `full` |
| `animated` | Boolean | `true` | Whether to show pulse animation |
| `count` | Integer | `1` | Number of skeleton elements to render |
| `classes` | String | `nil` | Additional CSS classes |

### Default Dimensions by Variant

| Variant | Default Width | Default Height | Default Rounded |
| ------- | ------------- | -------------- | --------------- |
| `text` | `w-full` | `h-4` | `rounded-md` |
| `circle` | `w-10` | `h-10` | `rounded-full` |
| `rectangle` | `w-full` | `h-20` | `rounded-lg` |
| `image` | `w-full` | `h-48` | `rounded-lg` |
| `button` | `w-24` | `h-10` | `rounded-md` |
| `input` | `w-full` | `h-10` | `rounded-md` |

---

## Variants

### Text Skeleton

Use for text lines and paragraphs:

```erb
<!-- Single line -->
<%= render "shared/components/skeleton/skeleton" %>

<!-- Multiple lines -->
<%= render "shared/components/skeleton/skeleton", count: 3 %>

<!-- Varying widths for realistic paragraph -->
<div class="space-y-2 animate-pulse">
  <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md w-full"></div>
  <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md w-5/6"></div>
  <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded-md w-4/6"></div>
</div>
```

### Circle Skeleton

Use for avatars and circular elements:

```erb
<!-- Default avatar size (40x40) -->
<%= render "shared/components/skeleton/skeleton", variant: "circle" %>

<!-- Large avatar -->
<%= render "shared/components/skeleton/skeleton",
  variant: "circle",
  width: "w-16",
  height: "h-16" %>

<!-- Small avatar -->
<%= render "shared/components/skeleton/skeleton",
  variant: "circle",
  width: "w-8",
  height: "h-8" %>
```

### Rectangle Skeleton

Use for cards, containers, and general blocks:

```erb
<%= render "shared/components/skeleton/skeleton", variant: "rectangle" %>

<!-- Custom height -->
<%= render "shared/components/skeleton/skeleton",
  variant: "rectangle",
  height: "h-32" %>
```

### Image Skeleton

Use for image placeholders:

```erb
<%= render "shared/components/skeleton/skeleton", variant: "image" %>

<!-- Square image -->
<%= render "shared/components/skeleton/skeleton",
  variant: "image",
  width: "w-64",
  height: "h-64" %>
```

### Button Skeleton

Use for button placeholders:

```erb
<%= render "shared/components/skeleton/skeleton", variant: "button" %>

<!-- Wide button -->
<%= render "shared/components/skeleton/skeleton",
  variant: "button",
  width: "w-32" %>
```

### Input Skeleton

Use for form input placeholders:

```erb
<%= render "shared/components/skeleton/skeleton", variant: "input" %>
```

---

## Common Compositions

### Card Skeleton

```erb
<div class="bg-white w-full dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl p-4 max-w-sm animate-pulse">
  <!-- Image placeholder -->
  <%= render "shared/components/skeleton/skeleton", variant: "image", classes: "mb-4" %>

  <!-- Title -->
  <%= render "shared/components/skeleton/skeleton", width: "w-3/4", height: "h-6", classes: "mb-3" %>

  <!-- Content lines -->
  <div class="space-y-2">
    <%= render "shared/components/skeleton/skeleton" %>
    <%= render "shared/components/skeleton/skeleton", width: "w-5/6" %>
    <%= render "shared/components/skeleton/skeleton", width: "w-4/6" %>
  </div>

  <!-- Footer -->
  <div class="flex items-center justify-between mt-4">
    <%= render "shared/components/skeleton/skeleton", width: "w-1/4" %>
    <%= render "shared/components/skeleton/skeleton", variant: "button", width: "w-20" %>
  </div>
</div>
```

### User Profile Skeleton

```erb
<div class="flex items-center space-x-3 animate-pulse">
  <!-- Avatar -->
  <%= render "shared/components/skeleton/skeleton", variant: "circle" %>

  <!-- Text content -->
  <div class="flex-1">
    <%= render "shared/components/skeleton/skeleton", width: "w-1/3", classes: "mb-2" %>
    <%= render "shared/components/skeleton/skeleton", width: "w-1/2", height: "h-3" %>
  </div>
</div>
```

### Table Skeleton

```erb
<div class="bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl overflow-hidden animate-pulse">
  <!-- Header -->
  <div class="bg-neutral-50 dark:bg-neutral-900 px-6 py-3 border-b border-neutral-200 dark:border-neutral-700">
    <div class="flex space-x-4">
      <%= render "shared/components/skeleton/skeleton", width: "w-20" %>
      <%= render "shared/components/skeleton/skeleton", width: "w-24" %>
      <%= render "shared/components/skeleton/skeleton", width: "w-16" %>
      <%= render "shared/components/skeleton/skeleton", width: "w-20" %>
    </div>
  </div>

  <!-- Rows -->
  <% 5.times do %>
    <div class="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 last:border-0">
      <div class="flex space-x-4">
        <%= render "shared/components/skeleton/skeleton", width: "w-20" %>
        <%= render "shared/components/skeleton/skeleton", width: "w-24" %>
        <%= render "shared/components/skeleton/skeleton", width: "w-16" %>
        <%= render "shared/components/skeleton/skeleton", width: "w-20" %>
      </div>
    </div>
  <% end %>
</div>
```

### Form Skeleton

```erb
<div class="space-y-6 max-w-md animate-pulse">
  <!-- Form field 1 -->
  <div>
    <%= render "shared/components/skeleton/skeleton", width: "w-20", classes: "mb-2" %>
    <%= render "shared/components/skeleton/skeleton", variant: "input" %>
  </div>

  <!-- Form field 2 -->
  <div>
    <%= render "shared/components/skeleton/skeleton", width: "w-24", classes: "mb-2" %>
    <%= render "shared/components/skeleton/skeleton", variant: "input" %>
  </div>

  <!-- Textarea -->
  <div>
    <%= render "shared/components/skeleton/skeleton", width: "w-32", classes: "mb-2" %>
    <%= render "shared/components/skeleton/skeleton", variant: "rectangle", height: "h-24" %>
  </div>

  <!-- Checkbox -->
  <div class="flex items-center space-x-2">
    <%= render "shared/components/skeleton/skeleton", width: "w-4", height: "h-4", rounded: "sm" %>
    <%= render "shared/components/skeleton/skeleton", width: "w-40" %>
  </div>

  <!-- Buttons -->
  <div class="flex space-x-3">
    <%= render "shared/components/skeleton/skeleton", variant: "button" %>
    <%= render "shared/components/skeleton/skeleton", variant: "button", width: "w-20" %>
  </div>
</div>
```

### List Skeleton

```erb
<div class="space-y-4 animate-pulse">
  <% 4.times do %>
    <div class="flex items-center space-x-3 p-3 bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl">
      <!-- Avatar -->
      <%= render "shared/components/skeleton/skeleton", variant: "circle" %>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <%= render "shared/components/skeleton/skeleton", width: "w-3/4", classes: "mb-2" %>
        <%= render "shared/components/skeleton/skeleton", width: "w-1/2", height: "h-3" %>
      </div>

      <!-- Action -->
      <%= render "shared/components/skeleton/skeleton", width: "w-6", height: "h-6", rounded: "md" %>
    </div>
  <% end %>
</div>
```

---

## Customization

### Custom Dimensions

Override default dimensions with Tailwind classes:

```erb
<%= render "shared/components/skeleton/skeleton",
  width: "w-48",
  height: "h-8" %>
```

### Custom Rounded

Apply custom border radius:

```erb
<!-- Sharp corners -->
<%= render "shared/components/skeleton/skeleton", rounded: "none" %>

<!-- Fully rounded -->
<%= render "shared/components/skeleton/skeleton", rounded: "full" %>

<!-- Extra rounded -->
<%= render "shared/components/skeleton/skeleton", rounded: "2xl" %>
```

### Disable Animation

For static skeleton displays:

```erb
<%= render "shared/components/skeleton/skeleton", animated: false %>
```

### Additional Classes

Add custom styling:

```erb
<%= render "shared/components/skeleton/skeleton",
  classes: "shadow-sm opacity-75" %>
```

---

## Best Practices

1. **Match the layout** - Create skeletons that closely match the shape of the actual content
2. **Use appropriate variants** - Choose the right variant for each element type
3. **Group animations** - Wrap multiple skeletons in a parent with `animate-pulse` for synchronized animation
4. **Keep it simple** - Don't over-detail skeleton screens; a general approximation is sufficient
5. **Test load states** - Verify skeletons display correctly during actual loading scenarios
6. **Consider accessibility** - Add `aria-busy="true"` to container elements while loading

### Wrapper Pattern

For better animation synchronization, wrap skeleton compositions:

```erb
<div class="animate-pulse">
  <!-- Individual skeletons don't need animation class -->
  <%= render "shared/components/skeleton/skeleton", animated: false %>
  <%= render "shared/components/skeleton/skeleton", animated: false, width: "w-1/2" %>
</div>
```

---

## Accessibility

- Use `aria-busy="true"` on the container element while content is loading
- Consider adding `aria-label="Loading"` for screen readers
- Remove skeleton elements from the DOM once content loads (don't just hide them)

```erb
<div aria-busy="true" aria-label="Loading content">
  <%= render "shared/components/skeleton/skeleton", count: 3 %>
</div>
```

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/skeleton/`
- **Shared partial files**: `app/views/shared/components/skeleton/`
- **shared partial**: `render "shared/components/skeleton/skeleton"`
- **ViewComponent**: `render Skeleton::Component.new(...)`
- **ViewComponent files**: `app/components/skeleton/`

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