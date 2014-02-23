var chai = require('chai'),
		should = chai.should(),
		nativity = require('./index.js');

describe('toInstance', function() {
	it('should return an object with "this" forwarded to the first argument', function() {
	  throw new Error('Test Not Implemented');
	});
});


describe('install', function() {

  it('should install all properties from the src object to the dest object', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20, get: function() { return this.a; } };

		nativity.install(dest, src);

		dest.should.have.property('a', 1);
		dest.should.have.property('b', 20);

		dest.should.have.property('get');
		dest.get().should.equal(1);
  });


  it('should override properties with the same name on the destination object if the safe option is set to false', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20 };

		nativity.install(dest, src, null, { safe: false });

		dest.should.have.property('a', 10);
  });


  it('should install specific properties if a property list is given', function() {
		var dest = { a: 1 };
		var src = { a: 10, b: 20, get: function() { return this.a; } };

		nativity.install(dest, src, ['b']);

		dest.should.have.property('a', 1);
		dest.should.have.property('b', 20);
		dest.should.not.have.property('get');
  });


  it('should forward "this" as the first argument to the installed method', function() {
		var lib = {
			pluck: function(arr, prop) {
			  return arr.map(function(item) {
			    return item[prop];
			  });
			}
		};
		nativity.install(Array.prototype, lib);

		people = [
			{ name: 'Theodore' },
			{ name: 'Margaret' },
			{ name: 'Ida' }
		];
		people.should.have.property('pluck')
		people.pluck('name').should.deep.equal(['Theodore', 'Margaret', 'Ida']);
  });


	it('should be able to forward "this" to any argument position', function() {
	  throw new Error('Test Not Implemented');
	});


	it('should not forward "this" if thisIndex === null', function() {
	  throw new Error('Test Not Implemented');
	});

});
