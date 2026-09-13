const { assertValidTransition } = require('../src/services/documentStateMachine');

describe('document verification state machine', () => {
  test.each([['pending', 'approved'], ['pending', 'rejected'], ['approved', 'expired']])('allows %s -> %s', (from, to) => {
    expect(() => assertValidTransition(from, to)).not.toThrow();
  });

  test.each([['approved', 'rejected'], ['rejected', 'pending'], ['expired', 'approved'], ['pending', 'expired']])('rejects %s -> %s', (from, to) => {
    expect(() => assertValidTransition(from, to)).toThrow('Invalid document status transition');
  });
});
