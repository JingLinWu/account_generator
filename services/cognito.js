

var request = require('request');
var http = require("http")
var https = require('https');
var fs = require("fs");

const path = require('path');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var secmail = require("../clients/secmail");
var BaseServiceProvider  = require('./base-service-provider');
var {Logger} = require("../utils/logger");

var logger = new Logger();


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
                	logger.debug("["+CognitoServiceProvider.name+"]>>>> makeHttpPost  <<<<< req:" + JSON.stringify(request.headers));

                	if (res.statusCode == 302) {

                        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> makeHttpPost<<<<< header: "+ JSON.stringify(res.headers));
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
	logger.info('['+CognitoServiceProvider.name+'] >>>>> fillAccountInSignupPage <<<<<');
	var signUpResult = { canSignUp:false, signUpRes:{}}
	try {
        	var initHeaders = {}
        	const res  = await makeHttpRequest( signUpUrl, initHeaders)
        	const dom = new JSDOM(res);
        	const csrfEleValue = dom.window.document.getElementsByName("_csrf")[0].value;
        	logger.debug( ">>>>> fillAccountInSignupPage>  <<<<< csrf:" + csrfEleValue);
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
		
		logger.debug("["+CognitoServiceProvider.name+"]>>>> fillAccountInSignupPage <<<<< Filling Post Result :" + JSON.stringify( resc));

		if( resc.length > 2) {
			if (resc[1].statusCode == 302) {
                                logger.debug("["+CognitoServiceProvider.name+"]>>>>> fillingSignupPage <<<<< :" +JSON.stringify(resc[1].headers));
                                logger.debug("["+CognitoServiceProvider.name+"]>>>>> fillingSingupPage <<<<< redirect location:" + resc[1].headers.location);
				if(resc[1].headers.location && resc[1].headers.location.includes("confirm")){
					signUpResult.signUpRes = resc[1];
                                	signUpResult.signUpRes.additional = {'csrf':csrfEleValue};
                                	signUpResult.canSignUp = true;
				}
				
                	}
		}	
		//signUpResult.signUpRes = resc
		logger.debug("["+CognitoServiceProvider.name+"]>>>>> FILLING <<<<< :" + JSON.stringify(resc));
		var redirectCfmPageUrl = resc[1].headers.location;
        	var cookies = resc[1].headers['set-cookie'];
	} catch (error) {
        	logger.error("["+CognitoServiceProvider.name+"]>>>>> fillAccountInSignupPage <<<<< ERROR: "+error);
   	}	
	return signUpResult;

}

async function confirmVerification(session, verificationCode ){
	
	//Open confirm page by HttpGet
      	logger.info("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<<"); 
	let verifyRes = { isAccountGenerated:false, account:'', service:"cognito"}; 
	try {
		var redirectCfmPageUrl = session.headers.location;
        	var cookies = session.headers['set-cookie'];
        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< cookies:" + cookies);
        	logger.debug(">>>>> confirmVerification <<<<< redirect page:" + redirectCfmPageUrl);

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

        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< _csrf:"+csrf_);
        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< usernameEleValue:"+usernameEleValue);
        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< subEleValue:"+subEleValue);
        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< destinationEleValue:"+destinationEleValue);
        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< deliveryMediumEleValue:"+deliveryMediumEleValue);
        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< code:"+code);
        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< confirm:"+confirm);

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
        	logger.debug("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< last result page loc: " + verRes[1].headers.location);
		if( verRes[1].statusCode == 302) {
			//redirect to valid page
			verifyRes.isAccountGenerated = true;
			verifyRes.account  = usernameEleValue;
		}
	        	
	}catch(error){
		logger.error("["+CognitoServiceProvider.name+"]>>>>> confirmVerification <<<<< ERROR:" + error);
	}	
	return verifyRes;
}




module.exports = CognitoServiceProvider
