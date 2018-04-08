function attachEvents() {

  $('#linkRegister').click(async function () {
   
    let context = {
      viewType: 'viewRegister',
      headline: 'Please register here',
      formId: 'formRegister',
      buttonTypeUser: 'buttonRegisterUser',
      buttonText: 'Register'
    }


    async function test(context) {
      let source = await $.get('../details-template.html');
      console.log(source);
      // let template = Handlebars.compile(source);
      // let instanceOfTemplate = template(context);
      // $('main').append(instanceOfTemplate);

    };

    test(context);
    showView('viewRegister');

  });

  $('#linkLogin').click(function () {

    showView('viewLogin');
  });

  $('#linkHome').click(function () {

    showView('viewHome');
  });

  $('#linkListAds').click(function () {
    showView('viewAds');
    listAds();
  });

  $('#linkCreateAd').click(function () {
    showView('viewCreateAd');
  });

  $('#linkLogout').click(function () {
    logoutUser();
  });

  $('#buttonRegisterUser').on('click', registerUser);
  $('#buttonLoginUser').on('click', loginUser)
  $('#buttonCreateAd').on('click', createAd)
  $('#buttonEditAd').on('click', uploadEditedAd)

  $(document).on({
    ajaxStart: function () {
      $("#loadingBox").show()
    },
    ajaxStop: function () {
      $("#loadingBox").hide()
    }
  })
}