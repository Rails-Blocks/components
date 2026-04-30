# Two Factor Component

OTP (One-Time Password) code input with individual digit fields, auto-focus navigation, paste support, and full keyboard accessibility. Perfect for 2FA verification, SMS codes, and PIN entry.

## Features

- Individual character input fields with auto-advance
- Full paste support for copying entire codes
- Keyboard navigation (arrow keys, backspace)
- Configurable code length (4-8 digits)
- Optional separator between digit groups
- Three size variants (sm, md, lg)
- Auto-submit option when code is complete
- Dark mode support
- Full accessibility with proper autocomplete hints

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/two_factor/` | Full control, copy-paste, custom layouts |
| **Shared Partials** | `app/views/shared/components/two_factor/` | Reusable partials, simple forms |
| **ViewComponent** | `app/components/two_factor/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `autoSubmit` | Boolean | `false` | Automatically submit form when all digits entered |
| `autofocus` | Boolean | `true` | Focus first input on controller connect |
| `numericOnly` | Boolean | `true` | Restrict each input to digits only (set `false` for alphanumeric/symbol codes) |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `digit` | Yes | Repeated target for each code input field |
| `form` | No | Parent form element for auto-submit |
| `submitButton` | No | Submit button to focus after completion |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `handleInput` | `input->two-factor#handleInput` | Handles character input and auto-advance |
| `handleKeydown` | `keydown->two-factor#handleKeydown` | Handles arrow keys and backspace navigation |
| `handlePaste` | `paste->two-factor#handlePaste` | Handles pasting full codes |
| `handleSubmit` | `submit->two-factor#handleSubmit` | Handles form submission |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic 6-Digit Code

```erb
<div data-controller="two-factor">
  <div class="inline-flex items-center gap-1.5">
    <% 6.times do |i| %>
      <input
        data-two-factor-target="digit"
        data-action="input->two-factor#handleInput keydown->two-factor#handleKeydown paste->two-factor#handlePaste"
        type="text"
        inputmode="numeric"
        id="otp_<%= i + 1 %>"
        name="num<%= i + 1 %>"
        maxlength="1"
        autocomplete="<%= i.zero? ? 'one-time-code' : 'off' %>"
        required
        class="block w-8 h-10 rounded-lg border border-neutral-200 dark:border-neutral-600 px-2 py-1 text-center text-base placeholder-neutral-500 focus:outline-neutral-800 focus:border-neutral-800 dark:focus:outline-neutral-50 dark:focus:border-neutral-50 dark:bg-neutral-800">
      <% if i == 2 %>
        <span class="text-sm text-neutral-400 dark:text-neutral-600">-</span>
      <% end %>
    <% end %>
  </div>
</div>
```

### Key Modifications

**Remove separator:** Delete the `<span>` element between inputs.

**Change code length:** Add or remove input elements. The controller adapts to however many `digit` targets are rendered.

**Auto-submit:** Add `data-two-factor-auto-submit-value="true"` to the controller element and wrap in a form with `data-two-factor-target="form"`.

**Disable autofocus:** Add `data-two-factor-autofocus-value="false"` to the controller element.

**Allow non-numeric codes:** Add `data-two-factor-numeric-only-value="false"` and use `inputmode="text"` on each input.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/two_factor/two_factor" %>
```

### With Label and Hint

```erb
<%= render "shared/components/two_factor/two_factor",
  label: "Verification Code",
  hint: "Enter the 6-digit code sent to your phone"
%>
```

### 4-Digit PIN

```erb
<%= render "shared/components/two_factor/two_factor",
  length: 4,
  separator: false,
  label: "Enter PIN"
%>
```

### Large Auto-Submit Code

```erb
<%= render "shared/components/two_factor/two_factor",
  size: "lg",
  auto_submit: true,
  label: "Two-Factor Code",
  classes: "text-center"
%>
```

### Alphanumeric Code

```erb
<%= render "shared/components/two_factor/two_factor",
  numeric_only: false,
  label: "Recovery Code"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `length` | Integer | `6` | Number of digits (4-8) |
| `name` | String | `nil` | Base name for inputs (`nil` uses num1, num2...) |
| `id_prefix` | String | auto-generated | Prefix for input IDs |
| `auto_submit` | Boolean | `false` | Submit form when complete |
| `autofocus` | Boolean | `true` | Focus first input on mount |
| `numeric_only` | Boolean | `true` | Restrict each input to digits only |
| `separator` | Boolean | `true` | Show separator between groups |
| `separator_position` | Integer | `3` | Position after which to show separator |
| `size` | String | `"md"` | Input size: `"sm"`, `"md"`, `"lg"` |
| `disabled` | Boolean | `false` | Disable all inputs |
| `required` | Boolean | `true` | Mark inputs as required |
| `label` | String | `nil` | Label text |
| `hint` | String | `nil` | Hint text below inputs |
| `error` | String | `nil` | Error message to display |
| `classes` | String | `nil` | Additional wrapper classes |
| `input_classes` | String | `nil` | Additional input classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render TwoFactor::Component.new %>
```

### With Label and Hint

```erb
<%= render TwoFactor::Component.new(
  label: "Verification Code",
  hint: "Enter the 6-digit code sent to your phone"
) %>
```

### 4-Digit PIN

```erb
<%= render TwoFactor::Component.new(
  length: 4,
  separator: false,
  label: "Enter PIN"
) %>
```

### Large Auto-Submit Code

```erb
<%= render TwoFactor::Component.new(
  size: :lg,
  auto_submit: true,
  label: "Two-Factor Code",
  classes: "text-center"
) %>
```

### Alphanumeric Code

```erb
<%= render TwoFactor::Component.new(
  numeric_only: false,
  label: "Recovery Code"
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `length` | Integer | `6` | Number of digits (4-8) |
| `name` | String | `nil` | Base name for inputs |
| `id_prefix` | String | auto-generated | Prefix for input IDs |
| `auto_submit` | Boolean | `false` | Submit form when complete |
| `autofocus` | Boolean | `true` | Focus first input on mount |
| `numeric_only` | Boolean | `true` | Restrict each input to digits only |
| `separator` | Boolean | `true` | Show separator between groups |
| `separator_position` | Integer | `3` | Position after which to show separator |
| `size` | Symbol | `:md` | Input size: `:sm`, `:md`, `:lg` |
| `disabled` | Boolean | `false` | Disable all inputs |
| `required` | Boolean | `true` | Mark inputs as required |
| `label` | String | `nil` | Label text |
| `hint` | String | `nil` | Hint text below inputs |
| `error` | String | `nil` | Error message to display |
| `classes` | String | `nil` | Additional wrapper classes |
| `input_classes` | String | `nil` | Additional input classes |

---

## Size Variants

| Size | Input Dimensions | Best For |
| ---- | ---------------- | -------- |
| `sm` | 28x32px | Compact layouts, mobile |
| `md` | 32x40px | Default, most use cases |
| `lg` | 48x56px | Prominent 2FA screens |

---

## Form Integration

### Basic Form

```erb
<%= form_with url: verify_otp_path, method: :post do |f| %>
  <%= render "shared/components/two_factor/two_factor",
    name: "otp[code]",
    label: "Enter Code"
  %>
  <button type="submit" class="btn btn-primary mt-4">Verify</button>
<% end %>
```

### With Auto-Submit

```erb
<%= form_with url: verify_otp_path, method: :post, data: { two_factor_target: "form" } do |f| %>
  <%= render "shared/components/two_factor/two_factor",
    name: "otp[code]",
    auto_submit: true,
    label: "Enter Code",
    hint: "Code will be verified automatically"
  %>
<% end %>
```

---

## Accessibility

- First input has `autocomplete="one-time-code"` for browser autofill
- `inputmode="numeric"` shows numeric keyboard on mobile
- Arrow key navigation between inputs
- Backspace moves to previous input when empty
- Full paste support from clipboard
- Required fields properly marked
- Error states clearly visible

---

## Troubleshooting

**Auto-advance not working:** Ensure all inputs have `data-action="input->two-factor#handleInput"`.

**Paste not filling all fields:** Verify each digit input has `data-action="paste->two-factor#handlePaste"`.

**Backspace doesn't move focus:** Check `data-action="keydown->two-factor#handleKeydown"` is present.

**Auto-submit not triggering:** Ensure `data-two-factor-auto-submit-value="true"` is set and form has `data-two-factor-target="form"`.

**First input not focused:** Verify `data-two-factor-autofocus-value` is not set to `"false"`.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/two_factor/`
- **Shared partial files**: `app/views/shared/components/two_factor/`
- **shared partial**: `render "shared/components/two_factor/two_factor"`
- **ViewComponent**: `render TwoFactor::Component.new(...)`
- **ViewComponent files**: `app/components/two_factor/`

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