#!/usr/bin/env node

/*
 * Slapfilliate is a utility that will fetch active balances from tapfilliate,
 * the member IDs associated, create a patch payout via paypal, and update the
 * active balances back in tapfilliate.  As it is financial in nature, it should
 * also be logged somewhere/somehow.
 */

'use strict';

require('dotenv').config();

const tap = require('./lib/tapfiliate');
const payPal = require('./lib/paypal');

(async function settleBalances() {
  try {
    // const balances = await tap.getBalances();
    // // const methods = await tap.getPayoutMethods(balances);
    // const methods = [{
    // 	affiliate_id: 'iantest',
    // 	balance: 0.01,
    // 	email: 'blah@blah.com'
    // }];
    // // console.log(balances);
    // const paid = await tap.postPayments(methods);
    // console.log(paid);
  } catch (err) {
    // console.log(err);
  }
})();
