/**
 * Core skills in `.agents/skills/` are copied verbatim into host projects by default, so anything a
 * skill says about *this* repository becomes a false statement about theirs.
 *
 * This was found in the wild: a consuming project's copies of these skills instructed agents to
 * run `npm run check:doc-links`, `npm run lint` and `node --test`, none of which exist there —
 * that project deliberately has no linter and uses a different test runner. Nothing failed
 * loudly; agents simply ran commands that were not there, and filed documents against a docs
 * inventory that was not theirs.
 *
 * The rule this enforces: repo-local commands are allowed, but only after a "Localize on copy"
 * callout that tells the host what to replace. The trigger `description` must stay portable
 * outright, because it is read on every turn by agents that have not opened the file.
 *
 * Mutation-tested on 2026-09-08: removing the callout from a skill that names `npm run lint`
 * fails the first check, and appending that command to a `description` fails the second. Both
 * were restored. A guard test that has never been seen to fail is decoration.
 */

const { describe, test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const SKILLS_ROOT = path.join(__dirname, '..', '..', '.agents', 'skills');

/** The callout that marks a section as describing this repository rather than the practice. */
const LOCALIZE_MARKER = 'Localize on copy';

/**
 * Commands that only mean something in a repository that defined them. Plain `git` and shell
 * builtins are deliberately absent: those are portable, and a skill may use them freely.
 */
const REPO_LOCAL_COMMAND = /npm run [\w:-]+|npm test|node --test|npx tsc|yarn |pnpm /;

function readSkills() {
  return fs
    .readdirSync(SKILLS_ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => ({
      name: entry.name,
      path: path.join(SKILLS_ROOT, entry.name, 'SKILL.md'),
    }))
    .filter(skill => fs.existsSync(skill.path))
    .map(skill => ({
      ...skill,
      // Normalize line endings before any offset comparison: core.autocrlf delivers CRLF on a
      // Windows checkout, and an index computed against the wrong bytes is silently wrong.
      text: fs.readFileSync(skill.path, 'utf8').replace(/\r\n/g, '\n'),
    }));
}

/** The `description:` line of the frontmatter, which is what an agent sees before opening it. */
function frontmatterDescription(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return null;
  }

  const description = match[1].match(/^description:\s*(.+)$/m);
  return description ? description[1] : null;
}

describe('skill portability', () => {
  const skills = readSkills();

  test('inspects a plausible number of skills', () => {
    // An empty or mis-rooted scan would let every assertion below pass by examining nothing.
    assert.ok(
      skills.length >= 6,
      `expected to find the shipped core skills under .agents/skills, found ${skills.length}`
    );
  });

  test('finds skills that actually name repo-local commands', () => {
    // If this fails, the pattern above stopped matching and the suite went quietly vacuous.
    const withCommands = skills.filter(skill => REPO_LOCAL_COMMAND.test(skill.text));

    assert.ok(
      withCommands.length > 0,
      'no skill matched REPO_LOCAL_COMMAND, so the checks below prove nothing'
    );
  });

  for (const skill of skills) {
    describe(skill.name, () => {
      test('keeps repo-local commands behind a localize callout', () => {
        const command = skill.text.match(REPO_LOCAL_COMMAND);
        if (!command) {
          return;
        }

        const markerIndex = skill.text.indexOf(LOCALIZE_MARKER);

        assert.ok(
          markerIndex !== -1,
          `${skill.name} names "${command[0]}" but has no "${LOCALIZE_MARKER}" callout. A host that copies this skill is not told the command is ours.`
        );

        assert.ok(
          markerIndex < command.index,
          `${skill.name} names "${command[0]}" at ${command.index}, before its "${LOCALIZE_MARKER}" callout at ${markerIndex}. A reader meets the command before the warning.`
        );
      });

      test('has a description that names no repo-local command', () => {
        const description = frontmatterDescription(skill.text);

        assert.ok(description, `${skill.name} has no description in its frontmatter`);

        const command = description.match(REPO_LOCAL_COMMAND);
        assert.strictEqual(
          command,
          null,
          `${skill.name} names "${command?.[0]}" in its description. Descriptions are read without opening the file, so they cannot carry a callout and must stay portable.`
        );
      });
    });
  }
});
