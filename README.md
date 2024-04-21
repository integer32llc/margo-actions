# Margo GitHub Actions

Publishes a crate to a [Margo][] registry inside GitHub Actions.

[Margo]: https://github.com/integer32llc/margo

## Quickstart with GitHub Pages

See [the demo][demo] for a working example of the action.

[demo]: https://github.com/integer32llc/margo-actions-demo

### Create a GitHub Pages branch

```bash
git checkout --orphan gh-pages
# Remove any existing files — this is destructive!
git reset
git clean -xfd
```

### Initialize the Margo registry

```bash
# No need for Jekyll as we build all the files ourselves
touch .nojekyll
# Initialization
margo init . --base-url https://my-organization-name.github.io/my-repository-name/
# Commit and push the empty registry
git add .
git commit -m "Initialize Margo registry"
git push origin gh-pages
```

### Add the action in your GitHub Actions configuration

```yaml
jobs:
  build:
    steps:
      # Previous steps need to have built the crate via `cargo
      # package` and checked out the GitHub Pages branch.

     - name: Publish crate
        uses: integer32llc/margo-actions@main
        with:
          crates: /path/to/some.crate
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      # Subsequent steps need to commit the registry changes and push
      # them to the GitHub Pages branch.
```

## Inputs

| Input    | Default | Description                                 |
| -------- | ------- | ------------------------------------------- |
| `crates` | N/A     | A glob expression for the crates to publish |
