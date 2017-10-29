class Buttons {
	constructor() {
		this._buttons = [];
	}

	add(opts) {
		opts = opts || {};
		if (typeof opts !== 'object') throw new Error('input must be an object');

		if (!opts.title) throw new Error('Need a title for the button');
		if (typeof opts.title !== 'string')
			throw new Error('The title of the button must be a string');
		let button = {
			title: opts.title
		};

		if (!opts.url && !opts.postback)
			throw new Error('Provide either an url, or a postback');

		if (opts.url) {
			button.url = opts.url;
			button.type = 'web_url';
		} else if (opts.postback) {
			button.payload = opts.postback;
			button.type = 'postback';
		}

		this._buttons.push(button);

		return this._buttons;
	}

	get length() {
		return this._buttons.length;
	}

	get buttons() {
		return this._buttons;
	}
}

module.exports = Buttons;
