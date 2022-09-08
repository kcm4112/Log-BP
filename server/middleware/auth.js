const { User } = require("../models/User")

let auth = (req, res, next) => {

  //인증 처리를 하는 곳.

  //Client 쿠키에서 Token을 가져온다.
  let token = req.cookies.x_auth


  //가져온 Token을 복호화한 후, 유저를 찾는다.
  User.findByToken(token, (err, user) => {
    if(err){
      throw err
    }
    if(!user){
      return res.json({isAuth: false, error: true})
    }

    req.token = token
    req.user = user
    next() //미들웨어에서 다음 단계로 갈 수 있도록 next를 해준다.
  })
  //유저가 있으면 인증 OK

  //유저가 없으면 인증 NO

}

module.exports = {auth}