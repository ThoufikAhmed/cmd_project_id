/**
 * This file will run before any mocha tests are run. It functions as a global hook
 * @module test/fetchAuth0TokenForTesting
 */

const axios = require('axios')

/**
 * Function that will fetch an Auth0 token and return it
 * @name fetchToken
 * @function
 * @memberof module:test/fetchAuth0TokenForTesting
 * @instance
 */
before(async function fetchToken () {
  try {
    const response = await axios.post(process.env.AUTH0_TOKEN_API, {
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_AUDIENCE_API,
      grant_type: 'client_credentials'
    })
    const { data: { access_token } } = response  // eslint-disable-line
    process.env.TEST_TOKEN = access_token //  eslint-disable-line
  } catch (err) {
    console.error(err)
  }
})
