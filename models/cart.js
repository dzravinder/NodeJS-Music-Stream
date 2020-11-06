module.exports = function Cart(oldCard){
  this.items = oldCard.items || {};
  this.totalQty = oldCard.totalQty || 0 ;
  this.totalPrice = oldCard.totalPrice || 0;
  this.add = function(item,id){
    var storedItem = this.items[id];
    if(!storedItem)
    {
      storedItem = this.items[id] = {item:item,qty:0,price:0};
      storedItem.qty++;
      storedItem.price = storedItem.item.price * storedItem.qty;
      this.totalQty++;
      this.totalPrice += storedItem.item.price;
    }
  }
  this.remove = function(item,id)
  {
    delete this.items[id];
    this.totalQty--;
    this.totalPrice -= item.price;

  }
  this.generateArray = function(){
    var arr = [];
    for(var i in this.items)
    {
      arr.push(this.items[i]);

    }
    return arr;
  }
}
