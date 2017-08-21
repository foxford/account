const account = new Account({
  provider: new IdP({
    endpoint: 'https://media-idp-rc.foxford.ru:10001/api/v1'
  })
})
const authKey = 'oauth2.foxford'
const params = {
  client_token: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJtZWRpYS1pZHAuZm94Zm9yZC5ydSIsImV4cCI6MzI1MDM2ODAwMDAsImlzcyI6ImZveGZvcmQucnUiLCJyb2xlIjoiYWRtaW4iLCJzdWIiOiJKb2huIn0.aoSEc_W3LQnZvMrM_eGXcqY7O9Pxulk9z6I8sF4lQzvf-_SaE4g4dGbquOjctUULAxBvpljSIso59_7II477JQ',
  grant_type: 'client_credentials'
}
const linkParams = {
  client_token: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJtZWRpYS1pZHAuZm94Zm9yZC5ydSIsImV4cCI6MzI1MDM2ODAwMDAsImlzcyI6ImZveGZvcmQucnUiLCJyb2xlIjoibW9kZXJhdG9yIiwic3ViIjoiSm9obiJ9.Ib0mhLuhLo9Ah-cHF6r81rV6FEIqKGlQBqCZslS1KiIPvIA_aLFENHmhCUoewexdjnZd4rMdcXBZCYaD6WE-Bw',
  grant_type: 'client_credentials'
}
const myAccountId = 'me'
const getSignFunc = () => {
  if (localStorage.getItem('account_id')) {
    return account.signIn({ id: localStorage.getItem('account_id') })
  } else {
    return account.signIn({ auth_key: authKey, params })
      .then((data) => {
        _saveAccountId(account.id)
        return Promise.resolve(account.id)
      })
  }
}

// get token
function signIn () {
  getSignFunc()
    .then(_logResult)
}

// delete access token
function signOut () {
  account.signOut()
    .then(data => {
      console.log(data)
      localStorage.removeItem('account_id')
    })
}

// refresh token
function refresh () {
  getSignFunc()
    .then(account.refresh(myAccountId))
    .then(_logResult)
}

// revoke token
function revoke () {
  getSignFunc()
    .then(account.revoke(myAccountId))
    .then(_logResult)
}

// link client's accounts
function link () {
  getSignFunc()
    .then(account.link(authKey, linkParams))
    .then(_logResult)
}

// get linked accounts
function auth () {
  getSignFunc()
    .then(account.auth(myAccountId))
    .then(_logResult)
}

// delete account link
function unlink () {
  getSignFunc()
    .then(account.unlink(myAccountId, authKey))
    .then(_logResult)
}

// get account info
function getAccount () {
  getSignFunc()
    .then(account.get(myAccountId))
    .then(_logResult)
}

function removeAccount () {
  getSignFunc()
    .then(account.remove(myAccountId))
    .then(data => {
      console.log(data)
      localStorage.removeItem('account_id')
    })
}

function isEnabled () {
  getSignFunc()
    .then(account.isEnabled(myAccountId))
    .then(data => console.log('account status: enabled'))
    .catch(() => console.log('account status: disabled'))
}

function enable () {
  getSignFunc()
    .then(account.enable(myAccountId))
    .then(data => console.log('account enabled'))
}

function disable () {
  getSignFunc()
    .then(account.disable(myAccountId))
    .then(data => console.log('account disabled'))
}

function _saveAccountId (id) {
  id && localStorage.setItem('account_id', id)
  return Promise.resolve(id)
}

function _logResult (data) {
  console.log(data)
  console.log(localStorage)
}

window.onload = () => signIn()
