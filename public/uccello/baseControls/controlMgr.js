if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	[],
	function() {
		var ControlMgr = Class.extend({

            /**
             * @constructs
             * @param dbOrRoot {MemDataBase|MemObj} - база данных или корневой элемент
             */
			init: function(dbOrRoot){
				this.pvt = {};
				this.pvt.compByLid = {};
				this.pvt.compByGuid = {};

                if (typeof(dbOrRoot.isMaster) == "function") { // MemDataBase
                    this.pvt.db = dbOrRoot;
                } else { // MemObj
                    this.pvt.root = dbOrRoot;
					// подписаться на удаление объектов
                    dbOrRoot.getDB().getRoot(dbOrRoot.getRoot().getGuid()).event.on({
                        type: "delObj",
                        subscriber: this,
                        callback: this.onDeleteComponent
                    });
                }
			},

            /**
			 * Добавить компонент component в список менеджера контролов
             * @param component {AComponent} - добавляемый компонент
             */			
			add: function(component) {
				this.pvt.compByLid[component.getLid()] = component;
				this.pvt.compByGuid[component.getGuid()] = component;
			},


            /**
			 * Удалить компонент из менеджера контролов
             * @param guid
             */
			del: function(guid) {
                console.log('заглушка удаления: '+guid);
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
				return this.pvt.root;
			},

            /**
			 * Вернуть компонент по его гуид
             */	
			getByGuid: function(guid) {
				return this.pvt.compByGuid[guid];
			},

            /**
			 * Рендеринг компонентов интерфейса
             */				
			render: function() {
				for (var g in this.pvt.compByGuid)  // Упрощенная реализация - вызываем рендер в цикле
					this.pvt.compByGuid[g].render();
					
				for (var g in this.pvt.compByGuid) // обнуляем "измененные" поля
					this.pvt.compByGuid[g].getObj().resetModifFldLog();
			},

			onDeleteComponent: function(result) {
				delete this.pvt.compByGuid[result.target.getGuid()];
			}


		});
		return ControlMgr;
	}
);