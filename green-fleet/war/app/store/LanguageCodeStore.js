Ext.define('GreenFleet.store.LanguageCodeStore', {
	extend : 'Ext.data.Store',
	
	fields : [{
		name : 'value',
		type : 'string'
	}, {
		name : 'display',
		type : 'string'
	}],
	
	data : [{
		value : 'en',
		display : T('language.en')
	}, {
		value : 'ko',
		display : T('language.ko')
	}, {
		value : 'cn',
		display : T('language.cn')
	}]
});