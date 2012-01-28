function InitLocale(text, locale) {
	Text = Text || {};

	document.write('<script type="text/javascript" src="resources/text/' + (locale || 'en') + '.js"></script>');

	text.title = function(key) {
		return Text.title[key] || '[Text.title.' + key + ']';
	}
	
	text.msg = function(key) {
		return Text.msg[key] || '[Text.msg.' + key + ']';
	}

	text.format = function(key) {
		return Text.format[key] || '[Text.format.' + key + ']';
	}
}
