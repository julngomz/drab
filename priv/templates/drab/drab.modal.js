const MODAL = "#_drab_modal"
const MODAL_FORM = "#_drab_modal form"
const MODAL_BUTTON_OK = "#_drab_modal_button_ok"
const MODAL_BUTTON_CANCEL = "#_drab_modal_button_cancel"
const MODAL_BUTTONS = ".drab-modal-button"

Drab.on_connect(function(resp, drab) {
  function modal_button_clicked(message, button_clicked) {
    var vals = {}
    $(`${MODAL} form :input`).map(function() {
      var key = $(this).attr("name") || $(this).attr("id")
      vals[key] = $(this).val()
    })
    var query_output = [
      message.sender,
      {
        button_clicked: button_clicked, 
        params: vals
      }
    ]      
    drab.channel.push("modal", {ok: query_output})        
    $(MODAL).modal('hide')
  }

  drab.channel.on("modal", function(message) {
    $modal = $(MODAL)
    $(MODAL_FORM).on("submit", function() {
      modal_button_clicked(message, "ok")
      return false // prevent submit
    })
    $(MODAL_BUTTONS).on("click", function() {
      $(this).data("clicked", true)
      modal_button_clicked(message, $(this).attr("name"))
    })
    $modal.on("hidden.bs.modal", function() {
      if (!$(MODAL_BUTTON_OK).data("clicked")) {
        // if it is not an OK button (prevent double send)
        modal_button_clicked(message, "cancel")
      }
    })
    // set the timeout on a modal
    // TODO: cancel this event after closing before the timeout
    if (message.timeout) {
      if (drab.modal_timeout_function) {
        clearTimeout(drab.modal_timeout_function)
      }
      drab.modal_timeout_function = setTimeout(function() {
        modal_button_clicked(message, "cancel")
      }, 1000 * message.timeout)
    }
    // set focus on form
    $modal.on("shown.bs.modal", function() {
      $(MODAL_FORM + " :input").first().focus()
    })

    $modal.modal()
  })
})