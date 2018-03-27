/**
 * Created by Fry on 27.03.2018.
 */
"use strict";
const DB = require('./db');

module.exports = {
    save: _save,
    getEnums: _getEnums,
    getAll: (from, to, orderBy)=>{ return DB.getAll(from, to, orderBy) },
    exportAll: ()=>{ return DB.exportAll() }
};

function _save (data){
    data = prepareData(data);
    return DB.save(data);
}

function _getEnums() {
    let enums = DB.getEnums();
    for (let type in enums) {
        if(type === "animal") enums.animal = setEnumDefaults(enums.animal, ["hund", "katze", "pferd", "rind", "schaf", "ziege"]);
        if(type !== "yesNo") enums[type].sort(sortAlphabetical);
    }
    return enums;
}

function prepareData(data) {
    let a = {
        main: {
            data: {},
        },
        ref: {
            data: {},
        },
        emptyRef: true,
    };
    for (let item in data){
        if (item === "ref" || item === "email"){
            a.ref.data[item] = data[item];
        } else {
            a.main.data[item] = data[item];
        }
    }
    // set clinic to 0 if not lmu form
    if(!a.main.data.clinic) a.main.data.clinic = "0";
    a = createSubStrings("ref", a);
    a = createSubStrings("main", a);
    return a;
}

function createSubStrings (type, data){
    let count = 0;
    for (let column in data[type].data){
        let obj = data[type].data[column].replace(";", ".");
        if (count === 0){
            data[type].insertColumns = column;
            data[type].insertValues  = (obj) ? "'" + obj + "'" : "''";
            count++;
        } else {
            data[type].insertColumns += ', ' + column;
            data[type].insertValues  += (obj) ? ", '" + obj + "'" : ", ''";
        }
        if ( type === "ref" && obj ) data.emptyRef = false;
    }
    return data;
}

function sortAlphabetical (a,b, sub = false) {
    if ( sub && ((a.length === 0 && b.length === 0) || b.length === 0) ) return 1;
    if ( sub && (a.length === 0) ) return -1;
    return (a[0] > b[0]) ? 1 : (a[0] < b[0]) ? -1 : sortAlphabetical(a.substr(1), b.substr(1), true);
}
function setEnumDefaults(to, defaultArray) {
    for (let i = 0; i < defaultArray.length; i++){
        if(to.indexOf(defaultArray[i].toLowerCase()) === -1){
            to.push(defaultArray[i]);
        }
    }
    return to;
}