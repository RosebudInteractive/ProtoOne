
requirejs.config({
    baseUrl: 'public',
    nodeRequire: require,
    paths: {
        text       : '/public/uccello/uses/text',
        underscore : '/public/uccello/uses/underscore'
    }
});

var uccelloClt = null;

// когда документ загружен
$(document).ready( function() {
    require(
        ['./uccello/uccelloClt', './uccello/controls/controlMgr'],
        function(UccelloClt, ControlMgr){

            var that = this;
			this.tabCount = 0;
            this.currRoot=null;
            this.rootsGuids=[];
            this.rootsContainers={};
            this.resultForm = '#result0';

            uccelloClt = new UccelloClt({
                host:"ws://"+url('hostname')+":8081",
                sessionId:$.url('#sid'),
                container:'#result0',
                callback: function(){
                    var user = uccelloClt.getLoggedUser();
                    if (user) {
                        $('#login').hide(); $('#logout').show();
                        $('#userInfo').html('User: '+user.user+' | Session:'+uccelloClt.pvt.sessionId);
                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#userInfo').html('');
                    }
                },
                controlsPath:'./ProtoControls/',
                config:config
            });


            // --------------------------------------------------------------------------------------------------------
            // --------------------- Глобальные методы для кнопок управления -----------------------------------------
            // --------------------------------------------------------------------------------------------------------

            /**
             * subscribe user
             */
            window.subscribeRootSys = function() {
                // подписываемся на корневой объект контейнера
                uccelloClt.getSysDB().subscribeRoots(uccelloClt.pvt.guids.sysRootGuid, function(result){
                    that.getContexts();
                }, function() {} );
            }

            var addControlId = 1000;
            window.addControl = function(guid, ini, cm) {
                if (!cm) cm = uccelloClt.getContextCM(that.currRoot);
                if (!ini) {
                    ini = {fields: {"Id": addControlId, "Name": 'Component'+addControlId, "Left":"300", "Top":"150"}};
                    addControlId++;
                }

                var rootCont = null;
                var gl = cm._getCompGuidList();
                for (var f in gl)
                    if (gl[f].getClassName() == "Container") { rootCont=gl[f]; break; }

				var constr = uccelloClt.getConstr(guid);
                var control = new constr(cm, {parent: rootCont, colName: "Children", ini:ini }, {parent:that.resultForm});
				sendDeltas(false);
                uccelloClt.getContext().renderAll(true);
            }

            /**
             * Удалить контрол
             * @param guid
             * @param cm
             */
            window.delControl = function(guid, cm) {
                if (!cm) cm = uccelloClt.getContextCM(that.currRoot);
                cm.del(guid);
				uccelloClt.getController().genDeltas(cm.getDB().getGuid());
                uccelloClt.getContext().renderAll(true);
            }

            /**
             * Получить  получить на клиент от сервера структуру - все сессии с номерами и когда созданы,
             * все коннекты этих сессий - с номерами и когда созданы - и чтобы эту инфо можно было вывести
             * в мемо поле по кнопке (трассировка)
             */
            window.getSessions = function() {
                uccelloClt.getClient().socket.send({action:"getSessions", type:'method'}, function(result){
                    console.log(result);
                });
            }

            /**
             * Логин
             * @param name
             * @param pass
             */
            window.login = function(name, pass){
                uccelloClt.getClient().authenticate(name, pass, function(result){
                    if (result.user) {
                        $('#login').hide(); $('#logout').show();
                        $('#loginForm').hide();
                        $('#loginError').hide();
                        $('#userInfo').html('User: '+result.user.user+' | Session:'+uccelloClt.pvt.sessionId);
                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#loginError').html('Неправильный логин или пароль').show();
                        $('#userInfo').html('');
                    }
                });
            }

            /**
             * Выход
             */
            window.logout = function(){
                uccelloClt.getClient().deauthenticate(function(){
                    $('#login').show(); $('#logout').hide();
                    $('#userInfo').html('');
                });
                return false;
            }

            /**
             * Отправить дельту
             * @param force {bool} Всегда отправлять
             */
            window.sendDeltas = function (force) {
                if ($('#autoSendDelta').is(':checked') || force)
					uccelloClt.getController().genDeltas(uccelloClt.getContextCM(that.currRoot).getDB().getGuid());
            }

            /**
             * Создать серверный контекст
             * @param formGuid - гуид ресурса, который загружается в контекст
             */
            window.createContext = function(formGuid) {
                $(that.resultForm).empty();
                uccelloClt.createContext('server', formGuid, function(result){
                    that.clearTabs();
                    for (var i=0; i<result.length; i++) {
                        that.createTab(result[i]);
                    }
                    that.currRoot = that.rootsGuids[0];
                    that.setAutoSendDeltas(true);
                    that.getContexts();
                    return that.getOptions(result);
                });
            }

			
            /**
             * Создать клиентский контекст
             * @param guid
             */
            window.createClientContext = function(formGuid) {
                uccelloClt.createContext('client', formGuid, function(result){
                    return that.getOptions(result);
                });
            }


            this.clearTabs = function() {
                $(that.resultForm).empty();
                that.tabCount = 0;
                that.rootsContainers = {};
                that.rootsGuids = [];
                $('#tabs').empty();
                $('#container').empty();
            }

            this.getOptions = function(roots) {
                var options = [];
                for (var i=0; i<roots.length; i++)
                    options.push( {rootContainer: '#result'+that.rootsContainers[roots[i]]});
                return options;
            }

            /**
             * Выбрать контекст
             * @param guid
             */
            this.selectContext = function(params) {
                that.clearTabs();
                uccelloClt.setContext(params, function(result) {
                    result = result.length? result: result.guids;
					for (var i=0; i<result.length; i++) {
						that.createTab(result[i]);
					}
					that.currRoot = that.rootsGuids[0];
                    that.setAutoSendDeltas(true);
                    return that.getOptions(result);
				});
            }
			
            /**
             * Выбрать рут
             * @param i
             */
            window.selectTab = function (i){
                $('.tabs').removeClass('active');
                $($('.tabs')[i]).addClass('active');
                $('.tabs-page').hide();
                $($('.tabs-page')[i]).show();
                that.resultForm = '#result'+i;
                that.currRoot = that.rootsGuids[i];
                that.setAutoSendDeltas(true);
            }


            /**
             * Создать рут ресурсов (не данных)
             */
            window.createRoot = function(){
                if (!that.currRoot) return;
				var formGuid = $('#selForm').val();
                uccelloClt.createRoot(formGuid, "res", function(result){
                    that.rootsGuids.push(result[0]);
                    that.createTab(result[0]);
                    return that.getOptions(result);
                });
            }

            /**
             * Кнопка query
             */
            window.loadQuery = function(rootGuid){
                var context = uccelloClt.getContext();
                if (!context) return;
                uccelloClt.createRoot(rootGuid, "data", function(result){
                    var cm = uccelloClt.getContextCM(that.currRoot);
                    var db = cm.getDB();
                    if (result[0]) {
                        var dataset = cm.getByName("DatasetCompany");
                        dataset.root(result[0]);
                        sendDeltas(false);
                    }
                    return that.getOptions([that.currRoot]);
                });
            }

            /**
             * Сериализовать форму и вывести в консоль
             */
            window.serializeForm = function(){
                if (!uccelloClt.getContext()) return;
                var root = uccelloClt.getContextCM(that.currRoot).getDB().getObj(that.currRoot);
                console.log(uccelloClt.getContextCM(that.currRoot).getDB().serialize(root));
            }

            /**
             * присваивается значение параметру формы
             * @param value
             */
            window.setParam = function(value) {
                var cm = uccelloClt.getContextCM(that.currRoot);
                var formParam1 = cm.getByName("FormParam1");
                formParam1.value(value);
				sendDeltas(true);
            },



            // ---------------------------------------------------------------------------------------------------------

            /**
             * Создать переключатели рутов
             */
            this.createTabs = function() {
                $('#tabs').empty();
                $('#container').empty();
                this.rootsContainers={};
                for(var i=0; i<that.rootsGuids.length; i++) {
                    $('#tabs').append('<input type="button" class="tabs '+(i==0?'active':'')+'" value="Root '+i+'" onclick="selectTab('+i+');"> ');
                    $('#container').append('<div id="result'+i+'" class="tabs-page" style="'+(i!=0?'display: none;':'')+'"/>');
                    that.rootsContainers[that.rootsGuids[i]] = i;
                }
                fixHeight();
            }

            /**
             * Создать переключать рута
             * @returns {string}
             */
            this.createTab = function(rootGuid) {
                var i = this.tabCount;
                $('#tabs').append('<input type="button" class="tabs '+(i==0?'active':'')+'" value="Root '+i+'" onclick="selectTab('+i+');"> ');
                $('#container').append('<div id="result'+i+'" class="tabs-page" style="'+(i!=0?'display: none;':'')+'"/>');
				that.rootsGuids[i]=rootGuid;
                that.rootsContainers[that.rootsGuids[i]] = i;
                fixHeight();
                this.tabCount++;
                return "#result"+i;
            }




            /**
             * Получить контексты и отобразить в комбо
             */
            this.getContexts = function() {
                var sel = $('#userContext');
                sel.empty();

                for (var i = 0, len = uccelloClt.getSysDB().countRoot(); i < len; i++) {
                    var root = uccelloClt.getSysDB().getRoot(i);
                    var obj = root.obj;
                    for (var j = 0, len2 = obj.countCol(); j < len2; j++) {
                        var col = obj.getCol(j);
                        var name = col.getName();
                        if (name == "VisualContext") {
                            for (var k = 0, len3 = col.count(); k < len3; k++) {
                                var item = col.get(k);
                                var option = $('<option/>');
                                option.data('ContextGuid', item.get('ContextGuid'));
                                option.val(item.get('DataBase')).html(item.get('Name'));
                                sel.append(option);
                            }
                            sel.val(uccelloClt.getContext()? uccelloClt.getContext().masterGuid(): null);
                            return;
                        }
                    }
                }
            }


            this.setAutoSendDeltas = function(check) {
                var cm = uccelloClt.getContextCM(that.currRoot);
                if (cm) {
                    if (check)
                        $('#autoSendDelta').prop('checked', cm.autoSendDeltas());
                    else
                        cm.autoSendDeltas($('#autoSendDelta').is(':checked'));
                }

            }


            // ----------------------------------------------------------------------------------------------------
            // ---------------------- Функции обработчики хтмл объектов -------------------------------------------

            // высота окошка результатов
            fixHeight = function() {
                var h = $(window).height();
                $('.tabs-page').height(h-120);
                $('#editor').height(h-100);
                $('#console').width('100%');
            };
            fixHeight();
            $(window).resize(fixHeight);

            // форма логина
            $('#login').click(function(e){
                e.stopPropagation();
                if ($('#loginForm').is(':visible')) {
                    $('#loginForm').hide();
                } else {
                    var offset = $(this).offset();
                    offset.top += 20;
                    $('#loginForm').show().offset(offset);
                }
                return false;
            });
            $(window).click(function(){$('#loginForm').hide();});
            $('#loginForm').click(function(e){e.stopPropagation();});

            $('#userContext').change(function(){

                var currContext = $(this).val();
                var vc = $(this).find('option[value="'+currContext+'"]').data('ContextGuid');

                // создавать при выборе контекста
                var createForm = $('#createForm').is(':checked');
                // гуид выбранной формы
                var formGuid = $('#selForm').val();

                // запросить гуиды рутов
                uccelloClt.getClient().socket.send({action:"getRootGuids", db:currContext, rootKind:'res', type:'method'}, function(result) {
                    that.rootsGuids = result.roots;
                    that.createTabs();
                    that.selectContext({masterGuid: currContext, vc:vc,  side: "server"});
                });
            });

            $('#autoSendDelta').click(function(e){
                  that.setAutoSendDeltas(false);
            });

            // ----------------------------------------------------------------------------------------------------

        }
    );
});

