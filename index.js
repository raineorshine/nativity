
/* The base installation object returned by installOne
@overwritten	The number of properties that were overwritten.
@prev				  An object that stores the previous values.
@new				  An object that stores the new values.
@restore			Restores the previous values that were overwritten.
 */

(function() {
  var Installation, extend, install, installOne, isPlainObject, toInstance;

  Installation = (function() {
    function Installation(host) {
      this.host = host;
      this.overwritten = 0;
      this.prev = {};
      this["new"] = {};
    }

    Installation.prototype.restore = function() {
      var key;
      for (key in this["new"]) {
        delete this.host[key];
      }
      return extend(this.host, this.prev);
    };

    return Installation;

  })();


  /* 
  Checks if value is an object created by the Object constructor.
  @param value
  @return boolean
   */

  isPlainObject = function(value) {
    return typeof value === "object" && (!(value instanceof Array)) && (!(value instanceof Function));
  };


  /*
  Copy all of the properties in the source objects over to the destination object, 
  and return the destination object. It's in-order, so the last source will 
  override properties of the same name in previous arguments.
  @param *object takes any number of objects
  @return an object with all properties of the combined objects
   */

  extend = function(obj) {
    var args, key, prop, source;
    args = Array.prototype.slice.call(arguments, 1);
    for (key in args) {
      source = args[key];
      if (source) {
        for (prop in source) {
          obj[prop] = source[prop];
        }
      }
    }
    return obj;
  };


  /*
  Returns a new function that forwards 'this' as the first parameter to the given function, and thus can be called as a method of the object itself.
  @param thisIndex	Forwards 'this' at the given parameter index. Default: 0.
   */

  toInstance = function(f, thisIndex) {
    var message;
    thisIndex = thisIndex || 0;
    if (!f) {
      message = 'Expected a function as the first argument';
      console.error(message, f);
      throw new Error(message);
    } else if (isNaN(thisIndex)) {
      message = 'thisIndex must be a valid number';
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
    var included, installation, message, writeable;
    name = name || value.name;
    options = extend({
      safe: true,
      functionsOnly: false,
      thisIndex: 0
    }, options || {});
    installation = new Installation(dest);
    if (!name) {
      message = (typeof value === 'function' ? 'No destination key provided for anonymous function' : 'No destination key provided for value');
      console.error(message, value);
      throw new Error(message);
    }
    writeable = !(name in dest && options.safe);
    included = !(options.functionsOnly && typeof value !== 'function');
    if (writeable && included) {
      if (typeof value === 'function' && options.thisIndex !== null) {
        value = toInstance(value, options.thisIndex);
      }
      if (name in dest) {
        installation.prev[name] = dest[name];
        installation.overwritten = 1;
      } else {
        installation["new"][name] = value;
      }
      dest[name] = value;
    }
    return installation;
  };


  /*
  Assigns the props from the src object to dest after converting them with toInstance.
   */

  install = function(dest, src, props, options) {
    var installation;
    if (isPlainObject(props)) {
      options = props;
      props = null;
    }
    props = props || Object.keys(src);
    if (props instanceof Array) {
      props = props.map(function(prop) {
        var key, message;
        if (typeof prop === 'string') {
          return {
            from: prop,
            to: prop
          };
        } else if (isPlainObject(prop)) {
          key = Object.keys(prop)[0];
          return {
            from: key,
            to: prop[key]
          };
        } else {
          message = 'Expected prop to be either a string or a plain object.';
          console.error(message, prop);
          throw new Error(message);
        }
      });
    } else if (!props) {
      props = Object.keys(src);
    } else {
      options = props;
    }
    installation = new Installation(dest);
    props.forEach(function(prop) {
      var singleInstall;
      singleInstall = installOne(dest, src[prop.from], prop.to, options);
      extend(installation.prev, singleInstall.prev);
      return extend(installation["new"], singleInstall["new"]);
    });
    installation.overwritten = Object.keys(installation.prev).length;
    return installation;
  };

  extend((typeof exports !== "undefined" && exports !== null ? exports : window.Nativity = {}), {
    install: install,
    installOne: installOne,
    toInstance: toInstance
  });

}).call(this);
