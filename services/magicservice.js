var SecMail = require("../clients/secmail")
var CognitoServiceProvider = require('./cognito')
//var secmail = new SecMail()

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
		console.log("generateAccountInfo");		
		console.log(" accountList len:" + this.accountServiceList_.length);
		try{

			for( var k = 0; k < this.accountServiceList_.length; k++ ){
				console.log( ">>>>> " + this.accountServiceList_[k]);
				var accountService = this.accountServiceList_[k];
                        	var res =  await accountService.genValidAccount(this.maxCount_);
                        	console.log(" serviceProvider list len:" + this.serviceProviderList_.length);                                 for( var x = 0; x < this.serviceProviderList_.length; x++){
                        		for( var i = 0; i< res.length; i++){
                                		var account = res[i];
                                        	console.log("prepare account:" + account);
                                        	var signupRes = await this.serviceProviderList_[x].doSignUp(account,this.pass_);
					
						if( signupRes.canSignUp == true ) {
						//recevie message by account
							let verifyCode = await accountService.readVerificationCodeByAccount(account);		
							console.log( ">>>>> verify code:" + JSON.stringify(verifyCode));
							var verifyRes = await this.serviceProviderList_[x].doAccountValidation(signupRes.signUpRes, verifyCode);
						}
                               		 }
                       		 }
			}
		}catch (error) {
			console.log ( ">>>>> generateAccountInfo <<<<< :" + error);
		}
		/*
		this.accountServiceList_.forEach( accountService => {
				console.log( accountService)
				var res = await accountService.genValidAccount(this.maxCount_);
				console.log(" serviceProvider list len:" + this.serviceProviderList_.length);
				for( var x; x < this.serviceProviderList_.length; x++){				
					for( var i; i< res.length; i++){
        					var account = res[i];
						console.log("prepare account:" + account);
						this.serviceProviderList_[x].doSignUp(account,this.pass_);
					}
				}
			}
		);
		*/		
		//this.secMail_.genValidAccount(this.maxCount_);		
	}

}


/*
var secmail = new SecMail();
var cognito = new CognitoServiceProvider();

var m = new MagicService();
m.setMaxAccounts(3);
m.setPass('Pass@9901');

m.addAccountProvider(secmail);
m.addServiceProvider(cognito);

m.generateAccountInfo();

*/

module.exports = MagicService;
