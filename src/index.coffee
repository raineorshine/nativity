_ = require('lodash')


### The base installation object returned by installOne
@overwritten	The number of properties that were overwritten.
@prev				  An object that stores the previous values.
@new				  An object that stores the new values.
@restore			Restores the previous values that were overwritten.
###
class Installation

	constructor: (@host)->
		@overwritten = 0
		@prev = {}
		@new = {}

	restore: ->

		# remove new properties
		for key of @new
			delete @host[key]

		# restore existing properties
		_.assign @host, @prev


###
Returns a new function that forwards 'this' as the first parameter to the given function, and thus can be called as a method of the object itself.
@param thisIndex	Forwards 'this' at the given parameter index. Default: 0.
###
toInstance = (f, thisIndex) ->
	
	# defaults
	thisIndex = thisIndex or 0
	
	# validation
	if not f
		message = 'Expected a function as the first argument'
		console.error message, f
		throw new Error(message)
	else if isNaN(thisIndex)
		message = 'thisIndex must be a valid number'
		console.error message, thisIndex
		throw new Error(message)
		
	->
		args = Array::slice.call(arguments)
		
		# insert 'this' into the desired position in thea arguments
		args.splice thisIndex, 0, this
		
		# apply the given function to the arguments injected with 'this' in the context of toInstance
		f.apply this, args

installOne = (dest, value, name, options) ->
	
	# defaults
	name = name or value.name
	options = _.defaults(options or {},
		safe: true
		functionsOnly: false
		thisIndex: 0
	)

	installation = new Installation dest

	# validation
	if not name
		message = (if typeof value is 'function' then 'No destination key provided for anonymous function' else 'No destination key provided for value')
		console.error message, value
		throw new Error(message)

	writeable = not (name of dest and options.safe)
	included = not (options.functionsOnly and typeof value isnt 'function')

	if writeable and included

		# make functions forward 'this' in the argument
		# e.g. this is the key to changing _.pluck(arr, 'name') to arr.pluck('name')
		if typeof value is 'function' and options.thisIndex isnt null
			value = toInstance(value, options.thisIndex)

		# save values for restoration
		if name of dest
			installation.prev[name] = dest[name]
			installation.overwritten = 1
		else
			installation.new[name] = value

		# finally, overwrite the value on the host object
		dest[name] = value;

	return installation;

###
Assigns the props from the src object to dest after converting them with toInstance.
###
install = (dest, src, props, options) ->
	
	# if options are specified but props is not, swap arguments
	if _.isPlainObject props
		options = props
		props = null

	# if no props are specified, map all by default
	props = props or Object.keys(src)
	
	# convert props into an array of objects mapping keys from the src into keys of the dest
	if props instanceof Array
		props = props.map((prop) ->
			if typeof prop is 'string'
				from: prop
				to: prop
			else if _.isPlainObject(prop)
				key = Object.keys(prop)[0]
				from: key
				to: prop[key]
			else
				message = 'Expected prop to be either a string or a plain object.'
				console.error message, prop
				throw new Error(message)
		)
	else if not props
		props = Object.keys src
	else
		options = props

	installation = new Installation dest

	# install each prop onto the destination
	props.forEach (prop) ->
		singleInstall = installOne dest, src[prop.from], prop.to, options
		_.assign installation.prev, singleInstall.prev
		_.assign installation.new, singleInstall.new

	# do this at the end; if multiple properties with the same name were specified we don't want to double count them
	installation.overwritten = Object.keys(installation.prev).length

	return installation

_.assign (if exports? then exports else window.Nativity = {}), 
	install: install
	installOne: installOne
	toInstance: toInstance
