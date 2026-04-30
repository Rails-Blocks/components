# Select Component

Styled select/dropdown inputs powered by Tom Select with search, icons, multiple selection, and remote data loading.

## Features

- Single and multiple selection modes
- Searchable/filterable dropdown
- Rich options with icons, descriptions, and badges
- Grouped options support
- Remote data loading via URL
- Clear button for single selects
- Scroll buttons for long lists
- Disabled states (entire select or individual options)
- Full keyboard navigation
- Floating UI positioning

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/select/` | Full control, copy-paste |
| **Shared Partials** | `app/views/shared/components/select/` | Reusable partials, data-driven |
| **ViewComponent** | `app/components/select/` | Ruby options, testing |

---

## Stimulus Controller

The select component uses Tom Select under the hood, configured via data attributes.

### Values

| Value | Type | Default | Description |
| ----- | ---- | ------- | ----------- |
| `url` | String | `null` | URL for remote options loading |
| `valueField` | String | `"value"` | Field to use for option value |
| `labelField` | String | `"label"` | Field to use for option label |
| `submitOnChange` | Boolean | `false` | Submit form when selection changes |
| `dropdownInput` | Boolean | `true` | Show search input in dropdown |
| `dropdownInputPlaceholder` | String | `"Search..."` | Placeholder for search input |
| `clearButton` | Boolean | `true` | Show clear button (single select only) |
| `disableTyping` | Boolean | `false` | Disable keyboard typing in input |
| `allowNew` | Boolean | `false` | Allow creating new options |
| `scrollButtons` | Boolean | `false` | Show scroll up/down buttons |
| `updateField` | Boolean | `false` | Update target field from selected option data |
| `updateFieldTarget` | String | `null` | CSS selector for the field to update |
| `updateFieldSource` | String | `"name"` | Source key copied to the target field |
| `perPage` | Number | `60` | Items per page for remote loading |
| `virtualScroll` | Boolean | `false` | Enable virtual scrolling |
| `optgroupColumns` | Boolean | `false` | Display option groups in columns |
| `responseDataField` | String | `"data"` | Path to array in API response |
| `imageField` | String | `null` | Field containing image URL |
| `subtitleField` | String | `null` | Field for subtitle text |
| `metaFields` | String | `null` | Comma-separated fields for metadata |
| `badgeField` | String | `null` | Field for badge/tag display |
| `renderTemplate` | String | `null` | Custom option render template |
| `showCount` | Boolean | `false` | Show count instead of items (multi-select) |
| `countText` | String | `"selected"` | Text after count |
| `countTextSingular` | String | `""` | Singular text after count |
| `tagsPosition` | String | `"inline"` | Position of tags: "inline", "above", "below", or container ID |
| `enableFlagToggle` | Boolean | `false` | Enable flag toggle controls on selected tags |
| `noMoreResultsText` | String | `"No more results"` | Text when no more results |
| `noSearchResultsText` | String | `"No results found for"` | Text when search has no results |
| `loadingText` | String | `"Loading..."` | Text while loading |
| `createText` | String | `"Add"` | Text for create option |

### Targets

The controller has no required targets - it operates on the native `<select>` element.

### Actions

| Action | Usage | Description |
| ------ | ----- | ----------- |
| `clearInput` | Public method | Clears selection and search |

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
      class: "w-full [&>*:first-child]:!cursor-pointer",
      style: "visibility: hidden;",
      data: {
        controller: "select",
        select_dropdown_input_value: false,
        select_disable_typing_value: true
      } %>
</div>
```

### With Icons and Descriptions

```erb
<%= select_tag :theme, options_for_select([
  [{
    icon: "<svg xmlns='http://www.w3.org/2000/svg' class='size-4' viewBox='0 0 24 24'><circle cx='12' cy='12' r='4'/></svg>",
    name: "Light",
    description: "Light mode uses bright colors"
  }.to_json, "light"],
  [{
    icon: "<svg xmlns='http://www.w3.org/2000/svg' class='size-4' viewBox='0 0 24 24'><path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'/></svg>",
    name: "Dark",
    description: "Dark mode is easier on the eyes"
  }.to_json, "dark"]
]), include_blank: "Select theme...",
  class: "w-full",
  style: "visibility: hidden;",
  data: { controller: "select" } %>
```

### Key Modifications

**Enable search:** Add `data-select-dropdown-input-value="true"` to enable filtering.

**Multiple selection:** Add `multiple: true` to the select_tag.

**Scroll buttons:** Add `data-select-scroll-buttons-value="true"` for scroll indicators.

**Remote loading:** Add `data-select-url-value="/api/endpoint"` for AJAX loading.

---

## Shared Partials

### Basic Usage

```erb
<%= render "shared/components/select/select",
  name: "framework",
  options: [
    ["Ruby on Rails", "rails"],
    ["Laravel", "laravel"],
    ["Django", "django"]
  ],
  placeholder: "Select framework..."
%>
```

### With Label and Description

```erb
<%= render "shared/components/select/select",
  name: "plan",
  label: "Subscription Plan",
  description: "Select the plan that best fits your needs",
  required: true,
  options: [
    ["Free", "free"],
    ["Pro", "pro"],
    ["Enterprise", "enterprise"]
  ]
%>
```

### Searchable with Multiple Selection

```erb
<%= render "shared/components/select/select",
  name: "tags[]",
  label: "Tags",
  multiple: true,
  dropdown_input: true,
  options: [
    ["Frontend", "frontend"],
    ["Backend", "backend"],
    ["DevOps", "devops"]
  ]
%>
```

### Rich Options with Icons

```erb
<%= render "shared/components/select/select",
  name: "theme",
  label: "Theme",
  options: [
    {
      label: "Light",
      value: "light",
      icon: "<svg>...</svg>",
      description: "Light mode uses bright colors"
    },
    {
      label: "Dark",
      value: "dark",
      icon: "<svg>...</svg>",
      description: "Dark mode is easier on the eyes"
    }
  ]
%>
```

### Grouped Options

```erb
<%= render "shared/components/select/select",
  name: "car_brand",
  label: "Car Brand",
  grouped: true,
  options: {
    "European" => [["BMW", "bmw"], ["Mercedes", "mercedes"]],
    "Japanese" => [["Toyota", "toyota"], ["Honda", "honda"]],
    "American" => [["Ford", "ford"], ["Tesla", "tesla"]]
  }
%>
```

### Remote Loading (GitHub via backend proxy)

```erb
<%= render "shared/components/select/select",
  name: "github_user",
  label: "GitHub User",
  placeholder: "Search GitHub users...",
  url: "/api/github-users",
  disable_typing: false,
  value_field: "login",
  label_field: "name"
%>
```

### Remote Loading (Rick and Morty direct API)

```erb
<%= render "shared/components/select/select",
  name: "rick_and_morty_character",
  label: "Rick and Morty Character",
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
<%= render "shared/components/select/select",
  name: "custom_data",
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
| `name` | String | `nil` | Input name attribute |
| `id` | String | auto-generated | Input id attribute |
| `options` | Array/Hash | `[]` | Select options (see below) |
| `selected` | String/Array | `nil` | Pre-selected value(s) |
| `placeholder` | String | `"Select an option..."` | Placeholder text |
| `multiple` | Boolean | `false` | Allow multiple selections |
| `dropdown_input` | Boolean | `false` | Enable search/filtering UI (preferred option) |
| `searchable` | Boolean | `nil` | Alias for `dropdown_input` (if both are set, `searchable` wins) |
| `clearable` | Boolean | `true` | Show clear button |
| `clear_button` | Boolean | `nil` | Alias for `clearable` |
| `disabled` | Boolean | `false` | Disable the select |
| `required` | Boolean | `false` | Mark as required (shows `*` when `label` is present) |
| `grouped` | Boolean | `false` | Use grouped options |
| `label` | String | `nil` | Label text |
| `description` | String | `nil` | Description text |
| `error` | String | `nil` | Error message |
| `size` | String | `"md"` | Size: `"sm"`, `"md"`, `"lg"` |
| `allow_new` | Boolean | `false` | Allow creating new options |
| `allow_create` | Boolean | `nil` | Alias for `allow_new` |
| `scroll_buttons` | Boolean | `false` | Show scroll buttons |
| `disable_typing` | Boolean | `true` | Disable keyboard input |
| `submit_on_change` | Boolean | `false` | Submit form when selection changes |
| `update_field` | Boolean | `false` | Update target field from selected option data |
| `update_field_target` | String | `nil` | CSS selector for the field to update |
| `update_field_source` | String | `"name"` | Source key copied to the target field |
| `url` | String | `nil` | URL for remote loading |
| `value_field` | String | `"value"` | Value field for remote data |
| `label_field` | String | `"label"` | Label field for remote data |
| `search_param` | String | `"query"` | Search query parameter |
| `per_page` | Integer | `60` | Items per page for remote loading |
| `virtual_scroll` | Boolean | `false` | Enable virtual scroll plugin |
| `optgroup_columns` | Boolean | `false` | Enable optgroup columns plugin |
| `response_data_field` | String | `"data"` | Path to response array in API result |
| `dropdown_input_placeholder` | String | `"Search..."` | Dropdown search input placeholder |
| `show_count` | Boolean | `false` | Show count instead of tags (multi-select) |
| `count_text` | String | `"selected"` | Count suffix text |
| `count_text_singular` | String | `nil` | Singular count suffix text |
| `tags_position` | String | `"inline"` | Tag position: `inline`, `above`, `below`, or container id |
| `enable_flag_toggle` | Boolean | `false` | Enable flag toggle controls on selected tags |
| `image_field` | String | `nil` | API image field |
| `subtitle_field` | String | `nil` | API subtitle field |
| `meta_fields` | String | `nil` | Comma-separated metadata fields |
| `badge_field` | String | `nil` | API badge field |
| `render_template` | String | `nil` | Custom option render template |
| `no_more_results_text` | String | `"No more results"` | No-more-results message |
| `no_results_text` | String | `"No results found for"` | No results message |
| `loading_text` | String | `"Loading..."` | Loading message |
| `create_text` | String | `"Add"` | Create option text |
| `classes` | String | `nil` | Additional wrapper classes |
| `input_classes` | String | `nil` | Additional select classes |
| `data` | Hash | `{}` | Additional data attributes |

### Option Formats

**Simple array:**
```ruby
[["Label", "value"], ["Label 2", "value2"]]
```

**Rich options:**
```ruby
[
  { label: "Light", value: "light", icon: "<svg>...</svg>", description: "..." },
  { label: "Dark", value: "dark", icon: "<svg>...</svg>", side: "<span>Badge</span>" }
]
```

**Grouped options (set `grouped: true`):**
```ruby
{
  "Group 1" => [["Option A", "a"], ["Option B", "b"]],
  "Group 2" => [["Option C", "c"], ["Option D", "d"]]
}
```

---

## ViewComponent

### Basic Usage

```erb
<%= render Select::Component.new(
  name: "framework",
  options: [
    ["Ruby on Rails", "rails"],
    ["Laravel", "laravel"],
    ["Django", "django"]
  ],
  placeholder: "Select framework..."
) %>
```

### With Label and Validation

```erb
<%= render Select::Component.new(
  name: "country",
  label: "Country",
  required: true,
  error: current_user.errors[:country]&.first,
  options: [
    ["United States", "us"],
    ["Canada", "ca"],
    ["United Kingdom", "uk"]
  ]
) %>
```

### Searchable Multiple Select

```erb
<%= render Select::Component.new(
  name: "skills[]",
  label: "Skills",
  multiple: true,
  dropdown_input: true,
  options: [
    ["Ruby", "ruby"],
    ["JavaScript", "javascript"],
    ["Python", "python"],
    ["Go", "go"]
  ]
) %>
```

### Remote Loading (GitHub via backend proxy)

```erb
<%= render Select::Component.new(
  name: "github_user",
  label: "GitHub User",
  placeholder: "Search GitHub users...",
  url: "/api/github-users",
  disable_typing: false,
  value_field: "login",
  label_field: "name"
) %>
```

### Remote Loading (Rick and Morty direct API)

```erb
<%= render Select::Component.new(
  name: "rick_and_morty_character",
  label: "Rick and Morty Character",
  placeholder: "Search Rick and Morty characters...",
  url: "https://rickandmortyapi.com/api/character",
  value_field: "id",
  label_field: "name",
  search_param: "name",
  image_field: "image",
  subtitle_field: "status",
  badge_field: "species"
) %>
```

### Custom Data Attributes

```erb
<%= render Select::Component.new(
  name: "custom_data",
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

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `name` | String | `nil` | Input name attribute |
| `id` | String | auto-generated | Input id attribute |
| `options` | Array/Hash | `[]` | Select options |
| `selected` | String/Array | `nil` | Pre-selected value(s) |
| `placeholder` | String | `"Select an option..."` | Placeholder text |
| `multiple` | Boolean | `false` | Allow multiple selections |
| `dropdown_input` | Boolean | `false` | Enable search/filtering UI (preferred option) |
| `searchable` | Boolean | `nil` | Alias for `dropdown_input` (if both are set, `searchable` wins) |
| `clearable` | Boolean | `true` | Show clear button |
| `clear_button` | Boolean | `nil` | Alias for `clearable` |
| `disabled` | Boolean | `false` | Disable the select |
| `required` | Boolean | `false` | Mark as required (shows `*` when `label` is present) |
| `grouped` | Boolean | `false` | Use grouped options |
| `label` | String | `nil` | Label text |
| `description` | String | `nil` | Description text |
| `error` | String | `nil` | Error message |
| `size` | Symbol | `:md` | Size: `:sm`, `:md`, `:lg` |
| `allow_new` | Boolean | `false` | Allow creating new options |
| `allow_create` | Boolean | `nil` | Alias for `allow_new` |
| `scroll_buttons` | Boolean | `false` | Show scroll buttons |
| `disable_typing` | Boolean | `true` | Disable keyboard input |
| `submit_on_change` | Boolean | `false` | Submit form when selection changes |
| `update_field` | Boolean | `false` | Update target field from selected option data |
| `update_field_target` | String | `nil` | CSS selector for update target field |
| `update_field_source` | String | `"name"` | Source key copied to target field |
| `url` | String | `nil` | URL for remote loading |
| `value_field` | String | `"value"` | Value field for remote data |
| `label_field` | String | `"label"` | Label field for remote data |
| `search_param` | String | `"query"` | Search query parameter |
| `per_page` | Integer | `60` | Items per page for remote loading |
| `virtual_scroll` | Boolean | `false` | Enable virtual scroll plugin |
| `optgroup_columns` | Boolean | `false` | Enable optgroup columns plugin |
| `response_data_field` | String | `"data"` | Path to response array in API result |
| `dropdown_input_placeholder` | String | `"Search..."` | Dropdown search input placeholder |
| `show_count` | Boolean | `false` | Show count instead of tags (multi-select) |
| `count_text` | String | `"selected"` | Count suffix text |
| `count_text_singular` | String | `nil` | Singular count suffix text |
| `tags_position` | String | `"inline"` | Tag position: `inline`, `above`, `below`, or container id |
| `enable_flag_toggle` | Boolean | `false` | Enable flag toggle controls on selected tags |
| `image_field` | String | `nil` | API image field |
| `subtitle_field` | String | `nil` | API subtitle field |
| `meta_fields` | String | `nil` | Comma-separated metadata fields |
| `badge_field` | String | `nil` | API badge field |
| `render_template` | String | `nil` | Custom option render template |
| `no_more_results_text` | String | `"No more results"` | No-more-results message |
| `no_results_text` | String | `"No results found for"` | No results message |
| `loading_text` | String | `"Loading..."` | Loading message |
| `create_text` | String | `"Add"` | Create option text |
| `classes` | String | `nil` | Additional wrapper classes |
| `input_classes` | String | `nil` | Additional select classes |
| `data` | Hash | `{}` | Additional data attributes |

---

## Accessibility

- Uses native `<select>` element enhanced by Tom Select
- Full keyboard navigation (↑↓ arrows, Enter, Escape)
- Screen reader compatible
- Proper focus management
- ARIA attributes managed by Tom Select

---

## Troubleshooting

**Select doesn't initialize:** Ensure `visibility: hidden` style is set and Tom Select JS is loaded.

**Search not working:** Use one of these patterns:
- `dropdown_input: true` for dropdown search input UI.
- `dropdown_input: false` with `disable_typing: false` for typing directly in the main control input.

**Options not showing icons:** Ensure option data is JSON-encoded with `icon`, `name`, and optional `description` keys.

**Remote loading fails:** Check URL returns JSON with `data` array containing objects with `value` and `label` fields.

**Multiple select issues:** Ensure name ends with `[]` for proper array submission (e.g., `name: "tags[]"`).

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt the example directly inside a page.
- **shared partial**: Use when you want a reusable partial with locals and a consistent render call across views.
- **ViewComponent**: Use when you want a Ruby API, slots, stronger encapsulation, or repeated composition in multiple places.

### Quick Reference

- **Vanilla examples**: `app/views/components/select/`
- **Shared partial files**: `app/views/shared/components/select/`
- **shared partial**: `render "shared/components/select/select"`
- **ViewComponent**: `render Select::Component.new(...)`
- **ViewComponent files**: `app/components/select/`

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