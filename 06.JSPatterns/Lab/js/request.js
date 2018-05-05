let request = (() => {

  const BASE_URL = 'https://baas.kinvey.com/';
  const APP_KEY = 'kid_BkEG3CO6M';
  const APP_SECRET = '1d845444bfbe4c61a90ec333b36ff7e2';
  const AUTH_HEADERS_BASIC = {
    'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
  }
  const AUTH_HEADERS_KINVEY = {
    'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken'),
  }

  //request method (GET,POST,PUT)
  //kinvey module (useror appdata)
  //url endpoint
  //auth

  function get(modul, endpoint) {

    return $.ajax({
      method: 'GET',
      url: BASE_URL + modul + '/' + APP_KEY + '/' + endpoint,
      headers: AUTH_HEADERS_KINVEY
    })

  }

  function post(modul, endpoint, auth) {


    return $.ajax({
      method: 'POST',
      url: BASE_URL + modul + '/' + APP_KEY + '/' + endpoint,
      headers: auth === 'basic' ? AUTH_HEADERS_BASIC : AUTH_HEADERS_KINVEY,
      contentType = 'application/json'
    })

  }

  return {
    get,
    post
  }

})();

request.post()