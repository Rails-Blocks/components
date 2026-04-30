# Loading Indicator Component

Display loading states with spinners, dots, bars, or progress indicators. Perfect for async operations, form submissions, content loading, and progress tracking.

## Features

- Multiple indicator types (spinner, dots, bars, progress)
- Two spinner styles (smooth and stepped/iOS-style)
- Five size options (xs, sm, md, lg, xl)
- Nine color variants including brand primary
- Optional loading text
- Progress bar with percentage tracking
- Dark mode support
- Zero JavaScript required (CSS animations)
- Accessibility-friendly with ARIA support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/loading_indicator/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/loading_indicator/` | Reusable partial with locals |
| **ViewComponent** | `app/components/loading_indicator/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the loading indicator HTML directly into your views for maximum flexibility and customization. Best when you need one-off indicators or want to modify the markup.

### Shared Partial

Use the reusable partial for consistent loading indicators across your app:

```erb
<%= render "shared/components/loading_indicator/loading_indicator",
  type: "spinner" %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render LoadingIndicator::Component.new(
  type: :spinner
) %>
```

---

## Simplified Usage Set

The current docs examples focus on three loaders only:
- Circular spinner
- Stepped animation loader
- Dots loader

Each one is shown in:
- Default style
- Colored style
- In-context usage (button, empty state, chat bubble)

### ViewComponent Usage Examples

```erb
<!-- Circular spinner -->
<%= render LoadingIndicator::Component.new %>
<%= render LoadingIndicator::Component.new(color: :blue) %>
<button type="button" disabled class="... bg-blue-600 ...">
  <%= render LoadingIndicator::Component.new(size: :sm, classes: "[&_svg]:text-white dark:[&_svg]:text-white") %>
  Saving...
</button>

<!-- Stepped animation loader -->
<%= render LoadingIndicator::Component.new(stepped: true) %>
<%= render LoadingIndicator::Component.new(stepped: true, color: :blue) %>
<div class="... empty-state ...">
  <%= render LoadingIndicator::Component.new(stepped: true, color: :blue, size: :lg) %>
  <p>Loading your first project...</p>
</div>

<!-- Dots loader -->
<%= render LoadingIndicator::Component.new(type: :dots) %>
<%= render LoadingIndicator::Component.new(type: :dots, color: :blue) %>
<div class="... chat-bubble ...">
  <p>Support is typing...</p>
  <%= render LoadingIndicator::Component.new(type: :dots, size: :sm) %>
</div>
```

### Shared Partial Usage Examples

```erb
<!-- Circular spinner -->
<%= render "shared/components/loading_indicator/loading_indicator" %>
<%= render "shared/components/loading_indicator/loading_indicator", color: "blue" %>

<!-- Stepped animation loader -->
<%= render "shared/components/loading_indicator/loading_indicator", stepped: true %>
<%= render "shared/components/loading_indicator/loading_indicator", stepped: true, color: "blue" %>

<!-- Dots loader -->
<%= render "shared/components/loading_indicator/loading_indicator", type: "dots" %>
<%= render "shared/components/loading_indicator/loading_indicator", type: "dots", color: "blue" %>
```

---

## Types

### Spinner (Default)

Circular loading spinner with smooth rotation animation.

```erb
<!-- Smooth spinner (default) -->
<div class="inline-flex items-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-neutral-800 dark:text-neutral-200 animate-spin" viewBox="0 0 18 18">
    <g fill="currentColor">
      <path d="m9,17c-4.4111,0-8-3.5889-8-8S4.5889,1,9,1s8,3.5889,8,8-3.5889,8-8,8Zm0-14.5c-3.584,0-6.5,2.916-6.5,6.5s2.916,6.5,6.5,6.5,6.5-2.916,6.5-6.5-2.916-6.5-6.5-6.5Z" opacity=".4" stroke-width="0"></path>
      <path d="m16.25,9.75c-.4141,0-.75-.3359-.75-.75,0-3.584-2.916-6.5-6.5-6.5-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75c4.4111,0,8,3.5889,8,8,0,.4141-.3359.75-.75.75Z" stroke-width="0"></path>
    </g>
  </svg>
  <span class="font-medium text-sm text-neutral-700 dark:text-neutral-300">Loading...</span>
</div>
```

### Stepped Spinner (iOS-style)

Segmented spinner with stepped animation for a more discrete loading feel.

```erb
<!-- Stepped spinner (iOS-style) -->
<svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-neutral-800 dark:text-neutral-200 animate-[spin_0.8s_steps(8)_infinite]" viewBox="0 0 18 18">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
    <line x1="9" y1="1.75" x2="9" y2="4.25" opacity=".13"></line>
    <line x1="14.127" y1="3.873" x2="12.359" y2="5.641" opacity=".25"></line>
    <line x1="16.25" y1="9" x2="13.75" y2="9" opacity=".38"></line>
    <line x1="14.127" y1="14.127" x2="12.359" y2="12.359" opacity=".5"></line>
    <line x1="9" y1="16.25" x2="9" y2="13.75" opacity=".63"></line>
    <line x1="3.873" y1="14.127" x2="5.641" y2="12.359" opacity=".75"></line>
    <line x1="1.75" y1="9" x2="4.25" y2="9" opacity=".88"></line>
    <line x1="3.873" y1="3.873" x2="5.641" y2="5.641"></line>
  </g>
</svg>
```

### Dots Loader

Three bouncing dots with staggered animation delays.

```erb
<!-- Dots loader -->
<div class="flex space-x-1.5">
  <div class="size-2 bg-neutral-800 dark:bg-neutral-200 rounded-full animate-bounce" style="animation-delay: 0ms;"></div>
  <div class="size-2 bg-neutral-800/80 dark:bg-neutral-200/80 rounded-full animate-bounce" style="animation-delay: 150ms;"></div>
  <div class="size-2 bg-neutral-800/60 dark:bg-neutral-200/60 rounded-full animate-bounce" style="animation-delay: 300ms;"></div>
</div>
```

### Bars Loader

Four pulsing bars with staggered animation.

```erb
<!-- Bars loader -->
<div class="flex items-end space-x-1">
  <div class="w-1 h-5 bg-neutral-800 dark:bg-neutral-200 rounded-sm animate-pulse" style="animation-delay: 0ms;"></div>
  <div class="w-1 h-5 bg-neutral-800 dark:bg-neutral-200 rounded-sm animate-pulse" style="animation-delay: 100ms;"></div>
  <div class="w-1 h-5 bg-neutral-800 dark:bg-neutral-200 rounded-sm animate-pulse" style="animation-delay: 200ms;"></div>
  <div class="w-1 h-5 bg-neutral-800 dark:bg-neutral-200 rounded-sm animate-pulse" style="animation-delay: 300ms;"></div>
</div>
```

### Progress Bar

Determinate progress indicator with percentage tracking.

```erb
<!-- Progress bar at 75% -->
<div class="inline-flex items-center gap-2 w-full">
  <div class="h-2 bg-neutral-200 dark:bg-neutral-700 overflow-hidden rounded-full w-full min-w-24">
    <div class="bg-neutral-800 dark:bg-neutral-200 h-full rounded-full transition-all duration-300 ease-out" style="width: 75%"></div>
  </div>
  <span class="font-medium text-sm text-neutral-700 dark:text-neutral-300">75%</span>
</div>
```

---

## Sizes

| Size | Spinner | Dots | Bars | Progress Height |
| ---- | ------- | ---- | ---- | --------------- |
| **xs** | `size-4` | `size-1` | `w-0.5 h-3` | `h-1` |
| **sm** | `size-5` | `size-1.5` | `w-1 h-4` | `h-1.5` |
| **md** | `size-6` | `size-2` | `w-1 h-5` | `h-2` |
| **lg** | `size-8` | `size-2.5` | `w-1.5 h-6` | `h-3` |
| **xl** | `size-10` | `size-3` | `w-2 h-8` | `h-4` |

---

## Color Variants

| Color | Spinner/Dots/Bars | Progress Background | Progress Fill |
| ----- | ----------------- | ------------------- | ------------- |
| **neutral** | `text-neutral-800` | `bg-neutral-200` | `bg-neutral-800` |
| **primary** | `text-red-600` | `bg-red-100` | `bg-red-600` |
| **red** | `text-red-600` | `bg-red-100` | `bg-red-600` |
| **orange** | `text-orange-600` | `bg-orange-100` | `bg-orange-600` |
| **yellow** | `text-yellow-600` | `bg-yellow-100` | `bg-yellow-600` |
| **green** | `text-green-600` | `bg-green-100` | `bg-green-600` |
| **blue** | `text-blue-600` | `bg-blue-100` | `bg-blue-600` |
| **purple** | `text-purple-600` | `bg-purple-100` | `bg-purple-600` |
| **pink** | `text-pink-600` | `bg-pink-100` | `bg-pink-600` |

---

## Common Use Cases

### Button Loading State

```erb
<button class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-75" disabled>
  <svg xmlns="http://www.w3.org/2000/svg" class="size-4 text-white animate-spin" viewBox="0 0 18 18">
    <g fill="currentColor">
      <path d="m9,17c-4.4111,0-8-3.5889-8-8S4.5889,1,9,1s8,3.5889,8,8-3.5889,8-8,8Zm0-14.5c-3.584,0-6.5,2.916-6.5,6.5s2.916,6.5,6.5,6.5,6.5-2.916,6.5-6.5-2.916-6.5-6.5-6.5Z" opacity=".4" stroke-width="0"></path>
      <path d="m16.25,9.75c-.4141,0-.75-.3359-.75-.75,0-3.584-2.916-6.5-6.5-6.5-.4141,0-.75-.3359-.75-.75s.3359-.75.75-.75c4.4111,0,8,3.5889,8,8,0,.4141-.3359.75-.75.75Z" stroke-width="0"></path>
    </g>
  </svg>
  Saving...
</button>
```

### Full-Page Loading Overlay

```erb
<div class="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 flex items-center justify-center z-50">
  <%= render LoadingIndicator::Component.new(
    size: :xl,
    text: "Loading application...",
    color: :primary
  ) %>
</div>
```

### Inline Loading (Chat/Typing)

```erb
<div class="flex items-center gap-2 text-neutral-500">
  <span>AI is thinking</span>
  <%= render LoadingIndicator::Component.new(
    type: :dots,
    size: :sm,
    color: :neutral
  ) %>
</div>
```

### File Upload Progress

```erb
<div class="space-y-2">
  <div class="flex justify-between text-sm">
    <span class="text-neutral-700 dark:text-neutral-300">Uploading document.pdf</span>
    <span class="text-neutral-500">2.4 MB / 5.2 MB</span>
  </div>
  <%= render LoadingIndicator::Component.new(
    type: :progress,
    progress: 46,
    color: :blue
  ) %>
</div>
```

### Table Row Loading

```erb
<tr class="animate-pulse">
  <td class="p-4">
    <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-24"></div>
  </td>
  <td class="p-4">
    <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32"></div>
  </td>
  <td class="p-4 text-right">
    <%= render LoadingIndicator::Component.new(size: :sm) %>
  </td>
</tr>
```

### Card Loading State

```erb
<div class="p-6 border border-neutral-200 dark:border-neutral-700 rounded-xl">
  <div class="flex flex-col items-center justify-center py-8 text-center">
    <%= render LoadingIndicator::Component.new(
      type: :spinner,
      size: :lg,
      color: :primary
    ) %>
    <p class="mt-4 text-sm text-neutral-500">Loading content...</p>
  </div>
</div>
```

---

## Accessibility

### ARIA Attributes

For better accessibility, add appropriate ARIA attributes:

```erb
<!-- Loading indicator with ARIA -->
<div role="status" aria-live="polite" aria-label="Loading" class="inline-flex items-center gap-2">
  <svg xmlns="http://www.w3.org/2000/svg" class="size-6 animate-spin" aria-hidden="true" viewBox="0 0 18 18">
    <!-- spinner SVG -->
  </svg>
  <span class="sr-only">Loading...</span>
</div>

<!-- Progress bar with ARIA -->
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" aria-label="Upload progress">
  <div class="h-2 bg-neutral-200 rounded-full">
    <div class="h-full bg-blue-600 rounded-full" style="width: 75%"></div>
  </div>
</div>
```

### Best Practices

1. **Use `role="status"`** for loading indicators to announce changes to screen readers
2. **Include visually hidden text** (`sr-only`) describing the loading state
3. **Use `aria-busy="true"`** on the container being loaded
4. **Set `aria-live="polite"`** for non-critical loading states
5. **Set `aria-live="assertive"`** for critical loading that blocks interaction

---

## Customization

### Custom Animation Speed

```erb
<!-- Slower spinner -->
<svg class="size-6 animate-[spin_1.5s_linear_infinite]" ...>

<!-- Faster dots -->
<div class="animate-[bounce_0.5s_infinite]" ...>
```

### Custom Colors

Override color classes for brand-specific colors:

```erb
<%= render LoadingIndicator::Component.new(
  classes: "text-indigo-600 dark:text-indigo-400"
) %>
```

### Integration with Turbo

Use with Turbo loading states:

```erb
<turbo-frame id="content" data-turbo-loading-class="opacity-50">
  <!-- Frame content -->
  <div class="turbo-loading:block hidden absolute inset-0 flex items-center justify-center">
    <%= render LoadingIndicator::Component.new(size: :lg) %>
  </div>
</turbo-frame>
```

---

## Best Practices

1. **Match indicator to context**: Use spinners for unknown duration, progress bars for known duration
2. **Provide text when helpful**: Add loading text for clarity, especially on longer operations
3. **Size appropriately**: Use smaller indicators inline, larger ones for page-level loading
4. **Use semantic colors**: Green for success/complete, blue for neutral progress
5. **Consider dark mode**: All variants support dark mode automatically
6. **Don't block unnecessarily**: Show loading only when truly needed
7. **Provide escape hatches**: Allow users to cancel long-running operations when possible

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/loading_indicator/`
- **Shared partial files**: `app/views/shared/components/loading_indicator/`
- **shared partial**: `render "shared/components/loading_indicator/loading_indicator"`
- **ViewComponent**: `render LoadingIndicator::Component.new(...)`
- **ViewComponent files**: `app/components/loading_indicator/`

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