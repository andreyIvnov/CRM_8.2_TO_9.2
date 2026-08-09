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
    var CUSTOMER_TYPE_TOURIST = 2;
    var CUSTOMER_TYPE_GENERAL_EXEMPT = 4;
    var CUSTOMER_TYPE_DIPLOMAT = 5;
    var CUSTOMER_TYPE_IMMIGRANT = 7;
    var CUSTOMER_TYPE_MOD = 10;
    var CUSTOMER_TYPE_TAXY = 9;
    var CURRENT_MANUFACTURER_NAME;
    
    var commons;
    var manufacturerAffiliation = null;

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

    el_sales_docs.onChangeEvents = function () {
        commons.AddOnChange("el_b_credit_card_charge", el_sales_docs.setNoscanDoc);
        commons.AddOnChange("el_b_bank_account_charge", el_sales_docs.setNoscanDoc);
    }

    el_sales_docs.setManufacturerType = function () {
        var manufacturerName =commons.GetLookupName("el_id_manufacturer");
        var el_l_manufacturer = commons.GetAttribute("el_l_manufacturer");
        if (manufacturerName) {
            CURRENT_MANUFACTURER_NAME = manufacturerName;
            switch (manufacturerName) {
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
        const fieldsOfFORD = [
            "el_b_proforma_commercial_department",
            "el_b_proforma_vehicle_not_in_israel_cd",
            "el_b_ford_bronco_convertible_top",
            "el_b_bronco_accessories_without_installation",
            "el_b_loan_leumi_van",
            "el_b_loan_hapoalim_commercial_car",
            "el_b_towinghook_for_ranger",
            "el_b_no_key",
            "el_b_leumi_loan_reference_light_subsidized",
            "el_b_leumi_loan_reference_heavy_subsidized",
            "el_b_loan_leumi_van_heavy_subsidized_0_km",
        ]

        if (commons.GetFieldValue("el_l_customer_type") == CUSTOMER_TYPE_GENERAL_EXEMPT) {
            fieldsOfFORD.push("el_b_airconditioner_transit_combi");
        }

        el_sales_docs.SetFieldsVisibility(fieldsOfFORD, true)
    }

    //To Check -> Retrieve
    el_sales_docs.docFieldBMW = async function () {
        try {
            const relatedOppId = commons.StripGuid(commons.GetLookupId("el_id_opportunity"));
            const MINI_sub_manufacturer = 1;
            const fieldsOfBMW = ["el_b_sim_card_cancellation_connected_drive", "el_b_information_to_customer_with_cd", "el_b_siging_contract_for_car_with_cd"];

            const relatedOpp = await commons.RetrieveRecord("opportunity", relatedOppId, "?$select=el_id_family");
            // var relatedOpp = oDataUtil.RetrieveData("OpportunitySet", relatedOppId, "el_id_family", null, null, null, false);

            if (relatedOpp && relatedOpp.el_id_family) {
                const familyOfRelatedOpp = await commons.RetrieveRecord("el_family", relatedOpp._el_id_family_value, "?$select=el_l_sub_manufacturer");
                if (familyOfRelatedOpp && familyOfRelatedOpp.el_l_sub_manufacturer) {
                    switch (familyOfRelatedOpp.el_l_sub_manufacturer.value) {
                        case MINI_sub_manufacturer:
                            el_sales_docs.SetFieldsVisibility(fieldsOfBMW, false)
                            break;

                        default:
                            el_sales_docs.SetFieldsVisibility(fieldsOfBMW, true)
                            break;
                    }
                }
            }

            commons.SetVisible("el_b_cobra_connecting_mobile_network_for_dvd", false);

            el_sales_docs.SetFieldsVisibility([
                "el_b_12_month_financing_policy_for_bmw",
                "el_b_power_attorney_check_insurance_history",
                "el_b_cobra_connecting_cellular_network",
                "el_b_new_car_warranty_hybrid",
            ], true);

            const carPurchasesRelatedToOpp = await commons.RetrieveMultipleRecords("el_car_purchase", "?$select=el_b_first_hand&$filter=_el_id_opportunity_value eq " + relatedOppId);
            // var carPurchase = oDataUtil.RetrieveDataByUrl("", "el_car_purchaseSet?$select=el_b_first_hand&$filter=el_id_opportunity/Id eq guid'" + relatedOppId + "'", null, null, false);
            if (carPurchasesRelatedToOpp && carPurchasesRelatedToOpp.length > 0) {
                if (carPurchase.el_b_first_hand === true) {
                    commons.SetVisible("el_b_new_car_warranty_hybrid", false);
                    commons.SetVisible("el_b_new_car_warranty_hybrid1", true);
                }
            }
        } catch (error) {
            commons.SetFormNotification("Error on el_sales_docs.docFieldBMW: " + error.message, commons.FormNotificationLevel.ERROR, "el_sales_docs.docFieldBMW");
        }
    }

    el_sales_docs.docFieldNIO = function () {
        el_sales_docs.SetFieldsVisibility(["el_b_connected_car_services_nio", "el_b_sim_connection_for_nio", "el_b_service_package_policy_nio"], true);
    }

    el_sales_docs.docFieldBMC = function () {
        commons.SetVisible("el_b_cobra_motorcycle", true);
    }

    el_sales_docs.docFieldZontes = function () {
        const zontesFields2Show = ["el_b_cobra_motorcycle", "el_b_exibit_car_customer_declaration_zont"];
        const zontesFields2Hide = ["el_b_exibit_car_customer_declaration"];
        el_sales_docs.SetFieldsVisibility(zontesFields2Show, true);
        el_sales_docs.SetFieldsVisibility(zontesFields2Hide, false);
    }

    el_sales_docs.setNoscanDoc = function () {
        const el_b_credit_card_charge = commons.GetFieldValue("el_b_credit_card_charge");
        const el_b_bank_account_charge = commons.GetFieldValue("el_b_bank_account_charge");
        commons.SetFieldValue("el_b_template_no_scan", (el_b_credit_card_charge || el_b_bank_account_charge));
    }

    el_sales_docs.setDocsSectionsVisibility = function () {
        const customerType = commons.GetFieldValue("el_l_customer_type");
        const tab = commons.GetTab("tab_docs");
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
        const tabs = commons.GetFormContext().ui.tabs;
        for (let i = 0; i < tabs.getLength(); i++) {
            const tab = tabs.get(i);
            if (tab.getName().toLowerCase() === tabName.toLowerCase()) {
                const sections = tab.sections;
                for (let j = 0; j < sections.getLength(); j++) {
                    const section = sections.get(j);
                    commons.GetFormContext().ui.controls.forEach(
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
        const tabs = commons.GetFormContext().ui.tabs;
        for (let i = 0; i < tabs.getLength(); i++) {
            const tab = tabs.get(i);
            const sections = tab.sections;
            for (let j = 0; j < sections.getLength(); j++) {
                const section = sections.get(j);
                if (section.getLabel().toLowerCase() === sectionLabel.toLowerCase()) {
                    commons.GetFormContext().ui.controls.forEach(
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

    //To Check -> retrieve
    el_sales_docs.setDocsFields = function () {
        // var result = OdataUtilObj.RetrieveDataByUrl("", "el_doc_templateSet?$select=el_b_checked,el_b_mandatory,el_l_customer_type,el_l_manufacturer,el_s_field_name,el_s_path&$filter=el_l_module/Value ne 2 and statecode/Value eq 0", null, null, false);
        commons.RetrieveMultipleRecords("el_doc_template", commons.Query("el_b_checked,el_b_mandatory,el_l_customer_type,el_l_manufacturer,el_s_field_name,el_s_path", "el_l_module ne 2 and statecode eq 0"))
            .then(
                function success(results) {
                    if (results && results.length > 0) {
                        for (let i = 0; i < result.length; i++) {
                            if (!results[i].el_s_field_name) {
                                console.log(`el_doc_template '${results[i].el_doc_templateid}':  el_s_field_name value is EMPTY`);
                                return;
                            }
                            console.log("Check el_doc_template: " + result.el_doc_templateid + "; לכלול אוטומטית: " + results[i].el_b_checked + "; לא ניתן להסיר : " + results[i].el_b_mandatory);
                            
                            commons.SetFieldValue(results[i].el_s_field_name, results[i].el_b_checked);
                            commons.SetDisabled(resultresults[i].el_s_field_name, results[i].el_b_mandatory);
    
                            if (!results[i].el_s_path) {
                                commons.SetFieldValue(results[i].el_s_field_name, false);
                                commons.SetDisabled(results[i].el_s_field_name, true);
                            }
                        }
                    }
                },
                err => commons.SetFormNotification("Erroor by retrieving el_doc_template int el_sales_docs.setDocsFields: " + err.message, commons.FormNotificationLevel.ERROR, "el_sales_docs.setDocsFields")
            )
    }

    //To Check -> Retrieve + Variables
    el_sales_docs.setDocsFieldsConfirmationCase = function () {
        // var result = OdataUtilObj.RetrieveDataByUrl("", "el_doc_templateSet?$select=el_b_checked,el_b_mandatory,el_l_customer_type,el_l_manufacturer,el_s_field_name,el_s_path&$filter=el_s_field_name eq 'ConfirmationCase'", null, null, false);
        commons.RetrieveMultipleRecords("el_doc_template", commons.Query("el_b_checked,el_b_mandatory,el_l_customer_type,el_l_manufacturer,el_s_field_name,el_s_path", "el_s_field_name eq 'ConfirmationCase'"))
            .then(
                function success(results) {
                    if (results && results.length > 0) {
                        for (let i = 0; i < results.length; i++) {
                            if (!results[i].el_s_path) {
                                commons.SetFieldValue(results[i].el_s_field_name, false);
                                commons.SetDisabled(results[i].el_s_field_name, true);
                            }
                        }
                    }
                },
                err => commons.SetFormNotification("Erroor by retrieving el_doc_template int el_sales_docs.setDocsFieldsConfirmationCase: " + err.message, commons.FormNotificationLevel.ERROR, "el_sales_docs.setDocsFieldsConfirmationCase")
            )
    }

    el_sales_docs.setAccountType = function () {
        // var account = OdataUtilObj.RetrieveDataByUrl("", "AccountSet?$select=el_id_type_account/el_n_id_type_code&$expand=el_id_type_account&$filter=AccountId eq guid'" + accountid + "'", null, null, false);
        commons.RetrieveRecord("account", "?$select=_el_id_type_account_value&$expand=el_id_type_code($select=el_n_id_type_code)")
            .then(
                function success(result){
                    if (result && result.el_id_type_account && result.el_id_type_account.el_n_id_type_code) {
                        if (typeof typeCode === "number") {
                            commons.SetFieldValue("el_l_customer_type", result.el_id_type_account.el_n_id_type_code);
                        }
                    }
                },
                err => commons.SetFormNotification("Erroor by retrieving Account int el_sales_docs.setAccountType: " + err.message, commons.FormNotificationLevel.ERROR, "el_sales_docs.setAccountType")
            )
    }

    el_sales_docs.setMainField = function () {
        const name = "מסמכי מכירות עבור תהליך מכירה: ";
        if (commons.GetLookupName("el_id_opportunity")) {
            name += commons.GetLookupName("el_id_opportunity");
        }
        commons.SetFieldValue("el_name", name);
    }

    el_sales_docs.hideField = function () {
        const generalFields = ["el_b_loan_hapoalim_with", "el_b_isracard", "el_b_navigation", "el_b_navigation_appendix", "el_b_credit_card_charge",
            "el_b_bank_account_charge", "el_b_cobra_connecting_mobile_network_for_dvd"];

        const manufacturerFord = ["el_b_proforma_commercial_department", "el_b_proforma_vehicle_not_in_israel_cd", "el_b_ford_bronco_convertible_top",
            "el_b_airconditioner_transit_combi", "el_b_bronco_accessories_without_installation", "el_b_towinghook_for_ranger",
            "el_b_no_key", "el_b_loan_leumi_van", "el_b_loan_hapoalim_commercial_car", "el_b_leumi_loan_reference_heavy_subsidized", "el_b_leumi_loan_reference_light_subsidized", "el_b_loan_leumi_van_heavy_subsidized_0_km"];

        const manufacturerBMW = ["el_b_12_month_financing_policy_for_bmw", "el_b_power_attorney_check_insurance_history", "el_b_sim_card_cancellation_connected_drive",
            "el_b_information_to_customer_with_cd", "el_b_siging_contract_for_car_with_cd", "el_b_cobra_connecting_cellular_network",
            "el_b_new_car_warranty_hybrid", "el_b_new_car_warranty_hybrid1"];

        const manufacturerBMC = ["el_b_cobra_motorcycle"];

        const manufacturerNio = ["el_b_connected_car_services_nio", "el_b_sim_connection_for_nio", "el_b_service_package_policy_nio"];

        const manufacturerEurodriveOperational = ["el_b_eurodrive_order_attache_operational",
            "el_b_warranty_terms_for_operational_vehicle", "el_b_declaration_form_4_operational_vehicle"];

        const manufacturerEurodriveGeneral = ["el_b_eurodrive_order_attache_general"];

        const manufacturerDonfeng = ["el_b_dongfeng_car_ordering_appendix", "el_b_hero_car_ordering_appendix", "el_b_voyah_car_ordering_appendix",
            "el_b_new_car_warranty_dongfendbox", "el_b_new_car_warranty_voyah", "el_b_new_car_warranty_mhero"];

        const manufacturerZontes = ["el_b_exibit_car_customer_declaration_zont"];

        el_sales_docs.SetFieldsVisibility([
            ...generalFields,
            ...manufacturerFord,
            ...manufacturerBMW,
            ...manufacturerBMC,
            ...manufacturerNio,
            ...manufacturerEurodriveOperational,
            ...manufacturerEurodriveGeneral,
            ...manufacturerDonfeng,
            ...manufacturerZontes,
        ], false);
    }

    /**
     * Set documents names by SubManufacturer MINI.
     * TASK 1232
     */
    el_sales_docs.docFieldMINI = async function () {
        try {
            const relatedOppId = commons.GetLookupId("el_id_opportunity");
            const MINI_sub_manufacturer = 1;
            const fieldsOfMINI = ["el_b_canceling_a_sim_card_mini_connected", "el_b_mini_connected_system_information_form", "el_b_mini_connected_privacy_policy_info_form",
                "el_b_car_with_connected_contract_drive_mini"];
    
            if (CURRENT_MANUFACTURER_NAME == null && commons.GetLookupName("el_id_manufacturer")) {
                CURRENT_MANUFACTURER_NAME = commons.GetLookupName("el_id_manufacturer");
            }
            if (CURRENT_MANUFACTURER_NAME == Const.Manufacturer.BMW && relatedOppId) {
                //Check if is Sub Manufacturer MINI
                
                const relatedOpp = await commons.RetrieveRecord("opportunity", relatedOppId, "?$select=el_id_family");
                // var relatedOpp = oDataUtil.RetrieveData("OpportunitySet", relatedOppId, "el_id_family", null, null, null, false);
                if (relatedOpp && relatedOpp.el_id_family) {
    
                    const familyOfRelatedOpp = await commons.RetrieveRecord("el_family", relatedOpp._el_id_family_value, "?$select=el_l_sub_manufacturer");
                    // var familyOfRelatedOpp = oDataUtil.RetrieveData("el_familySet", relatedOpp.el_id_family.Id, "el_l_sub_manufacturer", null, null, null, false);
    
                    if (familyOfRelatedOpp && familyOfRelatedOpp.el_l_sub_manufacturer && familyOfRelatedOpp.el_l_sub_manufacturer.value === MINI_sub_manufacturer) {
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
        } catch (error) {
            commons.SetFormNotification("Error on el_sales_docs.docFieldMINI: " + error.message, commons.FormNotificationLevel.ERROR, "el_sales_docs.docFieldMINI");
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
            commons.SetVisible(fieldsArr[i], visible);
        }
    }

    /**
     * Section for new car 0 KM logic
     */
    el_sales_docs.ZeroKMVehicleLogic = function () {
        el_sales_docs.GetCarPurchaseFirstHandFieldValue()
            .then(
                function success(isNewZeroKMCar) {
                    if (isNewZeroKMCar && isNewZeroKMCar === true) {
                        commons.SetFieldValue("el_b_car_order_appendix", null);
                        el_sales_docs.SetFieldsVisibility(["el_b_car_order_appendix", "el_b_new_car_warranty"], false);
                        commons.SetSectionVisibility("tab_docs", "tab_docs_section_firstHand", true)
                    } else {
                        commons.SetFieldValue("el_b_annex_to_the_order_0km", false);
                        commons.SetSectionVisibility("tab_docs", "tab_docs_section_firstHand", false)
                    }
                },
                err => commons.SetFormNotification("Error on el_sales_docs.ZeroKMVehicleLogic: " + error.message, commons.FormNotificationLevel.ERROR, "el_sales_docs.ZeroKMVehicleLogic")
            )
    }

    /**
     * Method check if car purchase with same related Opportunity ID is exist.
     * @returns value of el_b_first_hand field from related car purchase
     */
    //To Check -> Retrieve
    el_sales_docs.GetCarPurchaseFirstHandFieldValue = function () {
        return new Promise((resolve, reject) => {
            try {
                const relatedOppId = commons.GetLookupId("el_id_opportunity");

                if (relatedOppId) {
                    // var url = "el_car_purchaseSet?$select=el_b_first_hand&" +
                    //     "$filter=el_id_opportunity/Id eq guid'" + relatedOppId + "'" +   //With same Opportunity like on el_id_opportunity
                    //     "and statecode/Value eq 0";                                             // Only Active records of car purchases
                    // var results = oDataUtil.RetrieveDataByUrl("", url, null, el_sales_docs.errorCallbackForRetrievings, true);
                    commons.RetrieveMultipleRecords("el_car_purchase", commons.Query("el_b_first_hand", `_el_id_opportunity_value eq ${relatedOppId} and statecode eq 0`))
                        .then(
                            results => {
                                if (results && results.length > 0) {
                                    resolve(results[0].el_b_first_hand)
                                } else
                                    resolve(false)
                            },
                            err => reject(err)
                        )
                } else
                    resolve(false);
            } catch (error) {
                reject(error);
            }
        })
    }

    el_sales_docs.SetDocFieldsForDONGFENG = function () {
        var fieldsOfDONGFENG = ["el_b_dongfeng_car_ordering_appendix", "el_b_hero_car_ordering_appendix", "el_b_voyah_car_ordering_appendix",
            "el_b_new_car_warranty_dongfendbox", "el_b_new_car_warranty_voyah", "el_b_new_car_warranty_mhero"];
        var fieldsToHide = ["el_b_car_order_appendix", "el_b_new_car_warranty"];
        if (!CURRENT_MANUFACTURER_NAME && commons.GetLookupName("el_id_manufacturer")) {
            CURRENT_MANUFACTURER_NAME = commons.GetLookupName("el_id_manufacturer");
        }
        if (CURRENT_MANUFACTURER_NAME === Const.Manufacturer.DONGFENG) {
            el_sales_docs.SetFieldsVisibility(fieldsOfDONGFENG, true);
            //Other fields logic
            commons.SetFieldValue("el_b_car_order_appendix", false);
            commons.SetFieldValue("el_b_new_car_warranty", false);
            el_sales_docs.SetFieldsVisibility(fieldsToHide, false);
        }
    }

    // el_sales_docs.GetDocFieldFormSalesDoc = function () {
    //     var OdataUtilObj = new OdataUtil();
    //     var result = OdataUtilObj.RetrieveDataByUrl("", "el_doc_templateSet?$select=el_s_field_name,el_doc_templateid&$filter=el_l_module/Value ne 2 and statecode/Value eq 0", null, null,
    //         false);
    //     if (result && result.results && result.results.length > 0) {
    //         for (var i = 0; i < result.results.length; i++) {
    //             if (result.results[i].el_s_field_name != null) {
    //                 var attr = Xrm.Page.getAttribute(result.results[i].el_s_field_name);
    //                 if (attr && attr.getValue() === true) {
    //                     var resultDocFields = OdataUtilObj.RetrieveDataByUrl("", "el_doc_fieldsSet?$select=el_b_agent_filling&$filter=el_id_doc_template/Id eq guid'" +
    //                         result.results.el_doc_templateid + "' and el_b_agent_filling eq true", null, null, false);
    //                     if (resultDocFields && resultDocFields.results && resultDocFields.results.length > 0) {

    //                     }
    //                 }
    //             }
    //         }
    //     }
    // }


    el_sales_docs.Ribon = el_sales_docs.Ribon || {};

    //To Check -> NavigateTo
    el_sales_docs.Ribon.ribbonOpenDoc = function () {

        if (commons.GetFieldValue("el_s_doc_url")) {
            const url = commons.GetFieldValue("el_s_doc_url");

            // var win = window.open(Xrm.Page.context.getClientUrl() + '/webresources/el_open_document.htm?data=' + encodeURIComponent(url), "_blank", "status=0,resizable=1,top=100,left=100,width=400px,height=300px");

            var pageInput = {
                pageType: "webresource",
                webresourceName: "el_open_document.htm", //Point to problem -> schem name or name
                data: url
            };

            var navigationOptions = {
                target: 2, // 2 opens the page as a modal dialog
                width: 400,
                height: 300,
                position: 1 // 1 for center, 2 for side pane
            };

            commons.NavigateTo(pageInput, navigationOptions)
        }

    }

    el_sales_docs.Ribon.ribbonGenerateDocs = function () {
        commons.SetFieldValue("el_b_generate_document", true);
        commons.Save();
    }

    //To Check -> NavigateTo
    el_sales_docs.Ribon.openDigitalDocument = function () {
        try {
            commons.SetFieldValue("el_b_digital_document", true);
            commons.Save();

            const interval = setInterval(function () {
                var id = commons.GetCurrentEntityId();
                if (id) {
                    clearInterval(interval);

                    // var printSalesDocId = id;  // ה-GUID של הדפסת מסמכים
                    // var printSalesDocName = Xrm.Page.data.entity.attributes.get("el_name").getValue();  //

                    // var parameters = {};
                    // parameters["el_id_print_sales_docs"] = printSalesDocId;
                    // parameters["el_s_title"] = "הפקה דיגיטלית עבור תהליך מכירה";

                    // var windowOptions = {
                    //     openInNewWindow: true
                    // };
                    // Xrm.Utility.openEntityForm("el_digital_signing_job", null, parameters, windowOptions);
                    
                    const formParameters = {};
                    formParameters["el_s_title"] = "הפקה דיגיטלית עבור תהליך מכירה";
                    formParameters["el_id_print_sales_docs"] = [{
                        id: id,
                        name: commons.GetFieldValue("el_name"),
                        entityType: commons.GetCurrentEntityName()
                    }];

                    var pageInput = {
                        pageType: "entityrecord",
                        entityName: "el_digital_signing_job",
                        formParameters: formParameters
                    };

                    var navigationOptions = {
                        target: 1
                    };

                    commons.NavigateTo(pageInput, pageInput);
                }

            }, 1000);

        } catch (error) {
            commons.OpenAlertDialog("הייתה שגיאה בעת פתיחת הטופס: " + error.message);
            console.error("שגיאה במהלך פתיחת הטופס:", error);
        }
    }


    el_sales_docs.Ribon.EnableRules = el_sales_docs.Ribon.EnableRules || {};

    //To Check -> retrieve
    el_sales_docs.Ribon.EnableRules.sendDocuments4signEnableRule = function () {
        return new Promise((resolve, reject) => {
            const query = "?$select=_el_showroom_opportunity_value&$expand=el_showroom_opportunity($select=el_b_send_documents4sign)";
            // var showroom = oDataUtil.RetrieveDataByUrl("OpportunitySet", "?$select=el_showroom_opportunity/el_b_send_documents4sign&$expand=el_showroom_opportunity&$filter=OpportunityId eq guid'" + opportunityId + "'", null, null, false);
            commons.RetrieveRecord("opportunity",commons.StripGuid(commons.GetLookupId("el_id_opportunity"), query))
                .then(
                    function success(result) {
                        if (result && result.el_showroom_opportunity && result.el_showroom_opportunity.el_b_send_documents4sign) {
                            resolve(result.el_showroom_opportunity.el_b_send_documents4sign === true ? true : false)
                        }else
                            resolve(false);
                    },
                    err => {
                        console.error("Error on retrieve opportunityinto el_sales_docs.Ribon.EnableRules.sendDocuments4signEnableRule: ", err);
                        resolve(false);
                    }
                )
        })

    }

})(window.el_sales_docs = window.el_sales_docs || {})
