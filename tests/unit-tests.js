function testes() {
	var err;


	/**
	 * Testes simples
	 */
	err = "Criar uma classe que sobrescreve o contructor e tem um config.";
	try {
		Z.define('Teste1', {
			config: {
				atributo: 10
			},

			constructor: function(){
				this.valor = 10;
			}
		});
		setCorreto(err);
	} catch (e) {
		setErro(err);
	}

	try {
		var t = new Z.global.Teste1({ atributo: 11 });
		is(t instanceof Z.global.Teste1, true, "Se 't' é instância de 'Teste1'");
		is(t.valor, 10, "Construtor da classe deve ser executado na instância");
		is(t.getAtributo(), 10, "Constructor sobrescrito não deve chamar initConfig");					
	} catch (e) {
		setErro(e.stack);
	}

	err = 'Não pode declarar duas vezes a mesma classe';
	try {
		Z.define('Teste1');
		setErro(err);
	} catch (e) {
		setCorreto(err);
	}

	try {
		Z.define('Pai', {
			config: {
				atributo: 10,

				fumiga: 'sim'
			},

			constructor: function(){
				this.callParent(arguments);
			},

			getPaçoca: function(){
				return "amobeico";
			},

			getPresunto: function(){
				return "toma um presunto";
			},

			amoBeico: function(){
				return "e paçoca";
			}
		});
	} catch (e) {
		setErro("Não foi possível criar uma classe com metodos simples");
	}

	try {
		var pai = new(Pai);
		is(pai.getAtributo(), 10, "callParent deve chamar o constructor do objeto base quando não se trata de uma extenção");

		pai.setAtributo(5);
		is(pai.getAtributo(), 5, "Setar atributos.");

		pai.applyAtributo = function(v){
			return String(v);
		};

		pai.setAtributo(5);
		is(pai.getAtributo(), '5', "Ajuste de dados por apply funcionando.");

		var pai = new Pai({ fumiga: 'naum' });
		is(pai.getFumiga(), 'naum', 'Sobrescrevendo os valores defaults do config');
		is(pai.getAtributo(), 10, 'Sobrescrição de um atributo não anula de um outro nada haver');
	} catch (e) {
		setErro(e.stack);
	}

	/**
	 * Testes com herança
	 */
	try {
		Z.define('Filho', {
			extend: 'Pai',

			config: {
				carro: 'Fusca',

				etnia: 'Indiu'
			},

			getPaçoca: function(){
				return "ovu";
			},

			amoBeico: function(){
				return this.callParent(arguments);
			}
		});
	} catch (e) {
		setErro('Extender de pai que tenha o constructor sobrescrito');
	}

	try {
		var filho = new Filho({ etnia: 'Afro canadense' });

		is(filho instanceof Pai, true, 'Se filho é instância de Pai');
		is(filho.amoBeico(), 'e paçoca', "Sobrescrever o método e chamar dentro dele o método sobrescrito.");
		is(filho.getPresunto(), 'toma um presunto', 'Executando método herdado.');
		is(filho.getPaçoca(), 'ovu', "Polimorfismo.");
		is(filho.getCarro(), 'Fusca', 'Filho gerando metodos automaticos do config');
		is(filho.getAtributo(), 10, 'Usando os metodos gerados automaticamente no pai');
		is(filho.getEtnia(), 'Afro canadense', 'Se as configurações são aplicadas quando são diferentes do default');
	} catch (e) {
		setErro(e.stack);
	}

	try {
		Z.define('Neto', {
			extend: 'Filho',

			amoBeico: function(){
				return this.callParent(arguments);
			}
		});
	} catch (e) {
		setErro(e.stack);
	}

	try {
		var neto = new Neto;
		is(neto.amoBeico(), 'e paçoca', 'Terceiro nível de herança chamando o metodo avô com callParent');
	} catch (e) {
		setErro(e.stack);
	}

	/**
	 * Testes de simblings
	 */
	try {
		Z.define('Irmao', {
			mixins: {
				'mano': 'Filho'
			},

			amoBeico: function(){
				return this.mixins.mano.amoBeico();
			},

			getPaçoca: function(){
				return 'batata';
			}
		});
	} catch (e) {
		setErro('Criando classe com mixin');
	}

	try {
		var irmao = new Irmao();
		is(irmao.getPresunto(), 'toma um presunto', 'Chamando método do irmão');
		is(irmao.amoBeico(), 'e paçoca', 'Delegando para o metodo do mixin');
		is(irmao.getPaçoca(), 'batata', 'Sobrescrevendo o método do mixin');
	} catch (e) {
		setErro(e.stack);
	}

	try {
		Z.define('Mae', {
			config: {
				configuracao: 10,

				batata: 'um poko'
			},

			verTelevisao: function(){
				return "to indo";
			},

			applyConfiguracao: function(v){
				return String(v);
			},

			amoBeico: function(){
				return 'beiké ma deliça';
			},
		});

		Z.define('meioIrmao', {
			extend: 'Mae',

			config: {
				braco: 'direito',

				perna: 'esquerda'
			},

			mixins: {
				'manin': 'Irmao'
			}
		});
	} catch (e) {
		setErro(e.stack);
	}

	var meioirmao = Z.create('meioIrmao');
	is(meioirmao.amoBeico(), 'beiké ma deliça', 'Herança com mixin, verificando se o método da herança é chamado.');

	/**
	 * Testando metodos estaticos
	 */
	Z.define('Estatico', {
		statics: {
			banana: function(){
				return 'banana';
			},

			terricota: 'pie'
		},

		propriedade: 20
	});

	try {
		var estc = new Estatico({ propriedadeNaoDeclarada: 30 });
	} catch (e) {
		setErro(e);
	}

	is(Estatico.terricota, 'pie', 'Atributo estatico');
	is(Estatico.banana(), 'banana', 'Método estatico');
	is(estc.propriedade, 20, 'Propriedade');
	is(estc.propriedadeNaoDeclarada, 30, 'Propriedade atribuida na instância');

	var teste = "Fluxo de sucesso para criação de aplicação";
	try {
		Z.defineApp({
			name: 'Teste',
			path: 'Teste',
			main: 'Teste.main.Main',
			onLauch: function(){
				setCorreto('Executando onLauch');
			}
		});
		setCorreto(teste);
	} catch (e) {
		setErro(teste);
	}

	try {
		var teste = 'Declarar classe singleton';
		Z.define('MeuSingleton', {
			singleton: true,

			config: {
				batata: 'frita'
			},

			beico: 10,

			metodo: function(){
				return true;
			}
		});

		setCorreto(teste);
	} catch (e) {
		setErro(teste);
	}

	is(MeuSingleton.beico, 10, 'Vinculo de uma propriedade com uma classe singleton');
	is(MeuSingleton.metodo(), true, 'Vinculo de um método com uma classe singleton');
	is(MeuSingleton.getBatata(), 'frita', 'Geração de método através de propriedades');

	Z.define('MixMe', {
		config: {
			mixConfig: 10
		},

		statics: {
			mixPropriedade: 8
		},

		mixMetodo: function(){
			return true;
		}
	});

	Z.define('OutroMix', {
		config: {
			sim: true
		}
	});

	Z.define('Beicosamente', {

		config: {
			oi: 10
		},

		statics: {
			beico: 'sim'
		}
	});

	Z.define('Porco', {

		statics: {
			vinagre: 'oi'
		}
	});

	//
	Z.define('ClasseTataravo', {
		mixins: [
			'Porco'
		],

		tataraMetodo: function(){
			return true;
		}
	});

	Z.define('ClasseBisavo', {
		extend: 'ClasseTataravo',

		mixins: {
			'mixme': 'MixMe'
		},

		bisaMetodo: function(){
			return true;
		}
	});

	Z.define('ClasseAvo', {
		extend: 'ClasseBisavo',

		mixins: [
			'Beicosamente'
		],

		avoMetodo: function(){
			return true;
		}
	});

	Z.define('ClassePai', {
		extend: 'ClasseAvo',

		mixins: {
			'outro': 'OutroMix'
		},

		paiMetodo: function(){
			return true;
		}
	});

	Z.define('ClasseFilho', {
		extend: 'ClassePai',

		filhoMetodo: function(){
			return true;
		}
	});

	var filho = Z.create('ClasseFilho');
	is(filho.mixins.mixme, MixMe.prototype, "Herança de mixins de classes de hierarquias muito distantes");
	is(filho.mixins.outro, OutroMix.prototype, "Herança de mixins de classes de hierarquias muito distantes");
	is(filho.getMixConfig(), 10, "Herança de método de mixin de classe de herança distante");
	is(filho.getSim(), true, "Herança de método de mixin de classe de herança distante");
	is(ClasseFilho.mixPropriedade, 8, "Herança de propriedades estáticas de mixins aplicados a classes pai");

	is(ClasseAvo.beico, 'sim', "Atributo estático em objeto que recebeu diretamente um mixin definido em array");
	is(ClasseFilho.beico, 'sim', "Herança de uma classe que tenha a propriedade estática de mixin definido em array");
	is(Z.create('ClasseFilho').getOi(), 10, "Herança de configs de mixin vinculado ao pai usando array");
	is(ClasseFilho.vinagre, 'oi', "Se os mixins das classes filhas declaradas por array não sobrescrevem as classes mixins herdadas");

	Z.define('Vermelho', {
		statics: {
			estatico: 10,

			coloracao: 'avermelhado',

			propriedade: true,

			verde: null
		},

		constructor: function(){
			var me = this;
			is(me.origin.propriedade, false, 'Quando mixin se acessa, o valor de suas propriedades estáticas devem ser os valores da classe que o extendeu');
		},

		config: {
			r: 0,

			g: 0,

			b: 0
		}
	});

	Z.define('Tomate', {
		mixins: {
			'cor': 'Vermelho'
		},

		statics: {
			estatico: 11,

			verde: 'um pouco',

			estrategia: 'legal'
		}
	});

	Z.define('Pizza', {
		statics: {
			propriedade: false,

			verde: 'nem sempre'
		},

		mixins: {
			'tomate': 'Tomate'
		},

		constructor: function(){
			var me = this;
			me.mixins.cor.constructor.apply(me, arguments);
		}
	});

	var pizza = new Pizza;
	is(pizza.mixins.cor, Vermelho.prototype, 'Se há herança de mixins que pertencem a outros mixins');
	is(Pizza.coloracao, 'avermelhado', 'Herdando propriedade estática de mixin do mixin');
	is(Pizza.estrategia, 'legal', 'Herdando propriedade estática do mixin');
	is(Tomate.estatico, 11, 'Sobrescrevendo propriedade estática do mixin do mixin');
	is(Pizza.estatico, 11, 'Mixin sobrescrevendo valor da propriedade estatica de seu mixin');
	is(Pizza.verde, 'nem sempre', 'Classe sobrescrevendo valor da propriedade estatica que o mixin herdou do mixin');


	Z.define('MolhoDeTomate', {
		extend: 'Tomate',

		statics: {
			estatico: 12
		}
	});

	is(MolhoDeTomate.estatico, 12, 'Classe sobrescrevendo as propriedades estáticas do pai');
	is(MolhoDeTomate.verde, 'um pouco', 'Classe lendo as propriedades estáticas que o pai sobrescreveu do mixin');
	is(MolhoDeTomate.estrategia, 'legal', 'Classe lendo as propriedades que são unicamente do pai');
	is(MolhoDeTomate.coloracao, 'avermelhado', 'Classe lendo as propriedades estáticas do mixin do pai');

	if (Z.isBrowser) {
		window.scrollTo(0, document.documentElement.clientHeight + 1000);
	}
}

function runTestes() {
	try {
		testes();
	} catch (e) {
		setErro(e);
	}
}

//	rodando os testes
if (Z.isBrowser) {
	Z.global.onload = runTestes;
} else {
	runTestes.apply(Z.global);
}