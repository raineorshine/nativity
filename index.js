(function(exports) {
	'use strict';

	var _ = require('lodash');

	/** Returns a new function that forwards 'this' as the first parameter to the given function, and thus can be called as a method of the object itself. 
		@param thisIndex	Forwards 'this' at the given parameter index. Default: 0.
	*/
	function toInstance(f, thisIndex) {

		// defaults
		thisIndex = thisIndex || 0;

		// validation
		if(!f) {
			throw new Error('Expected a function as the first argument.');
		}

		return function() {
			var args = Array.prototype.slice.call(arguments);

			// insert 'this' into the desired position in thea arguments
			args.splice(thisIndex, 0, this);

			// apply the given function to the arguments injected with 'this' in the context of toInstance
			return f.apply(this, args);
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

		// get the keys for the destination object
		var destKeys = props.map(function(prop) {
			return typeof prop === 'string' ? prop : prop[Object.keys(prop)[0]];
		});

		// get the source and destination keys, which could be different if they provided a key-value pair like { repeatString: repeat } instead of a simple string key.
		var destValues = props.map(function(prop) {
			var srcKey, destKey;
			if(typeof prop === 'string') {
				srcKey = destKey = prop;
			}
			else {
				srcKey = Object.keys(prop)[0];
				destKey = prop[srcKey];
			}

			// if the value is a method and thisIndex is a number, forward this as the given numbered argument
			return destKey instanceof Function && typeof options.thisIndex === 'number' ?
				toInstance(src[prop], options.thisIndex) :
				src[srcKey];
		});

		// install
		_[options.safe ? 'defaults' : 'assign'](
			dest,
			_.zipObject(destKeys, destValues)
		);
	}

	module.exports = {
		install: install,
		toInstance: toInstance
	};
})(typeof exports !== 'undefined' ? exports : window.Nativity = {});
