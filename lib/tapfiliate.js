'use strict';

/*
 * Collected tapfilliate API calls, stripped down to the minimum required args
 */

const axios = require('axios');

const tapfiliate = (function () {
  const config = {
    baseURL: process.env.TAP_BASE_URL || 'https://api.tapfiliate.com/1.6',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Api-Key': process.env.TAP_API_KEY,
    },
  };

  function getBalances() {
    const api = axios.create(config);

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
        const {
          response: { status },
        } = error;
        throw new Error(`Failed to fetch tapfiliate balances: ${status}`);
      }
    );
    return api.get('/balances/');
  }

  async function getPayoutMethods(affiliates) {
    const promises = buildPayoutPromises(affiliates);
    const methods = await Promise.all(promises);
    return methods.reduce((filtered, raw) => {
      const { data } = raw;
      const [, , id] = raw.config.url.split('/');
      if (data.length !== 0) {
        const {
          details: { paypal_address: email },
        } = data.find((payoutMethod) => payoutMethod.primary === true);
        const { affiliate_id, balance } = affiliates.find(
          (affiliate) => affiliate.affiliate_id === id
        );
        filtered.push({ affiliate_id, balance, email });
      }
      return filtered;
    }, []);
  }

  async function postPayments(affiliates) {
    const promises = buildPaymentPromises(affiliates);
    const paid = await Promise.allSettled(promises);
    return paid.map((entry) => {
      const { status } = entry;
      if (status === 'fulfilled') {
        const {
          value: { data },
        } = entry;
        const [response] = data;
        const {
          created_at,
          affiliate: { id },
          amount,
        } = response;
        return `${created_at} : ${id} paid ${amount}`;
      }
      return 'Failed to post payment';
    });
  }

  function buildPayoutPromises(affiliates = []) {
    const api = axios.create(config);
    return affiliates.map((affiliate) => {
      const { affiliate_id: id } = affiliate;
      const url = `/affiliates/${id}/payout-methods/`;
      return api.get(url);
    });
  }

  function buildPaymentPromises(affiliates = []) {
    const api = axios.create(config);
    const url = '/payments/';
    return affiliates.map((affiliate) => {
      const { affiliate_id, balance: amount, currency = 'USD' } = affiliate;
      const data = { affiliate_id, amount, currency };
      return api.post(url, data);
    });
  }

  return {
    getBalances,
    getPayoutMethods,
    postPayments,
  };
})();

module.exports = tapfiliate;
