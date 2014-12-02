if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль контекста
 * @module VisualContext
 */
define(
    ['../controls/aComponent', '../controls/aControl',
        '../../ProtoControls/container','../../ProtoControls/button','../../ProtoControls/edit',
        '../../ProtoControls/matrixGrid','../../ProtoControls/propEditor','../../ProtoControls/dbNavigator','../../ProtoControls/grid',
        '../dataman/dataRoot', '../dataman/dataContact',
        '../controls/controlMgr'],
    function(AComponent, AControl,
             AContainer, AButton, AEdit, AMatrixGrid, PropEditor, DBNavigator, Grid, DataRoot, DataContact,
             ControlMgr) {

        var VisualContext = AComponent.extend(/** @lends module:VisualContext.VisualContext.prototype */{

            className: "VisualContext",
            classGuid: "d5fbf382-8deb-36f0-8882-d69338c28b56",
            metaFields: [
                {fname: "DataBase", ftype: "string"}
            ],
            metaCols: [],

             /**
             * Инициализация объекта
             * @constructs
             * @param params {object}
             */
            init: function(cm, params) {
                this._super(cm, params);

                if (params == undefined) return;
                var result = this.createDb(cm.getDB().getController(), {name: "Master", kind: "master"});
                this.dataBase(result.db.getGuid());
            },

            dataBase: function (value) {
                return this._genericSetter("DataBase", value);
            },

            /**
             * Создать базу данных
             * @param dbc
             * @param options
             * @returns {object}
             */
             createDb: function(dbc, options){
                var db = dbc.newDataBase(options);
                var roots = [dbc.guid(), dbc.guid()];
                for (var i=0; i<roots.length; i++) {
                    var cm = new ControlMgr(db, roots[i]);
                    if (i==0) {
                        // meta
                        new AComponent(cm);
                        new AControl(cm);
                        new AContainer(cm);
                        new AButton(cm);
                        new AEdit(cm);
                        new AMatrixGrid(cm);
                        new PropEditor(cm);
                        new DBNavigator(cm);
                        new Grid(cm);
                        // data
                        new DataRoot(cm);
                        new DataContact(cm);
                    }
                    db.deserialize(this.loadRes(roots[i]), {db: db});
                }
                return {db: db, roots: roots};
            },


            /**
             * Загрузить ресурс
             * @returns {obj}
             */
            loadRes: function (guidRoot) {
                var dbc = this.getControlMgr().getDB().getController();
                var hehe = {
                    "$sys": {
                        "guid": guidRoot,
                        "typeGuid": "1d95ab61-df00-aec8-eff5-0f90187891cf"
                    },
                    "fields": {
                        "Id": 11,
                        "Name": "MainContainer"
                    },
                    "collections": {
                        "Children": [
                            {
                                "$sys": {
                                    "guid": dbc.guid(),
                                    "typeGuid": "ff7830e2-7add-e65e-7ddf-caba8992d6d8"
                                },
                                "fields": {
                                    "Id": 22,
                                    "Name": "Grid",
                                    "Top": "107",
                                    "Left": "230",
                                    "Width":500,
                                    "Height":100
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid": dbc.guid(),
                                    "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                },
                                "fields": {
                                    "Id": 22,
                                    "Name": "MyFirstButton1",
                                    "Top": "50",
                                    "Left": "30",
                                    "Caption": "OK"
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid":  dbc.guid(),
                                    "typeGuid": "827a5cb3-e934-e28c-ec11-689be18dae97"
                                },
                                "fields": {
                                    "Id": 33,
                                    "Name": "Grid",
                                    "Top": "60",
                                    "Left": "50",
                                    "HorCells": 3,
                                    "VerCells": 4
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid":  dbc.guid(),
                                    "typeGuid": "a0e02c45-1600-6258-b17a-30a56301d7f1"
                                },
                                "fields": {
                                    "Id": 44,
                                    "Name": "PropEditor",
                                    "Top": "10",
                                    "Left": "900"
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid":  dbc.guid(),
                                    "typeGuid": "38aec981-30ae-ec1d-8f8f-5004958b4cfa"
                                },
                                "fields": {
                                    "Id": 55,
                                    "Name": "DbNavigator",
                                    "Top": "240",
                                    "Left": "20",
                                    "Nlevels": 3,
                                    "RootElem": "fc13e2b8-3600-b537-f9e5-654b7418c156",
                                    "Level": 0
                                },
                                "collections": {}
                            },
                            {
                                "$sys": {
                                    "guid": dbc.guid(),
                                    "typeGuid": "1d95ab61-df00-aec8-eff5-0f90187891cf"
                                },
                                "fields": {
                                    "Id": 100,
                                    "Name": "Container2",
                                    "Width":500,
                                    "Height":100,
                                    "Top": "5",
                                    "Left": "230"
                                },
                                "collections": {
                                    "Children": [
                                        {
                                            "$sys": {
                                                "guid": dbc.guid(),
                                                "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                            },
                                            "fields": {
                                                "Id": 101,
                                                "Name": "Button1",
                                                "Top": "5",
                                                "Left": "30",
                                                "Caption": "Button1"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": dbc.guid(),
                                                "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                            },
                                            "fields": {
                                                "Id": 101,
                                                "Name": "Button2",
                                                "Top": "5",
                                                "Left": "130",
                                                "Caption": "Button2"
                                            },
                                            "collections": {}
                                        },
                                        {
                                            "$sys": {
                                                "guid": dbc.guid(),
                                                "typeGuid": "1d95ab61-df00-aec8-eff5-0f90187891cf"
                                            },
                                            "fields": {
                                                "Id": 100,
                                                "Name": "Container3",
                                                "Width":220,
                                                "Height":50,
                                                "Top": "5",
                                                "Left": "230"
                                            },
                                            "collections": {
                                                "Children": [
                                                    {
                                                        "$sys": {
                                                            "guid": dbc.guid(),
                                                            "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                                        },
                                                        "fields": {
                                                            "Id": 103,
                                                            "Name": "Button3.1",
                                                            "Top": "5",
                                                            "Left": "30",
                                                            "Caption": "Button3.1"
                                                        },
                                                        "collections": {}
                                                    },
                                                    {
                                                        "$sys": {
                                                            "guid": dbc.guid(),
                                                            "typeGuid": "af419748-7b25-1633-b0a9-d539cada8e0d"
                                                        },
                                                        "fields": {
                                                            "Id": 104,
                                                            "Name": "Button3.2",
                                                            "Top": "5",
                                                            "Left": "130",
                                                            "Caption": "Button3.2"
                                                        },
                                                        "collections": {}
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                };
                return hehe;
            }

        });

        return VisualContext;
    });