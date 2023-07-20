# Arcana auth Web3 react v6 connector

Arcana auth connector for [web3-react](https://github.com/Uniswap/web3-react)

## Install

```sh
yarn add @arcana/auth-web3-react-v6 @arcana/auth
```

## Usage

With connect modal

```ts
import { ArcanaConnector } from "@arcana/auth-web3-react-v6"
import { AuthProvider } from "@arcana/auth"
import { initializeConnector } from "@web3-react/core"


const auth = new AuthProvider(`${arcana_client_id}`) // Singleton


export const connector = new ArcanaConnector(auth)
```

With custom UI

```ts
import { ArcanaConnector } from "@arcana/auth-web3-react-v6"
import { AuthProvider } from "@arcana/auth"
import { initializeConnector } from "@web3-react/core"


const auth = new AuthProvider(`${arcana_client_id}`) // Singleton


export const connector = new ArcanaConnector(auth, {
  login: {
    provider: 'google',
    // email: 'abc@example.com' // email is needed if provider is passwordless
  }
})

// OR

connector.setLogin({ provider: "google" })
```
