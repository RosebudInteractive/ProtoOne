define(
    ['/public/uccello/uses/template.js', 'text!./templates/dbNavigator.html'],
    function(template, tpl) {
        var vDBNavigator = {};
        vDBNavigator._templates = template.parseTemplate(tpl);
        vDBNavigator.render = function () {
            var that = this;
            var editor = $('#' + that.getLid());
            if (editor.length == 0) {
                editor = $(vDBNavigator._templates['navigator']).attr('id', that.getLid());

                var parent = (that.getParent()? '#' + that.getParent().getLid(): that.params.rootContainer);
                $(parent).append(editor);
                // перейти к паренту
                editor.find('.dragRight').click(function () {
                    vDBNavigator.toParent.apply(that);
                });
                // перейти к чайлду
                editor.find('.dragLeft').click(function () {
                    vDBNavigator.toChild.apply(that);
                });
                // перейти к чайлду
                editor.find('.refresh').click(function () {
                    vDBNavigator.render.apply(that);
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

            // добавляем уровни
            var levels = editor.find('.levels');
            levels.empty();
            for(var i=0, len=this.nlevels(); i<len; i++) {
                var levelCol = $(vDBNavigator._templates['levelCol']);
                levelCol.find('.centerTop').addClass('level'+i);
                levelCol.find('.centerBottom').addClass('level'+i);
                levels.append(levelCol);
            }

            that._activeRoot = null;
            that._activeCol = null;
            that._activeObj = null;

            // отображаем слева рут элементы
            if (that.params.db) {
                var rootElemLink = null;
                var rootElem = this.level()==0? null: this.rootElem();
                var cnt = rootElem? 1: that.params.db.countRoot();

                for (var i = 0; i < cnt; i++) {
                    var root = rootElem? that.params.db.getObj(rootElem): that.params.db.getRoot(i).obj;
                    var name = root.get('Name');
                    if (!name)
                        name = root.getGuid();

                    var leftTpl = $(vDBNavigator._templates['left']);
                    var link = leftTpl.find('a')
                        .data('obj', root)
                        .html(name)
                        .click(function () {
                            var a = $(this);
                            left.find('a').removeClass('active');
                            a.addClass('active');
                            vDBNavigator.changeRootElem.apply(that, [a.data('obj')]);
                            if (that.params.change)
                                that.params.change();
                            return false;
                        });
                    left.append(leftTpl);

                    if (!rootElemLink && this.rootElem() == root.getGuid())
                        rootElemLink = link;
                }


                if (rootElemLink) {
                    left.find('a').removeClass('active');
                    rootElemLink.addClass('active');
                    vDBNavigator.selectItem.apply(this, [rootElemLink.data('obj'), 0]);
                }

                //vDBNavigator.selectFirst.apply(that);
            }
        };

        vDBNavigator.changeRootElem = function(obj){
            this.rootElem(obj.getGuid());
            vDBNavigator.selectItem.apply(this, [obj, 0]);
        }

        vDBNavigator.toParent = function (vcomp) {
            if (!this._activeObj) return;
            this.rootElem(this._activeObj.getGuid());
            this.level(this.level()+1);
            var that = this;
            var editor = $('#' + this.getLid());
            var left = editor.find('.left');
            var centerTop = editor.find('.centerTop.level0');
            var centerBottom = editor.find('.centerBottom.level0');
            var right = editor.find('.right');
            var name = centerBottom.find('a.active').html();
            left.empty();
            centerTop.empty();
            centerBottom.empty();
            right.empty();
            var leftTpl = $(vDBNavigator._templates['left']);
            var link = leftTpl.find('a')
                .data('obj', this._activeObj)
                .html(name)
                .click(function () {
                    var a = $(this);
                    left.find('a').removeClass('active');
                    a.addClass('active');
                    vDBNavigator.selectItem.apply(that, [a.data('obj'), 0]);
                    return false;
                });
            left.append(leftTpl);
            link.click();
            if (that.params.change)
                that.params.change();
        };

        vDBNavigator.toChild = function (vcomp) {
            if (!this._activeRoot || !this._activeRoot.getParent()) return;
            this.rootElem(this._activeRoot.getParent().getGuid());
            this.level(this.level()-1);
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
            var leftTpl = $(vDBNavigator._templates['left']);
            var link = leftTpl.find('a')
                .data('obj', parent)
                .html(name)
                .click(function () {
                    var a = $(this);
                    left.find('a').removeClass('active');
                    a.addClass('active');
                    vDBNavigator.selectItem.apply(that, [a.data('obj'), 0]);
                    return false;
                });
            left.append(leftTpl);
            link.click();
            if (that.params.change)
                that.params.change();
        };

        vDBNavigator.selectItem = function (obj, level) {

            if (level==0) {
                this._activeRoot = obj;
                this._activeCol = null;
                this._activeObj = null;
            }

            var that = this;
            var editor = $('#' + this.getLid());

            // очищаем все низшие уровни
            for(var i=level; i<this.nlevels(); i++) {
                editor.find('.centerTop.level'+i).empty();
                editor.find('.centerBottom.level'+i).empty();
            }

            // отображаем в центре коллекции объекта
            var centerTop = editor.find('.centerTop.level'+level);
            var centerBottom = editor.find('.centerBottom.level'+level);
            if (obj.countCol)
                for (var i = 0, len = obj.countCol(); i < len; i++) {
                    var col = obj.getCol(i);
                    var name = col.getName();
                    if (!name)
                        name = col.getGuid();
                    var centerTpl = $(vDBNavigator._templates['centerTop']);
                    var link = centerTpl.find('a')
                        .data('obj', col)
                        .html(name)
                        .click(function () {
                            var a = $(this);
                            centerTop.find('a').removeClass('active');
                            a.addClass('active');
                            vDBNavigator.selectCol.apply(that, [a.data('obj'), level]);
                            return false;
                        });
                    centerTop.append(centerTpl);
                }
            //vDBNavigator.selectFirst.apply(this, [1]);
            vDBNavigator.viewRight.apply(this, [obj]);
        };

        vDBNavigator.selectCol = function (obj, level) {

            if (level==0){
                this._activeCol = obj;
                this._activeObj = null;
            }

            var that = this;
            var editor = $('#' + this.getLid());

            // очищаем все низшие уровни
            for(var i=level; i<this.nlevels(); i++) {
                editor.find('.centerBottom.level'+i).empty();
            }

            // отображаем в центре субэлементы  коллекции объекта
            var centerBottom = editor.find('.centerBottom.level'+level);
            for (var i = 0, len = obj.count(); i < len; i++) {
                var col = obj.get(i);
                var name = col.get('Name');
                if (!name)
                    name = col.getGuid();
                var centerTpl = $(vDBNavigator._templates['centerTop']);
                var link = centerTpl.find('a')
                    .data('obj', col)
                    .html(name)
                    .click(function () {
                        var a = $(this);
                        centerBottom.find('a').removeClass('active');
                        a.addClass('active');
                        vDBNavigator.selectObj.apply(that, [a.data('obj'), level]);
                        return false;
                    });
                centerBottom.append(centerTpl);
            }
            vDBNavigator.viewRight.apply(this, [obj]);
        };

        vDBNavigator.selectObj = function (obj, level) {
            if (level==0)
                this._activeObj = obj;
            if (this.nlevels()>level+1)
                vDBNavigator.selectItem.apply(this, [obj, level+1]);
            vDBNavigator.viewRight.apply(this, [obj]);
        };

        vDBNavigator.viewRight = function (obj) {
            var that = this;
            var editor = $('#' + this.getLid());

            // отображаем справа поля
            var right = editor.find('.right');
            right.empty();
            for (var i = 0, len = obj.count(); i < len; i++) {
                if (obj.getFieldType) {
                    var rightTpl = $(vDBNavigator._templates['right']);
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
        }


        vDBNavigator.selectFirst = function (num) {
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
        return vDBNavigator;
});
