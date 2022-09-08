const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10
const jwt = require('jsonwebtoken')


const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50
  },
  email: {
    type: String,
    trim: true,  //공백을 없애주는 조건
  },
  password: {
    type: String
  },
  role: {
    type: Number, //관리자 = 1, 일반유저 = 0
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: { //토큰의 유효기간
    type: Number
  }
})

//스키마모델을 저장하기 전에(DB에), function을 수행한다. 여기서 function은 비밀번호를 암호화 하는 func가 될 것이다.
userSchema.pre('save', function(next){
  var user = this;

  if(user.isModified('password')){
     //비밀번호 암호화 시작.
  bcrypt.genSalt(saltRounds, function (err, salt){
    if(err) return next(err) //에러가 발생할 경우.
    bcrypt.hash(user.password, salt, function(err, hash){
      if(err) return next(err)
      user.password = hash
      next() //mongoDB에 데이터를 넣는 save함수로 이동한다.
    })
  })
  }
  else{
    next()
  }
})

//comparePassword 메소드 정의
userSchema.methods.comparePassword = function( plainPassword, cb) {

  //plainpassword를 암호화하여 db내에 있은 비밀번호와 비교해야한다.
  bcrypt.compare(plainPassword, this.password, (err, isMatch) => {
    if(err){
      return cb(err)
    }
    else{
      cb(null, isMatch)
    }
  })
}

//generateToken 메소드 정의
userSchema.methods.generateToken = function (cb) {
  var user = this
  //jwt를 이용하여 토큰 생성
  //나중에 'secrettoken' 으로 해당 유저의 id를 찾는다. 
  //jwt.sign은 유저id와 'secretToken'문자열을 합쳐서 토큰을 만드는 메소드
  var token = jwt.sign(user._id.toHexString(), 'secretToken') 
  user.token = token
  user.save((err, user) => {
    if(err){
      return cb(err)
    }
    else{
      return cb(null, user) //에러는 없고, user의 정보를 넘겨줌.
    }
  })
}

userSchema.statics.findByToken = function(token, cb) {
  var user = this
  //토큰을 decode한다.

  jwt.verify(token, 'secretToken', (err, decoded) => {
    //유저 아이디를 이용해서 유저를 찾은 다음에
    //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인

    user.findOne({"_id": decoded, "token": token}, (err, user) => {
      if(err){
        return cb(err)
      }
      else{
        return cb(null, user)
      }
    })
  })
}


const User = mongoose.model('User', userSchema) //model생성

module.exports = {User}
