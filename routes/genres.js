var mongoose = require('mongoose');

// Genres Schema
var genreSchema = mongoose.Schema({
  name:{
    type:String,
    required : true
  },
  create_date:{
    type:Date,
    default:Date.now
  }
});

var Genre = module.exports = mongoose.model('Genre',genreSchema);

 // Get Genres
 module.exports.getGenres = function(callback,limit){
    Genre.find(callback).limit(limit);
 }
 module.exports.addGenres = function(genre,callback){
    Genre.create(genre,callback);
 }
 module.exports.updateGenres = function(id,genre,options,callback){
   var query = {_id:id};
   var update = {
     name:genre.name
   }
    Genre.findOneAndUpdate(query,update,options,callback);
 }
