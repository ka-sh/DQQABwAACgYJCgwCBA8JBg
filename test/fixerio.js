'use strict';
/**
 * Fixerio path is used @ inner test .
 * Note: In case of changing the fixerio path, please change the {string} fixerioPath.
 */
let fixerioPath = '../converters/fixerio';
let InvalidCurrencyException = require('../converters/invalid_currency_exception');
let assert = require('chai')
	.assert;
let chaiAsPromised = require('chai-as-promised');
let chai = require('chai');
let proxyquire = require('proxyquire');
chai.use(chaiAsPromised);
chai.should();
let fixerio = require(fixerioPath);
describe('fixerio', () => {
	describe('request rate for bad currency', () => {
		it('should throw exception for invalid currencies strings', () => {
			assert.throws(() => {
				fixerio.convert(undefined, undefined);
			}, InvalidCurrencyException);

			assert.throws(() => {
				fixerio.convert('', '');
			}, InvalidCurrencyException);

			assert.throws(() => {
				fixerio.convert('   ', '   ');
			}, InvalidCurrencyException);

			assert.throws(() => {
				fixerio.convert('aklsjfhklajfhklasdjdfhaklsdjfhaskldjfh', 'aklsjfhklajfhklasdjdfhaklsdjfhaskldjfh');
			}, InvalidCurrencyException);
		});

		it('should throw exception for unsupported currencies', () => {
			assert.throws(() => {
				fixerio.convert('USD', 'EGP');
			}, InvalidCurrencyException);
		});
	});

	describe.only('valid conversion requests', () => {
		it('should return a promise with valid conversion data', () => {
			let fixerioStub = proxyquire(fixerioPath, {
				'request': function (url, cb) {
					process.nextTick(function () {
						let res = {
							statusCode: 200
						};
						let body = '{"rates":{"HKD": "7.41234"}}';
						cb(undefined, res, body);
					});
				}
			});

			return fixerioStub.convert('USD', 'HKD')
				.should.be.fulfilled;
		});
	});
});
