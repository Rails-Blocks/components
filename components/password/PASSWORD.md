# Password Component

Password input with visibility toggle, real-time strength meter, and requirements checklist. Features smooth animations and accessible keyboard navigation.

## Features

- Show/hide password toggle with animated icon
- Real-time strength meter (Weak → Fair → Good → Strong)
- Password requirements checklist with live validation
- Password confirmation matching (via plain ERB examples)
- Full keyboard accessibility
- Dark mode support
- Customizable styling

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/password/` | Full control, copy-paste, confirmation fields |
| **Shared Partials** | `app/views/shared/components/password/` | Reusable partials, simple forms |
| **ViewComponent** | `app/components/password/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `strength` | Boolean | `false` | Enable strength meter display |
| `requirements` | Boolean | `false` | Enable requirements checklist |
| `confirm` | Boolean | `false` | Enable password confirmation matching |
| `confirmDelay` | Number | `300` | Delay in ms before checking confirmation match |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `input` | Yes | Main password input element |
| `toggleIcon` | No | Container for the visibility toggle icon |
| `strengthBar` | No | Progress bar element for strength indicator |
| `strengthText` | No | Text label showing strength level |
| `lengthCheck` | No | Requirement item for length check |
| `lowercaseCheck` | No | Requirement item for lowercase check |
| `uppercaseCheck` | No | Requirement item for uppercase check |
| `numberCheck` | No | Requirement item for number/special char check |
| `confirm` | No | Confirmation password input element |
| `confirmToggleIcon` | No | Toggle icon for confirmation field |
| `matchIndicator` | No | Container for match/mismatch indicator |
| `matchText` | No | Text showing match status |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggle` | `click->password#toggle` | Toggles main password visibility |
| `toggleConfirm` | `click->password#toggleConfirm` | Toggles confirmation password visibility |
| `handleInput` | `input->password#handleInput` | Handles input for strength/requirements |
| `checkMatch` | `input->password#checkMatch` | Checks if confirmation matches |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Password with Toggle

```erb
<div class="w-full max-w-sm">
  <label for="basic_password" class="label mb-1.5 text-sm">Password</label>
  <div class="relative" data-controller="password">
    <input type="password"
           id="basic_password"
           name="password"
           class="form-control !pr-12"
           placeholder="Enter your password..."
           data-password-target="input">
    <button type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
            data-action="click->password#toggle"
            aria-label="Toggle password visibility">
      <span data-password-target="toggleIcon">
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" width="18" height="18" viewBox="0 0 18 18"><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" stroke="currentColor"><path d="M9 11.75C10.5188 11.75 11.75 10.5188 11.75 9C11.75 7.48122 10.5188 6.25 9 6.25C7.48122 6.25 6.25 7.48122 6.25 9C6.25 10.5188 7.48122 11.75 9 11.75Z"></path> <path d="M15.9557 7.88669C16.3481 8.57939 16.3481 9.42049 15.9557 10.1132C15.0087 11.7849 12.7944 14.4999 9 14.4999C5.2056 14.4999 2.9912 11.7849 2.0443 10.1132C1.6519 9.42049 1.6519 8.57939 2.0443 7.88669C2.9913 6.21499 5.2056 3.5 9 3.5C12.7944 3.5 15.0088 6.21499 15.9557 7.88669Z"></path></g></svg>
      </span>
    </button>
  </div>
</div>
```

### Key Modifications

**Add strength meter:** Add `data-password-strength-value="true"` to the controller element and include the strength bar markup.

**Add requirements:** Add `data-password-requirements-value="true"` to the controller element and include the requirements checklist markup.

**Add confirmation:** Add `data-password-confirm-value="true"` and include a second input with `data-password-target="confirm"`.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/password/password",
  label: "Password",
  name: "user[password]",
  placeholder: "Enter your password"
%>
```

### With Strength Meter

```erb
<%= render "shared/components/password/password",
  label: "Create Password",
  name: "user[password]",
  placeholder: "Create a strong password...",
  show_strength: true,
  autocomplete: "new-password"
%>
```

### With Requirements Checklist

```erb
<%= render "shared/components/password/password",
  label: "Create a secure password",
  name: "user[password]",
  show_requirements: true,
  autocomplete: "new-password"
%>
```

### Full-Featured Registration

```erb
<%= render "shared/components/password/password",
  label: "Create Password",
  name: "user[password]",
  placeholder: "Create a secure password...",
  required: true,
  show_strength: true,
  show_requirements: true,
  autocomplete: "new-password",
  classes: "max-w-md"
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `label` | String | `"Password"` | Label text (set to nil to hide) |
| `name` | String | `nil` | Input name for form submission |
| `id` | String | auto-generated | Input id attribute |
| `placeholder` | String | `nil` | Placeholder text |
| `value` | String | `nil` | Initial value (rarely used) |
| `required` | Boolean | `false` | Mark as required |
| `disabled` | Boolean | `false` | Disable the input |
| `autocomplete` | String | `"current-password"` | Autocomplete attribute |
| `show_toggle` | Boolean | `true` | Show visibility toggle |
| `show_strength` | Boolean | `false` | Show strength meter |
| `show_requirements` | Boolean | `false` | Show requirements checklist |
| `error` | String | `nil` | Error message to display |
| `hint` | String | `nil` | Hint text below input |
| `classes` | String | `nil` | Additional wrapper classes |
| `input_classes` | String | `nil` | Additional input classes |
| `label_classes` | String | `nil` | Additional label classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render Password::Component.new(
  label: "Password",
  name: "user[password]",
  placeholder: "Enter your password"
) %>
```

### With Strength Meter

```erb
<%= render Password::Component.new(
  label: "Create Password",
  name: "user[password]",
  show_strength: true,
  autocomplete: "new-password"
) %>
```

### With Requirements Checklist

```erb
<%= render Password::Component.new(
  label: "Create a secure password",
  name: "user[password]",
  show_requirements: true,
  autocomplete: "new-password"
) %>
```

### Full-Featured Registration

```erb
<%= render Password::Component.new(
  label: "Create Password",
  name: "user[password]",
  placeholder: "Create a secure password...",
  required: true,
  show_strength: true,
  show_requirements: true,
  autocomplete: "new-password",
  classes: "max-w-md"
) %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | `"Password"` | Label text (set to nil to hide) |
| `name` | String | `nil` | Input name for form submission |
| `id` | String | auto-generated | Input id attribute |
| `placeholder` | String | `nil` | Placeholder text |
| `value` | String | `nil` | Initial value (rarely used) |
| `required` | Boolean | `false` | Mark as required |
| `disabled` | Boolean | `false` | Disable the input |
| `autocomplete` | String | `"current-password"` | Autocomplete attribute |
| `show_toggle` | Boolean | `true` | Show visibility toggle |
| `show_strength` | Boolean | `false` | Show strength meter |
| `show_requirements` | Boolean | `false` | Show requirements checklist |
| `error` | String | `nil` | Error message to display |
| `hint` | String | `nil` | Hint text below input |
| `classes` | String | `nil` | Additional wrapper classes |
| `input_classes` | String | `nil` | Additional input classes |
| `label_classes` | String | `nil` | Additional label classes |

---

## Strength Levels

| Level | Score | Color | Criteria |
| ----- | ----- | ----- | -------- |
| Weak | 0-25% | Red | Missing most requirements |
| Fair | 26-50% | Yellow | Has length + 1 character type |
| Good | 51-99% | Lime | Has 3 of 4 requirements |
| Strong | 100% | Green | All requirements met |

---

## Password Requirements

The requirements checklist validates:

1. **Length**: At least 8 characters
2. **Lowercase**: One lowercase letter (a-z)
3. **Uppercase**: One uppercase letter (A-Z)
4. **Number/Special**: One number (0-9) or special character (!@#$%^&*)

---

## Accessibility

- Toggle button has `aria-label="Toggle password visibility"`
- Input properly linked to label via `for`/`id` attributes
- Required fields marked with asterisk and `required` attribute
- Error messages clearly visible and color-coded
- Keyboard navigation supported for toggle button

---

## Troubleshooting

**Toggle doesn't work:** Ensure `data-password-target="toggleIcon"` is on the span wrapping the SVG.

**Strength meter not updating:** Verify `data-password-strength-value="true"` is set and `data-action="input->password#handleInput"` is on the input.

**Requirements not checking:** Ensure all four requirement targets exist (`lengthCheck`, `lowercaseCheck`, `uppercaseCheck`, `numberCheck`).

**Confirmation not matching:** Set `data-password-confirm-value="true"` and ensure both inputs have proper targets.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/password/`
- **Shared partial files**: `app/views/shared/components/password/`
- **shared partial**: `render "shared/components/password/password"`
- **ViewComponent**: `render Password::Component.new(...)`
- **ViewComponent files**: `app/components/password/`

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