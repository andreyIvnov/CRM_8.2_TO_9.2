(function (el_test_drive_temporary_use_handing_over) {

    //To Check -> I i can use formcontext as global variable:
    //var formContext;


    var commons;
    var isTablet = false;
    var tabletDileyOnMlSec = 100;

    el_test_drive_temporary_use_handing_over.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            // formContext = executionContext.getFormContext();
            commons.SetFormContext(executionContext.getFormContext());

            isTablet = commons.IsMobile();

            el_test_drive_temporary_use_handing_over.onLoadEvents();
            el_test_drive_temporary_use_handing_over.onChangeEvents();

        } catch (err) {
            var errMess = "ERROR on el_test_drive_temporary_use_handing_over.onLoad():\n" + err.message;
            if (isTablet) {
                window.alert(errMess)
            } else {
                commons.PageErrorHandler(err, "el_test_drive_temporary_use_handing_over.onLoad");
            }
        }
    }

    el_test_drive_temporary_use_handing_over.onChangeEvents = function () {
        commons.AddOnChange('el_s_seted_harms_upon_delivery', el_test_drive_temporary_use_handing_over.updateUponDeliveryHarmsImg);
        commons.AddOnChangeMultipleFields(["el_s_signature_of_deliveryman", "el_s_signature_before_handing_over"], el_test_drive_temporary_use_handing_over.onExistedSignatureLogic);
        commons.AddOnChange('el_s_license_number', el_test_drive_temporary_use_handing_over.licensePlateValidator)
        commons.AddOnChange('el_id_model', el_test_drive_temporary_use_handing_over.chargingKitSectionVisibility)

    }

    el_test_drive_temporary_use_handing_over.onLoadEvents = function () {
        el_test_drive_temporary_use_handing_over.setElementsVisibilityOnLoad();
        el_test_drive_temporary_use_handing_over.onExistedSignatureLogic()
        el_test_drive_temporary_use_handing_over.updateUponDeliveryHarmsImg()
        el_test_drive_temporary_use_handing_over.licensePlateValidator()
        el_test_drive_temporary_use_handing_over.hidingFieldsOfBMC();
    }

    /*
    *  Method refresh a Malfanctions picture upon delivery
    */
    el_test_drive_temporary_use_handing_over.updateUponDeliveryHarmsImg = function () {

        var webResourceControl = parent.Xrm.Page.getControl('WebResource_the_harms_upon_delivery');
        if (webResourceControl && webResourceControl.getSrc() != null) {
            var src = webResourceControl.getSrc();
            webResourceControl.setSrc(null);
            setTimeout(function () { webResourceControl.setSrc(src) }, tabletDileyOnMlSec);
        }

    }

    //To Check -> retrieved and usege of fields are correct
    el_test_drive_temporary_use_handing_over.hidingFieldsOfBMC = function () {
        var currentModelId = commons.GetLookupId('el_id_model');
        if (currentModelId) {
            commons.RetrieveRecord("el_model", currentModelId, "?$select=el_id_manufacturer")
                .then(
                    function sucess(result) {
                        if (result && result.el_id_manufacturer && ((result.el_id_manufacturer.Name == "BMC" || result.el_id_manufacturer.Name == "ZONTES"))) {
                            commons.SetSectionVisibility("tab_2", "section_charging_kit", false);
                        }
                        else {
                            commons.SetSectionVisibility("tab_2", "section_charging_kit", true);
                        }
                    },
                    err => {
                        commons.SetFormNotification("Error on retrieving el_dodel into el_test_drive_temporary_use_handing_over.hidingFieldsOfBMC(): " + err.message, commons.FormNotificationLevel.ERROR, "el_test_drive_temporary_use_handing_over.hidingFieldsOfBMC")
                    }
                )
        }
        else
            commons.SetSectionVisibility("tab_2", "section_charging_kit", true);
    }

    el_test_drive_temporary_use_handing_over.setElementsVisibilityOnLoad = function () {

        if (!isTablet)
            el_test_drive_temporary_use_handing_over.notTabletFormLogic();

        el_test_drive_temporary_use_handing_over.chargingKitSectionVisibility()
    }

    el_test_drive_temporary_use_handing_over.onExistedSignatureLogic = function () {
        //Signature upon hand over
        var customerOnHandoverSignature = commons.GetFieldValue('el_s_signature_before_handing_over');
        var deliverymanOnHandoOverSignature = commons.GetFieldValue('el_s_signature_of_deliveryman');
        var allRequiredFieldsArePopulated = el_test_drive_temporary_use_handing_over.allRequiredFieldsArePopulated();


        if (customerOnHandoverSignature) {
            commons.SetVisible('WebResource_full_car_boards_for_markering', false);
        }

        if (customerOnHandoverSignature && deliverymanOnHandoOverSignature && allRequiredFieldsArePopulated) {
            commons.LockAllFieldsInForm();
        }

    }

    /**
    ** Method show the elements only on Tablet
    **/
    el_test_drive_temporary_use_handing_over.notTabletFormLogic = function () {
        //If is a hand over BUT not tablet
        commons.SetVisible('WebResource_full_car_boards_for_markering', false);
        commons.SetVisible('el_s_signature_before_handing_over', false);
        commons.SetVisible('el_s_signature_of_deliveryman', false);
    }

    el_test_drive_temporary_use_handing_over.licensePlateValidator = function () {
        if (!el_test_drive_temporary_use_handing_over.IsOnlyDigitsAndDashes(commons.GetFieldValue("el_s_license_number"))) {
            commons.SetNotification("el_s_license_number", Const.Message.Hebrew.ALicenseNumberMustContainOnlyDigitsAndADashes, "el_s_license_number_noti");
        }
        else {
            commons.ClearNotification("el_s_license_number", "el_s_license_number_noti");
        }
    }

    //To Check -> retrieved and usege of fields are correct
    el_test_drive_temporary_use_handing_over.chargingKitSectionVisibility = function () {
        var currentModelId = commons.GetLookupId('el_id_model');
        if (currentModelId) {
            commons.RetrieveRecord("el_model", currentModelId, "?$select=el_l_engine_type")
                .then(
                    function sucess(result) {
                        if (result && result.el_l_engine_type && result.el_l_engine_type.Value === Enum.el_model.el_l_engine_type.Electric) {
                            commons.SetSectionVisibility("tab_2", "section_charging_kit", true);
                        }
                        else {
                            commons.SetSectionVisibility("tab_2", "section_charging_kit", false);
                        }
                    },
                    err => {
                        commons.SetFormNotification("Error on retrieving el_dodel into el_test_drive_temporary_use_handing_over.chargingKitSectionVisibility(): " + err.message, commons.FormNotificationLevel.ERROR, "el_test_drive_temporary_use_handing_over.chargingKitSectionVisibility")
                    }
                )
        }
        else
            commons.SetSectionVisibility("tab_2", "section_charging_kit", false);
    }

    el_test_drive_temporary_use_handing_over.allRequiredFieldsArePopulated = function () {
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

    el_test_drive_temporary_use_handing_over.IsOnlyDigitsAndDashes = function (licensePlateNumbe) {
        if (licensePlateNumbe && !licensePlateNumbe.match(/^[0-9\-]*$/)) {
            return false;
        }
        return true;
    }

})((window.el_test_drive_temporary_use_handing_over = window.el_test_drive_temporary_use_handing_over || {}))