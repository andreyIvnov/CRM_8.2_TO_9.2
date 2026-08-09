//////////////////////                      CHECK LIST                     //////////////////////////


/**
 * 1. Handling errors on the forms (On Load, OnChange, OnSave)  => Done
 *      1.1. el_account.onLoadEvents() - Done.
 *      1.2. el_account.onChangeEvents() - Done.
 *      1.3. el_account.onSaveEvents() - Done.
 * 
 * 2. Based on Template (from ...\WebResources\Global\template.js) need to change a functions signature to Ribbon's enable rules and actions el_account.Ribbon + el_account.Ribbon.EnableRuls => Done
 *      2.1. Find all Actions Methods of ribbons and change a signiture to el_account.Ribbon.METHOD_NAME => Done
 *      2.2. Find all Enable Rules Methods of ribbons and change a signiture to el_account.Ribbon.EnableRules.ENABLERULES_FUNCTION_NAME => Done
 * 
 * 3. CHANGE all functions names into Ribbon WorkBrench for Account ribbons + enable ruls  => Done
 *      3.1. Pass a PrimaryControl parameter to all functions that are used in the ribbon workbench => Done
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * ////                                        CONTINUE FROM HERE              //////
 * 
 * 
 * 4. Handling exceptions for ribbons actions and ruls on form   => TO DO
 *      4.1. Handle all exceptions\error on the ribbon actions and ruls functions (FormNotifications / PageErrorHandler / console) . => TO DO
 *      4.1. Check if all enable ruls catched by debugger.  => Done
 * 
 *          
*           {
*             4.2. Check if all actions catched by debugger.  => TO DO
 * 
 *              4.2.1. Can't catch an Save And Close action on a Form   => TO DO FIX
 *              4.2.2. Button still unchanged and not dissabled after clicking   => TO DO FIX
 * 
 *              4.2.3. The window opened by click on "כתובת" is incorrect window => TO DO : Change a way to open an window
*           }
 */



//////////////////////                      CHECK LIST                     //////////////////////////



(function (el_account) {

    var IS_DUPLICATION_CHECKED = false;
    var IS_DUPLICATION_CHECKING = false;
    var commons;

    el_account.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());


            el_account.onLoadEvents();

            el_account.onChangeEvents();

            el_account.onSaveEvents();

        } catch (error) {
            commons.PageErrorHandler(error, "el_account.onLoad");
        }
    }

    el_account.onLoadEvents = function () {
        el_account.setIdFieldsRequirementLevel();
        el_account.setEmailFieldBehaviour();
        //el_account.setIdTypeDefaultValue();
        el_account.setClubMemberSection();
        el_account.setKamorSection();
        el_account.setAccDetailsComfirmSection();
        el_account.setSubGridVisibility()

        if (commons.GetFormType() != Enum.FormType.Create) {
            el_account.showConnectionsNotification();

            if (commons.GetFieldValue("el_b_service_form"))
                commons.SetFieldValue("el_b_service_form", false);

            commons.RefreshRibbon();
            el_account.disableIdDetailsFields();
        }

        if (commons.GetControl("el_b_premium_customer"))
            el_account.setPremiumCustomerField();

        if (commons.GetControl("el_s_premium_customer_desc"))
            el_account.setPremiumCustomerDescField();

        el_account.checkDuplicatesOnLoad();
        el_account.showBenfit();
    }

    el_account.onChangeEvents = function () {

        commons.AddOnChangeMultipleFields(["el_s_first_name", "el_s_last_name"], el_account.setNameFieldValue);
        commons.AddOnChangeMultipleFields(["telephone1", "telephone2", "fax"], el_account.validateAccountPhonesFields);

        if (commons.GetAttribute("el_b_refusetoidentify"))
            commons.AddOnChange("el_b_refusetoidentify", el_account.setIdFieldsRequirementLevel);

        if (commons.GetAttribute("el_b_refuse_email"))
            commons.AddOnChange("el_b_refuse_email", el_account.setEmailFieldRequirementLevel);

        if (commons.GetAttribute("el_s_idnumber_text"))
            commons.AddOnChange("el_s_idnumber_text", el_account.validateIdNumberField);

        if (commons.GetAttribute("el_id_type_code"))
            commons.AddOnChange("el_id_type_code", el_account.idTypeCodeOnChange);

        if (commons.GetAttribute("el_l_attribute"))
            commons.AddOnChange("el_l_attribute", el_account.setClubMemberSection);

        if (commons.GetAttribute("el_n_member_idnumber"))
            commons.AddOnChange("el_n_member_idnumber", el_account.validateMemberIdNumber);

        if (commons.GetAttribute("el_dt_last_update"))
            commons.AddOnChange("el_dt_last_update", el_account.setAccDetailsComfirmSection);

        if (commons.GetAttribute("el_b_premium_customer"))
            commons.AddOnChange("el_b_premium_customer", el_account.setPremiumCustomerDescField);

    }

    el_account.onSaveEvents = function () {
        commons.AddOnSave(el_account.account_onSave);
    }

    el_account.showBenfit = function () {
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
                    commons.SetFormNotification("Error on retrieving an 'el_benefits' into el_account.showBenfit(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account..showBenfit()')
                )
        }
    }

    el_account.disableIdDetailsFields = function () {
        commons.PageClearMessages("OpenOrderNotification");

        el_account.accountOrders()
            .then(
                function (result) {
                    switch (result) {
                        case Const.Runtime.Account.AccountHasNoOrders:
                            if (commons.GetControl("el_s_last_name"))
                                commons.SetDisabled("el_s_last_name", false);

                            if (commons.GetControl("el_s_first_name"))
                                commons.SetDisabled("el_s_first_name", false);

                            if (commons.GetControl("el_id_type_code"))
                                commons.SetDisabled("el_id_type_code", false);

                            if (commons.GetControl("el_s_idnumber_text"))
                                commons.SetDisabled("el_s_idnumber_text", false);

                            if (commons.GetControl("el_b_refusetoidentify"))
                                commons.SetDisabled("el_b_refusetoidentify", false);

                            commons.PageClearMessages("OpenOrderNotification");
                            break;

                        case Const.Runtime.Account.AccountHasOrder:
                            if (commons.GetControl("el_s_last_name"))
                                commons.SetDisabled("el_s_last_name", true);

                            if (commons.GetControl("el_s_first_name"))
                                commons.SetDisabled("el_s_first_name", true);

                            if (commons.GetControl("el_id_type_code"))
                                commons.SetDisabled("el_id_type_code", true);

                            if (commons.GetControl("el_s_idnumber_text"))
                                commons.SetDisabled("el_s_idnumber_text", true);

                            if (commons.GetControl("el_b_refusetoidentify"))
                                commons.SetDisabled("el_b_refusetoidentify", true);

                            commons.SetFormNotification(Const.Message.Hebrew.UnableToEditAnIDNumberForACustomerWhoHasOrders, commons.FormNotificationLevel.INFO, "OpenOrderNotification");
                            break;

                        case Const.Runtime.Account.AccountHasOpenedOrder:
                            if (commons.GetControl("el_s_last_name"))
                                commons.SetDisabled("el_s_last_name", true);

                            if (commons.GetControl("el_s_first_name"))
                                commons.SetDisabled("el_s_first_name", true);

                            if (commons.GetControl("el_id_type_code"))
                                commons.SetDisabled("el_id_type_code", true);

                            if (commons.GetControl("el_s_idnumber_text"))
                                commons.SetDisabled("el_s_idnumber_text", true);

                            if (commons.GetControl("el_b_refusetoidentify"))
                                commons.SetDisabled("el_b_refusetoidentify", true);

                            commons.SetFormNotification(Const.Message.Hebrew.NotPossibleToEditTheIdentificationInformationForCustomerWithOpenOrder, commons.FormNotificationLevel.INFO, "OpenOrderNotification");
                            break;
                    }
                }
            )
    }

    el_account.accountOrders = async function () {
        try {
            var accountId = commons.GetCurrentEntityId();
            if (accountId) {
                accountId = commons.StripGuid(accountId);
                //sales opened order
                var opts = commons.Query("opportunityid", "(_customerid_value eq '" + accountId + "' and (statuscode eq " + Enum.opportunity.statuscode.OpenOrder + " or statuscode eq " + Enum.opportunity.statuscode.FinalPayment + ")) ");
                var oppsResults = await commons.RetrieveMultipleRecords("opportunity", opts, null, true)
                if (oppsResults && oppsResults.length >= 1) {
                    return Const.Runtime.Account.AccountHasOpenedOrder;
                }

                //tradein opened order
                opts = commons.Query("el_opportunity_tradeinid", "(_el_id_account_value eq '" + accountId + "' and (statuscode eq " + Enum.el_opportunity_tradein.statuscode.OpenOrder + " or statuscode eq " + Enum.el_opportunity_tradein.statuscode.WaitingForAFutureCar + ")) ")//"?$select=?$filter=";
                var tradeinOpsResults = await commons.RetrieveMultipleRecords("el_opportunity_tradein", opts, null, true)
                if (tradeinOpsResults && tradeinOpsResults.length >= 1) {
                    return Const.Runtime.Account.AccountHasOpenedOrder;
                }

                //sales order
                opts = commons.Query("el_car_purchaseid", "_el_id_account_value eq '" + accountId + "'");
                var carPurchaseResults = await commons.RetrieveMultipleRecords("el_car_purchase", opts, null, true)
                if (carPurchaseResults && carPurchaseResults.length >= 1) {
                    return Const.Runtime.Account.AccountHasOrder;
                }

                //tradein order
                opts = commons.Query("el_tradein_dealid", "(_el_id_account_seller_value eq '" + accountId + "' or _el_id_as400_account_buyer_value eq '" + accountId + "')");
                var tradeinDealsResults = await commons.RetrieveMultipleRecords("el_tradein_deal", opts, null, true)
                if (tradeinDealsResults && tradeinDealsResults.length >= 1) {
                    return Const.Runtime.Account.AccountHasOrder;
                }
            }

            return Const.Runtime.Account.AccountHasNoOrders;

        } catch (error) {
            commons.SetFormNotification("Error on el_account.accountOrders(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account.accountOrders()")
        }
    }

    el_account.setKamorSection = function () {
        if (commons.GetAttribute("statuscode")) {
            var accountStatus = commons.GetFieldValue("statuscode");
            if (accountStatus == Enum.account.statuscode.KamorAccount) {
                commons.SetSectionVisibility("tab_5", "tab_5_section_4", true);
            }
            else {
                commons.SetSectionVisibility("tab_5", "tab_5_section_4", false);
            }
        }
    }


    el_account.setPremiumCustomerField = function () {
        if (commons.UserHasRoleOrIsAdmin(Const.SecurityRolesName.DM_PremiupCustomer)) {
            commons.SetDisabled("el_b_premium_customer", false);
        }
        else {
            commons.SetDisabled("el_b_premium_customer", true);
        }
    }

    el_account.setPremiumCustomerDescField = function () {
        commons.SetVisible("el_s_premium_customer_desc", false);
        commons.SetDisabled("el_s_premium_customer_desc", true);
        commons.SetRequiredLevel("el_s_premium_customer_desc", "none");

        commons.UserHasRoleOrIsAdmin(Const.SecurityRolesName.DM_PremiupCustomer)
            .then(
                function (result) {
                    if ((result && result === true && commons.GetFieldValue("el_b_premium_customer")) || (commons.GetFieldValue("el_s_premium_customer_desc"))) {
                        commons.SetVisible("el_s_premium_customer_desc", true);
                        commons.SetDisabled("el_s_premium_customer_desc", false);
                        commons.SetRequiredLevel("el_s_premium_customer_desc", "required");
                    }
                }
            )

        if (commons.GetFieldValue("el_s_premium_customer_desc") && !commons.GetFieldValue("el_b_premium_customer")) {
            commons.SetFieldValue("el_s_premium_customer_desc", null);
            commons.SetVisible("el_s_premium_customer_desc", false);
            commons.SetDisabled("el_s_premium_customer_desc", true);
            commons.SetRequiredLevel("el_s_premium_customer_desc", "none");
        }
    }

    el_account.setAccDetailsComfirmSection = function () {
        if (commons.GetCurrentItem().getLabel() === Const.Message.Hebrew.AccountForm) {
            commons.SetSectionVisibility("tab_5", "tab_5_section_5", false);
            if (commons.GetFormType() != Enum.FormType.Create) {
                var date2 = commons.GetFieldValue("el_dt_last_update") ? commons.GetFieldValue("el_dt_last_update") : 2464164000000;
                var date1 = new Date();
                var timeDiff = Math.abs(date2 - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                if (diffDays > 91) {
                    commons.SetSectionVisibility("tab_5", "tab_5_section_5", true);
                }
                else {
                    commons.SetSectionVisibility("tab_5", "tab_5_section_5", false);
                }
            }
        }
    }


    el_account.showConnectionsNotification = function () {
        commons.PageClearMessages('connMsg');
        var accountId = commons.GetCurrentEntityId();
        var accountOpts = "?$select=accountid&$expand=account_connections1($select=connectionid,statecode)&$filter=(accountid eq '" + accountId + "') and (account_connections1/any(o1:(o1/connectionid ne null)))";
        commons.RetrieveMultipleRecords("account", accountOpts, null, true)
            .then(
                function (results) {
                    if (results && results[0] && results[0].account_connections1 && results[0].account_connections1[0] && results[0].account_connections1[0].connectionid) {
                        for (var i = 0; i < results[0].account_connections1.length; i++) {
                            if (results[0].account_connections1[i].statecode == 0) {
                                commons.SetFormNotification(Const.Message.Hebrew.AccountHasConnectionsNote, commons.FormNotificationLevel.INFO, 'connMsg');
                                break;
                            }
                        }
                    }
                },
                function (error) {
                    commons.SetFormNotification("Response is failed in commons.RetrieveMultipleRecords('accounts'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveMultipleRecords("accounts")');
                }
            )
            .catch(error =>
                commons.SetFormNotification("Error on retrieving an 'accounts' into el_account.showConnectionsNotification(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account.showConnectionsNotification()')
            )
    }

    el_account.setSubGridVisibility = function () {
        var accountOpener = commons.GetOpenerEntityInfo();

        if (accountOpener && accountOpener.openerType == Const.EntityLogicalName.Opportunity) {

            // form opened outside the "main" explorer window. so hide grids to avoid OpenLegacy issues, only when account is opened from opportunity
            el_account.setTabsVisibility(["tab_2", "tab_3", "tab_7", "tab_9", "tab_10"], false);

            if (!commons.GetFieldValue("el_s_opportunity_id")) {
                commons.SetFieldValue("el_s_opportunity_id", accountOpener.openerId);
                commons.SetSubmitMode("el_s_opportunity_id", "always");
            }
        }
    }

    // //The function is out of using. TASK 1490 - canceling of address required 
    // function setAddressLookup(id, name) {
    //     if (!commons) { commons = new elad_commons() }
    //     var newAddressFieldData = commons.GenerateLookupFieldData(id, name, Const.EntityLogicalName.Address);
    //     commons.GetAttribute("el_id_address").setValue(newAddressFieldData);
    //     //el_s_address is hidden field for triggering workflow that activates CRM->AS/400 interface
    //     var address = commons.GetLookupFieldValue("el_id_address");
    //     if (address) {
    //         commons.SetFieldValue("el_s_address", address.name);
    //     }
    //     else {
    //         commons.SetFieldValue("el_s_address", null);
    //     }
    // }

    el_account.account_onSave = function (saveExecutionContext) {
        el_account.checkDuplicate(saveExecutionContext)
    }

    el_account.checkDuplicate = function (Context) {
        var eventNumber = Context.getEventArgs().getSaveMode();
        if (eventNumber == Enum.SaveMode.AutoSave || eventNumber == Enum.SaveMode.Save || eventNumber == Enum.SaveMode.SaveAndClose || eventNumber == Enum.SaveMode.SaveAndNew) {
            if (commons.GetFormType() == Enum.FormType.Create) {
                commons.SetFieldValue("el_b_to_check_duplicates", true);
            }
            if (IS_DUPLICATION_CHECKING == false && commons.GetFormType() != Enum.FormType.Create) {
                if (IS_DUPLICATION_CHECKING == false) {
                    IS_DUPLICATION_CHECKING = true;
                    if (commons.GetFormType() == Enum.FormType.Create) {
                        commons.SetFieldValue("el_b_to_check_duplicates", true);
                        IS_DUPLICATION_CHECKING = false;

                        commons.RefreshData(true);
                        // commons.SaveChenges()
                        //     .then(function () {
                        //         commons.RefreshRecordContent();
                        //     });
                    }
                    debugger;

                    //#region On-Premise cal action version

                    // var parameters = {
                    //     baseEntityTypecode: Enum.EntityTypeCode.account.toString(),
                    //     baseEntity: Const.EntityLogicalName.Account,
                    //     id: commons.GetCurrentEntityId(),
                    //     recordColumns: ""
                    // };

                    // var request = motors.Utilities.buildActionRequest("", "", true, "el_action_duplicate_detection_records", parameters, null, false);
                    // var service = motors.Services.XrmService.V81;
                    // var result = service.CallAction(request);

                    //#endregion

                    //To Check
                    var req = {

                        baseEntityTypecode: Enum.EntityTypeCode.account.toString(),
                        baseEntity: Const.EntityLogicalName.Account,
                        id: commons.GetCurrentEntityId(),
                        recordColumns: "",

                        getMetadata: function () {
                            return {
                                boundParameter: null, // Global Action → null
                                parameterTypes: {
                                    baseEntityTypecode: {
                                        typeName: "Edm.String",
                                        structuralProperty: 1 // PrimitiveType
                                    },
                                    baseEntity: {
                                        typeName: "Edm.String",
                                        structuralProperty: 1
                                    },
                                    id: {
                                        typeName: "Edm.String",
                                        structuralProperty: 1
                                    },
                                    recordColumns: {
                                        typeName: "Edm.String",
                                        structuralProperty: 1
                                    }
                                },
                                operationType: 0,
                                operationName: "el_action_duplicate_detection_records"
                            };
                        }
                    };

                    commons.executeRequest(req,
                        function (successResult) {
                            if (successResult != null && successResult.stringOutput != "[]" && IS_DUPLICATION_CHECKED == false) {

                                var pageInput = {
                                    pageType: "webresource",
                                    webresourceName: "el_duplicates_table.html", //Point to problem -> schem name or name
                                };

                                var navigationOptions = {
                                    target: 2, // 2 opens the page as a modal dialog
                                    width: 850,
                                    height: 520,
                                    position: 1 // 1 for center, 2 for side pane
                                };

                                localStorage.setItem('duplicatesString', successResult.stringOutput);
                                Context.getEventArgs().preventDefault();

                                commons.NavigateTo(pageInput, navigationOptions)
                                    .then(
                                        function (reslut) {
                                            el_account.saveOrExit();
                                        },
                                        function (error) {
                                            console.error(error);
                                            commons.SetFormNotification("Error on el_account.checkDuplicate => NavigateTo()", commons.FormNotificationLevel.ERROR, "el_account.checkDuplicate => NavigateTo()");
                                        }
                                    )

                                // var DialogOption = commons.GetNewXrmDialogOptions(850, 520);
                                // tempContext = Context;
                                // commons.OpenDialog(commons.GetClientUrl() + "/webresources/el_duplicates_table.html", DialogOption, null, null, el_account.saveOrExit)
                            }
                        },
                        function (error) {
                            console.error(error);
                            commons.SetFormNotification("Error on el_account.checkDuplicate => executeRequest()", commons.FormNotificationLevel.ERROR, "el_account.checkDuplicate => executeRequest()");
                        }
                    )
                }
            }
        }
    }

    el_account.checkDuplicatesOnLoad = function () {
        if (IS_DUPLICATION_CHECKING == false && commons.GetFormType() != Enum.FormType.Create) {
            if (commons.GetFieldValue('el_b_to_check_duplicates') == true) {
                commons.SetFieldValue('el_b_to_check_duplicates', false);
                IS_DUPLICATION_CHECKING = true;
                debugger;

                //#region 

                // var parameters = {
                //     baseEntityTypecode: Enum.EntityTypeCode.account.toString(),
                //     baseEntity: Const.EntityLogicalName.Account,
                //     id: commons.GetCurrentEntityId(),
                //     recordColumns: "aaa,bbb"
                // };

                // var request = motors.Utilities.buildActionRequest("", "", true, "el_action_duplicate_detection_records", parameters, null, false);
                // var service = motors.Services.XrmService.V81;
                // var result = service.CallAction(request);

                //#endregion

                //To Check
                var req = {

                    baseEntityTypecode: Enum.EntityTypeCode.account.toString(),
                    baseEntity: Const.EntityLogicalName.Account,
                    id: commons.GetCurrentEntityId(),
                    recordColumns: "aaa,bbb",

                    getMetadata: function () {
                        return {
                            boundParameter: null, // Global Action → null
                            parameterTypes: {
                                baseEntityTypecode: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1 // PrimitiveType
                                },
                                baseEntity: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                },
                                id: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                },
                                recordColumns: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                }
                            },
                            operationType: 0,
                            operationName: "el_action_duplicate_detection_records"
                        };
                    }
                };

                commons.executeRequest(req,
                    function () {
                        if (result != null && result.stringOutput != "[]" && IS_DUPLICATION_CHECKED == false) {

                            var pageInput = {
                                pageType: "webresource",
                                webresourceName: "el_duplicates_table.html", //Point to problem -> schem name or name
                            };

                            var navigationOptions = {
                                target: 2, // 2 opens the page as a modal dialog
                                width: 850,
                                height: 520,
                                position: 1 // 1 for center, 2 for side pane
                            };

                            localStorage.setItem('duplicatesString', result.stringOutput);

                            commons.NavigateTo(pageInput, navigationOptions)
                                .then(
                                    function (reslut) {
                                        el_account.saveOrExit();
                                    },
                                    function (error) {
                                        console.error(error);
                                        commons.SetFormNotification("Error on el_account.checkDuplicatesOnLoad => NavigateTo()", commons.FormNotificationLevel.ERROR, "el_account.checkDuplicatesOnLoad => NavigateTo()");
                                    }
                                )

                            // var DialogOption = commons.GetNewXrmDialogOptions(850, 520);
                            // var clientUrl = commons.GetClientUrl();
                            // if (clientUrl) {
                            //     commons.OpenDialog(clientUrl + "/webresources/el_duplicates_table.html", DialogOption, null, null, el_account.saveOrExit)
                            // }
                        }
                    },
                    function (error) {
                        console.error(error);
                        commons.SetFormNotification("Error on el_account.checkDuplicatesOnLoad => executeRequest()", commons.FormNotificationLevel.ERROR, "el_account.checkDuplicatesOnLoad => executeRequest()");
                    }
                );
            }
        }
    }

    el_account.saveOrExit = function (needToSave) {
        if (needToSave == true) {
            IS_DUPLICATION_CHECKED = true;
            commons.Save();
        }
        IS_DUPLICATION_CHECKING = false;
    }

    el_account.setClubMemberSection = function () {
        if (commons.GetFieldValue("el_l_attribute") == Enum.account.el_l_attribute.AmitHeverMember) {
            commons.SetTabVisibility("tab_8", true);
            
            //commons.SetTabDisplayState("tab_8", 'expanded');

            commons.SetRequiredLevel("el_l_member_relationship", "required");
            if (!commons.GetFieldValue("el_l_member_relationship"))
                commons.SetFocus("el_l_member_relationship");
        }
        else {
            commons.SetRequiredLevel("el_l_member_relationship", "none");
            commons.SetTabVisibility("tab_8", false);

            el_account.deleteAllAttributesValuesInSection("tab_8_section_1");
            el_account.deleteAllAttributesValuesInSection("tab_8_section_2");
        }
    }

    el_account.validateMemberIdNumber = function () {
        var el_n_member_idnumber = commons.GetFieldValue("el_n_member_idnumber");
        if (!commons.IsValidIsraeliId(el_n_member_idnumber)) {
            commons.OpenAlertDialog(Const.Message.Hebrew.PleaseEnterAValidID);
            // commons.OpenAlertDialog(Const.Message.Hebrew.PleaseEnterAValidID);
            commons.SetFieldValue("el_n_member_idnumber", null);
            commons.SetFocus("el_n_member_idnumber");
            return;
        }
    }

    // function validateAddress(Context) {
    //     debugger;
    //     var el_id_address = commons.GetFieldValue("el_id_address");

    //     if (Context) {
    //         var saveMode = Context.getEventArgs().getSaveMode();

    //         if (!el_id_address && saveMode != Enum.SaveMode.AutoSave) {
    //             alert(Const.Message.Hebrew.AddressMostBeFilledIn);
    //             return false;
    //         }
    //     }
    //     else {
    //         if (!el_id_address) {
    //             alert(Const.Message.Hebrew.AddressMostBeFilledIn);
    //             return false;
    //         }
    //     }
    //     return true;

    // }

    el_account.accountShowSaveAndCloseButtonS = function () {
        var accountOpener = commons.GetOpenerEntityInfo();
        if (accountOpener && accountOpener.openerType == Const.EntityLogicalName.Incident) {
            return true;
        }
        return false;
    }

    el_account.updateAccountLookupOnOpportunityForm = function () {
        var el_s_opportunity_id = commons.GetFieldValue("el_s_opportunity_id");
        var accountId = commons.GetCurrentEntityId();
        // if (accountId == "")
        //     window.setTimeout(el_account.updateAccountLookupOnOpportunityForm, 100);

        var accountName = commons.GetFieldValue("name");

        //To Check - check about opening an functions from opener into opened record
        // var opener = commons.GetOpener();
        // var accountOpener = commons.GetOpenerEntityInfo();

        // if (opener && opener.setAccountLookup && accountOpener.openerType == Const.EntityLogicalName.Opportunity) {
        //     opener.setAccountLookup(accountId, accountName, el_s_opportunity_id);
        // }
    }

    el_account.setIdFieldsRequirementLevel = function () {
        ///TFS Task 23
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
            commons.SetVisible("el_n_idnumber_int", true);

        }
        else {
            commons.SetDisabled("el_id_type_code", false);
            commons.SetDisabled("el_s_idnumber_text", false);
            commons.SetDisabled("el_n_idnumber_int", false);

            commons.SetRequiredLevel("el_id_type_code", "required");
            commons.SetRequiredLevel("el_s_idnumber_text", "required");

            commons.SetVisible("el_id_type_code", true);
            commons.SetVisible("el_s_idnumber_text", true);

        }
    }

    el_account.setEmailFieldBehaviour = function () {
        if (commons.GetFieldValue("emailaddress1") && commons.GetFieldValue("el_b_refuse_email") == true) {
            commons.SetFieldValue("el_b_refuse_email", false);
            commons.SetSubmitMode("el_b_refuse_email", "always");
        }
        el_account.setEmailFieldRequirementLevel();
    }

    el_account.setEmailFieldRequirementLevel = function () {
        if (!commons.GetFieldValue("el_b_refuse_email")) {
            commons.SetDisabled("emailaddress1", false);
            commons.SetRequiredLevel("emailaddress1", "required");
        }
        else {
            commons.SetFieldValue("emailaddress1", null);
            commons.SetRequiredLevel("emailaddress1", "none");
            commons.SetDisabled("emailaddress1", true);
        }

    }

    // function setFirstNameRequirementLevelAndVisibility() {
    //     ///TFS Task 27

    //     try {
    //         var el_b_recognition_by_id = commons.GetFieldValue("el_b_recognition_by_id");
    //         if (el_b_recognition_by_id == true) {
    //             commons.SetVisible("el_s_first_name", true);
    //             commons.SetRequiredLevel("el_s_first_name", "required");
    //         }
    //         else {
    //             commons.SetRequiredLevel("el_s_first_name", "none");
    //             commons.SetVisible("el_s_first_name", false);
    //         }

    //     } catch (error) {
    //         aler("Error in function: " + error.message);
    //     }
    // }

    el_account.setNameFieldValue = function () {
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
            console.error(error);
            commons.SetFormNotification("Error on el_account.setNameFieldValue(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account.setNameFieldValue()")
        }
    }

    el_account.validateAccountPhonesFields = function () {
        ///TFS Task 28
        try {
            var cellphone = commons.GetFieldValue("telephone1");
            var otherphone = commons.GetFieldValue("telephone2");
            var fax = commons.GetFieldValue("fax");
            var FAX_PATTERN = /\d{9}/;
            if (!el_account.validatePhoneNumber(fax, FAX_PATTERN)) {
                commons.OpenAlertDialog(Const.Message.Hebrew.TheFaxNumberMustContainAtLeast9Digits);
                return false;
            }
            return true;

        }
        catch (error) {
            console.error(error);
            commons.SetFormNotification(error.message, commons.FormNotificationLevel.ERROR, "el_account.validateAccountPhonesFields()")
        }

    }

    // function validateGender() {
    //     var gender = commons.GetFieldValue("el_l_gender");
    //     if (!gender) {
    //         alert(Const.Message.Hebrew.SexFieldMostBeFilled);
    //         return false;
    //     }
    //     return true;
    // }

    el_account.validateId = function () {
        var el_s_idnumber_text = commons.GetFieldValue("el_s_idnumber_text");
        var el_b_refusetoidentify = commons.GetFieldValue("el_b_refusetoidentify");
        if (!el_b_refusetoidentify && !el_s_idnumber_text) {
            commons.OpenAlertDialog(Const.Message.Hebrew.EnterValidIDorMarkRefusesToBeIdentified);
            return false;
        }
        return true;
    }

    el_account.validateIdNumberField = function () {
        try {
            var el_s_idnumber_text = commons.GetFieldValue("el_s_idnumber_text");
            var el_b_recognition_by_id = commons.GetFieldValue("el_b_recognition_by_id");
            var el_s_first_name = commons.GetFieldValue("el_s_first_name");

            if (commons.GetFormType() == Enum.FormType.Create && el_s_first_name) {
                if (el_s_idnumber_text && !commons.IsValidIsraeliId(el_s_idnumber_text)) {
                    commons.OpenAlertDialog(Const.Message.Hebrew.IDnumberMustContainDigitsOnly);
                    commons.SetFieldValue("el_s_idnumber_text", null);
                    return;
                }

                if (el_b_recognition_by_id == true) {
                    if (!commons.IsValidID(el_s_idnumber_text)) {
                        commons.OpenAlertDialog(Const.Message.Hebrew.PleaseEnterAValidID);
                        commons.SetFieldValue("el_s_idnumber_text", null);
                        return;
                    }
                }
            }
            else if (commons.GetFormType() != Enum.FormType.Create) {
                if (el_s_idnumber_text && !commons.IsValidIsraeliId(el_s_idnumber_text)) {
                    commons.OpenAlertDialog(Const.Message.Hebrew.IDnumberMustContainDigitsOnly);
                    commons.SetFieldValue("el_s_idnumber_text", null);
                    return;
                }

                if (el_b_recognition_by_id == true) {
                    if (!commons.IsValidIsraeliId(el_s_idnumber_text)) {
                        commons.OpenAlertDialog(Const.Message.Hebrew.PleaseEnterAValidID);
                        commons.SetFieldValue("el_s_idnumber_text", null);
                        return;
                    }
                }
            }
        }
        catch (error) {
            console.error(error);
            commons.SetFormNotification(error.message, commons.FormNotificationLevel.ERROR, "el_account.validateIdNumberField()")
        }

    }

    el_account.validateEmailField = function () {
        var el_b_refuse_email = commons.GetFieldValue("el_b_refuse_email");
        var email = commons.GetFieldValue("emailaddress1");

        if (!el_b_refuse_email && !email) {
            commons.OpenAlertDialog(Const.Message.Hebrew.EnterAnEmailOrMarkRefuseToProvideEmail);
            return false;
        }
        return true;
    }

    el_account.idTypeCodeOnChange = function () {
        el_account.setIdentifyByIdField();
        el_account.validateIdNumberField();
    }

    el_account.setIdentifyByIdField = function () {
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
                        commons.SetFormNotification("Error on retrieving an 'el_id_type' into el_account.setIdentifyByIdField(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account.setIdentifyByIdField()')
                    )
            }

        }
        catch (error) {
            console.error(error);
            commons.SetFormNotification("Error on el_account.setIdentifyByIdField(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account.setIdentifyByIdField()")
        }
    }


    // function el_account.setIdTypeDefaultValue() {
    //     if (commons.GetFormType() == Enum.FormType.Create) { //create form only
    //         var idTypeCodeRegular = 1; //סוג זיהוי רגיל

    //         opts = commons.Query("el_id_typeid,el_name", "el_n_id_type_code eq " + idTypeCodeRegular);
    //         commons.RetrieveMultipleRecords("el_id_types", opts, null, true)
    //             .then(
    //                 function (results) {
    //                     if (results != null && results[0] != null) {
    //                         if (commons.GetAttribute("el_id_type_code"))
    //                             commons.SetLookupValue("el_id_type_code", results[0].el_id_typeid, results[0].el_name, results[0].entityType);
    //                         if (commons.GetAttribute("el_b_recognition_by_id"))
    //                             commons.SetFieldValue("el_b_recognition_by_id", true);
    //                     }
    //                 },
    //                 function (error) {
    //                     commons.SetFormNotification("Response is failed in commons.RetrieveMultipleRecords('el_id_types'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveMultipleRecords("el_id_types")');
    //                 }
    //             )
    //             .catch(error =>
    //                 commons.SetFormNotification("Error on retrieving an 'el_id_types' into el_account.setIdTypeDefaultValue(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account.setIdTypeDefaultValue()')
    //             )
    //     }
    // }

    el_account.hasActiveOpportunity = function () {
        var accountId = commons.StripGuid(commons.GetCurrentEntityId());
        if (accountId) {
            var oppOpts = commons.Query("opportunityid", "(_customerid_value eq " + accountId + " and (statuscode eq " + Enum.opportunity.statuscode.OpenOrder + " or statuscode eq " + Enum.opportunity.statuscode.FinalPayment + ")) ");
            commons.RetrieveMultipleRecords("opportunity", oppOpts, null, true)
                .then(
                    function (results) {
                        if (results && results.length >= 1) {
                            return true;
                        }
                        return false;
                    },
                    function (error) {
                        commons.SetFormNotification("Response is failed in commons.RetrieveMultipleRecords('opportunities'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveMultipleRecords("opportunities")');
                        return false;
                    }
                )
                .catch(error => {
                    commons.SetFormNotification("Error on retrieving an 'opportunities' into el_account.hasActiveOpportunity(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account.hasActiveOpportunity()');
                    return false;
                });
        }
    }

    el_account.validatePhoneNumber = function (fieldValue, pattern) {
        if (!fieldValue || !pattern)
            return true;

        if (fieldValue.match(pattern) != null)
            return true;
        return false;
    }

    /**
     * Disable all attribute values in a section by section label.
     * @param {string} sectionName 
     */
    el_account.deleteAllAttributesValuesInSection = function (sectionName) {
        var tabs = commons.GetFormContext().ui.tabs;
        var xrmControls = commons.GetFormContext().ui.controls;
        if (tabs) {
            for (var i = 0; i < tabs.getLength(); i++) {
                var tab = tabs.get(i);
                var sections = tab.sections;
                if (tab.sections) {
                    for (var j = 0; j < sections.getLength(); j++) {
                        var section = sections.get(j);
                        if (section && section.getName() && section.getName().toLowerCase() === sectionName.toLowerCase()) {
                            if (xrmControls) {
                                xrmControls.forEach(
                                    function (control) {
                                        if (control.getParent() && control.getParent().getName() === sectionName && control.getControlType() != "subgrid" && control.getAttribute()) {
                                            var attr = control.getAttribute()
                                            attr.setValue(null);
                                            attr.setSubmitMode("always");
                                        }
                                    });
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    el_account.openDigitalDocument = function () {
        commons.RetrieveMultipleRecords("el_general_system_parameter", commons.Query("el_s_value", "el_name eq 'WeSign-MailingConfirmationDocId'"), null, true)
            .then(
                function (results) {
                    if (results && results.length >= 1 && results[0].el_s_value) {
                        var formParameters = {};
                        formParameters["el_s_title"] = "הפקה דיגיטלית עבור אישור דיוור";
                        formParameters["el_id_account"] = commons.GetCurrentEntityId();
                        formParameters["el_id_accountname"] = commons.GetFormContext().data.entity.getPrimaryAttributeValue();

                        formParameters["el_id_doc_template"] = results[0].el_s_value;
                        formParameters["el_id_doc_templatename"] = "אישור דיוור";

                        // var windowOptions = {
                        //     openInNewWindow: true
                        // };
                        // Xrm.Utility.openEntityForm("el_digital_signing_job", null, formParameters, windowOptions);

                        var formOptions = {
                            entityName: "el_digital_signing_job",
                            entityId: null,
                            openInNewWindow: true
                        };

                        //To Check -> If the OpenEntityForm opened correct
                        commons.OpenEntityForm(formOptions, formParameters);
                    }
                },
                function (error) {
                    commons.SetFormNotification("Response is failed in commons.RetrieveMultipleRecords('el_general_system_parameters'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveMultipleRecords("el_general_system_parameters")');
                }
            )
            .catch(error =>
                commons.SetFormNotification("Error on retrieving an 'el_general_system_parameters' into el_account.openDigitalDocument(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_account.openDigitalDocument()')
            )
    }

    el_account.setTabsVisibility = function (tabsArr, isVisible) {
        try {
            if (tabsArr && tabsArr.length > 0) {
                tabsArr.map(tabName => {
                    commons.SetTabVisibility(tabName, isVisible);
                })
            }
        } catch (error) {
            commons.SetFormNotification("Error on el_account.setTabsVisibility(): " + error.message, commons.FormNotificationLevel.ERROR, "el_account.setTabsVisibility()");
        }
    }


    el_account.Ribbon = el_account.Ribbon || {};

    el_account.Ribbon.updateAccountSyncField = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }
        ///TFS Task 3accountSaveAndCLose4
        ///Called from Ribbon
        var el_b_sync = commons.GetFieldValue("el_b_sync");
        if (el_b_sync != true) {
            commons.SetFieldValue("el_b_sync", true);
        }
    }

    el_account.Ribbon.confirmationMailingRibbon = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }
        el_account.openDigitalDocument();
    }

    //To Check -> Check if confirm button is working correct
    el_account.Ribbon.enableIdDetailsForUpdateRibbon = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        commons.OpenConfirmDialog(Const.Message.Hebrew.EditAccountIdentificationConfirmation, "")
            .then(
                function (success) {
                    if (success.confirmed) {
                        commons.SetDisabled("el_s_last_name", false);
                        commons.SetDisabled("el_s_first_name", false);
                        commons.SetDisabled("el_id_type_code", false);
                    }
                }
            )
    }

    el_account.Ribbon.accountSaveAndCLose = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl)
        }

        if (el_account.validateEmailField() && el_account.validateId()) {
            el_account.updateAccountLookupOnOpportunityForm();
            commons.SaveChenges().then(commons.ClosePage);
        }
    }

    //To Check - if they open a in a correct way.
    el_account.Ribbon.openAddress = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }
        var addressId = commons.GetLookupId("el_id_address");
        var clientUrl = commons.GetClientUrl();
        if (addressId) {
            var parameters = clientUrl + "/main.aspx?";
            parameters += "etc=" + Enum.EntityTypeCode.el_address;
            parameters += "&extraqs=";
            parameters += "&id=" + addressId;
            parameters += "&newWindow=true&pagetype=entityrecord";
            // window.open(parameters, "", "status=0,resizable=1,top=100,left=100,width=1000px,height=600px");

            commons.openUrl(parameters, { height: 600, width: 1000 });

        }
        else {
            var parameters = clientUrl + "/main.aspx?";
            parameters += "etc=" + Enum.EntityTypeCode.el_address;
            parameters += "&extraqs=%3f_CreateFromId%3d%26_CreateFromType%3d1%26_searchText%3d%26etc%3d";
            parameters += Enum.EntityTypeCode.el_address;
            parameters += "&newWindow=true&pagetype=entityrecord";
            // window.open(parameters, "", "status=0,resizable=1,top=100,left=100,width=1000px,height=600px");

            commons.openUrl(parameters, { height: 600, width: 1000 });
        }
        commons.SetSubmitMode("el_id_address", "always");
    }


    el_account.Ribbon.EnableRules = el_account.Ribbon.EnableRules || {};

    el_account.Ribbon.EnableRules.showDeactivateButtonForAdmin = function (primaryControl) {
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        return commons.UserHasRoleOrIsAdmin()
            .then(
                function (hasRole) {
                    if (hasRole) {
                        return true;
                    }
                    return false;
                }
            )
    }

    el_account.Ribbon.EnableRules.enableIdDetailsForUpdateEnableRule = function (primaryControl) {
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        var formName = commons.GetCurrentItem().getLabel();
        var isRefuse = commons.GetFieldValue("el_b_refusetoidentify");
        var isEnabled = !el_account.hasActiveOpportunity() && formName == Const.account.formName.Account
            && !isRefuse ? true : false;
        return isEnabled;
    }

    el_account.Ribbon.EnableRules.accountShowSaveAndCloseButton = function (primaryControl) {
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        var accountOpener = commons.GetOpenerEntityInfo();
        if (accountOpener && (accountOpener.openerType == Const.EntityLogicalName.Opportunity || accountOpener.openerType == Const.EntityLogicalName.TradeInOpportunity)) {
            return true;
        }
        return false;
    }



})(window.el_account = window.el_account || {})