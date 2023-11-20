'use strict';

/*
 * Mailgun implementation for error reporting
 */

const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY,
});

// function Message(text, origin = 'success') {
//   if (!new.target) return new Message(text);
//   this.from =
//     origin === 'success'
//       ? 'Slapfiliate Log <noreply-log@slapfiliate.app>'
//       : 'Slapfiliate Errors <noreply-error@slapfiliate.app>';
//   this.to = process.env.TARGET_EMAIL;
//   this.subject =
//     origin === 'success' ? 'SLAPFILIATE LOG' : 'SLAPFILIATE ERRORS';
//   this.text = text;
// }

module.exports = { mg, Message };
