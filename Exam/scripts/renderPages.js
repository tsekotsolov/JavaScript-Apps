async function containerFiller(context, url, container) {
  let source = await $.get(url);
  let template = Handlebars.compile(source);
  let instanceOfTemplate = template(context);
  $(container).html(instanceOfTemplate);
};

function loadWelcomePage() {
  containerFiller('', './templates/welcome-page.hbs', '.content', );
};

function loadHeader() {
  let context = {
    userIsLogged: sessionStorage.getItem('authToken') !== null,
    username: sessionStorage.getItem('username')
  }
  containerFiller(context, './templates/header.hbs', 'header');
}

async function loadEditPost(){
  
  let menupartial = await $.get('./templates/menupartial.hbs');
  Handlebars.registerPartial('menupartial', menupartial);
  containerFiller({'formHeading':'Edit Link Post','functionToExec':'submitEditedPost'},'./templates/create-edit-post.hbs','.content')
}

async function loadCreatePost() {
  let menupartial = await $.get('./templates/menupartial.hbs');
  Handlebars.registerPartial('menupartial', menupartial);
  containerFiller({'formHeading':'Submit Link Post','functionToExec':'submitNewPost'},'./templates/create-edit-post.hbs','.content')
}



$(document).on({
  ajaxStart: async function () {
    $("#loadingBox").show()

  },
  ajaxStop: function () {
    $("#loadingBox").hide()
  }
})

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