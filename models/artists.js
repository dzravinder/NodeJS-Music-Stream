var mongoose = require('mongoose');
var artistsSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String
  },
  albums:{
    type:[{type:mongoose.Schema.Types.ObjectId,ref :'Album'}]
  },
  priority:{
    type:Number,
  },
  images:{
    artistPage : {type:String},
    logo : {type:String},
    otherImgs : [{type:String}]
  }
});
var Artist = module.exports =  mongoose.model('Artist',artistsSchema);
//Get artist funcs
module.exports.getArtists = function(callback,limit){
  Artist.find(callback).limit(limit);
}
module.exports.getArtistById = function(id,callback){
  Artist.findById(id,callback);
}
module.exports.getArtistByName = function(name,callback)
{
  var query = {name : name};
  Artist.findOne(query,callback);
}

module.exports.getArtistsWithAlbums = function(callback,limit){//returns artists with albums info(except songInfo, see getArtistsFullInfo)
  Artist.find()
      .populate({
      path : 'albums',
      populate :{path:'albums'}
    }).limit(limit).exec(callback);
}
module.exports.getArtistsFullInfo = function(callback,limit){//returns artists with albums info(except songInfo, see getArtistsFull)
  Artist.find()
      .populate({
      path : 'albums',
      populate :{path:'albums'}
    }).limit(limit).exec(callback);
}
module.exports.getArtistsFullInfoByName = function(name,callback){//returns artists with albums info(except songInfo, see getArtistsFull)
  var query = {name : name};
  Artist.findOne(query)
      .populate({
      path : 'albums',
      populate :{path:'albums'}
    }).exec(callback);
}
//
//Priority Related funcs
module.exports.getArtistsByPriority = function(lastPriority,limit,callback){
  var query = {"priority" : 1}
  Artist.find({priority : {$gt:lastPriority}}).sort(query).limit(limit).exec(callback);
}
module.exports.getArtistLastPriority = function(callback){
  var query = {"priority" : -1}
  Artist.find().sort(query).limit(1).exec(callback);
}
//
//Search related funcs
module.exports.searchArtistsByName = function(name,callback,limit){
  var query = {'name' : new RegExp('^'+name,"i")}
  Artist.find(query,callback).limit(limit);
}
//
///CRUD related funcs
//add
module.exports.addArtist = function(artist,callback){
  Artist.create(artist,callback);
}
//
//Edit
module.exports.updateArtistByName = function(name,album,callback){
    var query = {name :name};
    var options= {};
    Artist.findOneAndUpdate(query,{'$push':{albums:album}},callback);
}
module.exports.updateOrInsertArtist = function(id,artist,callback){
  var query = {_id :id };
  var options= {};
  var update = {'$set' :artist};
  Artist.findOneAndUpdate(query,update,options,callback);
}

//
//delete
module.exports.deleteArtist = function(id, callback){
  var query = {_id: id};
  Artist.remove(query, callback);
};
