

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
		this.level = Constants.LEVEL.INFO;
		if( Logger.instance instanceof Logger) {
			return Logger.instance;
		}else{
			Logger.instance = this;
			return Logger.instance;
		}
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


