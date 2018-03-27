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
let enums = {
    yesNo: [
        "nein",
        "ja"
    ],
    clinics: [
        "CTK - Chirurgische und Gynäkologische Kleintierklinik",
        "Klinik für Pferde - Lehrstuhl für Innere Medizin und Chirurgie des Pferdes sowie für Gerichtliche Tiermedizin",
        "Klinik für Pferde - Lehrstuhl für Innere Medizin und Reproduktion",
        "Klinik für Schweine",
        "Klinik für Vögel, Kleinsäuger, Reptilien und Zierfische",
        "Klinik für Wiederkäuer - Lehrstuhl für Innere Medizin und Chirurgie der Wiederkäuer",
        "Klinik für Wiederkäuer - Lehrstuhl für Physiologie und Pathologie der Fortpflanzung ",
        "MTK - Medizinische Kleintierklinik",
    ],
};

init();

function init() {
    //get animal-enums
    _loadEnumsFromEntries("animal");
    //get drug-enums
    _loadEnumsFromEntries("drug");
}

module.exports = {
    writeSomething(data) {
        data = _prepareData(data);
        let info = db.prepare('INSERT INTO ' + DATA + ' (' + data.main.insertColumns + ') VALUES (' + data.main.insertValues + ');').run();
        _writeReference(info, data);
        return info;
    },
    getEnums() { return enums },
    getAll(from, to, orderBy) {
        orderBy = orderBy || "id";
        return db.prepare('SELECT * FROM data ORDER BY '+orderBy+' LIMIT @from, @to')
            .all({
                from: from,
                to: to
            });
    },
    exportAll() {
        return db.prepare('SELECT * FROM data').all();

    }
};

function _prepareData(data) {
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

function _writeReference(info, data) {
    if (!data.emptyRef)
        db.prepare('INSERT INTO ' + REFERENCE + ' ( id, ' + data.ref.insertColumns + ') VALUES (' + info.lastInsertROWID + ', ' + data.ref.insertValues + ');').run();
}

function _loadEnumsFromEntries(type) {
    enums[type] = [];
    let result = db.prepare('SELECT DISTINCT '+type+' FROM data').all();
    for (let i = 0; i < result.length; i++){
        if(result[i][type] !== null)
            enums[type].push(result[i][type]);
    }
    if(type === "animal") enums.animal = _setEnumDefaults(enums.animal, ["Hund", "Katze", "Pferd", "Rind", "Schaf", "Ziege"]);
    enums[type].sort(sortAlphabetical);
}

function sortAlphabetical (a,b, sub = false) {
    if ( sub && ((a.length === 0 && b.length === 0) || b.length === 0) ) return 1;
    if ( sub && (a.length === 0) ) return -1;
    return (a[0] > b[0]) ? 1 : (a[0] < b[0]) ? -1 : sortAlphabetical(a.substr(1), b.substr(1), true);
}
function _setEnumDefaults(to, defaultArray) {
    for (let i = 0; i < defaultArray.length; i++){
        if(to.indexOf(defaultArray[i]) === -1){
            to.push(defaultArray[i]);
        }
    }
    return to;
}