if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./viewset'],
	function(ViewSet) {
		var ControlMgr = Class.extend({

            /**
             * @constructs
             * @param db {MemDataBase} - база данных
			 * @param rootGuid - гуид рутового элемента
             */
			init: function(db, rootGuid){
				this.pvt = {};
				this.pvt.compByLid = {};
				this.pvt.compByGuid = {};
				this.pvt.compByName = {};
				this.pvt.afterInitFlag = false;
				this.pvt.db = db;
				this.pvt.rootGuid = rootGuid;
				this.pvt.viewSets = [this.createViewSet({path:'./ProtoControls/simpleview/'})];
                this.pvt.asd = true;
				if (rootGuid) {
					if (db.getObj(rootGuid)==undefined) {
						db.event.on( {
							type: "newRoot",
							subscriber: this,
							callback: this.onNewRoot
						});
					}
				}
                    
/*                } else { // MemObj
                    this.pvt.root = dbOrRoot;
					// подписаться на удаление объектов
                    dbOrRoot.getDB().getRoot(dbOrRoot.getRoot().getGuid()).event.on({
                        type: "delObj",
                        subscriber: this,
                        callback: this.onDeleteComponent
                    });
                }*/
			},
			
			afterInit: function() {
				var c = this.getRoot();

				for (var g in this.pvt.compByGuid)
					this.pvt.compByGuid[g].afterInit();
					
				this.pvt.afterInitFlag =true;
			},

            /**
			 * Добавить компонент component в список менеджера контролов
             * @param component {AComponent} - добавляемый компонент
             */			
			add: function(component) {
				this.pvt.compByLid[component.getLid()] = component;
				this.pvt.compByGuid[component.getGuid()] = component;
				if (component.name())
					this.pvt.compByName[component.name()] = component;
			},


            /**
			 * Удалить компонент из менеджера контролов
             * @param guid
             */
			del: function(guid) {
				var c = this.get(guid);
				delete this.pvt.compByLid[c.getLid()];
				delete this.pvt.compByGuid[c.getGuid()];
				c.getParent()._delChild(c.getObj().getColName(),c.getObj());
			},

            /**
             * Переместить контрол
             * @param guid
             */
            move: function(guid, parentGuid) {
                console.log('заглушка перемещения контрола: '+guid+' в '+parentGuid)
            },

			// временно
			_getCompGuidList: function() {
				return this.pvt.compByGuid;
			},
			
            /**
			 * Вернуть базу данных, с которой связан менеджер контролов
             */					
			getDB: function() {
				return this.pvt.db;
			},

            /**
			 * Вернуть корневой объект, с которым связан менеджер контролов
             */				
			getRoot: function() {
				if (this.pvt.rootGuid==undefined)
					return undefined;
				else
					return this.get(this.pvt.rootGuid); //this.getDB().getObj(this.pvt.rootGuid);
			},

            /**
			 * Вернуть компонент по его гуид
             */	
			getByGuid: function(guid) {
				return this.pvt.compByGuid[guid];
			},
			
			get: function(guid) {
				return this.pvt.compByGuid[guid];
			},
			
			getByName: function(name) {
				return this.pvt.compByName[name];
			},
			
			
			processDelta: function() { // ВРЕМЕННЫЙ ВАРИАНТ
				for (var g in this.pvt.compByGuid) this.pvt.compByGuid[g].processDelta(); 
			},

            /**
			 * Рендеринг компонентов интерфейса
			 *  @param component - корневой элемент, с которого запускается рендеринг, если undef, то с корня
             */				
			render: function(component, options) {
			
				if (!this.pvt.afterInitFlag) this.afterInit(); // если не выполнена постинициализация, то запустить
				
				this.processDelta();
			
				var c = (component === undefined) ? this.getRoot()  : component;
				if (c.getRoot() != this.getRoot()) return;

                for(var i in this.pvt.viewSets)
                if (this.pvt.viewSets[i].enable())
                    this.pvt.viewSets[i].render(c, options);

					
				for (var g in this.pvt.compByGuid) { //TODO нужно это делать не для всех компонентов или рендерить всегда с рута
					this.pvt.compByGuid[g].getObj().resetModifFldLog();	// обнуляем "измененные" поля в объектах 
					this.pvt.compByGuid[g]._isRendered(true);			// выставляем флаг рендеринга
				}
			},

			onDeleteComponent: function(result) {
				delete this.pvt.compByGuid[result.target.getGuid()];
			},
			
			onNewRoot: function(result) {
				if (result.target.getGuid() == this.pvt.rootGuid) {
	                    this.getDB().getRoot(this.pvt.rootGuid).event.on({
							type: "delObj",
							subscriber: this,
							callback: this.onDeleteComponent
                    });				
					
				}
				
			},

            createViewSet: function(ini) {
                return new ViewSet(this, ini);
            },

            /**
             * Рассылка дельт и рендер
             * @param context Контекст в котором запускается колбек
             * @param cb {function} Колбек
             * @param args {object} Аргумент колбека
             */
            userEventHandler: function(context, cb, args) {
                var nargs = [];
                if (args) nargs = [args];
                if (cb) cb.apply(context, nargs);
                if (this.autoSendDeltas())
                    this.getDB().getController().genDeltas(this.getDB().getGuid());
                this.render(undefined);
            },

            /**
             * Параметр автоотсылки дельт
             * @param value {boolean}
             * @returns {boolean}
             */
            autoSendDeltas: function(value) {
                if (value !== undefined)
                    this.pvt.asd = value;
                return this.pvt.asd;
            }

		});
		return ControlMgr;
	}
);