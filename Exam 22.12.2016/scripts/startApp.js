async function startApp(){

  let errorpartial = await $.get('./templates/errorpartial.hbs');
  Handlebars.registerPartial('errorpartial', errorpartial);
  loadWelcomePage();
  loadHeader();
}