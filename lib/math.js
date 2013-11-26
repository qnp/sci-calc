/*
 * mathematical functions for sci-calc
 */

'use strict';

module.exports = {

	cot: function(x) {
		return cos(x)/sin(x);
	},

	sinh: function(x) {
		return (exp(x)-exp(-x))/2;
	},

	cosh: function(x) {
		return (exp(x)+exp(-x))/2;
	},

	tanh: function(x) {
		return (exp(x)-exp(-x))/(exp(x)+exp(-x));
	},

	coth: function(x) {
		return (exp(x)+exp(-x))/(exp(x)-exp(-x));
	},

	asinh: function(x) {
		return log(x+sqrt(pow(x,2)+1));
	},

	acosh: function(x) {
		return log(x+sqrt(pow(x,2)-1));
	},

	atanh: function(x) {
		return 0.5*log((1+x)/(1-x));
	},

	acoth: function(x) {
		return 0.5*log((x+1)/(x-1));
	},

	log10: function(x) {
		return log(x)/LN10;
	},

	ln: function(x) {
		return log(x);
	},

	ln10: function(x) {
		return log(x)/LN10;
	},

	hypot: function(x,y) {
		return sqrt(pow(x,2)+pow(y,2));
	},

	cbrt: function(x) {
		return pow(x,1/3);
	}

}

