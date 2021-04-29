#!/usr/bin/env node

/*
 * Slapfiliate is a utility that will fetch active balances from tapfilliate,
 * the member IDs associated, create a patch payout via paypal, and update the
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
const { applyPayFloor, injectSandBoxAffiliates } = require('./lib/utils');

(function settleBalances() {
  console.log('Preparing to settle tapfiliate balances...');
  getBalances()
    .then(applyPayFloor)
    .then(getPayoutMethods)
    .then(injectSandBoxAffiliates) // inject test accounts
    .then(postBatchPayout)
    .then(postPayments)
    .then((affiliates) => {
      affiliates.forEach((entry) => {
        console.log(entry);
      });
    })
    .catch((err) => {
      console.log(err);
    });
})();
