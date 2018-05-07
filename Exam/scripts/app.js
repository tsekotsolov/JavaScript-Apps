const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = ''
const APP_SECRET = ''
const AUTH_HEADERS = {
  'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}

// contentType: 'application/json';


function registerUser(event) {
  event.preventDefault();

  let username = $('#formRegister').find('input[name="username"]').val();
  let password = $('#formRegister').find('input[name="password"]').val();
  let confirmPassword = $('#formRegister').find('input[name="repeatPass"]').val();


  const usernameRegex = /^.{5,}$/g;

  if (username === '' || password === '' || confirmPassword === '') {
    errorBoxLoader('Username or password can not be empty');
    return;
  }
  if (!usernameRegex.test(username)) {
    errorBoxLoader('User name must be at least 5 characters long');
    $('#formRegister').trigger('reset');
    return;
  }

  if (password !== confirmPassword) {
    errorBoxLoader('Confirm password and password do not match');
    $('#formRegister').trigger('reset');
    return;
  }

  $.ajax({
    method: 'POST',
    url: BASE_URL + 'user/' + APP_KEY + '/',
    headers: AUTH_HEADERS,
    data: {
      username,
      password,
      name
    }
  }).then(async function (response) {

    signInUser(response);
    $('#formRegister').trigger('reset');
    await loadHomePage();
    helper.infoBoxLoader('User registration successful');

  }).catch(function (response) {
    helper.handleAjaxError(response);
    $('#formRegister').trigger('reset');
  })

}

function loginUser(event) {
  event.preventDefault();
  let username = $('#formLogin').find('input[name="username"]').val();
  let password = $('#formLogin').find('input[name="password"]').val();


  if (username === '' || password === '') {
    errorBoxLoader('Username or password can not be empty');
    return;
  }
  $.ajax({
    method: 'POST',
    url: BASE_URL + 'user/' + APP_KEY + '/login',
    headers: AUTH_HEADERS,
    data: {
      username,
      password
    }
  }).then(async function (response) {

    signInUser(response);
    $('#formLogin').trigger('reset');
    await loadHomePage();
    helper.infoBoxLoader('Login successful');

  }).catch(function (response) {
    $('#formLogin').trigger('reset');

    helper.handleAjaxError(response);

  })
}

function signInUser(response) {

  sessionStorage.setItem('username', response.username);
  sessionStorage.setItem('authToken', response._kmd.authtoken);
  sessionStorage.setItem('userId', response._id);

}

function logoutUser() {
  $.ajax({
    method: 'POST',
    url: BASE_URL + 'user/' + APP_KEY + '/_logout',
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },

  }).then(async function () {
    await sessionStorage.clear();
    await loadWelcomePage();
    helper.infoBoxLoader('Logout Success')


  }).catch(function (response) {
    helper.handleAjaxError(response);
  });

}