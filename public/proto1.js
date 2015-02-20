
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
        ['./uccello/uccelloClt'],
        function(UccelloClt){

            var that = this;
			this.tabCount = 0;
            this.currRoot=null;
            this.rootsGuids=[];
            this.rootsContainers={};
            this.resultForm = '#result0';

            this.clearTabs = function() {
                $(that.resultForm).empty();
                that.tabCount = 0;
                that.rootsContainers = {};
                that.rootsGuids = [];
                $('#tabs').empty();
                $('#container').empty();
            }

            /**
             * Выбрать контекст
             * @param guid
             */
            this.selectContext = function(params) {
                that.clearTabs();
                uccelloClt.setContext(params, function(result) {
                    that.setAutoSendDeltas(true);
				});
            }

            /**
             * Рендер переключателя рута
             * @param rootGuid {string}
             * @returns {object}
             */
            this.renderRoot = function(rootGuid){

                if (that.rootsContainers[rootGuid] !== undefined) {
                    return {rootContainer: "#result"+that.rootsContainers[rootGuid]};
                }

                var i = that.tabCount;
                $('#tabs').append('<input type="button" class="tabs '+(i==0?'active':'')+'" value="Root '+i+'" onclick="selectTab('+i+');"> ');
                $('#container').append('<div id="result'+i+'" class="tabs-page" style="'+(i!=0?'display: none;':'')+'"/>');
                that.rootsGuids[i]=rootGuid;
                that.rootsContainers[that.rootsGuids[i]] = i;
                fixHeight();
                that.tabCount++;

                if (i==0)
                    that.currRoot = that.rootsGuids[0];

                return {rootContainer: "#result"+i};
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

            /**
             * автодельта
             * @param check
             */
            this.setAutoSendDeltas = function(check) {
                var cm = uccelloClt.getContextCM(that.currRoot);
                if (cm) {
                    if (check)
                        $('#autoSendDelta').prop('checked', cm.autoSendDeltas());
                    else
                        cm.autoSendDeltas($('#autoSendDelta').is(':checked'));
                }

            }

            var config = {
                controls: [
                    {className:'Container', component:'container', viewsets:['simpleview'], guid:'1d95ab61-df00-aec8-eff5-0f90187891cf'},
                    {className:'Form', component:'form', viewsets:['simpleview'], guid:'7f93991a-4da9-4892-79c2-35fe44e69083'},
                    {className:'Button', component:'button', viewsets:['simpleview'], guid:'af419748-7b25-1633-b0a9-d539cada8e0d'},
                    {className:'DataColumn', component:'dataColumn', guid:'100f774a-bd84-8c46-c55d-ba5981c09db5'},
                    {className:'DataGrid', component:'dataGrid', viewsets:['simpleview'], guid:'ff7830e2-7add-e65e-7ddf-caba8992d6d8'},
                    {className:'DataEdit', component:'dataEdit', viewsets:['simpleview'], guid:'affff8b1-10b0-20a6-5bb5-a9d88334b48e'},
                    {className:'DbNavigator', component:'dbNavigator', viewsets:['simpleview'], guid:'38aec981-30ae-ec1d-8f8f-5004958b4cfa'},
                    {className:'Edit', component:'edit', viewsets:['simpleview'], guid:'f79d78eb-4315-5fac-06e0-d58d07572482'},
                    {className:'MatrixGrid', component:'matrixGrid', viewsets:['simpleview'], guid:'827a5cb3-e934-e28c-ec11-689be18dae97'},
                    {className:'PropEditor', component:'propEditor', viewsets:['simpleview'], guid:'a0e02c45-1600-6258-b17a-30a56301d7f1'},
                    {className:'Label', component:'label', viewsets:['simpleview'], guid:'32932036-3c90-eb8b-dd8d-4f19253fabed'}
                ],
                controlsPath: 'ProtoControls/',
                uccelloPath: 'Uccello/'
            };

            uccelloClt = new UccelloClt({
                host:"ws://"+url('hostname')+":8081",
                container:'#result0',
                callback: function(){
                    var user = uccelloClt.getLoggedUser();
                    if (user) {
                        $('#login').hide(); $('#logout').show();
                        $('#userInfo').html('User: '+user.user+' | Session:'+uccelloClt.getSession().id+' <br>DeviceName:'+uccelloClt.getSession().deviceName);
                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#userInfo').html('');
                    }
                },
                renderRoot: that.renderRoot,
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
                var session = $.cookie('session_'+name)? JSON.parse($.cookie('session_'+name)): {id:uccelloClt.getSession().id, deviceName:'MyComputer', deviceType:'C', deviceColor:'#ff0000'};
                uccelloClt.getClient().authenticate(name, pass, session, function(result){
                    if (result.user) {
                        $.cookie('session_'+name, JSON.stringify(session), { expires: 30 });
                        uccelloClt.setSession(result.user.session);
                        uccelloClt.pvt.guids.sysRootGuid = result.user.guid;
                        $('#login').hide(); $('#logout').show();
                        $('#loginForm').hide();
                        $('#loginError').hide();
                        $('#userInfo').html('User: '+result.user.user+' | Session:'+uccelloClt.getSession().id+' <br>DeviceName:'+uccelloClt.getSession().deviceName);
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
             * @param formGuids массив гуидов ресурсов, который загружается в контекст
             */
            window.createContext = function(formGuids) {
                if (!formGuids) return;
                $(that.resultForm).empty();
                that.clearTabs();
                uccelloClt.createContext('server', formGuids, function(result){
                    that.setAutoSendDeltas(true);
                    that.getContexts();
                });
            }


            /**
             * Создать клиентский контекст
             * @param guid
             */
            window.createClientContext = function(formGuids) {
                if (!formGuids) return;
                that.clearTabs();
                uccelloClt.createContext('client', formGuids, function(result){
                    that.setAutoSendDeltas(true);
                    that.getContexts();
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
                var formGuids = $('#selForm').val();
                uccelloClt.createRoot(formGuids, "res");
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

                // запросить гуиды рутов
                uccelloClt.getClient().socket.send({action:"getRootGuids", db:currContext, rootKind:'res', type:'method'}, function(result) {
                    that.rootsGuids = result.roots;
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

