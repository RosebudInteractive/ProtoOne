if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../memDB/memMetaObj'],
    function(MemMetaObj) {
        var AComponent = Class.extend({

            init: function(){
                this.typeName = "Control";
            },

            /**
             * Cоздает метаинформацию своего класса в базе данных db
             * @param db
             */
            buildMetaInfo: function(db, guid){
                if (!db.getObj(guid))
                    return new MemMetaObj({db: db}, {fields: {typeName: guid, parentClass: null}});
            }
        });
        return AComponent;
    }
);