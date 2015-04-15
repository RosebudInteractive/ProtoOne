({
   // appDir: "../../Uccello",
    //- this is the directory that the new files will be. it will be created if it doesn't exist
   // dir: "../../Uccello/build",
    baseUrl:"../../Uccello/",
    fileExclusionRegExp: /\.git/,
    optimize: "uglify2",
    uglify2: {
        //Example of a specialized config. If you are fine
        //with the default options, no need to specify
        //any of these properties.
        output: {
            beautify: false
        },
        mangle: false,


        compress: {
            global_defs: {
                DEBUG: false
            },
	    drop_console: true
        }
        /*,
        warnings: true,
        mangle: false*/
    },

    paths: {
        underscore: 'uses/underscore',
        text: 'uses/text',
        template: 'uses/template'
    },

    include: [
        //'../ProtoOne/public/proto1',
        'underscore',
        'text',
        'template',
        'config/config',
        'connection/clientConnection',
        'connection/connect',
        'connection/connectInfo',
        'connection/session',
        'connection/sessionInfo',
        'connection/user',
        'connection/user2',
        'connection/userInfo',
        'connection/vc',
        'connection/vcresource',
        'controls/aComponent',
        'controls/aControl',
        'controls/aDataControl',
        'controls/aDataFieldControl',
        'controls/aDataModel',
        'controls/button',
        'controls/container',
        'controls/controlMgr',
        'controls/dataColumn',
        'controls/dataEdit',
        'controls/dataField',
        'controls/dataGrid',
        'controls/dataset',
        'controls/edit',
        'controls/form',
        'controls/formParam',
        'controls/label',
        'controls/subForm',
        'controls/viewset',
        'dataman/dataRoot',
        'memDB/memCol',
        'memDB/memDataBase',
        'memDB/memDBController',
        'memDB/memMetaObj',
        'memDB/memMetaObjCols',
        'memDB/memMetaObjFields',
        'memDB/memMetaRoot',
        'memDB/memObj',
        'memDB/memObjLog',
        'memDB/memProtoObj',
        'system/event',
        'system/graphset',
        'system/rpc',
        'system/umodule',
        'system/uobject',
        'system/uobjectMgr',
        'system/utils',
        'uccelloClt'
    ],
    insertRequire: [],
    //out: "../public/libs/uccello.js"
out: "uccello.js"
})