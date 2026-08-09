(function (ENTITY) {
     // =====================
    // Private Global Variables
    // =====================

    var commons;
    // =====================
    // Public Form Functions
    // =====================

    ENTITY.onLoad = async function (executionContext) {
        commons = new elad_commons();
        commons.SetFormContext(executionContext.getFormContext());  
        ENTITY.setupBasicEvents();
    };

    ENTITY.onSave = async function (executionContext) {
        
    };

    ENTITY.setupBasicEvents = function () {

    
    };

     // =========================
    // Ribbon Commands
    // =========================

    ENTITY.Ribbon = {};

    ENTITY.Ribbon.function1 = function () {
    };

    ENTITY.Ribbon.function2 = function (primaryControl, agreementType) {
    };

    ENTITY.Ribbon.function3 = function (primaryControl) {
    };

    // =========================
    // Ribbon Enable Rules
    // =========================

    ENTITY.Ribbon.EnableRules = {};

    ENTITY.Ribbon.EnableRules.enableRule1 = async function (primaryControl) {
    };

    ENTITY.Ribbon.EnableRules.enableRule2 = async function (primaryControl) {
    };

    // =========================
    // Private Functions
    // =========================

    async function privatFunction1 () {
    }

})(window.ENTITY = window.ENTITY || {});