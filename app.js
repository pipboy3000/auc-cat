(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
(function() {
  var Bacon, BufferingSource, Bus, CompositeUnsubscribe, ConsumingSource, Desc, Dispatcher, End, Error, Event, EventStream, Exception, Initial, Next, None, Observable, Property, PropertyDispatcher, Some, Source, UpdateBarrier, _, addPropertyInitValueToStream, assert, assertArray, assertEventStream, assertFunction, assertNoArguments, assertObservable, assertObservableIsProperty, assertString, cloneArray, constantToFunction, containsDuplicateDeps, convertArgsToFunction, describe, endEvent, eventIdCounter, eventMethods, findDeps, findHandlerMethods, flatMap_, former, idCounter, initialEvent, isArray, isFieldKey, isObservable, latter, liftCallback, makeFunction, makeFunctionArgs, makeFunction_, makeObservable, makeSpawner, nextEvent, nop, partiallyApplied, recursionDepth, ref, registerObs, spys, toCombinator, toEvent, toFieldExtractor, toFieldKey, toOption, toSimpleExtractor, valueAndEnd, withDesc, withMethodCallSupport,
    hasProp = {}.hasOwnProperty,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    slice = [].slice,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Bacon = {
    toString: function() {
      return "Bacon";
    }
  };

  Bacon.version = '0.7.70';

  Exception = (typeof global !== "undefined" && global !== null ? global : this).Error;

  nop = function() {};

  latter = function(_, x) {
    return x;
  };

  former = function(x, _) {
    return x;
  };

  cloneArray = function(xs) {
    return xs.slice(0);
  };

  assert = function(message, condition) {
    if (!condition) {
      throw new Exception(message);
    }
  };

  assertObservableIsProperty = function(x) {
    if (x instanceof Observable && !(x instanceof Property)) {
      throw new Exception("Observable is not a Property : " + x);
    }
  };

  assertEventStream = function(event) {
    if (!(event instanceof EventStream)) {
      throw new Exception("not an EventStream : " + event);
    }
  };

  assertObservable = function(event) {
    if (!(event instanceof Observable)) {
      throw new Exception("not an Observable : " + event);
    }
  };

  assertFunction = function(f) {
    return assert("not a function : " + f, _.isFunction(f));
  };

  isArray = function(xs) {
    return xs instanceof Array;
  };

  isObservable = function(x) {
    return x instanceof Observable;
  };

  assertArray = function(xs) {
    if (!isArray(xs)) {
      throw new Exception("not an array : " + xs);
    }
  };

  assertNoArguments = function(args) {
    return assert("no arguments supported", args.length === 0);
  };

  assertString = function(x) {
    if (typeof x !== "string") {
      throw new Exception("not a string : " + x);
    }
  };

  _ = {
    indexOf: Array.prototype.indexOf ? function(xs, x) {
      return xs.indexOf(x);
    } : function(xs, x) {
      var i, j, len1, y;
      for (i = j = 0, len1 = xs.length; j < len1; i = ++j) {
        y = xs[i];
        if (x === y) {
          return i;
        }
      }
      return -1;
    },
    indexWhere: function(xs, f) {
      var i, j, len1, y;
      for (i = j = 0, len1 = xs.length; j < len1; i = ++j) {
        y = xs[i];
        if (f(y)) {
          return i;
        }
      }
      return -1;
    },
    head: function(xs) {
      return xs[0];
    },
    always: function(x) {
      return function() {
        return x;
      };
    },
    negate: function(f) {
      return function(x) {
        return !f(x);
      };
    },
    empty: function(xs) {
      return xs.length === 0;
    },
    tail: function(xs) {
      return xs.slice(1, xs.length);
    },
    filter: function(f, xs) {
      var filtered, j, len1, x;
      filtered = [];
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (f(x)) {
          filtered.push(x);
        }
      }
      return filtered;
    },
    map: function(f, xs) {
      var j, len1, results, x;
      results = [];
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        results.push(f(x));
      }
      return results;
    },
    each: function(xs, f) {
      var key, value;
      for (key in xs) {
        if (!hasProp.call(xs, key)) continue;
        value = xs[key];
        f(key, value);
      }
      return void 0;
    },
    toArray: function(xs) {
      if (isArray(xs)) {
        return xs;
      } else {
        return [xs];
      }
    },
    contains: function(xs, x) {
      return _.indexOf(xs, x) !== -1;
    },
    id: function(x) {
      return x;
    },
    last: function(xs) {
      return xs[xs.length - 1];
    },
    all: function(xs, f) {
      var j, len1, x;
      if (f == null) {
        f = _.id;
      }
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (!f(x)) {
          return false;
        }
      }
      return true;
    },
    any: function(xs, f) {
      var j, len1, x;
      if (f == null) {
        f = _.id;
      }
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        if (f(x)) {
          return true;
        }
      }
      return false;
    },
    without: function(x, xs) {
      return _.filter((function(y) {
        return y !== x;
      }), xs);
    },
    remove: function(x, xs) {
      var i;
      i = _.indexOf(xs, x);
      if (i >= 0) {
        return xs.splice(i, 1);
      }
    },
    fold: function(xs, seed, f) {
      var j, len1, x;
      for (j = 0, len1 = xs.length; j < len1; j++) {
        x = xs[j];
        seed = f(seed, x);
      }
      return seed;
    },
    flatMap: function(f, xs) {
      return _.fold(xs, [], (function(ys, x) {
        return ys.concat(f(x));
      }));
    },
    cached: function(f) {
      var value;
      value = None;
      return function() {
        if (value === None) {
          value = f();
          f = void 0;
        }
        return value;
      };
    },
    isFunction: function(f) {
      return typeof f === "function";
    },
    toString: function(obj) {
      var ex, internals, key, value;
      try {
        recursionDepth++;
        if (obj == null) {
          return "undefined";
        } else if (_.isFunction(obj)) {
          return "function";
        } else if (isArray(obj)) {
          if (recursionDepth > 5) {
            return "[..]";
          }
          return "[" + _.map(_.toString, obj).toString() + "]";
        } else if (((obj != null ? obj.toString : void 0) != null) && obj.toString !== Object.prototype.toString) {
          return obj.toString();
        } else if (typeof obj === "object") {
          if (recursionDepth > 5) {
            return "{..}";
          }
          internals = (function() {
            var results;
            results = [];
            for (key in obj) {
              if (!hasProp.call(obj, key)) continue;
              value = (function() {
                try {
                  return obj[key];
                } catch (_error) {
                  ex = _error;
                  return ex;
                }
              })();
              results.push(_.toString(key) + ":" + _.toString(value));
            }
            return results;
          })();
          return "{" + internals + "}";
        } else {
          return obj;
        }
      } finally {
        recursionDepth--;
      }
    }
  };

  recursionDepth = 0;

  Bacon._ = _;

  UpdateBarrier = Bacon.UpdateBarrier = (function() {
    var afterTransaction, afters, aftersIndex, currentEventId, flush, flushDepsOf, flushWaiters, hasWaiters, inTransaction, rootEvent, waiterObs, waiters, whenDoneWith, wrappedSubscribe;
    rootEvent = void 0;
    waiterObs = [];
    waiters = {};
    afters = [];
    aftersIndex = 0;
    afterTransaction = function(f) {
      if (rootEvent) {
        return afters.push(f);
      } else {
        return f();
      }
    };
    whenDoneWith = function(obs, f) {
      var obsWaiters;
      if (rootEvent) {
        obsWaiters = waiters[obs.id];
        if (obsWaiters == null) {
          obsWaiters = waiters[obs.id] = [f];
          return waiterObs.push(obs);
        } else {
          return obsWaiters.push(f);
        }
      } else {
        return f();
      }
    };
    flush = function() {
      while (waiterObs.length > 0) {
        flushWaiters(0);
      }
      return void 0;
    };
    flushWaiters = function(index) {
      var f, j, len1, obs, obsId, obsWaiters;
      obs = waiterObs[index];
      obsId = obs.id;
      obsWaiters = waiters[obsId];
      waiterObs.splice(index, 1);
      delete waiters[obsId];
      flushDepsOf(obs);
      for (j = 0, len1 = obsWaiters.length; j < len1; j++) {
        f = obsWaiters[j];
        f();
      }
      return void 0;
    };
    flushDepsOf = function(obs) {
      var dep, deps, index, j, len1;
      deps = obs.internalDeps();
      for (j = 0, len1 = deps.length; j < len1; j++) {
        dep = deps[j];
        flushDepsOf(dep);
        if (waiters[dep.id]) {
          index = _.indexOf(waiterObs, dep);
          flushWaiters(index);
        }
      }
      return void 0;
    };
    inTransaction = function(event, context, f, args) {
      var after, result;
      if (rootEvent) {
        return f.apply(context, args);
      } else {
        rootEvent = event;
        try {
          result = f.apply(context, args);
          flush();
        } finally {
          rootEvent = void 0;
          while (aftersIndex < afters.length) {
            after = afters[aftersIndex];
            aftersIndex++;
            after();
          }
          aftersIndex = 0;
          afters = [];
        }
        return result;
      }
    };
    currentEventId = function() {
      if (rootEvent) {
        return rootEvent.id;
      } else {
        return void 0;
      }
    };
    wrappedSubscribe = function(obs, sink) {
      var doUnsub, shouldUnsub, unsub, unsubd;
      unsubd = false;
      shouldUnsub = false;
      doUnsub = function() {
        return shouldUnsub = true;
      };
      unsub = function() {
        unsubd = true;
        return doUnsub();
      };
      doUnsub = obs.dispatcher.subscribe(function(event) {
        return afterTransaction(function() {
          var reply;
          if (!unsubd) {
            reply = sink(event);
            if (reply === Bacon.noMore) {
              return unsub();
            }
          }
        });
      });
      if (shouldUnsub) {
        doUnsub();
      }
      return unsub;
    };
    hasWaiters = function() {
      return waiterObs.length > 0;
    };
    return {
      whenDoneWith: whenDoneWith,
      hasWaiters: hasWaiters,
      inTransaction: inTransaction,
      currentEventId: currentEventId,
      wrappedSubscribe: wrappedSubscribe,
      afterTransaction: afterTransaction
    };
  })();

  Source = (function() {
    function Source(obs1, sync, lazy1) {
      this.obs = obs1;
      this.sync = sync;
      this.lazy = lazy1 != null ? lazy1 : false;
      this.queue = [];
    }

    Source.prototype.subscribe = function(sink) {
      return this.obs.dispatcher.subscribe(sink);
    };

    Source.prototype.toString = function() {
      return this.obs.toString();
    };

    Source.prototype.markEnded = function() {
      return this.ended = true;
    };

    Source.prototype.consume = function() {
      if (this.lazy) {
        return {
          value: _.always(this.queue[0])
        };
      } else {
        return this.queue[0];
      }
    };

    Source.prototype.push = function(x) {
      return this.queue = [x];
    };

    Source.prototype.mayHave = function() {
      return true;
    };

    Source.prototype.hasAtLeast = function() {
      return this.queue.length;
    };

    Source.prototype.flatten = true;

    return Source;

  })();

  ConsumingSource = (function(superClass) {
    extend(ConsumingSource, superClass);

    function ConsumingSource() {
      return ConsumingSource.__super__.constructor.apply(this, arguments);
    }

    ConsumingSource.prototype.consume = function() {
      return this.queue.shift();
    };

    ConsumingSource.prototype.push = function(x) {
      return this.queue.push(x);
    };

    ConsumingSource.prototype.mayHave = function(c) {
      return !this.ended || this.queue.length >= c;
    };

    ConsumingSource.prototype.hasAtLeast = function(c) {
      return this.queue.length >= c;
    };

    ConsumingSource.prototype.flatten = false;

    return ConsumingSource;

  })(Source);

  BufferingSource = (function(superClass) {
    extend(BufferingSource, superClass);

    function BufferingSource(obs) {
      BufferingSource.__super__.constructor.call(this, obs, true);
    }

    BufferingSource.prototype.consume = function() {
      var values;
      values = this.queue;
      this.queue = [];
      return {
        value: function() {
          return values;
        }
      };
    };

    BufferingSource.prototype.push = function(x) {
      return this.queue.push(x.value());
    };

    BufferingSource.prototype.hasAtLeast = function() {
      return true;
    };

    return BufferingSource;

  })(Source);

  Source.isTrigger = function(s) {
    if (s instanceof Source) {
      return s.sync;
    } else {
      return s instanceof EventStream;
    }
  };

  Source.fromObservable = function(s) {
    if (s instanceof Source) {
      return s;
    } else if (s instanceof Property) {
      return new Source(s, false);
    } else {
      return new ConsumingSource(s, true);
    }
  };

  Desc = (function() {
    function Desc(context1, method1, args1) {
      this.context = context1;
      this.method = method1;
      this.args = args1;
    }

    Desc.prototype.deps = function() {
      return this.cached || (this.cached = findDeps([this.context].concat(this.args)));
    };

    Desc.prototype.toString = function() {
      return _.toString(this.context) + "." + _.toString(this.method) + "(" + _.map(_.toString, this.args) + ")";
    };

    return Desc;

  })();

  describe = function() {
    var args, context, method;
    context = arguments[0], method = arguments[1], args = 3 <= arguments.length ? slice.call(arguments, 2) : [];
    if ((context || method) instanceof Desc) {
      return context || method;
    } else {
      return new Desc(context, method, args);
    }
  };

  withDesc = function(desc, obs) {
    obs.desc = desc;
    return obs;
  };

  findDeps = function(x) {
    if (isArray(x)) {
      return _.flatMap(findDeps, x);
    } else if (isObservable(x)) {
      return [x];
    } else if (x instanceof Source) {
      return [x.obs];
    } else {
      return [];
    }
  };

  Bacon.Desc = Desc;

  Bacon.Desc.empty = new Bacon.Desc("", "", []);

  withMethodCallSupport = function(wrapped) {
    return function() {
      var args, context, f, methodName;
      f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      if (typeof f === "object" && args.length) {
        context = f;
        methodName = args[0];
        f = function() {
          return context[methodName].apply(context, arguments);
        };
        args = args.slice(1);
      }
      return wrapped.apply(null, [f].concat(slice.call(args)));
    };
  };

  makeFunctionArgs = function(args) {
    args = Array.prototype.slice.call(args);
    return makeFunction_.apply(null, args);
  };

  partiallyApplied = function(f, applied) {
    return function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return f.apply(null, applied.concat(args));
    };
  };

  toSimpleExtractor = function(args) {
    return function(key) {
      return function(value) {
        var fieldValue;
        if (value == null) {
          return void 0;
        } else {
          fieldValue = value[key];
          if (_.isFunction(fieldValue)) {
            return fieldValue.apply(value, args);
          } else {
            return fieldValue;
          }
        }
      };
    };
  };

  toFieldExtractor = function(f, args) {
    var partFuncs, parts;
    parts = f.slice(1).split(".");
    partFuncs = _.map(toSimpleExtractor(args), parts);
    return function(value) {
      var j, len1;
      for (j = 0, len1 = partFuncs.length; j < len1; j++) {
        f = partFuncs[j];
        value = f(value);
      }
      return value;
    };
  };

  isFieldKey = function(f) {
    return (typeof f === "string") && f.length > 1 && f.charAt(0) === ".";
  };

  makeFunction_ = withMethodCallSupport(function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (_.isFunction(f)) {
      if (args.length) {
        return partiallyApplied(f, args);
      } else {
        return f;
      }
    } else if (isFieldKey(f)) {
      return toFieldExtractor(f, args);
    } else {
      return _.always(f);
    }
  });

  makeFunction = function(f, args) {
    return makeFunction_.apply(null, [f].concat(slice.call(args)));
  };

  convertArgsToFunction = function(obs, f, args, method) {
    var sampled;
    if (f instanceof Property) {
      sampled = f.sampledBy(obs, function(p, s) {
        return [p, s];
      });
      return method.call(sampled, function(arg) {
        var p, s;
        p = arg[0], s = arg[1];
        return p;
      }).map(function(arg) {
        var p, s;
        p = arg[0], s = arg[1];
        return s;
      });
    } else {
      f = makeFunction(f, args);
      return method.call(obs, f);
    }
  };

  toCombinator = function(f) {
    var key;
    if (_.isFunction(f)) {
      return f;
    } else if (isFieldKey(f)) {
      key = toFieldKey(f);
      return function(left, right) {
        return left[key](right);
      };
    } else {
      throw new Exception("not a function or a field key: " + f);
    }
  };

  toFieldKey = function(f) {
    return f.slice(1);
  };

  Some = (function() {
    function Some(value1) {
      this.value = value1;
    }

    Some.prototype.getOrElse = function() {
      return this.value;
    };

    Some.prototype.get = function() {
      return this.value;
    };

    Some.prototype.filter = function(f) {
      if (f(this.value)) {
        return new Some(this.value);
      } else {
        return None;
      }
    };

    Some.prototype.map = function(f) {
      return new Some(f(this.value));
    };

    Some.prototype.forEach = function(f) {
      return f(this.value);
    };

    Some.prototype.isDefined = true;

    Some.prototype.toArray = function() {
      return [this.value];
    };

    Some.prototype.inspect = function() {
      return "Some(" + this.value + ")";
    };

    Some.prototype.toString = function() {
      return this.inspect();
    };

    return Some;

  })();

  None = {
    getOrElse: function(value) {
      return value;
    },
    filter: function() {
      return None;
    },
    map: function() {
      return None;
    },
    forEach: function() {},
    isDefined: false,
    toArray: function() {
      return [];
    },
    inspect: function() {
      return "None";
    },
    toString: function() {
      return this.inspect();
    }
  };

  toOption = function(v) {
    if (v instanceof Some || v === None) {
      return v;
    } else {
      return new Some(v);
    }
  };

  Bacon.noMore = ["<no-more>"];

  Bacon.more = ["<more>"];

  eventIdCounter = 0;

  Event = (function() {
    function Event() {
      this.id = ++eventIdCounter;
    }

    Event.prototype.isEvent = function() {
      return true;
    };

    Event.prototype.isEnd = function() {
      return false;
    };

    Event.prototype.isInitial = function() {
      return false;
    };

    Event.prototype.isNext = function() {
      return false;
    };

    Event.prototype.isError = function() {
      return false;
    };

    Event.prototype.hasValue = function() {
      return false;
    };

    Event.prototype.filter = function() {
      return true;
    };

    Event.prototype.inspect = function() {
      return this.toString();
    };

    Event.prototype.log = function() {
      return this.toString();
    };

    return Event;

  })();

  Next = (function(superClass) {
    extend(Next, superClass);

    function Next(valueF, eager) {
      Next.__super__.constructor.call(this);
      if (!eager && _.isFunction(valueF) || valueF instanceof Next) {
        this.valueF = valueF;
        this.valueInternal = void 0;
      } else {
        this.valueF = void 0;
        this.valueInternal = valueF;
      }
    }

    Next.prototype.isNext = function() {
      return true;
    };

    Next.prototype.hasValue = function() {
      return true;
    };

    Next.prototype.value = function() {
      if (this.valueF instanceof Next) {
        this.valueInternal = this.valueF.value();
        this.valueF = void 0;
      } else if (this.valueF) {
        this.valueInternal = this.valueF();
        this.valueF = void 0;
      }
      return this.valueInternal;
    };

    Next.prototype.fmap = function(f) {
      var event, value;
      if (this.valueInternal) {
        value = this.valueInternal;
        return this.apply(function() {
          return f(value);
        });
      } else {
        event = this;
        return this.apply(function() {
          return f(event.value());
        });
      }
    };

    Next.prototype.apply = function(value) {
      return new Next(value);
    };

    Next.prototype.filter = function(f) {
      return f(this.value());
    };

    Next.prototype.toString = function() {
      return _.toString(this.value());
    };

    Next.prototype.log = function() {
      return this.value();
    };

    return Next;

  })(Event);

  Initial = (function(superClass) {
    extend(Initial, superClass);

    function Initial() {
      return Initial.__super__.constructor.apply(this, arguments);
    }

    Initial.prototype.isInitial = function() {
      return true;
    };

    Initial.prototype.isNext = function() {
      return false;
    };

    Initial.prototype.apply = function(value) {
      return new Initial(value);
    };

    Initial.prototype.toNext = function() {
      return new Next(this);
    };

    return Initial;

  })(Next);

  End = (function(superClass) {
    extend(End, superClass);

    function End() {
      return End.__super__.constructor.apply(this, arguments);
    }

    End.prototype.isEnd = function() {
      return true;
    };

    End.prototype.fmap = function() {
      return this;
    };

    End.prototype.apply = function() {
      return this;
    };

    End.prototype.toString = function() {
      return "<end>";
    };

    return End;

  })(Event);

  Error = (function(superClass) {
    extend(Error, superClass);

    function Error(error1) {
      this.error = error1;
    }

    Error.prototype.isError = function() {
      return true;
    };

    Error.prototype.fmap = function() {
      return this;
    };

    Error.prototype.apply = function() {
      return this;
    };

    Error.prototype.toString = function() {
      return "<error> " + _.toString(this.error);
    };

    return Error;

  })(Event);

  Bacon.Event = Event;

  Bacon.Initial = Initial;

  Bacon.Next = Next;

  Bacon.End = End;

  Bacon.Error = Error;

  initialEvent = function(value) {
    return new Initial(value, true);
  };

  nextEvent = function(value) {
    return new Next(value, true);
  };

  endEvent = function() {
    return new End();
  };

  toEvent = function(x) {
    if (x instanceof Event) {
      return x;
    } else {
      return nextEvent(x);
    }
  };

  idCounter = 0;

  registerObs = function() {};

  Observable = (function() {
    function Observable(desc1) {
      this.desc = desc1;
      this.id = ++idCounter;
      this.initialDesc = this.desc;
    }

    Observable.prototype.subscribe = function(sink) {
      return UpdateBarrier.wrappedSubscribe(this, sink);
    };

    Observable.prototype.subscribeInternal = function(sink) {
      return this.dispatcher.subscribe(sink);
    };

    Observable.prototype.onValue = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.hasValue()) {
          return f(event.value());
        }
      });
    };

    Observable.prototype.onValues = function(f) {
      return this.onValue(function(args) {
        return f.apply(null, args);
      });
    };

    Observable.prototype.onError = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.isError()) {
          return f(event.error);
        }
      });
    };

    Observable.prototype.onEnd = function() {
      var f;
      f = makeFunctionArgs(arguments);
      return this.subscribe(function(event) {
        if (event.isEnd()) {
          return f();
        }
      });
    };

    Observable.prototype.name = function(name) {
      this._name = name;
      return this;
    };

    Observable.prototype.withDescription = function() {
      this.desc = describe.apply(null, arguments);
      return this;
    };

    Observable.prototype.toString = function() {
      if (this._name) {
        return this._name;
      } else {
        return this.desc.toString();
      }
    };

    Observable.prototype.internalDeps = function() {
      return this.initialDesc.deps();
    };

    return Observable;

  })();

  Observable.prototype.assign = Observable.prototype.onValue;

  Observable.prototype.forEach = Observable.prototype.onValue;

  Observable.prototype.inspect = Observable.prototype.toString;

  Bacon.Observable = Observable;

  CompositeUnsubscribe = (function() {
    function CompositeUnsubscribe(ss) {
      var j, len1, s;
      if (ss == null) {
        ss = [];
      }
      this.unsubscribe = bind(this.unsubscribe, this);
      this.unsubscribed = false;
      this.subscriptions = [];
      this.starting = [];
      for (j = 0, len1 = ss.length; j < len1; j++) {
        s = ss[j];
        this.add(s);
      }
    }

    CompositeUnsubscribe.prototype.add = function(subscription) {
      var ended, unsub, unsubMe;
      if (this.unsubscribed) {
        return;
      }
      ended = false;
      unsub = nop;
      this.starting.push(subscription);
      unsubMe = (function(_this) {
        return function() {
          if (_this.unsubscribed) {
            return;
          }
          ended = true;
          _this.remove(unsub);
          return _.remove(subscription, _this.starting);
        };
      })(this);
      unsub = subscription(this.unsubscribe, unsubMe);
      if (!(this.unsubscribed || ended)) {
        this.subscriptions.push(unsub);
      } else {
        unsub();
      }
      _.remove(subscription, this.starting);
      return unsub;
    };

    CompositeUnsubscribe.prototype.remove = function(unsub) {
      if (this.unsubscribed) {
        return;
      }
      if ((_.remove(unsub, this.subscriptions)) !== void 0) {
        return unsub();
      }
    };

    CompositeUnsubscribe.prototype.unsubscribe = function() {
      var j, len1, ref, s;
      if (this.unsubscribed) {
        return;
      }
      this.unsubscribed = true;
      ref = this.subscriptions;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        s = ref[j];
        s();
      }
      this.subscriptions = [];
      return this.starting = [];
    };

    CompositeUnsubscribe.prototype.count = function() {
      if (this.unsubscribed) {
        return 0;
      }
      return this.subscriptions.length + this.starting.length;
    };

    CompositeUnsubscribe.prototype.empty = function() {
      return this.count() === 0;
    };

    return CompositeUnsubscribe;

  })();

  Bacon.CompositeUnsubscribe = CompositeUnsubscribe;

  Dispatcher = (function() {
    Dispatcher.prototype.pushing = false;

    Dispatcher.prototype.ended = false;

    Dispatcher.prototype.prevError = void 0;

    Dispatcher.prototype.unsubSrc = void 0;

    function Dispatcher(_subscribe, _handleEvent) {
      this._subscribe = _subscribe;
      this._handleEvent = _handleEvent;
      this.subscribe = bind(this.subscribe, this);
      this.handleEvent = bind(this.handleEvent, this);
      this.subscriptions = [];
      this.queue = [];
    }

    Dispatcher.prototype.hasSubscribers = function() {
      return this.subscriptions.length > 0;
    };

    Dispatcher.prototype.removeSub = function(subscription) {
      return this.subscriptions = _.without(subscription, this.subscriptions);
    };

    Dispatcher.prototype.push = function(event) {
      if (event.isEnd()) {
        this.ended = true;
      }
      return UpdateBarrier.inTransaction(event, this, this.pushIt, [event]);
    };

    Dispatcher.prototype.pushToSubscriptions = function(event) {
      var e, j, len1, reply, sub, tmp;
      try {
        tmp = this.subscriptions;
        for (j = 0, len1 = tmp.length; j < len1; j++) {
          sub = tmp[j];
          reply = sub.sink(event);
          if (reply === Bacon.noMore || event.isEnd()) {
            this.removeSub(sub);
          }
        }
        return true;
      } catch (_error) {
        e = _error;
        this.pushing = false;
        this.queue = [];
        throw e;
      }
    };

    Dispatcher.prototype.pushIt = function(event) {
      if (!this.pushing) {
        if (event === this.prevError) {
          return;
        }
        if (event.isError()) {
          this.prevError = event;
        }
        this.pushing = true;
        this.pushToSubscriptions(event);
        this.pushing = false;
        while (this.queue.length) {
          event = this.queue.shift();
          this.push(event);
        }
        if (this.hasSubscribers()) {
          return Bacon.more;
        } else {
          this.unsubscribeFromSource();
          return Bacon.noMore;
        }
      } else {
        this.queue.push(event);
        return Bacon.more;
      }
    };

    Dispatcher.prototype.handleEvent = function(event) {
      if (this._handleEvent) {
        return this._handleEvent(event);
      } else {
        return this.push(event);
      }
    };

    Dispatcher.prototype.unsubscribeFromSource = function() {
      if (this.unsubSrc) {
        this.unsubSrc();
      }
      return this.unsubSrc = void 0;
    };

    Dispatcher.prototype.subscribe = function(sink) {
      var subscription;
      if (this.ended) {
        sink(endEvent());
        return nop;
      } else {
        assertFunction(sink);
        subscription = {
          sink: sink
        };
        this.subscriptions.push(subscription);
        if (this.subscriptions.length === 1) {
          this.unsubSrc = this._subscribe(this.handleEvent);
          assertFunction(this.unsubSrc);
        }
        return (function(_this) {
          return function() {
            _this.removeSub(subscription);
            if (!_this.hasSubscribers()) {
              return _this.unsubscribeFromSource();
            }
          };
        })(this);
      }
    };

    return Dispatcher;

  })();

  Bacon.Dispatcher = Dispatcher;

  EventStream = (function(superClass) {
    extend(EventStream, superClass);

    function EventStream(desc, subscribe, handler) {
      if (_.isFunction(desc)) {
        handler = subscribe;
        subscribe = desc;
        desc = Desc.empty;
      }
      EventStream.__super__.constructor.call(this, desc);
      assertFunction(subscribe);
      this.dispatcher = new Dispatcher(subscribe, handler);
      registerObs(this);
    }

    EventStream.prototype.toProperty = function(initValue_) {
      var disp, initValue;
      initValue = arguments.length === 0 ? None : toOption(function() {
        return initValue_;
      });
      disp = this.dispatcher;
      return new Property(new Bacon.Desc(this, "toProperty", [initValue_]), function(sink) {
        var initSent, reply, sendInit, unsub;
        initSent = false;
        unsub = nop;
        reply = Bacon.more;
        sendInit = function() {
          if (!initSent) {
            return initValue.forEach(function(value) {
              initSent = true;
              reply = sink(new Initial(value));
              if (reply === Bacon.noMore) {
                unsub();
                return unsub = nop;
              }
            });
          }
        };
        unsub = disp.subscribe(function(event) {
          if (event.hasValue()) {
            if (initSent && event.isInitial()) {
              return Bacon.more;
            } else {
              if (!event.isInitial()) {
                sendInit();
              }
              initSent = true;
              initValue = new Some(event);
              return sink(event);
            }
          } else {
            if (event.isEnd()) {
              reply = sendInit();
            }
            if (reply !== Bacon.noMore) {
              return sink(event);
            }
          }
        });
        sendInit();
        return unsub;
      });
    };

    EventStream.prototype.toEventStream = function() {
      return this;
    };

    EventStream.prototype.withHandler = function(handler) {
      return new EventStream(new Bacon.Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
    };

    return EventStream;

  })(Observable);

  Bacon.EventStream = EventStream;

  Bacon.never = function() {
    return new EventStream(describe(Bacon, "never"), function(sink) {
      sink(endEvent());
      return nop;
    });
  };

  Bacon.when = function() {
    var f, i, index, ix, j, k, len, len1, len2, needsBarrier, pat, patSources, pats, patterns, ref, resultStream, s, sources, triggerFound, usage;
    if (arguments.length === 0) {
      return Bacon.never();
    }
    len = arguments.length;
    usage = "when: expecting arguments in the form (Observable+,function)+";
    assert(usage, len % 2 === 0);
    sources = [];
    pats = [];
    i = 0;
    patterns = [];
    while (i < len) {
      patterns[i] = arguments[i];
      patterns[i + 1] = arguments[i + 1];
      patSources = _.toArray(arguments[i]);
      f = constantToFunction(arguments[i + 1]);
      pat = {
        f: f,
        ixs: []
      };
      triggerFound = false;
      for (j = 0, len1 = patSources.length; j < len1; j++) {
        s = patSources[j];
        index = _.indexOf(sources, s);
        if (!triggerFound) {
          triggerFound = Source.isTrigger(s);
        }
        if (index < 0) {
          sources.push(s);
          index = sources.length - 1;
        }
        ref = pat.ixs;
        for (k = 0, len2 = ref.length; k < len2; k++) {
          ix = ref[k];
          if (ix.index === index) {
            ix.count++;
          }
        }
        pat.ixs.push({
          index: index,
          count: 1
        });
      }
      assert("At least one EventStream required", triggerFound || (!patSources.length));
      if (patSources.length > 0) {
        pats.push(pat);
      }
      i = i + 2;
    }
    if (!sources.length) {
      return Bacon.never();
    }
    sources = _.map(Source.fromObservable, sources);
    needsBarrier = (_.any(sources, function(s) {
      return s.flatten;
    })) && (containsDuplicateDeps(_.map((function(s) {
      return s.obs;
    }), sources)));
    return resultStream = new EventStream(new Bacon.Desc(Bacon, "when", patterns), function(sink) {
      var cannotMatch, cannotSync, ends, match, nonFlattened, part, triggers;
      triggers = [];
      ends = false;
      match = function(p) {
        var l, len3, ref1;
        ref1 = p.ixs;
        for (l = 0, len3 = ref1.length; l < len3; l++) {
          i = ref1[l];
          if (!sources[i.index].hasAtLeast(i.count)) {
            return false;
          }
        }
        return true;
      };
      cannotSync = function(source) {
        return !source.sync || source.ended;
      };
      cannotMatch = function(p) {
        var l, len3, ref1;
        ref1 = p.ixs;
        for (l = 0, len3 = ref1.length; l < len3; l++) {
          i = ref1[l];
          if (!sources[i.index].mayHave(i.count)) {
            return true;
          }
        }
      };
      nonFlattened = function(trigger) {
        return !trigger.source.flatten;
      };
      part = function(source) {
        return function(unsubAll) {
          var flush, flushLater, flushWhileTriggers;
          flushLater = function() {
            return UpdateBarrier.whenDoneWith(resultStream, flush);
          };
          flushWhileTriggers = function() {
            var events, l, len3, p, reply, trigger;
            if (triggers.length > 0) {
              reply = Bacon.more;
              trigger = triggers.pop();
              for (l = 0, len3 = pats.length; l < len3; l++) {
                p = pats[l];
                if (match(p)) {
                  events = (function() {
                    var len4, m, ref1, results;
                    ref1 = p.ixs;
                    results = [];
                    for (m = 0, len4 = ref1.length; m < len4; m++) {
                      i = ref1[m];
                      results.push(sources[i.index].consume());
                    }
                    return results;
                  })();
                  reply = sink(trigger.e.apply(function() {
                    var event, values;
                    values = (function() {
                      var len4, m, results;
                      results = [];
                      for (m = 0, len4 = events.length; m < len4; m++) {
                        event = events[m];
                        results.push(event.value());
                      }
                      return results;
                    })();
                    return p.f.apply(p, values);
                  }));
                  if (triggers.length) {
                    triggers = _.filter(nonFlattened, triggers);
                  }
                  if (reply === Bacon.noMore) {
                    return reply;
                  } else {
                    return flushWhileTriggers();
                  }
                }
              }
            } else {
              return Bacon.more;
            }
          };
          flush = function() {
            var reply;
            reply = flushWhileTriggers();
            if (ends) {
              if (_.all(sources, cannotSync) || _.all(pats, cannotMatch)) {
                reply = Bacon.noMore;
                sink(endEvent());
              }
            }
            if (reply === Bacon.noMore) {
              unsubAll();
            }
            return reply;
          };
          return source.subscribe(function(e) {
            var reply;
            if (e.isEnd()) {
              ends = true;
              source.markEnded();
              flushLater();
            } else if (e.isError()) {
              reply = sink(e);
            } else {
              source.push(e);
              if (source.sync) {
                triggers.push({
                  source: source,
                  e: e
                });
                if (needsBarrier || UpdateBarrier.hasWaiters()) {
                  flushLater();
                } else {
                  flush();
                }
              }
            }
            if (reply === Bacon.noMore) {
              unsubAll();
            }
            return reply || Bacon.more;
          });
        };
      };
      return new Bacon.CompositeUnsubscribe((function() {
        var l, len3, results;
        results = [];
        for (l = 0, len3 = sources.length; l < len3; l++) {
          s = sources[l];
          results.push(part(s));
        }
        return results;
      })()).unsubscribe;
    });
  };

  containsDuplicateDeps = function(observables, state) {
    var checkObservable;
    if (state == null) {
      state = [];
    }
    checkObservable = function(obs) {
      var deps;
      if (_.contains(state, obs)) {
        return true;
      } else {
        deps = obs.internalDeps();
        if (deps.length) {
          state.push(obs);
          return _.any(deps, checkObservable);
        } else {
          state.push(obs);
          return false;
        }
      }
    };
    return _.any(observables, checkObservable);
  };

  constantToFunction = function(f) {
    if (_.isFunction(f)) {
      return f;
    } else {
      return _.always(f);
    }
  };

  Bacon.groupSimultaneous = function() {
    var s, sources, streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (streams.length === 1 && isArray(streams[0])) {
      streams = streams[0];
    }
    sources = (function() {
      var j, len1, results;
      results = [];
      for (j = 0, len1 = streams.length; j < len1; j++) {
        s = streams[j];
        results.push(new BufferingSource(s));
      }
      return results;
    })();
    return withDesc(new Bacon.Desc(Bacon, "groupSimultaneous", streams), Bacon.when(sources, (function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return xs;
    })));
  };

  PropertyDispatcher = (function(superClass) {
    extend(PropertyDispatcher, superClass);

    function PropertyDispatcher(property1, subscribe, handleEvent) {
      this.property = property1;
      this.subscribe = bind(this.subscribe, this);
      PropertyDispatcher.__super__.constructor.call(this, subscribe, handleEvent);
      this.current = None;
      this.currentValueRootId = void 0;
      this.propertyEnded = false;
    }

    PropertyDispatcher.prototype.push = function(event) {
      if (event.isEnd()) {
        this.propertyEnded = true;
      }
      if (event.hasValue()) {
        this.current = new Some(event);
        this.currentValueRootId = UpdateBarrier.currentEventId();
      }
      return PropertyDispatcher.__super__.push.call(this, event);
    };

    PropertyDispatcher.prototype.maybeSubSource = function(sink, reply) {
      if (reply === Bacon.noMore) {
        return nop;
      } else if (this.propertyEnded) {
        sink(endEvent());
        return nop;
      } else {
        return Dispatcher.prototype.subscribe.call(this, sink);
      }
    };

    PropertyDispatcher.prototype.subscribe = function(sink) {
      var dispatchingId, initSent, reply, valId;
      initSent = false;
      reply = Bacon.more;
      if (this.current.isDefined && (this.hasSubscribers() || this.propertyEnded)) {
        dispatchingId = UpdateBarrier.currentEventId();
        valId = this.currentValueRootId;
        if (!this.propertyEnded && valId && dispatchingId && dispatchingId !== valId) {
          UpdateBarrier.whenDoneWith(this.property, (function(_this) {
            return function() {
              if (_this.currentValueRootId === valId) {
                return sink(initialEvent(_this.current.get().value()));
              }
            };
          })(this));
          return this.maybeSubSource(sink, reply);
        } else {
          UpdateBarrier.inTransaction(void 0, this, (function() {
            return reply = sink(initialEvent(this.current.get().value()));
          }), []);
          return this.maybeSubSource(sink, reply);
        }
      } else {
        return this.maybeSubSource(sink, reply);
      }
    };

    return PropertyDispatcher;

  })(Dispatcher);

  Property = (function(superClass) {
    extend(Property, superClass);

    function Property(desc, subscribe, handler) {
      Property.__super__.constructor.call(this, desc);
      assertFunction(subscribe);
      this.dispatcher = new PropertyDispatcher(this, subscribe, handler);
      registerObs(this);
    }

    Property.prototype.changes = function() {
      return new EventStream(new Bacon.Desc(this, "changes", []), (function(_this) {
        return function(sink) {
          return _this.dispatcher.subscribe(function(event) {
            if (!event.isInitial()) {
              return sink(event);
            }
          });
        };
      })(this));
    };

    Property.prototype.withHandler = function(handler) {
      return new Property(new Bacon.Desc(this, "withHandler", [handler]), this.dispatcher.subscribe, handler);
    };

    Property.prototype.toProperty = function() {
      assertNoArguments(arguments);
      return this;
    };

    Property.prototype.toEventStream = function() {
      return new EventStream(new Bacon.Desc(this, "toEventStream", []), (function(_this) {
        return function(sink) {
          return _this.dispatcher.subscribe(function(event) {
            if (event.isInitial()) {
              event = event.toNext();
            }
            return sink(event);
          });
        };
      })(this));
    };

    return Property;

  })(Observable);

  Bacon.Property = Property;

  Bacon.constant = function(value) {
    return new Property(new Bacon.Desc(Bacon, "constant", [value]), function(sink) {
      sink(initialEvent(value));
      sink(endEvent());
      return nop;
    });
  };

  Bacon.fromBinder = function(binder, eventTransformer) {
    if (eventTransformer == null) {
      eventTransformer = _.id;
    }
    return new EventStream(new Bacon.Desc(Bacon, "fromBinder", [binder, eventTransformer]), function(sink) {
      var shouldUnbind, unbind, unbinder, unbound;
      unbound = false;
      shouldUnbind = false;
      unbind = function() {
        if (!unbound) {
          if (typeof unbinder !== "undefined" && unbinder !== null) {
            unbinder();
            return unbound = true;
          } else {
            return shouldUnbind = true;
          }
        }
      };
      unbinder = binder(function() {
        var args, event, j, len1, reply, value;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        value = eventTransformer.apply(this, args);
        if (!(isArray(value) && _.last(value) instanceof Event)) {
          value = [value];
        }
        reply = Bacon.more;
        for (j = 0, len1 = value.length; j < len1; j++) {
          event = value[j];
          reply = sink(event = toEvent(event));
          if (reply === Bacon.noMore || event.isEnd()) {
            unbind();
            return reply;
          }
        }
        return reply;
      });
      if (shouldUnbind) {
        unbind();
      }
      return unbind;
    });
  };

  eventMethods = [["addEventListener", "removeEventListener"], ["addListener", "removeListener"], ["on", "off"], ["bind", "unbind"]];

  findHandlerMethods = function(target) {
    var j, len1, methodPair, pair;
    for (j = 0, len1 = eventMethods.length; j < len1; j++) {
      pair = eventMethods[j];
      methodPair = [target[pair[0]], target[pair[1]]];
      if (methodPair[0] && methodPair[1]) {
        return methodPair;
      }
    }
    throw new Error("No suitable event methods in " + target);
  };

  Bacon.fromEventTarget = function(target, eventName, eventTransformer) {
    var ref, sub, unsub;
    ref = findHandlerMethods(target), sub = ref[0], unsub = ref[1];
    return withDesc(new Bacon.Desc(Bacon, "fromEvent", [target, eventName]), Bacon.fromBinder(function(handler) {
      sub.call(target, eventName, handler);
      return function() {
        return unsub.call(target, eventName, handler);
      };
    }, eventTransformer));
  };

  Bacon.fromEvent = Bacon.fromEventTarget;

  Bacon.Observable.prototype.map = function() {
    var args, p;
    p = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return convertArgsToFunction(this, p, args, function(f) {
      return withDesc(new Bacon.Desc(this, "map", [f]), this.withHandler(function(event) {
        return this.push(event.fmap(f));
      }));
    });
  };

  Bacon.combineAsArray = function() {
    var index, j, len1, s, sources, stream, streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (streams.length === 1 && isArray(streams[0])) {
      streams = streams[0];
    }
    for (index = j = 0, len1 = streams.length; j < len1; index = ++j) {
      stream = streams[index];
      if (!(isObservable(stream))) {
        streams[index] = Bacon.constant(stream);
      }
    }
    if (streams.length) {
      sources = (function() {
        var k, len2, results;
        results = [];
        for (k = 0, len2 = streams.length; k < len2; k++) {
          s = streams[k];
          results.push(new Source(s, true));
        }
        return results;
      })();
      return withDesc(new Bacon.Desc(Bacon, "combineAsArray", streams), Bacon.when(sources, (function() {
        var xs;
        xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return xs;
      })).toProperty());
    } else {
      return Bacon.constant([]);
    }
  };

  Bacon.onValues = function() {
    var f, j, streams;
    streams = 2 <= arguments.length ? slice.call(arguments, 0, j = arguments.length - 1) : (j = 0, []), f = arguments[j++];
    return Bacon.combineAsArray(streams).onValues(f);
  };

  Bacon.combineWith = function() {
    var f, streams;
    f = arguments[0], streams = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return withDesc(new Bacon.Desc(Bacon, "combineWith", [f].concat(slice.call(streams))), Bacon.combineAsArray(streams).map(function(values) {
      return f.apply(null, values);
    }));
  };

  Bacon.Observable.prototype.combine = function(other, f) {
    var combinator;
    combinator = toCombinator(f);
    return withDesc(new Bacon.Desc(this, "combine", [other, f]), Bacon.combineAsArray(this, other).map(function(values) {
      return combinator(values[0], values[1]);
    }));
  };

  Bacon.Observable.prototype.withStateMachine = function(initState, f) {
    var state;
    state = initState;
    return withDesc(new Bacon.Desc(this, "withStateMachine", [initState, f]), this.withHandler(function(event) {
      var fromF, j, len1, newState, output, outputs, reply;
      fromF = f(state, event);
      newState = fromF[0], outputs = fromF[1];
      state = newState;
      reply = Bacon.more;
      for (j = 0, len1 = outputs.length; j < len1; j++) {
        output = outputs[j];
        reply = this.push(output);
        if (reply === Bacon.noMore) {
          return reply;
        }
      }
      return reply;
    }));
  };

  Bacon.Observable.prototype.skipDuplicates = function(isEqual) {
    if (isEqual == null) {
      isEqual = function(a, b) {
        return a === b;
      };
    }
    return withDesc(new Bacon.Desc(this, "skipDuplicates", []), this.withStateMachine(None, function(prev, event) {
      if (!event.hasValue()) {
        return [prev, [event]];
      } else if (event.isInitial() || prev === None || !isEqual(prev.get(), event.value())) {
        return [new Some(event.value()), [event]];
      } else {
        return [prev, []];
      }
    }));
  };

  Bacon.Observable.prototype.awaiting = function(other) {
    return withDesc(new Bacon.Desc(this, "awaiting", [other]), Bacon.groupSimultaneous(this, other).map(function(arg) {
      var myValues, otherValues;
      myValues = arg[0], otherValues = arg[1];
      return otherValues.length === 0;
    }).toProperty(false).skipDuplicates());
  };

  Bacon.Observable.prototype.not = function() {
    return withDesc(new Bacon.Desc(this, "not", []), this.map(function(x) {
      return !x;
    }));
  };

  Bacon.Property.prototype.and = function(other) {
    return withDesc(new Bacon.Desc(this, "and", [other]), this.combine(other, function(x, y) {
      return x && y;
    }));
  };

  Bacon.Property.prototype.or = function(other) {
    return withDesc(new Bacon.Desc(this, "or", [other]), this.combine(other, function(x, y) {
      return x || y;
    }));
  };

  Bacon.scheduler = {
    setTimeout: function(f, d) {
      return setTimeout(f, d);
    },
    setInterval: function(f, i) {
      return setInterval(f, i);
    },
    clearInterval: function(id) {
      return clearInterval(id);
    },
    clearTimeout: function(id) {
      return clearTimeout(id);
    },
    now: function() {
      return new Date().getTime();
    }
  };

  Bacon.EventStream.prototype.bufferWithTime = function(delay) {
    return withDesc(new Bacon.Desc(this, "bufferWithTime", [delay]), this.bufferWithTimeOrCount(delay, Number.MAX_VALUE));
  };

  Bacon.EventStream.prototype.bufferWithCount = function(count) {
    return withDesc(new Bacon.Desc(this, "bufferWithCount", [count]), this.bufferWithTimeOrCount(void 0, count));
  };

  Bacon.EventStream.prototype.bufferWithTimeOrCount = function(delay, count) {
    var flushOrSchedule;
    flushOrSchedule = function(buffer) {
      if (buffer.values.length === count) {
        return buffer.flush();
      } else if (delay !== void 0) {
        return buffer.schedule();
      }
    };
    return withDesc(new Bacon.Desc(this, "bufferWithTimeOrCount", [delay, count]), this.buffer(delay, flushOrSchedule, flushOrSchedule));
  };

  Bacon.EventStream.prototype.buffer = function(delay, onInput, onFlush) {
    var buffer, delayMs, reply;
    if (onInput == null) {
      onInput = nop;
    }
    if (onFlush == null) {
      onFlush = nop;
    }
    buffer = {
      scheduled: null,
      end: void 0,
      values: [],
      flush: function() {
        var reply, valuesToPush;
        if (this.scheduled) {
          Bacon.scheduler.clearTimeout(this.scheduled);
          this.scheduled = null;
        }
        if (this.values.length > 0) {
          valuesToPush = this.values;
          this.values = [];
          reply = this.push(nextEvent(valuesToPush));
          if (this.end != null) {
            return this.push(this.end);
          } else if (reply !== Bacon.noMore) {
            return onFlush(this);
          }
        } else {
          if (this.end != null) {
            return this.push(this.end);
          }
        }
      },
      schedule: function() {
        if (!this.scheduled) {
          return this.scheduled = delay((function(_this) {
            return function() {
              return _this.flush();
            };
          })(this));
        }
      }
    };
    reply = Bacon.more;
    if (!_.isFunction(delay)) {
      delayMs = delay;
      delay = function(f) {
        return Bacon.scheduler.setTimeout(f, delayMs);
      };
    }
    return withDesc(new Bacon.Desc(this, "buffer", []), this.withHandler(function(event) {
      buffer.push = (function(_this) {
        return function(event) {
          return _this.push(event);
        };
      })(this);
      if (event.isError()) {
        reply = this.push(event);
      } else if (event.isEnd()) {
        buffer.end = event;
        if (!buffer.scheduled) {
          buffer.flush();
        }
      } else {
        buffer.values.push(event.value());
        onInput(buffer);
      }
      return reply;
    }));
  };

  Bacon.Observable.prototype.filter = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "filter", [f]), this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          return Bacon.more;
        }
      }));
    });
  };

  Bacon.once = function(value) {
    return new EventStream(new Desc(Bacon, "once", [value]), function(sink) {
      sink(toEvent(value));
      sink(endEvent());
      return nop;
    });
  };

  Bacon.EventStream.prototype.concat = function(right) {
    var left;
    left = this;
    return new EventStream(new Bacon.Desc(left, "concat", [right]), function(sink) {
      var unsubLeft, unsubRight;
      unsubRight = nop;
      unsubLeft = left.dispatcher.subscribe(function(e) {
        if (e.isEnd()) {
          return unsubRight = right.dispatcher.subscribe(sink);
        } else {
          return sink(e);
        }
      });
      return function() {
        unsubLeft();
        return unsubRight();
      };
    });
  };

  Bacon.Observable.prototype.flatMap = function() {
    return flatMap_(this, makeSpawner(arguments));
  };

  Bacon.Observable.prototype.flatMapFirst = function() {
    return flatMap_(this, makeSpawner(arguments), true);
  };

  flatMap_ = function(root, f, firstOnly, limit) {
    var childDeps, result, rootDep;
    rootDep = [root];
    childDeps = [];
    result = new EventStream(new Bacon.Desc(root, "flatMap" + (firstOnly ? "First" : ""), [f]), function(sink) {
      var checkEnd, checkQueue, composite, queue, spawn;
      composite = new CompositeUnsubscribe();
      queue = [];
      spawn = function(event) {
        var child;
        child = makeObservable(f(event.value()));
        childDeps.push(child);
        return composite.add(function(unsubAll, unsubMe) {
          return child.dispatcher.subscribe(function(event) {
            var reply;
            if (event.isEnd()) {
              _.remove(child, childDeps);
              checkQueue();
              checkEnd(unsubMe);
              return Bacon.noMore;
            } else {
              if (event instanceof Initial) {
                event = event.toNext();
              }
              reply = sink(event);
              if (reply === Bacon.noMore) {
                unsubAll();
              }
              return reply;
            }
          });
        });
      };
      checkQueue = function() {
        var event;
        event = queue.shift();
        if (event) {
          return spawn(event);
        }
      };
      checkEnd = function(unsub) {
        unsub();
        if (composite.empty()) {
          return sink(endEvent());
        }
      };
      composite.add(function(__, unsubRoot) {
        return root.dispatcher.subscribe(function(event) {
          if (event.isEnd()) {
            return checkEnd(unsubRoot);
          } else if (event.isError()) {
            return sink(event);
          } else if (firstOnly && composite.count() > 1) {
            return Bacon.more;
          } else {
            if (composite.unsubscribed) {
              return Bacon.noMore;
            }
            if (limit && composite.count() > limit) {
              return queue.push(event);
            } else {
              return spawn(event);
            }
          }
        });
      });
      return composite.unsubscribe;
    });
    result.internalDeps = function() {
      if (childDeps.length) {
        return rootDep.concat(childDeps);
      } else {
        return rootDep;
      }
    };
    return result;
  };

  makeSpawner = function(args) {
    if (args.length === 1 && isObservable(args[0])) {
      return _.always(args[0]);
    } else {
      return makeFunctionArgs(args);
    }
  };

  makeObservable = function(x) {
    if (isObservable(x)) {
      return x;
    } else {
      return Bacon.once(x);
    }
  };

  Bacon.Observable.prototype.flatMapWithConcurrencyLimit = function() {
    var args, limit;
    limit = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return withDesc(new Bacon.Desc(this, "flatMapWithConcurrencyLimit", [limit].concat(slice.call(args))), flatMap_(this, makeSpawner(args), false, limit));
  };

  Bacon.Observable.prototype.flatMapConcat = function() {
    return withDesc(new Bacon.Desc(this, "flatMapConcat", Array.prototype.slice.call(arguments, 0)), this.flatMapWithConcurrencyLimit.apply(this, [1].concat(slice.call(arguments))));
  };

  Bacon.later = function(delay, value) {
    return withDesc(new Bacon.Desc(Bacon, "later", [delay, value]), Bacon.fromBinder(function(sink) {
      var id, sender;
      sender = function() {
        return sink([value, endEvent()]);
      };
      id = Bacon.scheduler.setTimeout(sender, delay);
      return function() {
        return Bacon.scheduler.clearTimeout(id);
      };
    }));
  };

  Bacon.Observable.prototype.bufferingThrottle = function(minimumInterval) {
    return withDesc(new Bacon.Desc(this, "bufferingThrottle", [minimumInterval]), this.flatMapConcat(function(x) {
      return Bacon.once(x).concat(Bacon.later(minimumInterval).filter(false));
    }));
  };

  Bacon.Property.prototype.bufferingThrottle = function() {
    return Bacon.Observable.prototype.bufferingThrottle.apply(this, arguments).toProperty();
  };

  Bus = (function(superClass) {
    extend(Bus, superClass);

    function Bus() {
      this.guardedSink = bind(this.guardedSink, this);
      this.subscribeAll = bind(this.subscribeAll, this);
      this.unsubAll = bind(this.unsubAll, this);
      this.sink = void 0;
      this.subscriptions = [];
      this.ended = false;
      Bus.__super__.constructor.call(this, new Bacon.Desc(Bacon, "Bus", []), this.subscribeAll);
    }

    Bus.prototype.unsubAll = function() {
      var j, len1, ref, sub;
      ref = this.subscriptions;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        sub = ref[j];
        if (typeof sub.unsub === "function") {
          sub.unsub();
        }
      }
      return void 0;
    };

    Bus.prototype.subscribeAll = function(newSink) {
      var j, len1, ref, subscription;
      if (this.ended) {
        newSink(endEvent());
      } else {
        this.sink = newSink;
        ref = cloneArray(this.subscriptions);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          subscription = ref[j];
          this.subscribeInput(subscription);
        }
      }
      return this.unsubAll;
    };

    Bus.prototype.guardedSink = function(input) {
      return (function(_this) {
        return function(event) {
          if (event.isEnd()) {
            _this.unsubscribeInput(input);
            return Bacon.noMore;
          } else {
            return _this.sink(event);
          }
        };
      })(this);
    };

    Bus.prototype.subscribeInput = function(subscription) {
      return subscription.unsub = subscription.input.dispatcher.subscribe(this.guardedSink(subscription.input));
    };

    Bus.prototype.unsubscribeInput = function(input) {
      var i, j, len1, ref, sub;
      ref = this.subscriptions;
      for (i = j = 0, len1 = ref.length; j < len1; i = ++j) {
        sub = ref[i];
        if (sub.input === input) {
          if (typeof sub.unsub === "function") {
            sub.unsub();
          }
          this.subscriptions.splice(i, 1);
          return;
        }
      }
    };

    Bus.prototype.plug = function(input) {
      var sub;
      assertObservable(input);
      if (this.ended) {
        return;
      }
      sub = {
        input: input
      };
      this.subscriptions.push(sub);
      if ((this.sink != null)) {
        this.subscribeInput(sub);
      }
      return (function(_this) {
        return function() {
          return _this.unsubscribeInput(input);
        };
      })(this);
    };

    Bus.prototype.end = function() {
      this.ended = true;
      this.unsubAll();
      return typeof this.sink === "function" ? this.sink(endEvent()) : void 0;
    };

    Bus.prototype.push = function(value) {
      if (!this.ended) {
        return typeof this.sink === "function" ? this.sink(nextEvent(value)) : void 0;
      }
    };

    Bus.prototype.error = function(error) {
      return typeof this.sink === "function" ? this.sink(new Error(error)) : void 0;
    };

    return Bus;

  })(EventStream);

  Bacon.Bus = Bus;

  liftCallback = function(desc, wrapped) {
    return withMethodCallSupport(function() {
      var args, f, stream;
      f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
      stream = partiallyApplied(wrapped, [
        function(values, callback) {
          return f.apply(null, slice.call(values).concat([callback]));
        }
      ]);
      return withDesc(new Bacon.Desc(Bacon, desc, [f].concat(slice.call(args))), Bacon.combineAsArray(args).flatMap(stream));
    });
  };

  Bacon.fromCallback = liftCallback("fromCallback", function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return Bacon.fromBinder(function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    }, (function(value) {
      return [value, endEvent()];
    }));
  });

  Bacon.fromNodeCallback = liftCallback("fromNodeCallback", function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return Bacon.fromBinder(function(handler) {
      makeFunction(f, args)(handler);
      return nop;
    }, function(error, value) {
      if (error) {
        return [new Error(error), endEvent()];
      }
      return [value, endEvent()];
    });
  });

  Bacon.combineTemplate = function(template) {
    var applyStreamValue, combinator, compile, compileTemplate, constantValue, current, funcs, mkContext, pushContext, setValue, streams;
    funcs = [];
    streams = [];
    current = function(ctxStack) {
      return ctxStack[ctxStack.length - 1];
    };
    setValue = function(ctxStack, key, value) {
      return current(ctxStack)[key] = value;
    };
    applyStreamValue = function(key, index) {
      return function(ctxStack, values) {
        return setValue(ctxStack, key, values[index]);
      };
    };
    constantValue = function(key, value) {
      return function(ctxStack) {
        return setValue(ctxStack, key, value);
      };
    };
    mkContext = function(template) {
      if (isArray(template)) {
        return [];
      } else {
        return {};
      }
    };
    pushContext = function(key, value) {
      return function(ctxStack) {
        var newContext;
        newContext = mkContext(value);
        setValue(ctxStack, key, newContext);
        return ctxStack.push(newContext);
      };
    };
    compile = function(key, value) {
      var popContext;
      if (isObservable(value)) {
        streams.push(value);
        return funcs.push(applyStreamValue(key, streams.length - 1));
      } else if (value === Object(value) && typeof value !== "function" && !(value instanceof RegExp) && !(value instanceof Date)) {
        popContext = function(ctxStack) {
          return ctxStack.pop();
        };
        funcs.push(pushContext(key, value));
        compileTemplate(value);
        return funcs.push(popContext);
      } else {
        return funcs.push(constantValue(key, value));
      }
    };
    compileTemplate = function(template) {
      return _.each(template, compile);
    };
    compileTemplate(template);
    combinator = function(values) {
      var ctxStack, f, j, len1, rootContext;
      rootContext = mkContext(template);
      ctxStack = [rootContext];
      for (j = 0, len1 = funcs.length; j < len1; j++) {
        f = funcs[j];
        f(ctxStack, values);
      }
      return rootContext;
    };
    return withDesc(new Bacon.Desc(Bacon, "combineTemplate", [template]), Bacon.combineAsArray(streams).map(combinator));
  };

  addPropertyInitValueToStream = function(property, stream) {
    var justInitValue;
    justInitValue = new EventStream(describe(property, "justInitValue"), function(sink) {
      var unsub, value;
      value = void 0;
      unsub = property.dispatcher.subscribe(function(event) {
        if (!event.isEnd()) {
          value = event;
        }
        return Bacon.noMore;
      });
      UpdateBarrier.whenDoneWith(justInitValue, function() {
        if (value != null) {
          sink(value);
        }
        return sink(endEvent());
      });
      return unsub;
    });
    return justInitValue.concat(stream).toProperty();
  };

  Bacon.Observable.prototype.mapEnd = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "mapEnd", [f]), this.withHandler(function(event) {
      if (event.isEnd()) {
        this.push(nextEvent(f(event)));
        this.push(endEvent());
        return Bacon.noMore;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.skipErrors = function() {
    return withDesc(new Bacon.Desc(this, "skipErrors", []), this.withHandler(function(event) {
      if (event.isError()) {
        return Bacon.more;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.EventStream.prototype.takeUntil = function(stopper) {
    var endMarker;
    endMarker = {};
    return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), Bacon.groupSimultaneous(this.mapEnd(endMarker), stopper.skipErrors()).withHandler(function(event) {
      var data, j, len1, ref, reply, value;
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        ref = event.value(), data = ref[0], stopper = ref[1];
        if (stopper.length) {
          return this.push(endEvent());
        } else {
          reply = Bacon.more;
          for (j = 0, len1 = data.length; j < len1; j++) {
            value = data[j];
            if (value === endMarker) {
              reply = this.push(endEvent());
            } else {
              reply = this.push(nextEvent(value));
            }
          }
          return reply;
        }
      }
    }));
  };

  Bacon.Property.prototype.takeUntil = function(stopper) {
    var changes;
    changes = this.changes().takeUntil(stopper);
    return withDesc(new Bacon.Desc(this, "takeUntil", [stopper]), addPropertyInitValueToStream(this, changes));
  };

  Bacon.Observable.prototype.flatMapLatest = function() {
    var f, stream;
    f = makeSpawner(arguments);
    stream = this.toEventStream();
    return withDesc(new Bacon.Desc(this, "flatMapLatest", [f]), stream.flatMap(function(value) {
      return makeObservable(f(value)).takeUntil(stream);
    }));
  };

  Bacon.Property.prototype.delayChanges = function(desc, f) {
    return withDesc(desc, addPropertyInitValueToStream(this, f(this.changes())));
  };

  Bacon.EventStream.prototype.delay = function(delay) {
    return withDesc(new Bacon.Desc(this, "delay", [delay]), this.flatMap(function(value) {
      return Bacon.later(delay, value);
    }));
  };

  Bacon.Property.prototype.delay = function(delay) {
    return this.delayChanges(new Bacon.Desc(this, "delay", [delay]), function(changes) {
      return changes.delay(delay);
    });
  };

  Bacon.EventStream.prototype.debounce = function(delay) {
    return withDesc(new Bacon.Desc(this, "debounce", [delay]), this.flatMapLatest(function(value) {
      return Bacon.later(delay, value);
    }));
  };

  Bacon.Property.prototype.debounce = function(delay) {
    return this.delayChanges(new Bacon.Desc(this, "debounce", [delay]), function(changes) {
      return changes.debounce(delay);
    });
  };

  Bacon.EventStream.prototype.debounceImmediate = function(delay) {
    return withDesc(new Bacon.Desc(this, "debounceImmediate", [delay]), this.flatMapFirst(function(value) {
      return Bacon.once(value).concat(Bacon.later(delay).filter(false));
    }));
  };

  Bacon.Observable.prototype.decode = function(cases) {
    return withDesc(new Bacon.Desc(this, "decode", [cases]), this.combine(Bacon.combineTemplate(cases), function(key, values) {
      return values[key];
    }));
  };

  Bacon.Observable.prototype.scan = function(seed, f) {
    var acc, initHandled, resultProperty, subscribe;
    f = toCombinator(f);
    acc = toOption(seed);
    initHandled = false;
    subscribe = (function(_this) {
      return function(sink) {
        var initSent, reply, sendInit, unsub;
        initSent = false;
        unsub = nop;
        reply = Bacon.more;
        sendInit = function() {
          if (!initSent) {
            return acc.forEach(function(value) {
              initSent = initHandled = true;
              reply = sink(new Initial(function() {
                return value;
              }));
              if (reply === Bacon.noMore) {
                unsub();
                return unsub = nop;
              }
            });
          }
        };
        unsub = _this.dispatcher.subscribe(function(event) {
          var next, prev;
          if (event.hasValue()) {
            if (initHandled && event.isInitial()) {
              return Bacon.more;
            } else {
              if (!event.isInitial()) {
                sendInit();
              }
              initSent = initHandled = true;
              prev = acc.getOrElse(void 0);
              next = f(prev, event.value());
              acc = new Some(next);
              return sink(event.apply(function() {
                return next;
              }));
            }
          } else {
            if (event.isEnd()) {
              reply = sendInit();
            }
            if (reply !== Bacon.noMore) {
              return sink(event);
            }
          }
        });
        UpdateBarrier.whenDoneWith(resultProperty, sendInit);
        return unsub;
      };
    })(this);
    return resultProperty = new Property(new Bacon.Desc(this, "scan", [seed, f]), subscribe);
  };

  Bacon.Observable.prototype.diff = function(start, f) {
    f = toCombinator(f);
    return withDesc(new Bacon.Desc(this, "diff", [start, f]), this.scan([start], function(prevTuple, next) {
      return [next, f(prevTuple[0], next)];
    }).filter(function(tuple) {
      return tuple.length === 2;
    }).map(function(tuple) {
      return tuple[1];
    }));
  };

  Bacon.Observable.prototype.doAction = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "doAction", [f]), this.withHandler(function(event) {
      if (event.hasValue()) {
        f(event.value());
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.doError = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "doError", [f]), this.withHandler(function(event) {
      if (event.isError()) {
        f(event.error);
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.doLog = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return withDesc(new Bacon.Desc(this, "doLog", args), this.withHandler(function(event) {
      if (typeof console !== "undefined" && console !== null) {
        if (typeof console.log === "function") {
          console.log.apply(console, slice.call(args).concat([event.log()]));
        }
      }
      return this.push(event);
    }));
  };

  Bacon.Observable.prototype.endOnError = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (f == null) {
      f = true;
    }
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "endOnError", []), this.withHandler(function(event) {
        if (event.isError() && f(event.error)) {
          this.push(event);
          return this.push(endEvent());
        } else {
          return this.push(event);
        }
      }));
    });
  };

  Observable.prototype.errors = function() {
    return withDesc(new Bacon.Desc(this, "errors", []), this.filter(function() {
      return false;
    }));
  };

  valueAndEnd = (function(value) {
    return [value, endEvent()];
  });

  Bacon.fromPromise = function(promise, abort, eventTransformer) {
    if (eventTransformer == null) {
      eventTransformer = valueAndEnd;
    }
    return withDesc(new Bacon.Desc(Bacon, "fromPromise", [promise]), Bacon.fromBinder(function(handler) {
      var ref;
      if ((ref = promise.then(handler, function(e) {
        return handler(new Error(e));
      })) != null) {
        if (typeof ref.done === "function") {
          ref.done();
        }
      }
      return function() {
        if (abort) {
          return typeof promise.abort === "function" ? promise.abort() : void 0;
        }
      };
    }, eventTransformer));
  };

  Bacon.Observable.prototype.mapError = function() {
    var f;
    f = makeFunctionArgs(arguments);
    return withDesc(new Bacon.Desc(this, "mapError", [f]), this.withHandler(function(event) {
      if (event.isError()) {
        return this.push(nextEvent(f(event.error)));
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.flatMapError = function(fn) {
    return withDesc(new Bacon.Desc(this, "flatMapError", [fn]), this.mapError(function(err) {
      return new Error(err);
    }).flatMap(function(x) {
      if (x instanceof Error) {
        return fn(x.error);
      } else {
        return Bacon.once(x);
      }
    }));
  };

  Bacon.EventStream.prototype.sampledBy = function(sampler, combinator) {
    return withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]), this.toProperty().sampledBy(sampler, combinator));
  };

  Bacon.Property.prototype.sampledBy = function(sampler, combinator) {
    var lazy, result, samplerSource, stream, thisSource;
    if (combinator != null) {
      combinator = toCombinator(combinator);
    } else {
      lazy = true;
      combinator = function(f) {
        return f.value();
      };
    }
    thisSource = new Source(this, false, lazy);
    samplerSource = new Source(sampler, true, lazy);
    stream = Bacon.when([thisSource, samplerSource], combinator);
    result = sampler instanceof Property ? stream.toProperty() : stream;
    return withDesc(new Bacon.Desc(this, "sampledBy", [sampler, combinator]), result);
  };

  Bacon.Property.prototype.sample = function(interval) {
    return withDesc(new Bacon.Desc(this, "sample", [interval]), this.sampledBy(Bacon.interval(interval, {})));
  };

  Bacon.Observable.prototype.map = function() {
    var args, p;
    p = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (p instanceof Property) {
      return p.sampledBy(this, former);
    } else {
      return convertArgsToFunction(this, p, args, function(f) {
        return withDesc(new Bacon.Desc(this, "map", [f]), this.withHandler(function(event) {
          return this.push(event.fmap(f));
        }));
      });
    }
  };

  Bacon.Observable.prototype.fold = function(seed, f) {
    return withDesc(new Bacon.Desc(this, "fold", [seed, f]), this.scan(seed, f).sampledBy(this.filter(false).mapEnd().toProperty()));
  };

  Observable.prototype.reduce = Observable.prototype.fold;

  Bacon.fromPoll = function(delay, poll) {
    return withDesc(new Bacon.Desc(Bacon, "fromPoll", [delay, poll]), Bacon.fromBinder((function(handler) {
      var id;
      id = Bacon.scheduler.setInterval(handler, delay);
      return function() {
        return Bacon.scheduler.clearInterval(id);
      };
    }), poll));
  };

  Bacon.Observable.prototype.groupBy = function(keyF, limitF) {
    var src, streams;
    if (limitF == null) {
      limitF = Bacon._.id;
    }
    streams = {};
    src = this;
    return src.filter(function(x) {
      return !streams[keyF(x)];
    }).map(function(x) {
      var data, key, limited, similar;
      key = keyF(x);
      similar = src.filter(function(x) {
        return keyF(x) === key;
      });
      data = Bacon.once(x).concat(similar);
      limited = limitF(data, x).withHandler(function(event) {
        this.push(event);
        if (event.isEnd()) {
          return delete streams[key];
        }
      });
      return streams[key] = limited;
    });
  };

  Bacon.fromArray = function(values) {
    var i;
    assertArray(values);
    if (!values.length) {
      return withDesc(new Bacon.Desc(Bacon, "fromArray", values), Bacon.never());
    } else {
      i = 0;
      return new EventStream(new Bacon.Desc(Bacon, "fromArray", [values]), function(sink) {
        var push, pushNeeded, pushing, reply, unsubd;
        unsubd = false;
        reply = Bacon.more;
        pushing = false;
        pushNeeded = false;
        push = function() {
          var value;
          pushNeeded = true;
          if (pushing) {
            return;
          }
          pushing = true;
          while (pushNeeded) {
            pushNeeded = false;
            if ((reply !== Bacon.noMore) && !unsubd) {
              value = values[i++];
              reply = sink(toEvent(value));
              if (reply !== Bacon.noMore) {
                if (i === values.length) {
                  sink(endEvent());
                } else {
                  UpdateBarrier.afterTransaction(push);
                }
              }
            }
          }
          return pushing = false;
        };
        push();
        return function() {
          return unsubd = true;
        };
      });
    }
  };

  Bacon.EventStream.prototype.holdWhen = function(valve) {
    var bufferedValues, onHold, src;
    onHold = false;
    bufferedValues = [];
    src = this;
    return new EventStream(new Bacon.Desc(this, "holdWhen", [valve]), function(sink) {
      var composite, endIfBothEnded, subscribed;
      composite = new CompositeUnsubscribe();
      subscribed = false;
      endIfBothEnded = function(unsub) {
        if (typeof unsub === "function") {
          unsub();
        }
        if (composite.empty() && subscribed) {
          return sink(endEvent());
        }
      };
      composite.add(function(unsubAll, unsubMe) {
        return valve.subscribeInternal(function(event) {
          var j, len1, results, toSend, value;
          if (event.hasValue()) {
            onHold = event.value();
            if (!onHold) {
              toSend = bufferedValues;
              bufferedValues = [];
              results = [];
              for (j = 0, len1 = toSend.length; j < len1; j++) {
                value = toSend[j];
                results.push(sink(nextEvent(value)));
              }
              return results;
            }
          } else if (event.isEnd()) {
            return endIfBothEnded(unsubMe);
          } else {
            return sink(event);
          }
        });
      });
      composite.add(function(unsubAll, unsubMe) {
        return src.subscribeInternal(function(event) {
          if (onHold && event.hasValue()) {
            return bufferedValues.push(event.value());
          } else if (event.isEnd() && bufferedValues.length) {
            return endIfBothEnded(unsubMe);
          } else {
            return sink(event);
          }
        });
      });
      subscribed = true;
      endIfBothEnded();
      return composite.unsubscribe;
    });
  };

  Bacon.interval = function(delay, value) {
    if (value == null) {
      value = {};
    }
    return withDesc(new Bacon.Desc(Bacon, "interval", [delay, value]), Bacon.fromPoll(delay, function() {
      return nextEvent(value);
    }));
  };

  Bacon.$ = {};

  Bacon.$.asEventStream = function(eventName, selector, eventTransformer) {
    var ref;
    if (_.isFunction(selector)) {
      ref = [selector, void 0], eventTransformer = ref[0], selector = ref[1];
    }
    return withDesc(new Bacon.Desc(this.selector || this, "asEventStream", [eventName]), Bacon.fromBinder((function(_this) {
      return function(handler) {
        _this.on(eventName, selector, handler);
        return function() {
          return _this.off(eventName, selector, handler);
        };
      };
    })(this), eventTransformer));
  };

  if ((ref = typeof jQuery !== "undefined" && jQuery !== null ? jQuery : typeof Zepto !== "undefined" && Zepto !== null ? Zepto : void 0) != null) {
    ref.fn.asEventStream = Bacon.$.asEventStream;
  }

  Bacon.Observable.prototype.log = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    this.subscribe(function(event) {
      return typeof console !== "undefined" && console !== null ? typeof console.log === "function" ? console.log.apply(console, slice.call(args).concat([event.log()])) : void 0 : void 0;
    });
    return this;
  };

  Bacon.EventStream.prototype.merge = function(right) {
    var left;
    assertEventStream(right);
    left = this;
    return withDesc(new Bacon.Desc(left, "merge", [right]), Bacon.mergeAll(this, right));
  };

  Bacon.mergeAll = function() {
    var streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (isArray(streams[0])) {
      streams = streams[0];
    }
    if (streams.length) {
      return new EventStream(new Bacon.Desc(Bacon, "mergeAll", streams), function(sink) {
        var ends, sinks, smartSink;
        ends = 0;
        smartSink = function(obs) {
          return function(unsubBoth) {
            return obs.dispatcher.subscribe(function(event) {
              var reply;
              if (event.isEnd()) {
                ends++;
                if (ends === streams.length) {
                  return sink(endEvent());
                } else {
                  return Bacon.more;
                }
              } else {
                reply = sink(event);
                if (reply === Bacon.noMore) {
                  unsubBoth();
                }
                return reply;
              }
            });
          };
        };
        sinks = _.map(smartSink, streams);
        return new Bacon.CompositeUnsubscribe(sinks).unsubscribe;
      });
    } else {
      return Bacon.never();
    }
  };

  Bacon.repeatedly = function(delay, values) {
    var index;
    index = 0;
    return withDesc(new Bacon.Desc(Bacon, "repeatedly", [delay, values]), Bacon.fromPoll(delay, function() {
      return values[index++ % values.length];
    }));
  };

  Bacon.repeat = function(generator) {
    var index;
    index = 0;
    return Bacon.fromBinder(function(sink) {
      var flag, handleEvent, reply, subscribeNext, unsub;
      flag = false;
      reply = Bacon.more;
      unsub = function() {};
      handleEvent = function(event) {
        if (event.isEnd()) {
          if (!flag) {
            return flag = true;
          } else {
            return subscribeNext();
          }
        } else {
          return reply = sink(event);
        }
      };
      subscribeNext = function() {
        var next;
        flag = true;
        while (flag && reply !== Bacon.noMore) {
          next = generator(index++);
          flag = false;
          if (next) {
            unsub = next.subscribeInternal(handleEvent);
          } else {
            sink(endEvent());
          }
        }
        return flag = true;
      };
      subscribeNext();
      return function() {
        return unsub();
      };
    });
  };

  Bacon.retry = function(options) {
    var delay, error, finished, isRetryable, maxRetries, retries, source;
    if (!_.isFunction(options.source)) {
      throw new Exception("'source' option has to be a function");
    }
    source = options.source;
    retries = options.retries || 0;
    maxRetries = options.maxRetries || retries;
    delay = options.delay || function() {
      return 0;
    };
    isRetryable = options.isRetryable || function() {
      return true;
    };
    finished = false;
    error = null;
    return withDesc(new Bacon.Desc(Bacon, "retry", [options]), Bacon.repeat(function() {
      var context, pause, valueStream;
      if (finished) {
        return null;
      } else {
        valueStream = function() {
          return source().endOnError().withHandler(function(event) {
            if (event.isError()) {
              error = event;
              if (isRetryable(error.error) && retries > 0) {

              } else {
                finished = true;
                return this.push(event);
              }
            } else {
              if (event.hasValue()) {
                error = null;
                finished = true;
              }
              return this.push(event);
            }
          });
        };
        if (error) {
          context = {
            error: error.error,
            retriesDone: maxRetries - retries
          };
          pause = Bacon.later(delay(context)).filter(false);
          retries = retries - 1;
          return pause.concat(Bacon.once().flatMap(valueStream));
        } else {
          return valueStream();
        }
      }
    }));
  };

  Bacon.sequentially = function(delay, values) {
    var index;
    index = 0;
    return withDesc(new Bacon.Desc(Bacon, "sequentially", [delay, values]), Bacon.fromPoll(delay, function() {
      var value;
      value = values[index++];
      if (index < values.length) {
        return value;
      } else if (index === values.length) {
        return [value, endEvent()];
      } else {
        return endEvent();
      }
    }));
  };

  Bacon.Observable.prototype.skip = function(count) {
    return withDesc(new Bacon.Desc(this, "skip", [count]), this.withHandler(function(event) {
      if (!event.hasValue()) {
        return this.push(event);
      } else if (count > 0) {
        count--;
        return Bacon.more;
      } else {
        return this.push(event);
      }
    }));
  };

  Bacon.Observable.prototype.take = function(count) {
    if (count <= 0) {
      return Bacon.never();
    }
    return withDesc(new Bacon.Desc(this, "take", [count]), this.withHandler(function(event) {
      if (!event.hasValue()) {
        return this.push(event);
      } else {
        count--;
        if (count > 0) {
          return this.push(event);
        } else {
          if (count === 0) {
            this.push(event);
          }
          this.push(endEvent());
          return Bacon.noMore;
        }
      }
    }));
  };

  Bacon.EventStream.prototype.skipUntil = function(starter) {
    var started;
    started = starter.take(1).map(true).toProperty(false);
    return withDesc(new Bacon.Desc(this, "skipUntil", [starter]), this.filter(started));
  };

  Bacon.EventStream.prototype.skipWhile = function() {
    var args, f, ok;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    ok = false;
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "skipWhile", [f]), this.withHandler(function(event) {
        if (ok || !event.hasValue() || !f(event.value())) {
          if (event.hasValue()) {
            ok = true;
          }
          return this.push(event);
        } else {
          return Bacon.more;
        }
      }));
    });
  };

  Bacon.Observable.prototype.slidingWindow = function(n, minValues) {
    if (minValues == null) {
      minValues = 0;
    }
    return withDesc(new Bacon.Desc(this, "slidingWindow", [n, minValues]), this.scan([], (function(window, value) {
      return window.concat([value]).slice(-n);
    })).filter((function(values) {
      return values.length >= minValues;
    })));
  };

  Bacon.spy = function(spy) {
    return spys.push(spy);
  };

  spys = [];

  registerObs = function(obs) {
    var j, len1, spy;
    if (spys.length) {
      if (!registerObs.running) {
        try {
          registerObs.running = true;
          for (j = 0, len1 = spys.length; j < len1; j++) {
            spy = spys[j];
            spy(obs);
          }
        } finally {
          delete registerObs.running;
        }
      }
    }
    return void 0;
  };

  Bacon.Property.prototype.startWith = function(seed) {
    return withDesc(new Bacon.Desc(this, "startWith", [seed]), this.scan(seed, function(prev, next) {
      return next;
    }));
  };

  Bacon.EventStream.prototype.startWith = function(seed) {
    return withDesc(new Bacon.Desc(this, "startWith", [seed]), Bacon.once(seed).concat(this));
  };

  Bacon.Observable.prototype.takeWhile = function() {
    var args, f;
    f = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    assertObservableIsProperty(f);
    return convertArgsToFunction(this, f, args, function(f) {
      return withDesc(new Bacon.Desc(this, "takeWhile", [f]), this.withHandler(function(event) {
        if (event.filter(f)) {
          return this.push(event);
        } else {
          this.push(endEvent());
          return Bacon.noMore;
        }
      }));
    });
  };

  Bacon.update = function() {
    var i, initial, lateBindFirst, patterns;
    initial = arguments[0], patterns = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    lateBindFirst = function(f) {
      return function() {
        var args;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return function(i) {
          return f.apply(null, [i].concat(args));
        };
      };
    };
    i = patterns.length - 1;
    while (i > 0) {
      if (!(patterns[i] instanceof Function)) {
        patterns[i] = (function(x) {
          return function() {
            return x;
          };
        })(patterns[i]);
      }
      patterns[i] = lateBindFirst(patterns[i]);
      i = i - 2;
    }
    return withDesc(new Bacon.Desc(Bacon, "update", [initial].concat(slice.call(patterns))), Bacon.when.apply(Bacon, patterns).scan(initial, (function(x, f) {
      return f(x);
    })));
  };

  Bacon.zipAsArray = function() {
    var streams;
    streams = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    if (isArray(streams[0])) {
      streams = streams[0];
    }
    return withDesc(new Bacon.Desc(Bacon, "zipAsArray", streams), Bacon.zipWith(streams, function() {
      var xs;
      xs = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return xs;
    }));
  };

  Bacon.zipWith = function() {
    var f, ref1, streams;
    f = arguments[0], streams = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (!_.isFunction(f)) {
      ref1 = [f, streams[0]], streams = ref1[0], f = ref1[1];
    }
    streams = _.map((function(s) {
      return s.toEventStream();
    }), streams);
    return withDesc(new Bacon.Desc(Bacon, "zipWith", [f].concat(slice.call(streams))), Bacon.when(streams, f));
  };

  Bacon.Observable.prototype.zip = function(other, f) {
    if (f == null) {
      f = Array;
    }
    return withDesc(new Bacon.Desc(this, "zip", [other]), Bacon.zipWith([this, other], f));
  };

  

Bacon.Observable.prototype.first = function () {
  return withDesc(new Bacon.Desc(this, "first", []), this.take(1));
};

Bacon.Observable.prototype.last = function () {
  var lastEvent;

  return withDesc(new Bacon.Desc(this, "last", []), this.withHandler(function (event) {
    if (event.isEnd()) {
      if (lastEvent) {
        this.push(lastEvent);
      }
      this.push(endEvent());
      return Bacon.noMore;
    } else {
      lastEvent = event;
    }
  }));
};

Bacon.EventStream.prototype.throttle = function (delay) {
  return withDesc(new Bacon.Desc(this, "throttle", [delay]), this.bufferWithTime(delay).map(function (values) {
    return values[values.length - 1];
  }));
};

Bacon.Property.prototype.throttle = function (delay) {
  return this.delayChanges(new Bacon.Desc(this, "throttle", [delay]), function (changes) {
    return changes.throttle(delay);
  });
};

Observable.prototype.firstToPromise = function (PromiseCtr) {
  var _this = this;

  if (typeof PromiseCtr !== "function") {
    if (typeof Promise === "function") {
      PromiseCtr = Promise;
    } else {
      throw new Exception("There isn't default Promise, use shim or parameter");
    }
  }

  return new PromiseCtr(function (resolve, reject) {
    return _this.subscribe(function (event) {
      if (event.hasValue()) {
        resolve(event.value());
      }
      if (event.isError()) {
        reject(event.error);
      }

      return Bacon.noMore;
    });
  });
};

Observable.prototype.toPromise = function (PromiseCtr) {
  return this.last().firstToPromise(PromiseCtr);
};

if ((typeof define !== "undefined" && define !== null) && (define.amd != null)) {
    define([], function() {
      return Bacon;
    });
    this.Bacon = Bacon;
  } else if ((typeof module !== "undefined" && module !== null) && (module.exports != null)) {
    module.exports = Bacon;
    Bacon.Bacon = Bacon;
  } else {
    this.Bacon = Bacon;
  }

}).call(this);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
/* Riot v2.2.1, @license MIT, (c) 2015 Muut Inc. + contributors */

;(function(window) {
  'use strict'
  var riot = { version: 'v2.2.1', settings: {} }

  // This globals 'const' helps code size reduction

  // for typeof == '' comparisons
  var T_STRING = 'string'
  var T_OBJECT = 'object'

  // for IE8 and rest of the world
  var isArray = Array.isArray || (function () {
    var _ts = Object.prototype.toString
    return function (v) { return _ts.call(v) === '[object Array]' }
  })()

  // Version# for IE 8-11, 0 for others
  var ieVersion = (function (win) {
    return (win && win.document || {}).documentMode | 0
  })(window)

riot.observable = function(el) {

  el = el || {}

  var callbacks = {},
      _id = 0

  el.on = function(events, fn) {
    if (isFunction(fn)) {
      fn._id = typeof fn._id == 'undefined' ? _id++ : fn._id

      events.replace(/\S+/g, function(name, pos) {
        (callbacks[name] = callbacks[name] || []).push(fn)
        fn.typed = pos > 0
      })
    }
    return el
  }

  el.off = function(events, fn) {
    if (events == '*') callbacks = {}
    else {
      events.replace(/\S+/g, function(name) {
        if (fn) {
          var arr = callbacks[name]
          for (var i = 0, cb; (cb = arr && arr[i]); ++i) {
            if (cb._id == fn._id) { arr.splice(i, 1); i-- }
          }
        } else {
          callbacks[name] = []
        }
      })
    }
    return el
  }

  // only single event supported
  el.one = function(name, fn) {
    function on() {
      el.off(name, on)
      fn.apply(el, arguments)
    }
    return el.on(name, on)
  }

  el.trigger = function(name) {
    var args = [].slice.call(arguments, 1),
        fns = callbacks[name] || []

    for (var i = 0, fn; (fn = fns[i]); ++i) {
      if (!fn.busy) {
        fn.busy = 1
        fn.apply(el, fn.typed ? [name].concat(args) : args)
        if (fns[i] !== fn) { i-- }
        fn.busy = 0
      }
    }

    if (callbacks.all && name != 'all') {
      el.trigger.apply(el, ['all', name].concat(args))
    }

    return el
  }

  return el

}
riot.mixin = (function() {
  var mixins = {}

  return function(name, mixin) {
    if (!mixin) return mixins[name]
    mixins[name] = mixin
  }

})()

;(function(riot, evt, window) {

  // browsers only
  if (!window) return

  var loc = window.location,
      fns = riot.observable(),
      win = window,
      started = false,
      current

  function hash() {
    return loc.href.split('#')[1] || ''
  }

  function parser(path) {
    return path.split('/')
  }

  function emit(path) {
    if (path.type) path = hash()

    if (path != current) {
      fns.trigger.apply(null, ['H'].concat(parser(path)))
      current = path
    }
  }

  var r = riot.route = function(arg) {
    // string
    if (arg[0]) {
      loc.hash = arg
      emit(arg)

    // function
    } else {
      fns.on('H', arg)
    }
  }

  r.exec = function(fn) {
    fn.apply(null, parser(hash()))
  }

  r.parser = function(fn) {
    parser = fn
  }

  r.stop = function () {
    if (!started) return
    win.removeEventListener ? win.removeEventListener(evt, emit, false) : win.detachEvent('on' + evt, emit)
    fns.off('*')
    started = false
  }

  r.start = function () {
    if (started) return
    win.addEventListener ? win.addEventListener(evt, emit, false) : win.attachEvent('on' + evt, emit)
    started = true
  }

  // autostart the router
  r.start()

})(riot, 'hashchange', window)
/*

//// How it works?


Three ways:

1. Expressions: tmpl('{ value }', data).
   Returns the result of evaluated expression as a raw object.

2. Templates: tmpl('Hi { name } { surname }', data).
   Returns a string with evaluated expressions.

3. Filters: tmpl('{ show: !done, highlight: active }', data).
   Returns a space separated list of trueish keys (mainly
   used for setting html classes), e.g. "show highlight".


// Template examples

tmpl('{ title || "Untitled" }', data)
tmpl('Results are { results ? "ready" : "loading" }', data)
tmpl('Today is { new Date() }', data)
tmpl('{ message.length > 140 && "Message is too long" }', data)
tmpl('This item got { Math.round(rating) } stars', data)
tmpl('<h1>{ title }</h1>{ body }', data)


// Falsy expressions in templates

In templates (as opposed to single expressions) all falsy values
except zero (undefined/null/false) will default to empty string:

tmpl('{ undefined } - { false } - { null } - { 0 }', {})
// will return: " - - - 0"

*/


var brackets = (function(orig) {

  var cachedBrackets,
      r,
      b,
      re = /[{}]/g

  return function(x) {

    // make sure we use the current setting
    var s = riot.settings.brackets || orig

    // recreate cached vars if needed
    if (cachedBrackets !== s) {
      cachedBrackets = s
      b = s.split(' ')
      r = b.map(function (e) { return e.replace(/(?=.)/g, '\\') })
    }

    // if regexp given, rewrite it with current brackets (only if differ from default)
    return x instanceof RegExp ? (
        s === orig ? x :
        new RegExp(x.source.replace(re, function(b) { return r[~~(b === '}')] }), x.global ? 'g' : '')
      ) :
      // else, get specific bracket
      b[x]
  }
})('{ }')


var tmpl = (function() {

  var cache = {},
      reVars = /(['"\/]).*?[^\\]\1|\.\w*|\w*:|\b(?:(?:new|typeof|in|instanceof) |(?:this|true|false|null|undefined)\b|function *\()|([a-z_$]\w*)/gi
              // [ 1               ][ 2  ][ 3 ][ 4                                                                                  ][ 5       ]
              // find variable names:
              // 1. skip quoted strings and regexps: "a b", 'a b', 'a \'b\'', /a b/
              // 2. skip object properties: .name
              // 3. skip object literals: name:
              // 4. skip javascript keywords
              // 5. match var name

  // build a template (or get it from cache), render with data
  return function(str, data) {
    return str && (cache[str] = cache[str] || tmpl(str))(data)
  }


  // create a template instance

  function tmpl(s, p) {

    // default template string to {}
    s = (s || (brackets(0) + brackets(1)))

      // temporarily convert \{ and \} to a non-character
      .replace(brackets(/\\{/g), '\uFFF0')
      .replace(brackets(/\\}/g), '\uFFF1')

    // split string to expression and non-expresion parts
    p = split(s, extract(s, brackets(/{/), brackets(/}/)))

    return new Function('d', 'return ' + (

      // is it a single expression or a template? i.e. {x} or <b>{x}</b>
      !p[0] && !p[2] && !p[3]

        // if expression, evaluate it
        ? expr(p[1])

        // if template, evaluate all expressions in it
        : '[' + p.map(function(s, i) {

            // is it an expression or a string (every second part is an expression)
          return i % 2

              // evaluate the expressions
              ? expr(s, true)

              // process string parts of the template:
              : '"' + s

                  // preserve new lines
                  .replace(/\n/g, '\\n')

                  // escape quotes
                  .replace(/"/g, '\\"')

                + '"'

        }).join(',') + '].join("")'
      )

      // bring escaped { and } back
      .replace(/\uFFF0/g, brackets(0))
      .replace(/\uFFF1/g, brackets(1))

    + ';')

  }


  // parse { ... } expression

  function expr(s, n) {
    s = s

      // convert new lines to spaces
      .replace(/\n/g, ' ')

      // trim whitespace, brackets, strip comments
      .replace(brackets(/^[{ ]+|[ }]+$|\/\*.+?\*\//g), '')

    // is it an object literal? i.e. { key : value }
    return /^\s*[\w- "']+ *:/.test(s)

      // if object literal, return trueish keys
      // e.g.: { show: isOpen(), done: item.done } -> "show done"
      ? '[' +

          // extract key:val pairs, ignoring any nested objects
          extract(s,

              // name part: name:, "name":, 'name':, name :
              /["' ]*[\w- ]+["' ]*:/,

              // expression part: everything upto a comma followed by a name (see above) or end of line
              /,(?=["' ]*[\w- ]+["' ]*:)|}|$/
              ).map(function(pair) {

                // get key, val parts
                return pair.replace(/^[ "']*(.+?)[ "']*: *(.+?),? *$/, function(_, k, v) {

                  // wrap all conditional parts to ignore errors
                  return v.replace(/[^&|=!><]+/g, wrap) + '?"' + k + '":"",'

                })

              }).join('')

        + '].join(" ").trim()'

      // if js expression, evaluate as javascript
      : wrap(s, n)

  }


  // execute js w/o breaking on errors or undefined vars

  function wrap(s, nonull) {
    s = s.trim()
    return !s ? '' : '(function(v){try{v='

        // prefix vars (name => data.name)
        + (s.replace(reVars, function(s, _, v) { return v ? '(d.'+v+'===undefined?'+(typeof window == 'undefined' ? 'global.' : 'window.')+v+':d.'+v+')' : s })

          // break the expression if its empty (resulting in undefined value)
          || 'x')
      + '}catch(e){'
      + '}finally{return '

        // default to empty string for falsy values except zero
        + (nonull === true ? '!v&&v!==0?"":v' : 'v')

      + '}}).call(d)'
  }


  // split string by an array of substrings

  function split(str, substrings) {
    var parts = []
    substrings.map(function(sub, i) {

      // push matched expression and part before it
      i = str.indexOf(sub)
      parts.push(str.slice(0, i), sub)
      str = str.slice(i + sub.length)
    })

    // push the remaining part
    return parts.concat(str)
  }


  // match strings between opening and closing regexp, skipping any inner/nested matches

  function extract(str, open, close) {

    var start,
        level = 0,
        matches = [],
        re = new RegExp('('+open.source+')|('+close.source+')', 'g')

    str.replace(re, function(_, open, close, pos) {

      // if outer inner bracket, mark position
      if (!level && open) start = pos

      // in(de)crease bracket level
      level += open ? 1 : -1

      // if outer closing bracket, grab the match
      if (!level && close != null) matches.push(str.slice(start, pos+close.length))

    })

    return matches
  }

})()

// { key, i in items} -> { key, i, items }
function loopKeys(expr) {
  var b0 = brackets(0),
      els = expr.slice(b0.length).match(/\s*(\S+?)\s*(?:,\s*(\S)+)?\s+in\s+(.+)/)
  return els ? { key: els[1], pos: els[2], val: b0 + els[3] } : { val: expr }
}

function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}


/* Beware: heavy stuff */
function _each(dom, parent, expr) {

  remAttr(dom, 'each')

  var template = dom.outerHTML,
      root = dom.parentNode,
      placeholder = document.createComment('riot placeholder'),
      tags = [],
      child = getTag(dom),
      checksum

  root.insertBefore(placeholder, dom)

  expr = loopKeys(expr)

  // clean template code
  parent
    .one('premount', function () {
      if (root.stub) root = parent.root
      // remove the original DOM node
      dom.parentNode.removeChild(dom)
    })
    .on('update', function () {
      var items = tmpl(expr.val, parent),
          test

      // object loop. any changes cause full redraw
      if (!isArray(items)) {
        test = checksum
        checksum = items ? JSON.stringify(items) : ''
        if (checksum === test) return

        items = !items ? [] :
          Object.keys(items).map(function (key) {
            return mkitem(expr, key, items[key])
          })
      }

      var frag = document.createDocumentFragment(),
          i = tags.length,
          j = items.length

      // unmount leftover items
      while (i > j) tags[--i].unmount()
      tags.length = j

      test = !checksum && !!expr.key
      for (i = 0; i < j; ++i) {
        var _item = test ? mkitem(expr, items[i], i) : items[i]

        if (!tags[i]) {
          // mount new
          (tags[i] = new Tag({ tmpl: template }, {
              parent: parent,
              isLoop: true,
              root: root,
              item: _item
            })
          ).mount()

          frag.appendChild(tags[i].root)
        }
        tags[i]._item = _item
        tags[i].update(_item)
      }

      root.insertBefore(frag, placeholder)

      if (child) parent.tags[getTagName(dom)] = tags

    }).one('updated', function() {
      var keys = Object.keys(parent)// only set new values
      walk(root, function(node) {
        // only set element node and not isLoop
        if (node.nodeType == 1 && !node.isLoop && !node._looped) {
          node._visited = false // reset _visited for loop node
          node._looped = true // avoid set multiple each
          setNamed(node, parent, keys)
        }
      })
    })

}


function parseNamedElements(root, parent, childTags) {

  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      dom.isLoop = (dom.parentNode && dom.parentNode.isLoop || dom.getAttribute('each')) ? 1 : 0

      // custom child tag
      var child = getTag(dom)

      if (child && !dom.isLoop) {
        var tag = new Tag(child, { root: dom, parent: parent }, dom.innerHTML),
            tagName = getTagName(dom),
            ptag = parent,
            cachedTag

        while (!getTag(ptag.root)) {
          if (!ptag.parent) break
          ptag = ptag.parent
        }

        // fix for the parent attribute in the looped elements
        tag.parent = ptag

        cachedTag = ptag.tags[tagName]

        // if there are multiple children tags having the same name
        if (cachedTag) {
          // if the parent tags property is not yet an array
          // create it adding the first cached tag
          if (!isArray(cachedTag))
            ptag.tags[tagName] = [cachedTag]
          // add the new nested tag to the array
          ptag.tags[tagName].push(tag)
        } else {
          ptag.tags[tagName] = tag
        }

        // empty the child node once we got its template
        // to avoid that its children get compiled multiple times
        dom.innerHTML = ''
        childTags.push(tag)
      }

      if (!dom.isLoop)
        setNamed(dom, parent, [])
    }

  })

}

function parseExpressions(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (val.indexOf(brackets(0)) >= 0) {
      var expr = { dom: dom, expr: val }
      expressions.push(extend(expr, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    var attr = dom.getAttribute('each')

    if (attr) { _each(dom, tag, attr); return false }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name,
        bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    // skip custom tags
    if (getTag(dom)) return false

  })

}
function Tag(impl, conf, innerHTML) {

  var self = riot.observable(this),
      opts = inherit(conf.opts) || {},
      dom = mkdom(impl.tmpl),
      parent = conf.parent,
      isLoop = conf.isLoop,
      item = conf.item,
      expressions = [],
      childTags = [],
      root = conf.root,
      fn = impl.fn,
      tagName = root.tagName.toLowerCase(),
      attr = {},
      loopDom,
      TAG_ATTRIBUTES = /([\w\-]+)\s?=\s?['"]([^'"]+)["']/gim


  if (fn && root._tag) {
    root._tag.unmount(true)
  }

  // not yet mounted
  this.isMounted = false

  if (impl.attrs) {
    var attrs = impl.attrs.match(TAG_ATTRIBUTES)

    each(attrs, function(a) {
      var kv = a.split(/\s?=\s?/)
      root.setAttribute(kv[0], kv[1].replace(/['"]/g, ''))
    })

  }

  // keep a reference to the tag just created
  // so we will be able to mount this tag multiple times
  root._tag = this

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  this._id = fastAbs(~~(new Date().getTime() * Math.random()))

  extend(this, { parent: parent, root: root, opts: opts, tags: {} }, item)

  // grab attributes
  each(root.attributes, function(el) {
    var val = el.value
    // remember attributes with expressions only
    if (brackets(/\{.*\}/).test(val)) attr[el.name] = val
  })

  if (dom.innerHTML && !/select|select|optgroup|tbody|tr/.test(tagName))
    // replace all the yield tags with the tag inner html
    dom.innerHTML = replaceYield(dom.innerHTML, innerHTML)

  // options
  function updateOpts() {
    // update opts from current DOM attributes
    each(root.attributes, function(el) {
      opts[el.name] = tmpl(el.value, parent || self)
    })
    // recover those with expressions
    each(Object.keys(attr), function(name) {
      opts[name] = tmpl(attr[name], parent || self)
    })
  }

  this.update = function(data) {
    extend(self, data)
    updateOpts()
    self.trigger('update', data)
    update(expressions, self, data)
    self.trigger('updated')
  }

  this.mixin = function() {
    each(arguments, function(mix) {
      mix = typeof mix == 'string' ? riot.mixin(mix) : mix
      each(Object.keys(mix), function(key) {
        // bind methods to self
        if (key != 'init')
          self[key] = typeof mix[key] == 'function' ? mix[key].bind(self) : mix[key]
      })
      // init method will be called automatically
      if (mix.init) mix.init.bind(self)()
    })
  }

  this.mount = function() {

    updateOpts()

    // initialiation
    fn && fn.call(self, opts)

    toggle(true)


    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, self, expressions)

    if (!self.parent) self.update()

    // internal use only, fixes #403
    self.trigger('premount')

    if (isLoop) {
      // update the root attribute for the looped elements
      self.root = root = loopDom = dom.firstChild
    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
      if (root.stub) self.root = root = parent.root
    }
    // if it's not a child tag we can trigger its mount event
    if (!self.parent || self.parent.isMounted) {
      self.isMounted = true
      self.trigger('mount')
    }
    // otherwise we need to wait that the parent event gets triggered
    else self.parent.one('mount', function() {
      // avoid to trigger the `mount` event for the tags
      // not visible included in an if statement
      if (!isInStub(self.root)) {
        self.parent.isMounted = self.isMounted = true
        self.trigger('mount')
      }
    })
  }


  this.unmount = function(keepRootTag) {
    var el = loopDom || root,
        p = el.parentNode

    if (p) {

      if (parent) {
        // remove this tag from the parent tags object
        // if there are multiple nested tags with same name..
        // remove this element form the array
        if (isArray(parent.tags[tagName])) {
          each(parent.tags[tagName], function(tag, i) {
            if (tag._id == self._id)
              parent.tags[tagName].splice(i, 1)
          })
        } else
          // otherwise just delete the tag instance
          parent.tags[tagName] = undefined
      } else {
        while (el.firstChild) el.removeChild(el.firstChild)
      }

      if (!keepRootTag)
        p.removeChild(el)

    }


    self.trigger('unmount')
    toggle()
    self.off('*')
    // somehow ie8 does not like `delete root._tag`
    root._tag = null

  }

  function toggle(isMount) {

    // mount/unmount children
    each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })

    // listen/unlisten parent (events flow one way from parent to children)
    if (parent) {
      var evt = isMount ? 'on' : 'off'

      // the loop tags will be always in sync with the parent automatically
      if (isLoop)
        parent[evt]('unmount', self.unmount)
      else
        parent[evt]('update', self.update)[evt]('unmount', self.unmount)
    }
  }

  // named elements available for fn
  parseNamedElements(dom, this, childTags)


}

function setEventHandler(name, handler, dom, tag, item) {

  dom[name] = function(e) {

    // cross browser event fix
    e = e || window.event

    if (!e.which) e.which = e.charCode || e.keyCode
    if (!e.target) e.target = e.srcElement

    // ignore error on some browsers
    try {
      e.currentTarget = dom
    } catch (ignored) { '' }

    e.item = tag._item ? tag._item : item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
      e.preventDefault && e.preventDefault()
      e.returnValue = false
    }

    if (!e.preventUpdate) {
      var el = item ? tag.parent : tag
      el.update()
    }

  }

}

// used by if- attribute
function insertTo(root, node, before) {
  if (root) {
    root.insertBefore(before, node)
    root.removeChild(node)
  }
}

// item = currently looped item
function update(expressions, tag, item) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
        attrName = expr.attr,
        value = tmpl(expr.expr, tag),
        parent = expr.dom.parentNode

    if (value == null) value = ''

    // leave out riot- prefixes from strings inside textarea
    if (parent && parent.tagName == 'TEXTAREA') value = value.replace(/riot-/g, '')

    // no change
    if (expr.value === value) return
    expr.value = value

    // text node
    if (!attrName) return dom.nodeValue = value.toString()

    // remove original attribute
    remAttr(dom, attrName)

    // event handler
    if (typeof value == 'function') {
      setEventHandler(attrName, value, dom, tag, item)

    // if- conditional
    } else if (attrName == 'if') {
      var stub = expr.stub

      // add to DOM
      if (value) {
        if (stub) {
          insertTo(stub.parentNode, stub, dom)
          dom.inStub = false
          // avoid to trigger the mount event if the tags is not visible yet
          // maybe we can optimize this avoiding to mount the tag at all
          if (!isInStub(dom)) {
            walk(dom, function(el) {
              if (el._tag && !el._tag.isMounted) el._tag.isMounted = !!el._tag.trigger('mount')
            })
          }
        }
      // remove from DOM
      } else {
        stub = expr.stub = stub || document.createTextNode('')
        insertTo(dom.parentNode, dom, stub)
        dom.inStub = true
      }
    // show / hide
    } else if (/^(show|hide)$/.test(attrName)) {
      if (attrName == 'hide') value = !value
      dom.style.display = value ? '' : 'none'

    // field value
    } else if (attrName == 'value') {
      dom.value = value

    // <img src="{ expr }">
    } else if (attrName.slice(0, 5) == 'riot-' && attrName != 'riot-tag') {
      attrName = attrName.slice(5)
      value ? dom.setAttribute(attrName, value) : remAttr(dom, attrName)

    } else {
      if (expr.bool) {
        dom[attrName] = value
        if (!value) return
        value = attrName
      }

      if (typeof value != 'object') dom.setAttribute(attrName, value)

    }

  })

}

function each(els, fn) {
  for (var i = 0, len = (els || []).length, el; i < len; i++) {
    el = els[i]
    // return false -> remove current item during loop
    if (el != null && fn(el, i) === false) i--
  }
  return els
}

function isFunction(v) {
  return typeof v === 'function' || false   // avoid IE problems
}

function remAttr(dom, name) {
  dom.removeAttribute(name)
}

function fastAbs(nr) {
  return (nr ^ (nr >> 31)) - (nr >> 31)
}

function getTagName(dom) {
  var child = getTag(dom),
    namedTag = dom.getAttribute('name'),
    tagName = namedTag && namedTag.indexOf(brackets(0)) < 0 ? namedTag : child.name

  return tagName
}

function extend(src) {
  var obj, args = arguments
  for (var i = 1; i < args.length; ++i) {
    if ((obj = args[i])) {
      for (var key in obj) {      // eslint-disable-line guard-for-in
        src[key] = obj[key]
      }
    }
  }
  return src
}

function mkdom(template) {
  var checkie = ieVersion && ieVersion < 10,
      matches = /^\s*<([\w-]+)/.exec(template),
      tagName = matches ? matches[1].toLowerCase() : '',
      rootTag = (tagName === 'th' || tagName === 'td') ? 'tr' :
                (tagName === 'tr' ? 'tbody' : 'div'),
      el = mkEl(rootTag)

  el.stub = true

  if (checkie) {
    if (tagName === 'optgroup')
      optgroupInnerHTML(el, template)
    else if (tagName === 'option')
      optionInnerHTML(el, template)
    else if (rootTag !== 'div')
      tbodyInnerHTML(el, template, tagName)
    else
      checkie = 0
  }
  if (!checkie) el.innerHTML = template

  return el
}

function walk(dom, fn) {
  if (dom) {
    if (fn(dom) === false) walk(dom.nextSibling, fn)
    else {
      dom = dom.firstChild

      while (dom) {
        walk(dom, fn)
        dom = dom.nextSibling
      }
    }
  }
}

function isInStub(dom) {
  while (dom) {
    if (dom.inStub) return true
    dom = dom.parentNode
  }
  return false
}

function mkEl(name) {
  return document.createElement(name)
}

function replaceYield (tmpl, innerHTML) {
  return tmpl.replace(/<(yield)\/?>(<\/\1>)?/gim, innerHTML || '')
}

function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

function setNamed(dom, parent, keys) {
  each(dom.attributes, function(attr) {
    if (dom._visited) return
    if (attr.name === 'id' || attr.name === 'name') {
      dom._visited = true
      var p, v = attr.value
      if (~keys.indexOf(v)) return

      p = parent[v]
      if (!p)
        parent[v] = dom
      else
        isArray(p) ? p.push(dom) : (parent[v] = [p, dom])
    }
  })
}
/**
 *
 * Hacks needed for the old internet explorer versions [lower than IE10]
 *
 */

function tbodyInnerHTML(el, html, tagName) {
  var div = mkEl('div'),
      loops = /td|th/.test(tagName) ? 3 : 2,
      child

  div.innerHTML = '<table>' + html + '</table>'
  child = div.firstChild

  while (loops--) {
    child = child.firstChild
  }

  el.appendChild(child)

}

function optionInnerHTML(el, html) {
  var opt = mkEl('option'),
      valRegx = /value=[\"'](.+?)[\"']/,
      selRegx = /selected=[\"'](.+?)[\"']/,
      eachRegx = /each=[\"'](.+?)[\"']/,
      ifRegx = /if=[\"'](.+?)[\"']/,
      innerRegx = />([^<]*)</,
      valuesMatch = html.match(valRegx),
      selectedMatch = html.match(selRegx),
      innerValue = html.match(innerRegx),
      eachMatch = html.match(eachRegx),
      ifMatch = html.match(ifRegx)

  if (innerValue) {
    opt.innerHTML = innerValue[1]
  } else {
    opt.innerHTML = html
  }

  if (valuesMatch) {
    opt.value = valuesMatch[1]
  }

  if (selectedMatch) {
    opt.setAttribute('riot-selected', selectedMatch[1])
  }

  if (eachMatch) {
    opt.setAttribute('each', eachMatch[1])
  }

  if (ifMatch) {
    opt.setAttribute('if', ifMatch[1])
  }

  el.appendChild(opt)
}

function optgroupInnerHTML(el, html) {
  var opt = mkEl('optgroup'),
      labelRegx = /label=[\"'](.+?)[\"']/,
      elementRegx = /^<([^>]*)>/,
      tagRegx = /^<([^ \>]*)/,
      labelMatch = html.match(labelRegx),
      elementMatch = html.match(elementRegx),
      tagMatch = html.match(tagRegx),
      innerContent = html

  if (elementMatch) {
    var options = html.slice(elementMatch[1].length+2, -tagMatch[1].length-3).trim()
    innerContent = options
  }

  if (labelMatch) {
    opt.setAttribute('riot-label', labelMatch[1])
  }

  if (innerContent) {
    var innerOpt = mkEl('div')

    optionInnerHTML(innerOpt, innerContent)

    opt.appendChild(innerOpt.firstChild)
  }

  el.appendChild(opt)
}

/*
 Virtual dom is an array of custom tags on the document.
 Updates and unmounts propagate downwards from parent to children.
*/

var virtualDom = [],
    tagImpl = {},
    styleNode

var RIOT_TAG = 'riot-tag'

function getTag(dom) {
  return tagImpl[dom.getAttribute(RIOT_TAG) || dom.tagName.toLowerCase()]
}

function injectStyle(css) {

  styleNode = styleNode || mkEl('style')

  if (!document.head) return

  if (styleNode.styleSheet)
    styleNode.styleSheet.cssText += css
  else
    styleNode.innerHTML += css

  if (!styleNode._rendered)
    if (styleNode.styleSheet) {
      document.body.appendChild(styleNode)
    } else {
      var rs = $$('style[type=riot]')[0]
      if (rs) {
        rs.parentNode.insertBefore(styleNode, rs)
        rs.parentNode.removeChild(rs)
      } else {
        document.head.appendChild(styleNode)
      }
    }

  styleNode._rendered = true

}

function mountTo(root, tagName, opts) {
  var tag = tagImpl[tagName],
      // cache the inner HTML to fix #855
      innerHTML = root._innerHTML = root._innerHTML || root.innerHTML

  // clear the inner html
  root.innerHTML = ''

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)

  if (tag && tag.mount) {
    tag.mount()
    virtualDom.push(tag)
    return tag.on('unmount', function() {
      virtualDom.splice(virtualDom.indexOf(tag), 1)
    })
  }

}

riot.tag = function(name, html, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs
    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css
      css = ''
    } else attrs = ''
  }
  if (css) {
    if (isFunction(css)) fn = css
    else injectStyle(css)
  }
  tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

riot.mount = function(selector, tagName, opts) {

  var els,
      allTags,
      tags = []

  // helper functions

  function addRiotTags(arr) {
    var list = ''
    each(arr, function (e) {
      list += ', *[riot-tag="'+ e.trim() + '"]'
    })
    return list
  }

  function selectAllTags() {
    var keys = Object.keys(tagImpl)
    return keys + addRiotTags(keys)
  }

  function pushTags(root) {
    if (root.tagName) {
      if (tagName && !root.getAttribute(RIOT_TAG))
        root.setAttribute(RIOT_TAG, tagName)

      var tag = mountTo(root,
        tagName || root.getAttribute(RIOT_TAG) || root.tagName.toLowerCase(), opts)

      if (tag) tags.push(tag)
    }
    else if (root.length) {
      each(root, pushTags)   // assume nodeList
    }
  }

  // ----- mount code -----

  if (typeof tagName === T_OBJECT) {
    opts = tagName
    tagName = 0
  }

  // crawl the DOM to find the tag
  if (typeof selector === T_STRING) {
    if (selector === '*') {
      // select all the tags registered
      // and also the tags found with the riot-tag attribute set
      selector = allTags = selectAllTags()
    } else {
      // or just the ones named like the selector
      selector += addRiotTags(selector.split(','))
    }
    els = $$(selector)
  }
  else
    // probably you have passed already a tag or a NodeList
    els = selector

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectAllTags()
    // if the root els it's just a single tag
    if (els.tagName) {
      els = $$(tagName, els)
    } else {
      // select all the children for all the different root elements
      var nodeList = []
      each(els, function (_el) {
        nodeList.push($$(tagName, _el))
      })
      els = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  if (els.tagName)
    pushTags(els)
  else
    each(els, pushTags)

  return tags
}

// update everything
riot.update = function() {
  return each(virtualDom, function(tag) {
    tag.update()
  })
}

// @deprecated
riot.mountTo = riot.mount


  // share methods for other riot parts, e.g. compiler
  riot.util = { brackets: brackets, tmpl: tmpl }

  // support CommonJS, AMD & browser
  if (typeof exports === 'object')
    module.exports = riot
  else if (typeof define === 'function' && define.amd)
    define(function() { return riot })
  else
    window.riot = riot

})(typeof window != 'undefined' ? window : undefined);

},{}],3:[function(require,module,exports){
/**
 * Module dependencies.
 */

var Emitter = require('emitter');
var reduce = require('reduce');

/**
 * Root reference for iframes.
 */

var root = 'undefined' == typeof window
  ? (this || self)
  : window;

/**
 * Noop.
 */

function noop(){};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * TODO: future proof, move to compoent land
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isHost(obj) {
  var str = {}.toString.call(obj);

  switch (str) {
    case '[object File]':
    case '[object Blob]':
    case '[object FormData]':
      return true;
    default:
      return false;
  }
}

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  return false;
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return obj === Object(obj);
}

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    if (null != obj[key]) {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(obj[key]));
    }
  }
  return pairs.join('&');
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var parts;
  var pair;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    parts = pair.split('=');
    obj[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function type(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function params(str){
  return reduce(str.split(/ *; */), function(obj, str){
    var parts = str.split(/ *= */)
      , key = parts.shift()
      , val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req, options) {
  options = options || {};
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  this.setStatusProperties(this.xhr.status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this.setHeaderProperties(this.header);
  this.body = this.req.method != 'HEAD'
    ? this.parseBody(this.text ? this.text : this.xhr.response)
    : null;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

Response.prototype.get = function(field){
  return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

Response.prototype.setHeaderProperties = function(header){
  // content-type
  var ct = this.header['content-type'] || '';
  this.type = type(ct);

  // params
  var obj = params(ct);
  for (var key in obj) this[key] = obj[key];
};

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype.parseBody = function(str){
  var parse = request.parse[this.type];
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

Response.prototype.setStatusProperties = function(status){
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
    status = 204;
  }

  var type = status / 100 | 0;

  // status / class
  this.status = status;
  this.statusType = type;

  // basics
  this.info = 1 == type;
  this.ok = 2 == type;
  this.clientError = 4 == type;
  this.serverError = 5 == type;
  this.error = (4 == type || 5 == type)
    ? this.toError()
    : false;

  // sugar
  this.accepted = 202 == status;
  this.noContent = 204 == status;
  this.badRequest = 400 == status;
  this.unauthorized = 401 == status;
  this.notAcceptable = 406 == status;
  this.notFound = 404 == status;
  this.forbidden = 403 == status;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  Emitter.call(this);
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {};
  this._header = {};
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      return self.callback(err);
    }

    self.emit('response', res);

    if (err) {
      return self.callback(err, res);
    }

    if (res.status >= 200 && res.status < 300) {
      return self.callback(err, res);
    }

    var new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
    new_err.original = err;
    new_err.response = res;
    new_err.status = res.status;

    self.callback(err || new_err, res);
  });
}

/**
 * Mixin `Emitter`.
 */

Emitter(Request.prototype);

/**
 * Allow for extension
 */

Request.prototype.use = function(fn) {
  fn(this);
  return this;
}

/**
 * Set timeout to `ms`.
 *
 * @param {Number} ms
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.timeout = function(ms){
  this._timeout = ms;
  return this;
};

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.clearTimeout = function(){
  this._timeout = 0;
  clearTimeout(this._timer);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */

Request.prototype.abort = function(){
  if (this.aborted) return;
  this.aborted = true;
  this.xhr.abort();
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Set header `field` to `val`, or multiple fields with one object.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Get case-insensitive header `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api private
 */

Request.prototype.getHeader = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} pass
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass){
  var str = btoa(user + ':' + pass);
  this.set('Authorization', 'Basic ' + str);
  return this;
};

/**
* Add query-string `val`.
*
* Examples:
*
*   request.get('/shoes')
*     .query('size=10')
*     .query({ color: 'blue' })
*
* @param {Object|String} val
* @return {Request} for chaining
* @api public
*/

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Write the field `name` and `val` for "multipart/form-data"
 * request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 * ```
 *
 * @param {String} name
 * @param {String|Blob|File} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.field = function(name, val){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(name, val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `filename`.
 *
 * ``` js
 * request.post('/upload')
 *   .attach(new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String} filename
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, filename){
  if (!this._formData) this._formData = new root.FormData();
  this._formData.append(field, file, filename);
  return this;
};

/**
 * Send `data`, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // querystring
 *       request.get('/search')
 *         .end(callback)
 *
 *       // multiple data "writes"
 *       request.get('/search')
 *         .send({ search: 'query' })
 *         .send({ range: '1..5' })
 *         .send({ order: 'desc' })
 *         .end(callback)
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"})
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
  *      request.post('/user')
  *        .send('name=tobi')
  *        .send('species=ferret')
  *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.send = function(data){
  var obj = isObject(data);
  var type = this.getHeader('Content-Type');

  // merge
  if (obj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    if (!type) this.type('form');
    type = this.getHeader('Content-Type');
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!obj || isHost(data)) return this;
  if (!type) this.type('json');
  return this;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  var fn = this._callback;
  this.clearTimeout();
  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Origin is not allowed by Access-Control-Allow-Origin');
  err.crossDomain = true;
  this.callback(err);
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

Request.prototype.timeoutError = function(){
  var timeout = this._timeout;
  var err = new Error('timeout of ' + timeout + 'ms exceeded');
  err.timeout = timeout;
  this.callback(err);
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

Request.prototype.withCredentials = function(){
  this._withCredentials = true;
  return this;
};

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var query = this._query.join('&');
  var timeout = this._timeout;
  var data = this._formData || this._data;

  // store callback
  this._callback = fn || noop;

  // state change
  xhr.onreadystatechange = function(){
    if (4 != xhr.readyState) return;

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (0 == status) {
      if (self.timedout) return self.timeoutError();
      if (self.aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(e){
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    self.emit('progress', e);
  };
  if (this.hasListeners('progress')) {
    xhr.onprogress = handleProgress;
  }
  try {
    if (xhr.upload && this.hasListeners('progress')) {
      xhr.upload.onprogress = handleProgress;
    }
  } catch(e) {
    // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
    // Reported here:
    // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
  }

  // timeout
  if (timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self.timedout = true;
      self.abort();
    }, timeout);
  }

  // querystring
  if (query) {
    query = request.serializeObject(query);
    this.url += ~this.url.indexOf('?')
      ? '&' + query
      : '?' + query;
  }

  // initiate request
  xhr.open(this.method, this.url, true);

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
    // serialize stuff
    var serialize = request.serialize[this.getHeader('Content-Type')];
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;
    xhr.setRequestHeader(field, this.header[field]);
  }

  // send stuff
  this.emit('request', this);
  xhr.send(data);
  return this;
};

/**
 * Expose `Request`.
 */

request.Request = Request;

/**
 * Issue a request:
 *
 * Examples:
 *
 *    request('GET', '/users').end(callback)
 *    request('/users').end(callback)
 *    request('/users', callback)
 *
 * @param {String} method
 * @param {String|Function} url or callback
 * @return {Request}
 * @api public
 */

function request(method, url) {
  // callback
  if ('function' == typeof url) {
    return new Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new Request('GET', method);
  }

  return new Request(method, url);
}

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.del = function(url, fn){
  var req = request('DELETE', url);
  if (fn) req.end(fn);
  return req;
};

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} data
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} data or fn
 * @param {Function} fn
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * Expose `request`.
 */

module.exports = request;

},{"emitter":4,"reduce":5}],4:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],5:[function(require,module,exports){

/**
 * Reduce `arr` with `fn`.
 *
 * @param {Array} arr
 * @param {Function} fn
 * @param {Mixed} initial
 *
 * TODO: combatible error handling?
 */

module.exports = function(arr, fn, initial){  
  var idx = 0;
  var len = arr.length;
  var curr = arguments.length == 3
    ? initial
    : arr[idx++];

  while (idx < len) {
    curr = fn.call(null, curr, arr[idx], ++idx, arr);
  }
  
  return curr;
};
},{}],6:[function(require,module,exports){
'use strict';

var riot = require('riot'); 

require('./tag/app.tag');
require('./tag/list.tag');

var api_uri = 'https://auc-cat.herokuapp.com/';

if ("production" === 'development') {
  api_uri = 'http://localhost:9292';
}

riot.mount('app', {api_uri: api_uri});

},{"./tag/app.tag":7,"./tag/list.tag":8,"riot":2}],7:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag('app', '<div class="@header"> <h1 class="heading --logo">Yahoo Auction Category Search</h1> <div class="container"> <input class="input__text +luminous" type="text" name="keyword" placeholder="search keyword"> <div class="credit"> Build by <a href="https://twitter.com/count0">@count0</a> &copy; 2015<br> license under <a href="https://raw.githubusercontent.com/pipboy3000/auc-cat/master/LICENSE">MIT</a> </div> </div> </div> <list data="{ results }">', function(opts) {var _this = this;

var Bacon = require('baconjs');
var request = require('superagent');

this.results = [];

var keywordValue = function keywordValue() {
  return Bacon.fromEvent(_this.keyword, 'keyup').throttle(1500).map(function (e) {
    return e.target.value;
  }).filter(function (v) {
    return v.length > 2;
  }).toProperty();
};

var keywordBus = new Bacon.Bus();
keywordBus.plug(keywordValue());
keywordBus.onValue(function (keyword) {
  request.get('' + opts.api_uri + '/search/keyword/' + keyword).end(function (err, res) {
    if (err) {
      console.log(err);
      return;
    }

    if (res.status === 200) {
      // console.log(res)
      _this.results = res.body;
      _this.update();
    }
  });
});
});

},{"baconjs":1,"riot":2,"superagent":3}],8:[function(require,module,exports){
var riot = require('riot');
module.exports = riot.tag('list', '<ul> <li each="{ opts.data }" class="listItem"> <span class="listItem__head">{id}</span> <span class="listItem__content"><a href="http://category.auctions.yahoo.co.jp/list/{id}/" class="link" target="_blank">{title}</a></span> </li> </ul>', 'list , [riot-tag="list"] { display: block; overflow: hidden; }', function(opts) {
});

},{"riot":2}]},{},[6]);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkoezE6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuKGZ1bmN0aW9uIChnbG9iYWwpe1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgQmFjb24sIEJ1ZmZlcmluZ1NvdXJjZSwgQnVzLCBDb21wb3NpdGVVbnN1YnNjcmliZSwgQ29uc3VtaW5nU291cmNlLCBEZXNjLCBEaXNwYXRjaGVyLCBFbmQsIEVycm9yLCBFdmVudCwgRXZlbnRTdHJlYW0sIEV4Y2VwdGlvbiwgSW5pdGlhbCwgTmV4dCwgTm9uZSwgT2JzZXJ2YWJsZSwgUHJvcGVydHksIFByb3BlcnR5RGlzcGF0Y2hlciwgU29tZSwgU291cmNlLCBVcGRhdGVCYXJyaWVyLCBfLCBhZGRQcm9wZXJ0eUluaXRWYWx1ZVRvU3RyZWFtLCBhc3NlcnQsIGFzc2VydEFycmF5LCBhc3NlcnRFdmVudFN0cmVhbSwgYXNzZXJ0RnVuY3Rpb24sIGFzc2VydE5vQXJndW1lbnRzLCBhc3NlcnRPYnNlcnZhYmxlLCBhc3NlcnRPYnNlcnZhYmxlSXNQcm9wZXJ0eSwgYXNzZXJ0U3RyaW5nLCBjbG9uZUFycmF5LCBjb25zdGFudFRvRnVuY3Rpb24sIGNvbnRhaW5zRHVwbGljYXRlRGVwcywgY29udmVydEFyZ3NUb0Z1bmN0aW9uLCBkZXNjcmliZSwgZW5kRXZlbnQsIGV2ZW50SWRDb3VudGVyLCBldmVudE1ldGhvZHMsIGZpbmREZXBzLCBmaW5kSGFuZGxlck1ldGhvZHMsIGZsYXRNYXBfLCBmb3JtZXIsIGlkQ291bnRlciwgaW5pdGlhbEV2ZW50LCBpc0FycmF5LCBpc0ZpZWxkS2V5LCBpc09ic2VydmFibGUsIGxhdHRlciwgbGlmdENhbGxiYWNrLCBtYWtlRnVuY3Rpb24sIG1ha2VGdW5jdGlvbkFyZ3MsIG1ha2VGdW5jdGlvbl8sIG1ha2VPYnNlcnZhYmxlLCBtYWtlU3Bhd25lciwgbmV4dEV2ZW50LCBub3AsIHBhcnRpYWxseUFwcGxpZWQsIHJlY3Vyc2lvbkRlcHRoLCByZWYsIHJlZ2lzdGVyT2JzLCBzcHlzLCB0b0NvbWJpbmF0b3IsIHRvRXZlbnQsIHRvRmllbGRFeHRyYWN0b3IsIHRvRmllbGRLZXksIHRvT3B0aW9uLCB0b1NpbXBsZUV4dHJhY3RvciwgdmFsdWVBbmRFbmQsIHdpdGhEZXNjLCB3aXRoTWV0aG9kQ2FsbFN1cHBvcnQsXG4gICAgaGFzUHJvcCA9IHt9Lmhhc093blByb3BlcnR5LFxuICAgIGV4dGVuZCA9IGZ1bmN0aW9uKGNoaWxkLCBwYXJlbnQpIHsgZm9yICh2YXIga2V5IGluIHBhcmVudCkgeyBpZiAoaGFzUHJvcC5jYWxsKHBhcmVudCwga2V5KSkgY2hpbGRba2V5XSA9IHBhcmVudFtrZXldOyB9IGZ1bmN0aW9uIGN0b3IoKSB7IHRoaXMuY29uc3RydWN0b3IgPSBjaGlsZDsgfSBjdG9yLnByb3RvdHlwZSA9IHBhcmVudC5wcm90b3R5cGU7IGNoaWxkLnByb3RvdHlwZSA9IG5ldyBjdG9yKCk7IGNoaWxkLl9fc3VwZXJfXyA9IHBhcmVudC5wcm90b3R5cGU7IHJldHVybiBjaGlsZDsgfSxcbiAgICBzbGljZSA9IFtdLnNsaWNlLFxuICAgIGJpbmQgPSBmdW5jdGlvbihmbiwgbWUpeyByZXR1cm4gZnVuY3Rpb24oKXsgcmV0dXJuIGZuLmFwcGx5KG1lLCBhcmd1bWVudHMpOyB9OyB9O1xuXG4gIEJhY29uID0ge1xuICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBcIkJhY29uXCI7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLnZlcnNpb24gPSAnMC43LjcwJztcblxuICBFeGNlcHRpb24gPSAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBnbG9iYWwgIT09IG51bGwgPyBnbG9iYWwgOiB0aGlzKS5FcnJvcjtcblxuICBub3AgPSBmdW5jdGlvbigpIHt9O1xuXG4gIGxhdHRlciA9IGZ1bmN0aW9uKF8sIHgpIHtcbiAgICByZXR1cm4geDtcbiAgfTtcblxuICBmb3JtZXIgPSBmdW5jdGlvbih4LCBfKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG5cbiAgY2xvbmVBcnJheSA9IGZ1bmN0aW9uKHhzKSB7XG4gICAgcmV0dXJuIHhzLnNsaWNlKDApO1xuICB9O1xuXG4gIGFzc2VydCA9IGZ1bmN0aW9uKG1lc3NhZ2UsIGNvbmRpdGlvbikge1xuICAgIGlmICghY29uZGl0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKG1lc3NhZ2UpO1xuICAgIH1cbiAgfTtcblxuICBhc3NlcnRPYnNlcnZhYmxlSXNQcm9wZXJ0eSA9IGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoeCBpbnN0YW5jZW9mIE9ic2VydmFibGUgJiYgISh4IGluc3RhbmNlb2YgUHJvcGVydHkpKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiT2JzZXJ2YWJsZSBpcyBub3QgYSBQcm9wZXJ0eSA6IFwiICsgeCk7XG4gICAgfVxuICB9O1xuXG4gIGFzc2VydEV2ZW50U3RyZWFtID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoIShldmVudCBpbnN0YW5jZW9mIEV2ZW50U3RyZWFtKSkge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIm5vdCBhbiBFdmVudFN0cmVhbSA6IFwiICsgZXZlbnQpO1xuICAgIH1cbiAgfTtcblxuICBhc3NlcnRPYnNlcnZhYmxlID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoIShldmVudCBpbnN0YW5jZW9mIE9ic2VydmFibGUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwibm90IGFuIE9ic2VydmFibGUgOiBcIiArIGV2ZW50KTtcbiAgICB9XG4gIH07XG5cbiAgYXNzZXJ0RnVuY3Rpb24gPSBmdW5jdGlvbihmKSB7XG4gICAgcmV0dXJuIGFzc2VydChcIm5vdCBhIGZ1bmN0aW9uIDogXCIgKyBmLCBfLmlzRnVuY3Rpb24oZikpO1xuICB9O1xuXG4gIGlzQXJyYXkgPSBmdW5jdGlvbih4cykge1xuICAgIHJldHVybiB4cyBpbnN0YW5jZW9mIEFycmF5O1xuICB9O1xuXG4gIGlzT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geCBpbnN0YW5jZW9mIE9ic2VydmFibGU7XG4gIH07XG5cbiAgYXNzZXJ0QXJyYXkgPSBmdW5jdGlvbih4cykge1xuICAgIGlmICghaXNBcnJheSh4cykpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJub3QgYW4gYXJyYXkgOiBcIiArIHhzKTtcbiAgICB9XG4gIH07XG5cbiAgYXNzZXJ0Tm9Bcmd1bWVudHMgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgcmV0dXJuIGFzc2VydChcIm5vIGFyZ3VtZW50cyBzdXBwb3J0ZWRcIiwgYXJncy5sZW5ndGggPT09IDApO1xuICB9O1xuXG4gIGFzc2VydFN0cmluZyA9IGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAodHlwZW9mIHggIT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJub3QgYSBzdHJpbmcgOiBcIiArIHgpO1xuICAgIH1cbiAgfTtcblxuICBfID0ge1xuICAgIGluZGV4T2Y6IEFycmF5LnByb3RvdHlwZS5pbmRleE9mID8gZnVuY3Rpb24oeHMsIHgpIHtcbiAgICAgIHJldHVybiB4cy5pbmRleE9mKHgpO1xuICAgIH0gOiBmdW5jdGlvbih4cywgeCkge1xuICAgICAgdmFyIGksIGosIGxlbjEsIHk7XG4gICAgICBmb3IgKGkgPSBqID0gMCwgbGVuMSA9IHhzLmxlbmd0aDsgaiA8IGxlbjE7IGkgPSArK2opIHtcbiAgICAgICAgeSA9IHhzW2ldO1xuICAgICAgICBpZiAoeCA9PT0geSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfSxcbiAgICBpbmRleFdoZXJlOiBmdW5jdGlvbih4cywgZikge1xuICAgICAgdmFyIGksIGosIGxlbjEsIHk7XG4gICAgICBmb3IgKGkgPSBqID0gMCwgbGVuMSA9IHhzLmxlbmd0aDsgaiA8IGxlbjE7IGkgPSArK2opIHtcbiAgICAgICAgeSA9IHhzW2ldO1xuICAgICAgICBpZiAoZih5KSkge1xuICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfSxcbiAgICBoZWFkOiBmdW5jdGlvbih4cykge1xuICAgICAgcmV0dXJuIHhzWzBdO1xuICAgIH0sXG4gICAgYWx3YXlzOiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB4O1xuICAgICAgfTtcbiAgICB9LFxuICAgIG5lZ2F0ZTogZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuICFmKHgpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIGVtcHR5OiBmdW5jdGlvbih4cykge1xuICAgICAgcmV0dXJuIHhzLmxlbmd0aCA9PT0gMDtcbiAgICB9LFxuICAgIHRhaWw6IGZ1bmN0aW9uKHhzKSB7XG4gICAgICByZXR1cm4geHMuc2xpY2UoMSwgeHMubGVuZ3RoKTtcbiAgICB9LFxuICAgIGZpbHRlcjogZnVuY3Rpb24oZiwgeHMpIHtcbiAgICAgIHZhciBmaWx0ZXJlZCwgaiwgbGVuMSwgeDtcbiAgICAgIGZpbHRlcmVkID0gW107XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0geHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgIHggPSB4c1tqXTtcbiAgICAgICAgaWYgKGYoeCkpIHtcbiAgICAgICAgICBmaWx0ZXJlZC5wdXNoKHgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmlsdGVyZWQ7XG4gICAgfSxcbiAgICBtYXA6IGZ1bmN0aW9uKGYsIHhzKSB7XG4gICAgICB2YXIgaiwgbGVuMSwgcmVzdWx0cywgeDtcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSB4cy5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgeCA9IHhzW2pdO1xuICAgICAgICByZXN1bHRzLnB1c2goZih4KSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgICB9LFxuICAgIGVhY2g6IGZ1bmN0aW9uKHhzLCBmKSB7XG4gICAgICB2YXIga2V5LCB2YWx1ZTtcbiAgICAgIGZvciAoa2V5IGluIHhzKSB7XG4gICAgICAgIGlmICghaGFzUHJvcC5jYWxsKHhzLCBrZXkpKSBjb250aW51ZTtcbiAgICAgICAgdmFsdWUgPSB4c1trZXldO1xuICAgICAgICBmKGtleSwgdmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICB9LFxuICAgIHRvQXJyYXk6IGZ1bmN0aW9uKHhzKSB7XG4gICAgICBpZiAoaXNBcnJheSh4cykpIHtcbiAgICAgICAgcmV0dXJuIHhzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFt4c107XG4gICAgICB9XG4gICAgfSxcbiAgICBjb250YWluczogZnVuY3Rpb24oeHMsIHgpIHtcbiAgICAgIHJldHVybiBfLmluZGV4T2YoeHMsIHgpICE9PSAtMTtcbiAgICB9LFxuICAgIGlkOiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4geDtcbiAgICB9LFxuICAgIGxhc3Q6IGZ1bmN0aW9uKHhzKSB7XG4gICAgICByZXR1cm4geHNbeHMubGVuZ3RoIC0gMV07XG4gICAgfSxcbiAgICBhbGw6IGZ1bmN0aW9uKHhzLCBmKSB7XG4gICAgICB2YXIgaiwgbGVuMSwgeDtcbiAgICAgIGlmIChmID09IG51bGwpIHtcbiAgICAgICAgZiA9IF8uaWQ7XG4gICAgICB9XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0geHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgIHggPSB4c1tqXTtcbiAgICAgICAgaWYgKCFmKHgpKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIGFueTogZnVuY3Rpb24oeHMsIGYpIHtcbiAgICAgIHZhciBqLCBsZW4xLCB4O1xuICAgICAgaWYgKGYgPT0gbnVsbCkge1xuICAgICAgICBmID0gXy5pZDtcbiAgICAgIH1cbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSB4cy5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgeCA9IHhzW2pdO1xuICAgICAgICBpZiAoZih4KSkge1xuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcbiAgICB3aXRob3V0OiBmdW5jdGlvbih4LCB4cykge1xuICAgICAgcmV0dXJuIF8uZmlsdGVyKChmdW5jdGlvbih5KSB7XG4gICAgICAgIHJldHVybiB5ICE9PSB4O1xuICAgICAgfSksIHhzKTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24oeCwgeHMpIHtcbiAgICAgIHZhciBpO1xuICAgICAgaSA9IF8uaW5kZXhPZih4cywgeCk7XG4gICAgICBpZiAoaSA+PSAwKSB7XG4gICAgICAgIHJldHVybiB4cy5zcGxpY2UoaSwgMSk7XG4gICAgICB9XG4gICAgfSxcbiAgICBmb2xkOiBmdW5jdGlvbih4cywgc2VlZCwgZikge1xuICAgICAgdmFyIGosIGxlbjEsIHg7XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0geHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgIHggPSB4c1tqXTtcbiAgICAgICAgc2VlZCA9IGYoc2VlZCwgeCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2VlZDtcbiAgICB9LFxuICAgIGZsYXRNYXA6IGZ1bmN0aW9uKGYsIHhzKSB7XG4gICAgICByZXR1cm4gXy5mb2xkKHhzLCBbXSwgKGZ1bmN0aW9uKHlzLCB4KSB7XG4gICAgICAgIHJldHVybiB5cy5jb25jYXQoZih4KSk7XG4gICAgICB9KSk7XG4gICAgfSxcbiAgICBjYWNoZWQ6IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHZhciB2YWx1ZTtcbiAgICAgIHZhbHVlID0gTm9uZTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSBOb25lKSB7XG4gICAgICAgICAgdmFsdWUgPSBmKCk7XG4gICAgICAgICAgZiA9IHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9O1xuICAgIH0sXG4gICAgaXNGdW5jdGlvbjogZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBmID09PSBcImZ1bmN0aW9uXCI7XG4gICAgfSxcbiAgICB0b1N0cmluZzogZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgZXgsIGludGVybmFscywga2V5LCB2YWx1ZTtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJlY3Vyc2lvbkRlcHRoKys7XG4gICAgICAgIGlmIChvYmogPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiBcInVuZGVmaW5lZFwiO1xuICAgICAgICB9IGVsc2UgaWYgKF8uaXNGdW5jdGlvbihvYmopKSB7XG4gICAgICAgICAgcmV0dXJuIFwiZnVuY3Rpb25cIjtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KG9iaikpIHtcbiAgICAgICAgICBpZiAocmVjdXJzaW9uRGVwdGggPiA1KSB7XG4gICAgICAgICAgICByZXR1cm4gXCJbLi5dXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBcIltcIiArIF8ubWFwKF8udG9TdHJpbmcsIG9iaikudG9TdHJpbmcoKSArIFwiXVwiO1xuICAgICAgICB9IGVsc2UgaWYgKCgob2JqICE9IG51bGwgPyBvYmoudG9TdHJpbmcgOiB2b2lkIDApICE9IG51bGwpICYmIG9iai50b1N0cmluZyAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZykge1xuICAgICAgICAgIHJldHVybiBvYmoudG9TdHJpbmcoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgaWYgKHJlY3Vyc2lvbkRlcHRoID4gNSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiey4ufVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpbnRlcm5hbHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcmVzdWx0cztcbiAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgIGZvciAoa2V5IGluIG9iaikge1xuICAgICAgICAgICAgICBpZiAoIWhhc1Byb3AuY2FsbChvYmosIGtleSkpIGNvbnRpbnVlO1xuICAgICAgICAgICAgICB2YWx1ZSA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgICAgICAgICAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICAgICAgICAgICAgZXggPSBfZXJyb3I7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZXg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICByZXN1bHRzLnB1c2goXy50b1N0cmluZyhrZXkpICsgXCI6XCIgKyBfLnRvU3RyaW5nKHZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICB9KSgpO1xuICAgICAgICAgIHJldHVybiBcIntcIiArIGludGVybmFscyArIFwifVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHJlY3Vyc2lvbkRlcHRoLS07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJlY3Vyc2lvbkRlcHRoID0gMDtcblxuICBCYWNvbi5fID0gXztcblxuICBVcGRhdGVCYXJyaWVyID0gQmFjb24uVXBkYXRlQmFycmllciA9IChmdW5jdGlvbigpIHtcbiAgICB2YXIgYWZ0ZXJUcmFuc2FjdGlvbiwgYWZ0ZXJzLCBhZnRlcnNJbmRleCwgY3VycmVudEV2ZW50SWQsIGZsdXNoLCBmbHVzaERlcHNPZiwgZmx1c2hXYWl0ZXJzLCBoYXNXYWl0ZXJzLCBpblRyYW5zYWN0aW9uLCByb290RXZlbnQsIHdhaXRlck9icywgd2FpdGVycywgd2hlbkRvbmVXaXRoLCB3cmFwcGVkU3Vic2NyaWJlO1xuICAgIHJvb3RFdmVudCA9IHZvaWQgMDtcbiAgICB3YWl0ZXJPYnMgPSBbXTtcbiAgICB3YWl0ZXJzID0ge307XG4gICAgYWZ0ZXJzID0gW107XG4gICAgYWZ0ZXJzSW5kZXggPSAwO1xuICAgIGFmdGVyVHJhbnNhY3Rpb24gPSBmdW5jdGlvbihmKSB7XG4gICAgICBpZiAocm9vdEV2ZW50KSB7XG4gICAgICAgIHJldHVybiBhZnRlcnMucHVzaChmKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICB3aGVuRG9uZVdpdGggPSBmdW5jdGlvbihvYnMsIGYpIHtcbiAgICAgIHZhciBvYnNXYWl0ZXJzO1xuICAgICAgaWYgKHJvb3RFdmVudCkge1xuICAgICAgICBvYnNXYWl0ZXJzID0gd2FpdGVyc1tvYnMuaWRdO1xuICAgICAgICBpZiAob2JzV2FpdGVycyA9PSBudWxsKSB7XG4gICAgICAgICAgb2JzV2FpdGVycyA9IHdhaXRlcnNbb2JzLmlkXSA9IFtmXTtcbiAgICAgICAgICByZXR1cm4gd2FpdGVyT2JzLnB1c2gob2JzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gb2JzV2FpdGVycy5wdXNoKGYpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZigpO1xuICAgICAgfVxuICAgIH07XG4gICAgZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICAgIHdoaWxlICh3YWl0ZXJPYnMubGVuZ3RoID4gMCkge1xuICAgICAgICBmbHVzaFdhaXRlcnMoMCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH07XG4gICAgZmx1c2hXYWl0ZXJzID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBmLCBqLCBsZW4xLCBvYnMsIG9ic0lkLCBvYnNXYWl0ZXJzO1xuICAgICAgb2JzID0gd2FpdGVyT2JzW2luZGV4XTtcbiAgICAgIG9ic0lkID0gb2JzLmlkO1xuICAgICAgb2JzV2FpdGVycyA9IHdhaXRlcnNbb2JzSWRdO1xuICAgICAgd2FpdGVyT2JzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICBkZWxldGUgd2FpdGVyc1tvYnNJZF07XG4gICAgICBmbHVzaERlcHNPZihvYnMpO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IG9ic1dhaXRlcnMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgIGYgPSBvYnNXYWl0ZXJzW2pdO1xuICAgICAgICBmKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdm9pZCAwO1xuICAgIH07XG4gICAgZmx1c2hEZXBzT2YgPSBmdW5jdGlvbihvYnMpIHtcbiAgICAgIHZhciBkZXAsIGRlcHMsIGluZGV4LCBqLCBsZW4xO1xuICAgICAgZGVwcyA9IG9icy5pbnRlcm5hbERlcHMoKTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBkZXBzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBkZXAgPSBkZXBzW2pdO1xuICAgICAgICBmbHVzaERlcHNPZihkZXApO1xuICAgICAgICBpZiAod2FpdGVyc1tkZXAuaWRdKSB7XG4gICAgICAgICAgaW5kZXggPSBfLmluZGV4T2Yod2FpdGVyT2JzLCBkZXApO1xuICAgICAgICAgIGZsdXNoV2FpdGVycyhpbmRleCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfTtcbiAgICBpblRyYW5zYWN0aW9uID0gZnVuY3Rpb24oZXZlbnQsIGNvbnRleHQsIGYsIGFyZ3MpIHtcbiAgICAgIHZhciBhZnRlciwgcmVzdWx0O1xuICAgICAgaWYgKHJvb3RFdmVudCkge1xuICAgICAgICByZXR1cm4gZi5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJvb3RFdmVudCA9IGV2ZW50O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IGYuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgZmx1c2goKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICByb290RXZlbnQgPSB2b2lkIDA7XG4gICAgICAgICAgd2hpbGUgKGFmdGVyc0luZGV4IDwgYWZ0ZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgYWZ0ZXIgPSBhZnRlcnNbYWZ0ZXJzSW5kZXhdO1xuICAgICAgICAgICAgYWZ0ZXJzSW5kZXgrKztcbiAgICAgICAgICAgIGFmdGVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFmdGVyc0luZGV4ID0gMDtcbiAgICAgICAgICBhZnRlcnMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgIH07XG4gICAgY3VycmVudEV2ZW50SWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChyb290RXZlbnQpIHtcbiAgICAgICAgcmV0dXJuIHJvb3RFdmVudC5pZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgICB9XG4gICAgfTtcbiAgICB3cmFwcGVkU3Vic2NyaWJlID0gZnVuY3Rpb24ob2JzLCBzaW5rKSB7XG4gICAgICB2YXIgZG9VbnN1Yiwgc2hvdWxkVW5zdWIsIHVuc3ViLCB1bnN1YmQ7XG4gICAgICB1bnN1YmQgPSBmYWxzZTtcbiAgICAgIHNob3VsZFVuc3ViID0gZmFsc2U7XG4gICAgICBkb1Vuc3ViID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzaG91bGRVbnN1YiA9IHRydWU7XG4gICAgICB9O1xuICAgICAgdW5zdWIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdW5zdWJkID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIGRvVW5zdWIoKTtcbiAgICAgIH07XG4gICAgICBkb1Vuc3ViID0gb2JzLmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHJldHVybiBhZnRlclRyYW5zYWN0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciByZXBseTtcbiAgICAgICAgICBpZiAoIXVuc3ViZCkge1xuICAgICAgICAgICAgcmVwbHkgPSBzaW5rKGV2ZW50KTtcbiAgICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB1bnN1YigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGlmIChzaG91bGRVbnN1Yikge1xuICAgICAgICBkb1Vuc3ViKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5zdWI7XG4gICAgfTtcbiAgICBoYXNXYWl0ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gd2FpdGVyT2JzLmxlbmd0aCA+IDA7XG4gICAgfTtcbiAgICByZXR1cm4ge1xuICAgICAgd2hlbkRvbmVXaXRoOiB3aGVuRG9uZVdpdGgsXG4gICAgICBoYXNXYWl0ZXJzOiBoYXNXYWl0ZXJzLFxuICAgICAgaW5UcmFuc2FjdGlvbjogaW5UcmFuc2FjdGlvbixcbiAgICAgIGN1cnJlbnRFdmVudElkOiBjdXJyZW50RXZlbnRJZCxcbiAgICAgIHdyYXBwZWRTdWJzY3JpYmU6IHdyYXBwZWRTdWJzY3JpYmUsXG4gICAgICBhZnRlclRyYW5zYWN0aW9uOiBhZnRlclRyYW5zYWN0aW9uXG4gICAgfTtcbiAgfSkoKTtcblxuICBTb3VyY2UgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gU291cmNlKG9iczEsIHN5bmMsIGxhenkxKSB7XG4gICAgICB0aGlzLm9icyA9IG9iczE7XG4gICAgICB0aGlzLnN5bmMgPSBzeW5jO1xuICAgICAgdGhpcy5sYXp5ID0gbGF6eTEgIT0gbnVsbCA/IGxhenkxIDogZmFsc2U7XG4gICAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgfVxuXG4gICAgU291cmNlLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbihzaW5rKSB7XG4gICAgICByZXR1cm4gdGhpcy5vYnMuZGlzcGF0Y2hlci5zdWJzY3JpYmUoc2luayk7XG4gICAgfTtcblxuICAgIFNvdXJjZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLm9icy50b1N0cmluZygpO1xuICAgIH07XG5cbiAgICBTb3VyY2UucHJvdG90eXBlLm1hcmtFbmRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgIH07XG5cbiAgICBTb3VyY2UucHJvdG90eXBlLmNvbnN1bWUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmxhenkpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB2YWx1ZTogXy5hbHdheXModGhpcy5xdWV1ZVswXSlcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnF1ZXVlWzBdO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBTb3VyY2UucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZSA9IFt4XTtcbiAgICB9O1xuXG4gICAgU291cmNlLnByb3RvdHlwZS5tYXlIYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgU291cmNlLnByb3RvdHlwZS5oYXNBdExlYXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5sZW5ndGg7XG4gICAgfTtcblxuICAgIFNvdXJjZS5wcm90b3R5cGUuZmxhdHRlbiA9IHRydWU7XG5cbiAgICByZXR1cm4gU291cmNlO1xuXG4gIH0pKCk7XG5cbiAgQ29uc3VtaW5nU291cmNlID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgICBleHRlbmQoQ29uc3VtaW5nU291cmNlLCBzdXBlckNsYXNzKTtcblxuICAgIGZ1bmN0aW9uIENvbnN1bWluZ1NvdXJjZSgpIHtcbiAgICAgIHJldHVybiBDb25zdW1pbmdTb3VyY2UuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuXG4gICAgQ29uc3VtaW5nU291cmNlLnByb3RvdHlwZS5jb25zdW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgIH07XG5cbiAgICBDb25zdW1pbmdTb3VyY2UucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gdGhpcy5xdWV1ZS5wdXNoKHgpO1xuICAgIH07XG5cbiAgICBDb25zdW1pbmdTb3VyY2UucHJvdG90eXBlLm1heUhhdmUgPSBmdW5jdGlvbihjKSB7XG4gICAgICByZXR1cm4gIXRoaXMuZW5kZWQgfHwgdGhpcy5xdWV1ZS5sZW5ndGggPj0gYztcbiAgICB9O1xuXG4gICAgQ29uc3VtaW5nU291cmNlLnByb3RvdHlwZS5oYXNBdExlYXN0ID0gZnVuY3Rpb24oYykge1xuICAgICAgcmV0dXJuIHRoaXMucXVldWUubGVuZ3RoID49IGM7XG4gICAgfTtcblxuICAgIENvbnN1bWluZ1NvdXJjZS5wcm90b3R5cGUuZmxhdHRlbiA9IGZhbHNlO1xuXG4gICAgcmV0dXJuIENvbnN1bWluZ1NvdXJjZTtcblxuICB9KShTb3VyY2UpO1xuXG4gIEJ1ZmZlcmluZ1NvdXJjZSA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gICAgZXh0ZW5kKEJ1ZmZlcmluZ1NvdXJjZSwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBCdWZmZXJpbmdTb3VyY2Uob2JzKSB7XG4gICAgICBCdWZmZXJpbmdTb3VyY2UuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgb2JzLCB0cnVlKTtcbiAgICB9XG5cbiAgICBCdWZmZXJpbmdTb3VyY2UucHJvdG90eXBlLmNvbnN1bWUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZXM7XG4gICAgICB2YWx1ZXMgPSB0aGlzLnF1ZXVlO1xuICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcblxuICAgIEJ1ZmZlcmluZ1NvdXJjZS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB0aGlzLnF1ZXVlLnB1c2goeC52YWx1ZSgpKTtcbiAgICB9O1xuXG4gICAgQnVmZmVyaW5nU291cmNlLnByb3RvdHlwZS5oYXNBdExlYXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEJ1ZmZlcmluZ1NvdXJjZTtcblxuICB9KShTb3VyY2UpO1xuXG4gIFNvdXJjZS5pc1RyaWdnZXIgPSBmdW5jdGlvbihzKSB7XG4gICAgaWYgKHMgaW5zdGFuY2VvZiBTb3VyY2UpIHtcbiAgICAgIHJldHVybiBzLnN5bmM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBzIGluc3RhbmNlb2YgRXZlbnRTdHJlYW07XG4gICAgfVxuICB9O1xuXG4gIFNvdXJjZS5mcm9tT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uKHMpIHtcbiAgICBpZiAocyBpbnN0YW5jZW9mIFNvdXJjZSkge1xuICAgICAgcmV0dXJuIHM7XG4gICAgfSBlbHNlIGlmIChzIGluc3RhbmNlb2YgUHJvcGVydHkpIHtcbiAgICAgIHJldHVybiBuZXcgU291cmNlKHMsIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBDb25zdW1pbmdTb3VyY2UocywgdHJ1ZSk7XG4gICAgfVxuICB9O1xuXG4gIERlc2MgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gRGVzYyhjb250ZXh0MSwgbWV0aG9kMSwgYXJnczEpIHtcbiAgICAgIHRoaXMuY29udGV4dCA9IGNvbnRleHQxO1xuICAgICAgdGhpcy5tZXRob2QgPSBtZXRob2QxO1xuICAgICAgdGhpcy5hcmdzID0gYXJnczE7XG4gICAgfVxuXG4gICAgRGVzYy5wcm90b3R5cGUuZGVwcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVkIHx8ICh0aGlzLmNhY2hlZCA9IGZpbmREZXBzKFt0aGlzLmNvbnRleHRdLmNvbmNhdCh0aGlzLmFyZ3MpKSk7XG4gICAgfTtcblxuICAgIERlc2MucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXy50b1N0cmluZyh0aGlzLmNvbnRleHQpICsgXCIuXCIgKyBfLnRvU3RyaW5nKHRoaXMubWV0aG9kKSArIFwiKFwiICsgXy5tYXAoXy50b1N0cmluZywgdGhpcy5hcmdzKSArIFwiKVwiO1xuICAgIH07XG5cbiAgICByZXR1cm4gRGVzYztcblxuICB9KSgpO1xuXG4gIGRlc2NyaWJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGNvbnRleHQsIG1ldGhvZDtcbiAgICBjb250ZXh0ID0gYXJndW1lbnRzWzBdLCBtZXRob2QgPSBhcmd1bWVudHNbMV0sIGFyZ3MgPSAzIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMikgOiBbXTtcbiAgICBpZiAoKGNvbnRleHQgfHwgbWV0aG9kKSBpbnN0YW5jZW9mIERlc2MpIHtcbiAgICAgIHJldHVybiBjb250ZXh0IHx8IG1ldGhvZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG5ldyBEZXNjKGNvbnRleHQsIG1ldGhvZCwgYXJncyk7XG4gICAgfVxuICB9O1xuXG4gIHdpdGhEZXNjID0gZnVuY3Rpb24oZGVzYywgb2JzKSB7XG4gICAgb2JzLmRlc2MgPSBkZXNjO1xuICAgIHJldHVybiBvYnM7XG4gIH07XG5cbiAgZmluZERlcHMgPSBmdW5jdGlvbih4KSB7XG4gICAgaWYgKGlzQXJyYXkoeCkpIHtcbiAgICAgIHJldHVybiBfLmZsYXRNYXAoZmluZERlcHMsIHgpO1xuICAgIH0gZWxzZSBpZiAoaXNPYnNlcnZhYmxlKHgpKSB7XG4gICAgICByZXR1cm4gW3hdO1xuICAgIH0gZWxzZSBpZiAoeCBpbnN0YW5jZW9mIFNvdXJjZSkge1xuICAgICAgcmV0dXJuIFt4Lm9ic107XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gIH07XG5cbiAgQmFjb24uRGVzYyA9IERlc2M7XG5cbiAgQmFjb24uRGVzYy5lbXB0eSA9IG5ldyBCYWNvbi5EZXNjKFwiXCIsIFwiXCIsIFtdKTtcblxuICB3aXRoTWV0aG9kQ2FsbFN1cHBvcnQgPSBmdW5jdGlvbih3cmFwcGVkKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3MsIGNvbnRleHQsIGYsIG1ldGhvZE5hbWU7XG4gICAgICBmID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgICBpZiAodHlwZW9mIGYgPT09IFwib2JqZWN0XCIgJiYgYXJncy5sZW5ndGgpIHtcbiAgICAgICAgY29udGV4dCA9IGY7XG4gICAgICAgIG1ldGhvZE5hbWUgPSBhcmdzWzBdO1xuICAgICAgICBmID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnRleHRbbWV0aG9kTmFtZV0uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgYXJncyA9IGFyZ3Muc2xpY2UoMSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gd3JhcHBlZC5hcHBseShudWxsLCBbZl0uY29uY2F0KHNsaWNlLmNhbGwoYXJncykpKTtcbiAgICB9O1xuICB9O1xuXG4gIG1ha2VGdW5jdGlvbkFyZ3MgPSBmdW5jdGlvbihhcmdzKSB7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MpO1xuICAgIHJldHVybiBtYWtlRnVuY3Rpb25fLmFwcGx5KG51bGwsIGFyZ3MpO1xuICB9O1xuXG4gIHBhcnRpYWxseUFwcGxpZWQgPSBmdW5jdGlvbihmLCBhcHBsaWVkKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGFyZ3M7XG4gICAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICByZXR1cm4gZi5hcHBseShudWxsLCBhcHBsaWVkLmNvbmNhdChhcmdzKSk7XG4gICAgfTtcbiAgfTtcblxuICB0b1NpbXBsZUV4dHJhY3RvciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGZpZWxkVmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB7XG4gICAgICAgICAgcmV0dXJuIHZvaWQgMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmaWVsZFZhbHVlID0gdmFsdWVba2V5XTtcbiAgICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGZpZWxkVmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmllbGRWYWx1ZS5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBmaWVsZFZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9O1xuICB9O1xuXG4gIHRvRmllbGRFeHRyYWN0b3IgPSBmdW5jdGlvbihmLCBhcmdzKSB7XG4gICAgdmFyIHBhcnRGdW5jcywgcGFydHM7XG4gICAgcGFydHMgPSBmLnNsaWNlKDEpLnNwbGl0KFwiLlwiKTtcbiAgICBwYXJ0RnVuY3MgPSBfLm1hcCh0b1NpbXBsZUV4dHJhY3RvcihhcmdzKSwgcGFydHMpO1xuICAgIHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGosIGxlbjE7XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0gcGFydEZ1bmNzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBmID0gcGFydEZ1bmNzW2pdO1xuICAgICAgICB2YWx1ZSA9IGYodmFsdWUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgaXNGaWVsZEtleSA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gKHR5cGVvZiBmID09PSBcInN0cmluZ1wiKSAmJiBmLmxlbmd0aCA+IDEgJiYgZi5jaGFyQXQoMCkgPT09IFwiLlwiO1xuICB9O1xuXG4gIG1ha2VGdW5jdGlvbl8gPSB3aXRoTWV0aG9kQ2FsbFN1cHBvcnQoZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGY7XG4gICAgZiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGlmIChfLmlzRnVuY3Rpb24oZikpIHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gcGFydGlhbGx5QXBwbGllZChmLCBhcmdzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoaXNGaWVsZEtleShmKSkge1xuICAgICAgcmV0dXJuIHRvRmllbGRFeHRyYWN0b3IoZiwgYXJncyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBfLmFsd2F5cyhmKTtcbiAgICB9XG4gIH0pO1xuXG4gIG1ha2VGdW5jdGlvbiA9IGZ1bmN0aW9uKGYsIGFyZ3MpIHtcbiAgICByZXR1cm4gbWFrZUZ1bmN0aW9uXy5hcHBseShudWxsLCBbZl0uY29uY2F0KHNsaWNlLmNhbGwoYXJncykpKTtcbiAgfTtcblxuICBjb252ZXJ0QXJnc1RvRnVuY3Rpb24gPSBmdW5jdGlvbihvYnMsIGYsIGFyZ3MsIG1ldGhvZCkge1xuICAgIHZhciBzYW1wbGVkO1xuICAgIGlmIChmIGluc3RhbmNlb2YgUHJvcGVydHkpIHtcbiAgICAgIHNhbXBsZWQgPSBmLnNhbXBsZWRCeShvYnMsIGZ1bmN0aW9uKHAsIHMpIHtcbiAgICAgICAgcmV0dXJuIFtwLCBzXTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG1ldGhvZC5jYWxsKHNhbXBsZWQsIGZ1bmN0aW9uKGFyZykge1xuICAgICAgICB2YXIgcCwgcztcbiAgICAgICAgcCA9IGFyZ1swXSwgcyA9IGFyZ1sxXTtcbiAgICAgICAgcmV0dXJuIHA7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24oYXJnKSB7XG4gICAgICAgIHZhciBwLCBzO1xuICAgICAgICBwID0gYXJnWzBdLCBzID0gYXJnWzFdO1xuICAgICAgICByZXR1cm4gcztcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBmID0gbWFrZUZ1bmN0aW9uKGYsIGFyZ3MpO1xuICAgICAgcmV0dXJuIG1ldGhvZC5jYWxsKG9icywgZik7XG4gICAgfVxuICB9O1xuXG4gIHRvQ29tYmluYXRvciA9IGZ1bmN0aW9uKGYpIHtcbiAgICB2YXIga2V5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24oZikpIHtcbiAgICAgIHJldHVybiBmO1xuICAgIH0gZWxzZSBpZiAoaXNGaWVsZEtleShmKSkge1xuICAgICAga2V5ID0gdG9GaWVsZEtleShmKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICByZXR1cm4gbGVmdFtrZXldKHJpZ2h0KTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFeGNlcHRpb24oXCJub3QgYSBmdW5jdGlvbiBvciBhIGZpZWxkIGtleTogXCIgKyBmKTtcbiAgICB9XG4gIH07XG5cbiAgdG9GaWVsZEtleSA9IGZ1bmN0aW9uKGYpIHtcbiAgICByZXR1cm4gZi5zbGljZSgxKTtcbiAgfTtcblxuICBTb21lID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIFNvbWUodmFsdWUxKSB7XG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWUxO1xuICAgIH1cblxuICAgIFNvbWUucHJvdG90eXBlLmdldE9yRWxzZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfTtcblxuICAgIFNvbWUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWU7XG4gICAgfTtcblxuICAgIFNvbWUucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgIGlmIChmKHRoaXMudmFsdWUpKSB7XG4gICAgICAgIHJldHVybiBuZXcgU29tZSh0aGlzLnZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBOb25lO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBTb21lLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gbmV3IFNvbWUoZih0aGlzLnZhbHVlKSk7XG4gICAgfTtcblxuICAgIFNvbWUucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gZih0aGlzLnZhbHVlKTtcbiAgICB9O1xuXG4gICAgU29tZS5wcm90b3R5cGUuaXNEZWZpbmVkID0gdHJ1ZTtcblxuICAgIFNvbWUucHJvdG90eXBlLnRvQXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbdGhpcy52YWx1ZV07XG4gICAgfTtcblxuICAgIFNvbWUucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBcIlNvbWUoXCIgKyB0aGlzLnZhbHVlICsgXCIpXCI7XG4gICAgfTtcblxuICAgIFNvbWUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbnNwZWN0KCk7XG4gICAgfTtcblxuICAgIHJldHVybiBTb21lO1xuXG4gIH0pKCk7XG5cbiAgTm9uZSA9IHtcbiAgICBnZXRPckVsc2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfSxcbiAgICBmaWx0ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIE5vbmU7XG4gICAgfSxcbiAgICBtYXA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIE5vbmU7XG4gICAgfSxcbiAgICBmb3JFYWNoOiBmdW5jdGlvbigpIHt9LFxuICAgIGlzRGVmaW5lZDogZmFsc2UsXG4gICAgdG9BcnJheTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfSxcbiAgICBpbnNwZWN0OiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBcIk5vbmVcIjtcbiAgICB9LFxuICAgIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmluc3BlY3QoKTtcbiAgICB9XG4gIH07XG5cbiAgdG9PcHRpb24gPSBmdW5jdGlvbih2KSB7XG4gICAgaWYgKHYgaW5zdGFuY2VvZiBTb21lIHx8IHYgPT09IE5vbmUpIHtcbiAgICAgIHJldHVybiB2O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFNvbWUodik7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLm5vTW9yZSA9IFtcIjxuby1tb3JlPlwiXTtcblxuICBCYWNvbi5tb3JlID0gW1wiPG1vcmU+XCJdO1xuXG4gIGV2ZW50SWRDb3VudGVyID0gMDtcblxuICBFdmVudCA9IChmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBFdmVudCgpIHtcbiAgICAgIHRoaXMuaWQgPSArK2V2ZW50SWRDb3VudGVyO1xuICAgIH1cblxuICAgIEV2ZW50LnByb3RvdHlwZS5pc0V2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgRXZlbnQucHJvdG90eXBlLmlzRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIEV2ZW50LnByb3RvdHlwZS5pc0luaXRpYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgRXZlbnQucHJvdG90eXBlLmlzTmV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBFdmVudC5wcm90b3R5cGUuaXNFcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBFdmVudC5wcm90b3R5cGUuaGFzVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgRXZlbnQucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIEV2ZW50LnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICAgIH07XG5cbiAgICBFdmVudC5wcm90b3R5cGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xuICAgIH07XG5cbiAgICByZXR1cm4gRXZlbnQ7XG5cbiAgfSkoKTtcblxuICBOZXh0ID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgICBleHRlbmQoTmV4dCwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBOZXh0KHZhbHVlRiwgZWFnZXIpIHtcbiAgICAgIE5leHQuX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcyk7XG4gICAgICBpZiAoIWVhZ2VyICYmIF8uaXNGdW5jdGlvbih2YWx1ZUYpIHx8IHZhbHVlRiBpbnN0YW5jZW9mIE5leHQpIHtcbiAgICAgICAgdGhpcy52YWx1ZUYgPSB2YWx1ZUY7XG4gICAgICAgIHRoaXMudmFsdWVJbnRlcm5hbCA9IHZvaWQgMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudmFsdWVGID0gdm9pZCAwO1xuICAgICAgICB0aGlzLnZhbHVlSW50ZXJuYWwgPSB2YWx1ZUY7XG4gICAgICB9XG4gICAgfVxuXG4gICAgTmV4dC5wcm90b3R5cGUuaXNOZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgTmV4dC5wcm90b3R5cGUuaGFzVmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBOZXh0LnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudmFsdWVGIGluc3RhbmNlb2YgTmV4dCkge1xuICAgICAgICB0aGlzLnZhbHVlSW50ZXJuYWwgPSB0aGlzLnZhbHVlRi52YWx1ZSgpO1xuICAgICAgICB0aGlzLnZhbHVlRiA9IHZvaWQgMDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy52YWx1ZUYpIHtcbiAgICAgICAgdGhpcy52YWx1ZUludGVybmFsID0gdGhpcy52YWx1ZUYoKTtcbiAgICAgICAgdGhpcy52YWx1ZUYgPSB2b2lkIDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZUludGVybmFsO1xuICAgIH07XG5cbiAgICBOZXh0LnByb3RvdHlwZS5mbWFwID0gZnVuY3Rpb24oZikge1xuICAgICAgdmFyIGV2ZW50LCB2YWx1ZTtcbiAgICAgIGlmICh0aGlzLnZhbHVlSW50ZXJuYWwpIHtcbiAgICAgICAgdmFsdWUgPSB0aGlzLnZhbHVlSW50ZXJuYWw7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBmKHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBldmVudCA9IHRoaXM7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBmKGV2ZW50LnZhbHVlKCkpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgTmV4dC5wcm90b3R5cGUuYXBwbHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBOZXh0KHZhbHVlKTtcbiAgICB9O1xuXG4gICAgTmV4dC5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGYodGhpcy52YWx1ZSgpKTtcbiAgICB9O1xuXG4gICAgTmV4dC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfLnRvU3RyaW5nKHRoaXMudmFsdWUoKSk7XG4gICAgfTtcblxuICAgIE5leHQucHJvdG90eXBlLmxvZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWUoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIE5leHQ7XG5cbiAgfSkoRXZlbnQpO1xuXG4gIEluaXRpYWwgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChJbml0aWFsLCBzdXBlckNsYXNzKTtcblxuICAgIGZ1bmN0aW9uIEluaXRpYWwoKSB7XG4gICAgICByZXR1cm4gSW5pdGlhbC5fX3N1cGVyX18uY29uc3RydWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICBJbml0aWFsLnByb3RvdHlwZS5pc0luaXRpYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBJbml0aWFsLnByb3RvdHlwZS5pc05leHQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgSW5pdGlhbC5wcm90b3R5cGUuYXBwbHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIG5ldyBJbml0aWFsKHZhbHVlKTtcbiAgICB9O1xuXG4gICAgSW5pdGlhbC5wcm90b3R5cGUudG9OZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IE5leHQodGhpcyk7XG4gICAgfTtcblxuICAgIHJldHVybiBJbml0aWFsO1xuXG4gIH0pKE5leHQpO1xuXG4gIEVuZCA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gICAgZXh0ZW5kKEVuZCwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBFbmQoKSB7XG4gICAgICByZXR1cm4gRW5kLl9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIEVuZC5wcm90b3R5cGUuaXNFbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBFbmQucHJvdG90eXBlLmZtYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH07XG5cbiAgICBFbmQucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgRW5kLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFwiPGVuZD5cIjtcbiAgICB9O1xuXG4gICAgcmV0dXJuIEVuZDtcblxuICB9KShFdmVudCk7XG5cbiAgRXJyb3IgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChFcnJvciwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBFcnJvcihlcnJvcjEpIHtcbiAgICAgIHRoaXMuZXJyb3IgPSBlcnJvcjE7XG4gICAgfVxuXG4gICAgRXJyb3IucHJvdG90eXBlLmlzRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBFcnJvci5wcm90b3R5cGUuZm1hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIEVycm9yLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIEVycm9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIFwiPGVycm9yPiBcIiArIF8udG9TdHJpbmcodGhpcy5lcnJvcik7XG4gICAgfTtcblxuICAgIHJldHVybiBFcnJvcjtcblxuICB9KShFdmVudCk7XG5cbiAgQmFjb24uRXZlbnQgPSBFdmVudDtcblxuICBCYWNvbi5Jbml0aWFsID0gSW5pdGlhbDtcblxuICBCYWNvbi5OZXh0ID0gTmV4dDtcblxuICBCYWNvbi5FbmQgPSBFbmQ7XG5cbiAgQmFjb24uRXJyb3IgPSBFcnJvcjtcblxuICBpbml0aWFsRXZlbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgSW5pdGlhbCh2YWx1ZSwgdHJ1ZSk7XG4gIH07XG5cbiAgbmV4dEV2ZW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IE5leHQodmFsdWUsIHRydWUpO1xuICB9O1xuXG4gIGVuZEV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBFbmQoKTtcbiAgfTtcblxuICB0b0V2ZW50ID0gZnVuY3Rpb24oeCkge1xuICAgIGlmICh4IGluc3RhbmNlb2YgRXZlbnQpIHtcbiAgICAgIHJldHVybiB4O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV4dEV2ZW50KHgpO1xuICAgIH1cbiAgfTtcblxuICBpZENvdW50ZXIgPSAwO1xuXG4gIHJlZ2lzdGVyT2JzID0gZnVuY3Rpb24oKSB7fTtcblxuICBPYnNlcnZhYmxlID0gKGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIE9ic2VydmFibGUoZGVzYzEpIHtcbiAgICAgIHRoaXMuZGVzYyA9IGRlc2MxO1xuICAgICAgdGhpcy5pZCA9ICsraWRDb3VudGVyO1xuICAgICAgdGhpcy5pbml0aWFsRGVzYyA9IHRoaXMuZGVzYztcbiAgICB9XG5cbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5zdWJzY3JpYmUgPSBmdW5jdGlvbihzaW5rKSB7XG4gICAgICByZXR1cm4gVXBkYXRlQmFycmllci53cmFwcGVkU3Vic2NyaWJlKHRoaXMsIHNpbmspO1xuICAgIH07XG5cbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5zdWJzY3JpYmVJbnRlcm5hbCA9IGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHJldHVybiB0aGlzLmRpc3BhdGNoZXIuc3Vic2NyaWJlKHNpbmspO1xuICAgIH07XG5cbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5vblZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZjtcbiAgICAgIGYgPSBtYWtlRnVuY3Rpb25BcmdzKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcy5zdWJzY3JpYmUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50Lmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICByZXR1cm4gZihldmVudC52YWx1ZSgpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE9ic2VydmFibGUucHJvdG90eXBlLm9uVmFsdWVzID0gZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIHRoaXMub25WYWx1ZShmdW5jdGlvbihhcmdzKSB7XG4gICAgICAgIHJldHVybiBmLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIE9ic2VydmFibGUucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmO1xuICAgICAgZiA9IG1ha2VGdW5jdGlvbkFyZ3MoYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuaXNFcnJvcigpKSB7XG4gICAgICAgICAgcmV0dXJuIGYoZXZlbnQuZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUub25FbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBmO1xuICAgICAgZiA9IG1ha2VGdW5jdGlvbkFyZ3MoYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB0aGlzLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICAgIHJldHVybiBmKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBPYnNlcnZhYmxlLnByb3RvdHlwZS5uYW1lID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUud2l0aERlc2NyaXB0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLmRlc2MgPSBkZXNjcmliZS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuICAgIE9ic2VydmFibGUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5fbmFtZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fbmFtZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlc2MudG9TdHJpbmcoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuaW50ZXJuYWxEZXBzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbml0aWFsRGVzYy5kZXBzKCk7XG4gICAgfTtcblxuICAgIHJldHVybiBPYnNlcnZhYmxlO1xuXG4gIH0pKCk7XG5cbiAgT2JzZXJ2YWJsZS5wcm90b3R5cGUuYXNzaWduID0gT2JzZXJ2YWJsZS5wcm90b3R5cGUub25WYWx1ZTtcblxuICBPYnNlcnZhYmxlLnByb3RvdHlwZS5mb3JFYWNoID0gT2JzZXJ2YWJsZS5wcm90b3R5cGUub25WYWx1ZTtcblxuICBPYnNlcnZhYmxlLnByb3RvdHlwZS5pbnNwZWN0ID0gT2JzZXJ2YWJsZS5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgQmFjb24uT2JzZXJ2YWJsZSA9IE9ic2VydmFibGU7XG5cbiAgQ29tcG9zaXRlVW5zdWJzY3JpYmUgPSAoZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gQ29tcG9zaXRlVW5zdWJzY3JpYmUoc3MpIHtcbiAgICAgIHZhciBqLCBsZW4xLCBzO1xuICAgICAgaWYgKHNzID09IG51bGwpIHtcbiAgICAgICAgc3MgPSBbXTtcbiAgICAgIH1cbiAgICAgIHRoaXMudW5zdWJzY3JpYmUgPSBiaW5kKHRoaXMudW5zdWJzY3JpYmUsIHRoaXMpO1xuICAgICAgdGhpcy51bnN1YnNjcmliZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IFtdO1xuICAgICAgdGhpcy5zdGFydGluZyA9IFtdO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHNzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBzID0gc3Nbal07XG4gICAgICAgIHRoaXMuYWRkKHMpO1xuICAgICAgfVxuICAgIH1cblxuICAgIENvbXBvc2l0ZVVuc3Vic2NyaWJlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbihzdWJzY3JpcHRpb24pIHtcbiAgICAgIHZhciBlbmRlZCwgdW5zdWIsIHVuc3ViTWU7XG4gICAgICBpZiAodGhpcy51bnN1YnNjcmliZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZW5kZWQgPSBmYWxzZTtcbiAgICAgIHVuc3ViID0gbm9wO1xuICAgICAgdGhpcy5zdGFydGluZy5wdXNoKHN1YnNjcmlwdGlvbik7XG4gICAgICB1bnN1Yk1lID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoX3RoaXMudW5zdWJzY3JpYmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGVuZGVkID0gdHJ1ZTtcbiAgICAgICAgICBfdGhpcy5yZW1vdmUodW5zdWIpO1xuICAgICAgICAgIHJldHVybiBfLnJlbW92ZShzdWJzY3JpcHRpb24sIF90aGlzLnN0YXJ0aW5nKTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpO1xuICAgICAgdW5zdWIgPSBzdWJzY3JpcHRpb24odGhpcy51bnN1YnNjcmliZSwgdW5zdWJNZSk7XG4gICAgICBpZiAoISh0aGlzLnVuc3Vic2NyaWJlZCB8fCBlbmRlZCkpIHtcbiAgICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLnB1c2godW5zdWIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdW5zdWIoKTtcbiAgICAgIH1cbiAgICAgIF8ucmVtb3ZlKHN1YnNjcmlwdGlvbiwgdGhpcy5zdGFydGluZyk7XG4gICAgICByZXR1cm4gdW5zdWI7XG4gICAgfTtcblxuICAgIENvbXBvc2l0ZVVuc3Vic2NyaWJlLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbih1bnN1Yikge1xuICAgICAgaWYgKHRoaXMudW5zdWJzY3JpYmVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGlmICgoXy5yZW1vdmUodW5zdWIsIHRoaXMuc3Vic2NyaXB0aW9ucykpICE9PSB2b2lkIDApIHtcbiAgICAgICAgcmV0dXJuIHVuc3ViKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIENvbXBvc2l0ZVVuc3Vic2NyaWJlLnByb3RvdHlwZS51bnN1YnNjcmliZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGosIGxlbjEsIHJlZiwgcztcbiAgICAgIGlmICh0aGlzLnVuc3Vic2NyaWJlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLnVuc3Vic2NyaWJlZCA9IHRydWU7XG4gICAgICByZWYgPSB0aGlzLnN1YnNjcmlwdGlvbnM7XG4gICAgICBmb3IgKGogPSAwLCBsZW4xID0gcmVmLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBzID0gcmVmW2pdO1xuICAgICAgICBzKCk7XG4gICAgICB9XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgIHJldHVybiB0aGlzLnN0YXJ0aW5nID0gW107XG4gICAgfTtcblxuICAgIENvbXBvc2l0ZVVuc3Vic2NyaWJlLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudW5zdWJzY3JpYmVkKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaXB0aW9ucy5sZW5ndGggKyB0aGlzLnN0YXJ0aW5nLmxlbmd0aDtcbiAgICB9O1xuXG4gICAgQ29tcG9zaXRlVW5zdWJzY3JpYmUucHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb3VudCgpID09PSAwO1xuICAgIH07XG5cbiAgICByZXR1cm4gQ29tcG9zaXRlVW5zdWJzY3JpYmU7XG5cbiAgfSkoKTtcblxuICBCYWNvbi5Db21wb3NpdGVVbnN1YnNjcmliZSA9IENvbXBvc2l0ZVVuc3Vic2NyaWJlO1xuXG4gIERpc3BhdGNoZXIgPSAoZnVuY3Rpb24oKSB7XG4gICAgRGlzcGF0Y2hlci5wcm90b3R5cGUucHVzaGluZyA9IGZhbHNlO1xuXG4gICAgRGlzcGF0Y2hlci5wcm90b3R5cGUuZW5kZWQgPSBmYWxzZTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnByZXZFcnJvciA9IHZvaWQgMDtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnVuc3ViU3JjID0gdm9pZCAwO1xuXG4gICAgZnVuY3Rpb24gRGlzcGF0Y2hlcihfc3Vic2NyaWJlLCBfaGFuZGxlRXZlbnQpIHtcbiAgICAgIHRoaXMuX3N1YnNjcmliZSA9IF9zdWJzY3JpYmU7XG4gICAgICB0aGlzLl9oYW5kbGVFdmVudCA9IF9oYW5kbGVFdmVudDtcbiAgICAgIHRoaXMuc3Vic2NyaWJlID0gYmluZCh0aGlzLnN1YnNjcmliZSwgdGhpcyk7XG4gICAgICB0aGlzLmhhbmRsZUV2ZW50ID0gYmluZCh0aGlzLmhhbmRsZUV2ZW50LCB0aGlzKTtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IFtdO1xuICAgICAgdGhpcy5xdWV1ZSA9IFtdO1xuICAgIH1cblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLmhhc1N1YnNjcmliZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5zdWJzY3JpcHRpb25zLmxlbmd0aCA+IDA7XG4gICAgfTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnJlbW92ZVN1YiA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMuc3Vic2NyaXB0aW9ucyA9IF8ud2l0aG91dChzdWJzY3JpcHRpb24sIHRoaXMuc3Vic2NyaXB0aW9ucyk7XG4gICAgfTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgdGhpcy5lbmRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gVXBkYXRlQmFycmllci5pblRyYW5zYWN0aW9uKGV2ZW50LCB0aGlzLCB0aGlzLnB1c2hJdCwgW2V2ZW50XSk7XG4gICAgfTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnB1c2hUb1N1YnNjcmlwdGlvbnMgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGUsIGosIGxlbjEsIHJlcGx5LCBzdWIsIHRtcDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRtcCA9IHRoaXMuc3Vic2NyaXB0aW9ucztcbiAgICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHRtcC5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgICBzdWIgPSB0bXBbal07XG4gICAgICAgICAgcmVwbHkgPSBzdWIuc2luayhldmVudCk7XG4gICAgICAgICAgaWYgKHJlcGx5ID09PSBCYWNvbi5ub01vcmUgfHwgZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVTdWIoc3ViKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgZSA9IF9lcnJvcjtcbiAgICAgICAgdGhpcy5wdXNoaW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMucXVldWUgPSBbXTtcbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgRGlzcGF0Y2hlci5wcm90b3R5cGUucHVzaEl0ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmICghdGhpcy5wdXNoaW5nKSB7XG4gICAgICAgIGlmIChldmVudCA9PT0gdGhpcy5wcmV2RXJyb3IpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50LmlzRXJyb3IoKSkge1xuICAgICAgICAgIHRoaXMucHJldkVycm9yID0gZXZlbnQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wdXNoaW5nID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5wdXNoVG9TdWJzY3JpcHRpb25zKGV2ZW50KTtcbiAgICAgICAgdGhpcy5wdXNoaW5nID0gZmFsc2U7XG4gICAgICAgIHdoaWxlICh0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgIGV2ZW50ID0gdGhpcy5xdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgIHRoaXMucHVzaChldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaGFzU3Vic2NyaWJlcnMoKSkge1xuICAgICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMudW5zdWJzY3JpYmVGcm9tU291cmNlKCk7XG4gICAgICAgICAgcmV0dXJuIEJhY29uLm5vTW9yZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKGV2ZW50KTtcbiAgICAgICAgcmV0dXJuIEJhY29uLm1vcmU7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmICh0aGlzLl9oYW5kbGVFdmVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFuZGxlRXZlbnQoZXZlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnVuc3Vic2NyaWJlRnJvbVNvdXJjZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMudW5zdWJTcmMpIHtcbiAgICAgICAgdGhpcy51bnN1YlNyYygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMudW5zdWJTcmMgPSB2b2lkIDA7XG4gICAgfTtcblxuICAgIERpc3BhdGNoZXIucHJvdG90eXBlLnN1YnNjcmliZSA9IGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHZhciBzdWJzY3JpcHRpb247XG4gICAgICBpZiAodGhpcy5lbmRlZCkge1xuICAgICAgICBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgICByZXR1cm4gbm9wO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXNzZXJ0RnVuY3Rpb24oc2luayk7XG4gICAgICAgIHN1YnNjcmlwdGlvbiA9IHtcbiAgICAgICAgICBzaW5rOiBzaW5rXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1YnNjcmlwdGlvbik7XG4gICAgICAgIGlmICh0aGlzLnN1YnNjcmlwdGlvbnMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgdGhpcy51bnN1YlNyYyA9IHRoaXMuX3N1YnNjcmliZSh0aGlzLmhhbmRsZUV2ZW50KTtcbiAgICAgICAgICBhc3NlcnRGdW5jdGlvbih0aGlzLnVuc3ViU3JjKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgX3RoaXMucmVtb3ZlU3ViKHN1YnNjcmlwdGlvbik7XG4gICAgICAgICAgICBpZiAoIV90aGlzLmhhc1N1YnNjcmliZXJzKCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIF90aGlzLnVuc3Vic2NyaWJlRnJvbVNvdXJjZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH07XG4gICAgICAgIH0pKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gRGlzcGF0Y2hlcjtcblxuICB9KSgpO1xuXG4gIEJhY29uLkRpc3BhdGNoZXIgPSBEaXNwYXRjaGVyO1xuXG4gIEV2ZW50U3RyZWFtID0gKGZ1bmN0aW9uKHN1cGVyQ2xhc3MpIHtcbiAgICBleHRlbmQoRXZlbnRTdHJlYW0sIHN1cGVyQ2xhc3MpO1xuXG4gICAgZnVuY3Rpb24gRXZlbnRTdHJlYW0oZGVzYywgc3Vic2NyaWJlLCBoYW5kbGVyKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKGRlc2MpKSB7XG4gICAgICAgIGhhbmRsZXIgPSBzdWJzY3JpYmU7XG4gICAgICAgIHN1YnNjcmliZSA9IGRlc2M7XG4gICAgICAgIGRlc2MgPSBEZXNjLmVtcHR5O1xuICAgICAgfVxuICAgICAgRXZlbnRTdHJlYW0uX19zdXBlcl9fLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgZGVzYyk7XG4gICAgICBhc3NlcnRGdW5jdGlvbihzdWJzY3JpYmUpO1xuICAgICAgdGhpcy5kaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoc3Vic2NyaWJlLCBoYW5kbGVyKTtcbiAgICAgIHJlZ2lzdGVyT2JzKHRoaXMpO1xuICAgIH1cblxuICAgIEV2ZW50U3RyZWFtLnByb3RvdHlwZS50b1Byb3BlcnR5ID0gZnVuY3Rpb24oaW5pdFZhbHVlXykge1xuICAgICAgdmFyIGRpc3AsIGluaXRWYWx1ZTtcbiAgICAgIGluaXRWYWx1ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDAgPyBOb25lIDogdG9PcHRpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBpbml0VmFsdWVfO1xuICAgICAgfSk7XG4gICAgICBkaXNwID0gdGhpcy5kaXNwYXRjaGVyO1xuICAgICAgcmV0dXJuIG5ldyBQcm9wZXJ0eShuZXcgQmFjb24uRGVzYyh0aGlzLCBcInRvUHJvcGVydHlcIiwgW2luaXRWYWx1ZV9dKSwgZnVuY3Rpb24oc2luaykge1xuICAgICAgICB2YXIgaW5pdFNlbnQsIHJlcGx5LCBzZW5kSW5pdCwgdW5zdWI7XG4gICAgICAgIGluaXRTZW50ID0gZmFsc2U7XG4gICAgICAgIHVuc3ViID0gbm9wO1xuICAgICAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgICAgIHNlbmRJbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFpbml0U2VudCkge1xuICAgICAgICAgICAgcmV0dXJuIGluaXRWYWx1ZS5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgIGluaXRTZW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcmVwbHkgPSBzaW5rKG5ldyBJbml0aWFsKHZhbHVlKSk7XG4gICAgICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgICAgdW5zdWIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5zdWIgPSBub3A7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdW5zdWIgPSBkaXNwLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGlmIChldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBpZiAoaW5pdFNlbnQgJiYgZXZlbnQuaXNJbml0aWFsKCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIEJhY29uLm1vcmU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoIWV2ZW50LmlzSW5pdGlhbCgpKSB7XG4gICAgICAgICAgICAgICAgc2VuZEluaXQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpbml0U2VudCA9IHRydWU7XG4gICAgICAgICAgICAgIGluaXRWYWx1ZSA9IG5ldyBTb21lKGV2ZW50KTtcbiAgICAgICAgICAgICAgcmV0dXJuIHNpbmsoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICAgICAgICByZXBseSA9IHNlbmRJbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVwbHkgIT09IEJhY29uLm5vTW9yZSkge1xuICAgICAgICAgICAgICByZXR1cm4gc2luayhldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc2VuZEluaXQoKTtcbiAgICAgICAgcmV0dXJuIHVuc3ViO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIEV2ZW50U3RyZWFtLnByb3RvdHlwZS50b0V2ZW50U3RyZWFtID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgRXZlbnRTdHJlYW0ucHJvdG90eXBlLndpdGhIYW5kbGVyID0gZnVuY3Rpb24oaGFuZGxlcikge1xuICAgICAgcmV0dXJuIG5ldyBFdmVudFN0cmVhbShuZXcgQmFjb24uRGVzYyh0aGlzLCBcIndpdGhIYW5kbGVyXCIsIFtoYW5kbGVyXSksIHRoaXMuZGlzcGF0Y2hlci5zdWJzY3JpYmUsIGhhbmRsZXIpO1xuICAgIH07XG5cbiAgICByZXR1cm4gRXZlbnRTdHJlYW07XG5cbiAgfSkoT2JzZXJ2YWJsZSk7XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0gPSBFdmVudFN0cmVhbTtcblxuICBCYWNvbi5uZXZlciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0oZGVzY3JpYmUoQmFjb24sIFwibmV2ZXJcIiksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICByZXR1cm4gbm9wO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLndoZW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZiwgaSwgaW5kZXgsIGl4LCBqLCBrLCBsZW4sIGxlbjEsIGxlbjIsIG5lZWRzQmFycmllciwgcGF0LCBwYXRTb3VyY2VzLCBwYXRzLCBwYXR0ZXJucywgcmVmLCByZXN1bHRTdHJlYW0sIHMsIHNvdXJjZXMsIHRyaWdnZXJGb3VuZCwgdXNhZ2U7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBCYWNvbi5uZXZlcigpO1xuICAgIH1cbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHVzYWdlID0gXCJ3aGVuOiBleHBlY3RpbmcgYXJndW1lbnRzIGluIHRoZSBmb3JtIChPYnNlcnZhYmxlKyxmdW5jdGlvbikrXCI7XG4gICAgYXNzZXJ0KHVzYWdlLCBsZW4gJSAyID09PSAwKTtcbiAgICBzb3VyY2VzID0gW107XG4gICAgcGF0cyA9IFtdO1xuICAgIGkgPSAwO1xuICAgIHBhdHRlcm5zID0gW107XG4gICAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICAgIHBhdHRlcm5zW2ldID0gYXJndW1lbnRzW2ldO1xuICAgICAgcGF0dGVybnNbaSArIDFdID0gYXJndW1lbnRzW2kgKyAxXTtcbiAgICAgIHBhdFNvdXJjZXMgPSBfLnRvQXJyYXkoYXJndW1lbnRzW2ldKTtcbiAgICAgIGYgPSBjb25zdGFudFRvRnVuY3Rpb24oYXJndW1lbnRzW2kgKyAxXSk7XG4gICAgICBwYXQgPSB7XG4gICAgICAgIGY6IGYsXG4gICAgICAgIGl4czogW11cbiAgICAgIH07XG4gICAgICB0cmlnZ2VyRm91bmQgPSBmYWxzZTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBwYXRTb3VyY2VzLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBzID0gcGF0U291cmNlc1tqXTtcbiAgICAgICAgaW5kZXggPSBfLmluZGV4T2Yoc291cmNlcywgcyk7XG4gICAgICAgIGlmICghdHJpZ2dlckZvdW5kKSB7XG4gICAgICAgICAgdHJpZ2dlckZvdW5kID0gU291cmNlLmlzVHJpZ2dlcihzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5kZXggPCAwKSB7XG4gICAgICAgICAgc291cmNlcy5wdXNoKHMpO1xuICAgICAgICAgIGluZGV4ID0gc291cmNlcy5sZW5ndGggLSAxO1xuICAgICAgICB9XG4gICAgICAgIHJlZiA9IHBhdC5peHM7XG4gICAgICAgIGZvciAoayA9IDAsIGxlbjIgPSByZWYubGVuZ3RoOyBrIDwgbGVuMjsgaysrKSB7XG4gICAgICAgICAgaXggPSByZWZba107XG4gICAgICAgICAgaWYgKGl4LmluZGV4ID09PSBpbmRleCkge1xuICAgICAgICAgICAgaXguY291bnQrKztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcGF0Lml4cy5wdXNoKHtcbiAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgY291bnQ6IDFcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBhc3NlcnQoXCJBdCBsZWFzdCBvbmUgRXZlbnRTdHJlYW0gcmVxdWlyZWRcIiwgdHJpZ2dlckZvdW5kIHx8ICghcGF0U291cmNlcy5sZW5ndGgpKTtcbiAgICAgIGlmIChwYXRTb3VyY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcGF0cy5wdXNoKHBhdCk7XG4gICAgICB9XG4gICAgICBpID0gaSArIDI7XG4gICAgfVxuICAgIGlmICghc291cmNlcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBCYWNvbi5uZXZlcigpO1xuICAgIH1cbiAgICBzb3VyY2VzID0gXy5tYXAoU291cmNlLmZyb21PYnNlcnZhYmxlLCBzb3VyY2VzKTtcbiAgICBuZWVkc0JhcnJpZXIgPSAoXy5hbnkoc291cmNlcywgZnVuY3Rpb24ocykge1xuICAgICAgcmV0dXJuIHMuZmxhdHRlbjtcbiAgICB9KSkgJiYgKGNvbnRhaW5zRHVwbGljYXRlRGVwcyhfLm1hcCgoZnVuY3Rpb24ocykge1xuICAgICAgcmV0dXJuIHMub2JzO1xuICAgIH0pLCBzb3VyY2VzKSkpO1xuICAgIHJldHVybiByZXN1bHRTdHJlYW0gPSBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2MoQmFjb24sIFwid2hlblwiLCBwYXR0ZXJucyksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHZhciBjYW5ub3RNYXRjaCwgY2Fubm90U3luYywgZW5kcywgbWF0Y2gsIG5vbkZsYXR0ZW5lZCwgcGFydCwgdHJpZ2dlcnM7XG4gICAgICB0cmlnZ2VycyA9IFtdO1xuICAgICAgZW5kcyA9IGZhbHNlO1xuICAgICAgbWF0Y2ggPSBmdW5jdGlvbihwKSB7XG4gICAgICAgIHZhciBsLCBsZW4zLCByZWYxO1xuICAgICAgICByZWYxID0gcC5peHM7XG4gICAgICAgIGZvciAobCA9IDAsIGxlbjMgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjM7IGwrKykge1xuICAgICAgICAgIGkgPSByZWYxW2xdO1xuICAgICAgICAgIGlmICghc291cmNlc1tpLmluZGV4XS5oYXNBdExlYXN0KGkuY291bnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfTtcbiAgICAgIGNhbm5vdFN5bmMgPSBmdW5jdGlvbihzb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuICFzb3VyY2Uuc3luYyB8fCBzb3VyY2UuZW5kZWQ7XG4gICAgICB9O1xuICAgICAgY2Fubm90TWF0Y2ggPSBmdW5jdGlvbihwKSB7XG4gICAgICAgIHZhciBsLCBsZW4zLCByZWYxO1xuICAgICAgICByZWYxID0gcC5peHM7XG4gICAgICAgIGZvciAobCA9IDAsIGxlbjMgPSByZWYxLmxlbmd0aDsgbCA8IGxlbjM7IGwrKykge1xuICAgICAgICAgIGkgPSByZWYxW2xdO1xuICAgICAgICAgIGlmICghc291cmNlc1tpLmluZGV4XS5tYXlIYXZlKGkuY291bnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBub25GbGF0dGVuZWQgPSBmdW5jdGlvbih0cmlnZ2VyKSB7XG4gICAgICAgIHJldHVybiAhdHJpZ2dlci5zb3VyY2UuZmxhdHRlbjtcbiAgICAgIH07XG4gICAgICBwYXJ0ID0gZnVuY3Rpb24oc291cmNlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbih1bnN1YkFsbCkge1xuICAgICAgICAgIHZhciBmbHVzaCwgZmx1c2hMYXRlciwgZmx1c2hXaGlsZVRyaWdnZXJzO1xuICAgICAgICAgIGZsdXNoTGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBVcGRhdGVCYXJyaWVyLndoZW5Eb25lV2l0aChyZXN1bHRTdHJlYW0sIGZsdXNoKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIGZsdXNoV2hpbGVUcmlnZ2VycyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGV2ZW50cywgbCwgbGVuMywgcCwgcmVwbHksIHRyaWdnZXI7XG4gICAgICAgICAgICBpZiAodHJpZ2dlcnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgICAgICAgICAgIHRyaWdnZXIgPSB0cmlnZ2Vycy5wb3AoKTtcbiAgICAgICAgICAgICAgZm9yIChsID0gMCwgbGVuMyA9IHBhdHMubGVuZ3RoOyBsIDwgbGVuMzsgbCsrKSB7XG4gICAgICAgICAgICAgICAgcCA9IHBhdHNbbF07XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoKHApKSB7XG4gICAgICAgICAgICAgICAgICBldmVudHMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBsZW40LCBtLCByZWYxLCByZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICByZWYxID0gcC5peHM7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgZm9yIChtID0gMCwgbGVuNCA9IHJlZjEubGVuZ3RoOyBtIDwgbGVuNDsgbSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgaSA9IHJlZjFbbV07XG4gICAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHNvdXJjZXNbaS5pbmRleF0uY29uc3VtZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgICAgICAgICAgICAgIH0pKCk7XG4gICAgICAgICAgICAgICAgICByZXBseSA9IHNpbmsodHJpZ2dlci5lLmFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnQsIHZhbHVlcztcbiAgICAgICAgICAgICAgICAgICAgdmFsdWVzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgIHZhciBsZW40LCBtLCByZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICBmb3IgKG0gPSAwLCBsZW40ID0gZXZlbnRzLmxlbmd0aDsgbSA8IGxlbjQ7IG0rKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQgPSBldmVudHNbbV07XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goZXZlbnQudmFsdWUoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgICAgICAgICB9KSgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcC5mLmFwcGx5KHAsIHZhbHVlcyk7XG4gICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICBpZiAodHJpZ2dlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyaWdnZXJzID0gXy5maWx0ZXIobm9uRmxhdHRlbmVkLCB0cmlnZ2Vycyk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpZiAocmVwbHkgPT09IEJhY29uLm5vTW9yZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmx1c2hXaGlsZVRyaWdnZXJzKCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4gQmFjb24ubW9yZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9O1xuICAgICAgICAgIGZsdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgcmVwbHk7XG4gICAgICAgICAgICByZXBseSA9IGZsdXNoV2hpbGVUcmlnZ2VycygpO1xuICAgICAgICAgICAgaWYgKGVuZHMpIHtcbiAgICAgICAgICAgICAgaWYgKF8uYWxsKHNvdXJjZXMsIGNhbm5vdFN5bmMpIHx8IF8uYWxsKHBhdHMsIGNhbm5vdE1hdGNoKSkge1xuICAgICAgICAgICAgICAgIHJlcGx5ID0gQmFjb24ubm9Nb3JlO1xuICAgICAgICAgICAgICAgIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgIHVuc3ViQWxsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm4gc291cmNlLnN1YnNjcmliZShmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB2YXIgcmVwbHk7XG4gICAgICAgICAgICBpZiAoZS5pc0VuZCgpKSB7XG4gICAgICAgICAgICAgIGVuZHMgPSB0cnVlO1xuICAgICAgICAgICAgICBzb3VyY2UubWFya0VuZGVkKCk7XG4gICAgICAgICAgICAgIGZsdXNoTGF0ZXIoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS5pc0Vycm9yKCkpIHtcbiAgICAgICAgICAgICAgcmVwbHkgPSBzaW5rKGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc291cmNlLnB1c2goZSk7XG4gICAgICAgICAgICAgIGlmIChzb3VyY2Uuc3luYykge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICAgICAgICAgICAgICBlOiBlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKG5lZWRzQmFycmllciB8fCBVcGRhdGVCYXJyaWVyLmhhc1dhaXRlcnMoKSkge1xuICAgICAgICAgICAgICAgICAgZmx1c2hMYXRlcigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlcGx5ID09PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgICAgICAgdW5zdWJBbGwoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXBseSB8fCBCYWNvbi5tb3JlO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgICAgfTtcbiAgICAgIHJldHVybiBuZXcgQmFjb24uQ29tcG9zaXRlVW5zdWJzY3JpYmUoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbCwgbGVuMywgcmVzdWx0cztcbiAgICAgICAgcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKGwgPSAwLCBsZW4zID0gc291cmNlcy5sZW5ndGg7IGwgPCBsZW4zOyBsKyspIHtcbiAgICAgICAgICBzID0gc291cmNlc1tsXTtcbiAgICAgICAgICByZXN1bHRzLnB1c2gocGFydChzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgICB9KSgpKS51bnN1YnNjcmliZTtcbiAgICB9KTtcbiAgfTtcblxuICBjb250YWluc0R1cGxpY2F0ZURlcHMgPSBmdW5jdGlvbihvYnNlcnZhYmxlcywgc3RhdGUpIHtcbiAgICB2YXIgY2hlY2tPYnNlcnZhYmxlO1xuICAgIGlmIChzdGF0ZSA9PSBudWxsKSB7XG4gICAgICBzdGF0ZSA9IFtdO1xuICAgIH1cbiAgICBjaGVja09ic2VydmFibGUgPSBmdW5jdGlvbihvYnMpIHtcbiAgICAgIHZhciBkZXBzO1xuICAgICAgaWYgKF8uY29udGFpbnMoc3RhdGUsIG9icykpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkZXBzID0gb2JzLmludGVybmFsRGVwcygpO1xuICAgICAgICBpZiAoZGVwcy5sZW5ndGgpIHtcbiAgICAgICAgICBzdGF0ZS5wdXNoKG9icyk7XG4gICAgICAgICAgcmV0dXJuIF8uYW55KGRlcHMsIGNoZWNrT2JzZXJ2YWJsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3RhdGUucHVzaChvYnMpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIF8uYW55KG9ic2VydmFibGVzLCBjaGVja09ic2VydmFibGUpO1xuICB9O1xuXG4gIGNvbnN0YW50VG9GdW5jdGlvbiA9IGZ1bmN0aW9uKGYpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGYpKSB7XG4gICAgICByZXR1cm4gZjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIF8uYWx3YXlzKGYpO1xuICAgIH1cbiAgfTtcblxuICBCYWNvbi5ncm91cFNpbXVsdGFuZW91cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzLCBzb3VyY2VzLCBzdHJlYW1zO1xuICAgIHN0cmVhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICBpZiAoc3RyZWFtcy5sZW5ndGggPT09IDEgJiYgaXNBcnJheShzdHJlYW1zWzBdKSkge1xuICAgICAgc3RyZWFtcyA9IHN0cmVhbXNbMF07XG4gICAgfVxuICAgIHNvdXJjZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaiwgbGVuMSwgcmVzdWx0cztcbiAgICAgIHJlc3VsdHMgPSBbXTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBzdHJlYW1zLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICBzID0gc3RyZWFtc1tqXTtcbiAgICAgICAgcmVzdWx0cy5wdXNoKG5ldyBCdWZmZXJpbmdTb3VyY2UocykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gICAgfSkoKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiZ3JvdXBTaW11bHRhbmVvdXNcIiwgc3RyZWFtcyksIEJhY29uLndoZW4oc291cmNlcywgKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHhzO1xuICAgICAgeHMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIHJldHVybiB4cztcbiAgICB9KSkpO1xuICB9O1xuXG4gIFByb3BlcnR5RGlzcGF0Y2hlciA9IChmdW5jdGlvbihzdXBlckNsYXNzKSB7XG4gICAgZXh0ZW5kKFByb3BlcnR5RGlzcGF0Y2hlciwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBQcm9wZXJ0eURpc3BhdGNoZXIocHJvcGVydHkxLCBzdWJzY3JpYmUsIGhhbmRsZUV2ZW50KSB7XG4gICAgICB0aGlzLnByb3BlcnR5ID0gcHJvcGVydHkxO1xuICAgICAgdGhpcy5zdWJzY3JpYmUgPSBiaW5kKHRoaXMuc3Vic2NyaWJlLCB0aGlzKTtcbiAgICAgIFByb3BlcnR5RGlzcGF0Y2hlci5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBzdWJzY3JpYmUsIGhhbmRsZUV2ZW50KTtcbiAgICAgIHRoaXMuY3VycmVudCA9IE5vbmU7XG4gICAgICB0aGlzLmN1cnJlbnRWYWx1ZVJvb3RJZCA9IHZvaWQgMDtcbiAgICAgIHRoaXMucHJvcGVydHlFbmRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIFByb3BlcnR5RGlzcGF0Y2hlci5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICB0aGlzLnByb3BlcnR5RW5kZWQgPSB0cnVlO1xuICAgICAgfVxuICAgICAgaWYgKGV2ZW50Lmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3IFNvbWUoZXZlbnQpO1xuICAgICAgICB0aGlzLmN1cnJlbnRWYWx1ZVJvb3RJZCA9IFVwZGF0ZUJhcnJpZXIuY3VycmVudEV2ZW50SWQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBQcm9wZXJ0eURpc3BhdGNoZXIuX19zdXBlcl9fLnB1c2guY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcblxuICAgIFByb3BlcnR5RGlzcGF0Y2hlci5wcm90b3R5cGUubWF5YmVTdWJTb3VyY2UgPSBmdW5jdGlvbihzaW5rLCByZXBseSkge1xuICAgICAgaWYgKHJlcGx5ID09PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgcmV0dXJuIG5vcDtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5wcm9wZXJ0eUVuZGVkKSB7XG4gICAgICAgIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICAgIHJldHVybiBub3A7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gRGlzcGF0Y2hlci5wcm90b3R5cGUuc3Vic2NyaWJlLmNhbGwodGhpcywgc2luayk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIFByb3BlcnR5RGlzcGF0Y2hlci5wcm90b3R5cGUuc3Vic2NyaWJlID0gZnVuY3Rpb24oc2luaykge1xuICAgICAgdmFyIGRpc3BhdGNoaW5nSWQsIGluaXRTZW50LCByZXBseSwgdmFsSWQ7XG4gICAgICBpbml0U2VudCA9IGZhbHNlO1xuICAgICAgcmVwbHkgPSBCYWNvbi5tb3JlO1xuICAgICAgaWYgKHRoaXMuY3VycmVudC5pc0RlZmluZWQgJiYgKHRoaXMuaGFzU3Vic2NyaWJlcnMoKSB8fCB0aGlzLnByb3BlcnR5RW5kZWQpKSB7XG4gICAgICAgIGRpc3BhdGNoaW5nSWQgPSBVcGRhdGVCYXJyaWVyLmN1cnJlbnRFdmVudElkKCk7XG4gICAgICAgIHZhbElkID0gdGhpcy5jdXJyZW50VmFsdWVSb290SWQ7XG4gICAgICAgIGlmICghdGhpcy5wcm9wZXJ0eUVuZGVkICYmIHZhbElkICYmIGRpc3BhdGNoaW5nSWQgJiYgZGlzcGF0Y2hpbmdJZCAhPT0gdmFsSWQpIHtcbiAgICAgICAgICBVcGRhdGVCYXJyaWVyLndoZW5Eb25lV2l0aCh0aGlzLnByb3BlcnR5LCAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgaWYgKF90aGlzLmN1cnJlbnRWYWx1ZVJvb3RJZCA9PT0gdmFsSWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2luayhpbml0aWFsRXZlbnQoX3RoaXMuY3VycmVudC5nZXQoKS52YWx1ZSgpKSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpO1xuICAgICAgICAgIHJldHVybiB0aGlzLm1heWJlU3ViU291cmNlKHNpbmssIHJlcGx5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBVcGRhdGVCYXJyaWVyLmluVHJhbnNhY3Rpb24odm9pZCAwLCB0aGlzLCAoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVwbHkgPSBzaW5rKGluaXRpYWxFdmVudCh0aGlzLmN1cnJlbnQuZ2V0KCkudmFsdWUoKSkpO1xuICAgICAgICAgIH0pLCBbXSk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubWF5YmVTdWJTb3VyY2Uoc2luaywgcmVwbHkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXliZVN1YlNvdXJjZShzaW5rLCByZXBseSk7XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBQcm9wZXJ0eURpc3BhdGNoZXI7XG5cbiAgfSkoRGlzcGF0Y2hlcik7XG5cbiAgUHJvcGVydHkgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChQcm9wZXJ0eSwgc3VwZXJDbGFzcyk7XG5cbiAgICBmdW5jdGlvbiBQcm9wZXJ0eShkZXNjLCBzdWJzY3JpYmUsIGhhbmRsZXIpIHtcbiAgICAgIFByb3BlcnR5Ll9fc3VwZXJfXy5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIGRlc2MpO1xuICAgICAgYXNzZXJ0RnVuY3Rpb24oc3Vic2NyaWJlKTtcbiAgICAgIHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBQcm9wZXJ0eURpc3BhdGNoZXIodGhpcywgc3Vic2NyaWJlLCBoYW5kbGVyKTtcbiAgICAgIHJlZ2lzdGVyT2JzKHRoaXMpO1xuICAgIH1cblxuICAgIFByb3BlcnR5LnByb3RvdHlwZS5jaGFuZ2VzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IEV2ZW50U3RyZWFtKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiY2hhbmdlc1wiLCBbXSksIChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2luaykge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5kaXNwYXRjaGVyLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKCFldmVudC5pc0luaXRpYWwoKSkge1xuICAgICAgICAgICAgICByZXR1cm4gc2luayhldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKSk7XG4gICAgfTtcblxuICAgIFByb3BlcnR5LnByb3RvdHlwZS53aXRoSGFuZGxlciA9IGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvcGVydHkobmV3IEJhY29uLkRlc2ModGhpcywgXCJ3aXRoSGFuZGxlclwiLCBbaGFuZGxlcl0pLCB0aGlzLmRpc3BhdGNoZXIuc3Vic2NyaWJlLCBoYW5kbGVyKTtcbiAgICB9O1xuXG4gICAgUHJvcGVydHkucHJvdG90eXBlLnRvUHJvcGVydHkgPSBmdW5jdGlvbigpIHtcbiAgICAgIGFzc2VydE5vQXJndW1lbnRzKGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9O1xuXG4gICAgUHJvcGVydHkucHJvdG90eXBlLnRvRXZlbnRTdHJlYW0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2ModGhpcywgXCJ0b0V2ZW50U3RyZWFtXCIsIFtdKSwgKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihzaW5rKSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNJbml0aWFsKCkpIHtcbiAgICAgICAgICAgICAgZXZlbnQgPSBldmVudC50b05leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzaW5rKGV2ZW50KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgIH0pKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIFByb3BlcnR5O1xuXG4gIH0pKE9ic2VydmFibGUpO1xuXG4gIEJhY29uLlByb3BlcnR5ID0gUHJvcGVydHk7XG5cbiAgQmFjb24uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBuZXcgUHJvcGVydHkobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiY29uc3RhbnRcIiwgW3ZhbHVlXSksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHNpbmsoaW5pdGlhbEV2ZW50KHZhbHVlKSk7XG4gICAgICBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgcmV0dXJuIG5vcDtcbiAgICB9KTtcbiAgfTtcblxuICBCYWNvbi5mcm9tQmluZGVyID0gZnVuY3Rpb24oYmluZGVyLCBldmVudFRyYW5zZm9ybWVyKSB7XG4gICAgaWYgKGV2ZW50VHJhbnNmb3JtZXIgPT0gbnVsbCkge1xuICAgICAgZXZlbnRUcmFuc2Zvcm1lciA9IF8uaWQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2MoQmFjb24sIFwiZnJvbUJpbmRlclwiLCBbYmluZGVyLCBldmVudFRyYW5zZm9ybWVyXSksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHZhciBzaG91bGRVbmJpbmQsIHVuYmluZCwgdW5iaW5kZXIsIHVuYm91bmQ7XG4gICAgICB1bmJvdW5kID0gZmFsc2U7XG4gICAgICBzaG91bGRVbmJpbmQgPSBmYWxzZTtcbiAgICAgIHVuYmluZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXVuYm91bmQpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIHVuYmluZGVyICE9PSBcInVuZGVmaW5lZFwiICYmIHVuYmluZGVyICE9PSBudWxsKSB7XG4gICAgICAgICAgICB1bmJpbmRlcigpO1xuICAgICAgICAgICAgcmV0dXJuIHVuYm91bmQgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2hvdWxkVW5iaW5kID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICB1bmJpbmRlciA9IGJpbmRlcihmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MsIGV2ZW50LCBqLCBsZW4xLCByZXBseSwgdmFsdWU7XG4gICAgICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgICAgdmFsdWUgPSBldmVudFRyYW5zZm9ybWVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICBpZiAoIShpc0FycmF5KHZhbHVlKSAmJiBfLmxhc3QodmFsdWUpIGluc3RhbmNlb2YgRXZlbnQpKSB7XG4gICAgICAgICAgdmFsdWUgPSBbdmFsdWVdO1xuICAgICAgICB9XG4gICAgICAgIHJlcGx5ID0gQmFjb24ubW9yZTtcbiAgICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHZhbHVlLmxlbmd0aDsgaiA8IGxlbjE7IGorKykge1xuICAgICAgICAgIGV2ZW50ID0gdmFsdWVbal07XG4gICAgICAgICAgcmVwbHkgPSBzaW5rKGV2ZW50ID0gdG9FdmVudChldmVudCkpO1xuICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlIHx8IGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICAgIHVuYmluZCgpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcGx5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICB9KTtcbiAgICAgIGlmIChzaG91bGRVbmJpbmQpIHtcbiAgICAgICAgdW5iaW5kKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdW5iaW5kO1xuICAgIH0pO1xuICB9O1xuXG4gIGV2ZW50TWV0aG9kcyA9IFtbXCJhZGRFdmVudExpc3RlbmVyXCIsIFwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiXSwgW1wiYWRkTGlzdGVuZXJcIiwgXCJyZW1vdmVMaXN0ZW5lclwiXSwgW1wib25cIiwgXCJvZmZcIl0sIFtcImJpbmRcIiwgXCJ1bmJpbmRcIl1dO1xuXG4gIGZpbmRIYW5kbGVyTWV0aG9kcyA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHZhciBqLCBsZW4xLCBtZXRob2RQYWlyLCBwYWlyO1xuICAgIGZvciAoaiA9IDAsIGxlbjEgPSBldmVudE1ldGhvZHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICBwYWlyID0gZXZlbnRNZXRob2RzW2pdO1xuICAgICAgbWV0aG9kUGFpciA9IFt0YXJnZXRbcGFpclswXV0sIHRhcmdldFtwYWlyWzFdXV07XG4gICAgICBpZiAobWV0aG9kUGFpclswXSAmJiBtZXRob2RQYWlyWzFdKSB7XG4gICAgICAgIHJldHVybiBtZXRob2RQYWlyO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBzdWl0YWJsZSBldmVudCBtZXRob2RzIGluIFwiICsgdGFyZ2V0KTtcbiAgfTtcblxuICBCYWNvbi5mcm9tRXZlbnRUYXJnZXQgPSBmdW5jdGlvbih0YXJnZXQsIGV2ZW50TmFtZSwgZXZlbnRUcmFuc2Zvcm1lcikge1xuICAgIHZhciByZWYsIHN1YiwgdW5zdWI7XG4gICAgcmVmID0gZmluZEhhbmRsZXJNZXRob2RzKHRhcmdldCksIHN1YiA9IHJlZlswXSwgdW5zdWIgPSByZWZbMV07XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcImZyb21FdmVudFwiLCBbdGFyZ2V0LCBldmVudE5hbWVdKSwgQmFjb24uZnJvbUJpbmRlcihmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICBzdWIuY2FsbCh0YXJnZXQsIGV2ZW50TmFtZSwgaGFuZGxlcik7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB1bnN1Yi5jYWxsKHRhcmdldCwgZXZlbnROYW1lLCBoYW5kbGVyKTtcbiAgICAgIH07XG4gICAgfSwgZXZlbnRUcmFuc2Zvcm1lcikpO1xuICB9O1xuXG4gIEJhY29uLmZyb21FdmVudCA9IEJhY29uLmZyb21FdmVudFRhcmdldDtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgcDtcbiAgICBwID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgcmV0dXJuIGNvbnZlcnRBcmdzVG9GdW5jdGlvbih0aGlzLCBwLCBhcmdzLCBmdW5jdGlvbihmKSB7XG4gICAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJtYXBcIiwgW2ZdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50LmZtYXAoZikpO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLmNvbWJpbmVBc0FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGluZGV4LCBqLCBsZW4xLCBzLCBzb3VyY2VzLCBzdHJlYW0sIHN0cmVhbXM7XG4gICAgc3RyZWFtcyA9IDEgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAwKSA6IFtdO1xuICAgIGlmIChzdHJlYW1zLmxlbmd0aCA9PT0gMSAmJiBpc0FycmF5KHN0cmVhbXNbMF0pKSB7XG4gICAgICBzdHJlYW1zID0gc3RyZWFtc1swXTtcbiAgICB9XG4gICAgZm9yIChpbmRleCA9IGogPSAwLCBsZW4xID0gc3RyZWFtcy5sZW5ndGg7IGogPCBsZW4xOyBpbmRleCA9ICsraikge1xuICAgICAgc3RyZWFtID0gc3RyZWFtc1tpbmRleF07XG4gICAgICBpZiAoIShpc09ic2VydmFibGUoc3RyZWFtKSkpIHtcbiAgICAgICAgc3RyZWFtc1tpbmRleF0gPSBCYWNvbi5jb25zdGFudChzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgIHNvdXJjZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBrLCBsZW4yLCByZXN1bHRzO1xuICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoayA9IDAsIGxlbjIgPSBzdHJlYW1zLmxlbmd0aDsgayA8IGxlbjI7IGsrKykge1xuICAgICAgICAgIHMgPSBzdHJlYW1zW2tdO1xuICAgICAgICAgIHJlc3VsdHMucHVzaChuZXcgU291cmNlKHMsIHRydWUpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVzdWx0cztcbiAgICAgIH0pKCk7XG4gICAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiY29tYmluZUFzQXJyYXlcIiwgc3RyZWFtcyksIEJhY29uLndoZW4oc291cmNlcywgKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeHM7XG4gICAgICAgIHhzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgICAgIHJldHVybiB4cztcbiAgICAgIH0pKS50b1Byb3BlcnR5KCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gQmFjb24uY29uc3RhbnQoW10pO1xuICAgIH1cbiAgfTtcblxuICBCYWNvbi5vblZhbHVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmLCBqLCBzdHJlYW1zO1xuICAgIHN0cmVhbXMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCwgaiA9IGFyZ3VtZW50cy5sZW5ndGggLSAxKSA6IChqID0gMCwgW10pLCBmID0gYXJndW1lbnRzW2orK107XG4gICAgcmV0dXJuIEJhY29uLmNvbWJpbmVBc0FycmF5KHN0cmVhbXMpLm9uVmFsdWVzKGYpO1xuICB9O1xuXG4gIEJhY29uLmNvbWJpbmVXaXRoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGYsIHN0cmVhbXM7XG4gICAgZiA9IGFyZ3VtZW50c1swXSwgc3RyZWFtcyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJjb21iaW5lV2l0aFwiLCBbZl0uY29uY2F0KHNsaWNlLmNhbGwoc3RyZWFtcykpKSwgQmFjb24uY29tYmluZUFzQXJyYXkoc3RyZWFtcykubWFwKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgcmV0dXJuIGYuYXBwbHkobnVsbCwgdmFsdWVzKTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuY29tYmluZSA9IGZ1bmN0aW9uKG90aGVyLCBmKSB7XG4gICAgdmFyIGNvbWJpbmF0b3I7XG4gICAgY29tYmluYXRvciA9IHRvQ29tYmluYXRvcihmKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJjb21iaW5lXCIsIFtvdGhlciwgZl0pLCBCYWNvbi5jb21iaW5lQXNBcnJheSh0aGlzLCBvdGhlcikubWFwKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgcmV0dXJuIGNvbWJpbmF0b3IodmFsdWVzWzBdLCB2YWx1ZXNbMV0pO1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS53aXRoU3RhdGVNYWNoaW5lID0gZnVuY3Rpb24oaW5pdFN0YXRlLCBmKSB7XG4gICAgdmFyIHN0YXRlO1xuICAgIHN0YXRlID0gaW5pdFN0YXRlO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcIndpdGhTdGF0ZU1hY2hpbmVcIiwgW2luaXRTdGF0ZSwgZl0pLCB0aGlzLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICB2YXIgZnJvbUYsIGosIGxlbjEsIG5ld1N0YXRlLCBvdXRwdXQsIG91dHB1dHMsIHJlcGx5O1xuICAgICAgZnJvbUYgPSBmKHN0YXRlLCBldmVudCk7XG4gICAgICBuZXdTdGF0ZSA9IGZyb21GWzBdLCBvdXRwdXRzID0gZnJvbUZbMV07XG4gICAgICBzdGF0ZSA9IG5ld1N0YXRlO1xuICAgICAgcmVwbHkgPSBCYWNvbi5tb3JlO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IG91dHB1dHMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgIG91dHB1dCA9IG91dHB1dHNbal07XG4gICAgICAgIHJlcGx5ID0gdGhpcy5wdXNoKG91dHB1dCk7XG4gICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVwbHk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLnNraXBEdXBsaWNhdGVzID0gZnVuY3Rpb24oaXNFcXVhbCkge1xuICAgIGlmIChpc0VxdWFsID09IG51bGwpIHtcbiAgICAgIGlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhID09PSBiO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwic2tpcER1cGxpY2F0ZXNcIiwgW10pLCB0aGlzLndpdGhTdGF0ZU1hY2hpbmUoTm9uZSwgZnVuY3Rpb24ocHJldiwgZXZlbnQpIHtcbiAgICAgIGlmICghZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICByZXR1cm4gW3ByZXYsIFtldmVudF1dO1xuICAgICAgfSBlbHNlIGlmIChldmVudC5pc0luaXRpYWwoKSB8fCBwcmV2ID09PSBOb25lIHx8ICFpc0VxdWFsKHByZXYuZ2V0KCksIGV2ZW50LnZhbHVlKCkpKSB7XG4gICAgICAgIHJldHVybiBbbmV3IFNvbWUoZXZlbnQudmFsdWUoKSksIFtldmVudF1dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtwcmV2LCBbXV07XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmF3YWl0aW5nID0gZnVuY3Rpb24ob3RoZXIpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJhd2FpdGluZ1wiLCBbb3RoZXJdKSwgQmFjb24uZ3JvdXBTaW11bHRhbmVvdXModGhpcywgb3RoZXIpLm1hcChmdW5jdGlvbihhcmcpIHtcbiAgICAgIHZhciBteVZhbHVlcywgb3RoZXJWYWx1ZXM7XG4gICAgICBteVZhbHVlcyA9IGFyZ1swXSwgb3RoZXJWYWx1ZXMgPSBhcmdbMV07XG4gICAgICByZXR1cm4gb3RoZXJWYWx1ZXMubGVuZ3RoID09PSAwO1xuICAgIH0pLnRvUHJvcGVydHkoZmFsc2UpLnNraXBEdXBsaWNhdGVzKCkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLm5vdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcIm5vdFwiLCBbXSksIHRoaXMubWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiAheDtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uUHJvcGVydHkucHJvdG90eXBlLmFuZCA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYW5kXCIsIFtvdGhlcl0pLCB0aGlzLmNvbWJpbmUob3RoZXIsIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHJldHVybiB4ICYmIHk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLlByb3BlcnR5LnByb3RvdHlwZS5vciA9IGZ1bmN0aW9uKG90aGVyKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwib3JcIiwgW290aGVyXSksIHRoaXMuY29tYmluZShvdGhlciwgZnVuY3Rpb24oeCwgeSkge1xuICAgICAgcmV0dXJuIHggfHwgeTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uc2NoZWR1bGVyID0ge1xuICAgIHNldFRpbWVvdXQ6IGZ1bmN0aW9uKGYsIGQpIHtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KGYsIGQpO1xuICAgIH0sXG4gICAgc2V0SW50ZXJ2YWw6IGZ1bmN0aW9uKGYsIGkpIHtcbiAgICAgIHJldHVybiBzZXRJbnRlcnZhbChmLCBpKTtcbiAgICB9LFxuICAgIGNsZWFySW50ZXJ2YWw6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gY2xlYXJJbnRlcnZhbChpZCk7XG4gICAgfSxcbiAgICBjbGVhclRpbWVvdXQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KGlkKTtcbiAgICB9LFxuICAgIG5vdzogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5idWZmZXJXaXRoVGltZSA9IGZ1bmN0aW9uKGRlbGF5KSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYnVmZmVyV2l0aFRpbWVcIiwgW2RlbGF5XSksIHRoaXMuYnVmZmVyV2l0aFRpbWVPckNvdW50KGRlbGF5LCBOdW1iZXIuTUFYX1ZBTFVFKSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLmJ1ZmZlcldpdGhDb3VudCA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYnVmZmVyV2l0aENvdW50XCIsIFtjb3VudF0pLCB0aGlzLmJ1ZmZlcldpdGhUaW1lT3JDb3VudCh2b2lkIDAsIGNvdW50KSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLmJ1ZmZlcldpdGhUaW1lT3JDb3VudCA9IGZ1bmN0aW9uKGRlbGF5LCBjb3VudCkge1xuICAgIHZhciBmbHVzaE9yU2NoZWR1bGU7XG4gICAgZmx1c2hPclNjaGVkdWxlID0gZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICBpZiAoYnVmZmVyLnZhbHVlcy5sZW5ndGggPT09IGNvdW50KSB7XG4gICAgICAgIHJldHVybiBidWZmZXIuZmx1c2goKTtcbiAgICAgIH0gZWxzZSBpZiAoZGVsYXkgIT09IHZvaWQgMCkge1xuICAgICAgICByZXR1cm4gYnVmZmVyLnNjaGVkdWxlKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJidWZmZXJXaXRoVGltZU9yQ291bnRcIiwgW2RlbGF5LCBjb3VudF0pLCB0aGlzLmJ1ZmZlcihkZWxheSwgZmx1c2hPclNjaGVkdWxlLCBmbHVzaE9yU2NoZWR1bGUpKTtcbiAgfTtcblxuICBCYWNvbi5FdmVudFN0cmVhbS5wcm90b3R5cGUuYnVmZmVyID0gZnVuY3Rpb24oZGVsYXksIG9uSW5wdXQsIG9uRmx1c2gpIHtcbiAgICB2YXIgYnVmZmVyLCBkZWxheU1zLCByZXBseTtcbiAgICBpZiAob25JbnB1dCA9PSBudWxsKSB7XG4gICAgICBvbklucHV0ID0gbm9wO1xuICAgIH1cbiAgICBpZiAob25GbHVzaCA9PSBudWxsKSB7XG4gICAgICBvbkZsdXNoID0gbm9wO1xuICAgIH1cbiAgICBidWZmZXIgPSB7XG4gICAgICBzY2hlZHVsZWQ6IG51bGwsXG4gICAgICBlbmQ6IHZvaWQgMCxcbiAgICAgIHZhbHVlczogW10sXG4gICAgICBmbHVzaDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZXBseSwgdmFsdWVzVG9QdXNoO1xuICAgICAgICBpZiAodGhpcy5zY2hlZHVsZWQpIHtcbiAgICAgICAgICBCYWNvbi5zY2hlZHVsZXIuY2xlYXJUaW1lb3V0KHRoaXMuc2NoZWR1bGVkKTtcbiAgICAgICAgICB0aGlzLnNjaGVkdWxlZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudmFsdWVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICB2YWx1ZXNUb1B1c2ggPSB0aGlzLnZhbHVlcztcbiAgICAgICAgICB0aGlzLnZhbHVlcyA9IFtdO1xuICAgICAgICAgIHJlcGx5ID0gdGhpcy5wdXNoKG5leHRFdmVudCh2YWx1ZXNUb1B1c2gpKTtcbiAgICAgICAgICBpZiAodGhpcy5lbmQgIT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVzaCh0aGlzLmVuZCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChyZXBseSAhPT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICByZXR1cm4gb25GbHVzaCh0aGlzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHRoaXMuZW5kICE9IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnB1c2godGhpcy5lbmQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHNjaGVkdWxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNjaGVkdWxlZCkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnNjaGVkdWxlZCA9IGRlbGF5KChmdW5jdGlvbihfdGhpcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICByZXR1cm4gX3RoaXMuZmx1c2goKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSkodGhpcykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZGVsYXkpKSB7XG4gICAgICBkZWxheU1zID0gZGVsYXk7XG4gICAgICBkZWxheSA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgcmV0dXJuIEJhY29uLnNjaGVkdWxlci5zZXRUaW1lb3V0KGYsIGRlbGF5TXMpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYnVmZmVyXCIsIFtdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgYnVmZmVyLnB1c2ggPSAoZnVuY3Rpb24oX3RoaXMpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIF90aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgfSkodGhpcyk7XG4gICAgICBpZiAoZXZlbnQuaXNFcnJvcigpKSB7XG4gICAgICAgIHJlcGx5ID0gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgIH0gZWxzZSBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICBidWZmZXIuZW5kID0gZXZlbnQ7XG4gICAgICAgIGlmICghYnVmZmVyLnNjaGVkdWxlZCkge1xuICAgICAgICAgIGJ1ZmZlci5mbHVzaCgpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBidWZmZXIudmFsdWVzLnB1c2goZXZlbnQudmFsdWUoKSk7XG4gICAgICAgIG9uSW5wdXQoYnVmZmVyKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXBseTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZmlsdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGY7XG4gICAgZiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGFzc2VydE9ic2VydmFibGVJc1Byb3BlcnR5KGYpO1xuICAgIHJldHVybiBjb252ZXJ0QXJnc1RvRnVuY3Rpb24odGhpcywgZiwgYXJncywgZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZmlsdGVyXCIsIFtmXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmZpbHRlcihmKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH07XG5cbiAgQmFjb24ub25jZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBFdmVudFN0cmVhbShuZXcgRGVzYyhCYWNvbiwgXCJvbmNlXCIsIFt2YWx1ZV0pLCBmdW5jdGlvbihzaW5rKSB7XG4gICAgICBzaW5rKHRvRXZlbnQodmFsdWUpKTtcbiAgICAgIHNpbmsoZW5kRXZlbnQoKSk7XG4gICAgICByZXR1cm4gbm9wO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5jb25jYXQgPSBmdW5jdGlvbihyaWdodCkge1xuICAgIHZhciBsZWZ0O1xuICAgIGxlZnQgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2MobGVmdCwgXCJjb25jYXRcIiwgW3JpZ2h0XSksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHZhciB1bnN1YkxlZnQsIHVuc3ViUmlnaHQ7XG4gICAgICB1bnN1YlJpZ2h0ID0gbm9wO1xuICAgICAgdW5zdWJMZWZ0ID0gbGVmdC5kaXNwYXRjaGVyLnN1YnNjcmliZShmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLmlzRW5kKCkpIHtcbiAgICAgICAgICByZXR1cm4gdW5zdWJSaWdodCA9IHJpZ2h0LmRpc3BhdGNoZXIuc3Vic2NyaWJlKHNpbmspO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzaW5rKGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdW5zdWJMZWZ0KCk7XG4gICAgICAgIHJldHVybiB1bnN1YlJpZ2h0KCk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmxhdE1hcF8odGhpcywgbWFrZVNwYXduZXIoYXJndW1lbnRzKSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZmxhdE1hcEZpcnN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZsYXRNYXBfKHRoaXMsIG1ha2VTcGF3bmVyKGFyZ3VtZW50cyksIHRydWUpO1xuICB9O1xuXG4gIGZsYXRNYXBfID0gZnVuY3Rpb24ocm9vdCwgZiwgZmlyc3RPbmx5LCBsaW1pdCkge1xuICAgIHZhciBjaGlsZERlcHMsIHJlc3VsdCwgcm9vdERlcDtcbiAgICByb290RGVwID0gW3Jvb3RdO1xuICAgIGNoaWxkRGVwcyA9IFtdO1xuICAgIHJlc3VsdCA9IG5ldyBFdmVudFN0cmVhbShuZXcgQmFjb24uRGVzYyhyb290LCBcImZsYXRNYXBcIiArIChmaXJzdE9ubHkgPyBcIkZpcnN0XCIgOiBcIlwiKSwgW2ZdKSwgZnVuY3Rpb24oc2luaykge1xuICAgICAgdmFyIGNoZWNrRW5kLCBjaGVja1F1ZXVlLCBjb21wb3NpdGUsIHF1ZXVlLCBzcGF3bjtcbiAgICAgIGNvbXBvc2l0ZSA9IG5ldyBDb21wb3NpdGVVbnN1YnNjcmliZSgpO1xuICAgICAgcXVldWUgPSBbXTtcbiAgICAgIHNwYXduID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdmFyIGNoaWxkO1xuICAgICAgICBjaGlsZCA9IG1ha2VPYnNlcnZhYmxlKGYoZXZlbnQudmFsdWUoKSkpO1xuICAgICAgICBjaGlsZERlcHMucHVzaChjaGlsZCk7XG4gICAgICAgIHJldHVybiBjb21wb3NpdGUuYWRkKGZ1bmN0aW9uKHVuc3ViQWxsLCB1bnN1Yk1lKSB7XG4gICAgICAgICAgcmV0dXJuIGNoaWxkLmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgcmVwbHk7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICAgICAgICBfLnJlbW92ZShjaGlsZCwgY2hpbGREZXBzKTtcbiAgICAgICAgICAgICAgY2hlY2tRdWV1ZSgpO1xuICAgICAgICAgICAgICBjaGVja0VuZCh1bnN1Yk1lKTtcbiAgICAgICAgICAgICAgcmV0dXJuIEJhY29uLm5vTW9yZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChldmVudCBpbnN0YW5jZW9mIEluaXRpYWwpIHtcbiAgICAgICAgICAgICAgICBldmVudCA9IGV2ZW50LnRvTmV4dCgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJlcGx5ID0gc2luayhldmVudCk7XG4gICAgICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgICAgdW5zdWJBbGwoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfTtcbiAgICAgIGNoZWNrUXVldWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50O1xuICAgICAgICBldmVudCA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgIHJldHVybiBzcGF3bihldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBjaGVja0VuZCA9IGZ1bmN0aW9uKHVuc3ViKSB7XG4gICAgICAgIHVuc3ViKCk7XG4gICAgICAgIGlmIChjb21wb3NpdGUuZW1wdHkoKSkge1xuICAgICAgICAgIHJldHVybiBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29tcG9zaXRlLmFkZChmdW5jdGlvbihfXywgdW5zdWJSb290KSB7XG4gICAgICAgIHJldHVybiByb290LmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGVja0VuZCh1bnN1YlJvb3QpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuaXNFcnJvcigpKSB7XG4gICAgICAgICAgICByZXR1cm4gc2luayhldmVudCk7XG4gICAgICAgICAgfSBlbHNlIGlmIChmaXJzdE9ubHkgJiYgY29tcG9zaXRlLmNvdW50KCkgPiAxKSB7XG4gICAgICAgICAgICByZXR1cm4gQmFjb24ubW9yZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvbXBvc2l0ZS51bnN1YnNjcmliZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIEJhY29uLm5vTW9yZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBjb21wb3NpdGUuY291bnQoKSA+IGxpbWl0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBxdWV1ZS5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiBzcGF3bihldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGNvbXBvc2l0ZS51bnN1YnNjcmliZTtcbiAgICB9KTtcbiAgICByZXN1bHQuaW50ZXJuYWxEZXBzID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoY2hpbGREZXBzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gcm9vdERlcC5jb25jYXQoY2hpbGREZXBzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiByb290RGVwO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICBtYWtlU3Bhd25lciA9IGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDEgJiYgaXNPYnNlcnZhYmxlKGFyZ3NbMF0pKSB7XG4gICAgICByZXR1cm4gXy5hbHdheXMoYXJnc1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYWtlRnVuY3Rpb25BcmdzKGFyZ3MpO1xuICAgIH1cbiAgfTtcblxuICBtYWtlT2JzZXJ2YWJsZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICBpZiAoaXNPYnNlcnZhYmxlKHgpKSB7XG4gICAgICByZXR1cm4geDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEJhY29uLm9uY2UoeCk7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmZsYXRNYXBXaXRoQ29uY3VycmVuY3lMaW1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBsaW1pdDtcbiAgICBsaW1pdCA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImZsYXRNYXBXaXRoQ29uY3VycmVuY3lMaW1pdFwiLCBbbGltaXRdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3MpKSksIGZsYXRNYXBfKHRoaXMsIG1ha2VTcGF3bmVyKGFyZ3MpLCBmYWxzZSwgbGltaXQpKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5mbGF0TWFwQ29uY2F0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZmxhdE1hcENvbmNhdFwiLCBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDApKSwgdGhpcy5mbGF0TWFwV2l0aENvbmN1cnJlbmN5TGltaXQuYXBwbHkodGhpcywgWzFdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKSk7XG4gIH07XG5cbiAgQmFjb24ubGF0ZXIgPSBmdW5jdGlvbihkZWxheSwgdmFsdWUpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwibGF0ZXJcIiwgW2RlbGF5LCB2YWx1ZV0pLCBCYWNvbi5mcm9tQmluZGVyKGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgIHZhciBpZCwgc2VuZGVyO1xuICAgICAgc2VuZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBzaW5rKFt2YWx1ZSwgZW5kRXZlbnQoKV0pO1xuICAgICAgfTtcbiAgICAgIGlkID0gQmFjb24uc2NoZWR1bGVyLnNldFRpbWVvdXQoc2VuZGVyLCBkZWxheSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBCYWNvbi5zY2hlZHVsZXIuY2xlYXJUaW1lb3V0KGlkKTtcbiAgICAgIH07XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmJ1ZmZlcmluZ1Rocm90dGxlID0gZnVuY3Rpb24obWluaW11bUludGVydmFsKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiYnVmZmVyaW5nVGhyb3R0bGVcIiwgW21pbmltdW1JbnRlcnZhbF0pLCB0aGlzLmZsYXRNYXBDb25jYXQoZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIEJhY29uLm9uY2UoeCkuY29uY2F0KEJhY29uLmxhdGVyKG1pbmltdW1JbnRlcnZhbCkuZmlsdGVyKGZhbHNlKSk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLlByb3BlcnR5LnByb3RvdHlwZS5idWZmZXJpbmdUaHJvdHRsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5idWZmZXJpbmdUaHJvdHRsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLnRvUHJvcGVydHkoKTtcbiAgfTtcblxuICBCdXMgPSAoZnVuY3Rpb24oc3VwZXJDbGFzcykge1xuICAgIGV4dGVuZChCdXMsIHN1cGVyQ2xhc3MpO1xuXG4gICAgZnVuY3Rpb24gQnVzKCkge1xuICAgICAgdGhpcy5ndWFyZGVkU2luayA9IGJpbmQodGhpcy5ndWFyZGVkU2luaywgdGhpcyk7XG4gICAgICB0aGlzLnN1YnNjcmliZUFsbCA9IGJpbmQodGhpcy5zdWJzY3JpYmVBbGwsIHRoaXMpO1xuICAgICAgdGhpcy51bnN1YkFsbCA9IGJpbmQodGhpcy51bnN1YkFsbCwgdGhpcyk7XG4gICAgICB0aGlzLnNpbmsgPSB2b2lkIDA7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBbXTtcbiAgICAgIHRoaXMuZW5kZWQgPSBmYWxzZTtcbiAgICAgIEJ1cy5fX3N1cGVyX18uY29uc3RydWN0b3IuY2FsbCh0aGlzLCBuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJCdXNcIiwgW10pLCB0aGlzLnN1YnNjcmliZUFsbCk7XG4gICAgfVxuXG4gICAgQnVzLnByb3RvdHlwZS51bnN1YkFsbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGosIGxlbjEsIHJlZiwgc3ViO1xuICAgICAgcmVmID0gdGhpcy5zdWJzY3JpcHRpb25zO1xuICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHJlZi5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgc3ViID0gcmVmW2pdO1xuICAgICAgICBpZiAodHlwZW9mIHN1Yi51bnN1YiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgc3ViLnVuc3ViKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2b2lkIDA7XG4gICAgfTtcblxuICAgIEJ1cy5wcm90b3R5cGUuc3Vic2NyaWJlQWxsID0gZnVuY3Rpb24obmV3U2luaykge1xuICAgICAgdmFyIGosIGxlbjEsIHJlZiwgc3Vic2NyaXB0aW9uO1xuICAgICAgaWYgKHRoaXMuZW5kZWQpIHtcbiAgICAgICAgbmV3U2luayhlbmRFdmVudCgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuc2luayA9IG5ld1Npbms7XG4gICAgICAgIHJlZiA9IGNsb25lQXJyYXkodGhpcy5zdWJzY3JpcHRpb25zKTtcbiAgICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHJlZi5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgICBzdWJzY3JpcHRpb24gPSByZWZbal07XG4gICAgICAgICAgdGhpcy5zdWJzY3JpYmVJbnB1dChzdWJzY3JpcHRpb24pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy51bnN1YkFsbDtcbiAgICB9O1xuXG4gICAgQnVzLnByb3RvdHlwZS5ndWFyZGVkU2luayA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIGlmIChldmVudC5pc0VuZCgpKSB7XG4gICAgICAgICAgICBfdGhpcy51bnN1YnNjcmliZUlucHV0KGlucHV0KTtcbiAgICAgICAgICAgIHJldHVybiBCYWNvbi5ub01vcmU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBfdGhpcy5zaW5rKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgQnVzLnByb3RvdHlwZS5zdWJzY3JpYmVJbnB1dCA9IGZ1bmN0aW9uKHN1YnNjcmlwdGlvbikge1xuICAgICAgcmV0dXJuIHN1YnNjcmlwdGlvbi51bnN1YiA9IHN1YnNjcmlwdGlvbi5pbnB1dC5kaXNwYXRjaGVyLnN1YnNjcmliZSh0aGlzLmd1YXJkZWRTaW5rKHN1YnNjcmlwdGlvbi5pbnB1dCkpO1xuICAgIH07XG5cbiAgICBCdXMucHJvdG90eXBlLnVuc3Vic2NyaWJlSW5wdXQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgdmFyIGksIGosIGxlbjEsIHJlZiwgc3ViO1xuICAgICAgcmVmID0gdGhpcy5zdWJzY3JpcHRpb25zO1xuICAgICAgZm9yIChpID0gaiA9IDAsIGxlbjEgPSByZWYubGVuZ3RoOyBqIDwgbGVuMTsgaSA9ICsraikge1xuICAgICAgICBzdWIgPSByZWZbaV07XG4gICAgICAgIGlmIChzdWIuaW5wdXQgPT09IGlucHV0KSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBzdWIudW5zdWIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgc3ViLnVuc3ViKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIEJ1cy5wcm90b3R5cGUucGx1ZyA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICB2YXIgc3ViO1xuICAgICAgYXNzZXJ0T2JzZXJ2YWJsZShpbnB1dCk7XG4gICAgICBpZiAodGhpcy5lbmRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBzdWIgPSB7XG4gICAgICAgIGlucHV0OiBpbnB1dFxuICAgICAgfTtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5wdXNoKHN1Yik7XG4gICAgICBpZiAoKHRoaXMuc2luayAhPSBudWxsKSkge1xuICAgICAgICB0aGlzLnN1YnNjcmliZUlucHV0KHN1Yik7XG4gICAgICB9XG4gICAgICByZXR1cm4gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gX3RoaXMudW5zdWJzY3JpYmVJbnB1dChpbnB1dCk7XG4gICAgICAgIH07XG4gICAgICB9KSh0aGlzKTtcbiAgICB9O1xuXG4gICAgQnVzLnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuZW5kZWQgPSB0cnVlO1xuICAgICAgdGhpcy51bnN1YkFsbCgpO1xuICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLnNpbmsgPT09IFwiZnVuY3Rpb25cIiA/IHRoaXMuc2luayhlbmRFdmVudCgpKSA6IHZvaWQgMDtcbiAgICB9O1xuXG4gICAgQnVzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghdGhpcy5lbmRlZCkge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuc2luayA9PT0gXCJmdW5jdGlvblwiID8gdGhpcy5zaW5rKG5leHRFdmVudCh2YWx1ZSkpIDogdm9pZCAwO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBCdXMucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5zaW5rID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzLnNpbmsobmV3IEVycm9yKGVycm9yKSkgOiB2b2lkIDA7XG4gICAgfTtcblxuICAgIHJldHVybiBCdXM7XG5cbiAgfSkoRXZlbnRTdHJlYW0pO1xuXG4gIEJhY29uLkJ1cyA9IEJ1cztcblxuICBsaWZ0Q2FsbGJhY2sgPSBmdW5jdGlvbihkZXNjLCB3cmFwcGVkKSB7XG4gICAgcmV0dXJuIHdpdGhNZXRob2RDYWxsU3VwcG9ydChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmdzLCBmLCBzdHJlYW07XG4gICAgICBmID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgICBzdHJlYW0gPSBwYXJ0aWFsbHlBcHBsaWVkKHdyYXBwZWQsIFtcbiAgICAgICAgZnVuY3Rpb24odmFsdWVzLCBjYWxsYmFjaykge1xuICAgICAgICAgIHJldHVybiBmLmFwcGx5KG51bGwsIHNsaWNlLmNhbGwodmFsdWVzKS5jb25jYXQoW2NhbGxiYWNrXSkpO1xuICAgICAgICB9XG4gICAgICBdKTtcbiAgICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgZGVzYywgW2ZdLmNvbmNhdChzbGljZS5jYWxsKGFyZ3MpKSksIEJhY29uLmNvbWJpbmVBc0FycmF5KGFyZ3MpLmZsYXRNYXAoc3RyZWFtKSk7XG4gICAgfSk7XG4gIH07XG5cbiAgQmFjb24uZnJvbUNhbGxiYWNrID0gbGlmdENhbGxiYWNrKFwiZnJvbUNhbGxiYWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBmO1xuICAgIGYgPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICByZXR1cm4gQmFjb24uZnJvbUJpbmRlcihmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICBtYWtlRnVuY3Rpb24oZiwgYXJncykoaGFuZGxlcik7XG4gICAgICByZXR1cm4gbm9wO1xuICAgIH0sIChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIFt2YWx1ZSwgZW5kRXZlbnQoKV07XG4gICAgfSkpO1xuICB9KTtcblxuICBCYWNvbi5mcm9tTm9kZUNhbGxiYWNrID0gbGlmdENhbGxiYWNrKFwiZnJvbU5vZGVDYWxsYmFja1wiLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgZjtcbiAgICBmID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgcmV0dXJuIEJhY29uLmZyb21CaW5kZXIoZnVuY3Rpb24oaGFuZGxlcikge1xuICAgICAgbWFrZUZ1bmN0aW9uKGYsIGFyZ3MpKGhhbmRsZXIpO1xuICAgICAgcmV0dXJuIG5vcDtcbiAgICB9LCBmdW5jdGlvbihlcnJvciwgdmFsdWUpIHtcbiAgICAgIGlmIChlcnJvcikge1xuICAgICAgICByZXR1cm4gW25ldyBFcnJvcihlcnJvciksIGVuZEV2ZW50KCldO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFt2YWx1ZSwgZW5kRXZlbnQoKV07XG4gICAgfSk7XG4gIH0pO1xuXG4gIEJhY29uLmNvbWJpbmVUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgdmFyIGFwcGx5U3RyZWFtVmFsdWUsIGNvbWJpbmF0b3IsIGNvbXBpbGUsIGNvbXBpbGVUZW1wbGF0ZSwgY29uc3RhbnRWYWx1ZSwgY3VycmVudCwgZnVuY3MsIG1rQ29udGV4dCwgcHVzaENvbnRleHQsIHNldFZhbHVlLCBzdHJlYW1zO1xuICAgIGZ1bmNzID0gW107XG4gICAgc3RyZWFtcyA9IFtdO1xuICAgIGN1cnJlbnQgPSBmdW5jdGlvbihjdHhTdGFjaykge1xuICAgICAgcmV0dXJuIGN0eFN0YWNrW2N0eFN0YWNrLmxlbmd0aCAtIDFdO1xuICAgIH07XG4gICAgc2V0VmFsdWUgPSBmdW5jdGlvbihjdHhTdGFjaywga2V5LCB2YWx1ZSkge1xuICAgICAgcmV0dXJuIGN1cnJlbnQoY3R4U3RhY2spW2tleV0gPSB2YWx1ZTtcbiAgICB9O1xuICAgIGFwcGx5U3RyZWFtVmFsdWUgPSBmdW5jdGlvbihrZXksIGluZGV4KSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oY3R4U3RhY2ssIHZhbHVlcykge1xuICAgICAgICByZXR1cm4gc2V0VmFsdWUoY3R4U3RhY2ssIGtleSwgdmFsdWVzW2luZGV4XSk7XG4gICAgICB9O1xuICAgIH07XG4gICAgY29uc3RhbnRWYWx1ZSA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihjdHhTdGFjaykge1xuICAgICAgICByZXR1cm4gc2V0VmFsdWUoY3R4U3RhY2ssIGtleSwgdmFsdWUpO1xuICAgICAgfTtcbiAgICB9O1xuICAgIG1rQ29udGV4dCA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgICBpZiAoaXNBcnJheSh0ZW1wbGF0ZSkpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgfVxuICAgIH07XG4gICAgcHVzaENvbnRleHQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oY3R4U3RhY2spIHtcbiAgICAgICAgdmFyIG5ld0NvbnRleHQ7XG4gICAgICAgIG5ld0NvbnRleHQgPSBta0NvbnRleHQodmFsdWUpO1xuICAgICAgICBzZXRWYWx1ZShjdHhTdGFjaywga2V5LCBuZXdDb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGN0eFN0YWNrLnB1c2gobmV3Q29udGV4dCk7XG4gICAgICB9O1xuICAgIH07XG4gICAgY29tcGlsZSA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIHZhciBwb3BDb250ZXh0O1xuICAgICAgaWYgKGlzT2JzZXJ2YWJsZSh2YWx1ZSkpIHtcbiAgICAgICAgc3RyZWFtcy5wdXNoKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGZ1bmNzLnB1c2goYXBwbHlTdHJlYW1WYWx1ZShrZXksIHN0cmVhbXMubGVuZ3RoIC0gMSkpO1xuICAgICAgfSBlbHNlIGlmICh2YWx1ZSA9PT0gT2JqZWN0KHZhbHVlKSAmJiB0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIiAmJiAhKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSAmJiAhKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgcG9wQ29udGV4dCA9IGZ1bmN0aW9uKGN0eFN0YWNrKSB7XG4gICAgICAgICAgcmV0dXJuIGN0eFN0YWNrLnBvcCgpO1xuICAgICAgICB9O1xuICAgICAgICBmdW5jcy5wdXNoKHB1c2hDb250ZXh0KGtleSwgdmFsdWUpKTtcbiAgICAgICAgY29tcGlsZVRlbXBsYXRlKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuIGZ1bmNzLnB1c2gocG9wQ29udGV4dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZnVuY3MucHVzaChjb25zdGFudFZhbHVlKGtleSwgdmFsdWUpKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIGNvbXBpbGVUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gXy5lYWNoKHRlbXBsYXRlLCBjb21waWxlKTtcbiAgICB9O1xuICAgIGNvbXBpbGVUZW1wbGF0ZSh0ZW1wbGF0ZSk7XG4gICAgY29tYmluYXRvciA9IGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgdmFyIGN0eFN0YWNrLCBmLCBqLCBsZW4xLCByb290Q29udGV4dDtcbiAgICAgIHJvb3RDb250ZXh0ID0gbWtDb250ZXh0KHRlbXBsYXRlKTtcbiAgICAgIGN0eFN0YWNrID0gW3Jvb3RDb250ZXh0XTtcbiAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSBmdW5jcy5sZW5ndGg7IGogPCBsZW4xOyBqKyspIHtcbiAgICAgICAgZiA9IGZ1bmNzW2pdO1xuICAgICAgICBmKGN0eFN0YWNrLCB2YWx1ZXMpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJvb3RDb250ZXh0O1xuICAgIH07XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcImNvbWJpbmVUZW1wbGF0ZVwiLCBbdGVtcGxhdGVdKSwgQmFjb24uY29tYmluZUFzQXJyYXkoc3RyZWFtcykubWFwKGNvbWJpbmF0b3IpKTtcbiAgfTtcblxuICBhZGRQcm9wZXJ0eUluaXRWYWx1ZVRvU3RyZWFtID0gZnVuY3Rpb24ocHJvcGVydHksIHN0cmVhbSkge1xuICAgIHZhciBqdXN0SW5pdFZhbHVlO1xuICAgIGp1c3RJbml0VmFsdWUgPSBuZXcgRXZlbnRTdHJlYW0oZGVzY3JpYmUocHJvcGVydHksIFwianVzdEluaXRWYWx1ZVwiKSwgZnVuY3Rpb24oc2luaykge1xuICAgICAgdmFyIHVuc3ViLCB2YWx1ZTtcbiAgICAgIHZhbHVlID0gdm9pZCAwO1xuICAgICAgdW5zdWIgPSBwcm9wZXJ0eS5kaXNwYXRjaGVyLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICBpZiAoIWV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICB2YWx1ZSA9IGV2ZW50O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBCYWNvbi5ub01vcmU7XG4gICAgICB9KTtcbiAgICAgIFVwZGF0ZUJhcnJpZXIud2hlbkRvbmVXaXRoKGp1c3RJbml0VmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgICAgICAgIHNpbmsodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gdW5zdWI7XG4gICAgfSk7XG4gICAgcmV0dXJuIGp1c3RJbml0VmFsdWUuY29uY2F0KHN0cmVhbSkudG9Qcm9wZXJ0eSgpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLm1hcEVuZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmO1xuICAgIGYgPSBtYWtlRnVuY3Rpb25BcmdzKGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwibWFwRW5kXCIsIFtmXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5pc0VuZCgpKSB7XG4gICAgICAgIHRoaXMucHVzaChuZXh0RXZlbnQoZihldmVudCkpKTtcbiAgICAgICAgdGhpcy5wdXNoKGVuZEV2ZW50KCkpO1xuICAgICAgICByZXR1cm4gQmFjb24ubm9Nb3JlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLnNraXBFcnJvcnMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJza2lwRXJyb3JzXCIsIFtdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LmlzRXJyb3IoKSkge1xuICAgICAgICByZXR1cm4gQmFjb24ubW9yZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5FdmVudFN0cmVhbS5wcm90b3R5cGUudGFrZVVudGlsID0gZnVuY3Rpb24oc3RvcHBlcikge1xuICAgIHZhciBlbmRNYXJrZXI7XG4gICAgZW5kTWFya2VyID0ge307XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwidGFrZVVudGlsXCIsIFtzdG9wcGVyXSksIEJhY29uLmdyb3VwU2ltdWx0YW5lb3VzKHRoaXMubWFwRW5kKGVuZE1hcmtlciksIHN0b3BwZXIuc2tpcEVycm9ycygpKS53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIGRhdGEsIGosIGxlbjEsIHJlZiwgcmVwbHksIHZhbHVlO1xuICAgICAgaWYgKCFldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVmID0gZXZlbnQudmFsdWUoKSwgZGF0YSA9IHJlZlswXSwgc3RvcHBlciA9IHJlZlsxXTtcbiAgICAgICAgaWYgKHN0b3BwZXIubGVuZ3RoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChlbmRFdmVudCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgICAgICAgZm9yIChqID0gMCwgbGVuMSA9IGRhdGEubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IGRhdGFbal07XG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IGVuZE1hcmtlcikge1xuICAgICAgICAgICAgICByZXBseSA9IHRoaXMucHVzaChlbmRFdmVudCgpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJlcGx5ID0gdGhpcy5wdXNoKG5leHRFdmVudCh2YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uUHJvcGVydHkucHJvdG90eXBlLnRha2VVbnRpbCA9IGZ1bmN0aW9uKHN0b3BwZXIpIHtcbiAgICB2YXIgY2hhbmdlcztcbiAgICBjaGFuZ2VzID0gdGhpcy5jaGFuZ2VzKCkudGFrZVVudGlsKHN0b3BwZXIpO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInRha2VVbnRpbFwiLCBbc3RvcHBlcl0pLCBhZGRQcm9wZXJ0eUluaXRWYWx1ZVRvU3RyZWFtKHRoaXMsIGNoYW5nZXMpKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5mbGF0TWFwTGF0ZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGYsIHN0cmVhbTtcbiAgICBmID0gbWFrZVNwYXduZXIoYXJndW1lbnRzKTtcbiAgICBzdHJlYW0gPSB0aGlzLnRvRXZlbnRTdHJlYW0oKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJmbGF0TWFwTGF0ZXN0XCIsIFtmXSksIHN0cmVhbS5mbGF0TWFwKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gbWFrZU9ic2VydmFibGUoZih2YWx1ZSkpLnRha2VVbnRpbChzdHJlYW0pO1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5Qcm9wZXJ0eS5wcm90b3R5cGUuZGVsYXlDaGFuZ2VzID0gZnVuY3Rpb24oZGVzYywgZikge1xuICAgIHJldHVybiB3aXRoRGVzYyhkZXNjLCBhZGRQcm9wZXJ0eUluaXRWYWx1ZVRvU3RyZWFtKHRoaXMsIGYodGhpcy5jaGFuZ2VzKCkpKSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24oZGVsYXkpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJkZWxheVwiLCBbZGVsYXldKSwgdGhpcy5mbGF0TWFwKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gQmFjb24ubGF0ZXIoZGVsYXksIHZhbHVlKTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uUHJvcGVydHkucHJvdG90eXBlLmRlbGF5ID0gZnVuY3Rpb24oZGVsYXkpIHtcbiAgICByZXR1cm4gdGhpcy5kZWxheUNoYW5nZXMobmV3IEJhY29uLkRlc2ModGhpcywgXCJkZWxheVwiLCBbZGVsYXldKSwgZnVuY3Rpb24oY2hhbmdlcykge1xuICAgICAgcmV0dXJuIGNoYW5nZXMuZGVsYXkoZGVsYXkpO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5kZWJvdW5jZSA9IGZ1bmN0aW9uKGRlbGF5KSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZGVib3VuY2VcIiwgW2RlbGF5XSksIHRoaXMuZmxhdE1hcExhdGVzdChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIEJhY29uLmxhdGVyKGRlbGF5LCB2YWx1ZSk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLlByb3BlcnR5LnByb3RvdHlwZS5kZWJvdW5jZSA9IGZ1bmN0aW9uKGRlbGF5KSB7XG4gICAgcmV0dXJuIHRoaXMuZGVsYXlDaGFuZ2VzKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZGVib3VuY2VcIiwgW2RlbGF5XSksIGZ1bmN0aW9uKGNoYW5nZXMpIHtcbiAgICAgIHJldHVybiBjaGFuZ2VzLmRlYm91bmNlKGRlbGF5KTtcbiAgICB9KTtcbiAgfTtcblxuICBCYWNvbi5FdmVudFN0cmVhbS5wcm90b3R5cGUuZGVib3VuY2VJbW1lZGlhdGUgPSBmdW5jdGlvbihkZWxheSkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImRlYm91bmNlSW1tZWRpYXRlXCIsIFtkZWxheV0pLCB0aGlzLmZsYXRNYXBGaXJzdChmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIEJhY29uLm9uY2UodmFsdWUpLmNvbmNhdChCYWNvbi5sYXRlcihkZWxheSkuZmlsdGVyKGZhbHNlKSk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmRlY29kZSA9IGZ1bmN0aW9uKGNhc2VzKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZGVjb2RlXCIsIFtjYXNlc10pLCB0aGlzLmNvbWJpbmUoQmFjb24uY29tYmluZVRlbXBsYXRlKGNhc2VzKSwgZnVuY3Rpb24oa2V5LCB2YWx1ZXMpIHtcbiAgICAgIHJldHVybiB2YWx1ZXNba2V5XTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuc2NhbiA9IGZ1bmN0aW9uKHNlZWQsIGYpIHtcbiAgICB2YXIgYWNjLCBpbml0SGFuZGxlZCwgcmVzdWx0UHJvcGVydHksIHN1YnNjcmliZTtcbiAgICBmID0gdG9Db21iaW5hdG9yKGYpO1xuICAgIGFjYyA9IHRvT3B0aW9uKHNlZWQpO1xuICAgIGluaXRIYW5kbGVkID0gZmFsc2U7XG4gICAgc3Vic2NyaWJlID0gKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oc2luaykge1xuICAgICAgICB2YXIgaW5pdFNlbnQsIHJlcGx5LCBzZW5kSW5pdCwgdW5zdWI7XG4gICAgICAgIGluaXRTZW50ID0gZmFsc2U7XG4gICAgICAgIHVuc3ViID0gbm9wO1xuICAgICAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgICAgIHNlbmRJbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCFpbml0U2VudCkge1xuICAgICAgICAgICAgcmV0dXJuIGFjYy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgICAgICAgIGluaXRTZW50ID0gaW5pdEhhbmRsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICByZXBseSA9IHNpbmsobmV3IEluaXRpYWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgIGlmIChyZXBseSA9PT0gQmFjb24ubm9Nb3JlKSB7XG4gICAgICAgICAgICAgICAgdW5zdWIoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5zdWIgPSBub3A7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdW5zdWIgPSBfdGhpcy5kaXNwYXRjaGVyLnN1YnNjcmliZShmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIHZhciBuZXh0LCBwcmV2O1xuICAgICAgICAgIGlmIChldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBpZiAoaW5pdEhhbmRsZWQgJiYgZXZlbnQuaXNJbml0aWFsKCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIEJhY29uLm1vcmU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoIWV2ZW50LmlzSW5pdGlhbCgpKSB7XG4gICAgICAgICAgICAgICAgc2VuZEluaXQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpbml0U2VudCA9IGluaXRIYW5kbGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgcHJldiA9IGFjYy5nZXRPckVsc2Uodm9pZCAwKTtcbiAgICAgICAgICAgICAgbmV4dCA9IGYocHJldiwgZXZlbnQudmFsdWUoKSk7XG4gICAgICAgICAgICAgIGFjYyA9IG5ldyBTb21lKG5leHQpO1xuICAgICAgICAgICAgICByZXR1cm4gc2luayhldmVudC5hcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV4dDtcbiAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICAgICAgICByZXBseSA9IHNlbmRJbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVwbHkgIT09IEJhY29uLm5vTW9yZSkge1xuICAgICAgICAgICAgICByZXR1cm4gc2luayhldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgVXBkYXRlQmFycmllci53aGVuRG9uZVdpdGgocmVzdWx0UHJvcGVydHksIHNlbmRJbml0KTtcbiAgICAgICAgcmV0dXJuIHVuc3ViO1xuICAgICAgfTtcbiAgICB9KSh0aGlzKTtcbiAgICByZXR1cm4gcmVzdWx0UHJvcGVydHkgPSBuZXcgUHJvcGVydHkobmV3IEJhY29uLkRlc2ModGhpcywgXCJzY2FuXCIsIFtzZWVkLCBmXSksIHN1YnNjcmliZSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZGlmZiA9IGZ1bmN0aW9uKHN0YXJ0LCBmKSB7XG4gICAgZiA9IHRvQ29tYmluYXRvcihmKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJkaWZmXCIsIFtzdGFydCwgZl0pLCB0aGlzLnNjYW4oW3N0YXJ0XSwgZnVuY3Rpb24ocHJldlR1cGxlLCBuZXh0KSB7XG4gICAgICByZXR1cm4gW25leHQsIGYocHJldlR1cGxlWzBdLCBuZXh0KV07XG4gICAgfSkuZmlsdGVyKGZ1bmN0aW9uKHR1cGxlKSB7XG4gICAgICByZXR1cm4gdHVwbGUubGVuZ3RoID09PSAyO1xuICAgIH0pLm1hcChmdW5jdGlvbih0dXBsZSkge1xuICAgICAgcmV0dXJuIHR1cGxlWzFdO1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5kb0FjdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmO1xuICAgIGYgPSBtYWtlRnVuY3Rpb25BcmdzKGFyZ3VtZW50cyk7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZG9BY3Rpb25cIiwgW2ZdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50Lmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgZihldmVudC52YWx1ZSgpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5kb0Vycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGY7XG4gICAgZiA9IG1ha2VGdW5jdGlvbkFyZ3MoYXJndW1lbnRzKTtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJkb0Vycm9yXCIsIFtmXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5pc0Vycm9yKCkpIHtcbiAgICAgICAgZihldmVudC5lcnJvcik7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuZG9Mb2cgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZG9Mb2dcIiwgYXJncyksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjb25zb2xlICE9PSBudWxsKSB7XG4gICAgICAgIGlmICh0eXBlb2YgY29uc29sZS5sb2cgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIHNsaWNlLmNhbGwoYXJncykuY29uY2F0KFtldmVudC5sb2coKV0pKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmVuZE9uRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncywgZjtcbiAgICBmID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgaWYgKGYgPT0gbnVsbCkge1xuICAgICAgZiA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0QXJnc1RvRnVuY3Rpb24odGhpcywgZiwgYXJncywgZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZW5kT25FcnJvclwiLCBbXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmlzRXJyb3IoKSAmJiBmKGV2ZW50LmVycm9yKSkge1xuICAgICAgICAgIHRoaXMucHVzaChldmVudCk7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChlbmRFdmVudCgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSkpO1xuICAgIH0pO1xuICB9O1xuXG4gIE9ic2VydmFibGUucHJvdG90eXBlLmVycm9ycyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImVycm9yc1wiLCBbXSksIHRoaXMuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0pKTtcbiAgfTtcblxuICB2YWx1ZUFuZEVuZCA9IChmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBbdmFsdWUsIGVuZEV2ZW50KCldO1xuICB9KTtcblxuICBCYWNvbi5mcm9tUHJvbWlzZSA9IGZ1bmN0aW9uKHByb21pc2UsIGFib3J0LCBldmVudFRyYW5zZm9ybWVyKSB7XG4gICAgaWYgKGV2ZW50VHJhbnNmb3JtZXIgPT0gbnVsbCkge1xuICAgICAgZXZlbnRUcmFuc2Zvcm1lciA9IHZhbHVlQW5kRW5kO1xuICAgIH1cbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiZnJvbVByb21pc2VcIiwgW3Byb21pc2VdKSwgQmFjb24uZnJvbUJpbmRlcihmdW5jdGlvbihoYW5kbGVyKSB7XG4gICAgICB2YXIgcmVmO1xuICAgICAgaWYgKChyZWYgPSBwcm9taXNlLnRoZW4oaGFuZGxlciwgZnVuY3Rpb24oZSkge1xuICAgICAgICByZXR1cm4gaGFuZGxlcihuZXcgRXJyb3IoZSkpO1xuICAgICAgfSkpICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZWYuZG9uZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmVmLmRvbmUoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoYWJvcnQpIHtcbiAgICAgICAgICByZXR1cm4gdHlwZW9mIHByb21pc2UuYWJvcnQgPT09IFwiZnVuY3Rpb25cIiA/IHByb21pc2UuYWJvcnQoKSA6IHZvaWQgMDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9LCBldmVudFRyYW5zZm9ybWVyKSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUubWFwRXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZjtcbiAgICBmID0gbWFrZUZ1bmN0aW9uQXJncyhhcmd1bWVudHMpO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcIm1hcEVycm9yXCIsIFtmXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5pc0Vycm9yKCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaChuZXh0RXZlbnQoZihldmVudC5lcnJvcikpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgfVxuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5mbGF0TWFwRXJyb3IgPSBmdW5jdGlvbihmbikge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcImZsYXRNYXBFcnJvclwiLCBbZm5dKSwgdGhpcy5tYXBFcnJvcihmdW5jdGlvbihlcnIpIHtcbiAgICAgIHJldHVybiBuZXcgRXJyb3IoZXJyKTtcbiAgICB9KS5mbGF0TWFwKGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICh4IGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgcmV0dXJuIGZuKHguZXJyb3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIEJhY29uLm9uY2UoeCk7XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLkV2ZW50U3RyZWFtLnByb3RvdHlwZS5zYW1wbGVkQnkgPSBmdW5jdGlvbihzYW1wbGVyLCBjb21iaW5hdG9yKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwic2FtcGxlZEJ5XCIsIFtzYW1wbGVyLCBjb21iaW5hdG9yXSksIHRoaXMudG9Qcm9wZXJ0eSgpLnNhbXBsZWRCeShzYW1wbGVyLCBjb21iaW5hdG9yKSk7XG4gIH07XG5cbiAgQmFjb24uUHJvcGVydHkucHJvdG90eXBlLnNhbXBsZWRCeSA9IGZ1bmN0aW9uKHNhbXBsZXIsIGNvbWJpbmF0b3IpIHtcbiAgICB2YXIgbGF6eSwgcmVzdWx0LCBzYW1wbGVyU291cmNlLCBzdHJlYW0sIHRoaXNTb3VyY2U7XG4gICAgaWYgKGNvbWJpbmF0b3IgIT0gbnVsbCkge1xuICAgICAgY29tYmluYXRvciA9IHRvQ29tYmluYXRvcihjb21iaW5hdG9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGF6eSA9IHRydWU7XG4gICAgICBjb21iaW5hdG9yID0gZnVuY3Rpb24oZikge1xuICAgICAgICByZXR1cm4gZi52YWx1ZSgpO1xuICAgICAgfTtcbiAgICB9XG4gICAgdGhpc1NvdXJjZSA9IG5ldyBTb3VyY2UodGhpcywgZmFsc2UsIGxhenkpO1xuICAgIHNhbXBsZXJTb3VyY2UgPSBuZXcgU291cmNlKHNhbXBsZXIsIHRydWUsIGxhenkpO1xuICAgIHN0cmVhbSA9IEJhY29uLndoZW4oW3RoaXNTb3VyY2UsIHNhbXBsZXJTb3VyY2VdLCBjb21iaW5hdG9yKTtcbiAgICByZXN1bHQgPSBzYW1wbGVyIGluc3RhbmNlb2YgUHJvcGVydHkgPyBzdHJlYW0udG9Qcm9wZXJ0eSgpIDogc3RyZWFtO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInNhbXBsZWRCeVwiLCBbc2FtcGxlciwgY29tYmluYXRvcl0pLCByZXN1bHQpO1xuICB9O1xuXG4gIEJhY29uLlByb3BlcnR5LnByb3RvdHlwZS5zYW1wbGUgPSBmdW5jdGlvbihpbnRlcnZhbCkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInNhbXBsZVwiLCBbaW50ZXJ2YWxdKSwgdGhpcy5zYW1wbGVkQnkoQmFjb24uaW50ZXJ2YWwoaW50ZXJ2YWwsIHt9KSkpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBwO1xuICAgIHAgPSBhcmd1bWVudHNbMF0sIGFyZ3MgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICBpZiAocCBpbnN0YW5jZW9mIFByb3BlcnR5KSB7XG4gICAgICByZXR1cm4gcC5zYW1wbGVkQnkodGhpcywgZm9ybWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnZlcnRBcmdzVG9GdW5jdGlvbih0aGlzLCBwLCBhcmdzLCBmdW5jdGlvbihmKSB7XG4gICAgICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcIm1hcFwiLCBbZl0pLCB0aGlzLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudC5mbWFwKGYpKTtcbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLmZvbGQgPSBmdW5jdGlvbihzZWVkLCBmKSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZm9sZFwiLCBbc2VlZCwgZl0pLCB0aGlzLnNjYW4oc2VlZCwgZikuc2FtcGxlZEJ5KHRoaXMuZmlsdGVyKGZhbHNlKS5tYXBFbmQoKS50b1Byb3BlcnR5KCkpKTtcbiAgfTtcblxuICBPYnNlcnZhYmxlLnByb3RvdHlwZS5yZWR1Y2UgPSBPYnNlcnZhYmxlLnByb3RvdHlwZS5mb2xkO1xuXG4gIEJhY29uLmZyb21Qb2xsID0gZnVuY3Rpb24oZGVsYXksIHBvbGwpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwiZnJvbVBvbGxcIiwgW2RlbGF5LCBwb2xsXSksIEJhY29uLmZyb21CaW5kZXIoKGZ1bmN0aW9uKGhhbmRsZXIpIHtcbiAgICAgIHZhciBpZDtcbiAgICAgIGlkID0gQmFjb24uc2NoZWR1bGVyLnNldEludGVydmFsKGhhbmRsZXIsIGRlbGF5KTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIEJhY29uLnNjaGVkdWxlci5jbGVhckludGVydmFsKGlkKTtcbiAgICAgIH07XG4gICAgfSksIHBvbGwpKTtcbiAgfTtcblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5ncm91cEJ5ID0gZnVuY3Rpb24oa2V5RiwgbGltaXRGKSB7XG4gICAgdmFyIHNyYywgc3RyZWFtcztcbiAgICBpZiAobGltaXRGID09IG51bGwpIHtcbiAgICAgIGxpbWl0RiA9IEJhY29uLl8uaWQ7XG4gICAgfVxuICAgIHN0cmVhbXMgPSB7fTtcbiAgICBzcmMgPSB0aGlzO1xuICAgIHJldHVybiBzcmMuZmlsdGVyKGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiAhc3RyZWFtc1trZXlGKHgpXTtcbiAgICB9KS5tYXAoZnVuY3Rpb24oeCkge1xuICAgICAgdmFyIGRhdGEsIGtleSwgbGltaXRlZCwgc2ltaWxhcjtcbiAgICAgIGtleSA9IGtleUYoeCk7XG4gICAgICBzaW1pbGFyID0gc3JjLmZpbHRlcihmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBrZXlGKHgpID09PSBrZXk7XG4gICAgICB9KTtcbiAgICAgIGRhdGEgPSBCYWNvbi5vbmNlKHgpLmNvbmNhdChzaW1pbGFyKTtcbiAgICAgIGxpbWl0ZWQgPSBsaW1pdEYoZGF0YSwgeCkud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICByZXR1cm4gZGVsZXRlIHN0cmVhbXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gc3RyZWFtc1trZXldID0gbGltaXRlZDtcbiAgICB9KTtcbiAgfTtcblxuICBCYWNvbi5mcm9tQXJyYXkgPSBmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICB2YXIgaTtcbiAgICBhc3NlcnRBcnJheSh2YWx1ZXMpO1xuICAgIGlmICghdmFsdWVzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcImZyb21BcnJheVwiLCB2YWx1ZXMpLCBCYWNvbi5uZXZlcigpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaSA9IDA7XG4gICAgICByZXR1cm4gbmV3IEV2ZW50U3RyZWFtKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcImZyb21BcnJheVwiLCBbdmFsdWVzXSksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgICAgdmFyIHB1c2gsIHB1c2hOZWVkZWQsIHB1c2hpbmcsIHJlcGx5LCB1bnN1YmQ7XG4gICAgICAgIHVuc3ViZCA9IGZhbHNlO1xuICAgICAgICByZXBseSA9IEJhY29uLm1vcmU7XG4gICAgICAgIHB1c2hpbmcgPSBmYWxzZTtcbiAgICAgICAgcHVzaE5lZWRlZCA9IGZhbHNlO1xuICAgICAgICBwdXNoID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHZhbHVlO1xuICAgICAgICAgIHB1c2hOZWVkZWQgPSB0cnVlO1xuICAgICAgICAgIGlmIChwdXNoaW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHB1c2hpbmcgPSB0cnVlO1xuICAgICAgICAgIHdoaWxlIChwdXNoTmVlZGVkKSB7XG4gICAgICAgICAgICBwdXNoTmVlZGVkID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoKHJlcGx5ICE9PSBCYWNvbi5ub01vcmUpICYmICF1bnN1YmQpIHtcbiAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZXNbaSsrXTtcbiAgICAgICAgICAgICAgcmVwbHkgPSBzaW5rKHRvRXZlbnQodmFsdWUpKTtcbiAgICAgICAgICAgICAgaWYgKHJlcGx5ICE9PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gdmFsdWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgc2luayhlbmRFdmVudCgpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgVXBkYXRlQmFycmllci5hZnRlclRyYW5zYWN0aW9uKHB1c2gpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcHVzaGluZyA9IGZhbHNlO1xuICAgICAgICB9O1xuICAgICAgICBwdXNoKCk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gdW5zdWJkID0gdHJ1ZTtcbiAgICAgICAgfTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICBCYWNvbi5FdmVudFN0cmVhbS5wcm90b3R5cGUuaG9sZFdoZW4gPSBmdW5jdGlvbih2YWx2ZSkge1xuICAgIHZhciBidWZmZXJlZFZhbHVlcywgb25Ib2xkLCBzcmM7XG4gICAgb25Ib2xkID0gZmFsc2U7XG4gICAgYnVmZmVyZWRWYWx1ZXMgPSBbXTtcbiAgICBzcmMgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2ModGhpcywgXCJob2xkV2hlblwiLCBbdmFsdmVdKSwgZnVuY3Rpb24oc2luaykge1xuICAgICAgdmFyIGNvbXBvc2l0ZSwgZW5kSWZCb3RoRW5kZWQsIHN1YnNjcmliZWQ7XG4gICAgICBjb21wb3NpdGUgPSBuZXcgQ29tcG9zaXRlVW5zdWJzY3JpYmUoKTtcbiAgICAgIHN1YnNjcmliZWQgPSBmYWxzZTtcbiAgICAgIGVuZElmQm90aEVuZGVkID0gZnVuY3Rpb24odW5zdWIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB1bnN1YiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgdW5zdWIoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY29tcG9zaXRlLmVtcHR5KCkgJiYgc3Vic2NyaWJlZCkge1xuICAgICAgICAgIHJldHVybiBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgY29tcG9zaXRlLmFkZChmdW5jdGlvbih1bnN1YkFsbCwgdW5zdWJNZSkge1xuICAgICAgICByZXR1cm4gdmFsdmUuc3Vic2NyaWJlSW50ZXJuYWwoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICB2YXIgaiwgbGVuMSwgcmVzdWx0cywgdG9TZW5kLCB2YWx1ZTtcbiAgICAgICAgICBpZiAoZXZlbnQuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgb25Ib2xkID0gZXZlbnQudmFsdWUoKTtcbiAgICAgICAgICAgIGlmICghb25Ib2xkKSB7XG4gICAgICAgICAgICAgIHRvU2VuZCA9IGJ1ZmZlcmVkVmFsdWVzO1xuICAgICAgICAgICAgICBidWZmZXJlZFZhbHVlcyA9IFtdO1xuICAgICAgICAgICAgICByZXN1bHRzID0gW107XG4gICAgICAgICAgICAgIGZvciAoaiA9IDAsIGxlbjEgPSB0b1NlbmQubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0b1NlbmRbal07XG4gICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHNpbmsobmV4dEV2ZW50KHZhbHVlKSkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXN1bHRzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVuZElmQm90aEVuZGVkKHVuc3ViTWUpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gc2luayhldmVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgY29tcG9zaXRlLmFkZChmdW5jdGlvbih1bnN1YkFsbCwgdW5zdWJNZSkge1xuICAgICAgICByZXR1cm4gc3JjLnN1YnNjcmliZUludGVybmFsKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgaWYgKG9uSG9sZCAmJiBldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVmZmVyZWRWYWx1ZXMucHVzaChldmVudC52YWx1ZSgpKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LmlzRW5kKCkgJiYgYnVmZmVyZWRWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gZW5kSWZCb3RoRW5kZWQodW5zdWJNZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzaW5rKGV2ZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBzdWJzY3JpYmVkID0gdHJ1ZTtcbiAgICAgIGVuZElmQm90aEVuZGVkKCk7XG4gICAgICByZXR1cm4gY29tcG9zaXRlLnVuc3Vic2NyaWJlO1xuICAgIH0pO1xuICB9O1xuXG4gIEJhY29uLmludGVydmFsID0gZnVuY3Rpb24oZGVsYXksIHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHtcbiAgICAgIHZhbHVlID0ge307XG4gICAgfVxuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJpbnRlcnZhbFwiLCBbZGVsYXksIHZhbHVlXSksIEJhY29uLmZyb21Qb2xsKGRlbGF5LCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXh0RXZlbnQodmFsdWUpO1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi4kID0ge307XG5cbiAgQmFjb24uJC5hc0V2ZW50U3RyZWFtID0gZnVuY3Rpb24oZXZlbnROYW1lLCBzZWxlY3RvciwgZXZlbnRUcmFuc2Zvcm1lcikge1xuICAgIHZhciByZWY7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihzZWxlY3RvcikpIHtcbiAgICAgIHJlZiA9IFtzZWxlY3Rvciwgdm9pZCAwXSwgZXZlbnRUcmFuc2Zvcm1lciA9IHJlZlswXSwgc2VsZWN0b3IgPSByZWZbMV07XG4gICAgfVxuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLnNlbGVjdG9yIHx8IHRoaXMsIFwiYXNFdmVudFN0cmVhbVwiLCBbZXZlbnROYW1lXSksIEJhY29uLmZyb21CaW5kZXIoKGZ1bmN0aW9uKF90aGlzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oaGFuZGxlcikge1xuICAgICAgICBfdGhpcy5vbihldmVudE5hbWUsIHNlbGVjdG9yLCBoYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBfdGhpcy5vZmYoZXZlbnROYW1lLCBzZWxlY3RvciwgaGFuZGxlcik7XG4gICAgICAgIH07XG4gICAgICB9O1xuICAgIH0pKHRoaXMpLCBldmVudFRyYW5zZm9ybWVyKSk7XG4gIH07XG5cbiAgaWYgKChyZWYgPSB0eXBlb2YgalF1ZXJ5ICE9PSBcInVuZGVmaW5lZFwiICYmIGpRdWVyeSAhPT0gbnVsbCA/IGpRdWVyeSA6IHR5cGVvZiBaZXB0byAhPT0gXCJ1bmRlZmluZWRcIiAmJiBaZXB0byAhPT0gbnVsbCA/IFplcHRvIDogdm9pZCAwKSAhPSBudWxsKSB7XG4gICAgcmVmLmZuLmFzRXZlbnRTdHJlYW0gPSBCYWNvbi4kLmFzRXZlbnRTdHJlYW07XG4gIH1cblxuICBCYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5sb2cgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncztcbiAgICBhcmdzID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgdGhpcy5zdWJzY3JpYmUoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgY29uc29sZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBjb25zb2xlICE9PSBudWxsID8gdHlwZW9mIGNvbnNvbGUubG9nID09PSBcImZ1bmN0aW9uXCIgPyBjb25zb2xlLmxvZy5hcHBseShjb25zb2xlLCBzbGljZS5jYWxsKGFyZ3MpLmNvbmNhdChbZXZlbnQubG9nKCldKSkgOiB2b2lkIDAgOiB2b2lkIDA7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24ocmlnaHQpIHtcbiAgICB2YXIgbGVmdDtcbiAgICBhc3NlcnRFdmVudFN0cmVhbShyaWdodCk7XG4gICAgbGVmdCA9IHRoaXM7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKGxlZnQsIFwibWVyZ2VcIiwgW3JpZ2h0XSksIEJhY29uLm1lcmdlQWxsKHRoaXMsIHJpZ2h0KSk7XG4gIH07XG5cbiAgQmFjb24ubWVyZ2VBbGwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyZWFtcztcbiAgICBzdHJlYW1zID0gMSA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDApIDogW107XG4gICAgaWYgKGlzQXJyYXkoc3RyZWFtc1swXSkpIHtcbiAgICAgIHN0cmVhbXMgPSBzdHJlYW1zWzBdO1xuICAgIH1cbiAgICBpZiAoc3RyZWFtcy5sZW5ndGgpIHtcbiAgICAgIHJldHVybiBuZXcgRXZlbnRTdHJlYW0obmV3IEJhY29uLkRlc2MoQmFjb24sIFwibWVyZ2VBbGxcIiwgc3RyZWFtcyksIGZ1bmN0aW9uKHNpbmspIHtcbiAgICAgICAgdmFyIGVuZHMsIHNpbmtzLCBzbWFydFNpbms7XG4gICAgICAgIGVuZHMgPSAwO1xuICAgICAgICBzbWFydFNpbmsgPSBmdW5jdGlvbihvYnMpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24odW5zdWJCb3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gb2JzLmRpc3BhdGNoZXIuc3Vic2NyaWJlKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgIHZhciByZXBseTtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICAgICAgICBlbmRzKys7XG4gICAgICAgICAgICAgICAgaWYgKGVuZHMgPT09IHN0cmVhbXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gc2luayhlbmRFdmVudCgpKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIEJhY29uLm1vcmU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlcGx5ID0gc2luayhldmVudCk7XG4gICAgICAgICAgICAgICAgaWYgKHJlcGx5ID09PSBCYWNvbi5ub01vcmUpIHtcbiAgICAgICAgICAgICAgICAgIHVuc3ViQm90aCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwbHk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH07XG4gICAgICAgIH07XG4gICAgICAgIHNpbmtzID0gXy5tYXAoc21hcnRTaW5rLCBzdHJlYW1zKTtcbiAgICAgICAgcmV0dXJuIG5ldyBCYWNvbi5Db21wb3NpdGVVbnN1YnNjcmliZShzaW5rcykudW5zdWJzY3JpYmU7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIEJhY29uLm5ldmVyKCk7XG4gICAgfVxuICB9O1xuXG4gIEJhY29uLnJlcGVhdGVkbHkgPSBmdW5jdGlvbihkZWxheSwgdmFsdWVzKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gMDtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwicmVwZWF0ZWRseVwiLCBbZGVsYXksIHZhbHVlc10pLCBCYWNvbi5mcm9tUG9sbChkZWxheSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdmFsdWVzW2luZGV4KysgJSB2YWx1ZXMubGVuZ3RoXTtcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24ucmVwZWF0ID0gZnVuY3Rpb24oZ2VuZXJhdG9yKSB7XG4gICAgdmFyIGluZGV4O1xuICAgIGluZGV4ID0gMDtcbiAgICByZXR1cm4gQmFjb24uZnJvbUJpbmRlcihmdW5jdGlvbihzaW5rKSB7XG4gICAgICB2YXIgZmxhZywgaGFuZGxlRXZlbnQsIHJlcGx5LCBzdWJzY3JpYmVOZXh0LCB1bnN1YjtcbiAgICAgIGZsYWcgPSBmYWxzZTtcbiAgICAgIHJlcGx5ID0gQmFjb24ubW9yZTtcbiAgICAgIHVuc3ViID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgIGhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmlzRW5kKCkpIHtcbiAgICAgICAgICBpZiAoIWZsYWcpIHtcbiAgICAgICAgICAgIHJldHVybiBmbGFnID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHN1YnNjcmliZU5leHQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHJlcGx5ID0gc2luayhldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBzdWJzY3JpYmVOZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBuZXh0O1xuICAgICAgICBmbGFnID0gdHJ1ZTtcbiAgICAgICAgd2hpbGUgKGZsYWcgJiYgcmVwbHkgIT09IEJhY29uLm5vTW9yZSkge1xuICAgICAgICAgIG5leHQgPSBnZW5lcmF0b3IoaW5kZXgrKyk7XG4gICAgICAgICAgZmxhZyA9IGZhbHNlO1xuICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICB1bnN1YiA9IG5leHQuc3Vic2NyaWJlSW50ZXJuYWwoaGFuZGxlRXZlbnQpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaW5rKGVuZEV2ZW50KCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmxhZyA9IHRydWU7XG4gICAgICB9O1xuICAgICAgc3Vic2NyaWJlTmV4dCgpO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdW5zdWIoKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgQmFjb24ucmV0cnkgPSBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgdmFyIGRlbGF5LCBlcnJvciwgZmluaXNoZWQsIGlzUmV0cnlhYmxlLCBtYXhSZXRyaWVzLCByZXRyaWVzLCBzb3VyY2U7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24ob3B0aW9ucy5zb3VyY2UpKSB7XG4gICAgICB0aHJvdyBuZXcgRXhjZXB0aW9uKFwiJ3NvdXJjZScgb3B0aW9uIGhhcyB0byBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgIH1cbiAgICBzb3VyY2UgPSBvcHRpb25zLnNvdXJjZTtcbiAgICByZXRyaWVzID0gb3B0aW9ucy5yZXRyaWVzIHx8IDA7XG4gICAgbWF4UmV0cmllcyA9IG9wdGlvbnMubWF4UmV0cmllcyB8fCByZXRyaWVzO1xuICAgIGRlbGF5ID0gb3B0aW9ucy5kZWxheSB8fCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH07XG4gICAgaXNSZXRyeWFibGUgPSBvcHRpb25zLmlzUmV0cnlhYmxlIHx8IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcbiAgICBmaW5pc2hlZCA9IGZhbHNlO1xuICAgIGVycm9yID0gbnVsbDtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwicmV0cnlcIiwgW29wdGlvbnNdKSwgQmFjb24ucmVwZWF0KGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGNvbnRleHQsIHBhdXNlLCB2YWx1ZVN0cmVhbTtcbiAgICAgIGlmIChmaW5pc2hlZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlU3RyZWFtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIHNvdXJjZSgpLmVuZE9uRXJyb3IoKS53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmlzRXJyb3IoKSkge1xuICAgICAgICAgICAgICBlcnJvciA9IGV2ZW50O1xuICAgICAgICAgICAgICBpZiAoaXNSZXRyeWFibGUoZXJyb3IuZXJyb3IpICYmIHJldHJpZXMgPiAwKSB7XG5cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBudWxsO1xuICAgICAgICAgICAgICAgIGZpbmlzaGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgY29udGV4dCA9IHtcbiAgICAgICAgICAgIGVycm9yOiBlcnJvci5lcnJvcixcbiAgICAgICAgICAgIHJldHJpZXNEb25lOiBtYXhSZXRyaWVzIC0gcmV0cmllc1xuICAgICAgICAgIH07XG4gICAgICAgICAgcGF1c2UgPSBCYWNvbi5sYXRlcihkZWxheShjb250ZXh0KSkuZmlsdGVyKGZhbHNlKTtcbiAgICAgICAgICByZXRyaWVzID0gcmV0cmllcyAtIDE7XG4gICAgICAgICAgcmV0dXJuIHBhdXNlLmNvbmNhdChCYWNvbi5vbmNlKCkuZmxhdE1hcCh2YWx1ZVN0cmVhbSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB2YWx1ZVN0cmVhbSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSkpO1xuICB9O1xuXG4gIEJhY29uLnNlcXVlbnRpYWxseSA9IGZ1bmN0aW9uKGRlbGF5LCB2YWx1ZXMpIHtcbiAgICB2YXIgaW5kZXg7XG4gICAgaW5kZXggPSAwO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJzZXF1ZW50aWFsbHlcIiwgW2RlbGF5LCB2YWx1ZXNdKSwgQmFjb24uZnJvbVBvbGwoZGVsYXksIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhbHVlO1xuICAgICAgdmFsdWUgPSB2YWx1ZXNbaW5kZXgrK107XG4gICAgICBpZiAoaW5kZXggPCB2YWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIFt2YWx1ZSwgZW5kRXZlbnQoKV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZW5kRXZlbnQoKTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuc2tpcCA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwic2tpcFwiLCBbY291bnRdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKCFldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgfSBlbHNlIGlmIChjb3VudCA+IDApIHtcbiAgICAgICAgY291bnQtLTtcbiAgICAgICAgcmV0dXJuIEJhY29uLm1vcmU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5wdXNoKGV2ZW50KTtcbiAgICAgIH1cbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUudGFrZSA9IGZ1bmN0aW9uKGNvdW50KSB7XG4gICAgaWYgKGNvdW50IDw9IDApIHtcbiAgICAgIHJldHVybiBCYWNvbi5uZXZlcigpO1xuICAgIH1cbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJ0YWtlXCIsIFtjb3VudF0pLCB0aGlzLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICBpZiAoIWV2ZW50Lmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb3VudC0tO1xuICAgICAgICBpZiAoY291bnQgPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMucHVzaChldmVudCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGNvdW50ID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLnB1c2goZW5kRXZlbnQoKSk7XG4gICAgICAgICAgcmV0dXJuIEJhY29uLm5vTW9yZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5FdmVudFN0cmVhbS5wcm90b3R5cGUuc2tpcFVudGlsID0gZnVuY3Rpb24oc3RhcnRlcikge1xuICAgIHZhciBzdGFydGVkO1xuICAgIHN0YXJ0ZWQgPSBzdGFydGVyLnRha2UoMSkubWFwKHRydWUpLnRvUHJvcGVydHkoZmFsc2UpO1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInNraXBVbnRpbFwiLCBbc3RhcnRlcl0pLCB0aGlzLmZpbHRlcihzdGFydGVkKSk7XG4gIH07XG5cbiAgQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLnNraXBXaGlsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzLCBmLCBvaztcbiAgICBmID0gYXJndW1lbnRzWzBdLCBhcmdzID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgYXNzZXJ0T2JzZXJ2YWJsZUlzUHJvcGVydHkoZik7XG4gICAgb2sgPSBmYWxzZTtcbiAgICByZXR1cm4gY29udmVydEFyZ3NUb0Z1bmN0aW9uKHRoaXMsIGYsIGFyZ3MsIGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInNraXBXaGlsZVwiLCBbZl0pLCB0aGlzLndpdGhIYW5kbGVyKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlmIChvayB8fCAhZXZlbnQuaGFzVmFsdWUoKSB8fCAhZihldmVudC52YWx1ZSgpKSkge1xuICAgICAgICAgIGlmIChldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBvayA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBCYWNvbi5tb3JlO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUuc2xpZGluZ1dpbmRvdyA9IGZ1bmN0aW9uKG4sIG1pblZhbHVlcykge1xuICAgIGlmIChtaW5WYWx1ZXMgPT0gbnVsbCkge1xuICAgICAgbWluVmFsdWVzID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwic2xpZGluZ1dpbmRvd1wiLCBbbiwgbWluVmFsdWVzXSksIHRoaXMuc2NhbihbXSwgKGZ1bmN0aW9uKHdpbmRvdywgdmFsdWUpIHtcbiAgICAgIHJldHVybiB3aW5kb3cuY29uY2F0KFt2YWx1ZV0pLnNsaWNlKC1uKTtcbiAgICB9KSkuZmlsdGVyKChmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgIHJldHVybiB2YWx1ZXMubGVuZ3RoID49IG1pblZhbHVlcztcbiAgICB9KSkpO1xuICB9O1xuXG4gIEJhY29uLnNweSA9IGZ1bmN0aW9uKHNweSkge1xuICAgIHJldHVybiBzcHlzLnB1c2goc3B5KTtcbiAgfTtcblxuICBzcHlzID0gW107XG5cbiAgcmVnaXN0ZXJPYnMgPSBmdW5jdGlvbihvYnMpIHtcbiAgICB2YXIgaiwgbGVuMSwgc3B5O1xuICAgIGlmIChzcHlzLmxlbmd0aCkge1xuICAgICAgaWYgKCFyZWdpc3Rlck9icy5ydW5uaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVnaXN0ZXJPYnMucnVubmluZyA9IHRydWU7XG4gICAgICAgICAgZm9yIChqID0gMCwgbGVuMSA9IHNweXMubGVuZ3RoOyBqIDwgbGVuMTsgaisrKSB7XG4gICAgICAgICAgICBzcHkgPSBzcHlzW2pdO1xuICAgICAgICAgICAgc3B5KG9icyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGRlbGV0ZSByZWdpc3Rlck9icy5ydW5uaW5nO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2b2lkIDA7XG4gIH07XG5cbiAgQmFjb24uUHJvcGVydHkucHJvdG90eXBlLnN0YXJ0V2l0aCA9IGZ1bmN0aW9uKHNlZWQpIHtcbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJzdGFydFdpdGhcIiwgW3NlZWRdKSwgdGhpcy5zY2FuKHNlZWQsIGZ1bmN0aW9uKHByZXYsIG5leHQpIHtcbiAgICAgIHJldHVybiBuZXh0O1xuICAgIH0pKTtcbiAgfTtcblxuICBCYWNvbi5FdmVudFN0cmVhbS5wcm90b3R5cGUuc3RhcnRXaXRoID0gZnVuY3Rpb24oc2VlZCkge1xuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInN0YXJ0V2l0aFwiLCBbc2VlZF0pLCBCYWNvbi5vbmNlKHNlZWQpLmNvbmNhdCh0aGlzKSk7XG4gIH07XG5cbiAgQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUudGFrZVdoaWxlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MsIGY7XG4gICAgZiA9IGFyZ3VtZW50c1swXSwgYXJncyA9IDIgPD0gYXJndW1lbnRzLmxlbmd0aCA/IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSA6IFtdO1xuICAgIGFzc2VydE9ic2VydmFibGVJc1Byb3BlcnR5KGYpO1xuICAgIHJldHVybiBjb252ZXJ0QXJnc1RvRnVuY3Rpb24odGhpcywgZiwgYXJncywgZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwidGFrZVdoaWxlXCIsIFtmXSksIHRoaXMud2l0aEhhbmRsZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmZpbHRlcihmKSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLnB1c2goZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucHVzaChlbmRFdmVudCgpKTtcbiAgICAgICAgICByZXR1cm4gQmFjb24ubm9Nb3JlO1xuICAgICAgICB9XG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH07XG5cbiAgQmFjb24udXBkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGksIGluaXRpYWwsIGxhdGVCaW5kRmlyc3QsIHBhdHRlcm5zO1xuICAgIGluaXRpYWwgPSBhcmd1bWVudHNbMF0sIHBhdHRlcm5zID0gMiA8PSBhcmd1bWVudHMubGVuZ3RoID8gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpIDogW107XG4gICAgbGF0ZUJpbmRGaXJzdCA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3M7XG4gICAgICAgIGFyZ3MgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICByZXR1cm4gZi5hcHBseShudWxsLCBbaV0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG4gICAgfTtcbiAgICBpID0gcGF0dGVybnMubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAoaSA+IDApIHtcbiAgICAgIGlmICghKHBhdHRlcm5zW2ldIGluc3RhbmNlb2YgRnVuY3Rpb24pKSB7XG4gICAgICAgIHBhdHRlcm5zW2ldID0gKGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4geDtcbiAgICAgICAgICB9O1xuICAgICAgICB9KShwYXR0ZXJuc1tpXSk7XG4gICAgICB9XG4gICAgICBwYXR0ZXJuc1tpXSA9IGxhdGVCaW5kRmlyc3QocGF0dGVybnNbaV0pO1xuICAgICAgaSA9IGkgLSAyO1xuICAgIH1cbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2MoQmFjb24sIFwidXBkYXRlXCIsIFtpbml0aWFsXS5jb25jYXQoc2xpY2UuY2FsbChwYXR0ZXJucykpKSwgQmFjb24ud2hlbi5hcHBseShCYWNvbiwgcGF0dGVybnMpLnNjYW4oaW5pdGlhbCwgKGZ1bmN0aW9uKHgsIGYpIHtcbiAgICAgIHJldHVybiBmKHgpO1xuICAgIH0pKSk7XG4gIH07XG5cbiAgQmFjb24uemlwQXNBcnJheSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJlYW1zO1xuICAgIHN0cmVhbXMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICBpZiAoaXNBcnJheShzdHJlYW1zWzBdKSkge1xuICAgICAgc3RyZWFtcyA9IHN0cmVhbXNbMF07XG4gICAgfVxuICAgIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyhCYWNvbiwgXCJ6aXBBc0FycmF5XCIsIHN0cmVhbXMpLCBCYWNvbi56aXBXaXRoKHN0cmVhbXMsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHhzO1xuICAgICAgeHMgPSAxIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMCkgOiBbXTtcbiAgICAgIHJldHVybiB4cztcbiAgICB9KSk7XG4gIH07XG5cbiAgQmFjb24uemlwV2l0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmLCByZWYxLCBzdHJlYW1zO1xuICAgIGYgPSBhcmd1bWVudHNbMF0sIHN0cmVhbXMgPSAyIDw9IGFyZ3VtZW50cy5sZW5ndGggPyBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkgOiBbXTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmKSkge1xuICAgICAgcmVmMSA9IFtmLCBzdHJlYW1zWzBdXSwgc3RyZWFtcyA9IHJlZjFbMF0sIGYgPSByZWYxWzFdO1xuICAgIH1cbiAgICBzdHJlYW1zID0gXy5tYXAoKGZ1bmN0aW9uKHMpIHtcbiAgICAgIHJldHVybiBzLnRvRXZlbnRTdHJlYW0oKTtcbiAgICB9KSwgc3RyZWFtcyk7XG4gICAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKEJhY29uLCBcInppcFdpdGhcIiwgW2ZdLmNvbmNhdChzbGljZS5jYWxsKHN0cmVhbXMpKSksIEJhY29uLndoZW4oc3RyZWFtcywgZikpO1xuICB9O1xuXG4gIEJhY29uLk9ic2VydmFibGUucHJvdG90eXBlLnppcCA9IGZ1bmN0aW9uKG90aGVyLCBmKSB7XG4gICAgaWYgKGYgPT0gbnVsbCkge1xuICAgICAgZiA9IEFycmF5O1xuICAgIH1cbiAgICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJ6aXBcIiwgW290aGVyXSksIEJhY29uLnppcFdpdGgoW3RoaXMsIG90aGVyXSwgZikpO1xuICB9O1xuXG4gIFxuXG5CYWNvbi5PYnNlcnZhYmxlLnByb3RvdHlwZS5maXJzdCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHdpdGhEZXNjKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwiZmlyc3RcIiwgW10pLCB0aGlzLnRha2UoMSkpO1xufTtcblxuQmFjb24uT2JzZXJ2YWJsZS5wcm90b3R5cGUubGFzdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxhc3RFdmVudDtcblxuICByZXR1cm4gd2l0aERlc2MobmV3IEJhY29uLkRlc2ModGhpcywgXCJsYXN0XCIsIFtdKSwgdGhpcy53aXRoSGFuZGxlcihmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICBpZiAoZXZlbnQuaXNFbmQoKSkge1xuICAgICAgaWYgKGxhc3RFdmVudCkge1xuICAgICAgICB0aGlzLnB1c2gobGFzdEV2ZW50KTtcbiAgICAgIH1cbiAgICAgIHRoaXMucHVzaChlbmRFdmVudCgpKTtcbiAgICAgIHJldHVybiBCYWNvbi5ub01vcmU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3RFdmVudCA9IGV2ZW50O1xuICAgIH1cbiAgfSkpO1xufTtcblxuQmFjb24uRXZlbnRTdHJlYW0ucHJvdG90eXBlLnRocm90dGxlID0gZnVuY3Rpb24gKGRlbGF5KSB7XG4gIHJldHVybiB3aXRoRGVzYyhuZXcgQmFjb24uRGVzYyh0aGlzLCBcInRocm90dGxlXCIsIFtkZWxheV0pLCB0aGlzLmJ1ZmZlcldpdGhUaW1lKGRlbGF5KS5tYXAoZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiB2YWx1ZXNbdmFsdWVzLmxlbmd0aCAtIDFdO1xuICB9KSk7XG59O1xuXG5CYWNvbi5Qcm9wZXJ0eS5wcm90b3R5cGUudGhyb3R0bGUgPSBmdW5jdGlvbiAoZGVsYXkpIHtcbiAgcmV0dXJuIHRoaXMuZGVsYXlDaGFuZ2VzKG5ldyBCYWNvbi5EZXNjKHRoaXMsIFwidGhyb3R0bGVcIiwgW2RlbGF5XSksIGZ1bmN0aW9uIChjaGFuZ2VzKSB7XG4gICAgcmV0dXJuIGNoYW5nZXMudGhyb3R0bGUoZGVsYXkpO1xuICB9KTtcbn07XG5cbk9ic2VydmFibGUucHJvdG90eXBlLmZpcnN0VG9Qcm9taXNlID0gZnVuY3Rpb24gKFByb21pc2VDdHIpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcblxuICBpZiAodHlwZW9mIFByb21pc2VDdHIgIT09IFwiZnVuY3Rpb25cIikge1xuICAgIGlmICh0eXBlb2YgUHJvbWlzZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICBQcm9taXNlQ3RyID0gUHJvbWlzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEV4Y2VwdGlvbihcIlRoZXJlIGlzbid0IGRlZmF1bHQgUHJvbWlzZSwgdXNlIHNoaW0gb3IgcGFyYW1ldGVyXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZUN0cihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmV0dXJuIF90aGlzLnN1YnNjcmliZShmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgIHJlc29sdmUoZXZlbnQudmFsdWUoKSk7XG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQuaXNFcnJvcigpKSB7XG4gICAgICAgIHJlamVjdChldmVudC5lcnJvcik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBCYWNvbi5ub01vcmU7XG4gICAgfSk7XG4gIH0pO1xufTtcblxuT2JzZXJ2YWJsZS5wcm90b3R5cGUudG9Qcm9taXNlID0gZnVuY3Rpb24gKFByb21pc2VDdHIpIHtcbiAgcmV0dXJuIHRoaXMubGFzdCgpLmZpcnN0VG9Qcm9taXNlKFByb21pc2VDdHIpO1xufTtcblxuaWYgKCh0eXBlb2YgZGVmaW5lICE9PSBcInVuZGVmaW5lZFwiICYmIGRlZmluZSAhPT0gbnVsbCkgJiYgKGRlZmluZS5hbWQgIT0gbnVsbCkpIHtcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIEJhY29uO1xuICAgIH0pO1xuICAgIHRoaXMuQmFjb24gPSBCYWNvbjtcbiAgfSBlbHNlIGlmICgodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUgIT09IG51bGwpICYmIChtb2R1bGUuZXhwb3J0cyAhPSBudWxsKSkge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQmFjb247XG4gICAgQmFjb24uQmFjb24gPSBCYWNvbjtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLkJhY29uID0gQmFjb247XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcblxufSkuY2FsbCh0aGlzLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG59LHt9XSwyOltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcbi8qIFJpb3QgdjIuMi4xLCBAbGljZW5zZSBNSVQsIChjKSAyMDE1IE11dXQgSW5jLiArIGNvbnRyaWJ1dG9ycyAqL1xuXG47KGZ1bmN0aW9uKHdpbmRvdykge1xuICAndXNlIHN0cmljdCdcbiAgdmFyIHJpb3QgPSB7IHZlcnNpb246ICd2Mi4yLjEnLCBzZXR0aW5nczoge30gfVxuXG4gIC8vIFRoaXMgZ2xvYmFscyAnY29uc3QnIGhlbHBzIGNvZGUgc2l6ZSByZWR1Y3Rpb25cblxuICAvLyBmb3IgdHlwZW9mID09ICcnIGNvbXBhcmlzb25zXG4gIHZhciBUX1NUUklORyA9ICdzdHJpbmcnXG4gIHZhciBUX09CSkVDVCA9ICdvYmplY3QnXG5cbiAgLy8gZm9yIElFOCBhbmQgcmVzdCBvZiB0aGUgd29ybGRcbiAgdmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIF90cyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmdcbiAgICByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIF90cy5jYWxsKHYpID09PSAnW29iamVjdCBBcnJheV0nIH1cbiAgfSkoKVxuXG4gIC8vIFZlcnNpb24jIGZvciBJRSA4LTExLCAwIGZvciBvdGhlcnNcbiAgdmFyIGllVmVyc2lvbiA9IChmdW5jdGlvbiAod2luKSB7XG4gICAgcmV0dXJuICh3aW4gJiYgd2luLmRvY3VtZW50IHx8IHt9KS5kb2N1bWVudE1vZGUgfCAwXG4gIH0pKHdpbmRvdylcblxucmlvdC5vYnNlcnZhYmxlID0gZnVuY3Rpb24oZWwpIHtcblxuICBlbCA9IGVsIHx8IHt9XG5cbiAgdmFyIGNhbGxiYWNrcyA9IHt9LFxuICAgICAgX2lkID0gMFxuXG4gIGVsLm9uID0gZnVuY3Rpb24oZXZlbnRzLCBmbikge1xuICAgIGlmIChpc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgZm4uX2lkID0gdHlwZW9mIGZuLl9pZCA9PSAndW5kZWZpbmVkJyA/IF9pZCsrIDogZm4uX2lkXG5cbiAgICAgIGV2ZW50cy5yZXBsYWNlKC9cXFMrL2csIGZ1bmN0aW9uKG5hbWUsIHBvcykge1xuICAgICAgICAoY2FsbGJhY2tzW25hbWVdID0gY2FsbGJhY2tzW25hbWVdIHx8IFtdKS5wdXNoKGZuKVxuICAgICAgICBmbi50eXBlZCA9IHBvcyA+IDBcbiAgICAgIH0pXG4gICAgfVxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgZWwub2ZmID0gZnVuY3Rpb24oZXZlbnRzLCBmbikge1xuICAgIGlmIChldmVudHMgPT0gJyonKSBjYWxsYmFja3MgPSB7fVxuICAgIGVsc2Uge1xuICAgICAgZXZlbnRzLnJlcGxhY2UoL1xcUysvZywgZnVuY3Rpb24obmFtZSkge1xuICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICB2YXIgYXJyID0gY2FsbGJhY2tzW25hbWVdXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGNiOyAoY2IgPSBhcnIgJiYgYXJyW2ldKTsgKytpKSB7XG4gICAgICAgICAgICBpZiAoY2IuX2lkID09IGZuLl9pZCkgeyBhcnIuc3BsaWNlKGksIDEpOyBpLS0gfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxsYmFja3NbbmFtZV0gPSBbXVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gZWxcbiAgfVxuXG4gIC8vIG9ubHkgc2luZ2xlIGV2ZW50IHN1cHBvcnRlZFxuICBlbC5vbmUgPSBmdW5jdGlvbihuYW1lLCBmbikge1xuICAgIGZ1bmN0aW9uIG9uKCkge1xuICAgICAgZWwub2ZmKG5hbWUsIG9uKVxuICAgICAgZm4uYXBwbHkoZWwsIGFyZ3VtZW50cylcbiAgICB9XG4gICAgcmV0dXJuIGVsLm9uKG5hbWUsIG9uKVxuICB9XG5cbiAgZWwudHJpZ2dlciA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgZm5zID0gY2FsbGJhY2tzW25hbWVdIHx8IFtdXG5cbiAgICBmb3IgKHZhciBpID0gMCwgZm47IChmbiA9IGZuc1tpXSk7ICsraSkge1xuICAgICAgaWYgKCFmbi5idXN5KSB7XG4gICAgICAgIGZuLmJ1c3kgPSAxXG4gICAgICAgIGZuLmFwcGx5KGVsLCBmbi50eXBlZCA/IFtuYW1lXS5jb25jYXQoYXJncykgOiBhcmdzKVxuICAgICAgICBpZiAoZm5zW2ldICE9PSBmbikgeyBpLS0gfVxuICAgICAgICBmbi5idXN5ID0gMFxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjYWxsYmFja3MuYWxsICYmIG5hbWUgIT0gJ2FsbCcpIHtcbiAgICAgIGVsLnRyaWdnZXIuYXBwbHkoZWwsIFsnYWxsJywgbmFtZV0uY29uY2F0KGFyZ3MpKVxuICAgIH1cblxuICAgIHJldHVybiBlbFxuICB9XG5cbiAgcmV0dXJuIGVsXG5cbn1cbnJpb3QubWl4aW4gPSAoZnVuY3Rpb24oKSB7XG4gIHZhciBtaXhpbnMgPSB7fVxuXG4gIHJldHVybiBmdW5jdGlvbihuYW1lLCBtaXhpbikge1xuICAgIGlmICghbWl4aW4pIHJldHVybiBtaXhpbnNbbmFtZV1cbiAgICBtaXhpbnNbbmFtZV0gPSBtaXhpblxuICB9XG5cbn0pKClcblxuOyhmdW5jdGlvbihyaW90LCBldnQsIHdpbmRvdykge1xuXG4gIC8vIGJyb3dzZXJzIG9ubHlcbiAgaWYgKCF3aW5kb3cpIHJldHVyblxuXG4gIHZhciBsb2MgPSB3aW5kb3cubG9jYXRpb24sXG4gICAgICBmbnMgPSByaW90Lm9ic2VydmFibGUoKSxcbiAgICAgIHdpbiA9IHdpbmRvdyxcbiAgICAgIHN0YXJ0ZWQgPSBmYWxzZSxcbiAgICAgIGN1cnJlbnRcblxuICBmdW5jdGlvbiBoYXNoKCkge1xuICAgIHJldHVybiBsb2MuaHJlZi5zcGxpdCgnIycpWzFdIHx8ICcnXG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZXIocGF0aCkge1xuICAgIHJldHVybiBwYXRoLnNwbGl0KCcvJylcbiAgfVxuXG4gIGZ1bmN0aW9uIGVtaXQocGF0aCkge1xuICAgIGlmIChwYXRoLnR5cGUpIHBhdGggPSBoYXNoKClcblxuICAgIGlmIChwYXRoICE9IGN1cnJlbnQpIHtcbiAgICAgIGZucy50cmlnZ2VyLmFwcGx5KG51bGwsIFsnSCddLmNvbmNhdChwYXJzZXIocGF0aCkpKVxuICAgICAgY3VycmVudCA9IHBhdGhcbiAgICB9XG4gIH1cblxuICB2YXIgciA9IHJpb3Qucm91dGUgPSBmdW5jdGlvbihhcmcpIHtcbiAgICAvLyBzdHJpbmdcbiAgICBpZiAoYXJnWzBdKSB7XG4gICAgICBsb2MuaGFzaCA9IGFyZ1xuICAgICAgZW1pdChhcmcpXG5cbiAgICAvLyBmdW5jdGlvblxuICAgIH0gZWxzZSB7XG4gICAgICBmbnMub24oJ0gnLCBhcmcpXG4gICAgfVxuICB9XG5cbiAgci5leGVjID0gZnVuY3Rpb24oZm4pIHtcbiAgICBmbi5hcHBseShudWxsLCBwYXJzZXIoaGFzaCgpKSlcbiAgfVxuXG4gIHIucGFyc2VyID0gZnVuY3Rpb24oZm4pIHtcbiAgICBwYXJzZXIgPSBmblxuICB9XG5cbiAgci5zdG9wID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICghc3RhcnRlZCkgcmV0dXJuXG4gICAgd2luLnJlbW92ZUV2ZW50TGlzdGVuZXIgPyB3aW4ucmVtb3ZlRXZlbnRMaXN0ZW5lcihldnQsIGVtaXQsIGZhbHNlKSA6IHdpbi5kZXRhY2hFdmVudCgnb24nICsgZXZ0LCBlbWl0KVxuICAgIGZucy5vZmYoJyonKVxuICAgIHN0YXJ0ZWQgPSBmYWxzZVxuICB9XG5cbiAgci5zdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoc3RhcnRlZCkgcmV0dXJuXG4gICAgd2luLmFkZEV2ZW50TGlzdGVuZXIgPyB3aW4uYWRkRXZlbnRMaXN0ZW5lcihldnQsIGVtaXQsIGZhbHNlKSA6IHdpbi5hdHRhY2hFdmVudCgnb24nICsgZXZ0LCBlbWl0KVxuICAgIHN0YXJ0ZWQgPSB0cnVlXG4gIH1cblxuICAvLyBhdXRvc3RhcnQgdGhlIHJvdXRlclxuICByLnN0YXJ0KClcblxufSkocmlvdCwgJ2hhc2hjaGFuZ2UnLCB3aW5kb3cpXG4vKlxuXG4vLy8vIEhvdyBpdCB3b3Jrcz9cblxuXG5UaHJlZSB3YXlzOlxuXG4xLiBFeHByZXNzaW9uczogdG1wbCgneyB2YWx1ZSB9JywgZGF0YSkuXG4gICBSZXR1cm5zIHRoZSByZXN1bHQgb2YgZXZhbHVhdGVkIGV4cHJlc3Npb24gYXMgYSByYXcgb2JqZWN0LlxuXG4yLiBUZW1wbGF0ZXM6IHRtcGwoJ0hpIHsgbmFtZSB9IHsgc3VybmFtZSB9JywgZGF0YSkuXG4gICBSZXR1cm5zIGEgc3RyaW5nIHdpdGggZXZhbHVhdGVkIGV4cHJlc3Npb25zLlxuXG4zLiBGaWx0ZXJzOiB0bXBsKCd7IHNob3c6ICFkb25lLCBoaWdobGlnaHQ6IGFjdGl2ZSB9JywgZGF0YSkuXG4gICBSZXR1cm5zIGEgc3BhY2Ugc2VwYXJhdGVkIGxpc3Qgb2YgdHJ1ZWlzaCBrZXlzIChtYWlubHlcbiAgIHVzZWQgZm9yIHNldHRpbmcgaHRtbCBjbGFzc2VzKSwgZS5nLiBcInNob3cgaGlnaGxpZ2h0XCIuXG5cblxuLy8gVGVtcGxhdGUgZXhhbXBsZXNcblxudG1wbCgneyB0aXRsZSB8fCBcIlVudGl0bGVkXCIgfScsIGRhdGEpXG50bXBsKCdSZXN1bHRzIGFyZSB7IHJlc3VsdHMgPyBcInJlYWR5XCIgOiBcImxvYWRpbmdcIiB9JywgZGF0YSlcbnRtcGwoJ1RvZGF5IGlzIHsgbmV3IERhdGUoKSB9JywgZGF0YSlcbnRtcGwoJ3sgbWVzc2FnZS5sZW5ndGggPiAxNDAgJiYgXCJNZXNzYWdlIGlzIHRvbyBsb25nXCIgfScsIGRhdGEpXG50bXBsKCdUaGlzIGl0ZW0gZ290IHsgTWF0aC5yb3VuZChyYXRpbmcpIH0gc3RhcnMnLCBkYXRhKVxudG1wbCgnPGgxPnsgdGl0bGUgfTwvaDE+eyBib2R5IH0nLCBkYXRhKVxuXG5cbi8vIEZhbHN5IGV4cHJlc3Npb25zIGluIHRlbXBsYXRlc1xuXG5JbiB0ZW1wbGF0ZXMgKGFzIG9wcG9zZWQgdG8gc2luZ2xlIGV4cHJlc3Npb25zKSBhbGwgZmFsc3kgdmFsdWVzXG5leGNlcHQgemVybyAodW5kZWZpbmVkL251bGwvZmFsc2UpIHdpbGwgZGVmYXVsdCB0byBlbXB0eSBzdHJpbmc6XG5cbnRtcGwoJ3sgdW5kZWZpbmVkIH0gLSB7IGZhbHNlIH0gLSB7IG51bGwgfSAtIHsgMCB9Jywge30pXG4vLyB3aWxsIHJldHVybjogXCIgLSAtIC0gMFwiXG5cbiovXG5cblxudmFyIGJyYWNrZXRzID0gKGZ1bmN0aW9uKG9yaWcpIHtcblxuICB2YXIgY2FjaGVkQnJhY2tldHMsXG4gICAgICByLFxuICAgICAgYixcbiAgICAgIHJlID0gL1t7fV0vZ1xuXG4gIHJldHVybiBmdW5jdGlvbih4KSB7XG5cbiAgICAvLyBtYWtlIHN1cmUgd2UgdXNlIHRoZSBjdXJyZW50IHNldHRpbmdcbiAgICB2YXIgcyA9IHJpb3Quc2V0dGluZ3MuYnJhY2tldHMgfHwgb3JpZ1xuXG4gICAgLy8gcmVjcmVhdGUgY2FjaGVkIHZhcnMgaWYgbmVlZGVkXG4gICAgaWYgKGNhY2hlZEJyYWNrZXRzICE9PSBzKSB7XG4gICAgICBjYWNoZWRCcmFja2V0cyA9IHNcbiAgICAgIGIgPSBzLnNwbGl0KCcgJylcbiAgICAgIHIgPSBiLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5yZXBsYWNlKC8oPz0uKS9nLCAnXFxcXCcpIH0pXG4gICAgfVxuXG4gICAgLy8gaWYgcmVnZXhwIGdpdmVuLCByZXdyaXRlIGl0IHdpdGggY3VycmVudCBicmFja2V0cyAob25seSBpZiBkaWZmZXIgZnJvbSBkZWZhdWx0KVxuICAgIHJldHVybiB4IGluc3RhbmNlb2YgUmVnRXhwID8gKFxuICAgICAgICBzID09PSBvcmlnID8geCA6XG4gICAgICAgIG5ldyBSZWdFeHAoeC5zb3VyY2UucmVwbGFjZShyZSwgZnVuY3Rpb24oYikgeyByZXR1cm4gclt+fihiID09PSAnfScpXSB9KSwgeC5nbG9iYWwgPyAnZycgOiAnJylcbiAgICAgICkgOlxuICAgICAgLy8gZWxzZSwgZ2V0IHNwZWNpZmljIGJyYWNrZXRcbiAgICAgIGJbeF1cbiAgfVxufSkoJ3sgfScpXG5cblxudmFyIHRtcGwgPSAoZnVuY3Rpb24oKSB7XG5cbiAgdmFyIGNhY2hlID0ge30sXG4gICAgICByZVZhcnMgPSAvKFsnXCJcXC9dKS4qP1teXFxcXF1cXDF8XFwuXFx3KnxcXHcqOnxcXGIoPzooPzpuZXd8dHlwZW9mfGlufGluc3RhbmNlb2YpIHwoPzp0aGlzfHRydWV8ZmFsc2V8bnVsbHx1bmRlZmluZWQpXFxifGZ1bmN0aW9uICpcXCgpfChbYS16XyRdXFx3KikvZ2lcbiAgICAgICAgICAgICAgLy8gWyAxICAgICAgICAgICAgICAgXVsgMiAgXVsgMyBdWyA0ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1bIDUgICAgICAgXVxuICAgICAgICAgICAgICAvLyBmaW5kIHZhcmlhYmxlIG5hbWVzOlxuICAgICAgICAgICAgICAvLyAxLiBza2lwIHF1b3RlZCBzdHJpbmdzIGFuZCByZWdleHBzOiBcImEgYlwiLCAnYSBiJywgJ2EgXFwnYlxcJycsIC9hIGIvXG4gICAgICAgICAgICAgIC8vIDIuIHNraXAgb2JqZWN0IHByb3BlcnRpZXM6IC5uYW1lXG4gICAgICAgICAgICAgIC8vIDMuIHNraXAgb2JqZWN0IGxpdGVyYWxzOiBuYW1lOlxuICAgICAgICAgICAgICAvLyA0LiBza2lwIGphdmFzY3JpcHQga2V5d29yZHNcbiAgICAgICAgICAgICAgLy8gNS4gbWF0Y2ggdmFyIG5hbWVcblxuICAvLyBidWlsZCBhIHRlbXBsYXRlIChvciBnZXQgaXQgZnJvbSBjYWNoZSksIHJlbmRlciB3aXRoIGRhdGFcbiAgcmV0dXJuIGZ1bmN0aW9uKHN0ciwgZGF0YSkge1xuICAgIHJldHVybiBzdHIgJiYgKGNhY2hlW3N0cl0gPSBjYWNoZVtzdHJdIHx8IHRtcGwoc3RyKSkoZGF0YSlcbiAgfVxuXG5cbiAgLy8gY3JlYXRlIGEgdGVtcGxhdGUgaW5zdGFuY2VcblxuICBmdW5jdGlvbiB0bXBsKHMsIHApIHtcblxuICAgIC8vIGRlZmF1bHQgdGVtcGxhdGUgc3RyaW5nIHRvIHt9XG4gICAgcyA9IChzIHx8IChicmFja2V0cygwKSArIGJyYWNrZXRzKDEpKSlcblxuICAgICAgLy8gdGVtcG9yYXJpbHkgY29udmVydCBcXHsgYW5kIFxcfSB0byBhIG5vbi1jaGFyYWN0ZXJcbiAgICAgIC5yZXBsYWNlKGJyYWNrZXRzKC9cXFxcey9nKSwgJ1xcdUZGRjAnKVxuICAgICAgLnJlcGxhY2UoYnJhY2tldHMoL1xcXFx9L2cpLCAnXFx1RkZGMScpXG5cbiAgICAvLyBzcGxpdCBzdHJpbmcgdG8gZXhwcmVzc2lvbiBhbmQgbm9uLWV4cHJlc2lvbiBwYXJ0c1xuICAgIHAgPSBzcGxpdChzLCBleHRyYWN0KHMsIGJyYWNrZXRzKC97LyksIGJyYWNrZXRzKC99LykpKVxuXG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbignZCcsICdyZXR1cm4gJyArIChcblxuICAgICAgLy8gaXMgaXQgYSBzaW5nbGUgZXhwcmVzc2lvbiBvciBhIHRlbXBsYXRlPyBpLmUuIHt4fSBvciA8Yj57eH08L2I+XG4gICAgICAhcFswXSAmJiAhcFsyXSAmJiAhcFszXVxuXG4gICAgICAgIC8vIGlmIGV4cHJlc3Npb24sIGV2YWx1YXRlIGl0XG4gICAgICAgID8gZXhwcihwWzFdKVxuXG4gICAgICAgIC8vIGlmIHRlbXBsYXRlLCBldmFsdWF0ZSBhbGwgZXhwcmVzc2lvbnMgaW4gaXRcbiAgICAgICAgOiAnWycgKyBwLm1hcChmdW5jdGlvbihzLCBpKSB7XG5cbiAgICAgICAgICAgIC8vIGlzIGl0IGFuIGV4cHJlc3Npb24gb3IgYSBzdHJpbmcgKGV2ZXJ5IHNlY29uZCBwYXJ0IGlzIGFuIGV4cHJlc3Npb24pXG4gICAgICAgICAgcmV0dXJuIGkgJSAyXG5cbiAgICAgICAgICAgICAgLy8gZXZhbHVhdGUgdGhlIGV4cHJlc3Npb25zXG4gICAgICAgICAgICAgID8gZXhwcihzLCB0cnVlKVxuXG4gICAgICAgICAgICAgIC8vIHByb2Nlc3Mgc3RyaW5nIHBhcnRzIG9mIHRoZSB0ZW1wbGF0ZTpcbiAgICAgICAgICAgICAgOiAnXCInICsgc1xuXG4gICAgICAgICAgICAgICAgICAvLyBwcmVzZXJ2ZSBuZXcgbGluZXNcbiAgICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJylcblxuICAgICAgICAgICAgICAgICAgLy8gZXNjYXBlIHF1b3Rlc1xuICAgICAgICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKVxuXG4gICAgICAgICAgICAgICAgKyAnXCInXG5cbiAgICAgICAgfSkuam9pbignLCcpICsgJ10uam9pbihcIlwiKSdcbiAgICAgIClcblxuICAgICAgLy8gYnJpbmcgZXNjYXBlZCB7IGFuZCB9IGJhY2tcbiAgICAgIC5yZXBsYWNlKC9cXHVGRkYwL2csIGJyYWNrZXRzKDApKVxuICAgICAgLnJlcGxhY2UoL1xcdUZGRjEvZywgYnJhY2tldHMoMSkpXG5cbiAgICArICc7JylcblxuICB9XG5cblxuICAvLyBwYXJzZSB7IC4uLiB9IGV4cHJlc3Npb25cblxuICBmdW5jdGlvbiBleHByKHMsIG4pIHtcbiAgICBzID0gc1xuXG4gICAgICAvLyBjb252ZXJ0IG5ldyBsaW5lcyB0byBzcGFjZXNcbiAgICAgIC5yZXBsYWNlKC9cXG4vZywgJyAnKVxuXG4gICAgICAvLyB0cmltIHdoaXRlc3BhY2UsIGJyYWNrZXRzLCBzdHJpcCBjb21tZW50c1xuICAgICAgLnJlcGxhY2UoYnJhY2tldHMoL15beyBdK3xbIH1dKyR8XFwvXFwqLis/XFwqXFwvL2cpLCAnJylcblxuICAgIC8vIGlzIGl0IGFuIG9iamVjdCBsaXRlcmFsPyBpLmUuIHsga2V5IDogdmFsdWUgfVxuICAgIHJldHVybiAvXlxccypbXFx3LSBcIiddKyAqOi8udGVzdChzKVxuXG4gICAgICAvLyBpZiBvYmplY3QgbGl0ZXJhbCwgcmV0dXJuIHRydWVpc2gga2V5c1xuICAgICAgLy8gZS5nLjogeyBzaG93OiBpc09wZW4oKSwgZG9uZTogaXRlbS5kb25lIH0gLT4gXCJzaG93IGRvbmVcIlxuICAgICAgPyAnWycgK1xuXG4gICAgICAgICAgLy8gZXh0cmFjdCBrZXk6dmFsIHBhaXJzLCBpZ25vcmluZyBhbnkgbmVzdGVkIG9iamVjdHNcbiAgICAgICAgICBleHRyYWN0KHMsXG5cbiAgICAgICAgICAgICAgLy8gbmFtZSBwYXJ0OiBuYW1lOiwgXCJuYW1lXCI6LCAnbmFtZSc6LCBuYW1lIDpcbiAgICAgICAgICAgICAgL1tcIicgXSpbXFx3LSBdK1tcIicgXSo6LyxcblxuICAgICAgICAgICAgICAvLyBleHByZXNzaW9uIHBhcnQ6IGV2ZXJ5dGhpbmcgdXB0byBhIGNvbW1hIGZvbGxvd2VkIGJ5IGEgbmFtZSAoc2VlIGFib3ZlKSBvciBlbmQgb2YgbGluZVxuICAgICAgICAgICAgICAvLCg/PVtcIicgXSpbXFx3LSBdK1tcIicgXSo6KXx9fCQvXG4gICAgICAgICAgICAgICkubWFwKGZ1bmN0aW9uKHBhaXIpIHtcblxuICAgICAgICAgICAgICAgIC8vIGdldCBrZXksIHZhbCBwYXJ0c1xuICAgICAgICAgICAgICAgIHJldHVybiBwYWlyLnJlcGxhY2UoL15bIFwiJ10qKC4rPylbIFwiJ10qOiAqKC4rPyksPyAqJC8sIGZ1bmN0aW9uKF8sIGssIHYpIHtcblxuICAgICAgICAgICAgICAgICAgLy8gd3JhcCBhbGwgY29uZGl0aW9uYWwgcGFydHMgdG8gaWdub3JlIGVycm9yc1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHYucmVwbGFjZSgvW14mfD0hPjxdKy9nLCB3cmFwKSArICc/XCInICsgayArICdcIjpcIlwiLCdcblxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgfSkuam9pbignJylcblxuICAgICAgICArICddLmpvaW4oXCIgXCIpLnRyaW0oKSdcblxuICAgICAgLy8gaWYganMgZXhwcmVzc2lvbiwgZXZhbHVhdGUgYXMgamF2YXNjcmlwdFxuICAgICAgOiB3cmFwKHMsIG4pXG5cbiAgfVxuXG5cbiAgLy8gZXhlY3V0ZSBqcyB3L28gYnJlYWtpbmcgb24gZXJyb3JzIG9yIHVuZGVmaW5lZCB2YXJzXG5cbiAgZnVuY3Rpb24gd3JhcChzLCBub251bGwpIHtcbiAgICBzID0gcy50cmltKClcbiAgICByZXR1cm4gIXMgPyAnJyA6ICcoZnVuY3Rpb24odil7dHJ5e3Y9J1xuXG4gICAgICAgIC8vIHByZWZpeCB2YXJzIChuYW1lID0+IGRhdGEubmFtZSlcbiAgICAgICAgKyAocy5yZXBsYWNlKHJlVmFycywgZnVuY3Rpb24ocywgXywgdikgeyByZXR1cm4gdiA/ICcoZC4nK3YrJz09PXVuZGVmaW5lZD8nKyh0eXBlb2Ygd2luZG93ID09ICd1bmRlZmluZWQnID8gJ2dsb2JhbC4nIDogJ3dpbmRvdy4nKSt2Kyc6ZC4nK3YrJyknIDogcyB9KVxuXG4gICAgICAgICAgLy8gYnJlYWsgdGhlIGV4cHJlc3Npb24gaWYgaXRzIGVtcHR5IChyZXN1bHRpbmcgaW4gdW5kZWZpbmVkIHZhbHVlKVxuICAgICAgICAgIHx8ICd4JylcbiAgICAgICsgJ31jYXRjaChlKXsnXG4gICAgICArICd9ZmluYWxseXtyZXR1cm4gJ1xuXG4gICAgICAgIC8vIGRlZmF1bHQgdG8gZW1wdHkgc3RyaW5nIGZvciBmYWxzeSB2YWx1ZXMgZXhjZXB0IHplcm9cbiAgICAgICAgKyAobm9udWxsID09PSB0cnVlID8gJyF2JiZ2IT09MD9cIlwiOnYnIDogJ3YnKVxuXG4gICAgICArICd9fSkuY2FsbChkKSdcbiAgfVxuXG5cbiAgLy8gc3BsaXQgc3RyaW5nIGJ5IGFuIGFycmF5IG9mIHN1YnN0cmluZ3NcblxuICBmdW5jdGlvbiBzcGxpdChzdHIsIHN1YnN0cmluZ3MpIHtcbiAgICB2YXIgcGFydHMgPSBbXVxuICAgIHN1YnN0cmluZ3MubWFwKGZ1bmN0aW9uKHN1YiwgaSkge1xuXG4gICAgICAvLyBwdXNoIG1hdGNoZWQgZXhwcmVzc2lvbiBhbmQgcGFydCBiZWZvcmUgaXRcbiAgICAgIGkgPSBzdHIuaW5kZXhPZihzdWIpXG4gICAgICBwYXJ0cy5wdXNoKHN0ci5zbGljZSgwLCBpKSwgc3ViKVxuICAgICAgc3RyID0gc3RyLnNsaWNlKGkgKyBzdWIubGVuZ3RoKVxuICAgIH0pXG5cbiAgICAvLyBwdXNoIHRoZSByZW1haW5pbmcgcGFydFxuICAgIHJldHVybiBwYXJ0cy5jb25jYXQoc3RyKVxuICB9XG5cblxuICAvLyBtYXRjaCBzdHJpbmdzIGJldHdlZW4gb3BlbmluZyBhbmQgY2xvc2luZyByZWdleHAsIHNraXBwaW5nIGFueSBpbm5lci9uZXN0ZWQgbWF0Y2hlc1xuXG4gIGZ1bmN0aW9uIGV4dHJhY3Qoc3RyLCBvcGVuLCBjbG9zZSkge1xuXG4gICAgdmFyIHN0YXJ0LFxuICAgICAgICBsZXZlbCA9IDAsXG4gICAgICAgIG1hdGNoZXMgPSBbXSxcbiAgICAgICAgcmUgPSBuZXcgUmVnRXhwKCcoJytvcGVuLnNvdXJjZSsnKXwoJytjbG9zZS5zb3VyY2UrJyknLCAnZycpXG5cbiAgICBzdHIucmVwbGFjZShyZSwgZnVuY3Rpb24oXywgb3BlbiwgY2xvc2UsIHBvcykge1xuXG4gICAgICAvLyBpZiBvdXRlciBpbm5lciBicmFja2V0LCBtYXJrIHBvc2l0aW9uXG4gICAgICBpZiAoIWxldmVsICYmIG9wZW4pIHN0YXJ0ID0gcG9zXG5cbiAgICAgIC8vIGluKGRlKWNyZWFzZSBicmFja2V0IGxldmVsXG4gICAgICBsZXZlbCArPSBvcGVuID8gMSA6IC0xXG5cbiAgICAgIC8vIGlmIG91dGVyIGNsb3NpbmcgYnJhY2tldCwgZ3JhYiB0aGUgbWF0Y2hcbiAgICAgIGlmICghbGV2ZWwgJiYgY2xvc2UgIT0gbnVsbCkgbWF0Y2hlcy5wdXNoKHN0ci5zbGljZShzdGFydCwgcG9zK2Nsb3NlLmxlbmd0aCkpXG5cbiAgICB9KVxuXG4gICAgcmV0dXJuIG1hdGNoZXNcbiAgfVxuXG59KSgpXG5cbi8vIHsga2V5LCBpIGluIGl0ZW1zfSAtPiB7IGtleSwgaSwgaXRlbXMgfVxuZnVuY3Rpb24gbG9vcEtleXMoZXhwcikge1xuICB2YXIgYjAgPSBicmFja2V0cygwKSxcbiAgICAgIGVscyA9IGV4cHIuc2xpY2UoYjAubGVuZ3RoKS5tYXRjaCgvXFxzKihcXFMrPylcXHMqKD86LFxccyooXFxTKSspP1xccytpblxccysoLispLylcbiAgcmV0dXJuIGVscyA/IHsga2V5OiBlbHNbMV0sIHBvczogZWxzWzJdLCB2YWw6IGIwICsgZWxzWzNdIH0gOiB7IHZhbDogZXhwciB9XG59XG5cbmZ1bmN0aW9uIG1raXRlbShleHByLCBrZXksIHZhbCkge1xuICB2YXIgaXRlbSA9IHt9XG4gIGl0ZW1bZXhwci5rZXldID0ga2V5XG4gIGlmIChleHByLnBvcykgaXRlbVtleHByLnBvc10gPSB2YWxcbiAgcmV0dXJuIGl0ZW1cbn1cblxuXG4vKiBCZXdhcmU6IGhlYXZ5IHN0dWZmICovXG5mdW5jdGlvbiBfZWFjaChkb20sIHBhcmVudCwgZXhwcikge1xuXG4gIHJlbUF0dHIoZG9tLCAnZWFjaCcpXG5cbiAgdmFyIHRlbXBsYXRlID0gZG9tLm91dGVySFRNTCxcbiAgICAgIHJvb3QgPSBkb20ucGFyZW50Tm9kZSxcbiAgICAgIHBsYWNlaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgncmlvdCBwbGFjZWhvbGRlcicpLFxuICAgICAgdGFncyA9IFtdLFxuICAgICAgY2hpbGQgPSBnZXRUYWcoZG9tKSxcbiAgICAgIGNoZWNrc3VtXG5cbiAgcm9vdC5pbnNlcnRCZWZvcmUocGxhY2Vob2xkZXIsIGRvbSlcblxuICBleHByID0gbG9vcEtleXMoZXhwcilcblxuICAvLyBjbGVhbiB0ZW1wbGF0ZSBjb2RlXG4gIHBhcmVudFxuICAgIC5vbmUoJ3ByZW1vdW50JywgZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKHJvb3Quc3R1Yikgcm9vdCA9IHBhcmVudC5yb290XG4gICAgICAvLyByZW1vdmUgdGhlIG9yaWdpbmFsIERPTSBub2RlXG4gICAgICBkb20ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChkb20pXG4gICAgfSlcbiAgICAub24oJ3VwZGF0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBpdGVtcyA9IHRtcGwoZXhwci52YWwsIHBhcmVudCksXG4gICAgICAgICAgdGVzdFxuXG4gICAgICAvLyBvYmplY3QgbG9vcC4gYW55IGNoYW5nZXMgY2F1c2UgZnVsbCByZWRyYXdcbiAgICAgIGlmICghaXNBcnJheShpdGVtcykpIHtcbiAgICAgICAgdGVzdCA9IGNoZWNrc3VtXG4gICAgICAgIGNoZWNrc3VtID0gaXRlbXMgPyBKU09OLnN0cmluZ2lmeShpdGVtcykgOiAnJ1xuICAgICAgICBpZiAoY2hlY2tzdW0gPT09IHRlc3QpIHJldHVyblxuXG4gICAgICAgIGl0ZW1zID0gIWl0ZW1zID8gW10gOlxuICAgICAgICAgIE9iamVjdC5rZXlzKGl0ZW1zKS5tYXAoZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgcmV0dXJuIG1raXRlbShleHByLCBrZXksIGl0ZW1zW2tleV0pXG4gICAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksXG4gICAgICAgICAgaSA9IHRhZ3MubGVuZ3RoLFxuICAgICAgICAgIGogPSBpdGVtcy5sZW5ndGhcblxuICAgICAgLy8gdW5tb3VudCBsZWZ0b3ZlciBpdGVtc1xuICAgICAgd2hpbGUgKGkgPiBqKSB0YWdzWy0taV0udW5tb3VudCgpXG4gICAgICB0YWdzLmxlbmd0aCA9IGpcblxuICAgICAgdGVzdCA9ICFjaGVja3N1bSAmJiAhIWV4cHIua2V5XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgajsgKytpKSB7XG4gICAgICAgIHZhciBfaXRlbSA9IHRlc3QgPyBta2l0ZW0oZXhwciwgaXRlbXNbaV0sIGkpIDogaXRlbXNbaV1cblxuICAgICAgICBpZiAoIXRhZ3NbaV0pIHtcbiAgICAgICAgICAvLyBtb3VudCBuZXdcbiAgICAgICAgICAodGFnc1tpXSA9IG5ldyBUYWcoeyB0bXBsOiB0ZW1wbGF0ZSB9LCB7XG4gICAgICAgICAgICAgIHBhcmVudDogcGFyZW50LFxuICAgICAgICAgICAgICBpc0xvb3A6IHRydWUsXG4gICAgICAgICAgICAgIHJvb3Q6IHJvb3QsXG4gICAgICAgICAgICAgIGl0ZW06IF9pdGVtXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICkubW91bnQoKVxuXG4gICAgICAgICAgZnJhZy5hcHBlbmRDaGlsZCh0YWdzW2ldLnJvb3QpXG4gICAgICAgIH1cbiAgICAgICAgdGFnc1tpXS5faXRlbSA9IF9pdGVtXG4gICAgICAgIHRhZ3NbaV0udXBkYXRlKF9pdGVtKVxuICAgICAgfVxuXG4gICAgICByb290Lmluc2VydEJlZm9yZShmcmFnLCBwbGFjZWhvbGRlcilcblxuICAgICAgaWYgKGNoaWxkKSBwYXJlbnQudGFnc1tnZXRUYWdOYW1lKGRvbSldID0gdGFnc1xuXG4gICAgfSkub25lKCd1cGRhdGVkJywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHBhcmVudCkvLyBvbmx5IHNldCBuZXcgdmFsdWVzXG4gICAgICB3YWxrKHJvb3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgLy8gb25seSBzZXQgZWxlbWVudCBub2RlIGFuZCBub3QgaXNMb29wXG4gICAgICAgIGlmIChub2RlLm5vZGVUeXBlID09IDEgJiYgIW5vZGUuaXNMb29wICYmICFub2RlLl9sb29wZWQpIHtcbiAgICAgICAgICBub2RlLl92aXNpdGVkID0gZmFsc2UgLy8gcmVzZXQgX3Zpc2l0ZWQgZm9yIGxvb3Agbm9kZVxuICAgICAgICAgIG5vZGUuX2xvb3BlZCA9IHRydWUgLy8gYXZvaWQgc2V0IG11bHRpcGxlIGVhY2hcbiAgICAgICAgICBzZXROYW1lZChub2RlLCBwYXJlbnQsIGtleXMpXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcblxufVxuXG5cbmZ1bmN0aW9uIHBhcnNlTmFtZWRFbGVtZW50cyhyb290LCBwYXJlbnQsIGNoaWxkVGFncykge1xuXG4gIHdhbGsocm9vdCwgZnVuY3Rpb24oZG9tKSB7XG4gICAgaWYgKGRvbS5ub2RlVHlwZSA9PSAxKSB7XG4gICAgICBkb20uaXNMb29wID0gKGRvbS5wYXJlbnROb2RlICYmIGRvbS5wYXJlbnROb2RlLmlzTG9vcCB8fCBkb20uZ2V0QXR0cmlidXRlKCdlYWNoJykpID8gMSA6IDBcblxuICAgICAgLy8gY3VzdG9tIGNoaWxkIHRhZ1xuICAgICAgdmFyIGNoaWxkID0gZ2V0VGFnKGRvbSlcblxuICAgICAgaWYgKGNoaWxkICYmICFkb20uaXNMb29wKSB7XG4gICAgICAgIHZhciB0YWcgPSBuZXcgVGFnKGNoaWxkLCB7IHJvb3Q6IGRvbSwgcGFyZW50OiBwYXJlbnQgfSwgZG9tLmlubmVySFRNTCksXG4gICAgICAgICAgICB0YWdOYW1lID0gZ2V0VGFnTmFtZShkb20pLFxuICAgICAgICAgICAgcHRhZyA9IHBhcmVudCxcbiAgICAgICAgICAgIGNhY2hlZFRhZ1xuXG4gICAgICAgIHdoaWxlICghZ2V0VGFnKHB0YWcucm9vdCkpIHtcbiAgICAgICAgICBpZiAoIXB0YWcucGFyZW50KSBicmVha1xuICAgICAgICAgIHB0YWcgPSBwdGFnLnBhcmVudFxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZml4IGZvciB0aGUgcGFyZW50IGF0dHJpYnV0ZSBpbiB0aGUgbG9vcGVkIGVsZW1lbnRzXG4gICAgICAgIHRhZy5wYXJlbnQgPSBwdGFnXG5cbiAgICAgICAgY2FjaGVkVGFnID0gcHRhZy50YWdzW3RhZ05hbWVdXG5cbiAgICAgICAgLy8gaWYgdGhlcmUgYXJlIG11bHRpcGxlIGNoaWxkcmVuIHRhZ3MgaGF2aW5nIHRoZSBzYW1lIG5hbWVcbiAgICAgICAgaWYgKGNhY2hlZFRhZykge1xuICAgICAgICAgIC8vIGlmIHRoZSBwYXJlbnQgdGFncyBwcm9wZXJ0eSBpcyBub3QgeWV0IGFuIGFycmF5XG4gICAgICAgICAgLy8gY3JlYXRlIGl0IGFkZGluZyB0aGUgZmlyc3QgY2FjaGVkIHRhZ1xuICAgICAgICAgIGlmICghaXNBcnJheShjYWNoZWRUYWcpKVxuICAgICAgICAgICAgcHRhZy50YWdzW3RhZ05hbWVdID0gW2NhY2hlZFRhZ11cbiAgICAgICAgICAvLyBhZGQgdGhlIG5ldyBuZXN0ZWQgdGFnIHRvIHRoZSBhcnJheVxuICAgICAgICAgIHB0YWcudGFnc1t0YWdOYW1lXS5wdXNoKHRhZylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwdGFnLnRhZ3NbdGFnTmFtZV0gPSB0YWdcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVtcHR5IHRoZSBjaGlsZCBub2RlIG9uY2Ugd2UgZ290IGl0cyB0ZW1wbGF0ZVxuICAgICAgICAvLyB0byBhdm9pZCB0aGF0IGl0cyBjaGlsZHJlbiBnZXQgY29tcGlsZWQgbXVsdGlwbGUgdGltZXNcbiAgICAgICAgZG9tLmlubmVySFRNTCA9ICcnXG4gICAgICAgIGNoaWxkVGFncy5wdXNoKHRhZylcbiAgICAgIH1cblxuICAgICAgaWYgKCFkb20uaXNMb29wKVxuICAgICAgICBzZXROYW1lZChkb20sIHBhcmVudCwgW10pXG4gICAgfVxuXG4gIH0pXG5cbn1cblxuZnVuY3Rpb24gcGFyc2VFeHByZXNzaW9ucyhyb290LCB0YWcsIGV4cHJlc3Npb25zKSB7XG5cbiAgZnVuY3Rpb24gYWRkRXhwcihkb20sIHZhbCwgZXh0cmEpIHtcbiAgICBpZiAodmFsLmluZGV4T2YoYnJhY2tldHMoMCkpID49IDApIHtcbiAgICAgIHZhciBleHByID0geyBkb206IGRvbSwgZXhwcjogdmFsIH1cbiAgICAgIGV4cHJlc3Npb25zLnB1c2goZXh0ZW5kKGV4cHIsIGV4dHJhKSlcbiAgICB9XG4gIH1cblxuICB3YWxrKHJvb3QsIGZ1bmN0aW9uKGRvbSkge1xuICAgIHZhciB0eXBlID0gZG9tLm5vZGVUeXBlXG5cbiAgICAvLyB0ZXh0IG5vZGVcbiAgICBpZiAodHlwZSA9PSAzICYmIGRvbS5wYXJlbnROb2RlLnRhZ05hbWUgIT0gJ1NUWUxFJykgYWRkRXhwcihkb20sIGRvbS5ub2RlVmFsdWUpXG4gICAgaWYgKHR5cGUgIT0gMSkgcmV0dXJuXG5cbiAgICAvKiBlbGVtZW50ICovXG5cbiAgICAvLyBsb29wXG4gICAgdmFyIGF0dHIgPSBkb20uZ2V0QXR0cmlidXRlKCdlYWNoJylcblxuICAgIGlmIChhdHRyKSB7IF9lYWNoKGRvbSwgdGFnLCBhdHRyKTsgcmV0dXJuIGZhbHNlIH1cblxuICAgIC8vIGF0dHJpYnV0ZSBleHByZXNzaW9uc1xuICAgIGVhY2goZG9tLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKGF0dHIpIHtcbiAgICAgIHZhciBuYW1lID0gYXR0ci5uYW1lLFxuICAgICAgICBib29sID0gbmFtZS5zcGxpdCgnX18nKVsxXVxuXG4gICAgICBhZGRFeHByKGRvbSwgYXR0ci52YWx1ZSwgeyBhdHRyOiBib29sIHx8IG5hbWUsIGJvb2w6IGJvb2wgfSlcbiAgICAgIGlmIChib29sKSB7IHJlbUF0dHIoZG9tLCBuYW1lKTsgcmV0dXJuIGZhbHNlIH1cblxuICAgIH0pXG5cbiAgICAvLyBza2lwIGN1c3RvbSB0YWdzXG4gICAgaWYgKGdldFRhZyhkb20pKSByZXR1cm4gZmFsc2VcblxuICB9KVxuXG59XG5mdW5jdGlvbiBUYWcoaW1wbCwgY29uZiwgaW5uZXJIVE1MKSB7XG5cbiAgdmFyIHNlbGYgPSByaW90Lm9ic2VydmFibGUodGhpcyksXG4gICAgICBvcHRzID0gaW5oZXJpdChjb25mLm9wdHMpIHx8IHt9LFxuICAgICAgZG9tID0gbWtkb20oaW1wbC50bXBsKSxcbiAgICAgIHBhcmVudCA9IGNvbmYucGFyZW50LFxuICAgICAgaXNMb29wID0gY29uZi5pc0xvb3AsXG4gICAgICBpdGVtID0gY29uZi5pdGVtLFxuICAgICAgZXhwcmVzc2lvbnMgPSBbXSxcbiAgICAgIGNoaWxkVGFncyA9IFtdLFxuICAgICAgcm9vdCA9IGNvbmYucm9vdCxcbiAgICAgIGZuID0gaW1wbC5mbixcbiAgICAgIHRhZ05hbWUgPSByb290LnRhZ05hbWUudG9Mb3dlckNhc2UoKSxcbiAgICAgIGF0dHIgPSB7fSxcbiAgICAgIGxvb3BEb20sXG4gICAgICBUQUdfQVRUUklCVVRFUyA9IC8oW1xcd1xcLV0rKVxccz89XFxzP1snXCJdKFteJ1wiXSspW1wiJ10vZ2ltXG5cblxuICBpZiAoZm4gJiYgcm9vdC5fdGFnKSB7XG4gICAgcm9vdC5fdGFnLnVubW91bnQodHJ1ZSlcbiAgfVxuXG4gIC8vIG5vdCB5ZXQgbW91bnRlZFxuICB0aGlzLmlzTW91bnRlZCA9IGZhbHNlXG5cbiAgaWYgKGltcGwuYXR0cnMpIHtcbiAgICB2YXIgYXR0cnMgPSBpbXBsLmF0dHJzLm1hdGNoKFRBR19BVFRSSUJVVEVTKVxuXG4gICAgZWFjaChhdHRycywgZnVuY3Rpb24oYSkge1xuICAgICAgdmFyIGt2ID0gYS5zcGxpdCgvXFxzPz1cXHM/LylcbiAgICAgIHJvb3Quc2V0QXR0cmlidXRlKGt2WzBdLCBrdlsxXS5yZXBsYWNlKC9bJ1wiXS9nLCAnJykpXG4gICAgfSlcblxuICB9XG5cbiAgLy8ga2VlcCBhIHJlZmVyZW5jZSB0byB0aGUgdGFnIGp1c3QgY3JlYXRlZFxuICAvLyBzbyB3ZSB3aWxsIGJlIGFibGUgdG8gbW91bnQgdGhpcyB0YWcgbXVsdGlwbGUgdGltZXNcbiAgcm9vdC5fdGFnID0gdGhpc1xuXG4gIC8vIGNyZWF0ZSBhIHVuaXF1ZSBpZCB0byB0aGlzIHRhZ1xuICAvLyBpdCBjb3VsZCBiZSBoYW5keSB0byB1c2UgaXQgYWxzbyB0byBpbXByb3ZlIHRoZSB2aXJ0dWFsIGRvbSByZW5kZXJpbmcgc3BlZWRcbiAgdGhpcy5faWQgPSBmYXN0QWJzKH5+KG5ldyBEYXRlKCkuZ2V0VGltZSgpICogTWF0aC5yYW5kb20oKSkpXG5cbiAgZXh0ZW5kKHRoaXMsIHsgcGFyZW50OiBwYXJlbnQsIHJvb3Q6IHJvb3QsIG9wdHM6IG9wdHMsIHRhZ3M6IHt9IH0sIGl0ZW0pXG5cbiAgLy8gZ3JhYiBhdHRyaWJ1dGVzXG4gIGVhY2gocm9vdC5hdHRyaWJ1dGVzLCBmdW5jdGlvbihlbCkge1xuICAgIHZhciB2YWwgPSBlbC52YWx1ZVxuICAgIC8vIHJlbWVtYmVyIGF0dHJpYnV0ZXMgd2l0aCBleHByZXNzaW9ucyBvbmx5XG4gICAgaWYgKGJyYWNrZXRzKC9cXHsuKlxcfS8pLnRlc3QodmFsKSkgYXR0cltlbC5uYW1lXSA9IHZhbFxuICB9KVxuXG4gIGlmIChkb20uaW5uZXJIVE1MICYmICEvc2VsZWN0fHNlbGVjdHxvcHRncm91cHx0Ym9keXx0ci8udGVzdCh0YWdOYW1lKSlcbiAgICAvLyByZXBsYWNlIGFsbCB0aGUgeWllbGQgdGFncyB3aXRoIHRoZSB0YWcgaW5uZXIgaHRtbFxuICAgIGRvbS5pbm5lckhUTUwgPSByZXBsYWNlWWllbGQoZG9tLmlubmVySFRNTCwgaW5uZXJIVE1MKVxuXG4gIC8vIG9wdGlvbnNcbiAgZnVuY3Rpb24gdXBkYXRlT3B0cygpIHtcbiAgICAvLyB1cGRhdGUgb3B0cyBmcm9tIGN1cnJlbnQgRE9NIGF0dHJpYnV0ZXNcbiAgICBlYWNoKHJvb3QuYXR0cmlidXRlcywgZnVuY3Rpb24oZWwpIHtcbiAgICAgIG9wdHNbZWwubmFtZV0gPSB0bXBsKGVsLnZhbHVlLCBwYXJlbnQgfHwgc2VsZilcbiAgICB9KVxuICAgIC8vIHJlY292ZXIgdGhvc2Ugd2l0aCBleHByZXNzaW9uc1xuICAgIGVhY2goT2JqZWN0LmtleXMoYXR0ciksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIG9wdHNbbmFtZV0gPSB0bXBsKGF0dHJbbmFtZV0sIHBhcmVudCB8fCBzZWxmKVxuICAgIH0pXG4gIH1cblxuICB0aGlzLnVwZGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBleHRlbmQoc2VsZiwgZGF0YSlcbiAgICB1cGRhdGVPcHRzKClcbiAgICBzZWxmLnRyaWdnZXIoJ3VwZGF0ZScsIGRhdGEpXG4gICAgdXBkYXRlKGV4cHJlc3Npb25zLCBzZWxmLCBkYXRhKVxuICAgIHNlbGYudHJpZ2dlcigndXBkYXRlZCcpXG4gIH1cblxuICB0aGlzLm1peGluID0gZnVuY3Rpb24oKSB7XG4gICAgZWFjaChhcmd1bWVudHMsIGZ1bmN0aW9uKG1peCkge1xuICAgICAgbWl4ID0gdHlwZW9mIG1peCA9PSAnc3RyaW5nJyA/IHJpb3QubWl4aW4obWl4KSA6IG1peFxuICAgICAgZWFjaChPYmplY3Qua2V5cyhtaXgpLCBmdW5jdGlvbihrZXkpIHtcbiAgICAgICAgLy8gYmluZCBtZXRob2RzIHRvIHNlbGZcbiAgICAgICAgaWYgKGtleSAhPSAnaW5pdCcpXG4gICAgICAgICAgc2VsZltrZXldID0gdHlwZW9mIG1peFtrZXldID09ICdmdW5jdGlvbicgPyBtaXhba2V5XS5iaW5kKHNlbGYpIDogbWl4W2tleV1cbiAgICAgIH0pXG4gICAgICAvLyBpbml0IG1ldGhvZCB3aWxsIGJlIGNhbGxlZCBhdXRvbWF0aWNhbGx5XG4gICAgICBpZiAobWl4LmluaXQpIG1peC5pbml0LmJpbmQoc2VsZikoKVxuICAgIH0pXG4gIH1cblxuICB0aGlzLm1vdW50ID0gZnVuY3Rpb24oKSB7XG5cbiAgICB1cGRhdGVPcHRzKClcblxuICAgIC8vIGluaXRpYWxpYXRpb25cbiAgICBmbiAmJiBmbi5jYWxsKHNlbGYsIG9wdHMpXG5cbiAgICB0b2dnbGUodHJ1ZSlcblxuXG4gICAgLy8gcGFyc2UgbGF5b3V0IGFmdGVyIGluaXQuIGZuIG1heSBjYWxjdWxhdGUgYXJncyBmb3IgbmVzdGVkIGN1c3RvbSB0YWdzXG4gICAgcGFyc2VFeHByZXNzaW9ucyhkb20sIHNlbGYsIGV4cHJlc3Npb25zKVxuXG4gICAgaWYgKCFzZWxmLnBhcmVudCkgc2VsZi51cGRhdGUoKVxuXG4gICAgLy8gaW50ZXJuYWwgdXNlIG9ubHksIGZpeGVzICM0MDNcbiAgICBzZWxmLnRyaWdnZXIoJ3ByZW1vdW50JylcblxuICAgIGlmIChpc0xvb3ApIHtcbiAgICAgIC8vIHVwZGF0ZSB0aGUgcm9vdCBhdHRyaWJ1dGUgZm9yIHRoZSBsb29wZWQgZWxlbWVudHNcbiAgICAgIHNlbGYucm9vdCA9IHJvb3QgPSBsb29wRG9tID0gZG9tLmZpcnN0Q2hpbGRcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKGRvbS5maXJzdENoaWxkKSByb290LmFwcGVuZENoaWxkKGRvbS5maXJzdENoaWxkKVxuICAgICAgaWYgKHJvb3Quc3R1Yikgc2VsZi5yb290ID0gcm9vdCA9IHBhcmVudC5yb290XG4gICAgfVxuICAgIC8vIGlmIGl0J3Mgbm90IGEgY2hpbGQgdGFnIHdlIGNhbiB0cmlnZ2VyIGl0cyBtb3VudCBldmVudFxuICAgIGlmICghc2VsZi5wYXJlbnQgfHwgc2VsZi5wYXJlbnQuaXNNb3VudGVkKSB7XG4gICAgICBzZWxmLmlzTW91bnRlZCA9IHRydWVcbiAgICAgIHNlbGYudHJpZ2dlcignbW91bnQnKVxuICAgIH1cbiAgICAvLyBvdGhlcndpc2Ugd2UgbmVlZCB0byB3YWl0IHRoYXQgdGhlIHBhcmVudCBldmVudCBnZXRzIHRyaWdnZXJlZFxuICAgIGVsc2Ugc2VsZi5wYXJlbnQub25lKCdtb3VudCcsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gYXZvaWQgdG8gdHJpZ2dlciB0aGUgYG1vdW50YCBldmVudCBmb3IgdGhlIHRhZ3NcbiAgICAgIC8vIG5vdCB2aXNpYmxlIGluY2x1ZGVkIGluIGFuIGlmIHN0YXRlbWVudFxuICAgICAgaWYgKCFpc0luU3R1YihzZWxmLnJvb3QpKSB7XG4gICAgICAgIHNlbGYucGFyZW50LmlzTW91bnRlZCA9IHNlbGYuaXNNb3VudGVkID0gdHJ1ZVxuICAgICAgICBzZWxmLnRyaWdnZXIoJ21vdW50JylcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cblxuICB0aGlzLnVubW91bnQgPSBmdW5jdGlvbihrZWVwUm9vdFRhZykge1xuICAgIHZhciBlbCA9IGxvb3BEb20gfHwgcm9vdCxcbiAgICAgICAgcCA9IGVsLnBhcmVudE5vZGVcblxuICAgIGlmIChwKSB7XG5cbiAgICAgIGlmIChwYXJlbnQpIHtcbiAgICAgICAgLy8gcmVtb3ZlIHRoaXMgdGFnIGZyb20gdGhlIHBhcmVudCB0YWdzIG9iamVjdFxuICAgICAgICAvLyBpZiB0aGVyZSBhcmUgbXVsdGlwbGUgbmVzdGVkIHRhZ3Mgd2l0aCBzYW1lIG5hbWUuLlxuICAgICAgICAvLyByZW1vdmUgdGhpcyBlbGVtZW50IGZvcm0gdGhlIGFycmF5XG4gICAgICAgIGlmIChpc0FycmF5KHBhcmVudC50YWdzW3RhZ05hbWVdKSkge1xuICAgICAgICAgIGVhY2gocGFyZW50LnRhZ3NbdGFnTmFtZV0sIGZ1bmN0aW9uKHRhZywgaSkge1xuICAgICAgICAgICAgaWYgKHRhZy5faWQgPT0gc2VsZi5faWQpXG4gICAgICAgICAgICAgIHBhcmVudC50YWdzW3RhZ05hbWVdLnNwbGljZShpLCAxKVxuICAgICAgICAgIH0pXG4gICAgICAgIH0gZWxzZVxuICAgICAgICAgIC8vIG90aGVyd2lzZSBqdXN0IGRlbGV0ZSB0aGUgdGFnIGluc3RhbmNlXG4gICAgICAgICAgcGFyZW50LnRhZ3NbdGFnTmFtZV0gPSB1bmRlZmluZWRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlIChlbC5maXJzdENoaWxkKSBlbC5yZW1vdmVDaGlsZChlbC5maXJzdENoaWxkKVxuICAgICAgfVxuXG4gICAgICBpZiAoIWtlZXBSb290VGFnKVxuICAgICAgICBwLnJlbW92ZUNoaWxkKGVsKVxuXG4gICAgfVxuXG5cbiAgICBzZWxmLnRyaWdnZXIoJ3VubW91bnQnKVxuICAgIHRvZ2dsZSgpXG4gICAgc2VsZi5vZmYoJyonKVxuICAgIC8vIHNvbWVob3cgaWU4IGRvZXMgbm90IGxpa2UgYGRlbGV0ZSByb290Ll90YWdgXG4gICAgcm9vdC5fdGFnID0gbnVsbFxuXG4gIH1cblxuICBmdW5jdGlvbiB0b2dnbGUoaXNNb3VudCkge1xuXG4gICAgLy8gbW91bnQvdW5tb3VudCBjaGlsZHJlblxuICAgIGVhY2goY2hpbGRUYWdzLCBmdW5jdGlvbihjaGlsZCkgeyBjaGlsZFtpc01vdW50ID8gJ21vdW50JyA6ICd1bm1vdW50J10oKSB9KVxuXG4gICAgLy8gbGlzdGVuL3VubGlzdGVuIHBhcmVudCAoZXZlbnRzIGZsb3cgb25lIHdheSBmcm9tIHBhcmVudCB0byBjaGlsZHJlbilcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICB2YXIgZXZ0ID0gaXNNb3VudCA/ICdvbicgOiAnb2ZmJ1xuXG4gICAgICAvLyB0aGUgbG9vcCB0YWdzIHdpbGwgYmUgYWx3YXlzIGluIHN5bmMgd2l0aCB0aGUgcGFyZW50IGF1dG9tYXRpY2FsbHlcbiAgICAgIGlmIChpc0xvb3ApXG4gICAgICAgIHBhcmVudFtldnRdKCd1bm1vdW50Jywgc2VsZi51bm1vdW50KVxuICAgICAgZWxzZVxuICAgICAgICBwYXJlbnRbZXZ0XSgndXBkYXRlJywgc2VsZi51cGRhdGUpW2V2dF0oJ3VubW91bnQnLCBzZWxmLnVubW91bnQpXG4gICAgfVxuICB9XG5cbiAgLy8gbmFtZWQgZWxlbWVudHMgYXZhaWxhYmxlIGZvciBmblxuICBwYXJzZU5hbWVkRWxlbWVudHMoZG9tLCB0aGlzLCBjaGlsZFRhZ3MpXG5cblxufVxuXG5mdW5jdGlvbiBzZXRFdmVudEhhbmRsZXIobmFtZSwgaGFuZGxlciwgZG9tLCB0YWcsIGl0ZW0pIHtcblxuICBkb21bbmFtZV0gPSBmdW5jdGlvbihlKSB7XG5cbiAgICAvLyBjcm9zcyBicm93c2VyIGV2ZW50IGZpeFxuICAgIGUgPSBlIHx8IHdpbmRvdy5ldmVudFxuXG4gICAgaWYgKCFlLndoaWNoKSBlLndoaWNoID0gZS5jaGFyQ29kZSB8fCBlLmtleUNvZGVcbiAgICBpZiAoIWUudGFyZ2V0KSBlLnRhcmdldCA9IGUuc3JjRWxlbWVudFxuXG4gICAgLy8gaWdub3JlIGVycm9yIG9uIHNvbWUgYnJvd3NlcnNcbiAgICB0cnkge1xuICAgICAgZS5jdXJyZW50VGFyZ2V0ID0gZG9tXG4gICAgfSBjYXRjaCAoaWdub3JlZCkgeyAnJyB9XG5cbiAgICBlLml0ZW0gPSB0YWcuX2l0ZW0gPyB0YWcuX2l0ZW0gOiBpdGVtXG5cbiAgICAvLyBwcmV2ZW50IGRlZmF1bHQgYmVoYXZpb3VyIChieSBkZWZhdWx0KVxuICAgIGlmIChoYW5kbGVyLmNhbGwodGFnLCBlKSAhPT0gdHJ1ZSAmJiAhL3JhZGlvfGNoZWNrLy50ZXN0KGRvbS50eXBlKSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCAmJiBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGUucmV0dXJuVmFsdWUgPSBmYWxzZVxuICAgIH1cblxuICAgIGlmICghZS5wcmV2ZW50VXBkYXRlKSB7XG4gICAgICB2YXIgZWwgPSBpdGVtID8gdGFnLnBhcmVudCA6IHRhZ1xuICAgICAgZWwudXBkYXRlKClcbiAgICB9XG5cbiAgfVxuXG59XG5cbi8vIHVzZWQgYnkgaWYtIGF0dHJpYnV0ZVxuZnVuY3Rpb24gaW5zZXJ0VG8ocm9vdCwgbm9kZSwgYmVmb3JlKSB7XG4gIGlmIChyb290KSB7XG4gICAgcm9vdC5pbnNlcnRCZWZvcmUoYmVmb3JlLCBub2RlKVxuICAgIHJvb3QucmVtb3ZlQ2hpbGQobm9kZSlcbiAgfVxufVxuXG4vLyBpdGVtID0gY3VycmVudGx5IGxvb3BlZCBpdGVtXG5mdW5jdGlvbiB1cGRhdGUoZXhwcmVzc2lvbnMsIHRhZywgaXRlbSkge1xuXG4gIGVhY2goZXhwcmVzc2lvbnMsIGZ1bmN0aW9uKGV4cHIsIGkpIHtcblxuICAgIHZhciBkb20gPSBleHByLmRvbSxcbiAgICAgICAgYXR0ck5hbWUgPSBleHByLmF0dHIsXG4gICAgICAgIHZhbHVlID0gdG1wbChleHByLmV4cHIsIHRhZyksXG4gICAgICAgIHBhcmVudCA9IGV4cHIuZG9tLnBhcmVudE5vZGVcblxuICAgIGlmICh2YWx1ZSA9PSBudWxsKSB2YWx1ZSA9ICcnXG5cbiAgICAvLyBsZWF2ZSBvdXQgcmlvdC0gcHJlZml4ZXMgZnJvbSBzdHJpbmdzIGluc2lkZSB0ZXh0YXJlYVxuICAgIGlmIChwYXJlbnQgJiYgcGFyZW50LnRhZ05hbWUgPT0gJ1RFWFRBUkVBJykgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9yaW90LS9nLCAnJylcblxuICAgIC8vIG5vIGNoYW5nZVxuICAgIGlmIChleHByLnZhbHVlID09PSB2YWx1ZSkgcmV0dXJuXG4gICAgZXhwci52YWx1ZSA9IHZhbHVlXG5cbiAgICAvLyB0ZXh0IG5vZGVcbiAgICBpZiAoIWF0dHJOYW1lKSByZXR1cm4gZG9tLm5vZGVWYWx1ZSA9IHZhbHVlLnRvU3RyaW5nKClcblxuICAgIC8vIHJlbW92ZSBvcmlnaW5hbCBhdHRyaWJ1dGVcbiAgICByZW1BdHRyKGRvbSwgYXR0ck5hbWUpXG5cbiAgICAvLyBldmVudCBoYW5kbGVyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICBzZXRFdmVudEhhbmRsZXIoYXR0ck5hbWUsIHZhbHVlLCBkb20sIHRhZywgaXRlbSlcblxuICAgIC8vIGlmLSBjb25kaXRpb25hbFxuICAgIH0gZWxzZSBpZiAoYXR0ck5hbWUgPT0gJ2lmJykge1xuICAgICAgdmFyIHN0dWIgPSBleHByLnN0dWJcblxuICAgICAgLy8gYWRkIHRvIERPTVxuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGlmIChzdHViKSB7XG4gICAgICAgICAgaW5zZXJ0VG8oc3R1Yi5wYXJlbnROb2RlLCBzdHViLCBkb20pXG4gICAgICAgICAgZG9tLmluU3R1YiA9IGZhbHNlXG4gICAgICAgICAgLy8gYXZvaWQgdG8gdHJpZ2dlciB0aGUgbW91bnQgZXZlbnQgaWYgdGhlIHRhZ3MgaXMgbm90IHZpc2libGUgeWV0XG4gICAgICAgICAgLy8gbWF5YmUgd2UgY2FuIG9wdGltaXplIHRoaXMgYXZvaWRpbmcgdG8gbW91bnQgdGhlIHRhZyBhdCBhbGxcbiAgICAgICAgICBpZiAoIWlzSW5TdHViKGRvbSkpIHtcbiAgICAgICAgICAgIHdhbGsoZG9tLCBmdW5jdGlvbihlbCkge1xuICAgICAgICAgICAgICBpZiAoZWwuX3RhZyAmJiAhZWwuX3RhZy5pc01vdW50ZWQpIGVsLl90YWcuaXNNb3VudGVkID0gISFlbC5fdGFnLnRyaWdnZXIoJ21vdW50JylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAvLyByZW1vdmUgZnJvbSBET01cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0dWIgPSBleHByLnN0dWIgPSBzdHViIHx8IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcnKVxuICAgICAgICBpbnNlcnRUbyhkb20ucGFyZW50Tm9kZSwgZG9tLCBzdHViKVxuICAgICAgICBkb20uaW5TdHViID0gdHJ1ZVxuICAgICAgfVxuICAgIC8vIHNob3cgLyBoaWRlXG4gICAgfSBlbHNlIGlmICgvXihzaG93fGhpZGUpJC8udGVzdChhdHRyTmFtZSkpIHtcbiAgICAgIGlmIChhdHRyTmFtZSA9PSAnaGlkZScpIHZhbHVlID0gIXZhbHVlXG4gICAgICBkb20uc3R5bGUuZGlzcGxheSA9IHZhbHVlID8gJycgOiAnbm9uZSdcblxuICAgIC8vIGZpZWxkIHZhbHVlXG4gICAgfSBlbHNlIGlmIChhdHRyTmFtZSA9PSAndmFsdWUnKSB7XG4gICAgICBkb20udmFsdWUgPSB2YWx1ZVxuXG4gICAgLy8gPGltZyBzcmM9XCJ7IGV4cHIgfVwiPlxuICAgIH0gZWxzZSBpZiAoYXR0ck5hbWUuc2xpY2UoMCwgNSkgPT0gJ3Jpb3QtJyAmJiBhdHRyTmFtZSAhPSAncmlvdC10YWcnKSB7XG4gICAgICBhdHRyTmFtZSA9IGF0dHJOYW1lLnNsaWNlKDUpXG4gICAgICB2YWx1ZSA/IGRvbS5zZXRBdHRyaWJ1dGUoYXR0ck5hbWUsIHZhbHVlKSA6IHJlbUF0dHIoZG9tLCBhdHRyTmFtZSlcblxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoZXhwci5ib29sKSB7XG4gICAgICAgIGRvbVthdHRyTmFtZV0gPSB2YWx1ZVxuICAgICAgICBpZiAoIXZhbHVlKSByZXR1cm5cbiAgICAgICAgdmFsdWUgPSBhdHRyTmFtZVxuICAgICAgfVxuXG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9ICdvYmplY3QnKSBkb20uc2V0QXR0cmlidXRlKGF0dHJOYW1lLCB2YWx1ZSlcblxuICAgIH1cblxuICB9KVxuXG59XG5cbmZ1bmN0aW9uIGVhY2goZWxzLCBmbikge1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gKGVscyB8fCBbXSkubGVuZ3RoLCBlbDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZWwgPSBlbHNbaV1cbiAgICAvLyByZXR1cm4gZmFsc2UgLT4gcmVtb3ZlIGN1cnJlbnQgaXRlbSBkdXJpbmcgbG9vcFxuICAgIGlmIChlbCAhPSBudWxsICYmIGZuKGVsLCBpKSA9PT0gZmFsc2UpIGktLVxuICB9XG4gIHJldHVybiBlbHNcbn1cblxuZnVuY3Rpb24gaXNGdW5jdGlvbih2KSB7XG4gIHJldHVybiB0eXBlb2YgdiA9PT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZSAgIC8vIGF2b2lkIElFIHByb2JsZW1zXG59XG5cbmZ1bmN0aW9uIHJlbUF0dHIoZG9tLCBuYW1lKSB7XG4gIGRvbS5yZW1vdmVBdHRyaWJ1dGUobmFtZSlcbn1cblxuZnVuY3Rpb24gZmFzdEFicyhucikge1xuICByZXR1cm4gKG5yIF4gKG5yID4+IDMxKSkgLSAobnIgPj4gMzEpXG59XG5cbmZ1bmN0aW9uIGdldFRhZ05hbWUoZG9tKSB7XG4gIHZhciBjaGlsZCA9IGdldFRhZyhkb20pLFxuICAgIG5hbWVkVGFnID0gZG9tLmdldEF0dHJpYnV0ZSgnbmFtZScpLFxuICAgIHRhZ05hbWUgPSBuYW1lZFRhZyAmJiBuYW1lZFRhZy5pbmRleE9mKGJyYWNrZXRzKDApKSA8IDAgPyBuYW1lZFRhZyA6IGNoaWxkLm5hbWVcblxuICByZXR1cm4gdGFnTmFtZVxufVxuXG5mdW5jdGlvbiBleHRlbmQoc3JjKSB7XG4gIHZhciBvYmosIGFyZ3MgPSBhcmd1bWVudHNcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChvYmogPSBhcmdzW2ldKSkge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikgeyAgICAgIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZ3VhcmQtZm9yLWluXG4gICAgICAgIHNyY1trZXldID0gb2JqW2tleV1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHNyY1xufVxuXG5mdW5jdGlvbiBta2RvbSh0ZW1wbGF0ZSkge1xuICB2YXIgY2hlY2tpZSA9IGllVmVyc2lvbiAmJiBpZVZlcnNpb24gPCAxMCxcbiAgICAgIG1hdGNoZXMgPSAvXlxccyo8KFtcXHctXSspLy5leGVjKHRlbXBsYXRlKSxcbiAgICAgIHRhZ05hbWUgPSBtYXRjaGVzID8gbWF0Y2hlc1sxXS50b0xvd2VyQ2FzZSgpIDogJycsXG4gICAgICByb290VGFnID0gKHRhZ05hbWUgPT09ICd0aCcgfHwgdGFnTmFtZSA9PT0gJ3RkJykgPyAndHInIDpcbiAgICAgICAgICAgICAgICAodGFnTmFtZSA9PT0gJ3RyJyA/ICd0Ym9keScgOiAnZGl2JyksXG4gICAgICBlbCA9IG1rRWwocm9vdFRhZylcblxuICBlbC5zdHViID0gdHJ1ZVxuXG4gIGlmIChjaGVja2llKSB7XG4gICAgaWYgKHRhZ05hbWUgPT09ICdvcHRncm91cCcpXG4gICAgICBvcHRncm91cElubmVySFRNTChlbCwgdGVtcGxhdGUpXG4gICAgZWxzZSBpZiAodGFnTmFtZSA9PT0gJ29wdGlvbicpXG4gICAgICBvcHRpb25Jbm5lckhUTUwoZWwsIHRlbXBsYXRlKVxuICAgIGVsc2UgaWYgKHJvb3RUYWcgIT09ICdkaXYnKVxuICAgICAgdGJvZHlJbm5lckhUTUwoZWwsIHRlbXBsYXRlLCB0YWdOYW1lKVxuICAgIGVsc2VcbiAgICAgIGNoZWNraWUgPSAwXG4gIH1cbiAgaWYgKCFjaGVja2llKSBlbC5pbm5lckhUTUwgPSB0ZW1wbGF0ZVxuXG4gIHJldHVybiBlbFxufVxuXG5mdW5jdGlvbiB3YWxrKGRvbSwgZm4pIHtcbiAgaWYgKGRvbSkge1xuICAgIGlmIChmbihkb20pID09PSBmYWxzZSkgd2Fsayhkb20ubmV4dFNpYmxpbmcsIGZuKVxuICAgIGVsc2Uge1xuICAgICAgZG9tID0gZG9tLmZpcnN0Q2hpbGRcblxuICAgICAgd2hpbGUgKGRvbSkge1xuICAgICAgICB3YWxrKGRvbSwgZm4pXG4gICAgICAgIGRvbSA9IGRvbS5uZXh0U2libGluZ1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBpc0luU3R1Yihkb20pIHtcbiAgd2hpbGUgKGRvbSkge1xuICAgIGlmIChkb20uaW5TdHViKSByZXR1cm4gdHJ1ZVxuICAgIGRvbSA9IGRvbS5wYXJlbnROb2RlXG4gIH1cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmZ1bmN0aW9uIG1rRWwobmFtZSkge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxufVxuXG5mdW5jdGlvbiByZXBsYWNlWWllbGQgKHRtcGwsIGlubmVySFRNTCkge1xuICByZXR1cm4gdG1wbC5yZXBsYWNlKC88KHlpZWxkKVxcLz8+KDxcXC9cXDE+KT8vZ2ltLCBpbm5lckhUTUwgfHwgJycpXG59XG5cbmZ1bmN0aW9uICQkKHNlbGVjdG9yLCBjdHgpIHtcbiAgcmV0dXJuIChjdHggfHwgZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpXG59XG5cbmZ1bmN0aW9uIGluaGVyaXQocGFyZW50KSB7XG4gIGZ1bmN0aW9uIENoaWxkKCkge31cbiAgQ2hpbGQucHJvdG90eXBlID0gcGFyZW50XG4gIHJldHVybiBuZXcgQ2hpbGQoKVxufVxuXG5mdW5jdGlvbiBzZXROYW1lZChkb20sIHBhcmVudCwga2V5cykge1xuICBlYWNoKGRvbS5hdHRyaWJ1dGVzLCBmdW5jdGlvbihhdHRyKSB7XG4gICAgaWYgKGRvbS5fdmlzaXRlZCkgcmV0dXJuXG4gICAgaWYgKGF0dHIubmFtZSA9PT0gJ2lkJyB8fCBhdHRyLm5hbWUgPT09ICduYW1lJykge1xuICAgICAgZG9tLl92aXNpdGVkID0gdHJ1ZVxuICAgICAgdmFyIHAsIHYgPSBhdHRyLnZhbHVlXG4gICAgICBpZiAofmtleXMuaW5kZXhPZih2KSkgcmV0dXJuXG5cbiAgICAgIHAgPSBwYXJlbnRbdl1cbiAgICAgIGlmICghcClcbiAgICAgICAgcGFyZW50W3ZdID0gZG9tXG4gICAgICBlbHNlXG4gICAgICAgIGlzQXJyYXkocCkgPyBwLnB1c2goZG9tKSA6IChwYXJlbnRbdl0gPSBbcCwgZG9tXSlcbiAgICB9XG4gIH0pXG59XG4vKipcbiAqXG4gKiBIYWNrcyBuZWVkZWQgZm9yIHRoZSBvbGQgaW50ZXJuZXQgZXhwbG9yZXIgdmVyc2lvbnMgW2xvd2VyIHRoYW4gSUUxMF1cbiAqXG4gKi9cblxuZnVuY3Rpb24gdGJvZHlJbm5lckhUTUwoZWwsIGh0bWwsIHRhZ05hbWUpIHtcbiAgdmFyIGRpdiA9IG1rRWwoJ2RpdicpLFxuICAgICAgbG9vcHMgPSAvdGR8dGgvLnRlc3QodGFnTmFtZSkgPyAzIDogMixcbiAgICAgIGNoaWxkXG5cbiAgZGl2LmlubmVySFRNTCA9ICc8dGFibGU+JyArIGh0bWwgKyAnPC90YWJsZT4nXG4gIGNoaWxkID0gZGl2LmZpcnN0Q2hpbGRcblxuICB3aGlsZSAobG9vcHMtLSkge1xuICAgIGNoaWxkID0gY2hpbGQuZmlyc3RDaGlsZFxuICB9XG5cbiAgZWwuYXBwZW5kQ2hpbGQoY2hpbGQpXG5cbn1cblxuZnVuY3Rpb24gb3B0aW9uSW5uZXJIVE1MKGVsLCBodG1sKSB7XG4gIHZhciBvcHQgPSBta0VsKCdvcHRpb24nKSxcbiAgICAgIHZhbFJlZ3ggPSAvdmFsdWU9W1xcXCInXSguKz8pW1xcXCInXS8sXG4gICAgICBzZWxSZWd4ID0gL3NlbGVjdGVkPVtcXFwiJ10oLis/KVtcXFwiJ10vLFxuICAgICAgZWFjaFJlZ3ggPSAvZWFjaD1bXFxcIiddKC4rPylbXFxcIiddLyxcbiAgICAgIGlmUmVneCA9IC9pZj1bXFxcIiddKC4rPylbXFxcIiddLyxcbiAgICAgIGlubmVyUmVneCA9IC8+KFtePF0qKTwvLFxuICAgICAgdmFsdWVzTWF0Y2ggPSBodG1sLm1hdGNoKHZhbFJlZ3gpLFxuICAgICAgc2VsZWN0ZWRNYXRjaCA9IGh0bWwubWF0Y2goc2VsUmVneCksXG4gICAgICBpbm5lclZhbHVlID0gaHRtbC5tYXRjaChpbm5lclJlZ3gpLFxuICAgICAgZWFjaE1hdGNoID0gaHRtbC5tYXRjaChlYWNoUmVneCksXG4gICAgICBpZk1hdGNoID0gaHRtbC5tYXRjaChpZlJlZ3gpXG5cbiAgaWYgKGlubmVyVmFsdWUpIHtcbiAgICBvcHQuaW5uZXJIVE1MID0gaW5uZXJWYWx1ZVsxXVxuICB9IGVsc2Uge1xuICAgIG9wdC5pbm5lckhUTUwgPSBodG1sXG4gIH1cblxuICBpZiAodmFsdWVzTWF0Y2gpIHtcbiAgICBvcHQudmFsdWUgPSB2YWx1ZXNNYXRjaFsxXVxuICB9XG5cbiAgaWYgKHNlbGVjdGVkTWF0Y2gpIHtcbiAgICBvcHQuc2V0QXR0cmlidXRlKCdyaW90LXNlbGVjdGVkJywgc2VsZWN0ZWRNYXRjaFsxXSlcbiAgfVxuXG4gIGlmIChlYWNoTWF0Y2gpIHtcbiAgICBvcHQuc2V0QXR0cmlidXRlKCdlYWNoJywgZWFjaE1hdGNoWzFdKVxuICB9XG5cbiAgaWYgKGlmTWF0Y2gpIHtcbiAgICBvcHQuc2V0QXR0cmlidXRlKCdpZicsIGlmTWF0Y2hbMV0pXG4gIH1cblxuICBlbC5hcHBlbmRDaGlsZChvcHQpXG59XG5cbmZ1bmN0aW9uIG9wdGdyb3VwSW5uZXJIVE1MKGVsLCBodG1sKSB7XG4gIHZhciBvcHQgPSBta0VsKCdvcHRncm91cCcpLFxuICAgICAgbGFiZWxSZWd4ID0gL2xhYmVsPVtcXFwiJ10oLis/KVtcXFwiJ10vLFxuICAgICAgZWxlbWVudFJlZ3ggPSAvXjwoW14+XSopPi8sXG4gICAgICB0YWdSZWd4ID0gL148KFteIFxcPl0qKS8sXG4gICAgICBsYWJlbE1hdGNoID0gaHRtbC5tYXRjaChsYWJlbFJlZ3gpLFxuICAgICAgZWxlbWVudE1hdGNoID0gaHRtbC5tYXRjaChlbGVtZW50UmVneCksXG4gICAgICB0YWdNYXRjaCA9IGh0bWwubWF0Y2godGFnUmVneCksXG4gICAgICBpbm5lckNvbnRlbnQgPSBodG1sXG5cbiAgaWYgKGVsZW1lbnRNYXRjaCkge1xuICAgIHZhciBvcHRpb25zID0gaHRtbC5zbGljZShlbGVtZW50TWF0Y2hbMV0ubGVuZ3RoKzIsIC10YWdNYXRjaFsxXS5sZW5ndGgtMykudHJpbSgpXG4gICAgaW5uZXJDb250ZW50ID0gb3B0aW9uc1xuICB9XG5cbiAgaWYgKGxhYmVsTWF0Y2gpIHtcbiAgICBvcHQuc2V0QXR0cmlidXRlKCdyaW90LWxhYmVsJywgbGFiZWxNYXRjaFsxXSlcbiAgfVxuXG4gIGlmIChpbm5lckNvbnRlbnQpIHtcbiAgICB2YXIgaW5uZXJPcHQgPSBta0VsKCdkaXYnKVxuXG4gICAgb3B0aW9uSW5uZXJIVE1MKGlubmVyT3B0LCBpbm5lckNvbnRlbnQpXG5cbiAgICBvcHQuYXBwZW5kQ2hpbGQoaW5uZXJPcHQuZmlyc3RDaGlsZClcbiAgfVxuXG4gIGVsLmFwcGVuZENoaWxkKG9wdClcbn1cblxuLypcbiBWaXJ0dWFsIGRvbSBpcyBhbiBhcnJheSBvZiBjdXN0b20gdGFncyBvbiB0aGUgZG9jdW1lbnQuXG4gVXBkYXRlcyBhbmQgdW5tb3VudHMgcHJvcGFnYXRlIGRvd253YXJkcyBmcm9tIHBhcmVudCB0byBjaGlsZHJlbi5cbiovXG5cbnZhciB2aXJ0dWFsRG9tID0gW10sXG4gICAgdGFnSW1wbCA9IHt9LFxuICAgIHN0eWxlTm9kZVxuXG52YXIgUklPVF9UQUcgPSAncmlvdC10YWcnXG5cbmZ1bmN0aW9uIGdldFRhZyhkb20pIHtcbiAgcmV0dXJuIHRhZ0ltcGxbZG9tLmdldEF0dHJpYnV0ZShSSU9UX1RBRykgfHwgZG9tLnRhZ05hbWUudG9Mb3dlckNhc2UoKV1cbn1cblxuZnVuY3Rpb24gaW5qZWN0U3R5bGUoY3NzKSB7XG5cbiAgc3R5bGVOb2RlID0gc3R5bGVOb2RlIHx8IG1rRWwoJ3N0eWxlJylcblxuICBpZiAoIWRvY3VtZW50LmhlYWQpIHJldHVyblxuXG4gIGlmIChzdHlsZU5vZGUuc3R5bGVTaGVldClcbiAgICBzdHlsZU5vZGUuc3R5bGVTaGVldC5jc3NUZXh0ICs9IGNzc1xuICBlbHNlXG4gICAgc3R5bGVOb2RlLmlubmVySFRNTCArPSBjc3NcblxuICBpZiAoIXN0eWxlTm9kZS5fcmVuZGVyZWQpXG4gICAgaWYgKHN0eWxlTm9kZS5zdHlsZVNoZWV0KSB7XG4gICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHN0eWxlTm9kZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJzID0gJCQoJ3N0eWxlW3R5cGU9cmlvdF0nKVswXVxuICAgICAgaWYgKHJzKSB7XG4gICAgICAgIHJzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlTm9kZSwgcnMpXG4gICAgICAgIHJzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocnMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHN0eWxlTm9kZSlcbiAgICAgIH1cbiAgICB9XG5cbiAgc3R5bGVOb2RlLl9yZW5kZXJlZCA9IHRydWVcblxufVxuXG5mdW5jdGlvbiBtb3VudFRvKHJvb3QsIHRhZ05hbWUsIG9wdHMpIHtcbiAgdmFyIHRhZyA9IHRhZ0ltcGxbdGFnTmFtZV0sXG4gICAgICAvLyBjYWNoZSB0aGUgaW5uZXIgSFRNTCB0byBmaXggIzg1NVxuICAgICAgaW5uZXJIVE1MID0gcm9vdC5faW5uZXJIVE1MID0gcm9vdC5faW5uZXJIVE1MIHx8IHJvb3QuaW5uZXJIVE1MXG5cbiAgLy8gY2xlYXIgdGhlIGlubmVyIGh0bWxcbiAgcm9vdC5pbm5lckhUTUwgPSAnJ1xuXG4gIGlmICh0YWcgJiYgcm9vdCkgdGFnID0gbmV3IFRhZyh0YWcsIHsgcm9vdDogcm9vdCwgb3B0czogb3B0cyB9LCBpbm5lckhUTUwpXG5cbiAgaWYgKHRhZyAmJiB0YWcubW91bnQpIHtcbiAgICB0YWcubW91bnQoKVxuICAgIHZpcnR1YWxEb20ucHVzaCh0YWcpXG4gICAgcmV0dXJuIHRhZy5vbigndW5tb3VudCcsIGZ1bmN0aW9uKCkge1xuICAgICAgdmlydHVhbERvbS5zcGxpY2UodmlydHVhbERvbS5pbmRleE9mKHRhZyksIDEpXG4gICAgfSlcbiAgfVxuXG59XG5cbnJpb3QudGFnID0gZnVuY3Rpb24obmFtZSwgaHRtbCwgY3NzLCBhdHRycywgZm4pIHtcbiAgaWYgKGlzRnVuY3Rpb24oYXR0cnMpKSB7XG4gICAgZm4gPSBhdHRyc1xuICAgIGlmICgvXltcXHdcXC1dK1xccz89Ly50ZXN0KGNzcykpIHtcbiAgICAgIGF0dHJzID0gY3NzXG4gICAgICBjc3MgPSAnJ1xuICAgIH0gZWxzZSBhdHRycyA9ICcnXG4gIH1cbiAgaWYgKGNzcykge1xuICAgIGlmIChpc0Z1bmN0aW9uKGNzcykpIGZuID0gY3NzXG4gICAgZWxzZSBpbmplY3RTdHlsZShjc3MpXG4gIH1cbiAgdGFnSW1wbFtuYW1lXSA9IHsgbmFtZTogbmFtZSwgdG1wbDogaHRtbCwgYXR0cnM6IGF0dHJzLCBmbjogZm4gfVxuICByZXR1cm4gbmFtZVxufVxuXG5yaW90Lm1vdW50ID0gZnVuY3Rpb24oc2VsZWN0b3IsIHRhZ05hbWUsIG9wdHMpIHtcblxuICB2YXIgZWxzLFxuICAgICAgYWxsVGFncyxcbiAgICAgIHRhZ3MgPSBbXVxuXG4gIC8vIGhlbHBlciBmdW5jdGlvbnNcblxuICBmdW5jdGlvbiBhZGRSaW90VGFncyhhcnIpIHtcbiAgICB2YXIgbGlzdCA9ICcnXG4gICAgZWFjaChhcnIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBsaXN0ICs9ICcsICpbcmlvdC10YWc9XCInKyBlLnRyaW0oKSArICdcIl0nXG4gICAgfSlcbiAgICByZXR1cm4gbGlzdFxuICB9XG5cbiAgZnVuY3Rpb24gc2VsZWN0QWxsVGFncygpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRhZ0ltcGwpXG4gICAgcmV0dXJuIGtleXMgKyBhZGRSaW90VGFncyhrZXlzKVxuICB9XG5cbiAgZnVuY3Rpb24gcHVzaFRhZ3Mocm9vdCkge1xuICAgIGlmIChyb290LnRhZ05hbWUpIHtcbiAgICAgIGlmICh0YWdOYW1lICYmICFyb290LmdldEF0dHJpYnV0ZShSSU9UX1RBRykpXG4gICAgICAgIHJvb3Quc2V0QXR0cmlidXRlKFJJT1RfVEFHLCB0YWdOYW1lKVxuXG4gICAgICB2YXIgdGFnID0gbW91bnRUbyhyb290LFxuICAgICAgICB0YWdOYW1lIHx8IHJvb3QuZ2V0QXR0cmlidXRlKFJJT1RfVEFHKSB8fCByb290LnRhZ05hbWUudG9Mb3dlckNhc2UoKSwgb3B0cylcblxuICAgICAgaWYgKHRhZykgdGFncy5wdXNoKHRhZylcbiAgICB9XG4gICAgZWxzZSBpZiAocm9vdC5sZW5ndGgpIHtcbiAgICAgIGVhY2gocm9vdCwgcHVzaFRhZ3MpICAgLy8gYXNzdW1lIG5vZGVMaXN0XG4gICAgfVxuICB9XG5cbiAgLy8gLS0tLS0gbW91bnQgY29kZSAtLS0tLVxuXG4gIGlmICh0eXBlb2YgdGFnTmFtZSA9PT0gVF9PQkpFQ1QpIHtcbiAgICBvcHRzID0gdGFnTmFtZVxuICAgIHRhZ05hbWUgPSAwXG4gIH1cblxuICAvLyBjcmF3bCB0aGUgRE9NIHRvIGZpbmQgdGhlIHRhZ1xuICBpZiAodHlwZW9mIHNlbGVjdG9yID09PSBUX1NUUklORykge1xuICAgIGlmIChzZWxlY3RvciA9PT0gJyonKSB7XG4gICAgICAvLyBzZWxlY3QgYWxsIHRoZSB0YWdzIHJlZ2lzdGVyZWRcbiAgICAgIC8vIGFuZCBhbHNvIHRoZSB0YWdzIGZvdW5kIHdpdGggdGhlIHJpb3QtdGFnIGF0dHJpYnV0ZSBzZXRcbiAgICAgIHNlbGVjdG9yID0gYWxsVGFncyA9IHNlbGVjdEFsbFRhZ3MoKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBvciBqdXN0IHRoZSBvbmVzIG5hbWVkIGxpa2UgdGhlIHNlbGVjdG9yXG4gICAgICBzZWxlY3RvciArPSBhZGRSaW90VGFncyhzZWxlY3Rvci5zcGxpdCgnLCcpKVxuICAgIH1cbiAgICBlbHMgPSAkJChzZWxlY3RvcilcbiAgfVxuICBlbHNlXG4gICAgLy8gcHJvYmFibHkgeW91IGhhdmUgcGFzc2VkIGFscmVhZHkgYSB0YWcgb3IgYSBOb2RlTGlzdFxuICAgIGVscyA9IHNlbGVjdG9yXG5cbiAgLy8gc2VsZWN0IGFsbCB0aGUgcmVnaXN0ZXJlZCBhbmQgbW91bnQgdGhlbSBpbnNpZGUgdGhlaXIgcm9vdCBlbGVtZW50c1xuICBpZiAodGFnTmFtZSA9PT0gJyonKSB7XG4gICAgLy8gZ2V0IGFsbCBjdXN0b20gdGFnc1xuICAgIHRhZ05hbWUgPSBhbGxUYWdzIHx8IHNlbGVjdEFsbFRhZ3MoKVxuICAgIC8vIGlmIHRoZSByb290IGVscyBpdCdzIGp1c3QgYSBzaW5nbGUgdGFnXG4gICAgaWYgKGVscy50YWdOYW1lKSB7XG4gICAgICBlbHMgPSAkJCh0YWdOYW1lLCBlbHMpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIHNlbGVjdCBhbGwgdGhlIGNoaWxkcmVuIGZvciBhbGwgdGhlIGRpZmZlcmVudCByb290IGVsZW1lbnRzXG4gICAgICB2YXIgbm9kZUxpc3QgPSBbXVxuICAgICAgZWFjaChlbHMsIGZ1bmN0aW9uIChfZWwpIHtcbiAgICAgICAgbm9kZUxpc3QucHVzaCgkJCh0YWdOYW1lLCBfZWwpKVxuICAgICAgfSlcbiAgICAgIGVscyA9IG5vZGVMaXN0XG4gICAgfVxuICAgIC8vIGdldCByaWQgb2YgdGhlIHRhZ05hbWVcbiAgICB0YWdOYW1lID0gMFxuICB9XG5cbiAgaWYgKGVscy50YWdOYW1lKVxuICAgIHB1c2hUYWdzKGVscylcbiAgZWxzZVxuICAgIGVhY2goZWxzLCBwdXNoVGFncylcblxuICByZXR1cm4gdGFnc1xufVxuXG4vLyB1cGRhdGUgZXZlcnl0aGluZ1xucmlvdC51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGVhY2godmlydHVhbERvbSwgZnVuY3Rpb24odGFnKSB7XG4gICAgdGFnLnVwZGF0ZSgpXG4gIH0pXG59XG5cbi8vIEBkZXByZWNhdGVkXG5yaW90Lm1vdW50VG8gPSByaW90Lm1vdW50XG5cblxuICAvLyBzaGFyZSBtZXRob2RzIGZvciBvdGhlciByaW90IHBhcnRzLCBlLmcuIGNvbXBpbGVyXG4gIHJpb3QudXRpbCA9IHsgYnJhY2tldHM6IGJyYWNrZXRzLCB0bXBsOiB0bXBsIH1cblxuICAvLyBzdXBwb3J0IENvbW1vbkpTLCBBTUQgJiBicm93c2VyXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG4gICAgbW9kdWxlLmV4cG9ydHMgPSByaW90XG4gIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZClcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7IHJldHVybiByaW90IH0pXG4gIGVsc2VcbiAgICB3aW5kb3cucmlvdCA9IHJpb3RcblxufSkodHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHVuZGVmaW5lZCk7XG5cbn0se31dLDM6W2Z1bmN0aW9uKHJlcXVpcmUsbW9kdWxlLGV4cG9ydHMpe1xuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBFbWl0dGVyID0gcmVxdWlyZSgnZW1pdHRlcicpO1xudmFyIHJlZHVjZSA9IHJlcXVpcmUoJ3JlZHVjZScpO1xuXG4vKipcbiAqIFJvb3QgcmVmZXJlbmNlIGZvciBpZnJhbWVzLlxuICovXG5cbnZhciByb290ID0gJ3VuZGVmaW5lZCcgPT0gdHlwZW9mIHdpbmRvd1xuICA/ICh0aGlzIHx8IHNlbGYpXG4gIDogd2luZG93O1xuXG4vKipcbiAqIE5vb3AuXG4gKi9cblxuZnVuY3Rpb24gbm9vcCgpe307XG5cbi8qKlxuICogQ2hlY2sgaWYgYG9iamAgaXMgYSBob3N0IG9iamVjdCxcbiAqIHdlIGRvbid0IHdhbnQgdG8gc2VyaWFsaXplIHRoZXNlIDopXG4gKlxuICogVE9ETzogZnV0dXJlIHByb29mLCBtb3ZlIHRvIGNvbXBvZW50IGxhbmRcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaXNIb3N0KG9iaikge1xuICB2YXIgc3RyID0ge30udG9TdHJpbmcuY2FsbChvYmopO1xuXG4gIHN3aXRjaCAoc3RyKSB7XG4gICAgY2FzZSAnW29iamVjdCBGaWxlXSc6XG4gICAgY2FzZSAnW29iamVjdCBCbG9iXSc6XG4gICAgY2FzZSAnW29iamVjdCBGb3JtRGF0YV0nOlxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIERldGVybWluZSBYSFIuXG4gKi9cblxucmVxdWVzdC5nZXRYSFIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmIChyb290LlhNTEh0dHBSZXF1ZXN0XG4gICAgICAmJiAoIXJvb3QubG9jYXRpb24gfHwgJ2ZpbGU6JyAhPSByb290LmxvY2F0aW9uLnByb3RvY29sXG4gICAgICAgICAgfHwgIXJvb3QuQWN0aXZlWE9iamVjdCkpIHtcbiAgICByZXR1cm4gbmV3IFhNTEh0dHBSZXF1ZXN0O1xuICB9IGVsc2Uge1xuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTWljcm9zb2Z0LlhNTEhUVFAnKTsgfSBjYXRjaChlKSB7fVxuICAgIHRyeSB7IHJldHVybiBuZXcgQWN0aXZlWE9iamVjdCgnTXN4bWwyLlhNTEhUVFAuNi4wJyk7IH0gY2F0Y2goZSkge31cbiAgICB0cnkgeyByZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01zeG1sMi5YTUxIVFRQLjMuMCcpOyB9IGNhdGNoKGUpIHt9XG4gICAgdHJ5IHsgcmV0dXJuIG5ldyBBY3RpdmVYT2JqZWN0KCdNc3htbDIuWE1MSFRUUCcpOyB9IGNhdGNoKGUpIHt9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBSZW1vdmVzIGxlYWRpbmcgYW5kIHRyYWlsaW5nIHdoaXRlc3BhY2UsIGFkZGVkIHRvIHN1cHBvcnQgSUUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHNcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbnZhciB0cmltID0gJycudHJpbVxuICA/IGZ1bmN0aW9uKHMpIHsgcmV0dXJuIHMudHJpbSgpOyB9XG4gIDogZnVuY3Rpb24ocykgeyByZXR1cm4gcy5yZXBsYWNlKC8oXlxccyp8XFxzKiQpL2csICcnKTsgfTtcblxuLyoqXG4gKiBDaGVjayBpZiBgb2JqYCBpcyBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICByZXR1cm4gb2JqID09PSBPYmplY3Qob2JqKTtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGdpdmVuIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlcmlhbGl6ZShvYmopIHtcbiAgaWYgKCFpc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChudWxsICE9IG9ialtrZXldKSB7XG4gICAgICBwYWlycy5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChrZXkpXG4gICAgICAgICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KG9ialtrZXldKSk7XG4gICAgfVxuICB9XG4gIHJldHVybiBwYWlycy5qb2luKCcmJyk7XG59XG5cbi8qKlxuICogRXhwb3NlIHNlcmlhbGl6YXRpb24gbWV0aG9kLlxuICovXG5cbiByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdCA9IHNlcmlhbGl6ZTtcblxuIC8qKlxuICAqIFBhcnNlIHRoZSBnaXZlbiB4LXd3dy1mb3JtLXVybGVuY29kZWQgYHN0cmAuXG4gICpcbiAgKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gICogQHJldHVybiB7T2JqZWN0fVxuICAqIEBhcGkgcHJpdmF0ZVxuICAqL1xuXG5mdW5jdGlvbiBwYXJzZVN0cmluZyhzdHIpIHtcbiAgdmFyIG9iaiA9IHt9O1xuICB2YXIgcGFpcnMgPSBzdHIuc3BsaXQoJyYnKTtcbiAgdmFyIHBhcnRzO1xuICB2YXIgcGFpcjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgcGFydHMgPSBwYWlyLnNwbGl0KCc9Jyk7XG4gICAgb2JqW2RlY29kZVVSSUNvbXBvbmVudChwYXJ0c1swXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhcnRzWzFdKTtcbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogRXhwb3NlIHBhcnNlci5cbiAqL1xuXG5yZXF1ZXN0LnBhcnNlU3RyaW5nID0gcGFyc2VTdHJpbmc7XG5cbi8qKlxuICogRGVmYXVsdCBNSU1FIHR5cGUgbWFwLlxuICpcbiAqICAgICBzdXBlcmFnZW50LnR5cGVzLnhtbCA9ICdhcHBsaWNhdGlvbi94bWwnO1xuICpcbiAqL1xuXG5yZXF1ZXN0LnR5cGVzID0ge1xuICBodG1sOiAndGV4dC9odG1sJyxcbiAganNvbjogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICB4bWw6ICdhcHBsaWNhdGlvbi94bWwnLFxuICB1cmxlbmNvZGVkOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0nOiAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJyxcbiAgJ2Zvcm0tZGF0YSc6ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnXG59O1xuXG4vKipcbiAqIERlZmF1bHQgc2VyaWFsaXphdGlvbiBtYXAuXG4gKlxuICogICAgIHN1cGVyYWdlbnQuc2VyaWFsaXplWydhcHBsaWNhdGlvbi94bWwnXSA9IGZ1bmN0aW9uKG9iail7XG4gKiAgICAgICByZXR1cm4gJ2dlbmVyYXRlZCB4bWwgaGVyZSc7XG4gKiAgICAgfTtcbiAqXG4gKi9cblxuIHJlcXVlc3Quc2VyaWFsaXplID0ge1xuICAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHNlcmlhbGl6ZSxcbiAgICdhcHBsaWNhdGlvbi9qc29uJzogSlNPTi5zdHJpbmdpZnlcbiB9O1xuXG4gLyoqXG4gICogRGVmYXVsdCBwYXJzZXJzLlxuICAqXG4gICogICAgIHN1cGVyYWdlbnQucGFyc2VbJ2FwcGxpY2F0aW9uL3htbCddID0gZnVuY3Rpb24oc3RyKXtcbiAgKiAgICAgICByZXR1cm4geyBvYmplY3QgcGFyc2VkIGZyb20gc3RyIH07XG4gICogICAgIH07XG4gICpcbiAgKi9cblxucmVxdWVzdC5wYXJzZSA9IHtcbiAgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6IHBhcnNlU3RyaW5nLFxuICAnYXBwbGljYXRpb24vanNvbic6IEpTT04ucGFyc2Vcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGhlYWRlciBgc3RyYCBpbnRvXG4gKiBhbiBvYmplY3QgY29udGFpbmluZyB0aGUgbWFwcGVkIGZpZWxkcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZUhlYWRlcihzdHIpIHtcbiAgdmFyIGxpbmVzID0gc3RyLnNwbGl0KC9cXHI/XFxuLyk7XG4gIHZhciBmaWVsZHMgPSB7fTtcbiAgdmFyIGluZGV4O1xuICB2YXIgbGluZTtcbiAgdmFyIGZpZWxkO1xuICB2YXIgdmFsO1xuXG4gIGxpbmVzLnBvcCgpOyAvLyB0cmFpbGluZyBDUkxGXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGxpbmVzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgbGluZSA9IGxpbmVzW2ldO1xuICAgIGluZGV4ID0gbGluZS5pbmRleE9mKCc6Jyk7XG4gICAgZmllbGQgPSBsaW5lLnNsaWNlKDAsIGluZGV4KS50b0xvd2VyQ2FzZSgpO1xuICAgIHZhbCA9IHRyaW0obGluZS5zbGljZShpbmRleCArIDEpKTtcbiAgICBmaWVsZHNbZmllbGRdID0gdmFsO1xuICB9XG5cbiAgcmV0dXJuIGZpZWxkcztcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIG1pbWUgdHlwZSBmb3IgdGhlIGdpdmVuIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHR5cGUoc3RyKXtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvICo7ICovKS5zaGlmdCgpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaGVhZGVyIGZpZWxkIHBhcmFtZXRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyYW1zKHN0cil7XG4gIHJldHVybiByZWR1Y2Uoc3RyLnNwbGl0KC8gKjsgKi8pLCBmdW5jdGlvbihvYmosIHN0cil7XG4gICAgdmFyIHBhcnRzID0gc3RyLnNwbGl0KC8gKj0gKi8pXG4gICAgICAsIGtleSA9IHBhcnRzLnNoaWZ0KClcbiAgICAgICwgdmFsID0gcGFydHMuc2hpZnQoKTtcblxuICAgIGlmIChrZXkgJiYgdmFsKSBvYmpba2V5XSA9IHZhbDtcbiAgICByZXR1cm4gb2JqO1xuICB9LCB7fSk7XG59O1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlc3BvbnNlYCB3aXRoIHRoZSBnaXZlbiBgeGhyYC5cbiAqXG4gKiAgLSBzZXQgZmxhZ3MgKC5vaywgLmVycm9yLCBldGMpXG4gKiAgLSBwYXJzZSBoZWFkZXJcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgQWxpYXNpbmcgYHN1cGVyYWdlbnRgIGFzIGByZXF1ZXN0YCBpcyBuaWNlOlxuICpcbiAqICAgICAgcmVxdWVzdCA9IHN1cGVyYWdlbnQ7XG4gKlxuICogIFdlIGNhbiB1c2UgdGhlIHByb21pc2UtbGlrZSBBUEksIG9yIHBhc3MgY2FsbGJhY2tzOlxuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nKS5lbmQoZnVuY3Rpb24ocmVzKXt9KTtcbiAqICAgICAgcmVxdWVzdC5nZXQoJy8nLCBmdW5jdGlvbihyZXMpe30pO1xuICpcbiAqICBTZW5kaW5nIGRhdGEgY2FuIGJlIGNoYWluZWQ6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogIE9yIHBhc3NlZCB0byBgLnNlbmQoKWA6XG4gKlxuICogICAgICByZXF1ZXN0XG4gKiAgICAgICAgLnBvc3QoJy91c2VyJylcbiAqICAgICAgICAuc2VuZCh7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiAgT3IgcGFzc2VkIHRvIGAucG9zdCgpYDpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSlcbiAqICAgICAgICAuZW5kKGZ1bmN0aW9uKHJlcyl7fSk7XG4gKlxuICogT3IgZnVydGhlciByZWR1Y2VkIHRvIGEgc2luZ2xlIGNhbGwgZm9yIHNpbXBsZSBjYXNlczpcbiAqXG4gKiAgICAgIHJlcXVlc3RcbiAqICAgICAgICAucG9zdCgnL3VzZXInLCB7IG5hbWU6ICd0aicgfSwgZnVuY3Rpb24ocmVzKXt9KTtcbiAqXG4gKiBAcGFyYW0ge1hNTEhUVFBSZXF1ZXN0fSB4aHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBSZXNwb25zZShyZXEsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIHRoaXMucmVxID0gcmVxO1xuICB0aGlzLnhociA9IHRoaXMucmVxLnhocjtcbiAgLy8gcmVzcG9uc2VUZXh0IGlzIGFjY2Vzc2libGUgb25seSBpZiByZXNwb25zZVR5cGUgaXMgJycgb3IgJ3RleHQnIGFuZCBvbiBvbGRlciBicm93c2Vyc1xuICB0aGlzLnRleHQgPSAoKHRoaXMucmVxLm1ldGhvZCAhPSdIRUFEJyAmJiAodGhpcy54aHIucmVzcG9uc2VUeXBlID09PSAnJyB8fCB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JykpIHx8IHR5cGVvZiB0aGlzLnhoci5yZXNwb25zZVR5cGUgPT09ICd1bmRlZmluZWQnKVxuICAgICA/IHRoaXMueGhyLnJlc3BvbnNlVGV4dFxuICAgICA6IG51bGw7XG4gIHRoaXMuc3RhdHVzVGV4dCA9IHRoaXMucmVxLnhoci5zdGF0dXNUZXh0O1xuICB0aGlzLnNldFN0YXR1c1Byb3BlcnRpZXModGhpcy54aHIuc3RhdHVzKTtcbiAgdGhpcy5oZWFkZXIgPSB0aGlzLmhlYWRlcnMgPSBwYXJzZUhlYWRlcih0aGlzLnhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSk7XG4gIC8vIGdldEFsbFJlc3BvbnNlSGVhZGVycyBzb21ldGltZXMgZmFsc2VseSByZXR1cm5zIFwiXCIgZm9yIENPUlMgcmVxdWVzdHMsIGJ1dFxuICAvLyBnZXRSZXNwb25zZUhlYWRlciBzdGlsbCB3b3Jrcy4gc28gd2UgZ2V0IGNvbnRlbnQtdHlwZSBldmVuIGlmIGdldHRpbmdcbiAgLy8gb3RoZXIgaGVhZGVycyBmYWlscy5cbiAgdGhpcy5oZWFkZXJbJ2NvbnRlbnQtdHlwZSddID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ2NvbnRlbnQtdHlwZScpO1xuICB0aGlzLnNldEhlYWRlclByb3BlcnRpZXModGhpcy5oZWFkZXIpO1xuICB0aGlzLmJvZHkgPSB0aGlzLnJlcS5tZXRob2QgIT0gJ0hFQUQnXG4gICAgPyB0aGlzLnBhcnNlQm9keSh0aGlzLnRleHQgPyB0aGlzLnRleHQgOiB0aGlzLnhoci5yZXNwb25zZSlcbiAgICA6IG51bGw7XG59XG5cbi8qKlxuICogR2V0IGNhc2UtaW5zZW5zaXRpdmUgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVzcG9uc2UucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuaGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIHJlbGF0ZWQgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gYC50eXBlYCB0aGUgY29udGVudCB0eXBlIHdpdGhvdXQgcGFyYW1zXG4gKlxuICogQSByZXNwb25zZSBvZiBcIkNvbnRlbnQtVHlwZTogdGV4dC9wbGFpbjsgY2hhcnNldD11dGYtOFwiXG4gKiB3aWxsIHByb3ZpZGUgeW91IHdpdGggYSBgLnR5cGVgIG9mIFwidGV4dC9wbGFpblwiLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoZWFkZXJcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRIZWFkZXJQcm9wZXJ0aWVzID0gZnVuY3Rpb24oaGVhZGVyKXtcbiAgLy8gY29udGVudC10eXBlXG4gIHZhciBjdCA9IHRoaXMuaGVhZGVyWydjb250ZW50LXR5cGUnXSB8fCAnJztcbiAgdGhpcy50eXBlID0gdHlwZShjdCk7XG5cbiAgLy8gcGFyYW1zXG4gIHZhciBvYmogPSBwYXJhbXMoY3QpO1xuICBmb3IgKHZhciBrZXkgaW4gb2JqKSB0aGlzW2tleV0gPSBvYmpba2V5XTtcbn07XG5cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGJvZHkgYHN0cmAuXG4gKlxuICogVXNlZCBmb3IgYXV0by1wYXJzaW5nIG9mIGJvZGllcy4gUGFyc2Vyc1xuICogYXJlIGRlZmluZWQgb24gdGhlIGBzdXBlcmFnZW50LnBhcnNlYCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7TWl4ZWR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXNwb25zZS5wcm90b3R5cGUucGFyc2VCb2R5ID0gZnVuY3Rpb24oc3RyKXtcbiAgdmFyIHBhcnNlID0gcmVxdWVzdC5wYXJzZVt0aGlzLnR5cGVdO1xuICByZXR1cm4gcGFyc2UgJiYgc3RyICYmIChzdHIubGVuZ3RoIHx8IHN0ciBpbnN0YW5jZW9mIE9iamVjdClcbiAgICA/IHBhcnNlKHN0cilcbiAgICA6IG51bGw7XG59O1xuXG4vKipcbiAqIFNldCBmbGFncyBzdWNoIGFzIGAub2tgIGJhc2VkIG9uIGBzdGF0dXNgLlxuICpcbiAqIEZvciBleGFtcGxlIGEgMnh4IHJlc3BvbnNlIHdpbGwgZ2l2ZSB5b3UgYSBgLm9rYCBvZiBfX3RydWVfX1xuICogd2hlcmVhcyA1eHggd2lsbCBiZSBfX2ZhbHNlX18gYW5kIGAuZXJyb3JgIHdpbGwgYmUgX190cnVlX18uIFRoZVxuICogYC5jbGllbnRFcnJvcmAgYW5kIGAuc2VydmVyRXJyb3JgIGFyZSBhbHNvIGF2YWlsYWJsZSB0byBiZSBtb3JlXG4gKiBzcGVjaWZpYywgYW5kIGAuc3RhdHVzVHlwZWAgaXMgdGhlIGNsYXNzIG9mIGVycm9yIHJhbmdpbmcgZnJvbSAxLi41XG4gKiBzb21ldGltZXMgdXNlZnVsIGZvciBtYXBwaW5nIHJlc3BvbmQgY29sb3JzIGV0Yy5cbiAqXG4gKiBcInN1Z2FyXCIgcHJvcGVydGllcyBhcmUgYWxzbyBkZWZpbmVkIGZvciBjb21tb24gY2FzZXMuIEN1cnJlbnRseSBwcm92aWRpbmc6XG4gKlxuICogICAtIC5ub0NvbnRlbnRcbiAqICAgLSAuYmFkUmVxdWVzdFxuICogICAtIC51bmF1dGhvcml6ZWRcbiAqICAgLSAubm90QWNjZXB0YWJsZVxuICogICAtIC5ub3RGb3VuZFxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS5zZXRTdGF0dXNQcm9wZXJ0aWVzID0gZnVuY3Rpb24oc3RhdHVzKXtcbiAgLy8gaGFuZGxlIElFOSBidWc6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTAwNDY5NzIvbXNpZS1yZXR1cm5zLXN0YXR1cy1jb2RlLW9mLTEyMjMtZm9yLWFqYXgtcmVxdWVzdFxuICBpZiAoc3RhdHVzID09PSAxMjIzKSB7XG4gICAgc3RhdHVzID0gMjA0O1xuICB9XG5cbiAgdmFyIHR5cGUgPSBzdGF0dXMgLyAxMDAgfCAwO1xuXG4gIC8vIHN0YXR1cyAvIGNsYXNzXG4gIHRoaXMuc3RhdHVzID0gc3RhdHVzO1xuICB0aGlzLnN0YXR1c1R5cGUgPSB0eXBlO1xuXG4gIC8vIGJhc2ljc1xuICB0aGlzLmluZm8gPSAxID09IHR5cGU7XG4gIHRoaXMub2sgPSAyID09IHR5cGU7XG4gIHRoaXMuY2xpZW50RXJyb3IgPSA0ID09IHR5cGU7XG4gIHRoaXMuc2VydmVyRXJyb3IgPSA1ID09IHR5cGU7XG4gIHRoaXMuZXJyb3IgPSAoNCA9PSB0eXBlIHx8IDUgPT0gdHlwZSlcbiAgICA/IHRoaXMudG9FcnJvcigpXG4gICAgOiBmYWxzZTtcblxuICAvLyBzdWdhclxuICB0aGlzLmFjY2VwdGVkID0gMjAyID09IHN0YXR1cztcbiAgdGhpcy5ub0NvbnRlbnQgPSAyMDQgPT0gc3RhdHVzO1xuICB0aGlzLmJhZFJlcXVlc3QgPSA0MDAgPT0gc3RhdHVzO1xuICB0aGlzLnVuYXV0aG9yaXplZCA9IDQwMSA9PSBzdGF0dXM7XG4gIHRoaXMubm90QWNjZXB0YWJsZSA9IDQwNiA9PSBzdGF0dXM7XG4gIHRoaXMubm90Rm91bmQgPSA0MDQgPT0gc3RhdHVzO1xuICB0aGlzLmZvcmJpZGRlbiA9IDQwMyA9PSBzdGF0dXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhbiBgRXJyb3JgIHJlcHJlc2VudGF0aXZlIG9mIHRoaXMgcmVzcG9uc2UuXG4gKlxuICogQHJldHVybiB7RXJyb3J9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlc3BvbnNlLnByb3RvdHlwZS50b0Vycm9yID0gZnVuY3Rpb24oKXtcbiAgdmFyIHJlcSA9IHRoaXMucmVxO1xuICB2YXIgbWV0aG9kID0gcmVxLm1ldGhvZDtcbiAgdmFyIHVybCA9IHJlcS51cmw7XG5cbiAgdmFyIG1zZyA9ICdjYW5ub3QgJyArIG1ldGhvZCArICcgJyArIHVybCArICcgKCcgKyB0aGlzLnN0YXR1cyArICcpJztcbiAgdmFyIGVyciA9IG5ldyBFcnJvcihtc2cpO1xuICBlcnIuc3RhdHVzID0gdGhpcy5zdGF0dXM7XG4gIGVyci5tZXRob2QgPSBtZXRob2Q7XG4gIGVyci51cmwgPSB1cmw7XG5cbiAgcmV0dXJuIGVycjtcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXNwb25zZWAuXG4gKi9cblxucmVxdWVzdC5SZXNwb25zZSA9IFJlc3BvbnNlO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYFJlcXVlc3RgIHdpdGggdGhlIGdpdmVuIGBtZXRob2RgIGFuZCBgdXJsYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIFJlcXVlc3QobWV0aG9kLCB1cmwpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBFbWl0dGVyLmNhbGwodGhpcyk7XG4gIHRoaXMuX3F1ZXJ5ID0gdGhpcy5fcXVlcnkgfHwgW107XG4gIHRoaXMubWV0aG9kID0gbWV0aG9kO1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5oZWFkZXIgPSB7fTtcbiAgdGhpcy5faGVhZGVyID0ge307XG4gIHRoaXMub24oJ2VuZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyciA9IG51bGw7XG4gICAgdmFyIHJlcyA9IG51bGw7XG5cbiAgICB0cnkge1xuICAgICAgcmVzID0gbmV3IFJlc3BvbnNlKHNlbGYpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgZXJyID0gbmV3IEVycm9yKCdQYXJzZXIgaXMgdW5hYmxlIHRvIHBhcnNlIHRoZSByZXNwb25zZScpO1xuICAgICAgZXJyLnBhcnNlID0gdHJ1ZTtcbiAgICAgIGVyci5vcmlnaW5hbCA9IGU7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIpO1xuICAgIH1cblxuICAgIHNlbGYuZW1pdCgncmVzcG9uc2UnLCByZXMpO1xuXG4gICAgaWYgKGVycikge1xuICAgICAgcmV0dXJuIHNlbGYuY2FsbGJhY2soZXJyLCByZXMpO1xuICAgIH1cblxuICAgIGlmIChyZXMuc3RhdHVzID49IDIwMCAmJiByZXMuc3RhdHVzIDwgMzAwKSB7XG4gICAgICByZXR1cm4gc2VsZi5jYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgdmFyIG5ld19lcnIgPSBuZXcgRXJyb3IocmVzLnN0YXR1c1RleHQgfHwgJ1Vuc3VjY2Vzc2Z1bCBIVFRQIHJlc3BvbnNlJyk7XG4gICAgbmV3X2Vyci5vcmlnaW5hbCA9IGVycjtcbiAgICBuZXdfZXJyLnJlc3BvbnNlID0gcmVzO1xuICAgIG5ld19lcnIuc3RhdHVzID0gcmVzLnN0YXR1cztcblxuICAgIHNlbGYuY2FsbGJhY2soZXJyIHx8IG5ld19lcnIsIHJlcyk7XG4gIH0pO1xufVxuXG4vKipcbiAqIE1peGluIGBFbWl0dGVyYC5cbiAqL1xuXG5FbWl0dGVyKFJlcXVlc3QucHJvdG90eXBlKTtcblxuLyoqXG4gKiBBbGxvdyBmb3IgZXh0ZW5zaW9uXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudXNlID0gZnVuY3Rpb24oZm4pIHtcbiAgZm4odGhpcyk7XG4gIHJldHVybiB0aGlzO1xufVxuXG4vKipcbiAqIFNldCB0aW1lb3V0IHRvIGBtc2AuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1zXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudGltZW91dCA9IGZ1bmN0aW9uKG1zKXtcbiAgdGhpcy5fdGltZW91dCA9IG1zO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQ2xlYXIgcHJldmlvdXMgdGltZW91dC5cbiAqXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY2xlYXJUaW1lb3V0ID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fdGltZW91dCA9IDA7XG4gIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBYm9ydCB0aGUgcmVxdWVzdCwgYW5kIGNsZWFyIHBvdGVudGlhbCB0aW1lb3V0LlxuICpcbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmFib3J0ID0gZnVuY3Rpb24oKXtcbiAgaWYgKHRoaXMuYWJvcnRlZCkgcmV0dXJuO1xuICB0aGlzLmFib3J0ZWQgPSB0cnVlO1xuICB0aGlzLnhoci5hYm9ydCgpO1xuICB0aGlzLmNsZWFyVGltZW91dCgpO1xuICB0aGlzLmVtaXQoJ2Fib3J0Jyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgaGVhZGVyIGBmaWVsZGAgdG8gYHZhbGAsIG9yIG11bHRpcGxlIGZpZWxkcyB3aXRoIG9uZSBvYmplY3QuXG4gKlxuICogRXhhbXBsZXM6XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbicpXG4gKiAgICAgICAgLnNldCgnWC1BUEktS2V5JywgJ2Zvb2JhcicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXEuZ2V0KCcvJylcbiAqICAgICAgICAuc2V0KHsgQWNjZXB0OiAnYXBwbGljYXRpb24vanNvbicsICdYLUFQSS1LZXknOiAnZm9vYmFyJyB9KVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gZmllbGRcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWxcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihmaWVsZCwgdmFsKXtcbiAgaWYgKGlzT2JqZWN0KGZpZWxkKSkge1xuICAgIGZvciAodmFyIGtleSBpbiBmaWVsZCkge1xuICAgICAgdGhpcy5zZXQoa2V5LCBmaWVsZFtrZXldKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdGhpcy5faGVhZGVyW2ZpZWxkLnRvTG93ZXJDYXNlKCldID0gdmFsO1xuICB0aGlzLmhlYWRlcltmaWVsZF0gPSB2YWw7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgaGVhZGVyIGBmaWVsZGAuXG4gKlxuICogRXhhbXBsZTpcbiAqXG4gKiAgICAgIHJlcS5nZXQoJy8nKVxuICogICAgICAgIC51bnNldCgnVXNlci1BZ2VudCcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUudW5zZXQgPSBmdW5jdGlvbihmaWVsZCl7XG4gIGRlbGV0ZSB0aGlzLl9oZWFkZXJbZmllbGQudG9Mb3dlckNhc2UoKV07XG4gIGRlbGV0ZSB0aGlzLmhlYWRlcltmaWVsZF07XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBHZXQgY2FzZS1pbnNlbnNpdGl2ZSBoZWFkZXIgYGZpZWxkYCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZmllbGRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLmdldEhlYWRlciA9IGZ1bmN0aW9uKGZpZWxkKXtcbiAgcmV0dXJuIHRoaXMuX2hlYWRlcltmaWVsZC50b0xvd2VyQ2FzZSgpXTtcbn07XG5cbi8qKlxuICogU2V0IENvbnRlbnQtVHlwZSB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy54bWwgPSAnYXBwbGljYXRpb24veG1sJztcbiAqXG4gKiAgICAgIHJlcXVlc3QucG9zdCgnLycpXG4gKiAgICAgICAgLnR5cGUoJ3htbCcpXG4gKiAgICAgICAgLnNlbmQoeG1sc3RyaW5nKVxuICogICAgICAgIC5lbmQoY2FsbGJhY2spO1xuICpcbiAqICAgICAgcmVxdWVzdC5wb3N0KCcvJylcbiAqICAgICAgICAudHlwZSgnYXBwbGljYXRpb24veG1sJylcbiAqICAgICAgICAuc2VuZCh4bWxzdHJpbmcpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS50eXBlID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdDb250ZW50LVR5cGUnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEFjY2VwdCB0byBgdHlwZWAsIG1hcHBpbmcgdmFsdWVzIGZyb20gYHJlcXVlc3QudHlwZXNgLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgc3VwZXJhZ2VudC50eXBlcy5qc29uID0gJ2FwcGxpY2F0aW9uL2pzb24nO1xuICpcbiAqICAgICAgcmVxdWVzdC5nZXQoJy9hZ2VudCcpXG4gKiAgICAgICAgLmFjY2VwdCgnanNvbicpXG4gKiAgICAgICAgLmVuZChjYWxsYmFjayk7XG4gKlxuICogICAgICByZXF1ZXN0LmdldCgnL2FnZW50JylcbiAqICAgICAgICAuYWNjZXB0KCdhcHBsaWNhdGlvbi9qc29uJylcbiAqICAgICAgICAuZW5kKGNhbGxiYWNrKTtcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWNjZXB0XG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYWNjZXB0ID0gZnVuY3Rpb24odHlwZSl7XG4gIHRoaXMuc2V0KCdBY2NlcHQnLCByZXF1ZXN0LnR5cGVzW3R5cGVdIHx8IHR5cGUpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogU2V0IEF1dGhvcml6YXRpb24gZmllbGQgdmFsdWUgd2l0aCBgdXNlcmAgYW5kIGBwYXNzYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXNlclxuICogQHBhcmFtIHtTdHJpbmd9IHBhc3NcbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5hdXRoID0gZnVuY3Rpb24odXNlciwgcGFzcyl7XG4gIHZhciBzdHIgPSBidG9hKHVzZXIgKyAnOicgKyBwYXNzKTtcbiAgdGhpcy5zZXQoJ0F1dGhvcml6YXRpb24nLCAnQmFzaWMgJyArIHN0cik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4qIEFkZCBxdWVyeS1zdHJpbmcgYHZhbGAuXG4qXG4qIEV4YW1wbGVzOlxuKlxuKiAgIHJlcXVlc3QuZ2V0KCcvc2hvZXMnKVxuKiAgICAgLnF1ZXJ5KCdzaXplPTEwJylcbiogICAgIC5xdWVyeSh7IGNvbG9yOiAnYmx1ZScgfSlcbipcbiogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSB2YWxcbiogQHJldHVybiB7UmVxdWVzdH0gZm9yIGNoYWluaW5nXG4qIEBhcGkgcHVibGljXG4qL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5xdWVyeSA9IGZ1bmN0aW9uKHZhbCl7XG4gIGlmICgnc3RyaW5nJyAhPSB0eXBlb2YgdmFsKSB2YWwgPSBzZXJpYWxpemUodmFsKTtcbiAgaWYgKHZhbCkgdGhpcy5fcXVlcnkucHVzaCh2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogV3JpdGUgdGhlIGZpZWxkIGBuYW1lYCBhbmQgYHZhbGAgZm9yIFwibXVsdGlwYXJ0L2Zvcm0tZGF0YVwiXG4gKiByZXF1ZXN0IGJvZGllcy5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5maWVsZCgnZm9vJywgJ2JhcicpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfEJsb2J8RmlsZX0gdmFsXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuZmllbGQgPSBmdW5jdGlvbihuYW1lLCB2YWwpe1xuICBpZiAoIXRoaXMuX2Zvcm1EYXRhKSB0aGlzLl9mb3JtRGF0YSA9IG5ldyByb290LkZvcm1EYXRhKCk7XG4gIHRoaXMuX2Zvcm1EYXRhLmFwcGVuZChuYW1lLCB2YWwpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUXVldWUgdGhlIGdpdmVuIGBmaWxlYCBhcyBhbiBhdHRhY2htZW50IHRvIHRoZSBzcGVjaWZpZWQgYGZpZWxkYCxcbiAqIHdpdGggb3B0aW9uYWwgYGZpbGVuYW1lYC5cbiAqXG4gKiBgYGAganNcbiAqIHJlcXVlc3QucG9zdCgnL3VwbG9hZCcpXG4gKiAgIC5hdHRhY2gobmV3IEJsb2IoWyc8YSBpZD1cImFcIj48YiBpZD1cImJcIj5oZXkhPC9iPjwvYT4nXSwgeyB0eXBlOiBcInRleHQvaHRtbFwifSkpXG4gKiAgIC5lbmQoY2FsbGJhY2spO1xuICogYGBgXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGZpZWxkXG4gKiBAcGFyYW0ge0Jsb2J8RmlsZX0gZmlsZVxuICogQHBhcmFtIHtTdHJpbmd9IGZpbGVuYW1lXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuYXR0YWNoID0gZnVuY3Rpb24oZmllbGQsIGZpbGUsIGZpbGVuYW1lKXtcbiAgaWYgKCF0aGlzLl9mb3JtRGF0YSkgdGhpcy5fZm9ybURhdGEgPSBuZXcgcm9vdC5Gb3JtRGF0YSgpO1xuICB0aGlzLl9mb3JtRGF0YS5hcHBlbmQoZmllbGQsIGZpbGUsIGZpbGVuYW1lKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFNlbmQgYGRhdGFgLCBkZWZhdWx0aW5nIHRoZSBgLnR5cGUoKWAgdG8gXCJqc29uXCIgd2hlblxuICogYW4gb2JqZWN0IGlzIGdpdmVuLlxuICpcbiAqIEV4YW1wbGVzOlxuICpcbiAqICAgICAgIC8vIHF1ZXJ5c3RyaW5nXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gbXVsdGlwbGUgZGF0YSBcIndyaXRlc1wiXG4gKiAgICAgICByZXF1ZXN0LmdldCgnL3NlYXJjaCcpXG4gKiAgICAgICAgIC5zZW5kKHsgc2VhcmNoOiAncXVlcnknIH0pXG4gKiAgICAgICAgIC5zZW5kKHsgcmFuZ2U6ICcxLi41JyB9KVxuICogICAgICAgICAuc2VuZCh7IG9yZGVyOiAnZGVzYycgfSlcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBtYW51YWwganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdqc29uJylcbiAqICAgICAgICAgLnNlbmQoJ3tcIm5hbWVcIjpcInRqXCJ9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIGF1dG8ganNvblxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC5zZW5kKHsgbmFtZTogJ3RqJyB9KVxuICogICAgICAgICAuZW5kKGNhbGxiYWNrKVxuICpcbiAqICAgICAgIC8vIG1hbnVhbCB4LXd3dy1mb3JtLXVybGVuY29kZWRcbiAqICAgICAgIHJlcXVlc3QucG9zdCgnL3VzZXInKVxuICogICAgICAgICAudHlwZSgnZm9ybScpXG4gKiAgICAgICAgIC5zZW5kKCduYW1lPXRqJylcbiAqICAgICAgICAgLmVuZChjYWxsYmFjaylcbiAqXG4gKiAgICAgICAvLyBhdXRvIHgtd3d3LWZvcm0tdXJsZW5jb2RlZFxuICogICAgICAgcmVxdWVzdC5wb3N0KCcvdXNlcicpXG4gKiAgICAgICAgIC50eXBlKCdmb3JtJylcbiAqICAgICAgICAgLnNlbmQoeyBuYW1lOiAndGonIH0pXG4gKiAgICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogICAgICAgLy8gZGVmYXVsdHMgdG8geC13d3ctZm9ybS11cmxlbmNvZGVkXG4gICogICAgICByZXF1ZXN0LnBvc3QoJy91c2VyJylcbiAgKiAgICAgICAgLnNlbmQoJ25hbWU9dG9iaScpXG4gICogICAgICAgIC5zZW5kKCdzcGVjaWVzPWZlcnJldCcpXG4gICogICAgICAgIC5lbmQoY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fSBmb3IgY2hhaW5pbmdcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuc2VuZCA9IGZ1bmN0aW9uKGRhdGEpe1xuICB2YXIgb2JqID0gaXNPYmplY3QoZGF0YSk7XG4gIHZhciB0eXBlID0gdGhpcy5nZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScpO1xuXG4gIC8vIG1lcmdlXG4gIGlmIChvYmogJiYgaXNPYmplY3QodGhpcy5fZGF0YSkpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgdGhpcy5fZGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgIH1cbiAgfSBlbHNlIGlmICgnc3RyaW5nJyA9PSB0eXBlb2YgZGF0YSkge1xuICAgIGlmICghdHlwZSkgdGhpcy50eXBlKCdmb3JtJyk7XG4gICAgdHlwZSA9IHRoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKTtcbiAgICBpZiAoJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcgPT0gdHlwZSkge1xuICAgICAgdGhpcy5fZGF0YSA9IHRoaXMuX2RhdGFcbiAgICAgICAgPyB0aGlzLl9kYXRhICsgJyYnICsgZGF0YVxuICAgICAgICA6IGRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2RhdGEgPSAodGhpcy5fZGF0YSB8fCAnJykgKyBkYXRhO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aGlzLl9kYXRhID0gZGF0YTtcbiAgfVxuXG4gIGlmICghb2JqIHx8IGlzSG9zdChkYXRhKSkgcmV0dXJuIHRoaXM7XG4gIGlmICghdHlwZSkgdGhpcy50eXBlKCdqc29uJyk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBJbnZva2UgdGhlIGNhbGxiYWNrIHdpdGggYGVycmAgYW5kIGByZXNgXG4gKiBhbmQgaGFuZGxlIGFyaXR5IGNoZWNrLlxuICpcbiAqIEBwYXJhbSB7RXJyb3J9IGVyclxuICogQHBhcmFtIHtSZXNwb25zZX0gcmVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5jYWxsYmFjayA9IGZ1bmN0aW9uKGVyciwgcmVzKXtcbiAgdmFyIGZuID0gdGhpcy5fY2FsbGJhY2s7XG4gIHRoaXMuY2xlYXJUaW1lb3V0KCk7XG4gIGZuKGVyciwgcmVzKTtcbn07XG5cbi8qKlxuICogSW52b2tlIGNhbGxiYWNrIHdpdGggeC1kb21haW4gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUuY3Jvc3NEb21haW5FcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ09yaWdpbiBpcyBub3QgYWxsb3dlZCBieSBBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nKTtcbiAgZXJyLmNyb3NzRG9tYWluID0gdHJ1ZTtcbiAgdGhpcy5jYWxsYmFjayhlcnIpO1xufTtcblxuLyoqXG4gKiBJbnZva2UgY2FsbGJhY2sgd2l0aCB0aW1lb3V0IGVycm9yLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cblJlcXVlc3QucHJvdG90eXBlLnRpbWVvdXRFcnJvciA9IGZ1bmN0aW9uKCl7XG4gIHZhciB0aW1lb3V0ID0gdGhpcy5fdGltZW91dDtcbiAgdmFyIGVyciA9IG5ldyBFcnJvcigndGltZW91dCBvZiAnICsgdGltZW91dCArICdtcyBleGNlZWRlZCcpO1xuICBlcnIudGltZW91dCA9IHRpbWVvdXQ7XG4gIHRoaXMuY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogRW5hYmxlIHRyYW5zbWlzc2lvbiBvZiBjb29raWVzIHdpdGggeC1kb21haW4gcmVxdWVzdHMuXG4gKlxuICogTm90ZSB0aGF0IGZvciB0aGlzIHRvIHdvcmsgdGhlIG9yaWdpbiBtdXN0IG5vdCBiZVxuICogdXNpbmcgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIiB3aXRoIGEgd2lsZGNhcmQsXG4gKiBhbmQgYWxzbyBtdXN0IHNldCBcIkFjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzXCJcbiAqIHRvIFwidHJ1ZVwiLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuUmVxdWVzdC5wcm90b3R5cGUud2l0aENyZWRlbnRpYWxzID0gZnVuY3Rpb24oKXtcbiAgdGhpcy5fd2l0aENyZWRlbnRpYWxzID0gdHJ1ZTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEluaXRpYXRlIHJlcXVlc3QsIGludm9raW5nIGNhbGxiYWNrIGBmbihyZXMpYFxuICogd2l0aCBhbiBpbnN0YW5jZW9mIGBSZXNwb25zZWAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9IGZvciBjaGFpbmluZ1xuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5SZXF1ZXN0LnByb3RvdHlwZS5lbmQgPSBmdW5jdGlvbihmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdmFyIHhociA9IHRoaXMueGhyID0gcmVxdWVzdC5nZXRYSFIoKTtcbiAgdmFyIHF1ZXJ5ID0gdGhpcy5fcXVlcnkuam9pbignJicpO1xuICB2YXIgdGltZW91dCA9IHRoaXMuX3RpbWVvdXQ7XG4gIHZhciBkYXRhID0gdGhpcy5fZm9ybURhdGEgfHwgdGhpcy5fZGF0YTtcblxuICAvLyBzdG9yZSBjYWxsYmFja1xuICB0aGlzLl9jYWxsYmFjayA9IGZuIHx8IG5vb3A7XG5cbiAgLy8gc3RhdGUgY2hhbmdlXG4gIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuICAgIGlmICg0ICE9IHhoci5yZWFkeVN0YXRlKSByZXR1cm47XG5cbiAgICAvLyBJbiBJRTksIHJlYWRzIHRvIGFueSBwcm9wZXJ0eSAoZS5nLiBzdGF0dXMpIG9mZiBvZiBhbiBhYm9ydGVkIFhIUiB3aWxsXG4gICAgLy8gcmVzdWx0IGluIHRoZSBlcnJvciBcIkNvdWxkIG5vdCBjb21wbGV0ZSB0aGUgb3BlcmF0aW9uIGR1ZSB0byBlcnJvciBjMDBjMDIzZlwiXG4gICAgdmFyIHN0YXR1cztcbiAgICB0cnkgeyBzdGF0dXMgPSB4aHIuc3RhdHVzIH0gY2F0Y2goZSkgeyBzdGF0dXMgPSAwOyB9XG5cbiAgICBpZiAoMCA9PSBzdGF0dXMpIHtcbiAgICAgIGlmIChzZWxmLnRpbWVkb3V0KSByZXR1cm4gc2VsZi50aW1lb3V0RXJyb3IoKTtcbiAgICAgIGlmIChzZWxmLmFib3J0ZWQpIHJldHVybjtcbiAgICAgIHJldHVybiBzZWxmLmNyb3NzRG9tYWluRXJyb3IoKTtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdlbmQnKTtcbiAgfTtcblxuICAvLyBwcm9ncmVzc1xuICB2YXIgaGFuZGxlUHJvZ3Jlc3MgPSBmdW5jdGlvbihlKXtcbiAgICBpZiAoZS50b3RhbCA+IDApIHtcbiAgICAgIGUucGVyY2VudCA9IGUubG9hZGVkIC8gZS50b3RhbCAqIDEwMDtcbiAgICB9XG4gICAgc2VsZi5lbWl0KCdwcm9ncmVzcycsIGUpO1xuICB9O1xuICBpZiAodGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICB4aHIub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICB9XG4gIHRyeSB7XG4gICAgaWYgKHhoci51cGxvYWQgJiYgdGhpcy5oYXNMaXN0ZW5lcnMoJ3Byb2dyZXNzJykpIHtcbiAgICAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IGhhbmRsZVByb2dyZXNzO1xuICAgIH1cbiAgfSBjYXRjaChlKSB7XG4gICAgLy8gQWNjZXNzaW5nIHhoci51cGxvYWQgZmFpbHMgaW4gSUUgZnJvbSBhIHdlYiB3b3JrZXIsIHNvIGp1c3QgcHJldGVuZCBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIC8vIFJlcG9ydGVkIGhlcmU6XG4gICAgLy8gaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy84MzcyNDUveG1saHR0cHJlcXVlc3QtdXBsb2FkLXRocm93cy1pbnZhbGlkLWFyZ3VtZW50LXdoZW4tdXNlZC1mcm9tLXdlYi13b3JrZXItY29udGV4dFxuICB9XG5cbiAgLy8gdGltZW91dFxuICBpZiAodGltZW91dCAmJiAhdGhpcy5fdGltZXIpIHtcbiAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHNlbGYudGltZWRvdXQgPSB0cnVlO1xuICAgICAgc2VsZi5hYm9ydCgpO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgLy8gcXVlcnlzdHJpbmdcbiAgaWYgKHF1ZXJ5KSB7XG4gICAgcXVlcnkgPSByZXF1ZXN0LnNlcmlhbGl6ZU9iamVjdChxdWVyeSk7XG4gICAgdGhpcy51cmwgKz0gfnRoaXMudXJsLmluZGV4T2YoJz8nKVxuICAgICAgPyAnJicgKyBxdWVyeVxuICAgICAgOiAnPycgKyBxdWVyeTtcbiAgfVxuXG4gIC8vIGluaXRpYXRlIHJlcXVlc3RcbiAgeGhyLm9wZW4odGhpcy5tZXRob2QsIHRoaXMudXJsLCB0cnVlKTtcblxuICAvLyBDT1JTXG4gIGlmICh0aGlzLl93aXRoQ3JlZGVudGlhbHMpIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuXG4gIC8vIGJvZHlcbiAgaWYgKCdHRVQnICE9IHRoaXMubWV0aG9kICYmICdIRUFEJyAhPSB0aGlzLm1ldGhvZCAmJiAnc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSAmJiAhaXNIb3N0KGRhdGEpKSB7XG4gICAgLy8gc2VyaWFsaXplIHN0dWZmXG4gICAgdmFyIHNlcmlhbGl6ZSA9IHJlcXVlc3Quc2VyaWFsaXplW3RoaXMuZ2V0SGVhZGVyKCdDb250ZW50LVR5cGUnKV07XG4gICAgaWYgKHNlcmlhbGl6ZSkgZGF0YSA9IHNlcmlhbGl6ZShkYXRhKTtcbiAgfVxuXG4gIC8vIHNldCBoZWFkZXIgZmllbGRzXG4gIGZvciAodmFyIGZpZWxkIGluIHRoaXMuaGVhZGVyKSB7XG4gICAgaWYgKG51bGwgPT0gdGhpcy5oZWFkZXJbZmllbGRdKSBjb250aW51ZTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihmaWVsZCwgdGhpcy5oZWFkZXJbZmllbGRdKTtcbiAgfVxuXG4gIC8vIHNlbmQgc3R1ZmZcbiAgdGhpcy5lbWl0KCdyZXF1ZXN0JywgdGhpcyk7XG4gIHhoci5zZW5kKGRhdGEpO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRXhwb3NlIGBSZXF1ZXN0YC5cbiAqL1xuXG5yZXF1ZXN0LlJlcXVlc3QgPSBSZXF1ZXN0O1xuXG4vKipcbiAqIElzc3VlIGEgcmVxdWVzdDpcbiAqXG4gKiBFeGFtcGxlczpcbiAqXG4gKiAgICByZXF1ZXN0KCdHRVQnLCAnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJykuZW5kKGNhbGxiYWNrKVxuICogICAgcmVxdWVzdCgnL3VzZXJzJywgY2FsbGJhY2spXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd8RnVuY3Rpb259IHVybCBvciBjYWxsYmFja1xuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVxdWVzdChtZXRob2QsIHVybCkge1xuICAvLyBjYWxsYmFja1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdXJsKSB7XG4gICAgcmV0dXJuIG5ldyBSZXF1ZXN0KCdHRVQnLCBtZXRob2QpLmVuZCh1cmwpO1xuICB9XG5cbiAgLy8gdXJsIGZpcnN0XG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gbmV3IFJlcXVlc3QoJ0dFVCcsIG1ldGhvZCk7XG4gIH1cblxuICByZXR1cm4gbmV3IFJlcXVlc3QobWV0aG9kLCB1cmwpO1xufVxuXG4vKipcbiAqIEdFVCBgdXJsYCB3aXRoIG9wdGlvbmFsIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfEZ1bmN0aW9ufSBkYXRhIG9yIGZuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5nZXQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0dFVCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnF1ZXJ5KGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBIRUFEIGB1cmxgIHdpdGggb3B0aW9uYWwgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR8RnVuY3Rpb259IGRhdGEgb3IgZm5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LmhlYWQgPSBmdW5jdGlvbih1cmwsIGRhdGEsIGZuKXtcbiAgdmFyIHJlcSA9IHJlcXVlc3QoJ0hFQUQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBERUxFVEUgYHVybGAgd2l0aCBvcHRpb25hbCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QuZGVsID0gZnVuY3Rpb24odXJsLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdERUxFVEUnLCB1cmwpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBQQVRDSCBgdXJsYCB3aXRoIG9wdGlvbmFsIGBkYXRhYCBhbmQgY2FsbGJhY2sgYGZuKHJlcylgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7TWl4ZWR9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtSZXF1ZXN0fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5yZXF1ZXN0LnBhdGNoID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQQVRDSCcsIHVybCk7XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKSBmbiA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICBpZiAoZGF0YSkgcmVxLnNlbmQoZGF0YSk7XG4gIGlmIChmbikgcmVxLmVuZChmbik7XG4gIHJldHVybiByZXE7XG59O1xuXG4vKipcbiAqIFBPU1QgYHVybGAgd2l0aCBvcHRpb25hbCBgZGF0YWAgYW5kIGNhbGxiYWNrIGBmbihyZXMpYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdXJsXG4gKiBAcGFyYW0ge01peGVkfSBkYXRhXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7UmVxdWVzdH1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxucmVxdWVzdC5wb3N0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQT1NUJywgdXJsKTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIGRhdGEpIGZuID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gIGlmIChkYXRhKSByZXEuc2VuZChkYXRhKTtcbiAgaWYgKGZuKSByZXEuZW5kKGZuKTtcbiAgcmV0dXJuIHJlcTtcbn07XG5cbi8qKlxuICogUFVUIGB1cmxgIHdpdGggb3B0aW9uYWwgYGRhdGFgIGFuZCBjYWxsYmFjayBgZm4ocmVzKWAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVybFxuICogQHBhcmFtIHtNaXhlZHxGdW5jdGlvbn0gZGF0YSBvciBmblxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge1JlcXVlc3R9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbnJlcXVlc3QucHV0ID0gZnVuY3Rpb24odXJsLCBkYXRhLCBmbil7XG4gIHZhciByZXEgPSByZXF1ZXN0KCdQVVQnLCB1cmwpO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgZGF0YSkgZm4gPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgaWYgKGRhdGEpIHJlcS5zZW5kKGRhdGEpO1xuICBpZiAoZm4pIHJlcS5lbmQoZm4pO1xuICByZXR1cm4gcmVxO1xufTtcblxuLyoqXG4gKiBFeHBvc2UgYHJlcXVlc3RgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gcmVxdWVzdDtcblxufSx7XCJlbWl0dGVyXCI6NCxcInJlZHVjZVwiOjV9XSw0OltmdW5jdGlvbihyZXF1aXJlLG1vZHVsZSxleHBvcnRzKXtcblxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcblxufSx7fV0sNTpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG5cbi8qKlxuICogUmVkdWNlIGBhcnJgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge01peGVkfSBpbml0aWFsXG4gKlxuICogVE9ETzogY29tYmF0aWJsZSBlcnJvciBoYW5kbGluZz9cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFyciwgZm4sIGluaXRpYWwpeyAgXG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gYXJyLmxlbmd0aDtcbiAgdmFyIGN1cnIgPSBhcmd1bWVudHMubGVuZ3RoID09IDNcbiAgICA/IGluaXRpYWxcbiAgICA6IGFycltpZHgrK107XG5cbiAgd2hpbGUgKGlkeCA8IGxlbikge1xuICAgIGN1cnIgPSBmbi5jYWxsKG51bGwsIGN1cnIsIGFycltpZHhdLCArK2lkeCwgYXJyKTtcbiAgfVxuICBcbiAgcmV0dXJuIGN1cnI7XG59O1xufSx7fV0sNjpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG4ndXNlIHN0cmljdCc7XG5cbnZhciByaW90ID0gcmVxdWlyZSgncmlvdCcpOyBcblxucmVxdWlyZSgnLi90YWcvYXBwLnRhZycpO1xucmVxdWlyZSgnLi90YWcvbGlzdC50YWcnKTtcblxudmFyIGFwaV91cmkgPSAnaHR0cHM6Ly9hdWMtY2F0Lmhlcm9rdWFwcC5jb20vJztcblxuaWYgKFwicHJvZHVjdGlvblwiID09PSAnZGV2ZWxvcG1lbnQnKSB7XG4gIGFwaV91cmkgPSAnaHR0cDovL2xvY2FsaG9zdDo5MjkyJztcbn1cblxucmlvdC5tb3VudCgnYXBwJywge2FwaV91cmk6IGFwaV91cml9KTtcblxufSx7XCIuL3RhZy9hcHAudGFnXCI6NyxcIi4vdGFnL2xpc3QudGFnXCI6OCxcInJpb3RcIjoyfV0sNzpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgcmlvdCA9IHJlcXVpcmUoJ3Jpb3QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmlvdC50YWcoJ2FwcCcsICc8ZGl2IGNsYXNzPVwiQGhlYWRlclwiPiA8aDEgY2xhc3M9XCJoZWFkaW5nIC0tbG9nb1wiPllhaG9vIEF1Y3Rpb24gQ2F0ZWdvcnkgU2VhcmNoPC9oMT4gPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPiA8aW5wdXQgY2xhc3M9XCJpbnB1dF9fdGV4dCArbHVtaW5vdXNcIiB0eXBlPVwidGV4dFwiIG5hbWU9XCJrZXl3b3JkXCIgcGxhY2Vob2xkZXI9XCJzZWFyY2gga2V5d29yZFwiPiA8ZGl2IGNsYXNzPVwiY3JlZGl0XCI+IEJ1aWxkIGJ5IDxhIGhyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tL2NvdW50MFwiPkBjb3VudDA8L2E+ICZjb3B5OyAyMDE1PGJyPiBsaWNlbnNlIHVuZGVyIDxhIGhyZWY9XCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vcGlwYm95MzAwMC9hdWMtY2F0L21hc3Rlci9MSUNFTlNFXCI+TUlUPC9hPiA8L2Rpdj4gPC9kaXY+IDwvZGl2PiA8bGlzdCBkYXRhPVwieyByZXN1bHRzIH1cIj4nLCBmdW5jdGlvbihvcHRzKSB7dmFyIF90aGlzID0gdGhpcztcblxudmFyIEJhY29uID0gcmVxdWlyZSgnYmFjb25qcycpO1xudmFyIHJlcXVlc3QgPSByZXF1aXJlKCdzdXBlcmFnZW50Jyk7XG5cbnRoaXMucmVzdWx0cyA9IFtdO1xuXG52YXIga2V5d29yZFZhbHVlID0gZnVuY3Rpb24ga2V5d29yZFZhbHVlKCkge1xuICByZXR1cm4gQmFjb24uZnJvbUV2ZW50KF90aGlzLmtleXdvcmQsICdrZXl1cCcpLnRocm90dGxlKDE1MDApLm1hcChmdW5jdGlvbiAoZSkge1xuICAgIHJldHVybiBlLnRhcmdldC52YWx1ZTtcbiAgfSkuZmlsdGVyKGZ1bmN0aW9uICh2KSB7XG4gICAgcmV0dXJuIHYubGVuZ3RoID4gMjtcbiAgfSkudG9Qcm9wZXJ0eSgpO1xufTtcblxudmFyIGtleXdvcmRCdXMgPSBuZXcgQmFjb24uQnVzKCk7XG5rZXl3b3JkQnVzLnBsdWcoa2V5d29yZFZhbHVlKCkpO1xua2V5d29yZEJ1cy5vblZhbHVlKGZ1bmN0aW9uIChrZXl3b3JkKSB7XG4gIHJlcXVlc3QuZ2V0KCcnICsgb3B0cy5hcGlfdXJpICsgJy9zZWFyY2gva2V5d29yZC8nICsga2V5d29yZCkuZW5kKGZ1bmN0aW9uIChlcnIsIHJlcykge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgLy8gY29uc29sZS5sb2cocmVzKVxuICAgICAgX3RoaXMucmVzdWx0cyA9IHJlcy5ib2R5O1xuICAgICAgX3RoaXMudXBkYXRlKCk7XG4gICAgfVxuICB9KTtcbn0pO1xufSk7XG5cbn0se1wiYmFjb25qc1wiOjEsXCJyaW90XCI6MixcInN1cGVyYWdlbnRcIjozfV0sODpbZnVuY3Rpb24ocmVxdWlyZSxtb2R1bGUsZXhwb3J0cyl7XG52YXIgcmlvdCA9IHJlcXVpcmUoJ3Jpb3QnKTtcbm1vZHVsZS5leHBvcnRzID0gcmlvdC50YWcoJ2xpc3QnLCAnPHVsPiA8bGkgZWFjaD1cInsgb3B0cy5kYXRhIH1cIiBjbGFzcz1cImxpc3RJdGVtXCI+IDxzcGFuIGNsYXNzPVwibGlzdEl0ZW1fX2hlYWRcIj57aWR9PC9zcGFuPiA8c3BhbiBjbGFzcz1cImxpc3RJdGVtX19jb250ZW50XCI+PGEgaHJlZj1cImh0dHA6Ly9jYXRlZ29yeS5hdWN0aW9ucy55YWhvby5jby5qcC9saXN0L3tpZH0vXCIgY2xhc3M9XCJsaW5rXCIgdGFyZ2V0PVwiX2JsYW5rXCI+e3RpdGxlfTwvYT48L3NwYW4+IDwvbGk+IDwvdWw+JywgJ2xpc3QgLCBbcmlvdC10YWc9XCJsaXN0XCJdIHsgZGlzcGxheTogYmxvY2s7IG92ZXJmbG93OiBoaWRkZW47IH0nLCBmdW5jdGlvbihvcHRzKSB7XG59KTtcblxufSx7XCJyaW90XCI6Mn1dfSx7fSxbNl0pO1xuIl0sImZpbGUiOiJhcHAuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==