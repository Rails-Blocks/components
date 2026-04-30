# Pagination Component

Page navigation for paginated lists and tables with Turbo Frame support for seamless SPA-like navigation.

## Features

- **Pagy integration** - Works with the Pagy pagination gem
- Three display variants (full numbered, compact, minimal)
- Three size options (sm, md, lg)
- "Jump to page" form for quick navigation
- Rows per page selector
- Turbo Frame support for SPA-like navigation
- Query parameter preservation across page changes
- Responsive design with dark mode support
- Accessible with proper ARIA labels

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/pagination/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/pagination/` | Reusable partial with locals |
| **ViewComponent** | `app/components/pagination/` | Ruby-based, testable, object-oriented |

---

## Pagy Setup

This component requires the Pagy gem. First, ensure Pagy is configured in your initializer:

```ruby
# config/initializers/pagy.rb
Pagy::OPTIONS[:overflow] = :last_page
Pagy::OPTIONS[:limit] = 20
```

In your controller:

```ruby
class ItemsController < ApplicationController
  include Pagy::Backend

  def index
    @pagy, @items = pagy(Item.all)
  end
end
```

In your views, include the Pagy frontend helper:

```ruby
# app/helpers/application_helper.rb
module ApplicationHelper
  include Pagy::Frontend
end
```

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/pagination/pagination",
  pagy: @pagy %>
```

### With Turbo Frame

```erb
<turbo-frame id="items-frame">
  <!-- Your list content -->
  <div class="border-t pt-4">
    <%= render "shared/components/pagination/pagination",
      pagy: @pagy,
      frame_id: "items-frame",
      preserve_params: request.query_parameters %>
  </div>
</turbo-frame>
```

### With All Options

```erb
<%= render "shared/components/pagination/pagination",
  pagy: @pagy,
  variant: "full",
  size: "md",
  frame_id: "table-frame",
  show_info: true,
  show_page_form: true,
  show_limit_form: true,
  limit_options: [10, 25, 50, 100],
  preserve_params: request.query_parameters,
  classes: "mt-4" %>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `pagy` | Pagy | required | Pagy pagination object |
| `variant` | String | `"full"` | `"full"`, `"compact"`, `"minimal"` |
| `size` | String | `"md"` | `"sm"`, `"md"`, `"lg"` |
| `frame_id` | String | `nil` | Turbo Frame ID for SPA navigation |
| `show_info` | Boolean | `true` | Show "Showing X-Y of Z" text |
| `show_page_form` | Boolean | `false` | Show jump to page form (full variant only) |
| `show_limit_form` | Boolean | `false` | Show rows per page selector |
| `limit_options` | Array | `[10, 25, 50]` | Options for limit selector |
| `preserve_params` | Hash | `{}` | Query params to preserve |
| `request_path` | String | `request.path` | Custom path for forms |
| `classes` | String | `nil` | Additional wrapper classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render Pagination::Component.new(
  pagy: @pagy
) %>
```

### With Turbo Frame

```erb
<%= render Pagination::Component.new(
  pagy: @pagy,
  frame_id: "items-frame",
  preserve_params: request.query_parameters
) %>
```

### With All Options

```erb
<%= render Pagination::Component.new(
  pagy: @pagy,
  variant: :full,
  size: :md,
  frame_id: "table-frame",
  show_info: true,
  show_page_form: true,
  show_limit_form: true,
  limit_options: [10, 25, 50, 100],
  preserve_params: request.query_parameters,
  classes: "mt-4"
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `pagy` | Pagy | required | Pagy pagination object |
| `variant` | Symbol | `:full` | `:full`, `:compact`, `:minimal` |
| `size` | Symbol | `:md` | `:sm`, `:md`, `:lg` |
| `frame_id` | String | `nil` | Turbo Frame ID for SPA navigation |
| `show_info` | Boolean | `true` | Show "Showing X-Y of Z" text |
| `show_page_form` | Boolean | `false` | Show jump to page form |
| `show_limit_form` | Boolean | `false` | Show rows per page selector |
| `limit_options` | Array | `[10, 25, 50]` | Options for limit selector |
| `preserve_params` | Hash | `{}` | Query params to preserve |
| `request_path` | String | `request.path` | Custom path for forms |
| `classes` | String | `nil` | Additional wrapper classes |

---

## Variants

### Full (Numbered Pages)

Shows all page numbers with previous/next buttons. Best for desktop and when users need to jump to specific pages.

```erb
<%= render Pagination::Component.new(
  pagy: @pagy,
  variant: :full
) %>
```

### Compact

Shows previous/next buttons with page count info (e.g., "Page 2 of 10"). Good balance between information and space.

```erb
<%= render Pagination::Component.new(
  pagy: @pagy,
  variant: :compact
) %>
```

### Minimal

Shows only previous/next buttons. Best for mobile or when space is limited.

```erb
<%= render Pagination::Component.new(
  pagy: @pagy,
  variant: :minimal,
  show_info: false
) %>
```

---

## Complete Table Example

Here's a full example of pagination within a data table using Turbo Frames:

```erb
<turbo-frame id="users-table" data-pagy-loading-indicator>
  <div class="overflow-hidden rounded-xl border border-black/10 bg-white shadow-xs dark:border-white/10 dark:bg-neutral-900">
    <div class="max-h-[400px] overflow-y-auto">
      <table class="w-full">
        <thead class="bg-neutral-50 dark:bg-neutral-800">
          <tr>
            <th class="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">Name</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">Email</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">Role</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-black/5 dark:divide-white/5">
          <% @users.each do |user| %>
            <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
              <td class="px-4 py-3 text-sm text-neutral-900 dark:text-white"><%= user.name %></td>
              <td class="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400"><%= user.email %></td>
              <td class="px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400"><%= user.role %></td>
            </tr>
          <% end %>
        </tbody>
      </table>
    </div>

    <div class="border-t border-black/10 px-4 py-3 dark:border-white/10">
      <%= render Pagination::Component.new(
        pagy: @pagy,
        frame_id: "users-table",
        show_limit_form: true,
        preserve_params: request.query_parameters
      ) %>
    </div>
  </div>
</turbo-frame>
```

---

## Loading Indicator

Add a loading indicator for Turbo Frame navigation using the `data-pagy-loading-indicator` attribute:

```erb
<turbo-frame id="results" data-pagy-loading-indicator>
  <!-- Content -->
</turbo-frame>
```

Then add CSS to show a loading state:

```css
[data-pagy-loading-indicator][aria-busy="true"] {
  opacity: 0.5;
  pointer-events: none;
}
```

---

## Pagy Styling

The component relies on Pagy's built-in CSS classes. Add the following to your CSS to style the pagination buttons:

```css
/* Pagy pagination button styles */
.pagy a,
.pagy span.current,
.pagy span[aria-disabled="true"] {
  @apply inline-flex items-center justify-center rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm font-medium transition-colors dark:border-white/10 dark:bg-neutral-900;
}

.pagy a {
  @apply text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800;
}

.pagy span.current {
  @apply bg-neutral-900 text-white dark:bg-white dark:text-neutral-900;
}

.pagy span[aria-disabled="true"] {
  @apply cursor-not-allowed text-neutral-400 dark:text-neutral-600;
}

/* Gap indicator */
.pagy span.gap {
  @apply px-2 text-neutral-400 dark:text-neutral-600;
}
```

---

## Accessibility

- Uses `<nav>` element with `aria-label="Pagination"`
- Proper `aria-current="page"` on current page
- `aria-disabled="true"` on disabled prev/next buttons
- `aria-label` attributes on navigation buttons
- Form labels for input fields

---

## Troubleshooting

**Pages not updating in Turbo Frame:** Ensure `frame_id` matches the `<turbo-frame>` ID and links include `data-turbo-frame`.

**Query params lost on pagination:** Pass `preserve_params: request.query_parameters` to maintain filters and sorts.

**Limit form resets to page 1:** This is intentional behavior to avoid "no results" when changing rows per page on a high page number.

**Styles not applying:** Make sure Pagy CSS is included and classes match your Tailwind configuration.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/pagination/`
- **Shared partial files**: `app/views/shared/components/pagination/`
- **shared partial**: `render "shared/components/pagination/pagination"`
- **ViewComponent**: `render Pagination::Component.new(...)`
- **ViewComponent files**: `app/components/pagination/`

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