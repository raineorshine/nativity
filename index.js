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
			var message = 'Expected a function as the first argument';
			console.error(message, f);
			throw new Error(message);
		}
		else if(isNaN(thisIndex)) {
			var message = 'thisIndex must be a valid number';
			console.error(message, thisIndex);
			throw new Error(message);
		}

		return function() {
			var args = Array.prototype.slice.call(arguments);

			// insert 'this' into the desired position in thea arguments
			args.splice(thisIndex, 0, this);

			// apply the given function to the arguments injected with 'this' in the context of toInstance
			return f.apply(this, args);
		};
	}

	function installOne(dest, value, name, options) {

		// defaults
		name = name || value.name;
		options = _.defaults(options || {}, {
			safe: true,
			functionsOnly: false,
			thisIndex: 0
		});

		// validation
		if(!name) {
			var message = typeof value === 'function' ?
				'No destination key provided for anonymous function' :
				'No destination key provided for value';
			console.error(message, value);
			throw new Error(message);
		};

		var safe = !(dest[name] && options.safe);
		var included = !(options.functionsOnly && typeof value !== 'function');

		// console.log('dest', dest);
		// console.log('nv', name, value);
		if(safe && included) {
			dest[name] = typeof value === 'function' && options.thisIndex !== null ?
				toInstance(value, options.thisIndex) :
				value;
		}
	}

	/** Assigns the given list of methods from the host object to the protoObj's prototype after converting them with toInstance. */
	function install(dest, src, props, options) {
	  
	  // if no props are specified, map all by default
	  if(!props) {
	  	props = Object.keys(src);
	  }

	  // convert props into an array of objects mapping keys from the src into keys of the dest
	  if(props instanceof Array) {
	  	props = props.map(function(prop) {
	  		if(typeof prop === 'string') {
	  			return {
	  				from: prop,
	  				to: prop
	  			};
	  		}
	  		else if(_.isPlainObject(prop)) {
	  			var key = Object.keys(prop)[0];
	  			return {
	  				from: key,
	  				to: prop[key]
	  			}
	  		}
	  		else {
					var message = 'Expected prop to be either a string or a plain object.';
					console.error(message, prop);
					throw new Error(message);
	  		}
	  	})
	  }

	  // install each prop onto the destination
		props.forEach(function(prop) {
		  installOne(dest, src[prop.from], prop.to, options);
		});
	}

	module.exports = {
		install: install,
		installOne: installOne,
		toInstance: toInstance
	};

})(typeof exports !== 'undefined' ? exports : window.Nativity = {});
