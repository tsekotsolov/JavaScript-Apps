const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_r1s2mLsiG'
const APP_SECRET = 'dcd6f0eb92df44bca3c55a7192a2de3b'
const AUTH_HEADERS = {
  'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)
}

function registerUser(event) {
  event.preventDefault();

  let username = $('#registerForm').find('input[name="username"]').val();
  let password = $('#registerForm ').find('input[name="password"]').val();
  let confirmPassword = $('#registerForm').find('input[name="repeatPass"]').val()

  const usernameRegex = /^[a-zA-Z]{3,}$/g;
  const passwordRegex = /^[a-zA-Z0-9]{6,}$/g;
  if (username === '' || password === '' || confirmPassword === '') {
    errorBoxLoader('Username or password can not be empty');
    return;
  }
  if (!usernameRegex.test(username)) {
    errorBoxLoader('User name must be at least 3 characters long and should contain only english alphabet letters');
    return;
  }
  if (!passwordRegex.test(password)) {
    errorBoxLoader('Password must be at least 6 characters long and should contain only english alphabet letters and digits');
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
    loadHeader();
    $('#formRegister').trigger('reset');
    listPosts();


  }).catch(function (response) {
    handleAjaxError(response);
  })

}

function loginUser(event) {
  event.preventDefault();
  let username = $('#loginForm').find('input[name="username"]').val();
  let password = $('#loginForm ').find('input[name="password"]').val();

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
    $('#loginForm').trigger('reset');
    loadHeader();
    listPosts();


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
    loadHeader();
    loadWelcomePage();
  }).catch(function (response) {
    handleAjaxError(response);
  });


}

function listPosts() {
  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/posts',
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(async function (response) {

    renderPosts(response);

  }).catch(function (response) {
    handleAjaxError(response);
  })

}

function myPosts() {
  let user = sessionStorage.username;

  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + `?query={"author":"${user}"}`,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(async function (response) {
    renderPosts(response);

  }).catch(function (response) {
    handleAjaxError(response);
  })
}

function submitNewPost(event) {
  event.preventDefault();
  let url = escapeHtml($('#submitForm').find('input[name="url"]').val());
  let title = escapeHtml($('#submitForm').find('input[name="title"]').val());
  let image = escapeHtml($('#submitForm').find('input[name="image"]').val());
  let comment = escapeHtml($('#submitForm').find('textarea[name="comment"]').val());

  if (url == '' || title == '') {
    errorBoxLoader('Insufficient data to send ajax query');
  } else if (!url.startsWith('http')) {

    errorBoxLoader('URL must start with http');

  } else {
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/posts',
        headers: {
          'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: {
          url: url,
          title: title,
          imageUrl: image,
          description: comment,
          'author': sessionStorage.getItem('username')
        }
      }).then(function (response) {

        infoBoxLoader('Post Added');
        $('#submitForm').trigger('reset')
        listPosts();

      })
      .catch(function (response) {
        handleAjaxError(response)
      })
  }

}

function deletePost(id) {

  $.ajax({
    method: 'DELETE',
    url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(function (response) {
    infoBoxLoader('Post deleted');
    listPosts();
  }).catch(function (response) {
    handleAjaxError(response);
  })
}

function editPost(id) {
  loadEditPost();
  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },
  }).then(function (response) {

    $('#submitForm').find('input[name="url"]').val(`${response.url}`);
    $('#submitForm').find('input[name="title"]').val(`${response.title}`);
    $('#submitForm').find('input[name="image"]').val(`${response.imageUrl}`);
    $('#submitForm').find('textarea[name="comment"]').val(`${response.description}`);
    $('#submitForm').attr('baseid', `${response._id}`);



  }).catch(function (response) {
    handleAjaxError(response);
  });
}

function submitEditedPost(event) {
  event.preventDefault();
  let url = escapeHtml($('#submitForm').find('input[name="url"]').val());
  let title = escapeHtml($('#submitForm').find('input[name="title"]').val());
  let image = escapeHtml($('#submitForm').find('input[name="image"]').val());
  let comment = escapeHtml($('#submitForm').find('textarea[name="comment"]').val());
  let id = $('#submitForm').attr('baseid');

  $.ajax({
      method: 'PUT',
      url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + id,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },
      data: {
        url: url,
        title: title,
        imageUrl: image,
        description: comment,
        'author': sessionStorage.getItem('username')
      }
    }).then(function (response) {

      $('#submitForm').trigger('reset');
      listPosts();
      infoBoxLoader('Edit successful');

    })
    .catch(function (response) {
      handleAjaxError(response);
    })


}

async function loadComments(id) {
  $.ajax({
    method: 'GET',
    url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    },
  }).then(async function (response) {

    infoBoxLoader("Post details loaded");

    response.time = calcTime(response._kmd.ect);
    response.isAuthorized = false;
    if (response._acl.creator === sessionStorage.getItem('userId')) {
      response.isAuthorized = true;
    }
    if (response.description === '') {
      response.description = 'No description';
    }

    let allComments = '';
    await $.ajax({
      method: 'GET',
      url: BASE_URL + 'appdata/' + APP_KEY + '/comments/' + `?query={"postId":"${response._id}"}`,
      headers: {
        'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
      },
    }).then(async function (resp_comments) {

      for (let i = 0; i < resp_comments.length; i++) {

        resp_comments[i].time = calcTime(resp_comments[i]._kmd.ect);
        resp_comments[i].isAuthorized = false;
        if (resp_comments[i]._acl.creator === sessionStorage.getItem('userId')) {
          resp_comments[i].isAuthorized = true;
        }
      }

      let context = {
        data: resp_comments,
      }

      let source = await $.get('./templates/comments.hbs');
      let template = Handlebars.compile(source);
      allComments = template(context);


    }).catch(function (resp_comments) {
      handleAjaxError(resp_comments);
    });

    let menupartial = await $.get('./templates/menupartial.hbs');
    Handlebars.registerPartial('menupartial', menupartial);

    await containerFiller(response, './templates/postDetails.hbs', '.content');

    if (allComments != '') {
      $('#viewComments').append(allComments);
    } else {
      $('#viewComments').append('<article class="post post-content">No comments yet.</article>');
    }


  }).catch(function (response) {
    handleAjaxError(response);
  });

}

function postComment(event) {
  event.preventDefault();

  let content = escapeHtml($('#commentForm').find('textarea[name="content"]').val());
  let postId = $('.post').attr('data-id');


  if (content == '') {
    errorBoxLoader('Message area can not be empty');
  } else {
    $.ajax({
        method: 'POST',
        url: BASE_URL + 'appdata/' + APP_KEY + '/comments',
        headers: {
          'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
        },
        data: {
          content,
          postId,
          'author': sessionStorage.getItem('username')
        }
      }).then(function (response) {

        infoBoxLoader('Comment Added');
        $('#commentForm').trigger('reset')
        loadComments(postId);

      })
      .catch(function (response) {
        handleAjaxError(response)
      })
  }

}

function deleteComment(event) {
  let id = $(event.target).attr('data-id');

  $.ajax({
    method: 'DELETE',
    url: BASE_URL + 'appdata/' + APP_KEY + '/comments/' + id,
    headers: {
      'Authorization': 'Kinvey ' + sessionStorage.getItem('authToken')
    }
  }).then(function (response) {
    infoBoxLoader('Comment deleted');
    loadComments($('.post').attr('data-id'));
  }).catch(function (response) {
    handleAjaxError(response);
  })

}

async function renderPosts(response) {

  infoBoxLoader("Posts listed");

  for (let i = 0; i < response.length; i++) {
    response[i].time = calcTime(response[i]._kmd.ect);
    response[i].order = i + 1;
    response[i].isAuthorized = false;
    if (response[i]._acl.creator === sessionStorage.getItem('userId')) {
      response[i].isAuthorized = true;
    }
  }

  let context = {
    data: response,
    hasPosts: response.length > 0
  }

  let menupartial = await $.get('./templates/menupartial.hbs');
  Handlebars.registerPartial('menupartial', menupartial);
  await containerFiller(context, './templates/list-posts.hbs', '.content')

}

function calcTime(dateIsoFormat) {
  let diff = new Date - (new Date(dateIsoFormat));
  diff = Math.floor(diff / 60000);
  if (diff < 1) return 'less than a minute';
  if (diff < 60) return diff + ' minute' + pluralize(diff);
  diff = Math.floor(diff / 60);
  if (diff < 24) return diff + ' hour' + pluralize(diff);
  diff = Math.floor(diff / 24);
  if (diff < 30) return diff + ' day' + pluralize(diff);
  diff = Math.floor(diff / 30);
  if (diff < 12) return diff + ' month' + pluralize(diff);
  diff = Math.floor(diff / 12);
  return diff + ' year' + pluralize(diff);

  function pluralize(value) {
    if (value !== 1) return 's';
    else return '';
  }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}