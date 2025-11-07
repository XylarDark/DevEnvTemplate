const { describe, test } = require('node:test');
const assert = require('node:assert');
const { ProgressBar, ProgressTracker } = require('../../dist/utils/progress');

describe('Progress Utilities', () => {
  test('ProgressBar calculates percentage correctly', { timeout: 5000 }, () => {
    const bar = new ProgressBar({ total: 100, label: 'Test' });
    bar.update(50);
    const snapshot = bar.getSnapshot();
    assert.strictEqual(snapshot.percentage, 50);
  });

  test('ProgressTracker creates bars based on verbosity', { timeout: 5000 }, () => {
    const tracker = new ProgressTracker('simple', false);
    const bar1 = tracker.createBar('overall', { total: 10, label: 'Overall' });
    const bar2 = tracker.createBar('detail', { total: 5, label: 'Detail' });
    
    assert.ok(bar1, 'Should create overall bar in simple mode');
    assert.strictEqual(bar2, null, 'Should not create detail bar in simple mode');
  });

  test('ProgressTracker silent mode creates no bars', { timeout: 5000 }, () => {
    const tracker = new ProgressTracker('silent', false);
    const bar = tracker.createBar('test', { total: 10, label: 'Test' });
    assert.strictEqual(bar, null, 'Silent mode should not create bars');
  });
});

