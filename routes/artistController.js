var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
var fs = require('fs-extra');
Artist = require('../models/artists.js');
var ArtistModel = mongoose.model("Artist");
var multer = require('multer');
var mkdirp = require('mkdirp');
function isEmpty(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and toValue enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}
//API
router.get('/api',function(req,res){
    Artist.getArtistsFullInfoByName("drake",function(err,callback){
      if(err)
      {
        res.json('Error');
      }
      res.json(callback.albums);
    });

});
router.get('/add',function(req,res){
    res.render("artist/add")
});
router.get('/edit',function(req,res){
    res.render("artist/edit");
});
router.post('/edit',function(req,res){
    var artistName = req.body.name.toLowerCase();
    Artist.getArtistByName(artistName,function(err,artist){
      if(err)
      {
        res.render('error/somethingwrong',{error:err});
      }
      else{
        var oldName = artist.name;
        var newName = req.body.newname;
        artist.name = req.body.newname || artist.name;
        artist.description = req.body.description || artist.description;
        Artist.updateOrInsertArtist(artist._id,artist,function(err,callback){
          if(err)
          {
            res.render('error/somethingwrong',{error:err});
          }
          else{
            Album.updateAlbumByArtist(oldName,newName,function(err,albumEdited){
              if(err)
              {
                res.render('error/somethingwrong',{error:err});
              }
              else{
                Song.updateSongByArtist(oldName,newName,function(err,songEdited){
                  if(err)
                  {
                    res.render('error/somethingwrong',{error:err});
                  }
                  else{
                    res.send({artist:callback});
                  }
                });
              }
            });
          }
        });
      }
    });
});
router.post('/edit/images',function(req,res){
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb(null, 'artistsMedia/drake/songs')
      var dir = 'artistsMedia/' + req.body.id+ '/images';
      mkdirp(dir,err => cb(err,dir))
    },
    filename: function (req, file, cb) {
      cb(null, req.body.id + encodeURI(req.body.name.toLowerCase()) + encodeURI(file.fieldname.toLowerCase()) +'-'+ Date.now() + path.extname(file.originalname)) //Appending extension
    },

  });
  var upload = multer({
    storage: storage,
    limits :{fileSize :52428800}
  }).fields([{name:'Logo',maxCount:1},{name:'artistHome',maxCount:1},{name:'otherImgs',maxCount:10}]);
  upload(req,res,function(err)
  {
    if(err)
      res.render('error/somethingwrong',{error:err});
      else{

        Artist.getArtistByName(req.body.name,function(err,artistByName){
          if(err)
          {
            res.render('error/somethingwrong',{error:err});
          }
          else{
            if(!isEmpty(req.files))
            {
              if(!isEmpty(req.files['artistHome']))
              {
                artistByName.images.artistPage='/' +req.files['artistHome'][0].destination + '/'+req.files['artistHome'][0].filename;
              }
              if(!isEmpty((req.files['Logo'])))
              {
                artistByName.images.logo= '/' +req.files['Logo'][0].destination + '/'+req.files['Logo'][0].filename;
              }
              if(!isEmpty(req.files['otherImgs']))
              {
                for(var i=0;i<req.files['otherImgs'].length;i++)
                {
                    artistByName.images.otherImgs.push('/' + req.files['otherImgs'][i].destination + '/'+req.files['otherImgs'][i].filename)
                }
              }
              Artist.updateOrInsertArtist(artistByName._id,artistByName,function(err,callback){
                if(err)
                {
                  res.render('error/somethingwrong',{error:err});
                }
                else{
                  res.redirect('/artists/'+callback.name);
                }
              });
            }
            else{
                res.redirect('/artists/'+artistByName.name);
            }

          }

        });
      }
  });
});
router.post('/add/newArtist',function(req,res){
  Artist.getArtistLastPriority(function(err,lastprio){
    if(err)
    {
    res.render('error/somethingwrong',{error:err});
    }
    else{
      var lastPr = lastprio[0].priority;
      lastPr++;
      var artist = new ArtistModel({
        name : req.body.name.toLowerCase(),
        description:req.body.description,
        priority:lastPr,
      });
      Artist.addArtist(artist,function(err,callback){
        if(err)
        {
          res.render('error/somethingwrong',{error:err});
        }
        else{
          console.log(callback);
          res.status(201).send({artist:callback});
          }
      });
    }
  });

});
router.post('/add/aristName',function(req,res){
  console.log(req.body.name);
  Artist.getArtistByName(req.body.name,function(err,callback){
    if(err)
    {
      res.render('error/somethingwrong',{error:err});
    }
    res.send({artist:callback});
  });
});
router.post('/albums',function(req,res){
    var name = req.body.name;
    Album.getAlbumsByArtist(name,function(err,albums){
      if(err)
      {
        res.render('error/somethingwrong',{error:err});
      }
      else{
        res.send({albums:albums});
      }
    });
});
router.post('/songs',function(req,res){
    var name = req.body.name;
    Song.findSongByArtistName(name,function(err,songs){
      if(err)
      {
        res.render('error/somethingwrong',{error:err});
      }
      else{
        res.send({songs:songs});
      }
    });
});
router.post('/albums/songs',function(req,res){
    var artistName = req.body.artistName;
    var albumName =  req.body.albumName
    Album.getAllAlbumsSongsByName(artistName,albumName,function(err,albums){
      if(err)
      {
        res.render('error/somethingwrong',{error:err});
      }
      else{
        res.send({albums:albums});
      }
    });
});
router.get('/:name',function(req,res){
  var name = req.params.name.toLowerCase();
  console.log(name);
  Artist.getArtistByName(name,function(err,artist){
    if(err)
    {
      res.render('error/somethingwrong',{error:err});
    }
    else
    {
      if(artist == null || typeof(artist) == 'undefined')
      {
        res.render('error/somethingwrong',{error:"Artist not found."});
      }
      else{
        res.render('artist/details',{artist:artist});
      }
    }
  });

});
router.post('/add',function(req,res){
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb(null, 'artistsMedia/drake/songs')
      var dir = 'artistsMedia/' + req.body.id+ '/images';
      mkdirp(dir,err => cb(err,dir))
    },
    filename: function (req, file, cb) {
      cb(null, req.body.id+ file.fieldname + Date.now() + path.extname(file.originalname)) //Appending extension
    },

  });
  var upload = multer({
    storage: storage,
    limits :{fileSize :52428800}
  }).fields([{name:'Logo',maxCount:1},{name:'artistHome',maxCount:1},{name:'otherImgs',maxCount:10}]);
  upload(req,res,function(err)
  {
    //console.log(req.files);
    //console.log(req.files.fieldname);
    if(err)
      res.render('error/somethingwrong',{error:err});
      else{
        Artist.getArtistLastPriority(function(err,lastprio){
          if(err)
          {
          res.render('error/somethingwrong',{error:err});
          }
          else{
            var lastPr = lastprio[0].priority;
            lastPr++;
            var artist = new ArtistModel({
              name : req.body.name.toLowerCase(),
              description:req.body.description,
              priority : lastPr,
              images:{
                artistPage:'/' +req.files['artistHome'][0].destination + '/'+req.files['artistHome'][0].filename,
                logo: '/' +req.files['Logo'][0].destination + '/'+req.files['Logo'][0].filename,
                otherImgs:[]
              }
            });
            console.log(artist);
            for(var i=0;i<req.files['otherImgs'].length;i++)
            {
              artist.images.otherImgs.push('/' + req.files['otherImgs'][i].destination + '/'+req.files['otherImgs'][i].filename)
            }
            Artist.addArtist(artist,function(err,callback){
              if(err)
              {
                res.render('error/somethingwrong',{error:err});
              }
              else{
                res.send("created");
              }
            });
          }
        });
      }
  });
});
router.post('/add/images',function(req,res){
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb(null, 'artistsMedia/drake/songs')
      var dir = 'artistsMedia/' + req.body.id+ '/images';
      mkdirp(dir,err => cb(err,dir))
    },
    filename: function (req, file, cb) {
      cb(null, req.body.id +encodeURI(req.body.name)+encodeURI(file.fieldname.toLowerCase())+ Date.now() + path.extname(file.originalname)) //Appending extension
    },

  });
  var upload = multer({
    storage: storage,
    limits :{fileSize :52428800}
  }).fields([{name:'Logo',maxCount:1},{name:'artistHome',maxCount:1},{name:'otherImgs',maxCount:10}]);
  upload(req,res,function(err)
  {
    if(err)
      res.render('error/somethingwrong',{error:err});
      else{
        console.log('here');
        console.log(req.body.name);
        Artist.getArtistByName(req.body.name,function(err,artistByName){
          if(err)
          {
            res.render('error/somethingwrong',{error:err});
          }
          else{
            artistByName.images.artistPage='/' +req.files['artistHome'][0].destination + '/'+req.files['artistHome'][0].filename;
            artistByName.images.logo= '/' +req.files['Logo'][0].destination + '/'+req.files['Logo'][0].filename;
            for(var i=0;i<req.files['otherImgs'].length;i++)
            {
              artistByName.images.otherImgs.push('/' + req.files['otherImgs'][i].destination + '/'+req.files['otherImgs'][i].filename)
            }
            Artist.updateOrInsertArtist(artistByName._id,artistByName,function(err,callback){
              if(err)
              {
                res.render('error/somethingwrong',{error:err});
              }
              else{
                res.redirect('/artists/'+callback.name);
              }
            });
          }

        });
      }
  });
});
module.exports = router;
