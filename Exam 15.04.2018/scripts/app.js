const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_HJXcx0l2f'
const APP_SECRET = '5a8b0564395a4e8a8cbe6db3da27f3a8'
const AUTH_HEADERS = {
    'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}

function registerUser(event) {
    event.preventDefault();

    let username = $('#username-register').val();
    let password = $('#password-register').val();
    let confirmPassword = $('#password-register-check').val();
    const usernameRegex = /^.{5,}$/g;

    if (username === '' || password === '' || confirmPassword === '') {
        errorBoxLoader('Username or password can not be empty');
        return;
    }
    if (!usernameRegex.test(username)) {
        errorBoxLoader('User name must be at least 5 characters long');
        return;
    }

    if (password !== confirmPassword) {
        errorBoxLoader('Confirm password and password do not match');
        return;
    }

    $.ajax({
        method: 'POST',
        url: BASE_URL + 'user/' + APP_KEY + '/',
        headers: AUTH_HEADERS,
        data: {
            username,
            password
        }
    }).then(function (response) {

        signInUser(response);
        infoBoxLoader('Registration Success');
        $('#register-form').trigger('reset');
        createActiveReceipt();


    }).catch(function (response) {
        handleAjaxError(response);
    })

}

function loginUser(event) {
    event.preventDefault();
    let username = $('#username-login').val();
    let password = $('#password-login').val();

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
        $('#login-form').trigger('reset');
        loadActiveReceipt();

    }).catch(function (response) {
        handleAjaxError(response);
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

    }).then(function () {
        sessionStorage.clear();
        infoBoxLoader('Logout Success')
        loadWelcomePage();
    }).catch(function (response) {
        handleAjaxError(response);
    });

}

async function loadActiveReceipt() {

    let userId = sessionStorage.getItem('userId')

    $.ajax({
        method: 'GET',
        url: BASE_URL + 'appdata/' + APP_KEY + `/receipts?query={"_acl.creator":"${userId}","active":"true"}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        }
    }).then(async function (response) {

       
        if (response.length === 0) {
            createActiveReceipt();
            infoBoxLoader("Active receipt loaded!");
        } else {
            $.ajax({
                method: 'GET',
                url: BASE_URL + 'appdata/' + APP_KEY + `/entries?query={"receiptId":"${response[0]._id}"}`,
                headers: {
                    'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
                }

            }).then(async function (resp) {

                resp.userIsLogged = sessionStorage.getItem('authToken') !== null;
                resp.user = sessionStorage.getItem('username');
                resp._id = response[0]._id;
                resp.data = resp
                resp.total = 0;

                for (let i = 0; i < resp.length; i++) {

                    resp.total += Number(resp[i].subtotal);

                }

                resp.total = (resp.total).toFixed(2)


                let headerpartial = await $.get('./templates/headerpartial.hbs');
                Handlebars.registerPartial('headerpartial', headerpartial);
                containerFiller(resp, './templates/create-receipt.hbs', '#container');
                infoBoxLoader("Active receipt loaded!");


            }).catch(function (resp) {
                handleAjaxError(resp);
            })
        }



    }).catch(function (response) {
        handleAjaxError(response);
    })

}

function deleteEntry(event) {
    let id = ($(event.target).attr('data-id'));


    $.ajax({
        method: 'DELETE',
        url: BASE_URL + 'appdata/' + APP_KEY + '/entries/' + id,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        }
    }).then(function (response) {
        infoBoxLoader('Entry deleted');
        loadActiveReceipt();


    }).catch(function (response) {
        handleAjaxError(response);
    })
}

async function addProduct(event) {

    event.preventDefault();
    let type = $('#create-entry-form').find('input[name="type"]').val();
    let qty = $('#create-entry-form').find('input[name="qty"]').val();
    let price = Number($('#create-entry-form').find('input[name="price"]').val()).toFixed(2);
    let subtotal = (Number(qty) * Number(price)).toFixed(2);

    let receiptId = $('#addItemBtn').attr('data-id');

    if (type === '') {
        errorBoxLoader('Product field can not be empty');
        return;
    }
    const regex = /^\d*[.]*\d+$/g;
    if (!regex.test(price)) {
        errorBoxLoader('Invalid price');
        return;
    }

    if (isNaN(qty)) {
        errorBoxLoader('Invalid qty');
        return;
    };

    $.ajax({
            method: 'POST',
            url: BASE_URL + 'appdata/' + APP_KEY + '/entries',
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
            },
            data: {
                type,
                qty,
                price,
                receiptId,
                subtotal,
                'author': sessionStorage.getItem('username')
            }
        }).then(function (response) {

            infoBoxLoader('Product Added');
            $('#create-entry-form').trigger('reset');
            loadActiveReceipt();


        })
        .catch(function (response) {
            handleAjaxError(response)
        });
}

function checkOut(event) {
    event.preventDefault();

    let id = $(event.target).attr('data-id');


    $.ajax({
        method: 'GET',
        url: BASE_URL + 'appdata/' + APP_KEY + `/entries?query={"receiptId":"${id}"}`,
        headers: {
            'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        }

    }).then(function (response) {

        if (response.length === 0) {
            errorBoxLoader('Receipt can not be empty');
            return;
        }

        let productCount = response.length;
        let total = 0;

        for (let i = 0; i < response.length; i++) {
            total += response[i].price * response[i].qty
        }
        let receiptId = response[0].receiptId;

        $.ajax({
                method: 'PUT',
                url: BASE_URL + 'appdata/' + APP_KEY + '/receipts/' + receiptId,
                headers: {
                    'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
                },
                data: {
                    'active': false,
                    'author': sessionStorage.getItem('username'),
                    'productCount': productCount,
                    'total': total
                }
            }).then(function (response) {

                infoBoxLoader('Receipt checked out');
                createActiveReceipt();

            })
            .catch(function (response) {
                handleAjaxError(response)
            });


    }).catch(function (response) {
        handleAjaxError(response)
    });

}

function createActiveReceipt() {
    $.ajax({
            method: 'POST',
            url: BASE_URL + 'appdata/' + APP_KEY + '/receipts',
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
            },
            data: {
                'active': true,
                'author': sessionStorage.getItem('username'),
                'productCount': 0,
                'total': 0
            }
        }).then(async function (resp) {

            infoBoxLoader("Active receipt created!");
            let data = {
                userIsLogged: sessionStorage.getItem('authToken') !== null,
                user: sessionStorage.getItem('username'),
                _id: resp._id,
            }
            let headerpartial = await $.get('./templates/headerpartial.hbs');
            Handlebars.registerPartial('headerpartial', headerpartial);
            containerFiller(data, './templates/create-receipt.hbs', '#container')

        })
        .catch(function (resp) {
            handleAjaxError(resp)
        })
}

function loadUserReceipts(event) {

    $.ajax({
            method: 'GET',
            url: BASE_URL + 'appdata/' + APP_KEY + `/receipts?query={"author":"${sessionStorage.getItem('username')}","active":"false"}`,
            headers: {
                'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
            }
        }).then(function (response) {

            for (let i = 0; i < response.length; i++) {
                response[i].date = (response[i]._kmd.lmt).split('T')[0];
                response[i].time = ((response[i]._kmd.lmt).split('T')[1]).substring(0, 5);
            }

            let content = {
                data: response,
                user: response[0].author
            }

            containerFiller(content, './templates/all-receipt-view.hbs', '#container')
        })
        .catch(function (resp) {
            handleAjaxError(resp)
        })

}

function calcSubTotal(){

    let qty = $('#create-entry-form').find('input[name="qty"]').val();
    let price = Number($('#create-entry-form').find('input[name="price"]').val()).toFixed(2);
    let subtotal = (Number(qty) * Number(price)).toFixed(2);
   
    $('#create-entry-form div:nth-child(4)').html(subtotal);

    let subtotals = ($('.row div:nth-child(4)')).toArray();

    let sum = 0
    for (const number of subtotals) {
        sum += Number($(number).text());
    }

    $('#create-receipt-form div:nth-child(4)').text(sum.toFixed(2));

}