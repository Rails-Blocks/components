# Tree View Component

Hierarchical tree navigation for file browsers, nested menus, and organizational structures with optional checkbox selection.

## Features

- Nested folder/file structure with unlimited depth
- Smooth expand/collapse animations
- Full keyboard navigation (↑↓ arrows, Enter/Space)
- Optional checkbox selection with parent-child relationships
- "Select All" functionality using `checkbox_select_all` patterns
- Shift+click for batch selection
- Indeterminate state for partially selected folders
- Two visual variants (default, bordered)

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/tree_view/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/tree_view/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/tree_view/` | Block-style content, testing |

---

## Stimulus Controller

The tree view uses the `tree-view` controller for expand/collapse behavior. When `selectable: true`, it also uses the `checkbox-select-all` controller for parent-child selection.

### Tree View Controller

#### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `animate` | Boolean | `true` | Enable expand/collapse animations |

#### Targets

| Target | Required | Description |
| ------ | -------- | ----------- |
| `icon` | No | Folder icon element that changes on open/close |
| `content` | Yes | Collapsible content area for folder children |

#### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `toggle` | `click->tree-view#toggle` | Toggles folder open/closed |
| `selectFile` | `click->tree-view#selectFile` | Toggles file checkbox (selectable mode) |

### Checkbox Select All Controller

When `selectable: true`, the tree view integrates with the `checkbox-select-all` controller. See the Checkbox Select All component documentation for full details.

#### Key Data Attributes for Selection

| Attribute | Usage | Description |
| --------- | ----- | ----------- |
| `data-checkbox-select-all-target="selectAll"` | On header checkbox | Master "select all" toggle |
| `data-checkbox-select-all-target="checkbox child"` | On node checkboxes | Individual selectable items |
| `data-checkbox-select-all-target="parent"` | On folder containers | Groups children for parent-child logic |

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div data-controller="tree-view" data-tree-view-animate-value="true" class="w-full max-w-md p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
  <div class="flex flex-col gap-y-1">
    <!-- Folder -->
    <button type="button"
            data-action="click->tree-view#toggle"
            aria-controls="tree-content-src"
            aria-expanded="true"
            data-state="open"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700/50 outline-hidden focus:underline">
      <svg data-tree-view-target="icon" class="folder-open" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><!-- folder icon --></svg>
      <span class="font-medium">src</span>
    </button>
    <div id="tree-content-src"
         data-state="open"
         role="region"
         class="grid transition-[grid-template-rows] duration-300 ease-in-out data-[state=open]:grid-rows-[1fr] data-[state=closed]:grid-rows-[0fr]"
         data-tree-view-target="content">
      <div class="ml-4 pl-2 border-l border-neutral-200 dark:border-neutral-700 flex flex-col gap-y-1 overflow-hidden min-h-0">
        <!-- File -->
        <button type="button" data-tree-view-item class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700/50 outline-hidden focus:underline">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18"><!-- file icon --></svg>
          <span>index.ts</span>
        </button>
      </div>
    </div>
  </div>
</div>
```

### Key Modifications

**Start folder expanded:** Set `data-state="open"`, `aria-expanded="true"`, and remove `hidden` attribute from content.

**Start folder collapsed:** Set `data-state="closed"`, `aria-expanded="false"`, and add `hidden` attribute to content.

**Add checkbox selection:** See the `_2_tree_view_with_checkboxes.html.erb` example for the full pattern with `checkbox-select-all` integration.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/tree_view/tree_view",
  variant: "bordered",
  nodes: [
    {
      label: "src",
      type: :folder,
      default_open: true,
      children: [
        { label: "index.ts", type: :file },
        { label: "utils.ts", type: :file }
      ]
    },
    { label: "README.md", type: :file }
  ]
%>
```

### With Checkbox Selection

```erb
<%= render "shared/components/tree_view/tree_view",
  selectable: true,
  name: "files[]",
  select_all_label: "Select All Files",
  toggle_key: "x",
  variant: "bordered",
  nodes: [
    {
      label: "app",
      type: :folder,
      default_open: true,
      children: [
        { label: "layout.tsx", type: :file, value: "app/layout.tsx" },
        { label: "page.tsx", type: :file, value: "app/page.tsx", checked: true }
      ]
    }
  ]
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `nodes` | Array | `[]` | Tree nodes (see Node Hash below) |
| `selectable` | Boolean | `false` | Enable checkbox selection |
| `name` | String | `"items[]"` | Form field name for checkboxes |
| `select_all_label` | String | `"Select All"` | Label for select all checkbox |
| `show_select_all` | Boolean | `true` | Show the select all header |
| `toggle_key` | String | `nil` | Keyboard shortcut to toggle checkbox (e.g., `"x"`) |
| `animate` | Boolean | `true` | Enable animations |
| `variant` | String | `"default"` | `"default"` or `"bordered"` |
| `classes` | String | `nil` | Additional wrapper classes |

### Node Hash

| Key | Type | Default | Description |
| --- | ---- | ------- | ----------- |
| `label` | String | required | Display name |
| `type` | Symbol | `:file` | `:file` or `:folder` |
| `value` | String | label | Checkbox value (when selectable) |
| `default_open` | Boolean | `false` | Start folder expanded |
| `disabled` | Boolean | `false` | Disable node interaction |
| `checked` | Boolean | `false` | Start checkbox checked |
| `icon` | String | `nil` | Custom icon HTML |
| `children` | Array | `[]` | Nested nodes (for folders) |
| `classes` | String | `nil` | Additional node classes |

---

## ViewComponent

### Basic Usage

```erb
<%= render(TreeView::Component.new(variant: :bordered)) do |tree| %>
  <% tree.with_node(label: "src", type: :folder, default_open: true) do |folder| %>
    <% folder.with_child(label: "index.ts", type: :file) %>
    <% folder.with_child(label: "utils.ts", type: :file) %>
  <% end %>
  <% tree.with_node(label: "README.md", type: :file) %>
<% end %>
```

### With Checkbox Selection

```erb
<%= render(TreeView::Component.new(
  selectable: true,
  name: "files[]",
  select_all_label: "Select All Files",
  toggle_key: "x",
  variant: :bordered
)) do |tree| %>
  <% tree.with_node(label: "app", type: :folder, default_open: true) do |folder| %>
    <% folder.with_child(label: "layout.tsx", type: :file, value: "app/layout.tsx") %>
    <% folder.with_child(label: "page.tsx", type: :file, value: "app/page.tsx", checked: true) %>
  <% end %>
<% end %>
```

### Component Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `selectable` | Boolean | `false` | Enable checkbox selection |
| `name` | String | `"items[]"` | Form field name for checkboxes |
| `select_all_label` | String | `"Select All"` | Label for select all checkbox |
| `show_select_all` | Boolean | `true` | Show the select all header |
| `toggle_key` | String | `nil` | Keyboard shortcut to toggle checkbox |
| `animate` | Boolean | `true` | Enable animations |
| `variant` | Symbol | `:default` | `:default` or `:bordered` |
| `classes` | String | `nil` | Additional wrapper classes |

### Node Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `label` | String | required | Display name |
| `type` | Symbol | `:file` | `:file` or `:folder` |
| `value` | String | label | Checkbox value |
| `default_open` | Boolean | `false` | Start folder expanded |
| `disabled` | Boolean | `false` | Disable interaction |
| `checked` | Boolean | `false` | Start checkbox checked |
| `icon` | String | `nil` | Custom icon HTML |
| `classes` | String | `nil` | Additional classes |

---

## Selectable Tree View (Parent-Child Selection)

The selectable tree view uses the same patterns as the `checkbox_select_all` component:

1. **Select All** - Master checkbox at the top toggles all nodes
2. **Folder Selection** - Checking a folder checks all its children
3. **Indeterminate State** - Folders show indeterminate when partially selected
4. **Propagation** - Child selections bubble up to update parent state
5. **Shift+Click** - Batch select/deselect a range of items

### How It Works

When `selectable: true`:
- The tree view controller is combined with `checkbox-select-all` controller
- Folder nodes get `data-checkbox-select-all-target="parent"` containers
- File checkboxes get `data-checkbox-select-all-target="checkbox child"`
- Folder checkboxes trigger `toggleChildren` and `toggle` actions
- The `checkbox-select-all` controller handles indeterminate states automatically

---

## Variants

| Variant | Description |
| ------- | ----------- |
| `default` | No border, minimal styling |
| `bordered` | Card-style with border, padding, and rounded corners |

---

## Accessibility

Implements WAI-ARIA Treeview Pattern:

- `aria-expanded` on folder buttons
- `aria-controls` linking folder buttons to content
- `role="region"` on content areas
- `data-state` for CSS styling hooks
- Keyboard navigation with arrow keys
- Shift+click for batch selection in selectable mode

---

## Troubleshooting

**Folder doesn't expand/collapse:** Ensure `data-action="click->tree-view#toggle"` is on the button and `aria-controls` matches the content ID.

**Selection doesn't work:** Verify both `tree-view` and `checkbox-select-all` controllers are on the wrapper when `selectable: true`.

**Parent checkbox doesn't update:** Check that folder containers have `data-checkbox-select-all-target="parent"` and child checkboxes have the `child` target.

**Animations not working:** Ensure content has the grid transition classes and `data-state` attribute is being updated.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/tree_view/`
- **Shared partial files**: `app/views/shared/components/tree_view/`
- **shared partial**: `render "shared/components/tree_view/tree_view"`
- **ViewComponent**: `render TreeView::Component.new(...)`
- **ViewComponent files**: `app/components/tree_view/`

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