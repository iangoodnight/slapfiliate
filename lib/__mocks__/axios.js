const axios = jest.createMockFromModule('axios');

axios.create.mockReturnThis();

module.exports = axios;
