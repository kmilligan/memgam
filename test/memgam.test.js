const jsdom = require('jsdom');
// this is a "destructuring assignment"
const { JSDOM } = jsdom;

/*global test,jest,expect*/
/*eslint no-undef: "error"*/

test('instance test', () =>
{
	jest.isolateModules(() =>
	{
		require('../src/memgam.js');
		const memgam = new global.memgam();
		expect(memgam).toHaveProperty('options');
	});
});

test('dom test', () =>
{
	jest.isolateModules(() =>
	{
		const dom = new JSDOM('<!DOCTYPE html><html><head></head>' +
			'<body><div id="gameboard"></div>' +
			'</body></html>');
		global.window = dom.window;

		require('../src/memgam.js');

		expect(window).toHaveProperty('memgam');

		const memgam = new window.memgam();
		memgam.showBoard();
		expect(window.document.querySelectorAll('.memgam-gamebutton')).toHaveLength(6);
	});
});
