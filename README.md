# Rails Blocks Components

Free, open-source Rails UI components generated from [Rails Blocks](https://railsblocks.com).

This repository is the public artifact registry for the free Rails Blocks components. It is designed for humans to inspect and for the Rails Blocks CLI/MCP server to consume without sending free component traffic to the Rails Blocks app.

## What's Included

- `registry.json` - machine-readable component registry.
- `components/` - free component docs, usage examples, and package manifests.
- `stimulus_controllers/` - free Stimulus controllers used by the components.
- `packages/0.1.1/` - immutable zip packages and SHA256 checksums.

## Usage

Install components with the Rails Blocks CLI:

```bash
rails-blocks list --free
rails-blocks install accordion --as erb_template
rails-blocks update stimulus --all --free
```

The CLI reads `registry.json` and downloads package artifacts from this repository.

## License

The free Rails Blocks components in this repository are published under the MIT License. Preserve the included license notice when redistributing substantial portions of the components.
