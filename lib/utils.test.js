'use strict';

/*
 * Unit testing for utility functions
 */

const {
  applyPayFloor,
  buildBase64Auth,
  checkAndBail,
  handleAxiosErrors,
  injectSandBoxAffiliates,
  isMail,
  prioritizePayments,
  transformResponse,
} = require('./utils.js');

describe('utility functions', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });
  // Tests for applyPayFloor function
  describe('applyPayFloor', () => {
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

    it('should return all affiliates with no payfloor set', async () => {
      delete process.env.PAYOUT_FLOOR;
      const result = await applyPayFloor(testAffiliates);
      expect(result).toEqual(testAffiliates);
    });
  });
  // Tests for buildBase64Auth function
  describe('buildBase64Auth', () => {
    const user = 'lameusername';
    const password = 'areallybadpassword';
    const encoded = buildBase64Auth(user, password);

    it('should correctly format paypal auth via Base 64 encoding', () => {
      const expected = 'Basic bGFtZXVzZXJuYW1lOmFyZWFsbHliYWRwYXNzd29yZA==';
      expect(encoded).toBe(expected);
    });
  });
  // Tests for checkAndBail function
  describe('checkAndBail', () => {
    it('should set the NODE_ENV to "production" when not set', async () => {
      console.log = jest.fn();
      delete process.env.NODE_ENV;
      try {
        await checkAndBail();
      } catch (e) {
        console.log(e);
      }
      expect(process.env.NODE_ENV).toBe('development');
    });

    it('should throw if no PAYPAL_LIMIT is set', async () => {
      delete process.env.PAYPAL_LIMIT;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please set paypal limit');
      }
    });

    it('should throw if no PAYOUT_FLOOR is set', async () => {
      delete process.env.PAYOUT_FLOOR;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please set pay floor');
      }
    });

    it('should throw if no TAP_BASE_URL is set', async () => {
      delete process.env.TAP_BASE_URL;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please set tapfiliate URL');
      }
    });

    it('should throw if no PAYPAL_HOST is set', async () => {
      delete process.env.PAYPAL_HOST;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please set PayPal URL');
      }
    });

    it('should throw if no TAP_API_KEY is set in production', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.TAP_API_KEY;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please set tapfiliate API key');
      }
    });

    it('should throw if no PAYPAL_ID is set in production', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.PAYPAL_ID;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please set PayPal ID');
      }
    });

    it('should throw if no PAYPAL_SECRET is set in production', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.PAYPAL_SECRET;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please set PayPal Secret');
      }
    });

    it('should throw if no STAGING_EMAIL is set in staging', async () => {
      process.env.NODE_ENV = 'staging';
      delete process.env.STAGING_EMAIL;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe(
          'Please provide a real PayPal email to verify functionality'
        );
      }
    });

    it('should throw if no STAGING_ID is set in staging', async () => {
      process.env.NODE_ENV = 'staging';
      delete process.env.STAGING_ID;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe(
          'Please provide a real Tapfiliate ID to verify functionality'
        );
      }
    });

    it('should throw if no PAYPAL_SANDBOX_HOST is set in dev', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.PAYPAL_SANDBOX_HOST;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please provide the URL for PayPal sandbox API');
      }
    });

    it('should throw if no PAYPAL_SANDBOX_ID is set in dev', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.PAYPAL_SANDBOX_ID;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please provide PayPal sandbox ID');
      }
    });

    it('should throw if no PAYPAL_SANDBOX_SECRET is set in dev', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.PAYPAL_SANDBOX_SECRET;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('Please provide PayPal sandbox Secret');
      }
    });

    it('should throw if no SANDBOX_EMAIL is set in dev', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.SANDBOX_EMAIL1;
      try {
        await checkAndBail();
      } catch (e) {
        expect.assertions(1);
        expect(e).toBe('At least one PayPal sandbox email required');
      }
    });

    it('should resolve if all ENV variables are set', async () => {
      let test = false;
      console.log = jest.fn();
      try {
        await checkAndBail();
        test = true;
      } catch (e) {
        console.log(e);
      }
      expect(test).toBe(true);
    });
  });
  // Tests for handleAxiosErrors function
  describe('handleAxiosErrors', () => {
    it('should display status codes for errors > 299', () => {
      try {
        throw {
          response: {
            status: 404,
          },
        };
      } catch (e) {
        expect.assertions(1);
        try {
          handleAxiosErrors(e);
        } catch (error) {
          expect(error).toBe('Failed to fetch tapfiliate balances: status 404');
        }
      }
    });

    it('should indicate if theree is no response from tapfiliate', () => {
      try {
        throw {
          request: {},
        };
      } catch (e) {
        expect.assertions(1);
        try {
          handleAxiosErrors(e);
        } catch (error) {
          expect(error).toBe(
            'Failed to fetch tapfiliate balances: no response'
          );
        }
      }
    });

    it('should classify all other errors as a bad request', () => {
      try {
        throw 'ERROR';
      } catch (e) {
        expect.assertions(1);
        try {
          handleAxiosErrors(e);
        } catch (error) {
          expect(error).toBe(
            'Failed to fetch tapfiliate balances: bad request'
          );
        }
      }
    });
  });
  // Tests for injectSandBoxAffiliates function
  describe('injectSandBoxAffiliates', () => {
    const mockFlow = () => {
      return Promise.resolve([
        {
          affiliate_id: 'diablo',
          balance: '1000',
          email: 'some@realemail.com',
        },
      ]);
    };

    it('should pass through affiliates when in production', async () => {
      process.env.NODE_ENV = 'production';
      const expected = await mockFlow();
      const received = await injectSandBoxAffiliates(expected);
      expect(received).toEqual(expected);
    });

    it('should fall back to a nonsense email with no sandbox set', async () => {
      delete process.env.SANDBOX_EMAIL2;
      const sandBox = await injectSandBoxAffiliates();
      const [test] = sandBox;
      expect(test.email).toBe('fake@email.com');
    });

    it('should test using STAGING paypal during staging', async () => {
      process.env.NODE_ENV = 'staging';
      const mockInput = await mockFlow();
      const [{ email }] = await injectSandBoxAffiliates(mockInput);
      expect(email).toBe(process.env.STAGING_EMAIL);
    });

    it('should ignore input and inject sandbox in testing', async () => {
      const fakeInput = await mockFlow();
      const output = await injectSandBoxAffiliates(fakeInput);
      expect(output).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            email: expect.stringMatching(/@personal\.example\.com/),
          }),
        ])
      );
    });
  });
  // Tests for isMail function
  describe('isMail', () => {
    it('should pass if mailgun env is set', () => {
      process.env.MAILGUN_DOMAIN = 1;
      process.env.MAILGUN_API_KEY = 1;
      process.env.TARGET_EMAIL = 1;
      const test = isMail();
      expect(test).toBe(true);
    });

    it('should fail if MAILGUN_DOMAIN env is not set', () => {
      delete process.env.MAILGUN_DOMAIN;
      process.env.MAILGUN_API_KEY = 1;
      process.env.TARGET_EMAIL = 1;
      const test = isMail();
      expect(test).toBe(false);
    });

    it('should fail if MAILGUN_API_KEY env is not set', () => {
      delete process.env.MAILGUN_API_KEY;
      process.env.MAILGUN_DOMAIN = 1;
      process.env.TARGET_EMAIL = 1;
      const test = isMail();
      expect(test).toBe(false);
    });

    it('should fail if TARGET_EMAIL env is not set', () => {
      delete process.env.TARGET_EMAIL;
      process.env.MAILGUN_DOMAIN = 1;
      process.env.MAILGUN_API_KEY = 1;
      const test = isMail();
      expect(test).toBe(false);
    });
  });
  // Tests for prioritizePayments function
  describe('prioritizePayments', () => {
    it('should return affiliates unaltered if under limit', async () => {
      const affiliates = [
        {
          affiliate_id: 'baal',
          balance: 66.6,
          email: 'no@realemail.com',
        },
        {
          affiliate_id: 'belial',
          balance: 6.66,
          email: 'hell@o.com',
        },
      ];
      const result = await prioritizePayments(affiliates);
      expect(result).toBe(affiliates);
    });

    it('should trim the list to the limit, ordering it by amount', async () => {
      process.env.PAYPAL_LIMIT = 2;
      const affiliates = [
        {
          affiliate_id: 'azmodan',
          balance: 666,
          email: 'aol@hotmail.com',
        },
        {
          affiliate_id: 'mathael',
          balance: 6_666,
          email: 'heave@toofaraway.com',
        },
        {
          affiliate_id: 'judas',
          balance: 6.66,
          email: 'trump@parler.com',
        },
      ];
      const result = await prioritizePayments(affiliates);
      expect(result[0].affiliate_id).toBe('mathael');
    });

    it('should default to a limit of 15_000', async () => {
      delete process.env.PAYPAL_LIMIT;
      const affiliates = [
        {
          affiliate_id: 'azmodan',
          balance: 1,
          email: 'aol@hotmail.com',
        },
      ];
      const inject = {
        affiliate_id: 'mathael',
        balance: 2,
        email: 'heaven@toofaraway.com',
      };
      while (affiliates.length < 15_002) {
        affiliates.push(inject);
      }
      const result = await prioritizePayments(affiliates);
      expect(result.length).toBe(15_000);
    });

    it('should not sort equal balances', async () => {
      process.env.PAYPAL_LIMIT = 2;
      const affiliates = [
        {
          affiliate_id: 'azmodan',
          balance: 1,
          email: 'aol@hotmail.com',
        },
        {
          affiliate_id: 'mathael',
          balance: 1,
          email: 'heave@toofaraway.com',
        },
        {
          affiliate_id: 'judas',
          balance: 6.66,
          email: 'trump@parler.com',
        },
      ];
      const result = await prioritizePayments(affiliates);
      expect(result[1].affiliate_id).toBe('azmodan');
    });
  });
  // Tests for transformResponse function
  describe('transformResponse', () => {
    const mockResponse = {
      status: 200,
      data: [
        {
          affiliate_id: 'dante',
          balances: {
            USD: 19.99,
            GIL: 2,
          },
          foo: 'bar',
          baz: ['bizz', 'fuzz'],
        },
      ],
    };
    it('should transfrom tapfiliate response', () => {
      Promise.resolve(mockResponse)
        .then(transformResponse)
        .then((transformed) => {
          expect(transformed).toEqual([
            {
              affiliate_id: 'dante',
              balance: 19.99,
            },
          ]);
        });
    });
  });
});
