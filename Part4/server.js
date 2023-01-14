const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient;
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

/*const MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb+srv://<id>:<password>@<cluster>.<example>.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    app.listen(8080, function(){
        console.log('listening on 8080')
    });
})*/

var db;
MongoClient.connect('mongodb+srv:///<id>:<password>@<cluster>.<example>.mongodb.net/?retryWrites=true&w=majority', function(error, client){
    // 연결되면 할 일
    if(error){
        return console.log(error)
    }

    db = client.db('todoapp');
    /*db.collection('post').insertOne({name : 'John', age : 20}, function(error, result){
        console.log('저장 완료');
    });
    db.collection('post').insertOne({name : 'John', _id : 100}, function(error, result){
        console.log('저장 완료');
    });*/

    app.listen(8080, function(){
        console.log('listening on 8080')
    });
})

/*app.listen(8080, function(){
    console.log('listening on 8080')
});*/

//누군가가 /pet으로 방문을 하면..
//pet 관련된 안내문을 띄워주자

//app.get('/pet', function(요청, 응답){
//    응답.send('펫용품 쇼핑할 수 있는 페이지');
//});

app.get('/pet', function(req, res){
    res.send('펫용품 쇼핑할 수 있는 페이지');
});

app.get('/beauty', function(req, res){
    res.send('뷰티용품 쇼핑할 수 있는 페이지');
});

//app.get('/', function(req, res){
//    res.sendFile(__dirname + '/index.html');
//});

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index1.html');
});

app.get('/write', function(req, res){
    res.sendFile(__dirname + '/write.html');
});



// 글 번호 달기 기능



// /list로 GET 요청으로 접속하면
// 실제 dB에 저장된 데이터들로 예쁘게 꾸며진 HTML을 보여준다
// 보기 기능
app.get('/list', function(req, res){

    // DB에 저장된 post라는 collection 안의 모든(/id가 뭐인/제목이 뭐인) 데이터를 꺼내주세요
    db.collection('post').find().toArray(function(error, result){
        console.log(result);
        res.render('list.ejs', { posts : result });
    });

    //res.render('list.ejs');
});



// 서버에서 query string 꺼내는 법
app.get('/search', (req, res) => {
    var searching = [
        {
            $search: {
                index: 'titleSearch',
                text: {
                    query: req.query.value,
                    path: 'title' // 제목 날짜 둘 다 찾고 싶으면 ['제목', '날짜']
                }
            }
        }, 
        //{ $sort : {_id : 1 } }, // 검색조건 더 주어 검색 결과 정렬
        //{ $limit : 10 } // 개수 limit 주기
        //{ $project : { title: 1, _id: 0, score: { $meta: "searchScore" } } } // 검색 결과에서 필터 주기
        // 위 조건은 title을 가져오고 id는 가져오지 않고 score 항목을 추가하여 점수를 가져온다
    ]
    console.log(req.query.value); // req에는 요청한 유저의 정보가 다 담겨있다
    // req.query.value는 { object 자료 }에서 데이터를 꺼내는 문법일 뿐이다
//    db.collection('post').find({title:req.query.value}).toArray((err, result) => {
//    db.collection('post').find( { $text: { $search: req.query.value } } ).toArray((err, result) => {
    db.collection('post').aggregate(searching).toArray((err, result) => {
        // 제목이 정확히 req.query.value와 일치하는 것만 찾아준다
        console.log(result);
        // ejs 파일에 데이터 보내기
        res.render('search.ejs', {posts : result});
    });
});

// /detail1로 접속하면 detail1.ejs를 보여준다
// /detail/2로 접속하면 detail2.ejs를 보여준다
// /detail/3으로 접속하면 detail3.ejs를 보여준다
app.get('/detail/:idnum', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.idnum)}, function(error, result){
        console.log(result);
        res.render('detail.ejs', { data : result });
    });
});
// 없는 게시물은 어떻게 처리할까
// 글 목록 페이지 /list에서 글 제목 누르면 상세페이지로 이동시키기

app.get('/edit/:id', function(req, res){
    db.collection('post').findOne({_id : parseInt(req.params.id)}, function(err, result){
        console.log(result)
        res.render('edit.ejs', {post : result});
        //res.render('edit.ejs', 파라미터 중 :id 번 게시물의 제목/날짜);
    });
});

app.put('/edit', function(req, res){
    // 폼에 담긴 제목 데이터, 날짜 데이터를 가지고
    // db.collection에다가 업데이트
    db.collection('post').updateOne({ _id : parseInt(req.body.id) }, { $set : { title: req.body.title , date: req.body.date }}, function(err, result){
        console.log('수정완료');
        res.redirect('/list');
    });
});



const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

// 미들웨어 설정
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', function(req, res){
    res.render('login.ejs');
});
// 누군가 로그인 시 /login으로 POST 요청 하면
// 아래 함수를 이용해 아이디/비번 검증
app.post('/login', passport.authenticate('local', {
    failureRedirect : '/fail'
}), function(req, res){
    // 아이디 비번 맞으면 로그인 성공페이지로 보내줘야함
    // 회원 인증 성공하면 홈('/')으로 redirect
    res.redirect('/');
});



// 마이페이지 접속, 미들웨어 사용하기
app.get('/mypage', checklogin, function(req, res){
    // 마이페이지 접속 시 요청.user에 사용자의 정보가 담긴다
    console.log(req.user);
    res.render('mypage.ejs', {member : req.user});
});
// 로그인 했는지 판단하는 함수, 미들웨어 만들기
// 마이페이지 접속 전 실행할 미들웨어
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



// 아이디/비번 맞으면 세션을 하나 만들어줘야할 듯
passport.use(new LocalStrategy({
    // 유저가 입력한 아이디/비번 항목이 무엇인지 정의 (name 속성)
    usernameField: 'id',
    passwordField: 'pw',
    // 로그인 후 세션을 저장할 것인지
    session: true,
    // 아이디/비번 말고도 다른 정보 검증시
    passReqToCallback: false,
}, function(inputid, inputpw, done){
    // 사용자의 아이디, 비번을 검증하는 부분
    // 입력한 아이디와 비번
    console.log(inputid, inputpw);
    // DB에 입력한 아이디가 있는지 찾기
    db.collection('login').findOne({id : inputid}, function(err, result){
        // DB 연결 불가 등의 상황에서 실행
        if (err) return done(err)
        // DB에 아이디가 없으면 아래를 실행
        // 아이디/비번 안맞으면 false 넣어야 함
        if (!result) return done(null, false, {message : '존재하지 않는 아이디'})
        // DB에 아이디가 있으면, 입력한 비번과 결과.pw 비교
        if (inputpw == result.pw){
            return done(null, result)
        } else{
            return done(null, false, {message : '비밀번호가 틀렸습니다'})
        }
    });
}));

// 세션 만들기
// id를 이용해서 세션을 저장시키는 코드 (로그인 성공시 발동)
// 아이디/비번 검증 성공시 result 값이 user로 보내진다
passport.serializeUser(function(user, done){
    // id를 이용해서 세션을 저장시키는 코드 (로그인 성공시 발동)
    done(null, user.id);
    // 세션 데이터를 만들고 세션의 id 정보를 쿠키로 보냄
});
// 해당 세션 데이터를 가진 사람을 DB에서 찾아주세요 (마이페이지 접속시 발동)
// 로그인한 유저의 개인정보를 DB에서 찾는 역할
passport.deserializeUser(function(userid, done){
    // DB에서 위에 있는 user.id로 유저를 찾은 뒤에
    // 유저 정보를 result 안에 넣는다
    // 여기에서의 userid는 위의 user.id, 즉 test와 같다
    db.collection('login').findOne({id : userid}, function(err, result){
        done(null, result);
        // result에는 {id : test, pw : test}가 들어간다
        // 따라서 마이페이지 접속 시 DB에서 { id : 어쩌구 }인 것을 찾아서
        // 해당 결과를 보내준다
    });
});



app.post('/register', function(req, res){
    db.collection('login').insertOne( {id : req.body.id, pw : req.body.pw }, function(err, result){
        res.redirect('/');
    } );
});



// 작성 기능
app.post('/add', function(req, res){
    res.send('전송완료');
    //console.log(req.body)
    console.log(req.body.title)
    console.log(req.body.date)

    // 어떤 사람이 /add 라는 경로로 post 요청을 하면,
    // 데이터 2개(날짜, 제목)을 보내주는데,
    // 이 때, 'post'라는 이름을 가진 collection에 두 개 데이터를 저장
    // { 제목 : '어쩌구', 날짜 : '어쩌구' }
    db.collection('counter').findOne({name : '게시물 개수'}, function(error, result){
        console.log(result.totalPost);
        var totalpostnum = result.totalPost;

        var tosave = { _id : totalpostnum + 1, editor : req.user._id, title : req.body.title, date : req.body.date }

        // 글을 발행해주는 기능
        db.collection('post').insertOne(tosave, function(error, result){
            // _id : 총 게시물 개수 + 1
            console.log('저장완료');

            // counter라는 콜렉션에 있는 totalPost라는 항목도 1 증가시켜야 한다
            db.collection('counter').updateOne({name : '게시물 개수'}, { $inc : {totalPost : 1} }, function(error, result){
                if(error){
                    return console.log('에러')
                }
            });
        });
    });
});



app.delete('/delete', function(req, res){
    console.log('삭제 요청');
    console.log(req.body);
    req.body._id = parseInt(req.body._id); //문자형 '1'을 정수 1로 변환
    
    // _id와 작성자가 일치하는 게시물을 찾아서 지워준다
    var deletedata = { _id : req.body._id, editor : req.user._id };
    
    //req.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(deletedata, function(error, result){
        // 터미널 창에 삭제 완료 출력
        console.log('삭제 완료');

        if(error) {console.log(error);}
        if(result) {console.log(result);}

        //응답코드 200을 보내고 메시지를 보내주세요
        res.status(200).send({ message : '성공' });
        //res.status(400).send({ message : '실패' });
    });
});






//app.get('/shop/shirts', function(req, res){
//    res.send('셔츠 구매 페이지');
//});
//app.get('/shop/pants', function(req, res){
//    res.send('바지 구매 페이지');
//});

// app.use는 미들웨어(요청과 응답 사이에 실행되는 코드)
// shop.js 파일을 여기에 첨부하겠다는 뜻
// 고객이 / 경로로 요청했을 때
// 이런 미들웨어(방금 만든 라우터 shop.js)를 적용하라는 뜻
//app.use('/', require('./routes/shop.js'));

// /shop으로 접속하면 shop.js 라우터를 이용한다는 뜻
// /shop으로 시작하는 라우트들 관리도 편해짐, 유지 보수가 쉬워짐
app.use('/shop', require('./routes/shop.js'));



//app.get('board/sub/sports', function(req, res){
//    res.send('스포츠 게시판');
//});
//app.get('/board/sub/game', function(req, res){
//    res.send('게임 게시판');
//});
app.use('/board/sub', require('./routes/board.js'));



// multer 라이브러리 불러오기
let multer = require('multer');
// diskStorage : 이미지를 어디에 저장할지 정의하는 함수
// memoryStorage : 이미지를 휘발성 있게 램에다가 저장
var storage = multer.diskStorage({
    // public/image 폴더 안에 이미지 저장
    destination : function(req, rile, cb){
        cb(null, './public/image');
    },
    // 저장한 이미지의 파일명 설정하는 부분
    filename : function(req, file, cb){
        cb(null, file.originalname);
        // 파일명을 다이나믹하게 하려면?
        //cb(null, file.originalname + '날짜' + new Date());
    }, 
    // 파일 형식 (확장자) 거르기
    filefilter : function(req, file, cb){

    },
    //limits : 
});

var upload = multer({storage : storage});

app.get('/upload', function(req, res){
    res.render('upload.ejs');
});
// 미들웨어인 upload 사용
// upload.single('upload.ejs에서 input의 name속성이름')
// 파일을 image 파일에 저장
app.post('/upload', upload.single('profile'), function(req, res){
    res.send('업로드 완료')
});

// 파일을 여러 개 업로드 하려면?
// 'profile'옆의 10은 파일을 받을 최대 개수를 의미한다
// upload.ejs에서 input도 여러 개여야 한다
//app.post('/upload', upload.array('profile', 10), function(req, res){
//    res.send('업로드 완료')
//});

// : 은 URL 파라미터 문법이다
app.get('/image/:imageName', function(req, res){
    // __dirname : 현재 파일 경로
    // /image/music.jpg라고 하면 music.jpg를 보내줘야 한다
    res.sendFile( __dirname + '/public/image/' + req.params.imageName );
});

//<img src="/image/KakaoTalk_20220920_203159837.jpg>"
