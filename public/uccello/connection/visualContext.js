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

        var Interfvc = {	
			className: "Interfvc",
			classGuid: "ed318f95-fc97-be3f-d54c-1ad707f0996c",

			loadQuery: "function"
		}
					 
        var VisualContext = AComponent.extend(/** @lends module:VisualContext.VisualContext.prototype */{

            className: "VisualContext",
            classGuid: "d5fbf382-8deb-36f0-8882-d69338c28b56",
            metaFields: [
                {fname: "DataBase", ftype: "string"}, // runtime
				{fname: "Kind", ftype: "string"}, // , fdefault: "master" enum (master,slave
				{fname: "MasterGuid", ftype: "string"}
            ],
            metaCols: [],

             /**
             * Инициализация объекта
             * @constructs
             * @param params {object} 
			 * @callback cb - коллбэк, который вызывается после отработки конструктора (асинхронный в случае slave)
             */
            init: function(cm, params,cb) {
                this._super(cm, params);
				
				this.pvt.cmgs = {};
				this.pvt.db = null;
				
                if (params == undefined) return;
				
				this.pvt.typeGuids = params.typeGuids;
				var controller = cm.getDB().getController();
				this.pvt.rpc = params.rpc;
				this.pvt.proxyServer = params.proxyServer;
				
				var that = this;	
				var createCompCallback = null;
				if (cb)
					createCompCallback = function (obj) {
						var rootGuid = obj.getRoot().getGuid();
						if (!(that.pvt.cmgs[rootGuid]))
							that.pvt.cmgs[rootGuid] = new ControlMgr(that.getDB(),rootGuid);
						that.createComponent.apply(that, [obj, that.pvt.cmgs[rootGuid]]);
						//that.dataBase(that.getDB().getGuid());
						//if (cb !== undefined && (typeof cb == "function")) cb();
					}
					 
                //var result = this.createDb(cm.getDB().getController(), {name: "Master", kind: "master"});
				if (this.kind()=="master") { // главная (master)
				
					if (params.rpc) {
						params.rpc._publ(this, Interfvc);
						this.pvt.proxyContext = params.rpc.getProxy(this.getGuid()).proxy;
					}
					var params2 = {name: "VisualContextDB", kind: "master", cbfinal:cb};
					if (createCompCallback)
						params2.compcb = createCompCallback;
					this.pvt.db = this.createDb(controller,params2);
					this.dataBase(this.pvt.db.getGuid());
					
					//if (cb !== undefined && (typeof cb == "function")) cb();
				}
				else { // подписка (slave)
					
					if (params.rpc) {
						params.rpc._publProxy(params.vc, params.socket, Interfvc); // публикуем как прокси - гуид уникален?
						this.pvt.proxyContext = params.rpc.getProxy(params.vc).proxy;
					}

					var guid = this.masterGuid();

					this.pvt.db = controller.newDataBase({name:"Slave"+guid, proxyMaster : { connect: params.socket, guid: guid}}, function(){
                            // подписываемся на все руты
                            that.getDB().subscribeRoots("res", cb, createCompCallback);
							that.dataBase(that.getDB().getGuid());
						});
				}
                
            },

            /**
             * Создать базу данных - ВРЕМЕННАЯ ЗАГЛУШКА!
             * @param dbc
             * @param options
             * @returns {object}
             */
             createDb: function(dbc, options){
                var db = dbc.newDataBase(options);
                var roots = [dbc.guid(), dbc.guid()]; // TODO убрать потом
				// meta
				var cm = new ControlMgr(db, roots[0]);
				new AComponent(cm); new AControl(cm); new AContainer(cm);
				new AButton(cm); new AEdit(cm); new AMatrixGrid(cm);
				new PropEditor(cm); new DBNavigator(cm);	new Grid(cm);
				// data
				new DataRoot(cm);	new DataContact(cm);
				
				this.pvt.proxyServer.loadResources(roots, function(r) {
					var rootGuids = [];
					//if (!r) return;
					//if (!r.resources) return;
					for (var i=0; i<r.resources.length; i++) {
						var res=db.deserialize(r.resources[i], {db: db}, options.compcb); 
						rootGuids.push(res.getGuid());
					}
					
					//var roots = db.getRootGuids("res");
					if (options.cbfinal)
							options.cbfinal(rootGuids); 			
				});

                /*for (var i=0; i<roots.length; i++) {
					this.pvt.proxyServer.loadResource(roots[i], function(result) { 
						var res=db.deserialize(result.resource, {db: db}, options.compcb); 
						if (options.rootcb)
							options.rootcb(res.getGuid()); 
					}); 				
                }*/
				
                return db;
            },
			
            createComponent: function(obj, cm) {
                var g = obj.getTypeGuid();
                var params = {objGuid: obj.getGuid()};

                // метод обработки изменений для PropEditor
                if (g == "a0e02c45-1600-6258-b17a-30a56301d7f1") {
                    params.change = function(){
                        sendDeltas();
                        renderControls();
                    }
                    params.delete = function(){
                        sendDeltas();
                        renderControls();
                    };
                }

                // DbNavigator для системной бд
                if (g == "38aec981-30ae-ec1d-8f8f-5004958b4cfa") {
                    params.dbSelector = [{'guid':this.getDB().getGuid(), 'name':'Пользовательская БД'}, {'guid':uccelloClt.getSysDB().getGuid(), 'name':'Системная БД'}];
                    params.change = function(){
                        sendDeltas();
                        renderControls();
                    };
                }

                // Grid
                if (g == "ff7830e2-7add-e65e-7ddf-caba8992d6d8") {
                }

                new this.pvt.typeGuids[g](cm, params);
            },
			
			dispose: function(cb) {			
				if (this.kind()=="slave") {
					var controller = this.getControlMgr().getDB().getController();
					controller.delDataBase(this.pvt.db.getGuid(), cb);
				}
				else cb();
			},
			
			getDB: function() {
				return this.pvt.db;
			},
			
			getContextCM: function(guid) {
				return this.pvt.cmgs[guid];
			},
			
			
            dataBase: function (value) {
                return this._genericSetter("DataBase", value);
            },
			
			kind: function (value) {
                return this._genericSetter("Kind", value);
            },
			
			masterGuid: function (value) {
                return this._genericSetter("MasterGuid", value);
            },
			
			getInterface: function() {
				return Interfvc;
			},
			
			loadQuery: function(rootGuids, cb) {
				return this.createDataTrees(rootGuids, cb);
			},
			
			createDataTrees: function(rootGuids,cb) {
			/*
							var result = {};
                var controller = this.pvt.controller;
                var db = controller.getDB(data.dbGuid);
                var rootGuid = controller.guid();
                db.deserialize(this.loadQuery(rootGuid), {db: db});
                controller.genDeltas(db.getGuid());
                done({rootGuid:rootGuid});
			*/
				function innercb(result) {
					var db = that.getDB();
					var rootElem = db.deserialize(result.datas[0], {db: db});
					if (cb !== undefined && (typeof cb == "function")) cb({ rootGuid: rootElem.getGuid() });
				};
			
				var rg = []; // TODO временно вместо 1-го параметра (rootGuids)
				var that = this;
				rg.push(this.getDB().getController().guid());
				this.pvt.proxyServer.queryDatas(rg,innercb);
				return "XXX";
			},

        });

        return VisualContext;
    });