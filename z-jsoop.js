/**
 * Zazzi jSoop 1.0.2
 * Zazzi JavaScript Oriented Object Programming
 *
 * Esta é uma bibliota que cria um ambiente javascript de orientação objeto
 * equivalente ao dos frameworks da sencha (mas é open \o/).
 *
 * Esta biblioteca não conta com nenhuma classe, apenas com o estilo de
 * orientação objeto do Ext, então recursos como o Controller, Component,
 * Model e Store só estarão inclusos se você criá-los em sua aplicação, ou
 * então fazer a cópia da classe caso alguém o tenha feito.
 *
 *	Vantagens:
 * 		* É open source e pode ser usado em seus freelas e projetos de empresa
 * 		(o sencha é pago e caro)
 *
 * 		* Como é equivalente a orientação objeto definida no Ext Js, se você
 * 		já usa este framework, já sabe usar Z jSoop, ou se já conhece Z jSoop,
 * 		vai ter mais facilidade de entender Ext Js
 * 
 *		* Você pode usar a documentação automatica do JSDuck, já que segue
 *		o mesmo padrão que o sencha
 *
 * 		* Você pode usar alguns componentes sencha que já tenha criado, por
 * 		que o modelo de orientação objeto é equivalente
 * 
 *	Desvantagens:
 * 		* Você não conta com um compressor de javascript aqui, como Sencha CMD.
 * 		
 * 	 	* Você vai carregar cada um dos arquivos da classe para instanciar sua app,
 * 	 	então não use para web app
 *
 * 	Proposito:
 * 		* Esta biblioteca foi construida com o objetivo de se criar apps para android,
 * 		ios, windows compilando o javascript com phonegap, conseguindo manter uma orientação
 * 		objetos descente, como é feito no Ext Js.
 * 		* A biblioteca não dá suporta para o uso de OOP em ambiente de node, mas a ideia é que
 * 		isso seja implementado (quando eu precisar)
 *
 * O objetivo inicial da reprodução deste estilo de OOP para javascript é o
 * uso deste em um app mobile, usando PhoneGap, acredito que com o javascript
 * compilado para nativo, uma quantidade grande de arquivos compondo o app não
 * será um problema.
 */
var Z = function(){};

/**
 * Cria um namespace, vinculando ele com um repositorio ou uma pasta
 */
Z.defineApp = function(obj){
	//	nome do projeto
	if (obj.name === undefined)
		throw "Defina um namespace para seu projeto/alias no atributo 'name'";

	//	onde está a aplicação
	if (obj.path === undefined)
		throw "Defina a pasta da aplicação em 'path'";

	if (obj.path.match(/.+[^\/\\]$/))
		obj.path += '/';

	if (Z.exists(obj.name))
		throw "Uma variavel com o nome {0} já existe no escopo global.".format(obj.name);

	window[obj.name] = {
		path: obj.path,
		name: obj.name,
		isZ: true
	};

	//	primeira classe a ser chamada quando a aplicação iniciar
	if (obj.main) {

		//	quando a última classe requerida for carregada
		if (obj.onLaunch === undefined)
			obj.onLaunch = function(){};

		var declaration = Z.declare(obj.main);
		declaration.onLoad(function(){ Z.create(obj.main); });
		declaration.onLoad(obj.onLaunch);
		Z.Require([ obj.main ]);
	}	
};

/**
 * Verifica se uma classe já existe
 */
Z.exists = function(className){
	className	= String(className);
	className	= className.split('.');
	var scope	= window;
	for (var i = 0; i < className.length; i++) {
		if (scope[className[i]])
			scope = scope[className[i]];
		else
			return false;
	}

	return scope;
};

/**
 * converte Namespace.pasta.pasta.Classe para um objeto
 * de fato existente
 */
Z.declare = function(className){
	var existe = Z.exists(className);
	if (existe) {
		if (existe.isZ)
			return existe;
		else
			throw "Problema para declarar {0}, a variavel já existe.".format(className);
	}
	
	var names	= className.split('.');
	var scope	= window;
	var lastScope = {};
	Z.each(names, function(name){
		if (!scope[name])
			scope[name] = {};

		lastScope = scope;
		scope = scope[name];
	});

	var lastName = names.pop();

	//	criando a classe
	var classe = function Base(config, voidObject){
		var me = this;
		if (!voidObject) {
			me.constructor(config);
		}
	};

	//	colocando um metodo constructor na classe
	classe.prototype.constructor = function(){ throw "{0} ainda não está carregado".format(className); };

	//	função que seta os dados de configs na classe
	classe.prototype.initConfig = function(){};

	//	fazendo com que todas as instâncias dela possa saber sua origem
	classe.prototype.origin = classe;

	//	definindo o nome da função
	classe.identification = classe.prototype.identification = className;

	//	avisando para a função de definição que está é uma classe vazia
	classe.empty = true;

	//	avisando ao Z que esta pertence a ele
	classe.isZ = classe.prototype.isZ = true;

	//	vinculando uma função na classe para receber um callback de
	//	quando todas suas dependências forem carregadas
	classe.onLoad = function(call){ classe.todo.push(call); };

	//	aqui ficaram armazenados os callbacks 
	classe.todo = [];

	//	declaro em escopo global
	return lastScope[lastName] = classe;
};

/**
 * Não quero que este prototipo exista no escopo global
 */
(function(){

	/**
	 * Esta classe é responsável por criar as outras classes
	 * utilizando os métodos setClass e getClass
	 */
	var Classe = function(name, definitions){
		var me = this;
		var classe;

		var RESERVADOS = [
			'extend', 'mixins', 'singleton', 'statics', 'requires', 'config'
		];

		//	este é o constructor da classe geradora de classes e não da classe gerada!!
		/**
		 * Executa cada um dos blocos para compor a classe, recebe
		 * por parâmetro o nome da classe a ser criada e depois as
		 * suas definições conforme o padrão descrito na documentação
		 */
		var constructor = function(){
			var existe = Z.exists(name);
			if (existe && !existe.empty) { throw "Uma classe com o nome {0} já foi definida".format(name); }

			//	lançando exceptions no caso de haver algo errado com as definições
			validarDefinicoes(definitions);

			//	declarando a classe
			classe = Z.declare(name);

			//	verificando se já existe uma classe com este nome
			if (!classe.empty)
				throw "Tentativa de declarar duas vezes a classe {0}".format(name);

			//	avisando que está classe já está sendo preparada e não pode ser redeclarada
			classe.empty = false;

			//	carregando suas dependências
			carregarDependencias(function(){

				//	fazendo com que ela tenha os metodos base de uma classe Z
				setarPadroesDaClasse();

				//	fazendo com que as escolhas do programador sejam aplicadas
				implementarDefinicoes();

				//	chamando os callbacks vinculados a ela para dizer que já
				//	está pronta para ser usada
				chamarCallbacks();
			});

			return classe;
		};

		/**
		 * Verificando se as definições entregues para serem aplicadas
		 * na classe estão OK
		 */
		var validarDefinicoes = function(){
			if (definitions === undefined)
				definitions = {};

			if (definitions instanceof Object) {
				if (definitions.hasOwnProperty('extend') && typeof definitions.extend != 'string')
					throw "O parâmetro de configuração 'extend' deve conter uma string.";

				if (definitions.hasOwnProperty('singleton') && typeof definitions.singleton != 'boolean')
					throw "O parâmetro de configuração 'singleton' deve conter uma valor booleano.";

				if (definitions.hasOwnProperty('requires')) {
					if (!definitions.requires instanceof Array)
						throw "O parâmetro de configuração 'requires' recebe um array de strings.";

					Z.each(definitions.requires, function(rec){
						if (typeof rec != 'string') {
							throw "O parâmetro de configuração 'requires' recebe um array de strings.";
						}
					});
				}

				var deveSerUmObjeto = "O parâmetro de configuração '{0}' recebe um objeto json";
				if (definitions.hasOwnProperty('statics') && !definitions.statics instanceof Object)
					throw deveSerUmObjeto.format('statics');

				if (definitions.hasOwnProperty('config') && !definitions.config instanceof Object)
					throw deveSerUmObjeto.format('config');

				if (definitions.hasOwnProperty('mixins')) {
					if (!definitions.mixins instanceof Object)
						throw deveSerUmObjeto.format('mixins');
						
					Z.each(definitions.mixins, function(value, key){
						if (typeof value != 'string')
							throw deveSerUmObjeto.format('mixins');
			
						if (typeof key != 'string')
							throw deveSerUmObjeto.format('mixins');
					});
				}
			} else {
				throw "As definições da classe devem ser entregues em um objeto json";	
			}
		};

		/**
		 * Acopla a classe alguns métodos que todas devem ter
		 */
		var setarPadroesDaClasse = function(){
			var constructBase = function constructor(config){
				this.initConfig(config);
			};

			classe.prototype.mixin			= {};
			adicionarMetodo('constructor', constructBase);
			adicionarMetodo('callParent', callParent);
			adicionarMetodo('initConfig', initConfig);
			adicionarMetodo('getParent', function(){ return { constructor: constructBase }; });

			//	metodo estatico que permite que outras classes leiam as configurações base desta
			classe.getDefinitions			= function(){ return definitions; };
		};

		/**
		 * Implementa as definições estabelecidas pelo programador
		 * considerando que tudo já está validado, as dependências
		 * foram chamadas
		 */
		var implementarDefinicoes = function(){
			//	primeiro fazer a extenção, se houver uma
			if (definitions.extend)
				estender();

			//	sobrescrevendo os metodos da extenção com os mixins
			if (definitions.mixins) {
				Z.each(definitions.mixins, function(mixinName, alias){
					misturar(alias, mixinName);
				});
			}

			//	vinculando a classe os métodos e atributos estáticos
			if (definitions.statics)
				setarMetodosEstaticos();

			if (definitions.config)
				setarConfigs();

			Z.each(definitions, function(call, nome){
				if (RESERVADOS.indexOf(nome) === -1)
					adicionarMetodo(nome, call);
			});
		};

		/**
		 * Antes da classe carregar, pode ser que tenha sido definido nela
		 * callbacks de coisas a serem executadas quando ela for alocada
		 * na memória, o metodo abaixo os evoca.
		 */
		var chamarCallbacks = function(){
			classe.onLoad = function(call){
				Z.call(call, [ classe ]);
			};

			Z.each(classe.todo, function(call){
				Z.call(call, [ classe ]);
			});
		};

		/**
		 * metodo que será vinculado a todas as classes
		 * para se chamar um metodo que foi sobrescrito
		 *	
		 *	constructor: function(){
		 *		//	chamada do constructor da classe pai
		 *		this.callParent(arguments);
		 *	}
		 */
		var callParent = function(args){
			var me		= this;
			var caller	= callParent.caller;
			var params	= args || [];

			if (!(params instanceof Array || params instanceof arguments.constructor) || false) {
				throw "Argumento inválido para chamada de 'callParent', envie Array ou Arguments";
			}

			var owner	= new caller.owner({}, true);
			var parent	= owner.getParent();
			var method	= parent[caller.identification];

			if (typeof method == 'function') {
				return method.apply(me, params);			
			} else {
				throw "O método '{0}' não está sobrescrevendo nenhum método da classe pai para que callParent seja chamado.".format(method);
			}
		};

		/**
		 * Por padrão o constructor base chama a inicialização
		 * das configurações, se o constructor for sobrescrito,
		 * ele perde este poder
		 */
		var initConfig = function(config){
			var me = this;

			if (config && config.constructor === Object) {
				Z.each(config, function(value, key){
					var setter = gerarNomeDoMetodo('set', key);
					if (typeof me[setter] == 'function') {
						me[setter](value);
					} else {
						me[key] = value;
					}
				});
			}
		};

		/**
		 * Antes que os metodos da classe sejam aplicados, antes que
		 * os mixins sejam aplicados, antes que ela extenda, as classes
		 * que ela depende para que isso aconteça, são chamadas para a
		 * memória 
		 */
		var carregarDependencias = function(call){
			var dependencias	= [];
			dependencias		= dependencias.concat(
				definitions.requires || []
			);
			delete definitions.dependencias;

			if (definitions.extend)
				dependencias.push(definitions.extend);

			if (definitions.mixins) {
				Z.each(definitions.mixins, function(value){
					dependencias.push(value);
				});
			}

			Z.Require(dependencias, call);
		};

		/**
		 * Aplica o conteúdo de definitions.static como atributos
		 * e métodos estáticos da classe
		 */
		var setarMetodosEstaticos = function(){
			Z.each(definitions.statics, function(value, attr){
				classe[attr] = value;
			});
		};

		/**
		 * Vincula um método aos objetos que serão gerados
		 * pela classe de forma que eles recebam antes os
		 * tratamentos devidos
		 */
		var adicionarMetodo = function(identification, call){
			if (call instanceof Object && call.constructor !== Function) {
				throw "{0}{1}{2}".format(
						"Você não pode criar um propriedade que tenha um objeto por valor padrão,",
						"isso fará com que todas as classes compartilhem da referência do mesmo.",
						"Adicione o objeto manualmente sobrescrevendo o metodo constructor."
					);
			};

			call.identification = identification;
			call.owner = classe;
			classe.prototype[identification] = call;
		};

		/**
		 * Gerando automaticamente os nomes dos métodos
		 * que irão trabalhar com os valores vinculados
		 * nas configs
		 */
		var gerarNomeDoMetodo = function(prefixo, atributo){
			var letra	= atributo[0].toUpperCase();
			atributo	= atributo.replace(/^./, letra);
			return "{0}{1}".format(prefixo, atributo);
		};

		/**
		 * Faz a aplicação das configs aos objetos que serão
		 * gerados e também cria os métodos que irão manipula-las
		 */
		var setarConfigs = function(){
			var config = definitions.config;

			if (config.constructor === Object) {

				Z.each(config, function(value, param){
					var _get		= gerarNomeDoMetodo("get", param),
						_set		= gerarNomeDoMetodo("set", param),
						_apply		= gerarNomeDoMetodo("apply", param),
						_update		= gerarNomeDoMetodo("update", param);

					var _param = "_{0}".format(param);

					adicionarMetodo(_get, function(){
						return this[_param];
					});

					adicionarMetodo(_apply, function(v){
						return v;
					});

					adicionarMetodo(_update, function(){

					});

					adicionarMetodo(_set, function(v){
						var old	= this[_param];
						v		= this[_apply](v, old);
						this[_param] = v;
						if (v !== old) {
							this[_update](v, old);
						}
					});

					classe.prototype[_param] = value;
				});
			}
		};

		/**
		 * Faz a extenção da classe que deve ser a classe pai,
		 * evitando que o constructor da classe pai seja chamado,
		 * garantindo que será chamados apenas através do constructor
		 * pelo método callParent(arguments)
		 */
		var estender = function(){
			var nomePai		= definitions.extend;

			//	pega a classe pai
			var classePai	= Z.exists(nomePai);

			if (classePai && classePai.isZ) {

				if (!classePai.singleton) {
					//	instância o pai
					var pai		= new classePai({}, true);

					//	metodo estaticos do pai sendo replicados para o filho
					var defPai	= classe.getDefinitions();
					if (defPai.statics) {
						//	primeiro crio um objeto vazio
						var stc = {};

						//	passo os metodos estaticos do pai para ele
						Z.apply(stc, defPai.statics);

						// depois sobrescrevo com os metodos do filho, caso ele
						// tenha algum metodo com o mesmo nome
						Z.apply(stc, definitions.statics);

						//	depois sobrescrevo os metodos antigos do filho com essa fusão
						definitions.statics = stc;
					}

					//	joga o pai no prototipo da classe
					classe.prototype = new classePai({}, true);

					//	sobreescrevendo método que são influênciados pela existência de uma extenção
					adicionarMetodo('getParent', function(){ return pai; });
					adicionarMetodo('constructor', function(){ this.callParent(arguments); });

					//	voltando alguns valores que foram sobrescritos pela extenção
					classe.prototype.identification = classe.identification;
					classe.prototype.origin = classe;
				} else {
					throw "Impossível estender da classe {0}, a classe é singleton.".format(nomeMix);
				}
			} else {
				throw "Impossível estender da classe {0}, a classe não foi declarada ou não é uma classe reconhecida".format(classePai);
			}
		};

		/**
		 * Aplica as classes os mixins, evitando que o constructor seja chamado
		 */
		var misturar = function(alias, nomeMix){
			//	pega o mixin
			var mixin	= Z.exists(nomeMix);

			if (mixin && mixin.isZ) {
				if (!mixin.singleton) {
					mixin.apply(classe, [ {}, true ]);
					mixinPuro = new mixin({}, true);
					classe.prototype.mixin[alias] = mixinPuro;
				} else {
					throw "Impossível fazer mixin com a classe {0}, a classe é singleton.".format(nomeMix);
				}
			} else {
				throw "Impossível fazer mixin com a classe {0}, a classe não foi declarada ou não é uma classe reconhecida".format(nomeMix);
			}
		};

		return constructor();
	};

	/**
	 * Encapsula o prototipo responsável por gerar as classes, assumindo no
	 * escopo global esta responsabilidade
	 */
	Z.define = function(name, definitions){
		return new Classe(name, definitions);
	};
})();

/**
 * Faz a instância de uma classe, garantindo que ela exista.
 */
Z.create = function(name, definitions){
	var obj;

	//	verificando se a classe já está carregada
	var classe = Z.exists(name);

	if (classe && classe.isZ && !classe.empty)
		obj = new classe(definitions);
	else
		Z.Require([ name ], function(){
			obj = new classe(definitions);
			console.warn('[{0}] carregada dinamicamente, operação de IO sincrona executada.'.format(name));
		}, true);

	return obj;
};

/**
 * Carrega uma classe
 */
Z.Loader = function(name, sync){
	if (typeof name != 'string')
		throw "O nome da classe deve ser uma string";

	if (sync === undefined)
		sync = false;

	//	verificando se a classe já está carregada
	var classe = Z.exists(name);
	if (classe && classe.isZ && !classe.empty)
		return;

	var arr			= name.split('.');
	var className	= arr.pop();
	var namespace;

	if (arr.length)
		namespace	= arr.shift();

	var path		= arr.join('/');
	if (path) 
		path		= "{0}/".format(path);
	path			= "{0}{1}.js".format(path, className);

	var namespacePath = '';
	if (namespace)
		namespacePath = window[namespace].path || '';

	path			= "{0}{1}".format(namespacePath, path);

	Z.http({
		url: path,
		sync: sync,
		success: function(xhr){
			var content = xhr.responseText;

			// try {
				eval(content);
			// } catch (e) {
			// 	throw "Impossível carregar sistema, a classe {0} contém erros".format(name);
			// }
		},

		failure: function(xhr){
			throw "Impossível carregar sistema, não foi possível carregar a classe {0}".format(name);
		}
	});
};

/**
 * Carrega um conjunto de classes
 */
Z.Require = function(requires, call, sync){
	if (!requires.length) { Z.call(call); return; }
	if (sync === undefined) { sync = false; }

	//	tendo certeza de que não vão acontecer duas ocorrencias da mesma classe
	var reqsLimpa = [];
	Z.each(requires, function(req){
		if (reqsLimpa.indexOf(req) == -1) {
			reqsLimpa.push(req);
		}
	});

	var carregarei	= reqsLimpa.length;
	var carregados	= 0;
	var quandoTerminar = function(){
		carregados++;
		if (carregarei == carregados)
			Z.call(call);
	};

	Z.each(reqsLimpa, function(req){
		var classe = Z.declare(req);
		classe.onLoad(quandoTerminar);
		Z.Loader(req, sync);
	});
};

/* *
 * Uma função de each decente, ele passa por todos os elementos do
 * array / objeto json e caso haja um return dentro (que seria o break)
 * a função each irá retornar o resultado
 */
Z.each = function(arr, callback){
	if (typeof arr.splice == 'function' && typeof arr.length == 'number') {
		for (var i = 0; i < arr.length; i++) {
			var isbreak = callback(arr[i], i);
			if (isbreak !== undefined) {
				return isbreak;
			}
		}
	} else {
		for (var key in arr) {
			if (arr.hasOwnProperty(key)) {
				var isbreak = callback(arr[key], key);
				if (isbreak !== undefined) {
					return isbreak;
				}
			}
		}
	}
};

/**
 * Clona um objeto simples, objetos que tem a si mesmo como um
 * de seus atributos irão causar recursão infinita
 */
Z.clone = function(json){

	//	null e não definido não se clonam
	if (json === null || json === undefined)
		return json;

	//	caso seja um objeto de data
	if (json.constructor === Date)
		return new Date(json.getTime());

	//	caseo seja um array
	if (json.constructor === Array){
		var i	= json.length;
		var arr	= new Array(i);
		while(i--) {
			arr[i] = Z.clone(json);
		}

		return arr;
	}

	//	caso seja um objeto json simples
	if (json.constructor === Object) {
		var novoJson = {};
		for (var key in json) {
			if (json.hasOwnProperty(key)) {
				novoJson[key] = Z.clone(key);
			}
		}
	}

	// se não for objeto, como um string, number, boolean
	if (!json instanceof Object)
		return json;

	console.warn("Possível clonar apenas objetos simples");
	return json;
};

Z.apply = function(json1, json2){
	if (!json1)
		json1 = {};

	if (!json2)
		json2 = {};

	if (json1.constructor !== Object)
		throw "Apply é executado apenas para objetos simples";

	if (json2.constructor !== Object)
		throw "Apply é executado apenas para objetos simples";

	Z.each(json2, function(val, key){
		json1[key] = val;
	});

	return json1;
};

/**
 * Evoca se for uma função
 * @param  {Function} func  Função ou possível função a ser evocada
 * @param  {Array/Arguments} args  Um array de argumentos que a função receberá por parâmetro 
 * @param  {Object} scope Escopo que a função terá
 */
Z.call = function(fn, args, scope){
	if (typeof fn == 'function')
		return fn.apply(scope, args);
};

/**
 * Efetua a operação de IO via http
 */
Z.http = function(args){
	if (args == undefined) { args = {}; }
	if (args.url == undefined) { args.url = location; }
	if (args.method == undefined) { args.method = 'get'; }
	if (args.sync == undefined) { args.sync = false; }
	
	if (args.params == undefined) { args.params = {}; }
	if (args.headers == undefined) { args.headers = {}; }

	if (args.success == undefined) { args.success = function(){}; }
	if (args.failure == undefined) { args.failure = function(){}; }
	if (args.callback == undefined) { args.callback = function(){}; }

	var xhr = new XMLHttpRequest();

	Z.each(args.headers, function(value, header){
		if (!header && !value) {
			xhr.setRequestHeader(header, value);
		}
	});

	xhr.onreadystatechange = function(){
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				args.success(xhr);
			} else {
				args.failure(xhr);
			}
			args.callback(xhr);
		}
	};

	var data = new FormData;
	Z.each(args.params, function(value, key){
		data.append(key, value)
	});

	xhr.open(args.method.toUpperCase(), args.url, !args.sync);
	xhr.send(data);
};

/**
 * Facilitando o trabalho com strings
 */
String.prototype.format = function(){
	var txt = this.valueOf();

	for (var i = 0; i < arguments.length; i++) {
		txt = txt.replace(new RegExp("[{]["+(i)+"][}]", "g"), arguments[i]);
	}

	return txt;
};

Array.prototype.format = function(str){
	return str.format.apply(this);
};