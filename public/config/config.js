var config = {};
config.controls = [
    {className:'DataControl', component:'uccello/controls/aDataControl', guid:'2c132fd-c6bc-b3c7-d149-27a926916216'},
    {className:'DataFieldControl', component:'uccello/controls/aDataFieldControl', guid:'2c132fd-c6bc-b3c7-d149-27a926916216'},
    {className:'DataRoot', component:'uccello/dataman/dataRoot', guid:'87510077-53d2-00b3-0032-f1245ab1b74d'},
    {className:'DataContact', component:'uccello/dataman/dataContact', guid:'73596fd8-6901-2f90-12d7-d1ba12bae8f4'},
    {className:'DataContract', component:'uccello/dataman/dataContract', guid:'08a0fad1-d788-3604-9a16-3544a6f97721'},
    {className:'DataCompany', component:'uccello/dataman/dataCompany', guid:'59583572-20fa-1f58-8d3f-5114af0f2c514'},
    {className:'DataAddress', component:'uccello/dataman/dataAddress', guid:'16ec0891-1144-4577-f437-f98699464948'},
    {className:'ADataModel', component:'uccello/controls/aDataModel', guid:'5e89f6c7-ccc2-a850-2f67-b5f5f20c3d47'},
    {className:'Dataset', component:'uccello/controls/dataset', guid:'3f3341c7-2f06-8d9d-4099-1075c158aeee'},
    {className:'Container', component:'ProtoControls/container', viewsets:['simpleview'], guid:'1d95ab61-df00-aec8-eff5-0f90187891cf'},
    {className:'Button', component:'ProtoControls/button', viewsets:['simpleview'], guid:'af419748-7b25-1633-b0a9-d539cada8e0d'},
    {className:'DataGrid', component:'ProtoControls/dataGrid', viewsets:['simpleview'], guid:'ff7830e2-7add-e65e-7ddf-caba8992d6d8'},
    {className:'DataEdit', component:'ProtoControls/dataEdit', viewsets:['simpleview'], guid:'affff8b1-10b0-20a6-5bb5-a9d88334b48e'},
    {className:'DbNavigator', component:'ProtoControls/dbNavigator', viewsets:['simpleview'], guid:'38aec981-30ae-ec1d-8f8f-5004958b4cfa'},
    {className:'Edit', component:'ProtoControls/edit', viewsets:['simpleview'], guid:'f79d78eb-4315-5fac-06e0-d58d07572482'},
    {className:'MatrixGrid', component:'ProtoControls/matrixGrid', viewsets:['simpleview'], guid:'827a5cb3-e934-e28c-ec11-689be18dae97'},
    {className:'PropEditor', component:'ProtoControls/propEditor', viewsets:['simpleview'], guid:'a0e02c45-1600-6258-b17a-30a56301d7f1'},
    {className:'Label', component:'ProtoControls/label', viewsets:['simpleview'], guid:'32932036-3c90-eb8b-dd8d-4f19253fabed'}
];

// для клиентской обработки
if (module == undefined) var module = {};
module.exports = config;