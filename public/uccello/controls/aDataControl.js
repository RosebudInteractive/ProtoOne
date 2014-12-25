if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./aControl'],
	function(AControl) {
		var ADataControl = AControl.extend({
		
			className: "ADataControl",
			classGuid: "b2c132fd-c6bc-b3c7-d149-27a926916216",
            metaFields: [{fname: "Dataset", ftype: "string"}],
				
			init: function(cm,params){
				this._super(cm,params);
				
			},
			
			afterInit: function() {
				this._subsDataSet();
			},
			
			processDelta: function() {
				var dsg = this.dataset(); 
				if (dsg) {
					var dso = this.getControlMgr().get(dsg).getObj();
					if (dso.isFldModified("Root")) this._isRendered(false);
				}
					
			},
			
			_subsDataSet: function() {
				var dsg = this.dataset(); // TODO перенести это свойство в ДатаКонтрол
				if (dsg) {
					this.getControlMgr().get(dsg).event.on({
						type: 'refreshData',
						subscriber: this,
						callback: function(){ this._isRendered(false); }
					});
				}
			},

            dataset: function (value) {
                return this._genericSetter("Dataset", value);
            }


        });
		return ADataControl;
	}
);