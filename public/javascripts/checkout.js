
var $form = $("#checkoutform");
$form.on('submit',function(e){
  $('#charge-error').addClass('hidden');

  $form.find('.submit').prop('disabled', true);
  Stripe.card.createToken({
    number : $("#card").val(),
    cvc : $("#cvc").val(),
    exp_month : $("#exp_month").val(),
    exp_year : $("#exp_year").val()
  },stripeResponseHandler);
  return false;

});
function stripeResponseHandler(status, response) {
  // Grab the form:
  if (response.error) { // Problem!

    // Show the errors on the form:
    $('#charge-error').text(response.error.message);
    $('#charge-error').removeClass('hidden');

    $form.find('.submit').prop('disabled', false); // Re-enable submission

  } else { // Token was created!

    // Get the token ID:
    var token = response.id;

    // Insert the token ID into the form so it gets submitted to the server:
    $form.append($('<input type="hidden" name="stripeToken">').val(token));

    // Submit the form:
    $form.get(0).submit();
  }
};
