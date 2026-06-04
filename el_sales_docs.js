
var FORMSTATE_CREATE = 1;
var MANUFACTURER_BMW = 1;
var MANUFACTURER_MAZDA = 2;
var MANUFACTURER_FORD = 3;
var MANUFACTURER_BMC = 5;
var MANUFACTURER_NIO = 7;
var MANUFACTURER_DONGFENG = 8;
var MANUFACTURER_CLUB_CAR = 9;
var MANUFACTURER_LVTONG = 10;
var MANUFACTURER_HDK = 11;
var MANUFACTURER_ZONTES = 12;
var MANUFACTURER_AEON = 13;
var MANUFACTURER_AODES = 14;
var MANUFACTURER_TGB = 15;

var CUSTOMER_TYPE_REGULAR = 1;
var CUSTOMER_TYPE_TOURIST = 2;
var CUSTOMER_TYPE_GENERAL_EXEMPT = 4;
var CUSTOMER_TYPE_DIPLOMAT = 5;
var CUSTOMER_TYPE_IMMIGRANT = 7;
var CUSTOMER_TYPE_MOD = 10;
var CUSTOMER_TYPE_TAXY = 9;
var formContext;
var common;
var oDataUtil;
var oDataUtilExternal;
var CURRENT_MANUFACTURER_NAME;
var manufacturerAffiliation = null;
//commons
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
function hideAllControlsInTab(tabControlNo) {
    /// <summary>
    /// Disable all controls in a tab by tab number.
    /// </summary>
    /// <param name="tabControlNo" type="int">
    /// The number of the tab
    /// </param>
    /// <returns type="void" />
    var tabControl = Xrm.Page.ui.tabs.get(tabControlNo);
    if (tabControl != null) {
        Xrm.Page.ui.controls.forEach(
            function (control) {
                if (control && control.getParent() && control.getParent().getParent() === tabControl && control.getControlType() != "subgrid") {
                    control.setVisible(false);
                }
            });
    }
}

function disableAllControlsInTab(tabControlNo) {
    /// <summary>
    /// Disable all controls in a tab by tab number.
    /// </summary>
    /// <param name="tabControlNo" type="int">
    /// The number of the tab
    /// </param>
    /// <returns type="void" />
    var tabControl = Xrm.Page.ui.tabs.get(tabControlNo);
    if (tabControl != null) {
        Xrm.Page.ui.controls.forEach(
            function (control) {
                if (control && control.getParent() && control.getParent().getParent() === tabControl && control.getControlType() != "subgrid") {
                    control.setDisabled(true);
                }
            });
    }
}

function setManufacturerType() {
    var manufacturer = Xrm.Page.getAttribute("el_id_manufacturer");
    var el_l_manufacturer = Xrm.Page.getAttribute("el_l_manufacturer");
    if (manufacturer && manufacturer.getValue()) {
        CURRENT_MANUFACTURER_NAME = manufacturer.getValue()[0].name;
        switch (manufacturer.getValue()[0].name) {
            case "BMW":
                el_l_manufacturer.setValue(MANUFACTURER_BMW);
                break;
            case "BMC":
                el_l_manufacturer.setValue(MANUFACTURER_BMC);
                break;
            case "MAZDA":
                el_l_manufacturer.setValue(MANUFACTURER_MAZDA);
                break;
            case "FORD":
                el_l_manufacturer.setValue(MANUFACTURER_FORD);
                break;
            case "NIO":
                el_l_manufacturer.setValue(MANUFACTURER_NIO);
                break;
            case "DONGFENG":
                el_l_manufacturer.setValue(MANUFACTURER_DONGFENG);
                break;
            case "CLUB CAR":
                el_l_manufacturer.setValue(MANUFACTURER_CLUB_CAR);
                break;
            case "LVTONG":
                el_l_manufacturer.setValue(MANUFACTURER_LVTONG);
                break;
            case "HDK":
                el_l_manufacturer.setValue(MANUFACTURER_HDK);
                break;
            case "ZONTES":
                el_l_manufacturer.setValue(MANUFACTURER_ZONTES);
                break;
            case "AEON":
                el_l_manufacturer.setValue(MANUFACTURER_AEON);
                break;
            case "AODES":
                el_l_manufacturer.setValue(MANUFACTURER_AODES);
                break;
            case "TGB":
                el_l_manufacturer.setValue(MANUFACTURER_TGB);
                break;
        }
    }
}


//commons - end 
function salesDoc_onLoad(executionContext) {
    debugger
    formContext = executionContext.getFormContext();
    common = new elad_commons(formContext);
    oDataUtilExternal = new common.OdataUtil();
    oDataUtil = new common.OdataUtil();
    try {
        docAssignEventActions();
        getManufacturerAffiliation();
        if (Xrm.Page.ui.getFormType() == FORMSTATE_CREATE) {
            setMainField();
            setAccountType();
            setManufacturerType();
            setDocsFields();
            setDocsSectionsVisibility();
            setNoscanDoc();
            hideField();
            setDocumentFieldsVisibilityAccording2Manufacturer();
            ZeroKMVehicleLogic();

        }
        else {
            var attrIsDigital = Xrm.Page.getAttribute("el_b_digital_document");
            if (attrIsDigital != null && attrIsDigital.getValue()) {
                Xrm.Page.ui.tabs.get("tab_digitalsigning").setVisible(true);
            }
        }

    } catch (error) {
        console.error(error);
        common.SetFormNotification("ERROR on salesDoc_onLoad(): " + error.message, "ERROR", "salesDoc_onLoad");
    }

}
function setDocumentFieldsVisibilityAccording2Manufacturer() {
    var manufacturer = Xrm.Page.getAttribute("el_id_manufacturer").getValue();
    if (manufacturer != null && manufacturer[0] != null && manufacturer[0].name) {
        switch (manufacturer[0].name) {
            case "FORD":
                docFieldFORD();
                break;
            case "BMW":
                docFieldBMW();
                docFieldMINI();
                break;
            case "BMC":
                docFieldBMC();
                break;
            case "NIO":
                docFieldNIO();
                break;
            case "DONGFENG":
                SetDocFieldsForDONGFENG();
                break;
            default:
                if (manufacturerAffiliation != null && manufacturerAffiliation.isEurodriveManufacturer == true) {
                    manufacturerAffiliation.isOperationalManufacturer == true ? setFieldEurodriveOperational() : setFieldEurodriveGeneral();
                }
                break;
        }
    }
}

function setFieldEurodriveGeneral() {
    var manufacturer = Xrm.Page.getAttribute("el_id_manufacturer").getValue() != null ?
        Xrm.Page.getAttribute("el_id_manufacturer").getValue()[0].name : "Undefined";
    var fields2Show = ["el_b_eurodrive_order_attache_general"];
    var fields2Hide = ["el_b_car_order_appendix"];
    if (manufacturer == "ZONTES") {
        var zontesFields2Show = ["el_b_cobra_motorcycle", "el_b_exibit_car_customer_declaration_zont"];
        var zontesFields2Hide = ["el_b_exibit_car_customer_declaration"];
        SetFieldsVisibility(zontesFields2Show, true);
        SetFieldsVisibility(zontesFields2Hide, false);
    }
    SetFieldsVisibility(fields2Show, true);
    SetFieldsVisibility(fields2Hide, false);
}

function setFieldEurodriveOperational() {
    Xrm.Page.getControl("el_b_eurodrive_order_attache_operational").setVisible(true);
    Xrm.Page.getControl("el_b_declaration_form_4_operational_vehicle").setVisible(true);
    Xrm.Page.getControl("el_b_warranty_terms_for_operational_vehicle").setVisible(true);
}

function getManufacturerAffiliation() {
    var manufacturerId = Xrm.Page.getAttribute("el_id_manufacturer").getValue()[0].id;
    var url = "el_manufacturerSet?$select=el_b_eurodrive_manufacturer,el_name,el_b_operational_manufacturer&$filter=el_manufacturerId eq guid'" + manufacturerId + "'";
    var manufacturer = oDataUtilExternal.RetrieveDataByUrl("", url, null, null, true);
    if (manufacturer && manufacturer.results && manufacturer.results[0]) {
        manufacturerAffiliation = {
            isEurodriveManufacturer: manufacturer.results[0].el_b_eurodrive_manufacturer == null ? false : manufacturer.results[0].el_b_eurodrive_manufacturer,
            isOperationalManufacturer: manufacturer.results[0].el_b_operational_manufacturer == null ? false : manufacturer.results[0].el_b_operational_manufacturer
        }
    }
}




function setAllSectionsInTabVisibility(tabName, isVisible) {
    var tab = Xrm.Page.ui.tabs.get(tabName);
    if (tab) {
        var sections = tab.sections.get();
        for (var i = 0; i < sections.length; i++) {
            sections[i].setVisible(isVisible);
        }
    }
}




function docFieldFORD() {
    var customerType = Xrm.Page.getAttribute("el_l_customer_type");
    Xrm.Page.getControl("el_b_proforma_commercial_department").setVisible(true);
    Xrm.Page.getControl("el_b_proforma_vehicle_not_in_israel_cd").setVisible(true);
    Xrm.Page.getControl("el_b_ford_bronco_convertible_top").setVisible(true);
    Xrm.Page.getControl("el_b_bronco_accessories_without_installation").setVisible(true);
    Xrm.Page.getControl("el_b_loan_leumi_van").setVisible(true);
    Xrm.Page.getControl("el_b_loan_hapoalim_commercial_car").setVisible(true);
    Xrm.Page.getControl("el_b_loan_leumi_van_heavy_subsidized_0_km").setVisible(true);
    if (customerType.getValue() == CUSTOMER_TYPE_GENERAL_EXEMPT) {
        Xrm.Page.getControl("el_b_airconditioner_transit_combi").setVisible(true);
    }
    Xrm.Page.getControl("el_b_towinghook_for_ranger").setVisible(true);
    Xrm.Page.getControl("el_b_no_key").setVisible(true);

    common.SetFieldVisibility("el_b_leumi_loan_reference_light_subsidized", true);
    common.SetFieldVisibility("el_b_leumi_loan_reference_heavy_subsidized", true);
    common.SetFieldVisibility("el_b_loan_leumi_van_heavy_subsidized_0_km", true);

}

function docFieldBMW() {
    var relatedOppEntRef = common.GetLookupFieldValue("el_id_opportunity");
    var MINI_sub_manufacturer = 1;
    var fieldsOfBMW = ["el_b_sim_card_cancellation_connected_drive", "el_b_information_to_customer_with_cd", "el_b_siging_contract_for_car_with_cd"];
    var relatedOpp = oDataUtil.RetrieveData("OpportunitySet", relatedOppEntRef.id, "el_id_family", null, null, null, false);
    if (relatedOpp != null && relatedOpp.el_id_family != null) {
        var familyOfRelatedOpp = oDataUtil.RetrieveData("el_familySet", relatedOpp.el_id_family.Id, "el_l_sub_manufacturer", null, null, null, false);
        if (familyOfRelatedOpp != null && familyOfRelatedOpp.el_l_sub_manufacturer.Value == null) {
            SetFieldsVisibility(fieldsOfBMW, true)
        }
        else if (familyOfRelatedOpp.el_l_sub_manufacturer.Value == MINI_sub_manufacturer) {
            SetFieldsVisibility(fieldsOfBMW, false)
        }
    }
    Xrm.Page.getControl("el_b_12_month_financing_policy_for_bmw").setVisible(true);
    Xrm.Page.getControl("el_b_power_attorney_check_insurance_history").setVisible(true);
    Xrm.Page.getControl("el_b_cobra_connecting_mobile_network_for_dvd").setVisible(false);
    Xrm.Page.getControl("el_b_cobra_connecting_cellular_network").setVisible(true);
    Xrm.Page.getControl("el_b_new_car_warranty_hybrid").setVisible(true);


    var opportunityid = Xrm.Page.getAttribute("el_id_opportunity").getValue()[0].id;
    var carPurchase = oDataUtil.RetrieveDataByUrl("", "el_car_purchaseSet?$select=el_b_first_hand&$filter=el_id_opportunity/Id eq guid'" + opportunityid + "'", null, null, false);
    if (carPurchase && carPurchase.results && carPurchase.results[0]) {
        if (carPurchase.results[0].el_b_first_hand == true) {
            Xrm.Page.getControl("el_b_new_car_warranty_hybrid").setVisible(false);
            Xrm.Page.getControl("el_b_new_car_warranty_hybrid1").setVisible(true);
        }
    }
}

function docFieldNIO() {
    Xrm.Page.getControl("el_b_connected_car_services_nio").setVisible(true);
    Xrm.Page.getControl("el_b_sim_connection_for_nio").setVisible(true);
    Xrm.Page.getControl("el_b_service_package_policy_nio").setVisible(true);
}

function docFieldBMC() {
    Xrm.Page.getControl("el_b_cobra_motorcycle").setVisible(true);
}

function docFieldZontes() {
    var zontesFields2Show = ["el_b_cobra_motorcycle", "el_b_exibit_car_customer_declaration_zont"];
    var zontesFields2Hide = ["el_b_exibit_car_customer_declaration"];
    SetFieldsVisibility(zontesFields2Show, true);
    SetFieldsVisibility(zontesFields2Hide, false);
}



function docAssignEventActions() {
    Xrm.Page.getAttribute("el_b_credit_card_charge").addOnChange(setNoscanDoc);
    Xrm.Page.getAttribute("el_b_bank_account_charge").addOnChange(setNoscanDoc);
}


function setNoscanDoc() {
    var el_b_credit_card_charge = Xrm.Page.getAttribute("el_b_credit_card_charge").getValue();
    var el_b_bank_account_charge = Xrm.Page.getAttribute("el_b_bank_account_charge").getValue();
    Xrm.Page.getAttribute("el_b_template_no_scan").setValue(el_b_credit_card_charge || el_b_bank_account_charge);
}

function setDocsSectionsVisibility() {
    var customerType = Xrm.Page.getAttribute("el_l_customer_type").getValue();
    var tab = Xrm.Page.ui.tabs.get("tab_docs");
    tab.setVisible(true);
    setAllSectionsInTabVisibility("tab_docs", false);
    if (manufacturerAffiliation.isEurodriveManufacturer && manufacturerAffiliation.isOperationalManufacturer) {
        tab.sections.get("tab_docs_section_eurodrive").setVisible(true);
    }
    else {
        tab.sections.get("tab_docs_section_standard").setVisible(true);
        tab.sections.get("tab_docs_section_general").setVisible(true);
        tab.sections.get("tab_docs_section_loan").setVisible(true);
        switch (customerType) {
            case CUSTOMER_TYPE_MOD:  //ministry_of_defence
                tab.sections.get("tab_docs_section_ministryOfDefenseExemption").setVisible(true);
                break;
            case CUSTOMER_TYPE_GENERAL_EXEMPT:  //social_security
                tab.sections.get("tab_docs_section_generalExemption").setVisible(true);
                break;
            case CUSTOMER_TYPE_IMMIGRANT:  //new_immigrant
                tab.sections.get("tab_docs_section_newImmigrant").setVisible(true);
                break;
            case CUSTOMER_TYPE_DIPLOMAT:  //diplomat
                tab.sections.get("tab_docs_section_diplomat").setVisible(true);
                break;
            case CUSTOMER_TYPE_TOURIST:  //tourist
                tab.sections.get("tab_docs_section_tourist").setVisible(true);
                break;
            case CUSTOMER_TYPE_TAXY:  //taxi
                tab.sections.get("tab_docs_section_taxi").setVisible(true);
                break;
        }
    }
}


function setAllAttributesValuesInTabToFalse(tabName) {
    var tabs = Xrm.Page.ui.tabs;
    for (var i = 0; i < tabs.getLength(); i++) {
        var tab = tabs.get(i);
        if (tab.getName().toLowerCase() === tabName.toLowerCase()) {
            var sections = tab.sections;
            for (var j = 0; j < sections.getLength(); j++) {
                var section = sections.get(j);
                Xrm.Page.ui.controls.forEach(
                    function (control) {
                        if (control && control.getParent() && control.getParent().getName() === section.getName() && control.getControlType() != "subgrid" && control.getAttribute()) {
                            control.getAttribute().setValue(false);
                            control.getAttribute().setSubmitMode("always");
                        }
                    });
                break;

            }
        }
        else {
            continue;
        }
    }
}

function setAllAttributesValuesInSectionToFalse(sectionLabel) {
    /// <summary>
    /// Disable all controls in a section by section label.
    /// </summary>
    /// <param name="sectionLabel" type="string">
    /// The label of the section
    /// </param>
    /// <returns type="void" />
    var tabs = Xrm.Page.ui.tabs;
    for (var i = 0; i < tabs.getLength(); i++) {
        var tab = tabs.get(i);
        var sections = tab.sections;
        for (var j = 0; j < sections.getLength(); j++) {
            var section = sections.get(j);
            if (section.getLabel().toLowerCase() === sectionLabel.toLowerCase()) {
                Xrm.Page.ui.controls.forEach(
                    function (control) {
                        if (control.getParent().getLabel() === sectionLabel && control.getControlType() != "subgrid") {
                            control.getAttribute().setValue(false);
                            control.getAttribute().setSubmitMode("always");
                        }
                    });
                break;
            }
        }
    }
}

function setDocsFields() {
    var OdataUtilObj = new OdataUtil();
    var result = OdataUtilObj.RetrieveDataByUrl("", "el_doc_templateSet?$select=el_b_checked,el_b_mandatory,el_l_customer_type,el_l_manufacturer,el_s_field_name,el_s_path&$filter=el_l_module/Value ne 2 and statecode/Value eq 0", null, null, false);
    if (result && result.results && result.results.length > 0) {
        for (var i = 0; i < result.results.length; i++) {
            if (result.results[i].el_s_field_name == null) {

                console.log("IN el_doc_template el_s_field_name -EMPTY");
                return;
            }
            console.log("Check:" + result.results[i].el_s_field_name + "לכלול אוטומטית:" + result.results[i].el_b_checked + "לא ניתן להסיר :" + result.results[i].el_b_mandatory);
            Xrm.Page.getAttribute(result.results[i].el_s_field_name).setValue(result.results[i].el_b_checked);
            Xrm.Page.getControl(result.results[i].el_s_field_name).setDisabled(result.results[i].el_b_mandatory);
            if (!result.results[i].el_s_path) {
                Xrm.Page.getAttribute(result.results[i].el_s_field_name).setValue(false);
                Xrm.Page.getControl(result.results[i].el_s_field_name).setDisabled(true);
            }

        }
    }

}

function setDocsFieldsConfirmationCase() {
    var OdataUtilObj = new OdataUtil();
    var result = OdataUtilObj.RetrieveDataByUrl("", "el_doc_templateSet?$select=el_b_checked,el_b_mandatory,el_l_customer_type,el_l_manufacturer,el_s_field_name,el_s_path&$filter=el_s_field_name eq 'ConfirmationCase'", null, null, false);
    if (result && result.results && result.results.length > 0) {
        for (var i = 0; i < result.results.length; i++) {
            if (!result.results[i].el_s_path) {
                Xrm.Page.getAttribute(result.results[i].el_s_field_name).setValue(false);
                Xrm.Page.getControl(result.results[i].el_s_field_name).setDisabled(true);
            }
        }
    }

}

function setAccountType() {
    var customerType = Xrm.Page.getAttribute("el_l_customer_type");
    var OdataUtilObj = new OdataUtil();
    var accountid = Xrm.Page.getAttribute("el_id_account").getValue()[0].id;
    var account = OdataUtilObj.RetrieveDataByUrl("", "AccountSet?$select=el_id_type_account/el_n_id_type_code&$expand=el_id_type_account&$filter=AccountId eq guid'" + accountid + "'", null, null, false);
    if (account && account.results && account.results[0] && account.results[0].el_id_type_account && account.results[0].el_id_type_account.el_n_id_type_code) {
        if (typeof account.results[0].el_id_type_account.el_n_id_type_code == "number")
            customerType.setValue(account.results[0].el_id_type_account.el_n_id_type_code);
    }
}



function setMainField() {
    var name = "מסמכי מכירות עבור תהליך מכירה: ";
    var opportunity = Xrm.Page.getAttribute("el_id_opportunity");
    if (opportunity && opportunity.getValue()) {
        name += opportunity.getValue()[0].name;
    }
    Xrm.Page.getAttribute("el_name").setValue(name);
}

function ribbonOpenDoc() {

    if (Xrm.Page.getAttribute("el_s_doc_url") != null && Xrm.Page.getAttribute("el_s_doc_url").getValue() != null) {
        var url = Xrm.Page.getAttribute("el_s_doc_url").getValue();

        var win = window.open(Xrm.Page.context.getClientUrl() + '/webresources/el_open_document.htm?data=' + encodeURIComponent(url), "_blank",
            "status=0,resizable=1,top=100,left=100,width=400px,height=300px");
    }

}

function sendDocuments4signEnableRule() {
    common = new elad_commons();
    oDataUtil = new common.OdataUtil();
    var opportunityId = Xrm.Page.getAttribute("el_id_opportunity").getValue()[0].id.replace(/[{}]/g, "").toLowerCase();
    var showroom = oDataUtil.RetrieveDataByUrl("OpportunitySet", "?$select=el_showroom_opportunity/el_b_send_documents4sign&$expand=el_showroom_opportunity&$filter=OpportunityId eq guid'" +
        opportunityId + "'", null, null, false);
    return showroom.results[0].el_showroom_opportunity.el_b_send_documents4sign == true ? true : false;
}

function hideField() {
    var generalFields = ["el_b_loan_hapoalim_with", "el_b_isracard", "el_b_navigation", "el_b_navigation_appendix", "el_b_credit_card_charge",
        "el_b_bank_account_charge", "el_b_cobra_connecting_mobile_network_for_dvd"];

    var manufacturerFord = ["el_b_proforma_commercial_department", "el_b_proforma_vehicle_not_in_israel_cd", "el_b_ford_bronco_convertible_top",
        "el_b_airconditioner_transit_combi", "el_b_bronco_accessories_without_installation", "el_b_towinghook_for_ranger",
        "el_b_no_key", "el_b_loan_leumi_van", "el_b_loan_hapoalim_commercial_car", "el_b_leumi_loan_reference_heavy_subsidized", "el_b_leumi_loan_reference_light_subsidized", "el_b_loan_leumi_van_heavy_subsidized_0_km"];

    var manufacturerBMW = ["el_b_12_month_financing_policy_for_bmw", "el_b_power_attorney_check_insurance_history", "el_b_sim_card_cancellation_connected_drive",
        "el_b_information_to_customer_with_cd", "el_b_siging_contract_for_car_with_cd", "el_b_cobra_connecting_cellular_network",
        "el_b_new_car_warranty_hybrid", "el_b_new_car_warranty_hybrid1"];

    var manufacturerBMC = ["el_b_cobra_motorcycle"];

    var manufacturerNio = ["el_b_connected_car_services_nio", "el_b_sim_connection_for_nio", "el_b_service_package_policy_nio"];

    var manufacturerEurodriveOperational = ["el_b_eurodrive_order_attache_operational",
        "el_b_warranty_terms_for_operational_vehicle", "el_b_declaration_form_4_operational_vehicle"];

    var manufacturerEurodriveGeneral = ["el_b_eurodrive_order_attache_general"];

    var manufacturerDonfeng = ["el_b_dongfeng_car_ordering_appendix", "el_b_hero_car_ordering_appendix", "el_b_voyah_car_ordering_appendix",
        "el_b_new_car_warranty_dongfendbox", "el_b_new_car_warranty_voyah", "el_b_new_car_warranty_mhero"];

    var manufacturerZontes = ["el_b_exibit_car_customer_declaration_zont"];

    SetFieldsVisibility(generalFields, false);
    SetFieldsVisibility(manufacturerFord, false);
    SetFieldsVisibility(manufacturerBMW, false);
    SetFieldsVisibility(manufacturerBMC, false);
    SetFieldsVisibility(manufacturerNio, false);
    SetFieldsVisibility(manufacturerEurodriveOperational, false);
    SetFieldsVisibility(manufacturerEurodriveGeneral, false);
    SetFieldsVisibility(manufacturerDonfeng, false);
    SetFieldsVisibility(manufacturerZontes, false);
}

function ribbonGenerateDocs() {
    Xrm.Page.getAttribute("el_b_generate_document").setValue(true);
    Xrm.Page.data.entity.save();
}

/**
 * Set documents names by SubManufacturer MINI.
 * TASK 1232
 */
function docFieldMINI() {
    var relatedOppEntRef = common.GetLookupFieldValue("el_id_opportunity");
    var MINI_sub_manufacturer = 1;
    var fieldsOfMINI = ["el_b_canceling_a_sim_card_mini_connected", "el_b_mini_connected_system_information_form", "el_b_mini_connected_privacy_policy_info_form",
        "el_b_car_with_connected_contract_drive_mini"];

    if (CURRENT_MANUFACTURER_NAME == null && common.GetLookupFieldValue("el_id_manufacturer") != null) {
        CURRENT_MANUFACTURER_NAME = common.GetLookupFieldValue("el_id_manufacturer").name;
    }
    if (CURRENT_MANUFACTURER_NAME == Const.Manufacturer.BMW && relatedOppEntRef != null) {
        //Check if is Sub Manufacturer MINI
        var relatedOpp = oDataUtil.RetrieveData("OpportunitySet", relatedOppEntRef.id, "el_id_family", null, null, null, false);
        if (relatedOpp != null && relatedOpp.el_id_family != null) {
            var familyOfRelatedOpp = oDataUtil.RetrieveData("el_familySet", relatedOpp.el_id_family.Id, "el_l_sub_manufacturer", null, null, null, false);
            if (familyOfRelatedOpp != null && familyOfRelatedOpp.el_l_sub_manufacturer != null && familyOfRelatedOpp.el_l_sub_manufacturer.Value == MINI_sub_manufacturer) {
                //Only if sub manufacturer of related family is MINI
                SetFieldsVisibility(fieldsOfMINI, true)
            }
            else
                SetFieldsVisibility(fieldsOfMINI, false)
        }
        else
            SetFieldsVisibility(fieldsOfMINI, false)
    }
    else {
        SetFieldsVisibility(fieldsOfMINI, false)
    }
}

/**
 * Method Set fields visibility.
 * @param {Array} fieldsArr 
 * @param {bool} visible 
 */
function SetFieldsVisibility(fieldsArr, visible) {
    if (Object.prototype.toString.call(fieldsArr) !== '[object Array]')
        return;

    for (var i = 0; i < fieldsArr.length; i++) {
        common.SetFieldVisibility(fieldsArr[i], visible);
    }
}

/**
 * Section for new car 0 KM logic
 */
function ZeroKMVehicleLogic() {
    var isNewZeroKMCar = GetCarPurchaseFirstHandFieldValue();

    if (isNewZeroKMCar == true) {
        common.SetFieldValue("el_b_car_order_appendix", null);
        SetFieldsVisibility(["el_b_car_order_appendix", "el_b_new_car_warranty"], false);
        common.ToggleSection("tab_docs", "tab_docs_section_firstHand", true)
    } else {
        common.SetFieldValue("el_b_annex_to_the_order_0km", false);
        common.ToggleSection("tab_docs", "tab_docs_section_firstHand", false)
    }
}

/**
 * Method check if car purchase with same related Opportunity ID is exist.
 * @returns value of el_b_first_hand field from related car purchase
 */
function GetCarPurchaseFirstHandFieldValue() {
    var isNewZeroKMCar = false;
    var relatedOppEntRef = common.GetLookupFieldValue("el_id_opportunity");

    if (relatedOppEntRef != null) {
        var url = "el_car_purchaseSet?$select=el_b_first_hand&" +
            "$filter=el_id_opportunity/Id eq guid'" + relatedOppEntRef.id + "'" +   //With same Opportunity like on el_id_opportunity
            "and statecode/Value eq 0";                                             // Only Active records of car purchases

        var results = oDataUtil.RetrieveDataByUrl("", url, null, errorCallbackForRetrievings, true);
        if (results != null && results.results != null && results.results[0] != null) {
            isNewZeroKMCar = results.results[0].el_b_first_hand;
        }
    }

    return isNewZeroKMCar;
}

/**
 * Method for callback of retrievings from metadata
 * @param {object} data 
 * @param {string} textStatus 
 * @param {string} errorThrown 
 */
function errorCallbackForRetrievings(data, textStatus, errorThrown) {
    var message = "errorCallbackForRetrievings: " + errorThrown;
    if (common != null && errorThrown != null)
        common.SetFormNotification(message, "ERROR", "errorCallbackForRetrievings");
    else
        console.log(message);
}

function openDigitalDocument() {
    try {
        Xrm.Page.getAttribute("el_b_digital_document").setValue(true);
        Xrm.Page.data.entity.save();
        var interval = setInterval(function () {
            var id = Xrm.Page.data.entity.getId();
            if (id) {
                clearInterval(interval);
                var printSalesDocId = id;  // ה-GUID של הדפסת מסמכים
                var printSalesDocName = Xrm.Page.data.entity.attributes.get("el_name").getValue();  //

                var parameters = {};
                parameters["el_id_print_sales_docs"] = printSalesDocId;
                parameters["el_s_title"] = "הפקה דיגיטלית עבור תהליך מכירה";

                var windowOptions = {
                    openInNewWindow: true
                };
                Xrm.Utility.openEntityForm("el_digital_signing_job", null, parameters, windowOptions);
            }
        }, 1000);

    } catch (error) {
        console.error("שגיאה במהלך פתיחת הטופס:", error.message);
        alert("הייתה שגיאה בעת פתיחת הטופס: " + error.message);

    }
}

function SetDocFieldsForDONGFENG() {
    var fieldsOfDONGFENG = ["el_b_dongfeng_car_ordering_appendix", "el_b_hero_car_ordering_appendix", "el_b_voyah_car_ordering_appendix",
        "el_b_new_car_warranty_dongfendbox", "el_b_new_car_warranty_voyah", "el_b_new_car_warranty_mhero"];
    var fieldsToHide = ["el_b_car_order_appendix", "el_b_new_car_warranty"];
    if (CURRENT_MANUFACTURER_NAME == null && common.GetLookupFieldValue("el_id_manufacturer") != null) {
        CURRENT_MANUFACTURER_NAME = common.GetLookupFieldValue("el_id_manufacturer").name;
    }
    if (CURRENT_MANUFACTURER_NAME == Const.Manufacturer.DONGFENG) {
        SetFieldsVisibility(fieldsOfDONGFENG, true);
        //Other fields logic
        common.SetFieldValue("el_b_car_order_appendix", false);
        common.SetFieldValue("el_b_new_car_warranty", false);
        SetFieldsVisibility(fieldsToHide, false);
    }
}


function GetDocFieldFormSalesDoc() {
    var OdataUtilObj = new OdataUtil();
    var result = OdataUtilObj.RetrieveDataByUrl("", "el_doc_templateSet?$select=el_s_field_name,el_doc_templateid&$filter=el_l_module/Value ne 2 and statecode/Value eq 0", null, null,
        false);
    if (result && result.results && result.results.length > 0) {
        for (var i = 0; i < result.results.length; i++) {
            if (result.results[i].el_s_field_name != null) {
                var attr = Xrm.Page.getAttribute(result.results[i].el_s_field_name);
                if (attr && attr.getValue() === true) {
                    var resultDocFields = OdataUtilObj.RetrieveDataByUrl("", "el_doc_fieldsSet?$select=el_b_agent_filling&$filter=el_id_doc_template/Id eq guid'" +
                        result.results.el_doc_templateid + "' and el_b_agent_filling eq true", null, null, false);
                    if (resultDocFields && resultDocFields.results && resultDocFields.results.length > 0) {

                    }
                }
            }
        }
    }
}

