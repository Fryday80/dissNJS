(() => {
    window.View = View;
    window.openView = openView;

    let views = new Map();
    let $nav, $main, $header;

    function View(name, fn) {
        let v = new fn();
        v.name = name;
        views.set(name, v);
    }
    function openView(viewName) {
        let view  = views.get(viewName);
        $header.html(view.title);
        $main.empty();
        $main.attr("view", viewName);
        view.render($main);
    }
    function buildMenu() {
        for (let view of views) {
            $nav.append(`<li view="${view[1].name}">${view[1].title}</li>`);
        }
    }
    $(document).ready(() => {
        $nav = $('#nav');
        $main = $('main');
        $header = $('header');
        buildMenu();
        openView("home");
        $nav.click('li', (e) => {
            openView($(e.target).attr("view"));
        });
    });
})();


View("home", function() {
    this.title = "Home";
    this.render = (parent) => {
        parent.html(`<h3>Welcome Admin</h3>`);
    }
});

View("list", function() {
    let url = "http://localhost:3000/data/";
    let orderBy = ['id', 'animal', 'drug']; //des hier geht übrigents schon solte :)
    let $list, $select, $from, $to, FROM = 0, TO = 100;

    this.title = "List";

    this.render = ($parent) => {
        let $listHead = $('<div></div>');
        $select = $('<select></select>');
        for (let order of orderBy) $select.append(`<option value="${order}">${order}</option>`);
        $select.appendTo($listHead);
        $from = $(`<input type="number" class="from" value="${FROM}">`);
        $from.appendTo($listHead);
        $to = $(`<input type="number" class="to" value="${TO}">`);
        $to.appendTo($listHead);
        let $loadButton = $(`<button>Load</button>`);
        $loadButton.click(load);
        $loadButton.appendTo($listHead);
        $list = $("<table></table>");
        $parent.append($listHead);
        $parent.append($list);
        load();
    };
    function load() {
        let from = $from.val(),
            to = $to.val(),
            order = $select.val();

        $.ajax({
            url: url + from + "/" + to + "/" + order,
        }).then((data)=> {
            renderList(data);
        });
    }
    function renderList(data) {
        let F = document.createDocumentFragment();
        if (data.length > 0) {
            let $tableHeader = $(`<tr></tr>`);
            for (let prop in data[0]) {
                $tableHeader.append($(`<th>${prop}</th>`));
            }
            F.append($tableHeader[0]);
        }
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            let $item = $(`<tr></tr>`);
            for (let prop in item) {
                $item.append($(`<td>${item[prop]}</td>`));
            }
            F.append($item[0]);
        }
        $list.empty();
        $list.append(F);
    }
});