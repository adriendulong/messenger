const Messenger = require('../');
const QuickReplies = require('../QuickReplies');
const nock = require('nock');

// Test the init of the class
describe('basic init', () => {
	let messenger;

	test('creating messenger is ok', () => {
		expect(() => {
			messenger = new Messenger({ token: 'tokenGiven' });
		}).not.toThrow();
	});

	test('messenger is an object', () => {
		expect(messenger).toBeInstanceOf(Object);
	});

	test('token is stored', () => {
		expect(messenger.token).toBe('tokenGiven');
	});

	test('messenger.sendMessage is a function', () => {
		expect(messenger.sendMessage).toBeInstanceOf(Function);
	});

	test('messenger._send is a function', () => {
		expect(messenger._send).toBeInstanceOf(Function);
	});
});

describe('problems in init', () => {
	test('messenger init without a token should throw', () => {
		expect(() => {
			new Messenger();
		}).toThrow('The page token must be provided');
	});

	test('the token provided is not a string', () => {
		expect(() => {
			new Messenger({ token: 123 });
		}).toThrow('The token must be a string');
	});
});

// Test the simple sendMessage function
describe('sendMessage : send a simple message', () => {
	const messenger = new Messenger({ token: 'fb' });

	test('must provide an id', () => {
		expect.assertions(1);
		return expect(messenger.sendMessage()).rejects.toBeDefined();
	});

	test('the id must be a string', () => {
		expect.assertions(1);
		return expect(
			messenger.sendMessage({ text: 'hello' })
		).rejects.toBeDefined();
	});

	test('the input must be provided', () => {
		expect.assertions(1);
		return expect(messenger.sendMessage('123')).rejects.toBeDefined();
	});

	test('the input must be an object', () => {
		expect.assertions(1);
		return expect(messenger.sendMessage('123', 'hello')).rejects.toBeDefined();
	});

	test('the input must contain at least a text or an attachment', () => {
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', { test: 'hello' })
		).rejects.toBeDefined();
	});

	test('send a text', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			message: {
				text: 'Hello!'
			}
		};

		const response = {
			recipient_id: '1000003',
			message_id: 'mid.1234567890'
		};

		nock('https://graph.facebook.com')
			.post('/v2.6/me/messages', payload)
			.query({
				access_token: messenger.token
			})
			.reply(200, response);

		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', { text: 'Hello!' })
		).resolves.toEqual(response);
	});

	test('when sending an attachment, must provide an url', () => {
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				attachment: {
					type: 'video'
				}
			})
		).rejects.toBeDefined();
	});

	test('when sending an attachment, must provide a type', () => {
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				attachment: {
					url: 'video'
				}
			})
		).rejects.toBeDefined();
	});

	test('The type provided in an attachment must be of type video, image, aurio or file', () => {
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				attachment: {
					url: 'video',
					type: 'sport'
				}
			})
		).rejects.toBeDefined();
	});

	test('send an attachment', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			message: {
				attachment: {
					type: 'video',
					payload: {
						url: 'http://cool.com'
					}
				}
			}
		};

		const response = {
			recipient_id: '1000003',
			message_id: 'mid.1234567890'
		};

		nock('https://graph.facebook.com')
			.post('/v2.6/me/messages', payload)
			.query({
				access_token: messenger.token
			})
			.reply(200, response);

		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				attachment: {
					type: 'video',
					url: 'http://cool.com'
				}
			})
		).resolves.toEqual(response);
	});

	test('send text and attachment', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			message: {
				text: 'hello',
				attachment: {
					type: 'video',
					payload: {
						url: 'http://cool.com'
					}
				}
			}
		};

		const response = {
			recipient_id: '1000003',
			message_id: 'mid.1234567890'
		};

		nock('https://graph.facebook.com')
			.post('/v2.6/me/messages', payload)
			.query({
				access_token: messenger.token
			})
			.reply(200, response);

		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				text: 'hello',
				attachment: {
					type: 'video',
					url: 'http://cool.com'
				}
			})
		).resolves.toEqual(response);
	});

	test('Quick Replies must be provided as an array', () => {
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				attachment: {
					type: 'video'
				},
				quickReplies: 'hi'
			})
		).rejects.toBeDefined();
	});

	test('Quick Replies pass', () => {
		const qrs = new QuickReplies();
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				attachment: {
					type: 'video'
				},
				quickReplies: qrs
			})
		).rejects.toBeDefined();
	});
});
