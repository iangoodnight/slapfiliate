'use strict';

function buildBase64Auth(user, pass) {
  const input = `${user}:${pass}`;
  const buffer = Buffer.from(input);
  const base64data = buffer.toString('base64');
  return `Basic ${base64data}`;
}

function applyPayFloor(affiliates = []) {
  process.env.PAYOUT_FLOOR = 2;
  const { env } = process;
  if (env.PAYOUT_FLOOR === 'undefined') return affiliates;
  const floor = parseInt(env.PAYOUT_FLOOR);
  return Promise.resolve(
    affiliates.filter((affiliate) => affiliate.balance >= floor)
  );
}

function injectSandBoxAffiliates() {
  const sandbox = [
    {
      email: 'sb-3cgx45271592@personal.example.com',
      affiliate_id: 'iantest',
      balance: 100,
    },
    {
      email: 'sb-ydzo51848415@personal.example.com',
      // email: 'nofx39@gmail.com',
      affiliate_id: 'kylewells2',
      balance: 1.02,
    },
  ];
  return Promise.resolve(sandbox);
}

function logToConsole(info) {
  const {
    payPalResponse: { payout_batch_id = '', batch_status = '' } = {},
    affiliates = [],
  } = info;
  if (affiliates.length === 0) return 'nothing to log';
  affiliates.forEach((affiliate) => {
    let log = '';
    if (payout_batch_id !== '') log += `batch_id: ${payout_batch_id} `;
    if (batch_status !== '') log += `status: ${batch_status} `;
    const { affiliate_id = '', email = '', balance = '' } = affiliate;
    log += `${affiliate_id} ${
      email === '' ? '' : '(' + email + ')'
    }, ${balance}`;
    console.log(log);
  });
  console.log(info);
  return Promise.resolve({ info });
}

module.exports = {
  buildBase64Auth,
  applyPayFloor,
  injectSandBoxAffiliates,
  logToConsole,
};
