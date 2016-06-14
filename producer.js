'use strict';
const SUPPORTED = ['USD', 'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK',
'GBP', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY',
'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON',
'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'ZAR', 'EUR'];
const fs = require('fs');
const config = loadConfig();

const fivebeans = require('fivebeans');
const client = new fivebeans.client(config.bs_host, config.bs_port);

client.on('connect', function () {
		console.log('Connected');
		client.use(config.bs_tube, function (err, tubename) {
			addJob(0);
		});
	})
	.on('error', function (err) {
		console.log('Error: ', err);
	})
	.on('close', function () {
		console.log('Closed');
	})
	.connect();

function addJob(count) {
	let job = getJob();
	console.log('adding job to the quue: ',job);
	client.put(5, 1, 15, job, function (err, jobID) {
		if (err) {
			console.log(err);
		} else {
			console.log('Job created with ID: ', jobID);
		}
	});
	setTimeout(() => {
		addJob(++count);
	}, 10000);
}

function getJob() {
	return JSON.stringify(genRandomValidJob());
}
/**
 * Generate ranob conversion rate job
 */
function genRandomValidJob() {
	let from = '';
	let to = '';
	let max = SUPPORTED.length;
	while (from === to) {
		from = SUPPORTED[getRandomI(max - 1)];
		to = SUPPORTED[getRandomI(max - 1)];
	}
	return {
		from: from,
		to: to
	};
}

function getRandomI(max) {
	return Math.floor(Math.random() * (max - 0 + 1)) + 0;
}
/**
 * Loading configurations from config.json
 */
function loadConfig() {
	return JSON.parse(fs.readFileSync('config.json'));
}
