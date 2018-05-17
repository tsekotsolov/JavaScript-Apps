$((async function startApp() {
  
 
  let menupartial = await $.get('./templates/menupartial.hbs');
  Handlebars.registerPartial('menupartial', menupartial);

  let footerpartial = await $.get('./templates/footerpartial.hbs');
  Handlebars.registerPartial('footerpartial', footerpartial);


  loadLoginPage();

  
}));