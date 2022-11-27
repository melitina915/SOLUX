const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

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

app.delete('/delete', function(req, res){
    console.log(req.body);
    req.body._id = parseInt(req.body._id) //문자형 '1'을 정수 1로 변환
    //req.body에 담겨온 게시물 번호를 가진 글을 db에서 찾아서 삭제해주세요
    db.collection('post').deleteOne(req.body, function(error, result){
        console.log('삭제 완료');
    });
});
