if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memProtoObj','./memCol'],
	function(MemProtoObj,MemCol) {
		var MemMetaObj = MemProtoObj.extend({
		
			init: function(db, flds){
			
				this._super(null,{ "db": db }); 
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
				
				//if (!parent.obj) {	// корневой объект
				this._db = db;
				this._db._addRoot(this);

				// запомнить родительский класс
				/*if (flds.parentClass)
					this._parentClass = flds.parentClass;
				else 
					this._parentClass = null;
*/
				
			},
			
			// сделать таблицу элементов с учетом наследования
			_bldElemTable: function() {
				this._fieldsTable = {};
				var n = this.countParentClass();
				var k=0;
				for (var i=0; i<n; i++) {
					var c = this.getParentClass(n-i);
					for (var j=0; j<c.getCol("fields").count(); j++)
						this._fieldsTable[c.getCol("fields").get(j).get("fname")]= { "obj": c, "idx": j, "cidx":k++ };
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
			
			// получить коллекцию по имени
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