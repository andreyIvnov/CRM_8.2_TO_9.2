(function (el_account_service) {
    var commons;

    el_account_service.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_account_service.onLoadEvents();

            el_account_service.onChangeEvents();

            el_account_service.onSaveEvents();

        } catch (error) {
            commons.PageErrorHandler(error, "el_account_service.onLoad");
        }

    }

    el_account_service.onLoadEvents = function () {
        el_account_service.setIdFieldsRequirementLevel();
        el_account_service.showBenfit();
        el_account_service.setGenderAndAddressOptional();
        el_account_service.showConnectionsNotification();
        el_account_service.setOpenLegalCaseField();

        if (commons.GetFormType() == Enum.FormType.Create) {
            el_account_service.setNameFieldValue();
        }
        //setIdTypeDefaultValue();
        el_account_service.showLegalTab();
        if (commons.GetFormType() != Enum.FormType.Create) {
            commons.SetFieldValue("el_b_service_form", true);
            commons.RefreshRibbon();
            el_account_service.disableIdDetailsFields();
        }
        if (commons.GetControl("el_b_premium_customer"))
            el_account_service.setPremiumCustomerField();

    }

    el_account_service.onChangeEvents = function () {
        commons.AddOnChangeMultipleFields(["telephone1", "telephone2", "fax"], el_account_service.validateAccountPhonesFields)
        commons.AddOnChangeMultipleFields(["el_s_first_name", "el_s_last_name"], el_account_service.setNameFieldValue);

        commons.AddOnChange("el_b_refusetoidentify", el_account_service.setIdFieldsRequirementLevel);
        commons.AddOnChange("el_s_idnumber_text", el_account_service.validateIdNumberField);
        commons.AddOnChange("el_id_type_code", el_account_service.idTypeCodeOnChange);

    }

    el_account_service.onSaveEvents = function () {
        // commons.AddOnSave(el_account_service.account_service_onSave);
    }

    el_account_service.setOpenLegalCaseField = function () {
        commons.UserHasRoleOrIsAdmin(Const.SecurityRolesName.DM_UpdateCustomerDetails)
            .then(
                function (result) {
                    if (result && result === true) {
                        commons.SetDisabled("el_b_an_open_legal_case", false);
                        commons.SetDisabled("el_b_open_charges", false);
                    } else {
                        commons.SetDisabled("el_b_an_open_legal_case", true);
                        commons.SetDisabled("el_b_open_charges", false);
                    }
                },
                err => commons.SetFormNotification("Error on setOpenLegalCaseField().UserHasRoleOrIsAdmin(): " + err.message, commons.FormNotificationLevel.ERROR, "setOpenLegalCaseField().UserHasRoleOrIsAdmin()")
            )
    }

    el_account_service.disableIdDetailsFields = function () {
        commons.PageClearMessages('OpenOrderNotification');
        commons.UserHasRoleOrIsSystemManager()
            .then(
                function (result) {
                    if (result && result === true) {
                        commons.SetDisabled("el_s_last_name", false);
                        commons.SetDisabled("el_s_first_name", false);
                        commons.SetDisabled("el_id_type_code", false);
                        commons.SetDisabled("el_s_idnumber_text", false);
                        commons.SetDisabled("el_b_refusetoidentify", false);
                        return;
                    }

                    el_account_service.accountOrders()
                        .then(
                            function (result) {
                                switch (result) {
                                    case Const.Runtime.Account.AccountHasNoOrders:
                                        commons.SetDisabled("el_s_last_name", false);
                                        commons.SetDisabled("el_s_first_name", false);
                                        commons.SetDisabled("el_id_type_code", false);
                                        commons.SetDisabled("el_s_idnumber_text", false);
                                        commons.SetDisabled("el_b_refusetoidentify", false);
                                        commons.PageClearMessages("OpenOrderNotification");
                                        break;
                                    case Const.Runtime.Account.AccountHasOrder:
                                        commons.SetDisabled("el_s_last_name", true);
                                        commons.SetDisabled("el_s_first_name", true);
                                        commons.SetDisabled("el_id_type_code", true);
                                        commons.SetDisabled("el_s_idnumber_text", true);
                                        commons.SetDisabled("el_b_refusetoidentify", true);
                                        commons.SetFormNotification(Const.Message.Hebrew.UnableToEditAnIDNumberForACustomerWhoHasOrders, commons.FormNotificationLevel.INFO, "OpenOrderNotification");

                                        break;
                                    case Const.Runtime.Account.AccountHasOpenedOrder:
                                        commons.SetDisabled("el_s_last_name", true);
                                        commons.SetDisabled("el_s_first_name", true);
                                        commons.SetDisabled("el_id_type_code", true);
                                        commons.SetDisabled("el_s_idnumber_text", true);
                                        commons.SetDisabled("el_b_refusetoidentify", true);
                                        commons.SetFormNotification(Const.Message.Hebrew.NotPossibleToEditTheIdentificationInformationForCustomerWithOpenOrder, commons.FormNotificationLevel.INFO, "OpenOrderNotification");
                                        break;
                                }
                            }
                        )
                },
                err => commons.SetFormNotification("Error on disableIdDetailsFields().UserHasRoleOrIsAdmin(): " + err.message, commons.FormNotificationLevel.ERROR, "disableIdDetailsFields().UserHasRoleOrIsAdmin()")
            )
    }

    el_account_service.setPremiumCustomerField = function () {
        commons.UserHasRoleOrIsSystemManager(Const.SecurityRolesName.DM_PremiupCustomer)
            .then(
                function (result) {
                    if (result && result === true) {
                        commons.SetDisabled("el_b_premium_customer", false);
                    }
                    else {
                        commons.SetDisabled("el_b_premium_customer", true);
                    }
                },
                err => commons.SetFormNotification("Error on setPremiumCustomerField().UserHasRoleOrIsAdmin(): " + err.message, commons.FormNotificationLevel.ERROR, "setPremiumCustomerField().UserHasRoleOrIsAdmin()")
            )
    }

    el_account_service.validateAccountPhonesFields = function () {
        try {
            var cellphone = commons.GetFieldValue("telephone1");
            var otherphone = commons.GetFieldValue("telephone2");
            var fax = commons.GetFieldValue("fax");

            if (!el_account_service.validatePhoneNumber(cellphone, Const.RegularExpression.CellphonePattern)) {
                commons.OpenAlertDialog(Const.Message.Hebrew.MobilePhoneMostContainAtLeast10DigitsAndStartWith05);
                return false;
            }
            if (!el_account_service.validatePhoneNumber(otherphone, Const.RegularExpression.OtherPhonePattern)) {
                commons.OpenAlertDialog(Const.Message.Hebrew.TheExtrosPhoneNumberMostContainAtLeast9Digits);
                return false;
            }
            if (!el_account_service.validatePhoneNumber(fax, Const.RegularExpression.FaxPattern)) {
                commons.OpenAlertDialog(Const.Message.Hebrew.TheFaxNumberMustContainAtLeast9Digits);
                return false;
            }
            return true;

        }
        catch (error) {
            commons.SetFormNotification("Error on el_account_service.validateAccountPhonesFields(): " + err.message, commons.FormNotificationLevel.ERROR, "el_account_service.validateAccountPhonesFields()");
        }

    }

    el_account_service.accountOrders = async function () {
        try {
            var accountId = commons.GetCurrentEntityId();
            if (accountId) {

                //sales opened order
                var opts = commons.Query("opportunityid", "(_customerid_value eq " + accountId + " and (statuscode eq '" + Enum.opportunity.statuscode.OpenOrder + "' or statuscode eq '" + Enum.opportunity.statuscode.FinalPayment + "')) ");
                var oppsResults = await commons.RetrieveMultipleRecords("opportunity", opts, null, true)
                if (oppsResults && oppsResults.length >= 1) {
                    return Const.Runtime.Account.AccountHasOpenedOrder;
                }

                //tradein opened order
                opts = commons.Query("el_opportunity_tradeinid", "(_el_id_account_value eq '" + accountId + "' and (statuscode eq '" + Enum.el_opportunity_tradein.statuscode.OpenOrder + "' or statuscode eq " + Enum.el_opportunity_tradein.statuscode.WaitingForAFutureCar + "')) ")//"?$select=?$filter=";
                var tradeinOpsResults = await commons.RetrieveMultipleRecords("el_opportunity_tradein", opts, null, true)
                if (tradeinOpsResults && tradeinOpsResults.length >= 1) {
                    return Const.Runtime.Account.AccountHasOpenedOrder;
                }

                //sales order
                opts = commons.Query("el_car_purchaseid", "_el_id_account_value eq '" + accountId + "'");
                var carPurchaseResults = await commons.RetrieveMultipleRecords("el_car_purchase", opts, null, true)
                if (results && results.length >= 1) {
                    return Const.Runtime.Account.AccountHasOrder;
                }

                //tradein order
                opts = commons.Query("el_tradein_dealid", "(_el_id_account_seller_value eq " + accountId + " or _el_id_as400_account_buyer_value eq " + accountId + ")");
                var tradeinDealsResults = await commons.RetrieveMultipleRecords("el_tradein_deal", opts, null, true)
                if (tradeinDealsResults && tradeinDealsResults.length >= 1) {
                    return Const.Runtime.Account.AccountHasOrder;
                }
            }

            return Const.Runtime.Account.AccountHasNoOrders;

        } catch (error) {
            commons.SetFormNotification("Error on el_account_service.accountOrders(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account_service.accountOrders()")
        }
    }

    el_account_service.showLegalTab = function () {
        var accountId = commons.GetCurrentEntityId();
        var lawsuitOpts = commons.Query("el_lawsuitid", "_el_id_customer_value eq '" + accountId + "'");
        commons.RetrieveMultipleRecords("el_lawsuit", lawsuitOpts)
            .then(
                function (results) {
                    if (results && results.length >= 1) {
                        commons.SetTabVisibility("tab_legal", true);
                    }
                    else
                        commons.SetTabVisibility("tab_legal", false);
                },
                function (error) {
                    commons.SetFormNotification("Response is failed in commons.RetrieveMultipleRecords('el_lawsuit'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveMultipleRecords("el_lawsuit")');
                }
            )
            .catch(err => commons.SetFormNotification("Error on retrieving an 'el_lawsuit' into el_account_service.showLegalTab(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account_service.showLegalTab()'))
    }

    el_account_service.setIdFieldsRequirementLevel = function () {
        ///TFS Task 23
        try {
            if (commons.GetFieldValue("el_b_refusetoidentify")) {
                if (commons.GetLookupId("el_id_type_code")) {
                    commons.SetFieldValue("el_id_type_code", null);
                    commons.SetSubmitMode("el_id_type_code", "always");
                }
                if (commons.GetFieldValue("el_s_idnumber_text")) {
                    commons.SetFieldValue("el_s_idnumber_text", null);
                    commons.SetSubmitMode("el_s_idnumber_text", "always");
                }
                if (commons.GetFieldValue("el_n_idnumber_int")) {
                    commons.SetFieldValue("el_n_idnumber_int", null);
                    commons.SetSubmitMode("el_n_idnumber_int", "always");
                }

                commons.SetDisabled("el_id_type_code", true);
                commons.SetDisabled("el_s_idnumber_text", true);
                commons.SetDisabled("el_n_idnumber_int", true);

                commons.SetRequiredLevel("el_id_type_code", "none");
                commons.SetRequiredLevel("el_s_idnumber_text", "none");

                commons.SetVisible("el_id_type_code", false);
                commons.SetVisible("el_s_idnumber_text", false);

                commons.SetDisabled("el_n_idnumber_int", true);

            }
            else {
                commons.SetDisabled("el_id_type_code", false);
                commons.SetDisabled("el_s_idnumber_text", false);
                commons.SetDisabled("el_n_idnumber_int", false);

                commons.SetRequiredLevel("el_id_type_code", "required");
                //setIdTypeDefaultValue();
                commons.SetRequiredLevel("el_s_idnumber_text", "required");
                commons.SetVisible("el_id_type_code", true);
                commons.SetVisible("el_s_idnumber_text", true);

            }
        }
        catch (error) {
            commons.SetFormNotification("Error in el_account_service.setIdFieldsRequirementLevel(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account_service.setIdFieldsRequirementLevel");
        }
    }

    el_account_service.updateAccountLookupOnIncidentForm = function () {
        var accountid = commons.GetCurrentEntityId();
        if (accountid == "")
            setTimeout(el_account_service.updateAccountLookupOnIncidentForm, 100);

        var name = commons.GetFieldValue("name");

        //To Check - check about opening an functions from opener into opened record

        // var opener = commons.GetOpener();
        // var openerName = commons.GetOpenerEntityInfo().openerType;

        // if (opener && opener.setCustomerLookup && (openerName === Const.EntityLogicalName.Incident || openerName === Const.EntityLogicalName.Lawsuit)) {
        //     opener.setCustomerLookup(accountid, name);
        // }

    }

    el_account_service.setGenderAndAddressOptional = function () {
        commons.SetRequiredLevel("el_id_address", "none");
    }

    el_account_service.accountShowSaveAndCloseButtonS = function () {
        var accountOpener = commons.GetOpenerEntityInfo();
        if (accountOpener && (accountOpener.openerType === Const.EntityLogicalName.Incident || accountOpener.openerType === Const.EntityLogicalName.Lawsuit)) {
            return true;
        }
        return false;
    }

    el_account_service.accountShowSaveAndCloseButton = function () {
        var accountOpener = commons.GetOpenerEntityInfo();
        if (accountOpener && accountOpener.openerType === Const.EntityLogicalName.Opportunity) {
            return true;
        }
        return false;
    }

    el_account_service.accountSaveAndCLoseService = function () {
        commons.Save()
            .then(function () {
                // window.setTimeout(function () {
                el_account_service.updateAccountLookupOnIncidentForm();
                commons.ClosePage();
                // }, 0);
            });
    }

    el_account_service.setNameFieldValue = function () {
        ///TFS Task 28
        try {
            var el_s_first_name = commons.GetFieldValue("el_s_first_name");
            var el_s_last_name = commons.GetFieldValue("el_s_last_name");

            var nameValue, reversedNameValue;

            if (el_s_first_name) {
                reversedNameValue = el_s_first_name + ' ' + el_s_last_name;
                nameValue = el_s_last_name + ' ' + el_s_first_name
            }
            else {
                nameValue = el_s_last_name;
                reversedNameValue = el_s_last_name;
            }
            commons.SetFieldValue("name", nameValue);
            commons.SetFieldValue("el_s_reversed_name", reversedNameValue);

            commons.SetSubmitMode("el_s_reversed_name", "always");

        }
        catch (error) {
            commons.SetFormNotification("Error on el_account_service.setNameFieldValue(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account_service.setNameFieldValue()");
        }
    }

    el_account_service.validateIdNumberField = function () {
        ///TFS Task 19
        try {
            var el_s_idnumber_text = commons.GetFieldValue("el_s_idnumber_text");
            var el_b_recognition_by_id = commons.GetFieldValue("el_b_recognition_by_id");


            if (el_s_idnumber_text != null && !commons.IsDigitsOnly(el_s_idnumber_text)) {
                commons.OpenAlertDialog(Const.Message.Hebrew.IDnumberMustContainDigitsOnly);
                commons.SetFieldValue("el_s_idnumber_text", null);
                return;
            }

            if (el_b_recognition_by_id == true) {
                if (!commons.IsValidIsraeliId(el_s_idnumber_text)) {
                    commons.OpenAlertDialog(unescape("%u200F%u200F") + Const.Message.Hebrew.PleaseEnterAValidID + unescape("%u200F"));
                    commons.SetFieldValue("el_s_idnumber_text", null);
                    return;
                }
            }
        }
        catch (error) {
            commons.SetFormNotification("Error on el_account_service.validateIdNumberField(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account_service.validateIdNumberField()");
        }

    }

    el_account_service.idTypeCodeOnChange = function () {
        el_account_service.setIdentifyByIdField();
        el_account_service.validateIdNumberField();
    }

    el_account_service.setIdentifyByIdField = function () {
        ///TFS Task 20
        try {
            var typeCodeId = commons.GetLookupId("el_id_type_code")
            if (typeCodeId) {
                commons.RetrieveRecord("el_id_type", typeCodeId, "?$select=el_b_recognition_by_id")
                    .then(
                        function (result) {
                            if (result != null && result.el_b_recognition_by_id != null) {
                                commons.SetFieldValue("el_b_recognition_by_id", result.el_b_recognition_by_id == true ? true : false);
                            }
                        },
                        function (error) {
                            commons.SetFormNotification("Response is failed in commons.RetrieveRecord('el_id_type'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveRecord("el_id_type")');
                        }
                    )
                    .catch(error =>
                        commons.SetFormNotification("Error on retrieving an 'el_id_type' into el_account_service.setIdentifyByIdField(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account_service.setIdentifyByIdField()')
                    )
            }

        }
        catch (error) {
            console.error(error);
            commons.SetFormNotification("Error on el_account_service.setIdentifyByIdField(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account_service.setIdentifyByIdField()")
        }
    }


    el_account_service.account_service_onSave = function (Context) {
        if (!el_account_service.validateAccountPhonesFields()) {
            Context.getEventArgs().preventDefault();
        }
    }

    el_account_service.showConnectionsNotification = function () {
        commons.PageClearMessages('connMsg');
        var accountId = commons.GetCurrentEntityId();
        var accountOpts = "?$select=accountid&$expand=account_connections1($select=connectionid,statecode)&$filter=(accountid eq '" + accountId + "' and (account_connections1/any(o1:(o1/connectionid ne null)))";
        commons.RetrieveMultipleRecords("account", accountOpts, null, true)
            .then(
                function (results) {
                    if (results && results[0] && results[0].account_connections1 && results[0].account_connections1.results[0] && results[0].account_connections1.results[0].ConnectionId) {
                        for (var i = 0; i < results[0].account_connections1.results.length; i++) {
                            if (results[0].account_connections1.results[i].StateCode.Value == 0) {
                                commons.SetFormNotification(Const.Message.Hebrew.AccountHasConnectionsNote, commons.FormNotificationLevel.INFO, 'connMsg');
                                break;
                            }
                        }
                    }
                },
                function (error) {
                    commons.SetFormNotification("Response is failed in commons.RetrieveMultipleRecords('account'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveMultipleRecords("account")');
                }
            )
            .catch(error =>
                commons.SetFormNotification("Error on retrieving an 'account' into el_account_service.showConnectionsNotification(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account_service.showConnectionsNotification()')
            )
    }

    el_account_service.showBenfit = function () {
        var dateBigger;
        var guidBenfit;
        var orgURL = commons.GetClientUrl();
        // var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes";
        var accountId = commons.GetCurrentEntityId();

        if (accountId) {
            var entityName = Const.EntityLogicalName.Benefits;
            var benefitsOpts = commons.Query("el_name,el_benefitsid,el_b_status_benfit,createdon", "(_el_id_account_value eq '" + accountId + "' and el_b_status_benfit eq false)");

            commons.RetrieveMultipleRecords(entityName, benefitsOpts, null, true)
                .then(
                    function (results) {
                        var benefitsArray = results;
                        if (benefitsArray.length > 1) {
                            var stringDate = benefitsArray[0].createdon;
                            var newDate = stringDate.split("(");
                            var d = newDate[1].split(")");
                            var finaldate = d[0];
                            dateBigger = finaldate;
                            for (var i = 0; i < benefitsArray.length; i++) {
                                var stringDate = benefitsArray[i].createdon;
                                var newDate = stringDate.split("(");
                                var d = newDate[1].split(")");
                                var finaldate = d[0];
                                if (finaldate > dateBigger) {
                                    dateBigger = finaldate;
                                    guidBenfit = benefitsArray[i].el_benefitsid;
                                }
                            }
                            var recordId = guidBenfit;
                            var recordURL = orgURL + "/main.aspx?etn=" + entityName + "&id=%7b" + recordId + "%7d&newWindow=true&pagetype=entityrecord";
                            Notify.add(ConstNotify.add, commons.FormNotificationLevel.INFO, "open",
                                [
                                    {
                                        type: "link",
                                        text: Const.Message.Hebrew.ClickHere,
                                        callback: function () {
                                            // window.open(recordURL, "_blank", features, false);
                                            commons.openUrl(recordURL);
                                        }
                                    }
                                ]);

                        }
                        else if (benefitsArray.length == 1) {
                            guidBenfit = benefitsArray[0].el_benefitsid;
                            var recordId = guidBenfit;
                            var recordURL = orgURL + "/main.aspx?etn=" + entityName + "&id=%7b" + recordId + "%7d&newWindow=true&pagetype=entityrecord";

                            Notify.add(Const.Message.Hebrew.CustomeHasActiveBenefits, commons.FormNotificationLevel.INFO, "open",
                                [
                                    {
                                        type: "link",
                                        text: Const.Message.Hebrew.ClickHere,
                                        callback: function () {
                                            // window.open(recordURL, "_blank", features, false);
                                            commons.openUrl(recordURL);
                                        }
                                    }
                                ]);
                        }
                    },
                    function (error) {
                        commons.SetFormNotification("Response is failed in commons.RetrieveMultipleRecords('el_benefits'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveMultipleRecords("el_benefits")');
                    }
                )
                .catch(error =>
                    commons.SetFormNotification("Error on retrieving an 'el_benefits' into el_account_service.showBenfit(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account_service.showBenfit()')
                )
        }
    }

    el_account_service.validatePhoneNumber = function (fieldValue, pattern) {
        if (!fieldValue || !pattern)
            return true;

        if (fieldValue.match(pattern) != null)
            return true;
        return false;
    }

})((window.el_account_service = window.el_account_service || {}))