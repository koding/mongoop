ob = {
  repliesCount: 3
  replies: [
    'O, kule!'
    'Fun'
    'OK'
  ]
}

# MongoOp = require '../index'
# 
# console.log MongoOp
# 
# MongoOp
#   $set: 'foolio.baruski': 10
# .applyTo ob
# 
# console.log ob
# 
# MongoOp($inc: repliesCount: 1).applyTo ob
# 
# console.log ob
# 

MongoOp
  $set: 'profile.nickname' : 'something'
.applyTo ob

MongoOp
  $addToSet: replies: 'Fun'
.applyTo ob

MongoOp
  $addToSet: replies: 'little rock and roll'
.applyTo ob

MongoOp
  $addToSet: replies: $each: ['Fun', 'Bags']
.applyTo ob


MongoOp
  $push: replies: 'Fun'
.applyTo ob

# console.log ob

# MongoOp
#   $pull: replies: 'Fun'
# .applyTo ob

console.log ob