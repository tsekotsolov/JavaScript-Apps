async function containerFiller(context, url, container) {
  let source = await $.get(url);
  let template = Handlebars.compile(source);
  let instanceOfTemplate = template(context);
  $(container).html(instanceOfTemplate);
};

function loadHeader() {
  let context = {
    userIsLogged: sessionStorage.getItem('authToken') === null,
    user: sessionStorage.getItem('username')
  }
  containerFiller(context, './templates/header.hbs', '#menu');
}

function loadWelcomePage() {
  loadHeader();
  let context = {
    userIsLogged: sessionStorage.getItem('authToken') !== null,
  }
  containerFiller(context, './templates/welcome-page.hbs', 'main');
}

function loadRegisterPage() {

  let context = {
    userIsLogged: sessionStorage.getItem('authToken') !== null,
  }
  containerFiller(context, './templates/register-page.hbs', 'main');

};

function loadLoginPage() {

  let context = {
    userIsLogged: sessionStorage.getItem('authToken') !== null,
  }
  containerFiller(context, './templates/login-page.hbs', 'main');
};

function loadHomePage() {

  loadHeader();
  let context = {

    user: sessionStorage.getItem('username')
  }
  containerFiller(context, './templates/homePage.hbs', 'main');
}

function infoBoxLoader(message) {
  let infobox = $('#infoBox')
  $('#infoBox').text(message);
  infobox.css('display', 'block');
  setTimeout(function () {
    infobox.css('display', 'none')
  }, 3000)
}

