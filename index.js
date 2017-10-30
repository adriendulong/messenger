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
		if (!opts.verify) {
			throw new Error('The verify must be provided');
		}
		if (typeof opts.verify !== 'string') {
			throw new Error('The verify must be a string');
		}

		this._token = opts.token;
		this._verify = opts.verify;
	}

	//SEND

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

	setTyping(id, isOn) {
		return new Promise((resolve, reject) => {
			if (typeof isOn !== 'boolean') throw new Error('isOn must be a boolean');
			const typing = isOn ? 'typing_on' : 'typing_off';

			this.sendAction(id, typing)
				.then(res => resolve(res))
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
					qs: { access_token: this._token },
					uri: 'https://graph.facebook.com/v2.6/me/messages',
					body: content,
					json: true
				})
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	//MESSENGER PROFILE API

	setGetStarted(payload) {
		return new Promise((resolve, reject) => {
			this._setMessengerProperties('get_started', {
				payload: payload
			})
				.then(result => resolve(result))
				.catch(err => reject(err));
		});
	}

	setGreetings(greetings) {
		return new Promise((resolve, reject) => {
			if (!Array.isArray(greetings))
				throw new Error('greetings must be an array');
			if (greetings.length === 0)
				throw new Error('The greetings array cant be empty');
			greetings.forEach(greeting => {
				if (!greeting.locale || !greeting.text)
					throw new Error('Each greeting must have a locale and a text');
			});

			this._setMessengerProperties('greeting', greetings)
				.then(result => resolve(result))
				.catch(err => reject(err));
		});
	}

	setWhitelistedDomains(domains) {
		return new Promise((resolve, reject) => {
			if (!Array.isArray(domains)) throw new Error('domains must be an array');
			if (domains.length === 0)
				throw new Error('The domains array cant be empty');
			if (domains.length > 10) throw new Error('Max whitelisted domains is 10');
			domains.forEach(domain => {
				if (typeof domain !== 'string')
					throw new Error('each domain must be a string');
			});

			this._setMessengerProperties('whitelisted_domains', domains)
				.then(result => resolve(result))
				.catch(err => reject(err));
		});
	}

	setPersistentMenu(menus) {
		return new Promise((resolve, reject) => {
			if (!menus) {
				this._deleteMessengerProperties(['persistent_menu'])
					.then(result => resolve(result))
					.catch(err => reject(err));
			} else {
				if (!Array.isArray(menus)) throw new Error('domains must be an array');

				this._setMessengerProperties('persistent_menu', menus)
					.then(result => resolve(result))
					.catch(err => reject(err));
			}
		});
	}

	_setMessengerProperties(property, value) {
		const url = 'https://graph.facebook.com/v2.6/me/messenger_profile';
		return new Promise((resolve, reject) => {
			const content = {};
			content[property] = value;

			request
				.post({
					qs: { access_token: this._token },
					uri: url,
					body: content,
					json: true
				})
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	_deleteMessengerProperties(properties) {
		const url = 'https://graph.facebook.com/v2.6/me/messenger_profile';
		if (!properties) throw new Error('Provide at least one property');
		if (!Array.isArray(properties))
			throw new Error('properties must be an array with at least one element');
		return new Promise((resolve, reject) => {
			request
				.delete({
					qs: { access_token: this._token },
					uri: url,
					body: {
						fields: properties
					},
					json: true
				})
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	//HANDOVER PROTOCOL

	passThread(id) {
		return new Promise((resolve, reject) => {
			if (!id)
				throw new Error(
					'You need to pass the id of the recipient that you want to pass the conversation'
				);
			//We pass to the inbox (app_id : 263902037430900)
			//TODO: let choose which app we need to pass to
			request
				.post({
					qs: { access_token: this._token },
					uri: 'https://graph.facebook.com/v2.6/me/pass_thread_control',
					body: {
						recipient: {
							id: id
						},
						target_app_id: '263902037430900'
					},
					json: true
				})
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	takeThread(id) {
		return new Promise((resolve, reject) => {
			if (!id)
				throw new Error(
					'You need to pass the id of the recipient that get the conversation thread'
				);
			request
				.post({
					qs: { access_token: this._token },
					uri: 'https://graph.facebook.com/v2.6/me/take_thread_control',
					body: {
						recipient: {
							id: id
						}
					},
					json: true
				})
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	// _getSecondaryReceivers() {
	// 	return new Promise((resolve, reject) => {
	// 		request({
	// 			qs: {
	// 				access_token: this._token,
	// 				fields: 'id,name'
	// 			},
	// 			uri: 'https://graph.facebook.com/v2.6/me/secondary_receivers',
	// 			json: true
	// 		})
	// 			.then(response => resolve(response))
	// 			.catch(err => reject(err));
	// 	});
	// }

	get token() {
		return this._token;
	}
}

module.exports = Messenger;
