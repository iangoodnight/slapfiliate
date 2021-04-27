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

(async function settleBalances() {
  try {
    const balances = await tap.getBalances()
    const ids = balances.map(entry => entry.affiliate_id );
    const methods = await tap.getPayoutMethods(ids);
    console.log(methods);
    console.log(balances);
  } catch (err) {
    console.log(err);
  }
})();

