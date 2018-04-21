const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_SyCR9-82f'
const APP_SECRET = '0e18dababc524db4912997e3beb8ef7f'
const AUTH_HEADERS = {
  'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}

function registerUser(event) {

  event.preventDefault();

  let username = escapeHtml($('#registerUsername').val());
  let password = escapeHtml($('#registerPasswd').val());
  let name = escapeHtml($('#registerName').val());
  let cart = {}

  $.ajax({
    method: 'POST',
    url: BASE_URL + 'user/' + APP_KEY + '/',
    headers: AUTH_HEADERS,
    data: {
      username,
      password,
      name,
      cart
    }
  }).then(function (response) {

    signInUser(response);
    infoBoxLoader('User registration successful');
    loadHeader();
    loadHomePage();
    $('#formRegister').trigger('reset');

  }).catch(function (response) {
    handleAjaxError(response);
    $('#formRegister').trigger('reset');
  })

}

function loginUser(event) {
  event.preventDefault();
  let username = escapeHtml($('#loginUsername').val());
  let password = escapeHtml($('#loginPasswd').val());

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
    $('#formLogin').trigger('reset');
    loadHeader();
    loadHomePage();
    infoBoxLoader('Login Success');

  }).catch(function (response) {
    handleAjaxError(response);
    $('#formLogin').trigger('reset');
  })

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
    loadHeader();
    loadWelcomePage();
  }).catch(function (response) {
    handleAjaxError(response);
  });


}

function signInUser(response) {

  sessionStorage.setItem('username', response.username);
  sessionStorage.setItem('authToken', response._kmd.authtoken);
  sessionStorage.setItem('userId', response._id);
  sessionStorage.setItem('name', response.name);

}

function loadAllProducts() {

  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/products',
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(async function (response) {


    for (let i = 0; i < response.length; i++) {
      response[i].price = (Number(response[i].price)).toFixed(2);
    }

    let context = {
      data: response
    }

    containerFiller(context, './templates/shopProducts.hbs', 'main');

  }).catch(function (response) {
    handleAjaxError(response);
  })


}

function purchaseItem(event) {

  let id = $(event.target).attr('data-id')

  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/products/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(async function (response) {

    let product = {

      'quantity': 1,
      'product': {
        'name': response.name,
        'description': response.description,
        'price': response.price,
      }
    }


    //get what is in the current user cart 

    $.ajax({
        method: 'GET',
        url: BASE_URL + 'user/' + APP_KEY + '/' + sessionStorage.getItem('userId'),
        headers: {
          'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },

      }).then(function (currentCartResp) {

        if (currentCartResp.cart === undefined) {
          currentCartResp.cart = {}
          currentCartResp.cart[id] = product;
          
        } else {

          if (currentCartResp.cart.hasOwnProperty(id)) {

            currentCartResp.cart[id].quantity++
          } else {

            currentCartResp.cart[id] = product;
          }
        }

        // put into the updated cart

        $.ajax({
            method: 'PUT',
            url: BASE_URL + 'user/' + APP_KEY + '/' + sessionStorage.getItem('userId'),
            headers: {
              'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
            },
            data: {
              'cart': currentCartResp.cart,
              'name': sessionStorage.getItem('name')

            }
          }).then(function (resp) {

            infoBoxLoader('Product purchased')

          })
          .catch(function (response) {
            handleAjaxError(response);
          })

      })
      .catch(function (response) {
        handleAjaxError(response);
      })


  }).catch(function (response) {
    handleAjaxError(response);
  })
}

function loadMyCart() {
  $.ajax({
    method: 'GET',
    url: BASE_URL + 'user/' + APP_KEY + '/' + sessionStorage.getItem('userId'),
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },

  }).then(function (response) {

    if (response.cart === undefined) {
      containerFiller({}, './templates/mycart.hbs', 'main');
     
    }

    else{
      
    let myCart = response.cart;
    let cartArray = Object.values(myCart);
    let ids = Object.keys(myCart);
    let cartData = [];

    for (let i = 0; i < cartArray.length; i++) {
      let productData = {
        product: cartArray[i].product.name,
        description: cartArray[i].product.description,
        quantity: cartArray[i].quantity,
        totalPrice: (cartArray[i].product.price * cartArray[i].quantity).toFixed(2),
        id: ids[i]
      }

      cartData.push(productData)
    }

    let context = {
      data: cartData
    }
    containerFiller(context, './templates/mycart.hbs', 'main');
    }
    
  }).catch(function (response) {
    handleAjaxError(response);
  })

}

function discardItem(event) {

  let id = $(event.target).attr("data-id");

  $.ajax({
    method: 'GET',
    url: BASE_URL + 'user/' + APP_KEY + '/' + sessionStorage.getItem('userId'),
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },

  }).then(function (response) {


    delete response.cart[id];

    $.ajax({
        method: 'PUT',
        url: BASE_URL + 'user/' + APP_KEY + '/' + sessionStorage.getItem('userId'),
        headers: {
          'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: {
          'cart': response.cart,
          'name': sessionStorage.getItem('name')
        }
      }).then(function (resp) {

        infoBoxLoader('Product discarded');
        loadMyCart();

      })
      .catch(function (response) {
        handleAjaxError(response);
      })

  }).catch(function (response) {
    handleAjaxError(response);

  })

}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}