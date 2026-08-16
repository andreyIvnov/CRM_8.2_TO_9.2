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
} //tbd