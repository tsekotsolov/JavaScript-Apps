async function containerFiller(context, url, container) {
  let source = await $.get(url);
  let template = Handlebars.compile(source);
  let instanceOfTemplate = template(context);
  $(container).html(instanceOfTemplate);
};

function loadRegisterPage() {

  let context = {
    userIsLogged: sessionStorage.getItem('authToken') !== null,
  }
  containerFiller(context, './templates/register-page.hbs', '#main');
};

function loadLoginPage() {

  let context = {
    userIsLogged: sessionStorage.getItem('authToken') !== null,
  }
  containerFiller(context, './templates/login-page.hbs', '#main');
};


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
    //$("#loadingBox").show()
    $('.spinner').show()

  },
  ajaxStop: function () {
    //$("#loadingBox").hide()
    $('.spinner').hide()
  }
})

function calcTime(dateIsoFormat) {
  let diff = new Date - (new Date(dateIsoFormat));
  diff = Math.floor(diff / 60000);
  if (diff < 1) return 'less than a minute';
  if (diff < 60) return diff + ' minute' + pluralize(diff);
  diff = Math.floor(diff / 60);
  if (diff < 24) return diff + ' hour' + pluralize(diff);
  diff = Math.floor(diff / 24);
  if (diff < 30) return diff + ' day' + pluralize(diff);
  diff = Math.floor(diff / 30);
  if (diff < 12) return diff + ' month' + pluralize(diff);
  diff = Math.floor(diff / 12);
  return diff + ' year' + pluralize(diff);
  function pluralize(value) {
      if (value !== 1) return 's';
      else return '';
  }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
