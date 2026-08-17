(function (el_company_rep) {
    var SHOWROOM_TYPECODE = 10039;
    var EL_DOC_TYPECODE = 10028;
    var EL_PRINT_SALES_DOCS = 10061;
    var EL_CORRESPONDENCE_TYPECODE = 10051;
    var EL_MANUFACTURER_TYPECODE = 10034;
    var EL_TEXT_CONVERSATION = 10064;
    var LEAD_STATUS_FUTURE_MODEL = 102910004;
    var ACCOUNT_TYPECODE = 1;
    var OPPORTUNITY_TYPECODE = 3;
    var FORMSTATE_CREATE = 1;
    var OPPORTUNITYSTATE_OPEN = 0;
    var OPPORTUNITY_STATUS_ORDER = 2;
    var OPPORTUNITY_STATUS_PAYMENT = 102910002;
    var PURCHASETYPE_NEWCAR = 1;
    var DOCTYPE_BID = 1;
    var BIDTYPE_TEMPLATE = 1;
    var BIDTYPE_FROM_STOCK = 2;
    var BIDTYPE_SPECIAL = 3;
    var TESTDRIVE_INTERESTED = 2;
    var TESTDRIVE_NOT_INTERESTED = 1;
    var TESTDRIVE_SCHEDULED = 3;
    var TESTDRIVE_PERFORMED = 4;
    var TESTDRIVE_CANCELLED = 6;
    var ORDER_STATUS_ACTIVE = 1;
    var ORDER_STATUS_UPDATED = 2;
    var TESTDRIVE_OFFER_YES = 1;
    var BENEFIT_URL = "BENEFIT_URL";
    var CAR_STATUS_URL = "CAR_STATUS_URL";
    var PROD_TREE_ORDER_URL = "PROD_TREE_ORDER_URL";
    var STOCK_ORDER_URL = "STOCK_ORDER_URL";
    var SPECIAL_QUOTE_URL = "SPECIAL_QUOTE_URL";
    var UPDATE_ORDER_URL = "UPDATE_ORDER_URL";
    var SERVICE_SYSTEM_ROLE = "דלק מוטורס - נציג שירות";
    var CURRENT_CAR_YES = 1;
    var CURRENT_CAR_NO = 2;
    var formContext;
    var commons;


    var EMPLOYEE_TYPE = {
        COMPANY_REPRESENTATIVE: 102910000,
        COMPANY_EMPLOYEE: 102910001,
        LEASING_REPRESENTATIVE: 102910002,
        LEASING_CUSTOMER: 102910003
    };

    el_company_rep.OnLoad = function (executionContext) {
        debugger;
        formContext = executionContext.getFormContext();
        commons = new elad_commons();
        commons.SetFormContext(formContext);

        try {
            var leasingName = commons.GetFieldValue("el_id_leasing_name");
            var companyName = commons.GetFieldValue("el_id_company_name");
            var contactCategory = commons.GetFieldValue("el_l_contact_category");

            // Leasing empty
            if (commons.GetAttribute("el_id_leasing_name") != null && leasingName == null) {
                commons.SetVisible("el_id_leasing_name", false);
                commons.SetDisabled("el_id_company_name", true);
            }

            // Company empty
            if (commons.GetAttribute("el_id_company_name") != null && companyName == null) {
                commons.SetVisible("el_id_company_name", false);
                commons.SetDisabled("el_id_leasing_name", true);
            }
            // Contact category initialization
            if (commons.GetAttribute("el_l_contact_category") != null && contactCategory == null) {
                el_company_rep.setContactCategoryListValues();
            }
            el_company_rep.setupBasicEvents();
            // Initial logic
            if (contactCategory != null) {
                el_company_rep.showHideCompanyOrLeasing(contactCategory);
            }
        } catch (error) {
            commons.PageErrorHandler(error, "el_company_rep.onLoad");
        }
    };
    el_company_rep.setupBasicEvents = function () {
        commons.AddOnChange("el_l_contact_category", el_company_rep.onChange);
        commons.AddOnChange("el_s_first_name", el_company_rep.onChange);
        commons.AddOnChange("el_s_last_name", el_company_rep.onChange);
    };
    el_company_rep.onChange = function () {
        try {
            var contactCategory = commons.GetFieldValue("el_l_contact_category");
            el_company_rep.showHideCompanyOrLeasing(contactCategory);

            var firstName = commons.GetFieldValue("el_s_first_name");
            var lastName = commons.GetFieldValue("el_s_last_name");
            var fullName = null;

            if (firstName && lastName) {
                fullName = firstName + " " + lastName;
            }
            else if (lastName) {
                fullName = lastName;
            }
            else if (firstName) {
                fullName = firstName;
            }

            commons.SetFieldValue("el_name", fullName, commons.OnChangeBehavior.None);

        } catch (error) {
            commons.PageErrorHandler(error, "el_company_rep.onChange");
        }
    };
    el_company_rep.showHideCompanyOrLeasing = function (contactCategory) {
        try {
            if (contactCategory == EMPLOYEE_TYPE.COMPANY_EMPLOYEE || contactCategory == EMPLOYEE_TYPE.COMPANY_REPRESENTATIVE) {
                commons.SetVisible("el_id_company_name", true);
                commons.SetRequiredLevel("el_id_company_name", "required");

                commons.SetFieldValue("el_id_leasing_name", null, commons.OnChangeBehavior.None);
                commons.SetVisible("el_id_leasing_name", false);
                commons.SetRequiredLevel("el_id_leasing_name", "none");
            }
            else if (contactCategory == EMPLOYEE_TYPE.LEASING_REPRESENTATIVE || contactCategory == EMPLOYEE_TYPE.LEASING_CUSTOMER) {
                commons.SetVisible("el_id_leasing_name", true);
                commons.SetRequiredLevel("el_id_leasing_name", "required");

                commons.SetFieldValue("el_id_company_name", null, commons.OnChangeBehavior.None);
                commons.SetVisible("el_id_company_name", false);
                commons.SetRequiredLevel("el_id_company_name", "none");
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_company_rep.showHideCompanyOrLeasing");
        }
    };
    el_company_rep.setContactCategoryListValues = function () {
        try {
            var companyName = commons.GetFieldValue("el_id_company_name");
            var leasingName = commons.GetFieldValue("el_id_leasing_name");
            var contactCategoryControl = commons.GetControl("el_l_contact_category");

            if (companyName != null) {
                contactCategoryControl.removeOption(EMPLOYEE_TYPE.LEASING_REPRESENTATIVE);
                contactCategoryControl.removeOption(EMPLOYEE_TYPE.LEASING_CUSTOMER);

                commons.SetFieldValue(
                    "el_l_contact_category",
                    [EMPLOYEE_TYPE.COMPANY_REPRESENTATIVE, EMPLOYEE_TYPE.COMPANY_EMPLOYEE],
                    commons.OnChangeBehavior.None
                );
            }
            else if (leasingName != null) {
                contactCategoryControl.removeOption(EMPLOYEE_TYPE.COMPANY_REPRESENTATIVE);
                contactCategoryControl.removeOption(EMPLOYEE_TYPE.COMPANY_EMPLOYEE);
                commons.SetFieldValue("el_l_contact_category", [EMPLOYEE_TYPE.LEASING_REPRESENTATIVE, EMPLOYEE_TYPE.LEASING_CUSTOMER], commons.OnChangeBehavior.None);
            }
        } catch (error) {
            commons.PageErrorHandler(error, "el_company_rep.setContactCategoryListValues");
        }
    };

    
    el_company_rep.CreateBidRibbon = function () {
        try {
            var name = commons.GetFieldValue("el_name") || commons.GetCurrentEntityName();
            var extRaqs = "";
            var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes";
            extRaqs += "pId=" + commons.GetCurrentEntityId();
            extRaqs += "&pName=" + name;
            extRaqs += "&pType=" + commons.GetParameterValue("etc");
            extRaqs += "&el_l_doc_type=" + DOCTYPE_BID;
            extRaqs += "&el_l_quote_type=" + BIDTYPE_TEMPLATE;
            extRaqs += "&el_b_generate_document=true";

            var url = commons.GetClientUrl() + "/main.aspx?etc=" + EL_DOC_TYPECODE + "&pagetype=entityrecord&extraqs=" +
                encodeURIComponent(extRaqs);

            var win = commons.openUr(url, features);
            if (win) {
                win.focus();
            }
        } catch (error) {
            commons.PageErrorHandler(error, "el_company_rep.CreateBidRibbon");
        }
    };
    el_company_rep.getGlobalParameter = async function (name) {
        try {
            var query = "?$select=el_s_value&$filter=el_name eq '" + name.replace(/'/g, "''") + "'";
            var results = await commons.RetrieveMultipleRecords("el_general_system_parameter", query);
            if (results != null && results.length == 1) {
                return results[0].el_s_value;
            }
            return null;

        } catch (error) {
            commons.PageErrorHandler(error, "el_company_rep.getGlobalParameter");
            return null;
        }
    };
   
    
    
    el_company_rep.Ribbon = el_company_rep.Ribbon || {};

    el_company_rep.Ribbon.AddFileRibbon = function (primaryControl) {
        try {
            if(!commons){
                commons = new elad_commons();
                formContext = primaryControl;
                commons.SetFormContext(formContext);
            }
            
            var name = commons.GetFieldValue("name") ||
                commons.GetFieldValue("el_name") ||
                commons.GetFieldValue("title") ||
                commons.GetCurrentEntityName();

            // var extRaqs = "";
            // var features = "location=no,menubar=no,status=no,toolbar=no,scrollbars=yes,resizable=yes";

            // extRaqs += "pId=" + commons.GetCurrentEntityId();
            // extRaqs += "&pName=" + name;
            // extRaqs += "&pType=" + commons.GetParameterValue("etc");

            // var url = commons.GetClientUrl() +
            //     "/main.aspx?etc=" +
            //     EL_DOC_TYPECODE +
            //     "&pagetype=entityrecord&extraqs=" +
            //     encodeURIComponent(extRaqs);

            // var win = elad_commons_obj.openUr(url,  features);

            // if (win) {
            //     win.focus();
            // }


            const pageInput = {
                pageType: "entityrecord",
                entityName: "el_doc",
                formParameters: {
                    "pId": commons.GetCurrentEntityId(),
                    "pName": name,
                    "pType": commons.GetCurrentEntityName()
                }
            }

            const navigationOptions = {
                target: 2, // 2 opens the page as a modal dialog
                position: 1 // 1 for center, 2 for side pane
            };

            commons.NavigateTo(pageInput, navigationOptions);


        } catch (error) {
            commons.PageErrorHandler(error, "el_company_rep.AddFileRibbon");
        }
    };

    el_company_rep.Ribbon.DynamicMenuBid = function (primaryControl, commandProperties) {
        try {
            if (!commons) {
                commons = new elad_commons();
                formContext = primaryControl;
                commons.SetFormContext(formContext);
            }

            if (commons.GetContext().client.getClient() != "Mobile") {
                var menuXml = "<Menu Id=\"Bid.DynamicMenu\">" +
                    "<MenuSection Id=\"Bid.Dynamic.MenuSection\" Sequence=\"10\">" +
                    "<Controls Id=\"Bid.Dynamic.Controls\">";

                menuXml += "<Button Id=\"Bid.Dynamic.Button1\" Command=\"el.el_company_rep.dynamic.SearchCommand\" Sequence=\"20\" LabelText=\"הצעה מתבנית\" Alt=\"הצעה מתבנית\" Image16by16=\"/_imgs/ribbon/entity16_1084.png\" />";
                menuXml += "</Controls>" +
                    "</MenuSection>" +
                    "</Menu>";

                commandProperties.PopulationXML = menuXml;
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_company_rep.DynamicMenuBid");
        }
    };

    /**
     * Method NOT IN USE - Ribbon button isn't exist
     */
    // el_company_rep.Ribbon.SearchBid = function (primaryControl, commandProperties) {
    //     try {
    //         if (!commons) {
    //             commons = new elad_commons();
    //             formContext = primaryControl;
    //             commons.SetFormContext(formContext);
    //         }

    //         if (commons.GetContext().client.getClient() != "Mobile") {
    //             var controlId = commandProperties.SourceControlId;

    //             switch (controlId) {
    //                 case "Bid.Dynamic.Button1":
    //                     el_company_rep.CreateBidRibbon();
    //                     break;
    //                 case "Bid.Dynamic.Button2":
    //                     commons.showOpenLegacyRibbon(STOCK_ORDER_URL, "customerid", "quote");
    //                     break;

    //                 case "Bid.Dynamic.Button3":
    //                     commons.showOpenLegacyRibbon(SPECIAL_QUOTE_URL, "customerid");
    //                     break;
    //                 default:
    //                     commons.OpenAlertDialog("Button Unknown");
    //                     break;
    //             }
    //         }

    //     } catch (error) {
    //         commons.PageErrorHandler(error, "el_company_rep.SearchBid");
    //     }
    // };


})((window.el_company_rep = window.el_company_rep || {}))