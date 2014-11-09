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
             * @param options
             */
            init: function (cm, params, options) {
                this._super(cm, params);
                this.cm = cm;
                options = options ? options : {};
                this.options = options;
                if (!this.options)
                    this.options = {};
                if (!this.options.id)
                    this.options.id = 'DBNavigator';
                this._activeDb = options.db ? options.db : this.cm.getDB();
            },


            changeDB: function (db) {
                this._activeDb = db;
                this.render();
            },

            /**
             * Рендер
             */
            render: function () {
                var that = this;
                // обработка шаблонов
                if (!this._templates) {
                    require(['/public/uccello/uses/template.js', 'text!./templates/dbNavigator.html'], function (template, tpl) {
                        that._templates = template.parseTemplate(tpl);
                        that.render();
                    });
                } else {
                    var editor = $('#' + this.options.id);
                    if (editor.length == 0) {
                        editor = $(this._templates['navigator']).attr('id', this.options.id);
                        $(this.options.parent).append(editor);
                        // перейти к паренту
                        editor.find('.dragRight').click(function () {
                            that.toParent();
                        });
                        // перейти к чайлду
                        editor.find('.dragLeft').click(function () {
                            that.toChild();
                        });
                        // перейти к чайлду
                        editor.find('.refresh').click(function () {
                            that.render();
                        });
                    }
                    editor.css({top: this.top() + 'px', left: this.left() + 'px'});

                    var left = editor.find('.left');
                    var centerTop = editor.find('.centerTop');
                    var centerBottom = editor.find('.centerBottom');
                    var right = editor.find('.right');
                    left.empty();
                    centerTop.empty();
                    centerBottom.empty();
                    right.empty();
                    this._activeRoot = null;
                    this._activeCol = null;
                    this._activeObj = null;

                    // отображаем слева рут элементы
                    if (this._activeDb) {
                        for (var i = 0, len = this._activeDb.countRoot(); i < len; i++) {
                            var root = this._activeDb.getRoot(i);
                            var name = root.obj.get('Name');
                            if (!name)
                                name = root.obj.getGuid();

                            var leftTpl = $(this._templates['left']);
                            var link = leftTpl.find('a')
                                .data('obj', root.obj)
                                .html(name)
                                .click(function () {
                                    var a = $(this);
                                    left.find('a').removeClass('active');
                                    a.addClass('active');
                                    that.selectItem(a.data('obj'));
                                    return false;
                                });
                            left.append(leftTpl);
                        }
                        this.selectFirst();
                    }
                }
            },

            toParent: function () {
                if (!this._activeObj) return;
                var that = this;
                var editor = $('#' + this.options.id);
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
                        that.selectItem(a.data('obj'));
                        return false;
                    });
                left.append(leftTpl);
                link.click();
            },

            toChild: function () {
                if (!this._activeRoot || !this._activeRoot.getParent()) return;
                var that = this;
                var editor = $('#' + this.options.id);
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
                        that.selectItem(a.data('obj'));
                        return false;
                    });
                left.append(leftTpl);
                link.click();
            },

            selectItem: function (obj) {
                this._activeRoot = obj;
                this._activeCol = null;
                this._activeObj = null;

                var that = this;
                var editor = $('#' + this.options.id);

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
                                that.selectCol(a.data('obj'));
                                return false;
                            });
                        centerTop.append(centerTpl);
                    }
                this.selectFirst(1);
            },

            selectCol: function (obj) {
                this._activeCol = obj;
                this._activeObj = null;

                var that = this;
                var editor = $('#' + this.options.id);

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
                            that.selectObj(a.data('obj'));
                            return false;
                        });
                    centerBottom.append(centerTpl);
                }
            },

            selectObj: function (obj) {
                this._activeObj = obj;

                var that = this;
                var editor = $('#' + this.options.id);

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
            },

            selectFirst: function (num) {
                var editor = $('#' + this.options.id);
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



            },

            /* render: function() {

             var that = this;
             function renderItem() {
             var editor = $('#'+that.options.id);
             if (editor.length == 0) {
             editor = $(that._templates['navigator']).attr('id', that.options.id);
             $(that.options.parent).append(editor);
             } else {

             }
             editor.css({top:that.top()+'px', left:that.left()+'px'});
             return editor;
             }

             if (!this._templates) {
             require(['/public/uccello/uses/template.js', 'text!./templates/dbNavigator.html'], function(template, tpl){
             that._templates = template.parseTemplate(tpl);
             renderItem();
             });
             } else {
             renderItem();
             }
             },*/

            dataBase: function (value) {
                return this._genericSetter("DataBase", value);
            }
        });
        return DBNavigator;
});
