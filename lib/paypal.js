'use strict';

/*
 * Collected payPal API calls, stripped down to the minimum required args
 */

const axios = require('axios');
const qs = require('qs');
const { buildBase64Auth } = require('./utils.js');

const payPal = (function () {
  const Config = function (environment = process.env.NODE_ENV) {
    if (!new.target) return new Config(environment);
    const { env } = process;

    this.host =
      environment === 'production' ? env.PAYPAL_HOST : env.PAYPAL_SANDBOX_HOST;
    this.id =
      environment === 'production' ? env.PAYPAL_ID : env.PAYPAL_SANDBOX_ID;
    this.secret =
      environment === 'production'
        ? env.PAYPAL_SECRET
        : env.PAYPAL_SANDBOX_SECRET;
  };

  async function fetchPayPalToken(payPalConfig) {
    const { id, secret, host } = payPalConfig;
    const authorization = buildBase64Auth(id, secret);
    const data = qs.stringify({
      grant_type: 'client_credentials',
    });
    const axiosConfig = {
      headers: {
        'Accept-Language': 'en_US',
        Authorization: authorization,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST',
      url: host + '/v1/oauth2/token',
      data: data,
    };
    const response = await axios(axiosConfig);
    const { access_token: token } = response.data;
    return token;
  }

  function BatchPayoutHeader(key = Date.now()) {
    if (!new.target) {
      return new BatchPayoutHeader(key);
    }
    this.sender_batch_id = `Payouts_${key}`;
    this.email_subject = 'You have a payout!';
    this.email_message = 'You have a payout! Thanks for using our service!';
    this.recipient_type = 'EMAIL';
  }

  function formatPayoutItem({ email, balance = 0 } = {}, index = 0) {
    const value = balance.toFixed(2);
    const amount = {
      currency: 'USD',
      value,
    };
    const note = 'Thank you for your support';
    const entropy = index.toString().padStart(4, 0);
    const sender_item_id = `${Date.now()}${entropy}`;
    return {
      sender_item_id,
      receiver: email,
      amount,
      note,
    };
  }

  async function postBatchPayout(affiliates) {
    const sender_batch_header = new BatchPayoutHeader();
    const items = affiliates.map(formatPayoutItem);
    const payPalConfig = new Config();
    const authorization = await fetchPayPalToken(payPalConfig);
    const { host } = payPalConfig;
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorization}`,
    };
    const method = 'POST';
    const url = host + '/v1/payments/payouts';
    const data = {
      sender_batch_header,
      items,
    };
    const axiosConfig = {
      method,
      url,
      headers,
      data,
    };
    try {
      const response = await axios(axiosConfig);
      const {
        data: {
          batch_header: { payout_batch_id, batch_status },
        },
      } = response;
      // const payPalResponse = { payout_batch_id, batch_status };
      console.log(`Batch Status: ${batch_status}, ID: ${payout_batch_id}`);
      return Promise.resolve(affiliates);
    } catch (err) {
      console.log(err);
    }
  }

  return { postBatchPayout };
})();

module.exports = payPal;
