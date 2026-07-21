
(function (el_car) {

    var common;

    var FORMSTATE_CREATE = 1;
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

    el_car.OnLoad = function (executionContext) {
        try {
            debugger;
            common = new elad_commons();
            common.SetFormContext(executionContext.getFormContext());


        } catch (e) {
            common.PageErrorHandler(error, "OnLoad");
        }
    }

    el_car.addOpenLegacyParameters = async function (accountid) {
        
        var options =
            "?$select=" +
            "el_dt_date_of_birth," +
            "el_s_first_name," +
            "el_s_last_name," +
            "el_s_idnumber_text," +
            "EMailAddress1," +
            "Fax," +
            "Telephone1," +
            "Telephone2," +
            "Name," +
            "_el_id_type_code_value" +

            //TODO: Add address reference (el_address isn't exist into CRM)

            // "&$expand=" +
            // "el_el_address_account($select=" +
            // "el_s_city_text," +
            // "el_id_city," +
            // "el_id_pob_city," +
            // "el_id_street_synonym," +
            // "el_s_street_text," +
            // "el_n_house_number," +
            // "el_n_zip," +
            // "el_n_pob_zip," +
            // "el_s_entrance," +
            // "el_n_pob" +

            // "$expand=" +
            // "el_id_city($select=Name)," +
            // "el_id_pob_city($select=Name)," +
            // "el_id_street_synonym($select=Name)" +

            // ")," +
            "?$expand=el_id_type_code($select=el_n_id_type_code)";

        var account = await common.RetrieveRecord("account", accountid, options);
        account = account != null ? account : null;
        var parameters = "";
        if (account != null) {
            parameters += "cpd.shemPrati=" + common.notNullParam(account.el_s_first_name).trim() + "&";
            parameters += "cpd.shemMishpaha=" + common.notNullParam(account.el_s_last_name).trim() + "&";
            parameters += "cpd.taarihLeda=" + common.GetOdataDate(account.el_dt_date_of_birth) + "&";
            parameters += "cmd.sugLakoah=" + common.getTypeId(account.el_id_type_code) + "&";
            parameters += "cpd.misparZeutHevra=" + common.notNullParam(account.el_s_idnumber_text).trim() + "&";
            parameters += "tel.telephoneCelolari=" + common.notNullParam(account.Telephone1).trim() + "&";
            parameters += "tel.misparTelephoneA=" + common.notNullParam(account.Telephone2).trim() + "&";
            parameters += "tel.misparTelephoneB=" + common.notNullParam(account.Telephone1).trim() + "&";
            parameters += "tel.misparFax=" + common.notNullParam(account.Fax).trim() + "&";
            parameters += "cpd.ktovetEmail=" + common.notNullParam(account.EMailAddress1).trim() + "&";
            if (account.el_el_address_account != null) {
                var city = account.el_el_address_account.el_id_city != null && account.el_el_address_account.el_id_city.Name != "אחר" ? common.notNullLookupParam(account.el_el_address_account.el_id_city) : common.notNullParam(account.el_el_address_account.el_s_city_text) == "" ? "" : common.notNullParam(account.el_el_address_account.el_s_city_text);
                if (city == "")
                    city = common.notNullLookupParam(account.el_el_address_account.el_id_pob_city)
                parameters += "cpd.ir=" + city + "&";
                var semelIshuv = common.getCityCode4Params(account.el_el_address_account, "address") != "" ? common.getCityCode4Params(account.el_el_address_account, "address") : common.getCityCode4Params(account.el_el_address_account, "pob");
                parameters += "cpd.semelIshuv=" + semelIshuv + "&"; //maybe will be necessary retrieve value with this guid (code)
                var street = account.el_el_address_account.el_id_street_synonym.Name && account.el_el_address_account.el_id_street_synonym.Name != "אחר" ? common.notNullLookupParam(account.el_el_address_account.el_id_street_synonym) : common.notNullParam(account.el_el_address_account.el_s_street_text) == "" ? "" : common.notNullParam(account.el_el_address_account.el_s_street_text);
                parameters += "cpd.rehov=" + street + "&";
                parameters += "cpd.mispar=" + common.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                parameters += "cpd.knisa=" + common.notNullParam(account.el_el_address_account.el_s_entrance).trim() + "&";
                var zip = account.el_el_address_account.el_n_zip != null ? common.notNullParam(account.el_el_address_account.el_n_zip) : common.notNullParam(account.el_el_address_account.el_n_pob_zip);
                parameters += "cpd.mikud=" + zip + "&";
                parameters += "cpd.tdMispar=" + common.notNullParam(account.el_el_address_account.el_n_pob) + "&";
                parameters += "cpd.tdIshuv=" + common.notNullLookupParam(account.el_el_address_account.el_id_pob_city);
            }
            else {
                parameters += "cpd.ir=&cpd.semelIshuv=&cpd.rehov=&cpd.mispar=&cpd.knisa=&cpd.mikud=&cpd.tdMispar=&cpd.tdIshuv="
            }
        }
        else {
            parameters += "cpd.shemPrati=&cpd.shemMishpaha=&cpd.taarihLeda=&cmd.sugLakoah=&cpd.misparZeutHevra=&tel.telephoneCelolari=&tel.misparTelephoneA=&tel.misparTelephoneB=&tel.misparFax=&cpd.ktovetEmail=&cpd.ir=&cpd.semelIshuv=&cpd.rehov=&cpd.mispar=&cpd.knisa=&cpd.mikud=&cpd.tdMispar=&cpd.tdIshuv="
        }
        return parameters;
    }

    el_car.addOpenLegacyTradeinParameters = async function (accountid, opportunityTradeinid, as400accountcode) {
        
        var parameters = "";
        var options =
            "?$select=" +
            "el_dt_date_of_birth," +
            "el_s_first_name," +
            "el_s_last_name," +
            "el_s_idnumber_text," +
            "EMailAddress1," +
            "Fax," +
            "Telephone1," +
            "Telephone2," +
            "Name" +

            //TODO: Add address reference (el_address isn't exist into CRM)

            // "&$expand=" +
            // "el_el_address_account($select=" +
            // "el_s_city_text," +
            // "el_id_city," +
            // "el_id_pob_city," +
            // "el_id_street_synonym," +
            // "el_s_street_text," +
            // "el_n_house_number," +
            // "el_n_zip," +
            // "el_n_pob_zip," +
            // "el_s_entrance," +
            // "el_n_pob" +

            // "$expand=" +
            // "el_id_city($select=Name)," +
            // "el_id_pob_city($select=Name)," +
            // "el_id_street_synonym($select=Name)" +

            // ")," +
            "&$expand=el_id_type_code($select=el_n_id_type_code)";

        var account = await common.RetrieveRecord("account", accountid, options);
        account = account != null ? account : null;


        if (account != null) {
            parameters += "msLakoah=" + as400accountcode.trim() + "&";
            parameters += "shemLakoah=" + common.notNullParam(account.Name).trim() + "&";
            parameters += "tzHp=" + common.notNullParam(account.el_s_idnumber_text).trim() + "&";
            parameters += "nayad=" + common.notNullParam(account.Telephone1).trim() + "&";
            parameters += "telephone1=" + common.notNullParam(account.Telephone2).trim() + "&";
            parameters += "fax=" + common.notNullParam(account.Fax).trim() + "&";
            parameters += "mail=" + common.notNullParam(account.EMailAddress1).trim() + "&";
            parameters += "misparIzdamnut=" + common.notNullParam(opportunityTradeinid.replace("{", "").replace("}", "")) + "&";;
            if (account.el_el_address_account != null) {
                var city = account.el_el_address_account.el_id_city != null && account.el_el_address_account.el_id_city.Name != "אחר" ? common.notNullLookupParam(account.el_el_address_account.el_id_city) : common.notNullParam(account.el_el_address_account.el_s_city_text) == "" ? "" : common.notNullParam(account.el_el_address_account.el_s_city_text);
                var street = account.el_el_address_account.el_id_street_synonym.Name && account.el_el_address_account.el_id_street_synonym.Name != "אחר" ? common.notNullLookupParam(account.el_el_address_account.el_id_street_synonym) : common.notNullParam(account.el_el_address_account.el_s_street_text) == "" ? "" : common.notNullParam(account.el_el_address_account.el_s_street_text);
                parameters += "cpd.mispar=" + common.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                parameters += "ir=" + city + "&";
                parameters += "ktovet=" + street + " " + common.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                parameters += "mikud=" + common.notNullParam(account.el_el_address_account.el_n_zip);
            }
            else {
                parameters += "ir=&ktovet=&mikud="
            }
        }
        else {
            parameters += "shemLakoah=&tzHp=&nayad=&telephone1=&fax=&mail=&ir=&ktovet=&mikud="
        }
        return parameters;
    }

    el_car.addOpenLegacyTradeinQuotParameters = async function (accountid, opportunityTradeinid) {

        var options =
            "?$select=" +
            "Name," +
            "Telephone1," +
            "EMailAddress1" +

            "&$expand=" +
            "el_el_address_account($select=" +
            "el_s_city_text," +
            "el_s_street_text," +
            "el_n_house_number," +
            "el_n_zip;" +

            "$expand=" +
            "el_id_city($select=Name)," +
            "el_id_street_synonym($select=Name)" +
            ")";

        var account = await common.RetrieveRecord("account", accountid, options);
        account = account != null ? account : null;

        var parameters = "";
        if (account != null) {
            parameters += "shemLakoah=" + common.notNullParam(account.Name).trim() + "&";
            if (account.el_el_address_account != null) {
                var city = account.el_el_address_account.el_id_city != null && account.el_el_address_account.el_id_city.Name != "אחר" ? common.notNullLookupParam(account.el_el_address_account.el_id_city) : common.notNullParam(account.el_el_address_account.el_s_city_text) == "" ? "" : common.notNullParam(account.el_el_address_account.el_s_city_text);
                var street = account.el_el_address_account.el_id_street_synonym.Name && account.el_el_address_account.el_id_street_synonym.Name != "אחר" ? common.notNullLookupParam(account.el_el_address_account.el_id_street_synonym) : common.notNullParam(account.el_el_address_account.el_s_street_text);
                parameters += "ktovet=" + street + " " + common.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                parameters += "ir=" + city + "&";
                parameters += "mikud=" + common.notNullParam(account.el_el_address_account.el_n_zip) + "&";
            }
            else {
                parameters += "ir=&ktovet=&mikud=&";
            }
            parameters += "telephone=" + common.notNullParam(account.Telephone1).trim() + "&";
            parameters += "email=" + common.notNullParam(account.EMailAddress1).trim();

        }
        else {
            parameters += "shemLakoah=&ktovet=&ir=&mikud=&telephone=&email=";
        }
        return parameters;
    }

    el_car.showOpenLegacyRibbon = async function (field, customerfieldname, actionType, as400code) {
        if (common.GetOpenerEntityInfo()) {
            common.OpenAlertDialog("לא ניתן לבצע פעולה זו מתוך חלון מוקפץ.\nיש לחזור לחלון הראשי ולנסות שנית");
            return;
        }

        var addIncidentGuidAndID = false;
        var addCarNumber = false;
        var addAccountParams = false;
        var addTradeinAccountParams = false;
        var addTradeinQuotAccountParams = false;
        var addTradeinDealParams = false;
        var addOpportunityNum = false;
        var addPurchaseNum = false;
        var addOrderParams = false;
        var url = await common.GetGlobalParameterValueByName(field) + "?";

        var accountid = customerfieldname && common.GetFieldValue(customerfieldname) != null ? common.GetLookupId(customerfieldname) : "00000000-0000-0000-0000-000000000000";

        switch (field) {
            case BENEFIT_URL:
                addCarNumber = true;
                addIncidentGuidAndID = true;
            case CAR_STATUS_URL:
                addCarNumber = true;
                break;
            case PROD_TREE_ORDER_URL:
                addAccountParams = true;
                addOpportunityNum = true;
                break;
            case STOCK_ORDER_URL:
                addAccountParams = true;
                addOpportunityNum = true;
                break;
            case SPECIAL_QUOTE_URL:
                addAccountParams = true;
                break;
            case UPDATE_ORDER_URL:
                addOrderParams = true;
                break;
            case TRADEIN_SYSTEM_URL_ASSIGN:
            case TRADEIN_SYSTEM_URL_MAAGAR:
                addTradeinAccountParams = true;
                break;
            case UPDATE_TRADEIN_DEAL_URL:
            case CANCEL_TRADEIN_DEAL_URL:
            case INVOICE_TRADEIN_DEAL_URL:
            case CANCEL_TRADEIN_ADVANCE_URL:
            case RECEIPT_TRADEIN_DEAL_URL:
            case RESTORE_INVOICE_TRADEIN_DEAL_URL:
                addTradeinDealParams = true;
                break;
            case TRADEIN_QUOT:
                addTradeinQuotAccountParams = true;
                break;
        }
        if (addCarNumber) {
            var entityName = common.GetCurrentEntityName();
            var carLicense = entityName == "incident" ? common.GetLookupName("el_id_car") : common.GetFieldValue("el_name");
            url += "license=" + carLicense;
        }
        if (addIncidentGuidAndID) {
            var customerIdentification = await el_car.getCustomerIdentification(accountid);
            var IncidentID = common.NotNullParam(common.GetCurrentEntityId().replace(/[{}]/g, ''));
            var incidentNumber = common.GetFieldValue("el_s_incident_number");
            url += "&tz=" + customerIdentification + "&guid=" + IncidentID + "&asmachta=" + incidentNumber;
        }
        if (addAccountParams)
            url = url + await el_car.addOpenLegacyParameters(accountid);
        if (addTradeinAccountParams)
            url = url + await el_car.addOpenLegacyTradeinParameters(accountid, common.GetCurrentEntityId(), as400code);
        if (addTradeinQuotAccountParams) {
            url = url + await el_car.addOpenLegacyTradeinQuotParameters(accountid, common.GetCurrentEntityId());
        }
        if (addOpportunityNum)
            url += "&cmd.misparIzdamnut=" + common.NotNullParam(common.GetCurrentEntityId().replace("{", "").replace("}", ""));
        if (addPurchaseNum) {
            url += addAccountParams ? "&" : "";
            url += "cmd.misparTeuda=" + common.GetFieldValue("el_s_purchase_num");
        }
        if (addOrderParams) {
            url += "recordId=" + common.GetFieldValue("el_s_ratz_number");
        }
        if (addTradeinDealParams) {
            url = url.replace("?", "");
            url += "/" + common.GetFieldValue("el_s_purchase_num") + "?product=" + common.GetFieldValue("el_l_car_type");
        }
        if (actionType) {
            url += "&actionType=" + actionType;
        }
        var win = top.window.open(url, "OpenLegacy");
        win.focus();


    }

    el_car.getCustomerIdentification = async function (accountID) {
        try {
            if (!accountID) return "";
            var customer = await common.RetrieveRecord("account", common.StripGuid(accountID), "?$select=el_s_idnumber_text");
            if (customer != null && customer.el_s_idnumber_text) return customer.el_s_idnumber_text;
            return "";

        } catch (error) {
            common.PageErrorHandler(error, "el_car.getCustomerIdentification");
            return "";
        }
    }

    el_car.ShowDocuments = function () {
        common.OpenAlertDialog("מסמכים");
    }

    
    el_car.Ribbon = {};
    
    el_car.Ribbon.openCarInAS400 = function (primaryControl) {
        debugger;
        if (!common) {
            common = new elad_commons();
            common.SetFormContext(primaryControl);
        }
        
        el_car.showOpenLegacyRibbon(CAR_STATUS_URL, null, null, null);
    }



})((window.el_car = window.el_car || {}));