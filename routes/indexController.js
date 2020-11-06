var express = require('express');
var router = express.Router();
var path = require('path');
router.get('/',function(req,res)
{
  res.render('home/index');
});
router.post('/fromLanding',function(req,res)
{

  var lastPriority = req.body.priority;

  if(typeof(lastPriority) == 'undefined')
  {
  res.json('Wrong input');
  }
  Artist.getArtistsByPriority(lastPriority,3,function(err,artists){
    if(err)
    {
      throw err;
    }
    else
    {

      console.log(artists);
      res.send({artists:artists});
    }
  });
});
router.post('/',function(req,res){
  var priority = req.body.lastPriority;
  
  var lastPriority = 0;
  Artist.getArtistLastPriority(function(err,artist){
    if(err)
    {
      throw err;
    }
    else
    {
      lastPriority = artist[0].priority;
      if(priority >= lastPriority)
      {
        priority = 0;
      }
      Artist.getArtistsByPriority(priority,3,function(err,artists){
        if(err)
        {
          throw err;
        }
        else{
            res.send({artists:artists});
        }
      });
    }
  });



});
function ensureAuthenticated(req,res,next){
  if(req.isAuthenticated())
    return next();
    else{
      req.flash('error','You are not logged in');
      res.redirect('/users/login');
    }
}
module.exports = router;
