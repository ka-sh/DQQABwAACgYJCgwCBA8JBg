'use strict';
let fixerio = require('./converters/fixerio');
let fx = require('./converters/fx');
let mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/aftership');
let Rate = mongoose.model('Rate', {
	from: String,
	to: String,
	created_at: Date,
	rate: String
});
fx.use(fixerio);
// console.log(fx);
let Worker = require('./fx_worker');
let worker = new Worker(fx, Rate);
worker.consume({
	from: 'USD',
	to: 'HKD'
});
