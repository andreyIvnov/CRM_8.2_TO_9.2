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
        try {
            debugger;
            Common = new elad_commons();
            Common.SetFormContext(executionContext.getFormContext());

            el_phonecall.showTabsByRegardingObjectID();
            el_phonecall.phonecallAssignEventActions();
            el_phonecall.ShowAnnotationAndFieldLock();
            el_phonecall.hiddenFieldFromLead();
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
        }
        catch (e) {
            Common.PageErrorHandler(e, "el_phonecall.onLoad");
        }
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

    el_phonecall.phonecallAssignEventActions = function () {
        Common.AddOnChange("el_id_sla_type", el_phonecall.SLATypeOnChange);
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

    //------------------------------------------------------------------------

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
        parameters += "&id=" + Common.GetLookupId("regardingobjectid");
        parameters += "&newWindow=true&pagetype=entityrecord";
        Common.openUrl(parameters, "", "status=0,resizable=1,top=100, left=100,width=1000px,height=600px"); //tbd
    }

    el_phonecall.phonecallSaveAsCompleted = function() {

        try {
            var regardingobjectid = Common.GetLookupId("regardingobjectid");
            var regardingobjectType = Common.GetLookupEntityType("regardingobjectid")
            if (regardingobjectid && regardingobjectType == "incident") {
                XrmCore.Commands.Common.setState(Common.GetCurrentEntityId(), Common.GetCurrentEntityName(), 1, -1, true);
            }
            else {
                var PHONECALL_TYPE_SLA = 2;

                var slaType = Common.GetLookupId("el_id_sla_type");
                var relatedLead = Common.GetFieldValue("regardingobjectid");

                var el_l_phonecall_type = Common.GetFieldValue("el_l_phonecall_type");
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
                    XrmCore.Commands.Common.setState(Common.GetCurrentEntityId(), Common.GetCurrentEntityName(), 1, -1, true);
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

    el_phonecall.runWorkflow = function (workflowId, entityId) {
        return new Promise((resolve, reject) => {
            Common.PageClearMessages("el_phonecall.runWorkflow")
            Common.ExecuteWorkflow(workflowId, entityId)
                .then(
                    resolve,
                    err => {
                        reject(err);
                    }
                );
        });
    }

    el_phonecall.Ribbon = el_phonecall.Ribbon || {};

    el_phonecall.Ribbon.CloseFormWithTestDriveNotScheduled = function(primaryControl) {
        try {
            debugger;
            if (!Common) {
                Common = new elad_commons();
                Common.SetFormContext(primaryControl);
            }
            Common.PageClearMessages("CloseFormWithTestDriveNotScheduledError");
            Common.SetFieldValue("el_b_appointment_not_scheduled", true);
            Common.Save().then(el_phonecall.CheckIffieldIsDirty, null);
        } catch (e) {
            console.error("Error on el_phonecall.Ribbon.CloseFormWithTestDriveNotScheduled(): ", e);
            Common.SetFormNotification("Error on el_phonecall.Ribbon.CloseFormWithTestDriveNotScheduled(): " + e.message, "ERROR", "CloseFormWithTestDriveNotScheduledError");
        }
    }

    el_phonecall.Ribbon.overrideSaveAndClose = function (primaryControl) {
        try {
            debugger;
            if (!Common) {
                Common = new elad_commons();
                Common.SetFormContext(primaryControl);
            }
            Common.PageClearMessages("OverrideSaveAndCloseError");
            
            if (callPageOpendFromIncident) {
                Common.SaveCommand(primaryControl).then(el_phonecall.closeForm, null);
            }
        } catch (e) {
            console.error("Error on el_phonecall.Ribbon.overrideSaveAndClose(): ", e);
            Common.SetFormNotification("Error on el_phonecall.Ribbon.overrideSaveAndClose(): " + e.message, "ERROR", "OverrideSaveAndCloseError");
        }
    }

    el_phonecall.Ribbon.sendAutoSMSMessage = function (primaryControl) {
        try {
            if (!Common) {
                Common = new elad_commons();
                Common.SetFormContext(primaryControl);
            }
            Common.PageClearMessages("SendAutoSMSMessageError");

            let id = Common.GetCurrentEntityId();
            let workflowId = 'BEA87A21-0A40-4534-B691-6B74DC8ECB85';
            el_phonecall.runWorkflow(workflowId, id).then(
                success => Common.OpenAlertDialog(unescape("%u200F%u200F") + "נשלחה הודעה ללקוח" + unescape("%u200F")),
                err => Common.SetFormNotification("Error by executing workflow in el_phonecall.runWorkflow(): " + err.message, Common.FormNotificationLevel.ERROR, "el_phonecall.runWorkflow")
            );
        } catch (e) {
            console.error("Error on el_phonecall.Ribbon.sendAutoSMSMessage(): ", e);
            Common.SetFormNotification("Error on el_phonecall.Ribbon.sendAutoSMSMessage(): " + e.message, "ERROR", "SendAutoSMSMessageError");
        }
    }

    el_phonecall.Ribbon.leadPhonecallOnSaveAsCompleted = function(primaryControl) {
        if (!Common) {
            Common = new elad_commons();
            Common.SetFormContext(primaryControl);
        }

        el_phonecall.phonecallSaveAsCompleted();
    }


    el_phonecall.Ribbon.EnableRules = el_phonecall.Ribbon.EnableRules || {};
    
    el_phonecall.Ribbon.EnableRules.HideSaveButtons = function(primaryControl) {
        try {
            if (!Common) {
                Common = new elad_commons();
                Common.SetFormContext(primaryControl);
            }

            if (Common.GetOpenerEntityInfo() && Common.GetOpenerEntityInfo().openerType == "incident" && Common.GetFormType() == FORMSTATE_CREATE) {
                callPageOpendFromIncident = true;
                return false;
            }
        }
        catch (e) {
            console.error("Error on el_phonecall.Ribbon.EnableRules.HideSaveButtons(): ", e);
        }
        return true; 
    };

    el_phonecall.Ribbon.EnableRules.ShowCloseFormWithTestDriveNotScheduledButton = function(primaryControl) {
        try {
            if (!Common) {
                Common = new elad_commons();
                Common.SetFormContext(primaryControl);
            }
            
            const sla_type_id = Common.GetLookupId("el_id_sla_type");
            if (sla_type_id && sla_type_id === SLA_TYPE_DRIVETEST_SCHEDULE)
                return true;
        }
        catch (e) {
            console.error("Error on el_phonecall.Ribbon.EnableRules.ShowCloseFormWithTestDriveNotScheduledButton(): ", e);
        }
        return false;
    };

    el_phonecall.Ribbon.EnableRules.ShowCustomSaveAndCloseButtons = function(primaryControl) {
        try {
            if (!Common) {
                Common = new elad_commons();
                Common.SetFormContext(primaryControl);
            }

            if (Common.GetOpenerEntityInfo() && Common.GetOpenerEntityInfo().openerType == "incident" && Common.GetFormType() == FORMSTATE_CREATE) {
                callPageOpendFromIncident = true;
                return true;
            }
        }
        catch (e) {
            console.error("Error on el_phonecall.Ribbon.EnableRules.ShowCustomSaveAndCloseButtons(): ", e);
        }
        return false;
    };

    el_phonecall.Ribbon.EnableRules.showSendSMSRibbon = function(primaryControl) {
        try {
            if (!Common) {
                Common = new elad_commons();
                Common.SetFormContext(primaryControl);
            }
            const slaTypeId = Common.GetLookupId("el_id_sla_type");
            const smsSentId = Common.GetLookupId("el_b_auto_sms_sent");
            
            if (slaTypeId && !smsSentId && (slaTypeId == SLA_TYPE_LEAD || slaTypeId == SLA_TYPE_DRIVETEST_SCHEDULE))
                return true;
        }
        catch (e) {
            console.error("Error on el_phonecall.Ribbon.EnableRules.showSendSMSRibbon(): ", e);
        }
        return false;
    };


})(window.el_phonecall = window.el_phonecall || {})