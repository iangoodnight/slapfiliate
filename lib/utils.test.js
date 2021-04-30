'use strict';

/*
 * Unit testing for utility functions
 */

const { buildBase64Auth, applyPayFloor } = require('./utils.js');

describe('Testing utility functions', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  describe('Testing base64 auth', () => {
    const user = 'lameusername';
    const password = 'areallybadpassword';
    const encoded = buildBase64Auth(user, password);

    it('should correctly format paypal auth via Base 64 encoding', () => {
      const expected = 'Basic bGFtZXVzZXJuYW1lOmFyZWFsbHliYWRwYXNzd29yZA==';
      expect(encoded).toBe(expected);
    });
  });
  describe('Testing payfloor filter', () => {
    const testAffiliates = [
      {
        affiliate_id: 'baphomet',
        balance: 6.66,
      },
      {
        affiliate_id: 'mephisto',
        balance: 66.6,
        email: 'mephisto@aol.com',
      },
      {
        affiliate_id: 'michael',
        balance: 1,
        email: 'michael@outlook.com',
      },
    ];
    process.env.PAYOUT_FLOOR = 2;

    it('should filter out affiliates below payfloor', async () => {
      const expected = [
        {
          affiliate_id: 'baphomet',
          balance: 6.66,
        },
        {
          affiliate_id: 'mephisto',
          balance: 66.6,
          email: 'mephisto@aol.com',
        },
      ];
      const result = await applyPayFloor(testAffiliates);
      expect(result).toEqual(expected);
    });
  });
});
