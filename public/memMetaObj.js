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
				this.pvt.fields.push(flds.fields.typeName); // TODO проверка наличия с пустой инициализацией
				this.pvt.fields.push(flds.fields.parentClass);
				
				this.pvt.ancestors = [];
				this.pvt.ancestors.push(this);
				var parent = flds.fields.parentClass;
				while (parent) {
					this.pvt.ancestors.push(parent);
					parent = parent.getParentClass();
				}
				
				// инициализируем коллекции для метаинфо - описание полей и описание коллекций
				new MemCol("fields",this);
				new MemCol("cols",this);
				
				this.finit();

				//this.pvt.collections.push(new MemCol("fields",this));
				//this.pvt.collections.push(new MemCol("cols",this));
			},
			
			// сделать таблицу элементов с учетом наследования
			_bldElemTable: function() {
				var pvt = this.pvt;
				pvt.fieldsTable = {};
				pvt.fieldsArr = [];
				var n = this.countParentClass();
				var k=0;
				for (var i=0; i<n; i++) {
					var c = this.getParentClass(n-i-1);
					for (var j=0; j<c.getCol("fields").count(); j++) {
						var name = c.getCol("fields").get(j).get("fname");
						pvt.fieldsTable[name]= { "obj": c, "idx": j, "cidx":k++ };
						pvt.fieldsArr.push(name);
					}
				}
			},
			
			// получить класс-предок 
			// i=0 this, i=1 parent, i=2 parent+1
			getParentClass: function(i) {
				var i1 = 1;
				if (i!==undefined) i1=i;
				if ((this.pvt.ancestors.length-1)>=i1)
					return this.pvt.ancestors[i1];
				else
					return null;
				//return this._fields[1];
			},
			
			countParentClass: function() {
				return this.pvt.ancestors.length;
			},
			

			// ПОЛЯ
			
			// получить имя поля по индексу
			getFieldName: function(i) {
				if (i==0) return "typeName";
				if (i==1) return "parentClass";
			},
			
					
			// КОЛЛЕКЦИИ
					
			// получить коллекцию по имени или по индексу
			getCol: function(col) {
				if (typeof col == "string") {
					if (col == "fields")
						return this.pvt.collections[0]; 
					if (col == "cols")
						return this.pvt.collections[1];
				}
				if (typeof col == "number") 
					return this._super(col);
				return null;
			},
			
			// получить индекс элемента коллекции с учетом наследования
			getIdxElem: function() {
				
			}
			

		});
		return MemMetaObj;
	}
);