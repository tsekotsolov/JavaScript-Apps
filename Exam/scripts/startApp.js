$((async function startApp() {
  
  let headerpartial = await $.get('./templates/headerpartial.hbs');
  Handlebars.registerPartial('headerpartial', headerpartial);

  let footerpartial = await $.get('./templates/footerpartial.hbs');
  Handlebars.registerPartial('footerpartial', footerpartial);

  let menupartial = await $.get('./templates/menupartial.hbs');
  Handlebars.registerPartial('menupartial', menupartial);

  loadRegisterPage();
  
}));