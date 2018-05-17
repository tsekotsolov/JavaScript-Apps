const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_HkrwAaRaz'
const APP_SECRET = 'a3ab9eeecff741e081afd70ccac1af62'
const AUTH_HEADERS = {
  'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}


function registerUser(event) {
  event.preventDefault();

  let username = $('#formRegister').find('input[name="username"]').val();
  let password = $('#formRegister').find('input[name="pass"]').val();
  let confirmPassword = $('#formRegister').find('input[name="checkPass"]').val();

  const usernameRegex = /^.{5,}$/g;

  if (username === '' || password === '' || confirmPassword === '') {
    helper.errorBoxLoader('Username or password can not be empty');
    return;
  }
  if (!usernameRegex.test(username)) {
    helper.errorBoxLoader('User name must be at least 5 characters long');
    $('#formRegister').trigger('reset');
    return;
  }

  if (password !== confirmPassword) {
    helper.errorBoxLoader('Confirm password and password do not match');
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
  let password = $('#formLogin').find('input[name="pass"]').val();

  const usernameRegex = /^.{5,}$/g;

  if (!usernameRegex.test(username)) {
    helper.errorBoxLoader('User name must be at least 5 characters long');
    $('#formRegister').trigger('reset');
    return;
  }

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
    await loadLoginPage();
    helper.infoBoxLoader('Logout Success');


  }).catch(function (response) {
    helper.handleAjaxError(response);
  });

}

function loadHomePage() {

  $.ajax({
      method: 'GET',
      url: BASE_URL + 'appdata/' + APP_KEY + `/flights?query={"isPublished":"true"}`,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      }

    }).then(function (response) {

      let context = {
        userIsLogged: sessionStorage.getItem('authToken') !== null,
        data: response,
        username: sessionStorage.getItem('username')
      }
      containerFiller(context, './templates/homePage.hbs', '#container');
    })
    .catch(function (response) {
      helper.handleAjaxError(response)
    });

}

function addFlight(event) {
  event.preventDefault();

  let destination = $('#formAddFlight').find('input[name="destination"]').val();
  let origin = $('#formAddFlight').find('input[name="origin"]').val();
  let departure = $('#formAddFlight').find('input[name="departureDate"]').val();
  let time = $('#formAddFlight').find('input[name="departureTime"]').val();
  let seats = $('#formAddFlight').find('input[name="seats"]').val();
  let cost = $('#formAddFlight').find('input[name="cost"]').val();
  let image = $('#formAddFlight').find('input[name="img"]').val();
  let isPublished = $('#formAddFlight').find('input[name="public"]').is(":checked");

  if (destination === '' || origin === '') {
    helper.errorBoxLoader('Destination or Origin can not be empty');
    return;
  }

  if (isNaN(seats)) {
    helper.errorBoxLoader('Enter a valid number');
    return
  }

  if (isNaN(cost)) {
    helper.errorBoxLoader('Enter a valid number');
    return
  }

  if (seats <= 0) {
    helper.errorBoxLoader('Seat can not be negative or zero ');
    return;
  }

  if (cost <= 0) {
    helper.errorBoxLoader('Cost can not be negative or zero ');
    return;
  }

  $.ajax({
      method: 'POST',
      url: BASE_URL + 'appdata/' + APP_KEY + '/flights',
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },
      data: {
        destination,
        origin,
        departure,
        time,
        seats,
        cost,
        image,
        isPublished

      }
    }).then(async function (response) {

      
      $('#formAddFlight').trigger('reset');
      await loadHomePage()
      helper.infoBoxLoader('Created flight');

    })
    .catch(function (response) {
      helper.handleAjaxError(response)
    });

}

function flightDetails(event) {

  let id = ($(event.target).attr('data-id'));

  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/flights/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },
  }).then(function (response) {

    response.userIsLogged = sessionStorage.getItem('authToken') !== null,
      response.username = sessionStorage.getItem('username');
    response.flightIsMine = false;

    if (response._acl.creator === sessionStorage.getItem('userId')) {
      response.flightIsMine = true;
    }

    containerFiller(response, './templates/flight-detail.hbs', '#container');


  }).catch(function (response) {
    helper.handleAjaxError(response);
  });

}

function loadMyFlights() {

  let user = sessionStorage.getItem('userId')

  $.ajax({
      method: 'GET',
      url: BASE_URL + 'appdata/' + APP_KEY + `/flights?query={"_acl.creator":"${user}"}`,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      }

    }).then(function (response) {

      let context = {
        userIsLogged: sessionStorage.getItem('authToken') !== null,
        data: response,
        username: sessionStorage.getItem('username')
      }
      containerFiller(context, './templates/my-flights.hbs', '#container');
    })
    .catch(function (response) {
      helper.handleAjaxError(response)
    });

}

function deleteFlight(event) {
  let id = $(event.target).attr('data-id');

  $.ajax({
    method: 'DELETE',
    url: BASE_URL + 'appdata/' + APP_KEY + '/flights/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(async function (response) {

    await loadMyFlights();
    helper.infoBoxLoader('Flight deleted');

  }).catch(function (response) {
    helper.handleAjaxError(response);
  })

}

async function loadEditFlightView(event) {

  let id = $(event.target).attr('data-id');


  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/flights/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },
  }).then(async function (response) {

    let isChecked = false;

    if (response.isPublished === "true") {
      isChecked = true
    }

    let context = {
      userIsLogged: sessionStorage.getItem('authToken') !== null,
      username: sessionStorage.getItem('username'),
      isChecked,
      _id:response._id

    }
    await containerFiller(context, './templates/edit-flight.hbs', '#container');

    $('#formEditFlight').find('input[name="destination"]').val(`${response.destination}`);
    $('#formEditFlight').find('input[name="origin"]').val(`${response.origin}`);
    $('#formEditFlight').find('input[name="departureDate"]').val(`${response.departure}`);
    $('#formEditFlight').find('input[name="departureTime"]').val(`${response.time}`);
    $('#formEditFlight').find('input[name="seats"]').val(`${response.seats}`);
    $('#formEditFlight').find('input[name="cost"]').val(`${response.cost}`);
    $('#formEditFlight').find('input[name="img"]').val(`${response.image}`);


  }).catch(function (response) {
    helper.handleAjaxError(response);
  });


}

function sendEditedFlightToBase(event) {
  
  event.preventDefault();
  let id = $(event.target).attr('data-id');
  

  let destination = $('#formEditFlight').find('input[name="destination"]').val();
  let origin = $('#formEditFlight').find('input[name="origin"]').val();
  let departure = $('#formEditFlight').find('input[name="departureDate"]').val();
  let time = $('#formEditFlight').find('input[name="departureTime"]').val();
  let seats = $('#formEditFlight').find('input[name="seats"]').val();
  let cost = $('#formEditFlight').find('input[name="cost"]').val();
  let image = $('#formEditFlight').find('input[name="img"]').val();
  let isPublished = $('#formEditFlight').find('input[name="public"]').is(":checked");


  if (destination === '' || origin === '') {
    helper.errorBoxLoader('Destination or Origin can not be empty');
    return;
  }

  if (isNaN(seats)) {
    helper.errorBoxLoader('Enter a valid number');
    return
  }

  if (isNaN(cost)) {
    helper.errorBoxLoader('Enter a valid number');
    return
  }

  if (seats <= 0) {
    helper.errorBoxLoader('Seat can not be negative or zero ');
    return;
  }

  if (cost <= 0) {
    helper.errorBoxLoader('Cost can not be negative or zero ');
    return;
  }

  $.ajax({
    method: 'PUT',
    url: BASE_URL + 'appdata/' + APP_KEY + '/flights/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },
    data: {
      destination,
      origin,
      departure,
      time,
      seats,
      cost,
      image,
      isPublished

    }
  }).then(async function (response) {

    $('#formEditFlight').trigger('reset');
    await flightDetails(event);
    helper.infoBoxLoader('Edit successful');

  })
  .catch(function (response) {
    helper.handleAjaxError(response);
  })

}