const request = require('request-promise');

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

	sendMessage(id, message) {
		return new Promise((resolve, reject) => {
			if (!id) throw new Error('The id of the recipient is not provided');
			if (!message) throw new Error('The message to send is not provided');

			const requestBody = {
				recipient: {
					id
				},
				message: {
					text: message
				}
			};

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
