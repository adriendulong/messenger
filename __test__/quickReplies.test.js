const QuickReplies = require('../QuickReplies');

describe('Quick Replies tests', () => {
	let qr;

	describe('basic init', () => {
		test('init quick reply class', () => {
			expect(() => {
				qr = new QuickReplies();
			}).not.toThrow();
		});

		test('an array of quick replies has been init', () => {
			expect(qr._qrs).toBeInstanceOf(Array);
		});

		test('add is a function', () => {
			expect(qr.add).toBeInstanceOf(Function);
		});

		test('length should be 0', () => {
			expect(qr.length).toBe(0);
		});

		test('quickReplies should be an empty array', () => {
			expect(qr.quickReplies).toBeInstanceOf(Array);
		});

		test('quickReplies should be empty', () => {
			expect(qr.quickReplies).toEqual([]);
		});
	});

	describe('tests on add functions', () => {
		describe('test for an empty input', () => {
			let qr_location = new QuickReplies();
			const length = qr_location.length;
			test('add empty is ok, it is a location type', () => {
				expect(() => {
					qr_location.add();
				}).not.toThrow();
			});

			test('add empty should add a quick reply', () => {
				expect(qr_location.length).toBe(1);
			});

			test('add empty should add a quick reply of content_type location', () => {
				expect(qr_location._qrs[0].content_type).toBe('location');
			});

			test('add empty should not add a title in the quick_reply', () => {
				expect(qr_location._qrs[0].title).not.toBeDefined();
			});
		});

		describe('test for a regular input', () => {
			let qr_regular = new QuickReplies();

			test('input should be empty or an object', () => {
				expect(() => {
					qr_regular.add('coucou');
				}).toThrow('input must be an object');
			});

			const expected = [
				{
					content_type: 'text',
					title: 'coucou',
					payload: 'coucou'
				}
			];
			test('input with only a title should work', () => {
				expect(qr_regular.add({ title: 'coucou' })).toEqual(
					expect.arrayContaining(expected)
				);
			});

			const expectedPayload = [
				{
					content_type: 'text',
					title: 'coucou',
					payload: 'payload'
				}
			];
			test('input with only a title and a payload', () => {
				expect(qr_regular.add({ title: 'coucou', payload: 'payload' })).toEqual(
					expect.arrayContaining(expectedPayload)
				);
			});

			const expectedTooLength = [
				{
					content_type: 'text',
					title: 'idontknowwhattotello',
					payload: 'idontknowwhattotellortosay'
				}
			];
			test('input with a title too length should be truncated', () => {
				expect(qr_regular.add({ title: 'idontknowwhattotellortosay' })).toEqual(
					expect.arrayContaining(expectedTooLength)
				);
			});

			const expectedWithImage = [
				{
					content_type: 'text',
					title: 'hello',
					image_url: 'http://cool.com',
					payload: 'hello'
				}
			];
			test('input with an image', () => {
				expect(
					qr_regular.add({ title: 'hello', image: 'http://cool.com' })
				).toEqual(expect.arrayContaining(expectedWithImage));
			});

			let qr_full = new QuickReplies();
			let i = 0;
			while (i < 11) {
				i++;
				qr_full.add({ text: 'hello' });
			}
			test('cant add more than 11 quick replies', () => {
				expect(() => qr_full.add({ text: 'hello' })).toThrow(
					'Too many quick replies. The number of quick replies for a message is limited to 11'
				);
			});
		});
	});
});
