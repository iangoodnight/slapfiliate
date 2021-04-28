'use strict';

/*
 * Unit tests for the tapfiliate module
 */

const tap = require('./tapfiliate.js');
const axios = require('axios');

describe('tapfiliate', () => {
  describe('getBalances', () => {
    let response;
    beforeAll(async () => {
      jest.clearAllMocks();
      axios.get.mockResolvedValue({
        status: 200,
        data: [
          {
            affiliate_id: 'testian',
            balances: {
              USD: 1,
            },
          },
          {
            affiliate_id: 'baphomet',
            balances: {
              USD: 6.66,
            },
          },
        ],
      });
      const result = await tap.getBalances();
      const formatResult = (result) => {
        const { status, data } = result;
        if (status === 200) {
          return data.map((affiliate) => {
            const {
              affiliate_id,
              balances: { USD: balance } = { USD: '' },
            } = affiliate;
            return { affiliate_id, balance };
          });
        }
      };
      response = formatResult(result);
    });

    it('should transform the response', () => {
      expect(response).toEqual([
        {
          affiliate_id: 'testian',
          balance: 1,
        },
        {
          affiliate_id: 'baphomet',
          balance: 6.66,
        },
      ]);
    });
  });
});
