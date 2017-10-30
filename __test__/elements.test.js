const Elements = require('../Elements');
const Buttons = require('../Buttons');
const chance = require('chance')();
const _ = require('lodash');

describe('Elements tests', () => {
	let elements;

	describe('basic init', () => {
		test('init elements', () => {
			expect(() => {
				elements = new Elements();
			}).not.toThrow();
		});

		test('an array of elements has been init', () => {
			expect(elements.elements).toBeInstanceOf(Array);
		});

		test('add is a function', () => {
			expect(elements.add).toBeInstanceOf(Function);
		});

		test('length should be 0', () => {
			expect(elements.length).toBe(0);
		});

		test('elements should be an empty array', () => {
			expect(elements.elements).toEqual([]);
		});
	});

	describe('add element', () => {
		test('add empty should raise an error', () => {
			expect(() => elements.add()).toThrow(
				new Error('Need to provide at least a title')
			);
		});

		test('input should be an object', () => {
			expect(() => elements.add('hello')).toThrow(
				new Error('Provide an object with at least a title')
			);
		});

		test('add must contain at least a title', () => {
			expect(() => elements.add({ subtitle: 'hello you' })).toThrow(
				new Error('Provide at least a title')
			);
		});

		test('when a title longer than 80 is provided, it is truncated', () => {
			const longTitle = chance.string({ length: 100 });
			const truncatedTitle = _.truncate(longTitle, {
				length: 80,
				omission: ''
			});
			const expectedTitle = [
				{
					title: truncatedTitle
				}
			];
			expect(elements.add({ title: longTitle })).toEqual(
				expect.arrayContaining(expectedTitle)
			);
		});

		test('when a subtitle longer than 80 is provided, it is truncated', () => {
			const longTitle = chance.string({ length: 120 });
			const truncatedTitle = _.truncate(longTitle, {
				length: 80,
				omission: ''
			});
			const expectedSubtitle = [
				{
					title: 'Shirt',
					subtitle: truncatedTitle
				}
			];
			expect(
				elements.add({
					title: 'Shirt',
					subtitle: longTitle
				})
			).toEqual(expect.arrayContaining(expectedSubtitle));
		});

		test('An image can be provided', () => {
			const expectedImage = [
				{
					title: 'Shirt',
					subtitle: 'Cool shirt',
					image_url: 'http://'
				}
			];
			expect(
				elements.add({
					title: 'Shirt',
					subtitle: 'Cool shirt',
					image: 'http://'
				})
			).toEqual(expect.arrayContaining(expectedImage));
		});

		test('Provide a default action', () => {
			const expectedDefault = [
				{
					title: 'Shirt',
					subtitle: 'Cool shirt',
					image_url: 'http://',
					default_action: {
						type: 'web_url',
						url: 'http://default'
					}
				}
			];
			expect(
				elements.add({
					title: 'Shirt',
					subtitle: 'Cool shirt',
					image: 'http://',
					defaultUrl: 'http://default'
				})
			).toEqual(expect.arrayContaining(expectedDefault));
		});

		test('There must be less than 3 buttons', () => {
			const buttons = new Buttons();
			buttons.add({ title: 'hello', url: 'http' });
			buttons.add({ title: 'hello', url: 'http' });
			buttons.add({ title: 'hello', url: 'http' });
			buttons.add({ title: 'hello', url: 'http' });
			expect(() => elements.add({ title: 'hello you', buttons })).toThrow(
				new Error('The max of buttons that you can provide is 3')
			);
		});

		test('Provide an empty buttons array works, but does not create a key buttons', () => {
			const buttons = new Buttons();

			const expectNoButtons = [
				{
					title: 'hello no buttons'
				}
			];
			expect(elements.add({ title: 'hello no buttons', buttons })).toEqual(
				expect.arrayContaining(expectNoButtons)
			);
		});

		test('Add buttons to an element', () => {
			const buttons = new Buttons();
			buttons.add({ title: 'hello', url: 'http' });

			const expectButtons = [
				{
					title: 'hello you',
					buttons: [
						{
							title: 'hello',
							type: 'web_url',
							url: 'http'
						}
					]
				}
			];
			expect(elements.add({ title: 'hello you', buttons })).toEqual(
				expect.arrayContaining(expectButtons)
			);
		});
	});
});
