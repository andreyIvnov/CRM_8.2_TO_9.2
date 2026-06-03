function el_common() {

    this.OdataUtil = function () {

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


    this.fillShowRoom = function () {
        var SHOWROOM_TYPECODE = 10039;
        if (Xrm.Page.ui.getFormType() == 1)//create form only
        {
            var currShowRoomLookupValue = null;
            var OdataUtilObj = new OdataUtil();
            if (Xrm.Page.getAttribute("el_id_showroom"))
                currShowRoomLookupValue = Xrm.Page.getAttribute("el_id_showroom").getValue();
            var user = OdataUtilObj.RetrieveData("SystemUserSet", Xrm.Page.context.getUserId(), "BusinessUnitId", null, null, null, false);
            if (user != null && user.BusinessUnitId != null) {
                var showroom = OdataUtilObj.RetrieveDataByUrl("BusinessUnitSet", "?$select=el_el_showroom_businessunit/el_b_mixed_showroom,el_el_showroom_businessunit/el_name,el_el_showroom_businessunit/el_showroomId&$expand=el_el_showroom_businessunit&$filter=BusinessUnitId eq guid'" + user.BusinessUnitId.Id + "'", null, null, false);
                if (showroom != null && showroom.results != null && showroom.results[0] && showroom.results[0].el_el_showroom_businessunit && showroom.results[0].el_el_showroom_businessunit.el_name) {
                    var lookupValue = new Array();
                    //lookupValue[0] = new LookupControlItem(showroom.results[0].el_el_showroom_businessunit.el_showroomId, SHOWROOM_TYPECODE, showroom.results[0].el_el_showroom_businessunit.el_name);
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
                            Xrm.Page.getControl("el_id_manufacturer").setVisible(true);
                        }
                        else {
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


    this.fillManufacturer = function () {
        var EL_MANUFACTURER_TYPECODE = 10034;
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
    this.SetLookupValue = function (fieldName, id, name, entityType, onChangeBehavior) {
        var Enums = {
            OnChangeBehavior: {
                None: 0,
                IfChanged: 1,
                Always: 2
            },
        }
        if (fieldName != null && id != null) {
            var attr = CRMCommon.GetAttribute(fieldName);
            if (attr != null) {
                var oldValue = attr.getValue();
                if (id.indexOf('{') == -1)
                    id = '{' + id;
                if (id.indexOf('}') == -1)
                    id = id + '}';
                id = id.toUpperCase();
                var lookupValue = [{
                    id: id,
                    name: name,
                    entityType: entityType
                }];
                if (!CRMCommon.CRMEquals(oldValue, lookupValue)) {
                    attr.setValue(lookupValue);
                    if (onChangeBehavior == Enums.OnChangeBehavior.IfChanged || onChangeBehavior == Enums.OnChangeBehavior.Always)
                        attr.fireOnChange();
                    return true;
                }
                else if (onChangeBehavior == Enums.OnChangeBehavior.Always) {
                    attr.fireOnChange();
                    return false;
                }
            }
        }
        return false;
    };

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

    this.getGlobalParameter = function (name) {
        var OdataUtilObj = new OdataUtil();
        var filter = OdataUtilObj.formatODataFilterParameter("el_name", name, "string");
        var parameter = OdataUtilObj.RetrieveData("el_general_system_parameterSet", null, "el_s_value", filter, null, false);
        if (parameter != null && parameter.results != null && parameter.results.length == 1) {
            return parameter.results[0].el_s_value;
        }
        return null;
    }

    this.callWebApiService = function (methodType, stringUrl, dataObject) {
        $.ajax({
            type: methodType,
            url: stringUrl,
            data: dataObject,
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                alert("Hello: " + response.Name + ".\nCurrent Date and Time: " + response.DateTime);
            },
            failure: function (response) {
                alert(response.responseText);
            },
            error: function (response) {
                alert(response.responseText);
            }
        });
    }
}

(function (CRMCommon) {

    var commons = new el_common();
    var Enums = {
        OnChangeBehavior: {
            None: 0,
            IfChanged: 1,
            Always: 2
        },
    }

    CRMCommon._formContext = CRMCommon._formContext || null;

    var SIMPLECHAT_AGENT_SYSTEM_ROLE = "SimpleChat Agent";
    var SIMPLECHAT_MANAGER_SYSTEM_ROLE = "SimpleChat Manager";

    CRMCommon.fillManufacturer = function () {
        debugger;
        commons.fillManufacturer;
    }

    CRMCommon.fillShowRoom = function () {
        debugger;
        commons.fillShowRoom;
    }
    CRMCommon.isUserHasRoleOfScAgentOrScManager = function () {
        return (commons.UserHasRole(SIMPLECHAT_AGENT_SYSTEM_ROLE) || commons.UserHasRole(SIMPLECHAT_MANAGER_SYSTEM_ROLE));
    }

    CRMCommon.CreateOutgoingWhatsappConversationByChannel = function (channelName, entityName) {
        debugger;
        var recordId = CRMCommon.GetCurrentEntityId();
        var actionName = "el_CreateOutgoingWhatsappByChannelFor" + entityName;

        var odatautil = new CRMCommon.OdataUtil();
        var url = "el_text_server_configurationSet?$select=el_text_server_configurationId,el_s_name&$filter=el_s_whatsapp_btn_name eq '" + channelName + "' and statecode/Value eq 0 and el_p_server_type/Value eq 15";
        var result = odatautil.RetrieveDataByUrl("", url, null, null, true);
        if (result && result.results && result.results.length >= 1) {
            var parameters = {
                ChannelId: {
                    el_text_server_configurationid: result.results[0].el_text_server_configurationId,
                    "@odata.type": "Microsoft.Dynamics.CRM.el_text_server_configuration"
                }
            };
            //check if there is an opened whatsapp converstion
            var odatautilConAcc = new CRMCommon.OdataUtil();
            var urlConAcc = "el_text_conversationSet?$select=Subject&$filter=el_l_account/Id eq guid'" + recordId + "' and StateCode/Value eq 0 and el_l_text_server/Id eq guid'" + result.results[0].el_text_server_configurationId + "'";
            var resultConAcc = odatautilConAcc.RetrieveDataByUrl("", urlConAcc, null, null, true);
            if (resultConAcc && resultConAcc.results && resultConAcc.results.length >= 1) {
                alert("ללקוח זה קיימת שיחה פתוחה בערוץ הנבחר");
                return;
            }
            var odatautilConLead = new CRMCommon.OdataUtil();
            var urlConLead = "el_text_conversationSet?$select=Subject&$filter=RegardingObjectId/Id eq guid'" + recordId + "' and StateCode/Value eq 0 and el_l_text_server/Id eq guid'" + result.results[0].el_text_server_configurationId + "'";
            var resultConLead = odatautilConLead.RetrieveDataByUrl("", urlConLead, null, null, true);
            if (resultConLead && resultConLead.results && resultConLead.results.length >= 1) {
                alert("ללקוח זה קיימת שיחה פתוחה בערוץ הנבחר");
                return;
            }
            var request = motors.Utilities.buildActionRequest(entityName.toLowerCase(), recordId, false, actionName, parameters, null, false);
            var service = motors.Services.XrmService.V81;
            var result = service.CallAction(request);
            if (result != null && result.success == true) {
                alert("שיחת וואטספ נוצרה בהצלחה");
            }
        }
        else {
            window.alert("ערוץ וואטספ לא קיים.");
        }
    }

    CRMCommon.RefreshWebResourceArea = function (webresourceName) {
        var webResourceControl = CRMCommon.GetControl(webresourceName);
        if (webResourceControl) {
            var src = webResourceControl.getSrc();
            webResourceControl.setSrc(null);
            webResourceControl.setSrc(src);
        }
        else
            window.alert("CRMCommon.RefreshWebResourceArea = function (webresourceName)\nWeb resource control with name '" + webresourceName + "' dose not existed !");
    }

    CRMCommon.ToggleSection = function (tabName, sectionName, setVisible) {
        var section = CRMCommon.GetSection(tabName, sectionName)
        if (section) {
            section.setVisible(setVisible);
            return;
        }
        else {
            var sectionsArr = CRMCommon.GetAllSections();
            if (sectionsArr.length > 0) {
                for (let i = 0; i < sectionsArr.length; i++) {
                    var section = sectionsArr[i];
                    if (section.getName() == sectionName) {
                        section.setVisible(setVisible)
                        return;
                    }
                }
            }
            console.log(`Error on el_common.js => CRMCommon.ToggleSection()\nSection ${sectionName} is't exist`);
            CRMCommon.SetFormNotification(`Error on el_common.js => CRMCommon.ToggleSection() Section ${sectionName} is't exist`, "ERROR", "CRMCommon.ToggleSection");
        }
    }

    CRMCommon.ToggleTab = function (tabName, setVisible) {
        var tab = CRMCommon.GetTabByName(tabName)
        if (tab)
            tab.setVisible(setVisible)
        else {
            console.error("Argument 'tabName' of 'CRMCommon.TogleTab' is Incurrect Or Isn't exist => el_common.js")
        }
    }

    CRMCommon.AddOnSave = function (callback) {
        var dataEntity = CRMCommon.GetXrmTurboFormEntity();
        if (dataEntity)
            dataEntity.addOnSave(callback);
    }

    CRMCommon.AddOnChange = function (fieldName, callback) {
        if (fieldName != null && callback != null) {
            var fieldAttribute = CRMCommon.GetAttribute(fieldName);
            if (fieldAttribute != null)
                fieldAttribute.addOnChange(callback);
        }
    }

    CRMCommon.AddOnChangeMultipleCallback = function (fieldName, callbackArray) {
        for (var i = 0; i < callbackArray.length; i++) {
            CRMCommon.AddOnChange(fieldName, callbackArray[i]);
        }
    }

    CRMCommon.AddOnChangeMultipleFields = function (fieldsArray, callback) {
        for (var i = 0; i < fieldsArray.length; i++) {
            CRMCommon.AddOnChange(fieldsArray[i], callback);
        }
    }

    CRMCommon.CRMEquals = function (oldValue, newValue) {
        var oldIsNull = (oldValue == null);
        var newIsNull = (newValue == null);

        if (oldIsNull != newIsNull) {
            return false;
        }

        if (oldIsNull) {
            return true;
        }

        if (Array.isArray(oldValue)) {
            return (oldValue[0].id == newValue[0].id);
        }

        return (oldValue == newValue);
    };

    CRMCommon.BuildActionRequest = function (logicalName, recordId, isGlobalAction, actionName, paramsObj, headers, isAsync, successCallBack, errorCallBack) {
        try {
            var request = motors.Utilities.buildActionRequest(logicalName, recordId, isGlobalAction, actionName, paramsObj, headers, isAsync, successCallBack, errorCallBack);
            var service = motors.Services.XrmService.V81;
            var result = service.CallAction(request);
            return result;
        }
        catch (err) {
            var alertStrings = CRMCommon.GetNewXrmAlertStrings(err.message);
            CRMCommon.OpenAlerDialog(alertStrings, null, null)
        }
    }

    /*
    *Method navigate by Form id OR by Form Name
    */
    CRMCommon.NavigateToForm = function (formName, formId) {
        if (!window.parent.Xrm.Page.ui.formSelector.items) {
            return;
        }
        if (formId) {
            Xrm.Page.ui.formSelector.items.get(formId).navigate();
            return;
        }

        var availableForms = window.parent.Xrm.Page.ui.formSelector.items.get();

        for (var i in availableForms) {
            if (availableForms[i].getLabel() == formName) {
                availableForms[i].navigate();
                return;
            }
        }

    }

    CRMCommon.UserHasRoleOrIsSystemManager = function (roleNameToCheck) {
        var currentUserRolesGuids = CRMCommon.GetCurrentUserRolesGuids();
        if (currentUserRolesGuids) {
            for (var i = 0; i < currentUserRolesGuids.length; i++) {

                var userRoleId = currentUserRolesGuids[i];
                var roleName = CRMCommon.GetRoleName(userRoleId);

                if (roleName == roleNameToCheck || roleName == "מנהל מערכת") {
                    return true;
                }
            }
            return false;
        }
        return false;
    }

    CRMCommon.ClearFieldNotification = function (fieldName) {
        var fieldControl = CRMCommon.GetControl(fieldName);
        if (fieldControl)
            fieldControl.clearNotification();
    }

    CRMCommon.ClearFormNotification = function (uniqueId) {
        var userInterface = CRMCommon.GetUserInterface()
        if (userInterface && uniqueId)
            userInterface.clearFormNotification(uniqueId);
        else
            console.error("Error on el_common.js => CRMCommon.ClearFormNotification()");
    }

    CRMCommon.GenerateGuid = function (braces, upperCase) {
        var randomGuid = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx".replace(/x/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        if (braces === true) { randomGuid = "{" + randomGuid + "}"; }
        if (upperCase === true) { randomGuid = randomGuid.toUpperCase(); }
        return randomGuid;
    }

    /**
     * Method generate a new lookup field data with passed parameters
     * @param {Guid} id 
     * @param {String} name 
     * @param {String} entityType 
     * @returns Content of lookup field
     */
    CRMCommon.GenerateLookupFieldData = function (id, name, entityType) {
        if (!id || !entityType) {
            return null;
        }
        var lookupField = new Array();
        lookupField[0] = new Object();
        lookupField[0].id = id;
        lookupField[0].name = name;
        lookupField[0].entityType = entityType;
        return lookupField;
    }

    CRMCommon.AddExistingFromSubGridCustom = function (gridTypeCode, gridControl, fetch, layout, viewName) {
        try {
            var viewId = CRMCommon.GenerateGuid(true, true);
            var relName = gridControl.GetParameter("relName");
            var roleOrd = gridControl.GetParameter("roleOrd");

            //creates the custom view object
            var customView = {
                fetchXml: fetch,
                id: viewId,
                layoutXml: layout,
                name: viewName,
                recordType: gridTypeCode,
                Type: 0
            };

            //pops the lookup window with our view injected
            var parent = window.parent.GetParentObject(null, 0);
            var parameters = [gridTypeCode, "", relName, roleOrd, parent];
            var callbackRef = window.parent.Mscrm.Utilities.createCallbackFunctionObject("locAssocObjAction", window.parent, parameters, false);
            //Hide New Button, display only one view to pick up records, keep showing search button
            window.parent.LookupObjectsWithCallback(
                callbackRef,            //callbackReference
                null,                   //lookupField
                "multi",                //lookupStyle
                gridTypeCode,           //lookupTypes
                0,                      //lookupBrowse
                null,                   //bindingColumns
                "",                     //additionalParams
                0,                      //showNewButton
                0,                      //showProp
                null,                   //bPopulateLookup
                null,                   //defaultType
                null,                   //searchString
                null,                   //dataProviderOverride
                viewId,                 //defaultViewId
                [customView],           //customViews
                null,                   //filterRelationshipId
                null,                   //rId
                null,                   //rType
                null,                   //rDependAttr
                0,                      //allowFilterOff
                0,                      //disableQuickFind
                1                       //disableViewPicker
            );

        } catch (error) {
            CRMCommon.SetFormNotification("Error on el_common.js => CRMCommon.AddExistingFromSubGridCustom(): " + error, "ERROR", "AddExistingFromSubGridCustom")
        }
    }

    CRMCommon.OdataUtil = function () {
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

        this.RetrieveDataByUrl = function (setname, odataUrl, successCallback, errorCallback, isAsync) {
            var oDataPath = CRMCommon.GetFormContext().context.prependOrgName("/XRMServices/2011/OrganizationData.svc");
            var oDataSelect = oDataPath.concat(this.getODataQuery(setname, odataUrl));
            var result = null;

            if (typeof ($) === 'undefined') {
                $ = window.parent.$;
                jQuery = window.parent.jQuery;
            }
            $.ajax({
                type: "GET",
                async: false,
                contentType: "application/json; charset=utf-8",
                datatype: "json",
                url: oDataSelect,
                beforeSend: function (XMLHttpRequest) {
                    XMLHttpRequest.setRequestHeader("Accept", "application/json");
                },
                success: function (data, textStatus, XmlHttpRequest) {
                    if (successCallback != null) {
                        successCallback(data.d, textStatus, XmlHttpRequest);
                    }
                    else {
                        result = data.d;
                    }
                },
                error: function (data, textStatus, errorThrown) {
                    if (data != null && data.responseJSON != null && data.responseJSON.error != null && data.responseJSON.error.message != null && data.responseJSON.error.message.value != null) {
                        errorThrown += ": " + data.responseJSON.error.message.value;
                    }

                    if (errorCallback != null) {
                        errorCallback(data, textStatus, errorThrown);
                    }
                }
            });
            return result;
        }

        this.getODataQuery = function (setname, odataUrl) {
            var query = "/" + setname;
            if (odataUrl)
                query = query.concat(odataUrl);
            return query;
        }

        this.formatODataFilterParameter = function (fieldname, value, type) {
            switch (type) {
                case "lookup": return fieldname + "/Id eq guid'" + value + "'"; break;
                case "picklist": return fieldname + "/Value eq " + value; break;
                case "string": return fieldname + " eq '" + value + "'";
                case "guid": return fieldname + " eq guid'" + value + "'"; break;
                default: return fieldname + " eq " + value;
            }
        }

        this.RetrieveData = function (setname, Id, select, filter, successCallback, errorCallback, isAsync) {
            var oDataPath = CRMCommon.GetFormContext().context.prependOrgName("/XRMServices/2011/OrganizationData.svc");
            var oDataSelect = oDataPath.concat(this.getODataSelect(setname, Id, select, filter));
            var result = null;
            if (typeof ($) === 'undefined') {
                $ = window.parent.$;
                jQuery = window.parent.jQuery;
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
        //-----------------------Sof-----------------------//

    }

    CRMCommon.OpenDialog = function (url, dialogOptions, dialogArguments, initFunctionName, returnFunction) {
        Xrm.Internal.openDialog(url, dialogOptions, dialogArguments, initFunctionName, returnFunction);
    }

    CRMCommon.SaveChenges = function () {
        var context = CRMCommon.GetFormContext()
        if (context) {
            return context.data.save();
        }
    }

    CRMCommon.RefreshRecordContent = function () {
        var context = CRMCommon.GetFormContext()
        if (context && context.data) {
            context.data.refresh();
        }
    }

    /**
     * Method open CRM alert window
     * @param {Object{InerText,TitleText,OkButtonText}} alertTexts 
     * @param {Object{height, width}} alertOptions 
     * @param {Function} closeCallback 
     */
    CRMCommon.OpenAlerDialog = function (alertTexts, alertOptions, closeCallback) {
        parent.Xrm.Dialog.openAlertDialog(alertTexts, alertOptions, closeCallback)
    }

    /**
     * Method close the last popped window of browser
     * Example of useing is on the el_account_service.js file. Serhc with ctr+f and type "common.CloseTopOfWindow()"
     */
    CRMCommon.CloseTopOfWindow = function () {
        window.top.close()
    }

    /**
     * Method open new window with advanced find
     * @param {Number} entityCode 
     * @param {Guid} entityViewId 
     * @param {Number} width 
     * @param {Number} height 
     */
    CRMCommon.OpenAdvancedFindWindowBlank = function (entityCode, entityViewId, width, height) {
        var urlToOpen = CRMCommon.GetClientUrl() + "/main.aspx?pagetype=advancedfind";

        //Add specific entity
        if (entityCode != null && !isNaN(entityCode)) {
            urlToOpen += "&extraqs=%3fEntityCode%3d" + entityCode;
            //Add specific view
            if (entityViewId != null) {
                urlToOpen += "%26QueryId%3d%257b" + entityViewId + "%257d";
            }
        }

        window.top.openStdWin(urlToOpen, "_blank", width, height);
    }

    /**
     * Method for refresh a subgrids on Main Form of entity
     * @param {string} subgridName 
     */
    CRMCommon.RefreshSubgrid = function (subgridName) {
        if (subgridName == null) {
            return null;
        }

        var subgridControl = CRMCommon.GetControl(subgridName);

        if (subgridControl != null) {
            subgridControl.refresh();
        }
        else {
            CRMCommon.SetFormNotification("Can't find control on CRMCommon.RefreshSubgrid()", "ERROR", "CRMCommon.RefreshSubgrid")
        }
    }

    //////////////          SETERS      ///////////////          SETERS      ///////////////          SETERS      ///////////////          SETERS      ///////////////

    CRMCommon.SetFireOnChange = function (attributeSchemname) {
        var attribute = CRMCommon.GetAttribute(attributeSchemname);
        if (!attribute) {
            console.log("common => CRMCommon.SetFireOnChange: Attribute is Incurrect OR isn't exist")
            return;
        }
        else {
            attribute.fireOnChange();
        }
    }

    CRMCommon.SetSubmitMode = function (attributeName, mode) {
        var attribute = CRMCommon.GetAttribute(attributeName)
        if (attribute && (mode === "always" || mode === "never" || mode === "dirty")) {
            attribute.setSubmitMode(mode);
        }

    }

    CRMCommon.SetTabDisplayState = function (tabName, state) {
        var tab = CRMCommon.GetTabByName(tabName)
        if (tab && state === "expanded" || state === "collapsed") {
            tab.setDisplayState(state)
        }
    }

    CRMCommon.SetFocus = function (controlName) {
        var ctr = CRMCommon.GetControl(controlName);
        if (ctr) {
            ctr.setFocus();
        }
    }

    CRMCommon.SetFormNotification = function (notificationMessage, notificationLevel, uniqueId) {
        try {
            var userInterface = CRMCommon.GetUserInterface();
            if (!uniqueId || !userInterface) {
                window.alert(notificationLevel + ": " + notificationMessage)
            }
            else if (userInterface) {
                userInterface.setFormNotification(notificationMessage ? notificationMessage : "Form notification message is incurrect or isn't exist.", notificationLevel, uniqueId);
            }
        } catch (error) {
            console.error("el_common.js => CRMCommon.SetFormNotification(): " + error);
        }
    }

    CRMCommon.SetFormReadonly = function () {
        if (parent.Xrm.Page.ui && parent.Xrm.Page.ui.controls) {
            var controls = parent.Xrm.Page.ui.controls;
            controls.forEach(function (control) {
                if (control.getName() != "" && control.getName() != null) {
                    if (control.setDisabled)
                        control.setDisabled(true);
                }
            })

        }
    }

    CRMCommon.SetFieldNotification = function (fieldName, notification) {
        var fieldControl = CRMCommon.GetControl(fieldName);
        if (fieldControl)
            fieldControl.setNotification(notification);
    }

    CRMCommon.SetRequiredLevel = function (fieldName, requiredLevel) {
        var attr = CRMCommon.GetAttribute(fieldName);
        if (attr)
            attr.setRequiredLevel(requiredLevel);
    }

    CRMCommon.SetLookupValue = function (fieldName, id, name, entityType, onChangeBehavior) {
        if (fieldName != null && id != null) {
            var attr = CRMCommon.GetAttribute(fieldName);
            if (attr != null) {
                var oldValue = attr.getValue();
                if (id.indexOf('{') == -1)
                    id = '{' + id;
                if (id.indexOf('}') == -1)
                    id = id + '}';
                id = id.toUpperCase();
                var lookupValue = [{
                    id: id,
                    name: name,
                    entityType: entityType
                }];
                if (!CRMCommon.CRMEquals(oldValue, lookupValue)) {
                    attr.setValue(lookupValue);
                    if (onChangeBehavior == Enums.OnChangeBehavior.IfChanged || onChangeBehavior == Enums.OnChangeBehavior.Always)
                        attr.fireOnChange();
                    return true;
                }
                else if (onChangeBehavior == Enums.OnChangeBehavior.Always) {
                    attr.fireOnChange();
                    return false;
                }
            }
        }
        else if (fieldName != null && id == null)
            CRMCommon.SetFieldValue(fieldName, null)
        return false;

    }

    CRMCommon.SetFieldVisibility = function (fieldName, setVisible) {
        var contr = CRMCommon.GetControl(fieldName);
        if (contr)
            contr.setVisible(setVisible);
    }

    CRMCommon.SetDisabled = function (fieldName, disabled) {
        var ctl = CRMCommon.GetControl(fieldName);
        if (ctl != null) {
            ctl.setDisabled(disabled);
        }
    };

    CRMCommon.SetFieldValue = function (fieldName, newValue) {
        var attribute = CRMCommon.GetAttribute(fieldName);
        if (attribute)
            attribute.setValue(newValue);
    }

    CRMCommon.SetFormContext = function (context) {
        CRMCommon._formContext = context;
    }

    CRMCommon.SetFilterOnLookupField = function (filtredFieldName, filtredEntityLogicalName, filter) {
        if (!filtredFieldName || !filtredEntityLogicalName || !filter) {
            console.log("el_common.js => SetFilterOnLookupField(): one of parameters is NULL or Undefined");
            return null;
        }

        var control = CRMCommon.GetControl(filtredFieldName);

        if (!control) {
            console.log("el_common.js => SetFilterOnLookupField(): No control with name: " + filtredFieldName);
            return null;
        }

        control.addPreSearch(function () { control.addCustomFilter(filter, filtredEntityLogicalName) });
    }

    /**
     * Opens a web resource in a full-screen iframe on top of the current window.
     * @param {String} webResourceName -> The name of a saved on system WebResource
     * @param {String} openedWebResourceId -> Set id of just opened IFrame (WebResource element id)
     * @returns {HTMLIFrameElement|null} -> The created iframe element or null if an error occurred
     */
    CRMCommon.OpenWebResourceOnFrontOfWindow = function (webResourceName, openedWebResourceId) {
        const doc = window.top.document;
        try {
            const clientUrl = CRMCommon.GetClientUrl();
            const webResource = `${clientUrl}/WebResources/${webResourceName}`;

            var xhr = new XMLHttpRequest();
            xhr.open("GET", webResource, false);
            xhr.send();

            if (xhr.status === 200) {

                const iframe = doc.createElement('iframe');
                iframe.src = webResource;
                iframe.style.position = 'fixed';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.style.zIndex = '999999';
                iframe.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
                iframe.id = openedWebResourceId;

                //Clicking on outside of the iframe bounds will close
                iframe.addEventListener('click', function (event) {
                    if (event.target === iframe) {
                        iframe.remove();
                    }
                });

                // Append to document body
                doc.body.appendChild(iframe);

                return iframe;
            }
            else {
                console.warn(`el_common.js => CRMCommon.OpenWebResourceOnFrontOfWindow(): There is no WebResource with name ${webResourceName}`);
                CRMCommon.SetFormNotification(`el_common.js => CRMCommon.OpenWebResourceOnFrontOfWindow(): There is no WebResource with name ${webResourceName}`, "WARNING", "CRMCommon.OpenWebResourceOnFrontOfWindow");
            }

        } catch (error) {
            console.error("el_common.js => CRMCommon.OpenWebResourceOnFrontOfWindow()", error);
            CRMCommon.SetFormNotification("el_common.js => CRMCommon.OpenWebResourceOnFrontOfWindow(): " + error.message, "ERROR", "CRMCommon.OpenWebResourceOnFrontOfWindow");
        }
    }

    //////////////          GETERS      ///////////////          GETERS      ///////////////          GETERS      ///////////////          GETERS      ///////////////

    CRMCommon.GetXRMTabs = function () {
        var userInterface = CRMCommon.GetUserInterface()
        if (userInterface && userInterface.tabs) {
            return userInterface.tabs;
        }
        return null;
    }

    CRMCommon.GetXrmControls = function () {
        var userInterface = CRMCommon.GetUserInterface();
        if (userInterface) {
            return userInterface.controls;
        }
        return null;
    }

    CRMCommon.GetXrmUiControl = function (controlname) {
        if (!controlname)
            return null;

        var xrmControls = CRMCommon.GetXrmControls();
        if (xrmControls) {
            xrmControls.get(controlname);
        }

        return null;
    }

    CRMCommon.GetSection = function (tabName, sectionName) {
        var sections = CRMCommon.GetSectionsOfTab(tabName);
        if (sections)
            return sections.get(sectionName);
        return null;
    }

    CRMCommon.GetSectionsOfTab = function (tabName) {
        var tabs = CRMCommon.GetXRMTabs();
        if (tabs) {
            return tabs.get(tabName).sections;
        }
        return null;
    }

    CRMCommon.GetNewXrmDialogOptions = function (width, height, left, top, openInNewWindow) {
        var DialogOption = new Xrm.DialogOptions;
        DialogOption.width = width ? width : 550;
        DialogOption.height = height ? height : 550;
        if (left) { DialogOption.left = left }
        if (top) { DialogOption.top = top }
        if (openInNewWindow) { DialogOption.openInNewWindow = openInNewWindow }
        return DialogOption;
    }

    CRMCommon.GetClientUrl = function () {
        var context = CRMCommon.GetFormContext();
        if (context)
            return context.context.getClientUrl();
        return null;
    }

    CRMCommon.GetTabByName = function (tabName) {
        var userInterface = CRMCommon.GetUserInterface();
        if (userInterface)
            return userInterface.tabs.get(tabName);
        return null;
    }

    CRMCommon.GetCurrentUserRolesGuids = function () {
        var context = CRMCommon.GetFormContext()
        if (context)
            return context.context.getUserRoles()
        return null;
    }

    CRMCommon.GetRoleName = function (roleId) {
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

    CRMCommon.GetCurrentEntityId = function () {
        var xrmTurboFormEntity = CRMCommon.GetXrmTurboFormEntity()
        if (xrmTurboFormEntity) {
            return xrmTurboFormEntity.getId();
        }
        return null;
    }

    CRMCommon.GetXrmTurboFormEntity = function () {
        var context = CRMCommon.GetFormContext()
        if (context && context.data && context.data.entity) {
            return context.data.entity;
        }
        return null;
    }

    CRMCommon.GetFormFactor = function () {
        return Xrm.Page.context.client.getFormFactor();
    }

    CRMCommon.GetLookupFieldValue = function (fieldName) {
        var lookupValue = CRMCommon.GetFieldValue(fieldName);
        if (lookupValue)
            return lookupValue[0];
        return null;
    };

    CRMCommon.GetAttribute = function (fieldName) {
        var context = CRMCommon.GetFormContext();
        if (context && context.getAttribute(fieldName))
            return context.getAttribute(fieldName);
        return null;
    }

    CRMCommon.GetControl = function (fieldName) {
        var context = CRMCommon.GetFormContext();
        if (context) {
            return context.getControl(fieldName)
        }
        return null;
    }

    CRMCommon.GetFormType = function () {
        var userInterface = CRMCommon.GetUserInterface()
        if (userInterface)
            return userInterface.getFormType();
        return null;
    }

    CRMCommon.GetFieldValue = function (fieldName) {
        var attribute = CRMCommon.GetAttribute(fieldName)
        if (attribute != null)
            return CRMCommon.GetAttribute(fieldName).getValue();
        return null
    }

    CRMCommon.GetAllSections = function () {
        var sections = [];
        debugger;
        window.parent.Xrm.Page.ui.tabs.getAll().forEach(function (tab) {
            sections = sections.concat(tab.sections.getAll())
        })
        return sections;
    }

    CRMCommon.GetFormContext = function () {
        return CRMCommon._formContext == null ? window.parent.Xrm.Page : CRMCommon._formContext;
    }

    CRMCommon.GetUserInterface = function () {
        var context = CRMCommon.GetFormContext();
        if (context)
            return context.ui;

        return null;
    }

    /**
     * Method check and return a opener of current window if EXIST
     * @returns Opener of current window or NULL
     */
    CRMCommon.GetOpener = function () {
        return window.top.opener;
    }

    /**
     * Method check if opener is exist and return hes context
     * @returns Form cotext of opener
     */
    CRMCommon.GetOpenerContext = function () {
        var opener = CRMCommon.GetOpener()
        if (opener && opener.Xrm.Page) {
            return opener.Xrm.Page;
        }
        return null;
    }

    /**
     * Method return data of opener form context
     * @returns _formContext.data
     */
    CRMCommon.GetDataOfOpenerContext = function () {
        var opContext = CRMCommon.GetOpenerContext();
        if (opContext && opContext.data) {
            return opContext.data;
        }
        return null;
    }

    /**
     * Method check if opener is exist and return a data with opener entity info 
     * @returns Object {Id,EntityName,EntityTitle}
     */
    CRMCommon.GetOpenerEntityInfo = function () {
        var contextData = CRMCommon.GetDataOfOpenerContext();
        if (contextData && contextData.entity) {
            return { Id: contextData.entity.getId(), EntityName: contextData.entity.getEntityName() }
        }
        return null;
    }

    /**
     * Method create a Alert window strings
     * @param {String} messageText 
     * @param {String} titleText 
     * @param {String} okButtonText 
     * @returns new XRM.AlertDialogString
     */
    CRMCommon.GetNewXrmAlertStrings = function (messageText, titleText, okButtonText) {
        var alertTexts = new Xrm.AlertDialogStrings;
        alertTexts.confirmButtonLabel = okButtonText ? okButtonText : undefined;
        alertTexts.text = messageText ? messageText : undefined;
        alertTexts.title = titleText ? titleText : undefined;
        return alertTexts;
    }

    /**
     * Method create a dialodg Options
     * @param {Number} heightArg 
     * @param {Number} widthArg 
     * @returns Object
     */
    CRMCommon.GetAlertWindowOptions = function (heightArg, widthArg) {
        if (!heightArg && !widthArg) {
            return {};
        }
        if (heightArg && !widthArg) {
            return { height: heightArg }
        }
        if (!heightArg && widthArg) {
            return { width: widthArg }
        }
        if (heightArg && widthArg) {
            return { width: widthArg, height: heightArg }
        }
    }

    /**
     * Method return a items of OptionSet field
     * @param {String} optionSetFieldName 
     * @returns Array of items
     */
    CRMCommon.GetOptionSetFieldItems = function (optionSetFieldName) {
        if (!optionSetFieldName) {
            return null;
        }
        var optSetControl = CRMCommon.GetControl(optionSetFieldName);
        if (optSetControl) {
            return optSetControl.getAttribute().getOptions()
        }
        return null;
    }

    /**
     * Method check a default view for multiple lookup window 
     * https://learn.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference/controls/getdefaultview
     * @param {String} controlName 
     * @returns Returns the GUID value of the default lookup dialog view
     */
    CRMCommon.GetGuidOfTheDefaultLookupDialogView = function (lookupFieldName) {
        var control = CRMCommon.GetControl(lookupFieldName);
        if (control)
            return control.getDefaultView();
        return null;
    }

    CRMCommon.SetDefaultLookupDialogView = function (lookupFieldName, viewGuidToSetWithBraces) {
        var control = CRMCommon.GetControl(lookupFieldName);
        try {
            if (control) {
                if (viewGuidToSetWithBraces) {
                    control.setDefaultView(viewGuidToSetWithBraces)
                }
                else {
                    control.setDefaultView(GetGuidOfTheDefaultLookupDialogView(lookupFieldName))
                }
            }

        } catch (error) {
            console.error(error);
        }

    }

    CRMCommon.GetGlobalParameterValueByName = function (globalParamName) {
        if (globalParamName == null) {
            return null;
        }

        var OdataUtilObj = new CRMCommon.OdataUtil();
        var filter = OdataUtilObj.formatODataFilterParameter("el_name", globalParamName, "string");
        var parameter = OdataUtilObj.RetrieveData("el_general_system_parameterSet", null, "el_s_value", filter, null, false);
        if (parameter != null && parameter.results != null && parameter.results.length == 1) {
            return parameter.results[0].el_s_value;
        }
        return null;
    }

    CRMCommon.GetUserBusinessUnit = function (userId) {
        if (!userId) {
            return null;
        }

        var OdataUtilObj = new CRMCommon.OdataUtil();

        var user = OdataUtilObj.RetrieveData("SystemUserSet", userId, "BusinessUnitId", null, null, null, false);

        if (user != null && user.BusinessUnitId != null) {
            return user.BusinessUnitId;
        }

        return null;
    }

    CRMCommon.GetCurrentUserId = function () {
        return CRMCommon.GetFormContext().context.getUserId();
    }

    /**
     * Method return Array filled in names of all required fields on Form
     * @returns Array of strings
     */
    CRMCommon.GetAllMandatoryFieldsName = function () {
        var fieldsName = [];
        var context = CRMCommon.GetFormContext();
        if (!context)
            context = parent.Xrm.Page;

        context.getAttribute(function (attribute, index) {
            if (attribute.getRequiredLevel() == "required") {
                fieldsName.push(attribute.getName());
            }
        });

        return fieldsName;
    }

    CRMCommon.GetFormName = function () {
        try {
            const ui = CRMCommon.GetUserInterface();
            return ui.formSelector.getCurrentItem().getLabel();
        } catch (error) {
            console.error(`Error on common => CRMCommon.GetFormName():\n ${error}`);
            CRMCommon.SetFormNotification(`Error on common => CRMCommon.GetFormName(): ${error.message}`);
        }
    }

    CRMCommon.GetIsDirty = function (fieldName) {
        try {
            return CRMCommon.GetAttribute(fieldName).getIsDirty();
        } catch (err) {
            console.error("Error on common => CRMCommon.GetIsDirty():\n " + err);
            CRMCommon.SetFormNotification("Error on common => CRMCommon.GetIsDirty(): " + error.message, "ERROR", "CRMCommon.GetIsDirty");
        }
    }

    //////////////////////////////////////              VALIDATORS    \\\\\\\\\\///////////              VALIDATORS   \\\\\\\\\\\\\\\\


    CRMCommon.IsRequiredField = function (fieldName) {
        var attribute = CRMCommon.GetAttribute(fieldName)

        if (attribute) {
            var level = attribute.getRequiredLevel();
            return level == "required" ? true : false;
        }
        return null;
    }

    CRMCommon.IsAllMandatoryFieldsArePopulated = function () {
        populated = true;

        parent.Xrm.Page.getAttribute(function (attribute, index) {
            if (attribute.getRequiredLevel() == "required") {
                if (attribute.getValue() === null) {
                    populated = false;
                }
            }
        });

        return populated;
    }

    CRMCommon.IsValidValue = function (value, pattern) {
        if (value && pattern) {
            return value.match(pattern) != null ? true : false;
        }
    }

    /**
     * Method check if ID is valid
     * @param {string} value 
     * @param {Boolean} emptyIsValid 
     * @returns true if ID is Valid
     */
    CRMCommon.IsValidID = function (value) {
        if (!value && value !== 0) {
            return true;
        }

        var idnum = value.toString();
        if (idnum.indexOf("999999999") == -1) {
            var i = idnum.length;
            while (i < 9) {
                idnum = "0" + idnum;
                i++;
            }
            var idnum1 = idnum.substr(0, 1) * 1;
            var idnum2 = idnum.substr(1, 1) * 2;
            var idnum3 = idnum.substr(2, 1) * 1;
            var idnum4 = idnum.substr(3, 1) * 2;
            var idnum5 = idnum.substr(4, 1) * 1;
            var idnum6 = idnum.substr(5, 1) * 2;
            var idnum7 = idnum.substr(6, 1) * 1;
            var idnum8 = idnum.substr(7, 1) * 2;
            var idnum9 = idnum.substr(8, 1) * 1;
            if (idnum1 > 9) {
                idnum1 = (idnum1 % 10) + 1;
            }
            if (idnum2 > 9) {
                idnum2 = (idnum2 % 10) + 1;
            }
            if (idnum3 > 9) {
                idnum3 = (idnum3 % 10) + 1;
            }
            if (idnum4 > 9) {
                idnum4 = (idnum4 % 10) + 1;
            }
            if (idnum5 > 9) {
                idnum5 = (idnum5 % 10) + 1;
            }
            if (idnum6 > 9) {
                idnum6 = (idnum6 % 10) + 1;
            }
            if (idnum7 > 9) {
                idnum7 = (idnum7 % 10) + 1;
            }
            if (idnum8 > 9) {
                idnum8 = (idnum8 % 10) + 1;
            }
            if (idnum9 > 9) {
                idnum9 = (idnum9 % 10) + 1;
            }
            var sumval = idnum1 + idnum2 + idnum3 + idnum4 + idnum5 + idnum6 + idnum7 + idnum8 + idnum9;
        }
        return !((sumval % 10 > 0) || !sumval);
    }

    /**
     * Method check if a value contein a digits only.
     * @param {ContentToCheck} value 
     * @returns true if is digits only
     */
    CRMCommon.IsDigitsOnly = function (value) {
        return /^\d+$/.test(value);
    }

    CRMCommon.IsOnlyDigitsAndDashes = function (licensePlateNumbe) {
        if (licensePlateNumbe && !licensePlateNumbe.match(/^[0-9\-]*$/)) {
            return false;
        }
        return true;
    }

    CRMCommon.IsTabHided = function (tabName) {
        var tab = CRMCommon.GetTabByName(tabName)
        if (tab)
            return !tab.getVisible();
        else {
            console.log("Argument 'tabName' of 'CRMCommon.IsTabHided' is Incurrect Or Isn't exist => el_common.js")
        }
    }

    CRMCommon.IsSectionHided = function (tabName, sectionName) {
        try {
            var tab = CRMCommon.GetTabByName(tabName)
            if (tab)
                return !tab.sections.get(sectionName).getVisible()
            else {
                var sections = CRMCommon.GetAllSections();
                for (let i = 0; i < sections.length; i++) {
                    const section = sections[i];
                    if (section.getName() == sectionName) {
                        return section.getVisible();
                    }
                }
            }
        } catch (error) {
            console.log("Error on el_commo.js => IsSectionHided().\n\t" + error.toString())
            CRMCommon.SetFormNotification("Error on el_commo.js => IsSectionHided().\n\t" + error.toString(), "ERROR", "IsSectionHided()")
        }
    }

    CRMCommon.createLookupObject = function (id, name, type) {
        var lookupValue = [{
            id: id,
            name: name,
            entityType: type
        }];
        return lookupValue;
    }


    //#region Load progress spiner area
    const OVERLAY_ID = 'global-spinner-overlay';

    CRMCommon.ShowProgressIndicator = function (message) {
        const overlay = ensureOverlay(message);
        const topDoc = getTopDocument();
        disableScroll(topDoc);
        overlay.style.display = 'block';

        function ensureOverlay(msg) {
            const topDoc = getTopDocument();
            let overlay = topDoc.getElementById(OVERLAY_ID);
            if (overlay) return overlay;

            overlay = topDoc.createElement('div');
            overlay.id = OVERLAY_ID;
            overlay.setAttribute('role', 'status');
            overlay.setAttribute('aria-live', 'polite');
            overlay.setAttribute('aria-busy', 'true');
            overlay.title = msg ? msg : 'טוען....';

            overlay.style.display = 'none';
            overlay.style.textAlign = 'center';
            overlay.style.position = 'absolute';
            overlay.style.inset = '0px';
            overlay.style.zIndex = '101';
            overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';

            const container = topDoc.createElement('div');
            container.style.position = 'absolute';
            container.style.top = '50%';
            container.style.left = '50%';
            container.style.transform = 'translate(-50%, -50%)';
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.alignItems = 'center';
            container.style.gap = '8px';

            const img = topDoc.createElement('img');
            img.src = '/_imgs/AdvFind/progress.gif';
            img.alt = 'Loading';
            img.style.width = '40px';
            img.style.height = '40px';
            img.style.imageRendering = 'pixelated'; // optional for classic gif

            // Title (Hebrew)
            const title = topDoc.createElement('div');
            title.textContent = msg ? msg : 'טוען....';
            title.style.fontWeight = 'bold'
            title.style.fontFamily = 'Segoe UI, Arial, sans-serif';
            title.style.fontSize = '16px';
            title.style.color = '#333';

            container.appendChild(img);
            container.appendChild(title);
            overlay.appendChild(container);

            // Make sure the overlay sits on top of all content in the top window
            const parent = topDoc.body || topDoc.documentElement;
            parent.appendChild(overlay);

            return overlay;
        }

        function disableScroll(topDoc) {
            const body = topDoc.body || topDoc.documentElement;
            if (!body) return;
            if (!body.dataset._spinnerOverflowSaved) {
                body.dataset._spinnerOverflowSaved = body.style.overflow || '';
            }
            body.style.overflow = 'hidden';
        }
    }

    CRMCommon.HideProgressIndicator = function () {
        const topDoc = getTopDocument();
        const overlay = topDoc.getElementById(OVERLAY_ID);
        if (overlay) overlay.style.display = 'none';
        restoreScroll(topDoc);

        function restoreScroll(topDoc) {
            const body = topDoc.body || topDoc.documentElement;
            if (!body) return;
            if ('_spinnerOverflowSaved' in body.dataset) {
                body.style.overflow = body.dataset._spinnerOverflowSaved;
                delete body.dataset._spinnerOverflowSaved;
            }
        }
    }

    function getTopDocument() {
        try {
            return (window.top && window.top.document) ? window.top.document : document;
        } catch (e) {
            return document;
        }
    }

    //#endregion

    //#region Browse file popup

    /**
     * Method upload and save attached file on server side
     * @param {String} saveOnPath -> Path to save a picked file in.
     * @param {String} saveFullPathOn -> Field schem name to save a successd retrieved URL of just saved file
     * @param {Function} onSaveCallback -> On save button click callback
     * @param {Function} successCallback -> Browse file full operation success
     * @param {Function} errorCallback -> Browse file full operation fault
     * @returns Promise with result of operation
     */
    CRMCommon.BrowseFile = function (saveOnPath, saveFullPathOn, onSaveCallback, successCallback, errorCallback) {
        try {
            window.top.FileDialogCallbacks = {

                onSave: function (result) {
                    if (result) {

                        if (onSaveCallback) {
                            onSaveCallback();
                        }

                        const reader = new FileReader();
                        reader.onloadend = function () {

                            const base64String = reader.result
                                .replace('data:', '')
                                .replace(/^.+,/, '');

                            const paramsObj = {
                                pickedFileBase64: base64String,
                                saveOnPath: saveOnPath,
                                entityId: CRMCommon.GetXrmTurboFormEntity().getEntityName() + " - " + CRMCommon.GetCurrentEntityId()
                            };

                            //Call a custom action to save a file on server side and return a URL of saved file in result
                            const request = CRMCommon.BuildActionRequest("", "", true, "el_save_file_on_server_folder", paramsObj, null, true,
                                function (result) {
                                    if (result && result.success === true) {
                                        if (result.savedFileFullPath && saveFullPathOn) {
                                            CRMCommon.SetFieldValue(saveFullPathOn, result.savedFileFullPath);
                                            CRMCommon.SaveChenges();
                                        }
                                        console.log("el_common.js => BrowseFile.onSave().buildActionRequest() Success response: ", result);
                                        if (successCallback) {
                                            successCallback({ data: result, source: "el_common.js => BrowseFile.onSave().buildActionRequest() Success response: " });
                                        }
                                    } else {
                                        console.warn("el_common.js => BrowseFile.onSave().buildActionRequest: Success response WITHOUT data", result);
                                        if (errorCallback) {
                                            errorCallback({ ...result, source: "el_common.js => BrowseFile.onSave().buildActionRequest: Success response WITHOUT data" });
                                        }
                                    }
                                },
                                function (err) {
                                    console.error("el_common.js => BrowseFile.onSave().buildActionRequest: Error response: ", err);
                                    if (errorCallback) {
                                        errorCallback({ ...err, source: "el_common.js => BrowseFile.onSave().buildActionRequest: Error response: " });
                                    }
                                });

                            const service = motors.Services.XrmService.V81;
                            service.CallAction(request);
                        };

                        reader.readAsDataURL(result);
                    }
                    else {
                        if (successCallback) {
                            successCallback({ message: "No file was picked", source: "el_common.js => BrowseFile.onSave()" });
                        }
                        else {
                            console.log("el_common.js => BrowseFile.onSave(): No file was picked");
                        }
                    }
                    hideWebResource();
                },

                onCancel: function () {
                    hideWebResource();
                }
            };

            const iframe = CRMCommon.OpenWebResourceOnFrontOfWindow("el_browse_file.html", "browse-file-iframe");

            function hideWebResource() {
                if (iframe) {
                    iframe.remove();
                }
                window.top.FileDialogCallbacks = null;
            }

        } catch (error) {
            window.top.FileDialogCallbacks = null;
            console.error("el_common.js => CRMCommon.BrowseFile()", error);
            if (errorCallback) {
                errorCallback({ ...error, source: 'BrowseFile.init()' });
            }
        }
    }

    //#endregion


})(window.CRMCommon = window.CRMCommon || {})

var elad_commons = function (formContext) {
    if (formContext)
        CRMCommon.SetFormContext(formContext);
    return CRMCommon;
}

var win = function () {
    if (document.URL.indexOf("ClientApiWrapper.aspx") > -1)
        return window.parent;
    else
        return window;
}

win().ScriptForm = window;
