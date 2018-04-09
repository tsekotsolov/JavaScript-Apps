async function loadHeader(){
  let context = {
    userIsLogged:sessionStorage.getItem('authToken') !== null,
    username:sessionStorage.getItem('username')
  }

  $('header').empty();

  let source = await $.get('./templates/header-template.hbs');
  let template = Handlebars.compile(source);
  let instanceOfTemplate = template(context);

  $('header').append(instanceOfTemplate);
  
}

async function sectionLoader(context, url) {
  let source = await $.get(url);

  let template = Handlebars.compile(source);
  let instanceOfTemplate = template(context);

  $('main').append(instanceOfTemplate);

};

async function loadHome() {
  $('main').empty();
  await sectionLoader('', './templates/welcome-template.hbs');
}

async function loadAllAds() {
  $('main').empty();
  listAds();
}

async function loadCreateAd(){
  $('main').empty();
  let context = {
    sectionType: 'viewCreateAd',
    formId: 'formCreateAd',
    headline: 'Create new Advertisement',
    buttonId: 'buttonCreateAd',
    buttonText: 'Create',
    functionToExec: 'createAd()'
  }
  await sectionLoader(context,'./templates/create-edit-template.hbs')
}

async function loadEditAd(){
  $('main').empty();
  let context = {
    sectionType: 'viewEditAd',
    formId: 'formEditAd',
    headline: 'Edit Advertisement',
    buttonId: 'buttonEditAd',
    buttonText: 'Edit',
    functionToExec: 'uploadEditdAd()'
  }
  await sectionLoader(context,'./templates/create-edit-template.hbs');
  
}

async function loadRegister() {

  $('main').empty();
  let context = {
    sectionType: 'viewRegister',
    headline: 'Please register here',
    formId: 'formRegister',
    buttonTypeUser: 'buttonRegisterUser',
    buttonText: 'Register',
    functionToExec: 'registerUser()'
  }

  await sectionLoader(context, './templates/register-login-template.hbs');

}

async function loadLogin() {
  $('main').empty();
  let context = {
    sectionType: 'viewLogin',
    headline: 'Login here',
    formId: 'formLogin',
    buttonTypeUser: 'buttonLoginUser',
    buttonText: 'Login',
    functionToExec: 'loginUser()'
  }

  await sectionLoader(context, './templates/register-login-template.hbs');
  
};

$(document).on({
  ajaxStart: async function () {
    $("#loadingBox").show()
    
  },
  ajaxStop: function () {
    $("#loadingBox").hide()
  }
})


