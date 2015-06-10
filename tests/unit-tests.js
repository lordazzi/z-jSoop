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
			main: 'Teste.main.Main'
		});
		setCorreto(teste);
	} catch (e) {
		setErro(teste);
	}

	if (Z.isBrowser) {
		window.scrollTo(0, document.documentElement.clientHeight);
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