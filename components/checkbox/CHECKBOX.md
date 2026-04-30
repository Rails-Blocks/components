# Checkbox Component

Styled checkbox inputs with labels, descriptions, and various states. Perfect for forms, settings pages, and multi-select options.

## Features

- Multiple sizes (small, medium, large)
- Label and optional description support
- Disabled and required states
- Error message display
- Dark mode support
- Zero JavaScript required
- Accessibility-friendly markup
- Form integration with name/value attributes
- Customizable styling via class overrides

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/checkbox/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/checkbox/` | Reusable partial with locals |
| **ViewComponent** | `app/components/checkbox/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the checkbox HTML directly into your views for maximum flexibility and customization. Best when you need one-off checkboxes or want to modify the markup.

### Shared Partial

Use the reusable partial for consistent checkboxes across your app:

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Subscribe to newsletter",
  name: "user[newsletter]",
  checked: true %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render Checkbox::Component.new(
  label: "Subscribe to newsletter",
  name: "user[newsletter]",
  checked: true
) %>
```

---

## Options Reference

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | **required** | The checkbox label text |
| `name` | String | `nil` | The input name attribute for form submission |
| `id` | String | auto-generated | The input id attribute |
| `value` | String | `"1"` | The input value attribute |
| `checked` | Boolean | `false` | Whether the checkbox is checked |
| `disabled` | Boolean | `false` | Whether the checkbox is disabled |
| `required` | Boolean | `false` | Whether the checkbox is required |
| `description` | String | `nil` | Optional description text below the label |
| `size` | Symbol/String | `:md` / `"md"` | Size: `:sm`, `:md`, `:lg` |
| `indeterminate` | Boolean | `false` | Whether to show indeterminate state (set via JS) |
| `error` | String | `nil` | Error message to display |
| `classes` | String | `nil` | Additional CSS classes for the wrapper |
| `input_classes` | String | `nil` | Additional CSS classes for the input |
| `label_classes` | String | `nil` | Additional CSS classes for the label |

---

## Basic Examples

### Simple Checkbox

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "I agree to the terms and conditions" %>
```

### With Form Name

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Subscribe to newsletter",
  name: "user[newsletter]" %>
```

### Pre-checked

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Email notifications enabled",
  name: "notifications[email]",
  checked: true %>
```

### Disabled

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Premium feature (upgrade required)",
  disabled: true %>
```

### Required

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Accept privacy policy",
  name: "accept_privacy",
  required: true %>
```

---

## With Description

For checkboxes that need additional context:

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Advanced Analytics",
  name: "features[analytics]",
  description: "Get detailed insights about your users and their behavior" %>
```

**ViewComponent:**
```erb
<%= render Checkbox::Component.new(
  label: "Advanced Analytics",
  name: "features[analytics]",
  description: "Get detailed insights about your users and their behavior"
) %>
```

---

## Sizes

### Small

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Compact option",
  size: "sm" %>
```

### Medium (Default)

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Standard option",
  size: "md" %>
```

### Large

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Prominent option",
  size: "lg" %>
```

---

## Error States

Display validation errors alongside the checkbox:

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Accept terms of service",
  name: "accept_terms",
  error: "You must accept the terms to continue" %>
```

---

## Form Integration

### With Rails Form Builder

```erb
<%= form_with model: @user do |f| %>
  <div class="space-y-4">
    <%= render "shared/components/checkbox/checkbox",
      label: "Receive marketing emails",
      name: "user[marketing_emails]",
      checked: @user.marketing_emails %>

    <%= render "shared/components/checkbox/checkbox",
      label: "Receive product updates",
      name: "user[product_updates]",
      checked: @user.product_updates %>
  </div>
<% end %>
```

### Multiple Checkboxes (Same Name)

```erb
<fieldset class="space-y-3">
  <legend class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
    Select features
  </legend>

  <%= render "shared/components/checkbox/checkbox",
    label: "Analytics",
    name: "features[]",
    value: "analytics" %>

  <%= render "shared/components/checkbox/checkbox",
    label: "Notifications",
    name: "features[]",
    value: "notifications" %>

  <%= render "shared/components/checkbox/checkbox",
    label: "API Access",
    name: "features[]",
    value: "api" %>
</fieldset>
```

---

## Customization

### Custom Wrapper Styling

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Highlighted option",
  classes: "p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700" %>
```

### Custom Input Color

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Blue checkbox",
  input_classes: "text-blue-600 focus:ring-blue-500 dark:checked:bg-blue-600" %>
```

### Custom Label Styling

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "Bold label",
  label_classes: "font-bold text-neutral-900 dark:text-white" %>
```

---

## Accessibility

### Semantic Considerations

- Labels are properly associated with inputs via `for` attribute
- Required fields show visual indicator (*)
- Error messages are displayed adjacent to the input
- Disabled states use appropriate styling and cursor

### Example with ARIA

For dynamic error messages, consider adding ARIA attributes:

```erb
<div class="flex items-center gap-2">
  <input
    type="checkbox"
    id="terms"
    name="accept_terms"
    aria-describedby="terms-error"
    aria-invalid="true"
    class="size-4 rounded border-red-500 text-neutral-900 focus:ring-red-500"
  >
  <label for="terms" class="text-sm font-medium text-red-700">
    Accept terms <span class="text-red-500">*</span>
  </label>
</div>
<p id="terms-error" class="text-xs text-red-600 mt-1">
  You must accept the terms to continue
</p>
```

---

## Size Reference

| Size | Input | Label | Description |
| ---- | ----- | ----- | ----------- |
| `sm` | `size-3.5` (14px) | `text-xs` | `text-[11px]` |
| `md` | `size-4` (16px) | `text-sm` | `text-xs` |
| `lg` | `size-5` (20px) | `text-base` | `text-sm` |

---

## Best Practices

1. **Use clear labels**: Labels should clearly describe what checking the box does
2. **Group related checkboxes**: Use fieldsets with legends for groups
3. **Show required fields**: Use the `required` option for mandatory checkboxes
4. **Provide descriptions**: Add context for complex options
5. **Handle errors gracefully**: Display validation errors clearly
6. **Consider mobile**: Ensure touch targets are large enough (use `lg` size if needed)
7. **Test dark mode**: Ensure checkboxes remain visible in both themes

---

## Common Use Cases

### Terms Acceptance

```erb
<%= render "shared/components/checkbox/checkbox",
  label: "I agree to the Terms of Service and Privacy Policy",
  name: "accept_terms",
  required: true %>
```

### Settings Panel

```erb
<div class="space-y-4">
  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
    Notification Settings
  </h3>

  <%= render "shared/components/checkbox/checkbox",
    label: "Email notifications",
    name: "settings[email]",
    description: "Receive updates about your account via email",
    checked: @user.email_notifications %>

  <%= render "shared/components/checkbox/checkbox",
    label: "Push notifications",
    name: "settings[push]",
    description: "Receive real-time notifications in your browser",
    checked: @user.push_notifications %>

  <%= render "shared/components/checkbox/checkbox",
    label: "SMS notifications",
    name: "settings[sms]",
    description: "Receive important alerts via text message",
    checked: @user.sms_notifications %>
</div>
```

### Filter List

```erb
<fieldset class="space-y-2">
  <legend class="sr-only">Filter by status</legend>

  <% %w[active pending completed archived].each do |status| %>
    <%= render "shared/components/checkbox/checkbox",
      label: status.capitalize,
      name: "filters[status][]",
      value: status,
      checked: params.dig(:filters, :status)&.include?(status),
      size: "sm" %>
  <% end %>
</fieldset>
```

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/checkbox/`
- **Shared partial files**: `app/views/shared/components/checkbox/`
- **shared partial**: `render "shared/components/checkbox/checkbox"`
- **ViewComponent**: `render Checkbox::Component.new(...)`
- **ViewComponent files**: `app/components/checkbox/`

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