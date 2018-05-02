import { Handlebars } from "sammy";

$(() => {

  const app = Sammy('#main', function () {
    this.use('Handlebars','hbs');

    this.get('#/index.html', (ctx) => {
      ctx.swap('<h1>Hello from Sammy.js</h1>')
    });

    this.get('#/about.html', (ctx) => {
      ctx.swap('<h1>About Page</h1>');
    });

    this.get('#/contact.html', (ctx) => {
      ctx.swap('<h1>Contact Page</h1>')
    });

    this.get('#/book/:bookId', (ctx) => {
      let bookId = ctx.params.bookId;
      console.log(bookId);
    });
    this.get('#/login.html', (ctx) => {
      ctx.swap(`<form action="#/login" method="post">
User: <input name="user" type="text">
Pass: <input name="pass" type="password">
<input type="submit" value="Login">
</form>`)
    })
    this.post('#/login', (ctx) => {
      console.log(ctx.params);
      console.log(ctx.params.user);
      console.log(ctx.params.pass);
    })
  });
  
  app.run();
})