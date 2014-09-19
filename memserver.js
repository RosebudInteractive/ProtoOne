var MemDBController = require('./public/memDBController');
var MDb = require('./public/memDataBase');
var MemMetaObj = require('./public/memMetaObj');
var MemMetaObjFields = require('./public/memMetaObjFields');
var MemMetaObjCols = require('./public/memMetaObjCols');
var MemObj = require('./public/memObj');

var dbc = new MemDBController();
var db = dbc.newDataBase({name:"PROTO", kind : "master"}); // new MDb(controller,{name:"PROTO", master : "1"});
//var myCol = myMemDb.newCol();
var myMetaControl = new MemMetaObj(db,{"typeName": "Control", "parentClass":null});
var myMetaButton = new MemMetaObj(db,{"typeName": "Button", "parentClass":myMetaControl});
var flds = myMetaControl.getCol("fields");
var cls = myMetaControl.getCol("cols");
new MemMetaObjFields({"obj": myMetaControl, "colName": "fields"}, {"fname":"Id","ftype":"int"});
new MemMetaObjFields({"obj": myMetaControl, "colName": "fields"}, {"fname":"Name","ftype":"string"});

new MemMetaObjFields({"obj": myMetaButton, "colName": "fields"}, {"fname":"Caption","ftype":"string"});

myMetaControl._bldElemTable(); // temp
myMetaButton._bldElemTable();

//var myRootButton = new MemObj(myMetaButton,{ "db": db, "mode":"RW" },{"Id":22,"Name":"MyFirstButton","Caption":"OK"});
myRootButton = db.newRootObj(myMetaButton,{"Id":22,"Name":"MyFirstButton","Caption":"OK"});

myRootButton.set("Caption","Cancel");