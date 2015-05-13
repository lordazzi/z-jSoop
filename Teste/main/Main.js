Z.define('Teste.main.Main', {
	mixins: {
		'cls2': 'Teste.main.Classe2'
	},

	propriedade: [],

	config: {
		porco: 10
	},

	constructor: function(){
		this.callParent();
	},

	beicu: function(){
		return 'uhum... beicu mesmo'
	}
});