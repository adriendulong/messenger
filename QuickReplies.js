const _ = require('lodash');

class QuickReplies {
	constructor() {
		this._qrs = [];
	}

	add(opts) {
		opts = opts || {};
		if (typeof opts !== 'object') throw new Error('input must be an object');

		let quickReply = {
			content_type: 'text'
		};
		if (!opts.title) quickReply.content_type = 'location';
		else {
			quickReply.title = opts.title;

			if (opts.payload) quickReply.payload = opts.payload;
			else quickReply.payload = quickReply.title;

			if (opts.image) quickReply.image_url = opts.image;

			if (quickReply.title.length > 20)
				quickReply.title = _.truncate(quickReply.title, {
					length: 20,
					omission: ''
				});
		}

		if (this._qrs.length < 11) this._qrs.push(quickReply);
		else
			throw new Error(
				'Too many quick replies. The number of quick replies for a message is limited to 11'
			);
		//TODO: force add, removing the first one

		return this._qrs;
	}

	get length() {
		return this._qrs.length;
	}

	get quickReplies() {
		return this._qrs;
	}
}

module.exports = QuickReplies;
