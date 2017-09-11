# account
account client

# How to use
### Initialize
```javascript
const config = {
  provider: new IdP({
    endpoint: '...host...'
  })  // you can write your own provider or use default IdP provider
}
const account = new Account(config)
```
### Get access token
```javascript
const authKey = 'oauth2.key'
const params = {
  client_token: '...JWT TOKEN...',
  grant_type: 'client_credentials'
}
const accountId = '..id...'
account.signIn(/* { auth_key: authKey, params: params } || { id: accountId } || { refresh_token: '...JWT TOKEN...' } */)
  .then((data) => {
    // {
    //   access_token: '...',
    //   expires_in: 86400,
    //   refresh_token: '...',
    //   token_type: 'Bearer'
    // }
  })
```
### Refresh access token
```javascript
account.signIn(/* { auth_key: authKey, params: params } || { id: accountId } || { refresh_token: '...JWT TOKEN...' } */)
  .then(account.refresh(id)) // id or 'me'
  .then((data) => {
    // {
    //   access_token: '...',
    //   expires_in: 86400,
    //   token_type: 'Bearer' 
    // }
  })
```
### Revoke refresh token
```javascript
account.signIn(/* { auth_key: authKey, params: params } || { id: accountId } || { refresh_token: '...JWT TOKEN...' } */)
  .then(account.revoke(id)) // id or 'me'
  .then((data) => {
    // {
    //   refresh_token: '...'
    // }
  })
```
### Link client's accounts
```javascript
account.signIn(/* { auth_key: authKey, params: params } || { id: accountId } || { refresh_token: '...JWT TOKEN...' } */)
  .then(account.link(authKey, params))
  .then((data) => {
    // {
    //   id: '1'
    // }
  })
```
### Get linked accounts
```javascript
account.signIn(/* { auth_key: authKey, params: params } || { id: accountId } || { refresh_token: '...JWT TOKEN...' } */)
  .then(account.auth(id)) // id or 'me'
  .then((data) => {
    // [{
    //   id: 'oauth.key'
    // }]
  })
```
### Delete account link
```javascript
account.signIn(/* { auth_key: authKey, params: params } || { id: accountId } || { refresh_token: '...JWT TOKEN...' } */)
  .then(account.unlink(id, authKey)) // id or 'me'
  .then((data) => {
    // {
    //   "id": "oauth2.key.1"
    // }
  })
```
### Get account info
```javascript
account.signIn(/* { auth_key: authKey, params: params } || { id: accountId } || { refresh_token: '...JWT TOKEN...' } */)
  .then(account.get(id)) // id or 'me'
  .then((data) => {
    // {
    //   id: ''
    // }
  })
```
### Delete access token
```javascript
account.signOut()
  .then(() => { /* do something */ })
```
