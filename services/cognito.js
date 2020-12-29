

var request = require('request');
var http = require("http")
var https = require('https');
var fs = require("fs");

const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var secmail = require("../clients/secmail");
var BaseServiceProvider  = require('./base-service-provider') 



class CognitoServiceProvider extends BaseServiceProvider{

	constructor(){
		super();
		this.url;
	}
	
	checkConfig() {
		if(checkValdate(this.url) === true) {
			return true;			
		}else{
			return false;
		}	

	}
	
	setConfig( serviceConfig){
		
		if(checkValdate( serviceConfig.cognito_domain) === true &&
                	checkValdate( serviceConfig.client_id) === true &&
                       	checkValdate( serviceConfig.redirect_uri) === true){
                        this.url = serviceConfig.cognito_domain + "/signup?response_type=code&client_id="+ serviceConfig.client_id +"&redirect_uri="+serviceConfig.redirect_uri;
			
                }else{
			throw new Error('An error: Missing Cognito Configuration Information!!');
		}
	
	}

	loadConfigFile(){
		
		var config = fs.readFileSync(path.resolve(__dirname,"../config/config.json"));
		var configContent = JSON.parse(config);
		if ( checkValdate(configContent.cognito.cognito_domain) === true && 
			checkValdate(configContent.cognito.client_id) === true &&
			checkValdate(configContent.cognito.redirect_uri) === true) {
			this.url = configContent.cognito.cognito_domain + "/signup?response_type=code&client_id="+ configContent.cognito.client_id +"&redirect_uri="+configContent.cognito.redirect_uri;
		}else{
			throw new Error('An error: Missing Cognito Configuration from config.json!!'); 
		}
		
	}
	async doSignUp( account, pass){
		if( this.checkConfig() === false) {
			throw new Error('An error: Missing Configuration Information');
		}
		let res = await fillAccountInSignupPage( this.url, account, pass);		
               	return res;		
	}

	async doAccountValidation(session, verificationCode){
		if( this.checkConfig() === false) {
                        throw new Error('An error: Missing Configuration Information!');
                }
		let res = confirmVerification( session, verificationCode);
		return res;
		
	}


}

function checkValdate( obj ){
	if (typeof obj !== 'undefined' && obj !== null && obj !==""){
		return true;
	}
	return false;
}

function makeHttpRequest( _url, _headers ) {
    return new Promise((resolve, reject) => {


        request(
		{url: _url,
    		method: "GET",
    		headers: _headers},
		 (error, response, body) => {
            		if (error) reject(error);
            			if (response.statusCode != 200) {
                		reject('Invalid status code <' + response.statusCode + '>');
            		}
            		resolve(body);
        });
    });
}


function makeHttpPost(_url, _form, _headers) {

	let options = {
                url: _url,
                headers: _headers,
                form: _form
        };

	
	return new Promise((resolve, reject) => {
		
		request.post(options, function(err, res, body) {
                	console.log('body:'+ body);
               	 	console.log(err);
                	console.log('res code:' + res.statusCode);
                	console.log("req:" + JSON.stringify(request.headers));

                	if (res.statusCode == 302) {

                        	console.log(JSON.stringify(res.headers));
                        	console.log("headers="+res.headers);
                        	//console.log(res.headers.location);
                	}
			if (err) reject(err);
			if (res.statusCode == 200 || res.statusCode == 302)  {
                		resolve([err, res, body]);
           		}else{
				reject('Invalid status code <' + res.statusCode + '>');
			}



        	});

	});


}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
} 


async function fillAccountInSignupPage( signUpUrl,  account, pass){
	console.log('fillAccountInSignupPage');
	var signUpResult = { canSignUp:false, signUpRes:{}}
	try {
        	var initHeaders = {}
        	const res  = await makeHttpRequest( signUpUrl, initHeaders)
        	const dom = new JSDOM(res);
        	const csrfEleValue = dom.window.document.getElementsByName("_csrf")[0].value;
        	console.log( "<<fillAccountInSignupPage>> csrf:" + csrfEleValue);
        	//console.log(res);
        	var xsrf_token = 'XSRF-TOKEN=' + csrfEleValue

        	//Post to create account
       		var _form = {
                        username: account,
                        password: pass,
                        _csrf: csrfEleValue
                         }

        	var _headers = {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'cookie': xsrf_token
                         }
        	var resc = await makeHttpPost( signUpUrl, _form, _headers);
		
		console.log("Filling Post Result >>>>> :" + JSON.stringify( resc));

		if( resc.length > 2) {
			if (resc[1].statusCode == 302) {
                                console.log("<< fillingSignupPage>> :" +JSON.stringify(resc[1].headers));
                                console.log("<<fillingSignupPage>>:"+ " headers= "+resc[1].headers);
                                console.log("<<fillingSingupPage>> redirect location:" + resc[1].headers.location);
				signUpResult.signUpRes = resc[1];
				signUpResult.signUpRes.additional = {'csrf':csrfEleValue};
				signUpResult.canSignUp = true;
				
                	}
		}	
		//signUpResult.signUpRes = resc
		console.log("FILLING >>>>>> :" + JSON.stringify(resc));
		var redirectCfmPageUrl = resc[1].headers.location;
        	var cookies = resc[1].headers['set-cookie'];
	} catch (error) {
        	console.error('fillAccountInSignupPage >>> ERROR: '+error);
   	}	
	return signUpResult;

}

async function confirmVerification(session, verificationCode ){
	
	//Open confirm page by HttpGet
      	console.log( ">>>>> confirmVerification <<<<<"); 
	try {
		var redirectCfmPageUrl = session.headers.location;
        	var cookies = session.headers['set-cookie'];
        	console.log('>>>>> confirmVerification <<<<< cookies:' + cookies);
        	console.log('>>>>> confirmVerification <<<<< redirect page:' + redirectCfmPageUrl);

        	var redirectHeaders = { 'cookie': cookies }
        	const confirmPageRec  = await makeHttpRequest( redirectCfmPageUrl, redirectHeaders)
        	const cfmDom = new JSDOM(confirmPageRec);
	

	//
        	let usernameEleValue = cfmDom.window.document.getElementsByName("username")[0].value;
        	let subEleValue = cfmDom.window.document.getElementsByName("sub")[0].value;
        	let destinationEleValue = cfmDom.window.document.getElementsByName("destination")[0].value;
	
		let deliveryMediumEleValue = cfmDom.window.document.getElementsByName("deliveryMedium")[0].value;
        	let code = verificationCode
        	let csrf_ = session.additional.csrf;
		let xsrf_token = 'XSRF-TOKEN=' + csrf_;
		let confirm = ''

        	console.log("_csrf:"+csrf_);
        	console.log("usernameEleValue:"+usernameEleValue);
        	console.log("subEleValue:"+subEleValue);
        	console.log("destinationEleValue:"+destinationEleValue);
        	console.log("deliveryMediumEleValue:"+deliveryMediumEleValue);
        	console.log("code:"+code);
        	console.log("confirm:"+confirm);

		var _verifyForm  = {
                	 username: usernameEleValue,
                 	_csrf: csrf_,
                	destination: destinationEleValue,
                	deliveryMedium: deliveryMediumEleValue,
                	sub: subEleValue,
                	code: verificationCode,
                	confirm: '',
        	}

        	var _verifyHeaders = {
                	'Content-Type': 'application/x-www-form-urlencoded',
                	'cookie': 'cognito-fl=\"10=\"; '+ xsrf_token,
       		}

        	var verRes = await makeHttpPost( redirectCfmPageUrl, _verifyForm, _verifyHeaders);
        	console.log(" last result page loc: " + verRes[1].headers.location);
		
	}catch(error){
		console.log("ERROR:" + error);
	}	

}


async function start() {
    try {
	var accountRes = await secmail.genValidAccount(5);
        console.log("accountRes ==>"+ accountRes);
	account = accountRes[0];
        //var mes = getAccountMessage(String(res[0]));

	var initHeaders = {}
        const res  = await makeHttpRequest( signUpUrl, initHeaders)
        const dom = new JSDOM(res);
	const csrfEleValue = dom.window.document.getElementsByName("_csrf")[0].value;
	console.log( "csrf:" + csrfEleValue);
	//console.log(res);
	var xsrf_token = 'XSRF-TOKEN=' + csrfEleValue
	
	
	
	let options = {
    		url: signUpUrl,
		headers: {
        		'Content-Type': 'application/x-www-form-urlencoded',
			'cookie': xsrf_token
   		},
    		form: {
        		username: account,
        		password: '4536@pSwD',
			_csrf: csrfEleValue
   			 }
	};

	//Post to create account
	var _form = {
                        username: account,
                        password: '4536@pSwD',
                        _csrf: csrfEleValue
                         }
	
	var _headers = {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'cookie': xsrf_token
               		 }
	var resc = await makeHttpPost( signUpUrl, _form, _headers);
	console.log("location =>" + resc[1].headers.location)

	//Get account email message 
	await sleep(5000);
	var mes = await secmail.getMessageIdByAccount(account)
	console.log("account msg:" + JSON.stringify(mes));
	var messageId = mes[0].id;
	console.log("message id: " + messageId);


	//Read message of extrive verification code
	var msgRes = await secmail.readEmailMessage(account, messageId)
        console.log("msgRes:" + JSON.stringify(msgRes));
	var codeStr = msgRes["body"];
	var code = codeStr.split("Your confirmation code is");
	var verificationCode = code[1].trim();
	console.log("verification code:"+ verificationCode);

	  //Open confirm page by HttpGet
        var redirectCfmPageUrl = resc[1].headers.location;
	var cookies = resc[1].headers['set-cookie'];
	console.log('cookies:' + cookies);
	console.log('redirect page:' + redirectCfmPageUrl);

	var redirectHeaders = { 'cookie': cookies }
        const confirmPageRec  = await makeHttpRequest( redirectCfmPageUrl, redirectHeaders)
        const cfmDom = new JSDOM(confirmPageRec);
        const usernameEleValue = cfmDom.window.document.getElementsByName("username")[0].value;
        const subEleValue = cfmDom.window.document.getElementsByName("sub")[0].value;
        const destinationEleValue = cfmDom.window.document.getElementsByName("destination")[0].value;
        const deliveryMediumEleValue = cfmDom.window.document.getElementsByName("deliveryMedium")[0].value;
        var code = verificationCode
        var confirm = ''

        console.log("_csrf:"+csrfEleValue);
        console.log("usernameEleValue:"+usernameEleValue);
        console.log("subEleValue:"+subEleValue);
        console.log("destinationEleValue:"+destinationEleValue);
        console.log("deliveryMediumEleValue:"+deliveryMediumEleValue);
        console.log("code:"+code);
        console.log("confirm:"+confirm);





	var _verifyForm  = {
		 username: usernameEleValue,
                 _csrf: csrfEleValue,
		destination: destinationEleValue,
		deliveryMedium: deliveryMediumEleValue,
		sub: subEleValue,
		code: verificationCode,
		confirm: '',
	}
	
	var _verifyHeaders = {
		'Content-Type': 'application/x-www-form-urlencoded',
                'cookie': 'cognito-fl=\"10=\"; '+ xsrf_token,
	}

	var verRes = await makeHttpPost( redirectCfmPageUrl, _verifyForm, _verifyHeaders);	
        console.log(" last result page loc: " + verRes[1].headers.location);	

    } catch (error) {
        console.error('ERROR:');
        console.error(error);
    }
}


function httpRequest(action, params){
	console.log("action:"+ action +" , params:" + params);
	var apiUrl = url;
	switch(action){
		case 'GenEmail':
		apiUrl = apiUrl + pathGenMail + params
		break;
		case 'GetMsg':
		breadk;
		case 'ReadMsg':
		break;

	}
	console.log('URL:' + apiUrl);
/*
	https.get(apiUrl, res => {
  		let data = ""
		res.on("data", d => {
    			data += d
  		})
  		res.on("end", () => {
    			console.log(data)
  		})
	})
*/	

/*
	const response = await request(apiUrl);
	request(apiUrl, function (error, response, body) {
		
		if (!error && response.statusCode == 200) {
        		console.log(body)
       		}
		else{
			console.log(error);
		}
	
	})
*/

}

module.exports = CognitoServiceProvider
