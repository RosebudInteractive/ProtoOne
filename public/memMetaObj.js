if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj','./memCol'],
	function(MemProtoObj,MemCol) {
		var MemMetaObj = MemProtoObj.extend({
		
			init: function(db, flds){
						
				this._super(null,{ "db": db },flds); 
				this._fields.push(flds.typeName); // TODO проверка наличия с пустой инициализацией
				this._fields.push(flds.parentClass);
				
				this._ancestors = [];
				this._ancestors.push(this);
				var parent = flds.parentClass;
				while (parent) {
					this._ancestors.push(parent);
					parent = parent.getParentClass();
				}
				
				// инициализируем коллекции для метаинфо - описание полей и описание коллекций
				this._collections.push(new MemCol("fields",this));
				this._collections.push(new MemCol("cols",this));
			},
			
			// сделать таблицу элементов с учетом наследования
			_bldElemTable: function() {
				this._fieldsTable = {};
				this._fieldsArr = [];
				var n = this.countParentClass();
				var k=0;
				for (var i=0; i<n; i++) {
					var c = this.getParentClass(n-i-1);
					for (var j=0; j<c.getCol("fields").count(); j++) {
						var name = c.getCol("fields").get(j).get("fname");
						this._fieldsTable[name]= { "obj": c, "idx": j, "cidx":k++ };
						this._fieldsArr.push(name);
					}
				}
			},
			
			// получить класс-предок 
			// i=0 this, i=1 parent, i=2 parent+1
			getParentClass: function(i) {
				var i1 = 1;
				if (i!==undefined) i1=i;
				if ((this._ancestors.length-1)>=i1)
					return this._ancestors[i1];
				else
					return null;
				//return this._fields[1];
			},
			
			countParentClass: function() {
				return this._ancestors.length;
			},
			
			// получить коллекцию по имени ---- в МЕМОБЖ
			getCol: function(colName) {
				if (colName == "fields")
					return this._collections[0]; 
				if (colName == "cols")
					return this._collections[1];
				return null;
			},
			
			// получить индекс элемента коллекции с учетом наследования
			getIdxElem: function() {
				
			}
			

		});
		return MemMetaObj;
	}
);