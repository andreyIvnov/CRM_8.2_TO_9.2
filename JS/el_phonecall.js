(function (el_phonecall) {

    //----------------CONSTS----------------------------------
    var SLA_TYPE_LEAD = "{E4B46B72-3966-E311-80CC-00155D257801}"; //doesn't supposed to changed, the db was redeployed
    var SLA_TYPE_DRIVETEST_SCHEDULE = "{286D3025-3766-E311-80CC-00155D257801}";
    var SLA_TYPE_FULL_PAYMENT = "{BB17B1D0-5471-E311-80CD-00155D257801}";
    var SLA_TYPE_VEHICLE_FLEET_WAITING_FOR_DEMO_RIDE = "{41B20254-E2D9-E311-80CA-00155D257803}";
    var SLA_TYPE_VEHICLE_FLEET_PHONE_CALL_FOLLOW_UP = "{3329435A-E2D9-E311-80CA-00155D257803}";
    var LEAD_TYPECODE = 4;
    var FORMSTATE_CREATE = 1;
    var TYPE_PHONE_CALL_SLA = 2;
    var CLICK_TO_DIAL_URL = "IVR_CLICK_TO_DIAL_URL";

    var callPageOpendFromIncident = false;
    var Common;
    //-----------------METHODS--------------------------------

    el_phonecall.phonecallOnLoad = function(executionContext) {
        //Xrm.Page.data.setFormDirty(false);
        Common = new elad_commons();
        Common.SetFormContext(executionContext.getFromContext());

        el_phonecall.showTabsByRegardingObjectID();
        el_phonecall.phonecallAssignEventActions();
        el_phonecall.ShowAnnotationAndFieldLock();
        el_phonecall.hiddenFieldFromLead();
        // getShowroom();   Function isn't in use 14.11.24 TFS TASK 1313
        var regardingobjectid = Common.GetFieldValue("regardingobjectid");

        if (regardingobjectid && regardingobjectid[0].entityType != "incident") {
            if (Common.GetFormType() == FORMSTATE_CREATE) {
                Common.SetFieldValue("el_id_account", getSalesProcessAccount());
            }
            if (regardingobjectid[0].entityType == "el_company_rep") {

                Common.AddPreSearch("el_id_sla_type", function () {
                    filterSLAType();
                });
            }
            else {
                if (!Common.GetFieldValue("el_id_account") && regardingobjectid && regardingobjectid[0].entityType == "el_car_purchase")
                    Common.SetFieldValue("el_id_account", getCarPurchaseAccount());
            }
        }

        //else if (window.top.opener && window.top.opener.Xrm && window.top.opener.Xrm.Page && window.top.opener.Xrm.Page.data && window.top.opener.Xrm.Page.data.entity && window.top.opener.Xrm.Page.data.entity.getEntityName() == "incident" && Xrm.Page.ui.getFormType() == FORMSTATE_CREATE) {
        //    window.setTimeout(dialCustomer, 1000);
        //}

        //alert(Xrm.Page.data.entity.getDataXml());
        //var message = "The following fields are dirty: \n";
        //oppAttributes = Xrm.Page.data.entity.attributes.get();

        //if (oppAttributes != null) {
        //    for (var i in oppAttributes) {
        //        if (oppAttributes[i].getIsDirty()) {
        //            message += oppAttributes[i].getName() + "\n";
        //        }
        //    }
        //}
        //alert(message);
    }

    el_phonecall.overrideSaveAndClose = function(executionContext) { //Ribbon button
        if (callPageOpendFromIncident) {
            Common.SaveCommand(executionContext).then(el_phonecall.closeForm, null);
            /*
            Xrm.Page.data.entity.save();
            updateAddressLookupOnAccountForm();
    
            window.setTimeout(closeForm, 1000);
            */
        }
    }

    el_phonecall.ShowCloseFormWithTestDriveNotScheduledButton = function() {
        try {
            debugger
            sla_type = Common.GetFieldValue("el_id_sla_type");
            if (sla_type != null && sla_type[0] != null && sla_type[0].id != null && sla_type[0].id == SLA_TYPE_DRIVETEST_SCHEDULE)
                return true;
        }
        catch (e) { }
        return false;
    }

    el_phonecall.ShowAnnotationAndFieldLock = function() {
        debugger;
        Common.SetDisabled("description", true);
    }

    el_phonecall.hiddenFieldFromLead = function () {
        var typeOfPhoneCall = Common.GetFieldValue("el_l_phonecall_type");
        if (typeOfPhoneCall == TYPE_PHONE_CALL_SLA) {
            var regardingobjectid = Common.GetFieldValue("regardingobjectid");
            if (regardingobjectid && regardingobjectid[0].entityType != "lead") {
                Common.Setvisible("el_b_initiated_call", false);
                Common.Setvisible("el_s_bulkoperation_name", false);
                Common.Setvisible("el_s_bulkoperation_id", false);
            }
        }
    }

    el_phonecall.CloseFormWithTestDriveNotScheduled = function() { //Ribbon button
        debugger
        try {
            Common.SetFieldValue("el_b_appointment_not_scheduled", true);
            Common.Save().then(el_phonecall.CheckIffieldIsDirty, null);
        } catch (e) {

        }
    }

    el_phonecall.CheckIffieldIsDirty = function() {
        debugger
        if (Common.GetIsDirty()) {
            setTimeout(el_phonecall.CheckIffieldIsDirty, 500);
        }
        Common.ClosePage();
    }

    el_phonecall.closeForm = function() { 
        Common.ClosePage();
    }


    el_phonecall.HideSaveButtons = function() {
        try {
            if (Common.GetCurrentEntityName == "incident" && Common.GetFormType() == FORMSTATE_CREATE) {
                callPageOpendFromIncident = true;
                return false;
            }
        }
        catch (e) { }
        return true;
    }

    el_phonecall.ShowCustomSaveAndCloseButtons = function() {
        try {
            if (Common.GetCurrentEntityName == "incident" && Common.GetFormType() == FORMSTATE_CREATE) {
                callPageOpendFromIncident = true;
                return true;
            }
        }
        catch (e) { }
        return false;
    }

    

    /**
     * Function isn't in use 14.11.24 TFS TASK 1313
     */
    function getShowroom() { //tbd
        debugger;
        var OdataUtilObj = new OdataUtil();
        var regardingobjectid = Xrm.Page.getAttribute("regardingobjectid").getValue();
        var select = "el_id_showroom";
        var typeOfPhoneCall = Xrm.Page.getAttribute("el_l_phonecall_type").getValue();
        if (typeOfPhoneCall == TYPE_PHONE_CALL_SLA) {
            if (regardingobjectid && regardingobjectid[0].entityType == "opportunity") {
                var opportunity = OdataUtilObj.RetrieveData("OpportunitySet", regardingobjectid[0].id, select, null, null, null, false);
                if (opportunity && opportunity.el_id_showroom) {
                    var lookupField = new Array();
                    lookupField[0] = new Object();
                    lookupField[0].id = opportunity.el_id_showroom.Id;
                    lookupField[0].name = opportunity.el_id_showroom.Name;
                    lookupField[0].entityType = "el_showroom";
                    Xrm.Page.getAttribute("el_id_showroom").setValue(lookupField);
                }
            }
            else if (regardingobjectid && regardingobjectid[0].entityType == "lead") {
                var lead = OdataUtilObj.RetrieveData("LeadSet", regardingobjectid[0].id, select, null, null, null, false);
                if (lead && lead.el_id_showroom) {
                    var lookupField = new Array();
                    lookupField[0] = new Object();
                    lookupField[0].id = lead.el_id_showroom.Id;
                    lookupField[0].name = lead.el_id_showroom.Name;
                    lookupField[0].entityType = "el_showroom";
                    Xrm.Page.getAttribute("el_id_showroom").setValue(lookupField);
                }
            }
        }
    }

    el_phonecall.filterSLAType = function() {
        fetchXml = "<filter type='and'>"
            + "<filter type='or'>"
            + "<condition attribute='el_sla_typeid' value='" + SLA_TYPE_VEHICLE_FLEET_WAITING_FOR_DEMO_RIDE + "' operator='eq' />"
            + "<condition attribute='el_sla_typeid' value='" + SLA_TYPE_VEHICLE_FLEET_PHONE_CALL_FOLLOW_UP + "' operator='eq' />"
            + "</filter>"
            + "</filter>";

        if (Common.GetControl("el_id_sla_type"))
            Common.GetControl("el_id_sla_type").addCustomFilter(fetchXml);
    }



    el_phonecall_phonecallAssignEventActions = function () {
        Common.AddOnChange("el_id_sla_type", el_phonecall.SLATypeOnChange);
        //Xrm.Page.data.entity.addOnSave(savePhonecallWithoutDirt);
    }

    el_phonecall.dialCustomer = function () {
        if (!Common.GetFieldValue("el_b_ivr_call"))
            return;

        var extension = el_phonecall.getUserExtension();
        if (!extension) {
            Common.OpenAlertDialog('לא קיימת שלוחה למשתמש. פנה למנהל מערכת');
            return;
        }
        var accountPhone = el_phonecall.getAccountPhone();
        if (!accountPhone) {
            Common.OpenAlertDialog('טלפון לקוח לא מעודכן. פנה למנהל מערכת');
            return;

        }
        var url = el_phonecall.getGlobalParameter(CLICK_TO_DIAL_URL);
        url += "clid=" + accountPhone + "&ext=" + extension;
        /*var win = top.window.open(url, "Aspire"); //tbd
        win.focus();*/
        Common.openUrl(url);

        //http://avaya/OptimusIntegration/Rest/ExtensionWebMethods.aspx/dialtoclidext?clid=0542580009&ext=9202
    }

    /*function getUserExtension() {
        var odatautil = new OdataUtil();
        var userId = Xrm.Page.context.getUserId();

        var user = odatautil.RetrieveData("SystemUserSet", userId, "el_n_extension", null, null, null, false);
        if (user && user.el_n_extension) {
            return user.el_n_extension;
        }
        return null;
    }*/

    el_phonecall.getUserExtension = function () {
        var userId = Common.GetcurrentUserId();

        Common.RetrieveRecord("systemuser", userId, "?$select=el_n_extension").then(
            function success(result) {
                if (result && result.el_n_extension) {
                    return result.el_n_extension;
                }
                return null;
            },
            function error(error) {
                console.log(error.message);
            }
        )
    }

    /*function getAccountPhone() {
        var odatautil = new OdataUtil();

        var incidentId = Xrm.Page.getAttribute("regardingobjectid").getValue()[0].id;
        var url = "IncidentSet?$select=incident_customer_accounts/Telephone1&$expand=incident_customer_accounts&$filter=IncidentId eq guid'" + incidentId + "'";
        var account = odatautil.RetrieveDataByUrl("", url, null, null, true);
        if (account && account.results && account.results[0] && account.results[0].incident_customer_accounts && account.results[0].incident_customer_accounts.Telephone1) {
            return account.results[0].incident_customer_accounts.Telephone1;
        }
        return null;
    }*/

    el_phonecall.getAccountPhone = function () {
        var incidentId = Common.GetLookupId("regardingobjectid");
        var query = "?$expand=incident_customer_accounts($select=telephone1)";

        Common.RetrieveRecord("incident", incidentId, query).then(
            function success(result) {
                if (result && result.incident_customer_account && result.incident_customer_account.telephone1) {
                    return result.incident_customer_account.telephone1;
                }
                return null;
            },
            function error(error) {
                console.log(error.message);
            }
        )
    }

    /*function getGlobalParameter(name) {
        var OdataUtilObj = new OdataUtil();
        var filter = OdataUtilObj.formatODataFilterParameter("el_name", name, "string");
        var parameter = OdataUtilObj.RetrieveData("el_general_system_parameterSet", null, "el_s_value", filter, null, false);
        if (parameter != null && parameter.results != null && parameter.results.length == 1) {
            return parameter.results[0].el_s_value;
        }
        return null;
    }*/

    el_phonecall.getGlobalParameter = function () {
        Common.RetrieveMultipleRecords("el_general_system_parameterSet", "?$select=el_s_value").then(
            function success(result) {
                if (result && result.length == 1) {
                    return result[0].el_s_value;
                }
                return null;
            },
            function error(error) {
                console.log(error.message);
            }
        )
    }

    /*function savePhonecallWithoutDirt() {
        try {
            if (Xrm.Page.ui.getFormType() != FORMSTATE_CREATE) {
                Xrm.Page.data.setFormDirty(false);
                Xrm.Utility.openEntityForm("phonecall", Xrm.Page.data.entity.getId());
            }
        } catch (e) {

        }
    }*/

    el_phonecall.savePhonecallWithoutDirt = function () {
        if (Common.GetFormType() != FORMSTATE_CREATE) {
            Xrm.Page.data.setFormDirty(false); //tbd
            entityFormOptions = [];
            entityFormOptions["entityName"] = "phonecall";
            entityFormOptions["entityId"] = Common.GetCurrentEntityId();
            Common.OpenEntityForm(entityFormOptions);
        }
    }

    //------------------------------------------------------------------------

    /*function getCarPurchaseAccount() {
        var accountLookup = null;
        var odatautil = new OdataUtil();
        var carPurchase;
        if (Xrm.Page.getAttribute("regardingobjectid"))
            carPurchase = Xrm.Page.getAttribute("regardingobjectid").getValue();
        if (carPurchase) {
            var carPurchaseId = carPurchase[0].id;
            var url = "el_car_purchaseSet?$select=el_account_el_car_purchase/AccountId,el_account_el_car_purchase/Name&$expand=el_account_el_car_purchase&$filter=el_car_purchaseId eq guid'" + carPurchaseId + "'";
            var account = odatautil.RetrieveDataByUrl("", url, null, null, true);
            if (account && account.results && account.results[0] && account.results[0].el_account_el_car_purchase) {
                var id = account.results[0].el_account_el_car_purchase.AccountId;
                var name = account.results[0].el_account_el_car_purchase.Name;
                accountLookup = getLookupField(id, name, "account");
            }
        }
        return accountLookup;
    }*/

    el_phonecall.getCarPurchaseAccount = function () {
        var accountLookup = null;
        var carPurchaseId = Common.GetLookupId("regardingobjectid");
        if (carPurchaseId) {
            var query = "?$expand=el_account_el_car_purchase($select=accountid,name)";

            Common.RetrieveRecord("el_car_purchase", carPurchaseId, query).then(
                function success(result) {
                    if (result && result.el_account_el_car_purchase) {
                        var id = result.el_account_el_car_purchase.AccountId;
                        var name = result.el_account_el_car_purchase.Name;
                        accountLookup[0].id = id;
                        accountLookup[0].name = name;
                        accountLookup[0].entityType = "account";
                        return accountLookup;
                    }
                    return null;
                },
                function error(error) {
                    console.log(error.message);
                }
            )
        }
    }

    el_phonecall.showTabsByRegardingObjectID = function () {
        var regardingObjectID = Common.GetFieldValue("regardingobjectid");
        if (regardingObjectID && regardingObjectID[0]) {
            if (regardingObjectID[0].entityType == "incident") {
                Common.SetTabVisibility("phonecall_service", true);
                Common.SetTabVisibility("phonecall", false);
                Common.SetRequiredLevel("scheduledend", "none");
            }
            else if (regardingObjectID[0].entityType == "lead" && Common.GetFieldValue("el_b_callcenter_treat")) {
                Common.SetTabVisibility("phonecall_service", false);
                Common.SetTabVisibility("phonecall", false);
                Common.SetTabVisibility("callcenter_tab", true);
                Common.SetRequiredLevel("el_l_lead_status", "required");
            }
            else if (regardingObjectID[0].entityType == "el_company_rep") {
                Common.SetTabVisibility("phonecall_service", false);
                Common.SetTabVisibility("phonecall", true);
                Common.SetTabVisibility("callcenter_tab", false);
                Common.SetVisible("el_l_company_rep_response", true);
                Common.SetVisible("el_l_customer_response", false);
                Common.SetVisible("el_id_account", false);
                Common.SetVisible("el_id_company_rep", true);
                Common.SetVisible("el_id_family", true);
                Common.SetVisible("el_id_model", true);
                Common.SetVisible("regardingobjectid", false);
            }
            else {
                Common.SetTabVisibility("phonecall_service", false);
                Common.SetTabVisibility("phonecall", true);
                Common.SetTabVisibility("callcenter_tab", false);
            }
        } else {
            Common.SetTabVisibility("phonecall_service", true);
            Common.SetTabVisibility("phonecall", true);
            Common.SetTabVisibility("callcenter_tab", true);
        }
    }

    el_phonecall.SLATypeOnChange = function () {
        var sla_type = Common.GetFieldValue("el_id_sla_type");
        if (sla_type != null)
            Common.SetFieldValue("subject", Common.GetLookupName("el_id_sla_type"));
        else
            Common.SetFieldValue("subject", null);

        if (sla_type[0].id == SLA_TYPE_VEHICLE_FLEET_WAITING_FOR_DEMO_RIDE) {
            Common.SetRequiredLevel("scheduledend", "none");
        }
        else if (sla_type[0].id != SLA_TYPE_VEHICLE_FLEET_WAITING_FOR_DEMO_RIDE) {
            Common.SetRequiredLevel("scheduledend", "required");
        }
    }

    el_phonecall.leadPhonecallOnSaveAsCompleted = function() {
        el_phonecall.phonecallSaveAsCompleted();
    }

    /*function leadIsOpen() {
        var OdataUtilObj = new OdataUtil();
        var leadId = Xrm.Page.getAttribute("regardingobjectid").getValue()[0].id;
        var select = "StateCode";
        var lead = OdataUtilObj.RetrieveData("LeadSet", leadId, select, null, null, null, true);
        if (lead && lead.StateCode) {
            return lead.StateCode.Value == 0;
        }
        return true;
    }*/

    el_phonecall.leadIsOpen = function () {
        var leadId = Common.GetLookupId("regardingobjectid");

        Common.RetrieveRecord("lead", leadId, "?$select=statecode").then(
            function success(result) {
                if (result.statecode) {
                    return result.statecode == 0;
                }
                return true;
            },
            function error(error) {
                console.log(error.message);
            }
        )
    }

    /*function leadIsTreatedByCallCenter() {
        var OdataUtilObj = new OdataUtil();
        var leadId = Xrm.Page.getAttribute("regardingobjectid").getValue()[0].id;
        var select = "el_l_callcenter_treat";
        var lead = OdataUtilObj.RetrieveData("LeadSet", leadId, select, null, null, null, true);
        if (lead && lead.el_l_callcenter_treat) {
            return lead.el_l_callcenter_treat.Value == 1;
        }
        return true;
    }*/

    el_phonecall.leadIsTreatedByCallCenter = function () {
        var leadId = Common.GetLookupId("regardingobjectid");

        Common.RetrieveRecord("lead", leadId, "?$select=el_l_callcenter_treat").then(
            function success(result) {
                if (result.el_l_callcenter_treat) {
                    return result.el_l_callcenter_treat == 1;
                }
                return true;
            },
            function error(error) {
                console.log(error.message);
            }
        )
    }

    el_phonecall.openLeadForm = function() {
        var parameters = Common.GetClientUrl() + "/main.aspx?";
        parameters += "etc=" + LEAD_TYPECODE;
        parameters += "&extraqs=";
        parameters += "&id=" + Xrm.Page.getAttribute("regardingobjectid").getValue()[0].id;
        parameters += "&newWindow=true&pagetype=entityrecord";
        Common.openUrl(parameters, "", "status=0,resizable=1,top=100, left=100,width=1000px,height=600px"); //tbd
    }

    el_phonecall.phonecallSaveAsCompleted = function() {

        try {
            var regardingobjectid = Common.GetLookupId("regardingobjectid");
            var regardingobjectType = Common.GetLookupEntityType("regardingobjectid")
            if (regardingobjectid && regardingobjectType == "incident") {
                var $v_0 = Common.GetCurrentEntityId(), $v_1 = Common.GetCurrentEntityName();
                Xrm.Page.context.saveMode = Xrm.SaveMode.saveAsCompleted; //tbd
                //Mscrm.CommandBarActions.$1($v_0, $v_1, 1, -1, true); before Spring 2013 Release
                Mscrm.CommandBarActions.setState($v_0, $v_1, 1, -1, true); //tbd

            }
            else {
                var PHONECALL_TYPE_SLA = 2;

                var slaType = Common.GetLookupId("el_id_sla_type");
                var relatedLead = Common.GetFieldValue("regardingobjectid");

                var el_l_phonecall_type = Common.GetFieldValue("el_l_phonecall_type");
                //Xrm.Page.getControl("description").blur(); deprecated in 2016
                if (el_l_phonecall_type == PHONECALL_TYPE_SLA && slaType == SLA_TYPE_FULL_PAYMENT) {
                    Common.OpenAlertDialog(unescape("%u200F%u200F") + "לא ניתן לסגור שיחה מסוג תזכורת לביצוע גמר תשלום" + unescape("%u200F"));

                    return;
                }
                if (el_l_phonecall_type == PHONECALL_TYPE_SLA && !Common.GetFieldValue("description")) {
                    Common.OpenAlertDialog(unescape("%u200F%u200F") + "נא למלא הערות סוכן לפני סגירת שיחה" + unescape("%u200F"));

                    Common.SetFocus("description");
                }
                else {
                    if (slaType == SLA_TYPE_LEAD && relatedLead && relatedLead && el_phonecall.leadIsOpen() && !el_phonecall.leadIsTreatedByCallCenter())
                        el_phonecall.openLeadForm();
                    var $v_0 = Common.GetCurrentEntityId(),
                        $v_1 = Common.GetCurrentEntityName();
                    Xrm.Page.context.saveMode = Xrm.SaveMode.saveAsCompleted; //tbd
                    Mscrm.CommandBarActions.setState($v_0, $v_1, 1, -1, true); //tbd
                }

            }
        } catch (e) {

        }
    }

    el_phonecall.savePhonecall = function(eContext) {

        var PHONECALL_TYPE_SLA = 2;
        var el_l_phonecall_type = Common.GetFieldValue("el_l_phonecall_type");
        var el_dt_original_scheduledend = Common.GetFieldValue("el_dt_original_scheduledend");
        var scheduledend = Common.GetFieldValue("scheduledend");
        //Xrm.Page.getControl("description").blur(); deprecated in 2016

        if (el_l_phonecall_type == PHONECALL_TYPE_SLA && el_dt_original_scheduledend < scheduledend && !Common.GetFieldValue("description")) {
            eContext.getEventArgs().preventDefault();
            Common.OpenAlertDialog(unescape("%u200F%u200F") + "נא למלא סיבת דחיה בשדה הערות סוכן" + unescape("%u200F"));
            Common.SetFocus("description");
        }
    }

    el_phonecall.sendAutoSMSMessage = function () {
        var id = Common.GetCurrentEntityId();

        var workflowId = 'BEA87A21-0A40-4534-B691-6B74DC8ECB85';
        el_phonecall.runWorkflow(workflowId, id);
        Common.OpenAlertDialog(unescape("%u200F%u200F") + "נשלחה הודעה ללקוח" + unescape("%u200F"));
        //window.setTimeout(Xrm.Utility.openEntityForm("el_asha_timetable_creation", id), 10000);
    }

    function showSendSMSRibbon() { //ribbon
        try {
            var slaType = Xrm.Page.getAttribute("el_id_sla_type");
            var smsSent = Xrm.Page.getAttribute("el_b_auto_sms_sent")
            if (slaType && slaType.getValue() && smsSent && !smsSent.getValue() && (slaType.getValue()[0].id == SLA_TYPE_LEAD || slaType.getValue()[0].id == SLA_TYPE_DRIVETEST_SCHEDULE))
                return true;
        }
        catch (e) { }
        return false;
    }

    el_phonecall.runWorkflow = function(workflowId, entityId) {
        var url = Common.GetClientUrl();
        var entity = entityId;
        var OrgServicePath = "/XRMServices/2011/Organization.svc/web";

        url = url + OrgServicePath;
        var request;
        request = "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
            "<s:Body>" +
            "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<request i:type=\"b:ExecuteWorkflowRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">" +
            "<a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">" +
            "<a:KeyValuePairOfstringanyType>" +
            "<c:key>EntityId</c:key>" +
            "<c:value i:type=\"d:guid\" xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + entity + "</c:value>" +
            "</a:KeyValuePairOfstringanyType>" +
            "<a:KeyValuePairOfstringanyType>" +
            "<c:key>WorkflowId</c:key>" +
            "<c:value i:type=\"d:guid\" xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + workflowId + "</c:value>" +
            "</a:KeyValuePairOfstringanyType>" +
            "</a:Parameters>" +
            "<a:RequestId i:nil=\"true\" />" +
            "<a:RequestName>ExecuteWorkflow</a:RequestName>" +
            "</request>" +
            "</Execute>" +
            "</s:Body>" +
            "</s:Envelope>";

        var req = new XMLHttpRequest(); //tbd
        req.open("POST", url, false);
        // Responses will return XML. It isn't possible to return JSON.
        req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
        req.onreadystatechange = function () { assignResponse(req); };
        req.send(request);
    }
})(window.el_phonecall = window.el_phonecall || {})




//-------------------COMMONS-------------------------------


function OdataUtil() {

    this.getODataSelect = function (setname, Id, select, filter) {
        var query = "/" + setname;
        if (Id != null)
            query = query.concat("(guid'", Id, "')");
        if (select != null)
            query = query.concat("?$select=", select);

        if (filter != null)
            query = query.concat(select != null ? "&" : "?", "$filter=", filter);

        return query;
    }

    this.getODataQuery = function (setname, odataUrl) {
        var query = "/" + setname;
        if (odataUrl)
            query = query.concat(odataUrl);
        return query;
    }

    this.formatODataFilterParameter = function (fieldname, value, type) {
        var parameter;
        switch (type) {
            case "lookup": return fieldname + "/Id eq guid'" + value + "'"; break;
            case "picklist": return fieldname + "/Value eq " + value; break;
            case "string": return fieldname + " eq '" + value + "'";
            case "guid": return fieldname + " eq guid'" + value + "'"; break;
            default: return fieldname + " eq " + value;
        }
    }

    this.RetrieveData = function (setname, Id, select, filter, successCallback, errorCallback, isAsync) {
        var oDataPath = Xrm.Page.context.prependOrgName("/XRMServices/2011/OrganizationData.svc");
        var oDataSelect = oDataPath.concat(this.getODataSelect(setname, Id, select, filter));
        var result = null;
        if (typeof ($) === 'undefined') {
            $ = parent.$;
            jQuery = parent.jQuery;
        }
        $.ajax({
            type: "GET",
            async: false,
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: oDataSelect,
            beforeSend: function (XMLHttpRequest) { XMLHttpRequest.setRequestHeader("Accept", "application/json"); },
            success: function (data, textStatus, XmlHttpRequest) {
                if (successCallback != null) {
                    successCallback(data.d, textStatus, XmlHttpRequest);
                }
                else {
                    result = data.d;
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
                //alert(errorThrown)
                if (errorCallback != null) {
                    errorCallback(data.d, textStatus, errorThrown);
                }
            }
        });
        return result;
    }

    this.getAccountData = function (accountid, successCallback, errorCallback) {
        var oDataPath = Xrm.Page.context.prependOrgName("/XRMServices/2011/OrganizationData.svc/AccountSet");
        var oDataSelect = oDataPath.concat("?$select=el_dt_date_of_birth,el_id_type_code,el_s_first_name,el_s_idnumber_text,el_s_last_name,EMailAddress1,Fax,Telephone1,Telephone2,Name,el_el_address_account/el_s_city_text, el_el_address_account/el_s_name, el_el_address_account/el_id_city,el_el_address_account/el_id_pob_city,el_el_address_account/el_id_street,el_el_address_account/el_id_street_synonym,el_el_address_account/el_s_street_text, el_el_address_account/el_n_house_number,el_el_address_account/el_n_old_zip,el_el_address_account/el_n_zip,el_el_address_account/el_n_pob_zip,el_el_address_account/el_s_entrance,el_el_address_account/el_n_pob,el_id_type_account/el_n_id_type_code&");
        oDataSelect = oDataSelect.concat("$expand=el_el_address_account,el_id_type_account&");
        oDataSelect = oDataSelect.concat("$filter=AccountId eq guid'", accountid, "'");
        var result = null;
        if (typeof ($) === 'undefined') {
            $ = parent.$;
            jQuery = parent.jQuery;
        }
        $.ajax({
            type: "GET",
            async: false,
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: oDataSelect,
            beforeSend: function (XMLHttpRequest) { XMLHttpRequest.setRequestHeader("Accept", "application/json"); },
            success: function (data, textStatus, XmlHttpRequest) {
                if (successCallback != null) {
                    successCallback(data.d, textStatus, XmlHttpRequest);
                }
                else {
                    result = data.d;
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
                //alert(errorThrown)
                if (errorCallback != null) {
                    errorCallback(data.d, textStatus, errorThrown);
                }
            }
        });
        return result;
    }

    this.getOptionSet = function (entityLogicalName, attributeLogicalName, retrieveAsIfPublished) {
        var picklist = new Array();
        var ODataPath = Xrm.Page.context.prependOrgName("/XRMServices/2011/Organization.svc/web");
        var MetadataId = "00000000-0000-0000-0000-000000000000";
        var request = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/'><soapenv:Body>" +
            "<Execute xmlns='http://schemas.microsoft.com/xrm/2011/Contracts/Services' xmlns:i='http://www.w3.org/2001/XMLSchema-instance'>" +
            "<request i:type='a:RetrieveAttributeRequest' xmlns:a='http://schemas.microsoft.com/xrm/2011/Contracts'>" +
            "<a:Parameters xmlns:b='http://schemas.datacontract.org/2004/07/System.Collections.Generic'>" +
            "<a:KeyValuePairOfstringanyType>" +
            "<b:key>EntityLogicalName</b:key>" +
            "<b:value i:type='c:string' xmlns:c='http://www.w3.org/2001/XMLSchema'>" + entityLogicalName + '</b:value>' +
            "</a:KeyValuePairOfstringanyType>" +
            "<a:KeyValuePairOfstringanyType>" +
            "<b:key>MetadataId</b:key>" +
            "<b:value i:type='ser:guid'  xmlns:ser='http://schemas.microsoft.com/2003/10/Serialization/'>" + MetadataId + "</b:value>" +
            "</a:KeyValuePairOfstringanyType>" +
            "<a:KeyValuePairOfstringanyType>" +
            "<b:key>RetrieveAsIfPublished</b:key>" +
            "<b:value i:type='c:boolean' xmlns:c='http://www.w3.org/2001/XMLSchema'>" + retrieveAsIfPublished + "</b:value>" +
            "</a:KeyValuePairOfstringanyType>" +
            "<a:KeyValuePairOfstringanyType>" +
            "<b:key>LogicalName</b:key>" +
            "<b:value i:type='c:string'   xmlns:c='http://www.w3.org/2001/XMLSchema'>" + attributeLogicalName + "</b:value>" +
            "</a:KeyValuePairOfstringanyType>" +
            "</a:Parameters>" +
            "<a:RequestId i:nil='true' /><a:RequestName>RetrieveAttribute</a:RequestName></request>" +
            "</Execute>" +
            "</soapenv:Body></soapenv:Envelope>";

        var req = new XMLHttpRequest();
        req.open("POST", ODataPath, false);
        req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
        req.send(request);

        if (req.responseXML != null) {
            var attributeData = req.responseXML.selectSingleNode("//b:value");
            if (attributeData != null) {
                var attributeType = attributeData.selectSingleNode("c:AttributeType").text;
                switch (attributeType) {
                    case "Picklist":
                        if (attributeData != null) {
                            var options = attributeData.selectSingleNode("c:OptionSet//c:Options");
                            for (var i = 0; i < options.childNodes.length; i++) {
                                picklist[options.childNodes[i].selectSingleNode("c:Value").text] = options.childNodes[i].selectSingleNode("c:Label").selectSingleNode("a:UserLocalizedLabel").selectSingleNode("a:Label").text;
                            }
                        }
                        return picklist;
                        break;

                    default: break;
                }
            }
        }
    }

    this.RetrieveDataByUrl = function (setname, odataUrl, successCallback, errorCallback, isAsync) {
        var oDataPath = Xrm.Page.context.prependOrgName("/XRMServices/2011/OrganizationData.svc");
        var oDataSelect = oDataPath.concat(this.getODataQuery(setname, odataUrl));
        var result = null;
        if (typeof ($) === 'undefined') {
            $ = parent.$;
            jQuery = parent.jQuery;
        }
        $.ajax({
            type: "GET",
            async: false,
            contentType: "application/json; charset=utf-8",
            datatype: "json",
            url: oDataSelect,
            beforeSend: function (XMLHttpRequest) { XMLHttpRequest.setRequestHeader("Accept", "application/json"); },
            success: function (data, textStatus, XmlHttpRequest) {
                if (successCallback != null) {
                    successCallback(data.d, textStatus, XmlHttpRequest);
                }
                else {
                    result = data.d;
                }
            },
            error: function (XmlHttpRequest, textStatus, errorThrown) {
                //alert(errorThrown)
                if (errorCallback != null) {
                    errorCallback(data.d, textStatus, errorThrown);
                }
            }
        });
        return result;

    }
}

function getLookupField(id, name, type) {

    var lookupField = new Array();
    lookupField[0] = new Object();
    lookupField[0].id = id;
    lookupField[0].name = name;
    lookupField[0].entityType = type;
    return lookupField;

}

function getSalesProcessAccount() {
    var accountLookup = null;
    var odatautil = new OdataUtil();
    var opportunity;
    if (Xrm.Page.getAttribute("regardingobjectid"))
        opportunity = Xrm.Page.getAttribute("regardingobjectid").getValue();
    if (Xrm.Page.getAttribute("el_id_opportunity"))
        opportunity = Xrm.Page.getAttribute("el_id_opportunity").getValue();
    if (opportunity) {
        var opportunityId = opportunity[0].id;
        var url = "OpportunitySet?$select=opportunity_customer_accounts/AccountId,opportunity_customer_accounts/Name&$expand=opportunity_customer_accounts&$filter=OpportunityId eq guid'" + opportunityId + "'";
        var account = odatautil.RetrieveDataByUrl("", url, null, null, true);
        if (account && account.results && account.results[0] && account.results[0].opportunity_customer_accounts) {
            var id = account.results[0].opportunity_customer_accounts.AccountId;
            var name = account.results[0].opportunity_customer_accounts.Name;
            accountLookup = getLookupField(id, name, "account");
        }
    }
    return accountLookup;
}
