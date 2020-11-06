var mongoose = require('mongoose');
var orderSchema = mongoose.Schema(
  {
    user:{type: mongoose.Schema.Types.ObjectId,ref:'User'},
    cart: {type:Object,required:true},
    name:{type:String,required:true},
    paymentId : {type:String,required:true}
  }
);
var Order = module.exports =  mongoose.model('Order',orderSchema);
module.exports.saveOrder = function(order,callback){
  Order.create(order,callback);
}
