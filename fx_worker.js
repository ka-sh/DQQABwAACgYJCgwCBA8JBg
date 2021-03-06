'use strict';
const Q = require('q');
const InvalidCurrencyException = require('./converters/invalid_currency_exception');
const DEFAULT_TIMEOUT = 10000;
let Rate = '';
let fx = '';
let ttr = '';
/**
 * Worker responsible of consuming incoming jobs
 * @param {object} converter that will be used to get the FX rates.
 * @param {object} object model that will be used to persist records.
 * @param {number} how long process should run before it times out.
 * @constructor
 */
let worker = function (fxConverter, model, timeout) {
	fx = fxConverter;
	Rate = model;
	if (!timeout) {
		ttr = DEFAULT_TIMEOUT;
	} else {
		ttr = timeout;
	}
};

/**
 * consume current job.
 * @param {object} job- job parameters.
 * @param {string}[job.key=from] - base currency.
 * @param {string}[job.key=to]   - currency to convert to.
 * @return false incase of bad request "as in job object doesn't contain key information or contain invalid currency request", return promise with result.
 */
worker.prototype.consume = function (job) {
	if (!isValid(job)) {
		return Q.reject(new InvalidCurrencyException('job sent with undefined elements: ', job));
	}
	try {
		return Q.timeout(processRequest(job.from, job.to), ttr);
	} catch (err) {
		return Q.reject(err);
	}
};
module.exports = worker;


/**
 * Simple validation for incoming job object
 */
function isValid(job) {
	return job && job.from && job.to;
}

/**
 * Process incoming job request.
 * @param {string} base currency.
 * @param {string} currency to convert to.
 * @return false in case of invalid job, or promise object.
 */
function processRequest(from, to) {
	return fx.convert(from, to)
		.then((rate) => {
			return saveRate(rate);
		})
		.catch((err) => {
			return Q.reject(err);
		});
}
/**
 * Save rate to the DB and return a promise.
 *TODO:Extract the logic into Rate module.
 */
function saveRate(rate) {
	let deferred = Q.defer();
	rate.created_at = new Date();
	let rates = new Rate(rate);
	rates.save((err) => {
		if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(rate);
		}
	});
	return deferred.promise;
}
