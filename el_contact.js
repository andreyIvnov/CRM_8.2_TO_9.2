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
        el_contact.checkIfRecipient();
    }

    el_contact.updateContactLookupOnIncidentForm = function () {
        var contactid = commons.GetCurrentEntityId();
        var name = commons.GetFieldValue("fullname");

        var contactOpener = commons.GetOpenerEntityInfo();
        if (contactOpener) {
            if (contactOpener.openerType === "incident" && contactOpener.setContactLookup) {
                contactOpener.setContactLookup(contactid, name);
            }
        }

    }

    el_contact.contactShowSaveAndCloseButton = function () {
        var contactOpener = commons.GetOpenerEntityInfo();
        if (contactOpener.openerType === "incident") {
            return true;
        }
        return false;
    }

    el_contact.contactSaveAndCLose = function () {
        commons.Save().then(
            function () {
                window.setTimeout(
                    function () {
                        el_contact.updateContactLookupOnIncidentForm();
                        commons.ClosePage();
                    }, 500);
            });
    }

    el_contact.checkIfRecipient = function () {
        var isVisible = false;
        if (commons.GetFormType() !== Enum.FormType.Create) {
            if (commons.GetFieldValue("el_l_attribute") === customerTypeCode.Ricipient)
                isVisible = true;

            el_contact.setFieldsVisibility(
                [
                    "fullname",
                    "firstname",
                    "lastname",
                    "mobilephone",
                    "emailaddress1",
                    "parentcustomerid",
                    "donotsendmm",
                    "el_l_attribute",
                ],
                isVisible
            )

            commons.SetTabVisibility("annotationsTab", isVisible);
            //commons.SetTabVisibility("recipientInterestTab", isVisible);
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

})((window.el_contact = window.el_contact || {}))