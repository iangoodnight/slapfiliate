'use strict';

/*
 * Collected tapfilliate API calls, stripped down to the minimum required args
 */

const axios = require('axios');

const tapfiliate = (function () {
  const api = axios.create({
    baseURL: process.env.TAP_BASE_URL || 'https://api.tapfiliate.com/1.6',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Api-Key': process.env.TAP_API_KEY,
    },
  });

  function getBalances() {
    api.interceptors.response.use(
      (response) => {
        const { status, data } = response;
        if (status === 200) {
          return data.map((affiliate) => {
            const {
              affiliate_id,
              balances: { USD: balance } = { USD: '' },
            } = affiliate;
            return { affiliate_id, balance };
          });
        }
      },
      (error) => {
        console.log(error);
        const {
          response: { status },
        } = error;
        throw new Error(`Failed to fetch tapfiliate balances: ${status}`);
      }
    );
    return api.get('/balances/');
  }

  function buildPayoutPromise(id) {
    return new Promise((resolve /*reject*/) => {
      const url = `/affiliates/${id}/payout-methods/`;
      resolve(api.get(url));
    });
  }

  function getPayoutMethods(ids) {
    const promises = ids.map((id) => buildPayoutPromise(id));
    return Promise.allSettled(promises)
      .then((methods) => methods)
      .catch((err) => console.log(err));
  }

  return {
    getBalances,
    getPayoutMethods,
  };
})();

module.exports = tapfiliate;
