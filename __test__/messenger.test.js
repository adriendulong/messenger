const Messenger = require('../');
const nock = require('nock');

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

describe('send a simple message', () => {
	const messenger = new Messenger({ token: 'fb' });

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

	test('correct response', () => {
		expect.assertions(1);
		return expect(messenger.sendMessage('123', 'Hello!')).resolves.toEqual(
			response
		);
	});
});
