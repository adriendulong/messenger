const Messenger = require('../');
const QuickReplies = require('../QuickReplies');
const Buttons = require('../Buttons');
const Elements = require('../Elements');
const nock = require('nock');

// Test the init of the class
describe('CLASS', () => {
	describe('basic init', () => {
		let messenger;

		test('creating messenger is ok', () => {
			expect(() => {
				messenger = new Messenger({ token: 'tokenGiven', verify: 'foo' });
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

		test('messenger init without a verify should throw', () => {
			expect(() => {
				new Messenger({ token: '123' });
			}).toThrow('The verify must be provided');
		});

		test('the verify provided is not a string', () => {
			expect(() => {
				new Messenger({ token: '123', verify: 123 });
			}).toThrow('The verify must be a string');
		});
	});
});

describe('SEND API', () => {
	// Test the simple sendMessage function
	describe('sendMessage : send a simple message', () => {
		const messenger = new Messenger({ token: 'foo', verify: 'foo' });

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
			return expect(
				messenger.sendMessage('123', 'hello')
			).rejects.toBeDefined();
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
					access_token: messenger._token
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
		const messenger = new Messenger({ token: 'foo', verify: 'foo' });
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
					access_token: messenger._token
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
					access_token: messenger._token
				})
				.reply(403, 'error');

			expect.assertions(1);
			return expect(
				messenger.sendAction('123', 'mark_seen')
			).rejects.toBeDefined();
		});
	});

	describe('Set Typing', () => {
		const messenger = new Messenger({ token: 'foo', verify: 'foo' });
		test('isOn must be a boolean', () => {
			expect.assertions(1);
			return expect(messenger.setTyping('123', 'mark_seen')).rejects.toEqual(
				new Error('isOn must be a boolean')
			);
		});

		test('typing on', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				sender_action: 'typing_on'
			};

			const response = {
				recipient_id: '1000003',
				message_id: 'mid.1234567890'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messages', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);
			return expect(messenger.setTyping('123', true)).resolves.toEqual(
				response
			);
		});

		test('typing off', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				sender_action: 'typing_off'
			};

			const response = {
				recipient_id: '1000003',
				message_id: 'mid.1234567890'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messages', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);
			return expect(messenger.setTyping('123', false)).resolves.toEqual(
				response
			);
		});

		test('catch error', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				sender_action: 'typing_off'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messages', payload)
				.query({
					access_token: messenger._token
				})
				.reply(400, 'error');
			return expect(messenger.setTyping('123', false)).rejects.toBeDefined();
		});
	});

	describe('Send Generic templates', () => {
		const messenger = new Messenger({ token: 'foo', verify: 'foo' });
		test('Must provide the id of the recipient', () => {
			expect.assertions(1);
			return expect(messenger.sendGenericTempalte()).rejects.toEqual(
				new Error('Provide the id of the recipient')
			);
		});

		test('The id of the recipient must be a string', () => {
			expect.assertions(1);
			return expect(messenger.sendGenericTempalte(123)).rejects.toEqual(
				new Error('Id must be a string')
			);
		});

		test('Must provide elements', () => {
			expect.assertions(1);
			return expect(messenger.sendGenericTempalte('123')).rejects.toEqual(
				new Error(
					'You must provide at least one, and max 10 elements to build a generic template'
				)
			);
		});

		test('Must provide at least one element', () => {
			const elements = new Elements();
			expect.assertions(1);
			return expect(
				messenger.sendGenericTempalte('123', elements)
			).rejects.toEqual(
				new Error(
					'You must provide at least one, and max 10 elements to build a generic template'
				)
			);
		});

		test('Max 10 elements', () => {
			expect.assertions(1);
			const elements = new Elements();
			let i = 0;
			while (i < 15) {
				i++;
				elements.add({ title: 'hello' });
			}
			return expect(
				messenger.sendGenericTempalte('123', elements)
			).rejects.toEqual(
				new Error(
					'You must provide at least one, and max 10 elements to build a generic template'
				)
			);
		});

		test('Sharable opts must be a boolean', () => {
			expect.assertions(1);
			const elements = new Elements();
			let i = 0;
			while (i < 3) {
				i++;
				elements.add({ title: 'hello' });
			}
			return expect(
				messenger.sendGenericTempalte('123', elements, { sharable: 'coucou' })
			).rejects.toEqual(new Error('The sharable attribute must be a boolean'));
		});

		test('imageRatio opts must be either horizontal or square', () => {
			expect.assertions(1);
			const elements = new Elements();
			let i = 0;
			while (i < 3) {
				i++;
				elements.add({ title: 'hello' });
			}
			return expect(
				messenger.sendGenericTempalte('123', elements, { imageRatio: 'hello' })
			).rejects.toEqual(
				new Error('The imageRatio can be either horizontal or square.')
			);
		});

		test('Send with elements and no options', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				message: {
					attachment: {
						type: 'template',
						payload: {
							template_type: 'generic',
							elements: [
								{
									title: 'hello'
								},
								{
									title: 'hello'
								},
								{
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
					access_token: messenger._token
				})
				.reply(200, response);
			const elements = new Elements();
			let i = 0;
			while (i < 3) {
				i++;
				elements.add({ title: 'hello' });
			}
			return expect(
				messenger.sendGenericTempalte('123', elements)
			).resolves.toEqual(response);
		});

		test('Send with elements and sharable option', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				message: {
					attachment: {
						type: 'template',
						payload: {
							template_type: 'generic',
							sharable: true,
							elements: [
								{
									title: 'hello'
								},
								{
									title: 'hello'
								},
								{
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
					access_token: messenger._token
				})
				.reply(200, response);
			const elements = new Elements();
			let i = 0;
			while (i < 3) {
				i++;
				elements.add({ title: 'hello' });
			}
			return expect(
				messenger.sendGenericTempalte('123', elements, { sharable: true })
			).resolves.toEqual(response);
		});

		test('Send with elements and imageRatio option', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				message: {
					attachment: {
						type: 'template',
						payload: {
							template_type: 'generic',
							image_aspect_ratio: 'square',
							elements: [
								{
									title: 'hello'
								},
								{
									title: 'hello'
								},
								{
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
					access_token: messenger._token
				})
				.reply(200, response);
			const elements = new Elements();
			let i = 0;
			while (i < 3) {
				i++;
				elements.add({ title: 'hello' });
			}
			return expect(
				messenger.sendGenericTempalte('123', elements, { imageRatio: 'square' })
			).resolves.toEqual(response);
		});

		test('Handle request error', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				message: {
					attachment: {
						type: 'template',
						payload: {
							template_type: 'generic',
							image_aspect_ratio: 'square',
							elements: [
								{
									title: 'hello'
								},
								{
									title: 'hello'
								},
								{
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
					access_token: messenger._token
				})
				.reply(403, 'Problem');
			const elements = new Elements();
			let i = 0;
			while (i < 3) {
				i++;
				elements.add({ title: 'hello' });
			}
			return expect(
				messenger.sendGenericTempalte('123', elements, { imageRatio: 'square' })
			).rejects.toBeDefined();
		});
	});
});

describe('MESSENGER PROFILE API', () => {
	describe('Set Get Started payload', () => {
		const messenger = new Messenger({ token: 'foo', verify: 'foo' });
		test('regular set', () => {
			expect.assertions(1);
			const payload = {
				get_started: {
					payload: 'GET_STARTED'
				}
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);

			return expect(messenger.setGetStarted('GET_STARTED')).resolves.toEqual(
				response
			);
		});

		test('manage error', () => {
			expect.assertions(1);
			const payload = {
				get_started: {
					payload: 'GET_STARTED'
				}
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(403, response);

			return expect(
				messenger.setGetStarted('GET_STARTED')
			).rejects.toBeDefined();
		});
	});

	describe('Set Greetings', () => {
		const messenger = new Messenger({ token: 'foo', verify: 'foo' });
		test('greetings must be an array', () => {
			expect.assertions(1);
			return expect(messenger.setGreetings('hello')).rejects.toEqual(
				new Error('greetings must be an array')
			);
		});

		test('greetings array must not be empty', () => {
			expect.assertions(1);
			return expect(messenger.setGreetings([])).rejects.toEqual(
				new Error('The greetings array cant be empty')
			);
		});

		test('greetings elements must have a locale and a text. No text will throw error', () => {
			expect.assertions(1);
			return expect(
				messenger.setGreetings([{ locale: 'fr_FR' }])
			).rejects.toEqual(
				new Error('Each greeting must have a locale and a text')
			);
		});

		test('greetings elements must have a locale and a text. No locale will throw error', () => {
			expect.assertions(1);
			return expect(
				messenger.setGreetings([{ text: 'fr_FR' }])
			).rejects.toEqual(
				new Error('Each greeting must have a locale and a text')
			);
		});

		test('regular set', () => {
			expect.assertions(1);
			const payload = {
				greeting: [
					{
						text: 'Hello',
						locale: 'default'
					}
				]
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);

			return expect(
				messenger.setGreetings([
					{
						locale: 'default',
						text: 'Hello'
					}
				])
			).resolves.toEqual(response);
		});

		test('manage error', () => {
			expect.assertions(1);
			const payload = {
				greeting: [
					{
						text: 'Hello',
						locale: 'default'
					}
				]
			};
			nock('https://graph.facebook.com')
				.post('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(403, 'error');

			return expect(
				messenger.setGreetings([
					{
						locale: 'default',
						text: 'Hello'
					}
				])
			).rejects.toBeDefined();
		});
	});

	describe('Set Whitelisted domains', () => {
		const messenger = new Messenger({ token: 'foo', verify: 'foo' });
		test('domains must be an array', () => {
			expect.assertions(1);
			return expect(messenger.setWhitelistedDomains('hello')).rejects.toEqual(
				new Error('domains must be an array')
			);
		});

		test('domains array must not be empty', () => {
			expect.assertions(1);
			return expect(messenger.setWhitelistedDomains([])).rejects.toEqual(
				new Error('The domains array cant be empty')
			);
		});

		test('domains array must have a length of max 10', () => {
			expect.assertions(1);
			let domains = [];
			let i = 0;
			while (i < 15) {
				i++;
				domains.push(i.toString());
			}
			return expect(messenger.setWhitelistedDomains(domains)).rejects.toEqual(
				new Error('Max whitelisted domains is 10')
			);
		});

		test('domains array must have only string', () => {
			expect.assertions(1);
			let domains = [];
			let i = 0;
			while (i < 7) {
				i++;
				domains.push(i.toString());
			}
			domains.push(10);
			return expect(messenger.setWhitelistedDomains(domains)).rejects.toEqual(
				new Error('each domain must be a string')
			);
		});

		test('regular set', () => {
			expect.assertions(1);
			const payload = {
				whitelisted_domains: ['http']
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);

			return expect(messenger.setWhitelistedDomains(['http'])).resolves.toEqual(
				response
			);
		});

		test('Manage error', () => {
			expect.assertions(1);
			const payload = {
				whitelisted_domains: ['http']
			};
			nock('https://graph.facebook.com')
				.post('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(400, 'error');

			return expect(
				messenger.setWhitelistedDomains(['http'])
			).rejects.toBeDefined();
		});
	});

	describe('Set Persistent Menu', () => {
		const messenger = new Messenger({ token: 'foo', verify: 'foo' });

		test('no menu is like deleting the old one', () => {
			expect.assertions(1);
			const payload = {
				fields: ['persistent_menu']
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.delete('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);
			return expect(messenger.setPersistentMenu()).resolves.toEqual(response);
		});

		test('menus must be an array', () => {
			expect.assertions(1);
			return expect(messenger.setPersistentMenu('hello')).rejects.toEqual(
				new Error('domains must be an array')
			);
		});

		test('catch delete errors', () => {
			expect.assertions(1);
			const payload = {
				fields: ['persistent_menu']
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.delete('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(403, 'error');
			return expect(messenger.setPersistentMenu()).rejects.toBeDefined();
		});

		test('menus must be an array', () => {
			expect.assertions(1);
			return expect(messenger.setPersistentMenu('hello')).rejects.toEqual(
				new Error('domains must be an array')
			);
		});

		test('regular set', () => {
			expect.assertions(1);
			const menus = [
				{
					locale: 'default',
					call_to_actions: [
						{
							type: 'web_url',
							title: 'hello',
							url: 'http://'
						}
					]
				}
			];
			const payload = {
				persistent_menu: menus
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);

			return expect(messenger.setPersistentMenu(menus)).resolves.toEqual(
				response
			);
		});

		test('manage error', () => {
			expect.assertions(1);
			const menus = [
				{
					locale: 'default',
					call_to_actions: [
						{
							type: 'web_url',
							title: 'hello',
							url: 'http://'
						}
					]
				}
			];
			const payload = {
				persistent_menu: menus
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/messenger_profile', payload)
				.query({
					access_token: messenger._token
				})
				.reply(403, 'error');

			return expect(messenger.setPersistentMenu(menus)).rejects.toBeDefined();
		});
	});
});

describe('HANDOVER PROTOCOL', () => {
	const messenger = new Messenger({ token: 'foo', verify: 'foo' });

	describe('Pass Thread', () => {
		test('must provide an id', () => {
			expect.assertions(1);
			return expect(messenger.passThread()).rejects.toEqual(
				new Error(
					'You need to pass the id of the recipient that you want to pass the conversation'
				)
			);
		});

		test('passing thread to inbox', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				target_app_id: '263902037430900'
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/pass_thread_control', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);
			return expect(messenger.passThread('123')).resolves.toEqual(response);
		});

		test('catching error in passing thread to inbox', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				},
				target_app_id: '263902037430900'
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/pass_thread_control', payload)
				.query({
					access_token: messenger._token
				})
				.reply(400, 'error');
			return expect(messenger.passThread('123')).rejects.toBeDefined();
		});
	});

	describe('Take Thread', () => {
		test('must provide an id', () => {
			expect.assertions(1);
			return expect(messenger.takeThread()).rejects.toEqual(
				new Error(
					'You need to pass the id of the recipient that get the conversation thread'
				)
			);
		});

		test('taking thread', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				}
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/take_thread_control', payload)
				.query({
					access_token: messenger._token
				})
				.reply(200, response);
			return expect(messenger.takeThread('123')).resolves.toEqual(response);
		});

		test('catching error in taking thread to inbox', () => {
			expect.assertions(1);
			const payload = {
				recipient: {
					id: '123'
				}
			};

			const response = {
				result: 'success'
			};

			nock('https://graph.facebook.com')
				.post('/v2.6/me/take_thread_control', payload)
				.query({
					access_token: messenger._token
				})
				.reply(400, 'error');
			return expect(messenger.takeThread('123')).rejects.toBeDefined();
		});
	});
});
