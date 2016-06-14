'use strict';
const fs = require('fs');
const fivebeans = require('fivebeans');
const fixerio = require('./converters/fixerio');
const fx = require('./converters/fx');
const mongoose = require('mongoose');
const Worker = require('./fx_worker');
const Q = require('q');
fx.use(fixerio);
const DEFAULT_PERIORITY = 5;
const SUCESS_DELAY = 60;
const FAIL_DELAY = 3;
const MAX_SUCCESS = 10;
const MAX_FAIL = 3;
const DEFAULT_TTR = 30;

let Rate = '';
let config = {};
let client = '';
/*
 * used to put jobs back to the tube.
 */
let clientProducer = '';
let worker = '';
/**
 * Entry point
 */
start();

function start() {
	config = loadConfig();
	initMongo();
	worker = new Worker(fx, Rate);
	setupBSClient();
}

/**
 * Setting up fivebeans client. This is the entry point for the worker to start consuming jobs of the queue
 */
function setupBSClient() {
	client = initBSClient();
	clientProducer = initBSClient();
	client.watch(config.bs_tube, function (err, numwatched) {
		if (err) {
			console.log('Error: ', err);
		} else {
			console.log('number of tubes watched: ', numwatched);
			consume();
		}
	});

	clientProducer.use(config.bs_tube, (err, tubenam) => {
		if (err) {
			console.log('Error while trying to use tube ', tubenam, ': ', err);
		}
	});
}
/*
 * Start consuming incoming job requests of the queue.
 */
function consume() {
	client.reserve(function (err, jobid, payload) {
		console.log('Consuming jobid ', jobid, '==>>', payload);
		if (err) {
			console.log('error:', err);
		}
		/**
		 * Fivebeans sends DEADLINE_SOON message through the queue with empty payload, so I need to check for payload before processing the request.
		 */
		// TODO: validate payload
		if (payload) {
			let payloadJSON = JSON.parse(payload.toString());
			validateCounts(payloadJSON);
			console.log('Job recieved: ', payloadJSON);
			worker.consume(payloadJSON)
				.then((val) => {
					++payloadJSON.successCount;
					return tryResubmit(payloadJSON, jobid, SUCESS_DELAY);
				})
				.fail((reason) => {
					console.log('Request failed to process: ', reason);
					++payloadJSON.failCount;
					return tryResubmit(payloadJSON, jobid, FAIL_DELAY);
				})
				.done(() => {
					consume();
				});
		}
	});
}
/**
 * Check if we should resubmit this payload or not by checking the success,
 * and fail count aganist the MAX_SUCCESS, and MAX_FAIL counts.
 * @param {object} payload as a JSON object.
 */
function shouldReSubmit(payloadJSON) {
	return payloadJSON.successCount < MAX_SUCCESS && payloadJSON.failCount < MAX_FAIL;
}
/**
 * Try to put the job back on the queue.
 * in this step we first delete the job off the queue, then we put back the updated payload.
 * @param {object} payload as a JSON object.
 * @param {string} jobid to resubmit.
 * @param {number} delay in seconds.
 * @return {object} promise with process result.
 */
function tryResubmit(payloadJSON, jobid, delay) {
	deleteJob(jobid)
		.then(() => {
			if (shouldReSubmit(payloadJSON)) {
				return putJob(payloadJSON, delay);
			}
			return Q.resolve(jobid);
		})
		.fail((e) => {
			//	TODO: this is looks much like an exception inside an exception case.
			//  			I will stick to doing nothing since the job is already deleted from the queue.
			console.log('fail to resubmit job to the queue jobID: ', jobid);
			console.log('Error:', e);
		});
}


/**
 * Delete a job from the queue
 * @param {string} job id.
 * @return {object} promise with the process result.
 */
function deleteJob(jobid) {
	let deferred = Q.defer();
	client.destroy(jobid, (e) => {
		if (e) {
			deferred.reject(e);
		} else {
			deferred.resolve(jobid);
		}
	});
	return deferred.promise;
}
/**
 * Put the updated payload back to the queue.
 * @param {object} payload as a JSON object.
 * @param {number} delay in seconds.
 * @return {object} return promise with the process result.
 */
function putJob(payloadJSON, delay) {
	let payload = JSON.stringify(payloadJSON);
	let deferred = Q.defer();
	clientProducer.put(DEFAULT_PERIORITY, delay, DEFAULT_TTR, payload, function (e, jid) {
		if (e) {
			deferred.reject(e);
		} else {
			deferred.resolve(jid);
		}
	});
	return deferred.promise;
}
/**
 * Append the payload with successCount & success fails if not found.
 */
function validateCounts(payload) {
	if (!payload.successCount) {
		payload.successCount = 0;
	}
	if (!payload.failCount) {
		payload.failCount = 0;
	}
}

/**
 * Initialize mongodb connection
 */
function initMongo() {
	mongoose.connect('mongodb://' + config.db_host + '/' + config.database);
	Rate = mongoose.model(config.collection, {
		from: String,
		to: String,
		created_at: Date,
		rate: String
	});
}
/**
 * Loading configurations from config.json
 */
function loadConfig() {
	return JSON.parse(fs.readFileSync('config.json'));
}
/*
*Initialize beanstalk client object.
*@return {object} beanstalk client object.
*/
function initBSClient() {
	let bsClient = new fivebeans.client(config.bs_host, config.bs_port);
	bsClient.on('connect', function () {
		console.log('Connected');
	})
		.on('error', function (err) {
			console.log('Error: ', err);
		})
		.on('close', function () {
			console.log('Closed');
		})
		.connect();
	return bsClient;
}
