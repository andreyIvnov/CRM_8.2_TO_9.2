(function (el_sales_docs) {
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
    var commons;
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

    el_sales_docs.setManufacturerType = function() {
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






    

    el_sales_docs.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_sales_docs.onLoadEvents();

            el_sales_docs.onChangeEvents();

        } catch (error) {
            commons.PageErrorHandler(error, "el_sales_docs.onLoad")
        }
    }

    el_sales_docs.onLoadEvents = function () {

        el_sales_docs.getManufacturerAffiliation()
            .then(
                success => {
                    if (commons.GetFormType() == Enum.FormType.Create) {
                        el_sales_docs.setDocsSectionsVisibility();
                        el_sales_docs.setDocumentFieldsVisibilityAccording2Manufacturer();
                    }
                    else {
                        if (commons.GetFieldValue("el_b_digital_document")) {
                            commons.SetTabVisibility("tab_digitalsigning", true);
                        }
                    }
                }
            );


        if (commons.GetFormType() == Enum.FormType.Create) {

            el_sales_docs.setMainField();
            el_sales_docs.setAccountType();
            el_sales_docs.setManufacturerType();
            el_sales_docs.setDocsFields();
            el_sales_docs.setNoscanDoc();
            el_sales_docs.hideField();
            el_sales_docs.ZeroKMVehicleLogic();
        }
        else {
            if (commons.GetFieldValue("el_b_digital_document")) {
                commons.SetTabVisibility("tab_digitalsigning", true);
            }
        }
    }
    
    el_sales_docs.setDocumentFieldsVisibilityAccording2Manufacturer = function () {
        const manufName = commons.GetLookupName("el_id_manufacturer");
        if (manufName) {
            switch (manufName) {
                case "FORD":
                    el_sales_docs.docFieldFORD();
                    break;
                case "BMW":
                    el_sales_docs.docFieldBMW();
                    el_sales_docs.docFieldMINI();
                    break;
                case "BMC":
                    el_sales_docs.docFieldBMC();
                    break;
                case "NIO":
                    el_sales_docs.docFieldNIO();
                    break;
                case "DONGFENG":
                    el_sales_docs.SetDocFieldsForDONGFENG();
                    break;
                default:
                    if (manufacturerAffiliation != null && manufacturerAffiliation.isEurodriveManufacturer == true) {
                        manufacturerAffiliation.isOperationalManufacturer == true ? el_sales_docs.setFieldEurodriveOperational() : el_sales_docs.setFieldEurodriveGeneral();
                    }
                    break;
            }
        }
    }

    el_sales_docs.setFieldEurodriveGeneral = function () {
        const manufacturer = commons.GetLookupName("el_id_manufacturer") ?? "Undefined";
        const fields2Show = ["el_b_eurodrive_order_attache_general"];
        const fields2Hide = ["el_b_car_order_appendix"];
        if (manufacturer == "ZONTES") {
            const zontesFields2Show = ["el_b_cobra_motorcycle", "el_b_exibit_car_customer_declaration_zont"];
            const zontesFields2Hide = ["el_b_exibit_car_customer_declaration"];
            el_sales_docs.SetFieldsVisibility(zontesFields2Show, true);
            el_sales_docs.SetFieldsVisibility(zontesFields2Hide, false);
        }
        el_sales_docs.SetFieldsVisibility(fields2Show, true);
        el_sales_docs.SetFieldsVisibility(fields2Hide, false);
    }

    el_sales_docs.setFieldEurodriveOperational = function () {
        commons.SetVisible("el_b_eurodrive_order_attache_operational", true);
        commons.SetVisible("el_b_declaration_form_4_operational_vehicle", true);
        commons.SetVisible("el_b_warranty_terms_for_operational_vehicle", true);
    }

    //To Check -> Retrieve
    el_sales_docs.getManufacturerAffiliation = function () {
        return new Promise((resolve, reject) => {
            try {
                // var url = "el_manufacturerSet?$select=el_b_eurodrive_manufacturer,el_name,el_b_operational_manufacturer&$filter=el_manufacturerId eq guid'" + manufacturerId + "'";
                // var manufacturer = oDataUtilExternal.RetrieveDataByUrl("", url, null, null, true);
                const manufId = commons.StripGuid(commons.GetLookupId("el_id_manufacturer"));
                commons.RetrieveRecord("el_manufacturer", manufId, "?$select=el_b_eurodrive_manufacturer,el_name,el_b_operational_manufacturer")
                    .then(
                        function success (result){
                            if (result) {
                                manufacturerAffiliation = {
                                    isEurodriveManufacturer: result.el_b_eurodrive_manufacturer == null ? false : result.el_b_eurodrive_manufacturer,
                                    isOperationalManufacturer: result.el_b_operational_manufacturer == null ? false : result.el_b_operational_manufacturer
                                }
                            }
                        },
                        err => commons.SetFormNotification("Error on retrievent el_manufacturer into el_sales_docs.getManufacturerAffiliation: " + err.message)
                    )
            } catch (error) {
                commons.PageErrorHandler(error, "el_sales_docs.getManufacturerAffiliation")
            }
        })
    }

    el_sales_docs.setAllSectionsInTabVisibility = function (tabName, isVisible) {
        const tab = commons.GetTab(tabName);
        if (tab) {
            const sections = tab.sections.get();
            for (let i = 0; i < sections.length; i++) {
                sections[i].setVisible(isVisible);
            }
        }
    }

    el_sales_docs.docFieldFORD = function () {

        commons.SetVisible("el_b_proforma_commercial_department", true);
        commons.SetVisible("el_b_proforma_vehicle_not_in_israel_cd", true);
        commons.SetVisible("el_b_ford_bronco_convertible_top", true);
        commons.SetVisible("el_b_bronco_accessories_without_installation", true);
        commons.SetVisible("el_b_loan_leumi_van", true);
        commons.SetVisible("el_b_loan_hapoalim_commercial_car", true);
        commons.SetVisible("el_b_loan_leumi_van_heavy_subsidized_0_km", true);
        commons.SetVisible("el_b_towinghook_for_ranger", true);
        commons.SetVisible("el_b_no_key", true);
        commons.SetVisible("el_b_leumi_loan_reference_light_subsidized", true);
        commons.SetVisible("el_b_leumi_loan_reference_heavy_subsidized", true);
        commons.SetVisible("el_b_loan_leumi_van_heavy_subsidized_0_km", true);

        if (commons.GetFieldValue("el_l_customer_type") == CUSTOMER_TYPE_GENERAL_EXEMPT) {
            commons.SetVisible("el_b_airconditioner_transit_combi", true);
        }

    }

    el_sales_docs.docFieldBMW = function () {
        var relatedOppEntRef = commons.GetLookupFieldValue("el_id_opportunity");
        var MINI_sub_manufacturer = 1;
        var fieldsOfBMW = ["el_b_sim_card_cancellation_connected_drive", "el_b_information_to_customer_with_cd", "el_b_siging_contract_for_car_with_cd"];
        var relatedOpp = oDataUtil.RetrieveData("OpportunitySet", relatedOppEntRef.id, "el_id_family", null, null, null, false);
        if (relatedOpp != null && relatedOpp.el_id_family != null) {
            var familyOfRelatedOpp = oDataUtil.RetrieveData("el_familySet", relatedOpp.el_id_family.Id, "el_l_sub_manufacturer", null, null, null, false);
            if (familyOfRelatedOpp != null && familyOfRelatedOpp.el_l_sub_manufacturer.Value == null) {
                el_sales_docs.SetFieldsVisibility(fieldsOfBMW, true)
            }
            else if (familyOfRelatedOpp.el_l_sub_manufacturer.Value == MINI_sub_manufacturer) {
                el_sales_docs.SetFieldsVisibility(fieldsOfBMW, false)
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

    el_sales_docs.docFieldNIO = function () {
        Xrm.Page.getControl("el_b_connected_car_services_nio").setVisible(true);
        Xrm.Page.getControl("el_b_sim_connection_for_nio").setVisible(true);
        Xrm.Page.getControl("el_b_service_package_policy_nio").setVisible(true);
    }

    el_sales_docs.docFieldBMC = function () {
        Xrm.Page.getControl("el_b_cobra_motorcycle").setVisible(true);
    }

    el_sales_docs.docFieldZontes = function () {
        var zontesFields2Show = ["el_b_cobra_motorcycle", "el_b_exibit_car_customer_declaration_zont"];
        var zontesFields2Hide = ["el_b_exibit_car_customer_declaration"];
        el_sales_docs.SetFieldsVisibility(zontesFields2Show, true);
        el_sales_docs.SetFieldsVisibility(zontesFields2Hide, false);
    }



    el_sales_docs.onChangeEvents = function () {
        Xrm.Page.getAttribute("el_b_credit_card_charge").addOnChange(el_sales_docs.setNoscanDoc);
        Xrm.Page.getAttribute("el_b_bank_account_charge").addOnChange(el_sales_docs.setNoscanDoc);
    }


    el_sales_docs.setNoscanDoc = function () {
        var el_b_credit_card_charge = Xrm.Page.getAttribute("el_b_credit_card_charge").getValue();
        var el_b_bank_account_charge = Xrm.Page.getAttribute("el_b_bank_account_charge").getValue();
        Xrm.Page.getAttribute("el_b_template_no_scan").setValue(el_b_credit_card_charge || el_b_bank_account_charge);
    }

    el_sales_docs.setDocsSectionsVisibility = function () {
        var customerType = Xrm.Page.getAttribute("el_l_customer_type").getValue();
        var tab = Xrm.Page.ui.tabs.get("tab_docs");
        tab.setVisible(true);
        el_sales_docs.setAllSectionsInTabVisibility("tab_docs", false);
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


    el_sales_docs.setAllAttributesValuesInTabToFalse = function (tabName) {
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

    el_sales_docs.setAllAttributesValuesInSectionToFalse = function (sectionLabel) {
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

    el_sales_docs.setDocsFields = function () {
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

    el_sales_docs.setDocsFieldsConfirmationCase = function () {
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

    el_sales_docs.setAccountType = function () {
        var customerType = Xrm.Page.getAttribute("el_l_customer_type");
        var OdataUtilObj = new OdataUtil();
        var accountid = Xrm.Page.getAttribute("el_id_account").getValue()[0].id;
        var account = OdataUtilObj.RetrieveDataByUrl("", "AccountSet?$select=el_id_type_account/el_n_id_type_code&$expand=el_id_type_account&$filter=AccountId eq guid'" + accountid + "'", null, null, false);
        if (account && account.results && account.results[0] && account.results[0].el_id_type_account && account.results[0].el_id_type_account.el_n_id_type_code) {
            if (typeof account.results[0].el_id_type_account.el_n_id_type_code == "number")
                customerType.setValue(account.results[0].el_id_type_account.el_n_id_type_code);
        }
    }



    el_sales_docs.setMainField = function () {
        var name = "מסמכי מכירות עבור תהליך מכירה: ";
        var opportunity = Xrm.Page.getAttribute("el_id_opportunity");
        if (opportunity && opportunity.getValue()) {
            name += opportunity.getValue()[0].name;
        }
        Xrm.Page.getAttribute("el_name").setValue(name);
    }

    el_sales_docs.hideField = function () {
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

        el_sales_docs.SetFieldsVisibility(generalFields, false);
        el_sales_docs.SetFieldsVisibility(manufacturerFord, false);
        el_sales_docs.SetFieldsVisibility(manufacturerBMW, false);
        el_sales_docs.SetFieldsVisibility(manufacturerBMC, false);
        el_sales_docs.SetFieldsVisibility(manufacturerNio, false);
        el_sales_docs.SetFieldsVisibility(manufacturerEurodriveOperational, false);
        el_sales_docs.SetFieldsVisibility(manufacturerEurodriveGeneral, false);
        el_sales_docs.SetFieldsVisibility(manufacturerDonfeng, false);
        el_sales_docs.SetFieldsVisibility(manufacturerZontes, false);
    }

    /**
     * Set documents names by SubManufacturer MINI.
     * TASK 1232
     */
    el_sales_docs.docFieldMINI = function () {
        var relatedOppEntRef = commons.GetLookupFieldValue("el_id_opportunity");
        var MINI_sub_manufacturer = 1;
        var fieldsOfMINI = ["el_b_canceling_a_sim_card_mini_connected", "el_b_mini_connected_system_information_form", "el_b_mini_connected_privacy_policy_info_form",
            "el_b_car_with_connected_contract_drive_mini"];

        if (CURRENT_MANUFACTURER_NAME == null && commons.GetLookupFieldValue("el_id_manufacturer") != null) {
            CURRENT_MANUFACTURER_NAME = commons.GetLookupFieldValue("el_id_manufacturer").name;
        }
        if (CURRENT_MANUFACTURER_NAME == Const.Manufacturer.BMW && relatedOppEntRef != null) {
            //Check if is Sub Manufacturer MINI
            var relatedOpp = oDataUtil.RetrieveData("OpportunitySet", relatedOppEntRef.id, "el_id_family", null, null, null, false);
            if (relatedOpp != null && relatedOpp.el_id_family != null) {
                var familyOfRelatedOpp = oDataUtil.RetrieveData("el_familySet", relatedOpp.el_id_family.Id, "el_l_sub_manufacturer", null, null, null, false);
                if (familyOfRelatedOpp != null && familyOfRelatedOpp.el_l_sub_manufacturer != null && familyOfRelatedOpp.el_l_sub_manufacturer.Value == MINI_sub_manufacturer) {
                    //Only if sub manufacturer of related family is MINI
                    el_sales_docs.SetFieldsVisibility(fieldsOfMINI, true)
                }
                else
                    el_sales_docs.SetFieldsVisibility(fieldsOfMINI, false)
            }
            else
                el_sales_docs.SetFieldsVisibility(fieldsOfMINI, false)
        }
        else {
            el_sales_docs.SetFieldsVisibility(fieldsOfMINI, false)
        }
    }

    /**
     * Method Set fields visibility.
     * @param {Array} fieldsArr 
     * @param {bool} visible 
     */
    el_sales_docs.SetFieldsVisibility = function (fieldsArr, visible) {
        if (Object.prototype.toString.call(fieldsArr) !== '[object Array]')
            return;

        for (var i = 0; i < fieldsArr.length; i++) {
            commons.SetFieldVisibility(fieldsArr[i], visible);
        }
    }

    /**
     * Section for new car 0 KM logic
     */
    el_sales_docs.ZeroKMVehicleLogic = function () {
        var isNewZeroKMCar = el_sales_docs.GetCarPurchaseFirstHandFieldValue();

        if (isNewZeroKMCar == true) {
            commons.SetFieldValue("el_b_car_order_appendix", null);
            el_sales_docs.SetFieldsVisibility(["el_b_car_order_appendix", "el_b_new_car_warranty"], false);
            commons.ToggleSection("tab_docs", "tab_docs_section_firstHand", true)
        } else {
            commons.SetFieldValue("el_b_annex_to_the_order_0km", false);
            commons.ToggleSection("tab_docs", "tab_docs_section_firstHand", false)
        }
    }

    /**
     * Method check if car purchase with same related Opportunity ID is exist.
     * @returns value of el_b_first_hand field from related car purchase
     */
    el_sales_docs.GetCarPurchaseFirstHandFieldValue = function () {
        var isNewZeroKMCar = false;
        var relatedOppEntRef = commons.GetLookupFieldValue("el_id_opportunity");

        if (relatedOppEntRef != null) {
            var url = "el_car_purchaseSet?$select=el_b_first_hand&" +
                "$filter=el_id_opportunity/Id eq guid'" + relatedOppEntRef.id + "'" +   //With same Opportunity like on el_id_opportunity
                "and statecode/Value eq 0";                                             // Only Active records of car purchases

            var results = oDataUtil.RetrieveDataByUrl("", url, null, el_sales_docs.errorCallbackForRetrievings, true);
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
    el_sales_docs.errorCallbackForRetrievings = function (data, textStatus, errorThrown) {
        var message = "errorCallbackForRetrievings: " + errorThrown;
        if (commons != null && errorThrown != null)
            commons.SetFormNotification(message, "ERROR", "errorCallbackForRetrievings");
        else
            console.log(message);
    }

    el_sales_docs.SetDocFieldsForDONGFENG = function () {
        var fieldsOfDONGFENG = ["el_b_dongfeng_car_ordering_appendix", "el_b_hero_car_ordering_appendix", "el_b_voyah_car_ordering_appendix",
            "el_b_new_car_warranty_dongfendbox", "el_b_new_car_warranty_voyah", "el_b_new_car_warranty_mhero"];
        var fieldsToHide = ["el_b_car_order_appendix", "el_b_new_car_warranty"];
        if (CURRENT_MANUFACTURER_NAME == null && commons.GetLookupFieldValue("el_id_manufacturer") != null) {
            CURRENT_MANUFACTURER_NAME = commons.GetLookupFieldValue("el_id_manufacturer").name;
        }
        if (CURRENT_MANUFACTURER_NAME == Const.Manufacturer.DONGFENG) {
            el_sales_docs.SetFieldsVisibility(fieldsOfDONGFENG, true);
            //Other fields logic
            commons.SetFieldValue("el_b_car_order_appendix", false);
            commons.SetFieldValue("el_b_new_car_warranty", false);
            el_sales_docs.SetFieldsVisibility(fieldsToHide, false);
        }
    }


    el_sales_docs.GetDocFieldFormSalesDoc = function () {
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


    el_sales_docs.Ribon = el_sales_docs.Ribon || {};

    el_sales_docs.Ribon.ribbonOpenDoc = function () {

        if (Xrm.Page.getAttribute("el_s_doc_url") != null && Xrm.Page.getAttribute("el_s_doc_url").getValue() != null) {
            var url = Xrm.Page.getAttribute("el_s_doc_url").getValue();

            var win = window.open(Xrm.Page.context.getClientUrl() + '/webresources/el_open_document.htm?data=' + encodeURIComponent(url), "_blank",
                "status=0,resizable=1,top=100,left=100,width=400px,height=300px");
        }

    }

    el_sales_docs.Ribon.ribbonGenerateDocs = function () {
        Xrm.Page.getAttribute("el_b_generate_document").setValue(true);
        Xrm.Page.data.entity.save();
    }

    el_sales_docs.Ribon.openDigitalDocument = function () {
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


    el_sales_docs.Ribon.EnableRules = el_sales_docs.Ribon.EnableRules || {};

    el_sales_docs.Ribon.EnableRules.sendDocuments4signEnableRule = function () {
        commons = new elad_commons();
        oDataUtil = new commons.OdataUtil();
        var opportunityId = Xrm.Page.getAttribute("el_id_opportunity").getValue()[0].id.replace(/[{}]/g, "").toLowerCase();
        var showroom = oDataUtil.RetrieveDataByUrl("OpportunitySet", "?$select=el_showroom_opportunity/el_b_send_documents4sign&$expand=el_showroom_opportunity&$filter=OpportunityId eq guid'" +
            opportunityId + "'", null, null, false);
        return showroom.results[0].el_showroom_opportunity.el_b_send_documents4sign == true ? true : false;
    }

})(window.el_sales_docs = window.el_sales_docs || {})
