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
  mail: { Message, mg },
  paypal: { postBatchPayout },
  tapfiliate: { getBalances, getPayoutMethods, postPayments },
  utils: {
    applyPayFloor,
    checkAndBail,
    colorConsole: code,
    injectSandBoxAffiliates,
    isMail,
    prioritizePayments,
  },
} = require('./lib');

// (function settleBalances() {
//   const label = 'Time taken to settle tapfiliate balances';
//   const results = [];
//   let date = Date();
//   let start = 'Preparing to settle tapfiliate balances...';
//   results.push(date, start);
//   console.time(label);
//   console.log(date);
//   console.log(code.green, start);
//   checkAndBail() // check for required environment variables
//     .then(getBalances) // fetch affiliate balances
//     .then(applyPayFloor) // if pay floor is set, filter out balances below floor
//     .then(getPayoutMethods) // fetch payout methods for affiliates
//     .then(injectSandBoxAffiliates) // if not production, inject sandbox
//     .then(prioritizePayments) // catch just in case the batch size is too large
//     .then(postBatchPayout) // post payouts to paypal
//     .then(postPayments) // adjust balances on tapfiliate
//     .then((affiliates) => {
//       // cleanup and logging
//       affiliates.forEach((entry) => {
//         results.push(entry);
//         console.log(code.yellow, entry);
//       });
//       results.push('PAYMENT SUCCESSFUL');
//       if (isMail()) {
//         const resultMessage = results.join('\n');
//         const message = new Message(resultMessage);
//         mg.messages
//           .create(process.env.MAILGUN_DOMAIN, message)
//           .catch((error) => console.log(error));
//       }
//       console.timeEnd(label);
//     })
//     .catch((err) => {
//       results.push('PAYMENT FAILURE', err);
//       if (isMail()) {
//         const errorMessage = results.join('\n');
//         const message = new Message(errorMessage, 'fail');
//         mg.messages
//           .create(process.env.MAILGUN_DOMAIN, message)
//           .catch((error) => console.log(error));
//       }
//       console.error(code.red, err);
//       console.timeEnd(label);
//     });
// })();
