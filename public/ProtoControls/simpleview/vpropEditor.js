if (typeof define !== 'function') {
    var define = require('amdefine')(module);
    var Class = require('class.extend');
}

define(
    [],
    function() {
        var VPropEditor = Class.extend({
            render: function (vcomp) {
                var that = this;
                require(['/public/uccello/uses/template.js', 'text!./ProtoControls/simpleview/templates/propEditor.html'], function (template, tpl) {
                    if (!that._templates)
                        that._templates = template.parseTemplate(tpl);

                    var editor = $('#' + that.getLid()), props, controls, change, delbtn;
                    if (editor.length == 0) {
                        editor = $(that._templates['propEditor']).attr('id', that.getLid());
                        controls = $(that._templates['controls']);
                        controls.change(function () {
                            var val = $(this).val();
                            that.control(val);
                            if (that.params.change)
                                that.params.change();
                        });
                        props = $(that._templates['props']);
                        change = $(that._templates['change']);
                        change.click(function () {
                            vcomp.saveProps.apply(that, arguments);
                        });
                        delbtn = $(that._templates['delbtn']);
                        delbtn.click(function () {
                            vcomp.delControl.apply(that, arguments);
                            if (that.params.delete)
                                that.params.delete();
                        });
                        editor.append(controls);
                        editor.append(props);
                        editor.append(change);
                        editor.append(delbtn);
                        var parent = (that.getParent()? '#' + that.getParent().getLid(): that.params.rootContainer);
                        $(parent).append(editor);
                        editor.css({top: that.top() + 'px', left: that.left() + 'px'});
                    } else {
                        controls = editor.find('.controls');
                        controls.empty();
                        props = editor.find('.props');
                        props.empty();
                        change = editor.find('.change');
                        change.hide();
                        if (that.getObj().isFldModified('Top') || that.getObj().isFldModified('Left'))
                            editor.css({top: that.top() + 'px', left: that.left() + 'px'});
                    }

                    controls.append('<option value=""></option>');
                    var gl = that.cm._getCompGuidList();
                    for (var f in gl) {
                        var name = gl[f].getClassName();
                        var id = gl[f].getGuid();
                        var option = $('<option/>').val(id).html(gl[f].getObj().get('Name'));
                        controls.append(option);
                    }

                    // отобразить текущий контрол
                    if (that.control()) {
                        controls.val(that.control());
                        vcomp.changeControl.apply(that, [that.control(), vcomp]);
                    }
                });
            },

            /**
             * Изменение текущего контрола
             * @param guid
             */
            changeControl: function (guid, vcomp) {

                var editor = $('#' + this.getLid());
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
                if (!comp) {
                    vcomp.changeControl.apply(this, ['']);
                    return;
                }
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
                var editor = $('#' + this.getLid());
                this.cm.del(editor.find('.controls').val());
            },

            /**
             * Сохранить свойства
             */
            saveProps: function () {
                var editor = $('#' + this.getLid());
                var props = editor.find('.props');
                var inputs = props.find('input');
                var comp = this.cm.getByGuid(editor.find('.controls').val());

                for (var i = 0; i < inputs.length; i++) {
                    var propName = $(inputs[i]).attr('name');
                    var value = $(inputs[i]).val();
                    comp[propName.charAt(0).toLowerCase() + propName.slice(1)](value);
                }
                if (this.params.change)
                    this.params.change();
            }

        });
        return VPropEditor;
});