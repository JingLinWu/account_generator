

class Constants {}

Constants.LEVEL = {
                DEBUG: "debug",
		INFO: "info",
                WARN: "warn",
                ERROR: "error"
}


Object.freeze(Constants.LEVEL);

class Logger {

	levelMap = { "debug":0, "info":1, "warn":2, "error":3} 
	constructor(){
		//ES6 singleton
		this.level = Constants.LEVEL.INFO;
		const instance = this.constructor.instance;
		if ( instance) {
			return instance;
		}
		this.constructor.instance = this;
	}
	setLogLevel ( lev ) {
		this.level = lev; 
	}
	debug( str ){
		if ( this.levelMap[this.level] <= 0 ) {
                        console.log( str );
                }
	}
	info( str){
                if (  this.levelMap[this.level] <= 1) {
                        console.info( str );
                }
        }
	warn( str ){
                if ( this.levelMap[this.level] <= 2 ) {
                        console.warn( str );
                }
	}
	error( str ){
                if ( this.levelMap[this.level] <= 3 ) {
                        console.error( str );
                }
	}


}

module.exports = {Logger, Constants};


