/**
 * Created by Fry on 23.03.2018.
 */
"use strict";

let enums = {};
let subTexts = {
    clinicsText: "Ihre Klinik",
    animalText: "Tier",
    medicsText: "Medikament",
    lmu: {
        formText: "Meldebogen für Einrichtungen der Tiermedizinischen Fakultät",
        lastText: "Referenzdaten"
    },
    doc: {
        formText: "Meldebogen für Tierärzte und Tierärztinnen",
        lastText: "freiwillige Angaben"
    },
    privat: {
        formText: "Meldebogen für Privatpersonen",
        lastText: "freiwillige Angaben"
    },
};
let formAttribs = {
    action: "/write",
    method:"GET",
    id:"form_uaw"
};
let preset = {};
let forms = {
    clinics: function ($form) {
        $(".clinics", $form).append(newInput("clinic", "radio", subTexts.clinicsText, "", enums.clinics));
    },
    animal: function ($form) {
        $(".animal", $form)
            .append(newInput("animal", "text", "Tierart", "Hund, Katze...", enums.animal))
            .append( $('<br>') )
            .append(newInput("weight", "number", "Gewicht", "...").append($("<span> kg *ungefähre Angabe</span>")));
    },
    animalPlus: function ($form) {
        $(".animal", $form)
            .append( $('<br>') )
            .append(newInput("lm", "select", "Lebensmittel-Lieferndes Tier", "", enums.yesNo));
    },
    medics: function ($form) {
        for (let i = 0; i < preset.medics.length; i++){
            let item = preset.medics[i];
            if(item.options)
                $(".medics", $form).append(newInput(item.name, item.type, item.label, item.placeholder, item.options));
            else
                $(".medics", $form).append(newInput(item.name, item.type, item.label, item.placeholder));
        }
    },
    additional: function($form){
        $(".additional", $form).append(newInput("email", "email", "E-Mail für Feedback", "eMail"));
    },
    additionalPlus: function($form){
        $(".additional", $form).prepend(newInput("ref", "text", "Referenznummer", "z.B. Vetera Nummer, EasyVet Nummer"));
    },
    sendButton: function ($form){
        $form.append($('<br><br> <input id="send" type="submit"> <br><br>'));
    }
};
let create = {
    number: (name, type, placeholder, options)=>{
        return $('<input name="' + name + '" type="number" step="0.5" placeholder="' + placeholder + '">');
    },
    text: (name, type, placeholder, options)=>{
        let $input = $('<input name="' + name + '" type="text" placeholder="' + placeholder + '">');
        if(options){
            let listName = name + "-" + type;
            let $dataList = $('<datalist id="' + listName + '">');
            for (let i = 0; i < options.length; i++){
                $dataList.append($('<option value="' + options[i].charAt(0).toUpperCase() + options[i].slice(1) + '">'));
            }
            $input
                .attr("list", listName)
                .append($dataList);
        }
        return $input
    },
    radio: (name, type, placeholder, options)=>{
        let $div  = $('<div class="radio">');
        for(let i= 0; i < options.length; i++){
            let $input = $('<input name="' + name + '" type="radio" value="' + i + '">');
            let $label = $('<label>')
                .text(options[i])
                .prepend($input)
                .appendTo($div);
        }
        return $div;
    },
    email: (name, type, placeholder, options)=>{
        let $input = $('<input name="' + name + '" type="text" placeholder="' + placeholder + '">');
        if(options){
            let listName = name + "-" + type;
            let $dataList = $('<datalist id="' + listName + '">');
            for (let i = 0; i < options.length; i++){
                $dataList.append($('<option value="' + options[i] + '">'));
            }
            $input
                .attr("list", listName)
                .append($dataList);
        }
        return $input
    },
    textarea: (name, type, placeholder, options)=>{
        return $('<textarea name="' + name + '" placeholder="' + placeholder + '">');
    },
    select: (name, type, placeholder, options)=>{
        let $input = $('<select name="' + name + '" >');
        for (let i=0; i < options.length; i++){
            let j = i+1;
            $input.append($('<option value="' + j + '">' + options[i] + '</option>'));
        }
        return $input;
    },
};
let a = $.getJSON( "enums", function( data ) {
    enums = data;
});
// $.ajax({
//     dataType: "json",
//     url: "enums",
//     // data: data,
//     success: (data) => {
//
//     console.log("get JSON", data );
//     }
// });
a.then(function(){
    console.log('asdasdsa', enums);
    preset = {
        medics: [
            {
                label: "Indikation",
                name: "reason",
                placeholder: "Indikation...",
                type: "text"
            },
            {
                label: "Medikamentenname",
                name: "drug",
                placeholder: "Medikamentenname...",
                type: "text",
                options: enums.drug,
            },
            {
                label: "Dosierung",
                name: "dose",
                placeholder: "z.B. 1 1/2 Tabletten, 3ml ...",
                type: "text"
            },
            {
                label: "Häufigkeit der Verabreichung",
                name: "frequency",
                placeholder: "z.B. 2x täglich",
                type: "text"
            },
            {
                label: "Beobachtung / unerwünschte Wirkung",
                name: "problem",
                placeholder: "Rötungen a.d. Pfoten, Erbrechen...",
                type: "textarea"
            },
        ],
    };
});

window.getForm = function(type){
    let $newForm = newForm(type);
    let sections = $('fieldset fieldset', $newForm);
    sections.each(function (index){
        let section = $(sections[index]).attr("class");
        forms[section]($newForm);
    });
    if(type !== "privat"){
        forms.additionalPlus($newForm);
        forms.animalPlus($newForm);
    }

    $('fieldset.additional input', $newForm).addClass("additional");
    setRequired(type, $newForm);

    $('div.uaw-body')
        .empty()
        .append($newForm);
};

function newInput (name, type, label, placeholder, options){
    let $fragment = $('<div>');
    if(type === "radio"){
        return $fragment.append(create[type](name, type, placeholder, options));
    } else {
        let $label = $('<label>')
            .attr("for", name)
            .html(label);
        return $fragment
            .append($label)
            .append(create[type](name, type, placeholder, options));
    }
}

function newFieldset (legendText, additionalClass = null){
    let $fieldset = $('<fieldset>')
        .append( $('<legend>') );
    if (additionalClass !== null) $fieldset.addClass(additionalClass);
    $('<h3>')
        .html(legendText)
        .appendTo( $('legend', $fieldset) );
    return $fieldset;
}

function newForm (type) {
    let $newForm = $('<form>')
        .append(newFieldset(subTexts[type].formText, "form"));
    for (let attrib in formAttribs){
        if (formAttribs.hasOwnProperty(attrib)){
            $($newForm).attr(attrib, formAttribs[attrib]);
        }
    }

    if(type === "lmu"){
        $('fieldset', $newForm)
            .append( newFieldset(subTexts.clinicsText, "clinics") );
    }

    $('fieldset.form', $newForm)
        .append( newFieldset(subTexts.animalText, "animal") )
        .append( newFieldset(subTexts.medicsText, "medics") )
        .append( newFieldset(subTexts[type].lastText, "additional") )
    ;

    forms.sendButton($('fieldset.form', $newForm));

    return $newForm;
}

function setRequired(type, form) {
    let $items = $( [].concat($('input', form).toArray(), $('textarea', form).toArray(), $('select', form).toArray()) );
    if (type !== "lmu"){
        $items = $items.not('.additional');
    }
    $items = $items.not('#send');
    $items.attr("required", '');
}