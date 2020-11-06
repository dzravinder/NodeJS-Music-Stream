var mongoose = require('mongoose');
var albumsSchema = mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  coverArt : {
    type:String,
    default : null
  },
  description:{
    type:String,
    default : null
  },
  artist:{
    type:String,
    required : true
  },
  songs:{
    type:[{type:mongoose.Schema.Types.ObjectId,ref :'Song'}]
  }
});
var Album = module.exports =  mongoose.model('Album',albumsSchema);
//Get Albums
module.exports.getAlbums = function(callback,limit){
  Album.find(callback).limit(limit);
}
module.exports.getAlbumsByArtist = function(artist,callback)
{
  var query = {artist : artist};
  Album.find(query,callback);
}
module.exports.getAlbumById = function(id,callback){
  Album.findById(id,callback);
}
module.exports.getAlbumByName = function(name,callback)
{
  var query = {name : name};
  Album.findOne(query,callback);
}
module.exports.getAlbumSongsById = function(id,callback,limit){
  Album.findById(id)
      .populate({
      path : 'songs',
      populate :{path:'songs'}
    }).exec(callback);

}
module.exports.getAlbumInfoByName = function(artistName,albumName,callback){
  var query = {artist:artistName,name:albumName}
  Album.findOne(query)
  .populate({path : 'songs',populate :{path:'songs'}}).exec(callback);

}
module.exports.addAlbum = function(album,callback){
  Album.create(album,callback);
}
module.exports.getAllAlbumsSongs = function(callback,limit){
  Album.find()
      .populate({
      path : 'songs'
      ,populate :{path:'songs'}
    }).exec(callback);
}
module.exports.getAllAlbumsSongsByName = function(artistName,albumName,callback,limit){
  var query = {name:albumName,artist:artistName}
  console.log(query);
  Album.findOne(query)
      .populate({
      path : 'songs'
      ,populate :{path:'songs'}
    }).exec(callback);
}
module.exports.updateAlbumByArtist = function(artistName,newArtistName,callback){
  Album.update({artist:artistName},{"$set":{artist:newArtistName}},{multi:true},callback);
}
module.exports.updateAlbum = function(id,album,callback){
  var query = {_id :id };
  var options= {};
  var update = {'$set' :album};
  Album.findOneAndUpdate(query,update,options,callback);
}
