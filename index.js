var install, installOne, toInstance, _;

_ = require("lodash");


/*
Returns a new function that forwards 'this' as the first parameter to the given function, and thus can be called as a method of the object itself.
@param thisIndex	Forwards 'this' at the given parameter index. Default: 0.
 */

toInstance = function(f, thisIndex) {
  var message;
  thisIndex = thisIndex || 0;
  if (!f) {
    message = "Expected a function as the first argument";
    console.error(message, f);
    throw new Error(message);
  } else if (isNaN(thisIndex)) {
    message = "thisIndex must be a valid number";
    console.error(message, thisIndex);
    throw new Error(message);
  }
  return function() {
    var args;
    args = Array.prototype.slice.call(arguments);
    args.splice(thisIndex, 0, this);
    return f.apply(this, args);
  };
};

installOne = function(dest, value, name, options) {
  var included, message, safe;
  name = name || value.name;
  options = _.defaults(options || {}, {
    safe: true,
    functionsOnly: false,
    thisIndex: 0
  });
  if (!name) {
    message = (typeof value === "function" ? "No destination key provided for anonymous function" : "No destination key provided for value");
    console.error(message, value);
    throw new Error(message);
  }
  safe = !(dest[name] && options.safe);
  included = !(options.functionsOnly && typeof value !== "function");
  if (safe && included) {
    return dest[name] = (typeof value === "function" && options.thisIndex !== null ? toInstance(value, options.thisIndex) : value);
  }
};


/*
Assigns the given list of methods from the host object to the protoObj's prototype after converting them with toInstance.
 */

install = function(dest, src, props, options) {
  if (_.isPlainObject(props)) {
    options = props;
    props = null;
  }
  props = props || Object.keys(src);
  if (props instanceof Array) {
    props = props.map(function(prop) {
      var key, message;
      if (typeof prop === "string") {
        return {
          from: prop,
          to: prop
        };
      } else if (_.isPlainObject(prop)) {
        key = Object.keys(prop)[0];
        return {
          from: key,
          to: prop[key]
        };
      } else {
        message = "Expected prop to be either a string or a plain object.";
        console.error(message, prop);
        throw new Error(message);
      }
    });
  } else if (!props) {
    props = Object.keys(src);
  } else {
    options = props;
  }
  return props.forEach(function(prop) {
    return installOne(dest, src[prop.from], prop.to, options);
  });
};

_.assign((typeof exports !== "undefined" && exports !== null ? exports : window.Nativity = {}), {
  install: install,
  installOne: installOne,
  toInstance: toInstance
});
