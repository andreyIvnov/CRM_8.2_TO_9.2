(function (el_lead) {
    var LEAD_STATUS_FUTURE_MODEL = 102910004;
    var CELLPHONE_PATTERN2 = /\d{10}/;
    var OTHERPHONE_PATTERN = /\d{9}/;
    var CELLPHONE_PATTERN2_MESSAGE = "על מספר טלפון נייד להכיל מינימום 10 ספרות"
    var OTHERPHONE_PATTERN_MESSAGE = "על מספר הטלפון הנוסף להכיל מינימום 9 ספרות";
    var LEAD_SOURCE_SERVICE_POINT = 18;
    var LEAD_SOURCE_EVENT = 19;
    var FILL_ONE_TELEPHONE_REQUIERED = "נדרש למלא לפחות אחד מבין השדות \'טלפון נייד\' או \'טלפון אחר\'";
    var IS_DUPLICATION_CHECKING = false;
    var IS_DUPLICATION_CHECKED = false;

    var commons;

    el_lead.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_lead.onLoadEvents();

            el_lead.onChangeEvents();

            el_lead.onSaveEvents();
        } catch (error) {
            commons.PageErrorHandler(error, "el_lead.onLoad");
        }
    }

    el_lead.onLoadEvents = function () {

        el_lead.setReadonlyBehaviourByUserRole();
        el_lead.fillShowroom();

        el_lead.setManufacturerAndFamilyInLeadAndOpportunity();
        if (!commons.GetLookupId("el_id_manufacturer"))
            commons.SetVisible("el_id_manufacturer", true);


        el_lead.setDisqualifyTab();
        el_lead.setEventField();
        el_lead.setServicePointSection();
        el_lead.checkDuplicatesOnLoad();
        el_lead.showFieldCarModel();
        el_lead.filterManfFromShowRoom();

        if (commons.GetFormType() == Enum.FormType.Create) {
            el_lead.setTradeInLeadIfCampaignOrShowroomIsTardeIn();
        };
        el_lead.onTradeInLeadTogel();
    }

    el_lead.onChangeEvents = function () {
        commons.AddOnChangeMultipleFields(["mobilephone", "telephone1"], el_lead.validateLeadPhonesFields)
        commons.AddOnChangeMultipleFields(["firstname", "lastname", "el_id_family", "el_s_future_model"], el_lead.setSubject)

        commons.AddOnChangeMultipleCallback("el_id_manufacturer", [el_lead.setManufacturerAndFamilyInLeadAndOpportunity, el_lead.showFieldCarModel])
        commons.AddOnChangeMultipleCallback("el_id_showroom", [el_lead.setTradeInLeadIfCampaignOrShowroomIsTardeIn, el_lead.showroomOnChange]);

        commons.AddOnChange("statuscode", el_lead.setFutureModelField)
        commons.AddOnChange("leadsourcecode", el_lead.setServicePointSection);
        commons.AddOnChange('el_b_is_tradein_lead', el_lead.onTradeInLeadTogel);
        commons.AddOnChange('campaignid', el_lead.setTradeInLeadIfCampaignOrShowroomIsTardeIn);
        commons.AddOnChange('el_id_showroom', el_lead.filterManfFromShowRoom);
        commons.AddOnChange('el_id_disqualify_primary_reason', el_lead.showAdditionalDetailsFieldAfterFillingMainReason);
    }

    el_lead.onSaveEvents = function () {
        commons.AddOnSave(el_lead.leadOnSave);
    }

    el_lead.setEventField = function () {
        if (commons.GetFieldValue("leadsourcecode") === LEAD_SOURCE_EVENT) {
            commons.SetVisible("el_b_present_at_event", true);
            commons.SetRequiredLevel("el_id_family", "none");
        }
        else
            commons.SetVisible("el_b_present_at_event", false);
    }

    el_lead.leadOnSave = function (Context) {

        if (!el_lead.validateLeadPhonesFields()) {
            Context.getEventArgs().preventDefault();
            commons.SetFocus("mobilephone");
        }
        else {
            if (!commons.GetLookupId("parentaccountid"))
                el_lead.checkDuplicate(Context);
        }
    }

    el_lead.setDisqualifyTab = function () {
        if (commons.GetLookupId("el_id_disqualify_primary_reason"))
            commons.SetTabVisibility("lead_disqualify_tab", true);
        else
            commons.SetTabVisibility("lead_disqualify_tab", false);
    }

    el_lead.showAdditionalDetailsFieldAfterFillingMainReason = async function () {
        debugger;
        if (commons.GetLookupId("el_id_disqualify_primary_reason") != null) {
            var primary_reason = commons.GetLookupId("el_id_disqualify_primary_reason");
            var primary_reasonAfterRetrieve = await commons.RetrieveRecord("el_disqualify_primary_reason", primary_reason.replace(/[{}]/g, ""), "?$select=el_name")
            if (primary_reasonAfterRetrieve != null) {
                if (primary_reasonAfterRetrieve.el_name == "אחר") {
                    common.SetRequiredLevel("el_s_disqualify_notes", "required")
                }
                else {
                    common.SetRequiredLevel("el_s_disqualify_notes", "none")
                }
            }
        }
    }


    el_lead.showroomOnChange = function () {
        if (commons.GetLookupId("el_id_showroom")) {
            el_lead.fillManufacturer();
        }
        else
            commons.SetFieldValue("el_id_manufacturer", null);
    }

    el_lead.validateLeadPhonesFields = function () {
        if (!commons.GetFieldValue("mobilephone") && !commons.GetFieldValue("telephone1") && commons.GetFieldValue("leadsourcecode") != LEAD_SOURCE_EVENT) {
            commons.OpenAlertDialog(FILL_ONE_TELEPHONE_REQUIERED);
            return false;
        }
        if (!el_lead.validatePhoneNumber(commons.GetFieldValue("mobilephone"), CELLPHONE_PATTERN2)) {
            commons.OpenAlertDialog(CELLPHONE_PATTERN2_MESSAGE);
            return false;
        }
        if (!el_lead.validatePhoneNumber(commons.GetFieldValue("telephone1"), OTHERPHONE_PATTERN)) {
            commons.OpenAlertDialog(OTHERPHONE_PATTERN_MESSAGE);
            return false;
        }

        return true;
    }

    el_lead.setSubject = function () {
        var firstname = commons.GetFieldValue("firstname") ? commons.GetFieldValue("firstname") : "";
        var lastname = commons.GetFieldValue("lastname") ? commons.GetFieldValue("lastname") : "";
        var subject = firstname + " " + lastname;
        var carfamilyName = commons.GetLookupName("el_id_family");

        if (carfamilyName)
            subject += " לגבי " + carfamilyName;
        else {
            if (commons.GetFieldValue("el_s_future_model"))
                subject += " דגם עתידי " + commons.GetFieldValue("el_s_future_model");
        }

        commons.SetFieldValue("companyname", firstname + " " + lastname);
        commons.SetSubmitMode("companyname", "always");

        commons.SetFieldValue("subject", subject);
        commons.SetSubmitMode("subject", "always");
    }

    el_lead.setFutureModelField = function () {
        //status
        commons.SetRequiredLevel("el_id_family", "required");
        commons.SetVisible("el_id_family", true);
        commons.SetRequiredLevel("el_s_future_model", "none");
        commons.SetVisible("el_s_future_model", false);

        if (commons.GetFieldValue("statuscode") === LEAD_STATUS_FUTURE_MODEL) {
            commons.SetFieldValue("el_id_family", null);
            commons.SetRequiredLevel("el_id_family", "none");
            commons.SetVisible("el_id_family", false);
            commons.SetRequiredLevel("el_s_future_model", "required");
            commons.SetVisible("el_s_future_model", true);
        }
        else {
            commons.SetFieldValue("el_s_future_model", null);
        }
    }

    el_lead.checkDuplicateRecords = function () {
        if (commons.GetFieldValue("el_b_auto_create") === true && commons.GetFieldValue("el_b_duplicate_check") === false) {
            el_lead.checkDuplicate(commons.GetFormContext());
            commons.SetSubmitMode("el_b_duplicate_check", "always");
        }
    }

    //To Check -> Check duplication method full
    el_lead.checkDuplicate = function (Context) {
        if (!commons.GetFormContext()) {
            commons.SetFormContext(Context);
        }

        var eventArgs = Context.getEventArgs();
        if (eventArgs.getSaveMode() === Enum.SaveMode.Save || eventArgs.getSaveMode() === Enum.SaveMode.SaveAndClose || eventArgs.getSaveMode() === Enum.SaveMode.SaveAndNew || eventArgs.getSaveMode() === Enum.SaveMode.AutoSave && !Xrm.Page.ui.tabs.get("lead_disqualify_tab").getVisible()) {
            if (IS_DUPLICATION_CHECKING == false && IS_DUPLICATION_CHECKED == false) {
                IS_DUPLICATION_CHECKING = true;
                IS_DUPLICATION_CHECKED = true;
                if (commons.GetFormType() === Enum.FormType.Create) {
                    commons.SetFieldValue('el_b_to_check_duplicates', true);
                    IS_DUPLICATION_CHECKING = false;

                    commons.RefreshData(true)

                    // commons.Save()
                    //     .then(
                    //         function () { 
                    //             commons.RefreshData(true) 
                    //         });
                }


                //To Check
                var req = {

                    baseEntityTypecode: "4",
                    baseEntity: Const.EntityLogicalName.Lead,
                    id: commons.GetCurrentEntityId(),
                    recordColumns: "subject,mobilephone,el_id_showroom,emailaddress1,telephone1",

                    getMetadata: function () {
                        return {
                            boundParameter: null, // Global Action → null
                            parameterTypes: {
                                baseEntityTypecode: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1 // PrimitiveType
                                },
                                baseEntity: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                },
                                id: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                },
                                recordColumns: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                }
                            },
                            operationType: 0,
                            operationName: "el_action_duplicate_detection_records"
                        };
                    }
                };

                commons.executeRequest(req,
                    function (successResult) {
                        if (successResult != null && successResult.stringOutput != "[]") {

                            var pageInput = {
                                pageType: "webresource",
                                webresourceName: "el_action_duplicate_detection_records", //Point to problem -> schem name or name
                            };

                            var navigationOptions = {
                                target: 2, // 2 opens the page as a modal dialog
                                width: 850,
                                height: 520,
                                position: 1 // 1 for center, 2 for side pane
                            };

                            localStorage.setItem('duplicatesString', result.stringOutput);
                            Context.getEventArgs().preventDefault();

                            commons.NavigateTo(pageInput, navigationOptions)
                                .then(
                                    function (reslut) {
                                        el_lead.saveOrExit();
                                    },
                                    function (error) {
                                        console.error(error);
                                        commons.SetFormNotification("Error on el_lead.checkDuplicate => NavigateTo()", commons.FormNotificationLevel.ERROR, "el_lead.checkDuplicate => NavigateTo()");
                                    }
                                )
                        }
                    },
                    function (error) {
                        console.error(error);
                        commons.SetFormNotification("Error on el_lead.checkDuplicate => executeRequest()", commons.FormNotificationLevel.ERROR, "el_lead.checkDuplicate => executeRequest()");
                    }
                )

                // var parameters = {
                //     baseEntityTypecode: "4",
                //     baseEntity: "lead",
                //     id: commons.GetCurrentEntityId(),
                //     recordColumns: "subject,mobilephone,el_id_showroom,emailaddress1,telephone1"
                // };

                // var request = motors.Utilities.buildActionRequest("", "", true, "el_action_duplicate_detection_records", parameters, null, false);
                // var service = motors.Services.XrmService.V81;
                // var result = service.CallAction(request);

                // if (result != null && result.stringOutput != "[]") {
                //     localStorage.setItem('duplicatesString', result.stringOutput);
                //     var DialogOption = new Xrm.DialogOptions;
                //     DialogOption.width = 850;
                //     DialogOption.height = 560;
                //     Context.getEventArgs().preventDefault();

                //     Xrm.Internal.openDialog(Xrm.Page.context.getClientUrl() + "/webresources/el_duplicates_table.html", DialogOption, null, null, el_lead.saveOrExit);
                // }
            }
        }
        else if (commons.GetVisible("lead_disqualify_tab") && eventArgs.getSaveMode() == Enum.SaveMode.AutoSave) {
            eventArgs.preventDefault();
        }
    }

    //To Check
    el_lead.checkDuplicatesOnLoad = function () {

        if (commons.GetFormType() !== 4 && commons.GetFormType() !== Enum.FormType.Create) {
            //if (Xrm.Page.getAttribute('el_b_to_check_duplicates') != null && Xrm.Page.getAttribute('el_b_to_check_duplicates').getValue() == true)
            //{
            //Xrm.Page.getAttribute('el_b_to_check_duplicates').setValue(false);
            //IS_DUPLICATION_CHECKING = true;
            if (!commons.GetLookupId("parentaccountid")) {

                // var parameters = {
                //     baseEntityTypecode: "4",
                //     baseEntity: "lead",
                //     id: commons.GetCurrentEntityId(),
                //     recordColumns: "subject,mobilephone,el_id_showroom,emailaddress1,telephone1"
                // };


                // var request = motors.Utilities.buildActionRequest("", "", true, "el_action_duplicate_detection_records", parameters, null, false);
                // var service = motors.Services.XrmService.V81;
                // var result = service.CallAction(request);

                // if (result != null && result.stringOutput != "[]") {
                //     localStorage.setItem('duplicatesString', result.stringOutput);
                //     var DialogOption = new Xrm.DialogOptions;
                //     DialogOption.width = 850;
                //     DialogOption.height = 560;
                //     Xrm.Internal.openDialog(Xrm.Page.context.getClientUrl() + "/webresources/el_duplicates_table.html",
                //         DialogOption, null, null, function () { });
                // }

                //To Check
                var req = {

                    baseEntityTypecode: "4",
                    baseEntity: Const.EntityLogicalName.Lead,
                    id: commons.GetCurrentEntityId(),
                    recordColumns: "subject,mobilephone,el_id_showroom,emailaddress1,telephone1",

                    getMetadata: function () {
                        return {
                            boundParameter: null, // Global Action → null
                            parameterTypes: {
                                baseEntityTypecode: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1 // PrimitiveType
                                },
                                baseEntity: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                },
                                id: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                },
                                recordColumns: {
                                    typeName: "Edm.String",
                                    structuralProperty: 1
                                }
                            },
                            operationType: 0,
                            operationName: "el_action_duplicate_detection_records"
                        };
                    }
                };

                commons.executeRequest(req,
                    function (successResult) {
                        if (successResult != null && successResult.stringOutput != "[]") {

                            var pageInput = {
                                pageType: "webresource",
                                webresourceName: "el_action_duplicate_detection_records", //Point to problem -> schem name or name
                            };

                            var navigationOptions = {
                                target: 2, // 2 opens the page as a modal dialog
                                width: 850,
                                height: 520,
                                position: 1 // 1 for center, 2 for side pane
                            };

                            localStorage.setItem('duplicatesString', successResult.stringOutput);
                            Context.getEventArgs().preventDefault();

                            commons.NavigateTo(pageInput, navigationOptions)
                                .then(
                                    function (reslut) { },
                                    function (error) {
                                        console.error(error);
                                        commons.SetFormNotification("Error on el_lead.checkDuplicatesOnLoad => NavigateTo()", commons.FormNotificationLevel.ERROR, "el_lead.checkDuplicatesOnLoad => NavigateTo()");
                                    }
                                )
                        }
                    },
                    function (error) {
                        console.error(error);
                        commons.SetFormNotification("Error on el_lead.checkDuplicatesOnLoad => executeRequest()", commons.FormNotificationLevel.ERROR, "el_lead.checkDuplicatesOnLoad => executeRequest()");
                    }
                )
            }
        }
    }

    el_lead.filterManfFromShowRoom = async function () {
        var showroomId = commons.GetLookupId('el_id_showroom');

        if (showroomId) {

            try {
                var showroomResult = await commons.RetrieveRecord("el_showroom", showroomId.replace(/[{}]/g, ""), "?$select=el_b_mixed_showroom,_el_id_manufacturer_value")
                if (showroomResult && showroomResult.el_b_mixed_showroom === true) {
                    var m_m_opts = commons.Query("el_manufacturerid", "el_showroomid eq " + showroomId)
                    var showroomManufacturers_m_m = await commons.RetrieveMultipleRecords("el_showroom_el_manufacturers", m_m_opts)
                    if (showroomManufacturers_m_m && showroomManufacturers_m_m.length > 0) {

                        var manufacturerFilters = "<filter type='and'><filter type='or'>";

                        showroomManufacturers_m_m.map(m_m_connection => {
                            manufacturerFilters += "<condition attribute='el_manufacturerid' operator='eq' value='" + m_m_connection.el_manufacturerid + "'/>";
                        })

                        manufacturerFilters += "</filter></filter>";

                        commons.SetCustomFilterToLookupField("el_id_manufacturer", "el_manufacturer", manufacturerFilters)
                    }
                }
            } catch (error) {
                commons.SetFormNotification("Error on el_lead.filterManfFromShowRoom(): " + error.message, commons.FormNotificationLevel.ERROR, "el_lead.filterManfFromShowRoom");
                console.error(error);
            }
        }


    }

    el_lead.saveOrExit = function (needToSave) {
        if (needToSave == true) {
            commons.SetFieldValue('el_b_to_check_duplicates', false);
            commons.SetFieldValue('el_b_duplicate_check', true);
            commons.Save();
        }
        IS_DUPLICATION_CHECKING = false;
    }

    el_lead.setReadonlyBehaviourByUserRole = function () {
        commons.UserHasRoleOrIsAdmin()
            .then(
                function (result) {
                    if (result === true) {
                        commons.SetDisabled("campaignid", false);
                        commons.SetDisabled("el_id_primary_channel", false);
                        commons.SetDisabled("el_id_secondary_channel", false);
                    } else {
                        commons.SetDisabled("campaignid", true);
                        commons.SetDisabled("el_id_primary_channel", true);
                        commons.SetDisabled("el_id_secondary_channel", true);
                    }
                },
                err => {
                    commons.SetFormNotification("Error on el_lead.setReadonlyBehaviourByUserRole(): " + err.message, commons.FormNotificationLevel.ERROR, "el_lead.setReadonlyBehaviourByUserRole")
                }
            )

    }

    el_lead.setServicePointSection = function () {
        if (commons.GetFieldValue("leadsourcecode") == LEAD_SOURCE_SERVICE_POINT) {
            commons.SetSectionVisibility("tab_2", "service_point_section", true)
            commons.SetRequiredLevel("el_id_service_point", "required");
            commons.SetRequiredLevel("el_s_service_consult", "required");

        }
        else {
            commons.SetSectionVisibility("tab_2", "service_point_section", false)

            if (commons.GetLookupId("el_id_service_point"))
                commons.SetFieldValue("el_id_service_point", null);
            if (commons.GetFieldValue("el_s_service_consult"))
                commons.SetFieldValue("el_s_service_consult", null);

            commons.SetRequiredLevel("el_id_service_point", "none");
            commons.SetRequiredLevel("el_s_service_consult", "none");

        }
    }


    el_lead.showFieldCarModel = function () {
        var manfacturerId = commons.GetLookupId("el_id_manufacturer");
        if (manfacturerId) {

            commons.RetrieveRecord("el_manufacturer", manfacturerId, "?$select=el_manufacturerid,el_s_supllier_as400cod")
                .then(
                    function (result) {
                        if (result) {
                            switch (result.el_s_supllier_as400cod) {
                                case "BMC":
                                case "MAZ":
                                    commons.SetVisible("el_id_model_car", true);
                                    break;

                                default:
                                    break;
                            }
                        }
                    },
                    err => {
                        console.error("Error by retrieving 'el_manufacturer' in el_lead.showFieldCarModel(): ", err)
                        commons.SetFormNotification("Error by retrieving 'el_manufacturer' in el_lead.showFieldCarModel()", commons.FormNotificationLevel.ERROR, "el_lead.showFieldCarModel")
                    }
                )
        }
    }

    el_lead.getEmailRegardingOpportunity = function () {

        var emailOpts = commons.Query("activityid,createdon", "_regardingobjectid_value eq " + commons.GetCurrentEntityId(), "&$orderby=CreatedOn desc")
        commons.RetrieveMultipleRecords("email", emailOpts, null, true)
            .then(
                function (results) {
                    if (results && results.length > 0) {

                        var formOptions = {
                            entityName: "email",
                            entityId: results[0].activityid,
                        };

                        //To Check -> If the OpenEntityForm opened correct
                        commons.OpenEntityForm(formOptions, null);

                        // Xrm.Utility.openEntityForm("email", results[0].activityid)
                    }
                },
                err => {
                    console.error("Error by retrieving 'email' in el_lead.getEmailRegardingOpportunity(): ", err)
                    commons.SetFormNotification("Error by retrieving 'email' in el_lead.getEmailRegardingOpportunity()", commons.FormNotificationLevel.ERROR, "el_lead.getEmailRegardingOpportunity")
                }
            )

    }

    el_lead.runWorkflow = function (workflowId, entityId) {
        commons.PageClearMessages("el_lead.runWorkflow")
        commons.ExecuteWorkflow(workflowId, entityId)
            .then(
                null,
                err => commons.SetFormNotification("Error by executing workflow in el_lead.runWorkflow(): " + err.message, commons.FormNotificationLevel.ERROR, "el_lead.runWorkflow")
            );

        // var url = Xrm.Page.context.getClientUrl();
        // var entity = entityId;
        // var OrgServicePath = "/XRMServices/2011/Organization.svc/web";

        // url = url + OrgServicePath;
        // var request;
        // request = "<s:Envelope xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
        //     "<s:Body>" +
        //     "<Execute xmlns=\"http://schemas.microsoft.com/xrm/2011/Contracts/Services\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\">" +
        //     "<request i:type=\"b:ExecuteWorkflowRequest\" xmlns:a=\"http://schemas.microsoft.com/xrm/2011/Contracts\" xmlns:b=\"http://schemas.microsoft.com/crm/2011/Contracts\">" +
        //     "<a:Parameters xmlns:c=\"http://schemas.datacontract.org/2004/07/System.Collections.Generic\">" +
        //     "<a:KeyValuePairOfstringanyType>" +
        //     "<c:key>EntityId</c:key>" +
        //     "<c:value i:type=\"d:guid\" xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + entity + "</c:value>" +
        //     "</a:KeyValuePairOfstringanyType>" +
        //     "<a:KeyValuePairOfstringanyType>" +
        //     "<c:key>WorkflowId</c:key>" +
        //     "<c:value i:type=\"d:guid\" xmlns:d=\"http://schemas.microsoft.com/2003/10/Serialization/\">" + workflowId + "</c:value>" +
        //     "</a:KeyValuePairOfstringanyType>" +
        //     "</a:Parameters>" +
        //     "<a:RequestId i:nil=\"true\" />" +
        //     "<a:RequestName>ExecuteWorkflow</a:RequestName>" +
        //     "</request>" +
        //     "</Execute>" +
        //     "</s:Body>" +
        //     "</s:Envelope>";

        // var req = new XMLHttpRequest();
        // req.open("POST", url, false);
        // // Responses will return XML. It isn't possible to return JSON.
        // req.setRequestHeader("Accept", "application/xml, text/xml, */*");
        // req.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        // req.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/xrm/2011/Contracts/Services/IOrganizationService/Execute");
        // req.onreadystatechange = function () { assignResponse(req); };
        // req.send(request);
    }




    el_lead.auditingLead = function (leadId) {
        //Grid \ Views
        if (!commons) {
            Xrm.WebApi.retrieveRecord("lead", leadId, "?$select=el_b_auditing_lead")
                .then(
                    function (lead) {
                        var leadIsAuditingLead = lead && lead.el_b_auditing_lead == true ? true : false;
                        if (leadIsAuditingLead == false) {
                            el_lead.updateLeadField(leadId, { el_b_auditing_lead: true });
                        }
                        else
                            return true;
                    },
                    err => {
                        console.error("Error on retrieving 'lead' in el_lead.auditingLead(): ", err);
                    }
                )
        }
        //Form
        else {
            var leadIsAuditingLead = commons.GetFieldValue("el_b_auditing_lead") == true ? true : false;
            if (leadIsAuditingLead == false) {
                el_lead.updateLeadField(leadId, { el_b_auditing_lead: true });
            }
            else {
                el_lead.logOnConsoleAndOpenAlertDialog(Const.Message.Hebrew.LeadIsAlredyAuditingLead)   //TASK 1344
            }
        }
    }

    el_lead.updateLeadField = function (leadId, fieldsToUpdate) {
        leadId = leadId.replace("{", "").replace("}", "");

        //To Check
        Xrm.WebApi.updateRecord("lead", leadId, fieldsToUpdate)
            .then(
                function success(result) {
                    el_lead.logOnConsoleAndOpenAlertDialog(Const.Message.Hebrew.UpdateOfAuditingLeadIsSuccessfully);    //TASK 1344
                    //To Check
                    // if (Xrm.Page.getAttribute("el_b_auditing_lead") != null) {
                    //     Xrm.Page.getAttribute("el_b_auditing_lead").setValue(true);
                    // }
                },
                err => {
                    console.error(err)
                    el_lead.logOnConsoleAndOpenAlertDialog(Const.Message.Hebrew.UpdateOfAuditingLeadIsFailed + err.message); //TASK 1344
                }
            )


        // var updateUrl = Xrm.Page.context.getClientUrl() + "/api/data/v8.1/leads(" + leadId + ")";
        // var xhr = new XMLHttpRequest();
        // xhr.open("PATCH", updateUrl, true);
        // xhr.setRequestHeader("OData-MaxVersion", "4.0");
        // xhr.setRequestHeader("OData-Version", "4.0");
        // xhr.setRequestHeader("Accept", "application/json");
        // xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");

        // xhr.onreadystatechange = function () {
        //     if (xhr.readyState === 4 && commons != null) {
        //         if (xhr.status === 204) {
        //             // Update successful
        //             el_lead.logOnConsoleAndOpenAlertDialog(Const.Message.Hebrew.UpdateOfAuditingLeadIsSuccessfully);    //TASK 1344
        //             if (Xrm.Page.getAttribute("el_b_auditing_lead") != null) {
        //                 Xrm.Page.getAttribute("el_b_auditing_lead").setValue(true);
        //             }
        //         } else {
        //             // Handle update error
        //             el_lead.logOnConsoleAndOpenAlertDialog(Const.Message.Hebrew.UpdateOfAuditingLeadIsFailed + xhr.statusText); //TASK 1344
        //         }
        //     }
        // };

        // xhr.send(JSON.stringify(fieldsToUpdate));
    }

    /**
     * The method is calling for commons.OpenAlertDialog dialog. 
     * Working only on main form of record - need a common
     * TASK 1344
     * @param {string} textOnAlert 
     */
    el_lead.logOnConsoleAndOpenAlertDialog = function (textOnAlert) {
        console.log(textOnAlert);
        commons.OpenAlertDialog(textOnAlert)
    }

    el_lead.sendAutoSMSMessage = function () {
        var id = commons.GetCurrentEntityId();
        var workflowId = 'BEA87A21-0A40-4534-B691-6B74DC8ECB85';
        el_lead.runWorkflow(workflowId, commons.GetCurrentEntityId());
        commons.OpenAlertDialog("נשלחה הודעה ללקוח");
        //window.setTimeout(Xrm.Utility.openEntityForm("el_asha_timetable_creation", id), 10000);

    }

    /**
    * Methos using as Action of Qualifying Trade-In leads 
    * + Method creata new Account if NO account on 'parentaccountid' field of Lead
    * + Method creata new el_opportunity_tradein record if 'el_b_is_tradein_lead' == true
    */
    el_lead.qualifyTradeInLeadAction = function (lead) {
        try {
            var currentRecordGuid;
            var noParentAccount;
            var result;

            //Home page GRID of Leads
            if (lead) {
                currentRecordGuid = lead.LeadId;
                noParentAccount = lead.ParentAccountId.Id == null || lead.ParentAccountId.Id == undefined;
                // var paramsObj = {
                //     IfCreateNewAccount: noParentAccount,
                // };
                // var request = motors.Utilities.buildActionRequest("lead", currentRecordGuid, false, "el_qualify_tradeIn_lead", paramsObj, null, false, el_lead.qualifyTradeinLeadsuccessCallBack, el_lead.qualifyTradeinLeadErrorCallBack);
                // var service = motors.Services.XrmService.V81;
                // result = service.CallAction(request);
            }
            //Inside of record
            else {
                currentRecordGuid = commons.GetCurrentEntityId()
                noParentAccount = commons.GetFieldValue('parentaccountid') == null || commons.GetFieldValue('parentaccountid') == undefined;
                // var paramsObj = {
                //     IfCreateNewAccount: noParentAccount,
                // };
                // result = commons.BuildActionRequest("lead", currentRecordGuid, false, "el_qualify_tradeIn_lead", paramsObj, null, false, el_lead.qualifyTradeinLeadsuccessCallBack, el_lead.qualifyTradeinLeadErrorCallBack)
            }




            var request = {
                IfCreateNewAccount: noParentAccount,
                getMetadata: function () {
                    return {
                        boundParameter: "entity",
                        parameterTypes: {
                            "entity": {
                                "typeName": "mscrm.lead",
                                "structuralProperty": 5 // 5 mean Entity Reference
                            },
                            "IfCreateNewAccount": {
                                "typeName": "Edm.Boolean",
                                "structuralProperty": 1 // 1 mean Primitive Type
                            }
                        },
                        operationType: 0, // 0 mean Action
                        operationName: "el_qualify_tradeIn_lead"
                    };
                },

                entity: {
                    "entityType": "lead",
                    "id": currentRecordGuid
                },

            };

            Xrm.WebApi.online.execute(request).then(
                function success(response) {
                    if (response) {
                        if (response != null && response.success == true) {
                            el_lead.qualifyTradeinLeadsuccessCallBack(response);
                        }
                        else
                            el_lead.qualifyTradeinLeadErrorCallBack(response);
                    }
                },
                err => console.err(error)
            );
        }
        catch (err) {
            console.error("Error on 'el_lead.qualifyTradeInLeadAction' : ", err);
        }
    }

    /**
    * Successed callback for Qualifying of Trade-In lead
    */
    el_lead.qualifyTradeinLeadsuccessCallBack = function (result) {
        if (result.createdTradeInOpportunityId) {

            var pageInput = {
                pageType: "entityrecord",
                entityName: "el_opportunity_tradein",
                entityId: result.createdTradeInOpportunityId
            }

            var navigationOptions = {
                target: 2, // 2 opens the page as a modal dialog
                position: 1 // 1 for center, 2 for side pane
            };


            //To Check
            Xrm.Navigation.navigateTo(pageInput, navigationOptions, null, null);

            // Xrm.Utility.openEntityForm('el_opportunity_tradein', result.createdTradeInOpportunityId, null, null)
        }
    }

    /**
    * Error callback for Qualifying of Trade-In lead
    */
    el_lead.qualifyTradeinLeadErrorCallBack = function (result) {
        console.error("Some problem with Action 'el_qualify_tradeIn_lead' .", result);
    }

    el_lead.onTradeInLeadTogel = function () {
        if (commons.GetFieldValue('el_b_is_tradein_lead')) {
            commons.SetRequiredLevel('el_id_family', 'none');
            commons.SetVisible('qualifyingopportunityid', false);
            commons.SetVisible('el_id_qualifying_tradein_opportunity', true);
        }
        else {
            if (commons.GetFieldValue('statuscode') == LEAD_STATUS_FUTURE_MODEL)
                el_lead.setFutureModelField()
            else
                commons.SetRequiredLevel('el_id_family', 'required');
            commons.SetVisible('qualifyingopportunityid', true);
            commons.SetVisible('el_id_qualifying_tradein_opportunity', false);
        }
        commons.RefreshRibbon(true);
    }

    /**
    * Method return TRUE if a 'el_b_tradein_showroom' field of related showroom is equal true.
    */
    el_lead.isTradeInShowroomRelated = function () {
        commons.PageClearMessages("el_lead.isTradeInShowroomRelated");

        var showroomId = commons.GetLookupId('el_id_showroom');
        if (showroomId) {
            commons.RetrieveRecord("el_showroom", showroomId, "?$select=el_b_tradein_showroom")
                .then(
                    function success(result) {
                        if (result.el_b_tradein_showroom === true) {
                            return true;
                        } else
                            return false;
                    },
                    err => {
                        console.error(err);
                        commons.SetFormNotification("Error on el_lead.isTradeInShowroomRelated: " + err.message, commons.FormNotificationLevel.ERROR, "el_lead.isTradeInShowroomRelated")
                        return false;
                    }
                )

            // var OdataUtilObj = new OdataUtil();
            // var select = "el_b_tradein_showroom";
            // var showroom = OdataUtilObj.RetrieveData("el_showroomSet", showroomId, select, null, null, null, true);
            // if (showroom != null && showroom.el_b_tradein_showroom == true) {
            //     return true;
            // }
            // else {
            //     return false;
            // }
        }
        else
            return null;
    }

    /**
    * Method return TRUE if a 'el_b_trade_in_campaign' field of related campaign is equal true.
    */
    el_lead.isTradeInCampaignRelated = function () {
        commons.PageClearMessages("el_lead.isTradeInCampaignRelated");

        return new Promise((resolve, reject) => {
            var campaignId = commons.GetLookupId('campaignid');
            if (campaignId) {

                commons.RetrieveRecord("campaign", campaignId, "?$select=el_b_trade_in_campaign")
                    .then(
                        function success(result) {
                            if (result.el_b_trade_in_campaign === true) {
                                resolve(true);
                            } else
                                resolve(false);
                        },
                        err => {
                            console.error(err);
                            commons.SetFormNotification("Error on el_lead.isTradeInCampaignRelated: " + err.message, commons.FormNotificationLevel.ERROR, "el_lead.isTradeInCampaignRelated")
                            reject(err);
                        }
                    )

                // var OdataUtilObj = new OdataUtil();
                // var select = "el_b_trade_in_campaign";
                // var campaign = OdataUtilObj.RetrieveData("CampaignSet", campaignId, select, null, null, null, true);
                // if (campaign != null && campaign.el_b_trade_in_campaign == true) {
                //     return true;
                // }
                // else {
                //     return false;
                // }
            }
            else
                resolve(null);
        })
    }

    /**
     * Method check a el_b_tradein_showroom value of related campaign and set a Trade-in lead 'true' if campaign is trade-in campaign
     * + If campaign is NOT a trade-in camaign METHOD set a Trade-in lead 'true' if a showroom is Trade-in showroom.
     */
    el_lead.setTradeInLeadIfCampaignOrShowroomIsTardeIn = async function () {
        var isTradeInCampaign = await el_lead.isTradeInCampaignRelated();
        if (isTradeInCampaign == true) {
            commons.SetFieldValue('el_b_is_tradein_lead', true, commons.OnChangeBehavior.IfChanged);
            return;
        }
        if (isTradeInCampaign != true) {
            var isTradeInShowroom = await el_lead.isTradeInShowroomRelated();
            if (isTradeInShowroom == true) {
                commons.SetFieldValue('el_b_is_tradein_lead', true, commons.OnChangeBehavior.IfChanged);
                return;
            }
            else {
                commons.SetFieldValue('el_b_is_tradein_lead', false, commons.OnChangeBehavior.IfChanged);
                return;
            }
        }
    }

    //To Check -> check an multiple qualifying of leads
    el_lead.leadsGridDistributor = async function (gridControl, records, entityTypeCode) {
        // var selectedNotTradeInLeads = records;
        // selectedNotTradeInLeads.forEach(function (leadRef) {


        //     var OdataUtilObj = new OdataUtil();
        //     var select = "el_b_is_tradein_lead,StateCode,ParentAccountId,LeadId";
        //     var lead = OdataUtilObj.RetrieveData("LeadSet", leadRef.Id, select, null, null, null, true);

        //     if (lead && lead.el_b_is_tradein_lead === true && lead.StateCode.Value === 0) {
        //         el_lead.qualifyTradeInLeadAction(lead);
        //         records.splice(records.indexOf(leadRef), 1);
        //     }
        // });

        // Mscrm.LeadGridCommandActions.qualifyLeadQuick(gridControl, records, entityTypeCode);

        var leadsToQualifyStandard = [];

        await Promise.all(records.map(async function (leadRef) {
            try {
                var lead = await Xrm.WebApi.retrieveRecord("lead", leadRef.Id.replace("{", "").replace("}", ""), "?$select=el_b_is_tradein_lead,statecode,_parentaccountid_value");

                if (lead && lead.el_b_is_tradein_lead === true && lead.statecode === 0) {

                    await el_lead.qualifyTradeInLeadAction(lead);

                } else if (lead && lead.statecode === 0) {
                    leadsToQualifyStandard.push(leadRef.Id);
                }
            } catch (error) {
                console.error("Error on lead retrieving into el_lead.leadsGridDistributor() " + leadRef.Id + ": " + error.message);
            }
        }));

        if (leadsToQualifyStandard.length > 0) {
            var requests = leadsToQualifyStandard.map(function (leadId) {
                return {
                    getMetadata: function () {
                        return {
                            boundParameter: "entity",
                            parameterTypes: {
                                "entity": { "typeName": "mscrm.lead", "structuralProperty": 5 },
                                "CreateAccount": { "typeName": "Edm.Boolean", "structuralProperty": 1 },
                                "CreateContact": { "typeName": "Edm.Boolean", "structuralProperty": 1 },
                                "CreateOpportunity": { "typeName": "Edm.Boolean", "structuralProperty": 1 },
                                "Status": { "typeName": "Edm.Int32", "structuralProperty": 1 }
                            },
                            operationType: 0,
                            operationName: "QualifyLead"
                        };
                    },
                    entity: {
                        "entityType": "lead",
                        "id": leadId
                    },
                    CreateAccount: true,
                    CreateContact: true,
                    CreateOpportunity: true,
                    Status: 3 // Qualified
                };
            });

            Xrm.Utility.showProgressIndicator("אישור לידים...");

            Xrm.WebApi.online.executeMultiple(requests).then(
                function success(results) {
                    Xrm.Utility.closeProgressIndicator();

                    if (gridControl && typeof gridControl.refresh === "function") {
                        gridControl.refresh();
                    }
                },
                function error(err) {
                    Xrm.Utility.closeProgressIndicator();
                    Xrm.Navigation.openAlertDialog({ text: "שגיא בעת אישור לידים מרובת: " + err.message });
                }
            );
        } else {
            if (gridControl && typeof gridControl.refresh === "function") {
                gridControl.refresh();
            }
        }
    }


    el_lead.displayIconTooltipForStatus = function (rowData, userLCID) {
        var str = JSON.parse(rowData);
        var coldata = str.statuscode_Value;
        var imgName = "";
        var tooltip = "";
        switch (parseInt(coldata, 10)) {
            case 1:
            case 2:
            case 102910004:
            case 102910009:
                imgName = "el_yellow_circle_16X16.png";
                tooltip = "";
                break;

            case 3:
                imgName = "el_green_circle_16X16.png";
                tooltip = "";
                break;

            case 4:
            case 5:
            case 6:
            case 7:
            case 102910001:
            case 102910002:
            case 102910003:
            case 102910008:
            case 102910011:
                imgName = "el_red_circle_16X16.png";
                tooltip = "";
                break;

            default:
                imgName = "";
                tooltip = "";
                break;
        }
        var resultarray = [imgName, tooltip];
        return resultarray;
    }


    el_lead.exqcuteQualification = function () {
        commons.OpenProgressIndicator("אישור ליד ...");

        var qulifyLeadRequest = {
            getMetadata: function () {
                return {
                    boundParameter: "entity",
                    parameterTypes: {
                        "entity": { "typeName": "mscrm.lead", "structuralProperty": 5 },
                        "CreateAccount": { "typeName": "Edm.Boolean", "structuralProperty": 1 },
                        "CreateContact": { "typeName": "Edm.Boolean", "structuralProperty": 1 },
                        "CreateOpportunity": { "typeName": "Edm.Boolean", "structuralProperty": 1 },
                        "Status": { "typeName": "Edm.Int32", "structuralProperty": 1 }
                    },
                    operationType: 0,
                    operationName: "QualifyLead"
                };
            },
            entity: { "entityType": "lead", "id": commons.StripGuid(commons.GetCurrentEntityId()) },
            CreateAccount: true,
            CreateContact: true,
            CreateOpportunity: true,
            Status: 3 // 3 = Qualification
        };

        commons.executeRequest(qulifyLeadRequest,
            function success(response) {
                commons.CloseProgressIndicator();
                if (response.ok) {
                    response.json()
                        .then(
                            function (result) {
                                if (result.CreatedEntities && result.CreatedEntities.length > 0) {
                                    var opportunityRecord = result.CreatedEntities.find(function (e) {
                                        return e.entityType === "opportunity";
                                    });

                                    if (opportunityRecord) {

                                        var pageInput = {
                                            pageType: "entityrecord",
                                            entityName: "opportunity",
                                            entityId: opportunityRecord.id
                                        }

                                        var navigationOptions = {
                                            target: 1, //  1 opens it inline
                                        };

                                        //To Check
                                        commons.NavigateTo(pageInput, navigationOptions)
                                    }
                                    else
                                        commons.RefreshData()
                                }
                            }
                        )
                }
            },
            err => {
                commons.CloseProgressIndicator();
                console.error("Error on el_lead.exqcuteQualification(): ", err)
            })
    }

    el_lead.fillShowroom = async function () {
        if (commons.GetFormType() === Enum.FormType.Create && !commons.GetLookupId("el_id_showroom")) //create form only AND No Showroom seted
        {
            try {
                var currShowRoomLookupFieldId = commons.GetLookupId("el_id_showroom");
                var userResponse = await commons.RetrieveRecord("systemuser", commons.GetCurrentUserId(), "?$select=_businessunitid_value")

                if (userResponse && userResponse.businessunitid) {
                    var options = "?$select=name&$expand=el_id_showroom($select=el_b_mixed_showroom,el_name,el_showroomid)&$filter=businessunitid eq " + userResponse.businessunitid.id;
                    var businessUnitResponse = await commons.RetrieveMultipleRecords("businessunit", options)
                    if (businessUnitResponse && businessUnitResponse.length > 0) {
                        var showroomData = businessUnitResponse[0].el_id_showroom;
                        if (showroomData && showroomData.el_name) {

                            if (currShowRoomLookupFieldId) {
                                var newShowroomToSet = new RegExp(showroomData.el_showroomid, "i");
                                if (!newShowroomToSet.test(currShowRoomLookupFieldId)) {
                                    commons.SetLookupValue("el_id_showroom", showroomData.el_showroomid, showroomData.el_name, "el_showroom", commons.OnChangeBehavior.IfChanged);
                                }
                            }
                            else {
                                commons.SetLookupValue("el_id_showroom", showroomData.el_showroomid, showroomData.el_name, "el_showroom", commons.OnChangeBehavior.IfChanged);
                            }

                            if (commons.GetAttribute("el_b_mixed_showroom")) {
                                if (showroom.results[0].el_id_showroom.el_b_mixed_showroom) {
                                    commons.SetFieldValue("el_b_mixed_showroom", showroom.results[0].el_id_showroom.el_b_mixed_showroom);
                                    commons.SetVisible("el_id_manufacturer", true);
                                }
                                else {
                                    commons.SetVisible("el_id_manufacturer", false);
                                }
                            }
                        }
                        else {
                            commons.OpenAlertDialog("לא משויך אולם ליחידה העסקית שלך. פנה לתמיכה.");
                        }
                    }
                }
            } catch (error) {
                commons.SetFormNotification("Error on el_lead.fillShowroom: " + error.message, commons.FormNotificationLevel.ERROR, "el_lead.fillShowroom")
                console.error("Error on el_lead.fillShowroom", error);
            }
        }
    }

    //To Check -> check a retrieving data and field usege
    el_lead.fillManufacturer = function () {

        var showroomid = commons.GetLookupId("el_id_showroom");
        if (showroomid) {
            return new Promise((resolve, reject) => {
                commons.RetrieveRecord("el_showroom", showroomid, "?$select=_el_id_manufacturer_value,el_b_mixed_showroom")
                    .then(
                        function success(retrievedShowroom) {
                            if (retrievedShowroom && retrievedShowroom.el_id_manufacturer && !retrievedShowroom.el_b_mixed_showroom) {
                                commons.SetLookupValue("el_id_manufacturer", retrievedShowroom.el_id_manufacturer.id, retrievedShowroom.el_id_manufacturer.entityname, retrievedShowroom.el_id_manufacturer.entitytype, commons.OnChangeBehavior.IfChanged);
                            }
                            resolve();
                        },
                        err => {
                            console.error("Error on retrieve showroom into el_lead.fillManufacturer(): ", err);
                            commons.SetFormNotification("Error on el_lead.fillManufacturer(): " + err.message, commons.FormNotificationLevel.ERROR, "el_lead.fillManufacturer()");
                            reject();
                        }
                    )
            })
        }
    }

    el_lead.setManufacturerAndFamilyInLeadAndOpportunity = function () {
        commons.SetRequiredLevel("el_id_family", "required");
        commons.SetDisabled("el_id_family", true);
        commons.SetVisible("el_id_family", true);
        commons.SetVisible("el_id_manufacturer", false);
        if (commons.GetAttribute("el_s_future_model"))
            commons.SetVisible("el_s_future_model", false);


        if (commons.GetFieldValue("el_b_mixed_showroom") && commons.GetFormType() == Enum.FormType.Create)
            commons.SetVisible("el_id_manufacturer", true);

        if (commons.GetCurrentEntityName() == "lead" && commons.GetFieldValue("statuscode") == LEAD_STATUS_FUTURE_MODEL) {
            commons.SetRequiredLevel("el_id_family", "none");
            commons.SetVisible("el_id_family", false);
            commons.SetVisible("el_s_future_model", true);
        }

        if (commons.GetLookupId("el_id_manufacturer")) {
            commons.SetDisabled("el_id_family", false);

            var familyFilter = "<filter type='and'>" +
                "<condition attribute='el_id_manufacturer' operator='eq' value='" + commons.GetLookupId("el_id_manufacturer") + "' />" +
                "</filter>";

            commons.SetCustomFilterToLookupField("el_id_family", "el_family", familyFilter);
        }
        // el_lead.applyFilterFamily();
    }

    el_lead.validatePhoneNumber = function (fieldValue, pattern) {
        if (!fieldValue || !pattern)
            return true;

        if (fieldValue.match(pattern) != null)
            return true;
        return false;
    }



    el_lead.Ribbon = el_lead.Ribbon || {};

    el_lead.Ribbon.addFileRibbon = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        let name;
        if (commons.GetFieldValue("name"))
            name = commons.GetFieldValue("name");
        else if (commons.GetFieldValue("el_name"))
            name = commons.GetFieldValue("el_name");
        else if (commons.GetFieldValue("title"))
            name = commons.GetFieldValue("title");
        else if (commons.GetFieldValue("subject"))
            name = commons.GetFieldValue("subject");
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

        const navigationOptions = {
            target: 2, // 2 opens the page as a modal dialog
            position: 1 // 1 for center, 2 for side pane
        };

        commons.NavigateTo(pageInput, navigationOptions);
    }

    el_lead.Ribbon.executeCreateEmailWorkFlow = function (primaryControl) {
        debugger;

        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        var guid = commons.GetCurrentEntityId();

        if (guid != '' || guid != null)
            el_lead.runWorkflow("063EFF49-0293-4FB0-8DB2-8ABBA48C366A", commons.GetCurrentEntityId());// ליד - צור סיכום שיחה בדוא"ל
        setTimeout(el_lead.getEmailRegardingOpportunity, 1500);
    }

    el_lead.Ribbon.disqualifyLead = function (primaryControl) {
        debugger;

        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        if (!commons.GetLookupId("el_id_disqualify_primary_reason") || !commons.GetLookupId("el_id_disqualify_secondary_reason")) {
            commons.SetTabVisibility("lead_disqualify_tab", true);
            commons.SetFocus("lead_disqualify_tab");

            var leadFilter =
                "<filter type='and'>" +
                "<condition attribute='el_l_disqualify_entity_type' operator='eq' value='1'/>" +  //1 for lead, 2 for opportunity
                "</filter>";

            commons.SetCustomFilterToLookupField("el_id_disqualify_primary_reason", "el_disqualify_primary_reason", leadFilter);

            commons.OpenAlertDialog("חובה למלא סיבות פסילה בעת פסילת ליד");
        }
    }

    el_lead.Ribbon.updateLeadStatus = function (leadIds, selectedControl) {
        debugger;
        var countOfUpdatedLeads = 0;
        var unupdatedLeadsIds = "";

        if (leadIds && leadIds.length > 0) {
            leadIds.forEach(function (leadId) {
                //For knowling of leads is unupdated OR update
                if (el_lead.auditingLead(leadId) == true) {
                    unupdatedLeadsIds += leadId.toString() + ";";
                }
                else {
                    countOfUpdatedLeads++
                }
            });

            //To Check
            if (countOfUpdatedLeads > 0 && selectedControl && typeof selectedControl.refresh === "function") {
                debugger;
                selectedControl.refresh();
            }

            var txtToShow = [unescape("%u200F%u200F"), "עודכנו: " + countOfUpdatedLeads.toString() + " מתוך " + leadIds.length.toString() + " לידים", unescape("%u200F")].join('');

            Xrm.Navigation.openAlertDialog({ text: txtToShow })
            // window.commons.OpenAlertDialog("עודכנו: " + countOfUpdatedLeads.toString() + " מתוך " + leadIds.length.toString() + " לידים") //TASK 1344

            console.log("The unupdated leads id's: " + unupdatedLeadsIds)   //TASK 1344
        } else {
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }

            var leadId = commons.GetCurrentEntityId();
            el_lead.auditingLead(leadId);
        }
    }

    /**
     * Method check if the fields is validate
     * Part of TASK 1582 -> Dialog about lenght of first name before qualifing
     * Using into RibbonWorkbrench =>            Entity: Lead;              Commands: el.lead.QualifyTradeInLead.Command + Mscrm.Form.lead.ConvertQuick
     * @param {_formContext} context 
     */
    el_lead.Ribbon.fieldsValidation_BeforeQualify = function (context) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(context);
        }

        const isTradeInLead = commons.GetFieldValue("el_b_is_tradein_lead");
        const firstName = commons.GetFieldValue("firstname");
        if (firstName.length > 15) {
            console.log(Const.Message.Hebrew.Attention_MoreThan15CharsOnFirstName);
            commons.OpenAlertDialog(Const.Message.Hebrew.Attention_MoreThan15CharsOnFirstName, null, null)
        } else {
            if (isTradeInLead === true) {
                if (commons.GetIsDirty()) {
                    commons.Save()
                        .then(
                            function success() {
                                el_lead.convertLeadQuick();
                            },
                            err => console.error("Error on el_lead.Ribbon.fieldsValidation_BeforeQualify => Save: ", err)
                        )
                }
                else
                    el_lead.convertLeadQuick();
            }
            else {
                //To Check -> qualifying of lead
                // Mscrm.LeadCommandActions.qualifyLeadQuick();
                if (commons.GetIsDirty()) {
                    commons.Save()
                        .then(
                            function success() {
                                el_lead.exqcuteQualification();
                            },
                            err => console.error("Error on el_lead.Ribbon.fieldsValidation_BeforeQualify => Save: ", err)
                        )
                }
                else
                    el_lead.exqcuteQualification();
            }
        }
    }

    el_lead.Ribbon.reactiveLead = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        var entityData = {
            "statecode": 0,
            "statuscode": 1
        };

        //To Check
        commons.updateRecord("lead", commons.StripGuid(commons.GetCurrentEntityId()), entityData)
            .then(
                function (result) {
                    debugger;
                    if (result) {
                        commons.SetTabVisibility("lead_disqualify_tab", false);
                        commons.SetRequiredLevel("el_id_disqualify_primary_reason", "none");
                        commons.SetRequiredLevel("el_id_disqualify_secondary_reason", "none");
                        commons.RefreshData(false);
                    }
                },
                err => commons.OpenAlertDialog(err.message)
            )


        // var entity = {};
        // entity.statuscode = 1;
        // entity.statecode = 0;
        // var leadId = commons.GetCurrentEntityId();
        // leadId = leadId.slice(1, leadId.length - 1);
        // var req = new XMLHttpRequest();
        // //Xrm.Page.data.entity.save();
        // req.open("PATCH", Xrm.Page.context.getClientUrl() + "/api/data/v8.1/leads(" + leadId + ")", true);
        // req.setRequestHeader("OData-MaxVersion", "4.0");
        // req.setRequestHeader("OData-Version", "4.0");
        // req.setRequestHeader("Accept", "application/json");
        // req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        // req.onreadystatechange = function () {
        //     if (this.readyState === 4) {
        //         req.onreadystatechange = null;
        //         if (this.status === 204) {

        //             //Xrm.Page.data.save().then(successCallback(){Xrm.Page.data.refresh();}, errorCallback(err){});
        //             Xrm.Page.ui.tabs.get("lead_disqualify_tab").setVisible(false);
        //             Xrm.Page.getAttribute("el_id_disqualify_primary_reason").setRequiredLevel("none");
        //             Xrm.Page.getAttribute("el_id_disqualify_secondary_reason").setRequiredLevel("none");
        //             Xrm.Page.data.refresh(false);

        //         }
        //         else {
        //             Xrm.Utility.alertDialog(this.statusText);
        //         }
        //     }
        // };
        // req.send(JSON.stringify(entity));
    }

    el_lead.Ribbon.executeSendSmsDetailsOfShoowroom = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        const workflowId = 'CB11C0E6-FA6D-4071-810C-F87FF6A2A50C';
        el_lead.runWorkflow(workflowId, commons.GetCurrentEntityId());// ליד - שלח פרטי אולם תצוגה
        commons.OpenAlertDialog("נשלחה הודעה ללקוח");
    }

    el_lead.Ribbon.executeSendSmsLeadTriedToReach = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        var workflowId = '77D9EF6F-8B51-4600-8B95-22071C07BC8D';
        el_lead.runWorkflow(workflowId, commons.GetCurrentEntityId());// ליד - ניסינו להשיגך
        commons.OpenAlertDialog("נשלחה הודעה ללקוח");
    }

    el_lead.Ribbon.convertLeadQuick = function (gridControl, records, entityTypeCode) {
        //Home page GRID of Leads
        if (records && records.length > 0) {
            el_lead.leadsGridDistributor(gridControl, records, entityTypeCode);
        }
        //Inside of record
        else {
            el_lead.qualifyTradeInLeadAction();
        }
    }




    el_lead.Ribbon.EnableRules = el_lead.Ribbon.EnableRules || {};

    el_lead.Ribbon.EnableRules.showButtonReactiveLead = function (primaryControl) {
        return new Promise((resolve, reject) => {
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }

            commons.UserHasRoleOrIsAdmin()
                .then(
                    function (result) {

                        if (result === true) {
                            resolve(true);
                        } else {
                            const modifiedon = commons.GetFieldValue("modifiedon");
                            const statecode = commons.GetFieldValue("statecode");
                            let minDate4Reopen = new Date();
                            minDate4Reopen.setDate(minDate4Reopen.getDate() - Const.Value.DayRange4ReopenLead);
                            resolve(statecode == Enum.Lead.statecode.Disqualified && modifiedon >= minDate4Reopen ? true : false)
                        }
                        resolve(false);
                    },
                    err => {
                        console.error("Error on el_lead.showButtonReactiveLead(): " + err)
                        resolve(false)
                    }
                )
        })
    }

    el_lead.Ribbon.EnableRules.showSendSMSRibbon = function (primaryControl) {
        return new Promise((resolve, reject) => {
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }


            const SLA_TYPE_LEAD = "e4b46b72-3966-e311-80cc-00155d257801"; //doesn't supposed to changed, the db was redeployed
            const SLA_TYPE_DRIVETEST_SCHEDULE = "286d3025-3766-e311-80cc-00155d257801";

            const phoneCallsOpts = commons.Query("activityid,createdon,_el_id_sla_type_value,el_b_auto_sms_sent", "_regardingobjectid_value eq '" + commons.GetCurrentEntityId() + "'");
            commons.RetrieveMultipleRecords("phonecall", phoneCallsOpts, null, true)
                .then(
                    function (results) {

                        results.map(phoneCall => {
                            const slaTypeId = phoneCall._el_id_sla_type_value;
                            const smsSent = phoneCall.el_b_auto_sms_sent;
                            if (slaTypeId != null && !smsSent && (slaTypeId == SLA_TYPE_LEAD || slaTypeId == SLA_TYPE_DRIVETEST_SCHEDULE))
                                resolve(true);
                        })
                        resolve(false);
                    },
                    err => {
                        resolve(false);
                    }
                )
        })
    }

    el_lead.Ribbon.EnableRules.enableRuleLeadStatus = function (rolename, primaryControl) {
        return new Promise((resolve, reject) => {
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }

            commons.UserHasRoleOrIsAdmin("סימון ליד ביקורת")
                .then(
                    function (result) {
                        commons.SetVisible("el_b_auditing_lead", true);
                        resolve(result === true ? true : false);
                    },
                    err => {
                        console.error("Error on el_lead.showButtonReactiveLead(): " + err)
                        resolve(false)
                    }
                )
        })
    }

})(window.el_lead = window.el_lead || {})