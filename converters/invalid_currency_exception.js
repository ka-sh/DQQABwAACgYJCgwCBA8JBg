'use strict';
/**
 * Generic exception indicates an issue with currency requested to get conversion rates for,
 * @param {string} error message
 * @constructor
 */
function InvalidCurrencyException(message) {
	this.name = 'InvalidCurrencyException';
	this.message = message;
	this.stack = (new Error())
		.stack;
}
InvalidCurrencyException.prototype = Object.create(Error.prototype);
InvalidCurrencyException.prototype.constructor = InvalidCurrencyException;

module.exports = InvalidCurrencyException;
