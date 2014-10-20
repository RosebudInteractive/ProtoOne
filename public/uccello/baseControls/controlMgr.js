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
             * @param {MemDataBase} db - база, в которой хранится метаинформация компонентов
             */
			init: function(db){	
				this.pvt = {};
				this.pvt.compByLid = {};
				this.pvt.compByGuid = {};
				this.pvt.db = db;	
			},

            /**
			 * Добавить компонент comoponent в список менеджера контролов
             * @param {AComponent} component - добавляемый компонент
             */			
			add: function(component) {
				this.pvt.compByLid[component.getLid()] = component;
				this.pvt.compByGuid[component.getGuid()] = component;
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
			}					

		});
		return ControlMgr;
	}
);