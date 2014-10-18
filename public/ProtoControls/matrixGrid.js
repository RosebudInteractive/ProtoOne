if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/baseControls/aControl'],
    function(AControl) {
        var MatrixGrid = AControl.extend({


            className: "MatrixGrid",
            classGuid: "827a5cb3-e934-e28c-ec11-689be18dae97",
            metaFields: [ {fname:"HorCells", ftype:"int"}, {fname:"VerCells", ftype:"int"} ],

            /**
             * Инициализация объекта
             * @param cm на контрол менеджер
             * @param guid гуид объекта
             * @param options {parent:parentId}
             */
            init: function(cm, guid, options) {
                this._super(cm,guid);

                this.guid = guid;
                this.options = options;
            },

            getObj: function() {
                return this.db.getObj(this.guid);
            },

            /**
             * Рендер
             */
            render: function() {
                var obj = this.getObj();
                if (obj) {
                    var table = $('#' + this.guid);
                    if (table.length == 0) {
                        table = $('<div class="divTable" id="'+this.guid+'"></div>');
                        $(this.options.parent).append(table);
                    } else {
                        table.empty();
                    }
                    var x = obj.get('HorCells');
                    var y = obj.get('VerCells');
                    var top = obj.get('Top')+'px';
                    var left = obj.get('Left')+'px';
                    for (var i = 0; i < y; i++) {
                        var row = $('<div class="divRow"></div>');
                        for (var j = 0; j < x; j++) {
                            var cell = $('<div class="divCell"></div>');
                            row.append(cell);
                        }
                        table.append(row);
                    }
                    table.css({top:top, left:left});
                }
            }

        });
        return MatrixGrid;
    }
);