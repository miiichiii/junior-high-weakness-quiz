# Animation Patterns

## CSS Keyframes

Use gentle loops on one or a few elements:

```css
@keyframes motion-float {
  0%, 100% { transform: translate3d(0, 0, 0); }
  50% { transform: translate3d(0, -8px, 0); }
}

.motion-float {
  animation: motion-float 4.8s ease-in-out infinite;
}
```

Avoid putting infinite animation on every quiz card or answer button.

## Scroll Fade-Up

Markup:

```html
<section class="motion-reveal" data-motion="reveal">...</section>
```

Behavior:

- Start at `opacity: 0` and `translateY(12px)`.
- Add `.is-visible` with `IntersectionObserver`.
- Use stagger only for small groups.

## Parallax

Markup:

```html
<div class="motion-parallax" data-motion-parallax data-motion-speed="16"></div>
```

Rules:

- Use transform-based movement only.
- Keep layers small or visually simple.
- Disable for reduced motion and data saver.
- Do not use parallax behind critical quiz text if it hurts readability.

## Hover And Tap

Use desktop hover and touch active states:

```css
@media (hover: hover) and (pointer: fine) {
  .motion-pressable:hover {
    transform: translateY(-1px) scale(1.02);
  }
}

.motion-pressable:active {
  transform: translateY(1px) scale(0.98);
}
```

Do not move buttons far enough to make taps feel unstable.

## Word Animation

Use only for short copy:

```html
<h2 data-motion-words>Great work today</h2>
```

The script should wrap words once, set `aria-label` to the original text, and mark word spans `aria-hidden="true"`.

## React Shape

Initialize vanilla effects from a client component:

```tsx
useEffect(() => {
  if (typeof window === "undefined" || !window.initLightweightMotion) return;
  return window.initLightweightMotion(document);
}, []);
```

If importing functions instead of using the global asset, return cleanup functions from `useEffect`.
