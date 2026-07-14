# Avatar Component

Display people, accounts, or fallback initials with consistent sizing, optional online presence, overlapping groups, and a subtle light/dark outline.

## Features

- Five sizes from extra small through extra large
- Unsplash-compatible image URLs or initials fallback
- Optional accessible online status with a CSS-only pulse
- Static and animated avatar groups
- Size-aware group overlap and remaining-count indicator
- Light and dark mode inset outlines
- Reduced-motion support
- No JavaScript or Stimulus controller required
- Shared Partial and ViewComponent implementations

## Implementation Options

| Format | Location | Best For |
| ------ | -------- | -------- |
| **Plain ERB** | `app/views/components/avatar/` | Copy-paste examples and complete markup control |
| **Shared Partial** | `app/views/shared/components/avatar/` | Reusable rendering from locals and arrays |
| **ViewComponent** | `app/components/avatar/` | Ruby APIs, slots, encapsulation, and testing |

## Shared Partial

### Individual Avatar

```erb
<%= render "shared/components/avatar/avatar",
  src: user.avatar_url,
  alt: user.name,
  size: "md" %>
```

### Online Status

```erb
<%= render "shared/components/avatar/avatar",
  src: user.avatar_url,
  alt: user.name,
  size: "lg",
  status: "online",
  status_label: "Online" %>
```

### Initials Fallback

When `src` is blank, initials are derived from `alt`. Pass `fallback` to provide explicit text.

```erb
<%= render "shared/components/avatar/avatar",
  alt: "Avery Stone",
  fallback: "AS",
  size: "md" %>
```

### Avatar Group

```erb
<%= render "shared/components/avatar/avatar_group",
  avatars: [
    { src: olivia.avatar_url, alt: "Olivia Martin" },
    { src: noah.avatar_url, alt: "Noah Williams", status: "online" },
    { src: emma.avatar_url, alt: "Emma Davis" }
  ],
  size: "md",
  remaining_count: 3,
  label: "Project members" %>
```

Set `animated: true` to use the compact group that expands to the recommended overlap when the group is hovered.

```erb
<%= render "shared/components/avatar/avatar_group",
  avatars: team_members.map { |member| { src: member.avatar_url, alt: member.name } },
  size: "md",
  remaining_count: 3,
  label: "Project members",
  animated: true %>
```

## ViewComponent

### Individual Avatar

```erb
<%= render Avatar::Component.new(
  src: user.avatar_url,
  alt: user.name,
  size: :md
) %>
```

### Online Status

```erb
<%= render Avatar::Component.new(
  src: user.avatar_url,
  alt: user.name,
  size: :lg,
  status: :online,
  status_label: "Online"
) %>
```

### Initials Fallback

```erb
<%= render Avatar::Component.new(
  alt: "Avery Stone",
  fallback: "AS",
  size: :md
) %>
```

### Avatar Group

Use `with_avatar` to add individual avatars. The group applies its `size` to every item.

```erb
<%= render Avatar::GroupComponent.new(
  size: :md,
  remaining_count: 3,
  label: "Project members"
) do |group| %>
  <% group.with_avatar(src: olivia.avatar_url, alt: "Olivia Martin") %>
  <% group.with_avatar(src: noah.avatar_url, alt: "Noah Williams", status: :online) %>
  <% group.with_avatar(src: emma.avatar_url, alt: "Emma Davis") %>
<% end %>
```

### Animated Avatar Group

```erb
<%= render Avatar::GroupComponent.new(
  size: :md,
  remaining_count: 3,
  label: "Project members",
  animated: true
) do |group| %>
  <% group.with_avatar(src: olivia.avatar_url, alt: "Olivia Martin") %>
  <% group.with_avatar(src: noah.avatar_url, alt: "Noah Williams") %>
  <% group.with_avatar(src: emma.avatar_url, alt: "Emma Davis") %>
<% end %>
```

The animation uses transforms, lasts 200ms, and is disabled when the user requests reduced motion. Hovering changes only the visual spacing; it does not reveal hidden content or functionality.

## Avatar Options

The Shared Partial uses string values for `size` and `status`; the ViewComponent uses symbols.

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `alt` | String | required | Accessible image description. Use `""` only when the avatar is decorative and nearby text already identifies the person. |
| `src` | String or nil | `nil` | Image URL. When blank, the initials fallback is rendered. |
| `fallback` | String or nil | derived from `alt` | Explicit fallback text. |
| `size` | String/Symbol | `md` | `xs`, `sm`, `md`, `lg`, or `xl`. |
| `status` | String/Symbol or nil | `nil` | Set to `online` to show the green status indicator. |
| `status_label` | String | `"Online"` | Screen-reader text for the status indicator. |
| `pulse` | Boolean | `true` | Enables the CSS ping animation when status is online. |
| `classes` | String or nil | `nil` | Additional classes for the avatar wrapper. |
| `html_options` | Hash | `{}` | Additional wrapper attributes such as `id`, `data`, `aria`, or `title`. |
| `image_options` | Hash | `{}` | Additional attributes for the image element. |

## Avatar Group Options

| Option | Type | Default | Description |
| ------ | ---- | ------- | ----------- |
| `avatars` | Array of Hashes | required for Shared Partial | Avatar options passed to the individual avatar partial. Every entry requires `alt`. |
| `size` | String/Symbol | `md` | Size applied to every avatar and the count indicator. |
| `remaining_count` | Integer or nil | `nil` | Displays `+N` after visible avatars when greater than zero. |
| `label` | String | `"Avatar group"` | Accessible label for the group. |
| `animated` | Boolean | `false` | Uses compact overlap at rest and expands to normal overlap on hover. |
| `classes` | String or nil | `nil` | Additional classes for the group wrapper. |
| `html_options` | Hash | `{}` | Additional wrapper attributes such as `id`, `data`, `aria`, or `title`. |

ViewComponent group items use the `with_avatar` setter and accept all individual avatar options except `size`, which is controlled by the group.

## Size and Group Overlap Reference

| Variant | Dimensions | Normal Group Overlap | Animated Resting Overlap |
| ------- | ---------- | -------------------- | ------------------------ |
| `xs` | 24px (`size-6`) | `-space-x-2` | `-space-x-4` |
| `sm` | 32px (`size-8`) | `-space-x-3` | `-space-x-5` |
| `md` | 40px (`size-10`) | `-space-x-4` | `-space-x-6` |
| `lg` | 48px (`size-12`) | `-space-x-5` | `-space-x-7` |
| `xl` | 64px (`size-16`) | `-space-x-6` | `-space-x-8` |

Animated groups expand from the resting overlap to the normal overlap for their size.

## Accessibility

- Give portraits a useful `alt` value containing the person's name or another concise description.
- Use `alt: ""` only when adjacent visible text already identifies the same person and the image is redundant.
- Give each group a meaningful `label`, such as `"Project members"` or `"Reviewers"`.
- The remaining-count indicator exposes text such as `"3 more"` to assistive technology.
- Online status includes `status_label`, so it is not communicated by color alone.
- The ping animation is decorative, is hidden from assistive technology, and stops under reduced-motion preferences.
- Do not use the avatar pulse as an `aria-live` region. Update a separate text status if changes must be announced.

## Customization

Use `classes` for layout-level additions and `html_options` or `image_options` for standard attributes:

```erb
<%= render Avatar::Component.new(
  src: user.avatar_url,
  alt: user.name,
  classes: "shadow-sm",
  html_options: { data: { user_id: user.id }, title: user.name },
  image_options: { loading: "lazy" }
) %>
```

Keep the avatar wrapper `relative` and circular. The `::after` element provides the inset light/dark outline, and isolation keeps each outline inside its avatar when groups overlap.

---

## AI Instructions

### Choose An Implementation

- **Vanilla / plain ERB**: Use when you want full markup control or need to adapt one example directly inside a page.
- **ERB template partial**: Use when you want reusable avatars driven by locals, arrays, or model data.
- **ViewComponent**: Use when you want a Ruby API, slots for grouped avatars, stronger encapsulation, or isolated component tests.

### Quick Reference

- **Vanilla examples**: `app/views/components/avatar/`
- **ERB partial files**: `app/views/shared/components/avatar/`
- **Individual ERB template**: `render "shared/components/avatar/avatar"`
- **Group ERB template**: `render "shared/components/avatar/avatar_group"`
- **Individual ViewComponent**: `render Avatar::Component.new(...)`
- **Group ViewComponent**: `render Avatar::GroupComponent.new(...)`
- **ViewComponent files**: `app/components/avatar/`
- **JavaScript requirement**: none

### Implementation Checklist

- Pick one implementation path first and use its documented value types consistently.
- Always provide `alt` for each avatar, including every group item.
- Use only `xs`, `sm`, `md`, `lg`, or `xl` for size.
- Use `online` as the only status value unless you deliberately add and document another visual treatment.
- Put `size` on the group instead of individual grouped avatars.
- Use `remaining_count` for the visible `+N` item.
- Preserve the `::after` inset outline and isolation classes when adapting the markup.
- Preserve the status text, decorative `aria-hidden` attributes, and reduced-motion classes.
- Keep animation decorative; never make hover the only way to access information.

### Common Patterns

- **Profile image**: Provide `src`, `alt`, and one documented size.
- **Fallback initials**: Omit `src`; optionally provide `fallback`.
- **Presence**: Set `status` to `online` and provide a truthful `status_label`.
- **Static team list**: Use the group with `remaining_count` and a meaningful `label`.
- **Animated team list**: Add `animated: true`; the component handles size-aware compact and normal spacing.

### Common Mistakes

- Do not mix Shared Partial locals with ViewComponent initializer arguments in the same render call.
- Do not omit `alt`, even when a fallback is expected.
- Do not set per-avatar sizes inside a group.
- Do not invent status colors or meanings without adding accessible labels and documentation.
- Do not remove `isolate`; overlapping pseudo-elements can otherwise paint across neighboring avatars.
- Do not replace the documented `after:` shadow with a border or opaque ring.
- Do not add a Stimulus controller; this component is CSS-only.
