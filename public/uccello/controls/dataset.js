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
                {fname: "Active", ftype: "boolean"},
                {fname: "Master", ftype: "string"}
            ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             */
            init: function(cm, params) {
                this._super(cm,params);
                this.pvt.params = params;
				this.pvt.dataObj = null;
				
				
				this.event = new Event();
				
            },
			
			subsInit: function() {
				var m = this.master(); // подписаться на обновление данных мастер датасета
				if (m) {
					this.getControlMgr().get(m).event.on({
						type: 'refreshData',
						subscriber: this,
						callback: function(){ this._dataInit(false); }
					});
				}
			},
			
			dataInit: function() {
				this._dataInit(true)
			},
			
			_dataInit: function(onlyMaster) {
			
				function icb() {				
					function refrcb() {
						this._initCursor();
						this.event.fire({
							type: 'refreshData',
							target: this				
						});	
						
					}			
					that.getControlMgr().userEventHandler(that, refrcb );
				}
			
				
				var rg = this.root();
				if (rg) {
					var dataRoot = this.getControlMgr().getDB().getRoot(rg);
					if (!dataRoot) {
						if (onlyMaster && (this.master())) return; // если НЕ мастер, а детейл, то пропустить
						var that = this;
						var params = {rtype:"data"};
						if (this.master()) { // если детейл, то экспрешн
							params.expr = this.getControlMgr().get(this.master()).getField("Id");
						}
						this.getControlMgr().getContext().loadNewRoots([rg],params, icb);
					}
					else this._initCursor();
				}
			},	

			_initCursor: function() {
				var rg = this.root();
				if (rg) {
					var dataRoot = this.getControlMgr().getDB().getObj(rg);
					if (dataRoot) {
						var col = dataRoot.getCol("DataElements");
						if (col.count()>0) this.cursor(col.get(0).get("Id")); 
					}
				}
			},

			getField: function(name) {
				if (this.pvt.dataObj)
					return this.pvt.dataObj.get(name);
				else
					return undefined;
				
			},

			// Properties

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
                var r=this._genericSetter("Cursor", value);
				console.log("SET CuRSOR");
				if (value) 
				 this.pvt.dataObj =  this.getControlMgr().getDB().getObj(this.root()).getCol("DataElements").getObjById(value); // TODO поменять потом
				return r;
            },

            active: function (value) {
                return this._genericSetter("Active", value);
            },

            master: function (value) {
                return this._genericSetter("Master", value);
            }

        });
        return Dataset;
    }
);