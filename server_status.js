'use strict';
const fs = require('fs');
const config = loadConfig();

const fivebeans = require('fivebeans');
const client = new fivebeans.client(config.bs_host, config.bs_port);

client.on('connect', function () {
		console.log('Connected');
		status();
	})
	.on('error', function (err) {
		console.log('Error: ', err);
	})
	.on('close', function () {
		console.log('Closed');
	})
	.connect();

function status() {
	client.stats_tube(config.bs_tube, function (err, response) {
		if (err) {
			console.log('Error :', err);
		} else {
			console.log('\n\n\n=============================>>>>>');
			console.log(response);
			console.log('=============================>>>>>');
		}
	});
	setTimeout(status, 3000);
}
/**
 * Loading configurations from config.json
 */
function loadConfig() {
	return JSON.parse(fs.readFileSync('config.json'));
}
