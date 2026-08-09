(function (el_test_drive) {
    var commons;
    el_test_drive.isTablet = el_test_drive.isTablet || false;
    el_test_drive.mandatoryFieldsName = el_test_drive.mandatoryFieldsName || [];

    el_test_drive.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_test_drive.onLoadEvents();

            el_test_drive.onChangeEvents();

        } catch (err) {
            if (!el_test_drive.isTablet) {
                commons.PageErrorHandler(err, "el_test_drive.onLoad")
            } else {
                window.parent.alert("ERROR on el_test_drive.onLoad():\n" + err.message)
            }
        }

    };

    el_test_drive.onLoadEvents = function () {
        el_test_drive.isTablet = commons.IsMobile();

        // SetFormByTestDriveType();
        el_test_drive.displaySignature();
        if (commons.GetFieldValue("el_s_company_rep_name")) {
            el_test_drive.setFieldsForCarFleetTestDrive();
        }
        else {
            el_test_drive.setMandatoryFields();
        }

        if (commons.GetFieldValue("el_s_signature_after")) {
            el_test_drive.lockFields();
        }

        //Most be before AddOnChange events AND after all onload events
        el_test_drive.mandatoryFieldsName = el_test_drive.GetAllMandatoryFieldsName();//Most be before AddOnChange events AND after all onload events
    }

    el_test_drive.onChangeEvents = function () {
        commons.AddOnChange("el_s_license_number", el_test_drive.validateCarLicenseNumber);
        commons.AddOnChange("el_b_international_license", el_test_drive.setLisenceNumberRequired);

        commons.AddOnChangeMultipleFields([
            "el_s_customer_first_name",
            "el_s_customer_last_name",
            "el_s_customer_idnumber",
            "el_s_customer_mobile_phone",
            "el_dt_license_expires_on",
            "el_s_driver_license_number",
            "el_dt_actual_start",
            "el_n_km_start",
            "el_s_signature",
            "el_dt_actual_end",
            "el_n_km_end",
        ], el_test_drive.updateSignatureFields);

        commons.AddOnChangeMultipleFields([...el_test_drive.mandatoryFieldsName, "el_s_signature_after"], el_test_drive.lockFields);
    };

    el_test_drive.lockFields = function () {
        if (commons.GetFieldValue("statecode") === 0) {
            if (commons.GetFieldValue("el_s_signature_after") && el_test_drive.IsAllMandatoryFieldsArePopulated() === true) {

                commons.LockAllFieldsInForm();

                commons.SetDisabled("el_s_bo_remarks", false);
                commons.SetDisabled("el_s_summary_remarks", false);
                commons.SetDisabled("el_n_survey_equipment", false);
                commons.SetDisabled("el_n_survey_safety", false);
                commons.SetDisabled("el_n_survey_performance", false);
                commons.SetDisabled("el_n_survey_comfort", false);
                commons.SetDisabled("el_n_survey_size", false);
            }
        }
    };

    el_test_drive.setLisenceNumberRequired = function () {
        if (commons.GetFieldValue("el_b_international_license")) {
            commons.SetRequiredLevel("el_s_driver_license_number", 'none');
            commons.SetRequiredLevel("el_dt_license_expires_on", 'none');
        }
        else {
            if (el_test_drive.isTablet) {
                commons.SetRequiredLevel("el_dt_license_expires_on", 'required');
                commons.SetRequiredLevel("el_s_driver_license_number", 'required');
            }
        }
    };

    el_test_drive.validateCarLicenseNumber = function () {
        const value = commons.GetFieldValue("el_s_license_number");
        if (value && !value.match(/^[0-9\-]*$/)) {
            commons.OpenAlertDialog("על מספר רישוי להכיל רק ספרות ומקף");
            commons.SetFieldValue("el_s_license_number", null);
            commons.SetFocus("el_s_license_number");
        }
    };

    el_test_drive.displaySignature = function () {
        if (!el_test_drive.isTablet) {
            commons.SetVisible("el_s_signature", false);
            commons.SetVisible("el_s_signature_after", false);
        }
    };

    el_test_drive.setMandatoryFields = function () {
        if (el_test_drive.isTablet) {
            commons.SetRequiredLevel("el_s_customer_first_name", 'required');
            commons.SetRequiredLevel("el_s_customer_last_name", 'required');
            commons.SetRequiredLevel("el_s_customer_idnumber", 'required');
            commons.SetRequiredLevel("el_s_customer_mobile_phone", 'required');
            if (!commons.GetFieldValue("el_b_international_license")) {
                commons.SetRequiredLevel("el_dt_license_expires_on", 'required');
                commons.SetRequiredLevel("el_s_driver_license_number", 'required');
            }
            commons.SetRequiredLevel("el_dt_actual_start", 'required');
            commons.SetRequiredLevel("el_n_km_start", 'required');

            commons.SetRequiredLevel("el_s_license_number", 'required');
            if (!commons.GetFieldValue("el_s_customer_first_name") || !commons.GetFieldValue("el_s_customer_last_name") || !commons.GetFieldValue("el_s_customer_idnumber")
                || !commons.GetFieldValue("el_s_customer_mobile_phone") || !commons.GetFieldValue("el_dt_license_expires_on") || !commons.GetFieldValue("el_s_driver_license_number")
                || !commons.GetFieldValue("el_dt_actual_start") || !commons.GetFieldValue("el_n_km_start") /*|| !Xrm.Page.getAttribute("el_n_year").getValue()  The Field isn't in USE*/) {
                commons.SetDisabled("el_s_signature", true);
            }
            if (!commons.GetFieldValue("el_s_signature") || !commons.GetFieldValue("el_dt_actual_end") || !commons.GetFieldValue("el_n_km_end"))
                commons.SetDisabled("el_s_signature_after", true);
        }
        el_test_drive.showHideOnCarFleetForm(false);
    };

    el_test_drive.showHideOnCarFleetForm = function (trueFalse) {

        if (commons.GetFieldValue("el_s_company_rep_name")) {
            if (commons.GetFieldValue("el_id_leasing")) {
                commons.SetVisible("el_id_company", false);
            }
            else if (commons.GetFieldValue("el_id_company")) {
                commons.SetVisible("el_id_leasing", false);
            }
        }
        else {
            commons.SetVisible("el_id_leasing", false);
            commons.SetVisible("el_id_company", false);
        }
        commons.SetVisible("el_id_account", !trueFalse);
        commons.SetVisible("el_id_company_rep", trueFalse);

    };

    el_test_drive.setFieldsForCarFleetTestDrive = function () {

        if (el_test_drive.isTablet) {
            commons.SetRequiredLevel("el_s_customer_idnumber", 'required');
            commons.SetRequiredLevel("el_s_customer_mobile_phone", 'required');
            if (!commons.GetFieldValue("el_b_international_license")) {
                commons.SetRequiredLevel("el_dt_license_expires_on", 'required');
                commons.SetRequiredLevel("el_s_driver_license_number", 'required');
            }
            commons.SetRequiredLevel("el_dt_actual_start", 'required');
            commons.SetRequiredLevel("el_n_km_start", 'required');
            commons.SetRequiredLevel("el_s_license_number", 'required');
        }

        el_test_drive.showHideOnCarFleetForm(true);

    };

    el_test_drive.updateSignatureFields = function () {
        if (el_test_drive.isTablet) {
            if (commons.GetFieldValue("el_s_customer_first_name") && commons.GetFieldValue("el_s_customer_last_name") && commons.GetFieldValue("el_s_customer_idnumber")
                && commons.GetFieldValue("el_s_customer_mobile_phone") && (commons.GetFieldValue("el_s_driver_license_number") || commons.GetFieldValue("el_b_international_license"))
                && commons.GetFieldValue("el_dt_actual_start") && commons.GetFieldValue("el_n_km_start")/* && Xrm.Page.getAttribute("el_n_year").getValue()   The Field isn't in USE */) {
                commons.SetDisabled("el_s_signature", false);
            }
            if (commons.GetFieldValue("el_s_signature") && commons.GetFieldValue("el_dt_actual_end") && commons.GetFieldValue("el_n_km_end"))
                commons.SetDisabled("el_s_signature_after", false);
        }
    };

    //To Check
    el_test_drive.ribbonOpenDoc = function (urlField) {
        commons.PageClearMessages("el_test_drive.ribbonOpenDoc => NavigateTo()");
        const url = commons.GetFieldValue(urlField);
        if (url) {

            var pageInput = {
                pageType: "webresource",
                webresourceName: "el_open_document.html", //Point to problem -> schem name or name
                data: url
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
                        commons.SetFormNotification("Error on el_test_drive.ribbonOpenDoc => NavigateTo()", commons.FormNotificationLevel.ERROR, "el_test_drive.ribbonOpenDoc => NavigateTo()");
                    }
                )

            // var win = window.open(Xrm.Page.context.getClientUrl() + '/webresources/el_open_document.htm?data=' + encodeURIComponent(url.getValue()), "_blank", "status=0,resizable=1,top=100,left=100,width=400px,height=300px");
        }
    };

    el_test_drive.GetAllMandatoryFieldsName = function () {
        try {
            let fieldsName = [];
            const context = commons.GetFormContext();

            context.getAttribute(function (attribute, index) {
                if (attribute.getRequiredLevel() === "required") {
                    fieldsName.push(attribute.getName());
                }
            });

            return fieldsName;

        } catch (error) {
            commons.SetFormNotification("Error on el_test_drive.GetAllMandatoryFieldsName: " + err.message, commons.FormNotificationLevel.ERROR, "el_test_drive.GetAllMandatoryFieldsName")
        }
    }

    el_test_drive.IsAllMandatoryFieldsArePopulated = function () {
        try {
            el_test_drive.mandatoryFieldsName.forEach(attName => {
                if (!commons.GetFieldValue(attName)) return false;
            });
            parent.Xrm.Page.getAttribute(function (attribute, index) {
                if (attribute.getRequiredLevel() == "required") {
                    if (attribute.getValue() === null) {
                        populated = false;
                    }
                }
            });

            return true;

        } catch (error) {
            commons.SetFormNotification("Error on el_test_drive.IsAllMandatoryFieldsArePopulated: " + err.message, commons.FormNotificationLevel.ERROR, "el_test_drive.IsAllMandatoryFieldsArePopulated")
        }
    }

})((window.el_test_drive = window.el_test_drive || {}))