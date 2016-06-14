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
const SUCESS_DELAY = 5;
const FAIL_DELAY = 3;
const MAX_SUCCESS = 10;
const MAX_FAIL = 3;
const DEFAULT_TTR = 30;

let Rate = '';
let config = {};
let client = '';
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
	client = new fivebeans.client(config.bs_host, config.bs_port);
	client.on('connect', function () {
			console.log('Connected');
		})
		.on('error', function (err) {
			console.log('Error: ', err);
		})
		.on('close', function () {
			console.log('Closed');
		})
		.connect();

	client.watch(config.bs_tube, function (err, numwatched) {
		if (err) {
			console.log('Error: ', err);
		} else {
			console.log('number of tubes watched: ', numwatched);
			consume();
		}
	});
}

function consume() {
	client.reserve(function (err, jobid, payload) {
		console.log('Consuming jobid ', jobid, '==>>', payload);
		if (err) {
			console.log('error:', err);
		}

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
					console.log('REquest failed to process: ', reason);
					++payloadJSON.failCount;
					return tryResubmit(payloadJSON, jobid, FAIL_DELAY);
				})
				.done(() => {
					consume();
				});
		}
	});
}

function shouldReSubmit(payloadJSON) {
	return payloadJSON.successCount < MAX_SUCCESS && payloadJSON.failCount < MAX_FAIL;
}

function tryResubmit(payloadJSON, jobid, delay) {
	deleteJob(jobid)
		.then(() => {
			if (shouldReSubmit(payloadJSON)) {
				return putJob(payloadJSON, delay);
			}
			return Q.resolve(jobid);
		})
		.fail((e) => {
			console.log('fail to resubmit job to the queue jobID: ', jobid);
			console.log('Error:', e);
		});
}

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

function putJob(payloadJSON, delay) {
	let payload = JSON.stringify(payloadJSON);
	console.log('Putting back ==>>>>', payload);
	let deferred = Q.defer();
	client.put(DEFAULT_PERIORITY, delay, DEFAULT_TTR, payload, function (e, jid) {
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

// function consume() {
// 	client.reserve(function (err, jobid, payload) {
// 		console.log('Job recieved: ', payload.toString());
// 		setTimeout(() => {
// 			client.destroy(jobid, (e) => {
// 				if (e) {
// 					console.log('Error while trying to delete job :', e);
// 				}
// 				consume();
// 			});
// 		}, 500);
// 	});
// }
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
