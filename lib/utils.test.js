'use strict';

/*
 * Unit testing for utility functions
 */

const {
  applyPayFloor,
  buildBase64Auth,
  handleAxiosErrors,
  injectSandBoxAffiliates,
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

  describe('payfloor filter', () => {
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

  describe('base64 auth', () => {
    const user = 'lameusername';
    const password = 'areallybadpassword';
    const encoded = buildBase64Auth(user, password);

    it('should correctly format paypal auth via Base 64 encoding', () => {
      const expected = 'Basic bGFtZXVzZXJuYW1lOmFyZWFsbHliYWRwYXNzd29yZA==';
      expect(encoded).toBe(expected);
    });
  });

  describe('inject sandbox accounts', () => {
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

    it('should test using kyle’s paypal during staging', async () => {
      process.env.NODE_ENV = 'staging';
      const mockInput = await mockFlow();
      const [{ email }] = await injectSandBoxAffiliates(mockInput);
      expect(email).toBe('nofx39@gmail.com');
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

  describe('transform response', () => {
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
