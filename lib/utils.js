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
  // check for necessary ENV and bail if missing
  checkAndBail: () => {
    const { env } = process;
    if (env.NODE_ENV === undefined) {
      console.log('No environment set... setting NODE_ENV=development');
      process.env.NODE_ENV = 'development';
    }
    const { NODE_ENV } = env;
    const fail = (msg) => Promise.reject(msg);
    const und = (val) => val === undefined;
    // check generic settings
    const { PAYPAL_LIMIT, PAYOUT_FLOOR, TAP_BASE_URL, PAYPAL_HOST } = env;
    if (und(PAYPAL_LIMIT)) return fail('Please set paypal limit');
    if (und(PAYOUT_FLOOR)) return fail('Please set pay floor');
    if (und(TAP_BASE_URL)) return fail('Please set tapfiliate URL');
    if (und(PAYPAL_HOST)) return fail('Please set PayPal URL');
    if (NODE_ENV === 'production') {
      const { TAP_API_KEY, PAYPAL_ID, PAYPAL_SECRET } = env;
      if (und(TAP_API_KEY)) return fail('Please set tapfiliate API key');
      if (und(PAYPAL_ID)) return fail('Please set PayPal ID');
      if (und(PAYPAL_SECRET)) return fail('Please set PayPal Secret');
    }
    if (NODE_ENV === 'staging') {
      const { STAGING_EMAIL, STAGING_ID } = env;
      if (und(STAGING_EMAIL)) {
        return fail(
          'Please provide a real PayPal email to verify functionality'
        );
      }
      if (und(STAGING_ID)) {
        return fail(
          'Please provide a real Tapfiliate ID to verify functionality'
        );
      }
    }
    if (NODE_ENV === 'development') {
      const {
        PAYPAL_SANDBOX_HOST,
        PAYPAL_SANDBOX_ID,
        PAYPAL_SANDBOX_SECRET,
        SANDBOX_EMAIL1,
        /*SANDBOX_EMAIL2,*/
      } = env;
      if (und(PAYPAL_SANDBOX_HOST)) {
        return fail('Please provide the URL for PayPal sandbox API');
      }
      if (und(PAYPAL_SANDBOX_ID)) {
        return fail('Please provide PayPal sandbox ID');
      }
      if (und(PAYPAL_SANDBOX_SECRET)) {
        return fail('Please provide PayPal sandbox Secret');
      }
      if (und(SANDBOX_EMAIL1)) {
        return fail('At least one PayPal sandbox email required');
      }
    }
    return Promise.resolve();
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
  // replace real accounts with sandbox accounts for testing
  injectSandBoxAffiliates: (affiliates) => {
    const {
      env: {
        NODE_ENV = 'development',
        SANDBOX_EMAIL1,
        SANDBOX_EMAIL2,
        STAGING_EMAIL,
        STAGING_ID,
      },
    } = process;
    if (NODE_ENV === 'production') return Promise.resolve(affiliates);
    const sandbox = [
      {
        email: SANDBOX_EMAIL2 || 'fake@email.com',
        affiliate_id: 'iantest',
        balance: 100,
      },
      {
        email: NODE_ENV === 'staging' ? STAGING_EMAIL : SANDBOX_EMAIL1,
        affiliate_id: NODE_ENV === 'staging' ? STAGING_ID : 'kylewells2',
        balance: 1.02,
      },
    ];
    if (NODE_ENV === 'staging') return Promise.resolve(sandbox.slice(1));
    return Promise.resolve(sandbox);
  },
  // Check for mail setup
  isMail: () => {
    const { MAILGUN_DOMAIN, MAILGUN_API_KEY, TARGET_EMAIL } = process.env;
    if (
      MAILGUN_DOMAIN !== undefined &&
      MAILGUN_API_KEY !== undefined &&
      TARGET_EMAIL !== undefined
    ) {
      return true;
    }
    return false;
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
    const underLimit = affiliates.slice(0, 15_000);
    return Promise.resolve(underLimit);
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
};

module.exports = utils;
