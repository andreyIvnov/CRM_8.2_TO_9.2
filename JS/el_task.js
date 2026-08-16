(function (el_task) {
    

    var HANDLER_TYPE_SERVICE_CENTER = 1;
    var HANDLER_TYPE_AUTHORIZED_CONTRACTOR = 2;
    var AUTO_ASSIGN_TEAM_TEXT = "צוות קבוע.";
    var AUTO_ASSIGN_USER_TEXT = "משתמש קבוע.";
    var AUTO_ASSIGN_INCIDENT_OWNER_TEXT = "בעלים של הפניה.";
    var AUTO_ASSIGN_NOTIFICATION = "שים לב: בשמירת הרשומה היא תוקצה אוטומטית ל";
    var AUTO_ASSIGN_TEAM = 1;
    var AUTO_ASSIGN_USER = 2;
    var AUTO_ASSIGN_INCIDENT_OWNER = 3;
    var FORMSTATE_CREATE = 1;

    var Common;

    el_task.task_onLoad = function (executionContext) {

        try {
            debugger;

            Common = new elad_commons();
            Common.SetFormContext(executionContext.getFormContext());

            el_task.taskAssignEventActions();
            el_task.showServicePointContractor();
            el_task.showMigrationTab();

            if (Common.GetFormType() == FORMSTATE_CREATE) {
                el_task.setDueDateAndPriorityFromIncident();
                if (Common.GetAttribute("el_id_handler_type"))
                    Common.SetRequiredLevel("el_id_handler_type", "required");
            }
            else {
                el_task.showEmailLink();
            }
        } catch (e) {

            Common.PageErrorHandler(e, "el_task.task_onLoad");
        }
    }


    el_task.showEmailLink = function() {
        if (Common.GetFieldValue("el_s_email_link"))
            Common.SetVisible("el_s_email_link", true);
        else
            Common.SetVisible("el_s_email_link", false);
    }

    el_task.showMigrationTab = function () {
        if (Common.GetFieldValue("el_s_convert_created_by")) {
            //Xrm.Page.ui.tabs.get("migration_tab").setDisplayState('expanded');
            Common.SetTabVisibility("migration_tab", true);
        } else {
            //Xrm.Page.ui.tabs.get("migration_tab").setDisplayState('collapsed');
            Common.SetTabVisibility("migration_tab", false);
        }
    }

    el_task.taskAssignEventActions = function () {
        Common.AddOnChange("el_id_handler_type", el_task.showServicePointContractor);
        Common.AddOnChange("el_l_assign_to", el_task.setAssignAutoNotification);
    }

    el_task.updateRecordUrlField = function () {
        if (Common.GetAttribute("el_s_record_url")) {
            var orgURL = Common.GetClientUrl();
            var recordId = Common.GetCurrentEntityId().replace("{", "").replace("}", "");
            var entityName = Common.GetCurrentEntityName();

            var objectTypeCode = 4212;

            var recordURL = orgURL + "/main.aspx?etc=" + objectTypeCode +
                "&id=%7b" + recordId + "%7d&pagetype=entityrecord";
            Common.SetFieldValue("el_s_record_url", recordURL);
        }
    }

    //Task 888
    /*el_task.showServicePointContractor = function () {
        var handler_type = Common.GetFieldValue("el_id_handler_type");
        if (handler_type && handler_type[0] && handler_type[0].id) {
            var url = "el_handlertypeSet?$select=el_n_handler_code&$filter=el_handlertypeId eq guid'" + handler_type[0].id + "'";
            var odatautil = new OdataUtil(); //tbd
            var result = odatautil.RetrieveDataByUrl("", url, null, null, true);
            if (result && result.results && result.results[0] && result.results[0].el_n_handler_code) {
                var handlerCode = result.results[0].el_n_handler_code;
                if (handlerCode == HANDLER_TYPE_SERVICE_CENTER) {
                    Common.SetVisible("el_id_service_point", true);
                    Common.SetRequiredLevel("el_id_service_point", "required");
                    el_task.hideSetNullField("el_id_contractor");
                } else if (handlerCode == HANDLER_TYPE_AUTHORIZED_CONTRACTOR) {
                    Common.SetVisible("el_id_contractor", true);
                    Common.SetRequiredLevel("el_id_contractor", "required");
                    el_task.hideSetNullField("el_id_service_point");
                } else {
                    el_task.hideSetNullField("el_id_service_point");
                    el_task.hideSetNullField("el_id_contractor");
                }
            }
        }
    }*/

    el_task.showServicePointContractor = function () {
        var handler_type_id = Common.GetLookupId("el_id_handler_type");
        var handler_type_entityType = Common.GetLookupEntityType("el_id_handler_type");
        if (handler_type_id && handler_type_entityType) {
            Common.RetrieveRecord(handler_type_entityType, handler_type_id, "?$select=el_n_handler_code").then(
                function success(result) {
                    if (result && result.el_n_handler_code) {
                        var handler_code = result.el_n_handler_code;

                        if (handler_code == HANDLER_TYPE_SERVICE_CENTER) {
                            Common.SetVisible("el_id_service_point", true);
                            Common.SetRequiredLevel("el_id_service_point", "required");
                            el_task.hideSetNullField("el_id_contractor");
                        }
                        else if (handlerCode == HANDLER_TYPE_AUTHORIZED_CONTRACTOR) {
                            Common.SetVisible("el_id_contractor", true);
                            Common.SetRequiredLevel("el_id_contractor", "required");
                            el_task.hideSetNullField("el_id_service_point");
                        }
                        else {
                            el_task.hideSetNullField("el_id_service_point");
                            el_task.hideSetNullField("el_id_contractor");
                        }
                    }
                },
                function error(error) {
                    console.log(error.message);
                }
            )
        }
    }

    //Task 888
    el_task.hideSetNullField = function(fieldName) {
        Common.SetVisible(fieldName, false);
        Common.SetRequiredLevel(fieldName, "none");
        Common.SetFieldValue(fieldName, null);
    }

    //Task 889
    el_task.setAssignAutoNotification = function () {
        var assign_to = Common.GetFieldValue("el_l_assign_to");
        var message = AUTO_ASSIGN_NOTIFICATION + ": ";
        switch (assign_to) {
            case AUTO_ASSIGN_TEAM:
                message += AUTO_ASSIGN_TEAM_TEXT;
                break;
            case AUTO_ASSIGN_USER:
                message += AUTO_ASSIGN_USER_TEXT;
                break;
            case AUTO_ASSIGN_INCIDENT_OWNER:
                message += AUTO_ASSIGN_INCIDENT_OWNER_TEXT;
                break;
            default:
                Common.PageClearMessages('TaskAssignNotification');
                return;
        }
        Common.SetFormNotification(unescape("%u200F%u200F") + message + unescape("%u200F"), 'INFORMATION', 'TaskAssignNotification');
    }


    /*el_task.setDueDateAndPriorityFromIncident = function () {
        var regardingobjectid = Common.GetFieldValue("regardingobjectid");
        if ((regardingobjectid && regardingobjectid[0].entityType == "incident")) {
            var odatautil = new OdataUtil(); //tbd
            var incidentId = Xrm.Page.getAttribute("regardingobjectid");
            var url = "IncidentSet?$select=el_dt_resolve_by_for_edit,PriorityCode&$filter=IncidentId eq guid'" + incidentId.getValue()[0].id + "'";
            var result = odatautil.RetrieveDataByUrl("", url, null, null, true);
            if (result && result.results && result.results[0]) {
                if (result.results[0].el_dt_resolve_by_for_edit) {
                    var stringDateValue = eval(result.results[0].el_dt_resolve_by_for_edit).toString();
                    var scheduledend = new Date(parseInt(stringDateValue.replace("/Date(", "").replace(")/", ""), 10));

                    scheduledend = el_task.getODataLocalDateFilter(scheduledend);
                    Common.SetFieldValue("scheduledend", scheduledend);
                    Common.SetSubmitMode("scheduledend", "always");
                }
                if (result.results[0].PriorityCode) {
                    Common.SetFieldValue("prioritycode", result.results[0].PriorityCode.Value - 1);
                }
            }
        }
    }*/

    el_task.setDueDateAndPriorityFromIncident = function () {
        var regardingObjectId = Common.GetLookupId("regardingobjectid");
        var regardingObjectType = Common.GetLookupEntityType("regardingobjectid");

        if (regardingObjectId && regardingObjectType && regardingObjectType == "incident") {
            Common.RetrieveRecord(regardingObjectType, regardingObjectId, "?$select=el_dt_resolve_by_for_edit,PriorityCode&$filter=IncidentId eq guid").then(
                function success(result) {
                    if (result && result.el_dt_resolve_by_for_edit) {
                        var stringDateValue = eval(result.el_dt_resolve_by_for_edit).toString();
                        var scheduledend = new Date(parseInt(stringDateValue.replace("/Date(", "").replace(")/", ""), 10));

                        scheduledend = el_task.getODataLocalDateFilter(scheduledend);
                        Common.SetFieldValue("scheduledend", scheduledend);
                        Common.SetSubmitMode("scheduledend", "always");
                    }
                    if (result.PriorityCode) {
                        Common.SetFieldValue("prioritycode", result.results[0].PriorityCode.Value - 1);
                    }
                },
                function error(error) {
                    console.log(error.message);
                }
            )
        }
    }

    el_task.getODataLocalDateFilter = function(date) {
        //-- Description: For converting the date object to local time format  
        //-- You can also convert this to UTC Date format   
        //-- UTC Usage: getUTCMonth(), getUTCFullYear(), getUTCHours() ...  

        var monthString;
        var rawMonth = date.getMonth().toString();
        if (rawMonth.length == 1) {
            monthString = "0" + rawMonth;
        }
        else { monthString = rawMonth; }

        var dateString;
        var rawDate = date.getUTCDate().toString();
        if (rawDate.length == 1) {
            dateString = "0" + rawDate;
        }
        else { dateString = rawDate; }


        return new Date(date.getFullYear(), monthString, dateString, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
    }
})(window.el_task = window.el_task || {})