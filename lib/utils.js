'use strict';

function buildBase64Auth(user, pass) {
  const input = `${user}:${pass}`;
  const buffer = Buffer.from(input);
  const base64data = buffer.toString('base64');
  return `Basic ${base64data}`;
}

module.exports = {
  buildBase64Auth,
};
