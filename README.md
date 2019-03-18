Account client

[![](https://data.jsdelivr.com/v1/package/npm/@netology-group/account/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@netology-group/account)
![](https://img.shields.io/npm/dt/@netology-group/account.svg)
![](https://img.shields.io/npm/dm/@netology-group/account.svg)

## How to use

### Import module

```javascript
import { Account, IdP as Provider } from 'account'
```

### Initialize

```javascript
const config = {
  label: '<account_label>'
}

const provider = new Provider({
  endpoint: 'http://domain.name'
})
// You can write your own provider or use default IdP provider

const account = new Account(config, provider, window.localStorage)
// You can bypass any storage provider which implements [Provider](./src/identity-provider.js.flow#14) interface
```

### Modes

`Account` supports two modes: `id` & `label`.

These modes are pretty the same. Main difference is that in `id` mode `Account` [uses `audience`](./test/account/account.test.js#L105-L131) suffix at any request.

#### Clarify label

`id` & `label` modes require a label to be known. But you actually may not.

There is special `fetchLabel` method which allows to request actual `label` for the account.
It uses `me` placeholer for the request's URL. For instance:

```javascript
Account.fetchLabel(
  { refresh_token: '<token>' },
  new IdP(/* idp config */),
  /* here you may use your own placeholder. `me` by default */
).then(({ id: acc_label }) => {
  /* do stuff here */
})
```

#### Request access token

- `access_token` will be automatically refreshed if applicable.

```javascript
account.tokenData()
  .then((_: /*: TokenData */) => { /* do something */ })
```

#### Revoke refresh token

```javascript
account.revokeRefreshToken()
  .then((_: /*: TokenData */) => { /* do something */ })
```

#### Store token

```javascript
const tokenData /*: TokenData */ = {}
account
  .store(tokenData)
  .then((_ /*: TokenData */) => { /* do something */ })
```

#### Load token

```javascript
account
  .load()
  .then((_ /*: TokenData */) => { /* do something */ })
```

#### Remove token

```javascript
account
  .remove()
  .then((_ /*: TokenData */) => { /* do something */ })
```
