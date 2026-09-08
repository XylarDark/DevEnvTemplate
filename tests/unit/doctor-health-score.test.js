/**
 * Regression tests for the doctor's health scoring.
 *
 * These exist because the doctor previously round-tripped gaps through markdown and looked for
 * severity headings the gap analyzer never emitted. Every issue list came back empty and the
 * score was a constant 100/100 even on projects with critical gaps. The suite asserts the
 * property that failure violated: real gaps must lower the score.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert');

const {
  buildDoctorReport,
  calculateHealthScore,
  DEFAULT_HEALTH_SCORE_CONFIG
} = require('../../dist/scripts/doctor/cli');

/**
 * Build a gap with sensible defaults.
 *
 * @param {object} overrides Fields to override.
 * @returns {object} A Gap-shaped object.
 */
function makeGap(overrides = {}) {
  return {
    category: 'testing',
    severity: 'high',
    title: 'No JS Unit Tests Detected',
    description: 'Tests should cover components and utilities.',
    impact: 'Refactors may break behavior silently',
    recommendation: 'Add a test runner',
    effort: 'medium',
    files: ['package.json'],
    ...overrides
  };
}

/**
 * Wrap gaps in a GapReport envelope.
 *
 * @param {object[]} gaps Gaps to include.
 * @returns {object} A GapReport-shaped object.
 */
function makeGapReport(gaps) {
  return {
    timestamp: new Date().toISOString(),
    totalGaps: gaps.length,
    highPriority: gaps.filter(gap => gap.severity === 'high').length,
    mediumPriority: gaps.filter(gap => gap.severity === 'medium').length,
    lowPriority: gaps.filter(gap => gap.severity === 'low').length,
    gaps,
    categories: {}
  };
}

describe('Doctor health score', () => {
  describe('regression: gaps must lower the score', () => {
    it('should score a perfect 100 only when there are no gaps', () => {
      const report = buildDoctorReport(makeGapReport([]), DEFAULT_HEALTH_SCORE_CONFIG);

      assert.strictEqual(report.healthScore.overall, 100);
      assert.deepStrictEqual(report.critical, []);
      assert.deepStrictEqual(report.warnings, []);
    });

    it('should not report 100 when a critical gap exists', () => {
      const report = buildDoctorReport(
        makeGapReport([makeGap({ category: 'testing', severity: 'high' })]),
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.ok(
        report.healthScore.overall < 100,
        `expected a sub-100 score, got ${report.healthScore.overall}`
      );
      assert.strictEqual(report.critical.length, 1);
    });

    it('should classify every gap severity into the matching issue list', () => {
      const report = buildDoctorReport(
        makeGapReport([
          makeGap({ severity: 'high', category: 'testing', title: 'high gap' }),
          makeGap({ severity: 'medium', category: 'linting', title: 'medium gap' }),
          makeGap({ severity: 'low', category: 'architecture', title: 'low gap' })
        ]),
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.strictEqual(report.critical.length, 1, 'one high gap becomes one critical issue');
      assert.strictEqual(report.warnings.length, 1, 'one medium gap becomes one warning');
      assert.strictEqual(report.info.length, 1, 'one low gap becomes one info issue');
      assert.strictEqual(report.critical[0].message, 'high gap');
    });

    it('should reproduce the real 11-gap report as a sub-100 score', () => {
      // Mirrors the category/severity mix the analyzer produces for this repository, which the
      // broken parser scored as 100/100.
      const gaps = [
        makeGap({ category: 'testing', severity: 'high' }),
        makeGap({ category: 'environment', severity: 'high', effort: 'low' }),
        makeGap({ category: 'linting', severity: 'medium' }),
        makeGap({ category: 'security', severity: 'medium', effort: 'low' }),
        makeGap({ category: 'ci', severity: 'medium', effort: 'low' }),
        makeGap({ category: 'documentation', severity: 'medium', effort: 'low' }),
        makeGap({ category: 'dependencies', severity: 'medium', effort: 'low' }),
        makeGap({ category: 'dependencies', severity: 'medium', effort: 'low' }),
        makeGap({ category: 'architecture', severity: 'low', effort: 'low' }),
        makeGap({ category: 'quality', severity: 'low', effort: 'low' }),
        makeGap({ category: 'observability', severity: 'low' })
      ];

      const report = buildDoctorReport(makeGapReport(gaps), DEFAULT_HEALTH_SCORE_CONFIG);

      assert.ok(
        report.healthScore.overall < 100,
        `expected a sub-100 score, got ${report.healthScore.overall}`
      );
      assert.strictEqual(report.critical.length, 2, 'two high-severity gaps');
      assert.strictEqual(report.warnings.length, 6, 'six medium-severity gaps');
      assert.strictEqual(report.info.length, 3, 'three low-severity gaps');
    });
  });

  describe('dimension routing', () => {
    it('should penalize only the dimension a gap category maps to', () => {
      const score = calculateHealthScore(
        [makeGap({ category: 'testing', severity: 'high' })],
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.strictEqual(score.testing, 80, 'testing loses the high-severity penalty');
      assert.strictEqual(score.ci, 100, 'ci is untouched');
      assert.strictEqual(score.security, 100, 'security is untouched');
      assert.strictEqual(score.quality, 100, 'quality is untouched');
      assert.strictEqual(score.typeSafety, 100, 'type safety is untouched');
    });

    it('should not double-count a gap whose text mentions other dimensions', () => {
      // The old keyword matcher scanned the message too, so this gap hit several dimensions.
      const score = calculateHealthScore(
        [
          makeGap({
            category: 'security',
            severity: 'high',
            title: 'Secrets missing from eslint, tsconfig strict, and the CI workflow'
          })
        ],
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.strictEqual(score.security, 80, 'only the mapped dimension is penalized');
      assert.strictEqual(score.quality, 100, 'the word eslint must not penalize quality');
      assert.strictEqual(score.typeSafety, 100, 'the word strict must not penalize type safety');
      assert.strictEqual(score.ci, 100, 'the word workflow must not penalize ci');
    });

    it('should return a type safety score rather than dropping it', () => {
      const score = calculateHealthScore(
        [makeGap({ category: 'typescript', severity: 'high' })],
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.strictEqual(typeof score.typeSafety, 'number');
      assert.strictEqual(score.typeSafety, 80);
    });

    it('should surface gap categories missing from the scoring config', () => {
      const report = buildDoctorReport(
        makeGapReport([makeGap({ category: 'a-brand-new-category', severity: 'high' })]),
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.deepStrictEqual(report.unscoredCategories, ['a-brand-new-category']);
    });

    it('should floor a dimension at zero rather than going negative', () => {
      const manyGaps = Array.from({ length: 12 }, () =>
        makeGap({ category: 'testing', severity: 'high' })
      );

      const score = calculateHealthScore(manyGaps, DEFAULT_HEALTH_SCORE_CONFIG);

      assert.strictEqual(score.testing, 0);
      assert.ok(score.overall >= 0);
    });
  });

  describe('severity penalties', () => {
    it('should penalize a critical gap more than a warning', () => {
      const critical = calculateHealthScore(
        [makeGap({ category: 'testing', severity: 'high' })],
        DEFAULT_HEALTH_SCORE_CONFIG
      );
      const warning = calculateHealthScore(
        [makeGap({ category: 'testing', severity: 'medium' })],
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.ok(
        critical.testing < warning.testing,
        'a high-severity gap must cost more than a medium one'
      );
    });

    it('should honor configured penalties and weights', () => {
      const config = {
        penalties: { high: 50, medium: 25, low: 0 },
        weights: { testing: 1 },
        categoryMap: { testing: 'testing' }
      };

      const score = calculateHealthScore(
        [makeGap({ category: 'testing', severity: 'high' })],
        config
      );

      assert.strictEqual(score.testing, 50, 'uses the configured penalty');
      assert.strictEqual(score.overall, 50, 'a single weighted dimension drives overall');
    });
  });

  describe('quick wins', () => {
    it('should treat low-effort gaps as quick wins', () => {
      const report = buildDoctorReport(
        makeGapReport([
          makeGap({ title: 'cheap fix', effort: 'low' }),
          makeGap({ title: 'expensive fix', effort: 'high' })
        ]),
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.strictEqual(report.quickWins.length, 1);
      assert.strictEqual(report.quickWins[0].message, 'cheap fix');
    });

    it('should not promote a high-effort gap that mentions a quick-win keyword', () => {
      // The old keyword list matched on text, so this counted as a quick win.
      const report = buildDoctorReport(
        makeGapReport([
          makeGap({ title: 'Rewrite the eslint and prettier setup', effort: 'high' })
        ]),
        DEFAULT_HEALTH_SCORE_CONFIG
      );

      assert.deepStrictEqual(report.quickWins, []);
    });
  });
});
