/**
 * FX converter uses the stratgy pattern to abstract the implementation of converters.
 *
 */
'use strict';
let fxConverter = function () {
	this.converter = '';
};

fxConverter.prototype = {
	/**
	 *Set the converter implementation.
	 *@param {object} actual converter tat will be used to fetch prices.
	 */
	use: (converter) => {
		this.converter = converter;
	},
	/**
	*Convert currency from to.
	*@param {string} currency to convert from
	*@param {string} currency to convert to
	*/
	convert: (from, to) => {
		return this.converter.convert(from, to);
	}
};

module.exports = new fxConverter();
