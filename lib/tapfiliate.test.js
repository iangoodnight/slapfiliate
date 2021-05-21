'use strict';

/*
 * Unit tests for the tapfiliate module
 */

const axios = require('axios');
const {
  getBalances,
  getPayoutMethods,
  postPayments,
  TapfiliateCall,
} = require('./tapfiliate.js');

jest.mock('axios');
axios.create.mockImplementation(() => axios);

describe('tapfiliate calls', () => {
  describe('getBalances', () => {
    const response = [
      {
        affiliate_id: 'iantest',
        balances: {
          USD: 1,
        },
      },
    ];
    axios.get.mockResolvedValue(response);

    it('should return balances', async () => {
      const result = await getBalances();
      expect(result).toEqual([
        {
          affiliate_id: 'iantest',
          balances: {
            USD: 1,
          },
        },
      ]);
    });
  });

  describe('getPayoutMethods', () => {
    it('should add paypal emails to affiliate list', async () => {
      const affiliates = [
        {
          affiliate_id: 'iantest',
          balance: 1,
        },
      ];
      const response = {
        config: {
          url: '/affiliates/iantest/payout_methods',
        },
        data: [
          {
            title: 'Paypal',
            id: 'paypal',
            details: {
              paypal_address: 'no@email.com',
            },
            primary: true,
          },
        ],
      };
      axios.get.mockResolvedValue(response);
      const result = await getPayoutMethods(affiliates);
      expect(result).toEqual([
        {
          affiliate_id: 'iantest',
          balance: 1,
          email: 'no@email.com',
        },
      ]);
    });

    it('should return an empty array if there is no input', async () => {
      const affiliates = [];
      const result = await getPayoutMethods(affiliates);
      expect(result).toEqual([]);
    });
  });
  // Testing postPayment function
  describe('postPayments', () => {
    it('should post payments to axios', async () => {
      const affiliates = [
        {
          affiliate_id: 'iantest',
          balance: 1,
          email: 'no@email.com',
          batch_id: 'FOO',
        },
      ];
      const response = {
        data: [
          {
            id: 'hellisfortheinteresting',
            created_at: '2000-12-31',
            affiliate: { id: 'iantest' },
            amount: 1,
          },
        ],
      };
      axios.post.mockResolvedValue(response);
      const result = await postPayments(affiliates);
      expect(result).toEqual(['2000-12-31 : iantest paid 1 (FOO)']);
    });

    it('should pass and wrap message if no affiliates', async () => {
      const testString = 'foo';
      const response = await postPayments(testString);
      expect(response).toEqual(['foo']);
    });

    it('should report failures', async () => {
      const affiliates = [
        {
          affiliate_id: 'iantest',
          balance: 1,
          email: 'no@email.com',
          batch_id: 'FOO',
        },
      ];
      const response = {
        data: [
          {
            error: 'Bad post',
          },
        ],
      };
      axios.post.mockRejectedValue(response);
      const result = await postPayments(affiliates);
      expect(result).toEqual(['Failed to post payment']);
    });

    it('should default to an empty batch id', async () => {
      const affiliates = [
        {
          affiliate_id: 'belial',
          balance: 1,
          email: 'no@email.com',
        },
      ];
      const response = {
        data: [
          {
            id: 'garbo',
            created_at: '2000-12-31',
            affiliate: { id: 'belial' },
            amount: 1,
          },
        ],
      };
      axios.post.mockResolvedValue(response);
      const result = await postPayments(affiliates);
      expect(result).toEqual(['2000-12-31 : belial paid 1 ()']);
    });
  });

  describe('TapfiliateCall', () => {
    const control = new TapfiliateCall();
    const test = TapfiliateCall();

    it('should function as a constructor', () => {
      expect(control).toBe(test);
    });

    it('should fall back to sensible defaults', () => {
      axios.create = (config) => config;
      delete process.env.TAP_BASE_URL;
      const defaults = TapfiliateCall();
      expect(defaults.baseURL).toBe('https://api.tapfiliate.com/1.6');
    });
  });
});
