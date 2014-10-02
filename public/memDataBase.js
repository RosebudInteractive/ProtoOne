if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	["./memCol", "./memObj", "./memMetaRoot", "./memMetaObj", "./memMetaObjFields", "./memMetaObjCols"],
	function(MemCollection,MemObj,MemMetaRoot,MemMetaObj,MemMetaObjFields,MemMetaObjCols) {
	
		var metaObjFieldsGuid =  "0fa90328-4e86-eba7-b12b-4fff3a057533";
		var metaObjColsGuid =  "99628583-1667-3341-78e0-fb2af29dbe8";
		var metaRootGuid =  "fc13e2b8-3600-b537-f9e5-654b7418c156";
		var metaObjGuid =  "4dcd61c3-3594-7456-fd86-5a3527c5cdcc";
	
		var MemDataBase = Class.extend({

			// Добавить корневой объект в БД
			_addRoot: function(obj,mode) {
				var root = {};
				root.obj = obj;
				root.mode = mode;
				root.subscribers = {};	// подписчики корневого объекта
				root.master = null;		// мастер
				this.pvt.robjs.push(root);
				this.pvt.rcoll[obj.getGuid()] = root;
			},
			
			// зарегистрировать объект в списке по гуидам
			_addObj: function(obj) {
				this.pvt.objs[obj.getGuid()] = obj;
			},

			// params.kind - "master" - значит мастер-база, другое значение - подчиненная база
			// params.local - true, тогда мастер-база локальная и masterConnect не передается
			// params.masterGuid - гуид мастер-базы
			// params.masterConnection - коннект к серверу с мастер-базой
			init: function(controller, params){
				var pvt = this.pvt = {};
				pvt.name = params.name;
				pvt.robjs = [];				// корневые объекты базы данных
				pvt.rcoll = {};
				pvt.objs = {};				// все объекты по гуидам
				pvt.log = [];
				pvt.$idCnt = 0;
				pvt.subscribers = {}; 		// все базы-подписчики
                pvt.guid = controller.guid();
				
				pvt.controller = controller; //TODO  если контроллер не передан, то ДБ может быть неактивна				
				pvt.controller._attachDataBase(this);
				
				if (params.kind != "master") {
						pvt.masterGuid = params.masterGuid;
						if (params.local) {
							// TODO найти базу по гуиду через контроллер
							pvt.masterGuid = params.masterGuid;
							pvt.masterDB = controller.getDbByGuid(params.masterGuid);
						}
						else {
							pvt.masterGuid = params.masterGuid;
							pvt.masterConnection = params.masterConnection;
                            controller._subscribe(this);
                        }
						this.subscribeRoot("fc13e2b8-3600-b537-f9e5-654b7418c156", function(result){
							
                            console.log('callback result:', result);
                        });
					}
				else { // master base
					pvt.masterGuid = undefined;
					// Создать объект с коллекцией метаинфо
					pvt.meta = new MemMetaRoot( { db: this },{});	
				}		
			},
			
			// Стать подписчиком базы данных
			subscribe: function(subProxy) {
				this.pvt.subscribers[subProxy.guid] = subProxy;
			},
			
			// Стать подписчиком корневого объекта с гуидом rootGuid
			onSubscribeRoot: function(subProxy, rootGuid) {
				// TODO проверить что база подписана на базу
				var obj = null;
				if (this.pvt.robjs.length > 0) 
					obj = this.pvt.rcoll[rootGuid].obj; // ВРЕМЕННО

				if (!obj) return null;
				
				// добавляем подписчика
				var g = (subProxy.dataBase) ? subProxy.dataBase.getGuid() : subProxy.guid;
				this.pvt.rcoll[rootGuid].subscribers[g] = subProxy;  // TODO из списка общих подписчиков
				
				return this.serialize(obj);
				/*
				var newObj = {};
				newObj.$sys = {};
				newObj.$sys.guid = obj.getGuid();
				newObj.$sys.typeGuid = obj.getObjType().getGuid();
				for (var i=0; i<obj.count(); i++) 
					newObj[obj.getFieldName(i)] = obj.get(i);		
				
				return newObj;
				*/
			},
			
			// "сериализация" объекта базы
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

			// ----создать подписанный корневой объект (временный вариант)
			// десериализация в объект
			deserialize: function(sobj) {
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
							var typeObj = that.getObj(sobj.$sys.typeGuid).obj;
							o = new MemObj( typeObj,parent,sobj);
							break;						
					}
					for (var cn in sobj.collections) {
						for (var co in sobj.collections[cn]) 
							ideser(that,sobj.collections[cn][co],{obj:o, colName:cn});
					}	
					return o;
				};
				// TODO пока предполагаем что такого объекта нет, но если он есть что делаем?	
				return ideser(this,sobj,{"db":this, "mode":"RW"});
			},
			
			// подписаться у мастер-базы на корневой объект, идентифицированный гуидом rootGuid
			// метод вызывается у подчиненной базы.
			subscribeRoot: function(rootGuid,callback) {
				this.pvt.controller.subscribeRoot(this,rootGuid,callback);
			},
			

			
			// вернуть ссылку на контроллер базы данных
			getController: function() {
				return this.pvt.controller;
			},
			
			getConnection: function() {
				return this.pvt.masterConnection;
			},
			
			// Вернуть название БД
			getName: function() {
				return this.pvt.name;
			},
			
			// вернуть корневой объект по его Lid
			getRoot: function(guid) {
				return this.pvt.rcoll[guid];
			},
			
			// Является ли мастер базой
			isMaster: function() {
				if (this.pvt.masterDBGuid == undefined)
					return true;
				else
					return false;
			},
			
			// вернуть мастер-базу если локальна
			getMaster: function() {
				return this.pvt.masterDB;
			},
			
			// вернуть корневой объект метаинфо
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
			
			// полуить объект по его гуиду
			getObj: function(guid) {
				return this.pvt.objs[guid];
			},
			
			// добавить новый корневой объект в мастер-базу
			newRootObj: function(objType,flds) {
				if (this.isMaster()) {
					var obj = new MemObj( objType,{"db":this, "mode":"RW"},flds);
					return obj;
				}
				else	
					return null;
			},
			
			// Сгенерировать "дельты" по логу изменений
			// (для сервера нужно будет передавать ИД подписчика)
			// возможно, надо сделать отдельный служебный класс для этого функционала
			genDeltas: function() {
				
			},
			
			// применить дельты к БД для синхронизации
			applyDeltas:function(data) {
				
			},

            // получить guid
            getGuid: function() {
                return this.pvt.guid;
            }

        });
		return MemDataBase;
	}
);