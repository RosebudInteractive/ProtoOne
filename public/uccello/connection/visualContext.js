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

			//loadRes1: "function",
			attachRes: "function"
		}
		
		/*Interf.extend({
		
			className: "Interfvc",
			classGuid: "ed318f95-fc97-be3f-d54c-1ad707f0996c",

			loadRes1:function(i) {},
			attachRes: function(guid) {}
		});*/
			 
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
				var createCompCallback = undefined;
				if (params.callback)
					createCompCallback = function (obj) {
						var rootGuid = obj.getRoot().getGuid();
						if (!(that.pvt.cmgs[rootGuid]))
							that.pvt.cmgs[rootGuid] = new ControlMgr(that.getDB(),rootGuid);
						that.createComponent.apply(that, [obj, that.pvt.cmgs[rootGuid]]);
						that.dataBase(that.getDB().getGuid());
						if (cb !== undefined && (typeof cb == "function")) cb();
					}
					 
                //var result = this.createDb(cm.getDB().getController(), {name: "Master", kind: "master"});
				if (this.kind()!="slave") { // главная (master)
				
					if (params.rpc) {
						params.rpc._publ(this, Interfvc);
						this.pvt.proxyContext = params.rpc.getProxy(this.getGuid()).proxy;
					}
				
					this.pvt.db = this.createDb(controller, {name: "VisualContextDB", kind: "master", rootcb:params.callback, compcb: createCompCallback});
					this.dataBase(this.pvt.db.getGuid());
					
					if (cb !== undefined && (typeof cb == "function")) cb();
				}
				else { // подписка (slave)
					
					if (params.rpc) {
						params.rpc._publProxy(params.vc, params.socket, Interfvc); // публикуем как прокси - гуид уникален?
						this.pvt.proxyContext = params.rpc.getProxy(params.vc).proxy;
					}
					
					//test
					/*
					var pholder=params.rpc.getProxy(params.vc);
					pholder.proxy.loadRes1(4,function(result) 
					{ console.log("callback proxy1"+result); } );
					*/
					var guid = this.masterGuid();

					this.pvt.db = controller.newDataBase({name:"Slave"+guid, proxyMaster : { connect: params.socket, guid: guid}}, function(){
                            // подписываемся на все руты
                            that.getDB().subscribeRoots("res", params.callback,createCompCallBack);
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
                var roots = [dbc.guid(), dbc.guid()];
				// meta
				var cm = new ControlMgr(db, roots[0]);
				new AComponent(cm); new AControl(cm); new AContainer(cm);
				new AButton(cm); new AEdit(cm); new AMatrixGrid(cm);
				new PropEditor(cm); new DBNavigator(cm);	new Grid(cm);
				// data
				new DataRoot(cm);	new DataContact(cm);
				
                for (var i=0; i<roots.length; i++) {
					//var result=this.pvt.proxyContext.loadRes1(roots[i]);
					// db.deserialize(result.resource, {db: db});
					this.pvt.proxyServer.loadResource(roots[i], function(result) { 
						var res=db.deserialize(result.resource, {db: db}, options.compcb); 
						options.rootcb(res.getGuid()); 
					}); 				
                    //db.deserialize(this.loadRes(roots[i]), {db: db});
                }
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
                    params.db = this.getDB(); //this.pvt.dbcontext;//this.getSysDB(); //myApp.dbsys;
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


			
			
			/*
			loadResource: function(guidRoot, cb) {
				if (this.kind() == "slave") {
					// TODO загрузка в базу контекста только на мастер-контексте!
				}
				else {
					if (server) { // server side
						var db = this.getDB();
						db.deserialize(this.loadRes(guidRoot), {db: db});						
					}
					else { // client side
						//this.
					}
				}
			},*/
			/*
			loadRes1: function(guidRoot) {
				return { resource: this.loadRes(guidRoot) };
			},*/


        });

        return VisualContext;
    });