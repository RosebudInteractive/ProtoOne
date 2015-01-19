if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['../controls/controlMgr',  './dataRoot', './dataContact', './dataCompany'],
	function(ControlMgr, DataRoot, DataContact, DataCompany) {
		var Dataman = Class.extend({

			init: function(router, controller){
				this.pvt = {};
				this.pvt.router = router;
				this.pvt.controller = controller;
				var that = this;
                router.add('query', function(){ return that.query.apply(that, arguments); });
			},

            query: function(data, done) {
				var result = {};
                var controller = this.pvt.controller;
                var db = controller.getDB(data.dbGuid);
                var rootGuid = controller.guid();
                db.deserialize(this.loadQuery(rootGuid), {});
                controller.genDeltas(db.getGuid());
                done({rootGuid:rootGuid});
            },

            /**
             * Загрузить данные
             * @param guidRoot
             * @param expression
             * @returns {obj}
             */
            loadQuery: function (guidRoot, expression) {
                var hehe = {};
                if (guidRoot == 'ab573a02-b888-b3b4-36a7-38629a5fe6b7')
                    hehe = {
                        "$sys": {
                            "guid": guidRoot,
                            "typeGuid": "87510077-53d2-00b3-0032-f1245ab1b74d"
                        },
                        "fields": {
                            "Id": 1000,
                            "Name": "DataRoot"
                        },
                        "collections": {
                            "DataElements": [
                                {
                                    "$sys": {
                                        "guid": "58b8c701-6683-dcbf-a0bc-3a07c140cc86",
                                        "typeGuid": "59583572-20fa-1f58-8d3f-5114af0f2c51"
                                    },
                                    "fields": {
                                        "Id": 1101,
                                        "Name": "Microsoft",
                                        "country": "США",
                                        "city": "Редмонд",
                                        "address": "Вашингтон"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "ba6e2d2c-85a7-01df-b3c3-32682387f535",
                                        "typeGuid": "59583572-20fa-1f58-8d3f-5114af0f2c51"
                                    },
                                    "fields": {
                                        "Id": 1102,
                                        "Name": "Google",
                                        "country": "США",
                                        "city": "CA",
                                        "address": "Mountain View"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "486c0238-4fb9-32e2-23e1-0d7331731691",
                                        "typeGuid": "59583572-20fa-1f58-8d3f-5114af0f2c51"
                                    },
                                    "fields": {
                                        "Id": 1103,
                                        "Name": "SAS",
                                        "country": "США",
                                        "city": "NC",
                                        "address": "Cary"
                                    },
                                    "collections": {}
                                }
                            ]
                        }
                    };
                else if (guidRoot == 'b49d39c9-b903-cccd-7d32-b84beb1b76dc')
                    hehe = {
                        "$sys": {
                            "guid": guidRoot,
                            "typeGuid": "87510077-53d2-00b3-0032-f1245ab1b74d"
                        },
                        "fields": {
                            "Id": 1000,
                            "Name": "DataRoot"
                        },
                        "collections": {
                            "DataElements": [
                                {
                                    "$sys": {
                                        "guid": "bd7eed84-cfd9-3272-f526-7b76c6109e7c",
                                        "typeGuid": "73596fd8-6901-2f90-12d7-d1ba12bae8f4"
                                    },
                                    "fields": {
                                        "Id": 1001,
                                        "parent": 1101,
                                        "firstname": "Джонни",
                                        "lastname": "Депп",
                                        "birthdate": "09-06-1963",
                                        "country": "США",
                                        "city": "Оуэнсборо",
                                        "address": "Кентукки"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "8e532a7f-7ace-b5e7-1fc4-97fc83570f57",
                                        "typeGuid": "73596fd8-6901-2f90-12d7-d1ba12bae8f4"
                                    },
                                    "fields": {
                                        "Id": 1002,
                                        "parent": 1102,
                                        "firstname": "Джеффри",
                                        "lastname": "Раш",
                                        "birthdate": "06-07-1951",
                                        "country": "Австралия",
                                        "city": "Тувумба",
                                        "address": "Квинсленд"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "56bd87fb-3b4a-22f4-fafc-073a18f569d9",
                                        "typeGuid": "73596fd8-6901-2f90-12d7-d1ba12bae8f4"
                                    },
                                    "fields": {
                                        "Id": 1003,
                                        "parent": 1102,
                                        "firstname": "Орландо",
                                        "lastname": "Блум",
                                        "birthdate": "13-01-1977",
                                        "country": "Великобритания",
                                        "city": "Тувумба",
                                        "address": "Кент"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "8e532a7f-7ace-b5e7-1fc4-97fc83570f57",
                                        "typeGuid": "73596fd8-6901-2f90-12d7-d1ba12bae8f4"
                                    },
                                    "fields": {
                                        "Id": 1004,
                                        "parent": 1103,
                                        "firstname": "Вуди",
                                        "lastname": "Харрельсон",
                                        "birthdate": "23-07-1961",
                                        "country": "Бразилия",
                                        "city": "Мидленд",
                                        "address": "МучиКучи"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "56bd87fb-3b4a-22f4-fafc-073a18f569d9",
                                        "typeGuid": "73596fd8-6901-2f90-12d7-d1ba12bae8f4"
                                    },
                                    "fields": {
                                        "Id": 1005,
                                        "parent": 1103,
                                        "firstname": "Эмили",
                                        "lastname": "Мортимер",
                                        "birthdate": "11-12-1980",
                                        "country": "Рио",
                                        "city": "Барбадос",
                                        "address": "Пермь"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "56bd87fb-3b4a-22f4-fafc-073a18f569d9",
                                        "typeGuid": "73596fd8-6901-2f90-12d7-d1ba12bae8f4"
                                    },
                                    "fields": {
                                        "Id": 1006,
                                        "parent": 1103,
                                        "firstname": "Кэтрин",
                                        "lastname": "Лэйси",
                                        "birthdate": "21-04-1986",
                                        "country": "Россия",
                                        "city": "Москва",
                                        "address": "Шаболовка"
                                    },
                                    "collections": {}
                                }
                            ]
                        }
                    };
                else if (guidRoot == 'edca46bc-3389-99a2-32c0-a59665fcb6a7')
                    hehe = {
                        "$sys": {
                            "guid": guidRoot,
                            "typeGuid": "87510077-53d2-00b3-0032-f1245ab1b74d"
                        },
                        "fields": {
                            "Id": 1000,
                            "Name": "DataRoot"
                        },
                        "collections": {
                            "DataElements": [
                                {
                                    "$sys": {
                                        "guid": "76c01d4f-3d12-53da-0ca0-40045cbeb9b0",
                                        "typeGuid": "16ec0891-1144-4577-f437-f98699464948"
                                    },
                                    "fields": {
                                        "Id": 2001,
                                        "parent": 1001,
                                        "country": "Россия",
                                        "city": "Москва",
                                        "address": "ул. Чичерина, 1"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "562068e7-f61b-327e-585e-bb1b12e209cf",
                                        "typeGuid": "16ec0891-1144-4577-f437-f98699464948"
                                    },
                                    "fields": {
                                        "Id": 2002,
                                        "parent": 1002,
                                        "country": "Украина",
                                        "city": "Киев",
                                        "address": "ул. Шевченко, 34"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "0d8ffa3e-0745-29eb-1112-8182250446a0",
                                        "typeGuid": "16ec0891-1144-4577-f437-f98699464948"
                                    },
                                    "fields": {
                                        "Id": 2003,
                                        "parent": 1003,
                                        "country": "Беларусь",
                                        "city": "Минск",
                                        "address": "ул. Могилевская, 4"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "3316d111-8a3f-9b56-269a-e110cc4c3742",
                                        "typeGuid": "16ec0891-1144-4577-f437-f98699464948"
                                    },
                                    "fields": {
                                        "Id": 2004,
                                        "parent": 1004,
                                        "country": "Казахстан",
                                        "city": "Астана",
                                        "address": "ул. Казанмангал, 3"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "58d0ef37-c0b1-31b3-32a4-729f0dfd5071",
                                        "typeGuid": "16ec0891-1144-4577-f437-f98699464948"
                                    },
                                    "fields": {
                                        "Id": 2005,
                                        "parent": 1005,
                                        "country": "Италия",
                                        "city": "Рим",
                                        "address": "ул. Итальянская, 34"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "43076a4f-dff1-26fb-11cc-753022edbe41",
                                        "typeGuid": "16ec0891-1144-4577-f437-f98699464948"
                                    },
                                    "fields": {
                                        "Id": 2006,
                                        "parent": 1006,
                                        "country": "Франция",
                                        "city": "Париж",
                                        "address": "ул. Оланда, 123"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "18623cf4-dd1b-d0f2-bbac-430c9e097633",
                                        "typeGuid": "16ec0891-1144-4577-f437-f98699464948"
                                    },
                                    "fields": {
                                        "Id": 2007,
                                        "parent": 1002,
                                        "country": "Турция",
                                        "city": "Кемер",
                                        "address": "ул. Хлоповко, 11"
                                    },
                                    "collections": {}
                                }
                            ]
                        }
                    };
                else if (guidRoot == '8583ee1d-6936-19da-5ef0-9025fb7d1d8d')
                    hehe = {
                        "$sys": {
                            "guid": guidRoot,
                            "typeGuid": "87510077-53d2-00b3-0032-f1245ab1b74d"
                        },
                        "fields": {
                            "Id": 1000,
                            "Name": "DataRoot"
                        },
                        "collections": {
                            "DataElements": [
                                {
                                    "$sys": {
                                        "guid": "c0c75a46-9a74-ce36-1c76-2d7613ad9440",
                                        "typeGuid": "08a0fad1-d788-3604-9a16-3544a6f97721"
                                    },
                                    "fields": {
                                        "Id": 1001,
                                        "parent": 1101,
                                        "number": "1001-1101",
                                        "total": "345432"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "d121bbfe-3207-43ef-b0d4-6572a649d146",
                                        "typeGuid": "08a0fad1-d788-3604-9a16-3544a6f97721"
                                    },
                                    "fields": {
                                        "Id": 1002,
                                        "parent": 1101,
                                        "number": "1002-1101",
                                        "total": "1000"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "0033e3ec-b741-dcf5-b3db-a099132333e2",
                                        "typeGuid": "08a0fad1-d788-3604-9a16-3544a6f97721"
                                    },
                                    "fields": {
                                        "Id": 1003,
                                        "parent": 1101,
                                        "number": "1003-1101",
                                        "total": "234000"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "4a22b2bf-3632-516a-5bd5-4a56cc592a13",
                                        "typeGuid": "08a0fad1-d788-3604-9a16-3544a6f97721"
                                    },
                                    "fields": {
                                        "Id": 1004,
                                        "parent": 1102,
                                        "number": "1004-1102",
                                        "total": "1000"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "f245ac20-058a-3611-70b3-aafd17603ffb",
                                        "typeGuid": "08a0fad1-d788-3604-9a16-3544a6f97721"
                                    },
                                    "fields": {
                                        "Id": 1005,
                                        "parent": 1102,
                                        "number": "1005-1102",
                                        "total": "1000"
                                    },
                                    "collections": {}
                                },
                                {
                                    "$sys": {
                                        "guid": "e1a2e816-41dd-2e9c-946b-8e91fd585130",
                                        "typeGuid": "08a0fad1-d788-3604-9a16-3544a6f97721"
                                    },
                                    "fields": {
                                        "Id": 1006,
                                        "parent": 1103,
                                        "number": "1006-1103",
                                        "total": "1000"
                                    },
                                    "collections": {}
                                }
                            ]
                        }
                    };

                // фильтрация по паренту
                if (expression) {
                    var filter = [];
                    for(var i in hehe.collections.DataElements) {
                        if (hehe.collections.DataElements[i].fields.parent == expression)
                            filter.push(hehe.collections.DataElements[i]);
                    }
                    hehe.collections.DataElements = filter;
                }

                return  hehe;
            }
        });
		return Dataman;
	}
);