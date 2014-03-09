chai = require('chai')
should = chai.should()
nativity = require('../index.js')

describe 'toInstance', ->
	it 'should return an object with "this" forwarded to the first argument', ->
		o = a: 1
		get = (host) -> host.a

		getInstanced = nativity.toInstance(get, 0)
		getInstanced.call(o).should.equal 1
		
	it 'should use a default thisIndex of 0', ->
		o = a: 1
		get = (host) -> host.a

		getInstanced = nativity.toInstance(get)
		getInstanced.call(o).should.equal 1
		
	it 'should pass other arguments as normal', ->
		o = a: 'a'
		get = (host, one, two) -> host.a + one + two

		getInstanced = nativity.toInstance(get, 0)
		getInstanced.call(o, 'b', 'c').should.equal 'abc'
		
	it 'should forward "this" into any argument position', ->
		o = a: 'a'
		get = (one, host, two) -> host.a + one + two

		getInstanced = nativity.toInstance(get, 1)
		getInstanced.call(o, 'b', 'c').should.equal 'abc'
		get2 = (one, two, host) -> host.a + one + two

		getInstanced2 = nativity.toInstance(get2, 2)
		getInstanced2.call(o, 'b', 'c').should.equal 'abc'
		
	it 'should call the original function with the context of the instanced function', ->
		o = a: 'a'
		get = -> @a

		getInstanced = nativity.toInstance(get)
		getInstanced.call(o).should.equal 'a'
		
	
describe 'installOne', ->
	it 'should assign a given function to the destination object with the given key', ->
		dest = a:1
		get = -> @a

		nativity.installOne dest, get, 'get'
		dest.should.have.property 'a', 1
		dest.should.have.property 'get'
		dest.get().should.equal 1
		
	it 'should not forward "this" if thisIndex === null', ->
		dest = a:1
		identity = (x) -> x

		nativity.installOne dest, identity, 'identity',
			thisIndex: null

		dest.should.have.property 'a', 1
		dest.should.have.property 'identity'
		dest.identity(10).should.equal 10
		
	it 'should override properties with the same name on the destination object if the safe option is set to false', ->
		dest = a:1
		nativity.installOne dest, 10, 'a', safe:false

		dest.should.have.property 'a', 10
		
	# installation return object
	describe 'return object', ->
		it 'should have an "overwritten" property that is 1 if the property was overwritten', ->
			dest = a:1
			installation = nativity.installOne dest, 10, 'a', safe:false

			should.exist installation
			installation.should.have.property 'overwritten'
			installation.overwritten.should.equal(1)

		it 'should have an "overwritten" property that is 0 if the property was not overwritten', ->
			dest = a:1
			installation = nativity.installOne dest, 10, 'a'

			should.exist installation
			installation.should.have.property 'overwritten'
			installation.overwritten.should.equal(0)

		it 'should have a "prev" property that contains a key-value pair with the previous value if overwritten', ->
			dest = a:1, b:2
			installation = nativity.installOne dest, 10, 'a', safe:false
			should.exist installation
			installation.should.have.property 'prev'
			installation.prev.should.deep.equal(a:1)

		it 'should have a "prev" property that is an empty object if nothing was overwritten', ->
			dest = a:1
			installation = nativity.installOne dest, 10, 'a'
			should.exist installation
			installation.should.have.property 'prev'
			installation.prev.should.be.empty

		it 'should have a restore method that removes installed properties', ->
			dest = a:1
			installation = nativity.installOne dest, 20, 'b'

			should.exist installation
			installation.should.have.property 'restore'
			installation.restore()
			dest.should.have.property 'a', 1
			dest.should.not.have.property 'b'

		it 'should have a restore method that restores the previously overwritten property', ->
			dest = a:1
			installation = nativity.installOne dest, 10, 'a', safe:false

			should.exist installation
			installation.should.have.property 'restore'
			installation.restore()
			dest.should.have.property 'a', 1


describe 'install', ->
	it 'should install all properties from the src object to the dest object', ->
		dest = a:1
		src =
			a: 10
			b: 20
			get: -> @a

		nativity.install dest, src
		dest.should.have.property 'a', 1
		dest.should.have.property 'b', 20
		dest.should.have.property 'get'
		dest.get().should.equal 1

	it 'should install specific properties if a property list is given', ->
		dest = a:1
		src =
			a: 10
			b: 20
			get: -> @a

		nativity.install dest, src, ['b']
		dest.should.have.property 'a', 1
		dest.should.have.property 'b', 20
		dest.should.not.have.property 'get'

	it 'should accept a key-value pair in place of a property name which will map the key to the source object and the value to the destination object', ->
		dest = {}
		src = numberOne: -> 1

		nativity.install dest, src, [numberOne: 'one']
		dest.should.not.have.property 'numberOne'
		dest.should.have.property 'one'
		dest.one().should.equal 1

	it 'should support optional props even if an options object is supplied', ->
		dest = a:1
		src =
			a: 10
			b: 20

		nativity.install dest, src, safe:false

		dest.should.have.property 'a', 10
		dest.should.have.property 'b', 20

	# installation return object
	describe 'return object', ->
		it 'should have an "overwritten" property that indicates the number of properties that were overwritten', ->
			dest = a:1, b:2, c:3
			src = a:10, b:20

			installation = nativity.install dest, src, safe:false

			should.exist installation
			installation.should.have.property 'overwritten'
			installation.overwritten.should.equal(2)

		it 'should have an "overwritten" property that is 0 if the property was not overwritten', ->
			dest = a:1, b:2, c:3
			src = a:10, b:20

			installation = nativity.install dest, src

			should.exist installation
			installation.should.have.property 'overwritten'
			installation.overwritten.should.equal(0)

		it 'should have a "prev" property that contains a key-value pair with the previous value if overwritten', ->
			dest = a:1, b:2, c:3
			src = a:10, b:20

			installation = nativity.install dest, src, safe:false

			should.exist installation
			installation.should.have.property 'prev'
			installation.prev.should.deep.equal(a:1, b:2)

		it 'should have a "prev" property that is an empty object if nothing was overwritten', ->
			dest = a:1, b:2, c:3
			src = a:10, b:20

			installation = nativity.install dest, src

			should.exist installation
			installation.should.have.property 'prev'
			installation.prev.should.be.empty

		it 'should have a restore method that removes installed properties', ->
			dest = a:1, b:2
			src = c:30
			
			installation = nativity.install dest, src

			should.exist installation
			installation.should.have.property 'restore'
			installation.restore()
			dest.should.have.property 'a', 1
			dest.should.have.property 'b', 2
			dest.should.not.have.property 'c'

		it 'should have a restore method that restores the previously overwritten properties', ->
			dest = a:1, b:2, c:3
			src = a:10, b:20
			
			installation = nativity.install dest, src, safe:false

			should.exist installation
			installation.should.have.property 'restore'
			installation.restore()
			dest.should.have.property 'a', 1
			dest.should.have.property 'b', 2
			dest.should.have.property 'c', 3
