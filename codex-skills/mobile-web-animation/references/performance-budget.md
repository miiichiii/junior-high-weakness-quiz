# Performance Budget

## Default Budget

- Add no animation library for basic 2D website motion.
- Keep reusable motion CSS and JS near a few kilobytes gzip.
- Animate only visible or soon-visible elements.
- Keep infinite animations to a small number of decorative or status elements.
- Prefer short durations: `160ms` to `260ms` for taps, `320ms` to `520ms` for reveals, `3s` to `7s` for gentle loops.

## Property Cost

Safe defaults:

- `transform: translate/scale/rotate/translate3d`
- `opacity`

Use carefully:

- `clip-path`, only on small/simple shapes
- `box-shadow`, only as a static state or opacity-faded pseudo-element
- `filter`, only if tiny and not animated on large elements
- `background-position`, only for small decorative elements and not on scroll

Avoid animating:

- `top`, `right`, `bottom`, `left`
- `width`, `height`, `min-*`, `max-*`
- `margin`, `padding`
- `border-width`
- large `box-shadow`
- large `filter: blur(...)`
- `backdrop-filter`
- large gradients or full-screen background movement
- `background-attachment: fixed` on mobile

## Old Smartphone Rules

- Use one `IntersectionObserver` for all reveal elements.
- Use one `requestAnimationFrame` loop for all parallax layers.
- Limit parallax to one to three layers; disable it on data saver and very low-memory devices.
- Pause or avoid offscreen infinite loops when many elements exist.
- Avoid animating lists of quiz answers continuously. Animate question entry, selected answer feedback, and result reveal instead.
- Keep tappable buttons stable. Hover/tap effects must not resize layout or move neighboring text.

## Accessibility

- Always support `prefers-reduced-motion: reduce`.
- Do not rely on motion as the only state indicator; keep color, text, icon, or border changes.
- Avoid flashing and rapid repeated scale changes.
- Preserve focus outlines and keyboard navigation.
- For text splitting, keep an accessible label and hide decorative word spans from assistive tech.

## Verification Checklist

- Test a mobile viewport around `360x640`.
- Check that text never overlaps after animation starts or ends.
- Check that the first screen does not shift after scripts run.
- Check console output for errors.
- Try with reduced motion enabled if the browser can emulate it.
- For quiz/apps, complete the main flow: start, answer, feedback, next question, result.
