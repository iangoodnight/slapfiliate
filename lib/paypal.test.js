'use strict';

/*
 * Unit tests for the paypal module
 */

const axios = require('axios');
const { postBatchPayout } = require('./paypal.js');

jest.mock('axios');

describe('paypal calls', () => {
  describe('postBatchPayout', () => {
    const affiliates = [
      {
        affiliate_id: 'iantest',
        balance: 1,
        email: 'no@email.com',
      },
    ];
    const tokenResponse = {
      data: {
        access_token: '1up',
      },
    };
    const response = {
      data: {
        batch_header: {
          payout_batch_id: 'Payouts_2000',
          batch_status: 'PENDING',
        },
      },
    };
    const postedAffiliates = affiliates.map((affiliate) => {
      const {
        data: {
          batch_header: { payout_batch_id },
        },
      } = response;
      affiliate.batch_id = payout_batch_id;
      return affiliate;
    });
    axios.mockResolvedValue(response);
    axios.mockResolvedValueOnce(tokenResponse);
    console.log = jest.fn();
    it('should report batch id and status upon success', async () => {
      const result = await postBatchPayout(affiliates);
      expect(console.log).toHaveBeenCalledWith(
        'Batch Status: PENDING, ID: Payouts_2000'
      );
      expect(result).toEqual(postedAffiliates);
    });
    it('should report errors', async () => {
      axios.mockRejectedValueOnce('async error');
      try {
        await postBatchPayout(affiliates);
      } catch (error) {
        console.log(error);
        expect.assertions(1);
        expect(console.log).toHaveBeenCalledWith(
          'Error posting batch payouts: async error'
        );
      }
    });
  });
});
