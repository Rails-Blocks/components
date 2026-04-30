# Combobox Component

A searchable select/dropdown component powered by Tom Select, with support for single and multi-select, async data loading, option creation, grouped options, and extensive customization.

## Features

- Single and multi-select modes
- Type-ahead search filtering
- Async data loading from API endpoints
- Create new options on-the-fly
- Grouped options support
- Rich option rendering (images, subtitles, badges)
- Count display for multi-select
- Flexible tag positioning (inline, above, below, custom container)
- Flag toggle on selected items
- Keyboard navigation and accessibility
- Clear button support

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/combobox/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/combobox/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/combobox/` | Type-safe options, testing |

---

## Stimulus Controller

The combobox uses the `select` Stimulus controller which wraps [Tom Select](https://tom-select.js.org/).

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `url` | String | - | URL for async data fetching |
| `valueField` | String | `"value"` | Field name for option value in API response |
| `labelField` | String | `"label"` | Field name for option label in API response |
| `submitOnChange` | Boolean | `false` | Submit form when selection changes |
| `dropdownInput` | Boolean | `true` | Enable search input in dropdown |
| `dropdownInputPlaceholder` | String | `"Search..."` | Placeholder for dropdown search input |
| `clearButton` | Boolean | `true` | Show clear button (single select only) |
| `disableTyping` | Boolean | `false` | Disable typing in the control input |
| `allowNew` | Boolean | `false` | Allow creating new options |
| `scrollButtons` | Boolean | `false` | Show scroll buttons in dropdown |
| `updateField` | Boolean | `false` | Update target field from selected option data |
| `updateFieldTarget` | String | - | CSS selector for update target field |
| `updateFieldSource` | String | `"name"` | Source key copied to target field |
| `perPage` | Number | `60` | Items per page for async loading |
| `virtualScroll` | Boolean | `false` | Use virtual scrolling for large lists |
| `optgroupColumns` | Boolean | `false` | Display option groups in columns |
| `responseDataField` | String | `"data"` | Field containing array in API response |
| `searchParam` | String | `"query"` | Query parameter name for search |
| `imageField` | String | - | Field containing image URL |
| `subtitleField` | String | - | Field for subtitle display |
| `metaFields` | String | - | Comma-separated fields for metadata |
| `badgeField` | String | - | Field for badge/tag display |
| `renderTemplate` | String | - | Custom template for option rendering |
| `showCount` | Boolean | `false` | Show count instead of tags (multi-select) |
| `countText` | String | `"selected"` | Text after count number |
| `countTextSingular` | String | - | Singular form of count text |
| `tagsPosition` | String | `"inline"` | Position: `"inline"`, `"above"`, `"below"`, or container ID |
| `enableFlagToggle` | Boolean | `false` | Enable flag toggle buttons on tags |
| `noMoreResultsText` | String | `"No more results"` | Text when no more results to load |
| `noSearchResultsText` | String | `"No results found for"` | Text when search has no matches |
| `loadingText` | String | `"Loading..."` | Text shown during loading |
| `createText` | String | `"Add"` | Text for create option prompt |

### Example Data Attributes

```erb
<select data-controller="select"
        data-select-url-value="/api/github-users"
        data-select-value-field-value="login"
        data-select-label-field-value="name"
        data-select-per-page-value="20">
  <option value="">Search GitHub users...</option>
</select>
```

---

## Plain ERB

Copy the code block into your view and customize as needed.

### Basic Example

```erb
<div class="w-full max-w-xs">
  <%= select_tag :framework,
      options_for_select([
        ["Ruby on Rails", "rails"],
        ["Laravel", "laravel"],
        ["Django", "django"],
        ["Express.js", "express"]
      ]),
      include_blank: "Select framework...",
      class: "w-full",
      style: "visibility: hidden;",
      data: { controller: "select" } %>
</div>
```

### Multi-select Example

```erb
<%= select_tag :languages,
    options_for_select([
      ["Ruby", "ruby"],
      ["JavaScript", "javascript"],
      ["Python", "python"]
    ]),
    multiple: true,
    include_blank: "Select languages...",
    class: "w-full",
    style: "visibility: hidden;",
    data: { controller: "select" } %>
```

### Key Modifications

**Disable search:** Add `data-select-dropdown-input-value="false"` to show dropdown without search.

**Allow creating options:** Add `data-select-allow-new-value="true"` to let users create new options.

**Async loading:** Add `data-select-url-value="/api/endpoint"` with appropriate field mappings.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/combobox/combobox",
  name: "framework",
  placeholder: "Select framework...",
  options: [
    ["Ruby on Rails", "rails"],
    ["Laravel", "laravel"],
    ["Django", "django"]
  ]
%>
```

### With Label, Description, and Required Indicator

```erb
<%= render "shared/components/combobox/combobox",
  name: "deployment_region",
  label: "Deployment Region",
  description: "Choose where your app will be deployed",
  required: true,
  placeholder: "Select region...",
  options: [
    ["US East", "us-east"],
    ["US West", "us-west"],
    ["EU Central", "eu-central"]
  ]
%>
```

### With Options

```erb
<%= render "shared/components/combobox/combobox",
  name: "skills[]",
  placeholder: "Select skills...",
  multiple: true,
  allow_create: true,
  tags_position: "below",
  options: [
    ["Ruby", "ruby"],
    ["JavaScript", "javascript"],
    ["Python", "python"]
  ],
  selected: ["ruby", "javascript"]
%>
```

### Async Data Loading (GitHub via backend proxy)

```erb
<%= render "shared/components/combobox/combobox",
  name: "github_user",
  placeholder: "Search GitHub users...",
  url: "/api/github-users",
  value_field: "login",
  label_field: "name",
  dropdown_input: false
%>
```

### Async Data Loading (Rick and Morty direct API)

```erb
<%= render "shared/components/combobox/combobox",
  name: "rick_and_morty_character",
  placeholder: "Search Rick and Morty characters...",
  url: "https://rickandmortyapi.com/api/character",
  value_field: "id",
  label_field: "name",
  search_param: "name",
  image_field: "image",
  subtitle_field: "status",
  badge_field: "species"
%>
```

### Custom Data Attributes

```erb
<%= render "shared/components/combobox/combobox",
  name: "combobox_custom_data",
  label: "Custom Data Attributes",
  options: [
    ["Option 1", "1"],
    ["Option 2", "2"]
  ],
  data: {
    select_submit_on_change_value: true
  }
%>
```

### Options

| Local | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `options` | Array | `[]` | Array of `[label, value]` pairs |
| `selected` | String/Array | `nil` | Pre-selected value(s) |
| `name` | String | `nil` | Name attribute |
| `id` | String | auto | ID attribute |
| `label` | String | `nil` | Label text rendered above the combobox |
| `description` | String | `nil` | Helper text shown with the combobox |
| `placeholder` | String | `"Select..."` | Placeholder text |
| `multiple` | Boolean | `false` | Allow multiple selections |
| `searchable` | Boolean | `true` | Enable search filtering |
| `dropdown_input` | Boolean | `nil` | Alias for `searchable` (if both are set, `dropdown_input` wins) |
| `clearable` | Boolean | `true` | Show clear button |
| `clear_button` | Boolean | `nil` | Alias for `clearable` |
| `disabled` | Boolean | `false` | Disable the combobox |
| `required` | Boolean | `false` | Mark as required (shows `*` when `label` is present) |
| `allow_create` | Boolean | `false` | Allow creating new options |
| `allow_new` | Boolean | `nil` | Alias for `allow_create` |
| `grouped_options` | Hash | `nil` | Grouped options hash |
| `url` | String | `nil` | URL for async data |
| `value_field` | String | `"value"` | API value field |
| `label_field` | String | `"label"` | API label field |
| `search_param` | String | `"query"` | Search query parameter |
| `per_page` | Integer | `60` | Items per page |
| `virtual_scroll` | Boolean | `false` | Enable virtual scrolling |
| `response_data_field` | String | `"data"` | Path to response array |
| `optgroup_columns` | Boolean | `false` | Enable optgroup columns |
| `submit_on_change` | Boolean | `false` | Submit form on change |
| `update_field` | Boolean | `false` | Update another form field from selected option |
| `update_field_target` | String | `nil` | CSS selector for update target field |
| `update_field_source` | String | `"name"` | Selected option key copied to target |
| `disable_typing` | Boolean | `false` | Disable typing in main control input |
| `scroll_buttons` | Boolean | `false` | Show dropdown scroll buttons |
| `show_count` | Boolean | `false` | Show count (multi-select) |
| `count_text` | String | `"selected"` | Count suffix text |
| `count_text_singular` | String | `nil` | Singular count text |
| `tags_position` | String | `"inline"` | Tag position |
| `enable_flag_toggle` | Boolean | `false` | Enable flag toggle |
| `image_field` | String | `nil` | API image field |
| `subtitle_field` | String | `nil` | API subtitle field |
| `meta_fields` | String | `nil` | Comma-separated metadata fields |
| `badge_field` | String | `nil` | API badge field |
| `render_template` | String | `nil` | Custom option render template |
| `no_more_results_text` | String | `"No more results"` | No-more-results message |
| `no_results_text` | String | `"No results found for"` | No results message |
| `loading_text` | String | `"Loading..."` | Loading message |
| `create_text` | String | `"Add"` | Create option text |
| `dropdown_placeholder` | String | `"Search..."` | Dropdown search placeholder |
| `dropdown_input_placeholder` | String | `nil` | Alias for `dropdown_placeholder` |
| `classes` | String | `nil` | Additional wrapper classes |
| `data` | Hash | `{}` | Additional data attributes merged into `data-*` |

---

## ViewComponent

### Basic Usage

```erb
<%= render Combobox::Component.new(
  name: "framework",
  placeholder: "Select framework...",
  options: [
    ["Ruby on Rails", "rails"],
    ["Laravel", "laravel"],
    ["Django", "django"]
  ]
) %>
```

### With Options

```erb
<%= render Combobox::Component.new(
  name: "skills[]",
  placeholder: "Select skills...",
  multiple: true,
  allow_create: true,
  tags_position: "below",
  options: [
    ["Ruby", "ruby"],
    ["JavaScript", "javascript"],
    ["Python", "python"]
  ],
  selected: ["ruby", "javascript"]
) %>
```

### With Custom Data Attributes

```erb
<%= render Combobox::Component.new(
  name: "combobox_custom_data",
  label: "Custom Data Attributes",
  options: [
    ["Option 1", "1"],
    ["Option 2", "2"]
  ],
  data: {
    select_submit_on_change_value: true
  }
) %>
```

### Component Options

All options from the Shared Partials section are available as keyword arguments.

---

## Common Patterns

### Rich Option Rendering with JSON

```erb
<%= select_tag :framework,
    options_for_select([
      [{
        icon: "<img class='size-5' src='/rails-logo.png'>",
        name: "Rails",
        side: "<span class='text-xs text-red-600'>Ruby</span>",
        description: "Full-stack web framework"
      }.to_json, "rails"]
    ]),
    include_blank: "Select framework...",
    data: { controller: "select" } %>
```

### Disabled Options

```erb
<%= options_for_select([
  ["Available", "available"],
  ["Unavailable", "unavailable", { disabled: true }],
  ["Coming Soon", "coming", { disabled: true }]
]) %>
```

### Flagged Options

```erb
<%= options_for_select([
  ["Normal", "normal"],
  ["Deprecated", "deprecated", { data: { flag: true } }]
]) %>
```

---

## Accessibility

The combobox implements accessibility best practices:

- Full keyboard navigation (↑↓ arrows, Enter, Escape)
- ARIA attributes for screen readers
- Focus management
- Clear visual feedback for active/selected states

---

## Troubleshooting

**Options don't show:** Ensure `style: "visibility: hidden;"` is set on the select element.

**Search not working:** Check that `data-select-dropdown-input-value` is not `false`.

**Async not loading:** Verify API returns expected format with `data` array or configure `responseDataField`.

**Clear button not showing:** Clear button only appears for single-select when `clearButton` is `true` and a value is selected.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/combobox/`
- **Shared partial files**: `app/views/shared/components/combobox/`
- **shared partial**: `render "shared/components/combobox/combobox"`
- **ViewComponent**: `render Combobox::Component.new(...)`
- **ViewComponent files**: `app/components/combobox/`

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