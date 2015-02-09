
requirejs.config({
    baseUrl: 'public',
    nodeRequire: require,
    paths: {
        text       : '/public/uccello/uses/text',
        underscore : '/public/uccello/uses/underscore'
    }
});

var contextGuid = 0;
var uccelloClt = null;

// когда документ загружен
$(document).ready( function() {
    require(
        ['./uccello/uccelloClt', './uccello/controls/controlMgr'],
        function(UccelloClt, ControlMgr){

            var that = this;
			this.tabCount = 0;
            this.currContext=null;
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
				// TODO переделать uccelloClt.pvt.guids.
                uccelloClt.getSysDB().subscribeRoots(uccelloClt.pvt.guids.sysRootGuid, function(result){
                    renderControls();
                    that.getContexts();
                }, function() {} );
            }


            /**
             * Рендер контролов
             * @param cm
             * @param renderRoot
             */
            window.renderControls = function(cm, renderRoot) {
                var roots = [];
                roots = cm? [that.currRoot] : (renderRoot?[renderRoot]:that.rootsGuids);
				var options = [];
                for(var i=0, len=roots.length; i<len; i++) 
					options.push( {rootContainer: '#result'+that.rootsContainers[roots[i]]});
               
                if (roots.length > 0)
					uccelloClt.getContext().renderForms(roots, options,true);
   /*                 cm = uccelloClt.getContextCM(roots[i]);
					if (cm)
						cm.render(undefined, {rootContainer: '#result'+that.rootsContainers[roots[i]]},true);
                }
*/
                // редактирование ячеек грида
                $(".divCell").editable(function(value, settings) {
                    return(value);
                }, {
                    type    : 'textarea',
                    submit  : 'OK',
                    placeholder: '',
                    width      : '100px',
                    height     : '20px'
                });
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
				//uccelloClt.getController().genDeltas(cm.getDB().getGuid());
				sendDeltas(false);
                renderControls(cm);
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
                renderControls(cm);
            }

            /**
             * Получить  получить на клиент от сервера структуру - все сессии с номерами и когда созданы,
             * все коннекты этих сессий - с номерами и когда созданы - и чтобы эту инфо можно было вывести
             * в мемо поле по кнопке (трассировка)
             */
            window.getSessions = function() {
                uccelloClt.getClient().socket.send({action:"getSessions", type:'method'}, function(result){
                    console.log(result);
                    $('#result').append('<p>' + JSON.stringify(result.sessions) + ' </p>');
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
                    result.guids = result.length? result: result.guids;
                    for (var i=0; i<result.guids.length; i++) {
                        that.createTab(result.guids[i]);
                        //renderControls(null, result.guids[i]);
                    }
                    that.currContext = result.vc;
                    that.currRoot = that.rootsGuids[0];
                    that.setAutoSendDeltas(true);
                    that.getContexts();
                    return that.rootsContainers;
                });
            }

			
            /**
             * Создать клиентский контекст
             * @param guid
             */
            window.createClientContext = function(guid) {
                uccelloClt.createContext('client', uccelloClt.getController().guid(), function(){
                });
            },


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
                that.currContext = params.guid;
                that.clearTabs();
                uccelloClt.setContext(params, function(result) {
                    result.guids = result.length? result: result.guids;
					for (var i=0; i<result.guids.length; i++) {
						that.createTab(result.guids[i]);
						renderControls(null, result.guids[i]);
					}
					that.currRoot = that.rootsGuids[0];
                    that.setAutoSendDeltas(true);
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
				uccelloClt.getContext().loadNewRoots([formGuid] /*uccelloClt.getController().guid()]*/,{rtype:"res"},function(result){
                    that.rootsGuids.push(result.guids[0]); 
					that.createTab(result.guids[0]);
					renderControls(null, result.guids[0]);
					
				});
            }


            /**
             * Кнопка query
             */
            window.loadQuery = function(rootGuid){
                if (!that.currContext) return;
				uccelloClt.getContext().loadNewRoots([rootGuid],{rtype:"data"}, function(result){
                    var cm = uccelloClt.getContextCM(that.currRoot);
                    var db = cm.getDB();
                    if (result.guids && result.guids.length>0) {
                        var dataset = cm.getByName("Dataset");
                        dataset.root(result.guids[0]);
						sendDeltas(false);
						renderControls();
                    }
                });
            }

            /**
             * Сериализовать форму и вывести в консоль
             */
            window.serializeForm = function(){
                if (!that.currContext) return;
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
                            sel.val(that.currContext);
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

                that.currContext = $(this).val();
                var vc = $(this).find('option[value="'+that.currContext+'"]').data('ContextGuid');

                // создавать при выборе контекста
                var createForm = $('#createForm').is(':checked');
                // гуид выбранной формы
                var formGuid = $('#selForm').val();

                // запросить гуиды рутов
                uccelloClt.getClient().socket.send({action:"getRootGuids", db:that.currContext, rootKind:'res', type:'method'}, function(result) {
                    that.rootsGuids = result.roots;
                    that.createTabs();
                    that.selectContext({masterGuid: that.currContext, vc:vc,  side: "server"});
                });
            });

            $('#autoSendDelta').click(function(e){
                  that.setAutoSendDeltas(false);
            });

            // ----------------------------------------------------------------------------------------------------

        }
    );
});

