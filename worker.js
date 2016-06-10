'use strict';
const BS_BROKER_HOST = '127.0.0.1';
const BS_BROKER_PORT = '11300';

const TUBE = 'test_tube';

let fivebeans = require('fivebeans');

let client = new fivebeans.client(BS_BROKER_HOST, BS_BROKER_PORT);

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


client.watch(TUBE, function (err, unwatched) {
	if (err) {
		console.log('Error: ', err);
	} else {
		console.log('unwatched: ', unwatched);
	}
});


client.list_tubes(function (err, tubenames) {
	console.log(tubenames);
});