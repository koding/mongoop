module.exports = class MongoOp

  {setAt, getAt, deleteAt, pushAt, popAt} = require 'jspath'
  {keys} = Object

  isEqual = require 'deep-equal'

  constructor:(operation)->
    return new MongoOp operation unless @ instanceof MongoOp
    @operation = operation

  applyTo:(target)->
    @result = {}
    keys(@operation).forEach (operator)=>
      unless 'function' is typeof @[operator]
        throw new Error "Unrecognized operator: #{operator}"
      else
        @[operator] target, @operation[operator]
    return this

  map: (fn) ->
    op = @operation
    @operation = {}
    keys(op).forEach (operator) =>
      @operation[operator] = fn operator, op[operator]
    return this

  forEachField:(fields, fn)->
    keys(fields).map (path)=>
      val = fields[path]
      @result[path] = fn path, val

  $addToSet:do ->
    $addToSet =(collection, val)->
      matchFound = no
      for item in collection when isEqual item, val
        matchFound = yes
        break
      collection.push val unless matchFound
    (target, fields)->
      @forEachField fields, (path, val)=>
        collection = getAt target, path
        unless collection?
          collection = []
          setAt target, path, collection
        if val.$each?
          $addToSet collection, child for child in val.$each
        else
          $addToSet collection, val

  $push:(target, fields)->
    @forEachField fields, (path, val)-> pushAt target, path, val

  $pushAll:(target, fields)->
    @forEachField fields, (path, vals)-> pushAt target, path, vals...

  $pull:->
    throw new Error \
      """
      This version of MongoOp does not implement $pull...
      Look for that in a future version.  You can use $pullAll instead.
      """

  $pullAll:(target, fields)->
    @forEachField fields, (path, val)->
      collection = getAt target, path
      index = 0
      while collection and index < collection.length
        i = index++
        if isEqual collection[i], val
          collection.splice i, 1

  $pop:(target, fields)->
    @forEachField fields, (path)-> popAt target, path

  $set:(target, fields)->
    @forEachField fields, (path, val)->
      setAt target, path, val
      val

  $unset:(target, fields)->
    @forEachField fields, (path)-> deleteAt target, path

  $rename:(target, fields)->
    @forEachField fields, (oldPath, newPath)->
      val = getAt target, oldPath
      deleteAt target, oldPath
      setAt target, newPath, val

  $inc:do->
    $inc = (val, amt)-> val += amt
    (target, fields)->
      @forEachField fields, (path, val)->
        setAt target, path, $inc getAt(target, path), val
