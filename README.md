# nativity
Safely add methods to native object prototypes. 

* Doesn't override existing property with same name (configurable).
* Automatically forwards "this" as first argument to installed functions (configurable).

## Install

    $ npm install --save nativity

### Build Notes

    $ gulp --require coffee-script/register

## Usage

```javascript
var nativity = require('nativity');
var _ = require('underscore');

nativity.install(Array.prototype, _, ['pluck']);

var people = [
	{ name: 'Tina' },
	{ name: 'Todd' },
	{ name: 'Tucker' }
];

console.log(people.pluck('name'));
```

## Notes

Technically, nativity is written such that it can add properties to any object (i.e. _.defaults). It is the automatic forwarding of "this" as the first argument to installed methods that makes it special.

    _.pluck(people, 'name')
    people.pluck('name')

Why is this better?

* Mimics Subject-Verb-Object structure of the English language
* More object-oriented
* Chainable

## Plugins

* [nativity-cint](http://github.com/metaraine/nativity-cint)
* [nativity-fomatto](http://github.com/metaraine/nativity-fomatto)
* nativity-underscore - Coming Soon!

