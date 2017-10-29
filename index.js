const request = require('request-promise');
const QuickReplies = require('./QuickReplies');

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
		console.log(opts);
		return new Promise((resolve, reject) => {
			if (!id) throw new Error('The id of the recipient is not provided');
			if (!(typeof id === 'string')) throw new Error('The id must be a string');
			if (!opts) throw new Error('The content of the message is not provided');
			if (!(typeof opts === 'object'))
				throw new Error('The message input must be an object');

			let requestBody = {
				recipient: {
					id
				},
				message: {}
			};

			if (!opts.text && !opts.attachment)
				throw new Error(
					'You must provide at least a text or an attachment to send a message'
				);

			if (opts.text) requestBody.message.text = opts.text;

			if (opts.attachment) {
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

			console.log('TEST');
			if ('quickReplies' in opts) {
				console.log('QR');
				if (typeof opts.quickReplies !== 'QuickReplies')
					throw new Error('quickReplies must be of type QuickReplies');
			}

			this._send(requestBody)
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}

	_send(message) {
		return new Promise((resolve, reject) => {
			request
				.post({
					method: 'POST',
					qs: { access_token: this.token },
					uri: 'https://graph.facebook.com/v2.6/me/messages',
					body: message,
					json: true
				})
				.then(body => resolve(body))
				.catch(err => reject(err));
		});
	}
}

module.exports = Messenger;
