if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    ['../uccello/baseControls/aControl'],
    function(AControl) {
        var PropEditor = AControl.extend({

            className: "PropEditor",
            classGuid: "a0e02c45-1600-6258-b17a-30a56301d7f1",
            metaFields: [
                {fname: "Control", ftype: "string"}
            ],

            /**
             * Инициализация объекта
             * @param cm ссылка на контрол менеджер
             * @param params
             * @param options
             */
            init: function (cm, params, options) {
                this._super(cm, params);
                this.cm = cm;
                this.options = options;
            },

            /**
             * Рендер
             */
            render: function () {
                var that = this;
                // обработка шаблонов
                if (!this._templates) {
                    require(['/public/uccello/uses/template.js', 'text!./templates/propEditor.html'], function (template, tpl) {
                        that._templates = template.parseTemplate(tpl);
                        that.render();
                    });
                } else {

                    var editor = $('#' + this.getGuid()), props, controls, change, delbtn;
                    if (editor.length == 0) {
                        editor = $(this._templates['propEditor']).attr('id', this.getGuid());
                        controls = $(this._templates['controls']);
                        controls.change(function () {
                            var val = $(this).val();
                            that.control(val);
                            if (that.options.change)
                                that.options.change();
                        });
                        props = $(this._templates['props']);
                        change = $(this._templates['change']);
                        change.click(function () {
                            that.saveProps.apply(that, arguments);
                        });
                        delbtn = $(this._templates['delbtn']);
                        delbtn.click(function () {
                            that.delControl.apply(that, arguments);
                            if (that.options.delete)
                                that.options.delete();
                        });
                        editor.append(controls);
                        editor.append(props);
                        editor.append(change);
                        editor.append(delbtn);
                        $(this.options.parent).append(editor);
                        editor.css({top: this.top() + 'px', left: this.left() + 'px'});
                    } else {
                        controls = editor.find('.controls');
                        controls.empty();
                        props = editor.find('.props');
                        props.empty();
                        change = editor.find('.change');
                        change.hide();
                        if (this.getObj().isFldModified('Top') || this.getObj().isFldModified('Left'))
                            editor.css({top: this.top() + 'px', left: this.left() + 'px'});
                    }

                    controls.append('<option value=""></option>');
                    var gl = this.cm._getCompGuidList();
                    for (var f in gl) {
                        var name = gl[f].getClassName();
                        var id = gl[f].getGuid();
                        var option = $('<option/>').val(id).html(gl[f].getObj().get('Name'));
                        controls.append(option);
                    }

                    // отобразить текущий контрол
                    if (this.control()) {
                        controls.val(this.control());
                        this.changeControl(this.control());
                    }

                }
            },

            /**
             * Изменение текущего контрола
             * @param guid
             */
            changeControl: function (guid) {

                var editor = $('#' + this.getGuid());
                var props = editor.find('.props');
                var change = editor.find('.change');
                var delbtn = editor.find('.delbtn');
                props.empty();

                if (guid == '') {
                    change.hide();
                    delbtn.hide();
                    return;
                }
                change.show();
                delbtn.show();

                var comp = this.cm.getByGuid(guid);
                var countProps = comp.countProps();
                for (var i = 0; i < countProps; i++) {
                    var propName = comp.getPropName(i);
                    var p = $(this._templates['field']);
                    p.find('.name').html(propName);
                    p.find('.value input').val(comp[propName.charAt(0).toLowerCase() + propName.slice(1)]()).attr('name', propName);
                    props.append(p);
                }
            },

            /**
             * Удаление текущего контрола
             * @param guid
             */
            delControl: function () {
                var editor = $('#' + this.getGuid());
                this.cm.del(editor.find('.controls').val());
            },

            /**
             * Сохранить свойства
             */
            saveProps: function () {
                var editor = $('#' + this.getGuid());
                var props = editor.find('.props');
                var inputs = props.find('input');
                var comp = this.cm.getByGuid(editor.find('.controls').val());

                for (var i = 0; i < inputs.length; i++) {
                    var propName = $(inputs[i]).attr('name');
                    var value = $(inputs[i]).val();
                    comp[propName.charAt(0).toLowerCase() + propName.slice(1)](value);
                }
                if (this.options.change)
                    this.options.change();
            },

            control: function (value) {
                return this._genericSetter("Control", value);
            }

        });
        return PropEditor;
});