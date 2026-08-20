(function (global) {
  "use strict";

  const VARIABLES = new Set(["x", "y", "a", "b", "n", "p", "q"]);
  const DISPLAY_OPERATORS = new Set(["+", "−", "×", "÷", "=", "(", ")", ",", "√", "²", "³"]);

  function normalize(value) {
    return String(value || "")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3")
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[−‐‑‒–—―]/g, "-")
      .replace(/[＊*]/g, "×")
      .replace(/[／/]/g, "÷")
      .replace(/[、，]/g, ",")
      .replace(/\s+/g, "");
  }

  function tokenize(value) {
    const source = normalize(value);
    const tokens = [];
    let index = 0;
    while (index < source.length) {
      const character = source[index];
      if (/\d/.test(character) || (character === "." && /\d/.test(source[index + 1] || ""))) {
        let end = index + 1;
        while (end < source.length && /[\d.]/.test(source[end])) end += 1;
        const number = source.slice(index, end);
        if (!/^\d+(?:\.\d+)?$/.test(number) && !/^\.\d+$/.test(number)) return null;
        tokens.push(number);
        index = end;
        continue;
      }
      if (VARIABLES.has(character) || ["+", "-", "×", "÷", "=", "√", "(", ")", "^", ","].includes(character)) {
        tokens.push(character);
        index += 1;
        continue;
      }
      return null;
    }
    return tokens;
  }

  function startsImplicitFactor(token) {
    return token === "(" || token === "√" || VARIABLES.has(token)
      || /^\d/.test(token || "") || /^\./.test(token || "");
  }

  function parseExpression(value) {
    const tokens = tokenize(value);
    if (!tokens || !tokens.length || tokens.some((token) => token === "=" || token === ",")) return null;
    let index = 0;

    function current() {
      return tokens[index];
    }

    function consume(token) {
      if (current() !== token) return false;
      index += 1;
      return true;
    }

    function parseAdditive() {
      const first = parseMultiplicative();
      if (!first) return null;
      const terms = [{ sign: 1, value: first }];
      while (current() === "+" || current() === "-") {
        const sign = current() === "+" ? 1 : -1;
        index += 1;
        const valueNode = parseMultiplicative();
        if (!valueNode) return null;
        terms.push({ sign, value: valueNode });
      }
      return terms.length === 1 ? first : { type: "add", terms };
    }

    function mergeProduct(left, right) {
      const factors = [];
      if (left.type === "mul") factors.push(...left.factors);
      else factors.push(left);
      if (right.type === "mul") factors.push(...right.factors);
      else factors.push(right);
      return { type: "mul", factors };
    }

    function parseMultiplicative() {
      let node = parseUnary();
      if (!node) return null;
      while (index < tokens.length) {
        if (current() === "×" || current() === "÷") {
          const operator = current();
          index += 1;
          const right = parseUnary();
          if (!right) return null;
          node = operator === "×" ? mergeProduct(node, right) : { type: "div", left: node, right };
          continue;
        }
        if (startsImplicitFactor(current())) {
          const right = parseUnary();
          if (!right) return null;
          node = mergeProduct(node, right);
          continue;
        }
        break;
      }
      return node;
    }

    function parseUnary() {
      if (consume("+")) return parseUnary();
      if (consume("-")) {
        const valueNode = parseUnary();
        return valueNode ? { type: "neg", value: valueNode } : null;
      }
      return parsePower();
    }

    function parsePower() {
      let node = parsePrimary();
      if (!node) return null;
      if (consume("^")) {
        const exponent = parseUnary();
        if (!exponent) return null;
        node = { type: "pow", base: node, exponent };
      }
      return node;
    }

    function parsePrimary() {
      if (consume("√")) {
        const valueNode = parsePrimary();
        return valueNode ? { type: "sqrt", value: valueNode } : null;
      }
      if (consume("(")) {
        const valueNode = parseAdditive();
        if (!valueNode || !consume(")")) return null;
        return valueNode;
      }
      const token = current();
      if (VARIABLES.has(token)) {
        index += 1;
        return { type: "variable", value: token };
      }
      if (/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(token || "")) {
        index += 1;
        return { type: "number", value: token.startsWith(".") ? "0" + token : token };
      }
      return null;
    }

    const result = parseAdditive();
    return result && index === tokens.length ? result : null;
  }

  function peelNegative(node, sign) {
    let valueNode = node;
    let valueSign = sign;
    while (valueNode?.type === "neg") {
      valueSign *= -1;
      valueNode = valueNode.value;
    }
    return { sign: valueSign, value: valueNode };
  }

  function canonicalNode(node) {
    if (!node) return "";
    if (node.type === "number") return "number:" + node.value;
    if (node.type === "variable") return "variable:" + node.value;
    if (node.type === "sqrt") return "sqrt(" + canonicalNode(node.value) + ")";
    if (node.type === "pow") {
      return "pow(" + canonicalNode(node.base) + "," + canonicalNode(node.exponent) + ")";
    }
    if (node.type === "neg") return "negative(" + canonicalNode(node.value) + ")";
    if (node.type === "div") {
      return "divide(" + canonicalNode(node.left) + "," + canonicalNode(node.right) + ")";
    }
    if (node.type === "mul") {
      const factors = [];
      let negative = false;
      node.factors.forEach((factor) => {
        const peeled = peelNegative(factor, 1);
        if (peeled.sign < 0) negative = !negative;
        if (peeled.value?.type === "mul") factors.push(...peeled.value.factors.map(canonicalNode));
        else factors.push(canonicalNode(peeled.value));
      });
      factors.sort();
      return (negative ? "negative:" : "positive:") + "product(" + factors.join("|") + ")";
    }
    if (node.type === "add") {
      const terms = [];
      node.terms.forEach((term) => {
        const peeled = peelNegative(term.value, term.sign);
        if (peeled.value?.type === "add" && peeled.sign > 0) {
          peeled.value.terms.forEach((nested) => {
            const nestedPeeled = peelNegative(nested.value, nested.sign);
            terms.push((nestedPeeled.sign < 0 ? "minus:" : "plus:") + canonicalNode(nestedPeeled.value));
          });
        } else {
          terms.push((peeled.sign < 0 ? "minus:" : "plus:") + canonicalNode(peeled.value));
        }
      });
      terms.sort();
      return "sum(" + terms.join("|") + ")";
    }
    return "";
  }

  function parseStatement(value) {
    const parts = normalize(value).split("=");
    if (parts.length > 2 || parts.some((part) => !part)) return null;
    const expressions = parts.map(parseExpression);
    if (expressions.some((expression) => !expression)) return null;
    if (expressions.length === 1) return { type: "expression", value: expressions[0] };
    return { type: "equation", sides: expressions };
  }

  function canonicalStatement(value) {
    const statement = parseStatement(value);
    if (!statement) return null;
    if (statement.type === "expression") return "expression:" + canonicalNode(statement.value);
    const sides = statement.sides.map(canonicalNode).sort();
    return "equation:" + sides.join("⇔");
  }

  function canonicalWork(value) {
    const segments = normalize(value).split(",");
    if (!segments.length || segments.some((segment) => !segment)) return null;
    const canonicalSegments = segments.map(canonicalStatement);
    if (canonicalSegments.some((segment) => !segment)) return null;
    return canonicalSegments.sort();
  }

  function sameCanonicalWork(left, right) {
    const leftWork = canonicalWork(left);
    const rightWork = canonicalWork(right);
    return Boolean(leftWork && rightWork
      && leftWork.length === rightWork.length
      && leftWork.every((segment, index) => segment === rightWork[index]));
  }

  function expressionsEquivalent(leftExpression, rightExpression) {
    const left = parseExpression(leftExpression);
    const right = parseExpression(rightExpression);
    return Boolean(left && right && canonicalNode(left) === canonicalNode(right));
  }

  // Exact symbolic arithmetic for the small algebra used in work rows.  This
  // deliberately supports only rational polynomials and square roots of
  // non-negative rational constants.  In particular, expressions such as
  // sqrt(x^2) are left unsupported instead of assuming x is positive.  That
  // keeps alternative radical routes flexible without reintroducing the old
  // "try a few values of x" loophole.
  function bigintAbs(value) {
    return value < 0n ? -value : value;
  }

  function bigintGcd(left, right) {
    let a = bigintAbs(left);
    let b = bigintAbs(right);
    while (b) {
      const remainder = a % b;
      a = b;
      b = remainder;
    }
    return a || 1n;
  }

  function rational(numerator, denominator) {
    if (!denominator) return null;
    let top = numerator;
    let bottom = denominator;
    if (bottom < 0n) {
      top = -top;
      bottom = -bottom;
    }
    const divisor = bigintGcd(top, bottom);
    return { numerator: top / divisor, denominator: bottom / divisor };
  }

  function rationalFromNumber(value) {
    const text = String(value);
    if (!text.includes(".")) return rational(BigInt(text), 1n);
    const [integer, fraction] = text.split(".");
    const scale = 10n ** BigInt(fraction.length);
    return rational(BigInt(integer || "0") * scale + BigInt(fraction), scale);
  }

  function rationalAdd(left, right) {
    return rational(
      left.numerator * right.denominator + right.numerator * left.denominator,
      left.denominator * right.denominator
    );
  }

  function rationalMultiply(left, right) {
    return rational(left.numerator * right.numerator, left.denominator * right.denominator);
  }

  function rationalDivide(left, right) {
    if (!right.numerator) return null;
    return rational(left.numerator * right.denominator, left.denominator * right.numerator);
  }

  function squareFreeParts(value) {
    if (value < 0n) return null;
    // Work-row values are small school integers.  Refuse pathological pasted
    // integers instead of trial-dividing an unbounded BigInt on the main thread.
    if (value > 1000000000000n) return null;
    if (value === 0n) return { outside: 0n, inside: 1n };
    let remaining = value;
    let outside = 1n;
    let inside = 1n;
    for (let factor = 2n; factor * factor <= remaining; factor += 1n) {
      let exponent = 0;
      while (remaining % factor === 0n) {
        remaining /= factor;
        exponent += 1;
      }
      if (exponent >= 2) outside *= factor ** BigInt(Math.floor(exponent / 2));
      if (exponent % 2) inside *= factor;
    }
    if (remaining > 1n) inside *= remaining;
    return { outside, inside };
  }

  function clonePowers(powers) {
    return new Map(powers ? Array.from(powers.entries()) : []);
  }

  function symbolicTerm(coefficient, radicand, powers) {
    const parts = squareFreeParts(radicand);
    if (!coefficient || !parts) return null;
    const adjusted = rationalMultiply(coefficient, rational(parts.outside, 1n));
    return { coefficient: adjusted, radicand: parts.inside, powers: clonePowers(powers) };
  }

  function termKey(term) {
    const powers = Array.from(term.powers.entries())
      .filter(([, exponent]) => exponent !== 0)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([variable, exponent]) => variable + "^" + exponent)
      .join("|");
    return term.radicand + ";" + powers;
  }

  function normalizePolynomial(terms) {
    const combined = new Map();
    terms.forEach((term) => {
      if (!term || !term.coefficient.numerator) return;
      const key = termKey(term);
      const previous = combined.get(key);
      if (!previous) {
        combined.set(key, {
          coefficient: term.coefficient,
          radicand: term.radicand,
          powers: clonePowers(term.powers)
        });
        return;
      }
      previous.coefficient = rationalAdd(previous.coefficient, term.coefficient);
      if (!previous.coefficient.numerator) combined.delete(key);
    });
    return Array.from(combined.values()).sort((left, right) => termKey(left).localeCompare(termKey(right)));
  }

  function multiplyTerms(left, right) {
    const powers = clonePowers(left.powers);
    right.powers.forEach((exponent, variable) => {
      powers.set(variable, (powers.get(variable) || 0) + exponent);
    });
    return symbolicTerm(
      rationalMultiply(left.coefficient, right.coefficient),
      left.radicand * right.radicand,
      powers
    );
  }

  function divideTerms(left, right) {
    if (!right.coefficient.numerator) return null;
    const powers = clonePowers(left.powers);
    right.powers.forEach((exponent, variable) => {
      powers.set(variable, (powers.get(variable) || 0) - exponent);
    });
    // sqrt(a) / sqrt(b) = sqrt(ab) / b, with a and b square-free here.
    const coefficient = rationalDivide(left.coefficient, right.coefficient);
    if (!coefficient) return null;
    return symbolicTerm(
      rationalDivide(coefficient, rational(right.radicand, 1n)),
      left.radicand * right.radicand,
      powers
    );
  }

  function multiplyPolynomials(left, right) {
    const terms = [];
    left.forEach((leftTerm) => right.forEach((rightTerm) => {
      terms.push(multiplyTerms(leftTerm, rightTerm));
    }));
    return normalizePolynomial(terms);
  }

  function symbolicPolynomial(node) {
    if (!node) return null;
    if (node.type === "number") {
      return [symbolicTerm(rationalFromNumber(node.value), 1n, new Map())];
    }
    if (node.type === "variable") {
      return [symbolicTerm(rational(1n, 1n), 1n, new Map([[node.value, 1]]))];
    }
    if (node.type === "neg") {
      const value = symbolicPolynomial(node.value);
      if (!value) return null;
      return value.map((term) => ({
        ...term,
        coefficient: rational(-term.coefficient.numerator, term.coefficient.denominator)
      }));
    }
    if (node.type === "add") {
      const terms = [];
      for (const item of node.terms) {
        const value = symbolicPolynomial(item.value);
        if (!value) return null;
        value.forEach((term) => terms.push(item.sign < 0 ? {
          ...term,
          coefficient: rational(-term.coefficient.numerator, term.coefficient.denominator)
        } : term));
      }
      return normalizePolynomial(terms);
    }
    if (node.type === "mul") {
      let result = [symbolicTerm(rational(1n, 1n), 1n, new Map())];
      for (const factor of node.factors) {
        const value = symbolicPolynomial(factor);
        if (!value) return null;
        result = multiplyPolynomials(result, value);
      }
      return result;
    }
    if (node.type === "div") {
      const left = symbolicPolynomial(node.left);
      const right = symbolicPolynomial(node.right);
      if (!left || !right || right.length !== 1) return null;
      const divided = left.map((term) => divideTerms(term, right[0]));
      return divided.some((term) => !term) ? null : normalizePolynomial(divided);
    }
    if (node.type === "pow") {
      if (node.exponent.type !== "number" || !/^\d+$/.test(node.exponent.value)) return null;
      const exponent = Number(node.exponent.value);
      if (!Number.isSafeInteger(exponent) || exponent < 0 || exponent > 10) return null;
      const base = symbolicPolynomial(node.base);
      if (!base) return null;
      let result = [symbolicTerm(rational(1n, 1n), 1n, new Map())];
      for (let count = 0; count < exponent; count += 1) result = multiplyPolynomials(result, base);
      return result;
    }
    if (node.type === "sqrt") {
      const value = symbolicPolynomial(node.value);
      if (!value || value.length !== 1) return null;
      const term = value[0];
      if (term.radicand !== 1n || term.powers.size || term.coefficient.numerator < 0n) return null;
      const numerator = squareFreeParts(term.coefficient.numerator);
      const denominator = squareFreeParts(term.coefficient.denominator);
      if (!numerator || !denominator || denominator.inside !== 1n) return null;
      return [symbolicTerm(
        rational(numerator.outside, denominator.outside),
        numerator.inside,
        new Map()
      )];
    }
    return null;
  }

  function exactExpressionKey(node) {
    const polynomial = symbolicPolynomial(node);
    if (!polynomial) return null;
    return normalizePolynomial(polynomial).map((term) => {
      const coefficient = term.coefficient.numerator + "/" + term.coefficient.denominator;
      return termKey(term) + "=" + coefficient;
    }).join("+");
  }

  function exactExpressionsEquivalent(left, right) {
    const leftKey = exactExpressionKey(left);
    const rightKey = exactExpressionKey(right);
    return leftKey !== null && rightKey !== null && leftKey === rightKey;
  }

  function operatorComplexity(value) {
    const tokens = tokenize(value) || [];
    return tokens.filter((token) => ["+", "-", "×", "÷", "^", "√", "="].includes(token)).length;
  }

  function nodesInWork(value) {
    const segments = normalize(value).split(",");
    const statements = segments.map(parseStatement);
    return statements.some((statement) => !statement) ? null : statements;
  }

  function walk(node, visitor) {
    if (!node) return;
    visitor(node);
    if (node.type === "add") node.terms.forEach((term) => walk(term.value, visitor));
    if (node.type === "mul") node.factors.forEach((factor) => walk(factor, visitor));
    if (node.type === "neg" || node.type === "sqrt") walk(node.value, visitor);
    if (node.type === "pow") {
      walk(node.base, visitor);
      walk(node.exponent, visitor);
    }
    if (node.type === "div") {
      walk(node.left, visitor);
      walk(node.right, visitor);
    }
  }

  function workHasNode(value, type, predicate) {
    const statements = nodesInWork(value);
    if (!statements) return false;
    let found = false;
    statements.forEach((statement) => {
      const roots = statement.type === "equation" ? statement.sides : [statement.value];
      roots.forEach((root) => walk(root, (node) => {
        if (node.type === type && (!predicate || predicate(node))) found = true;
      }));
    });
    return found;
  }

  function variablesInWork(value) {
    const statements = nodesInWork(value);
    if (!statements) return null;
    const variables = new Set();
    statements.forEach((statement) => statementRoots(statement).forEach((root) => {
      walk(root, (node) => {
        if (node.type === "variable") variables.add(node.value);
      });
    }));
    return variables;
  }

  function candidateUsesOnlyExpectedVariables(candidate, expected) {
    const candidateVariables = variablesInWork(candidate);
    const expectedVariables = variablesInWork(expected);
    if (!candidateVariables || !expectedVariables) return false;
    return Array.from(candidateVariables).every((variable) => expectedVariables.has(variable));
  }

  function perfectSquareInteger(value) {
    if (value <= 1n) return false;
    let low = 1n;
    let high = value;
    while (low <= high) {
      const middle = (low + high) / 2n;
      const square = middle * middle;
      if (square === value) return true;
      if (square < value) low = middle + 1n;
      else high = middle - 1n;
    }
    return false;
  }

  function exactPositiveInteger(node) {
    const polynomial = symbolicPolynomial(node);
    if (!polynomial || polynomial.length !== 1) return null;
    const term = polynomial[0];
    if (term.radicand !== 1n || term.powers.size || term.coefficient.denominator !== 1n) return null;
    return term.coefficient.numerator > 0n ? term.coefficient.numerator : null;
  }

  function exactRationalConstant(node) {
    const polynomial = symbolicPolynomial(node);
    if (!polynomial || polynomial.length !== 1) return null;
    const term = polynomial[0];
    if (term.radicand !== 1n || term.powers.size) return null;
    return term.coefficient;
  }

  function nodesDemonstrateTransformation(statements, predicate, expected) {
    const expectedStatements = expected ? nodesInWork(expected) : null;
    return statements.some((statement, statementIndex) => {
      if (statement.type !== "equation") return false;
      const [left, right] = statement.sides;
      const expectedStatement = expectedStatements?.[statementIndex];
      if (expectedStatement?.type === "equation") {
        const expectedSource = canonicalNode(expectedStatement.sides[0]);
        if (canonicalNode(left) === expectedSource) return predicate(left, right);
        if (canonicalNode(right) === expectedSource) return predicate(right, left);
        return false;
      }
      return predicate(left, right);
    });
  }

  function hasIrrationalDenominator(node) {
    let found = false;
    walk(node, (part) => {
      if (part.type !== "div" || !nodeContainsType(part.right, "sqrt")) return;
      if (!exactRationalConstant(part.right)) found = true;
    });
    return found;
  }

  function rationalizationEvidence(source, result) {
    if (!exactExpressionsEquivalent(source, result)) return false;
    if (canonicalNode(source) === canonicalNode(result)) return false;
    if (!hasIrrationalDenominator(source) || hasIrrationalDenominator(result)) return false;
    if (hasZeroAdditivePadding(result) || hasMultiplicativeIdentityPadding(result)) return false;
    // Rationalizing a real middle-school expression leaves the radical in the
    // numerator (possibly over a denominator such as √3×√3 that is itself an
    // exact rational).  Merely multiplying the original fraction by 2÷2 does
    // not satisfy this because its nested irrational denominator remains.
    return nodeContainsType(result, "sqrt");
  }

  function reducibleRadicalCount(node) {
    let count = 0;
    walk(node, (part) => {
      if (part.type !== "sqrt") return;
      const integer = exactPositiveInteger(part.value);
      const parts = integer === null ? null : squareFreeParts(integer);
      if (parts && parts.outside > 1n) count += 1;
    });
    return count;
  }

  function isExplicitSquareFactor(node) {
    if (node?.type === "number" && /^\d+$/.test(node.value)) {
      return perfectSquareInteger(BigInt(node.value));
    }
    if (node?.type !== "pow" || node.base?.type !== "number"
        || node.exponent?.type !== "number" || !/^\d+$/.test(node.exponent.value)) {
      return false;
    }
    return Number(node.exponent.value) >= 2;
  }

  function isExplicitRadicalDecomposition(node) {
    if (node?.type === "sqrt" && node.value?.type === "mul") {
      return node.value.factors.length >= 2
        && node.value.factors.some(isExplicitSquareFactor);
    }
    if (node?.type !== "mul" || node.factors.length < 2
        || !node.factors.every((factor) => factor.type === "sqrt")) {
      return false;
    }
    return node.factors.some((factor) => {
      const integer = exactPositiveInteger(factor.value);
      return integer !== null && perfectSquareInteger(integer);
    });
  }

  function isExplicitRadicalDecompositionExpression(node) {
    if (node?.type !== "add") return isExplicitRadicalDecomposition(peelNegative(node, 1).value);
    return node.terms.every((term) => {
      const peeled = peelNegative(term.value, term.sign);
      return isExplicitRadicalDecomposition(peeled.value);
    });
  }

  function isSquareFreeLiteralRadical(node) {
    if (node?.type !== "sqrt" || node.value?.type !== "number"
        || !/^\d+$/.test(node.value.value)) return false;
    const parts = squareFreeParts(BigInt(node.value.value));
    return Boolean(parts && parts.outside === 1n);
  }

  function isSimplifiedRadicalTerm(node) {
    if (node?.type === "number" && /^\d+$/.test(node.value)) return true;
    if (isSquareFreeLiteralRadical(node)) return true;
    if (node?.type !== "mul") return false;
    let radicals = 0;
    for (const factor of node.factors) {
      if (factor.type === "number" && /^\d+$/.test(factor.value)) continue;
      if (isSquareFreeLiteralRadical(factor)) {
        radicals += 1;
        continue;
      }
      return false;
    }
    return radicals === 1;
  }

  function isSimplifiedRadicalExpression(node) {
    if (node?.type !== "add") return isSimplifiedRadicalTerm(peelNegative(node, 1).value);
    return node.terms.every((term) => isSimplifiedRadicalTerm(peelNegative(term.value, term.sign).value));
  }

  function polynomialWithSign(node, sign) {
    const polynomial = symbolicPolynomial(node);
    if (!polynomial) return null;
    return polynomial.map((term) => sign < 0 ? {
      ...term,
      coefficient: rational(-term.coefficient.numerator, term.coefficient.denominator)
    } : term);
  }

  function hasZeroAdditivePadding(node) {
    let found = false;
    walk(node, (part) => {
      if (found || part.type !== "add") return;
      const signedTerms = part.terms.map((term) => {
        const peeled = peelNegative(term.value, term.sign);
        return polynomialWithSign(peeled.value, peeled.sign);
      });
      const count = signedTerms.length;
      // Work rows are intentionally short.  A much longer additive expression
      // is not a credible single transformation and avoids exponential work.
      if (count > 12) {
        found = true;
        return;
      }
      if (signedTerms.some((term) => !term)) return;
      const allMask = (1 << count) - 1;
      for (let mask = 1; mask < allMask && !found; mask += 1) {
        const subset = [];
        for (let index = 0; index < count; index += 1) {
          if (mask & (1 << index)) subset.push(...signedTerms[index]);
        }
        if (!normalizePolynomial(subset).length) found = true;
      }
    });
    return found;
  }

  function productNode(factors) {
    if (!factors.length) return { type: "number", value: "1" };
    return factors.length === 1 ? factors[0] : { type: "mul", factors };
  }

  function isExactOne(node) {
    const value = exactRationalConstant(node);
    return Boolean(value && value.numerator === value.denominator);
  }

  function factorSubsetMatches(factors, target, minimumSize) {
    if (!factors.length) return false;
    if (factors.length > 12) return true;
    const limit = 1 << factors.length;
    for (let mask = 1; mask < limit; mask += 1) {
      const selected = [];
      for (let index = 0; index < factors.length; index += 1) {
        if (mask & (1 << index)) selected.push(factors[index]);
      }
      if (selected.length >= (minimumSize || 1)
          && exactExpressionsEquivalent(productNode(selected), target)) return true;
    }
    return false;
  }

  function hasMultiplicativeIdentityPadding(node) {
    let found = false;
    walk(node, (part) => {
      if (found) return;
      if (part.type === "mul") {
        const factors = part.factors;
        if (factors.length > 12) {
          found = true;
          return;
        }
        const limit = 1 << factors.length;
        for (let mask = 1; mask < limit && !found; mask += 1) {
          const selected = [];
          for (let index = 0; index < factors.length; index += 1) {
            if (mask & (1 << index)) selected.push(factors[index]);
          }
          if (isExactOne(productNode(selected))) found = true;
        }
        factors.forEach((factor, factorIndex) => {
          if (found || factor.type !== "div") return;
          const others = factors.filter((unused, index) => index !== factorIndex);
          if (factorSubsetMatches(others, factor.right)) found = true;
        });
      }
      if (part.type === "div") {
        const numeratorFactors = part.left.type === "mul" ? part.left.factors : [part.left];
        if (factorSubsetMatches(numeratorFactors, part.right)) {
          found = true;
          return;
        }
        const denominators = [];
        let cursor = part;
        while (cursor?.type === "div") {
          denominators.push(cursor.right);
          cursor = cursor.left;
        }
        if (denominators.length >= 2 && denominators.length <= 12) {
          const limit = 1 << denominators.length;
          for (let mask = 1; mask < limit && !found; mask += 1) {
            const selected = [];
            for (let index = 0; index < denominators.length; index += 1) {
              if (mask & (1 << index)) selected.push(denominators[index]);
            }
            if (selected.length >= 2 && isExactOne(productNode(selected))) found = true;
          }
        }
      }
    });
    return found;
  }

  function nodeOperationCount(node) {
    let count = 0;
    walk(node, (part) => {
      if (["add", "mul", "div", "pow", "sqrt", "neg"].includes(part.type)) count += 1;
    });
    return count;
  }

  function variablesInNode(node) {
    const variables = new Set();
    walk(node, (part) => {
      if (part.type === "variable") variables.add(part.value);
    });
    return variables;
  }

  function isSimpleEvaluatedMonomial(node) {
    if (node?.type === "number" || node?.type === "variable") return true;
    if (node?.type === "neg") return isSimpleEvaluatedMonomial(node.value);
    if (node?.type === "pow") {
      return node.base?.type === "variable" && node.exponent?.type === "number";
    }
    return node?.type === "mul" && node.factors.every(isSimpleEvaluatedMonomial);
  }

  function algebraicEvaluationConclusion(source, result) {
    if (!isSimpleEvaluatedMonomial(result)) return false;
    const sourceVariables = variablesInNode(source);
    const resultVariables = variablesInNode(result);
    if (!sourceVariables.size
        || Array.from(resultVariables).some((variable) => !sourceVariables.has(variable))) return false;
    return (source.type === "variable" && result.type === "number")
      || nodeOperationCount(result) < nodeOperationCount(source);
  }

  function evaluationEvidence(source, result) {
    if (canonicalNode(source) === canonicalNode(result)) return false;
    if (hasZeroAdditivePadding(result) || hasMultiplicativeIdentityPadding(result)) return false;
    const sourceScore = nodeOperationCount(source) + reducibleRadicalCount(source);
    const resultScore = nodeOperationCount(result) + reducibleRadicalCount(result);
    if (exactExpressionsEquivalent(source, result)) return resultScore < sourceScore;
    // Some stored school-work rows are conclusions under a condition written
    // on the preceding row (a−b=5), and implicit denominator notation such as
    // 6x²y÷3xy is intentionally learner-facing.  A strictly simpler monomial
    // using no new variables is still concrete evaluation progress.
    return algebraicEvaluationConclusion(source, result);
  }

  function squareExtractionEvidence(source, result) {
    if (!exactExpressionsEquivalent(source, result)) return false;
    if (canonicalNode(source) === canonicalNode(result)) return false;
    if (!reducibleRadicalCount(source)
        || hasZeroAdditivePadding(result)
        || hasMultiplicativeIdentityPadding(result)) return false;
    if (isExplicitRadicalDecompositionExpression(result)) return true;
    return isSimplifiedRadicalExpression(result)
      && reducibleRadicalCount(result) < reducibleRadicalCount(source);
  }

  function isPrimeInteger(value) {
    if (value < 2n) return false;
    for (let factor = 2n; factor * factor <= value; factor += 1n) {
      if (value % factor === 0n) return false;
    }
    return true;
  }

  function multiplicativeFactorizationEvidence(node) {
    const factors = node?.type === "mul" ? node.factors : [node];
    const numericFactors = [];
    for (const factor of factors) {
      if (factor?.type === "variable") continue;
      if (factor?.type === "number" && /^\d+$/.test(factor.value)) {
        numericFactors.push({ base: BigInt(factor.value), exponent: 1, literal: true });
        continue;
      }
      if (factor?.type === "pow" && factor.base?.type === "number"
          && factor.exponent?.type === "number" && /^\d+$/.test(factor.base.value)
          && /^\d+$/.test(factor.exponent.value)) {
        const exponent = Number(factor.exponent.value);
        if (!Number.isSafeInteger(exponent) || exponent < 2) return false;
        numericFactors.push({ base: BigInt(factor.base.value), exponent, literal: false });
        continue;
      }
      return false;
    }
    if (!numericFactors.length) return false;
    const fullPrimeFactorization = numericFactors.every((factor) => isPrimeInteger(factor.base))
      && (numericFactors.length >= 2 || numericFactors.some((factor) => factor.exponent >= 2));
    const squareFactorSplit = factors.length >= 2 && numericFactors.some((factor) => (
      (factor.literal && perfectSquareInteger(factor.base))
      || (!factor.literal && factor.exponent >= 2)
    ));
    return fullPrimeFactorization || squareFactorSplit;
  }

  function primeFactorizationEvidence(source, result) {
    if (!exactExpressionsEquivalent(source, result)) return false;
    if (canonicalNode(source) === canonicalNode(result)) return false;
    if (hasZeroAdditivePadding(result)) return false;
    if (multiplicativeFactorizationEvidence(result)) return true;

    // The final square-number task records the chosen n and then substitutes it
    // under √.  Its second equality is valid evidence that the displayed
    // multiplicative radicand has become a perfect square.
    if (source?.type !== "sqrt" || source.value?.type !== "mul") return false;
    const radicand = exactPositiveInteger(source.value);
    const resultInteger = exactPositiveInteger(result);
    return radicand !== null && resultInteger !== null
      && perfectSquareInteger(radicand) && resultInteger * resultInteger === radicand;
  }

  function hasPerfectSquareEvidence(value) {
    const statements = nodesInWork(value);
    if (!statements) return false;
    let found = false;
    statements.forEach((statement) => statementRoots(statement).forEach((root) => {
      walk(root, (node) => {
        if (node.type === "number" && /^\d+$/.test(node.value)
            && perfectSquareInteger(BigInt(node.value))) {
          found = true;
        }
        if (node.type === "pow" && node.exponent?.type === "number"
            && Number(node.exponent.value) >= 2) {
          found = true;
        }
        if (node.type === "sqrt") {
          const integer = exactPositiveInteger(node.value);
          if (integer !== null && perfectSquareInteger(integer)) found = true;
        }
        if (node.type === "mul" && node.factors.some((factor) => factor.type === "sqrt")
            && node.factors.some((factor) => factor.type === "number" && Number(factor.value) > 1)) {
          found = true;
        }
      });
    }));
    return found;
  }

  function nodeContainsType(node, type) {
    let found = false;
    walk(node, (part) => {
      if (part.type === type) found = true;
    });
    return found;
  }

  function isRadicalRouteNode(node) {
    if (!node || node.type === "add") return false;
    return nodeContainsType(node, "sqrt");
  }

  function statementRoots(statement) {
    if (!statement) return [];
    return statement.type === "equation" ? statement.sides : [statement.value];
  }

  function hasNestedAdditiveGrouping(value) {
    const statements = nodesInWork(value);
    if (!statements) return true;
    let found = false;
    statements.forEach((statement) => statementRoots(statement).forEach((root) => {
      walk(root, (node) => {
        if (node.type !== "add") return;
        if (node.terms.some((term) => peelNegative(term.value, term.sign).value?.type === "add")) found = true;
      });
    }));
    return found;
  }

  function isLiteralNumber(node, value) {
    return Boolean(node?.type === "number" && Number(node.value) === value);
  }

  function hasNeutralPadding(value) {
    const statements = nodesInWork(value);
    if (!statements) return true;
    let found = false;
    statements.forEach((statement) => statementRoots(statement).forEach((root) => {
      walk(root, (node) => {
        if (node.type === "add" && node.terms.some((term) => isLiteralNumber(term.value, 0))) found = true;
        if (node.type === "mul" && node.factors.some((factor) => isLiteralNumber(factor, 1))) found = true;
        if (node.type === "div" && isLiteralNumber(node.right, 1)) found = true;
      });
    }));
    return found;
  }

  function transformationList(requiredTransformation) {
    if (!requiredTransformation) return [];
    if (Array.isArray(requiredTransformation)) return requiredTransformation.flatMap(transformationList);
    if (typeof requiredTransformation === "object") {
      const kinds = requiredTransformation.kind || requiredTransformation.kinds || [];
      return transformationList(kinds);
    }
    return String(requiredTransformation)
      .toLowerCase()
      .split(/[|,]/)
      .map((value) => value.trim())
      .filter(Boolean);
  }

  function transformationSatisfied(candidate, requiredTransformation, expected) {
    const normalizedCandidate = normalize(candidate);
    const statements = nodesInWork(candidate);
    if (!statements) return false;
    const requirements = transformationList(requiredTransformation);
    const aliases = {
      "expand-distributive": "expand",
      "distributive": "distribute",
      "change-sign": "change-signs",
      "combine": "combine-like-terms",
      "factor-pair": "factor-pair-check",
      "factorized": "factor",
      "extract-perfect-square": "extract-square",
      "prime-factorization": "prime-factorize",
      "evaluation": "evaluate"
    };
    return requirements.every((rawRequirement) => {
      const requirement = aliases[rawRequirement] || rawRequirement;
      const hasEquation = statements.some((statement) => statement.type === "equation");
      if (requirement === "expand" || requirement === "distribute") {
        return !hasNestedAdditiveGrouping(candidate)
          && workHasNode(candidate, "add")
          && (hasEquation || workHasNode(candidate, "mul"));
      }
      if (requirement === "change-signs") {
        return workHasNode(candidate, "add", (node) => node.terms.filter((term) => peelNegative(term.value, term.sign).sign < 0).length >= 2);
      }
      if (requirement === "combine-like-terms") return workHasNode(candidate, "add") || !hasEquation;
      if (requirement === "factor-pair-check") {
        return hasEquation && (workHasNode(candidate, "mul") || workHasNode(candidate, "pow"));
      }
      if (requirement === "factor") {
        return workHasNode(candidate, "mul", (node) => node.factors.some((factor) => factor.type === "add"))
          || workHasNode(candidate, "pow", (node) => node.base.type === "add")
          || (hasEquation && workHasNode(candidate, "mul"));
      }
      if (requirement === "extract-square") {
        return hasEquation && nodesDemonstrateTransformation(statements, squareExtractionEvidence, expected);
      }
      if (requirement === "rationalize") {
        return hasEquation && normalizedCandidate.includes("√")
          && nodesDemonstrateTransformation(statements, rationalizationEvidence, expected);
      }
      if (requirement === "substitute") return true;
      if (requirement === "evaluate") {
        if (!hasEquation) return statements.some((statement) => statement.type === "expression");
        return nodesDemonstrateTransformation(statements, evaluationEvidence, expected);
      }
      if (requirement === "prime-factorize") {
        return hasEquation && nodesDemonstrateTransformation(statements, primeFactorizationEvidence, expected);
      }
      return false;
    });
  }

  function anchoredExactTransformation(candidate, expected, requiredTransformation) {
    if (candidate.includes(",") || expected.includes(",") || hasNeutralPadding(candidate)) return false;
    const requirements = transformationList(requiredTransformation);
    const candidateStatement = parseStatement(candidate);
    const expectedStatement = parseStatement(expected);
    if (!candidateStatement || !expectedStatement) return false;
    if (!candidateUsesOnlyExpectedVariables(candidate, expected)) return false;

    // On a factorization row, writing only the displayed result side is a
    // complete response.  Requiring an exact side match (rather than mere
    // algebraic equivalence) is what lets row 2 accept the final product while
    // row 1 still rejects jumping ahead to that product.
    if (requirements.includes("factor")
        && candidateStatement.type === "expression"
        && expectedStatement.type === "equation") {
      return canonicalNode(candidateStatement.value) === canonicalNode(expectedStatement.sides[1]);
    }

    // Exact expansion equivalence would also accept a later factorization on an
    // earlier row.  Keep the symbolic fallback confined to the radical and
    // numeric-decomposition moves for which multiple written routes are normal.
    const exactKinds = new Set(["extract-square", "rationalize", "evaluate", "prime-factorize"]);
    if (!requirements.length || requirements.some((requirement) => !exactKinds.has(requirement))) return false;

    if (candidateStatement.type === "equation" && expectedStatement.type === "equation") {
      const candidateSides = candidateStatement.sides;
      const expectedSides = expectedStatement.sides;
      // The left side in stored work is the source expression for the row.
      // It must remain visible (equation reversal is fine).  Anchoring only the
      // result side would let an unrelated identity such as 1+11=√144 pass.
      for (const sourceIndex of [0, 1]) {
        const targetIndex = sourceIndex === 0 ? 1 : 0;
        const sourceAnchored = canonicalNode(candidateSides[sourceIndex]) === canonicalNode(expectedSides[0]);
        if (!sourceAnchored || !exactExpressionsEquivalent(candidateSides[targetIndex], expectedSides[1])) continue;
        if (requirements.includes("evaluate")
            && nodeContainsType(expectedSides[1], "sqrt")
            && !isRadicalRouteNode(candidateSides[targetIndex])) continue;
        if (requirements.includes("rationalize") && !isRadicalRouteNode(candidateSides[targetIndex])) continue;
        return true;
      }
      return false;
    }

    // A final simplification is often written as "previous form = result" even
    // when the stored route keeps only the result.  One side must be the stored
    // result structurally, and the other must be exactly equivalent to it.
    if (candidateStatement.type === "equation" && expectedStatement.type === "expression") {
      if (!workHasNode(expected, "sqrt")) return false;
      return candidateStatement.sides.some((side, sideIndex) => (
        canonicalNode(side) === canonicalNode(expectedStatement.value)
        && exactExpressionsEquivalent(candidateStatement.sides[sideIndex === 0 ? 1 : 0], expectedStatement.value)
        && isRadicalRouteNode(candidateStatement.sides[sideIndex === 0 ? 1 : 0])
        && hasPerfectSquareEvidence(candidate)
      ));
    }

    return false;
  }

  function workStepEquivalent(candidateValue, expectedValue, label, requiredTransformation) {
    const candidate = normalize(candidateValue);
    const expected = normalize(expectedValue);
    if (!candidate || !expected) return false;
    if (!transformationSatisfied(candidate, requiredTransformation, expected)) return false;
    return sameCanonicalWork(candidate, expected)
      || anchoredExactTransformation(candidate, expected, requiredTransformation);
  }

  function displayToken(token) {
    return token
      .replace(/\^2/g, "²")
      .replace(/\^3/g, "³")
      .replace(/-/g, "−");
  }

  function chunkExpression(value) {
    const tokens = tokenize(value) || [];
    const chunks = [];
    let index = 0;
    while (index < tokens.length) {
      const token = tokens[index];
      const startsTerm = /^\d/.test(token || "") || VARIABLES.has(token) || token === "√";
      if (!startsTerm) {
        chunks.push(displayToken(token));
        index += 1;
        continue;
      }
      let chunk = "";
      if (token === "√") {
        chunk = "√";
        index += 1;
        if (/^\d/.test(tokens[index] || "") || VARIABLES.has(tokens[index])) {
          chunk += tokens[index];
          index += 1;
        }
      } else {
        chunk = token;
        index += 1;
      }
      while (index < tokens.length) {
        if (VARIABLES.has(tokens[index])) {
          chunk += tokens[index];
          index += 1;
          continue;
        }
        if (tokens[index] === "√" && (/^\d/.test(tokens[index + 1] || "") || VARIABLES.has(tokens[index + 1]))) {
          chunk += "√" + tokens[index + 1];
          index += 2;
          continue;
        }
        if (tokens[index] === "^" && /^[23]$/.test(tokens[index + 1] || "")) {
          chunk += tokens[index + 1] === "2" ? "²" : "³";
          index += 2;
          continue;
        }
        break;
      }
      chunks.push(displayToken(chunk));
    }
    return chunks;
  }

  function mathRunsInPrompt(prompt) {
    const normalizedPrompt = normalize(prompt);
    const matches = normalizedPrompt.match(/[0-9xyabnpq+\-×÷=√()^.,]+/g) || [];
    return matches.filter((run) => /[0-9xyabnpq√]/.test(run));
  }

  function sourceChunks(run) {
    const chunks = new Set();
    const add = (value) => {
      const normalizedValue = normalize(value);
      if (normalizedValue.length > 1 && tokenize(normalizedValue)) chunks.add(displayToken(normalizedValue));
    };
    add(run);
    const groups = [];
    const stack = [];
    for (let index = 0; index < run.length; index += 1) {
      if (run[index] === "(") stack.push(index);
      if (run[index] === ")" && stack.length) {
        const start = stack.pop();
        const group = run.slice(start, index + 1);
        groups.push({ start, end: index + 1, value: group });
      }
    }
    groups
      .slice()
      .sort((left, right) => left.start - right.start || right.end - left.end)
      .forEach((group) => add(group.value));
    groups
      .filter((group) => !groups.some((outer) => outer.start < group.start && outer.end > group.end))
      .sort((left, right) => left.start - right.start)
      .forEach((group, index, topGroups) => {
        const next = topGroups[index + 1];
        if (next && next.start === group.end) add(group.value + next.value);
      });
    chunkExpression(run).forEach(add);
    return Array.from(chunks);
  }

  function buildQuickTokens(_step, prompt, _seed) {
    // This palette is intentionally independent of accepted work and final answers.
    // It may repeat only chunks already printed in the question, plus generic powers.
    const candidates = new Set();
    const promptVariables = new Set();
    mathRunsInPrompt(prompt).forEach((run) => {
      (tokenize(run) || []).forEach((token) => {
        if (VARIABLES.has(token)) promptVariables.add(token);
      });
      sourceChunks(run).forEach((token) => {
        if (!token || DISPLAY_OPERATORS.has(token)) return;
        candidates.add(token);
      });
    });
    promptVariables.forEach((variable) => candidates.add(variable + "²"));
    return Array.from(candidates).slice(0, 24);
  }

  const WORK_CHOICE_FEEDBACK = Object.freeze({
    sign: "符号を1つずつ確認しよう。引き算や負の数を分配した所がポイントです。",
    number: "係数・積・和をもう一度計算しよう。問題の数を置くだけでなく、掛け算まで確かめます。",
    power: "同じ文字を掛けたときの指数を確認しよう。x×x は x² です。",
    operator: "使う演算を確認しよう。分配では、かっこの外と中の各項を掛けます。",
    generic: "段階名に戻り、符号・係数・演算の順に見直そう。"
  });

  function workChoiceHash(seed, value) {
    const source = String(seed || "") + ":" + String(value || "");
    let hash = 2166136261;
    for (let index = 0; index < source.length; index += 1) {
      hash ^= source.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function deterministicChoiceOrder(choices, seed) {
    return choices.slice().sort((left, right) => {
      const hashDifference = workChoiceHash(seed, left.text) - workChoiceHash(seed, right.text);
      return hashDifference || left.text.localeCompare(right.text, "ja");
    });
  }

  function editableWorkRanges(value) {
    const ranges = [];
    let segmentStart = 0;
    String(value || "").split(",").forEach((segment) => {
      const equalsIndex = segment.lastIndexOf("=");
      const start = segmentStart + (equalsIndex >= 0 ? equalsIndex + 1 : 0);
      ranges.push({ start, end: segmentStart + segment.length });
      segmentStart += segment.length + 1;
    });
    return ranges;
  }

  function indexInWorkRanges(index, ranges) {
    return ranges.some((range) => index >= range.start && index < range.end);
  }

  function generatedWorkChoiceCandidates(answer) {
    const source = displayToken(normalize(answer));
    const ranges = editableWorkRanges(source);
    const candidates = [];
    const add = (text, feedback) => {
      if (text && text !== source) candidates.push({ text, feedback });
    };

    Array.from(source).forEach((character, index) => {
      if (!indexInWorkRanges(index, ranges)) return;
      if ((character === "+" || character === "−") && index > 0) {
        add(
          source.slice(0, index) + (character === "+" ? "−" : "+") + source.slice(index + 1),
          WORK_CHOICE_FEEDBACK.sign
        );
      }
      if (character === "²") {
        add(source.slice(0, index) + source.slice(index + 1), WORK_CHOICE_FEEDBACK.power);
      }
      if (character === "×") {
        add(source.slice(0, index) + "+" + source.slice(index + 1), WORK_CHOICE_FEEDBACK.operator);
      }
    });

    Array.from(source.matchAll(/\d+/g)).forEach((match) => {
      const index = match.index || 0;
      if (!indexInWorkRanges(index, ranges)) return;
      const value = Number(match[0]);
      if (!Number.isSafeInteger(value)) return;
      [value + 1, value > 1 ? value - 1 : value + 2].forEach((replacement) => {
        add(
          source.slice(0, index) + replacement + source.slice(index + match[0].length),
          WORK_CHOICE_FEEDBACK.number
        );
      });
    });

    // All stored work rows contain a numeric, sign, power, or multiplication
    // point. Keep a final valid-expression fallback for future authoring.
    if (candidates.length < 3 && canonicalWork(source)) {
      add("(" + source + ")+1", WORK_CHOICE_FEEDBACK.generic);
      add("(" + source + ")−1", WORK_CHOICE_FEEDBACK.generic);
    }
    return candidates;
  }

  function workChoiceIsAccepted(text, step) {
    return (step?.answers || []).some((answer) => workStepEquivalent(
      text,
      answer,
      step.label,
      step.requiredTransformation
    ));
  }

  function buildWorkStepChoices(step, _prompt, seed) {
    if (!step || !Array.isArray(step.answers) || !step.answers.length) return [];
    const explicitChoices = Array.isArray(step.choices) ? step.choices : [];
    let choices = explicitChoices.map((choice) => {
      if (typeof choice === "string") return { text: choice, feedback: WORK_CHOICE_FEEDBACK.generic };
      return {
        text: String(choice?.text || ""),
        feedback: String(choice?.feedback || WORK_CHOICE_FEEDBACK.generic)
      };
    }).filter((choice) => choice.text);

    if (!choices.length) {
      const correctText = String(step.answers[0]);
      choices = [{ text: correctText, feedback: "" }];
      generatedWorkChoiceCandidates(correctText).forEach((candidate) => {
        if (choices.length >= 4) return;
        if (!canonicalWork(candidate.text) || workChoiceIsAccepted(candidate.text, step)) return;
        if (choices.some((choice) => normalize(choice.text) === normalize(candidate.text))) return;
        choices.push(candidate);
      });
    }

    const unique = [];
    choices.forEach((choice) => {
      if (unique.some((existing) => normalize(existing.text) === normalize(choice.text))) return;
      unique.push(choice);
    });
    return deterministicChoiceOrder(unique.slice(0, 4), seed);
  }

  function workStepHint(step) {
    if (step?.hint) return String(step.hint);
    const label = String(step?.label || "").replace(/^\d+\.\s*/, "");
    const labelHints = [
      [/^かっこを外す$/, "かっこの前が＋なので、中の各項の符号を変えずに並べます。"],
      [/完全平方を確認/, "最初と最後がそれぞれ2乗で、中央がその2つの積の2倍か確認します。"],
      [/平方の差にする/, "2つの項をそれぞれ2乗の形に直し、a²−b²の形を作ります。"],
      [/平方の差を(?:使|因数分解)/, "a²−b²=(a−b)(a+b)を使い、同じ2項の差と和に分けます。"],
      [/平方の差を計算/, "(a−b)(a+b)=a²−b²を使うと、中央の項を計算せずに済みます。"],
      [/根号の項をまとめる/, "根号の中が同じ項だけを集め、根号の前の係数を計算します。"],
      [/根号の項を消す/, "同じ根号で符号が反対の項を探すと、足したときに0になります。"],
      [/積を計算する/, "数の係数、文字、指数をそれぞれ確認して積を求めます。"],
      [/各項を.+で割る/, "各項を同じ単項式で別々に割り、数と文字をそれぞれ約分します。"],
      [/^答えをまとめる$/, "各項を割った結果を、元の符号の順に並べます。"],
      [/2つの結果を足す/, "2つの計算結果は項の種類を確認し、同類項でなければそのまま足します。"],
      [/100を中心に表す/, "100との差に注目し、2つの数を100+□と100−□の形にします。"],
      [/展開公式を書く/, "(x+p)(x+q)=x²+(p+q)x+pqの形を使います。"],
      [/公式で置き換える/, "求めたい式を、問題で与えられた和と積を使える公式に変形します。"],
      [/完全平方の公式を使う|完全平方を展開する/, "(a+b)²=a²+2ab+b²を使い、中央の項の2を忘れないようにします。"],
      [/共通因数.+(?:見つける|くくる)/, "すべての項に共通する数と文字を探し、かっこの外へくくります。"]
    ];
    const labelHint = labelHints.find(([pattern]) => pattern.test(label));
    if (labelHint) return labelHint[1];
    const transformations = transformationList(step?.requiredTransformation);
    const hints = {
      expand: "かっこの各項を掛け合わせ、できた項を符号つきで並べます。",
      distribute: "かっこの外の項を、中のすべての項に1回ずつ掛けます。",
      "change-signs": "式を引くときは、後ろの式の各項の符号をすべて反対にします。",
      "combine-like-terms": "文字と指数が同じ項だけを集め、係数を計算します。",
      "factor-pair-check": "和がxの係数、積が定数項になる2数を両方の条件で確かめます。",
      factor: "共通因数や公式を確認し、積の形に直します。",
      "extract-square": "根号の中から、平方数になっている因数を探します。",
      rationalize: "分母の根号と同じ数を分子・分母に掛けます。",
      substitute: "公式の文字を、問題で与えられた値に1つずつ置き換えます。",
      evaluate: "演算の順序と符号を確認して、数値または最簡形まで計算します。",
      "prime-factorize": "素因数の指数が偶数になる条件を探します。"
    };
    return transformations.map((transformation) => hints[transformation]).find(Boolean)
      || "段階名を確認し、直前の式から変わる部分を1つずつ考えます。";
  }

  function jumpsToFinalAnswer(value, finalAnswers) {
    const candidate = normalize(value);
    const finals = (Array.isArray(finalAnswers) ? finalAnswers : [finalAnswers])
      .map(normalize)
      .filter(Boolean);
    if (!candidate || !finals.length) return false;
    const candidateStatementKey = canonicalStatement(candidate);
    const finalStatementKeys = new Set(finals.map(canonicalStatement).filter(Boolean));
    if (finals.includes(candidate) || (candidateStatementKey && finalStatementKeys.has(candidateStatementKey))) return true;
    if (candidate.includes(",")) return false;
    const finalExpressionKeys = new Set(finals.map((answer) => {
      const expression = parseExpression(answer);
      return expression ? canonicalNode(expression) : "";
    }).filter(Boolean));
    const statement = parseStatement(candidate);
    return Boolean(statement?.type === "equation" && statement.sides.some((side) => (
      finalExpressionKeys.has(canonicalNode(side))
    )));
  }

  global.MathWorkUtils = Object.freeze({
    normalize,
    tokenize,
    parseExpression,
    canonicalWork,
    expressionsEquivalent,
    operatorComplexity,
    workStepEquivalent,
    chunkExpression,
    buildQuickTokens,
    buildWorkStepChoices,
    workStepHint,
    jumpsToFinalAnswer
  });
})(typeof window !== "undefined" ? window : globalThis);
