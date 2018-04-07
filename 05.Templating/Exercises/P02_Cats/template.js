$(() => {
    
    async function renderCatTemplate() {
        let cats = window.cats;
        let source = await $.get("./catTemplate.hbs");
        let template = Handlebars.compile(source);

        let data = {
            cats
        };

        let instance = template(data);
        $("#allCats").html(instance);
    }

    renderCatTemplate();

})

function show(id) {
    $(`#${id}`).toggle();
}
