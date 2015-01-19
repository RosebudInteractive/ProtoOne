if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль контекста
 * @module VisualContext
 */
define(
    ['../controls/aComponent', '../controls/aControl', '../controls/controlMgr', '../../config/config'],
    function(AComponent, AControl, ControlMgr, Config) {

        var Interfvc = {	
			className: "Interfvc",
			classGuid: "ed318f95-fc97-be3f-d54c-1ad707f0996c",

			loadNewRoots: "function"
			//loadRoot: "function"
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
				this.pvt.tranQueue = null; // очередь выполнения методов если в транзакции
				this.pvt.inTran = false; // признак транзакции

                if (params == undefined) return;
				
				this.pvt.typeGuids = params.typeGuids;
				var controller = cm.getDB().getController();
				this.pvt.rpc = params.rpc;
				this.pvt.proxyServer = params.proxyServer;
				this.pvt.components = params.components;

				var that = this;	
				var createCompCallback = null;
				if (cb)
					createCompCallback = function (obj) {
						var rootGuid = obj.getRoot().getGuid();
						if (!(that.pvt.cmgs[rootGuid]))
							that.pvt.cmgs[rootGuid] = new ControlMgr(that.getDB(),rootGuid,that);
						that.createComponent.apply(that, [obj, that.pvt.cmgs[rootGuid]]);						
						controller.setDefaultCompCallback(createCompCallback); 
					}
					 
				if (this.kind()=="master") { // главная (master)
				
					if (params.rpc) {
						params.rpc._publ(this, Interfvc);
						this.pvt.proxyContext = params.rpc.getProxy(this.getGuid()).proxy;
					}
					this.pvt.vcproxy = params.rpc._publ(this, this.getInterface());
					var params2 = {name: "VisualContextDB", kind: "master", cbfinal:cb};
					if (createCompCallback)
						params2.compcb = createCompCallback;
					this.pvt.db = this.createDb(controller,params2);
					//var roots = [controller.guid(), controller.guid()]; // TODO убрать потом
					var roots = [controller.guid()];
					this.loadNewRoots(roots, { rtype: "res", compcb: params2.compcb},params2.cbfinal);
					this.dataBase(this.pvt.db.getGuid());
				}
				else { // подписка (slave)
				
					this.pvt.vcproxy = params.rpc._publProxy(params.vc, params.socket,this.getInterface());
					
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
                
				// meta
				var cm = new ControlMgr(db, null /*roots[0]*/);
				new AComponent(cm); new AControl(cm);

				// другие компоненты
				for (var i = 0; i < Config.controls.length; i++) {
					var comp = require('../../../public/'+Config.controls[i].component);
					new comp(cm);
				}

				return db;
            },
			
			//
			tranStart: function() {
				if (this.pvt.inTran) return;
				console.log("START TRAN");
				this.pvt.inTran = true;
				this.pvt.tranQueue = [];
			},
			
			tranCommit: function() {
				if (this.pvt.inTran) {
					for (var i=0; i<this.pvt.tranQueue.length; i++) {
						var mc = this.pvt.tranQueue[i];
						mc.method.apply(mc.context,mc.args);
					}
					this.pvt.tranQueue = null;
					this.pvt.inTran = false;
				}
			},
			
			inTran:function() {
				return this.pvt.inTran;
			},
			
			//
			execMethod: function(context, method,args) {
				if (this.inTran()) 
					this.pvt.tranQueue.push({context:context, method:method, args: args});
				else method.apply(context,args);
			},
			
			
			//
			
			// добавляем новый набор данных - мастер-слейв варианты
			// params.rtype = "res" | "data"
			// params.compcb - только в случае ресурсов (может использоваться дефолтный)
			// params.expr - выражение для данных
			loadNewRoots: function(rootGuids,params, cb) {
				var that = this;
				if (this.kind()=="master") {
				
					function icb(r) {
							var res = that.getDB().addRoots(r.datas, params.compcb);
							if (cb) cb({guids:rootGuids});  
					}
								
					if (params.rtype == "res") {
						this.pvt.proxyServer.loadResources(rootGuids, icb);	
						return "XXX";
					}
					if (params.rtype == "data") {
						this.pvt.proxyServer.queryDatas(rootGuids, params.expr, icb);
						//this.execMethod(this.pvt.proxyServer,this.pvt.proxyServer.queryDatas,[rootGuids, params.expr, icb]);
						return "XXX";
					}
				}
				else { // slave
					// вызываем загрузку нового рута у мастера
					// TODO compb на сервере не отрабатывает..
					//this.pvt.vcproxy.loadNewRoots(rootGuids, params, function(r) { if (cb) cb(r); });
					this.execMethod(this.pvt.vcproxy,this.pvt.vcproxy.loadNewRoots, [rootGuids,params,function(r) { if (cb) cb(r); }]);
				}
			},

			
            createComponent: function(obj, cm) {
                var g = obj.getTypeGuid();
				var className = cm.getDB().getObj(g).get("typeName");
                var params = {objGuid: obj.getGuid()};

                // DbNavigator выбор базы
                if (g == "38aec981-30ae-ec1d-8f8f-5004958b4cfa") {
                    params.dbSelector = [{'guid':this.getDB().getGuid(), 'name':'Пользовательская БД'}, {'guid':uccelloClt.getSysDB().getGuid(), 'name':'Системная БД'}];
                }

				new (this.getComponent(className).module)(cm, params);
            },

			getComponent: function(className){
				return this.pvt.components[className];
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
			
			getProxy: function() {
				return this.pvt.vcproxy;
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
			}
			

        });

        return VisualContext;
    });