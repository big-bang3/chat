var express = require('express');
var mongo_required = require('mongoskin');
var router = express.Router();
var crypto = require('crypto')
var bouncer = require('express-bouncer')(10000, 900000,10);


// 		*****	Client connected *****

/* GET home page. */
router.get('/', bouncer.block,function(req, res, next) {
  res.render('index', { title: 'Express' });
});
//   ****  Register GET Request ****
router.get('/register',bouncer.block,function(req,res,next){
if(req.session.loggedin){res.redirect('/login');
}
else{
res.render('reg_form') }
})
//   ****  Login POST Request ****
router.post('/login',function(req,res,next){

var db = mongo_required.db('mongodb://localhost:27017/reg_user');
var shasum = crypto.createHmac('sha256','My Secret Key').update(req.body.log_pas).digest('hex');

db.collection('user').find({name:req.body.log_user,pass:shasum}).toArray(function(err,result){if(err) throw err;

if(result[0])
{
	req.session.loggedin = true;
	req.session.name = req.body.log_user;
	bouncer.reset(req);
	res.redirect('/login');
}
else res.send('Unauthorized Access')																	})
})
//   ****  Register POST Request ****
router.post('/register',function(req,res,next){
var db = mongo_required.db('mongodb://localhost:27017/reg_user');
var shasum = crypto.createHmac('sha256','My Secret Key').update(req.body.pas).digest('hex');

db.collection('user').insert({name:req.body.user,pass:shasum},function(err){
if(err) throw err;
res.send("Registration Complete !"+req.body.user)

})

})
//   ****  Login GET Request ****
router.get('/login',function(req,res){
if(req.session.loggedin)
res.render('reg_form.jade',{user_name:req.session.name});
else
res.redirect('/register');
})
router.get('/login/:my_id',function(req,res){

res.render('reg_form.jade',{user_name:req.params.my_id});

})
router.get('/logout',function(req,res){

req.session.loggedin = false;
req.session.name = false;
res.redirect('/register')

})
module.exports = router;
 
