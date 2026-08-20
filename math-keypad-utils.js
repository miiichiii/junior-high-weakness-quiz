(function (global) {
  "use strict";

  const CORE_KEYS = [
    "7", "8", "9", "+",
    "4", "5", "6", "−",
    "1", "2", "3", "x",
    "0", "x²", "x³"
  ];
  const CONTEXT_SYMBOLS = [
    "×", "÷", "/", "=", "√", "(", ")", ",", ".", "<", ">",
    "≦", "≧", "π", "°", "²", "³", ":", "%", "^"
  ];
  const EXPRESSION_PATTERN = /^[0-9A-Za-z+\-−×÷*/=√()²³^.,<>π±°≦≧%:\s]+$/u;

  function normalizeSource(value) {
    return String(value || "")
      .replace(/²/g, "__MATH_SQUARED__")
      .replace(/³/g, "__MATH_CUBED__")
      .normalize("NFKC")
      .replace(/__MATH_SQUARED__/g, "²")
      .replace(/__MATH_CUBED__/g, "³")
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/[−‐‑‒–—―-]/g, "−")
      .replace(/[＊*]/g, "×")
      .replace(/／/g, "/")
      .replace(/≤/g, "≦")
      .replace(/≥/g, "≧");
  }

  function isExpression(value) {
    const normalized = String(value || "").normalize("NFKC").trim();
    return Boolean(normalized && EXPRESSION_PATTERN.test(normalized));
  }

  function acceptedAnswers(question) {
    const values = Array.isArray(question?.answerText)
      ? question.answerText
      : [question?.answerText];
    return values.filter((value) => isExpression(value));
  }

  function isDirectAnswerQuestion(question) {
    if (!question || question.subject !== "数学") return false;
    const type = question.type || "choice";
    if (type === "input") {
      if (["drag-work", "rubric-input"].includes(question.answerMode)) return false;
      return acceptedAnswers(question).length > 0;
    }
    if (!["choice", "find-error"].includes(type)) return false;
    return Array.isArray(question.choices)
      && question.choices.length > 0
      && question.choices.every((choice) => isExpression(choice));
  }

  function answerSource(question) {
    if (!question) return "";
    if ((question.type || "choice") === "input") {
      return acceptedAnswers(question).join(" ");
    }
    return (Array.isArray(question.choices) ? question.choices : [])
      .filter((choice) => isExpression(choice))
      .join(" ");
  }

  function scratchSource(question) {
    if (!question) return "";
    return [
      question.prompt,
      ...(Array.isArray(question.choices) ? question.choices : [])
    ].filter(Boolean).join(" ");
  }

  function configForSource(rawSource) {
    const source = normalizeSource(rawSource);
    const core = CORE_KEYS.slice();
    const coreTokens = new Set(core);
    const extra = ["±"];
    const addExtra = (token) => {
      if (token && !coreTokens.has(token) && !extra.includes(token)) extra.push(token);
    };

    const variables = [];
    Array.from(source.matchAll(/[A-Za-z]/g)).forEach((match) => {
      if (!variables.includes(match[0])) variables.push(match[0]);
    });
    variables.forEach((variable) => {
      if (variable !== "x") addExtra(variable);
      if (variable !== "x" && source.includes(variable + "²")) addExtra(variable + "²");
      if (variable !== "x" && source.includes(variable + "³")) addExtra(variable + "³");
    });

    CONTEXT_SYMBOLS.forEach((symbol) => {
      if (source.includes(symbol)) addExtra(symbol);
    });
    const withoutVariablePowers = source.replace(/[A-Za-z][²³]/g, "");
    if (!withoutVariablePowers.includes("²")) {
      const index = extra.indexOf("²");
      if (index >= 0) extra.splice(index, 1);
    }
    if (!withoutVariablePowers.includes("³")) {
      const index = extra.indexOf("³");
      if (index >= 0) extra.splice(index, 1);
    }
    return { core, extra };
  }

  function directEntryPrompt(question) {
    const prompt = String(question?.prompt || "");
    if (!isDirectAnswerQuestion(question) || (question.type || "choice") === "input") return prompt;
    return prompt
      .replace(/正しい式の組み合わせはどれですか。?$/, "正しい式の組み合わせを答えなさい。")
      .replace(/正しい組み合わせはどれですか。?$/, "正しい式の組み合わせを答えなさい。")
      .replace(/式として最も適切なものはどれですか。?$/, "最も適切な式を答えなさい。")
      .replace(/式として正しいものはどれですか。?$/, "正しい式を答えなさい。")
      .replace(/解として正しいものはどれですか。?$/, "解を答えなさい。")
      .replace(/結果として正しいものはどれですか。?$/, "計算結果を答えなさい。")
      .replace(/を選びなさい。?$/, "を答えなさい。")
      .replace(/と、?どれになりますか。?$/, "とどうなりますか。")
      .replace(/はどれですか。?$/, "を答えなさい。")
      .replace(/はどれですか。/g, "を答えなさい。");
  }

  global.MathKeypadUtils = Object.freeze({
    normalizeSource,
    isExpression,
    acceptedAnswers,
    isDirectAnswerQuestion,
    answerSource,
    scratchSource,
    configForSource,
    directEntryPrompt
  });
})(typeof window !== "undefined" ? window : globalThis);
