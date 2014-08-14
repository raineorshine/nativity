# nativity
Safely add methods to native object prototypes. 

* Doesn't overwrite existing properties with same name by default for safety.
* If you do overwrite properties, you can access and restore them at any time.
* Automatically forwards "this" as first argument to installed functions. This is the magic that makes non-prototype functions work as prototype functions.

## Install

	$ npm install --save nativity

## Usage

	var nativity = require('nativity');
	var _ = require('underscore');

	nativity.install(Array.prototype, _, ['findWhere', 'pluck']);

	var people = [
		{ name: 'Tina', age: 45 },
		{ name: 'Todd', age: 48 },
		{ name: 'Tucker', age: 10 }
	];

	console.log(people.findWhere({ name: 'Todd' }));
	// { name: 'Todd', age: 48 }

	console.log(people.pluck('name'));
	// ['Tina', Todd', 'Tucker']

You can install a single method:

	nativity.installOne(String.prototype, _.template, 'format');

	console.log('Hello <%= name %>!'.format({ name: 'Bartholomew' }));
	// Hello Bartholomew!

### API

#### nativity.install
Assigns the props from the source object to the destination object. Functions are converted to forward 'this' as the first argument. 

	nativity.install(destObject, srcObject[, props][, options]);

#### nativity.installOne
Assigns the value to the source object at the given key. If the value is a function it will be converted to forward 'this' as the first argument. 

	nativity.installOne(destObject, value, key[, options]);

### Options
Defaults:

	nativity.install(Array.prototype, _, ['findWhere', 'pluck'], {

		// do not override existing properties on the host object
		safe: true,

		// only add properties that are functions
		functionsOnly: false,

		// specifies the argument index at which to forward 'this'
		thisIndex: 0

	});

### Restoration
Nativity installs methods on objects *safely*, that is, you can access overwritten properties and restore them at any time.

	var mylib = {
		map: function(arr) { return 'blurp' },
		filter: function(arr) { return 'skronk' },
		dud: function() { return 'dud'; }
	};
	var installation = nativity.install(Array.prototype, mylib, { safe: false });

	console.log([1,2,3].map(function(n) { return n*n; }));
	// 'blurp'

	console.log(installation.overwritten);
	// 2

	console.log(installation.new);
	// { dud: [Function] }

	console.log(installation.prev);
	// { map: [Function], filter: [Function] }

	installation.restore();
	console.log([1,2,3].map(function(n) { return n*n; }));
	// [1,4,9]

## Notes

Technically, nativity is written such that it can add properties to any object (i.e. _.defaults). It is the automatic forwarding of "this" as the first argument to installed methods that makes it special.

	_.pluck(people, 'name')
	people.pluck('name')

Why is this better?

* Mimics Subject-Verb-Object structure of the English language
* More object-oriented
* Inherently chainable

### Build Notes

	$ gulp --require coffee-script/register

## Plugins

Nativity is designed for library authors to expose appropriate methods for use on native object prototypes in a safe manner. See the nativity plugins below for examples. Submit a pull request to add yours to the list.

* [nativity-cint](http://github.com/metaraine/nativity-cint)
* [nativity-fomatto](http://github.com/metaraine/nativity-fomatto)

