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
  containerFiller(context, './templates/register-page.hbs', '#container');
};

function loadLoginPage() {

  let context = {
    userIsLogged: sessionStorage.getItem('authToken') !== null,
  }
  containerFiller(context, './templates/login-page.hbs', '#container');
};

function addFlightView() {

  let context = {
    userIsLogged: sessionStorage.getItem('authToken') !== null,
    username: sessionStorage.getItem('username'),
  }
  containerFiller(context, './templates/add-flight.hbs', '#container');
}


