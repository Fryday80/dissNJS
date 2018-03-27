/**
 * Created by Fry on 23.03.2018.
 */
"use strict";

let enums = {};
let preset = {};
let subTexts = {
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
let forms = {
    clinics: function ($form) {
        $(".clinics", $form).append(newInput("clinic", "radio", "Ihre Klinik", "", enums.clinics));
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
    additional: function($form, type){
        $(".additional", $form).append(newInput("email", "email", "E-Mail für Feedback", "eMail"));
        $(".additional", $form).append($('<input name="submitter" value="' + type + '" hidden>'));
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
            $('<label>')
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
a.then(function(){
    preset = {
        medics: [
            newPreset("Indikation", "reason", "Indikation...", "text"),
            newPreset("Medikamentenname", "drug", "Medikamentenname...", "text", enums.drug),
            newPreset("Dosierung", "dose", "z.B. 1 1/2 Tabletten, 3ml ...", "text"),
            newPreset("Häufigkeit der Verabreichung", "frequency", "z.B. 2x täglich", "text"),
            newPreset("Beobachtung / unerwünschte Wirkung", "problem", "Rötungen a.d. Pfoten, Erbrechen...", "textarea"),
        ],
    };
});
function newPreset (label, name, placeholder, type, options){
    let a = {
        label: label,
        name: name,
        placeholder: placeholder,
        type: type
    };
    if(options) a.options = options;
    return a;
}

window.getForm = function(type){
    let $newForm = newForm(type);
    let sections = $('fieldset fieldset', $newForm);
    sections.each(function (index){
        forms[ $(sections[index]).attr("class") ]($newForm, type);
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
    let $fragment = $('<div>')
        .append(create[type](name, type, placeholder, options));
    let $label = $('<label>')
        .attr("for", name)
        .html(label);
    return (type === "radio") ? $fragment : $fragment.prepend($label);
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
        $($newForm).attr(attrib, formAttribs[attrib]);
    }

    if(type === "lmu")
        $('fieldset', $newForm).append( newFieldset("Ihre Klinik", "clinics") );

    $('fieldset.form', $newForm)
        .append( newFieldset("Tierdaten", "animal") )
        .append( newFieldset("Medikamentendaten", "medics") )
        .append( newFieldset(subTexts[type].lastText, "additional") );

    forms.sendButton($('fieldset.form', $newForm));
    return $newForm;
}

function setRequired(type, form) {
    let $items = $( [].concat($('input', form).toArray(), $('textarea', form).toArray(), $('select', form).toArray()) );
    $items = (type !== "lmu") ? $items = $items.not('.additional').not('#send') : $items.not('#send');
    $items.attr("required", '');
}