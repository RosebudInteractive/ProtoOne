if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * Модуль контекста
 * @module VisualContext
 */
define(
    ['../controls/aComponent', '../controls/aControl', '../controls/controlMgr'],
    function(AComponent, AControl, ControlMgr) {

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
				{fname: "MasterGuid", ftype: "string"},
				{fname: "ContextGuid", ftype: "string"}
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
				this.pvt.config = params.config;
				this.pvt.formParams = {};
				this.pvt.memParams = [];

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
				else // пока что считаем, что если нет финального колбэка - мы на сервере
					createCompCallback = function (obj) { 
						if (obj.getTypeGuid() == "4943ce3e-a6cb-65f7-8805-ec339555a981") { // Form Param
							obj.event.on({ 
								type: "mod", // TODO не забыть про отписку
								subscriber: that,
								callback: that._onModifParam
							});
							
							if (!that.pvt.formParams[obj.get("Name")])  // добавить в список параметров
								that.pvt.formParams[obj.get("Name")] = [];
							that.pvt.formParams[obj.get("Name")].push(obj);
						
						}
						// подписаться на событие завершения applyDelta в контроллере, чтобы переприсвоить параметры 
						controller.event.on({
							type: 'endApplyDeltas',
							subscriber: that,
							callback: that._setFormParams
						});					
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
					var roots = [params.formGuid];
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
                            that.getDB().subscribeRoots("all", cb, createCompCallback);
							that.dataBase(that.getDB().getGuid());
						});
				}

				this.contextGuid(this.getGuid());
            },
			
            /**
             * Обработчик изменения параметра
             */			
			_onModifParam: function(ev) {
				console.log("CHANGE PARAMS"+ev.field);
				//var pname = target.get("Name");
				this.pvt.memParams.push(ev.target);
				/*if (!this.pvt.formParam[pname]) return;
				for (var i=0; i<this.pvt.formParam[pname].length; i++) {
					var obj = this.pvt.formParam[pname][i];
					if (obj.get("Kind")=="in")
						this.pvt.memParams.push(obj);
				}*/
			},
			
			// отрабатывает только на сервере
			_setFormParams: function(ev) {
				for (var i=0; i<this.pvt.memParams.length; i++) {
					var obj = this.pvt.memParams[i];
					var pn = obj.get("Name");
					for (var j=0; j<this.pvt.formParams[pn].length; j++) {
						var obj2 = this.pvt.formParams[pn][j];
						if (obj2.get("Kind")=="in") obj2.set("Value",obj.get("Value"));						
					}
				}
				this.pvt.memParams = [];
				this.getDB().getController().genDeltas(this.getDB().getGuid());
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
				for (var i in this.pvt.config.controls) {
					var comp = require('../../'+this.pvt.config.controls[i].component);
					new comp(cm);
				}

				return db;
            },
			
			// "транзакции" для буферизации вызовов методов
			tranStart: function() {
				if (this.pvt.inTran) return;
				//console.log("START TRAN");
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

			contextGuid: function (value) {
                return this._genericSetter("ContextGuid", value);
            },

			getInterface: function() {
				return Interfvc;
			}
			

        });

        return VisualContext;
    });