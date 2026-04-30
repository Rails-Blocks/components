# Alert Component

Display important messages to users with styled alert components. Perfect for success messages, errors, warnings, and informational notifications.

## Features

- Multiple semantic variants (success, error, warning, info, neutral)
- Icon support with semantic colors
- **Custom icon support** - Use any SVG icon you want
- Optional descriptions for detailed messaging
- **HTML support in descriptions** - Include links, bold text, etc.
- Responsive grid layout
- Dark mode support
- Zero JavaScript required
- Accessibility-friendly markup

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/alert/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/alert/` | Reusable partial with locals |
| **ViewComponent** | `app/components/alert/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the alert HTML directly into your views for maximum flexibility and customization. Best when you need one-off alerts or want to modify the markup.

### Shared Partial

Use the reusable partial for consistent alerts across your app:

```erb
<%= render "shared/components/alert/alert",
  title: "Success! Your changes have been saved",
  description: "All updates have been applied successfully.",
  variant: "success" %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render Alert::Component.new(
  title: "Success! Your changes have been saved",
  description: "All updates have been applied successfully.",
  variant: :success
) %>
```

---

## Variants

### Success Alert

Use for positive confirmations and successful operations.

```erb
<!-- Success Alert with Title and Description -->
<div class="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
  <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
    <div class="flex items-center h-full">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" class="text-green-500 dark:text-green-400">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
          <circle cx="9" cy="9" r="7.25"></circle>
          <polyline points="5.75 9.25 8 11.75 12.25 6.25"></polyline>
        </g>
      </svg>
    </div>
    <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
      Success! Your changes have been saved
    </h3>
    <div></div>
    <div class="text-sm text-green-700 dark:text-green-300">
      All updates have been applied successfully.
    </div>
  </div>
</div>
```

### Error Alert

Use for errors, failures, and critical issues that need attention.

```erb
<!-- Error Alert with Title and Description -->
<div class="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
  <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
    <div class="flex items-center h-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="text-red-500 dark:text-red-400" width="18" height="18" viewBox="0 0 18 18">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
          <circle cx="9" cy="9" r="7.25"></circle>
          <path d="M9 5.75V9.25"></path>
          <path d="M9 12.5C8.448 12.5 8 12.05 8 11.5C8 10.95 8.448 10.5 9 10.5C9.552 10.5 10 10.95 10 11.5C10 12.05 9.552 12.5 9 12.5Z" fill="currentColor" data-stroke="none" stroke="none"></path>
        </g>
      </svg>
    </div>
    <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
      Error! Something went wrong
    </h3>
    <div></div>
    <div class="text-sm text-red-700 dark:text-red-300">
      There was a problem processing your request. Please try again.
    </div>
  </div>
</div>
```

### Warning Alert

Use for cautionary messages and potential issues that require user attention.

```erb
<!-- Warning Alert with Title and Description -->
<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
  <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
    <div class="flex items-center h-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="text-amber-500 dark:text-amber-400" width="18" height="18" viewBox="0 0 18 18">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
          <path d="M7.63796 3.48996L2.21295 12.89C1.60795 13.9399 2.36395 15.25 3.57495 15.25H14.425C15.636 15.25 16.392 13.9399 15.787 12.89L10.362 3.48996C9.75696 2.44996 8.24296 2.44996 7.63796 3.48996Z"></path>
          <path d="M9 6.75V9.75"></path>
          <path d="M9 13.5C8.448 13.5 8 13.05 8 12.5C8 11.95 8.448 11.5 9 11.5C9.552 11.5 10 11.9501 10 12.5C10 13.0499 9.552 13.5 9 13.5Z" fill="currentColor" data-stroke="none" stroke="none"></path>
        </g>
      </svg>
    </div>
    <h3 class="text-sm font-medium text-amber-800 dark:text-amber-200">
      Warning! Please review before proceeding
    </h3>
    <div></div>
    <div class="text-sm text-amber-700 dark:text-amber-300">
      This action requires your attention. Please review the details carefully.
    </div>
  </div>
</div>
```

### Info Alert

Use for informational messages that need attention (blue theme).

```erb
<!-- Info Alert with Title and Description -->
<div class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
  <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
    <div class="flex items-center h-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="text-blue-500 dark:text-blue-400" width="18" height="18" viewBox="0 0 18 18">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
          <path d="M9 16.25C13.004 16.25 16.25 13.004 16.25 9C16.25 4.996 13.004 1.75 9 1.75C4.996 1.75 1.75 4.996 1.75 9C1.75 13.004 4.996 16.25 9 16.25Z"></path>
          <path d="M9 12.75V9.25C9 8.9739 8.7761 8.75 8.5 8.75H7.75"></path>
          <path d="M9 6.75C8.448 6.75 8 6.301 8 5.75C8 5.199 8.448 4.75 9 4.75C9.552 4.75 10 5.199 10 5.75C10 6.301 9.552 6.75 9 6.75Z" fill="currentColor" data-stroke="none" stroke="none"></path>
        </g>
      </svg>
    </div>
    <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200">
      Information
    </h3>
    <div></div>
    <div class="text-sm text-blue-700 dark:text-blue-300">
      Here's some helpful information about this feature.
    </div>
  </div>
</div>
```

### Neutral Alert

Use for general information and neutral updates that don't require emphasis (gray theme).

```erb
<!-- Neutral Alert with Title and Description -->
<div class="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50">
  <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
    <div class="flex items-center h-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="text-neutral-500 dark:text-neutral-400" width="18" height="18" viewBox="0 0 18 18">
        <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
          <path d="M9 16.25C13.004 16.25 16.25 13.004 16.25 9C16.25 4.996 13.004 1.75 9 1.75C4.996 1.75 1.75 4.996 1.75 9C1.75 13.004 4.996 16.25 9 16.25Z"></path>
          <path d="M9 12.75V9.25C9 8.9739 8.7761 8.75 8.5 8.75H7.75"></path>
          <path d="M9 6.75C8.448 6.75 8 6.301 8 5.75C8 5.199 8.448 4.75 9 4.75C9.552 4.75 10 5.199 10 5.75C10 6.301 9.552 6.75 9 6.75Z" fill="currentColor" data-stroke="none" stroke="none"></path>
        </g>
      </svg>
    </div>
    <h3 class="text-sm font-medium text-neutral-800 dark:text-neutral-200">
      General Notice
    </h3>
    <div></div>
    <div class="text-sm text-neutral-600 dark:text-neutral-400">
      This is a neutral alert for general information or updates that don't require immediate attention.
    </div>
  </div>
</div>
```

---

## Simplified Layouts

### Alert Without Description

For brief notifications when a title alone is sufficient.

```erb
<!-- Success Alert - Title Only -->
<div class="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
  <div class="flex gap-2 items-center">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" class="text-green-500 dark:text-green-400">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor">
        <circle cx="9" cy="9" r="7.25"></circle>
        <polyline points="5.75 9.25 8 11.75 12.25 6.25"></polyline>
      </g>
    </svg>
    <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
      Success! Your changes have been saved
    </h3>
  </div>
</div>
```

---

## Color Scheme Reference

| Variant | Border (Light) | Background (Light) | Border (Dark) | Background (Dark) | Text | Icon |
| ------- | -------------- | ------------------ | ------------- | ----------------- | ---- | ---- |
| **Success** | `border-green-200` | `bg-green-50` | `border-green-800` | `bg-green-900/20` | `text-green-800/700` | `text-green-500` |
| **Error** | `border-red-200` | `bg-red-50` | `border-red-800` | `bg-red-900/20` | `text-red-800/700` | `text-red-500` |
| **Warning** | `border-amber-200` | `bg-amber-50` | `border-amber-800` | `bg-amber-900/20` | `text-amber-800/700` | `text-amber-500` |
| **Info** | `border-blue-200` | `bg-blue-50` | `border-blue-800` | `bg-blue-900/20` | `text-blue-800/700` | `text-blue-500` |
| **Neutral** | `border-neutral-200` | `bg-neutral-50` | `border-neutral-700` | `bg-neutral-800/50` | `text-neutral-800/600` | `text-neutral-500` |

---

## Customization

### Custom Icon

You can override the default variant icon by passing a `custom_icon` parameter:

**ViewComponent:**
```erb
<%= render Alert::Component.new(
  title: "Custom Icon Alert",
  description: "This uses a rocket icon instead of the default.",
  variant: :success,
  custom_icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>'
) %>
```

**Shared Partial:**
```erb
<%= render "shared/components/alert/alert",
  title: "Custom Icon Alert",
  description: "This uses a rocket icon instead of the default.",
  variant: "success",
  custom_icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path></svg>' %>
```

Or replace the SVG manually while maintaining the color classes:

```erb
<div class="flex items-center h-full">
  <!-- Your custom icon SVG here -->
  <svg xmlns="http://www.w3.org/2000/svg" class="text-green-500 dark:text-green-400" width="18" height="18" viewBox="...">
    <!-- ... -->
  </svg>
</div>
```

### Custom Colors

Create custom alert variants by changing the color classes:

```erb
<!-- Purple Alert Example -->
<div class="rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-900/20">
  <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
    <div class="flex items-center h-full">
      <svg class="text-purple-500 dark:text-purple-400" ...>...</svg>
    </div>
    <h3 class="text-sm font-medium text-purple-800 dark:text-purple-200">
      Custom Purple Alert
    </h3>
    <div></div>
    <div class="text-sm text-purple-700 dark:text-purple-300">
      You can create alerts in any color scheme.
    </div>
  </div>
</div>
```

### HTML in Descriptions

Both ViewComponent and Shared Partial support HTML in descriptions for richer formatting:

**ViewComponent:**
```erb
<%= render Alert::Component.new(
  title: "HTML Description Support",
  description: "You can include <strong>bold text</strong>, <em>italics</em>, and even <a href='#' class='underline hover:text-green-900'>links</a> in the description!",
  variant: :success
) %>
```

**Shared Partial:**
```erb
<%= render "shared/components/alert/alert",
  title: "HTML Description Support",
  description: "You can include <strong>bold text</strong>, <em>italics</em>, and even <a href='#' class='underline hover:text-green-900'>links</a> in the description!",
  variant: "success" %>
```

**Security Note:** Always sanitize user-generated content before passing it to the description parameter to prevent XSS attacks. Only use HTML with trusted content.

### Dismissible Alert (Optional)

Add a close button using the Modal controller or custom JavaScript:

```erb
<div class="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
  <div class="grid grid-cols-[auto_1fr_auto] gap-2 items-start">
    <div class="flex items-center h-full">
      <svg xmlns="http://www.w3.org/2000/svg" class="text-green-500 dark:text-green-400" width="18" height="18" viewBox="0 0 18 18">
        <!-- Icon SVG -->
      </svg>
    </div>
    <div>
      <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
        Success!
      </h3>
      <div class="text-sm text-green-700 dark:text-green-300">
        Your changes have been saved.
      </div>
    </div>
    <button type="button" class="text-green-500 hover:text-green-700 dark:text-green-400 dark:hover:text-green-200">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" x2="6" y1="6" y2="18"></line>
        <line x1="6" x2="18" y1="6" y2="18"></line>
      </svg>
    </button>
  </div>
</div>
```

---

## Integration with Rails Flash Messages

Alerts work great with Rails flash messages. Here's a helper method:

```ruby
# app/helpers/application_helper.rb
module ApplicationHelper
  def flash_alert_class(type)
    case type.to_sym
    when :notice, :success
      { border: "border-green-200 dark:border-green-800",
        bg: "bg-green-50 dark:bg-green-900/20",
        icon: "text-green-500 dark:text-green-400",
        title: "text-green-800 dark:text-green-200",
        text: "text-green-700 dark:text-green-300" }
    when :alert, :error
      { border: "border-red-200 dark:border-red-800",
        bg: "bg-red-50 dark:bg-red-900/20",
        icon: "text-red-500 dark:text-red-400",
        title: "text-red-800 dark:text-red-200",
        text: "text-red-700 dark:text-red-300" }
    when :warning
      { border: "border-amber-200 dark:border-amber-800",
        bg: "bg-amber-50 dark:bg-amber-900/20",
        icon: "text-amber-500 dark:text-amber-400",
        title: "text-amber-800 dark:text-amber-200",
        text: "text-amber-700 dark:text-amber-300" }
    else
      { border: "border-blue-200 dark:border-blue-800",
        bg: "bg-blue-50 dark:bg-blue-900/20",
        icon: "text-blue-500 dark:text-blue-400",
        title: "text-blue-800 dark:text-blue-200",
        text: "text-blue-700 dark:text-blue-300" }
    end
  end
end
```

Usage in view:

```erb
<% flash.each do |type, message| %>
  <% classes = flash_alert_class(type) %>
  <div class="rounded-xl border <%= classes[:border] %> <%= classes[:bg] %> p-4 mb-4">
    <div class="flex gap-2 items-center">
      <!-- Icon based on type -->
      <svg class="<%= classes[:icon] %>" width="18" height="18" ...>...</svg>
      <p class="text-sm font-medium <%= classes[:title] %>">
        <%= message %>
      </p>
    </div>
  </div>
<% end %>
```

---

## Accessibility

### Semantic Considerations

- Use appropriate color contrasts for readability
- Icons should complement the message, not replace it
- Consider adding `role="alert"` for important messages
- Use `aria-live="polite"` or `aria-live="assertive"` for dynamic alerts

### Example with ARIA

```erb
<div role="alert" aria-live="polite" class="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
  <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
    <div class="flex items-center h-full" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg" class="text-green-500 dark:text-green-400" width="18" height="18" viewBox="0 0 18 18">
        <!-- Icon SVG -->
      </svg>
    </div>
    <h3 class="text-sm font-medium text-green-800 dark:text-green-200">
      Success! Your changes have been saved
    </h3>
    <div></div>
    <div class="text-sm text-green-700 dark:text-green-300">
      All updates have been applied successfully.
    </div>
  </div>
</div>
```

---

## Best Practices

1. **Choose the Right Variant**: Use semantic colors that match the message type
2. **Keep Messages Concise**: Alert titles should be brief and actionable
3. **Add Descriptions When Needed**: Provide context for important alerts
4. **Consider Placement**: Place alerts where users will see them (top of forms, near relevant content)
5. **Auto-dismiss for Success**: Consider auto-hiding success messages after a few seconds (requires JavaScript)
6. **Don't Overuse**: Too many alerts can overwhelm users
7. **Test Dark Mode**: Ensure alerts remain readable in both light and dark themes

---

## Common Use Cases

### Form Validation

```erb
<% if @user.errors.any? %>
  <div class="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 mb-4">
    <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
      <div class="flex items-center h-full">
        <svg class="text-red-500 dark:text-red-400" width="18" height="18" ...>...</svg>
      </div>
      <h3 class="text-sm font-medium text-red-800 dark:text-red-200">
        <%= pluralize(@user.errors.count, "error") %> prohibited this user from being saved:
      </h3>
      <div></div>
      <ul class="text-sm text-red-700 dark:text-red-300 list-disc list-inside">
        <% @user.errors.full_messages.each do |message| %>
          <li><%= message %></li>
        <% end %>
      </ul>
    </div>
  </div>
<% end %>
```

### Cookie Consent

```erb
<div class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
  <div class="grid grid-cols-[auto_1fr_auto] gap-3 items-center">
    <div class="flex items-center h-full">
      <svg class="text-blue-500 dark:text-blue-400" width="18" height="18" ...>...</svg>
    </div>
    <div class="text-sm text-blue-700 dark:text-blue-300">
      We use cookies to improve your experience on our site.
    </div>
    <button class="px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      Accept
    </button>
  </div>
</div>
```

### System Maintenance

```erb
<div class="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
  <div class="grid grid-cols-[auto_1fr] gap-2 items-start">
    <div class="flex items-center h-full">
      <svg class="text-amber-500 dark:text-amber-400" width="18" height="18" ...>...</svg>
    </div>
    <h3 class="text-sm font-medium text-amber-800 dark:text-amber-200">
      Scheduled Maintenance
    </h3>
    <div></div>
    <div class="text-sm text-amber-700 dark:text-amber-300">
      The system will be undergoing maintenance on <%= Date.tomorrow.strftime("%B %d") %> from 2:00 AM to 4:00 AM EST.
    </div>
  </div>
</div>
```

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/alert/`
- **Shared partial files**: `app/views/shared/components/alert/`
- **shared partial**: `render "shared/components/alert/alert"`
- **ViewComponent**: `render Alert::Component.new(...)`
- **ViewComponent files**: `app/components/alert/`

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