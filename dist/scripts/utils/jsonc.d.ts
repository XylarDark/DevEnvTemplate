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
export declare function stripJsonComments(input: string): string;
/** Parses a JSONC document, falling back to tolerant parsing only if strict parsing fails. */
export declare function parseJsonc<T = unknown>(content: string): T;
//# sourceMappingURL=jsonc.d.ts.map