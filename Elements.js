const _ = require('lodash');

class Elements {
	constructor() {
		this._elements = [];
	}

	add(opts) {
		if (!opts) throw new Error('Need to provide at least a title');
		if (typeof opts !== 'object')
			throw new Error('Provide an object with at least a title');
		if (!opts.title) throw new Error('Provide at least a title');

		let element = {
			title: opts.title
		};

		if (opts.title.length > 80)
			element.title = _.truncate(opts.title, {
				length: 80,
				omission: ''
			});

		if (opts.subtitle) {
			element.subtitle = opts.subtitle;
			if (opts.subtitle.length > 80)
				element.subtitle = _.truncate(opts.subtitle, {
					length: 80,
					omission: ''
				});
		}

		if (opts.image) {
			element.image_url = opts.image;
		}

		if (opts.defaultUrl) {
			element.default_action = {
				type: 'web_url',
				url: opts.defaultUrl
			};
		}

		if (opts.buttons) {
			if (opts.buttons.length > 3) {
				throw new Error('The max of buttons that you can provide is 3');
			}

			if (opts.buttons.length > 0) {
				element.buttons = opts.buttons.buttons;
			}
		}

		this._elements.push(element);

		return this._elements;
	}

	get length() {
		return this._elements.length;
	}

	get elements() {
		return this._elements;
	}
}

module.exports = Elements;
