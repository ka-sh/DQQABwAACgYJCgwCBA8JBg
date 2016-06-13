function UnsupportedCurrencyException(message) {
	this.name = 'UnsupportedCurrencyException';
	this.message = message;
	this.stack = (new Error())
		.stack;
}
UnsupportedCurrencyException.prototype = Object.create(Error.prototype);
UnsupportedCurrencyException.prototype.constructor = UnsupportedCurrencyException;

module.exports = UnsupportedCurrencyException;
