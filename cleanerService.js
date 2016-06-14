'use strict';
/**
 * Purge all jobs on the beanstalkd host
 */

const fs = require('fs');
const fivebeans = require('fivebeans');
const config = loadConfig();
let client = new fivebeans.client(config.bs_host, config.bs_port);
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
		clean();
	}
});

function clean() {
	client.reserve(function (err, jobid, payload) {
		client.destroy(jobid, (e) => {
			if (e) {
				console.log('unable to remove jobID ', jobid);
			} else {
				console.log('successfully purged jobID: ', jobid);
			}
			clean();
		});
	})
}
/**
 * Loading configurations from config.json
 */
function loadConfig() {
	return JSON.parse(fs.readFileSync('config.json'));
}
