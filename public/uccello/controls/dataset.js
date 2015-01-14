if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['./aComponent', '../system/event'],
    function(AComponent,Event) {
        var Dataset = AComponent.extend({

            className: "Dataset",
            classGuid: "3f3341c7-2f06-8d9d-4099-1075c158aeee",
            metaFields: [
                {fname: "Root", ftype: "string"},
                {fname: "Cursor", ftype: "string"},
                {fname: "Active", ftype: "boolean"}
            ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                this._super(cm,params);
                this.params = params;
				
				this.event = new Event();
				
            },
			
			dataInit: function() {
			
				function icb() {
				
					function refrcb() {
						this.event.fire({
							type: 'refreshData',
							target: this				
						});	
					}
				
					//console.log("render dataset FALSE");
					that.getControlMgr().userEventHandler(that, refrcb );
				}
			
				var rg = this.root();
				if (rg) {
					var dataRoot = this.getControlMgr().getDB().getRoot(rg);
					if (!dataRoot) {
						var that = this;
						this.getControlMgr().getContext().loadNewRoots([rg],{rtype:"data"}, icb);
					}
				}
			},

            root: function (value) {
			
				var oldVal = this._genericSetter("Root");
				var newVal = this._genericSetter("Root", value);
				
				if (newVal!=oldVal) {
				this.event.fire({
                    type: 'refreshData',
                    target: this				
					});	
				}
			
                return newVal;
            },

            cursor: function (value) {
                return this._genericSetter("Cursor", value);
            }

        });
        return Dataset;
    }
);