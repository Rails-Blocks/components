# Radio Component

Styled radio button inputs with labels, descriptions, and various states. Perfect for forms, settings pages, and single-select options within a group.

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
- Radio groups (multiple radios with same name)

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/radio/` | Full control, copy-paste |
| **Shared Partial** | `app/views/shared/components/radio/` | Reusable partial with locals |
| **ViewComponent** | `app/components/radio/` | Ruby-based, testable, object-oriented |

### Plain ERB

Copy the radio HTML directly into your views for maximum flexibility and customization. Best when you need one-off radios or want to modify the markup.

### Shared Partial

Use the reusable partial for consistent radio buttons across your app:

```erb
<%= render "shared/components/radio/radio",
  label: "Option A",
  name: "selection",
  value: "a",
  checked: true %>
```

### ViewComponent

Use the object-oriented ViewComponent approach for better testing and Ruby-based logic:

```erb
<%= render Radio::Component.new(
  label: "Option A",
  name: "selection",
  value: "a",
  checked: true
) %>
```

---

## Options Reference

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | **required** | The radio button label text |
| `name` | String | `nil` | The input name attribute for form submission (radios with same name form a group) |
| `id` | String | auto-generated | The input id attribute |
| `value` | String | `nil` | The input value attribute |
| `checked` | Boolean | `false` | Whether the radio button is selected |
| `disabled` | Boolean | `false` | Whether the radio button is disabled |
| `required` | Boolean | `false` | Whether the radio button is required |
| `description` | String | `nil` | Optional description text below the label |
| `size` | Symbol/String | `:md` / `"md"` | Size: `:sm`, `:md`, `:lg` |
| `error` | String | `nil` | Error message to display |
| `classes` | String | `nil` | Additional CSS classes for the wrapper |
| `input_classes` | String | `nil` | Additional CSS classes for the input |
| `label_classes` | String | `nil` | Additional CSS classes for the label |

---

## Basic Examples

### Simple Radio Button

```erb
<%= render "shared/components/radio/radio",
  label: "Select this option",
  name: "option",
  value: "selected" %>
```

### Radio Button Group

Radio buttons with the same `name` form a group where only one can be selected:

```erb
<fieldset class="space-y-3">
  <legend class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
    Payment Method
  </legend>

  <%= render "shared/components/radio/radio",
    label: "Credit Card",
    name: "payment",
    value: "card",
    checked: true %>

  <%= render "shared/components/radio/radio",
    label: "PayPal",
    name: "payment",
    value: "paypal" %>

  <%= render "shared/components/radio/radio",
    label: "Bank Transfer",
    name: "payment",
    value: "bank" %>
</fieldset>
```

### Disabled

```erb
<%= render "shared/components/radio/radio",
  label: "Coming soon (disabled)",
  name: "feature",
  value: "disabled",
  disabled: true %>
```

### Required

```erb
<%= render "shared/components/radio/radio",
  label: "Accept terms",
  name: "accept_terms",
  value: "yes",
  required: true %>
```

---

## With Description

For radio buttons that need additional context:

```erb
<%= render "shared/components/radio/radio",
  label: "Professional Plan",
  name: "plan",
  value: "professional",
  description: "Advanced features for growing businesses and teams" %>
```

**ViewComponent:**
```erb
<%= render Radio::Component.new(
  label: "Professional Plan",
  name: "plan",
  value: "professional",
  description: "Advanced features for growing businesses and teams"
) %>
```

---

## Sizes

### Small

```erb
<%= render "shared/components/radio/radio",
  label: "Compact option",
  name: "size_demo",
  value: "sm",
  size: "sm" %>
```

### Medium (Default)

```erb
<%= render "shared/components/radio/radio",
  label: "Standard option",
  name: "size_demo",
  value: "md",
  size: "md" %>
```

### Large

```erb
<%= render "shared/components/radio/radio",
  label: "Prominent option",
  name: "size_demo",
  value: "lg",
  size: "lg" %>
```

---

## Error States

Display validation errors alongside the radio button:

```erb
<%= render "shared/components/radio/radio",
  label: "Select this option",
  name: "required_selection",
  value: "option",
  error: "Please select an option to continue" %>
```

---

## Form Integration

### With Rails Form Builder

```erb
<%= form_with model: @order do |f| %>
  <fieldset class="space-y-3">
    <legend class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
      Shipping Method
    </legend>

    <%= render "shared/components/radio/radio",
      label: "Standard Shipping (5-7 days)",
      name: "order[shipping]",
      value: "standard",
      checked: @order.shipping == "standard" %>

    <%= render "shared/components/radio/radio",
      label: "Express Shipping (2-3 days)",
      name: "order[shipping]",
      value: "express",
      checked: @order.shipping == "express" %>

    <%= render "shared/components/radio/radio",
      label: "Overnight Shipping (1 day)",
      name: "order[shipping]",
      value: "overnight",
      checked: @order.shipping == "overnight" %>
  </fieldset>
<% end %>
```

### Subscription Plans

```erb
<fieldset class="space-y-4">
  <legend class="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
    Choose Your Plan
  </legend>

  <%= render "shared/components/radio/radio",
    label: "Basic - $9/month",
    name: "plan",
    value: "basic",
    description: "Perfect for individuals getting started" %>

  <%= render "shared/components/radio/radio",
    label: "Professional - $29/month",
    name: "plan",
    value: "professional",
    description: "Advanced features for growing businesses",
    checked: true %>

  <%= render "shared/components/radio/radio",
    label: "Enterprise - $99/month",
    name: "plan",
    value: "enterprise",
    description: "Full-featured solution with priority support" %>
</fieldset>
```

---

## Customization

### Custom Wrapper Styling

```erb
<%= render "shared/components/radio/radio",
  label: "Highlighted option",
  name: "highlighted",
  value: "highlight",
  classes: "p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700" %>
```

### Custom Input Color

```erb
<%= render "shared/components/radio/radio",
  label: "Blue radio",
  name: "color_demo",
  value: "blue",
  input_classes: "text-blue-600 focus:ring-blue-500 dark:checked:bg-blue-600" %>
```

### Custom Label Styling

```erb
<%= render "shared/components/radio/radio",
  label: "Bold label",
  name: "label_demo",
  value: "bold",
  label_classes: "font-bold text-neutral-900 dark:text-white" %>
```

---

## Accessibility

### Semantic Considerations

- Labels are properly associated with inputs via `for` attribute
- Required fields show visual indicator (*)
- Error messages are displayed adjacent to the input
- Disabled states use appropriate styling and cursor
- Use `<fieldset>` and `<legend>` to group related radio buttons

### Example with ARIA

For dynamic error messages, consider adding ARIA attributes:

```erb
<fieldset aria-describedby="plan-error">
  <legend class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
    Select a plan <span class="text-red-500">*</span>
  </legend>

  <div class="flex items-center gap-2 mt-2">
    <input
      type="radio"
      id="plan-basic"
      name="plan"
      value="basic"
      aria-invalid="true"
      class="size-4 rounded-full border-red-500 text-neutral-900 focus:ring-red-500"
    >
    <label for="plan-basic" class="text-sm font-medium text-red-700">
      Basic
    </label>
  </div>

  <p id="plan-error" class="text-xs text-red-600 mt-2">
    Please select a plan to continue
  </p>
</fieldset>
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

1. **Use clear labels**: Labels should clearly describe what selecting the option does
2. **Group related options**: Use fieldsets with legends for radio groups
3. **Mark required fields**: Use the `required` option for mandatory selections
4. **Provide descriptions**: Add context for complex options
5. **Handle errors gracefully**: Display validation errors clearly
6. **Consider mobile**: Ensure touch targets are large enough (use `lg` size if needed)
7. **Test dark mode**: Ensure radio buttons remain visible in both themes
8. **Default selection**: Consider pre-selecting the most common option
9. **Limit options**: Keep radio groups to 5-7 options max; use a select/dropdown for more

---

## Common Use Cases

### Survey Question

```erb
<fieldset class="space-y-3">
  <legend class="text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-4">
    How satisfied are you with our service?
  </legend>

  <% %w[very_satisfied satisfied neutral dissatisfied very_dissatisfied].each do |rating| %>
    <%= render "shared/components/radio/radio",
      label: rating.humanize,
      name: "satisfaction",
      value: rating,
      size: "sm" %>
  <% end %>
</fieldset>
```

### Settings Panel

```erb
<div class="space-y-6">
  <h3 class="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
    Email Frequency
  </h3>

  <fieldset class="space-y-4">
    <legend class="sr-only">Email frequency</legend>

    <%= render "shared/components/radio/radio",
      label: "Real-time",
      name: "email_frequency",
      value: "realtime",
      description: "Get notified immediately for all updates" %>

    <%= render "shared/components/radio/radio",
      label: "Daily digest",
      name: "email_frequency",
      value: "daily",
      description: "Receive a daily summary of activity",
      checked: @user.email_frequency == "daily" %>

    <%= render "shared/components/radio/radio",
      label: "Weekly digest",
      name: "email_frequency",
      value: "weekly",
      description: "Receive a weekly summary of activity" %>

    <%= render "shared/components/radio/radio",
      label: "Never",
      name: "email_frequency",
      value: "never",
      description: "Don't send me any email notifications" %>
  </fieldset>
</div>
```

### Filter Options

```erb
<fieldset class="space-y-2">
  <legend class="sr-only">Sort by</legend>

  <% [
    ["newest", "Newest first"],
    ["oldest", "Oldest first"],
    ["popular", "Most popular"],
    ["alphabetical", "A to Z"]
  ].each do |value, label| %>
    <%= render "shared/components/radio/radio",
      label: label,
      name: "sort",
      value: value,
      checked: params[:sort] == value,
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

- **Vanilla examples**: `app/views/components/radio/`
- **Shared partial files**: `app/views/shared/components/radio/`
- **shared partial**: `render "shared/components/radio/radio"`
- **ViewComponent**: `render Radio::Component.new(...)`
- **ViewComponent files**: `app/components/radio/`

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