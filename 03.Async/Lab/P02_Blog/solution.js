function attachEvents() {
  const url = 'https://baas.kinvey.com/appdata/kid_HJVXrT89G/';
  const username = 'tseko';
  const password = 'games';
  const base64 = btoa(username + ':' + password);
  const auth = {
    'Authorization': 'Basic ' + base64
  };


$('#btnLoadPosts').click(loadPosts);


function loadPosts(){
  $.ajax({
    method: 'GET',
    url: url + 'posts',
    headers: auth,
    success: function (response) {

      console.log(response);

    for (const post of response) {
      $('#posts').append(
        $(`<option value="${post._id}">${post.title}</option>`))
    }
    
    },
    error: function (error) {

    }

  })
}
  
}