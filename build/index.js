var MongoOp,
  __slice = [].slice;

module.exports = MongoOp = (function() {
  var deleteAt, getAt, isEqual, keys, popAt, pushAt, setAt, _ref;

  _ref = require('jspath'), setAt = _ref.setAt, getAt = _ref.getAt, deleteAt = _ref.deleteAt, pushAt = _ref.pushAt, popAt = _ref.popAt;

  keys = Object.keys;

  isEqual = require('deep-equal');

  function MongoOp(operation) {
    if (!(this instanceof MongoOp)) {
      return new MongoOp(operation);
    }
    this.operation = operation;
  }

  MongoOp.prototype.applyTo = function(target) {
    this.result = {};
    keys(this.operation).forEach((function(_this) {
      return function(operator) {
        if ('function' !== typeof _this[operator]) {
          throw new Error("Unrecognized operator: " + operator);
        } else {
          return _this[operator](target, _this.operation[operator]);
        }
      };
    })(this));
    return this;
  };

  MongoOp.prototype.map = function(fn) {
    var op;
    op = this.operation;
    this.operation = {};
    keys(op).forEach((function(_this) {
      return function(operator) {
        return _this.operation[operator] = fn(operator, op[operator]);
      };
    })(this));
    return this;
  };

  MongoOp.prototype.forEachField = function(fields, fn) {
    return keys(fields).map((function(_this) {
      return function(path) {
        var val;
        val = fields[path];
        return _this.result[path] = fn(path, val);
      };
    })(this));
  };

  MongoOp.prototype.$addToSet = (function() {
    var $addToSet;
    $addToSet = function(collection, val) {
      var item, matchFound, _i, _len;
      matchFound = false;
      for (_i = 0, _len = collection.length; _i < _len; _i++) {
        item = collection[_i];
        if (!(isEqual(item, val))) {
          continue;
        }
        matchFound = true;
        break;
      }
      if (!matchFound) {
        return collection.push(val);
      }
    };
    return function(target, fields) {
      return this.forEachField(fields, (function(_this) {
        return function(path, val) {
          var child, collection, _i, _len, _ref1, _results;
          collection = getAt(target, path);
          if (collection == null) {
            collection = [];
            setAt(target, path, collection);
          }
          if (val.$each != null) {
            _ref1 = val.$each;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              child = _ref1[_i];
              _results.push($addToSet(collection, child));
            }
            return _results;
          } else {
            return $addToSet(collection, val);
          }
        };
      })(this));
    };
  })();

  MongoOp.prototype.$push = function(target, fields) {
    return this.forEachField(fields, function(path, val) {
      return pushAt(target, path, val);
    });
  };

  MongoOp.prototype.$pushAll = function(target, fields) {
    return this.forEachField(fields, function(path, vals) {
      return pushAt.apply(null, [target, path].concat(__slice.call(vals)));
    });
  };

  MongoOp.prototype.$pull = function() {
    throw new Error("This version of MongoOp does not implement $pull...\nLook for that in a future version.  You can use $pullAll instead.");
  };

  MongoOp.prototype.$pullAll = function(target, fields) {
    return this.forEachField(fields, function(path, val) {
      var collection, i, index, _results;
      collection = getAt(target, path);
      index = 0;
      _results = [];
      while (collection && index < collection.length) {
        i = index++;
        if (isEqual(collection[i], val)) {
          _results.push(collection.splice(i, 1));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    });
  };

  MongoOp.prototype.$pop = function(target, fields) {
    return this.forEachField(fields, function(path) {
      return popAt(target, path);
    });
  };

  MongoOp.prototype.$set = function(target, fields) {
    return this.forEachField(fields, function(path, val) {
      setAt(target, path, val);
      return val;
    });
  };

  MongoOp.prototype.$unset = function(target, fields) {
    return this.forEachField(fields, function(path) {
      return deleteAt(target, path);
    });
  };

  MongoOp.prototype.$rename = function(target, fields) {
    return this.forEachField(fields, function(oldPath, newPath) {
      var val;
      val = getAt(target, oldPath);
      deleteAt(target, oldPath);
      return setAt(target, newPath, val);
    });
  };

  MongoOp.prototype.$inc = (function() {
    var $inc;
    $inc = function(val, amt) {
      return val += amt;
    };
    return function(target, fields) {
      return this.forEachField(fields, function(path, val) {
        return setAt(target, path, $inc(getAt(target, path), val));
      });
    };
  })();

  return MongoOp;

})();
