/**
 * Created by Fry on 24.03.2018.
 */
"use strict";

let views = new Map();

let titles = {
    top: {
        start: "Die von Ihnen eingegebenen Daten werden mit einer Referenznummer zum Arzneimittel versehen, gespeichert, aufbereitet und anonymisiert an die zuständige Behörde weitergegeben.",
        lmu: "Meldeseite für Einrichtungen der Tiermedizinischen Fakultät <br>",
        doc: "Meldeseite für Tierärzte <br>",
        privat: "Meldeseite für Privatpersonen <br>"
    },
    middle: {
        start: `Die erforderlichen Daten umfassen
    <ul>
        <li>
            Tierart
        </li>
        <li>
            Medikament
        </li>
        <li>
            Dosierung
        </li>
        <li>
            Indikationsstellung
        </li>
        <li>
            unerwünschte Wirkung
        </li>
        <li>
            Allgemeines (Datum der Verabreichung, Auftreten der unerwünschten Arzneimittelwirkung ...)
        </li>
    </ul>`,
        lmu: "",
        doc: "",
        privat: ""
    },
    bottom: {
        start: "Eine Weitergabe der persönlichen Daten findet nicht statt. Sie werden jedoch - ausschließlich - zu Feedbackzwecken gespeichert! (optionale Angaben)",
        lmu: "Die hier eingetragenen Daten unterliegen dem Datenschutz und werden von uns nur für eine Korrespondenz zwischen uns und dem Meldenden genutzt. <br><br> "+
        "Eine arzneimittelrechtliche Bewertung findet nicht statt. Die Weitergabe der an Dritte ist ausgeschlossen.  <br>" +
        "Die ausgewerteten Meldungen können den Kliniken in anonymisierter Form zur Verfügung gestellt werden.<br>",
        doc: "Die hier eingetragenen Daten unterliegen dem Datenschutz und werden von uns nur für eine Korrespondenz zwischen uns und dem Meldenden genutzt. <br><br>" +
        "Eine arzneimittelrechtliche Bewertung findet nicht statt. Die Weitergabe der an Dritte ist ausgeschlossen.  <br>",
        privat: "Die hier eingetragenen Daten unterliegen dem Datenschutz und werden von uns nur für eine Korrespondenz zwischen uns und den Meldenden genutzt. <br>"
    },
};
let bodies = {
    start: getNavigation,
    lmu: (type)=>window.getForm(type),
    doc: (type)=>window.getForm(type),
    privat: (type)=>window.getForm(type),
};

window.setView = View;
window.getView = goTo;

function View(name, fn) {
    views.set(name, new fn() );
}
function goTo(viewName) {
    let view  = views.get(viewName);
    $('div.uaw-title').html(view.title);
    $('div.uaw-body').empty();
    view.render($('div.uaw-body'));
}

View("main", function() {
    let type = "start";
    this.title = getTitle(type);
    this.render = (parent) => {
        parent.html(bodies[type](type));
        $('a')
            .on("click", function (e){
                e.preventDefault();
                window.getView($(e.target).attr("link"));
            });
    }
});
View("lmu", function() {
    let type = "lmu";
    this.title = getTitle(type);
    this.render = (parent) => {
        parent.html(bodies[type](type));
        formActions();
    }
});
View("doc", function() {
    let type = "doc";
    this.title = getTitle(type);
    this.render = (parent) => {
        parent.html(bodies[type](type));
        formActions();
    }
});
View("privat", function() {
    let type = "privat";
    this.title = getTitle(type);
    this.render = (parent) => {
        parent.html(bodies[type](type));
        formActions();
    }
});

function addBackButton() {
    $('<button>')
        .text("zurück")
        .appendTo($('div.uaw-title'));
    $('.uaw-title button')
        .on("click", function (e){
            goTo("main");
        });
}

function getTitle(type) {
    let title = "";
    title += '<h3> ' + titles.top[type] + '</h3>';
    title += '<div>' + titles.middle[type] + '</div>';
    title += '<h4> ' + titles.bottom[type] + '</h4>';

    return title;
}

function formActions() {
    addBackButton();
    $('form').on("submit", e => {
        e.preventDefault();
        saveData($("form").serialize());
    });
}

function saveData (data) {
    $.ajax({
        dataType: "json",
        url: "write",
        data: data,
        success: (saveInfo) => {
            goTo("main");
        }
    });
}

function getNavigation(){
    return `<div style="border: solid 1px dimgray">
        <h4>
            Online-Meldungen für:
        </h4>
        <div class="c-list">
            <ul>
                <li class="lmu-meldung-link">
                    <h4>
                        <a link="lmu" href="/lmu">Institute der Tierärztlichen Fakultät der Ludwig-Maximilians-Universität München</a>
                    </h4>
                </li>
                <li class="ta-meldung-link">
                    <h4>
                        <a link="doc" href="/doc">Tierärzte</a>
                    </h4>
                </li>
                <li class="priv-meldung-link">
                    <h4>
                        <a link="privat" href="/priv">Privatpersonen / Tierbesitzer</a>
                    </h4>
                </li>
            </ul>
        </div>
    </div>`;
}