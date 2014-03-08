_ = require('lodash')

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
  
  # validation
  if not name
    message = (if typeof value is 'function' then 'No destination key provided for anonymous function' else 'No destination key provided for value')
    console.error message, value
    throw new Error(message)
  safe = not (dest[name] and options.safe)
  included = not (options.functionsOnly and typeof value isnt 'function')
  
  # console.log('dest', dest);
  # console.log('nv', name, value);
  dest[name] = (if typeof value is 'function' and options.thisIndex isnt null then toInstance(value, options.thisIndex) else value)  if safe and included

###
Assigns the given list of methods from the host object to the protoObj's prototype after converting them with toInstance.
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
  
  # install each prop onto the destination
  props.forEach (prop) ->
    installOne dest, src[prop.from], prop.to, options

_.assign (if exports? then exports else window.Nativity = {}), 
  install: install
  installOne: installOne
  toInstance: toInstance
