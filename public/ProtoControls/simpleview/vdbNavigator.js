define(
    [],
    function() {
        var VDBNavigator = {};

        VDBNavigator.render = function () {
            var that = this;
            require(['/public/uccello/uses/template.js', 'text!./ProtoControls/simpleview/templates/dbNavigator.html'], function(template, tpl){
                if (!that._templates)
                    that._templates = template.parseTemplate(tpl);

                var editor = $('#' + that.getLid());
                if (editor.length == 0) {
                    editor = $(that._templates['navigator']).attr('id', that.getLid());
                    var parent = (that.getParent()? '#' + that.getParent().getLid(): that.params.rootContainer);
                    $(parent).append(editor);
                    // перейти к паренту
                    editor.find('.dragRight').click(function () {
                        VDBNavigator.toParent.apply(that);
                    });
                    // перейти к чайлду
                    editor.find('.dragLeft').click(function () {
                        VDBNavigator.toChild.apply(that);
                    });
                    // перейти к чайлду
                    editor.find('.refresh').click(function () {
                        VDBNavigator.render.apply(that);
                    });
                }
                editor.css({top: that.top() + 'px', left: that.left() + 'px'});

                var left = editor.find('.left');
                var centerTop = editor.find('.centerTop');
                var centerBottom = editor.find('.centerBottom');
                var right = editor.find('.right');
                left.empty();
                centerTop.empty();
                centerBottom.empty();
                right.empty();
                that._activeRoot = null;
                that._activeCol = null;
                that._activeObj = null;

                // отображаем слева рут элементы
                if (that.params.db) {
                    for (var i = 0, len = that.params.db.countRoot(); i < len; i++) {
                        var root = that.params.db.getRoot(i);
                        var name = root.obj.get('Name');
                        if (!name)
                            name = root.obj.getGuid();

                        var leftTpl = $(that._templates['left']);
                        var link = leftTpl.find('a')
                            .data('obj', root.obj)
                            .html(name)
                            .click(function () {
                                var a = $(this);
                                left.find('a').removeClass('active');
                                a.addClass('active');
                                VDBNavigator.selectItem.apply(that, [a.data('obj')]);
                                return false;
                            });
                        left.append(leftTpl);
                    }
                    VDBNavigator.selectFirst.apply(that);
                }
            });
        };

        VDBNavigator.toParent = function (vcomp) {
            if (!this._activeObj) return;
            var that = this;
            var editor = $('#' + this.getLid());
            var left = editor.find('.left');
            var centerTop = editor.find('.centerTop');
            var centerBottom = editor.find('.centerBottom');
            var right = editor.find('.right');
            var name = centerBottom.find('a.active').html();
            left.empty();
            centerTop.empty();
            centerBottom.empty();
            right.empty();
            var leftTpl = $(this._templates['left']);
            var link = leftTpl.find('a')
                .data('obj', this._activeObj)
                .html(name)
                .click(function () {
                    var a = $(this);
                    left.find('a').removeClass('active');
                    a.addClass('active');
                    VDBNavigator.selectItem.apply(that, [a.data('obj')]);
                    return false;
                });
            left.append(leftTpl);
            link.click();
        };

        VDBNavigator.toChild = function (vcomp) {
            if (!this._activeRoot || !this._activeRoot.getParent()) return;
            var that = this;
            var editor = $('#' + this.getLid());
            var left = editor.find('.left');
            var centerTop = editor.find('.centerTop');
            var centerBottom = editor.find('.centerBottom');
            var right = editor.find('.right');
            var parent = this._activeRoot.getParent();
            var name = parent.get('Name') ? parent.get('Name') : parent.getGuid();
            left.empty();
            centerTop.empty();
            centerBottom.empty();
            right.empty();
            var leftTpl = $(this._templates['left']);
            var link = leftTpl.find('a')
                .data('obj', parent)
                .html(name)
                .click(function () {
                    var a = $(this);
                    left.find('a').removeClass('active');
                    a.addClass('active');
                    VDBNavigator.selectItem.apply(that, [a.data('obj')]);
                    return false;
                });
            left.append(leftTpl);
            link.click();
        };

        VDBNavigator.selectItem = function (obj) {
            this._activeRoot = obj;
            this._activeCol = null;
            this._activeObj = null;

            var that = this;
            var editor = $('#' + this.getLid());

            // отображаем в центре коллекции объекта
            var centerTop = editor.find('.centerTop');
            var centerBottom = editor.find('.centerBottom');
            var right = editor.find('.right');
            centerTop.empty();
            centerBottom.empty();
            right.empty();
            if (obj.countCol)
                for (var i = 0, len = obj.countCol(); i < len; i++) {
                    var col = obj.getCol(i);
                    var name = col.getName();
                    if (!name)
                        name = col.getGuid();
                    var centerTpl = $(this._templates['centerTop']);
                    var link = centerTpl.find('a')
                        .data('obj', col)
                        .html(name)
                        .click(function () {
                            var a = $(this);
                            centerTop.find('a').removeClass('active');
                            a.addClass('active');
                            VDBNavigator.selectCol.apply(that, [a.data('obj')]);
                            return false;
                        });
                    centerTop.append(centerTpl);
                }
            VDBNavigator.selectFirst.apply(this, [1]);
        };

        VDBNavigator.selectCol = function (obj) {
            this._activeCol = obj;
            this._activeObj = null;

            var that = this;
            var editor = $('#' + this.getLid());

            // отображаем в центре субэлементы  коллекции объекта
            var centerBottom = editor.find('.centerBottom');
            var right = editor.find('.right');
            centerBottom.empty();
            right.empty();
            for (var i = 0, len = obj.count(); i < len; i++) {
                var col = obj.get(i);
                var name = col.get('Name');
                if (!name)
                    name = col.getGuid();
                var centerTpl = $(this._templates['centerTop']);
                var link = centerTpl.find('a')
                    .data('obj', col)
                    .html(name)
                    .click(function () {
                        var a = $(this);
                        centerBottom.find('a').removeClass('active');
                        a.addClass('active');
                        VDBNavigator.selectObj.apply(that, [a.data('obj')]);
                        return false;
                    });
                centerBottom.append(centerTpl);
            }
        };

        VDBNavigator.selectObj = function (obj) {
            this._activeObj = obj;

            var that = this;
            var editor = $('#' + this.getLid());

            // отображаем справа поля
            var right = editor.find('.right');
            right.empty();
            for (var i = 0, len = obj.count(); i < len; i++) {
                if (obj.getFieldType) {
                    var rightTpl = $(this._templates['right']);
                    rightTpl.find('.name').html(obj.getFieldName(i));
                    rightTpl.find('.type').html(obj.getFieldType(i));
                    rightTpl.find('.value').attr('name', obj.getFieldName(i)).data('obj', obj).val(obj.get(i));
                    rightTpl.find('.save').click(function () {
                        var val = $(this).parent().find('.value');
                        val.data('obj').set(val.attr('name'), val.val());
                        return false;
                    });

                    right.append(rightTpl);
                }
            }
        };

        VDBNavigator.selectFirst = function (num) {
            var editor = $('#' + this.getLid());
            var left = editor.find('.left');
            var centerTop = editor.find('.centerTop');
            var centerBottom = editor.find('.centerBottom');
            var f1, f2, f3;

            if (!num) {
                var links = left.find('a');
                if (this._activeRoot) {
                    for(var i= 0, len=links.length; i<len; i++) {
                        if (this._activeRoot == $(links[i]).data('obj'))
                            f1 = $(links[i]);
                    }
                } else
                    f1 = links.length>0 ? $(links[0]) : null;
                if (f1) f1.click();
            }

            var links = centerTop.find('a');
            if (this._activeCol) {
                for(var i= 0, len=links.length; i<len; i++) {
                    if (this._activeCol == $(links[i]).data('obj'))
                        f2 = $(links[i]);
                }
            } else
                f2 = links.length>0 ? $(links[0]) : null;
            if (f2) f2.click();

            var links = centerBottom.find('a');
            if (this._activeObj) {
                for(var i= 0, len=links.length; i<len; i++) {
                    if (this._activeObj == $(links[i]).data('obj'))
                        f3 = $(links[i]);
                }
            } else
                f3 = links.length>0 ? $(links[0]) : null;
            if (f3) f3.click();
        };
        return VDBNavigator;
});
