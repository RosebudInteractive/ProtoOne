requirejs.config({
    baseUrl: 'public',
    nodeRequire: require,
    paths: {
        text       : '/public/uccello/uses/text',
        underscore : '/public/uccello/uses/underscore'
    }
}); 

var uccelloClt = null, DEBUG = false, perfomance={now:function(){return Date.now();}}, logger = {info:function(msg){console.log(msg);}};

// когда документ загружен
$(document).ready( function() {
    require(['./uccello/config/config'], function(Config){
        var config = {
            controls: [
                {className:'RootAddress', component:'../DataControls/rootAddress', guid:'07e64ce0-4a6c-978e-077d-8f6810bf9386'},
                {className:'RootCompany', component:'../DataControls/rootCompany', guid:'0c2f3ec8-ad4a-c311-a6fa-511609647747'},
                {className:'RootContact', component:'../DataControls/rootContact', guid:'ad17cab2-f41a-36ef-37da-aac967bbe356'},
                {className:'RootContract', component:'../DataControls/rootContract', guid:'4f7d9441-8fcc-ba71-2a1d-39c1a284fc9b'},
                {className:'RootIncomeplan', component:'../DataControls/rootIncomeplan', guid:'194fbf71-2f84-b763-eb9c-177bf9ac565d'},
                {className:'RootLead', component:'../DataControls/rootLead', guid:'31c99003-c0fc-fbe6-55eb-72479c255556'},
                {className:'DataContact', component:'../DataControls/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
                {className:'DataContract', component:'../DataControls/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
                {className:'DataCompany', component:'../DataControls/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c51'},
                {className:'DataAddress', component:'../DataControls/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
                {className:'DataLead', component:'../DataControls/dataLead', guid:'86c611ee-ed58-10be-66f0-dfbb60ab8907'},
                {className:'DataIncomeplan', component:'../DataControls/dataIncomeplan', guid:'56cc264c-5489-d367-1783-2673fde2edaf'},
                {className:'DbNavigator', component:'dbNavigator', viewset:true, guid:'38aec981-30ae-ec1d-8f8f-5004958b4cfa'},
                {className:'MatrixGrid', component:'matrixGrid', viewset:true, guid:'827a5cb3-e934-e28c-ec11-689be18dae97'},
                {className:'PropEditor', component:'propEditor', viewset:true, guid:'a0e02c45-1600-6258-b17a-30a56301d7f1'},
                {className:'Container', viewset:true},
                {className:'CContainer', viewset:true},
                {className:'HContainer', viewset:true},
                {className:'VContainer', viewset:true},
                {className:'GContainer', viewset:true},
                {className:'FContainer', viewset:true},
                {className:'Form', viewset:true},
                {className:'Button', viewset:true},
                {className:'DataGrid', viewset:true},
                {className:'DataEdit', viewset:true},
                {className:'Edit', viewset:true},
                {className:'Label', viewset:true}
            ],
            controlsPath: 'ProtoControls/',
            uccelloPath: 'uccello/',
            viewSet: {name: 'simpleview', path:'ProtoControls/simpleview/'},
            webSocketServer: {port:webSocketServerPort?webSocketServerPort:null}
        };
        UCCELLO_CONFIG = new Config(config);

    require(
        ['./uccello/uccelloClt', './uccello/connection/commClient'],
        function(UccelloClt, CommunicationClient){

            setTimeout(function(){

            var that = this;
			this.tabCount = 0;
            this.currRoot=null;
            this.rootsGuids=[];
            this.rootsContainers={};
            this.resultForm = '#result0';
            window.isHashchange = true;

            this.clearTabs = function() {
                $(that.resultForm).empty();
                that.tabCount = 0;
                that.rootsContainers = {};
                that.rootsGuids = [];
                that.resultForm = '#result0';
                $('#tabs').empty();
                $('#container').empty();
            }

            this.setContextUrl = function(context, formGuids, change) {
                if (!change)
                    window.isHashchange = false;
                document.location = that.getContextUrl(context, formGuids);

            }

            this.getContextUrl = function(context, formGuids, timeout) {
                var location = document.location.href;
                location = location.replace(/#.*/, '');
                location = location.replace(/\?runtest=1/, '?runtesttab=1');
                formGuids = !formGuids || formGuids=='all'?'all':formGuids;
                if (formGuids !='all' && typeof formGuids == "string") formGuids = [formGuids];
                formGuids = !formGuids || formGuids=='all'?'all':formGuids.join(',');
                return location+'#context='+context+(formGuids=='all'?'':'&formGuids='+formGuids)+(timeout?'&timeout='+timeout:'');
            }

            /**
             * Выбрать контекст
             * @param guidcd
             */
            this.selectContext = function(params, cb) {
                that.clearTabs();
                uccelloClt.setContext(params, function(result) {
                    that.setContextUrl(params.vc, params.urlFormGuids?params.urlFormGuids:params.formGuids);
                    that.setAutoSendDeltas(true);
                    that.getContexts();
                    that.getDatasets();
                    if (cb) cb(result);
                }, that.renderRoot);
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

                if (i==0) {
                    that.currRoot = that.rootsGuids[0];
                    $('title').html('Uccello - ' + $('#selForm').find('option[value="'+that.rootsGuids[0].substring(0, 36)+'"]').html());
                }

                return {rootContainer: "#result"+i};
            }

            /**
             * Получить контексты и отобразить в комбо
             */
            this.getContexts = function() {
                var sel = $('#userContext');
                var selOn = $('#userContextOn');
                sel.empty();
                selOn.empty();
                selOn.append('<option value=""></option>');

                this.addColItems(uccelloClt.getSysCM(), "VisualContext", "server");
                this.addColItems(uccelloClt.getClientCM(), "VisualContext", "client");

                // выбрать контекст
                var contextGuid = uccelloClt.getContext()? uccelloClt.getContext().contextGuid(): null;
                if (contextGuid) {
                    var urlGuids = url('#formGuids');
                    urlGuids = urlGuids==null || urlGuids=='all'?'all':urlGuids.split(',');
                    that.setContextUrl(contextGuid, urlGuids);
                }
                sel.val(contextGuid+(urlGuids && urlGuids.length==1?','+urlGuids[0]:''));
            }

            this.addColItems = function(cm, colName, side) {
                var sel = $('#userContext');
                var selOn = $('#userContextOn');
                var db = cm; //.getDB();
                for (var i = 0, len = db.countRoot(); i < len; i++) {
                    var root = db.getRoot(i);
                    var obj = root.obj;
                    for (var j = 0, len2 = obj.countCol(); j < len2; j++) {
                        var col = obj.getCol(j);
                        var name = col.getName();
                        if (name == colName) {
                            for (var k = 0, len3 = col.count(); k < len3; k++) {
                                var item = col.get(k);
                                var option = $('<option/>');
                                var isOn = cm.get(item.getGuid()).isOn();
                                option.data('Side', side);
                                option.val(item.contextGuid()).html(item.name()+(isOn?' isOn ':'')+' '+side);
                                sel.append(option);
                                if (isOn) {
                                    var option = $('<option/>');
                                    option.data('Side', side);
                                    option.val(item.contextGuid()).html(item.name()+' '+side);
                                    selOn.append(option);
                                }

                                var colRes = item.getCol('Resources');
                                for (var n = 0, len4 = colRes.count(); n < len4; n++) {
                                    var res = colRes.get(n);
                                    var option = $('<option/>');
                                    option.data('DataBase', item.dataBase());
                                    option.data('ResGuid', res.resGuid());
                                    option.data('Side', side);
                                    option.val(item.contextGuid()+','+res.resGuid()).html('&nbsp;&nbsp;&nbsp;&nbsp;' + res.title());
                                    sel.append(option);
                                }
                            }
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

            /**
             * Колбе для отрытия новой формы в новой закладке
             * @param data
             */
            this.newTab = function(data) {
                window.open(that.getContextUrl(data.contextGuid, data.resGuids, $('#addTimeout').is(':checked')?10000:false));
            }


                    
            var commClient = new CommunicationClient.Client(UCCELLO_CONFIG.webSocketClient);
            uccelloClt = new UccelloClt({
                host:"ws://"+url('hostname')+":8081",
                callback: function(){
                    var user = uccelloClt.getUser();
                    if (user) {
                        that.getContexts();
                        $('#login').hide(); $('#logout').show();$('#loginForm').hide();
                        $('#userInfo').html('User: '+user.name()+' <br>Session:'+uccelloClt.getSessionGuid()+'  <a id="copySession" href="#" >copy</a>');

                        $('#copySession').zclip({
                            path:'/public/libs/zclip/ZeroClipboard.swf',
                            copy:function(){return uccelloClt.getSessionGuid();},
                            beforeCopy:function(){},
                            afterCopy:function(){}
                        });

                        var vc = url('#context');
                        var vcObj = uccelloClt.getSysCM().get(vc);
                        var formGuids = url('#formGuids') ? url('#formGuids').split(',') : null;
                        if (formGuids) {
                            that.selectContext({vc:vc,  side: 'server', formGuids:formGuids}, function(){
                                uccelloClt.createRoot(formGuids, "res", null, vcObj);

                                // тест
                                if (url('?runtesttab'))
                                    setTimeout(runTestTab, 4000);

                            });
                        } else {
                            that.selectContext({vc:vc,  side: 'server'});
                        }

                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#userInfo').html('');
                    }

                    // тест
                    if (url('?runtest')) {
                        runLoadTest();
                    }

                },
                newTabCallback: that.newTab,
                commClient: commClient
            });

            /**
             * Получить датасеты текущего контекста и отобразить в комбо
             */
            this.getDatasets = function() {
                var sel = $('#contextDatasets');
                var dataModel = uccelloClt.getContextCM().getByName('DataModel');
                if (!dataModel) return;
                //var datasets = uccelloClt.getContextCM().getByName('DataModel').getObj().getCol('Datasets');
				var datasets = uccelloClt.getContextCM().getByName('DataModel').getCol('Datasets');
                sel.empty();
                for (var j = 0, len2 = datasets.count(); j < len2; j++) {
                    var item = datasets.get(j);
                    var option = $('<option/>');
                    option.val(item.getGuid()).html(item.name());
                    sel.append(option);
                }
            }

            // --------------------------------------------------------------------------------------------------------
            // --------------------- Глобальные методы для кнопок управления -----------------------------------------
            // --------------------------------------------------------------------------------------------------------

            /**
             * Логин
             * @param name
             * @param pass
             */
            window.login = function(name, pass, done){
                var session = $.cookie('session_'+name)? JSON.parse($.cookie('session_'+name)): {guid:uccelloClt.getSessionGuid(), deviceName:'MyComputer', deviceType:'C', deviceColor:'#6ca9f0'};
                uccelloClt.getClient().authenticate({user:name, pass:pass, session:session}, function(result){
                    if (result.user) {
                        $.cookie('session_'+name, JSON.stringify(result.user.session), { expires: 30 });
                        uccelloClt.subscribeUser(function(result2){
                            if (!result2) {
                                $('#logout').hide(); $('#login').show();
                                $('#loginError').html('Ошибка подписки').show();$('#userInfo').html('');
                            } else {
                                that.getContexts();
                                $('#login').hide(); $('#logout').show();$('#loginForm').hide();$('#loginError').hide();
                                $('#userInfo').html('User: '+result.user.user+' <br>Session:'+uccelloClt.getSessionGuid()+' <a id="copySession" href="#" >copy</a>');
                                $('#copySession').zclip({
                                    path:'/public/libs/zclip/ZeroClipboard.swf',
                                    copy:function(){return uccelloClt.getSessionGuid();},
                                    beforeCopy:function(){},
                                    afterCopy:function(){}
                                });
                            }
                            if (done)
                                done(true);
                        });
                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#loginError').html('Неправильный логин или пароль').show();
                        $('#userInfo').html('');
                        if (done)
                            done(false);
                    }
                });
            }

            /**
             * Выход
             */
            window.logout = function(){
                uccelloClt.deauthenticate(function(result){
                    $('#login').show(); $('#logout').hide();
                    $('#userInfo').html('');$('#loginForm').show();
                });
            }

            /**
             * Отправить дельту
             * @param force {bool} Всегда отправлять
             */
            window.sendDeltas = function (force) {
                if ($('#autoSendDelta').is(':checked') || force)
					uccelloClt.getController().genDeltas(uccelloClt.getContextCM(that.currRoot).getGuid());
                    //uccelloClt.getController().genDeltas(uccelloClt.getContextCM(that.currRoot).getDB().getGuid());
            }

            /**
             * Создать серверный контекст
             * @param formGuids массив гуидов ресурсов, который загружается в контекст
             */
            window.createContext = function(formGuids) {
                if (!formGuids) formGuids = ['88b9280f-7cce-7739-1e65-a883371cd498']; // по умолчанию "test"
                uccelloClt.createContext('server', formGuids, function(result){
                    that.selectContext({vc:result.vc, side:result.side, formGuids:result.roots, urlFormGuids:'all'});
                });
            }

            /**
             * Создать клиентский контекст
             * @param guid
             */
            window.createClientContext = function(formGuids) {
                if (!formGuids) formGuids = ['88b9280f-7cce-7739-1e65-a883371cd498']; // по умолчанию "test"
                uccelloClt.createContext('client', formGuids, function(result){
                    that.selectContext({vc:result.vc, side:result.side, formGuids:result.formGuids});
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
                $('title').html('Uccello - ' + $('#selForm').find('option[value="'+that.currRoot.substring(0, 36)+'"]').html());
            }


            /**
             * Создать рут ресурсов (не данных)
             */
            window.createRoot = function(){
                var formGuids = $('#selForm').val();
                var context = $('#userContext').val()? $('#userContext').val().split(',')[0]: url('#context');
                var contextObj = uccelloClt.getSysCM().get(context);
                var selSub = $('#selSub').is(':checked');
                if (selSub) // открыть в новой закладке
                    uccelloClt.getClient().newTab(context, formGuids, $('#sessionGuid').val() == '' ? uccelloClt.getSessionGuid() : $('#sessionGuid').val());
                else
                    uccelloClt.createRoot(formGuids, "res");
            }

            /**
             * Сериализовать форму и вывести в консоль
             */
            window.serializeForm = function(){
                if (!uccelloClt.getContext()) return;
                var root = uccelloClt.getContextCM(that.currRoot).getObj(that.currRoot);
                console.log(uccelloClt.getContextCM(that.currRoot).serialize(root));
				/*
                var root = uccelloClt.getContextCM(that.currRoot).getDB().getObj(that.currRoot);
                console.log(uccelloClt.getContextCM(that.currRoot).getDB().serialize(root));*/
            }

            window.refreshContexts = function() {
                that.getContexts();
            }

            window.addControl = function(classGuid) {
                var cm = uccelloClt.getContextCM('89f42efa-b160-842c-03b4-f3b536ca09d8');
                var vc = uccelloClt.getContext();
                var rootCont = cm.getByName('MainContainerList');
                var obj = new (vc.getConstructorHolder().getComponent(classGuid).constr)(cm, {parent: rootCont, colName: "Children", ini:{fields:{Id:1, Name:'Button1', Caption:'SuperButton', Left:500, Top:20}} });
                cm.userEventHandler(obj, function () {

                });
            }

            that.recordid = 10000;
            window.addRecord = function() {
                var recordId = that.recordid++;
                var cm = uccelloClt.getContextCM('89f42efa-b160-842c-03b4-f3b536ca09d8');
                var datasetGuid = $('#contextDatasets').val();
                var dataset = cm.get(datasetGuid);

				cm.userEventHandler(dataset,dataset.addObject,{ fields:{Id:recordid, Name:'Record '+recordid,
                    state:'state '+recordid,
                    client:'client '+recordid,
                    companyId:recordid,
                    contact:'contact '+recordid,
                    phone:'phone '+recordid,
                    email:'email '+recordid,
                    contactId:recordid,
                    proba:recordid,
                    amount:recordid,
                    user:recordid
                }});
            }

            that.vNavigator = null;
            window.viewNavigator = function() {
                //if (!that.vNavigator){
                    require(['./ProtoControls/simpleview/vdbNavigator'], function(VDbNavigator){
                        $('#clientNav').remove();
                        that.vNavigator = VDbNavigator;
                        that.vNavigator.getLid = function(){return 'clientNav';};
                        that.vNavigator.getParent = function(){return null;};
                        that.vNavigator.top = function(){return 5;};
                        that.vNavigator.left = function(){return 3;};
                        that.vNavigator.nlevels = function(){return 3;};
                        that.vNavigator.database = null;
                        that.vNavigator.level = null;
                        that.vNavigator.rootelem = null;
                        that.vNavigator.level = function(val){if(val !== undefined) that.vNavigator.level=val; return that.vNavigator.level;};
                        that.vNavigator.dataBase = function(val){if(val !== undefined) that.vNavigator.database=val; return that.vNavigator.database;};
                        that.vNavigator.rootElem = function(val){if(val !== undefined) that.vNavigator.rootelem=val; return that.vNavigator.rootelem;};
                        that.vNavigator.getControlMgr = function(){ return uccelloClt.getContextCM(); };
                        that.vNavigator.params = {};

                        that.vNavigator.render({rootContainer:'#dbNavigatorForm'});
                        $('#clientNav').find('.dbSelector').change(function(){
                            that.vNavigator.rootelem = null;
                            that.vNavigator.render({rootContainer:'#dbNavigatorForm'});
                        });
                        $('#dbNavigatorForm').dialog('open');
                    });
                /*} else {
                    that.vNavigator.render({rootContainer:'#dbNavigatorForm'});
                    $('#dbNavigatorForm').dialog('open');
                }*/
            }



            window.runLoadTest = function(testNumContext, testNumTabs) {
                testNumContext = testNumContext?testNumContext:10,
                testNumTabs= testNumTabs?testNumTabs:10;
                // логин
                login('u1', 'p1', function(result){
                    if (result) {
                        var formGuids = ['88b9280f-7cce-7739-1e65-a883371cd498'];
                        for(var i=0; i<testNumContext; i++){
                            (function(i) {
                                setTimeout(function(){
                                    // создаем контексты формы тест
                                    uccelloClt.createContext('server', formGuids, function(result){
                                        if (testNumTabs>i) // открываем закладки
                                            uccelloClt.getClient().newTab(result.vc, result.roots, uccelloClt.getSessionGuid());
                                    });
                                }, 7000*(i));
                            })(i);
                        }
                    }
                });
            }

            window.runTestTab = function (testFreq) {
                testFreq = testFreq?testFreq:100;
                // ходим по мастеру
                var dataGrid = uccelloClt.getContextCM().getByName('DataGridCompany');
                var rows = $('#' + dataGrid.getLid()).find('.row.data');
                var selectedRow = 1;
                setInterval(function(){
                    console.timeEnd('click');
                    $(rows[selectedRow]).click();
                    selectedRow++;
                    if (selectedRow >= 10 /*rows.length*/)
                        selectedRow = 0;
                    console.time('click');
                }, testFreq);
            }

            // ----------------------------------------------------------------------------------------------------
            // ---------------------- Функции обработчики хтмл объектов -------------------------------------------

            // высота окошка результатов
            fixHeight = function() {
                var h = $(window).height();
                $('.tabs-page').height(h-125);
                $('#editor').height(h-160);
                $('#console').width('100%');
            };
            fixHeight();
            $(window).resize(fixHeight);

            // форма логина
            $('#login').click(function(e){
                e.stopPropagation();

                // автологин
                login($('#loginName').val(), $('#loginPass').val());
                return;

                // старый логин
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

            $('#openContext').click(function(){
                var vcGuid = $('#userContext').val();
                if (!vcGuid) return;
                vcGuid = vcGuid.split(',')[0];
                var option = $('#userContext').find('option[value="'+$('#userContext').val()+'"]'),
                    resGuid = option.data('ResGuid'),
                    vcSide = option.data('Side');

                if(vcGuid)
                    that.selectContext({vc:vcGuid,  side: vcSide, formGuids:resGuid?[resGuid]:'all'});
                else
                    that.clearTabs();
            });

            $('#userContextOn').change(function(){
                var vc = $(this).val();
                if(vc) {
                    var vcObj = uccelloClt.getSysCM().get(vc);
                    vcObj.off(function(){
                        that.getContexts();
                    });
                }
            });

            $('#autoSendDelta').click(function(e){
                  that.setAutoSendDeltas(false);
            });

            $(window).on('hashchange', function() {
                if (window.isHashchange) {
                    var vc = url('#context');
                    var vcObj = uccelloClt.getSysCM().get(vc);
                    var formGuids = url('#formGuids') ? url('#formGuids').split(',') : null;
                    if(vcObj && vc) {
                        if (formGuids) {
                            uccelloClt.createRoot(formGuids, "res", function (result) {
                                    that.selectContext({vc: context, side: 'server', formGuids:result.guids});
                            }, vcObj);
                        } else {
                            that.selectContext({vc:vc,  side: 'server'});
                        }
                    }
                }
                window.isHashchange = true;
            });

            $('#DataColumnContact30').click(function(){
                var cm = uccelloClt.getContextCM('89f42efa-b160-842c-03b4-f3b536ca09d8');
                var obj = uccelloClt.getContextCM('89f42efa-b160-842c-03b4-f3b536ca09d8').getByName('DataColumnContact');
                cm.userEventHandler(obj, function () {
                    obj.width(30);
                });
            });
            $('#DataColumnContact20').click(function(){
                var cm = uccelloClt.getContextCM('89f42efa-b160-842c-03b4-f3b536ca09d8');
                var obj = uccelloClt.getContextCM('89f42efa-b160-842c-03b4-f3b536ca09d8').getByName('DataColumnContact');
                cm.userEventHandler(obj, function () {
                    obj.width(20);
                });
            });


            $('#dbNavigatorForm').dialog({
                title: "Database Navigator",
                resizable: true,
                width:900,
                height:600,
                modal: true,
                autoOpen: false,
                buttons: {
                }
            });

            }, url('#timeout')?url('#timeout'):10);


            // ----------------------------------------------------------------------------------------------------

        });
    });
});