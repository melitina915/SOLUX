// 라우터 파일 필수
// require('파일경로') / require('라이브러리명')은
// 다른 파일이나 라이브러리를 여기에 첨부한다는 뜻
// require('/shop.js');
var router = require('express').Router();
// npm으로 설치했던 express 라이브러리의 Router()라는 함수를 쓰겠다는 뜻



// 로그인 정보가 있는지 검사
function checklogin(req, res, next){
    // 로그인 후 세션이 있으면 요청.user가 항상 있다
    if (req.user){ 
        // 요청.user가 있으면 next() (통과)
        next();
    } else{
        // 요청.user가 없으면 경고메세지 응답
        res.send('로그인되지 않았습니다.');
    }
}



// 여기 있는 모든 URL에 적용할 미들웨어
//router.use(checklogin);
router.use('/shirts', checklogin);



//router.get('/shop/shirts', function(req, res){
//router.get('/shirts', function(req, res){

// 개별 URL에 미들웨어를 적용하는 법
// 특정 라우터파일에 미들웨어를 적용하고 싶으면
//router.get('/shirts', checklogin로그인했니라는 미들웨어 함수, function(req, res){
//router.get('/shirts', checklogin, function(req, res){
router.get('/shirts', function(req, res){
    res.send('셔츠 구매 페이지');
});

//router.get('/shop/pants', function(req, res){
//router.get('/pants', function(req, res){
//router.get('/pants', checklogin, function(req, res){
router.get('/pants', function(req, res){
    res.send('바지 구매 페이지');
});

// module.exports = 내보낼 변수명 require('파일경로')
// router는 다른 곳에서 shop.js를 가져다 쓸 때 내보낼 변수
module.exports = router;

// shop.js 파일에 route 분리하기 끝
