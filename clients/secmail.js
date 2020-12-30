
var request = require('request');
var http = require("http")
var https = require('https');

var url='https://www.1secmail.com/api/v1/'
var pathGenMail = '?action=genRandomMailbox'
var pathGetMessage = '?action=getMessages'
var pathReadMessageContent = '?action=readMessage'
var url='https://www.1secmail.com/api/v1/'
var baseAccountProvider = require('./base-account-provider');
var {Logger} = require("../utils/logger");

var logger = new Logger();

class SecMail extends baseAccountProvider{
	constructor(){
		super();
	}

	async genValidAccount(_count) {
                var emailList = [];
                try {
                        var randomAccount = { count: _count }
                        const res  = await makeHttpGetRequest(url+pathGenMail, randomAccount)
                        var jsArray = JSON.parse(res);
                        var len = jsArray.length;
                        logger.debug(">>>>>genValidAccount <<<<< len:"+ len);
                        for( let item of jsArray){
                                logger.debug(">>>>> genValidAccount<<<<< :"+item);
                                emailList.push(item);
                                var obj = item.split("@");
                                var getMessageParams = "?login="+obj[0]+"&domain="+obj[1];
                                logger.debug(">>>>> genValidAccount <<<<< :"+ getMessageParams);
                        }


                // try downloading an invalid url
                } catch (error) {
                        logger.error(error);
                }
                logger.debug(">>>>> genValidAccount <<<<< emaillist:" + emailList);
                return emailList;

	}	
	

	async readVerificationCodeByAccount( _account ){
		logger.info(" >>>>> readVerificationCodeByAccount <<<<<");		
		await sleep(5000); 
		var mes = await this.getAccountMessage(_account)
        	var messageId = mes[0].id;
        	logger.debug(" >>>>> readVerificationCodeByAccount <<<<< message id: " + messageId);

        	//Read message of extrive verification code
        	var msgRes = await this.readAccountMessageById(_account, messageId);
		var codeStr = msgRes["body"];
        	var code = codeStr.split("Your confirmation code is");
        	var verificationCode = code[1].trim();		
		return verificationCode;		
	}
	
	async readAccountMessageById( _account, _id) {

        	var obj;
        	try {
                	var obj = _account.split("@");
                	var accountInfoById = {
                        	login : obj[0],
                        	domain: obj[1],
                        	id: _id,
                	 }
                	const res  = await makeHttpGetRequest(url + pathReadMessageContent , accountInfoById)
                	obj  = JSON.parse(res);

        	// try downloading an invalid url
        	} catch (error) {
                	logger.error( error);
        	 }
        	return obj;

	}

	async getAccountMessage( _account) {

    		var result;
    		try {
        		var obj = _account.split("@");
        		var accountInfo = {
                		login : obj[0],
                		domain: obj[1],
       			 }
        		const res  = await makeHttpGetRequest(url+pathGetMessage, accountInfo)
        		result  = JSON.parse(res);

    		} catch (error) {
        		logger.error(error);
    		}
    		return result;

	}

}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}




function genEmail(count){
	
	httpRequest("GenEmail", count);

}

function makeHttpGetRequest(_url, _params) {
    return new Promise((resolve, reject) => {

	var queryStr = '';
	
	if (Object.keys(_params).length > 0 ) {
		for (var key in _params) {
                	queryStr = queryStr + "&"+ key +"=" + _params[key];
		}
        }
	
	apiUrl = _url + queryStr;
	logger.debug("completed url: "+ apiUrl);
	request( apiUrl, (error, response, body) => {
            if (error) reject(error);
            if (response.statusCode != 200) {
                reject('Invalid status code <' + response.statusCode + '>');
            }
            resolve(body);
        });
    });
}



module.exports = SecMail;
