<h1 align="center">Welcome to magic-account 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.9-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

> Provide the convenient way to generate account with signned-up service


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

## Result Example

```sh

[{"service":"cognito","accountList":["j13fclw@1secmail.com","xhrh94@wwjmp.com","a986u66bk6@1secmail.org"]}]

```

## Author

👤 **jinglinwu**

* Website: https://jinglinwu.medium.com/
* Github: [@jinglinwu](https://github.com/jinglinwu)

## Show your support

Give a ⭐️ if this project helped you!

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
