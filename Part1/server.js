const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended : true}));

app.listen(8080, function(){
    console.log('listening on 8080')
});

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

app.post('/add', function(req, res){
    res.send('전송완료');
    //console.log(req.body)
    console.log(req.body.title)
    console.log(req.body.date)
})
