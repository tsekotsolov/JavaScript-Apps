const url = 'https://phonebook-e7426.firebaseio.com/phonebook';


$('#btnLoad').click(loadData);
$('#btnCreate').click(createData);
let container = $('#phonebook');

function loadData() {

  $.ajax({
    method: "GET",
    url: url + ".json",
    success: function (response) {

      container.empty();
      for (const record in response) {

        container.append($('<li>').text(`${response[record].name}: ${response[record].phone} `)
          .append($('<a href ="#">').text('[Delete]')).click((e) => {
            $.ajax({
              method: "DELETE",
              url: url + `/${record}.json`,
              success: function (response) {
                e.target.parentElement.remove();
              },
              error: errorHandler
            })
          }));
      };
    },
    error: errorHandler
  })

}

function createData() {

  let inputs = $('input');
  let name = $(inputs.toArray()[0]).val();
  let phone = $(inputs.toArray()[1]).val();

  if (name !== '' && phone !== '') {

    let record = {
      "name": name,
      "phone": phone
    }

    $.ajax({
      method: "POST",
      url: url + '/.json',
      data: JSON.stringify(record),
      success: function () {
        loadData();
      },
      error: errorHandler
    })
  }

  inputs.val('');

}

function errorHandler(error) {
  container.append($('<li>').text("Error"))
}