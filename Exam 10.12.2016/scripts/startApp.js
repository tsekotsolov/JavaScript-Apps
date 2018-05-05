$((async function startApp() {
  
  let boxespartial = await $.get('./templates/boxespartial.hbs');
  Handlebars.registerPartial('boxespartial', boxespartial);

  loadWelcomePage();
 
}));