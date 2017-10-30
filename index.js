const request = require('request-promise');
const QuickReplies = require('./QuickReplies');
const Buttons = require('./Buttons');

class Messenger {
	constructor(opts) {
		opts = opts || {};
		if (!opts.token) {
			throw new Error('The page token must be provided');
		}
		if (typeof opts.token !== 'string') {
			throw new Error('The token must be a string');
		}

		this.token = opts.token;
	}

	sendMessage(id, opts) {
		return new Promise((resolve, reject) => {
			let requestBody = this._buildRecipientBase(id);

			if (!opts) throw new Error('The content of the message is not provided');
			if (!(typeof opts === 'object'))
				throw new Error('The message input must be an object');

			requestBody.message = {};

			if (!opts.text && !opts.attachment && !opts.buttons)
				throw new Error(
					'You must provide at least a text, attachment, or buttons to send a message'
				);

			if (opts.buttons) {
				if (!(opts.buttons instanceof Buttons))
					throw new Error('buttons must be of type Buttons');
				if (opts.buttons.length < 1 || opts.buttons.length > 3) {
					throw new Error('You must provide between 1 and 3 buttons');
				}
				if (!opts.text) throw new Error('You must provide some text');

				requestBody.message.attachment = {
					type: 'template',
					payload: {
						template_type: 'button',
						text: opts.text,
						buttons: opts.buttons.buttons
					}
				};
			} else if (opts.text) requestBody.message.text = opts.text;

			if (opts.attachment && !opts.buttons) {
				if (!opts.attachment.url)
					throw new Error('For an attachment, you must provide an url');
				if (!opts.attachment.type)
					throw new Error('For an attachment, you must provide a type');
				if (!['audio', 'video', 'image', 'file'].includes(opts.attachment.type))
					throw new Error(
						'The type of the attachment must be one of these : audio, video, image, file'
					);

				requestBody.message.attachment = {
					type: opts.attachment.type,
					payload: {
						url: opts.attachment.url
					}
				};
			}

			if ('quickReplies' in opts && !opts.buttons) {
				if (!(opts.quickReplies instanceof QuickReplies))
					throw new Error('quickReplies must be of type QuickReplies');
				if (opts.quickReplies.length > 0) {
					requestBody.message.quick_replies = opts.quickReplies.quickReplies;
				}
			}

			this._send(requestBody)
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	sendAction(id, action) {
		return new Promise((resolve, reject) => {
			const actions = ['mark_seen', 'typing_on', 'typing_off'];
			let message = this._buildRecipientBase(id);

			if (!action)
				throw new Error(
					'Provide an action in this list: mark_seen, typing_on, typing_off'
				);
			if (!actions.includes(action))
				throw new Error(
					'The action must be one of these: mark_seen, typing_on, typing_off'
				);

			message.sender_action = action;

			this._send(message)
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	sendGenericTempalte(id, elements, opts) {
		return new Promise((resolve, reject) => {
			let message = this._buildRecipientBase(id);

			if (!elements)
				throw new Error(
					'You must provide at least one, and max 10 elements to build a generic template'
				);
			if (elements.length > 10 || elements.length === 0)
				throw new Error(
					'You must provide at least one, and max 10 elements to build a generic template'
				);

			message.message = {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'generic'
					}
				}
			};

			if (opts) {
				if (opts.sharable) {
					if (typeof opts.sharable !== 'boolean')
						throw new Error('The sharable attribute must be a boolean');
					message.message.attachment.payload.sharable = opts.sharable;
				}

				if (opts.imageRatio) {
					if (!['horizontal', 'square'].includes(opts.imageRatio))
						throw new Error(
							'The imageRatio can be either horizontal or square.'
						);
					message.message.attachment.payload.image_aspect_ratio =
						opts.imageRatio;
				}
			}

			message.message.attachment.payload.elements = elements.elements;

			this._send(message)
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	_buildRecipientBase(id) {
		if (!id) throw new Error('Provide the id of the recipient');
		if (typeof id !== 'string') throw new Error('Id must be a string');

		return {
			recipient: {
				id: id
			}
		};
	}

	_send(content) {
		return new Promise((resolve, reject) => {
			request
				.post({
					method: 'POST',
					qs: { access_token: this.token },
					uri: 'https://graph.facebook.com/v2.6/me/messages',
					body: content,
					json: true
				})
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}
}

module.exports = Messenger;
