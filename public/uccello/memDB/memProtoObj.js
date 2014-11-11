if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
	['./memObjLog'],
	function(MemObjLog) {
		var MemProtoObj = Class.extend({
				
			// objType - ссылка на объект-тип
			// parent - ссылка на объект и имя коллекции либо db, null для корневых  (obj и colname)
			init: function(objType, parent,flds){
			
				var pvt = this.pvt = {}; // приватные члены
				 
				pvt.objType = objType;
				pvt.fields = [];				// значения полей объекта
				pvt.collections = [];			// массив дочерних коллекций
				pvt.log = null; 
				pvt.state = 0;
				pvt.fldLog = {};
				
				if (!parent.obj) {	// корневой объект
					pvt.col = null;
					pvt.db = parent.db;
					pvt.parent = null;
				}
				else {				// объект в коллекции (не корневой)
					pvt.col = parent.obj.getCol(parent.colName);
					pvt.parent = parent.obj;	
					pvt.colName = parent.colName;
				}

				pvt.$id = this.getDB().getNewLid();		// локальный идентификатор
				if ((flds) && (flds.$sys) && (flds.$sys.guid))	// если гуид пришел в системных полях, то используем его
					pvt.guid = flds.$sys.guid;
				else 											// если нет - генерируем динамически
					pvt.guid =  this.getDB().getController().guid();  // TODO перенести в UTILS?
				
				if (!parent.obj) {	// корневой объект				
					pvt.db._addRoot(this,parent.mode);
					pvt.log = new MemObjLog(this);	// создать лог записи изменений
					if ((parent.mode == "RW") && (!parent.nolog) && (!pvt.db.isMaster())) // не мастер, то активируем, для мастера - на 1й подписке
						pvt.log.setActive(true); // лог активен только для корневого объекта, который создан в режиме ReadWrite
				}
				//else 
				//	pvt.col._add(this);
				this.getDB()._addObj(this);
										
			},
			
			// завершение инициализации (вызывается из наследников)
			finit: function() {
				if (this.pvt.col)
					this.pvt.col._add(this);
				this.pvt.state = 1;
				
			},
			
			// Добавляем логгер
			
			
			addChild: function(colName,obj) {
				
			},
						
			getDB: function() {
				if (!this.pvt.col) return this.pvt.db;
				else return this.pvt.col.getDB();
			},
			
			// получить локальный идентификатор объекта
            getLid: function() {
                return this.pvt.$id;
            },
			
			getGuid: function() {
				return this.pvt.guid;
			},
			
			getObjType: function() {
				return this.pvt.objType;
			},
			
			getTypeGuid: function() {
				return (this.pvt.objType == null) ? this.pvt.typeGuid : this.pvt.objType.getGuid();
			},
			
			getParent: function() {
				return this.pvt.parent;
			},
			
			// вернуть корневой элемент объекта
			getRoot: function() {
				var r = this;
				while (r.getParent()!=null) r = r.getParent();
				return r;
			},
			
			getLog: function() {
				var p = this;
				while (!p.pvt.log) p=p.getParent();
				return p.pvt.log; // TODO вернуть корневой лог (ссылку на корневой объект?)
			},
			

			// Поля
			
			// поиск по индексу
			get: function(field) {
				return this.pvt.fields[field];
			},
			
			// вернуть количество полей объекта
			count: function() {
				return this.pvt.fields.length;
			},
			
			
			// Коллекции
			
			// добавить дочернюю коллекцию
			_addCol: function(col) {
				this.pvt.collections.push(col);
			},
			
			// вернуть количество дочерних коллекций
			countCol: function() {
				return this.pvt.collections.length;
			},
			
			// вернуть коллекцию по индексу
			getCol: function(i) {
				return this.pvt.collections[i];
			},
			
			consoleLog: function(buf) {
				if (buf === undefined) buf=""
				else buf+="  ";
				//console.log(buf+" [" + this.+ "]");
				for (var i=0; i<this.count(); i++) 
					console.log(buf+this.getFieldName(i)+" = "+this.get(i));

				for (i=0; i<this.countCol(); i++) {
					console.log(buf+this.getCol(i).getName());
					for (var j=0; j<this.getCol(i).count(); j++) {
					
						this.getCol(i).get(j).consoleLog(buf);
					}
				}
			},
			
			getColName: function() {
				return this.pvt.colName;
			},
			
						
			isFldModified: function(fldName) {
				if (fldName in this.pvt.fldLog) 
					return true;
				else
					return false;
					
			},
			
			getOldFldVal: function(fldName) {
				if (fldName in this.pvt.fldLog) 
					return this.pvt.fldLog[fldName];
				else
					return undefined;
			},
			
			resetModifFldLog: function() {
				this.pvt.fldLog = {};
			}

		});
		return MemProtoObj;
	}
);