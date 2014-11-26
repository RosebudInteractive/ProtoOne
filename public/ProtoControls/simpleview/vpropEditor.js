define(
    [],
    function() {
        var vPropEditor = {};
        vPropEditor.render = function () {
            var that = this;
            require(['/public/uccello/uses/template.js', 'text!./ProtoControls/simpleview/templates/propEditor.html'], function (template, tpl) {
                if (!that._templates)
                    that._templates = template.parseTemplate(tpl);

                var editor = $('#' + that.getLid()), props, controls, change, delbtn, parents;
                if (editor.length == 0) {
                    editor = $(that._templates['propEditor']).attr('id', that.getLid());
                    controls = $(that._templates['controls']);
                    controls.change(function () {
                        vPropEditor.changeControl.apply(that, [$(this).val()]);
                        if (that.params.change)
                            that.params.change();
                    });
                    parents = $(that._templates['parents']);
                    props = $(that._templates['props']);
                    change = $(that._templates['change']);
                    change.click(function () {
                        vPropEditor.saveProps.apply(that, arguments);
                    });
                    delbtn = $(that._templates['delbtn']);
                    delbtn.click(function () {
                        vPropEditor.delControl.apply(that, arguments);
                        if (that.params.delete)
                            that.params.delete();
                    });
                    editor.append(controls);
                    editor.append(parents);
                    editor.append(props);
                    editor.append(change);
                    editor.append(delbtn);
                    var parent = (that.getParent()? '#' + that.getParent().getLid(): that.params.rootContainer);
                    $(parent).append(editor);
                    editor.css({top: that.top() + 'px', left: that.left() + 'px'});
                } else {
                    controls = editor.find('.controls');
                    controls.empty();
                    parents = editor.find('.parents');
                    parents.find('select').empty();
                    parents.hide();
                    props = editor.find('.props');
                    props.empty();
                    change = editor.find('.change');
                    change.hide();
                    delbtn = editor.find('.delbtn');
                    delbtn.hide();
                    if (that.getObj().isFldModified('Top') || that.getObj().isFldModified('Left'))
                        editor.css({top: that.top() + 'px', left: that.left() + 'px'});
                }

                parents.find('select').append('<option value=""></option>');
                controls.append('<option value=""></option>');
                var gl = that.getControlMgr()._getCompGuidList();
                for (var f in gl) {
                    var name = gl[f].getClassName();
                    var id = gl[f].getGuid();
                    controls.append($('<option/>').val(id).html(gl[f].getObj().get('Name')));
                    if (gl[f].pvt.obj.getCol("Children")) {
                        parents.find('select').append($('<option/>').val(id).html(gl[f].getObj().get('Name')));
                    }
                }

                // отобразить текущий контрол
                if (that.control()) {
                    controls.val(that.control());
                    //vPropEditor.changeControl.apply(that, [that.control()]);
					vPropEditor.renderProps.apply(that
                }
            });
        },
		
		vPropEditor.renderProps = function() {

			var guid = this.control();
			
            var editor = $('#' + this.getLid());
            var props = editor.find('.props');
            var change = editor.find('.change');
            var delbtn = editor.find('.delbtn');
            var parents = editor.find('.parents');
            props.empty();

            if (guid == '') {
                change.hide();
                delbtn.hide();
                parents.hide();
                return;
            }
            change.show();
            delbtn.show();
            parents.show();

            var comp = this.getControlMgr().getByGuid(guid);
            if (!comp) {
                vPropEditor.changeControl.apply(this, ['']);
                return;
            }

            parents.find('select').val(comp.getParent()?comp.getParent().getGuid():'');
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
         * Изменение текущего контрола
         * @param guid
         */
        vPropEditor.changeControl = function (guid) {

            // устанавливаем новое значение выбраннного контрола
            this.control(guid);
			vPropEditor.renderProps.apply(this);

        }

        /**
         * Удаление текущего контрола
         * @param guid
         */
        vPropEditor.delControl = function () {
            var editor = $('#' + this.getLid());
            this.getControlMgr().del(editor.find('.controls').val());
        }

        /**
         * Сохранить свойства
         */
        vPropEditor.saveProps = function () {
            var editor = $('#' + this.getLid());
            var props = editor.find('.props');
            var inputs = props.find('input');
            var comp = this.getControlMgr().getByGuid(editor.find('.controls').val());
            var parents = editor.find('.parents');

            // свойства
            for (var i = 0; i < inputs.length; i++) {
                var propName = $(inputs[i]).attr('name');
                var value = $(inputs[i]).val();
                comp[propName.charAt(0).toLowerCase() + propName.slice(1)](value);
            }

            // родитель
            this.getControlMgr().move(comp.getGuid(), parents.find('select').val());

            if (this.params.change)
                this.params.change();
        }
        return vPropEditor;
    });