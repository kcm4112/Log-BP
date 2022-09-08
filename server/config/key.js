//환경변수 process.env.NODE_DEV (현재 개발환경이 배포 전(develop단계)인지 배포 후(production 단계)인지 알려주는 환경변수)
if(process.env.NODE_DEV === 'production'){
  module.exports = require('./prod')
}
else{
  module.exports = require('./dev')
}