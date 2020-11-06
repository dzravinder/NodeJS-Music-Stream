var express = require('express');
var router = express.Router();
var path = require('path');
var mongoose = require('mongoose');
Artist = require('../models/artists');
var ArtistModel = mongoose.model("Artist");
Album = require('../models/albums');
var AlbumModel = mongoose.model("Album");
Song = require('../models/songs');
var SongModel = mongoose.model("Song");
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
router.get('/',function(req,res)
{
  Album.getAlbums(function(err,callback){
    res.json(callback);
  });
});
router.get('/add',function(req,res)
{
  res.render("album/Add/AlbumAdd");
});
router.post('/add/submit',function(req,res){
  Artist.getArtistsFullInfoByName(req.body.name,function(err,artist){
    if(err)
    {
      res.render('error/somethingwrong',{error:err});
    }
    else
    {
      res.send({artist:artist});
    }
  });
});
router.get('/edit',function(req,res){
  res.render('album/Edit');
});
router.post('/edit',function(req,res){
  Album.getAlbumById(req.body.id,function(err,album){
    if(err)
    {
      res.render('error/somethingwrong',{error:err});
    }
    else
    {
      var oldName = album.name;
      var newName = req.body.newname;
      var artist = album.artist;
      album.name = req.body.newname || album.name;
      album.description = req.body.description || album.description;
      Album.updateAlbum(album._id,album,function(err,editedAlbum){
        if(err)
        {
          res.render('error/somethingwrong',{error:err});
        }
        else{
            res.send({album:editedAlbum});
        }
      });

    }
  });
});
router.post('/add',function(req,res){
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb(null, 'artistsMedia/drake/songs')
      var dir = 'artistsMedia/' + req.body.name+ '/albums/' + req.body.albumName;
      mkdirp(dir,err => cb(err,dir))
    },
    filename: function (req, file, cb) {
      cb(null, req.body.name +'-'+ req.body.albumName +'-' + Date.now() + path.extname(file.originalname)) //Appending extension
    },

  });
  var upload = multer({
    storage: storage,
  }).fields([{name:'coverArt',maxCount:1},{name:'songs',maxCount:20}]);
  upload(req,res,function(err)
  {
    if(err)
      res.render('error/somethingwrong',{error:err});
      else{
        var album = new AlbumModel({
          name : req.body.albumName.toLowerCase(),
          coverArt : '/' +req.files['coverArt'][0].destination + '/' + req.files['coverArt'][0].filename,
          description:req.body.description,
          artist:req.body.name.toLowerCase(),
          songs:[]
        });
        Album.addAlbum(album,function(err,created){
          if(err)
          {
            res.render('error/somethingwrong',{error:err});
          }
          else{
            for(var i=0;i<req.files['songs'].length;i++)
            {
              var song = new SongModel({
                name : req.files['songs'][i].originalname,
                album : created._id,
                artist:req.body.name.toLowerCase(),
                songPath : '/' +req.files['songs'][i].destination + '/'+req.files['songs'][i].filename
              });
              album.songs.push(song);
              Song.addSong(song,function(err,callback){
                if(err)
                {
                  res.render('error/somethingwrong',{error:err});
                }
              });
            }
            Album.updateAlbum(created._id,album,function(err,albumAdded){
              if(err)
              {
                res.render('error/somethingwrong',{error:err});
              }
              else{
                Artist.updateArtistByName(req.body.name,album,function(err,artistAdded){
                  if(err)
                  {
                    res.render('error/somethingwrong',{error:err});
                  }
                  else{
                    res.redirect('/artists/'+req.body.name.toLowerCase());
                  }
                });
              }
            });
          }
        });
      }
  });
});
router.post('/add/newAlbum',function(req,res){
  var album = new AlbumModel({
    name : req.body.albumName.toLowerCase(),
    description:req.body.description,
    artist:req.body.name.toLowerCase(),
    songs:[]
  });
  Album.addAlbum(album,function(err,created){
    if(err)
    {
      res.render('error/somethingwrong',{error:err});
    }
    else{
      res.send({album:created});
    }
  });

});
router.post('/add/artist',function(req,res)
{
  var name = req.body.name;
  Artist.searchArtistsByName(name,function(err,artists){
    if(err)
    {
      throw err;
    }
    else{
      res.send({artists:artists});
    }
  });
});
router.post('/getAlbum',function(req,res){
  Album.getAlbumById(req.body.name,function(err,album){
    if(err)
    {
      res.render('error/somethingwrong',{error:err});
    }
    else{
      res.send({album:album});
      }
  });
});
router.post('/edit/addImages',function(req,res){
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb(null, 'artistsMedia/drake/songs')
      var dir = 'artistsMedia/' + req.body.artistId+ '/albums/' + req.body.id;
      mkdirp(dir,err => cb(err,dir))
    },
    filename: function (req, file, cb) {
      cb(null, req.body.id   + Date.now() + path.extname(file.originalname)) //Appending extension
    },

  });
  var upload = multer({
    storage: storage,
  }).fields([{name:'coverArt',maxCount:1},{name:'songs',maxCount:20}]);
  upload(req,res,function(err)
  {
    if(err)
      res.render('error/somethingwrong',{error:err});
      else{
        Album.getAlbumById(req.body.id,function(err,created)
        {
          if(err)
          {
            res.render('error/somethingwrong',{error:err});
          }
          else
          {
            if(!isEmpty(req.files))
            {
              if(!isEmpty(req.files['coverArt']))
              {
                created.coverArt = '/' +req.files['coverArt'][0].destination + '/' + req.files['coverArt'][0].filename;
              }
              if(!isEmpty(req.files['songs']))
              {
                console.log(created);
                for(var i=0;i<req.files['songs'].length;i++)
                {
                  var song = new SongModel({
                    name : req.files['songs'][i].originalname,
                    album : created._id,
                    artist:req.body.name.toLowerCase(),
                    songPath : '/' +req.files['songs'][i].destination + '/'+req.files['songs'][i].filename
                  });
                  created.songs.push(song);
                  Song.addSong(song,function(err,callback){
                    if(err)
                    {
                      res.render('error/somethingwrong',{error:err});
                    }
                  });
                }
                Album.updateAlbum(created._id,created,function(err,albumAdded){
                  if(err)
                  {
                    res.render('error/somethingwrong',{error:err});
                  }
                  else{
                    Artist.updateArtistByName(req.body.name,albumAdded,function(err,artistAdded){
                      if(err)
                      {
                        res.render('error/somethingwrong',{error:err});
                      }
                      else{
                        res.redirect('/artists/'+artistAdded.name);
                      }
                    });
                  }
                });
              }
            }
          }
        });
      }
    });
});
router.post('/edit/images',function(req,res){
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      //cb(null, 'artistsMedia/drake/songs')
      var dir = 'artistsMedia/' + req.body.artistId+ '/albums/' + req.body.id;
      mkdirp(dir,err => cb(err,dir))
    },
    filename: function (req, file, cb) {
      cb(null, req.body.id + Date.now() + path.extname(file.originalname)) //Appending extension
    },

  });
  var upload = multer({
    storage: storage,
  }).fields([{name:'coverArt',maxCount:1},{name:'songs',maxCount:20}]);
  upload(req,res,function(err)
  {
    console.log(req.body.id);
    if(err)
      res.render('error/somethingwrong',{error:err});
      else{
        Album.getAlbumById(req.body.id,function(err,created)
        {
          if(err)
          {
            res.render('error/somethingwrong',{error:err});
          }
          else
          {
            console.log(created);
            if(!isEmpty(req.files))
            {
              if(!isEmpty(req.files['coverArt']))
              {
                created.coverArt = '/' +req.files['coverArt'][0].destination + '/' + req.files['coverArt'][0].filename;
              }
              if(!isEmpty(req.files['songs']))
              {
                for(var i=0;i<req.files['songs'].length;i++)
                {
                  var song = new SongModel({
                    name : req.files['songs'][i].originalname,
                    album : created._id,
                    artist:req.body.name.toLowerCase(),
                    songPath : '/' +req.files['songs'][i].destination + '/'+req.files['songs'][i].filename
                  });
                  created.songs.push(song);
                  Song.addSong(song,function(err,callback){
                    if(err)
                    {
                      res.render('error/somethingwrong',{error:err});
                    }
                  });
                }
                Album.updateAlbum(created._id,created,function(err,albumAdded){
                  if(err)
                  {
                    res.render('error/somethingwrong',{error:err});
                  }
                  else{
                    Artist.updateArtistByName(req.body.name,albumAdded,function(err,artistAdded){
                      if(err)
                      {
                        res.render('error/somethingwrong',{error:err});
                      }
                      else{
                        res.redirect('/artists/'+req.body.name.toLowerCase());
                      }
                    });
                  }
                });
              }
            }
          }
        });
      }
    });
});
router.post('/getAlbumInfo',function(req,res){
  Album.getAlbumSongsById(req.body.id,function(err,album){
    if(err){
      res.render('error/somethingwrong',{error:err});
    }
    else{
      res.send({album:album});
    }
  })
});
module.exports = router;
