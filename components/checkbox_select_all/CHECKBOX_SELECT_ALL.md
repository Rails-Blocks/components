# Checkbox Select All Component

Master checkbox that controls child checkboxes with indeterminate state, shift-click batch selection, keyboard navigation, and nested group support.

## Features

- Master checkbox toggles all child checkboxes
- Indeterminate state when partially selected
- Shift-click for batch selection with visual anchor indicator
- Keyboard navigation (↑↓ arrows) and configurable toggle key
- Nested parent/child checkbox groups
- Action bar with selection count
- "Select all pages" support for paginated data
- Total calculation from selected amounts

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/checkbox_select_all/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/checkbox_select_all/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/checkbox_select_all/` | Block-style content, testing |

---

## Stimulus Controller

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `toggleKey` | String | `""` | Keyboard shortcut to toggle focused checkbox (e.g., "x") |
| `baseAmount` | Number | `0` | Base amount for total calculation |
| `totalItems` | Number | `0` | Total items across all pages (for "select all pages" feature) |

### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `selectAll` | Yes | The master "select all" checkbox |
| `checkbox` | Yes | Individual checkboxes to be selected/deselected |
| `child` | No | Child checkboxes within a parent group (for nested hierarchies) |
| `parent` | No | Container element for parent-child checkbox groups |
| `actionBar` | No | Element shown/hidden based on selection state |
| `count` | No | Element displaying the count of selected items |
| `total` | No | Element displaying the calculated total from selected amounts |
| `amount` | No | Elements containing numeric values to sum when selected |
| `pageSelectionInfo` | No | Shows "X of Y row(s) selected." text |
| `selectAllPagesPrompt` | No | Shows "Select all Y rows" button |
| `allPagesSelectedInfo` | No | Shows "All Y row(s) selected." text |
| `allPagesInput` | No | Hidden input to pass all-pages selection state to server |

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggleAll` | `click->checkbox-select-all#toggleAll` | Toggles all checkboxes via select-all |
| `toggle` | `click->checkbox-select-all#toggle` | Handles individual checkbox click with shift-select support |
| `toggleChildren` | `click->checkbox-select-all#toggleChildren` | Toggles all children when parent is clicked |
| `selectAllPages` | `click->checkbox-select-all#selectAllPages` | Selects all items across all pages |
| `clearAllPages` | `click->checkbox-select-all#clearAllPages` | Clears all-pages selection |
| `clearAll` | `click->checkbox-select-all#clearAll` | Clears all selections |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div class="w-full max-w-md" data-controller="checkbox-select-all" data-checkbox-select-all-toggle-key-value="x">
  <div class="bg-white dark:bg-neutral-900 rounded-xl border border-black/10 dark:border-white/10 shadow-xs overflow-hidden">
    <!-- Header with Select All -->
    <div class="px-4 py-3 border-b border-black/10 dark:border-white/10">
      <div class="flex items-center gap-x-3">
        <input
          type="checkbox"
          id="select-all-tasks"
          tabindex="0"
          data-checkbox-select-all-target="selectAll"
          data-action="click->checkbox-select-all#toggleAll">
        <label for="select-all-tasks" class="inline-block font-medium text-sm cursor-pointer select-none">
          Select All Tasks
        </label>
      </div>
    </div>

    <!-- Items List -->
    <div class="divide-y divide-black/10 dark:divide-white/10">
      <div class="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 has-[:checked]:bg-neutral-50 dark:has-[:checked]:bg-neutral-800/50">
        <div class="flex items-center gap-x-3">
          <input
            type="checkbox"
            id="task-1"
            name="tasks[]"
            value="1"
            tabindex="0"
            data-checkbox-select-all-target="checkbox"
            data-action="click->checkbox-select-all#toggle">
          <label for="task-1" class="inline-block text-sm cursor-pointer select-none">
            Update landing page design
          </label>
        </div>
      </div>
      <!-- More items... -->
    </div>
  </div>
</div>
```

### Key Modifications

**Enable keyboard shortcut:** Add `data-checkbox-select-all-toggle-key-value="x"` to container.

**Pre-check items:** Add `checked` attribute to checkbox inputs.

**Disable items:** Add `disabled` attribute to checkbox inputs.

**Add action bar:** Include element with `data-checkbox-select-all-target="actionBar"` and `hidden` attribute.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/checkbox_select_all/checkbox_select_all",
  select_all_label: "Select All Tasks",
  name: "tasks[]",
  items: [
    { label: "Update landing page design", value: "1" },
    { label: "Review pull requests", value: "2" },
    { label: "Write documentation", value: "3" }
  ]
%>
```

### With Options

```erb
<%= render "shared/components/checkbox_select_all/checkbox_select_all",
  select_all_label: "Select Users",
  name: "users[]",
  toggle_key: "x",
  show_action_bar: true,
  show_count: true,
  items: [
    { label: "Alex Johnson", value: "1", checked: true },
    { label: "Sarah Miller", value: "2" },
    { label: "Disabled User", value: "3", disabled: true }
  ]
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `items` | Array | `[]` | Checkbox items (see below) |
| `select_all_label` | String | `"Select All"` | Label for select all checkbox |
| `name` | String | `"items[]"` | Form field name for checkboxes |
| `toggle_key` | String | `nil` | Keyboard shortcut (e.g., "x") |
| `total_items` | Integer | `nil` | Total items for "select all pages" |
| `base_amount` | Number | `nil` | Base amount for total calculation |
| `show_action_bar` | Boolean | `false` | Show action bar when items selected |
| `show_count` | Boolean | `false` | Show selected count in action bar |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `label` | String | required | Item label |
| `value` | String | required | Item value |
| `name` | String | inherited | Override form field name |
| `checked` | Boolean | `false` | Start checked |
| `disabled` | Boolean | `false` | Disable interaction |
| `id` | String | auto | Custom checkbox ID |
| `classes` | String | `nil` | Additional item classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(CheckboxSelectAll::Component.new(
  select_all_label: "Select All Tasks",
  name: "tasks[]"
)) do |c| %>
  <% c.with_item(label: "Update landing page design", value: "1") %>
  <% c.with_item(label: "Review pull requests", value: "2") %>
  <% c.with_item(label: "Write documentation", value: "3") %>
<% end %>
```

### With Nested Groups

```erb
<%= render(CheckboxSelectAll::Component.new(
  select_all_label: "Select All Permissions",
  name: "permissions[]"
)) do |c| %>
  <% c.with_group(
    label: "Content Management",
    description: "Manage posts, pages, and media"
  ) do |group| %>
    <% group.with_item(label: "Create content", value: "content.create") %>
    <% group.with_item(label: "Edit content", value: "content.edit") %>
    <% group.with_item(label: "Delete content", value: "content.delete") %>
  <% end %>

  <% c.with_group(label: "User Management") do |group| %>
    <% group.with_item(label: "View users", value: "users.view") %>
    <% group.with_item(label: "Create users", value: "users.create") %>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `select_all_label` | String | `"Select All"` | Label for select all checkbox |
| `name` | String | `"items[]"` | Form field name |
| `toggle_key` | String | `nil` | Keyboard shortcut |
| `total_items` | Integer | `nil` | Total items across all pages |
| `base_amount` | Number | `nil` | Base amount for total |
| `show_action_bar` | Boolean | `false` | Show action bar |
| `show_count` | Boolean | `false` | Show selected count |
| `classes` | String | `nil` | Additional wrapper classes |

### Item Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | required | Item label |
| `value` | String | required | Item value |
| `name` | String | inherited | Override form field name |
| `checked` | Boolean | `false` | Start checked |
| `disabled` | Boolean | `false` | Disable interaction |
| `id` | String | auto | Custom checkbox ID |
| `classes` | String | `nil` | Additional item classes |

### Group Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | required | Group label |
| `description` | String | `nil` | Group description |
| `icon` | String | `nil` | Icon HTML (rendered as html_safe) |
| `classes` | String | `nil` | Additional group classes |

---

## Keyboard Navigation

| Key | Action |
| --- | ------ |
| `↓` / `→` | Move focus to next checkbox |
| `↑` / `←` | Move focus to previous checkbox |
| `Space` / `Enter` | Toggle focused checkbox |
| Toggle Key (if set) | Toggle focused checkbox |
| `Shift` + Toggle Key | Batch toggle from anchor to current |

When holding Shift, a dashed outline appears on the anchor checkbox (the last clicked/toggled item) to indicate the batch selection range.

---

## Accessibility

- Proper `aria-checked` states on checkboxes
- Keyboard navigation between checkboxes
- Visual focus indicators
- Indeterminate state communicated via `indeterminate` property
- Labels associated with checkboxes via `for` attribute

---

## Troubleshooting

**Checkboxes not syncing:** Ensure each checkbox has `data-checkbox-select-all-target="checkbox"` and `data-action="click->checkbox-select-all#toggle"`.

**Select all not working:** Verify the select all checkbox has `data-checkbox-select-all-target="selectAll"` and `data-action="click->checkbox-select-all#toggleAll"`.

**Nested groups not working:** Parent containers need `data-checkbox-select-all-target="parent"` and parent checkbox needs `data-action="click->checkbox-select-all#toggleChildren click->checkbox-select-all#toggle"`.

**Action bar not showing:** Ensure element has `data-checkbox-select-all-target="actionBar"` and `hidden` attribute.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/checkbox_select_all/`
- **Shared partial files**: `app/views/shared/components/checkbox_select_all/`
- **shared partial**: `render "shared/components/checkbox_select_all/checkbox_select_all"`
- **ViewComponent**: `render CheckboxSelectAll::Component.new(...)`
- **ViewComponent files**: `app/components/checkbox_select_all/`

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