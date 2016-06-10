'use strict';
/**
 * Worker responsible of consuming incoming jobs
 * @param {object} converter that will be used to get the FX rates.
 * @constructor
 */
let worker = function (converter) {
	this.fx = converter;
};


/**
 * @param {object} job- job parameters.
 * @param {string}[job.key=from] - base currency.
 * @param {string}[job.key=to]   - currency to convert to.
 */
worker.prototype.consume = (job) => {
	if (!isValid(job)) {
		// Ignore invalid job
		return;
	}  
};
module.exports = worker;


/**
 * Simple validation for job
 */
function isValid(job) {
	return job && job.from && job.to;
}
