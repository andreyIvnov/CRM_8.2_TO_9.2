(function (el_contact) {
    var customerTypeCode = {
        Ricipient: 18 //נמען
    }
    var commons;

    el_contact.onLoad = function (executionContext) {
        try {

            debugger;

            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_contact.onLoadEvents();

        } catch (error) {
            commons.PageErrorHandler(error, "el_contact.onLoad");
        }
    }

    el_contact.onLoadEvents = function () {

    }

    el_contact.updateContactLookupOnIncidentForm = function () {
        const contactid = commons.GetCurrentEntityId();
        const name = commons.GetFieldValue("fullname");

        const contactOpener = commons.GetOpenerEntityInfo();
        if (contactOpener) {
            if (contactOpener.openerType === "incident" && contactOpener.setContactLookup) {
                contactOpener.setContactLookup(contactid, name);
            }
        }

    }


    el_contact.setFieldsVisibility = function (fieldsArr, isVisible) {
        try {
            if (fieldsArr && fieldsArr.length > 0) {
                fieldsArr.map(fieldName => {
                    commons.SetVisible(fieldName, isVisible);
                })
            }
        } catch (error) {
            commons.SetFormNotification("Error on el_contact.setFieldsVisibility(): " + error.message, commons.FormNotificationLevel.ERROR, "el_contact.setFieldsVisibility()");
        }
    }



    el_contact.Ribbon = el_contact.Ribbon || {};

    el_contact.Ribbon.contactSaveAndCLose = function (primaryControl) {
        debugger;

        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        commons.Save().then(
            function () {
                window.setTimeout(
                    function () {
                        el_contact.updateContactLookupOnIncidentForm();
                        commons.ClosePage();
                    }, 500);
            });
    }

    el_contact.Ribbon.EnableRules = el_contact.Ribbon.EnableRules || {};

    el_contact.Ribbon.EnableRules.contactShowSaveAndCloseButton = function (primaryControl) {
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        const openerInfo = commons.GetOpenerEntityInfo();
        if (openerInfo.openerType === "incident") {
            return true;
        }
        return false;
    }

})(window.el_contact = window.el_contact || {})
