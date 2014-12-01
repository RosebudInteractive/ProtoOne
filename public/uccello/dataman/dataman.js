if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['../controls/controlMgr',  './dataRoot', './dataContact'],
	function(ControlMgr, DataRoot, DataContact) {
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
                db.deserialize(this.loadQuery(rootGuid), {db: db});
                controller.genDeltas(db.getGuid());
                done({rootGuid:rootGuid});
            },

            /**
             * Загрузить данные
             * @param guidRoot
             * @returns {obj}
             */
            loadQuery: function (guidRoot) {
                var hehe = {
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
                                    "Id": 1001,
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
                                    "Id": 1001,
                                    "firstname": "Орландо",
                                    "lastname": "Блум",
                                    "birthdate": "13-01-1977",
                                    "country": "Великобритания",
                                    "city": "Тувумба",
                                    "address": "Кент"
                                },
                                "collections": {}
                            }
                        ]
                    }
                };
                return hehe;
            }
        });
		return Dataman;
	}
);