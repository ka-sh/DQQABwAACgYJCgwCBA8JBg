'use strict';
const Worker = require('../fx_worker');
const sinon = require('sinon');
const chai = require('chai');
const Q = require('q');
const chaiAsPromised = require('chai-as-promised');
const assert = chai.assert;
const fixerio = require('../converters/fixerio');
const fx = require('../converters/fx');
const InvalidCurrencyException = require('../converters/invalid_currency_exception');

chai.use(chaiAsPromised);
chai.should();


describe('worker test', () => {
	let sandbox = '';
	afterEach(() => {
		sandbox.restore();
	});
	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});
	describe('Invalid job', () => {
		it('should return rejected promise with value of InvalidCurrencyException if job is undefined', (done) => {
			let worker = new Worker(fx, undefined);
			worker.consume(undefined)
				.should.be.rejectedWith(InvalidCurrencyException)
				.notify(done);
		});

		it('should return rejected promise with InvalidCurrencyException if from field is undefined', (done) => {
			let worker = new Worker(fx, undefined);
			worker.consume({
				from: undefined,
				to: 'USD'
			})
				.should.be.rejectedWith(InvalidCurrencyException)
				.notify(done);
		});

		it('should return rejected promise with InvalidCurrencyException if to field is undefined', (done) => {
			let worker = new Worker(fx, undefined);
			worker.consume({
				from: 'USD',
				to: undefined
			})
				.should.be.rejectedWith(InvalidCurrencyException)
				.notify(done);
		});
	});
	describe('Failed request', () => {
		let fxStub = '';
		afterEach((done) => {
			sinon.assert.calledOnce(fxStub);
			done();
		});
		it('should return rejected promise if request for rates failed', () => {
			fxStub = sandbox.stub(fx, 'convert', () => {
				return Q.reject('stub reject promise');
			});
			let worker = new Worker(fx, undefined);
			return worker.consume({
				from: 'USD',
				to: 'HKD'
			})
				.should.be.rejected;
		});
	});

	describe('Failed to persist rates', () => {
		let fxStub = '';
		let modelStub = '';
		afterEach((done) => {
			sinon.assert.calledOnce(fxStub);
			sinon.assert.calledOnce(modelStub);
			done();
		});
		it('should return rejected promise if cannot persist rates', () => {
			fxStub = sandbox.stub(fx, 'convert', () => {
				return Q.resolve({
					from: 'USD',
					to: 'HKD',
					rate: '7.93'
				});
			});
			modelStub = sandbox.stub()
				.returns({
					save: function (callback) {
						process.nextTick(function () {
							callback(new Error('failed to persist rates'));
						});
					}
				});
			let worker = new Worker(fx, modelStub);
			return worker.consume({
				from: 'USD',
				to: 'HKD'
			})
				.should.be.rejected;
		});
	});
});
