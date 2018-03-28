/**
 * Created by Fry on 23.03.2018.
 */
"use strict";
let Database = require('better-sqlite3');
let db = new Database('diss.sqlite3', {});
const DATA = "data";
const REFERENCE = "reference";
let enums = {};

init();
function init() {
    //get animal-enums
    loadDistinctValuesFrom("animal");
    //get drug-enums
    loadDistinctValuesFrom("drug");
}

module.exports = {
    exportAll: _exportAll,
    getEnums:  ()=>{ return enums },
    getAll: _getAll,
    save: _save,
};

function _save(data) {
    let info = db.prepare('INSERT INTO ' + DATA + ' (' + data.main.insertColumns + ') VALUES (' + data.main.insertValues + ');').run();
    _writeReference(info, data);
    init();
    return info;
}
function _writeReference(info, data) {
    if (!data.emptyRef)
        db.prepare('INSERT INTO ' + REFERENCE + ' ( id, ' + data.ref.insertColumns + ') VALUES (' + info.lastInsertROWID + ', ' + data.ref.insertValues + ');').run();
}

function _getAll(from, to, orderBy){
    orderBy = orderBy || "id";
    return db.prepare('SELECT * FROM data ORDER BY '+orderBy+' DESC LIMIT @from, @to')
        .all({
            from: from,
            to: to
        });
}

function _exportAll (startID) {
    return db.prepare('SELECT * FROM data WHERE id > @startID ORDER BY id').all({ startID: startID-1 });
}

function loadDistinctValuesFrom(columnName) {
    enums[columnName] = [];
    let rows = db.prepare('SELECT DISTINCT ' + columnName + ' FROM data').all();
    for (let i = 0; i < rows.length; i++){
        if(rows[i][columnName] !== null)
            enums[columnName].push(rows[i][columnName]);
    }
}