//배포 후, HEROKU에서 몽고DB 계정 정보를 연결해준다.
module.exports = {
  mongoURI: process.env.MONGO_URI
}