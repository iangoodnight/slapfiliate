'use strict';

const utils = {
  // filters payees under a certain amount
  applyPayFloor: (affiliates = []) => {
    const { env } = process;
    // check for optional payout_floor env paramater
    if (env.PAYOUT_FLOOR === undefined) return affiliates;
    const floor = parseInt(env.PAYOUT_FLOOR);
    return Promise.resolve(
      affiliates.filter((affiliate) => affiliate.balance >= floor)
    );
  },
  // required for paypal authentication
  buildBase64Auth: (user, pass) => {
    const input = `${user}:${pass}`;
    const buffer = Buffer.from(input);
    const base64data = buffer.toString('base64');
    return `Basic ${base64data}`;
  },
  // coloring output messages just for fun
  colorConsole: {
    red: '\x1b[31m%s\x1b[0m',
    green: '\x1b[32m%s\x1b[0m',
    yellow: '\x1b[33m%s\x1b[0m',
  },
  // replace real accounts with sandbox accounts for testing
  injectSandBoxAffiliates: (affiliates) => {
    const {
      env: { NODE_ENV = 'development' },
    } = process;
    if (NODE_ENV === 'production') return Promise.resolve(affiliates);
    const sandbox = [
      {
        email: 'sb-3cgx45271592@personal.example.com',
        affiliate_id: 'iantest',
        balance: 100,
      },
      {
        email:
          NODE_ENV === 'staging'
            ? 'nofx39@gmail.com'
            : 'sb-ydzo51848415@personal.example.com',
        affiliate_id: 'kylewells2',
        balance: 1.02,
      },
    ];
    if (NODE_ENV === 'staging') return Promise.resolve(sandbox.slice(1));
    return Promise.resolve(sandbox);
  },
  // supress and summarize errors
  handleAxiosErrors: (error) => {
    if (error.response) {
      // returned with a status outside of 2xx
      const { status /*, data */ } = error.response;
      throw `Failed to fetch tapfiliate balances: status ${status}`;
    } else if (error.request) {
      // no response from tapfiliate
      throw 'Failed to fetch tapfiliate balances: no response';
    } else {
      throw 'Failed to fetch tapfiliate balances: bad request';
    }
  },
  // used to transform response of tapfiliate.getBalances()
  transformResponse: (response) => {
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
  // prioritize payouts if hitting batch payout limit
  prioritizePayments: (affiliates) => {
    const limit = process.env.PAYPAL_LIMIT || 15_000;
    if (affiliates.length <= limit) return Promise.resolve(affiliates);
    affiliates.sort((a, b) => {
      const { balance: aBalance } = a;
      const { balance: bBalance } = b;
      if (aBalance < bBalance) return 1;
      if (aBalance > bBalance) return -1;
      return 0;
    });
    const underLimit = affiliates.slice(0, 14_999);
    return Promise.resolve(underLimit);
  },
};

module.exports = utils;
