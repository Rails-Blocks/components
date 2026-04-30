# Toast Component

Display brief, non-blocking notifications that appear temporarily and auto-dismiss. Perfect for confirmations, status updates, and user feedback.

## Features

- Multiple toast types (success, error, info, warning, danger, loading)
- Six positioning options (top/bottom × left/center/right)
- Stacked or expanded layouts
- Auto-dismiss with configurable duration
- Action buttons support
- Custom HTML content
- Smooth entry/exit animations
- Hover to pause auto-dismiss and expand stack
- Dark mode support
- Mobile responsive
- Turbo/Turbo Streams compatible

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/toast/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/toast/` | Reusable partial with locals |
| **ViewComponent** | `app/components/toast/` | Ruby-based, testable, object-oriented |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `position` | String | `"top-center"` | Container position: `"top-left"`, `"top-center"`, `"top-right"`, `"bottom-left"`, `"bottom-center"`, `"bottom-right"` |
| `layout` | String | `"default"` | `"default"` (stacked) or `"expanded"` (all visible) |
| `autoDismissDuration` | Number | `4000` | Milliseconds before auto-dismiss |
| `limit` | Number | `3` | Maximum visible toasts |
| `gap` | Number | `14` | Gap between toasts in expanded mode (px) |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `container` | Yes | The `<ol>` element that holds toast items |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `handleMouseEnter` | `mouseenter->toast#handleMouseEnter` | Expands stacked toasts on hover |
| `handleMouseLeave` | `mouseleave->toast#handleMouseLeave` | Collapses toasts when mouse leaves |

### Global JavaScript API

The toast controller exposes a global `toast()` function:

```javascript
// Basic toast
toast("Your message here")

// With options
toast("Message", {
  type: "success",           // "default", "success", "error", "info", "warning", "danger", "loading"
  description: "Details...", // Optional longer text
  position: "bottom-right",  // Override container position
  action: {                  // Primary action button
    label: "Undo",
    onClick: () => { /* handler */ }
  },
  secondaryAction: {         // Secondary action button
    label: "Cancel",
    onClick: () => { /* handler */ }
  },
  html: "<div>Custom</div>"  // Custom HTML (overrides message/description)
})
```

---

## Installation

### 1. Add the Toast Container

Place the toast container once in your layout (e.g., `application.html.erb`):

**ViewComponent:**
```erb
<%= render Toast::Component.new %>
```

**Shared Partial:**
```erb
<%= render "shared/components/toast/toast" %>
```

### 2. Include the Stimulus Controller

Ensure `toast_controller.js` is in your `app/javascript/controllers/` directory and registered in your application.

### 3. Add Toast Styles

Add the following CSS to your stylesheet for proper toast animations:

```css
/* Toast animations */
.toast-item {
  position: absolute;
  left: 0;
  right: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: var(--toast-z-index, 0);
}

/* Mount animation */
.toast-item[data-mounted="false"] {
  opacity: 0;
}
.toast-item[data-mounted="false"][data-position^="top"] {
  transform: translateY(-100%);
}
.toast-item[data-mounted="false"][data-position^="bottom"] {
  transform: translateY(100%);
}
.toast-item[data-mounted="true"] {
  opacity: 1;
}

/* Remove animation */
.toast-item[data-removed="true"] {
  opacity: 0;
  pointer-events: none;
}
.toast-item[data-removed="true"][data-position^="top"] {
  transform: translateY(-100%);
}
.toast-item[data-removed="true"][data-position^="bottom"] {
  transform: translateY(100%);
}

/* Stacked mode (default) */
.toast-item[data-expanded="false"][data-visible="true"] {
  transform: translateY(calc(var(--toast-index, 0) * 8px)) scale(calc(1 - var(--toast-index, 0) * 0.05));
}
.toast-item[data-expanded="false"][data-visible="false"] {
  opacity: 0;
  transform: translateY(calc(var(--toast-index, 0) * 8px)) scale(0.9);
}

/* Expanded mode */
.toast-item[data-expanded="true"][data-position^="top"] {
  transform: translateY(var(--toast-offset, 0));
}
.toast-item[data-expanded="true"][data-position^="bottom"] {
  transform: translateY(calc(var(--toast-offset, 0) * -1));
}

/* Height transition for stacked mode */
.toast-item[data-expanded="false"] > span {
  height: var(--front-toast-height, auto);
  overflow: hidden;
}
.toast-item[data-expanded="false"][data-front="true"] > span,
.toast-item[data-expanded="true"] > span {
  height: auto;
  overflow: visible;
}

/* Hide content for non-front stacked toasts */
.toast-item[data-expanded="false"][data-front="false"] > span > div {
  opacity: 0;
}
.toast-item[data-expanded="false"][data-front="true"] > span > div,
.toast-item[data-expanded="true"] > span > div {
  opacity: 1;
}
```

---

## Plain ERB

### Basic Usage

```erb
<!-- Container (place once in layout) -->
<div
  data-controller="toast"
  data-toast-position-value="top-center"
  data-toast-layout-value="default"
  data-toast-auto-dismiss-duration-value="4000"
  data-toast-limit-value="3"
  data-toast-gap-value="14"
  data-action="mouseenter->toast#handleMouseEnter mouseleave->toast#handleMouseLeave"
  class="fixed z-[99999] w-full px-4 sm:px-0 sm:w-auto pointer-events-none left-1/2 -translate-x-1/2 top-0 mt-4 sm:mt-6"
>
  <ol
    data-toast-target="container"
    class="relative flex flex-col-reverse sm:flex-col gap-0 pointer-events-auto [&>li]:pointer-events-auto"
    style="height: 0px;"
  >
  </ol>
</div>

<!-- Trigger button -->
<button
  type="button"
  onclick="toast('Your changes have been saved', { type: 'success' })"
  class="px-4 py-2 bg-neutral-800 text-white rounded-lg"
>
  Save Changes
</button>
```

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/toast/toast" %>
```

### With Options

```erb
<%= render "shared/components/toast/toast",
  position: "bottom-right",
  layout: "default",
  auto_dismiss_duration: 5000,
  limit: 4,
  gap: 16,
  classes: "custom-toast-container"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `position` | String | `"top-center"` | Container position |
| `layout` | String | `"default"` | `"default"` or `"expanded"` |
| `auto_dismiss_duration` | Integer | `4000` | Ms before auto-dismiss |
| `limit` | Integer | `3` | Max visible toasts |
| `gap` | Integer | `14` | Gap between expanded toasts |
| `classes` | String | `nil` | Additional container classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render Toast::Component.new %>
```

### With Options

```erb
<%= render Toast::Component.new(
  position: "bottom-right",
  layout: "default",
  auto_dismiss_duration: 5000,
  limit: 4,
  gap: 16,
  classes: "custom-toast-container"
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `position` | String | `"top-center"` | Container position |
| `layout` | String | `"default"` | `"default"` or `"expanded"` |
| `auto_dismiss_duration` | Integer | `4000` | Ms before auto-dismiss |
| `limit` | Integer | `3` | Max visible toasts |
| `gap` | Integer | `14` | Gap between expanded toasts |
| `classes` | String | `nil` | Additional container classes |

---

## Toast Types

| Type | Description | Icon Color |
| ---- | ----------- | ---------- |
| `default` | Generic notification | Neutral |
| `success` | Positive confirmation | Green |
| `error` | Error or failure | Red |
| `info` | Informational | Blue |
| `warning` | Caution/attention | Orange |
| `danger` | Critical/destructive | Red |
| `loading` | In-progress state | Neutral (spinning) |

### Examples

```javascript
toast("Default message")
toast("Success!", { type: "success" })
toast("Error occurred", { type: "error" })
toast("Please note", { type: "info" })
toast("Be careful", { type: "warning" })
toast("Critical action", { type: "danger" })
toast("Processing...", { type: "loading" })
```

---

## Positions

| Position | Description |
| -------- | ----------- |
| `top-left` | Top left corner |
| `top-center` | Top center (default) |
| `top-right` | Top right corner |
| `bottom-left` | Bottom left corner |
| `bottom-center` | Bottom center |
| `bottom-right` | Bottom right corner |

---

## Action Buttons

### Single Action

```javascript
toast("Event created", {
  description: "Sunday, December 03, 2023 at 9:00 AM",
  action: {
    label: "Undo",
    onClick: () => {
      // Handle undo
      console.log("Undo clicked")
    }
  }
})
```

### Two Actions

```javascript
toast("Delete this file?", {
  description: "This action cannot be undone.",
  action: {
    label: "Delete",
    onClick: () => deleteFile()
  },
  secondaryAction: {
    label: "Cancel",
    onClick: () => console.log("Cancelled")
  }
})
```

---

## Custom HTML

For complex toast content, use the `html` option:

```javascript
toast("", {
  html: `
    <div class="relative flex items-start justify-center p-4">
      <div class="w-10 h-10 mr-3 rounded-full bg-blue-100 flex items-center justify-center">
        <svg class="size-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      </div>
      <div class="flex flex-col">
        <p class="text-sm font-medium text-neutral-800">New Friend Request</p>
        <p class="mt-1 text-xs text-neutral-600">Friend request from John Doe.</p>
        <div class="flex mt-3 gap-2">
          <button class="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg">Accept</button>
          <button class="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-white border rounded-lg">Decline</button>
        </div>
      </div>
    </div>
  `
})
```

---

## Server-Triggered Toasts

### Using Flash Messages

```ruby
# In your controller
flash[:notice] = "Item saved successfully!"
redirect_to items_path
```

```erb
<!-- In your layout -->
<% if flash[:notice] %>
  <script>
    document.addEventListener("DOMContentLoaded", function() {
      toast("<%= j flash[:notice] %>", { type: "success" });
    });
  </script>
<% end %>
```

### Using Turbo Streams

```ruby
# In your controller
def create
  @item = Item.create(item_params)
  
  respond_to do |format|
    format.turbo_stream do
      render turbo_stream: turbo_stream.append("toast-messages", partial: "shared/toast_script", locals: { message: "Item created!", type: "success" })
    end
  end
end
```

```erb
<!-- app/views/shared/_toast_script.html.erb -->
<script>
  toast("<%= j message %>", { type: "<%= type %>" });
</script>
```

---

## Accessibility

- Toasts use appropriate color contrast for readability
- Close buttons are keyboard accessible
- Auto-dismiss can be paused by hovering
- Consider using `aria-live` regions for screen readers:

```erb
<div aria-live="polite" aria-atomic="true" class="sr-only" id="toast-announcer">
  <!-- Announcements for screen readers -->
</div>
```

---

## Best Practices

1. **Keep messages brief** - Toasts should be scannable at a glance
2. **Use appropriate types** - Match the toast type to the message intent
3. **Limit actions** - One or two actions maximum
4. **Consider duration** - Important messages may need longer display times
5. **Don't overuse** - Too many toasts can overwhelm users
6. **Provide alternatives** - For critical information, use persistent alerts instead
7. **Test dark mode** - Ensure toasts are readable in both themes

---

## Troubleshooting

**Toasts not appearing:**
- Ensure the toast container is present in your layout
- Check that `toast_controller.js` is properly loaded
- Verify the controller is connected (check for `data-controller="toast"`)

**Toasts disappearing too fast:**
- Increase `auto_dismiss_duration` value
- Users can hover to pause auto-dismiss

**Toasts stacking incorrectly:**
- Check CSS for toast animations is included
- Verify `--toast-z-index` and `--toast-offset` CSS variables are being set

**Position not updating:**
- The position is stored globally; refresh the page to reset

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/toast/`
- **Shared partial files**: `app/views/shared/components/toast/`
- **shared partial**: `render "shared/components/toast/toast"`
- **ViewComponent**: `render Toast::Component.new(...)`
- **ViewComponent files**: `app/components/toast/`

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