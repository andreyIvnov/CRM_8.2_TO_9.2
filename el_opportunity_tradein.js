(function (el_opportunity_tradein) {
    var commons;
    var ACCOUNT_TYPECODE = 1;
    var SHOWROOM_TYPECODE = 10039;
    var EL_DOC_TYPECODE = 10028;
    var EL_MANUFACTURER_TYPECODE = 10034;
    var TRADEIN_OPPORTUNITY_STATUS_LOST = 102910000;
    var FORMSTATE_CREATE = 1;
    var TRADEIN_OPP_STATUS_OPPORTUNITY = 1;
    var TRADEIN_OPP_STATUS_FUTURE_CAR = 102910002;
    var TRADEIN_OPP_STATE_ACTIVE = 0;
    var BENEFIT_URL = "BENEFIT_URL";
    var CAR_STATUS_URL = "CAR_STATUS_URL";
    var PROD_TREE_ORDER_URL = "PROD_TREE_ORDER_URL";
    var STOCK_ORDER_URL = "STOCK_ORDER_URL";
    var SPECIAL_QUOTE_URL = "SPECIAL_QUOTE_URL";
    var UPDATE_ORDER_URL = "UPDATE_ORDER_URL";
    var TRADEIN_SYSTEM_URL = "TRADEIN_SYSTEM_URL";
    var TRADEIN_SYSTEM_URL_ASSIGN = "TRADEIN_SYSTEM_URL_ASSIGN";
    var TRADEIN_SYSTEM_URL_MAAGAR = "TRADEIN_SYSTEM_URL_MAAGAR";
    var UPDATE_TRADEIN_DEAL_URL = "UPDATE_TRADEIN_DEAL_URL";
    var INVOICE_TRADEIN_DEAL_URL = "INVOICE_TRADEIN_DEAL_URL";
    var CANCEL_TRADEIN_DEAL_URL = "CANCEL_TRADEIN_DEAL_URL";
    var CANCEL_TRADEIN_ADVANCE_URL = "CANCEL_TRADEIN_ADVANCE_URL";
    var RECEIPT_TRADEIN_DEAL_URL = "RECEIPT_TRADEIN_DEAL_URL";
    var RESTORE_INVOICE_TRADEIN_DEAL_URL = "RESTORE_INVOICE_TRADEIN_DEAL_URL";
    var TRADEIN_QUOT = "TRADEIN_QUOT";
    var OPEN_TRADEIN_SYSTEM_ROLE = "דלק מוטורס - נציג טרייד אין ב.מ.וו";
    var DOCTYPE_SELL_USED_CAR = 11;
    var DOCTYPE_SELL_USED_CAR_0_KM_UNTIL_24_MONTHS = 26;
    var DOCTYPE_SELL_USED_CAR_0_KM_ABOVE_24_MONTHS = 28;
    var DOCTYPE_BUY_USED_CAR = 12;
    var DOCTYPE_BUY_NEW_CAR = 50;
    var DOCTYPE_BUY_NEW_CAR_OWNER = 51;
    var DOCTYPE_EURODRIVE_SELL_USED_CAR = 29;
    var DOCTYPE_EURODRIVE_BUY_USED_CAR = 30;
    var SHOWROOM_CODE_BMC_TLV = "8B";



    var CAR_CHECK_STATUS_INTERESTED = 1;
    var tradeinTypes = {
        NEW_USED: 1,
        SELL_ONLY: 2,
        USED_USED: 3,
        BUY_ONLY: 4,
        BUY_ONLY_SERVICE: 5
    };
    var TESTDRIVE_INTERESTED = 2;
    var TESTDRIVE_NOT_INTERESTED = 1;
    var TESTDRIVE_SCHEDULED = 3;
    var TESTDRIVE_PERFORMED = 4;
    var TESTDRIVE_CANCELLED = 6;
    var TESTDRIVE_OFFER_YES = 1;
    el_opportunity_tradein.OnLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());
            el_opportunity_tradein.setupBasicEvents();
            if (commons.GetFieldValue("el_id_showroom") == null) {
                commons.FillShowRoom();
            }

            el_opportunity_tradein.setNameFieldOnLoad();
            
            if (commons.GetFieldValue("statecode") == 0) {
                commons.SetVisible("el_l_closure_reason", false);
                commons.SetVisible("el_s_closure_notes", false);
            }
            
            el_opportunity_tradein.statusOnchange();
            
            el_opportunity_tradein.openAccountForm();
            
            if (commons.GetLookupFieldValue("el_id_tradein_deal_future")) {
                commons.SetSectionVisibility("PreferencesTab", "FutureCar", true);
            } else {
                commons.SetSectionVisibility("PreferencesTab", "FutureCar", false);
            }

            el_opportunity_tradein.showTradeinOffersTab();

            el_opportunity_tradein.showTestDriveTab();

            el_opportunity_tradein.saveTestDriveStatus();

            el_opportunity_tradein.setTestDriveFields();

            el_opportunity_tradein.saveTestDriveStatus();

            el_opportunity_tradein.showCarLicenseBoughtField();

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.OnLoad");
        }

    };

    el_opportunity_tradein.setupBasicEvents = function () {
        try {
            commons.GetAttribute("statuscode").addOnChange(
                el_opportunity_tradein.statusOnchange
            );

            commons.GetAttribute("el_l_purchase_type").addOnChange(
                el_opportunity_tradein.purchaseTypeOnChange
            );

            commons.GetAttribute("el_l_offer_testdrive").addOnChange(
                el_opportunity_tradein.setTestDriveFields
            );

            commons.GetAttribute("el_b_document_testdrive").addOnChange(
                el_opportunity_tradein.setTestDriveFieldsDoc
            );

            commons.GetAttribute("el_l_testdrive").addOnChange(
                el_opportunity_tradein.setTestDriveFields
            );

            commons.GetAttribute("el_id_showroom").addOnChange(
                el_opportunity_tradein.updatePhoneShowroom
            );


        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.setupBasicEvents");
        }
    };
    el_opportunity_tradein.getCityCode4Params = function (address, addressType) {
        try {
            if (address != null &&
                (address.el_id_city != null || address.el_id_pob_city != null) &&
                ((address.el_id_city && address.el_id_city.Id != null) ||
                    (address.el_id_pob_city && address.el_id_pob_city.Id != null))) {

                var cityId = null;

                if (addressType == "address" &&
                    address.el_id_city &&
                    address.el_id_city.Id) {

                    cityId = address.el_id_city.Id;
                }

                if (addressType == "pob" &&
                    address.el_id_pob_city &&
                    address.el_id_pob_city.Id) {

                    cityId = address.el_id_pob_city.Id;
                }

                if (cityId) {
                    return commons.RetrieveRecord(
                        "el_city",
                        commons.StripGuid(cityId),
                        "?$select=el_n_ministry_city_code"
                    ).then(function (city) {
                        return city &&
                            city.el_n_ministry_city_code != null
                            ? city.el_n_ministry_city_code
                            : "";
                    });
                }
            }

            return Promise.resolve("");

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.getCityCode4Params");
            return Promise.resolve("");
        }
    };
   
    el_opportunity_tradein.addOpenLegacyTradeinParameters = function (
        accountid,
        opportunityTradeinid,
        as400accountcode
    ) {
        try {
            return commons.getAccountData(
                accountid,
                null,
                null
            ).then(function (accountResult) {

                var account = accountResult &&
                    accountResult.results != null &&
                    accountResult.results.length > 0
                    ? accountResult.results[0]
                    : null;

                var parameters = "";

                if (account != null) {
                    parameters += "msLakoah=" + as400accountcode.trim() + "&";
                    parameters += "shemLakoah=" + notNullParam(account.Name).trim() + "&";
                    parameters += "tzHp=" + notNullParam(account.el_s_idnumber_text).trim() + "&";
                    parameters += "nayad=" + notNullParam(account.Telephone1).trim() + "&";
                    parameters += "telephone1=" + notNullParam(account.Telephone2).trim() + "&";
                    parameters += "fax=" + notNullParam(account.Fax).trim() + "&";
                    parameters += "mail=" + notNullParam(account.EMailAddress1).trim() + "&";
                    parameters += "misparIzdamnut=" +
                        notNullParam(
                            commons.StripGuid(opportunityTradeinid)
                        ) +
                        "&";

                    if (account.el_el_address_account != null) {
                        var city = account.el_el_address_account.el_id_city != null &&
                            account.el_el_address_account.el_id_city.Name != "אחר"
                            ? notNullLookupParam(account.el_el_address_account.el_id_city)
                            : notNullParam(account.el_el_address_account.el_s_city_text) == ""
                                ? ""
                                : notNullParam(account.el_el_address_account.el_s_city_text);

                        var street = account.el_el_address_account.el_id_street_synonym.Name &&
                            account.el_el_address_account.el_id_street_synonym.Name != "אחר"
                            ? notNullLookupParam(account.el_el_address_account.el_id_street_synonym)
                            : notNullParam(account.el_el_address_account.el_s_street_text) == ""
                                ? ""
                                : notNullParam(account.el_el_address_account.el_s_street_text);

                        parameters += "cpd.mispar=" +
                            notNullParam(account.el_el_address_account.el_n_house_number) +
                            "&";

                        parameters += "ir=" + city + "&";

                        parameters += "ktovet=" +
                            street +
                            " " +
                            notNullParam(account.el_el_address_account.el_n_house_number) +
                            "&";

                        parameters += "mikud=" +
                            notNullParam(account.el_el_address_account.el_n_zip);
                    } else {
                        parameters += "ir=&ktovet=&mikud=";
                    }
                } else {
                    parameters += "shemLakoah=&tzHp=&nayad=&telephone1=&fax=&mail=&ir=&ktovet=&mikud=";
                }

                return parameters;
            });

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_opportunity_tradein.addOpenLegacyTradeinParameters"
            );

            return Promise.resolve("");
        }
    };
    el_opportunity_tradein.addOpenLegacyTradeinParameters = function (accountid, opportunityTradeinid, as400accountcode) {
        try {
            return commons.getAccountData(accountid, null, null).then(function (accountResult) {

                var account = accountResult && accountResult.results != null && accountResult.results.length > 0 ? accountResult.results[0] : null;
                var parameters = "";

                if (account != null) {
                    parameters += "msLakoah=" + as400accountcode.trim() + "&";
                    parameters += "shemLakoah=" + notNullParam(account.Name).trim() + "&";
                    parameters += "tzHp=" + notNullParam(account.el_s_idnumber_text).trim() + "&";
                    parameters += "nayad=" + notNullParam(account.Telephone1).trim() + "&";
                    parameters += "telephone1=" + notNullParam(account.Telephone2).trim() + "&";
                    parameters += "fax=" + notNullParam(account.Fax).trim() + "&";
                    parameters += "mail=" + notNullParam(account.EMailAddress1).trim() + "&";
                    parameters += "misparIzdamnut=" + notNullParam(commons.StripGuid(opportunityTradeinid)) + "&";

                    if (account.el_el_address_account != null) {
                        var city = account.el_el_address_account.el_id_city != null && account.el_el_address_account.el_id_city.Name != "אחר" ? notNullLookupParam(account.el_el_address_account.el_id_city) : notNullParam(account.el_el_address_account.el_s_city_text) == "" ? "" : notNullParam(account.el_el_address_account.el_s_city_text);

                        var street = account.el_el_address_account.el_id_street_synonym.Name && account.el_el_address_account.el_id_street_synonym.Name != "אחר" ? notNullLookupParam(account.el_el_address_account.el_id_street_synonym) : notNullParam(account.el_el_address_account.el_s_street_text) == "" ? "" : notNullParam(account.el_el_address_account.el_s_street_text);

                        parameters += "cpd.mispar=" + notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                        parameters += "ir=" + city + "&";
                        parameters += "ktovet=" + street + " " + notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                        parameters += "mikud=" + notNullParam(account.el_el_address_account.el_n_zip);
                    }
                    else {
                        parameters += "ir=&ktovet=&mikud=";
                    }
                }
                else {
                    parameters += "shemLakoah=&tzHp=&nayad=&telephone1=&fax=&mail=&ir=&ktovet=&mikud=";
                }

                return parameters;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.addOpenLegacyTradeinParameters");
            return Promise.resolve("");
        }
    };
    el_opportunity_tradein.showCarLicenseBoughtField = function () {
        try {
            if (commons.GetFieldValue("el_l_purchase_type") == tradeinTypes.USED_USED || commons.GetFieldValue("el_l_purchase_type") == tradeinTypes.SELL_ONLY) {
                commons.SetVisible("el_s_car_license_dm_buys", true);
            }
            else {
                if (commons.GetFieldValue("el_s_car_license_dm_buys")) {
                    commons.SetFieldValue("el_s_car_license_dm_buys", null);
                }

                commons.SetVisible("el_s_car_license_dm_buys", false);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.showCarLicenseBoughtField");
        }
    };
    el_opportunity_tradein.saveTestDriveStatus = function () {
        try {
            if (commons.GetFieldValue("el_l_testdrive")) {
                commons.SetFieldValue("el_n_testdrive_status", commons.GetFieldValue("el_l_testdrive"));
            }
            else {
                commons.SetFieldValue("el_n_testdrive_status", 0);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.saveTestDriveStatus");
        }
    };
    el_opportunity_tradein.setTestDriveFieldsDoc = function () {
        try {
            var today = new Date();

            if (commons.GetFieldValue("el_b_document_testdrive") == true) {
                commons.SetSectionVisibility("testDriveTab", "testdriveDoc", true);
                commons.SetSectionVisibility("testDriveTab", "testdrive", false);
                commons.SetRequiredLevel("el_dt_testdrive_doc_date", "required");
                commons.SetRequiredLevel("el_l_testdrive_doc_type", "required");
                commons.SetFieldValue("el_dt_testdrive_doc_date", new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0));
                commons.SetFieldValue("el_l_testdrive_doc_type", 1);
                commons.SetFieldValue("el_l_testdrive", TESTDRIVE_PERFORMED);
            }
            else {
                commons.SetRequiredLevel("el_dt_testdrive_doc_date", "none");
                commons.SetRequiredLevel("el_l_testdrive_doc_type", "none");
                commons.SetFieldValue("el_dt_testdrive_doc_date", null);
                commons.SetFieldValue("el_l_testdrive_doc_type", null);
                commons.SetSectionVisibility("testDriveTab", "testdriveDoc", false);
                commons.SetSectionVisibility("testDriveTab", "testdrive", true);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.setTestDriveFieldsDoc");
        }
    };
    el_opportunity_tradein.preventSavingWrongTestDriveStatus = function (Context) {
        try {
            if (commons.GetFieldValue("el_b_document_testdrive") != true && ((commons.GetFieldValue("el_n_testdrive_status") != TESTDRIVE_SCHEDULED && commons.GetFieldValue("el_l_testdrive") == TESTDRIVE_SCHEDULED) || (commons.GetFieldValue("el_n_testdrive_status") != TESTDRIVE_PERFORMED && commons.GetFieldValue("el_l_testdrive") == TESTDRIVE_PERFORMED) || (commons.GetFieldValue("el_n_testdrive_status") != TESTDRIVE_CANCELLED && commons.GetFieldValue("el_l_testdrive") == TESTDRIVE_CANCELLED))) {
                commons.OpenAlertDialog("לא ניתן לבחור בסטטוס זה בשדה נסיעת הדגמה");
                Context.getEventArgs().preventDefault();
                commons.GetControl("el_l_testdrive").setFocus();
                commons.GetControl("el_l_testdrive").setNotification("לא ניתן לבחור בסטטוס זה בשדה נסיעת הדגמה");
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.preventSavingWrongTestDriveStatus");
        }
    };
    el_opportunity_tradein.purchaseTypeOnChange = function () {
        try {
            el_opportunity_tradein.showTradeinOffersTab();
            el_opportunity_tradein.showTestDriveTab();
            el_opportunity_tradein.showCarLicenseBoughtField();

            if (commons.GetFieldValue("el_l_purchase_type") && commons.GetFieldValue("el_l_purchase_type") == tradeinTypes.NEW_USED && commons.GetFieldValue("el_l_car_check_status") && commons.GetFieldValue("el_l_car_check_status") != CAR_CHECK_STATUS_INTERESTED) {
                commons.SetFieldValue("el_l_car_check_status", CAR_CHECK_STATUS_INTERESTED);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.purchaseTypeOnChange");
        }
    };
    el_opportunity_tradein.showTestDriveTab = function () {
        try {
            if (commons.GetFieldValue("el_l_purchase_type") && (commons.GetFieldValue("el_l_purchase_type") == tradeinTypes.USED_USED || commons.GetFieldValue("el_l_purchase_type") == tradeinTypes.SELL_ONLY)) {
                commons.SetTabVisibility("testDriveTab", true);
            }
            else {
                commons.SetTabVisibility("testDriveTab", false);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.showTestDriveTab");
        }
    };
    el_opportunity_tradein.showTradeinOffersTab = function () {
        try {
            if (commons.GetFieldValue("el_l_purchase_type") && (commons.GetFieldValue("el_l_purchase_type") == tradeinTypes.USED_USED || commons.GetFieldValue("el_l_purchase_type") == tradeinTypes.BUY_ONLY_SERVICE)) {
                commons.GetTab("tradeinOffers").setVisible(true);
            }
            else {
                commons.GetTab("tradeinOffers").setVisible(false);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.showTradeinOffersTab");
        }
    };
    el_opportunity_tradein.statusOnchange = function () {
        try {
            var statuscode = commons.GetFieldValue("statuscode");

            if (statuscode == TRADEIN_OPP_STATUS_FUTURE_CAR) {
                commons.GetTab("PreferencesTab").setVisible(true);
            }
            else {
                if (commons.GetFormType() == FORMSTATE_CREATE) {
                    el_opportunity_tradein.deleteAllAttributesValuesInTab("PreferencesTab");
                }

                commons.GetTab("PreferencesTab").setVisible(false);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.statusOnchange");
        }
    };
    el_opportunity_tradein.setNameFieldOnLoad = function () {
        try {
            if (!commons.GetFieldValue("el_name") && commons.GetLookupFieldValue("el_id_account")) {
                commons.SetFieldValue("el_name", "תהליך טרייד אין עבור " + commons.GetLookupFieldValue("el_id_account").name);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.setNameFieldOnLoad");
        }
    };
    el_opportunity_tradein.accountHasNoIdNumber = async function () {
        try {
            var account = commons.GetLookupFieldValue("el_id_account");

            if (account && account.id) {
                var accountRecord = await commons.RetrieveRecord("account", commons.StripGuid(account.id), "?$select=el_s_idnumber_text");
                if (accountRecord != null) {
                    return accountRecord.el_s_idnumber_text == null || accountRecord.el_s_idnumber_text == "";
                }
            }
            return undefined;
        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.accountHasNoIdNumber");
            return undefined;
        }
    };
    el_opportunity_tradein.accountRefuseToIdentify = async function () {
        try {
            var account = commons.GetLookupFieldValue("el_id_account");

            if (account && account.id) {
                var accountRecord = await commons.RetrieveRecord("account", commons.StripGuid(account.id), "?$select=el_b_refusetoidentify");
                if (accountRecord != null) {
                    return accountRecord.el_b_refusetoidentify;
                }
            }

            return undefined;

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.accountRefuseToIdentify");
            return undefined;
        }
    };
    el_opportunity_tradein.getTradeinDeal = function (agreementType) {
        try {
            var tradeinOpportunityId = commons.StripGuid(commons.GetRecordId());
            var query = "";

            switch (agreementType) {
                case DOCTYPE_SELL_USED_CAR:
                    query = "?$select=el_name,el_tradein_dealid&$orderby=createdon desc&$filter=_el_id_opportunity_tradein_value eq " + tradeinOpportunityId;
                    break;

                case DOCTYPE_BUY_USED_CAR:
                    query = "?$select=el_name,el_tradein_dealid&$orderby=createdon desc&$filter=_el_id_opportunity_tradein_sell_value eq " + tradeinOpportunityId;
                    break;
            }

            return commons.RetrieveMultipleRecords("el_tradein_deal", query).then(function (tradeinDeals) {
                var tradeinDealId = "";
                var tradeinDealName = "";

                if (tradeinDeals && tradeinDeals.length >= 1) {
                    if (tradeinDeals[0].el_tradein_dealid && tradeinDeals[0].el_name) {
                        tradeinDealId = tradeinDeals[0].el_tradein_dealid;
                        tradeinDealName = tradeinDeals[0].el_name;
                    }
                }

                if (tradeinDealId && tradeinDealName) {
                    return commons.GetLookupField(tradeinDealId, tradeinDealName, "el_tradein_deal");
                }

                return null;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.getTradeinDeal");
            return Promise.resolve(null);
        }
    };
    el_opportunity_tradein.tradeinCarAssigned = async function () {
        try {
            var result = await commons.RetrieveMultipleRecords("el_tradein_deal", "?$select=_el_id_opportunity_tradein_value&$filter=_el_id_opportunity_tradein_value eq " + commons.StripGuid(commons.GetCurrentEntityId()));

            if (result && result.length >= 1) {
                return true;
            }

            return false;

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.tradeinCarAssigned");
            return false;
        }
    };
    el_opportunity_tradein.tradeinSellDealExists = function () {
        return new Promise((resolve, reject) => {
            try {
                commons.RetrieveMultipleRecords("el_tradein_deal", "?$select=_el_id_opportunity_tradein_sell_value&$filter=_el_id_opportunity_tradein_sell_value eq " + commons.StripGuid(commons.GetCurrentEntityId()))
                    .then(
                        function (results) {
                            if (results && results.length >= 1) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        },
                        err => {
                            commons.SetFormNotification("Error retrieving trade-in sell deal into el_opportunity_tradein.tradeinSellDealExists : " + err.message, "ERROR", "el_opportunity_tradein.tradeinSellDealExists");
                            resolve(false);
                        }
                    );

            } catch (error) {
                commons.PageErrorHandler(error, "el_opportunity_tradein.tradeinSellDealExists");
                resolve(false);
            }
        })
    };
    // TODO CRM Online: verify behavior \\ replace to button from ribbon
    //function dynamicMenuAgreement(CommandProperties) {
    //    debugger
    //    if (Xrm.Page.getAttribute("statuscode").getValue() != TRADEIN_OPP_STATUS_OPPORTUNITY && Xrm.Page.getAttribute("statuscode").getValue() != TRADEIN_OPP_STATUS_FUTURE_CAR) {
    //        var menuXml = "<Menu Id=\"OpenAgreement.DynamicMenu\">" +
    //            "<MenuSection Id=\"OpenAgreement.Dynamic.MenuSection\" Sequence=\"10\">" +
    //            "<Controls Id=\"OpenAgreement.Dynamic.Controls\">";

    //        menuXml += "<Button Id=\"OpenAgreement.Dynamic.Button1\" Command=\"el.opportunity_tradein.dynamic.SearchCommand\" Sequence=\"20\" LabelText=\"מכירת רכב משומש\" Alt=\"הסכם מכירה\" Image16by16=\"/_imgs/SFA/ActivateQuote_16.png\" />";
    //        menuXml += "<Button Id=\"OpenAgreement.Dynamic.Button2\" Command=\"el.opportunity_tradein.dynamic.SearchCommand\" Sequence=\"60\" LabelText=\"מכירת 0 קמ - הדגמה/חברה עד 24 חודשים \" Alt=\"מכירת 0 קמ - הדגמה/חברה עד 24 חודשים\" ToolTipTitle=\"מכירת 0 קמ - הדגמה/חברה עד 24 חודשים\" Image16by16=\"/_imgs/SFA/ActivateQuote_16.png\" />";
    //        menuXml += "<Button Id=\"OpenAgreement.Dynamic.Button6\" Command=\"el.opportunity_tradein.dynamic.SearchCommand\" Sequence=\"40\" LabelText=\"מכירת 0 קמ - הדגמה/חברה מעל 24 חודשים\" Alt=\"מכירת 0 קמ - הדגמה/חברה מעל 24 חודשים\" ToolTipTitle=\"מכירת 0 קמ - הדגמה/חברה מעל 24 חודשים\" Image16by16=\"/_imgs/SFA/ActivateQuote_16.png\" />";
    //        menuXml += "<Button Id=\"OpenAgreement.Dynamic.Button3\" Command=\"el.opportunity_tradein.dynamic.SearchCommand\" Sequence=\"40\" LabelText=\"קניית רכב משומש\" Alt=\"הסכם קניה\" Image16by16=\"/_imgs/SFA/ReviseQuote_16.png\" />";
    //        menuXml += "<Button Id=\"OpenAgreement.Dynamic.Button4\" Command=\"el.opportunity_tradein.dynamic.SearchCommand\" Sequence=\"50\" LabelText=\"מכירת 0 קמ - חדש\" Alt=\"הסכם מכירה - רכב חדש\" Image16by16=\"/_imgs/SFA/ActivateQuote_16.png\" />";
    //        menuXml += "<Button Id=\"OpenAgreement.Dynamic.Button5\" Command=\"el.opportunity_tradein.dynamic.SearchCommand\" Sequence=\"60\" LabelText=\"מכירת 0 קמ - פרטי\" Alt=\"הסכם מכירה רכב 0 קמ - בבעלות פרטית\" Image16by16=\"/_imgs/SFA/ActivateQuote_16.png\" />";

    //        menuXml += "</Controls>" +
    //            "</MenuSection>" +
    //            "</Menu>";

    //        CommandProperties.PopulationXML = menuXml;


    //    }
    //}



    //el_opportunity_tradein.searchOpenAgreement = function (primaryControl, CommandProperties) {
    //    try {
    //        var commons = new elad_commons();

    //        commons.SetFormContext(primaryControl);

    //        var controlId = CommandProperties.SourceControlId;

    //        switch (controlId) {
    //            case "OpenAgreement.Dynamic.Button1":
    //                el_opportunity_tradein.openTradeinAgreement(DOCTYPE_SELL_USED_CAR);
    //                break;

    //            case "OpenAgreement.Dynamic.Button2":
    //                el_opportunity_tradein.openTradeinAgreement(DOCTYPE_SELL_USED_CAR_0_KM_UNTIL_24_MONTHS);
    //                break;

    //            case "OpenAgreement.Dynamic.Button3":
    //                el_opportunity_tradein.openTradeinAgreement(DOCTYPE_BUY_USED_CAR);
    //                break;

    //            case "OpenAgreement.Dynamic.Button4":
    //                el_opportunity_tradein.openTradeinAgreement(DOCTYPE_BUY_NEW_CAR);
    //                break;

    //            case "OpenAgreement.Dynamic.Button5":
    //                el_opportunity_tradein.openTradeinAgreement(DOCTYPE_BUY_NEW_CAR_OWNER);
    //                break;

    //            case "OpenAgreement.Dynamic.Button6":
    //                el_opportunity_tradein.openTradeinAgreement(DOCTYPE_SELL_USED_CAR_0_KM_ABOVE_24_MONTHS);
    //                break;

    //            default:
    //                commons.OpenAlertDialog("Button Unknown");
    //                break;
    //        }

    //    } catch (error) {
    //        commons.PageErrorHandler(error, "el_opportunity_tradein.searchOpenAgreement");
    //    }
    //};


    el_opportunity_tradein.openTradeinAgreement = function (agreementType) {
        try {
            var name = commons.GetFieldValue("el_name") ? commons.GetFieldValue("el_name") : commons.GetEntityName();
            var account = commons.GetLookupFieldValue("el_id_account");
            var extRaqs = "";
            var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes";

            extRaqs += "pId=" + commons.GetRecordId();
            extRaqs += "&pName=" + name;
            extRaqs += "&pType=" + commons.GetEntityTypeCode();
            extRaqs += "&el_l_doc_type=" + agreementType;
            extRaqs += "&el_b_generate_document=true";

            if (account != null) {
                extRaqs += "&el_id_account=" + account.id;
                extRaqs += "&el_id_accountname=" + account.name;
            }

            commons.openUrl(commons.PrependOrgName("/main.aspx?etc=" + EL_DOC_TYPECODE + "&pagetype=entityrecord&extraqs=" + encodeURIComponent(extRaqs)), "_blank", features, false);

        } catch (error) {
            commons.PageErrorHandler(error, "commons.openTradeinAgreement");
        }
    };
    el_opportunity_tradein.openAccountForm = function () {
        try {
            if (commons.GetLookupFieldValue("el_id_account")) {
                el_opportunity_tradein.accountFormIncomplete()
                    .then(
                        accountFormIsIncommplete => {
                            if (accountFormIsIncommplete === true){
                                var parameters = commons.GetClientUrl() + "/main.aspx?";
                
                                parameters += "etc=" + ACCOUNT_TYPECODE;
                                parameters += "&extraqs=";
                                parameters += "&id=" + commons.GetLookupFieldValue("el_id_account").id;
                                parameters += "&newWindow=true&pagetype=entityrecord";
                
                                commons.openUrl(parameters, "", "status=0,resizable=1,top=100,left=100,width=1000px,height=600px");
                            }
                        },
                        err => commons.SetFormNotification("Error retrieving account data into el_opportunity_tradein.openAccountForm : " + err.message, "ERROR", "el_opportunity_tradein.openAccountForm")
                    )
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.openAccountForm");
        }
    };
    el_opportunity_tradein.accountFormIncomplete = async function () {
        try {
            var originatingTradeInleadid = commons.GetLookupFieldValue("el_id_tradein_lead");
            var accountLookup = commons.GetLookupFieldValue("el_id_account");

            if (accountLookup && accountLookup.id) {
                //TODO: Add address reference (el_id_address isn't exist into Account)
                // var select = "?$select=el_b_refuse_email,el_b_refusetoidentify,_el_id_address_value,_el_id_type_code_value,el_s_first_name,el_s_idnumber_text,el_s_last_name,emailaddress1,telephone1,telephone2";
                var select = "?$select=el_b_refuse_email,el_b_refusetoidentify,_el_id_type_code_value,el_s_first_name,el_s_idnumber_text,el_s_last_name,emailaddress1,telephone1,telephone2";
                var account = await commons.RetrieveRecord("account", commons.StripGuid(accountLookup.id), select);

                if (account && originatingTradeInleadid) {
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

                    // if (account._el_id_address_value == null) {
                    //     return true;
                    // }

                    if (!account.el_b_refusetoidentify && (!account._el_id_type_code_value || !account.el_s_idnumber_text)) {
                        return true;
                    }
                }
            }

            return false;

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.accountFormIncomplete");
            return false;
        }
    };
    el_opportunity_tradein.updatePhoneShowroom = async function () {

        try {
            var showroomphone;
            var showroomId = commons.GetLookupId("el_id_showroom");
            var options =
                "?$select=" +
                "el_s_phone," +
                "el_s_phone_mazda," +
                "el_s_phone_ford," +
                "el_s_phone_nio," +
                "el_el_s_phone_dongfeng," +
                "el_s_phone_eurodrive";

            var showroom = await commons.RetrieveRecord("el_showroom", showroomId, options);
            showroom = showroom != null ? showroom : null;
            if (showroom != null) {
                if (showroom.el_s_phone != null)
                    showroomphone = showroom.el_s_phone;
                else if (showroom.el_s_phone_mazda)
                    showroomphone = showroom.el_s_phone_mazda;
                else if (showroom.el_s_phone_ford)
                    showroomphone = showroom.el_s_phone_ford;
                else if (showroom.el_s_phone_nio)
                    showroomphone = showroom.el_s_phone_nio;
                else if (showroom.el_el_s_phone_dongfeng)
                    showroomphone = showroom.el_el_s_phone_dongfeng;
                else
                    showroomphone = showroom.el_s_phone_eurodrive;

                commons.SetFieldValue("el_s_showroom_phonenumber", showroomphone);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.updatePhoneShowroom");
        }
    }

    el_opportunity_tradein.setTestDriveFields = function () {
        commons.ClearNotification("el_l_testdrive");
        
        el_opportunity_tradein.setTestDriveFieldsDoc();

        if (commons.GetFieldValue("el_l_offer_testdrive") == TESTDRIVE_OFFER_YES) {

            commons.SetSectionVisibility("testDriveTab", "testdrive", true);

            commons.SetRequiredLevel("el_l_testdrive", "required");
            commons.SetFieldValue("el_b_offer_testdrive", true);
            commons.SetVisible("el_b_document_testdrive", true);
        }
        else {
            commons.SetSectionVisibility("testDriveTab", "testdrive", false);
            commons.SetRequiredLevel("el_l_testdrive", "none");
            commons.SetFieldValue("el_b_offer_testdrive", false);
            commons.SetVisible("el_b_document_testdrive", false);
            commons.SetFieldValue("el_l_testdrive", null);
        }
    }



    el_opportunity_tradein.Ribbon = el_opportunity_tradein.Ribbon || {};

    el_opportunity_tradein.Ribbon.reopenTradeinProcess = function (primaryControl) {
        try {
            debugger;
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }

            commons.OpenProgressIndicator("פותח תהליך טרייד אין מחדש...");

            var entityId = commons.StripGuid(commons.GetCurrentEntityId());
            var entityName = commons.GetCurrentEntityName();

            var updateEntity = {
                statecode: TRADEIN_OPP_STATE_ACTIVE,
                statuscode: TRADEIN_OPP_STATUS_OPPORTUNITY
            };

            commons.updateRecord(entityName, entityId, updateEntity)
                .then(
                    function (result) {
                        commons.CloseProgressIndicator();
                    },
                    err => {
                        commons.CloseProgressIndicator();
                        commons.SetFormNotification("Error on Ribbon.reopenTradeinProcess => updateRecord: " + err.message, commons.FormNotificationLevel.ERROR, "Ribbon.reopenTradeinProcess");
                    }
                );


        } catch (error) {
            commons.CloseProgressIndicator();
            commons.PageErrorHandler(error, "el_opportunity_tradein.reopenTradeinProcess");
        }
    };

    el_opportunity_tradein.Ribbon.deactivateTradeinOpportunity = function (primaryControl) {
        try {
            debugger;
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }


            var stateCode = 1;
            var statuscode = TRADEIN_OPPORTUNITY_STATUS_LOST;

            commons.SetVisible("el_l_closure_reason", true);
            commons.SetVisible("el_s_closure_notes", true);

            if (!commons.GetFieldValue("el_s_closure_notes") || !commons.GetFieldValue("el_l_closure_reason")) {
                commons.OpenAlertDialog("נא למלא סיבת הפסד והערות סגירה לפני סגירת התהליך");

                if (!commons.GetFieldValue("el_l_closure_reason")) {
                    commons.SetFocus("el_l_closure_reason");
                }

                if (!commons.GetFieldValue("el_s_closure_notes")) {
                    commons.SetFocus("el_s_closure_notes");
                }
            }
            else {

                commons.OpenProgressIndicator("סגירת תהליך טרייד אין...");

                var updateEntity = {
                    statecode: 1,
                    statuscode: TRADEIN_OPPORTUNITY_STATUS_LOST
                };

                commons.updateRecord(commons.GetCurrentEntityName(), commons.StripGuid(commons.GetCurrentEntityId()), updateEntity)
                    .then(
                        function (result) {
                            commons.CloseProgressIndicator();
                        },
                        err => {
                            commons.CloseProgressIndicator();
                            commons.SetFormNotification("Error on Ribbon.deactivateTradeinOpportunity => updateRecord: " + err.message, commons.FormNotificationLevel.ERROR, "Ribbon.deactivateTradeinOpportunity");
                        }
                    );

            }

        } catch (error) {
            commons.CloseProgressIndicator();
            commons.PageErrorHandler(error, "el_opportunity_tradein.deactivateTradeinOpportunity");
        }
    };
    
    el_opportunity_tradein.Ribbon.addNewTradeinDeal = async function (primaryControl) {
        try {
            debugger;
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }

            let isTradeinSellDealExists = await el_opportunity_tradein.tradeinSellDealExists();
            if (isTradeinSellDealExists) {
                commons.OpenAlertDialog("לא ניתן לפתוח יותר מעסקת מכירה אחת בתהליך טרייד אין");
                return;
            }

            var as400accountcode = "";
            var accountId = commons.GetLookupId("el_id_account");

            if (accountId) {
                var carPurchasesResults = await commons.RetrieveMultipleRecords("el_car_purchase", "?$select=el_s_as400lakcod&$orderby=createdon desc&$filter=el_l_purchase_type eq 1 and (el_l_order_status ne 3 and el_l_order_status ne 4) and _el_id_account_value eq " + commons.StripGuid(accountId));

                if (carPurchasesResults && carPurchasesResults.length >= 1) {
                    as400accountcode = carPurchasesResults[0].el_s_as400lakcod;
                }
            }

            if (!as400accountcode) {
                var tradeinDealsResults = await commons.RetrieveMultipleRecords("el_tradein_deal", "?$select=el_s_as400lakcod_buyer&$filter=_el_id_opportunity_tradein_value eq " + commons.StripGuid(commons.GetCurrentEntityId()));

                if (tradeinDealsResults && tradeinDealsResults.length >= 1) {
                    as400accountcode = tradeinDealsResults[0].el_s_as400lakcod_buyer;
                }
            }

            commons.showOpenLegacyRibbon(TRADEIN_SYSTEM_URL_MAAGAR, "el_id_account", null, as400accountcode);

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.addNewTradeinDeal");
        }
    };

    el_opportunity_tradein.Ribbon.addTradeinQuot = function (primaryControl) {
        try {
            debugger;
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }

            commons.showOpenLegacyRibbon(TRADEIN_QUOT, "el_id_account", null, null);

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.addTradeinQuot");
        }
    };

    el_opportunity_tradein.Ribbon.assignCar = function (primaryControl) {
        try {
            debugger;
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }

            return el_opportunity_tradein.tradeinCarAssigned().then(function (carAssigned) {

                if (carAssigned) {
                    commons.OpenAlertDialog("לא ניתן לשבץ יותר מרכב אחד בתהליך טרייד אין");
                    return;
                }

                var stars = "\n*******************************************************";
                var blanks = "\n                                                      ";

                return el_opportunity_tradein.accountRefuseToIdentify()
                    .then(
                        function (refuseToIdentify) {

                            if (refuseToIdentify) {
                                var txt1 = "\nלא ניתן לשבץ  רכב  ללקוח   שמסרב   להזדהות\n";
                                var txt2 = "\nנא לעדכן מס' ת.ז ללקוח\n";

                                commons.OpenAlertDialog(unescape("%u200F%u200F") + stars + stars + blanks + txt1 + txt2 + stars + stars + unescape("%u200F"));

                                return;
                            }

                            return el_opportunity_tradein.accountHasNoIdNumber()
                                .then(
                                    function (hasNoIdNumber) {

                                        if (!refuseToIdentify && hasNoIdNumber) {
                                            var txt3 = "\nלא ניתן  לשבץ  רכב   ללקוח   ללא מס' ת.ז   \n";
                                            var txt4 = "\nנא לעדכן מס' ת.ז ללקוח\n";

                                            commons.OpenAlertDialog(unescape("%u200F%u200F") + stars + stars + blanks + txt3 + txt4 + stars + stars + unescape("%u200F"));

                                            return;
                                        }

                                        var as400accountcode = "";

                                        commons.showOpenLegacyRibbon(TRADEIN_SYSTEM_URL_ASSIGN, "el_id_account", null, as400accountcode);
                                    });
                });
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_opportunity_tradein.assignCar");
        }
    };

    el_opportunity_tradein.Ribbon.sendSmsTried2ReachYouRibbon = function (primaryControl) {
        try {
            debugger;
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }
            
            commons.OpenProgressIndicator("שליחת הודע מסוג 'ניסינו להשיגך,'...");

            commons.ExecuteWorkflow( Const.Workflow.el_opportunity_tradein["שלח הודעת SMS - ניסינו להשיגך - תהליך טרייד אין"], commons.GetCurrentEntityId())
                .then(
                    function (result) {
                        commons.CloseProgressIndicator();
                        commons.OpenAlertDialog("נשלחה הודעה ללקוח");
                    },
                    function (error) {
                        commons.CloseProgressIndicator();
                        commons.PageErrorHandler(error, "el_opportunity_tradein.sendSmsTried2ReachYouRibbon.ExecuteWorkflow");
                    }
                );

        } catch (error) {
            commons.CloseProgressIndicator();
            commons.PageErrorHandler(error, "el_opportunity_tradein.sendSmsTried2ReachYouRibbon");
        }
    };

    el_opportunity_tradein.Ribbon.searchOpenAgreement = function (CommandProperties, primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        var actions = {
            'el_opportunity_tradein|NoRelationship|Form|el_opportunity_tradein.ButtonSellUsedCar': DOCTYPE_SELL_USED_CAR,
            'el_opportunity_tradein|NoRelationship|Form|el_opportunity_tradein.ButtonSell0Km24': DOCTYPE_SELL_USED_CAR_0_KM_UNTIL_24_MONTHS,
            'el_opportunity_tradein|NoRelationship|Form|el_opportunity_tradein.ButtonBuyUsed': DOCTYPE_BUY_USED_CAR,
            'el_opportunity_tradein|NoRelationship|Form|el_opportunity_tradein.ButtonBuyNew0km': DOCTYPE_BUY_NEW_CAR,
            'el_opportunity_tradein|NoRelationship|Form|el_opportunity_tradein.ButtonBuyNew0kmPrivate': DOCTYPE_BUY_NEW_CAR_OWNER,
            'el_opportunity_tradein|NoRelationship|Form|el_opportunity_tradein.ButtonSell0KmAbove24': DOCTYPE_SELL_USED_CAR_0_KM_ABOVE_24_MONTHS,
            'el_opportunity_tradein|NoRelationship|Form|el_opportunity_tradein.ButtonEurodriveSellUsedCar': DOCTYPE_EURODRIVE_SELL_USED_CAR,
            'el_opportunity_tradein|NoRelationship|Form|el_opportunity_tradein.ButtonEurodriveBuyUsedCar': DOCTYPE_EURODRIVE_BUY_USED_CAR

        };

        var documentType = actions[CommandProperties.SourceControlId];

        if (documentType) {
            openTradeinAgreement(documentType);
        }
        else {
            commons.OpenAlertDialog('Button Unknown');
        }
    };

    el_opportunity_tradein.Ribbon.AddFileRibbon = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }
        
        var name;
        if (commons.GetFieldValue("name"))
            name = commons.GetFieldValue("name");
        else if (commons.GetFieldValue("el_name"))
            name = commons.GetFieldValue("el_name");
        else if (commons.GetFieldValue("title"))
            name = commons.GetFieldValue("title");
        else
            name = commons.GetCurrentEntityName();

        var pageInput = {
            pageType: "entityrecord",
            entityName: "el_doc",
            formParameters: {
                "pId": commons.GetCurrentEntityId(),
                "pName": name,
                "pType": commons.GetCurrentEntityName()
            }
        }

        var navigationOptions = {
            target: 2, // 2 opens the page as a modal dialog
            position: 1 // 1 for center, 2 for side pane
        };


        //To Check
        commons.NavigateTo(pageInput, navigationOptions);
    }

    


        
    el_opportunity_tradein.Ribbon.EnableRules = el_opportunity_tradein.Ribbon.EnableRules || {};

    el_opportunity_tradein.Ribbon.EnableRules.showButtonEnableRule = async function (primaryControl) {
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        if (commons.GetAttribute("el_id_showroom")) {
            showroomId = commons.GetLookupFieldValue("el_id_showroom").id;
            var showroom = await commons.RetrieveRecord("el_showroom", showroomId, options);
            if (showroom != null) {
                if (showroom.el_s_showroom_cod == SHOWROOM_CODE_BMC_TLV)
                    return true;
                else
                    return false;
            }
        }
    };

    el_opportunity_tradein.Ribbon.EnableRules.enableTradeInRibbon = function (primaryControl) {
        return new Promise((resolve, reject) => {
            try {
                debugger;
                if (!commons) {
                    commons = new elad_commons();
                    commons.SetFormContext(primaryControl);
                }
                var formState = commons.GetFormType();
                if (formState != FORMSTATE_CREATE) {
                    commons.UserHasRoleOrIsAdmin(OPEN_TRADEIN_SYSTEM_ROLE).then(
                        function (hasRole) {
                            resolve(hasRole);
                        }
                );
                } else {
                    resolve(false);
                }
    
            } catch (error) {
                commons.PageErrorHandler(error, "el_opportunity_tradein.enableTradeInRibbon");
                resolve(false);
            }
        })
    };

})((window.el_opportunity_tradein = window.el_opportunity_tradein || {}))