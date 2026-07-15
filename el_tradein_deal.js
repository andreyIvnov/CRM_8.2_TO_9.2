(function (el_tradein_deal) {

    var BENEFIT_URL = "BENEFIT_URL";
    var CAR_STATUS_URL = "CAR_STATUS_URL";
    var PROD_TREE_ORDER_URL = "PROD_TREE_ORDER_URL";
    var STOCK_ORDER_URL = "STOCK_ORDER_URL";
    var SPECIAL_QUOTE_URL = "SPECIAL_QUOTE_URL";
    var UPDATE_ORDER_URL = "UPDATE_ORDER_URL";
    var TRADEIN_SYSTEM_URL_ASSIGN = "TRADEIN_SYSTEM_URL_ASSIGN";
    var TRADEIN_SYSTEM_URL_MAAGAR = "TRADEIN_SYSTEM_URL_MAAGAR";
    var UPDATE_TRADEIN_DEAL_URL = "UPDATE_TRADEIN_DEAL_URL";
    var INVOICE_TRADEIN_DEAL_URL = "INVOICE_TRADEIN_DEAL_URL";
    var CANCEL_TRADEIN_DEAL_URL = "CANCEL_TRADEIN_DEAL_URL";
    var CANCEL_TRADEIN_ADVANCE_URL = "CANCEL_TRADEIN_ADVANCE_URL";
    var RECEIPT_TRADEIN_DEAL_URL = "RECEIPT_TRADEIN_DEAL_URL";
    var RESTORE_INVOICE_TRADEIN_DEAL_URL = "RESTORE_INVOICE_TRADEIN_DEAL_URL";
    var TRADEIN_QUOT = "TRADEIN_QUOT";
    var TRADEIN_STATUS_ORDER = "50"; //שיבוץ
    var TRADEIN_STATUS_INVOICE = "90";
    var TRADEIN_STATUS_STOCK = "10";
    var TRADEIN_STATUS_INTERESTED_TOSELL = "01";

    var commons;

    el_tradein_deal.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_tradein_deal.onLoadEvents();

            el_tradein_deal.onChangeEvents();

            el_tradein_deal.onSaveEvents();

        } catch (error) {
            commons.PageErrorHandler(error, "el_lead.onLoad");
        }
    };

    el_tradein_deal.onLoadEvents = function () {

    }

    el_tradein_deal.onChangeEvents = function () {

    }

    el_tradein_deal.onSaveEvents = function () {

    }

    //To Check -> NavigateTo
    el_tradein_deal.AddFileRibbon = function () {
        // var extRaqs = "";
        // var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes";

        // extRaqs += "pId=" + Xrm.Page.data.entity.getId();
        // extRaqs += "&pName=" + name;
        // extRaqs += "&pType=" + Xrm.Page.context.getQueryStringParameters().etc;
        // window.open(Xrm.Page.context.prependOrgName("/main.aspx?etc=" + EL_DOC_TYPECODE + "&pagetype=entityrecord&extraqs=" + encodeURIComponent(extRaqs)), "_blank", features, false);
        const name;
        if (commons.GetFieldValue("name"))
            name = commons.GetFieldValue("name");
        else if (commons.GetFieldValue("el_name"))
            name = commons.GetFieldValue("el_name");
        else if (commons.GetFieldValue("title"))
            name = commons.GetFieldValue("title");
        else
            name = commons.GetCurrentEntityName();

        const pageInput = {
            pageType: "entityrecord",
            entityName: "el_doc",
            formParameters: {
                "pId": commons.GetCurrentEntityId(),
                "pName": name,
                "pType": commons.GetCurrentEntityName()
            }
        }

        const navigationOptions = {
            target: 2, // 2 opens the page as a modal dialog
            position: 1 // 1 for center, 2 for side pane
        };


        commons.NavigateTo(pageInput, navigationOptions);
    };

    el_tradein_deal.replaceAll = function (txt, replace, with_this) {
        return txt.replace(new RegExp(replace, 'g'), with_this);
    };

    el_tradein_deal.notNullParam = function (param) {

        if (typeof (param) == 'string')
            return param != null ? encodeURI(el_tradein_deal.replaceAll(el_tradein_deal.replaceAll(param, "\"", ""), "`", "'")) : "";
        else
            return param != null ? encodeURI(param) : "";
    };

    el_tradein_deal.notNullLookupParam = function (param) {

        if (typeof (param) == 'string')
            return param != null ? el_tradein_deal.notNullParam(el_tradein_deal.replaceAll(param, "\"", "")) : "";
        else
            return param != null ? el_tradein_deal.notNullParam(param.name) : "";
    };

    //To Check -> Retrieve 
    el_tradein_deal.getCityCode4Params = function (address, addressType) {
        // var r;
        // if (addressType == "address")
        //     r = OdataUtilObj.RetrieveData("el_citySet", el_id_city.Id, "el_n_ministry_city_code", null, null, null, false);
        // if (addressType == "pob")
        //     r = OdataUtilObj.RetrieveData("el_citySet", address.el_id_pob_city.Id, "el_n_ministry_city_code", null, null, null, false);

        // return r != null && r.el_n_ministry_city_code != null ? r.el_n_ministry_city_code : "";
        return new Promise((resolve, reject) => {
            if (address != null && (address.el_id_city != null || address.el_id_pob_city != null) && (address.el_id_city.id != null || address.el_id_pob_city.id != null)) {

                commons.RetrieveRecord("el_city", addressType == "address" ? address.el_id_city.id : address.el_id_pob_city.id, "?$select=el_n_ministry_city_code")
                    .then(
                        successResponse => resolve(successResponse && successResponse.el_n_ministry_city_code ? successResponse.el_n_ministry_city_code : ""),
                        err => commons.SetFormNotification(("Error by retrieving 'el_city' in el_tradein_deal.getCityCode4Params()", commons.FormNotificationLevel.ERROR, "el_tradein_deal.getCityCode4Params"))
                    )
            }
            else
                resolve("");
        })
    };

    el_tradein_deal.getOdataDate = function (datefield) {
        if (datefield != null) {
            datefield = datefield.replace("/Date(", "");
            datefield = datefield.replace(")/", "");
            var dateValue = new Date(parseInt(datefield, 10));
            dateValue.setDate(dateValue.getDate());
            return [dateValue.getDate(), dateValue.getMonth() + 1, dateValue.getFullYear()].join('/');
        }
        return "";
    };

    //To Check -> Variables using
    el_tradein_deal.getTypeId = function (type) {
        if (type != null && type.el_n_id_type_code != null) {
            return type.el_n_id_type_code < 10 ? encodeURI("0" + type.el_n_id_type_code) : encodeURI(type.el_n_id_type_code);
        }
        else return "";
    };


   

    //To Check -> Variables using
    el_tradein_deal.addOpenLegacyTradeinParameters = async function (accountid, opportunityTradeinid, as400accountcode) {
        try {
            const account = await el_tradein_deal.getAccountData(accountid);

            const parameters = "";
            if (account != null) {
                parameters += "msLakoah=" + as400accountcode.trim() + "&";
                parameters += "shemLakoah=" + el_tradein_deal.notNullParam(account.Name).trim() + "&";
                parameters += "tzHp=" + el_tradein_deal.notNullParam(account.el_s_idnumber_text).trim() + "&";
                parameters += "nayad=" + el_tradein_deal.notNullParam(account.telephone1).trim() + "&";
                parameters += "telephone1=" + el_tradein_deal.notNullParam(account.telephone2).trim() + "&";
                parameters += "fax=" + el_tradein_deal.notNullParam(account.fax).trim() + "&";
                parameters += "mail=" + el_tradein_deal.notNullParam(account.emailaddress1).trim() + "&";
                parameters += "misparIzdamnut=" + el_tradein_deal.notNullParam(opportunityTradeinid.replace("{", "").replace("}", "")) + "&";;
                if (account.el_el_address_account != null) {
                    const city = account.el_el_address_account.el_id_city != null && account.el_el_address_account.el_id_city.name != "אחר" ? el_tradein_deal.notNullLookupParam(account.el_el_address_account.el_id_city) : el_tradein_deal.notNullParam(account.el_el_address_account.el_s_city_text) == "" ? "" : el_tradein_deal.notNullParam(account.el_el_address_account.el_s_city_text);
                    const street = account.el_el_address_account.el_id_street_synonym.Name && account.el_el_address_account.el_id_street_synonym.name != "אחר" ? el_tradein_deal.notNullLookupParam(account.el_el_address_account.el_id_street_synonym) : el_tradein_deal.notNullParam(account.el_el_address_account.el_s_street_text) == "" ? "" : el_tradein_deal.notNullParam(account.el_el_address_account.el_s_street_text);
                    parameters += "cpd.mispar=" + el_tradein_deal.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                    parameters += "ir=" + city + "&";
                    parameters += "ktovet=" + street + " " + el_tradein_deal.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                    parameters += "mikud=" + el_tradein_deal.notNullParam(account.el_el_address_account.el_n_zip);
                }
                else {
                    parameters += "ir=&ktovet=&mikud="
                }
            }
            else {
                parameters += "shemLakoah=&tzHp=&nayad=&telephone1=&fax=&mail=&ir=&ktovet=&mikud="
            }
            return parameters;
        } catch (error) {
            commons.PageErrorHandler(error, "el_tradein_deal.addOpenLegacyTradeinParameters")
        }
    };

    //To Check -> Variables using
    el_tradein_deal.addOpenLegacyTradeinQuotParameters = async function (accountid, opportunityTradeinid) {
        try {

            const account = await el_tradein_deal.getAccountData(accountid);

            const parameters = "";

            if (account != null) {
                parameters += "shemLakoah=" + el_tradein_deal.notNullParam(account.name).trim() + "&";
                if (account.el_el_address_account != null) {
                    const city = account.el_el_address_account.el_id_city != null && account.el_el_address_account.el_id_city.name != "אחר" ? el_tradein_deal.notNullLookupParam(account.el_el_address_account.el_id_city) : el_tradein_deal.notNullParam(account.el_el_address_account.el_s_city_text) == "" ? "" : el_tradein_deal.notNullParam(account.el_el_address_account.el_s_city_text);
                    const street = account.el_el_address_account.el_id_street_synonym.Name && account.el_el_address_account.el_id_street_synonym.name != "אחר" ? el_tradein_deal.notNullLookupParam(account.el_el_address_account.el_id_street_synonym) : el_tradein_deal.notNullParam(account.el_el_address_account.el_s_street_text);
                    parameters += "ktovet=" + street + " " + el_tradein_deal.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                    parameters += "ir=" + city + "&";
                    parameters += "mikud=" + el_tradein_deal.notNullParam(account.el_el_address_account.el_n_zip) + "&";
                }
                else {
                    parameters += "ir=&ktovet=&mikud=&";
                }
                parameters += "telephone=" + el_tradein_deal.notNullParam(account.telephone1).trim() + "&";
                parameters += "email=" + el_tradein_deal.notNullParam(account.emailaddress1).trim();

            }
            else {
                parameters += "shemLakoah=&ktovet=&ir=&mikud=&telephone=&email=";
            }

            return parameters;

        } catch (error) {
            commons.PageErrorHandler(error, "el_tradein_deal.addOpenLegacyTradeinQuotParameters")
        }
    };


    //To Check -> openUrl
    commons.showOpenLegacyRibbon = async function (field, customerfieldname, actionType, as400code) {
        if (commons.GetOpenerEntityInfo()) {
            commons.OpenAlertDialog("לא ניתן לבצע פעולה זו מתוך חלון מוקפץ.\nיש לחזור לחלון הראשי ולנסות שנית");
            return;
        }

        const addIncidentGuidAndID = false;
        const addCarNumber = false;
        const addAccountParams = false;
        const addTradeinAccountParams = false;
        const addTradeinQuotAccountParams = false;
        const addTradeinDealParams = false;
        const addOpportunityNum = false;
        const addPurchaseNum = false;
        const addOrderParams = false;
        const url = await commons.GetGlobalParameterValueByName(field) + "?";

        const accountid = customerfieldname && commons.GetLookupId(customerfieldname) ? commons.GetLookupId(customerfieldname) : "00000000-0000-0000-0000-000000000000";

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
            const entityName = commons.GetCurrentEntityName();
            const carLicense = entityName === "incident" ? commons.GetLookupName("el_id_car") : commons.GetFieldValue("el_name");
            url += "license=" + carLicense;
        }
        if (addIncidentGuidAndID) {
            const customerIdentification = await el_tradein_deal.getCustomerIdentification(accountid);
            const IncidentID = el_tradein_deal.notNullParam(commons.StripGuid(commons.GetCurrentEntityId()));
            const incidentNumber = commons.GetFieldValue("el_s_incident_number");
            url += "&tz=" + customerIdentification + "&guid=" + IncidentID + "&asmachta=" + incidentNumber;
        }
        if (addAccountParams)
            url = url + await commons.addOpenLegacyParameters(accountid);
        if (addTradeinAccountParams)
            url = url + await el_tradein_deal.addOpenLegacyTradeinParameters(accountid, commons.StripGuid(commons.GetCurrentEntityId()), as400code);
        if (addTradeinQuotAccountParams) {
            url = url + await el_tradein_deal.addOpenLegacyTradeinQuotParameters(accountid, commons.StripGuid(commons.GetCurrentEntityId()));
        }
        if (addOpportunityNum)
            url += "&cmd.misparIzdamnut=" + el_tradein_deal.notNullParam(commons.StripGuid(commons.GetCurrentEntityId()));
        if (addPurchaseNum) {
            url += addAccountParams ? "&" : "";
            url += "cmd.misparTeuda=" + commons.GetFieldValue("el_s_purchase_num");
        }
        if (addOrderParams) {
            url += "recordId=" + commons.GetFieldValue("el_s_ratz_number");
        }
        if (addTradeinDealParams) {
            url = url.replace("?", "");
            url += "/" + commons.GetFieldValue("el_s_purchase_num") + "?product=" + commons.GetFieldValue("el_l_car_type");
        }
        if (actionType) {
            url += "&actionType=" + actionType;
        }


        // var win = top.window.open(url, "OpenLegacy");
        // win.focus();

        commons.openUrl(url)
    };

    //To Check -> Retrive
    el_tradein_deal.getCustomerIdentification = function (accountID) {
        return new Promise((resolve, reject) => {
            // var url = "AccountSet?$select=el_s_idnumber_text&$filter=AccountId eq guid'" + accountID + "'";
            // var customer = odatautil.RetrieveDataByUrl("", url, null, null, true);
            commons.RetrieveRecord("account", commons.StripGuid(accountID), "?$select=el_s_idnumber_text")
                .then(
                    function successResponse(result) {
                        if (result && result.el_s_idnumber_text) {
                            resolve(result.el_s_idnumber_text);
                        }
                        else
                            resolve("")
                    },
                    err => commons.SetFormNotification("Error on retrieve account into el_tradein_deal.getCustomerIdentification: " + err.message, commons.FormNotificationLevel.ERROR, "el_tradein_deal.getCustomerIdentification")
                )
        })
    };


    el_tradein_deal.yyyymmdd = function (dateIn, utcMatchNeeded) {
        const yyyy = dateIn.getFullYear();
        const mm = dateIn.getMonth() + 1; // getMonth() is zero-based
        const dd = dateIn.getDate();

        if (utcMatchNeeded) {
            const utcmils = Date.UTC(yyyy, mm, dd);
            const localmils = new Date(yyyy, mm, dd).getTime();
            const utcDiff = utcmils - localmils;
            const todayUtc = new Date(yyyy, mm - 1, dd);
            todayUtc.setTime(todayUtc.getTime() - utcDiff); //less 2-3 hours
            yyyy = todayUtc.getFullYear();
            mm = todayUtc.getMonth() + 1; // getMonth() is zero-based
            dd = todayUtc.getDate();
        }
        const result = String(10000 * yyyy + 100 * mm + dd); // Leading zeros for mm and dd
        return result.substring(0, 4) + '-' + result.substring(4, 6) + '-' + result.substring(6, 8);
    };

    el_tradein_deal.changeRecordStatus = function (recordId, stateCode, statusCode, entityName) {
        var entityData = {
            "statecode": stateCode,
            "statuscode": statusCode
        };

        //To Check
        commons.updateRecord(entityName, commons.StripGuid(recordId), entityData)
            .then(
                success => commons.NavigateTo(
                    {
                        pageType: "entityrecord",
                        entityName: entityName,
                        entityId: recordId
                    },
                    {
                        target: 1 //open in new page
                    }
                ),
                err => commons.PageErrorHandler(err, "el_tradein_deal.changeRecordStatus")
            )
        // // create the SetState request
        // var request = "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">";
        // request += "<s:Body>";
        // request += "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">";
        // request += "<request i:type=\"b:SetStateRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">";
        // request += "<a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">";
        // request += "<a:KeyValuePairOfstringanyType>";
        // request += "<c:key>EntityMoniker</c:key>";
        // request += "<c:value i:type=\"a:EntityReference\">";
        // request += "<a:Id>" + recordId + "</a:Id>";
        // request += "<a:LogicalName>" + entityName + "</a:LogicalName>";
        // request += "<a:Name i:nil=\"true\" />";
        // request += "</c:value>";
        // request += "</a:KeyValuePairOfstringanyType>";
        // request += "<a:KeyValuePairOfstringanyType>";
        // request += "<c:key>State</c:key>";
        // request += "<c:value i:type=\"a:OptionSetValue\">";
        // request += "<a:Value>" + stateCode + "</a:Value>";
        // request += "</c:value>";
        // request += "</a:KeyValuePairOfstringanyType>";
        // request += "<a:KeyValuePairOfstringanyType>";
        // request += "<c:key>Status</c:key>";
        // request += "<c:value i:type=\"a:OptionSetValue\">";
        // request += "<a:Value>" + statusCode + "</a:Value>";
        // request += "</c:value>";
        // request += "</a:KeyValuePairOfstringanyType>";
        // request += "</a:Parameters>";
        // request += "<a:RequestId i:nil=\"true\" />";
        // request += "<a:RequestName>SetState</a:RequestName>";
        // request += "</request>";
        // request += "</Execute>";
        // request += "</s:Body>";
        // request += "</s:Envelope>";
        // var req = new XMLHttpRequest();
        // req.open("POST", Xrm.Page.context.getClientUrl() + "/XRMServices/2011/Organization.svc/web", false)
        // req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        // req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        // req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
        // req.onreadystatechange = function () {
        //     if (req.readyState == 4) {
        //         req.onreadystatechange = null;
        //         if (req.status == 200) {
        //             Xrm.Utility.openEntityForm(entityName, recordId);
        //         }

        //     }

        // };
        // req.send(request);


    };

    el_tradein_deal.showInvoiceRestoreRibbon = () => commons.GetFieldValue("el_s_as400t_statuscod_original") === TRADEIN_STATUS_INVOICE;

    el_tradein_deal.showReceiptRibbon = () => commons.GetFieldValue("el_s_as400t_statuscod_original") === TRADEIN_STATUS_ORDER;

    el_tradein_deal.showInvoiceRibbon = () => commons.GetFieldValue("el_s_as400t_statuscod_original") === TRADEIN_STATUS_ORDER;

    el_tradein_deal.showCancelInvoiceRibbon = () => commons.GetFieldValue("el_s_as400t_statuscod_original") === TRADEIN_STATUS_INVOICE;

    el_tradein_deal.showCancelAdvanceRibbon = () => commons.GetFieldValue("el_s_as400t_statuscod_original") === TRADEIN_STATUS_ORDER;

    el_tradein_deal.showEditTradeinRibbon = () => (commons.GetFieldValue("el_s_as400t_statuscod_original") === TRADEIN_STATUS_INTERESTED_TOSELL || commons.GetFieldValue("el_s_as400t_statuscod_original") === TRADEIN_STATUS_STOCK);

    el_tradein_deal.getAccountData = function (accountId) {
        commons.PageClearMessages("el_tradein_deal.getAccountData");
        return new Promise((resolve, reject) => {
            try {
                const selectFields = "?$select=el_dt_date_of_birth,el_id_type_code,el_s_first_name,el_s_idnumber_text,el_s_last_name,emailaddress1,fax,telephone1,telephone2,name";
                const expandAddress = "el_el_address_account($select=el_s_city_text,el_s_name,el_id_city,el_id_pob_city,el_id_street,el_id_street_synonym,el_s_street_text,el_n_house_number,el_n_old_zip,el_n_zip,el_n_pob_zip,el_s_entrance,el_n_pob)";
                const expandType = "el_id_type_account($select=el_n_id_type_code)";
                const query = `${selectFields}&$expand=${expandAddress},${expandType}`;

                commons.RetrieveRecord("account", commons.StripGuid(accountId), query)
                    .then(
                        successRetrievedAccount => resolve(successRetrievedAccount ? successRetrievedAccount : null),
                        error => {
                            console.error("Error by retrieving account on el_tradein_deal.getAccountData: ", error);
                            resolve(null)
                        }
                    )

            } catch (error) {
                commons.SetFormNotification("Error on el_tradein_deal.getAccountData: " + error.message, commons.FormNotificationLevel.ERROR, "el_tradein_deal.getAccountData")
                resolve(null);
            }
        })
    }

})(window.el_tradein_deal = window.el_tradein_deal || {})