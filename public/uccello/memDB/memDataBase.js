if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

/**
 * База данных
 * @module MemDataBase
 */
define(
	["./memCol", "./memObj", "./memMetaRoot", "./memMetaObj", "./memMetaObjFields", "./memMetaObjCols"],
	function(MemCollection,MemObj,MemMetaRoot,MemMetaObj,MemMetaObjFields,MemMetaObjCols) {
	
		var metaObjFieldsGuid =  "0fa90328-4e86-eba7-b12b-4fff3a057533";
		var metaObjColsGuid =  "99628583-1667-3341-78e0-fb2af29dbe8";
		var metaRootGuid =  "fc13e2b8-3600-b537-f9e5-654b7418c156";
		var metaObjGuid =  "4dcd61c3-3594-7456-fd86-5a3527c5cdcc";
	
		var MemDataBase = Class.extend(/** @lends module:MemDataBase.MemDataBase.prototype */{

            /**
             * Добавить корневой объект в БД
             * @param obj
             * @param mode
             * @private
             */
			_addRoot: function(obj,mode) {
				var root = {};
				root.obj = obj;
				root.mode = mode;
				root.subscribers = {};	// подписчики корневого объекта
				root.master = null;		// мастер
				root.callbackNewObject = undefined;
				this.pvt.robjs.push(root);
				this.pvt.rcoll[obj.getGuid()] = root;
			},
			
            /**
             * зарегистрировать объект в списке по гуидам
             * @param obj
             * @private
             */
			_addObj: function(obj) {
				this.pvt.objs[obj.getGuid()] = obj;
			},

            /**
             * addLogItem description
             * @param item
             * @private
             */
			_addLogItem: function(item) {
				this.pvt.logIdx.push(item);
			},


            /**
             * buildMetaTables description
             * @private
             */
			_buildMetaTables: function() {
				var metacol = this.getMeta().getCol("MetaObjects");
				for (var i=0; i<metacol.count(); i++) {
					var o = metacol.get(i);
					if (o.pvt.fieldsTable == undefined)
						o._bldElemTable();					
				}
			},
			
			_cbSetNewObject: function(rootGuid,callback) {
				this.getRoot(rootGuid).callbackNewObject = callback;
			},
			
			_cbGetNewObject: function(rootGuid) {
				return this.getRoot(rootGuid).callbackNewObject;
			},

            /**
             * params.kind - "master" - значит мастер-база, другое значение - подчиненная база
             * params.proxyMaster
             * @constructs
             * @param controller
             * @param params
             * @param cb
             */
			init: function(controller, params, cb){
				var pvt = this.pvt = {};
				pvt.name = params.name;
				pvt.robjs = [];				// корневые объекты базы данных
				pvt.rcoll = {};
				pvt.objs = {};				// все объекты по гуидам
				pvt.logIdx = [];			// упорядоченный индекс логов
				pvt.$idCnt = 0;
				pvt.subscribers = {}; 		// все базы-подписчики
				if ("guid" in params)
					pvt.guid = params.guid;
				else
					pvt.guid = controller.guid();
				pvt.counter = 0;

				
				pvt.controller = controller; //TODO  если контроллер не передан, то ДБ может быть неактивна				
				pvt.controller.createLocalProxy(this);
				
				if (params.kind != "master") {
					var db=this;
					controller._subscribe(this,params.proxyMaster, function() {
						pvt.proxyMaster = controller.getProxy(params.proxyMaster.guid);
						controller.subscribeRoot(db,"fc13e2b8-3600-b537-f9e5-654b7418c156", function(){
								db._buildMetaTables();
								//console.log('callback result:', result);
								if (cb !== undefined && (typeof cb == "function")) cb();
							});
						});

					}
				else { // master base
					// Создать объект с коллекцией метаинфо
					pvt.meta = new MemMetaRoot( { db: this },{});
					if (cb !== undefined && (typeof cb == "function")) cb(this);
				}		
				
			},

            /**
             * подписаться у мастер-базы на корневой объект, идентифицированный гуидом rootGuid
             * метод вызывается у подчиненной (slave) базы.
             * @param rootGuid
             * @param callback - вызывается после того, как подписка произошла и данные сериализовались в базе
			 * @param callback2 - вызывается по ходу создания объектов
             */
			subscribeRoot: function(rootGuid,callback,callback2) {
				this.pvt.controller.subscribeRoot(this,rootGuid,callback,callback2);
			},
			
            /**
             * Стать подписчиком базы данных
             * @param proxy
             */
			onSubscribe: function(proxy) {
				//var g = (proxy.db) ? proxy.dataBase.getGuid() : proxy.guid;
				this.pvt.subscribers[proxy.guid] = proxy;
			},

            /**
             * isSubscribed
             * @param dbGuid
             * @returns {object|null}
             */
			isSubscribed: function(dbGuid) {
				var s= this.pvt.subscribers[dbGuid];
				return (s) ? s : null;
			},

            /**
             * onUnsubscribe
             * @param connectId
             */
			onUnsubscribe: function(connectId) {
				//var g = (subProxy.dataBase) ? subProxy.dataBase.getGuid() : subProxy.guid;
				for (var g in this.pvt.subscribers) {
					var p = this.pvt.subscribers[g];
					if (p.connect.getId() == connectId)
						delete this.pvt.subscribers[g]; // убрать из общего списка подписчиков
				}
				for (g in this.pvt.rcoll) {
					var p=this.pvt.rcoll[g];
					for (var g2 in p.subscribers) {
						if (p.subscribers[g2].connect.getId() == connectId) 
							delete p.subscribers[g2];
						
					}
				}
				// TODO удалить из остальных мест
				
			},
			
            /**
             * Стать подписчиком корневого объекта с гуидом rootGuid
             * @param dbGuid
             * @param rootGuid
             * @returns {*}
             */
			onSubscribeRoot: function(dbGuid, rootGuid) {
				// TODO проверить что база подписана на базу
				var obj = null;
				if (this.pvt.robjs.length > 0) 
					obj = this.pvt.rcoll[rootGuid].obj; // ВРЕМЕННО

				if (!obj) return null;
				
				// добавляем подписчика
				//var g = (subProxy.dataBase) ? subProxy.dataBase.getGuid() : subProxy.guid;
				var subProxy = this.pvt.subscribers[dbGuid];
				if (subProxy) {
					this.pvt.rcoll[rootGuid].subscribers[dbGuid] = subProxy;  // TODO из списка общих подписчиков
					return this.serialize(obj);
					}
				else 
					return null;
			},
			
            /**
             * "сериализация" объекта базы
             * @param {object} obj
             * @returns {*}
             */
			serialize: function(obj) {
				// проверить, что объект принадлежит базе
				if (!("getDB" in obj) || (obj.getDB()!=this)) return null;
				
				var newObj = {};
				newObj.$sys = {};
				newObj.$sys.guid = obj.getGuid();
				/*if (obj.getObjType()) // obj
					newObj.$sys.typeGuid = obj.getObjType().getGuid();
				else // meta obj
					newObj.$sys.typeGuid = "12345";*/
				newObj.$sys.typeGuid = obj.getTypeGuid();
				// поля объекта TODO? можно сделать сериализацию в более "компактном" формате, то есть "массивом" и без названий полей
				newObj.fields = {};
				for (var i=0; i<obj.count(); i++) 
					newObj.fields[obj.getFieldName(i)] = obj.get(i);		
				// коллекции
				newObj.collections = {};
				for (i=0; i<obj.countCol(); i++) {
					var cc=obj.getCol(i);
					var cc2=newObj.collections[cc.getName()] = {};
					for (var j=0; j<cc.count(); j++) {
						var o2=this.serialize(cc.get(j));
						cc2[j] = o2;
					}
				}					
				return newObj;	// TODO? делать stringify тут?
			},

            /**
             * ----создать подписанный корневой объект (временный вариант)
             * десериализация в объект
             * @param {object} sobj - объект который нужно десериализовать
			 * @param {object} parent - родительский "объект" - либо parent.db для корневых либо parent.obj, parent.colName
			 * @callback cb - вызов функции, которая выполняет доп.действия после создания объекта
             * @returns {*}
             */
			deserialize: function(sobj,parent,cb) {
				function ideser(that,sobj,parent) {
					
					switch (sobj.$sys.typeGuid) {
						case metaObjFieldsGuid:
							var o = new MemMetaObjFields(parent,sobj);
							break;
						case metaObjColsGuid:
							o = new MemMetaObjCols(parent,sobj);
							break;
						case metaRootGuid:
							//o = that.getObj(metaRootGuid);
							that.pvt.meta = new MemMetaRoot(parent,sobj);
							o = that.pvt.meta;
							break;
						case metaObjGuid:
							o = new MemMetaObj(parent,sobj);
							break;
						default:
							var typeObj = that.getObj(sobj.$sys.typeGuid); //.obj;
							if ("db" in parent) parent.nolog=true;
							o = new MemObj( typeObj,parent,sobj);
							if (cb!==undefined) cb(o);
							break;						
					}
					for (var cn in sobj.collections) {
						for (var co in sobj.collections[cn]) 
							ideser(that,sobj.collections[cn][co],{obj:o, colName:cn});
					}	
					return o;
				};
				// TODO пока предполагаем что такого объекта нет, но если он есть что делаем?	
				if ("obj" in parent) parent.obj.getLog().setActive(false); // отключить лог на время десериализации
				var res = ideser(this,sobj,parent);
				//if ("obj" in parent) 
				res.getLog().setActive(true);
				return res; 
			},
						
            /**
             * вернуть ссылку на контроллер базы данных
             * @returns {*}
             */
			getController: function() {
				return this.pvt.controller;
			},
			
			/*getConnection: function() {
				return this.pvt.masterConnection;
			},*/
			
            /**
             * Вернуть название БД
             * @returns {*}
             */
			getName: function() {
				return this.pvt.name;
			},

            /**
             * countRoot
             * @returns {Number}
             */
			countRoot: function() {
				return this.pvt.robjs.length;
			},
			
            /**
             * вернуть корневой объект по его Guid или по порядковому номеру
             * @param {number} id
             * @returns {*}
             */
			getRoot: function(id) {
				if (typeof id == "number")
					return this.pvt.robjs[id];
				else
					return this.pvt.rcoll[id];
			},
			
            /**
             * Является ли мастер базой
             * @returns {boolean}
             */
			isMaster: function() {
				if (this.pvt.proxyMaster == undefined)
					return true;
				else
					return false;
			},
			
            /**
             * вернуть мастер-базу если локальна
             * @returns {dbsl.proxyMaster|*|dbs2.proxyMaster}
             */
			getProxyMaster: function() {
				return this.pvt.proxyMaster;
			},
			
            /**
             * вернуть корневой объект метаинфо
             * @returns {key.meta|*|memMetaRoot}
             */
			getMeta: function() {
				return this.pvt.meta;
			},
			
            /**
             * Получить следующий local id
             * @returns {number}
             */
			getNewLid: function() {  // TODO сделать DataBaseController и перенести туда?
				return this.pvt.$idCnt++;
			},

            /**
             * вернуть счетчик изменения для БД (в логе)
             * @returns {number}
             */
			getNewCounter: function() {
				return this.pvt.counter++;
			},
			
            /**
             * полуить объект по его гуиду
             * @param {string} guid
             * @returns {*}
             */
			getObj: function(guid) {
				return this.pvt.objs[guid];
			},
			
            /**
             * добавить новый корневой объект в мастер-базу
             * @param {object} objType
             * @param {object} flds
             * @returns {*}
             */
			newRootObj: function(objType,flds) {
				if (this.isMaster()) {
					var obj = new MemObj( objType,{"db":this, "mode":"RW"},flds);
					return obj;
				}
				else	
					return null;
			},
			
            /**
             * Сгенерировать "дельты" по логу изменений
             * (для сервера нужно будет передавать ИД подписчика)
             * возможно, надо сделать отдельный служебный класс для этого функционала
             * @returns {Array}
             */
			genDeltas: function() {
				var allDeltas = [];
				for (var i=0; i<this.countRoot(); i++) {
					var d=this.getRoot(i).obj.getLog().genDelta();
					if (d!=null)
						allDeltas.push({ rootGuid: this.getRoot(i).obj.getGuid(), content: d });
				}
				
				return allDeltas;

			},
			
            /**
             * применить дельты к БД для синхронизации
             * @param data
             */
			applyDeltas:function(data) {
				
			},

            /**
             * получить guid
             * @returns {guid}
             */
            getGuid: function() {
                return this.pvt.guid;
            }
        });
		return MemDataBase;
	}
);