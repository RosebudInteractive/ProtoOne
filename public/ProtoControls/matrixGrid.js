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
            init: function(cm, params, options) {
                this._super(cm,params);

                this.options = options;
            },

            /**
             * Рендер
             */
            render: function() {
                var table = $('#' + this.getGuid());
                if (table.length == 0) {
                    table = $('<div class="divTable" id="'+this.getGuid()+'"></div>');
                    $(this.options.parent).append(table);
                } else {
                    table.empty();
                }
                var x = this.horCells();
                var y = this.verCells();
                for (var i = 0; i < y; i++) {
                    var row = $('<div class="divRow"></div>');
                    for (var j = 0; j < x; j++) {
                        var cell = $('<div class="divCell"></div>');
                        row.append(cell);
                    }
                    table.append(row);
                }
                table.css({top:this.top()+'px', left:this.left()+'px'});
            },

            horCells: function(value) {
                return this._genericSetter("HorCells", value);
            },

            verCells: function(value) {
                return this._genericSetter("VerCells", value);
            }

        });
        return MatrixGrid;
    }
);