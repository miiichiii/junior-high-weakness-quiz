---
name: mobile-web-animation
description: Add, audit, or refactor lightweight 2D website animations for quizzes, educational apps, and mobile web apps. Use when Codex needs CSS keyframes, scroll fade-up, parallax backgrounds, hover/tap effects, word-by-word text animation, animation performance budgets, prefers-reduced-motion support, or old-smartphone-safe motion in HTML/CSS/JS/React/Next/Vite apps.
---

# Mobile Web Animation

## Goal

Add useful UI motion without making student-facing sites feel heavy on older phones. Prefer small CSS and a tiny amount of vanilla JavaScript over animation libraries unless the existing app already depends on one.

## Workflow

1. Inspect the app stack, existing styling system, and target screens before adding animation.
2. Pick the smallest pattern that supports the interaction. Use CSS-only for loops and hover/tap effects; use JavaScript only for scroll visibility, text splitting, or bounded parallax.
3. Default to `transform` and `opacity`. Avoid animating layout or paint-heavy properties.
4. Add `prefers-reduced-motion` fallbacks for every effect.
5. Keep motion meaningful for quizzes/apps: question transitions, answer feedback, progress changes, result reveals, and primary actions. Avoid decorating every card continuously.
6. Verify mobile behavior: no text overlap, no layout shift, no console errors, and no scroll jank.

## Resource Choice

- Use `assets/lightweight-motion.css` when the project needs a reusable default motion kit.
- Use `assets/lightweight-motion.js` when the project needs scroll reveal, word-by-word headings, or simple parallax without dependencies.
- Read `references/performance-budget.md` when auditing weight, deciding whether an effect is safe, or answering performance questions.
- Read `references/patterns.md` when implementing a specific effect or adapting the assets to React/Next/Vite.

## Rules

- Keep the default motion payload small: no new runtime dependency for basic 2D animation.
- Use `IntersectionObserver` for scroll reveal; avoid raw scroll handlers that mutate many elements.
- Limit parallax to one to three layers and disable it for reduced motion, data saver, and very low-memory devices when detectable.
- Do not use `background-attachment: fixed` as the mobile parallax solution.
- Do not animate `top`, `left`, `width`, `height`, `margin`, `padding`, `box-shadow`, large `filter`, or large blurred gradients.
- Use hover effects only inside `@media (hover: hover) and (pointer: fine)` and provide `:active` feedback for touch.
- Use word-by-word animation only for short headings, result messages, or celebratory text. Do not split body copy, answer lists, or controls.
- Apply `will-change` sparingly and remove it if many elements stay promoted for the whole page.

## Implementation Notes

When editing an existing app, copy only the needed sections from the assets or convert them into the app's local conventions. For React, initialize DOM-driven effects inside `useEffect` and clean up listeners/observers. For SSR frameworks, guard browser APIs with `typeof window !== "undefined"`.

When reporting the result, include the likely weight impact:

- CSS keyframes and class-based effects are usually tiny.
- The main risk is rendering cost, not file size.
- Transform/opacity on a few elements is safe for old phones.
- Many infinite animations, blur/filter effects, heavy shadows, large images, or scroll-linked parallax can make the app feel heavy.
