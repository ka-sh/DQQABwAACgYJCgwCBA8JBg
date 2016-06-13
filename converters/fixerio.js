'use strict';
const HOST = 'http://api.fixer.io/latest?';
const SUPPORTED = ['USD', 'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK',
'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY',
'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON',
'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR', 'EUR'];
const CURRENCY_LENGTH = 3;

let InvalidCurrencyException = require('./invalid_currency_exception');
let Q = require('q');
let request = require('request');
/**
 *Convert @from currency to @to currency using fixer.io api.
 *Only support the following currencies :
 *["AUD", "BGN", "BRL", "CAD", "CHF", "CNY", "CZK", "DKK",
 *"GBP", "HKD", "HRK", "HUF", "IDR", "ILS", "INR", "JPY",
 *"KRW", "MXN", "MYR", "NOK","NZD", "PHP", "PLN", "RON",
 *"RUB", "SEK", "SGD", "THB", "TRY", "ZAR", "EUR"]
 *@param {string} currency to convert from
 *@param {string} Currency to convert to
 *@throws InvalidCurrencyException incase of invalid currency fromat, or currency is not supported.
 */
exports.convert = (from, to) => {
	isValidCurrencyStr(from, to) && isSupported(from, to);
	return fetchRates(from.toUpperCase(), to.toUpperCase());
};

/**
 * Validate requested currencies format.
 * @throws InvalidCurrencyException in case of invalid currency format.
 */
function isValidCurrencyStr(from, to) {
	if (!(from && to && from.trim() && to.trim() && from.length === CURRENCY_LENGTH && to.length === CURRENCY_LENGTH)) {
		throw new InvalidCurrencyException('Currency format is invalid: <from: ' + from + ', to: ' + to + '>');
	} else {
		return true;
	}
}
/**
 * Check if currency requested is supported by Fixerio api or not.
 * @throws InvalidCurrencyException incase of currency is not supported.
 */
function isSupported(from, to) {
	from = from.toUpperCase();
	to = to.toUpperCase();
	let foundFrom = false;
	let foundTo = false;
	for (let i = 0; i < SUPPORTED.length; i++) {
		if (!foundFrom && SUPPORTED[i] === from) {
			foundFrom = true;
		}
		if (!foundTo && SUPPORTED[i] === to) {
			foundTo = true;
		}
	}

	if (!foundTo && foundFrom) {
		throw new InvalidCurrencyException('Request failed for unsupported currency : <from: ' + from + ', to: ' + to + '>');
	} else {
		return true;
	}
}
/**
 * Fetch the rates from Fixer.io and return promise.
 * @param from {string} base currency
 * @param from {string} symbol currency
 * @return {object} promise contain response.
 */
function fetchRates(from, to) {
	let url = getUrl(from, to);
	let deferred = Q.defer();
	request(url, (err, res, body) => {
		if (!err && res.statusCode === 200) {
			let data = JSON.parse(body);
			deferred.resolve({
				from: from,
				to: to,
				rate: roundRates(data.rates[to])
			});
		} else {
			deferred.reject(err);
		}
	});
	return deferred.promise;
}

function getUrl(from, to) {
	// http://api.fixer.io/latest?base=USD&symbols=HKD
	return HOST + 'base=' + from + '&symbols=' + to;
}

/**
 *Round Rates to 2 decimal places.
 *@param {number} conversion rates
 *@return {string} rounded conversion rates as String
 */
function roundRates(rates) {
	return (Math.round(rates * 100) / 100)
		.toString();
}
