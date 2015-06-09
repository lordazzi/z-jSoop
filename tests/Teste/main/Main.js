Z.define('Teste.main.Main', {
	mixins: {
		'cls2': 'Teste.main.Classe2'
	},

	propriedade: null,

	config: {
		porco: 10
	},

	constructor: function(){
		this.callParent();
		this.propriedade = [];
	},

	beicu: function(){
		return 'uhum... beicu mesmo'
	}
});