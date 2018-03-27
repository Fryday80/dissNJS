/**
 * Created by Fry on 27.03.2018.
 */
"use strict";
const DB = require('./db');


module.exports = {
    save: _save,
    getEnums: _getEnums,
    getAll: _getAll,
};

function _save (data){
    data = prepareData(data);
    return DB.writeSomething(data);
}

function _getEnums() {
    let enums = DB.getEnums();
    for (let type in enums) {
        if(type === "animal") enums.animal = _setEnumDefaults(enums.animal, ["hund", "katze", "pferd", "rind", "schaf", "ziege"]);
        if(type !== "yesNo") enums[type].sort(sortAlphabetical);
    }
    return enums;
}

function _getAll(from, to, orderBy) {
    return DB.getAll(from, to, orderBy);
}

function prepareData(data) {
    let refData = [ "ref", "email" ];
    let rc = 0;
    let dc = 0;
    let a = {
        main: {
            data: {},
            insertColumns: "",
            insertValues: "",
        },
        ref: {
            data: {},
            insertColumns: "",
            insertValues: "",
        },
        emptyRef: true,
    };
    for (let item in data){
        if (refData.indexOf(item) > -1){
            a.ref.data[item] = data[item];
        } else {
            a.main.data[item] = data[item];
        }
    }
    // set clinic to 0 if not lmu form
    if(!a.main.data.clinic) a.main.data.clinic = "0";
    for (let column in a.ref.data){
        let obj = a.ref.data[column];
        if (rc === 0){
            a.ref.insertColumns = column;
            a.ref.insertValues = (obj) ? "'" + obj + "'" : "''";
            rc++;
        } else {
            a.ref.insertColumns += ', ' + column;
            a.ref.insertValues += (obj) ? ", '" + obj + "'" : ", ''";
        }
        if ( obj ) a.emptyRef = false;
    }
    for (let column in a.main.data){
        let obj = a.main.data[column];
        if (dc === 0){
            a.main.insertColumns = column;
            a.main.insertValues = (obj) ? "'" + obj.toLowerCase() + "'" : "''";
            dc++;
        } else {
            a.main.insertColumns += ', ' + column;
            a.main.insertValues += (obj) ? ", '" + obj.toLowerCase() + "'" : ", ''";
        }
    }
    return a;
}

function sortAlphabetical (a,b, sub = false) {
    if ( sub && ((a.length === 0 && b.length === 0) || b.length === 0) ) return 1;
    if ( sub && (a.length === 0) ) return -1;
    return (a[0] > b[0]) ? 1 : (a[0] < b[0]) ? -1 : sortAlphabetical(a.substr(1), b.substr(1), true);
}
function _setEnumDefaults(to, defaultArray) {
    for (let i = 0; i < defaultArray.length; i++){
        if(to.indexOf(defaultArray[i].toLowerCase()) === -1){
            to.push(defaultArray[i]);
        }
    }
    return to;
}