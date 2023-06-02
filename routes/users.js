var express = require('express');
const bodyParser = require('body-parser');
var User = require('../models/user');
var passport = require('passport');
var authenticate = require('../authenticate');
const cors = require('./cors');


var router = express.Router();


router.use(bodyParser.json());

/* GET users listing. */
router.options('*', cors.corsWithOptions, (req,res)=>{
  res.sendStatus(200);
});

router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, function(req, res, next ) {
  User.find({})
  .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
  }, (err) => next(err))
  .catch((err) => next(err));
});



router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
    }
    else {
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({success: true, status: 'Registration Successful!'});
      });
    }
  });
});

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, status: 'You are successfully logged in!'});
});

router.get('/logout',cors.corsWithOptions, (req,res)=>{
  if(req.session){
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error ('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

router.get('/facebook/token', passport.authenticate('facebook-token'), (req, res)=>{
  if(req.user){
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({success: true, token: token, status: 'You are successfully logged in!'});

  }
})

/*router.get('/checkJWTToken', cors.corsWithOptions,(req,res)=>{
  passport.authenticate('jwt',{session:false},(err,user,info)=>{
      if(err)
      return next(err);

      if(!user){
        res.statusCode = 401;
        res.setHeader('Content-Type','Application/json');
        return res.json({status:'JWT invalid!',success:false,err:info})
      }
      else{
        res.statusCode = 200;
        res.setHeader('Content-Type','Application/json');
        return res.json({status:'JWT valid!',success:true,user:user})

      }

  }) (req,res);
})
*/

module.exports = router;
