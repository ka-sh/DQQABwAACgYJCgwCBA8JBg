'use strict';

function InvalidCurrencyException(message) {
	this.name = 'InvalidCurrencyException';
	this.message = message;
	this.stack = (new Error())
		.stack;
}
InvalidCurrencyException.prototype = Object.create(Error.prototype);
InvalidCurrencyException.prototype.constructor = InvalidCurrencyException;

module.exports = InvalidCurrencyException;
