(function (opportunity) {
    var commons;
    var formContext;
    opportunity.Ribbon = opportunity.Ribbon || {};
    opportunity.Ribbon.EnableRules = {};
    var isEuroDriveShowroom;
    window.globalShowroom = null;

    var TAMPLATE_TYPE_SIMPLECHAT = {
        CUSTOMER_SERVICE: 1,
        SALES: 2
    };
    var TYPE_OF_CHANNEL_WHATSAPP = 10;
    var EL_DOC_TYPECODE = 10028;
    var EL_PRINT_SALES_DOCS = 10061;
    var TRADEIN_OFFER_TYPECODE = 10053;
    var LEAD_STATUS_FUTURE_MODEL = 102910004;
    var OPPORTUNITY_TYPECODE = 3;
    var OPPORTUNITYSTATE_OPEN = 0;
    var OPPORTUNITY_STATUS_ORDER = 2;
    var OPPORTUNITY_STATUS_HIZDAMNUT = 1;
    var OPPORTUNITY_STATUS_HIZDAMNUT_ROSHONIT = 102910010;
    var OPPORTUNITY_STATUS_PAYMENT = 102910002;
    var PURCHASETYPE_NEWCAR = 1;
    var DOCTYPE_BID = 1;
    var BIDTYPE_TEMPLATE = 1;
    var TESTDRIVE_INTERESTED = 2;
    var TESTDRIVE_NOT_INTERESTED = 1;
    var TESTDRIVE_SCHEDULED = 3;
    var TESTDRIVE_PERFORMED = 4;
    var TESTDRIVE_CANCELLED = 6;
    var TRADEIN_QUOTE_INTERESTED = 2;
    var TESTDRIVE_OFFER_YES = 1;
    var PROD_TREE_ORDER_URL = "PROD_TREE_ORDER_URL";
    var STOCK_ORDER_URL = "STOCK_ORDER_URL";
    var STOCK_ORDER_URL_NEW = "STOCK_ORDER_URL_NEW";
    var SPECIAL_QUOTE_URL = "SPECIAL_QUOTE_URL";
    var SPECIAL_QUOTE_URL_NEW = "SPECIAL_QUOTE_URL_NEW";
    var CURRENT_CAR_YES = 1;
    var CURRENT_CAR_NO = 2;
    var IS_DUPLICATION_CHECKING = false;
    var IS_DUPLICATION_CHECKED = false;


    opportunity.onLoad = function (executionContext) {
        try {
            debugger;
            formContext = executionContext.getFormContext();
            commons = new elad_commons();
            commons.SetFormContext(formContext);
            opportunity.setupBasicEvents();
            if (window && window.top && window.top.opener && commons.GetFormType() == Enum.FormType.Create) {
                opportunity.updateAccountDetails();
                opportunity.alertMesgBenefitFromCreateOpp();
            }
            if (commons.GetAttribute("el_id_showroom") && commons.GetFieldValue("el_id_showroom") == null) {
                commons.FillShowRoom();
            }
            opportunity.setManufacturerAndFamilyInLeadAndOpportunity();
            opportunity.setReadonlyBehaviourByUserRole();
            opportunity.showHideTradeinSection();
            opportunity.setOpportunityDefaultValues();

            var opener = null;
            if (window && window.top) {
                opener = window.top.opener;
            }

            opportunity.setTestDriveFields();
            opportunity.saveTestDriveStatus();
            opportunity.showField();
            //opportunity.openAccountForm();
            opportunity.checkCarLicense();
            opportunity.setNameFieldOnLoad();
            opportunity.checkScannedOrderDocs();
            opportunity.setDisqualifySection();
            opportunity.setGlobalModel();
            opportunity.setFundingField();
            opportunity.showBenfit();
            opportunity.visibleFieldDelivery();
            opportunity.onConnectedDriveCancelationLogic();
            opportunity.UpdateYomanField();
            opportunity.filterManfFromShowRoom();
            opportunity.initGlobalVar();     
            if (commons.GetFormType() == Enum.FormType.Create) {
                commons.UserHasRoleOrIsAdmin(Const.SecurityRolesName.SERVICE_SYSTEM_ROLE)
                    .then(
                        function (result) {
                            debugger;
                            if (result == true) {
                                commons.SetVisible("el_id_manufacturer", true);
                            }
                        },
                        err => {
                            console.error("commons.UserHasRoleOrIsAdmin " + err)
                            resolve(false)
                        })
            };

            opportunity.checkDuplicatesOnLoad();
            opportunity.euroDriveShowroomLogic();

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.OnLoad");
        }
    };
    opportunity.alertMesgBenefitFromCreateOpp = async function () {
        try {
            debugger;
            var accountId = commons.GetLookupId("customerid");

            if (!accountId) {
                return;
            }

            var benefits = await commons.RetrieveMultipleRecords(
                "el_benefits",
                "?$select=el_name,createdon,el_benefitsid,el_b_status_benfit" +
                "&$filter=_el_id_account_value eq " + commons.StripGuid(accountId) +
                " and el_b_status_benfit eq false",
                null,
                true
            );

            if (benefits && benefits.length > 0) {
                commons.OpenAlertDialog("שים לב - ללקוח קיימת הטבה פעילה");
            }
        }
        catch (error) {
            commons.PageErrorHandler(error, "alertMesgBenefitFromCreateOpp");
        }
    }

    opportunity.initGlobalVar = async function (commonsParam) {
        debugger;
        var common = commons == null ? commonsParam : commons;
        try {
            var showroom = common.GetLookupFieldValue("el_id_showroom");
            var stateCode = common.GetFieldValue("statecode");
            if (stateCode == Enum.opportunity.statecode.Open && showroom && showroom.id) {
                window.globalShowroom = await common.RetrieveRecord("el_showroom", common.StripGuid(showroom.id), "");
            }
        }
        catch (error) {
            common.PageErrorHandler(error, "opportunity.initGlobalVar");
        }
    }


    opportunity.updateOpportunityFields = async function (oppId, fieldsToUpdate) {
        try {
            if (!oppId || !fieldsToUpdate) {
                return;
            }

            oppId = commons.StripGuid(oppId);

            await commons.updateRecord("opportunity", oppId, fieldsToUpdate);

            if (commons != null) {
                commons.LogOnConsoleAndOpenAlertDialog(Const.Message.Hebrew.UpdateOfAuditingLeadIsSuccessfully); // TASK 1344
                commons.SetFieldValue("el_b_auditing_lead", true);
            }

        } catch (error) {
            console.log(error.message || error); // TASK 1344

            if (commons != null) {
                commons.LogOnConsoleAndOpenAlertDialog(Const.Message.Hebrew.UpdateOfAuditingLeadIsFailed + (error.message || "")); // TASK 1344
            }

            commons.PageErrorHandler(error, "opportunity.updateOpportunityFields");
        }
    };

    opportunity.onConnectedDriveCancelationLogic = function () {
        try {
            commons.SetVisible("el_b_connected_drive_cancelation", commons.GetFieldValue("el_b_connected_drive_cancelation") === true);
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.onConnectedDriveCancelationLogic");
        }
    };
    opportunity.showBenfit = async function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return;
            }

            var results = await commons.RetrieveMultipleRecords("el_benefits", "?$select=el_name,createdon,el_benefitsid,el_b_status_benfit&$filter=_el_id_account_value eq " + commons.StripGuid(customer.id) + " and el_b_status_benfit eq false");

            if (!results || results.length === 0) {
                return;
            }

            var entityName = "el_benefits";
            var latestBenefit = results[0];

            for (var i = 1; i < results.length; i++) {
                if (new Date(results[i].createdon) > new Date(latestBenefit.createdon)) {
                    latestBenefit = results[i];
                }
            }

            var recordId = latestBenefit.el_benefitsid;
            var recordURL = commons.GetClientUrl() + "/main.aspx?etn=" + entityName + "&id=%7b" + recordId + "%7d&newWindow=true&pagetype=entityrecord";

            if (results.length > 1) {
                Notify.add("ללקוח יש מספר הטבות פעילות, לפרטי ההטבה האחרונה ביותר ", "INFO", "open", [{
                    type: "link",
                    text: "לחץ כאן ",
                    callback: function () {
                        commons.openUrl(recordURL);
                    }
                }]);

            } else {
                Notify.add("ללקוח קיימת הטבה פעילה ", "INFO", "open", [{
                    type: "link",
                    text: "לחץ כאן ",
                    callback: function () {
                        commons.openUrl(recordURL);
                    }
                }]);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showBenfit");
        }
    };
    opportunity.showBenfit = async function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return;
            }

            var results = await commons.RetrieveMultipleRecords("el_benefits", "?$select=el_name,createdon,el_benefitsid,el_b_status_benfit&$filter=_el_id_account_value eq " + commons.StripGuid(customer.id) + " and el_b_status_benfit eq false");

            if (!results || results.length === 0) {
                return;
            }

            var entityName = "el_benefits";
            var latestBenefit = results[0];

            for (var i = 1; i < results.length; i++) {
                if (new Date(results[i].createdon) > new Date(latestBenefit.createdon)) {
                    latestBenefit = results[i];
                }
            }

            var recordId = latestBenefit.el_benefitsid;
            var recordURL = commons.GetClientUrl() + "/main.aspx?etn=" + entityName + "&id=%7b" + recordId + "%7d&newWindow=true&pagetype=entityrecord";

            if (results.length > 1) {
                Notify.add("ללקוח יש מספר הטבות פעילות, לפרטי ההטבה האחרונה ביותר ", "INFO", "open", [{
                    type: "link",
                    text: "לחץ כאן ",
                    callback: function () {
                        commons.openUrl(recordURL);
                    }
                }]);

            } else {
                Notify.add("ללקוח קיימת הטבה פעילה ", "INFO", "open", [{
                    type: "link",
                    text: "לחץ כאן ",
                    callback: function () {
                        commons.openUrl(recordURL);
                    }
                }]);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showBenfit");
        }
    };
    opportunity.filterManfFromShowRoom = async function () {
        try {
            var showroom = commons.GetLookupFieldValue("el_id_showroom");

            if (!showroom || !showroom.id) {
                return;
            }

            var showroomId = commons.StripGuid(showroom.id);

            var showroomResults = await commons.RetrieveMultipleRecords("el_showroom", "?$select=el_b_mixed_showroom,el_b_is_eurodrive_showroom&$filter=el_showroomid eq " + showroomId);

            if (!showroomResults || showroomResults.length === 0) {
                return;
            }

            isEuroDriveShowroom = showroomResults[0].el_b_is_eurodrive_showroom;

            if (showroomResults[0].el_b_mixed_showroom === true) {
                var gridMan = await commons.RetrieveMultipleRecords("el_showroom_el_manufacturers", "?$filter=el_showroomid eq " + showroomId.replace(/[{}]/g, ""));

                if (gridMan && gridMan.length > 0) {
                    try {
                        var manufacturerFilters = "<filter type='and'><filter type='or'>";

                        for (var i = 0; i < gridMan.length; i++) {
                            var manufacturerId = gridMan[i].el_manufacturerid;
                            manufacturerFilters += "<condition attribute='el_manufacturerid' operator='eq' value='" + manufacturerId + "'/>";
                        }

                        manufacturerFilters += "</filter></filter>";

                        commons.SetFilterOnLookupField("el_id_manufacturer", "el_manufacturer", manufacturerFilters);

                    } catch (e) {
                        commons.SetFormNotification("Error on filterManfFromShowRoom(): " + e.message, "ERROR", "filterManfFromShowRoom");
                        console.error(e);
                    }
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.filterManfFromShowRoom");
        }
    };
    opportunity.preventDuplicateOpportunity = async function (context) {
        try {
            if (await commons.UserHasRoleOrIsAdmin()) {
                return;
            }

            var showroom = commons.GetLookupFieldValue("el_id_showroom");
            var customer = commons.GetLookupFieldValue("customerid");
            var manufacturer = commons.GetLookupFieldValue("el_id_manufacturer");

            if (!showroom || !customer || !manufacturer) {
                return;
            }

            if (commons.GetFormType() != Enum.FormType.Create) {
                return;
            }

            var result = await commons.RetrieveMultipleRecords("opportunity", "?$filter=_el_id_showroom_value eq " + commons.StripGuid(showroom.id) + " and _customerid_value eq " + commons.StripGuid(customer.id) + " and statuscode eq 1 and _el_id_manufacturer_value eq " + commons.StripGuid(manufacturer.id));

            if (result && result.length > 0) {
                commons.OpenAlertDialog("לא ניתן להקים תהליך נוסף !!! קיים תהליך מכירה בסטטוס הזדמנות ללקוח זה !!");

                if (context && context.getEventArgs()) {
                    context.getEventArgs().preventDefault();
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.preventDuplicateOpportunity");
        }
    };
    opportunity.setFundingField = function (commonsParam, value) {
        try {
            debugger;
            commonsLocal = commonsParam == null ? commons : commonsParam;
            if (!value) {
                if (commonsLocal.GetFormType() == Enum.FormType.Create) {
                    commonsLocal.SetVisible("el_l_funding_offer", false);
                    commonsLocal.SetRequiredLevel("el_l_funding_offer", "none");

                } else {
                    if (commonsLocal.GetFieldValue("statecode") == OPPORTUNITYSTATE_OPEN) {
                        commonsLocal.SetVisible("el_l_funding_offer", commons.GetFieldValue("el_b_order_submitted"));
                    } else {
                        commonsLocal.SetVisible("el_l_funding_offer", true);
                        commonsLocal.SetRequiredLevel("el_l_funding_offer", "none");
                    }
                }

            } else {
                commonsLocal.SetFieldValue("el_l_funding_offer", value);
            }

        } catch (error) {
            commonsLocal.PageErrorHandler(error, "opportunity.setFundingField");
        }
    };
    opportunity.showOrHideFields = function () {
        try {
            var tradeinFlag = commons.GetFieldValue("el_b_tradein_flag");

            commons.SetVisible("el_b_dm_purchased_car", tradeinFlag);
            commons.SetVisible("el_l_deal_type", tradeinFlag);

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showOrHideFields");
        }
    };
    opportunity.showroomOnChange = async function () {
        try {
            var showroomLookup = commons.GetLookupFieldValue("el_id_showroom");

            if (showroomLookup && showroomLookup.id) {
                await commons.FillManufacturer();

                commons.SetFieldValue("el_s_showroom", showroomLookup.name);

                var showroom = await commons.RetrieveRecord("el_showroom", commons.StripGuid(showroomLookup.id), "?$select=el_b_mixed_showroom,el_b_is_eurodrive_showroom");

                if (showroom != null) {
                    isEuroDriveShowroom = showroom.el_b_is_eurodrive_showroom;

                    commons.SetFieldValue("el_b_mixed_showroom", showroom.el_b_mixed_showroom);

                    if (commons.GetControl("el_id_manufacturer")) {
                        commons.SetVisible("el_id_manufacturer", showroom.el_b_mixed_showroom === true);
                    }
                }

            } else {
                commons.SetLookupValue("el_id_manufacturer", null);
                commons.SetFieldValue("el_s_showroom", null);
            }  
            if (await commons.UserHasRoleOrIsAdmin(Const.SecurityRolesName.SERVICE_SYSTEM_ROLE) && commons.GetFormType() == Enum.FormType.Create) {
                commons.SetVisible("el_id_manufacturer", true);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showroomOnChange");
        }
    };
    opportunity.showHideTradeinSection = function () {
        try {
            var tradeinQuote = commons.GetFieldValue("el_l_tradein_quote");

            if (commons.GetTab("tab_9")) {
                commons.SetTabVisibility("tab_9", tradeinQuote != 1);
            }

            opportunity.checkCarLicense();

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showHideTradeinSection");
        }
    };
    opportunity.setupBasicEvents = function () {
        try {
            if (commons.GetAttribute("el_id_showroom")) {
                commons.AddOnChangeMultipleCallback("el_id_showroom", [opportunity.showroomOnChange, opportunity.euroDriveShowroomLogic]);
                commons.AddOnChange("el_id_showroom", opportunity.setManufacturerAndFamilyInLeadAndOpportunity);
                commons.AddOnChange("el_id_showroom", opportunity.filterManfFromShowRoom);
            }

            if (commons.GetAttribute("el_id_manufacturer")) {
                commons.AddOnChange("el_id_manufacturer", opportunity.setManufacturerAndFamilyInLeadAndOpportunity);
            }

            if (commons.GetAttribute("el_l_tradein_quote")) {
                commons.AddOnChange("el_l_tradein_quote", opportunity.showHideTradeinSection);
            }

            if (commons.GetAttribute("el_l_offer_testdrive")) {
                commons.AddOnChange("el_l_offer_testdrive", opportunity.setTestDriveFields);
            }

            if (commons.GetAttribute("el_b_document_testdrive")) {
                commons.AddOnChange("el_b_document_testdrive", opportunity.setTestDriveFieldsDoc);
            }

            if (commons.GetAttribute("el_l_testdrive")) {
                commons.AddOnChange("el_l_testdrive", opportunity.setTestDriveFields);
            }

            if (commons.GetAttribute("el_id_family")) {
                commons.AddOnChange("el_id_family", opportunity.setNameField);
            }

            if (commons.GetAttribute("el_id_global_model")) {
                commons.AddOnChange("el_id_global_model", opportunity.setGlobalModel);
            }

            if (commons.GetAttribute("el_b_authorized_withdrawal")) {
                commons.AddOnChange("el_b_authorized_withdrawal", opportunity.visibleFieldDelivery);
            }

            if (commons.GetAttribute("el_b_other_car_owners")) {
                commons.AddOnChange("el_b_other_car_owners", opportunity.showField);
            }

            if (commons.GetAttribute("statuscode")) {
                commons.AddOnChange("statuscode", opportunity.showField);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.AssignEventActions");
        }
    };

    opportunity.updateAccountDetails = async function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return;
            }

            var account = await commons.RetrieveRecord("account", commons.StripGuid(customer.id), "?$select=el_dt_last_update,el_b_account_details_confirmed");

            if (!account) {
                return;
            }

            var date2 = account.el_dt_last_update ? commons.ParseDate(account.el_dt_last_update) : 2464164000000;
            var date1 = new Date();
            var timeDiff = Math.abs(date2 - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (diffDays > 91 && !account.el_b_account_details_confirmed) {
                var txt = "\n לא ניתן להקים תהליך מכירה חדש ללא טיוב נתוני הלקוח \n";

                commons.OpenAlertDialog(txt);

                window.top.close();

                var op = window.top.opener;

                if (op && op.Xrm && op.Xrm.Page && op.Xrm.Page.ui && op.Xrm.Page.ui.tabs.get("tab_5")) {
                    window.setTimeout(function () {
                        op.Xrm.Page.ui.tabs.get("tab_5").setFocus();
                    }, 500);
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.updateAccountDetails");
        }
    };
    opportunity.updateAccountDetails = async function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return;
            }

            var account = await commons.RetrieveRecord("account", commons.StripGuid(customer.id), "?$select=el_dt_last_update,el_b_account_details_confirmed");

            if (!account) {
                return;
            }

            var date2 = account.el_dt_last_update ? commons.ParseDate(account.el_dt_last_update) : 2464164000000;
            var date1 = new Date();
            var timeDiff = Math.abs(date2 - date1.getTime());
            var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

            if (diffDays > 91 && !account.el_b_account_details_confirmed) {
                var txt = "\n לא ניתן להקים תהליך מכירה חדש ללא טיוב נתוני הלקוח \n";
                commons.OpenAlertDialog(txt);
                window.top.close();

                var op = window.top.opener;

                if (op && op.Xrm && op.Xrm.Page && op.Xrm.Page.ui && op.Xrm.Page.ui.tabs.get("tab_5")) {
                    window.setTimeout(function () {
                        op.Xrm.Page.ui.tabs.get("tab_5").setFocus();
                    }, 500);
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.updateAccountDetails");
        }
    };

    opportunity.oppOnSave = function (executionContext) {
        try {
            debugger;
            var saveFormContext = executionContext.getFormContext();
            var saveCommons = new elad_commons();
            saveCommons.SetFormContext(saveFormContext);

            opportunity.preventSavingWrongTestDriveStatus(saveCommons);
            opportunity.preventSavingAccountNotCompleted(executionContext, saveCommons);//opportunity.preventSavingAccountNotCompleted
            opportunity.checkDuplicate(executionContext, saveCommons, executionContext.getEventArgs().getSaveMode());
        } catch (error) {
            saveCommons.PageErrorHandler(error, "opportunity.oppOnSave");
        }
    };
    opportunity.checkDuplicate = async function (context, saveCommons, saveMode) {
        try {
            debugger;
            if (saveMode == 1 || saveMode == 2 || saveMode == 59 || saveMode == 70) {
                if (IS_DUPLICATION_CHECKING == false) {
                    IS_DUPLICATION_CHECKING = true;

                    if (saveCommons.GetFormType() == Enum.FormType.Create) {
                        saveCommons.SetFieldValue("el_b_to_check_duplicates", true);
                        IS_DUPLICATION_CHECKING = false;
                    }

                    opportunity.openDuplicatesWindow(context, saveCommons, true);
                }
            }

        } catch (error) {
            saveCommons.PageErrorHandler(error, "opportunity.checkDuplicate");
        }
    };

    opportunity.checkDuplicatesOnLoad = function () {
        try {
            if (IS_DUPLICATION_CHECKING == false && commons.GetFormType() != Enum.FormType.Create) {
                if (commons.GetAttribute("el_b_to_check_duplicates") != null && commons.GetFieldValue("el_b_to_check_duplicates") == true) {
                    commons.SetFieldValue("el_b_to_check_duplicates", false);
                    IS_DUPLICATION_CHECKING = true;
                    opportunity.openDuplicatesWindow(false, null);
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.checkDuplicatesOnLoad");
        }
    };
    opportunity.openDuplicatesWindow = async function (needToPrevent, context, saveCommons ) {
        try {
            var _commons = commons == null ? saveCommons : commons;
            var parameters = {
                baseEntityTypecode: "3",
                baseEntity: "opportunity",
                id: _commons.GetCurrentEntityId(),
                recordColumns: ""
            };
            var result = await _commons.IsDuplicateRecordExist(parameters.baseEntityTypecode, parameters.baseEntity, parameters.id, parameters.recordColumns, )

            if (result != null && result != "[]" && IS_DUPLICATION_CHECKED == false) {
                localStorage.setItem("duplicatesString", result.stringOutput);
                var navigationOptions = {
                    target: 2, // 2 opens the page as a modal dialog
                    width: 850,
                    height: 520,
                    position: 1 // 1 for center, 2 for side pane
                };
                var pageInput = {
                    pageType: "webresource",
                    webresourceName: "el_action_duplicate_detection_records", //Point to problem -> schem name or name
                };

                if (needToPrevent == true && context && context.getEventArgs()) {
                    context.getEventArgs().preventDefault();
                }
                _commons.NavigateTo(pageInput, navigationOptions);

            } else {
                IS_DUPLICATION_CHECKING = false;
            }

        } catch (error) {
            _commons.PageErrorHandler(error, "opportunity.openDuplicatesWindow");
        }
    };
    opportunity.saveOrExit = async function (needToSave) {
        try {
            if (needToSave == true) {
                IS_DUPLICATION_CHECKED = true;
                await commons.SaveForm();
            }

            IS_DUPLICATION_CHECKING = false;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.saveOrExit");
        }
    };
    opportunity.updateRecordUrlField = function () {
        try {
            if (commons.GetAttribute("el_s_record_url")) {
                var recordId = commons.StripGuid(commons.GetCurrentEntityId());
                var objectTypeCode = 3;
                var recordURL = commons.GetClientUrl() + "/main.aspx?etc=" + objectTypeCode + "&id=%7b" + recordId + "%7d&pagetype=entityrecord";

                commons.SetFieldValue("el_s_record_url", recordURL);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.updateRecordUrlField");
        }
    };
    opportunity.setGlobalModel = function () {
        try {
            var noModel = "אחר";
            var noCar = "אין רכב ללקוח";
            var globalModel = commons.GetLookupFieldValue("el_id_global_model");

            commons.SetVisible("el_s_current_car", false);
            commons.SetRequiredLevel("el_s_current_car", "none");
            commons.SetVisible("el_id_global_model", true);
            commons.SetRequiredLevel("el_id_global_model", "required");

            if (globalModel && globalModel.name) {
                switch (globalModel.name) {
                    case noModel:
                        commons.SetVisible("el_s_current_car", true);
                        commons.SetRequiredLevel("el_s_current_car", "required");
                        break;

                    case noCar:
                        commons.SetVisible("el_s_current_car", false);
                        commons.SetRequiredLevel("el_s_current_car", "none");

                        if (commons.GetFieldValue("el_s_current_car")) {
                            commons.SetFieldValue("el_s_current_car", null);
                        }

                        break;

                    default:
                        commons.SetVisible("el_s_current_car", false);
                        commons.SetRequiredLevel("el_s_current_car", "none");

                        if (commons.GetFieldValue("el_s_current_car")) {
                            commons.SetFieldValue("el_s_current_car", null);
                        }

                        break;
                }

            } else {
                commons.SetVisible("el_s_current_car", false);
                commons.SetRequiredLevel("el_s_current_car", "none");

                if (commons.GetFieldValue("el_s_current_car")) {
                    commons.SetFieldValue("el_s_current_car", null);
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setGlobalModel");
        }
    };
    opportunity.preventSavingAccountNotCompleted = function (context, saveCommons) {
        try {
            if (opportunity.accountFormIncomplete(saveCommons) == true) {
                saveCommons.OpenAlertDialog("יש למלא פרטים מלאים בתיק לקוח");

                if (context && context.getEventArgs()) {
                    context.getEventArgs().preventDefault();
                }
            }

        } catch (error) {
            saveCommons.PageErrorHandler(error, "opportunity.preventSavingAccountNotCompleted");
        }
    };
    opportunity.accountFormIncomplete = function opportunity(commons) {
        try {
            debugger;
            var originatingLead = commons.GetAttribute("originatingleadid");
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id || !originatingLead || !originatingLead.getValue()) {
                return Promise.resolve(false);
            }
            var select = "?$select=el_b_refuse_email,el_b_refusetoidentify,_el_id_type_code_value,el_s_first_name,el_s_idnumber_text,el_s_last_name,emailaddress1,telephone1,telephone2";

            return commons.RetrieveRecord("account", commons.StripGuid(customer.id), select).then(function (account) {
                debugger;
                if (!account) {
                    return false;
                }

                if (!account.el_s_first_name) {
                    return true;
                }

                if (!account.el_s_last_name) {
                    return true;
                }

                if (!account.telephone1) {
                    return true;
                }

                if (!account.telephone2) {
                    return true;
                }

                if (!account.el_b_refuse_email && !account.emailaddress1) {
                    return true;
                }

                if (!account.el_b_refusetoidentify && (!account._el_id_type_code_value || !account.el_s_idnumber_text)) {
                    return true;
                }

                return false;
            }).catch(function (error) {
                commons.PageErrorHandler(error, "accountFormIncomplete->promise ");
                return false;
            });
        }
        catch (error) {
            commons.PageErrorHandler(error, "opportunity.accountFormIncomplete");
            return Promise.resolve(false);
        }
    };
    opportunity.preventSavingWrongTestDriveStatus = function (saveCommons) {
        try {
            var testDriveStatus = saveCommons.GetFieldValue("el_n_testdrive_status");
            var testDrive = saveCommons.GetFieldValue("el_l_testdrive");
            var documentTestDrive = saveCommons.GetFieldValue("el_b_document_testdrive");
            var message = "לא ניתן לבחור בסטטוס זה בשדה נסיעת הדגמה";

            if (documentTestDrive != true && ((testDriveStatus != TESTDRIVE_SCHEDULED && testDrive == TESTDRIVE_SCHEDULED) ||
                (testDriveStatus != TESTDRIVE_PERFORMED && testDrive == TESTDRIVE_PERFORMED) || (testDriveStatus != TESTDRIVE_CANCELLED && testDrive == TESTDRIVE_CANCELLED))) {
                saveCommons.OpenAlertDialog(message);

                if (context && context.getEventArgs()) {
                    context.getEventArgs().preventDefault();
                }

                saveCommons.SetFocus("el_l_testdrive");
                saveCommons.SetNotification("el_l_testdrive", message);
            }

        } catch (error) {
            saveCommons.PageErrorHandler(error, "opportunity.preventSavingWrongTestDriveStatus");
        }
    };
    opportunity.checkScannedOrderDocs = function () {
        try {
            var statusCode = commons.GetFieldValue("statuscode");
            var notificationId = "OrderDocsNotification";
            var message = "שים לב, עליך לסרוק את הזמנת הרכב באמצעות לחצן צירוף מסמך.";

            if ((statusCode == OPPORTUNITY_STATUS_ORDER || statusCode == OPPORTUNITY_STATUS_PAYMENT) && !opportunity.orderDocsScanned()) {
                commons.SetFormNotification(message, "WARNING", notificationId);
            } else {
                commons.PageClearMessages(notificationId);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.checkScannedOrderDocs");
        }
    };
    opportunity.orderDocsScanned = async function () {
        try {
            var opportunityId = commons.GetCurrentEntityId();
            if (!opportunityId) {
                return false;
            }
            var docs = await commons.RetrieveMultipleRecords("el_doc", "?$filter=_regardingobjectid_value eq " + commons.StripGuid(opportunityId) + " and (el_l_doc_type eq 8 or el_l_doc_type eq 9) and el_b_no_attachment eq false");
            return docs && docs.length >= 1;
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.orderDocsScanned");
            return false;
        }
    };
    opportunity.checkCarLicense = async function () {
        try {
            
            var tradeinQuote = commons.GetFieldValue("el_l_tradein_quote");
            var notificationId = "CarLicenseNotification";
            var message = "ציינת שהלקוח מעוניין בהצעת טרייד אין. במקרה זה חובה לסרוק רישיון רכב.";

            if (tradeinQuote == TRADEIN_QUOTE_INTERESTED && !(await opportunity.tradeinCarLicenseScanned())) {
                commons.SetFormNotification(message, "WARNING", notificationId);
            } else {
                commons.PageClearMessages(notificationId);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.checkCarLicense");
        }
    };
    opportunity.tradeinCarLicenseScanned = function () {
        try {
            var tradeinQuote = commons.GetFieldValue("el_l_tradein_quote");

            if (tradeinQuote == TRADEIN_QUOTE_INTERESTED) {
                var opportunityId = commons.GetCurrentEntityId();

                if (!opportunityId) {
                    return Promise.resolve(true);
                }

                return commons.RetrieveMultipleRecords("el_tradein_offer", "?$filter=_el_id_opportunity_value eq " + commons.StripGuid(opportunityId) + " and el_b_car_license eq false").then(function (docs) {
                    if (docs && docs.length >= 1) {
                        return false;
                    }

                    return true;
                }).catch(function (error) {
                    commons.PageErrorHandler(error, "opportunity.tradeinCarLicenseScanned");
                    return true;
                });
            }

            return Promise.resolve(true);

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.tradeinCarLicenseScanned");
            return Promise.resolve(true);
        }
    };
    opportunity.fillSalesCampaign = function () {
        try {
            var manufacturer = commons.GetLookupFieldValue("el_id_manufacturer");
            var today = new Date();

            if (manufacturer && manufacturer.id) {
                var query = "?$select=el_name,el_sales_campaignid&$filter=el_dt_valid_from le " + yyyymmdd(today) + " and el_dt_valid_until ge " + yyyymmdd(today, true) + " and _el_id_manufacturer_value eq " + commons.StripGuid(manufacturer.id) + " and el_b_specific_promotion eq false";

                return commons.RetrieveMultipleRecords("el_sales_campaign", query).then(function (campaigns) {
                    if (campaigns && campaigns.length >= 1 && campaigns[0].el_sales_campaignid && campaigns[0].el_name) {
                        var salesCampaignLookup = commons.getLookupField(campaigns[0].el_sales_campaignid, campaigns[0].el_name, "el_sales_campaign");

                        commons.SetLookupValue("el_id_sales_campaign", salesCampaignLookup);
                    }
                }).catch(function (error) {
                    commons.PageErrorHandler(error, "opportunity.fillSalesCampaign");
                });
            }

            return Promise.resolve();

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.fillSalesCampaign");
            return Promise.resolve();
        }
    };
    opportunity.setReadonlyBehaviourByUserRole = async function () {
        try {
            if (!commons.IsMobile()) { 
                var hasRole = await commons.UserHasRoleOrIsAdmin();

                commons.SetDisabled("customerid", !hasRole);
                commons.SetDisabled("header_statuscode", !hasRole);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setReadonlyBehaviourByUserRole");
        }
    };
    opportunity.setNameFieldOnLoad = function () {
        try {
            var originatingLead = commons.GetLookupFieldValue("originatingleadid");
            var customer = commons.GetLookupFieldValue("customerid");
            var name = commons.GetFieldValue("name");

            if (!originatingLead && !name && customer && customer.name) {
                commons.SetFieldValue("name", customer.name);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setNameFieldOnLoad");
        }
    };
    opportunity.setNameField = function () {
        try {
            var originatingLead = commons.GetLookupFieldValue("originatingleadid");
            var customer = commons.GetLookupFieldValue("customerid");
            var family = commons.GetLookupFieldValue("el_id_family");
            var customerName = customer && customer.name ? customer.name : "";
            var familyName = family && family.name ? " " + family.name : "";

            if (!originatingLead) {
                if (!customerName && !familyName) {
                    commons.SetFieldValue("name", null);
                } else {
                    commons.SetFieldValue("name", customerName + familyName);
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setNameField");
        }
    };
    opportunity.setAccountLookup = function (id, name, opportunityId) {
        try {
            if (commons.GetCurrentEntityId() == opportunityId) {
                commons.SetLookupValue("customerid", commons.getLookupField(id, name, "account"));
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setAccountLookup");
        }
    };
    opportunity.saveTestDriveStatus = function () {
        try {
            var testDrive = commons.GetFieldValue("el_l_testdrive");

            if (commons.GetAttribute("el_n_testdrive_status")) {
                if (testDrive) {
                    commons.SetFieldValue("el_n_testdrive_status", testDrive);
                } else {
                    commons.SetFieldValue("el_n_testdrive_status", 0);
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.saveTestDriveStatus");
        }
    };
    opportunity.setTestDriveFieldsDoc = function () {
        try {
            var today = new Date();
            var documentTestDrive = commons.GetFieldValue("el_b_document_testdrive") == true;
            var family = commons.GetLookupFieldValue("el_id_family");

            if (documentTestDrive) {
                commons.SetSectionVisibility("tab_6", "testdriveDoc", true);
                commons.SetSectionVisibility("tab_6", "testdrive", false);

                commons.SetRequiredLevel("el_dt_testdrive_doc_date", "required");
                commons.SetRequiredLevel("el_l_testdrive_doc_type", "required");
                commons.SetRequiredLevel("el_id_family_testdrive_doc", "required");
                commons.SetRequiredLevel("el_id_model_testdrive_doc", "required");

                if (commons.GetAttribute("el_dt_testdrive_doc_date")) {
                    commons.SetFieldValue("el_dt_testdrive_doc_date", new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
                }

                if (commons.GetAttribute("el_id_family_testdrive_doc")) {
                    commons.SetLookupValue("el_id_family_testdrive_doc", family.id);
                }

                if (commons.GetAttribute("el_l_testdrive_doc_type")) {
                    commons.SetFieldValue("el_l_testdrive_doc_type", 1);
                }

                if (commons.GetAttribute("el_l_testdrive")) {
                    commons.SetFieldValue("el_l_testdrive", TESTDRIVE_PERFORMED);
                }

            } else {
                commons.SetRequiredLevel("el_dt_testdrive_doc_date", "none");
                commons.SetRequiredLevel("el_l_testdrive_doc_type", "none");
                commons.SetRequiredLevel("el_id_family_testdrive_doc", "none");
                commons.SetRequiredLevel("el_id_model_testdrive_doc", "none");

                if (commons.GetAttribute("el_dt_testdrive_doc_date")) {
                    commons.SetFieldValue("el_dt_testdrive_doc_date", null);
                }

                if (commons.GetAttribute("el_id_family_testdrive_doc")) {
                    commons.SetLookupValue("el_id_family_testdrive_doc", null);
                }

                if (commons.GetAttribute("el_l_testdrive_doc_type")) {
                    commons.SetFieldValue("el_l_testdrive_doc_type", null);
                }
                if (commons.GetAttribute("el_id_model_testdrive_doc")) {
                    commons.SetLookupValue("el_id_model_testdrive_doc", null);
                }

                commons.SetSectionVisibility("tab_6", "testdriveDoc", false);
                commons.SetSectionVisibility("tab_6", "testdrive", true);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setTestDriveFieldsDoc");
        }
    };
    opportunity.setTestDriveFields = function () {
        try {
            commons.ClearNotification("el_l_testdrive");

            opportunity.setTestDriveFieldsDoc();

            var offerTestDrive = commons.GetFieldValue("el_l_offer_testdrive");
            var testDrive = commons.GetFieldValue("el_l_testdrive");
            var familyTestDrive = commons.GetLookupFieldValue("el_id_family_testdrive");
            var family = commons.GetLookupFieldValue("el_id_family");

            commons.SetDisabled("el_id_family_testdrive", false);
            commons.SetDisabled("el_id_model", false);

            if (offerTestDrive == TESTDRIVE_OFFER_YES) {
                commons.SetSectionVisibility("tab_6", "testdrive", true);
                commons.SetRequiredLevel("el_l_testdrive", "required");

                if (commons.GetAttribute("el_b_offer_testdrive")) {
                    commons.SetFieldValue("el_b_offer_testdrive", true);
                }

                if (commons.GetControl("el_b_document_testdrive")) {
                    commons.SetVisible("el_b_document_testdrive", true);
                }

            } else {
                commons.SetSectionVisibility("tab_6", "testdrive", false);
                commons.SetRequiredLevel("el_l_testdrive", "none");

                if (commons.GetAttribute("el_b_offer_testdrive")) {
                    commons.SetFieldValue("el_b_offer_testdrive", false);
                }

                if (commons.GetControl("el_b_document_testdrive")) {
                    commons.SetVisible("el_b_document_testdrive", false);
                }

                if (commons.GetAttribute("el_l_testdrive")) {
                    commons.SetFieldValue("el_l_testdrive", null);
                }

                if (commons.GetAttribute("el_id_family_testdrive")) {
                    commons.SetLookupValue("el_id_family_testdrive", null);
                }

                if (commons.GetAttribute("el_id_model")) {
                    commons.SetLookupValue("el_id_model", null);
                }
            }

            if (testDrive == TESTDRIVE_INTERESTED) {
                commons.SetRequiredLevel("el_id_family_testdrive", "required");
                commons.SetRequiredLevel("el_id_model", "required");

                if (!familyTestDrive && family) {
                    commons.SetLookupValue("el_id_family_testdrive", family);
                }

            } else {
                commons.SetRequiredLevel("el_id_family_testdrive", "none");
                commons.SetRequiredLevel("el_id_model", "none");

                if (testDrive == TESTDRIVE_NOT_INTERESTED) {
                    commons.SetDisabled("el_id_family_testdrive", true);
                    commons.SetDisabled("el_id_model", true);

                    if (commons.GetAttribute("el_id_family_testdrive")) {
                        commons.SetLookupValue("el_id_family_testdrive", null);
                    }

                    if (commons.GetAttribute("el_id_model")) {
                        commons.SetLookupValue("el_id_model", null);
                    }
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setTestDriveFields");
        }
    };
    opportunity.setOpportunityDefaultValues = function () {
        try {
            if (commons.GetAttribute("el_n_car_amount") && commons.GetFormType() == Enum.FormType.Create) {
                commons.SetFieldValue("el_n_car_amount", 1);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setOpportunityDefaultValues");
        }
    };
    opportunity.relatedAccountData = function (commons) {
        try {
            debugger;
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return Promise.resolve(null);
            }

            return commons.RetrieveRecord("account", commons.StripGuid(customer.id), "?$select=el_s_idnumber_text,el_b_refusetoidentify,_el_id_city_value").then(function (account) {
                if (account != null) {
                    return account;
                }

                return null;
            }).catch(function (error) {
                commons.PageErrorHandler(error, "opportunity.relatedAccountData");
                return null;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.relatedAccountData");
            return Promise.resolve(null);
        }
    };
    opportunity.accountNoAdditionalTelephone = function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return Promise.resolve(false);
            }

            return commons.RetrieveRecord("account", commons.StripGuid(customer.id), "?$select=telephone2").then(function (account) {
                if (account != null) {
                    return account.telephone2 == null || account.telephone2 == "";
                }

                return false;
            }).catch(function (error) {
                commons.PageErrorHandler(error, "opportunity.accountNoAdditionalTelephone");
                return false;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.accountNoAdditionalTelephone");
            return Promise.resolve(false);
        }
    };
    opportunity.accountLongTelephoneValue = function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return Promise.resolve(false);
            }

            return commons.RetrieveRecord("account", commons.StripGuid(customer.id), "?$select=telephone1,telephone2,fax").then(function (account) {
                var faxIsLong = false;
                var phoneIsLong = false;

                if (account != null && account.fax) {
                    faxIsLong = account.fax.length > 10;
                }

                if (account != null && account.telephone2 && account.telephone1) {
                    phoneIsLong = account.telephone1.length > 10 || account.telephone2.length > 10;
                }

                return faxIsLong == true || phoneIsLong == true;

            }).catch(function (error) {
                commons.PageErrorHandler(error, "opportunity.accountLongTelephoneValue");
                return false;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.accountLongTelephoneValue");
            return Promise.resolve(false);
        }
    };
    opportunity.openCarPurchasesExist = async function () {
        try {
            debugger;
            var opportunityId = commons.GetCurrentEntityId();

            if (!opportunityId) {
                return Promise.resolve(false);
            }

            var query = "?$filter=el_l_purchase_type eq " + PURCHASETYPE_NEWCAR + " and _el_id_opportunity_value eq " + commons.StripGuid(opportunityId);

            return await commons.RetrieveMultipleRecords("el_car_purchase", query).then(function (carPurchases) {
                return carPurchases && carPurchases.length >= 1;
            }).catch(function (error) {
                commons.PageErrorHandler(error, "opportunity.openCarPurchasesExist");
                return false;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.openCarPurchasesExist");
            return Promise.resolve(false);
        }
    };

    opportunity.orderProdRibbon = function (commons, field, customerFieldName, actionType) {
        try {
            debugger;
            var stars = "\n*******************************************************";
            var blanks = "\n                                                      ";

            opportunity.relatedAccountData(commons).then(function (accData) {
                debugger;
                if (!accData) {
                    return;
                }

                if (accData.el_b_refusetoidentify) {
                    var txt1 = "\nלא ניתן  להקים   הזמנה   ללקוח   שמסרב   להזדהות\n";
                    var txt2 = "\nנא לעדכן מס' ת.ז ללקוח\n";
                    var txt3 = !accData._el_id_city_value ? "\nלא ניתן להקים הזמנה ללקוח ללא כתובת מגורים.\n\nנא לעדכן כתובת ללקוח\n" : "";

                    commons.OpenAlertDialog(stars + stars + blanks + txt1 + txt2 + txt3 + stars + stars);
                    return;
                }

                if (!accData.el_b_refusetoidentify && (!accData.el_s_idnumber_text || accData.el_s_idnumber_text == "")) {
                    var txt4 = "\nלא ניתן  להקים   הזמנה   ללקוח   ללא מס' ת.ז   \n";
                    var txt5 = "\nנא לעדכן מס' ת.ז ללקוח\n";
                    var txt6 = !accData._el_id_city_value ? "\nלא ניתן להקים הזמנה ללקוח ללא כתובת מגורים.\n\nנא לעדכן כתובת ללקוח\n" : "";

                    commons.OpenAlertDialog(stars + stars + blanks + txt4 + txt5 + txt6 + stars + stars);
                    return;
                }

                if (!accData._el_id_city_value) {
                    var txt7 = "\nלא ניתן להקים הזמנה ללקוח ללא כתובת מגורים.\n\nנא לעדכן כתובת ללקוח\n";

                    commons.OpenAlertDialog(stars + stars + blanks + txt7 + stars + stars);
                    return;
                }

                opportunity.accountNoAdditionalTelephone().then(function (noAdditionalPhone) {
                    if (noAdditionalPhone) {
                        commons.OpenAlertDialog("לא ניתן להקים הזמנה חדשה ללקוח ללא טלפון נוסף. נא לעדכן את הטלפון הנוסף בלקוח");
                        return;
                    }

                    opportunity.accountLongTelephoneValue().then(function (longPhone) {
                        if (longPhone) {
                            commons.OpenAlertDialog("מספר טלפון יכול להכיל עד 10 תווים. נא לעדכן את השדות טלפון נייד, טלפון נוסף ופקס בלקוח בהתאם");
                            return;
                        }

                        var isAtLeastOneOfFieldsIsEmpty = commons.CheckIfAtLeastOneOfFieldsIsEmpty([
                            "el_s_special_request_for_delivery_date",
                            "el_s_notes_to_the_delivery_department",
                            "el_s_favourites_radio_station",
                            "el_s_car_coder"
                        ]);

                        if (isAtLeastOneOfFieldsIsEmpty) {
                            var alertStrings = commons.GetNewXrmAlertStrings(Const.Message.Hebrew.PleaseFillInTheDetailsInTheCarDeliverySection);

                            commons.OpenAlertDialog(alertStrings, null, function () {
                                commons.showOpenLegacyRibbon(field, customerFieldName, actionType);
                            });

                        } else {
                            commons.showOpenLegacyRibbon(field, customerFieldName, actionType);
                        }

                    }).catch(function (error) {
                        commons.PageErrorHandler(error, "opportunity.orderProdRibbon.accountLongTelephoneValue");
                    });

                }).catch(function (error) {
                    commons.PageErrorHandler(error, "opportunity.orderProdRibbon.accountNoAdditionalTelephone");
                });

            }).catch(function (error) {
                commons.PageErrorHandler(error, "opportunity.orderProdRibbon.relatedAccountData");
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.orderProdRibbon");
        }
    };



    opportunity.CreateBidRibbon = function () {
        try {
            // get all bids (docs) with value in the field el_l_funding_offer ordered by createdon desc

            var name = commons.GetFieldValue("name") ? commons.GetFieldValue("name") : commons.GetEntityName();
            var account = commons.GetLookupFieldValue("customerid");
            var family = commons.GetLookupFieldValue("el_id_family");
            var extRaqs = "";
            var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes";

            extRaqs += "pId=" + commons.GetCurrentEntityId();
            extRaqs += "&pName=" + name;
            extRaqs += "&pType=" + commons.GetQueryStringParameter("etc");
            extRaqs += "&el_l_doc_type=" + DOCTYPE_BID;
            extRaqs += "&el_l_quote_type=" + BIDTYPE_TEMPLATE;
            extRaqs += "&el_b_generate_document=true";
            extRaqs += "&el_l_funding_offer=" + commons.GetFieldValue("el_l_funding_offer");

            if (account != null) {
                extRaqs += "&el_id_account=" + account.id;
                extRaqs += "&el_id_accountname=" + account.name;
            }

            if (family != null) {
                extRaqs += "&el_id_family=" + family.id;
                extRaqs += "&el_id_familyname=" + family.name;
            }

            var url = commons.PrependOrgName("/main.aspx?etc=" + EL_DOC_TYPECODE + "&pagetype=entityrecord&extraqs=" + encodeURIComponent(extRaqs));

            commons.openUrl(url, "_blank", features, false);

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.CreateBidRibbon");
        }
    };



    opportunity.ribbonOpenTradein = function (primaryControl) {
        try {
            if (!commons.IsMobile()) {
                Mscrm.GridRibbonActions.addNewFromSubGridStandard(
                    TRADEIN_OFFER_TYPECODE,
                    OPPORTUNITY_TYPECODE,
                    commons.GetCurrentEntityId(),
                    primaryControl,
                    commons.GetControl("tradein").$Y_0
                );
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonOpenTradein");
        }
    };
    

    opportunity.setDisqualifyOpportunityFilter = function () {
        try {
            var filter = "<filter type='and'><condition attribute='el_l_disqualify_entity_type' operator='eq' value='2'/></filter>"; // 1 for lead, 2 for opportunity

            commons.GetControl("el_id_disqualify_primary_reason").addCustomFilter(filter, "el_disqualify_primary_reason");

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setDisqualifyOpportunityFilter");
        }
    };
    opportunity.setDisqualifySection = function () {
        try {
            if (commons.GetTab("tab_6").sections.get("tab_general_section_reason4reject")) {
                var primaryReason = commons.GetLookupFieldValue("el_id_disqualify_primary_reason");

                if (primaryReason) {
                    commons.SetSectionVisibility("tab_6", "tab_general_section_reason4reject", true)
                } else {
                    commons.SetSectionVisibility("tab_6", "tab_general_section_reason4reject", false)
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setDisqualifySection");
        }
    };
    opportunity.UpdateYomanField = function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");
            var isVerified = null;

            if (commons.GetAttribute("el_b_details_have_been_verified")) {
                var attributeValue = commons.GetFieldValue("el_b_details_have_been_verified");

                if (attributeValue !== null && attributeValue !== undefined) {
                    isVerified = attributeValue;
                } else {
                    console.log("el_b_details_have_been_verified attribute is empty or undefined.");
                }
            }

            if (customer && customer.id && isVerified != null && !isVerified) {
                commons.RetrieveRecord(
                    "account",
                    commons.StripGuid(customer.id),
                    "?$select=name,telephone1,emailaddress1"
                ).then(function (customerRecord) {
                    if (!customerRecord) {
                        return;
                    }

                    var gapFields = [];
                    var fullName = customerRecord.name;
                    var nameParts = fullName.split(" ");

                    var lastname = nameParts[0];
                    var firstname = nameParts.slice(1).join(" ");

                    if (commons.GetFieldValue("el_s_firstname_yoman") != null &&
                        commons.GetFieldValue("el_s_firstname_yoman") != firstname) {
                        gapFields.push("שם פרטי");
                    }

                    if (commons.GetFieldValue("el_s_lastname_yoman") != null &&
                        commons.GetFieldValue("el_s_lastname_yoman") != lastname) {
                        gapFields.push("שם משפחה");
                    }

                    if (commons.GetFieldValue("el_s_phonenumber_yoman") != null &&
                        commons.GetFieldValue("el_s_phonenumber_yoman") != customerRecord.telephone1) {
                        gapFields.push("טלפון");
                    }

                    if (commons.GetFieldValue("el_s_emailaddress_yoman") != null &&
                        commons.GetFieldValue("el_s_emailaddress_yoman") != customerRecord.emailaddress1) {
                        gapFields.push("כתובת מייל");
                    }

                    if (gapFields.length > 0) {
                        var notificationMessage = "יש פערים בשדות הבאים של יומן מול הלקוח: " + gapFields.join(", ") + ". אנא בדוק.";

                        commons.SetFormNotification(notificationMessage, "WARNING", "UpdateYomanField");
                    }
                });
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.UpdateYomanField");
        }
    };
    opportunity.addOpenLegacyQuotesNew = function (accountId) {
        try {
            var userId = commons.GetUserId();
            var parameters = "";
            var tradeinData = null;
            var account = null;
            var domainName = null;
            var ipAddress = null;
            var wifi = null;

            return commons.RetrieveRecord(
                "account",
                commons.StripGuid(accountId),
                ""
            ).then(function (accountRecord) {
                account = accountRecord;

                return commons.RetrieveRecord(
                    "systemuser",
                    commons.StripGuid(userId),
                    "?$select=domainname,el_tablet_connection_method,el_s_ip_address"
                );

            }).then(function (userRecord) {
                if (userRecord != null) {
                    for (var i = 0; i < userRecord.domainname.length; i++) {
                        if (userRecord.domainname[i] == "\\") {
                            domainName = userRecord.domainname.slice(i + 1, userRecord.domainname.length);
                        }
                    }

                    var tabletConnection = userRecord.el_tablet_connection_method;

                    if (tabletConnection != null && tabletConnection == 1) {
                        ipAddress = userRecord.el_s_ip_address;
                    } else {
                        wifi = "USB";
                    }
                }

                return commons.RetrieveMultipleRecords(
                    "el_tradein_offer",
                    "?$select=el_s_model,el_s_tr_accessories,el_s_tr_manuf_year,el_s_tr_number_of_owners,el_l_owner_type,el_s_tr_distance,el_dt_license_expiry_date&$filter=_el_id_opportunity_value eq " + commons.StripGuid(commons.GetCurrentEntityId())
                );

            }).then(function (tradeinResults) {
                if (tradeinResults != null && tradeinResults.length > 0) {
                    tradeinData = tradeinResults[0];
                }

                return opportunity.createURLParameters(
                    account,
                    tradeinData,
                    parameters,
                    ipAddress,
                    wifi,
                    domainName
                );
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.addOpenLegacyQuotesNew");
        }
    };
    opportunity.createURLParameters = function (account, tradeinData, parameters, ipAddress, wifi, domainName) {
        try {
            /* Account data */
            if (account != null) {
                parameters += "prf.fname=" + opportunity.notNullParam(account.el_s_first_name).trim() + "&";
                parameters += "prf.lname=" + opportunity.notNullParam(account.el_s_last_name).trim() + "&";
                parameters += "prf.mail=" + opportunity.notNullParam(account.emailaddress1 != null ? account.emailaddress1.toLowerCase() : "").trim() + "&";
                parameters += "prf.tel=" + opportunity.notNullParam(account.telephone1 != null ? account.telephone1 : account.telephone2).trim() + "&";
                parameters += "prf.tablet=" + opportunity.notNullParam(ipAddress != null ? ipAddress : wifi).trim() + "&";
                parameters += "prf.winUser=" + opportunity.notNullParam(domainName).trim() + "&";

                if (account.donotbulkemail == false) {
                    parameters += "prf.divur=yes&";
                } else {
                    parameters += "prf.divur=no&";
                }

                parameters += "prf.crmOpr=" + opportunity.notNullParam(commons.StripGuid(commons.GetCurrentEntityId())) + "&";

            } else {
                parameters += "prf.fname=&prf.lname=&prf.mail=&prf.tel=&prf.winUser=&prf.crmOpr=&";
            }

            /* Tradein data */
            if (tradeinData != null) {
                parameters += "prf.trddgm=" + opportunity.notNullParam(tradeinData.el_s_model).trim() + "&";
                parameters += "prf.trdgimur=" + opportunity.notNullParam(tradeinData.el_s_tr_accessories).trim() + "&";
                parameters += "prf.trdmodl=" + opportunity.notNullParam(tradeinData.el_s_tr_manuf_year).trim() + "&";
                parameters += "prf.trdyad=" + opportunity.notNullParam(tradeinData.el_s_tr_number_of_owners).trim() + "&";
                parameters += "prf.trdkm=" + opportunity.notNullParam(tradeinData.el_s_tr_distance).trim() + "&";
                parameters += "prf.trdtest=" + opportunity.notNullParam(tradeinData.el_dt_license_expiry_date).replaceAll("-", "").replaceAll("/", "").replaceAll("\\", "").replaceAll(":", "").trim() + "&";
                parameters += "prf.trdxown=" + opportunity.notNullParam(opportunity.getPreviouslyOwnedLableByCode(tradeinData.el_l_owner_type)).trim() + "&";

            } else {
                parameters += "prf.trddgm=&prf.trdgimur=&prf.trdmodl=&prf.trdmodl=&prf.trdyad=&prf.trdkm=&prf.trdxown=&prf.trdtest=";
            }

            return parameters;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.createURLParameters");
        }
    };
    opportunity.getPreviouslyOwnedLableByCode = function (code) {
        try {
            switch (code) {
                case 1:
                    return "פרטי";

                case 2:
                    return "ליסינג";

                case 3:
                    return "השכרה";

                case 4:
                    return "חברה";

                case 5:
                    return "יבוא אישי";

                case 6:
                    return "בי\"ס לנהיגה";

                default:
                    return "";
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.getPreviouslyOwnedLableByCode");
            return "";
        }
    };
    opportunity.ChangeRecordStatus = function (commons, recordId, stateCode, statusCode, entityName) {
        try {
            return commons.ChangeRecordStatus(
                recordId,
                stateCode,
                statusCode,
                entityName
            ).then(function () {
                commons.OpenEntityForm(entityName, recordId);
            });

        } catch (error) {
            commons.PageErrorHandler(error, "common.changeRecordStatus");
        }
    };
    opportunity.setManufacturerAndFamilyInLeadAndOpportunity = async function () {
        try {
            if (commons.GetAttribute("el_id_family")) {
                commons.SetRequiredLevel("el_id_family", "required");
            }

            if (commons.GetControl("el_id_family")) {
                commons.SetDisabled("el_id_family", true);
                commons.SetVisible("el_id_family", true);
            }

            if (commons.GetControl("el_id_manufacturer")) {
                commons.SetVisible("el_id_manufacturer", false);
            }

            if (commons.GetAttribute("el_s_future_model")) {
                commons.SetVisible("el_s_future_model", false);
            }

            if (commons.GetLookupFieldValue("el_id_manufacturer") && commons.GetControl("el_id_family")) {
                commons.SetDisabled("el_id_family", false);
            }

            if (commons.GetFieldValue("el_b_mixed_showroom") &&
                commons.GetFormType() == Enum.FormType.Create &&
                commons.GetControl("el_id_manufacturer")) {

                commons.SetVisible("el_id_manufacturer", true);
            }

            if (commons.GetCurrentEntityName() == "lead" &&
                commons.GetAttribute("statuscode") &&
                commons.GetFieldValue("statuscode") == LEAD_STATUS_FUTURE_MODEL) {

                if (commons.GetAttribute("el_id_family")) {
                    commons.SetRequiredLevel("el_id_family", "none");
                }

                if (commons.GetControl("el_id_family")) {
                    commons.SetVisible("el_id_family", false);
                }

                if (commons.GetControl("el_s_future_model")) {
                    commons.SetVisible("el_s_future_model", true);
                }
            }

            opportunity.applyFilterFamily();
            
            if (await commons.UserHasRoleOrIsAdmin(Const.SecurityRolesName.SERVICE_SYSTEM_ROLE) &&
                commons.GetFormType() == Enum.FormType.Create) {

                commons.SetVisible("el_id_manufacturer", true);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.setManufacturerAndFamilyInLeadAndOpportunity");
        }
    };
    opportunity.filterFamilyByManufacturer = function () {
        try {
            var manufacturer = commons.GetLookupFieldValue("el_id_manufacturer");

            if (manufacturer && manufacturer.id) {
                var fetchXml = "<filter type='and'>" +
                    "<condition attribute='el_id_manufacturer' operator='eq' value='" + manufacturer.id + "' />" +
                    "</filter>";

                if (commons.GetControl("el_id_family")) {
                    commons.GetControl("el_id_family").addCustomFilter(fetchXml);
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.filterFamilyByManufacturer");
        }
    };
    opportunity.applyFilterFamily = function () {
        try {
            if (commons.GetControl("el_id_family")) {
                commons.GetControl("el_id_family").addPreSearch(opportunity.filterFamilyByManufacturer);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.applyFilterFamily");
        }
    };
    opportunity.visibleFieldDelivery = function () {
        try {
            var powerAttorney = commons.GetFieldValue("el_b_authorized_withdrawal");

            if (powerAttorney == true) {
                commons.SetVisible("el_s_name_of_power_of_attorney", true);
            } else {
                commons.SetVisible("el_s_name_of_power_of_attorney", false);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.visibleFieldDelivery");
        }
    };
    opportunity.showField = function () {
        try {
            if (commons.GetAttribute("statuscode") &&
                commons.GetFieldValue("statuscode") == OPPORTUNITY_STATUS_ORDER || commons.GetFieldValue("statuscode") == OPPORTUNITY_STATUS_PAYMENT) {

                if (commons.GetFieldValue("el_b_other_car_owners") == true) {
                    commons.SetSectionVisibility("tab_6", "tab_6_section_7", true);
                } else {
                    commons.SetSectionVisibility("tab_6", "tab_6_section_7", false);
                }

            } else {
                commons.SetSectionVisibility("el_b_other_car_owners", false);
                commons.SetSectionVisibility("tab_6", "tab_6_section_7", false);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showField");
        }
    };
    opportunity.getEmailRegardingOpportunity = function (commons) {
        try {
            debugger;
            var guid = commons.GetCurrentEntityId();

            commons.RetrieveMultipleRecords(
                "email",
                "?$select=activityid,createdon&$filter=_regardingobjectid_value eq " + commons.StripGuid(guid) + "&$orderby=createdon desc"
            ).then(function (emails) {
                if (emails &&
                    emails.length > 0) {
                    commons.OpenEntityForm({
                        entityName: "email",
                        entityId: emails[0].activityid
                    });
                }
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.getEmailRegardingOpportunity");
        }
    };
    opportunity.RelatedActiveAppointmentExist = async function () {
        try {
            var opportunityId = commons.GetCurrentEntityId();

            return await commons.RetrieveMultipleRecords(
                "appointment",
                "?$filter=_regardingobjectid_value eq " +
                commons.StripGuid(opportunityId) +
                " and (statecode eq 3 or statecode eq 0)"
            ).then(function (appointments) {
                if (appointments &&
                    appointments.length >= 1) {

                    return true;
                }

                return false;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.RelatedActiveAppointmentExist");
        }
    };
    opportunity.CheckIfAtLeastOneOfFieldsIsEmpty = function (fieldsSchemaNamesArray) {
        try {
            if (!fieldsSchemaNamesArray ||
                fieldsSchemaNamesArray.length < 1) {

                return false;
            }

            for (var i = 0; i < fieldsSchemaNamesArray.length; i++) {
                var field = commons.GetFieldValue(fieldsSchemaNamesArray[i]);

                if (!field) {
                    return true;
                }
            }

            return false;

        } catch (error) {
            commons.PageErrorHandler(error, "common.CheckIfAtLeastOneOfFieldsIsEmpty");
            return false;
        }
    };
    opportunity.euroDriveShowroomLogic = function () {
        try {
            if (isEuroDriveShowroom == true) {
                commons.SetRequiredLevel("el_id_global_model", "none");
                commons.SetRequiredLevel("el_l_offer_testdrive", "none");
            } else {
                commons.SetRequiredLevel("el_id_global_model", "required");
                commons.SetRequiredLevel("el_l_offer_testdrive", "required");
            }

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.euroDriveShowroomLogic");
        }
    };
    opportunity.openDigitalDocumentYipuiKoch =  function (commons) {
        debugger;
        try {
            var opportunityId = commons.StripGuid(commons.GetCurrentEntityId()).toLowerCase();
            commons.RetrieveMultipleRecords(
                "contact",
                "?$select=mobilephone,emailaddress1,contactid,fullname&$filter=_el_id_opportunity_value eq " + opportunityId
            ).then(async function (contacts) {
                debugger;
                if (contacts && contacts.length > 0) {

                    let pageInput = {
                        pageType: "entityrecord",
                        entityName: Const.EntityLogicalName.el_digital_signing_job,
                        data: {
                            el_s_title: Const.PageTitle.el_production_digital_doc_YipuiKoach,
                            el_id_ooportunity: commons.GetCurrentEntityId(),
                            el_id_ooportunityname: commons.GetPrimaryAttributeValue(),
                            el_id_doc_template:  await commons.GetGlobalParameterValueByName("WeSign-YipuiKochDocId"),
                            el_id_doc_templatename: Const.PageTitle.el_production_digital_doc_YipuiKoach
                        }
                    };

                    
                    for (var i = 0; i < contacts.length; i++) {
                        var contactId = contacts[i].contactid;

                        pageInput.data["el_id_contact"] = contactId;
                        pageInput.data["el_id_contactname"] = contacts[i].fullname;
                        
                        let navigationOptions = {
                            target: 2,
                            width: { value: 70, unit: "%" },
                            height: { value: 70, unit: "%" },
                            position: 1,
                            title: Const.PageTitle.el_production_digital_doc_YipuiKoach
                        };

                         return commons.NavigateTo(pageInput, navigationOptions)
                            .catch(function (error) {
                                commons.PageErrorHandler(error, "opportunity.openDigitalDocumentYipuiKoch -> NavigateTo");
                            });
                    }
                }                    
            });
        }
        catch (error) {
            commons.PageErrorHandler(error, "opportunity.openDigitalDocumentYipuiKoch");
        }
    };
    opportunity.openDigitalDocument = async function (commons) {
        try {
            debugger;
            var customer = commons.GetLookupFieldValue("customerid");

            var parameters = {};

            parameters["el_s_title"] = "הפקה דיגיטלית עבור אישור דיוור";
            parameters["el_id_ooportunity"] = commons.GetCurrentEntityId();
            parameters["el_id_ooportunityname"] = commons.GetPrimaryAttributeValue();

            if (customer != null) {
                parameters["el_id_account"] = customer.id;
                parameters["el_id_accountname"] = customer.name;
            }

            parameters["el_id_doc_template"] = await commons.GetGlobalParameterValueByName("WeSign-MailingConfirmationDocId");
            parameters["el_id_doc_templatename"] = "אישור דיוור";

            var windowOptions = {
                entityName: "el_digital_signing_job",
                openInNewWindow: true
            };

            commons.OpenEntityForm(windowOptions, parameters);
                

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.openDigitalDocument");
        }
    };
    opportunity.AuditingLeadUpdates = async function (oppId) {
        try {
            if (!oppId) {
                return false;
            }

            var opportunity = await commons.RetrieveRecord("opportunity", commons.StripGuid(oppId), "?$select=el_b_auditing_lead,statecode");

            if (!opportunity) {
                return false;
            }

            var stateCode = commons != null ? commons.GetFieldValue("statecode") : opportunity.statecode;

            if (opportunity.el_b_auditing_lead != true) {
                if (opportunity && stateCode != Enum.opportunity.statecode.Won) {
                    await opportunity.updateOpportunityFields(oppId, { el_b_auditing_lead: true });

                } else {
                    if (stateCode === Enum.opportunity.statecode.Open || stateCode === Enum.opportunity.statecode.Lost) {
                        commons.SetFieldValue("el_b_auditing_lead", true);

                        if (stateCode === Enum.opportunity.statecode.Lost) {
                            opportunity.disqualifyOpportunity();
                            commons.SaveForm();
                        }
                    }
                }

            } else {
                if (commons != null) {
                    commons.LogOnConsoleAndOpenAlertDialog(Const.Message.Hebrew.OpportunityIsAlredyAuditingLead); // TASK 1344
                } else {
                    return true;
                }
            }

            return false;

        } catch (error) {
            commons.PageErrorHandler(error, "commons.AuditingLeadUpdates");
            return false;
        }
    };
    //---------- Ribbon ----------
    opportunity.Ribbon.confirmationMailingRibbon = function (primaryControl) {
        try {
            var commons = new elad_commons();
            commons.SetFormContext(primaryControl);
            opportunity.openDigitalDocument(commons);

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.confirmationMailingRibbon");
        }
    };
    opportunity.Ribbon.saveAndCloseOpp = function (primaryControl) {
        try {
            var commons = new elad_commons();
            commons.SetFormContext(primaryControl);
            primaryControl.data.save().then(
                function () {
                    primaryControl.ui.close();
                },
                function (error) {
                    console.error(error.message);
                }
            );

        } catch (error) {
            commons.PageErrorHandler(error, "saveAndCloseOpp");
        }
    }
   

    opportunity.Ribbon.Yoman = function (primaryControl, arg) {
        try {
            debugger;
            var commons = new elad_commons();
            commons.SetFormContext(primaryControl);
            var guid = commons.GetCurrentEntityId();
            var parameters = {
                opportunityid: guid,
                showroomName: "",
                appointmentid: "",
                Type_of_ride: arg
            };

            commons.CallGlobalAction(
                "el_ExecuteActionCreateInviteForYoman", parameters).then(function (result) {
                    var desc = result.desc;
                    try {
                        var url = new URL(desc);
                        commons.openUrl(url.toString(), "_blank");
                    } catch (error) {
                        commons.OpenAlertDialog(desc);
                    }
                });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.Yoman");
        }
    };

   

	opportunity.Ribbon.ribbonOpenSalesDocsPrint = function (primaryControl) {
		try {
			var commons = new elad_commons();
            commons.SetFormContext(primaryControl);

            var account = commons.GetLookupFieldValue("customerid");
            var manufacturer = commons.GetLookupFieldValue("el_id_manufacturer");

			let pageInput = {
				pageType: "entityrecord",
                entityName: Const.EntityLogicalName.el_print_sales_docs,
                data: {
                    el_id_opportunity: commons.StripGuid(commons.GetCurrentEntityId()),
                    el_id_opportunityname: commons.GetCurrentRecordName()
                }
			};

			let navigationOptions = {
				target: 2,
				width: { value: 70, unit: "%" },
				height: { value: 70, unit: "%" },
                position: 1,
                title: Const.PageTitle.el_print_sales_docs
			};
            if (account) {
                pageInput.data.el_id_account = commons.StripGuid(account.id);
                pageInput.data.el_id_accountname = account.name;
            }

            if (manufacturer) {
                pageInput.data.el_id_manufacturer = commons.StripGuid(manufacturer.id);
                pageInput.data.el_id_manufacturername = manufacturer.name;
            }

			

            return commons.NavigateTo(pageInput, navigationOptions)
                .catch(function (error) {
                    commons.PageErrorHandler(error, "opportunity.Ribbon.ribbonOpenSalesDocsPrint -> NavigateTo");
                });
		}
		catch (error) {
            commons.PageErrorHandler(error, "Error in opportunity.Ribbon.ribbonOpenSalesDocsPrint");
		}
	};

    opportunity.Ribbon.openTxtMsg = async function () {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            var telephoneAccount = null;
            var chatBrand = null;
            var txtTelephone = "\nחסר טלפון ללקוח\n";
            var txtChannel = "\nלא נמצא ערוץ\n";
            var txtChatBrand = "\nלא קיים מותג צ'אט\n";
            var txtAction = "\nהפעולה התקבלה \n";
            var opportunityId = commons.GetCurrentEntityId();
            var customer = commons.GetLookupFieldValue("customerid");
            if (customer && customer.id) {
                var accounts = await commons.RetrieveMultipleRecords(
                    "account",
                    "?$select=name,telephone1,telephone2&$filter=accountid eq " + commons.StripGuid(customer.id)
                );
                if (accounts && accounts.length > 0) {
                    if (accounts[0].telephone1) {
                        telephoneAccount = accounts[0].telephone1;
                    }
                    else {
                        commons.OpenAlertDialog(txtTelephone);
                    }
                }
            }

            var family = commons.GetLookupFieldValue("el_id_family");
            if (family && family.id) {
                var families = await commons.RetrieveMultipleRecords(
                    "el_family",
                    "?$select=el_name,el_p_chat_brand&$filter=el_familyid eq " + commons.StripGuid(family.id)
                );
                if (families && families.length > 0) {
                    chatBrand = families[0].el_p_chat_brand;
                }
            }
            if (!chatBrand) {
                commons.OpenAlertDialog(txtChatBrand);
                return;
            }
            var channels = await commons.RetrieveMultipleRecords(
                "el_text_server_configuration",
                "?$select=el_s_name,el_p_chat_brand,el_p_server_type,el_text_server_configurationid" +
                "&$filter=el_p_server_type eq " + TYPE_OF_CHANNEL_WHATSAPP +
                " and el_p_chat_brand eq " + chatBrand
            );
            if (!channels || channels.length == 0) {
                commons.OpenAlertDialog(txtChannel);
                return;
            }
            var channelConfigId = channels[0].el_text_server_configurationid;
            var templateConfigs = await commons.RetrieveMultipleRecords(
                "el_simplechat_template_config",
                "?$select=el_s_template_id,_el_id_bot_value" +
                "&$filter=el_l_template_type eq " + TAMPLATE_TYPE_SIMPLECHAT.SALES +
                " and _el_id_channel_value eq " + commons.StripGuid(channelConfigId)
            );
            if (!templateConfigs || templateConfigs.length == 0) {
                return;
            }
            var bot = templateConfigs[0]._el_id_bot_value;
            var parameters = {
                channelId: {
                    el_text_server_configurationid: channelConfigId,
                    "@odata.type": "Microsoft.Dynamics.CRM.el_text_server_configuration"
                },
                customerPhone: telephoneAccount,
                botId: {
                    el_text_input_questionid: bot,
                    "@odata.type": "Microsoft.Dynamics.CRM.el_text_input_question"
                }
            };

            var request = {
                channelId: parameters.channelId,
                customerPhone: parameters.customerPhone,
                botId: parameters.botId,
                getMetadata: function () {
                    return {
                        boundParameter: "entity",
                        operationType: 0,
                        operationName: "el_OutgoingwhatsappForOpportunity",
                        parameterTypes: {
                            entity: {
                                typeName: "mscrm.opportunity",
                                structuralProperty: 5
                            },
                            channelId: {
                                typeName: "mscrm.el_text_server_configuration",
                                structuralProperty: 5
                            },
                            customerPhone: {
                                typeName: "Edm.String",
                                structuralProperty: 1
                            },
                            botId: {
                                typeName: "mscrm.el_text_input_question",
                                structuralProperty: 5
                            }
                        }
                    };
                }
            };

            request.entity = {
                opportunityid: commons.StripGuid(opportunityId),
                "@odata.type": "Microsoft.Dynamics.CRM.opportunity"
            };

            var response = await Xrm.WebApi.online.execute(request);

            if (response.ok) {
                commons.OpenAlertDialog(txtAction);
            }
            return;

        } catch (error) {

            commons.PageErrorHandler(
                error,
                "opportunity.openTxtMsg"
            );
        }
    };
    opportunity.Ribbon.ribbonOpenCorrespondence = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (await opportunity.openCarPurchasesExist()) {
                commons.OpenAlertDialog("לא ניתן ליצור תרשומת בתהליך ללא הזמנה");
                return;
            }

            function successCallback(lookup) {
                window.console.log("lookup: " + lookup.savedEntityReference.id);
            }

            function errorCallback(error) {
                window.console.log("Error: " + error.errorCode + " " + error.message);
            }

            var parentOpportunity = {
                entityType: "opportunity",
                id: commons.GetCurrentEntityId()
            };

            var parameters = null;

            Xrm.Utility.openQuickCreate("el_correspondence", parentOpportunity, parameters).then(function (lookup) {
                successCallback(lookup);
            }, function (error) {
                errorCallback(error);
            });

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonOpenCorrespondence");
        }
    };

    opportunity.Ribbon.reopenOpp = function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetAttribute("el_dt_reopen_date") != null) {
                commons.SetFieldValue("el_dt_reopen_date", new Date());
            }
            var oppId = commons.GetCurrentEntityId();
            var newStateCode = 0;
            var newStatusCode = 102910010; // הזדמנות ראשונית
            opportunity.ChangeRecordStatus(commons, oppId, newStateCode, newStatusCode, "opportunity");
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.reopenOpp");
        }
    };

    opportunity.Ribbon.AddFileRibbon = function (primaryControl, callbackFunctiom) {
        try {
            debugger;
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            var name;
            if (elad_commons_obj.GetFieldValue("name")) {
                name = elad_commons_obj.GetFieldValue("name");
            } else if (elad_commons_obj.GetFieldValue("el_name")) {
                name = elad_commons_obj.GetFieldValue("el_name");
            } else if (elad_commons_obj.GetFieldValue("title")) {
                name = elad_commons_obj.GetFieldValue("title");
            } else {
                name = elad_commons_obj.GetEntityName();
            }
            var pageInput = {
                pageType: "entityrecord",
                entityName: "el_doc",
                data: {
                    el_l_funding_offer: commons.GetFieldValue("el_l_funding_offer")
                }
            };

            var navigationOptions = {
                target: 2,
                width: { value: 700, unit: "px" },
                height: { value: 600, unit: "px" }
            };
            commons.NavigateTo(pageInput, navigationOptions).then(opportunity.setFundingField(commons), null);
        } catch (error) {
            commons.PageErrorHandler(error, "common.AddFileRibbon");
        }
    };
    
    opportunity.Ribbon.disqualifyOpportunity = async function (primaryControl) {
        try {
            commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);

            if (await opportunity.RelatedActiveAppointmentExist()) {
                commons.OpenAlertDialog(Const.Message.Hebrew.CantCloseOpportunityWithActiveAppointment);
                return;
            }

            var openCarPurchaseExists = await opportunity.openCarPurchasesExist();

            if (!openCarPurchaseExists &&
                (!commons.GetLookupFieldValue("el_id_disqualify_primary_reason") ||
                    !commons.GetLookupFieldValue("el_id_disqualify_secondary_reason"))) {

                commons.OpenAlertDialog("נא למלא סיבות פסילה");
                commons.SetSectionVisibility("tab_6","tab_general_section_reason4reject", true)

                commons.GetControl("el_id_disqualify_primary_reason").addPreSearch(opportunity.setDisqualifyOpportunityFilter);
                
                commons.SetRequiredLevel("el_id_disqualify_primary_reason", "required");
                commons.SetRequiredLevel("el_id_disqualify_secondary_reason", "required");
                
                commons.FocusOnTab("tab_6");
                commons.SetFocus("el_id_disqualify_primary_reason");
            }    
        }
        catch (error) {
            if (commons) {
                commons.PageErrorHandler(error, "opportunity.disqualifyOpportunity");
            }
            else {
                console.error("opportunity.disqualifyOpportunity", error);
            }
        }
    };

    opportunity.Ribbon.SearchBid = function (primaryControl, commandProperties) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.IsMobile()) {
                return;
            }
            switch (commandProperties.SourceControlId.split('|').pop()) {

                case "el.opportunity.CreateQuotationFromTemplate.Button":
                    opportunity.CreateBidRibbon();
                    break;

                case "el.opportunity.CreateQuotationFromStock.Button":
                    commons.showOpenLegacyRibbon(STOCK_ORDER_URL, "customerid", "quote");
                    break;

                case "el.opportunity.CreateQuotationFromSpecial.Button":
                    commons.showOpenLegacyRibbon(SPECIAL_QUOTE_URL, "customerid");
                    break;

                case "el.opportunity.CreateQuotationFromNewStock.Button":
                    commons.showOpenLegacyRibbon(STOCK_ORDER_URL_NEW, "customerid", "quote");
                    break;

                case "el.opportunity.CreateQuotationFromNewSpecial.Button":
                    commons.showOpenLegacyRibbon(SPECIAL_QUOTE_URL_NEW, "customerid");
                    break;

                case "el.opportunity.CreateQuotationFromProductTreeNew.Button":
                    commons.showOpenLegacyRibbon(SPECIAL_QUOTE_URL_NEW, "customerid", "quote");
                    break;

                default:
                    commons.OpenAlertDialog("Button Unknown");
                    break;
            }

        } catch (error) {
            commons.PageErrorHandler(error, "SearchBid");
        }
    }
    opportunity.Ribbon.SearchOrder = function (primaryControl, commandProperties) {//AYA: Step1
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.IsMobile()) {
                return;
            }
            switch (commandProperties.SourceControlId.split('|').pop()) {
                case "el.opportunity.StockOrder.Button":
                    opportunity.orderProdRibbon(commons, STOCK_ORDER_URL, "customerid", "order");
                    break;

                case "el.opportunity.ProductTreeOrder.Button":
                    opportunity.orderProdRibbon(commons, PROD_TREE_ORDER_URL, "customerid", null);
                    break;

                default:
                    commons.OpenAlertDialog("Button Unknown");
                    break;
            }


        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.SearchOrder");
        }
    };


    opportunity.Ribbon.sendTried2ReachYouSmsRibbon = function (primaryControl, buttonName) {
        try {
            var commons = new elad_commons();
            commons.SetFormContext(primaryControl);
            var recordId = commons.GetCurrentEntityId();
            switch (buttonName) {
                case "el.opportunity.Form.Tried2reachYou.Button":
                    commons.ExecuteWorkflow(
                        Const.Workflow.opportunity["שלח הודעת SMS - ניסינו להשיגך - תהליך מכירה"],
                        recordId
                    );
                    break;
                case "el.opportunity.Form.Tried2reachYou0KmVehicle.Button":
                    commons.ExecuteWorkflow(
                        Const.Workflow.opportunity["שלח הודעת SMS - ניסינו להשיגך רכב 0 קמ - תהליך מכירה"],
                        recordId
                    );
                    break;
            }

            commons.OpenAlertDialog("נשלחה הודעה ללקוח");

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.sendTried2ReachYouSmsRibbon");
        }
    };
    opportunity.Ribbon.buttonYipuiKochRibbon = function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            opportunity.openDigitalDocumentYipuiKoch(commons);

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.buttonYipuiKochRibbon");
        }
    };
    
    opportunity.Ribbon.ExecuteCreateEmailWorkFlow = function (primaryControl) {
        try {
            debugger;
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            var guid = commons.GetCurrentEntityId();

            if (guid != "" && guid != null) {
                commons.ExecuteWorkflow(Const.Workflow.opportunity["תהליך מכירה - צור סיכום שיחה בדואל"], guid).then(function (result) {
                    opportunity.getEmailRegardingOpportunity(commons);
                })
            }

            //setTimeout(opportunity.getEmailRegardingOpportunity, 1500);

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.Ribbon.ExecuteCreateEmailWorkFlow");
        }
    };
    //ENTITY.Ribbon.EnableRules = {};
    opportunity.Ribbon.EnableRules.readyToPrintSalesDocs = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.IsMobile()) {
                return false;
            }

            if (commons.GetFormType() == Enum.FormType.Create) {
                return false;
            }

            if (commons.GetAttribute("statecode") && commons.GetFieldValue("statecode") != OPPORTUNITYSTATE_OPEN) {
                return false;
            }

            if (commons.GetAttribute("statuscode") && (commons.GetFieldValue("statuscode") == OPPORTUNITY_STATUS_ORDER || commons.GetFieldValue("statuscode") == OPPORTUNITY_STATUS_PAYMENT)) {
                if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                    await opportunity.initGlobalVar(commons);
                var enable = window.globalShowroom != null && window.globalShowroom.el_b_sales_docs != null ? window.globalShowroom.el_b_sales_docs : false;
                return enable;
            }

            return false;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.readyToPrintSalesDocs");
            return false;
        }
    };
   

    opportunity.Ribbon.EnableRules.showReopenOppButton = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            var modifiedOn = commons.GetFieldValue("modifiedon");
            if (!modifiedOn || commons.IsMobile()) {
                return false;
            }
            var reopenUntil = new Date(modifiedOn);
            reopenUntil.setDate(reopenUntil.getDate() + 90);
            if (commons.GetFieldValue("statecode") == OPPORTUNITYSTATE_OPEN) {
                return false;
            }
            if (await commons.UserHasRoleOrIsAdmin()) {
                return true;
            }
            if (openCarPurchasesExist()) {
                return false;
            }
            if (new Date() > reopenUntil) {
                return false;
            }
            if (!sameBU()) {
                return false;
            }
            return true;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showReopenOppButton");
            return false;
        }
    };
    opportunity.sameBU = async function () {
        var currentUserId = commons.GetContext().userSettings.userId;
        var owner = commons.GetLookupFieldValue("ownerid");

        if (!owner || !owner.id) {
            return false;
        }

        var currentUserBU = await opportunity.GetBusinessUnit(currentUserId);
        var ownerBU = await opportunity.GetBusinessUnit(owner.id);

        if (currentUserBU && ownerBU) {
            return currentUserBU === ownerBU;
        }
        return false;
    };
    opportunity.GetBusinessUnit = async function (userId) {
        if (!userId) {
            return null;
        }
        try {
            var result = await elad_commons_obj.RetrieveRecord("systemuser", userId, "?$select=_businessunitid_value");

            if (result && result._businessunitid_value) {
                return result._businessunitid_value;
            }

            return null;
        }
        catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.GetBusinessUnit");
            return null;
        }
    };
    

    opportunity.Ribbon.EnableRules.DisplayFlyoutButton = async function (primaryControl, field) {
        var commons = new elad_commons();
        commons.SetFormContext(primaryControl);
        if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
            await opportunity.initGlobalVar(commons);
        if (window.globalShowroom != null) {
            switch (field) {
                case "el_b_template_offer":
                    return window.globalShowroom.el_b_template_offer != null ? window.globalShowroom.el_b_template_offer : false;
                case "el_b_stock_quote_button":
                    return window.globalShowroom.el_b_stock_quote_button != null ? window.globalShowroom.el_b_stock_quote_button : false;
                case "el_b_special_quote_button":
                    return window.globalShowroom.el_b_special_quote_button != null ? window.globalShowroom.el_b_special_quote_button : false;
                case "el_b_stock_order_button":
                    return window.globalShowroom.el_b_stock_order_button != null ? window.globalShowroom.el_b_stock_order_button : false;
                case "el_b_prod_tree_order_button":
                    return window.globalShowroom.el_b_prod_tree_order_button != null ? window.globalShowroom.el_b_prod_tree_order_button : false;
                case "el_b_stock_quote_button_new":
                    return window.globalShowroom.el_b_stock_quote_button_new != null ? window.globalShowroom.el_b_stock_quote_button_new : false;
                case "el_b_special_quote_button_new":
                    return window.globalShowroom.el_b_special_quote_button_new != null ? window.globalShowroom.el_b_special_quote_button_new : false;
                case "el_b_product_tree_quote":
                    return window.globalShowroom.el_b_product_tree_quote != null ? window.globalShowroom.el_b_product_tree_quote : false;
                case "el_b_stock_order_button":
                    return window.globalShowroom.el_b_stock_order_button != null ? window.globalShowroom.el_b_stock_order_button : false;
                case "el_b_prod_tree_order_button":
                    return window.globalShowroom.el_b_prod_tree_order_button != null ? window.globalShowroom.el_b_prod_tree_order_button : false;
                    return false;
            }
        }
        else
            return false;
    }

    opportunity.Ribbon.EnableRules.showWhatsappButton = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (!commons.IsMobile()) {
                return false;
            }
            if (commons.GetFormType() == Enum.FormType.Create) {
                return false;
            }
            if (commons.GetAttribute("statecode") && commons.GetFieldValue("statecode") != OPPORTUNITYSTATE_OPEN) {
                return false;
            }
            if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                await opportunity.initGlobalVar(commons);
            var enable = window.globalShowroom != null && window.globalShowroom.el_b_whatsapp != null ? window.globalShowroom.el_b_whatsapp : false;
            return enable;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showWhatsappButton");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.enableTradeInRibbon = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetAttribute("statecode") && !commons.IsMobile()) {
                var formState = commons.GetFormType();
                var stateCode = commons.GetFieldValue("statecode");
                return formState != Enum.FormType.Create && stateCode == OPPORTUNITYSTATE_OPEN && commons.UserHasRoleOrIsAdmin(Const.SecurityRolesName.OPEN_TRADEIN_SYSTEM_ROLE);
            }
            return false;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.enableTradeInRibbon");
            return false;
        }
    };
    
    opportunity.Ribbon.EnableRules.ribbonShowButtonForYomanDeliveryNewVehicle = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                await opportunity.initGlobalVar(commons);
            var enable = window.globalShowroom != null && window.globalShowroom.el_b_delivery_new_vehicle != null ? window.globalShowroom.el_b_delivery_new_vehicle : false;
            return enable;
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonShowButtonForYomanDeliveryNewVehicle");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.doNotShowOldCloseButton = function () {
        try {
            return false;
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.doNotShowOldCloseButton");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.ribbonShowButtonForYomanCounselingMeeting = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                await opportunity.initGlobalVar(commons);
            var enable = window.globalShowroom != null && window.globalShowroom.el_b_sales_docs != null ? window.globalShowroom.el_b_sales_docs : false;
            return enable;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonShowButtonForYomanCounselingMeeting");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.ribbonShowButtonForYomanDeliveryFromShowroom = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                await opportunity.initGlobalVar(commons);
            var enable = window.globalShowroom != null && window.globalShowroom.el_b_delivery_from_showroom != null ? window.globalShowroom.el_b_delivery_from_showroom : false;
            return enable;
            return false;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonShowButtonForYomanDeliveryFromShowroom");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.ribbonShowButtonForYomanDeliveryReturnCustomerHomeAndEscortTripFollowingDelivery = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                await opportunity.initGlobalVar(commons);
            var enable = window.globalShowroom != null && window.globalShowroom.el_b_delivery_return_to_customer_home != null ? window.globalShowroom.el_b_delivery_return_to_customer_home : false;
            return enable;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonShowButtonForYomanDeliveryReturnCustomerHomeAndEscortTripFollowingDelivery");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.ribbonShowButtonForYomanDemoRide = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                await opportunity.initGlobalVar(commons);
            var enable = window.globalShowroom != null && window.globalShowroom.el_b_demo_ride != null ? window.globalShowroom.el_b_demo_ride : false;
            return enable;
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonShowButtonForYomanDemoRide");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.ribbonShowButtonForYomanDemoRideAtAccountHouse = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                await opportunity.initGlobalVar(commons);
            var enable = window.globalShowroom != null && window.globalShowroom.el_b_demo_ride_account_house != null ? window.globalShowroom.el_b_demo_ride_account_house : false;
            return enable;
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonShowButtonForYomanDemoRideAtAccountHouse");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.ribbonShowButtonForYomanDemoRideWithoutAgent = async function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetLookupFieldValue("el_id_showroom") != null && window.globalShowroom == null)
                await opportunity.initGlobalVar(commons);
            var enable = window.globalShowroom != null && window.globalShowroom.el_b_demo_ride_without_agent != null ? window.globalShowroom.el_b_demo_ride_without_agent : false;
            return enable;

        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.ribbonShowButtonForYomanDemoRideWithoutAgent");
            return false;
        }
    };
    opportunity.Ribbon.EnableRules.showOrderButton = function (primaryControl) {
        try {
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);
            if (commons.GetAttribute("statuscode") &&
                (commons.GetFieldValue("statuscode") == OPPORTUNITY_STATUS_HIZDAMNUT_ROSHONIT ||
                    commons.GetFieldValue("statuscode") == OPPORTUNITY_STATUS_HIZDAMNUT)) {

                return true;
            } else {
                return false;
            }
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showOrderButton");
            return false;
        }
    };
   
    opportunity.Ribbon.EnableRules.showButtonYipuiKochRibbon = function (primaryControl) {
        try {
            debugger;
            var commons = new elad_commons();
            commons.SetFormContext(primaryControl);
            if (commons.GetAttribute("statuscode") &&
                commons.GetFieldValue("statuscode") == OPPORTUNITY_STATUS_ORDER ||
                commons.GetFieldValue("statuscode") == OPPORTUNITY_STATUS_PAYMENT &&
                commons.GetAttribute("el_b_other_car_owners") &&
                commons.GetFieldValue("el_b_other_car_owners") == true) {

                return true;
            } else {
                return false;
            }
        } catch (error) {
            commons.PageErrorHandler(error, "opportunity.showButtonYipuiKochRibbon");
            return false;
        }
    };
    
    opportunity.Ribbon.EnableRules.tried2reachYou0KmVehicleEnableRule = async function (primaryControl) {
        try {
           
            var commons = new elad_commons(primaryControl);
            commons.SetFormContext(primaryControl);

            if (commons.GetFormType() == Enum.FormType.Create) {
                return false;
            }

            var opportunityId = commons
                .StripGuid(commons.GetCurrentEntityId())
                .toLowerCase();

            var result = await commons.RetrieveMultipleRecords(
                "el_car_purchase",
                "?$select=el_b_first_hand" +
                "&$filter=_el_id_opportunity_value eq " + opportunityId +
                "&$orderby=createdon desc&$top=1"
            );

            var el_b_first_hand =
                result &&
                result.length >= 1 &&
                result[0].el_b_first_hand == true;

            var hasRole =  await commons.UserHasRoleOrIsAdmin(
                Const.SecurityRolesName.OPEN_TRADEIN_SYSTEM_ROLE)
            return hasRole && el_b_first_hand;
        } 
            catch (error) {
            commons.PageErrorHandler(
                error,
                "opportunity.tried2reachYou0KmVehicleEnableRule"
            );

            return false;
        }
    };

})((window.opportunity = window.opportunity || {}))
