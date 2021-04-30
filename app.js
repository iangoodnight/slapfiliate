#!/usr/bin/env node

/*
 * Slapfiliate is a utility that will fetch active balances from tapfilliate,
 * the member IDs associated, create a batch payout via paypal, and update the
 * active balances back in tapfilliate.  As it is financial in nature, it should
 * also be logged somewhere/somehow.
 */

'use strict';

require('dotenv').config();

const {
  getBalances,
  getPayoutMethods,
  postPayments,
} = require('./lib/tapfiliate');
const { postBatchPayout } = require('./lib/paypal');
const {
  applyPayFloor,
  colorConsole: code,
  injectSandBoxAffiliates,
} = require('./lib/utils');

(function settleBalances() {
  const label = 'Time taken to settle tapfiliate balances';
  console.time(label);
  console.log(code.green, 'Preparing to settle tapfiliate balances...');
  getBalances()
    .then(applyPayFloor)
    .then(getPayoutMethods)
    .then(injectSandBoxAffiliates) // if not production, inject sandbox
    .then(postBatchPayout)
    .then(postPayments)
    .then((affiliates) => {
      affiliates.forEach((entry) => {
        console.log(entry);
      });
      console.timeEnd(label);
    })
    .catch((err) => {
      console.error(code.red, err);
      console.timeEnd(label);
    });
})();
