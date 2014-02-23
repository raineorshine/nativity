(function() {
	'use strict';

	var _ = require('lodash');

	/** Returns the in-bounds index of the given index for the array, supports negative and out-of-bounds indices. 
		@private
	*/
	function circ(arr, i) {
		i = i || 0;

		// one modulus to get in range, another to eliminate negative
		return (i % arr.length + arr.length) % arr.length;
	}

	/** Indexes into an array, supports negative indices. */
	function index(arr, i) {
		return arr[circ(arr, i)];
	}

	/** Returns a new array containing the elements of the given array shifted n spaces to the left, wrapping around the end. */
	function rotate(arr, n) {
		var output = [];
		var len = arr.length;
		for(var i=0; i<len; i++) {
			output.push(index(arr, i+n));
		}
		return output;
	}

	/** Returns a new function that forwards 'this' as the first parameter to the given function, and thus can be called as a method of the object itself. 
		@param thisIndex	Forwards 'this' at the given parameter index. Default: 0.
	*/
	function toInstance(f, thisIndex) {
		thisIndex = thisIndex || 0;
		return function() {
			var args = Array.prototype.slice.apply(arguments);
			return f.apply(this, rotate([].concat([this], args), -thisIndex));
		};
	}

	/** Assigns the given list of methods from the host object to the protoObj's prototype after converting them with toInstance. */
	function install(dest, src, props, options) {
	  
	  // defaults
	  props = props || Object.keys(src);
		options = _.defaults(options || {}, {
			safe: true,
			thisIndex: 0
		});

		// install
		_[options.safe ? 'defaults' : 'assign'](
			dest,
			_.zipObject(props, props.map(function(prop) {
				return src[prop] instanceof Function && typeof options.thisIndex !== 'number' ?
					toInstance(src[prop], options.thisIndex) :
					src[prop];
			}))
		);
	}

	module.exports = {
		install: install,
		toInstance: toInstance
	};
})();
