# Confirmation Component

Confirmation dialogs for destructive or important actions requiring explicit user verification before proceeding.

## Features

- Multiple visual variants (danger, warning, info, neutral)
- Text confirmation input (type "DELETE" to confirm)
- Case-sensitive matching option
- Checkbox confirmation support
- Custom content blocks for detailed warnings
- Form submission integration
- Full keyboard support (Enter to confirm when valid)
- Dark mode support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/confirmation/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/confirmation/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/confirmation/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `confirmText` | String | `""` | Text user must type to enable confirmation |
| `caseSensitive` | Boolean | `false` | Whether text matching is case-sensitive |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `input` | No | Text input for typing confirmation text |
| `confirmButton` | Yes | Button that triggers the confirmation action |
| `checkbox` | No | Checkbox(es) that must be checked to confirm |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `confirm` | `click->confirmation#confirm` | Triggers confirmation if requirements met |
| `cancel` | `click->confirmation#cancel` | Resets and cancels the confirmation |

### Events

| Event | Description |
| ----- | ----------- |
| `confirmation:before` | Dispatched before confirmation, cancelable |
| `confirmation:confirmed` | Dispatched after successful confirmation |
| `confirmation:cancelled` | Dispatched when user cancels |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div class="max-w-md bg-white dark:bg-neutral-800 border border-black/10 dark:border-white/10 rounded-xl shadow-xs overflow-hidden px-4 py-5 sm:p-6">
  <div class="mb-4">
    <h3 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Delete Account</h3>
    <p class="text-sm text-neutral-600 dark:text-neutral-400">This action cannot be undone. This will permanently delete your account.</p>
  </div>

  <form data-controller="confirmation" data-confirmation-confirm-text-value="DELETE">
    <div class="mb-4">
      <label for="confirm-delete" class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
        Type <span class="inline rounded-md border border-black/10 bg-white px-1 py-0.5 font-mono text-neutral-800 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200">DELETE</span> to confirm:
      </label>
      <input type="text"
             id="confirm-delete"
             data-confirmation-target="input"
             class="form-control"
             autocomplete="off"
             placeholder="Type DELETE to confirm">
    </div>

    <div class="flex gap-3 justify-end">
      <button type="button"
              data-action="click->confirmation#cancel"
              class="flex items-center justify-center gap-1.5 rounded-lg border border-black/10 bg-white/90 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-neutral-800 shadow-xs transition-all duration-100 ease-in-out select-none hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-700/50 dark:text-neutral-50 dark:hover:bg-neutral-700/75">
        Cancel
      </button>
      <button type="button"
              data-confirmation-target="confirmButton"
              data-action="click->confirmation#confirm"
              disabled
              class="flex items-center justify-center gap-1.5 rounded-lg border border-red-300/30 bg-red-600 px-3.5 py-2 text-sm font-medium whitespace-nowrap text-white shadow-sm transition-all duration-100 ease-in-out select-none hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50">
        Delete Account
      </button>
    </div>
  </form>
</div>
```

### Key Modifications

**Case-sensitive matching:** Add `data-confirmation-case-sensitive-value="true"` to form.

**Multiple confirm texts:** Use comma-separated values: `data-confirmation-confirm-text-value="DELETE, REMOVE"`.

**Checkbox confirmation:** Add `data-confirmation-target="checkbox"` to checkbox inputs.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/confirmation/confirmation",
  title: "Delete Account",
  message: "This action cannot be undone.",
  confirm_text: "DELETE",
  confirm_button_text: "Delete Account",
  variant: "danger"
%>
```

### With Custom Content

```erb
<%= render "shared/components/confirmation/confirmation",
  title: "Delete Workspace",
  message: "This action cannot be undone.",
  confirm_text: "PERMANENTLY DELETE",
  confirm_button_text: "Delete Workspace",
  variant: "danger" do %>
  <div class="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
    <h4 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">This will permanently delete:</h4>
    <ul class="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
      <li>All projects and files</li>
      <li>All team member access</li>
      <li>Billing history</li>
    </ul>
  </div>
<% end %>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `title` | String | required | Dialog title |
| `message` | String | `nil` | Description/warning message |
| `confirm_text` | String | `nil` | Text user must type to confirm |
| `confirm_button_text` | String | `"Confirm"` | Confirm button label |
| `cancel_button_text` | String | `"Cancel"` | Cancel button label |
| `variant` | String | `"danger"` | `"danger"`, `"warning"`, `"info"`, `"neutral"` |
| `show_icon` | Boolean | `true` | Show variant icon |
| `case_sensitive` | Boolean | `false` | Case-sensitive text matching |
| `input_placeholder` | String | auto | Input placeholder text |
| `input_label` | String | auto | Label above input (HTML supported) |
| `show_card` | Boolean | `true` | Wrap in card styling |
| `classes` | String | `nil` | Additional wrapper classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render Confirmation::Component.new(
  title: "Delete Account",
  message: "This action cannot be undone.",
  confirm_text: "DELETE",
  confirm_button_text: "Delete Account",
  variant: :danger
) %>
```

### With Additional Block Content

```erb
<%= render Confirmation::Component.new(
  title: "Delete Workspace",
  message: "This action cannot be undone.",
  confirm_text: "PERMANENTLY DELETE",
  confirm_button_text: "Delete Workspace",
  variant: :danger
) do %>
  <div class="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
    <h4 class="text-sm font-medium text-red-800 dark:text-red-200 mb-2">This will permanently delete:</h4>
    <ul class="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
      <li>All projects and files</li>
      <li>All team member access</li>
      <li>Billing history</li>
    </ul>
  </div>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `title` | String | required | Dialog title |
| `message` | String | `nil` | Description/warning message |
| `confirm_text` | String | `nil` | Text user must type to confirm |
| `confirm_button_text` | String | `"Confirm"` | Confirm button label |
| `cancel_button_text` | String | `"Cancel"` | Cancel button label |
| `variant` | Symbol | `:danger` | `:danger`, `:warning`, `:info`, `:neutral` |
| `show_icon` | Boolean | `true` | Show variant icon |
| `case_sensitive` | Boolean | `false` | Case-sensitive text matching |
| `input_placeholder` | String | auto | Input placeholder text |
| `input_label` | String | auto | Label above input (HTML supported) |
| `show_card` | Boolean | `true` | Wrap in card styling |
| `classes` | String | `nil` | Additional wrapper classes |

---

## Variants

| Variant | Use Case | Button Color |
| ------- | -------- | ------------ |
| `danger` | Destructive actions (delete, remove) | Red |
| `warning` | Potentially risky actions (reset, overwrite) | Amber |
| `info` | Non-destructive confirmations (create, publish) | Blue |
| `neutral` | General confirmations (transfer, archive) | Gray/Black |

---

## Using with Modals

Combine with the Modal component for dialog-style confirmations:

```erb
<div data-controller="modal">
  <button class="btn-danger" data-action="click->modal#open:prevent">
    Delete Workspace
  </button>

  <dialog class="modal max-w-lg ..." data-modal-target="dialog">
    <div class="p-6">
      <%= render "shared/components/confirmation/confirmation",
        title: "Delete Workspace",
        message: "This action cannot be undone.",
        confirm_text: "PERMANENTLY DELETE",
        confirm_button_text: "Delete Workspace",
        variant: "danger",
        show_card: false %>
    </div>
  </dialog>
</div>
```

**Important:** Set `show_card: false` when using inside modals to avoid nested card styling.

For the cancel button to close the modal, add the modal close action:

```erb
<button data-action="click->modal#close:prevent click->confirmation#cancel">Cancel</button>
<button data-action="click->confirmation#confirm click->modal#close:prevent">Confirm</button>
```

---

## Checkbox Confirmation

For multi-step confirmations requiring checkboxes:

```erb
<form data-controller="confirmation" data-confirmation-confirm-text-value="TRANSFER">
  <div class="mb-4">
    <input type="text" data-confirmation-target="input" class="form-control" placeholder="Type TRANSFER">
  </div>

  <div class="space-y-3 mb-4">
    <label class="flex items-center gap-2">
      <input type="checkbox" data-confirmation-target="checkbox" class="form-checkbox">
      <span>I understand ownership will transfer immediately</span>
    </label>
    <label class="flex items-center gap-2">
      <input type="checkbox" data-confirmation-target="checkbox" class="form-checkbox">
      <span>I understand this cannot be undone</span>
    </label>
  </div>

  <button data-confirmation-target="confirmButton" data-action="click->confirmation#confirm" disabled>
    Transfer
  </button>
</form>
```

All checkboxes must be checked AND the confirm text must match for the button to enable.

---

## Form Integration

The confirmation controller integrates with forms. When the confirm button is clicked and requirements are met, the parent form will be submitted:

```erb
<%= form_with url: delete_account_path, method: :delete do |f| %>
  <div data-controller="confirmation" data-confirmation-confirm-text-value="DELETE">
    <input type="text" data-confirmation-target="input" class="form-control">
    <button type="submit" data-confirmation-target="confirmButton" data-action="click->confirmation#confirm" disabled>
      Delete Account
    </button>
  </div>
<% end %>
```

The controller prevents form submission until confirmation requirements are met.

---

## Accessibility

- Labels are properly associated with inputs via `for`/`id`
- Disabled state is communicated to screen readers
- Keyboard navigation (Tab, Enter, Escape)
- Focus management on modal open/close
- Clear visual feedback for enabled/disabled states

---

## Troubleshooting

**Button doesn't enable:** Ensure `data-confirmation-target="input"` is on the input and `data-confirmation-target="confirmButton"` is on the button.

**Case-sensitivity not working:** Add `data-confirmation-case-sensitive-value="true"` to the controller element.

**Form submits without confirmation:** Ensure the confirmation controller wraps the form or is on the form element itself.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/confirmation/`
- **Shared partial files**: `app/views/shared/components/confirmation/`
- **shared partial**: `render "shared/components/confirmation/confirmation"`
- **ViewComponent**: `render Confirmation::Component.new(...)`
- **ViewComponent files**: `app/components/confirmation/`

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