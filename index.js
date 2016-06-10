'use strict';
let fixerio = require('./converters/fixerio');
let fx = require('./converters/fx');
fx.use(fixerio);
fx.convert('USD', 'HKD')
	.then((val) => {
		console.log(val);
	});
