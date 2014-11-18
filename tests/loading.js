
requirejs.config({
    baseUrl: 'public',
    nodeRequire: require,
    paths: {
        text       : '/public/uccello/uses/text',
        underscore : '/public/uccello/uses/underscore'
    }
});

function rand( min, max ) {
    if( max ) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        return Math.floor(Math.random() * (min + 1));
    }
}


var clientConnection = null, socket = null;
var sessionId = $.url('#sid');
var typeGuids = {};
var contextGuid = 0, currContext=null, dbcontext = null;
var uccelloClt = null;


var testNumContexts = 1;
var testNumProp = 10;

// когда документ загружен
$(document).ready( function() {
    require(
        ['../../public/uccello/uccelloClt' ],
        function(UccelloClt){

            uccelloClt = new UccelloClt({host:"ws://"+url('hostname')+":8081", sessionId:sessionId, callback: function(){
                if (uccelloClt.getLoggedUser()) {
                    $('#login').hide(); $('#logout').show();
                } else {
                    $('#logout').hide(); $('#login').show();
                }
                clientConnection = uccelloClt.getClient();
                socket = uccelloClt.getClient().socket;
                typeGuids = uccelloClt.typeGuids;

                setTimeout(function(){
                    // подписка на системную бд
                    uccelloClt.getSysDB().subscribeRoot(uccelloClt.pvt.guids.sysRootGuid, function(result){
                        console.log(getContexts())
                        var contexts = getContexts();
                        if (contexts.length==0) {
                            // создать контекст
                            uccelloClt.getClient().createSrvContext(++contextGuid, function(result){
                                selectContext(result.masterGuid, result.myRootContGuid);
                            });
                        } else {
                            selectContext(contexts[0].db, contexts[0].root);
                        }
                    });
                }, 1000);



            }});


            selectContext = function(db, root) {
                // выбрать контекст
                uccelloClt.selectContext(db, root, function() {
                    currContext = db  + '|' + root;
                    uccelloClt.getSysDB().subscribeRoot(uccelloClt.pvt.guids.sysRootGuid, function(result){

                        // все свойства всех контролов
                        var props = [];
                        var cm = uccelloClt.getContextCM();
                        var gl = cm._getCompGuidList();
                        for (var f in gl) {
                            var guid = gl[f].getGuid();
                            var comp = cm.getByGuid(guid);
                            var countProps = comp.countProps();
                            for (var i = 0; i < countProps; i++) {
                                var name = comp.getPropName(i);
                                name = name.charAt(0).toLowerCase() + name.slice(1);
                                var val = comp[name]();
                                props.push({comp:comp, guid:guid, name:name, val:val});
                            }
                        }

                        // изменение произвольным образом testNumProp свойств на клиенте
                        for(var i=0; i<testNumProp; i++) {
                            if (props[i].name != 'id')
                                props[i].comp[props[i].name](props[i].val+props[i].val)
                        }

                        // отсылка дельт на сервер
                        console.time('applyDeltas');
                        uccelloClt.getController().genDeltas(uccelloClt.getContextCM().getDB().getGuid());
                    });
                });
            }



            subscribeRootSys = function() {
                // подписываемся на корневой объект контейнера

                // TODO переделать uccelloClt.pvt.guids.
                uccelloClt.getSysDB().subscribeRoot(uccelloClt.pvt.guids.sysRootGuid, function(result){
                    renderControls();
                    getContexts();
                });
            }

            createComponent = function(obj) {
                var g = obj.getTypeGuid();
                var options = {parent:'#result'};

                // метод обработки изменений для PropEditor
                if (g == "a0e02c45-1600-6258-b17a-30a56301d7f1") {
                    options.change = function(){
                        sendDeltas();
                        renderControls();
                    };
                }

                // DbNavigator для системной бд
                if (g == "38aec981-30ae-ec1d-8f8f-5004958b4cfa") {
                    options.db = uccelloClt.getSysDB(); //myApp.dbsys;
                }

                new typeGuids[g](myApp.controlMgr, { objGuid: obj.getGuid() }, options);
            }


            renderControls = function(cm) {
                if (!cm) cm = uccelloClt.getContextCM(); //myApp.controlMgr;
                if (!cm) return;
                cm.render();
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
            addControl = function(guid, ini, cm) {

                if (!cm) cm = uccelloClt.getContextCM(); //myApp.controlMgr;
                if (!ini) {
                    ini = {fields: {"Id": addControlId, "Name": 'Component'+addControlId, "Left":"300", "Top":"150"}};
                    addControlId++;
                }

                var rootCont = null;
                var gl = cm._getCompGuidList();
                for (var f in gl)
                    if (gl[f].getClassName() == "Container") { rootCont=gl[f]; break; }

                var constr = uccelloClt.getConstr(guid);
                var control = new constr(cm, {parent: rootCont, colName: "Children", ini:ini }, {parent:'#result'});
                //myApp.controller.genDeltas(cm.getDB().getGuid());
                uccelloClt.getController().genDeltas(cm.getDB().getGuid());
                renderControls(cm);
            }

            /**
             * Получить  получить на клиент от сервера структуру - все сессии с номерами и когда созданы,
             * все коннекты этих сессий - с номерами и когда созданы - и чтобы эту инфо можно было вывести
             * в мемо поле по кнопке (трассировка)
             */
            getSessions = function() {
                socket.send({action:"getSessions", type:'method'}, function(result){
                    console.log(result);
                    $('#result').append('<p>' + JSON.stringify(result.sessions) + ' </p>');
                });
            }

            /**
             * Логин
             * @param name
             * @param pass
             */
            login = function(name, pass){
                clientConnection.authenticate(name, pass, function(result){
                    if (result.user) {
                        $('#login').hide(); $('#logout').show();
                        $('#loginForm').hide();
                        $('#loginError').hide();

                    } else {
                        $('#logout').hide(); $('#login').show();
                        $('#loginError').html('Неправильный логин или пароль').show();
                    }
                });
            }

            /**
             * Выход
             */
            logout = function(){
                clientConnection.deauthenticate(function(){
                    $('#login').show(); $('#logout').hide();
                });
                return false;
            }

            /**
             * Отправить дельту
             * @param force {bool} Всегда отправлять
             */
            sendDeltas = function (force) {
                if ($('#autoSendDelta').is(':checked') || force)
                    uccelloClt.getController().genDeltas(uccelloClt.getContextCM().getDB().getGuid());
            }

            /**
             * Получить контексты
             */
            getContexts = function() {
                var contexts = [];

                for (var i = 0, len = uccelloClt.getSysDB().countRoot(); i < len; i++) {
                    var root = uccelloClt.getSysDB().getRoot(i);
                    var obj = root.obj;
                    for (var j = 0, len2 = obj.countCol(); j < len2; j++) {
                        var col = obj.getCol(j);
                        var name = col.getName();
                        if (name == "VisualContext") {
                            for (var k = 0, len3 = col.count(); k < len3; k++) {
                                var item = col.get(k);
                                contexts.push({db:item.get('DataBase'), root:item.get('Root'), name:item.get('Name')});
                            }
                            return contexts;
                        }
                    }
                }
                return null;
            }



        }
    );
});
