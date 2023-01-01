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
MongoClient.connect('mongodb+srv://melitina915:peachpotato1119@cluster0.heax8ik.mongodb.net/?retryWrites=true&w=majority', function(error, client){
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

        // 글을 발행해주는 기능
        db.collection('post').insertOne({ _id : totalpostnum + 1, title : req.body.title, date : req.body.date }, function(error, result){
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
    console.log(req.query.value); // req에는 요청한 유저의 정보가 다 담겨있다
    // req.query.value는 { object 자료 }에서 데이터를 꺼내는 문법일 뿐이다
    db.collection('post').find({title:req.query.value}).toArray((err, result) => {
        // 제목이 정확히 req.query.value와 일치하는 것만 찾아준다
        console.log(result);
        // ejs 파일에 데이터 보내기
        res.render('search.ejs', {posts : result});
    });
});



app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id) //문자형 '1'을 정수 1로 변환
    //req.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(req.body, function(error, result){
        // 터미널 창에 삭제 완료 출력
        console.log('삭제 완료');

        //응답코드 200을 보내고 메시지를 보내주세요
        res.status(200).send({ message : '성공' });
        //res.status(400).send({ message : '실패' });
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







