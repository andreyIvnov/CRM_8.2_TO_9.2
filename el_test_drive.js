function el_common() {

    this.fillShowRoom = function () {
        if (Xrm && Xrm.Page && Xrm.Page.ui && Xrm.Page.ui.getFormType() == 1)//create form only
        {
            var currShowRoomLookupValue = null;
            var OdataUtilObj = new OdataUtil();
            if (Xrm.Page.getAttribute("el_id_showroom")) {
                currShowRoomLookupValue = Xrm.Page.getAttribute("el_id_showroom").getValue();
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

var FORMSTATE_CREATE = 1;
var FORM_FACTOR_TABLET = 2;

var Enums = {
    TestDriveType : {
        TestDriveOutOfFieldOfShowroom: 1,
    },

}

var commons;
var commonFromOtherJSFile;
var isTablet = false;
var mandatoryFieldsName; 

function testDrive_onLoad(executionContext) {
    try {
        debugger;
        commons = new el_common();
        commonFromOtherJSFile = new elad_commons(executionContext.getFormContext());    // Common come from el_common.js file
        isTablet = commonFromOtherJSFile.GetFormFactor() == FORM_FACTOR_TABLET;
        
        // SetFormByTestDriveType();
        displaySignature();
        if (Xrm.Page.getAttribute("el_s_company_rep_name").getValue()) {
            setFieldsForCarFleetTestDrive();
        }
        else {
            setMandatoryFields();
        }
        if(Xrm.Page.getAttribute("el_s_signature_after").getValue()){
            lockFields();
        }


        
        //Most be before AddOnChange events AND after all onload events
        mandatoryFieldsName = commonFromOtherJSFile.GetAllMandatoryFieldsName();//Most be before AddOnChange events AND after all onload events
        
        testDriveAssignEventActions();

    } catch (err) {
        var errMess = "ERROR on testDrive_onLoad():\n" + err.message;
        if (!isTablet) {
            commonFromOtherJSFile.SetFormNotification(errMess, "ERROR", "testDrive_onLoad");
            console.log(errMess);
        } else {
            window.parent.alert(errMess)
        }
    }

}

function testDriveAssignEventActions() {
    Xrm.Page.getAttribute("el_s_customer_first_name").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_s_customer_last_name").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_s_customer_idnumber").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_s_customer_mobile_phone").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_dt_license_expires_on").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_s_driver_license_number").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_dt_actual_start").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_n_km_start").addOnChange(updateSignatureFields);
    //Xrm.Page.getAttribute("el_n_year").addOnChange(updateSignatureFields); // The field isn't in use
    Xrm.Page.getAttribute("el_s_signature").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_dt_actual_end").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_n_km_end").addOnChange(updateSignatureFields);
    Xrm.Page.getAttribute("el_s_license_number").addOnChange(validateCarLicenseNumber);
    Xrm.Page.getAttribute("el_b_international_license").addOnChange(setLisenceNumberRequired);
    // Xrm.Page.getAttribute("el_s_signature_after").addOnChange(lockFields);
    commonFromOtherJSFile.AddOnChangeMultipleFields([...mandatoryFieldsName, "el_s_signature_after"],lockFields);
}

function lockFields() {
    //var commons = new el_common();
    if (Xrm.Page.getAttribute("statecode") && Xrm.Page.getAttribute("statecode").getValue() == 0) {
        if (Xrm.Page.getAttribute("el_s_signature_after").getValue() && commonFromOtherJSFile.IsAllMandatoryFieldsArePopulated() == true) {
            Xrm.Page.ui.controls.forEach(function (control, index) {
                var controlType = control.getControlType();
                if (controlType != 'iframe' && controlType != 'webresource' && controlType != 'subgrid') {
                    control.setDisabled(true);
                }
            });
                    
            Xrm.Page.getControl("el_s_bo_remarks").setDisabled(false);
            Xrm.Page.getControl("el_s_summary_remarks").setDisabled(false);
            Xrm.Page.getControl("el_n_survey_equipment").setDisabled(false);
            Xrm.Page.getControl("el_n_survey_safety").setDisabled(false);
            Xrm.Page.getControl("el_n_survey_performance").setDisabled(false);
            Xrm.Page.getControl("el_n_survey_comfort").setDisabled(false);
            Xrm.Page.getControl("el_n_survey_size").setDisabled(false);
        }
    }
}

function setLisenceNumberRequired() {
    if (Xrm.Page.getAttribute("el_b_international_license") && Xrm.Page.getAttribute("el_b_international_license").getValue()) {
        Xrm.Page.getAttribute("el_s_driver_license_number").setRequiredLevel('none');
        Xrm.Page.getAttribute("el_dt_license_expires_on").setRequiredLevel('none');
    }
    else {
        if (isTablet) {
            Xrm.Page.getAttribute("el_dt_license_expires_on").setRequiredLevel('required');
            Xrm.Page.getAttribute("el_s_driver_license_number").setRequiredLevel('required');
        }
    }
}

function validateCarLicenseNumber() {
    var value = Xrm.Page.getAttribute("el_s_license_number").getValue();
    if (value && !value.match(/^[0-9\-]*$/)) {
        alert("על מספר רישוי להכיל רק ספרות ומקף");
        Xrm.Page.getAttribute("el_s_license_number").setValue(null);
        Xrm.Page.getControl("el_s_license_number").setFocus();
    }
}

function displaySignature() {
    if (!isTablet) {
        Xrm.Page.getControl("el_s_signature").setVisible(false);
        Xrm.Page.getControl("el_s_signature_after").setVisible(false);
    }
}

function setMandatoryFields() {
    if (isTablet) {
        Xrm.Page.getAttribute("el_s_customer_first_name").setRequiredLevel('required');
        Xrm.Page.getAttribute("el_s_customer_last_name").setRequiredLevel('required');
        Xrm.Page.getAttribute("el_s_customer_idnumber").setRequiredLevel('required');
        Xrm.Page.getAttribute("el_s_customer_mobile_phone").setRequiredLevel('required');
        if (!Xrm.Page.getAttribute("el_b_international_license").getValue()) {
            Xrm.Page.getAttribute("el_dt_license_expires_on").setRequiredLevel('required');
            Xrm.Page.getAttribute("el_s_driver_license_number").setRequiredLevel('required');
        }
        Xrm.Page.getAttribute("el_dt_actual_start").setRequiredLevel('required');
        Xrm.Page.getAttribute("el_n_km_start").setRequiredLevel('required');
        //Xrm.Page.getAttribute("el_n_year").setRequiredLevel('required'); The Field isn't in USE
        Xrm.Page.getAttribute("el_s_license_number").setRequiredLevel('required');
        if (!Xrm.Page.getAttribute("el_s_customer_first_name").getValue() || !Xrm.Page.getAttribute("el_s_customer_last_name").getValue() || !Xrm.Page.getAttribute("el_s_customer_idnumber").getValue()
            || !Xrm.Page.getAttribute("el_s_customer_mobile_phone").getValue() || !Xrm.Page.getAttribute("el_dt_license_expires_on") || !Xrm.Page.getAttribute("el_s_driver_license_number").getValue()
            || !Xrm.Page.getAttribute("el_dt_actual_start").getValue() || !Xrm.Page.getAttribute("el_n_km_start").getValue() /*|| !Xrm.Page.getAttribute("el_n_year").getValue()  The Field isn't in USE*/) {
            Xrm.Page.getControl("el_s_signature").setDisabled(true);
        }
        if (!Xrm.Page.getAttribute("el_s_signature").getValue() || !Xrm.Page.getAttribute("el_dt_actual_end").getValue() || !Xrm.Page.getAttribute("el_n_km_end").getValue())
            Xrm.Page.getControl("el_s_signature_after").setDisabled(true);
    }
    showHideOnCarFleetForm(false);
}

function showHideOnCarFleetForm(trueFalse) {
    //Xrm.Page.getControl("el_s_company_rep_name").setVisible(trueFalse);
    // Xrm.Page.getControl("el_s_customer_first_name").setVisible(!trueFalse);
    // Xrm.Page.getControl("el_s_customer_last_name").setVisible(!trueFalse);
    if (Xrm.Page.getAttribute("el_s_company_rep_name").getValue()) {
        if (Xrm.Page.getAttribute("el_id_leasing").getValue()) {
            Xrm.Page.getControl("el_id_company").setVisible(false);
        }
        else if (Xrm.Page.getAttribute("el_id_company").getValue()) {
            Xrm.Page.getControl("el_id_leasing").setVisible(false);
        }
    }
    else {
        Xrm.Page.getControl("el_id_leasing").setVisible(false);
        Xrm.Page.getControl("el_id_company").setVisible(false);
    }
    Xrm.Page.getControl("el_id_account").setVisible(!trueFalse);
    Xrm.Page.getControl("el_id_company_rep").setVisible(trueFalse);
}

function setFieldsForCarFleetTestDrive() {

    if (isTablet) {
        Xrm.Page.getAttribute("el_s_customer_idnumber").setRequiredLevel('required');
        Xrm.Page.getAttribute("el_s_customer_mobile_phone").setRequiredLevel('required');
        if (!Xrm.Page.getAttribute("el_b_international_license").getValue()) {
            Xrm.Page.getAttribute("el_dt_license_expires_on").setRequiredLevel('required');
            Xrm.Page.getAttribute("el_s_driver_license_number").setRequiredLevel('required');
        }
        Xrm.Page.getAttribute("el_dt_actual_start").setRequiredLevel('required');
        Xrm.Page.getAttribute("el_n_km_start").setRequiredLevel('required');
        //Xrm.Page.getAttribute("el_n_year").setRequiredLevel('required');  The Field isn't in USE
        Xrm.Page.getAttribute("el_s_license_number").setRequiredLevel('required');
        //if (!Xrm.Page.getAttribute("el_s_customer_first_name").getValue() || !Xrm.Page.getAttribute("el_s_customer_last_name").getValue() || !Xrm.Page.getAttribute("el_s_customer_idnumber").getValue()
        //    || !Xrm.Page.getAttribute("el_s_customer_mobile_phone").getValue() || !Xrm.Page.getAttribute("el_dt_license_expires_on") || !Xrm.Page.getAttribute("el_s_driver_license_number").getValue()
        //    || !Xrm.Page.getAttribute("el_dt_actual_start").getValue() || !Xrm.Page.getAttribute("el_n_km_start").getValue() /*|| !Xrm.Page.getAttribute("el_n_year").getValue()*/) {
        //    Xrm.Page.getControl("el_s_signature").setDisabled(true);
        //}
        //if (!Xrm.Page.getAttribute("el_s_signature").getValue() || !Xrm.Page.getAttribute("el_dt_actual_end").getValue() || !Xrm.Page.getAttribute("el_n_km_end").getValue())
        //    Xrm.Page.getControl("el_s_signature_after").setDisabled(true);
    }

    showHideOnCarFleetForm(true);

}

function updateSignatureFields() {
    if (isTablet) {
        if (Xrm.Page.getAttribute("el_s_customer_first_name").getValue() && Xrm.Page.getAttribute("el_s_customer_last_name").getValue() && Xrm.Page.getAttribute("el_s_customer_idnumber").getValue()
                && Xrm.Page.getAttribute("el_s_customer_mobile_phone").getValue() && ((Xrm.Page.getAttribute("el_dt_license_expires_on") && Xrm.Page.getAttribute("el_s_driver_license_number").getValue()) || Xrm.Page.getAttribute("el_b_international_license").getValue())
                && Xrm.Page.getAttribute("el_dt_actual_start").getValue() && Xrm.Page.getAttribute("el_n_km_start").getValue()/* && Xrm.Page.getAttribute("el_n_year").getValue()   The Field isn't in USE */) {
            Xrm.Page.getControl("el_s_signature").setDisabled(false);
        }
        if (Xrm.Page.getAttribute("el_s_signature").getValue() && Xrm.Page.getAttribute("el_dt_actual_end").getValue() && Xrm.Page.getAttribute("el_n_km_end").getValue())
            Xrm.Page.getControl("el_s_signature_after").setDisabled(false);
    }
}


function ribbonOpenDoc(urlField) {
    var url = Xrm.Page.getAttribute(urlField);
    if (url && url.getValue()) {
        //window.open("file:" + url.getValue());
        var win = window.open(Xrm.Page.context.getClientUrl() + '/webresources/el_open_document.htm?data=' + encodeURIComponent(url.getValue()), "_blank", "status=0,resizable=1,top=100,left=100,width=400px,height=300px");

    }
}
