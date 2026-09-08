/**
 * Tolerant parsing for JSON-with-comments config files.
 *
 * `tsconfig.json`, `jsconfig.json`, `.eslintrc.json` and several other tool configs are JSONC:
 * comments and trailing commas are legal and widely used. A scanner that runs `JSON.parse` on
 * them reports healthy projects as having malformed config, so config reads go through here.
 */

/**
 * Removes `//` and block comments and trailing commas from a JSONC document.
 *
 * Comment markers inside string literals are preserved, which is what makes this safe for
 * values like URLs (`"https://example.com"`).
 */
export function stripJsonComments(input: string): string {
  let result = '';
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const next = input[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        result += char;
      }
      continue;
    }

    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (inString) {
      // A backslash escapes the next character, so copy both and skip ahead. Without this a
      // trailing `\"` would be read as the end of the string.
      if (char === '\\') {
        result += char + (next ?? '');
        i++;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      result += char;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === '/' && next === '/') {
      inLineComment = true;
      i++;
      continue;
    }

    if (char === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    result += char;
  }

  return stripTrailingCommas(result);
}

/** Removes commas that directly precede a closing `}` or `]`. */
function stripTrailingCommas(input: string): string {
  let result = '';
  let inString = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (inString) {
      if (char === '\\') {
        result += char + (input[i + 1] ?? '');
        i++;
        continue;
      }
      if (char === '"') {
        inString = false;
      }
      result += char;
      continue;
    }

    if (char === '"') {
      inString = true;
      result += char;
      continue;
    }

    if (char === ',') {
      // Look past whitespace for a closer; if found, the comma is trailing.
      let j = i + 1;
      while (j < input.length && /\s/.test(input[j])) j++;
      if (input[j] === '}' || input[j] === ']') {
        continue;
      }
    }

    result += char;
  }

  return result;
}

/** Parses a JSONC document, falling back to tolerant parsing only if strict parsing fails. */
export function parseJsonc<T = unknown>(content: string): T {
  try {
    return JSON.parse(content) as T;
  } catch {
    return JSON.parse(stripJsonComments(content)) as T;
  }
}
