var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var mongo_required = require('mongoskin');
var helmet = require('helmet');
var app = express();

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var y = []
var sock_list = []
var db = mongo_required.db('mongodb://localhost:27017/reg_user');

io.on('connection', function(socket){
  var my_msg={}
  
  socket.on('fetch_unread_msg',function(usr_name){
db.collection('msg_list').find({reciever:usr_name,read_msg:false}).toArray(function(err,result){
if(err) console.log(err);
socket.emit('display_unread_msg',result);
//socket.emit('display_msgs',result);
console.log(result);
    });


  })
  socket.on('user_name',function(user_name){
    sock_list.push({sock:socket,name:user_name});
    my_msg = {msg:user_name,my_id:socket.id};
    y.push(my_msg);
    console.log('connection made');
    io.emit('users_online',y);

  });
  socket.on('fetch_msgs',function(msg_data){
    db.collection('msg_list').find({$or:[{sender:msg_data.user1,reciever:msg_data.user2},{sender:msg_data.user2,reciever:msg_data.user1}]}).toArray(function(err,result){
if(err) console.log(err);
socket.emit('display_msgs',result);
console.log(result);
    });
      

  })
  socket.on('user_clicked',function(user_msg){

    db.collection('msg_list').insert({sender:user_msg.my_name,reciever:user_msg.send_to,message:user_msg.message,read_msg:false},function(err,suc){
                  if(err) throw err;
                  console.log(suc)

                });
for(i=0;i<sock_list.length;i++){
  if(sock_list[i].sock.id==user_msg.addr)  {
    //console.log('CLient found'+sock_list[i].id);
   // console.log('sender name:'+user_msg.my_name+' and reciever name '+my_msg.msg);          
                sock_list[i].sock.emit('msg_from_client',user_msg);
               // sock_list[i].sock.emit('msg_from_client','Message from '+user_msg.my_name+" : "+ user_msg.message);
                break;
      }

}


  });

  socket.on('disconnect',function(){
    for(var indd = 0;indd<sock_list.length;indd++)
      if(sock_list[indd].sock==socket)
        { var temp_name = sock_list[indd].name ;
          sock_list.splice(indd,1);
          for(var indx = 0 ; indx<y.length;indx++)
            if(temp_name == y[indx].msg)
              y.splice(indx,1)
        }
    console.log('disconnected');
    io.emit('users_online',y);
  
      });
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
secret: 'my secret string',
maxAge: 3600000,
resave:false,
saveUninitialized:false,
httpOnly:true
}));
app.use(helmet());
app.locals.pretty = true;
app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
server.listen(3000)
module.exports = app;
