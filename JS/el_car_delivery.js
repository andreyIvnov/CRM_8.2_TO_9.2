(function (el_car_delivery) {
    var commons;

    el_car_delivery.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_car_delivery.onLoadActions();

            el_car_delivery.onChangeActions();

            el_car_delivery.onSaveActions();

        } catch (err) {
            commons.PageErrorHandler(err, "el_car_delivery.onLoad");
        }
    }

    el_car_delivery.onLoadActions = function () {
        el_car_delivery.setStatusformCarPurchase();
        el_car_delivery.onGiftForCustomerLogic();
        el_car_delivery.showCarPurchasInformationSections();
        el_car_delivery.showGuidanceInformationSection();
        el_car_delivery.onGuidanceLocationLogic();
        el_car_delivery.setMorlsFilter();

        if (commons.GetFormType() == Enums.FormType.Create) {
            el_car_delivery.setSustemUserBusinessUnit();
        }
    };

    el_car_delivery.onChangeActions = function () {
        el_car_delivery.AddOnChange("el_l_guidance_location", el_car_delivery.onGuidanceLocationLogic);
        el_car_delivery.AddOnChangeMultipleCallback("el_id_car_purchase", [el_car_delivery.setStatusformCarPurchase, el_car_delivery.showCarPurchasInformationSections, el_car_delivery.setAcoount]);
        el_car_delivery.AddOnChange("el_b_gift_for_customer", el_car_delivery.onGiftForCustomerLogic);
        el_car_delivery.AddOnChange('el_b_request_for_further_explanation', el_car_delivery.showGuidanceInformationSection);
        //AddOnChange("ownerid", setSustemUserBusinessUnit);
    };

    el_car_delivery.onSaveActions = function () {
        el_car_delivery.AddOnSave(el_car_delivery.setRecordName)
    }

    el_car_delivery.setRecordName = function () {
        var recordName = Const.Message.Hebrew.CarDeliveryFor
        if (commons.GetLookupId('el_id_car_purchase')) {
            recordName = recordName + commons.GetLookupName('el_id_car_purchase');
        }
        if (recordName != commons.GetFieldValue('el_name'))
            commons.SetFieldValue('el_name', recordName);
    }

    //To Check
    el_car_delivery.addFileRibbon = function () {
        try {

            const name;
            if (commons.GetFieldValue("name"))
                name = commons.GetFieldValue("name");
            else if (commons.GetFieldValue("el_name"))
                name = commons.GetFieldValue("el_name");
            else if (commons.GetFieldValue("title"))
                name = commons.GetFieldValue("title");
            else
                name = commons.GetCurrentEntityName();

            const pageInput = {
                pageType: "entityrecord",
                entityName: "el_doc",
                formParameters: {
                    "pId": commons.GetCurrentEntityId(),
                    "pName": name,
                    "pType": commons.GetCurrentEntityName()
                }
            }

            var navigationOptions = {
                target: 2, // 2 opens the page as a modal dialog
                position: 1 // 1 for center, 2 for side pane
            };


            //To Check
            commons.NavigateTo(pageInput, navigationOptions);


            // var extRaqs = "";
            // var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes";

            // extRaqs += "pId=" + Xrm.Page.data.entity.getId();
            // extRaqs += "&pName=" + name;
            // extRaqs += "&pType=" + Xrm.Page.context.getQueryStringParameters().etc;
            // //extRaqs += "&el_l_funding_offer=" + Xrm.Page.getAttribute("el_l_funding_offer").getValue();
            // window.open(Xrm.Page.context.prependOrgName("/main.aspx?etc=" + EL_DOC_TYPECODE + "&pagetype=entityrecord&extraqs=" + encodeURIComponent(extRaqs)), "_blank", features, false);

        } catch (err) {
            commons.OpenAlertDialog("Error into el_car_delivery.addFileRibbon(): " + err.message);
        }
    }

    //To Check Retrieve
    el_car_delivery.setSustemUserBusinessUnit = function () {
        // var url = "SystemUserSet?$select=BusinessUnitId&$filter=SystemUserId eq guid'" + currentuserid + "'";
        // var result = odatautil.RetrieveDataByUrl("", url, null, null, true);

        const currentUserId = commons.StripGuid(commons.GetCurrentUserId());
        commons.RetrieveRecord("systemuser", currentUserId, "?$select=_businessunitid_value")
            .then(
                function success(result) {
                    if (result && result.businessunitid) {
                        commons.SetLookupValue("el_id_showroom", result._businessunitid_value, result.businessunitid.name, result.businessunitid.logicalName)
                    }
                },
                err => commons.SetFormNotification("Error on retrieving systemuser into el_car_delivery.setSustemUserBusinessUnit: " + err.message)
            )
    }

    //To Check -> Retrieve
    el_car_delivery.setStatusformCarPurchase = function () {
        const relatedCarPurchaseId = commons.GetLookupId("el_id_car_purchase");
        if (relatedCarPurchaseId) {
            // var _url = "el_car_purchaseSet?$select=el_b_car_delivered &$filter=el_car_purchaseId eq guid'" + relatedCarPurchaseId + "'";
            // var _result = odatautil.RetrieveDataByUrl("", _url, null, null, true);
            commons.RetrieveRecord("el_car_purchase", relatedCarPurchaseId, "?$select=el_b_car_delivered")
                .then(
                    function success(result) {
                        if (result) {
                            if (result.el_b_car_delivered === true) {
                                el_car_delivery.onDeliveredCarLogic(true)
                            } else {
                                el_car_delivery.onDeliveredCarLogic(false)
                            }
                        }
                    },
                    err => commons.SetFormNotification("Error on retrieving el_car_purchase into el_car_delivery.setStatusformCarPurchase: " + err.message)
                )
        }
    }

    el_car_delivery.onDeliveredCarLogic = function (carIsDelivered) {
        if (carIsDelivered) {

            if (commons.GetFieldValue('el_l_delivery_status') != 2)
                commons.SetFieldValue("el_l_delivery_status", 2);

            if (el_car_delivery.isSectionHided('general', 'after_delivery_section'))
                commons.SetSectionVisibility('general', 'after_delivery_section', true)
        }
        else {
            if (commons.GetFieldValue('el_l_delivery_status') != 1)
                commons.SetFieldValue("el_l_delivery_status", 1);

            if (el_car_delivery.isSectionHided('general', 'after_delivery_section'))
                commons.SetSectionVisibility('general', 'after_delivery_section', false)
        }
    }

    el_car_delivery.onGuidanceLocationLogic = function () {
        if (commons.GetFieldValue('el_l_guidance_location') == Enum.el_car_delivery.el_l_guidance_location.CustomerHouse)
            commons.SetVisible('el_s_full_address', true);
        else
            commons.SetVisible('el_s_full_address', false);
    }

    el_car_delivery.onGiftForCustomerLogic = function () {
        el_car_delivery.showSectionByFieldContent('el_b_gift_for_customer', 'tab_4_related_entities', 'gifts_list_section');
    }

    el_car_delivery.showCarPurchasInformationSections = function () {
        el_car_delivery.showSectionByFieldContent('el_id_car_purchase', 'tab_information', 'section_2_car_purchase_information');
    }

    el_car_delivery.showGuidanceInformationSection = function () {
        el_car_delivery.showSectionByFieldContent('el_b_request_for_further_explanation', 'general', 'section_guidance_coordination');
    }

    //To Check -> Retrieve
    el_car_delivery.setAcoount = function () {
        commons.SetFieldValue('el_id_account', null);
        const relatedCarPurchaseId = commons.GetLookupId("el_id_car_purchase");
        if (relatedCarPurchaseId) {
            // var _url = "el_car_purchaseSet?$select=el_id_account&$filter=el_car_purchaseId eq guid'" + carpurchaseRef.id + "'";
            // var _result = odatautil.RetrieveDataByUrl("", _url, null, null, true);
            commons.RetrieveRecord("el_car_purchase", relatedCarPurchaseId, "?$select=_el_id_account_value")
                .then(
                    function success(result) {
                        if (result) {
                            commons.SetLookupValue("el_id_account", result._el_id_account_value, result.el_id_account.name, result.el_id_account.logicalName)
                        }
                    },
                    err => commons.SetFormNotification("Error on retrieving el_car_purchase into el_car_delivery.setAcoount: " + err.message)
                )
        }

    }

    /*
    * Method show a specific section (sectionName) if field (fieldName) NOT equal to NULL or undefined
    */
    el_car_delivery.showSectionByFieldContent = function (fieldName, tabName, sectionName) {
        if (commons.GetFieldValue(fieldName)) {
            commons.SetSectionVisibility(tabName, sectionName, true)
        }
        else {
            commons.SetSectionVisibility(tabName, sectionName, false)
        }
    }

    el_car_delivery.isSectionHided = function (tabName, sectionName) {
        return !commons.GetTab(tabName).sections.get(sectionName).getVisible();
    }

    //To Check -> Retrieve
    el_car_delivery.setMorlsFilter = function () {
        const crretnUserId = commons.GetCurrentUserId();
        commons.GetBusinessUnitByUserId(crretnUserId)
            .then(
                function success(businesUnit) {
                    if (businesUnit) {
                        const morlsByBusinessUnitIdFilter = "<filter type='and'><condition attribute='el_id_business_unit' operator='eq' value='" + businesUnit.id + "' uiname='" + businesUnit.name + "' uitype='" + currentUserBusnessUnit.logicalName + "'/></filter>";
                        commons.SetCustomFilterToLookupField("el_id_morl", "el_morl", morlsByBusinessUnitIdFilter)
                    }
                },
                err => commons.SetFormNotification("Error on GetBusinessUnitByUserId into el_car_delivery.setMorlsFilter: " + err.message)
            )
    }

})((window.el_car_delivery = window.el_car_delivery || {}))