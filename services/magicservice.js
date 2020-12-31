var SecMail = require("../clients/secmail")
var CognitoServiceProvider = require('./cognito')
var {Logger} = require("../utils/logger")

var logger = new Logger();

class MagicService{
	constructor(){
		this.accountServiceList_ = [];
		this.serviceProviderList_ = [];
		this.maxCount_ = 0;
		this.pass_ = "";
	}
	

	addAccountProvider( baseAccountProvider){
		this.accountServiceList_.push( baseAccountProvider);	
	}
	
	addServiceProvider( baseServiceProvider){
		this.serviceProviderList_.push( baseServiceProvider);
	}

	setMaxAccounts( count){
		this.maxCount_ = count;
	}

	setPass( pass){
		this.pass_ = pass;
	}
	

	async generateAccountInfo(){
		logger.info(">>>>> generateAccountInfo <<<<<");		
		let magicAccountInfoList = [];
		try{

			for( var k = 0; k < this.accountServiceList_.length; k++ ){
				console.log( ">>>>> " + this.accountServiceList_[k]);
				var accountService = this.accountServiceList_[k];
                        	var res =  await accountService.genValidAccount(this.maxCount_);
				logger.debug(">>>>> generateAccountInfo <<<<< serviceProvider list len:" + this.serviceProviderList_.length);      
                        	for( var x = 0; x < this.serviceProviderList_.length; x++){
					let serviceInfo = {service:'', accountList:[]};
                        		for( var i = 0; i< res.length; i++){
                                		var account = res[i];
                                        	console.log("prepare account:" + account);
                                        	var signupRes = await this.serviceProviderList_[x].doSignUp(account,this.pass_);
					
						if( signupRes.canSignUp == true ) {
						//recevie message by account
							let verifyCode = await accountService.readVerificationCodeByAccount(account);		
							logger.info( ">>>>>generateAccountInfo <<<<< verify code:" + JSON.stringify(verifyCode));
							var verifyRes = await this.serviceProviderList_[x].doAccountValidation(signupRes.signUpRes, verifyCode);
							if( verifyRes.isAccountGenerated == true){
								//verifyRes.
								serviceInfo.service = verifyRes.service;
								serviceInfo.accountList.push(verifyRes.account);
								
							}
						}
                               		 }
					 magicAccountInfoList.push(serviceInfo);
                       		 }
			}
			
			
		}catch (error) {
			logger.error( ">>>>> generateAccountInfo <<<<< :" + error);
		}
		return magicAccountInfoList;
	}

}



module.exports = MagicService;
