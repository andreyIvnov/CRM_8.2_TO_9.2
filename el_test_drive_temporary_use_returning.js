(function (el_test_drive_temporary_use_returning) {

    //To Check -> I i can use formcontext as global variable:
    //var formContext;

    var commons;
    var isTablet = false;
    var tabletDileyOnMlSec = 100;


    el_test_drive_temporary_use_returning.onLoad = function (executionContext) {
        try {
            commons = new elad_commons();
            // formContext = executionContext.getFormContext();
            commons.SetFormContext(executionContext.getFormContext());

            isTablet = commons.IsMobile();

            el_test_drive_temporary_use_returning.onLoadEvents();
            el_test_drive_temporary_use_returning.onChangeEvents();

        } catch (err) {
            var errMess = "ERROR on el_test_drive_temporary_use_returning.onLoad(): " + err.message;
            if (isTablet) {
                window.alert(errMess)
            } else {
                commons.PageErrorHandler(err, "el_test_drive_temporary_use_returning.onLoad");
            }
        }
    }


    el_test_drive_temporary_use_returning.onLoadEvents = function () {
        el_test_drive_temporary_use_returning.updateSectionWithWebresource('WebResource_full_car_boards_for_markering_01')
        el_test_drive_temporary_use_returning.licensePlateValidator();
        el_test_drive_temporary_use_returning.setElementsVisibilityOnLoad();
        el_test_drive_temporary_use_returning.onExistedReturningSignatureLogic();
        el_test_drive_temporary_use_returning.hidingFieldsOfBMC();
    }


    el_test_drive_temporary_use_returning.onChangeEvents = function () {
        commons.AddOnChangeMultipleFields(["el_s_signature_after", "el_s_signature_of_recipient"], el_test_drive_temporary_use_returning.onExistedReturningSignatureLogic);

        commons.AddOnChange('el_s_seted_harms_when_returning', el_test_drive_temporary_use_returning.updateWhenReturningHarmsImg);
        commons.AddOnChange('el_s_license_number', el_test_drive_temporary_use_returning.licensePlateValidator)
        commons.AddOnChange('el_id_model', el_test_drive_temporary_use_returning.chargingKitSectionVisibility)
        commons.AddOnChange("el_id_the_kit_serial_number", el_test_drive_temporary_use_returning.checkIfChargingKitMostBeReturned)
    }


    /*
    *  Method refresh a Malfanctions picture when a customer return the car
    */
    el_test_drive_temporary_use_returning.updateWhenReturningHarmsImg = function () {
        el_test_drive_temporary_use_returning.updateSectionWithWebresource('WebResource_the_harms_when_returned');
    }

    el_test_drive_temporary_use_returning.onExistedReturningSignatureLogic = function () {

        var customerOnReturningSignature = commons.GetFieldValue('el_s_signature_after');
        var recipientOnReturningSignature = commons.GetFieldValue('el_s_signature_of_recipient');
        var allRequiredFieldsArePopulated = commons.allRequiredFieldsArePopulated();

        if (customerOnReturningSignature)
            commons.SetVisible('WebResource_full_car_boards_for_markering_01', false);

        if (customerOnReturningSignature && recipientOnReturningSignature && allRequiredFieldsArePopulated) {
            commons.LockAllFieldsInForm();
        }

    }

    el_test_drive_temporary_use_returning.setElementsVisibilityOnLoad = function () {
        if (!isTablet)
            el_test_drive_temporary_use_returning.notTabletFormLogic();

        el_test_drive_temporary_use_returning.chargingKitSectionVisibility()
    }

    /**
    ** Method show the elements only on Tablet
    **/
    el_test_drive_temporary_use_returning.notTabletFormLogic = function () {
        //If is a returning BUT not tablet
        commons.SetVisible('WebResource_full_car_boards_for_markering_01', false);
        commons.SetVisible('el_s_signature_after', false);
        commons.SetVisible('el_s_signature_of_recipient', false);
    }

    el_test_drive_temporary_use_returning.licensePlateValidator = function () {
        if (!el_test_drive_temporary_use_returning.IsOnlyDigitsAndDashes(commons.GetFieldValue("el_s_license_number"))) {
            commons.SetNotification("el_s_license_number", Const.Message.Hebrew.ALicenseNumberMustContainOnlyDigitsAndADashes, "el_s_license_number_noti");
        }
        else {
            commons.ClearNotification("el_s_license_number", "el_s_license_number_noti");
        }
    }

    //To Check -> check in iPad if and how to do it useble
    el_test_drive_temporary_use_returning.updateSectionWithWebresource = function (sectionNameToRefresh) {
        var webResourceControl = parent.Xrm.Page.getControl(sectionNameToRefresh);
        if (webResourceControl && webResourceControl.getSrc() != null) {
            var src = webResourceControl.getSrc();
            webResourceControl.setSrc(null);
            setTimeout(function () { webResourceControl.setSrc(src) }, tabletDileyOnMlSec);
        }

    }


    //To Check -> retrievieng and usege of data
    el_test_drive_temporary_use_returning.hidingFieldsOfBMC = function () {
        debugger;
        var currentModelId = commons.GetLookupId('el_id_model');
        if (currentModelId) {
            commons.RetrieveRecord("el_model", currentModelId, "?$select=el_id_manufacturer")
                .then(
                    function sucess(result) {
                        if (result && result.el_id_manufacturer && result.el_id_manufacturer.Name == "BMC") {
                            commons.SetSectionVisibility("tab_3", "section_charging_kit", false);
                        }
                        else {
                            commons.SetSectionVisibility("tab_3", "section_charging_kit", true);
                        }
                    },
                    err => {
                        commons.SetFormNotification("Error on retrieving el_dodel into el_test_drive_temporary_use_returning.hidingFieldsOfBMC(): " + err.message, commons.FormNotificationLevel.ERROR, "el_test_drive_temporary_use_returning.hidingFieldsOfBMC")
                    }
                )
        }
        else
            commons.SetSectionVisibility("tab_3", "section_charging_kit", true);

    }

    el_test_drive_temporary_use_returning.chargingKitSectionVisibility = function () {
        var currentModelId = commons.GetLookupId('el_id_model');
        if (currentModelId) {
            commons.RetrieveRecord("el_model", currentModelId, "?$select=el_l_engine_type")
                .then(
                    function sucess(result) {
                        if (result && result.el_l_engine_type && result.el_l_engine_type.Value === Enum.el_model.el_l_engine_type.Electric) {
                            commons.SetSectionVisibility("tab_3", "section_charging_kit", true);
                            el_test_drive_temporary_use_returning.checkIfChargingKitMostBeReturned();
                        }
                        else {
                            commons.SetSectionVisibility("tab_3", "section_charging_kit", false);
                        }
                    },
                    err => {
                        commons.SetFormNotification("Error on retrieving el_dodel into el_test_drive_temporary_use_returning.chargingKitSectionVisibility(): " + err.message, commons.FormNotificationLevel.ERROR, "el_test_drive_temporary_use_returning.chargingKitSectionVisibility")
                    }
                )
        }
        else
            commons.SetSectionVisibility("tab_3", "section_charging_kit", false);

    }

    el_test_drive_temporary_use_returning.checkIfChargingKitMostBeReturned = function () {
        if (!commons.GetLookupId("el_id_the_kit_serial_number")) {
            commons.SetRequiredLevel("el_b_has_a_charging_kit_been_returned", "none")
            commons.SetVisible("el_b_has_a_charging_kit_been_returned", false)
        }
        else {
            commons.SetRequiredLevel("el_b_has_a_charging_kit_been_returned", "required")
            commons.SetVisible("el_b_has_a_charging_kit_been_returned", true)
        }
    }

    //To Check -> Check if a replecemant is correct to On-Prame
    el_test_drive_temporary_use_returning.ribbonOpenDoc = function (urlField) {
        // var url = Xrm.Page.getAttribute(urlField);
        // if (url && url.getValue()) {
        //     var win = window.open(Xrm.Page.context.getClientUrl() + '/webresources/el_open_document.htm?data=' + encodeURIComponent(url.getValue()), "_blank", "status=0,resizable=1,top=100,left=100,width=400px,height=300px");

        // }

        commons.PageClearMessages("el_test_drive_temporary_use_returning.ribbonOpenDoc => NavigateTo()");
        var url = commons.GetFieldValue(urlField);
        if (url) {
            var pageInput = {
                pageType: "webresource",
                webresourceName: "el_open_document.html", //Point to problem -> schem name or name
            };

            var navigationOptions = {
                target: 2, // 2 opens the page as a modal dialog
                width: 400,
                height: 300,
                position: 1 // 1 for center, 2 for side pane
            };

            commons.NavigateTo(pageInput, navigationOptions)
                .then(
                    null,
                    error => {
                        console.error(error);
                        commons.SetFormNotification("Error on el_test_drive_temporary_use_returning.ribbonOpenDoc => NavigateTo()", commons.FormNotificationLevel.ERROR, "el_test_drive_temporary_use_returning.ribbonOpenDoc => NavigateTo()");
                    }
                )
        }
    }

    el_test_drive_temporary_use_returning.allRequiredFieldsArePopulated = function () {
        var attributes = commons.GetAllFieldsOnForm();
        attributes.forEach(attr => {
            if (attr.getRequiredLevel() === "required") {
                if (attr.getValue() === null) {
                    return false;
                }
            }
        });
        return true;
    }

    el_test_drive_temporary_use_returning.IsOnlyDigitsAndDashes = function (licensePlateNumbe) {
        if (licensePlateNumbe && !licensePlateNumbe.match(/^[0-9\-]*$/)) {
            return false;
        }
        return true;
    }


})((window.el_test_drive_temporary_use_returning = window.el_test_drive_temporary_use_returning || {}))