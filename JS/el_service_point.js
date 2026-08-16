(function (el_service_point) {

    //---------------consts------------------
    var CLICK_TO_DIAL_URL = "IVR_CLICK_TO_DIAL_URL";
    var Common;

    el_service_point.servicePoint_OnLoad = function (executionContext) {
        debugger;
        Common = new elad_commons();
        Common.SetFormContext(executionContext.getFormContext());
    }

    el_service_point.dialServicePoint = function() {

        var phoneNumber = Common.GetFieldValue("el_s_phone");

        if (phoneNumber != null) {

            var extension = el_service_point.getUserExtension();

            if (!extension) {
                Common.OpenAlertDialog('לא קיימת שלוחה למשתמש. פנה למנהל מערכת');
                return;
            }

            var url = el_service_point.getGlobalParameter(CLICK_TO_DIAL_URL);
            url += "clid=" + phoneNumber + "&ext=" + extension;
            //representativeHasExtension = true;

            /*var win = top.window.open(url, "Aspire"); //tbd
            win.focus();*/
            Common.openUrl(url);

            setTimeout(win.close(), 2000);
        }

        else {
            Common.OpenAlertDialog('למרכז שירות זה אין מספר טלפון ראשי, לא ניתן לחייג');
        }
    }

    /*el_service_point.getGlobalParameter = function(name) {
        var OdataUtilObj = new OdataUtil();
        var filter = OdataUtilObj.formatODataFilterParameter("el_name", name, "string");
        var parameter = OdataUtilObj.RetrieveData("el_general_system_parameterSet", null, "el_s_value", filter, null, false);
        if (parameter != null && parameter.results != null && parameter.results.length == 1) {
            return parameter.results[0].el_s_value;
        }
        return null;
    }*/

    el_service_point.getGlobalParameter = function (name) {
        var filter = el_service_point.formatODataFilterParameter("el_name", name, "string");
        var query = "?$select=el_s_value&$" + filter;
        var parameter = null;
        Common.RetrieveMultipleRecords("el_general_system_parameterSet", query).then(
            function success(result) {
                if (result && result.length == 1) {
                    parameter = result[0].el_s_value
                }
            },
            function error(error) {
                console.log(error.message);
            }
        )
        return parameter;
    }

    el_service_point.formatODataFilterParameter = function (fieldname, value, type) {
        var parameter;
        switch (type) {
            case "lookup": return fieldname + "/Id eq guid'" + value + "'"; break;
            case "picklist": return fieldname + "/Value eq " + value; break;
            case "string": return fieldname + " eq '" + value + "'";
            case "guid": return fieldname + " eq guid'" + value + "'"; break;
            default: return fieldname + " eq " + value;
        }
    }

    /*el_service_point.getUserExtension = function() {
        var odatautil = new OdataUtil();
        var userId = Common.GetCurrentUserId();

        var user = odatautil.RetrieveData("SystemUserSet", userId, "el_n_extension", null, null, null, false);
        if (user && user.el_n_extension) {
            return user.el_n_extension;
        }
        return null;
    }*/

    el_service_point.getUserExtension = function () {
        var userId = Common.GetCurrentUserId();

        Common.RetrieveRecord("systemuser", userId, "?$select=el_n_extension").then(
            function success(result) {
                if (result && result.el_n_extension) {
                    return result.el_n_extension;
                }
                return null;
            },
            function error(error) {
                console.log(error.message)
            }
        )
    }


    el_service_point.openSmsForm = function() {
        debugger;

        var entityFormOptions = {
            entityName: "el_sms",
            openInNewWindow: true
        }

        var formParameters = {
            el_id_service_point: Common.GetCurrentEntityId().replace(/[{}]/g, ""),
            el_id_service_pointname: Common.GetFieldValue("el_name"),
            subject: "SMS עם פרטי מרכז שירות"
        };

        Common.OpenEntityForm(entityFormOptions, formParameters);
        /*var extRaqs = "";
        var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes";

        extRaqs += "&el_id_service_point=" + Common.GetcurrentEntityId();
        extRaqs += "&el_id_service_pointname=" + Common.GetFieldValue("el_name");
        extRaqs += "&subject=" + 'SMS עם פרטי מרכז שירות';
        window.open(Xrm.Page.context.prependOrgName("/main.aspx?etn=el_sms&pagetype=entityrecord&extraqs=" + encodeURIComponent(extRaqs)), "_blank", features, false); //tbd*/
    }
})(window.el_service_point = window.el_service_point || {})


//---------------commons----------------- tbd
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

function el_common() {


    this.fillShowRoom = function () {
        if (Xrm && Xrm.Page && Xrm.Page.ui && Xrm.Page.ui.getFormType() == 1)//create form only
        {
            var currShowRoomLookupValue = null;
            var OdataUtilObj = new OdataUtil();
            if (Xrm.Page.getAttribute("el_id_showroom")) {
                currShowRoomLookupValue = COmmon.GetFieldValue("el_id_showroom");
                var user = OdataUtilObj.RetrieveData("SystemUserSet", Xrm.Page.context.getUserId(), "BusinessUnitId", null, null, null, false);
                if (user != null && user.BusinessUnitId != null) {
                    var showroom = OdataUtilObj.RetrieveDataByUrl("BusinessUnitSet", "?$select=el_el_showroom_businessunit/el_b_mixed_showroom,el_el_showroom_businessunit/el_name,el_el_showroom_businessunit/el_showroomId&$expand=el_el_showroom_businessunit&$filter=BusinessUnitId eq guid'" + user.BusinessUnitId.Id + "'", null, null, false);
                    if (showroom != null && showroom.results != null && showroom.results[0] && showroom.results[0].el_el_showroom_businessunit && showroom.results[0].el_el_showroom_businessunit.el_name) {
                        var lookupValue = new Array();
                        lookupValue[0] = new Object();
                        lookupValue[0].id = showroom.results[0].el_el_showroom_businessunit.el_showroomId;
                        lookupValue[0].name = showroom.results[0].el_el_showroom_businessunit.el_name;
                        lookupValue[0].entityType = "el_showroom";
                        lookupValue[0].type = SHOWROOM_TYPECODE;
                        if (currShowRoomLookupValue) {
                            var newValue = new RegExp(lookupValue[0].id, "i");
                            if (!newValue.test(currShowRoomLookupValue[0].id)) {
                                Xrm.Page.getAttribute("el_id_showroom").setValue(lookupValue);
                                Xrm.Page.getAttribute("el_id_showroom").fireOnChange();
                            }
                        }
                        else {
                            Xrm.Page.getAttribute("el_id_showroom").setValue(lookupValue);
                            Xrm.Page.getAttribute("el_id_showroom").fireOnChange();
                        }

                        if (Xrm.Page.getAttribute("el_b_mixed_showroom")) {
                            if (showroom.results[0].el_el_showroom_businessunit.el_b_mixed_showroom) {
                                Xrm.Page.getAttribute("el_b_mixed_showroom").setValue(showroom.results[0].el_el_showroom_businessunit.el_b_mixed_showroom);
                                if (Xrm.Page.getControl("el_id_manufacturer"))
                                    Xrm.Page.getControl("el_id_manufacturer").setVisible(true);
                            }
                            else {
                                if (Xrm.Page.getControl("el_id_manufacturer"))
                                    Xrm.Page.getControl("el_id_manufacturer").setVisible(false);
                            }
                        }
                    }
                    else {
                        alert(unescape("%u200F%u200F") + "לא משויך אולם ליחידה העסקית שלך. פנה לתמיכה." + unescape("%u200F"));
                    }

                }
            }
        }
    }

    this.fillManufacturer = function () {

        var OdataUtilObj = new OdataUtil();
        if (Xrm.Page.getAttribute("el_id_showroom").getValue() && Xrm.Page.getAttribute("el_id_showroom").getValue()[0]) {
            var showroomid = Xrm.Page.getAttribute("el_id_showroom").getValue()[0].id;
            var showroom = OdataUtilObj.RetrieveData("el_showroomSet", showroomid, "el_id_manufacturer,el_b_mixed_showroom", null);
            if (showroom != null && showroom.el_id_manufacturer != null && !showroom.el_b_mixed_showroom) {
                var lookupValue = new Array();
                //lookupValue[0] = new LookupControlItem(showroom.el_id_manufacturer.Id, EL_MANUFACTURER_TYPECODE, showroom.el_id_manufacturer.Name);
                lookupValue[0] = new Object();
                lookupValue[0].id = showroom.el_id_manufacturer.Id;
                lookupValue[0].name = showroom.el_id_manufacturer.Name;
                lookupValue[0].entityType = "el_manufacturer";
                lookupValue[0].type = EL_MANUFACTURER_TYPECODE;

                Xrm.Page.getAttribute("el_id_manufacturer").setValue(lookupValue);
                Xrm.Page.getAttribute("el_id_manufacturer").fireOnChange();

            }
        }
    }

    this.UserHasRole = function (roleName) {
        var currentUserRoles = Xrm.Page.context.getUserRoles();

        for (var i = 0; i < currentUserRoles.length; i++) {
            var userRole = currentUserRoles[i];
            var currentName = this.GetRoleName(userRole);

            if (roleName == currentName || currentName == "מנהל מערכת") {
                return true;
            }
        }
        return false;
    }

    this.GetRoleName = function (roleId) {
        var serverUrl = location.protocol + "//" + location.host + "/" + Xrm.Page.context.getOrgUniqueName();
        var odataSelect = serverUrl + "/XRMServices/2011/OrganizationData.svc" + "/" + "RoleSet?$filter=RoleId eq guid'" + roleId + "'";
        var roleName = null;
        if (typeof ($) === 'undefined') {
            $ = parent.$;
            jQuery = parent.jQuery;
        }
        $.ajax(
            {
                type: "GET",
                async: false,
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: odataSelect,
                beforeSend: function (XMLHttpRequest) { XMLHttpRequest.setRequestHeader("Accept", "application/json"); },
                success: function (data, textStatus, XmlHttpRequest) {
                    roleName = data.d.results[0].Name;
                },
                error: function (XmlHttpRequest, textStatus, errorThrown) { alert('OData Select Failed: ' + textStatus + errorThrown + odataSelect); }
            }
        );
        return roleName;
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


//---------------functions---------------

