# 0003: UI theme tokens

## Context

The UI package needs shared design tokens for both current and future dashboard UI, including a way to preview light and dark palettes in Storybook.

## Decision

Define semantic CSS custom properties in `packages/ui/src/styles.css` and expose them through Tailwind CSS v4's `@theme inline` utilities. Use slate neutrals with an emerald primary accent. Light mode is the default; `[data-mode="dark"]` on the document root selects the dark tokens. Configure Tailwind's `dark:` variant to use the same attribute.

Storybook provides a global Theme toolbar that sets `data-mode` for previewing either palette. This is a development preview control only; an application-level theme provider and user-facing toggle are deferred until an app needs them.

## Alternatives

- Use Tailwind's default `dark` class selector: rejected so token selection and `dark:` utilities share one explicit theme attribute.
- Follow only the operating system preference: rejected for the initial foundation because it would not allow Storybook to preview both modes independently.
- Build a persistent theme provider and toggle now: deferred until there is an application UI to integrate and validate.

## Consequences

- Components can use stable semantic utilities instead of hard-coding palette shades.
- Both token modes can be reviewed in Storybook without app state or persistence.
- The consuming Next.js apps still need to import the shared stylesheet and choose/set a theme attribute; that integration is not yet verified.
