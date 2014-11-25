if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/baseControls/aControl'],
    function(AControl) {
        var DBNavigator = AControl.extend({

            className: "DBNavigator",
            classGuid: "38aec981-30ae-ec1d-8f8f-5004958b4cfa",
            metaFields: [
                {fname: "DataBase", ftype: "string"}
            ],

            /**
             * Инициализация объекта
             * @param cm ссылка на контрол менеджер
             * @param params
             */
            init: function (cm, params) {
                this._super(cm, params);
                this.cm = cm;
                this.params = params;
            },

            dataBase: function (value) {
                return this._genericSetter("DataBase", value);
            }
        });
        return DBNavigator;
});
