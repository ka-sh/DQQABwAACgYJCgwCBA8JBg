'use strict';
let Q = require('q');
let UnsupportedCurrencyException = require('./converters/unsupported_currency_exception');
let Rate = '';
let fx = '';
let successDelay = 6000;
let failedDelay = 3000;
let maxIter = 10;
let maxFailed = 3;

/**
 * Worker responsible of consuming incoming jobs
 * @param {object} converter that will be used to get the FX rates.
 * @param {object} object model that will be used to persist records.
 * @param {object} options - contain worker parameters.
 * @param {number}[options.successDelay=60000] - set delay after every successful request.
 * @param {number}[options.failedDelay=3000] - set delay after every failed request.
 * @param {number}[options.maxIter=10] set max successful requests.
 * @param {number}[options.maxFailed=3] set max failed requests.
 * @constructor
 */
let worker = function (fxConverter, model, options) {
	fx = fxConverter;
	Rate = model;
	init(options);
};

/**
 *Initialize current worker parameters.
 */
function init(opt) {
	if (opt) {
		if (opt.successDelay) {
			successDelay = opt.successDelay;
		}
		if (opt.failedDelay) {
			failedDelay = opt.failedDelay;
		}
		if (opt.maxIter) {
			maxIter = opt.maxIter;
		}
		if (opt.maxFailed) {
			maxFailed = opt.maxFailed;
		}
	}
}
/**
 * consume current job.
 * @param {object} job- job parameters.
 * @param {string}[job.key=from] - base currency.
 * @param {string}[job.key=to]   - currency to convert to.
 * @return false incase of bad request "as in job object doesn't contain key information or contain invalid currency request", return promise with result.
 */
worker.prototype.consume = function (job) {
	if (!isValid(job)) {
		return false;
	}
	try {
		return processRequest(job.from, job.to);
	} catch (err) {
		if (err instanceof UnsupportedCurrencyException) {
			return false;
		} else {
			return Q.reject(err);
		}
	}
};
module.exports = worker;


/**
 * Simple validation for job
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
