/**
 * Created by Fry on 23.03.2018.
 */
"use strict";
let Database = require('better-sqlite3');
let db = new Database('diss.sqlite3', {});
const ENUM_NAMES = "enum_names";
const ENUM_DATA = "enum_data";
const DATA = "data";
const REFERENCE = "reference";
let enums = {};

init();

module.exports = {
    writeSomething(data) {
        data = prepareData(data);
        let info = db.prepare('INSERT INTO ' + DATA + ' (' + data.main.insertColumns + ') VALUES (' + data.main.insertValues + ');').run();
        _writeReference(info, data);
        return;
    },
    getEnums() {
        return enums;
    }
};

function _writeReference(info, data) {
    if (!data.emptyRef)
        db.prepare('INSERT INTO ' + REFERENCE + ' ( id, ' + data.ref.insertColumns + ') VALUES (' + info.lastInsertROWID + ', ' + data.ref.insertValues + ');').run();
}

function init() {
    //get animal-enums
    loadEnums("animal");
    //get drug-enums
    loadEnums("drug");
}

function loadEnums(type) {
    enums[type] = [];
    let result = db.prepare('SELECT DISTINCT '+type+' FROM data').all();
    for (let i = 0; i<result.length; i++){
        if(result[i][type] !== null)
            enums[type].push(result[i][type]);
    }
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
            a.main.insertValues = (obj) ? "'" + obj + "'" : "''";
            dc++;
        } else {
            a.main.insertColumns += ', ' + column;
            a.main.insertValues += (obj) ? ", '" + obj + "'" : ", ''";
        }
    }
    return a;
}