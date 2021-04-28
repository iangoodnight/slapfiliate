'use strict';

/*
 * Unit testing for utility functions
 */

const { buildBase64Auth } = require('./utils.js');

describe('Testing utility functions', () => {
  describe('Testing base64 auth', () => {
    const user = 'lameusername';
    const password = 'areallybadpassword';
    const encoded = buildBase64Auth(user, password);

    it('should correctly format paypal auth via Base 64 encoding', () => {
      const expected = 'Basic bGFtZXVzZXJuYW1lOmFyZWFsbHliYWRwYXNzd29yZA==';
      expect(encoded).toBe(expected);
    });
  });
});
