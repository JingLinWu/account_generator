<h1 align="center">Welcome to magic_account 👋</h1>
<p>
  <a href="https://www.npmjs.com/package/magic_account" target="_blank">
    <img alt="Version" src="https://img.shields.io/npm/v/magic_account.svg">
  </a>
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Provder account generator for the services

## Usage

```sh

var acc = require('magic_account');

var SecMail = acc.SecMail
var CognitoServiceProvider = acc.CognitoServiceProvider
var MagicService  = acc.MagicService;


var secmail = new SecMail();
var cognito = new CognitoServiceProvider();
var m = new MagicService();

var config = {
        "cognito_domain":"{your-cognito-domain}",
        "region": "",
        "client_id":"{your-cognito-client-id}",
        "redirect_uri":"https://www.example.com"
        }

cognito.setConfig( config);


m.setMaxAccounts(3);
m.setPass('Pass@9901');

m.addAccountProvider(secmail);
m.addServiceProvider(cognito);

m.generateAccountInfo();


```


## Author

👤 **jinglinwu**

* Github: [@jinglinwu](https://github.com/jinglinwu)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
