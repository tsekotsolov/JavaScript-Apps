let helper = (function () {

  function errorBoxLoader(message) {
    let errorbox = $('#errorBox')
    $('#errorBox').text(message);
    errorbox.css('display', 'block')
    errorbox.click(function () {
      errorbox.css('display', 'none')
    })
  }

  function handleAjaxError(response) {

    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
      errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
      errorMsg = response.responseJSON.description

    errorBoxLoader(errorMsg);

  }

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatDate(dateISO8601) {
    let date = new Date(dateISO8601);
    if (Number.isNaN(date.getDate()))
      return '';
    return date.getDate() + '.' + padZeros(date.getMonth() + 1) +
      "." + date.getFullYear() + ' ' + date.getHours() + ':' +
      padZeros(date.getMinutes()) + ':' + padZeros(date.getSeconds());

    function padZeros(num) {
      return ('0' + num).slice(-2);
    }
  }

  function formatSender(name, username) {
    if (!name)
      return username;
    else
      return username + ' (' + name + ')';
  }

  function infoBoxLoader(message) {
    let infobox = $('#infoBox')
    $('#infoBox').text(message);
    infobox.css('display', 'block');
    setTimeout(function () {
      infobox.css('display', 'none')
    }, 3000)
  }

  let loader = $(document).on({
    ajaxStart: function () {
      $("#loadingBox").show()
  
    },
    ajaxStop: function () {
      $("#loadingBox").hide()
    }
  })

  
  
  return {
    errorBoxLoader,
    handleAjaxError,
    escapeHtml,
    formatDate,
    formatSender,
    infoBoxLoader,
    loader

  }

})()
