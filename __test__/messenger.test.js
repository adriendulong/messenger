const Messenger = require('../');
const QuickReplies = require('../QuickReplies');
const Buttons = require('../Buttons');
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

	test('the input must contain at least a text or an attachment or objects', () => {
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

	test('The type provided in an attachment must be of type video, image, audio or file', () => {
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

	test('Buttons must be instance of the classe Buttons', () => {
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', { buttons: 'coucou' })
		).rejects.toEqual(new Error('buttons must be of type Buttons'));
	});

	test('must provide at least one button', () => {
		const buttons = new Buttons();
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', { buttons: buttons })
		).rejects.toEqual(new Error('You must provide between 1 and 3 buttons'));
	});

	test('must provide max 3 buttons', () => {
		const buttons = new Buttons();
		buttons.add({ title: 'hello', url: 'http' });
		buttons.add({ title: 'hello', url: 'http' });
		buttons.add({ title: 'hello', url: 'http' });
		buttons.add({ title: 'hello', url: 'http' });
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', { buttons: buttons })
		).rejects.toEqual(new Error('You must provide between 1 and 3 buttons'));
	});

	test('must some text with the buttons', () => {
		const buttons = new Buttons();
		buttons.add({ title: 'hello', url: 'http' });
		buttons.add({ title: 'hello', url: 'http' });
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', { buttons: buttons })
		).rejects.toEqual(new Error('You must provide some text'));
	});

	// Test to send a button template
	test('Send a message with buttons and text', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			message: {
				attachment: {
					type: 'template',
					payload: {
						template_type: 'button',
						text: 'hello',
						buttons: [
							{
								type: 'web_url',
								url: 'http',
								title: 'hello'
							},
							{
								type: 'postback',
								payload: 'hello',
								title: 'hello'
							}
						]
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

		const buttons = new Buttons();
		buttons.add({ title: 'hello', url: 'http' });
		buttons.add({ title: 'hello', postback: 'hello' });
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				buttons: buttons,
				text: 'hello'
			})
		).resolves.toEqual(response);
	});

	test('Quick Replies must be provided as an array', () => {
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				attachment: {
					type: 'video',
					url: 'http'
				},
				quickReplies: 'hi'
			})
		).rejects.toBeDefined();
	});

	// Test an empty QuickReplies
	test('Quick Replies empty pass', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			message: {
				attachment: {
					type: 'video',
					payload: {
						url: 'http'
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

		const qrs = new QuickReplies();
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				attachment: {
					type: 'video',
					url: 'http'
				},
				quickReplies: qrs
			})
		).resolves.toEqual(response);
	});

	test('Quick Replies pass', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			message: {
				text: 'hello',
				quick_replies: [
					{
						content_type: 'text',
						title: 'hello',
						payload: 'hello'
					}
				]
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

		const qrs = new QuickReplies();
		qrs.add({ title: 'hello' });
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				text: 'hello',
				quickReplies: qrs
			})
		).resolves.toEqual(response);
	});

	test('Handle send a message error', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			message: {
				text: 'hello',
				quick_replies: [
					{
						content_type: 'text',
						title: 'hello',
						payload: 'hello'
					}
				]
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
			.reply(403, 'error');

		const qrs = new QuickReplies();
		qrs.add({ title: 'hello' });
		expect.assertions(1);
		return expect(
			messenger.sendMessage('123', {
				text: 'hello',
				quickReplies: qrs
			})
		).rejects.toBeDefined();
	});
});

describe('Send action', () => {
	const messenger = new Messenger({ token: 'foo' });
	test('send empty', () => {
		expect.assertions(1);
		return expect(messenger.sendAction()).rejects.toBeDefined();
	});

	test('send only id', () => {
		expect.assertions(1);
		return expect(messenger.sendAction('123')).rejects.toBeDefined();
	});

	test('send not known action', () => {
		expect.assertions(1);
		return expect(messenger.sendAction('123', 'hello')).rejects.toBeDefined();
	});

	test('Success in sending action', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			sender_action: 'mark_seen'
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
		return expect(messenger.sendAction('123', 'mark_seen')).resolves.toEqual(
			response
		);
	});

	test('manage error in request', () => {
		const payload = {
			recipient: {
				id: '123'
			},
			sender_action: 'mark_seen'
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
			.reply(403, 'error');

		expect.assertions(1);
		return expect(
			messenger.sendAction('123', 'mark_seen')
		).rejects.toBeDefined();
	});
});
