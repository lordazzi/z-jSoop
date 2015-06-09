var Z = require('../z-jsoop.min.js');
var fs = require('fs');

var is = function(mock, valorDesejado, mensagem){
	if (mock === valorDesejado) {
		setCorreto(mensagem);
	} else {
		setErro(mensagem);
	}
};

(function(){
	var i = 0;
	getCount = function(){ return (++i)+") "; };
})();

var setErro = function(mensagem){
	console.log("\033[91m"+getCount()+mensagem+'\033[0m');
};

var setCorreto = function(mensagem){
	console.log("\033[92m"+getCount()+mensagem+'\033[0m');
};

var data = fs.readFileSync('unit-tests.js', {
	encoding: 'utf8'
});

eval(data);