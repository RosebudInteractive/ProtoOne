if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function() {
        var PropEditor = Class.extend({

            className: "PropEditor",

            /**
             * Инициализация объекта
             * @param cm ссылка на контрол менеджер
             * @param options
             */
            init: function(cm, options) {
                this.cm = cm;
                this.options = options;
                if (!this.options.id)
                    this.options.id = 'propEditor';
            },

            /**
             * Рендер
             */
            render: function() {
                var editor = $('#'+this.options.id), props, controls, change;
                var that = this;
                if (editor.length == 0) {
                    editor = $('<div/>').attr('id', this.options.id);
                    controls = $('<select class="controls"/>');
                    controls.change(function() { that.changeControl.apply(that, arguments); });
                    props = $('<div class="props" />');
                    change = $('<input class="change" type="button" value="Изменить" style="display: none;" />');
                    change.click(function() { that.changeProps.apply(that, arguments); });
                    editor.append(controls);
                    editor.append(props);
                    editor.append(change);
                    $(this.options.parent).append(editor);
                } else {
                    controls = editor.find('.controls');
                    controls.empty();
                    props = editor.find('.props');
                    props.empty();
                    change = editor.find('.change');
                    change.hide();
                }

                controls.append('<option value=""></option>');
                var gl = this.cm._getCompGuidList();
                for (var f in gl) {
                    var name = gl[f].getClassName();
                    var id = gl[f].getGuid();
                    var option = $('<option/>').val(id).html(gl[f].getObj().get('Name'));
                    controls.append(option);
                }
                return editor;
            },

            changeControl: function() {
                var editor = $('#'+this.options.id);
                var controls = editor.find('.controls');
                var props = editor.find('.props');
                var change = editor.find('.change');
                var guid = controls.val();
                props.empty();

                if (guid=='') {
                    change.hide();
                    return;
                }
                change.show();

                var comp = this.cm.getByGuid(guid);
                var obj = this.cm.getDB().getObj(guid);
                var countProps = comp.countProps();
                for(var i=0; i<countProps; i++) {
                    var propName = comp.getPropName(i);
                    var p = $('<p><span class="name"></span> <span class="value"><input></span></p>');
                    p.find('.name').html(propName);
                    p.find('.value input').val(obj.get(propName)).attr('name', propName);
                    props.append(p);
                }
            },

            changeProps: function() {
                var editor = $('#'+this.options.id);
                var controls = editor.find('.controls');
                var props = editor.find('.props');
                var guid = controls.val();
                var obj = this.cm.getDB().getObj(guid);
                var inputs = props.find('input');

                for(var i=0; i<inputs.length; i++) {
                    var propName = $(inputs[i]).attr('name');
                    var value = $(inputs[i]).val();
                    obj.set(propName, value);
                }
                if (this.options.change)
                    this.options.change();
            }

        });
        return PropEditor;
    }
);