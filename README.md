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
  label: 'me'
}

const provider = new Provider({
  endpoint: 'http://domain.name'
})
// You can write your own provider or use default IdP provider

const account = new Account(config, provider, window.localStorage)
// You can bypass any storage provider which implements [Provider](./src/identity-provider.js.flow#14) interface
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
