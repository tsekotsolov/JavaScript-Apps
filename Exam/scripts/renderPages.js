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



