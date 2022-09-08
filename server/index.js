const express = require('express')
const app = express()
const port = 3000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')

const {User} = require("./models/User")
const {auth} = require("./middleware/auth")


app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('mongodb connected...'))
  .catch(err => console.log(err))


//get방식
app.get('/', (req, res) => {
  res.send('Hello World!, 노드몬을 통해서 실행!!! 코드에 변경이 일어나면 자동으로 update된다. 서버 on/off 필요없음!, postman에서 client요청 보내보기!!.')
})

//post방식
//회원가입 Router생성
app.post('/register', (req, res) => {
  //회원가입 할 때 필요한 정보들을 client에서 가져오면
  //그것들을 데이터 베이스에 넣어준다.
  //user가 입력한 데이터를 bodyParser를 통해 req.body에 저장한다.
  const user = new User(req.body) 

  //save하기전에 비밀번호 암호화가 필요함.
  //Users.js에 있는 pre메소드가 실행되고 난 이후에 user.save가 실행되어야 한다.

  user.save((err, doc) => {
    if(err) return res.json({success: false, err})
    return res.status(200).json({
      success: true
    })
  })
})

//로그인 Router 생성
app.post('/api/users/login', (req, res) => {

  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => { //만약 해당하는 email이 있다면 user에 그 유저의 모든 정보가 들어갈 것이다.
    if(!user){ //만약 데이터베이스에 해당 이메일이 없다면 user에는 아무것도 없을 것이다.
      return res.json({
        loginSuccess: false,
        message: "존재하지 않는 이메일입니다."
      })
    }

    //요청된 이메일이 데이터베이스에 있다면, 비밀번호가 같은지 확인
    user.comparePassword(req.body.password , (err, isMatch) => { //comparePassword는 User모델에서 내가 정의한 메소드임. 확인해보기!
      if(!isMatch){
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다."
        })
      }
      //비밀번호까지 일치한다면, 토큰을 생성해야 한다. jsonwebToken라이브러리 이용.
      else{
        user.generateToken((err, user) => { //generateToken메소드에서 전달받은 user정보를 가지고 있다. err가 아니라면! 현재 user안에는 토큰도 있음!
          if(err){
            return res.status(400).send(err)
          }

          //토큰을 저장한다. 어디에? 쿠키 로컬스토리지 등등 여기서는 쿠키에 하겠음.
          else{
            res.cookie("x_auth", user.token) //x.auth라는 이름으로 쿠키에 저장됨.
            res.status(200)
            res.json({loginSuccess: true, userID: user._id})
          }
        })
      }
    })
  })
})


//Auth Router생성
app.get('/api/users/auth', auth, (req, res) => {

  //여기까지 미들웨어를 통과해 왔다는 얘기는 Authentication이 True라는 말
  //아래와 같은 정보들을 넘겨주면 이동한 페이지에서 이용할 수 있다!
  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true, //0이면 일반유저, 0이 아니면 관리자라는 말.
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role
  })

})


app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate(
    {_id: req.user._id}, {token: ""}, (err, user) => {
      if(err){
        return res.json({success: false, err})
      }
      else{
        return res.status(200).send({
          success: true
        })
      }
    })
})







app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})