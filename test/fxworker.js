'use strict';
let Worker = require('../fx_worker');
let sinon = require('sinon');
let chai = require('chai');
let chaiAsPromised = require('chai-as-promised');
let assert = chai.assert;
let should = chai.should();
let fixerio = require('../converters/fixerio');
let fx = require('../converters/fx');
chai.use(chaiAsPromised);


describe('worker test', () => {
	describe('invalid job request', () => {
		it('should ignore job with bad payloads', () => {
			fx.use(fixerio);
			let worker = new Worker(fx);
			console.log(worker);
			worker.consume({
				from: 'USD',
				to: 'HKD'
			});
		});
	});
});
