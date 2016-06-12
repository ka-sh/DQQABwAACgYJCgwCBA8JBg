'use strict';
let Q = require('q');
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
 * @param {object} job- job parameters.
 * @param {string}[job.key=from] - base currency.
 * @param {string}[job.key=to]   - currency to convert to.
 */
worker.prototype.consume = function (job) {
	if (!isValid(job)) {
		// Ignore invalid job
		return;
	}
	step(job, 0, 0);
};
module.exports = worker;


/**
 * Simple validation for job
 */
function isValid(job) {
	return job && job.from && job.to;
}

function processRequest(from, to) {
	return fx.convert(from, to)
		.then((rate) => {
			return saveRate(rate);
		})
		.catch((err) => {
			return Q.reject(err);
		})
}
// function step(job, successCount, failCount) {
// 	if (successCount < maxIter && failCount < maxFailed) {
// 		// console.log('\n\n\n');
// 		// console.log('Step called with counts failed:', failCount, ' success: ', successCount);
// 		fx.convert(job.from, job.to)
// 			.fail((reason) => {
// 				console.log('handle Request failed=>1 ', reason);
// 				setTimeout(() => {
// 					step(job, successCount, ++failCount);
// 				}, failedDelay);
// 				return Q.reject(reason);
// 			})
// 			.then((val) => {
// 				console.log('Successful request ', val);
// 				saveRate(val)
// 					.then(() => {
// 						console.log('Save successfull');
// 						setTimeout(() => {
// 							step(job, ++successCount, failCount);
// 						}, successDelay);
// 					}, (reason) => {
// 						console.log('Failed to save rates: ', reason);
// 					});
// 			});
// 	}
// }

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
