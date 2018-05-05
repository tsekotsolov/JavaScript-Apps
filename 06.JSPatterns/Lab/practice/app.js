$(() => {

  const app = Sammy('#main', function () {
    this.use('Handlebars', 'hbs');

    this.get('index.html', (ctx) => {

      ctx.swap(`<header>
      <h1>Hello Sammy</h1>
      <a href="#/index.html">Home</a>
      <a href="#/about.html">About</a>
      <a href="#/contact.html">Contact</a>
      <a href="#/book/144">Get book</a>
      <a href="#/login.html">Login Form</a>
      <a href="#/hello/Tseko">Say Hi</a>
    </header>`)
    });

    this.get('#/about.html', (ctx) => {
      
        ctx.swap('<h1>About</h1>');
      
    });

    this.get('#/contact.html', (ctx) => {
      ctx.swap('<h1>Contact Page</h1>')
    });

    this.get('#/book/:bookId', (ctx) => {
      let bookId = ctx.params.bookId;
      console.log(bookId);
    });
    this.get('#/login.html', (ctx) => {
    

      ctx.loadPartials({
        header: './templates/header.hbs'
      }).then(function () {
        this.partial('./templates/form.hbs');
      })

    });
    this.post('#/login.html', (ctx) => {
      console.log(ctx.params);
      console.log(ctx.params.user);
      console.log(ctx.params.pass);
    });
    this.get('#/hello/:name', (ctx) => {

      ctx.title = 'Hello';
      ctx.name = ctx.params.name;
      ctx.loadPartials({
        header: './templates/header.hbs'
      }).then(function () {
        this.partial('./templates/hi.hbs');
      })

    })
  });

  app.run();
})