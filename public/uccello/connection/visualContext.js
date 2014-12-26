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
        '../../ProtoControls/matrixGrid','../../ProtoControls/propEditor','../../ProtoControls/dbNavigator','../../ProtoControls/dataGrid','../controls/dataset',
        '../dataman/dataRoot', '../dataman/dataContact','../dataman/dataCompany',
        '../controls/controlMgr', '../controls/aDataControl'],
    function(AComponent, AControl,
             AContainer, AButton, AEdit, AMatrixGrid, PropEditor, DBNavigator, DataGrid, Dataset, DataRoot, DataContact, DataCompany,
             ControlMgr, DataControl) {

        var Interfvc = {	
			className: "Interfvc",
			classGuid: "ed318f95-fc97-be3f-d54c-1ad707f0996c",

			loadNewRoots: "function",
			loadRoot: "function"
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
					var roots = [controller.guid(), controller.guid()]; // TODO убрать потом
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
				new AComponent(cm); new AControl(cm); new AContainer(cm);
				new AButton(cm); new AEdit(cm); new AMatrixGrid(cm);
				new PropEditor(cm); new DBNavigator(cm); new DataControl(cm); new DataGrid(cm); new Dataset(cm);
				// data
                new DataRoot(cm);	new DataContact(cm);new DataCompany(cm);
				return db;		
              
            },
			
			// добавляем новый ресурс - мастер-слейв варианты
			// params.rtype = "res" | "data"
			// params.compcb - только в случае ресурсов (может использоваться дефолтный)
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
						this.pvt.proxyServer.queryDatas(rootGuids, params.dataType, icb);
						return "XXX";
					}
				}
				else { // slave
					// вызываем загрузку нового рута у мастера
					// TODO compb на сервере не отрабатывает..
					this.pvt.vcproxy.loadNewRoots(rootGuids, { "rtype": params.rtype, "dataType": params.dataType }, function(r) { if (cb) cb(r); });
				}
			},
			
			loadRoot: function(rootGuids, cb) {				
				function innercb(result) {
					var db = that.getDB();
					var rootElem = db.deserialize(result.datas[0],{ });
					if (cb !== undefined && (typeof cb == "function")) cb({ rootGuid: rootElem.getGuid() });
				};
			
				var rg = []; // TODO временно вместо 1-го параметра (rootGuids)
				var that = this;
				rg.push(this.getDB().getController().guid());
                console.log('this.pvt.proxyServer.queryDatas(rg,innercb);', result);
				this.pvt.proxyServer.queryDatas(rg,'',innercb);
				return "XXX";
			},
			
            createComponent: function(obj, cm) {
                var g = obj.getTypeGuid();
                var params = {objGuid: obj.getGuid()};

                // DbNavigator для системной бд
                if (g == "38aec981-30ae-ec1d-8f8f-5004958b4cfa") {
                    params.dbSelector = [{'guid':this.getDB().getGuid(), 'name':'Пользовательская БД'}, {'guid':uccelloClt.getSysDB().getGuid(), 'name':'Системная БД'}];
                }

                // Grid
                if (g == "ff7830e2-7add-e65e-7ddf-caba8992d6d8") {
                    params.change = function(){
                        sendDeltas();
                        renderControls();
                    };
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