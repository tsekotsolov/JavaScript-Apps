function infoBoxLoader(message) {
  let infobox = $('#infoBox')
  $('#infoBox span').text(message);
  infobox.css('display', 'block');
  setTimeout(function () {
    infobox.css('display', 'none')
  }, 3000)
}

function errorBoxLoader(message) {
  let errorbox = $('#errorBox')
  $('#errorBox span').text(message);
  errorbox.css('display', 'block')
  errorbox.click(function () {
    errorbox.css('display', 'none')
  })
}

function handleAjaxError(response) {

  let errorMsg = JSON.stringify(response)
  if (response.readyState === 0)
    errorMsg = "Cannot connect due to network error."
  if (response.responseJSON && response.responseJSON.description)
    errorMsg = response.responseJSON.description

  errorBoxLoader(errorMsg);

}

$(document).on({
  ajaxStart: async function () {
    $("#loadingBox").show()

  },
  ajaxStop: function () {
    $("#loadingBox").hide()
  }
})



function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}