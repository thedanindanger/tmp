define('modules/ctiPlusBridge',['ui.api.v1'],
    function (UiApi) {
        var CtiPlusBridge = {};
        var plusBridgeWindow;
        CtiPlusBridge.initialize = function() {
            UiApi.Logger.debug('CtiPlusBridge', 'initialize, v1.0.0');

        };

        CtiPlusBridge.onModelLoad = function() {
            UiApi.Logger.debug('CtiPlusBridge', 'onModelLoad');
            var agentModel = UiApi.Root.Agent(UiApi.Context.AgentId);

            this.onLoginState = function () {
                UiApi.Logger.debug('CtiPlusBridge', 'onLoginState - state changed', agentModel.LoginState().get('state'));

                if (agentModel.LoginState().get('state') === 'WORKING') {
                    this.CheckForCloudBridgeSkill(agentModel);
                }
            };

            agentModel.LoginState().on('change:state', this.onLoginState, this);

            if (agentModel.LoginState().get('state') === 'WORKING') {
                this.CheckForCloudBridgeSkill(agentModel);
            }

        };

        CtiPlusBridge.onModelUnload = function() {
            UiApi.Logger.debug('CtiPlusBridge', 'onModelUnload');
            plusBridgeWindow.close();
        };

        CtiPlusBridge.CheckForCloudBridgeSkill = function (agentModel) {
            UiApi.Logger.debug('CtiPlusBridge', 'CheckForCloudBridgeSkill', 'Agent is Logged In');
            var skills = agentModel.Skills();
            skills.fetch().done(function(skills) {
                UiApi.Logger.debug('CtiPlusBridge', 'CheckForCloudBridgeSkill', 'skills returned: ', skills);
                skills.forEach(function (skill) {
                    UiApi.Logger.debug('CtiPlusBridge', 'CheckForCloudBridgeSkill', 'skill assigned: ', skill);
                    if (skill.name === 'PlusBridge') {
                        UiApi.Logger.info('CtiPlusBridge', 'CheckForCloudBridgeSkill', 'PlusBridge Skill Assigned - Establishing Plus Bridge connection');
                        var sessionStorage = localStorage.getItem('SESSION_DATA_STORAGE_KEY');
                        var sessionData = JSON.parse(sessionStorage).data;
                        var encryptedData = btoa(JSON.stringify(sessionData));

                        UiApi.Logger.debug('CtiPlusBridge', 'CheckForCloudBridgeSkill', sessionData);
                        UiApi.Logger.debug('CtiPlusBridge', 'CheckForCloudBridgeSkill', encryptedData);

                        plusBridgeWindow = window.open('http://localhost:5000/plusbridge/connect?sessiondata=' + encryptedData,
                            'Five9 Plus Bridge',
                            "width=400,height=400,left=10,top=10,menubar=no,resizable=no,location=no,scrollbars=no,status=no,toolbar=no");
                    }
                })
            })
        };

        return CtiPlusBridge;
    }
);
define('workflow/init',['ui.api.v1', 'modules/ctiPlusBridge'],
    function (UiApi, ctiPlusBridge) {
        return {
            initialize: function () {
                //Place your library initialization code here
                UiApi.Logger.debug('init:workflow:initialize');
                ctiPlusBridge.initialize();
            },

            onModelLoad: function () {
                //Place your server model subscription code here
                UiApi.Logger.debug('init:workflow:onModelLoad');
                ctiPlusBridge.onModelLoad();
            },

            onModelUnload: function () {
                //Place your cleanup code here
                UiApi.Logger.debug('init:workflow:onModelUnload');
                ctiPlusBridge.onModelUnload();
            }
        };
    });

define('3rdparty.bundle',[
    'ui.api.v1',
    'handlebars',
    'workflow/init'

    //presentations models

    //components

  ],
  function (UiApi, Handlebars, Init
) {

      UiApi.config({});



    require.config({
      map: {
        '*': {
        }
      }
    });


    Init.initialize();
    UiApi.vent.on(UiApi.PresModelEvents.WfMainOnModelLoad, function() {
      Init.onModelLoad();
    });
    UiApi.vent.on(UiApi.PresModelEvents.WfMainOnModelUnload, function() {
      Init.onModelUnload();
    });
  });
