(function (el_fictitious_addresses) {
    var commons;

    el_fictitious_addresses.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_fictitious_addresses.onLoadEvents();
            el_fictitious_addresses.onChangeEvents();
            el_fictitious_addresses.onSaveEvents();

        } catch (error) {
            commons.PageErrorHandler(error, "el_fictitious_addresses.onLoad()");
        }
    }

    el_fictitious_addresses.onLoadEvents = function () {
        el_fictitious_addresses.setLogicByFormType()
    }

    el_fictitious_addresses.onChangeEvents = function () {

    }

    el_fictitious_addresses.onSaveEvents = function () {
        commons.AddOnSave(el_fictitious_addresses.setFormAsReadOnlyIfBlockedForAcoustic);
    }

    /**
     * Method do logic based on form type (Create, Update, ....)
     */
    el_fictitious_addresses.setLogicByFormType = function () {
        var formType = commons.GetFormType();
        if (formType != Enum.FormType.Create) {
            el_fictitious_addresses.setFormAsReadOnlyIfBlockedForAcoustic();
        }
    }

    /**
     * Methodd set all form as Read Only if is blocked for Acoustic
     */
    el_fictitious_addresses.setFormAsReadOnlyIfBlockedForAcoustic = function () {
        if (commons.GetFieldValue("el_b_block_for_acoustic") == true) {
            commons.LockAllFieldsInForm();
        }
    }

})((window.el_fictitious_addresses = window.el_fictitious_addresses || {}));