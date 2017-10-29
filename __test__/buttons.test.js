const Buttons = require('../Buttons');

describe('Buttons tests', () => {
	let buttons;

	describe('basic init', () => {
		test('init buttons', () => {
			expect(() => {
				buttons = new Buttons();
			}).not.toThrow();
		});

		test('an array of buttons has been init', () => {
			expect(buttons._buttons).toBeInstanceOf(Array);
		});

		test('add is a function', () => {
			expect(buttons.add).toBeInstanceOf(Function);
		});

		test('length should be 0', () => {
			expect(buttons.length).toBe(0);
		});

		test('buttons should be an array', () => {
			expect(buttons.buttons).toBeInstanceOf(Array);
		});

		test('buttons should be empty', () => {
			expect(buttons.buttons).toEqual([]);
		});
	});

	describe('add buttons', () => {
		test('empty input will throw an error', () => {
			expect(() => buttons.add()).toThrow();
		});

		test('input must be an object', () => {
			expect(() => buttons.add('coucou')).toThrow();
		});

		test('must provide a title', () => {
			expect(() => buttons.add({ test: 'test' })).toThrow();
		});

		test('title must be a string', () => {
			expect(() => buttons.add({ title: 123 })).toThrow();
		});

		test('must provide either an url or a postback', () => {
			expect(() => buttons.add({ title: 'hello' })).toThrow();
		});

		const expectedUrl = [
			{
				title: 'hello',
				url: 'http',
				type: 'web_url'
			}
		];
		test('Add a button of type web_url when provide a title and an url', () => {
			expect(buttons.add({ title: 'hello', url: 'http' })).toEqual(
				expect.arrayContaining(expectedUrl)
			);
		});

		const expectedPostback = [
			{
				title: 'hello',
				payload: 'http',
				type: 'postback'
			}
		];
		test('Add a button of type postback when provide a title and an postback', () => {
			expect(buttons.add({ title: 'hello', postback: 'http' })).toEqual(
				expect.arrayContaining(expectedPostback)
			);
		});
	});
});
