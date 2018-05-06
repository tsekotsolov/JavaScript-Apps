const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_H1kNfOKTz'
const APP_SECRET = 'dcc21b167ad9454386849830ca0471bc'
const AUTH_HEADERS = {
  'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}

function registerUser(event) {
  event.preventDefault();

  let username = $('#registerUsername').val();
  let password = $('#registerPasswd').val();
  let name = $('#registerName').val();

  $.ajax({
    method: 'POST',
    url: BASE_URL + 'user/' + APP_KEY + '/',
    headers: AUTH_HEADERS,
    data: {
      username,
      password,
      name
    }
  }).then(function (response) {

    signInUser(response);
    helper.infoBoxLoader('User registration successful');
    $('#formRegister').trigger('reset');
    loadHomePage();

  }).catch(function (response) {
    helper.handleAjaxError(response);
    $('#formRegister').trigger('reset');
  })

}

function loginUser(event) {
  event.preventDefault();
  let username = $('#loginUsername').val();
  let password = $('#loginPasswd').val();


  if (username === '' || password === '') {
    helper.errorBoxLoader('Username or password can not be empty');
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
  }).then(function (response) {

    signInUser(response);
    helper.infoBoxLoader('Login successful');
    $('#formLogin').trigger('reset');
    loadHomePage();


  }).catch(function (response) {
    $('#formLogin').trigger('reset');

    helper.handleAjaxError(response);

  })
}

function signInUser(response) {

  sessionStorage.setItem('username', response.username);
  sessionStorage.setItem('name', response.name);
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
    loadWelcomePage();
    helper.infoBoxLoader('Logout Success')


  }).catch(function (response) {
    helper.handleAjaxError(response);
  });

}

function sendMessage() {

  $.ajax({
    method: 'GET',
    url: BASE_URL + 'user/' + APP_KEY + '/',
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }

  }).then(function (response) {

    let context = {
      data: response.filter(e => e.username !==sessionStorage.getItem('username'))
    }

    containerFiller(context, './templates/sendMessage.hbs', 'main');

  }).catch(function (resp) {
    helper.handleAjaxError(resp);
  })

}

function sendMessageToDataBase(event) {

  event.preventDefault();

  let recipient_username = $('#formSendMessage').find(":selected").attr('value');
  let text = helper.escapeHtml($('#formSendMessage').find('input[name="text"]').val());

  let sender_username = sessionStorage.getItem('username');
  let sender_name = sessionStorage.getItem('name');

  if (text === '') {
    helper.errorBoxLoader('Message can not be empty');
    return;
  }

  $.ajax({
      method: 'POST',
      url: BASE_URL + 'appdata/' + APP_KEY + '/messages',
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },
      data: {
        recipient_username,
        text,
        sender_name,
        sender_username

      }
    }).then(function (response) {

      helper.infoBoxLoader('Message sent');
      $('#formSendMessage').trigger('reset');
      archive();

    })
    .catch(function (response) {
      helper.handleAjaxError(response)
    });

}

function archive() {

  $.ajax({
      method: 'GET',
      url: BASE_URL + 'appdata/' + APP_KEY + `/messages?query={"sender_username":"${sessionStorage.getItem('username')}"}`,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      }

    }).then(function (response) {

      for (let i = 0; i < response.length; i++) {

        response[i].date = helper.formatDate(response[i]._kmd.lmt);

      }

      let context = {
        data: response
      }

      containerFiller(context, './templates/archive.hbs', 'main');

    })
    .catch(function (response) {
      helper.handleAjaxError(response)
    });
}

function deleteMessage(event) {

  let id = $(event.target).attr('data-id');

  $.ajax({
    method: 'DELETE',
    url: BASE_URL + 'appdata/' + APP_KEY + '/messages/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(function (response) {
    helper.infoBoxLoader('Message deleted');
    archive();


  }).catch(function (response) {
    helper.handleAjaxError(response);
  })

}

function myMessages() {

  $.ajax({
      method: 'GET',
      url: BASE_URL + 'appdata/' + APP_KEY + `/messages?query={"recipient_username":"${sessionStorage.getItem('username')}"}`,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      }

    }).then(function (response) {

      for (let i = 0; i < response.length; i++) {

        response[i].date = helper.formatDate(response[i]._kmd.lmt);
        response[i].name = helper.formatSender(response[i].sender_name, response[i].sender_username)

      }

      let context = {
        data: response
      }

      containerFiller(context, './templates/mymessages.hbs', 'main');

    })
    .catch(function (response) {
      helper.handleAjaxError(response)
    });
}
