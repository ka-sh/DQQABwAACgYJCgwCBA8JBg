'use strict';

/**
 * Worker responsible of consuming incoming jobs
 * @param {object} converter that will be used to get the FX rates.
 * @constructor
 */
let worker = function (fxConverter, model) {
	this.fx = fxConverter;
	this.Rate = model;
};


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
	this.fx.convert(job.from, job.to)
		.then((val) => {
			val.created_at = new Date();
			let rates = new this.Rate(val);
			rates.save((err) => {
				if (err) {
					console.log(err);
				}
			});
		});
};
module.exports = worker;


/**
 * Simple validation for job
 */
function isValid(job) {
	return job && job.from && job.to;
}
