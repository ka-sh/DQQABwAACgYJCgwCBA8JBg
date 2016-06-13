'use strict';
const Worker = require('../fx_worker');
const sinon = require('sinon');
const chai = require('chai');
const Q = require('q');
const chaiAsPromised = require('chai-as-promised');
const assert = chai.assert;
const fixerio = require('../converters/fixerio');
const fx = require('../converters/fx');
let stubconvert = '';
let sandbox = '';
chai.use(chaiAsPromised);
chai.should();


describe('worker test', () => {
	afterEach(() => {
		sandbox.restore();
	});
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	// describe('FX request failur handling', () => {
	// 	afterEach(function (done) {
	// 		// TODO:I don't like this I need to change it so that the test wouldn't depend on timeouts.
	// 		setTimeout(() => {
	// 			sinon.assert.calledOnce(stubconvert);
	// 			done();
	// 		}, 1500);
	// 	});
	// 	it('should resend request 3 times max incase of failed fx request', () => {
	// 		stubconvert = sandbox.stub(fx, 'convert')
	// 			.returns(Q.reject('stubed reject promise'));
	// 		let worker = new Worker(fx, undefined, {
	// 			failedDelay: 100
	// 		});
	// 		worker.consume({
	// 				from: 'USD',
	// 				to: 'HKD'
	// 			})
	// 			.should.be.rejected;
	// 	});
	// });
	describe('Handling DB error', () => {
		/**
		 * There are two types of errors that I am expecting here.
		 * 1- connection related issues which the instance should end with throwing exception.
		 * 2- persistance issues which I will just log for now.
		 */
		it('Should terminate when connection issue with DB', () => {

		});
	});
	describe('Worker handling bad currency', () => {
		afterEach(function (done) {
			// TODO:I don't like this I need to change it so that the test wouldn't depend on timeouts.
			setTimeout(() => {
				done();
			}, 1500);
		});
		it('should terminate incase of InvalidCurrencyException', () => {
			fx.use(fixerio);
			let worker = new Worker(fx, undefined, {
				failedDelay: 100
			});
			assert.throws(() => {
				worker.consume({
					from: 'USD',
					to: 'HKDXXXX'
				});
			}, 'InvalidCurrencyException');
		});
	});
});
