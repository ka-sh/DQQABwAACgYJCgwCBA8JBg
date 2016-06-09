'use strict';
let assert = require('chai')
	.assert;
let chaiAsPromised = require('chai-as-promised');
let chai = require('chai');
let should = chai.should();
chai.use(chaiAsPromised);

let fixerio = require('../converters/fixerio_converter');
describe('fixerio', () => {
	describe('request rate for bad currency', () => {
		it('should throw exception for invalid currencies strings', () => {
			assert.throws(() => {
				fixerio.convert(undefined, undefined);
			}, 'InvalidCurrencyException');

			assert.throws(() => {
				fixerio.convert('', '');
			}, 'InvalidCurrencyException');

			assert.throws(() => {
				fixerio.convert('   ', '   ');
			}, 'InvalidCurrencyException');

			assert.throws(() => {
				fixerio.convert('aklsjfhklajfhklasdjdfhaklsdjfhaskldjfh', 'aklsjfhklajfhklasdjdfhaklsdjfhaskldjfh');
			}, 'InvalidCurrencyException');
		});

		it.only('should throw exception for unsupported currencies', () => {
			assert.throws(() => {
				fixerio.convert('USD', 'EGP');
			}, 'InvalidCurrencyException');
		});
	});

	describe('valid conversion requests:integration test', () => {
		it('should return a promise with valid conversion data', () => {
			return fixerio.convert('USD', 'HKD')
				.should.be.fulfilled;
		});
	});
});
