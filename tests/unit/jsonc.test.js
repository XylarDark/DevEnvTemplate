const test = require('node:test');
const assert = require('node:assert');

const { stripJsonComments, parseJsonc } = require('../../dist/scripts/utils/jsonc');

test('parseJsonc reads plain JSON unchanged', () => {
  assert.deepStrictEqual(parseJsonc('{"a": 1}'), { a: 1 });
});

test('parseJsonc reads a tsconfig with line comments', () => {
  const tsconfig = `{
  "compilerOptions": {
    // ES2022 for Error cause support
    "target": "ES2022",
    "strict": true
  }
}`;

  assert.deepStrictEqual(parseJsonc(tsconfig), {
    compilerOptions: { target: 'ES2022', strict: true },
  });
});

test('parseJsonc reads block comments', () => {
  const input = `{
  /* multi
     line */
  "a": 1
}`;

  assert.deepStrictEqual(parseJsonc(input), { a: 1 });
});

test('parseJsonc tolerates trailing commas in objects and arrays', () => {
  assert.deepStrictEqual(parseJsonc('{"a": [1, 2,], "b": 3,}'), { a: [1, 2], b: 3 });
});

test('stripJsonComments preserves comment markers inside strings', () => {
  const input = '{"url": "https://example.com", "path": "a/*b*/c"}';

  assert.deepStrictEqual(JSON.parse(stripJsonComments(input)), {
    url: 'https://example.com',
    path: 'a/*b*/c',
  });
});

test('stripJsonComments preserves escaped quotes', () => {
  const input = '{"quote": "she said \\"hi\\"" /* trailing */}';

  assert.deepStrictEqual(JSON.parse(stripJsonComments(input)), { quote: 'she said "hi"' });
});

test('parseJsonc still throws on genuinely malformed input', () => {
  assert.throws(() => parseJsonc('{"a": }'), SyntaxError);
});
