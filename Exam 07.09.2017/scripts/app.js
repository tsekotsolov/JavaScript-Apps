const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_ryeHdCOnM'
const APP_SECRET = 'acdd651fabe746f9bbf3bd704c3804eb'
const AUTH_HEADERS = {
  'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}


function registerUser(event) {
  event.preventDefault();

  let username = $('#formRegister').find('input[name="username"]').val();
  let password = $('#formRegister').find('input[name="password"]').val();
  let confirmPassword = $('#formRegister').find('input[name="repeatPass"]').val();
  let subscriptions = [''];

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
      subscriptions
    }
  }).then(function (response) {

    signInUser(response);
    infoBoxLoader('Registration Success');
    $('#formRegister').trigger('reset');
    loadHomeScreen();

  }).catch(function (response) {
    handleAjaxError(response);
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
  }).then(function (response) {

    signInUser(response);
    infoBoxLoader('Login Success');
    $('#formLogin').trigger('reset');
    loadHomeScreen();

  }).catch(function (response) {
    $('#formLogin').trigger('reset');

    handleAjaxError(response);

  })
}

function signInUser(response) {

  sessionStorage.setItem('username', response.username);
  sessionStorage.setItem('authToken', response._kmd.authtoken);
  sessionStorage.setItem('userId', response._id);
  sessionStorage.setItem('subscriptions', JSON.stringify(response.subscriptions));

}

function logoutUser() {
  $.ajax({
    method: 'POST',
    url: BASE_URL + 'user/' + APP_KEY + '/_logout',
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },

  }).then(function () {
    sessionStorage.clear();
    infoBoxLoader('Logout Success')
    loadRegisterPage()
  }).catch(function (response) {
    handleAjaxError(response);
  });


}

function loadHomeScreen() {

  // get the current user data from users database
  $.ajax({
    method: 'GET',
    url: BASE_URL + 'user/' + APP_KEY + '/' + sessionStorage.getItem('userId'),
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },

  }).then(async function (response) {

    let user = sessionStorage.getItem('username');
    let subscriptionsArray = response.subscriptions;
    let following = response.subscriptions.length;
    let followers = 0;
    let chirps = 0;
    let allSubscriptionsChirps = [];
    let parsedArr = JSON.stringify(subscriptionsArray);


    // count current user followers 
    await $.ajax({
      method: 'GET',
      url: BASE_URL + 'user/' + APP_KEY + '/' + `?query={"subscriptions":"${user}"}`,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },

    }).then(function (resp) {
      followers = resp.length;


    }).catch(function (resp) {
      handleAjaxError(resp);
    })

    //count current user chirps 

    await $.ajax({
      method: 'GET',
      url: BASE_URL + 'appdata/' + APP_KEY + '/' + `chirps?query={"author":"${user}"}`,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },

    }).then(function (chirpsResponse) {

      chirps = chirpsResponse.length;

    }).catch(function (chirpsResponse) {
      handleAjaxError(chirpsResponse);
    })

    //List all Chirps from subscriptions 

    await $.ajax({
      method: 'GET',
      url: BASE_URL + 'appdata/' + APP_KEY + '/' + `chirps?query={"author":{"$in": ${parsedArr}}}&sort={"_kmd.ect": 1}`,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },

    }).then(function (allSubscriptionsResponse) {

      for (let i = 0; i < allSubscriptionsResponse.length; i++) {

        let date = calcTime(allSubscriptionsResponse[i]._kmd.ect)
        allSubscriptionsResponse[i].date = date;
      }

      allSubscriptionsChirps = allSubscriptionsResponse

    }).catch(function (allSubscriptionsResponse) {
      handleAjaxError(allSubscriptionsResponse);
    })

    let hasSubscriptions = true;

    if (allSubscriptionsChirps.length !== 0) {
      hasSubscriptions = false;
    }

    containerFiller({
      user,
      following,
      followers,
      chirps,
      hasSubscriptions,
      data: allSubscriptionsChirps
    }, './templates/homeScreen.hbs', '#main');



  }).catch(function (response) {
    handleAjaxError(response);
  })

}

function postChirp(event) {
  event.preventDefault();

  let text = escapeHtml($('textarea').val());

  $.ajax({
      method: 'POST',
      url: BASE_URL + 'appdata/' + APP_KEY + '/chirps',
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },
      data: {
        text,
        'author': sessionStorage.getItem('username')
      }
    }).then(function (response) {

      infoBoxLoader('Chirp published.');
      $('textarea').val('');
      loadUserFeed();

    })
    .catch(function (response) {
      handleAjaxError(response)
    });


}

function loadUserFeed() {

   $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/' + `chirps?query={"author":"${sessionStorage.getItem('username')}"}`,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },

  }).then(function (chirpsResponse) {
    
    let user = sessionStorage.getItem('username');
    let following = 0;
    let followers = 0;
    let chirps = chirpsResponse.length;


    for (let i = 0; i < chirpsResponse.length; i++) {

      let date = calcTime(chirpsResponse[i]._kmd.ect)
      chirpsResponse[i].date = date;
    }
    
    
    let hasChirps = true;

    if (chirps !== 0) {
      hasChirps = false;
    }
    containerFiller({ 
      user,
      following,
      followers,
      chirps,
      hasChirps,
      chirpsResponse
      
    }, './templates/myFeed.hbs', '#main');

    console.log(chirpsResponse);

  }).catch(function (chirpsResponse) {
    handleAjaxError(chirpsResponse);
  })
}