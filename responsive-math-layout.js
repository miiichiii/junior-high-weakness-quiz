(function (global) {
  "use strict";

  const CHOICE_FONT_SIZES = [18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8];
  const PROMPT_FONT_SIZES = [18, 17, 16, 15, 14, 13, 12, 11];
  const WORK_LINE_FONT_SIZES = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10];
  const KEYPAD_DISPLAY_FONT_SIZES = [24, 22, 20, 18, 16, 14, 12, 10, 9, 8];

  function fits(element) {
    return element.scrollWidth <= element.clientWidth + 1;
  }

  function fitAtSizes(element, sizes) {
    element.style.removeProperty("font-size");
    if (fits(element)) return true;
    for (const size of sizes) {
      element.style.fontSize = size + "px";
      if (fits(element)) return true;
    }
    return false;
  }

  function fitChoiceText(element) {
    if (!element) return false;
    return fitAtSizes(element, CHOICE_FONT_SIZES);
  }

  function fitMathWorkLine(element) {
    if (!element) return false;
    element.style.removeProperty("--math-work-token-font-size");
    if (fits(element)) return true;
    for (const size of WORK_LINE_FONT_SIZES) {
      element.style.setProperty("--math-work-token-font-size", size + "px");
      if (fits(element)) return true;
    }
    return false;
  }

  function fitGuidedChoices(root) {
    const scope = root || document;
    scope.querySelectorAll(".math-work-step-choice-text, .math-work-token-text")
      .forEach(fitChoiceText);
    scope.querySelectorAll(".math-work-line").forEach(fitMathWorkLine);
    scope.querySelectorAll(".math-answer-keypad-display:not(.empty)")
      .forEach((element) => fitAtSizes(element, KEYPAD_DISPLAY_FONT_SIZES));
  }

  function fitQuestionPrompt(element, keepOnOneLine) {
    if (!element) return false;
    element.classList.remove("single-line-math");
    element.style.removeProperty("font-size");
    if (!keepOnOneLine || !global.matchMedia?.("(max-width: 560px)").matches) return true;

    element.classList.add("single-line-math");
    if (fitAtSizes(element, PROMPT_FONT_SIZES)) return true;

    // A long word problem is more readable wrapped than compressed below 11px.
    element.classList.remove("single-line-math");
    element.style.removeProperty("font-size");
    return false;
  }

  global.ResponsiveMathLayout = Object.freeze({
    fitChoiceText,
    fitMathWorkLine,
    fitGuidedChoices,
    fitQuestionPrompt
  });
})(typeof window !== "undefined" ? window : globalThis);
