(function (el_sms) {
    //---------------------CONSTS-----------------------------
    var FORMSTATE_CREATE = 1;
    var DOAR_TRACKING_LINK = "https://mypost.israelpost.co.il/%D7%9E%D7%A2%D7%A7%D7%91-%D7%9E%D7%A9%D7%9C%D7%95%D7%97%D7%99%D7%9D";
    var CELLPHONE_PATTERN = /^0\d{9}/;
    var CELLPHONE_PATTERN_MESSAGE = "על מספר טלפון נייד להכיל מינימום 10 ספרות ולהתחיל ב-0"

    //---------------------ENUMS-----------------------------
    var MESSAGE_TYPE = {
        NO_ANSWER: 1,
        DOAR_RASHUM: 2,
        EMAIL: 3,
        NO_ANSWER_CENTRAL_GARAGE: 4,
        MISSING_PART_CENTRAL_GARAGE: 5,
        SEVERAL_NO_ANSWER_CENTRAL_GARAGE: 6,
        CLOSE_CASE_CENTRAL_GARAGE: 7,
        DOAR_RASHUM_CENTRAL_GARAGE: 8,
        SERVICE_VEHICLE: 102910000

    };

    var SMS_FROM_ENUM = {
        INCIDENT: 1,
        LEAD: 2,
        OPPORTUNITY: 3
    }

    var SMS_FROM = SMS_FROM_ENUM.INCIDENT;

    var SMS_FIELDS = {
        accountName: "",
        leadName: "",
        ownerLead: "",
        showRoomNameForSms: "",
        showRoomName: "",
        el_b_mixed_showroom: false,
        showroomPhoneMazda: "",
        showroomPhoneFord: "",
        showroomPhoneBMW: "",
        showroomPhoneNIO: "",
        family: "",
        familyMini: false,
        manufacturer: "",
        manufacturerid: ""
    }

    var SERVICE = motors.Services.XrmService.V81;

    //-------------------FUNCTIONS---------------------------
    var Central_Garage = false;
    var common;

    el_sms.el_sms_onLoad = function (executionContext) {
        try{
            debugger;
            var Common = new elad_commons();
            Common.SetFormContext(executionContext);
    
            el_sms.clearPickListOptions();
            el_sms.showTabs();
            el_sms.el_smsAssignEventActions();
        }catch (error){
            Common.PageErrorHandler(error, "el_sms.el_sms_onLoad");
        }
    }

    el_sms.el_smsAssignEventActions = function () {
        Common.AddOnChange("el_l_msg_type", el_sms.msgTypeChanged);
        //Xrm.Page.getAttribute("el_id_template_sms").addOnChange(msgTypeChanged);
        Common.AddOnChange("el_s_telephone_num", el_sms.validatePhoneField);
        Common.AddOnChange("el_id_template_sms", el_sms.updateSubjectText);
        Common.AddOnChange("el_id_template_sms", el_sms.checkSendSmsNow);
        Common.AddOnSave(el_sms_onSave);
    }

    el_sms.checkSendSmsNow = function () {
        Common.SetFieldValue("el_b_send_now", true);
    }

    el_sms.clearPickListOptions = function () {

        var el_l_msg_type = Common.GetControl("el_l_msg_type");
        if (Common.UserHasRoleOrIsAdmin("דלק מוטורס - נציג שירות מוסך מרכזי")) {
            Central_Garage = true;

            el_l_msg_type.removeOption(MESSAGE_TYPE.NO_ANSWER);
            el_l_msg_type.removeOption(MESSAGE_TYPE.DOAR_RASHUM);
            el_l_msg_type.removeOption(MESSAGE_TYPE.EMAIL);
        }
        else if (el_sms.UserHasAdminRole()) {
            // this statement is to show all options of the picklist, no code needen
            null;
        }
        else {
            el_l_msg_type.removeOption(MESSAGE_TYPE.NO_ANSWER_CENTRAL_GARAGE);
            el_l_msg_type.removeOption(MESSAGE_TYPE.MISSING_PART_CENTRAL_GARAGE);
            el_l_msg_type.removeOption(MESSAGE_TYPE.SEVERAL_NO_ANSWER_CENTRAL_GARAGE);
            el_l_msg_type.removeOption(MESSAGE_TYPE.CLOSE_CASE_CENTRAL_GARAGE);
            el_l_msg_type.removeOption(MESSAGE_TYPE.DOAR_RASHUM_CENTRAL_GARAGE);
        }
    }

    el_sms.showTabs = function () {
        debugger;
        /// <summary>
        /// show or hides form tabs: if manual SMS from incident, shows service_tab
        /// </summary>
        Common.SetTabVisibility("tab_service", false);
        Common.SetTabVisibility("tab_general", true);
        Common.SetTabVisibility("tab_management", true);
        Common.SetRequiredLevel("el_l_msg_type", 'none');

        var form = Common.GetFormType();
        var regardingObject = Common.GetFieldValue("regardingobjectid");

        if (regardingObject && regardingObject[0] && regardingObject[0].entityType == "incident" && form == FORMSTATE_CREATE) {
            Common.SetTabVisibility("tab_service", true);
            Common.SetTabVisibility("tab_general", false);
            Common.SetTabVisibility("tab_management", false);
            Common.SetRequiredLevel("el_l_msg_type", 'required');
            el_sms.updateAccountDetails();
            el_sms.updateSubjectText();

        } else if (form == FORMSTATE_CREATE && (!regardingObject || !regardingObject[0])) {
            Common.SetTabVisibility("tab_service", false);
            Common.SetTabVisibility("tab_general", false);
            Common.SetTabVisibility("tab_management", false);
            el_sms.tabSelector();

        } else if (form != FORMSTATE_CREATE) {
            Common.SetTabVisibility("tab_service", false);
            Common.SetTabVisibility("tab_general", true);
            Common.SetTabVisibility("tab_management", true);
            el_sms.tabSelector();
        } else if (regardingObject && regardingObject[0] && regardingObject[0].entityType == "lead" && form == FORMSTATE_CREATE) {
            SMS_FROM = SMS_FROM_ENUM.LEAD;
            el_sms.updateAccountDetailsLead();
            Common.SetTabVisibility("tab_service", true);
            Common.SetRequiredLevel("el_l_msg_type", 'required');
            var fieldsArr = ["el_dt_contactedon", "el_s_part_info", "el_s_tracking_number", "el_s_tracking_link", "el_s_email"];
            el_sms.fieldSetVisible(fieldsArr, false);
            el_sms.updateSubjectText();
        }
        else if (regardingObject && regardingObject[0] && regardingObject[0].entityType == "opportunity" && form == FORMSTATE_CREATE) {
            SMS_FROM = SMS_FROM_ENUM.OPPORTUNITY;
            el_sms.updateAccountDetailsOpp();
            Common.SetTabVisibility("tab_service", true);
            Common.SetRequiredLevel("el_l_msg_type", 'required');
            var fieldsArr = ["el_dt_contactedon", "el_s_part_info", "el_s_tracking_number", "el_s_tracking_link", "el_s_email"];
            el_sms.fieldSetVisible(fieldsArr, false);
            el_sms.updateSubjectText();
        }
    }

    el_sms.fieldSetVisible = function (fieldsArr, falseTrue) {
        fieldsArr.forEach(function (field) {
            if (Common.GetControl(field) != null) {
                Common.SetVisible(field, falseTrue);
            }
        })
    }

    el_sms.tabSelector = function () {
        debugger;

        if (Common.GetFieldValue("el_id_service_point") != null) {
            var service_point = Common.GetFieldValue("el_id_service_point");
            var lookupValue = new Array();
            lookupValue[0] = new Object();
            lookupValue[0].id = service_point[0].id;
            lookupValue[0].name = service_point[0].name;
            lookupValue[0].entityType = service_point[0].entityType;
            Common.SetFieldValue("regardingobjectid", lookupValue);

            Common.SetTabVisibility("tab_service_point", true);

            Common.SetRequiredLevel("el_s_telephone_num", 'required');
            var flag = Common.GetFieldValue("el_id_service_point") != null;
            Common.SetTabVisibility("tab_service_point", flag);
            var lookupValueTemplate = new Array();
            lookupValueTemplate[0] = new Object();
            lookupValueTemplate[0].id = "E99FEC36-73DF-EE11-811A-005056B25750";
            lookupValueTemplate[0].name = "הודעת SMS עם פרטי מרכז שירות";
            lookupValueTemplate[0].entityType = "el_sms_template";
            Common.SetFieldValue("el_id_template_sms", lookupValueTemplate);
        }
        else if (Common.GetFieldValue("el_id_tutorial_video") != null) {
            var tutorial_video = Common.GetFieldValue("el_id_tutorial_video");
            var lookupValue = new Array();
            lookupValue[0] = new Object();
            lookupValue[0].id = tutorial_video[0].id;
            lookupValue[0].name = tutorial_video[0].name;
            lookupValue[0].entityType = tutorial_video[0].entityType;
            Common.SetFieldValue("regardingobjectid", lookupValue);
            Common.SetTabVisibility("tab_tutorial_video", true);
            Common.SetRequiredLevel("el_s_telephone_num", 'required');
            var flag = Common.GetFieldValue("el_id_tutorial_video") != null;
            Common.SetTabVisibility("tab_tutorial_video", flag);
        }
    }

    el_sms.validatePhoneField = function () {
        try {
            if (!el_sms.validatePhoneNumber(Common.GetFieldValue("el_s_telephone_num"), CELLPHONE_PATTERN)) {
                Common.OpenAlertDialog(CELLPHONE_PATTERN_MESSAGE);
                return false;
            }
            return true;
        }
        catch (error) {
            Common.OpenAlertDialog("Error in function: " + error.message + ',' + error.description);
        }
    }

    el_sms.validatePhoneNumber = function (fieldValue, pattern) {
        if (!fieldValue || !pattern)
            return true;
        debugger
        if (fieldValue.match(pattern) != null && fieldValue.length == 10)
            return true;
        return false;
    }


    el_sms.msgTypeChanged = function () {
        debugger;
        /// <summary>
        /// shows and hides fields related to el_l_msg_type (el_s_tracking_number, el_s_tracking_link, el_s_email)
        /// </summary>
        var msgtype = Common.GetFieldValue("el_l_msg_type");


        var el_s_tracking_numberAttr = Common.GetAttribute("el_s_tracking_number");
        var el_s_tracking_linkAttr = Common.GetAttribute("el_s_tracking_link");
        var el_s_part_infoAttr = Common.GetAttribute("el_s_part_info");
        var el_s_part_info = Common.GetAttribute("el_s_part_info");
        var el_s_emailAttr = Common.GetAttribute("el_s_email");
        var el_s_tracking_numberCtrl = Common.GetControl("el_s_tracking_number");
        var el_s_tracking_linkCtrl = Common.GetControl("el_s_tracking_link");
        var el_s_emailCtrl = Common.GetControl("el_s_email");

        switch (msgtype) {
            case MESSAGE_TYPE.NO_ANSWER:
                el_s_tracking_numberAttr.setValue(null);
                el_s_tracking_numberCtrl.setVisible(false);
                el_s_tracking_numberAttr.setRequiredLevel('none');
                el_s_tracking_linkAttr.setValue(null);
                el_s_tracking_linkCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_emailCtrl.setVisible(false);
                el_s_emailAttr.setRequiredLevel('none');
                el_s_part_info.setVisible(false);
                el_s_part_infoAttr.setRequiredLevel('none');
                break;
            case MESSAGE_TYPE.DOAR_RASHUM:
                el_s_tracking_numberAttr.setRequiredLevel('required');
                el_s_tracking_numberCtrl.setVisible(true);
                el_s_tracking_linkAttr.setRequiredLevel('required');
                el_s_tracking_linkCtrl.setVisible(true);
                //el_s_tracking_linkAttr.setValue(DOAR_TRACKING_LINK);
                el_s_emailCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_part_info.setVisible(false);
                el_s_part_infoAttr.setRequiredLevel('none');
                break;
            case MESSAGE_TYPE.EMAIL:
                el_s_tracking_numberAttr.setValue(null);
                el_s_tracking_numberCtrl.setVisible(false);
                el_s_tracking_numberAttr.setRequiredLevel('none');
                el_s_tracking_linkAttr.setValue(null);
                el_s_tracking_linkCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_emailCtrl.setVisible(true);
                el_s_emailAttr.setRequiredLevel('required');
                el_s_part_info.setVisible(false);
                el_s_part_infoAttr.setRequiredLevel('none');
                break;
            case MESSAGE_TYPE.NO_ANSWER_CENTRAL_GARAGE:
                el_s_tracking_numberAttr.setValue(null);
                el_s_tracking_numberCtrl.setVisible(false);
                el_s_tracking_numberAttr.setRequiredLevel('none');
                el_s_tracking_linkAttr.setValue(null);
                el_s_tracking_linkCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_emailCtrl.setVisible(false);
                el_s_emailAttr.setRequiredLevel('none');
                el_s_part_info.setVisible(false);
                el_s_part_infoAttr.setRequiredLevel('none');
                break;
            case MESSAGE_TYPE.MISSING_PART_CENTRAL_GARAGE:
                el_s_tracking_numberAttr.setRequiredLevel('none');
                el_s_tracking_numberCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_tracking_linkCtrl.setVisible(false);
                el_s_emailCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_part_info.setVisible(true);
                el_s_part_infoAttr.setRequiredLevel('required');
                break;
            case MESSAGE_TYPE.SEVERAL_NO_ANSWER_CENTRAL_GARAGE:
                el_s_tracking_numberAttr.setValue(null);
                el_s_tracking_numberCtrl.setVisible(false);
                el_s_tracking_numberAttr.setRequiredLevel('none');
                el_s_tracking_linkAttr.setValue(null);
                el_s_tracking_linkCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_emailCtrl.setVisible(false);
                el_s_emailAttr.setRequiredLevel('none');
                el_s_part_info.setVisible(false);
                el_s_part_infoAttr.setRequiredLevel('none');
                break;
            case MESSAGE_TYPE.CLOSE_CASE_CENTRAL_GARAGE:
                el_s_tracking_numberAttr.setValue(null);
                el_s_tracking_numberCtrl.setVisible(false);
                el_s_tracking_numberAttr.setRequiredLevel('none');
                el_s_tracking_linkAttr.setValue(null);
                el_s_tracking_linkCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_emailCtrl.setVisible(false);
                el_s_emailAttr.setRequiredLevel('none');
                el_s_part_info.setVisible(false);
                el_s_part_infoAttr.setRequiredLevel('none');
                break;
            case MESSAGE_TYPE.DOAR_RASHUM_CENTRAL_GARAGE:
                el_s_tracking_numberAttr.setRequiredLevel('required');
                el_s_tracking_numberCtrl.setVisible(true);
                el_s_tracking_linkAttr.setRequiredLevel('required');
                el_s_tracking_linkCtrl.setVisible(true);
                //el_s_tracking_linkAttr.setValue(DOAR_TRACKING_LINK);
                el_s_emailCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_part_info.setVisible(false);
                el_s_part_infoAttr.setRequiredLevel('none');
                break;
            ////TASK 1359 - adding new type of SMS - on HOLD from 26/1/25
            //case MESSAGE_TYPE.MEETING_AT_A_CLIENTS_HOME:
            //    el_s_tracking_numberAttr.setValue(null);
            //    el_s_tracking_numberCtrl.setVisible(false);
            //    el_s_tracking_numberAttr.setRequiredLevel('none');
            //    el_s_tracking_linkAttr.setValue(null);
            //    el_s_tracking_linkCtrl.setVisible(false);
            //    el_s_tracking_linkAttr.setRequiredLevel('none');
            //    el_s_emailCtrl.setVisible(false);
            //    el_s_emailAttr.setRequiredLevel('none');
            //    el_s_part_info.setVisible(false);
            //    el_s_part_infoAttr.setRequiredLevel('none');
            //    break;


            default:
                el_s_tracking_numberAttr.setValue(null);
                el_s_tracking_numberCtrl.setVisible(false);
                el_s_tracking_numberAttr.setRequiredLevel('none');
                el_s_tracking_linkAttr.setValue(null);
                el_s_tracking_linkCtrl.setVisible(false);
                el_s_tracking_linkAttr.setRequiredLevel('none');
                el_s_emailCtrl.setVisible(false);
                el_s_emailAttr.setRequiredLevel('none')
                break;
        }
    }

    /*el_sms.updateAccountDetails = function() { //tbd
        /// <summary>
        /// updates el_id_account, el_s_telephone_num and el_s_email fields from regarding incident
        /// </summary>
        var accountLookup = null;
        var odatautil = new OdataUtil();
        var incidentId = Xrm.Page.getAttribute("regardingobjectid").getValue()[0].id;
        var url = "IncidentSet?$select=incident_customer_accounts/AccountId,incident_customer_accounts/Name,incident_customer_accounts/Telephone1,incident_customer_accounts/EMailAddress1&$expand=incident_customer_accounts&$filter=IncidentId eq guid'" + incidentId + "'";
        var account = odatautil.RetrieveDataByUrl("", url, null, null, true);
        if (account && account.results && account.results[0] && account.results[0].incident_customer_accounts) {
            var id = account.results[0].incident_customer_accounts.AccountId;
            var name = account.results[0].incident_customer_accounts.Name;
            accountLookup = getLookupField(id, name, "account");
            Xrm.Page.getAttribute("el_id_account").setValue(accountLookup);
            Xrm.Page.getAttribute("el_s_telephone_num").setValue(account.results[0].incident_customer_accounts.Telephone1);
            Xrm.Page.getAttribute("el_s_email").setValue(account.results[0].incident_customer_accounts.EMailAddress1);
        }
    }*/

    el_sms.updateAccountDetails = function () {
        /// <summary>
        /// Updates el_id_account, el_s_telephone_num and el_s_email fields from regarding incident
        /// </summary>

        var regarding = Common.GetFieldValue("regardingobjectid");

        if (!regarding || !regarding[0] || !regarding[0].id) {
            return;
        }

        var incidentId = regarding[0].id.replace(/[{}]/g, "");

        Common.RetrieveRecord("incident", incidentId, "?$expand=incident_customer_accounts($select=accountid,name,telephone1,emailaddress1)").then(
            function success(result) {
                if (!result || !result.incident_customer_accounts) {
                    return;
                }

                var account = result.incident_customer_accounts;

                Common.SetFieldValue("el_id_account", [{
                    id: account.accountid,
                    name: account.name,
                    entityType: "account"
                }]);

                Common.SetFieldValue("el_s_telephone_num", account.telephone1 || null);
                Common.SetFieldValue("el_s_email", account.emailaddress1 || null);
            },
            function error(error) {
                console.log(error.message);
            }
        );
    };

    /*function updateAccountDetailsLead() { //tbd
        if (Xrm.Page.getAttribute("regardingobjectid") != null && Xrm.Page.getAttribute("regardingobjectid").getValue() != null) {
            Xrm.Page.getAttribute("el_l_msg_type").setValue(MESSAGE_TYPE.NO_ANSWER);
            var leadId = motors.Utilities.FormatId(Xrm.Page.getAttribute("regardingobjectid").getValue()[0].id);
            var leadRequest = motors.Services.XrmService.RetrieveRequest();
            leadRequest.logicalName = "lead";
            leadRequest.attributes = "firstname,lastname,_el_id_showroom_value,mobilephone,telephone1,_ownerid_value,_el_id_family_value";
            leadRequest.count = true;
            leadRequest.filters = [{ field: "leadid", filterOperator: 'eq', value: leadId }];
            var results = SERVICE.Retrieve(leadRequest);
            if (results != null && results.value != null && results.value[0] != null) {
                setManufacturer(results.value[0]._el_id_family_value)
                var workingTel = results.value[0].mobilephone ? results.value[0].mobilephone : results.value[0].telephone1;
                Xrm.Page.getAttribute("el_s_telephone_num").setValue(workingTel);
                SMS_FIELDS.accountName = results.value[0].firstname;
                SMS_FIELDS.leadName = results.value[0].firstname + " " + results.value[0].lastname;
                if (results.value[0]._ownerid_value) {
                    var ownerId = results.value[0]._ownerid_value;
                    var systemuserRequest = motors.Services.XrmService.RetrieveRequest();
                    systemuserRequest.logicalName = "systemuser";
                    systemuserRequest.attributes = "fullname";
                    systemuserRequest.count = true;
                    systemuserRequest.filters = [{ field: "systemuserid", filterOperator: 'eq', value: ownerId }];
                    var systemuserResults = SERVICE.Retrieve(systemuserRequest);
                    if (systemuserResults.value[0].fullname) {
                        SMS_FIELDS.ownerLead = systemuserResults.value[0].fullname;
                    }
                }
                setShowroomDetails(results.value[0]._el_id_showroom_value);
            }
        }
    }*/

    el_sms.updateAccountDetailsLead = function () {
        var regarding = Common.GetFieldValue("regardingobjectid");

        if (!regarding || !regarding[0] || !regarding[0].id) {
            return;
        }

        Common.SetFieldValue("el_l_msg_type", MESSAGE_TYPE.NO_ANSWER);

        var leadId = regarding[0].id.replace(/[{}]/g, "");

        Common.RetrieveRecord("lead", leadId, "?$select=firstname,lastname,_el_id_showroom_value,mobilephone,telephone1,_ownerid_value,_el_id_family_value").then(
            function success(lead) {
                if (!lead) {
                    return;
                }

                el_sms.setManufacturer(lead._el_id_family_value);

                var workingTel = lead.mobilephone ? lead.mobilephone : lead.telephone1;

                Common.SetFieldValue("el_s_telephone_num", workingTel || null);

                SMS_FIELDS.accountName = lead.firstname || "";
                SMS_FIELDS.leadName = ((lead.firstname || "") + " " + (lead.lastname || "")).trim();

                if (lead._ownerid_value) {
                    Common.RetrieveRecord("systemuser", lead._ownerid_value, "?$select=fullname").then(
                        function success(systemuser) {
                            if (systemuser && systemuser.fullname) {
                                SMS_FIELDS.ownerLead = systemuser.fullname;
                            }
                        },
                        function error(error) {
                            console.log(error.message);
                        }
                    );
                }

                el_sms.setShowroomDetails(lead._el_id_showroom_value);
            },
            function error(error) {
                console.log(error.message);
            }
        );
    }

    /*function updateAccountDetailsOpp() { //tbd
        if (Xrm.Page.getAttribute("regardingobjectid") != null && Xrm.Page.getAttribute("regardingobjectid").getValue() != null) {
            Xrm.Page.getAttribute("el_l_msg_type").setValue(MESSAGE_TYPE.NO_ANSWER);
            var oppId = motors.Utilities.FormatId(Xrm.Page.getAttribute("regardingobjectid").getValue()[0].id);
            var oppRequest = motors.Services.XrmService.RetrieveRequest();
            oppRequest.logicalName = "opportunity";
            oppRequest.attributes = "_customerid_value,_el_id_showroom_value,_el_id_family_value";
            oppRequest.count = true;
            oppRequest.filters = [{ field: "opportunityid", filterOperator: 'eq', value: oppId }];
            var results = SERVICE.Retrieve(oppRequest);

            if (results != null && results.value != null) {
                setManufacturer(results.value[0]._el_id_family_value)
                SMS_FIELDS.accountName = getAccountName(results.value[0]._customerid_value);
                setShowroomDetails(results.value[0]._el_id_showroom_value);
            }
        }
    }*/

    el_sms.updateAccountDetailsOpp = function () {
        var regarding = Common.GetFieldValue("regardingobjectid");

        if (!regarding || !regarding[0] || !regarding[0].id) {
            return;
        }

        Common.SetFieldValue("el_l_msg_type", MESSAGE_TYPE.NO_ANSWER);

        var oppId = regarding[0].id.replace(/[{}]/g, "");

        Common.RetrieveRecord("opportunity", oppId, "?$select=_customerid_value,_el_id_showroom_value,_el_id_family_value").then(
            function success(opportunity) {
                if (!opportunity) {
                    return;
                }

                el_sms.setManufacturer(opportunity._el_id_family_value);

                SMS_FIELDS.accountName = getAccountName(opportunity._customerid_value);

                el_sms.setShowroomDetails(opportunity._el_id_showroom_value);
            },
            function error(error) {
                console.log(error.message);
            }
        );
    }

    /*function setShowroomDetails(showroomId) { //tbd
        var service = motors.Services.XrmService.V81;
        var showromRequest = motors.Services.XrmService.RetrieveRequest();

        showromRequest.logicalName = "el_showroom";
        showromRequest.attributes = "el_s_name_for_sms,el_name,_el_id_systemuser_showroom_mng_value,el_s_phone,el_s_phone_mazda,el_s_phone_ford,el_s_phone_nio,el_b_mixed_showroom";
        showromRequest.count = true;
        showromRequest.filters = [{ field: "el_showroomid", filterOperator: 'eq', value: showroomId }];
        var results = service.Retrieve(showromRequest);
        if (results != null && results.value != null && results.value[0] != null && results.value[0].el_s_name_for_sms != null) {
            SMS_FIELDS.showRoomName = results.value[0].el_name;
            SMS_FIELDS.showRoomNameForSms = results.value[0].el_s_name_for_sms;
            SMS_FIELDS.el_b_mixed_showroom = results.value[0].el_b_mixed_showroom;
            SMS_FIELDS.showroomPhoneBMW = results.value[0].el_s_phone;
            SMS_FIELDS.showroomPhoneMazda = results.value[0].el_s_phone_mazda;
            SMS_FIELDS.showroomPhoneFord = results.value[0].el_s_phone_ford
            SMS_FIELDS.showroomPhoneNIO = results.value[0].el_s_phone_nio;

        }
    }*/

    el_sms.setShowroomDetails = function (showroomId) {

        if (!showroomId) {
            return;
        }

        showroomId = showroomId.replace(/[{}]/g, "");

        Common.RetrieveRecord("el_showroom", showroomId, "?$select=el_s_name_for_sms,el_name,_el_id_systemuser_showroom_mng_value,el_s_phone,el_s_phone_mazda,el_s_phone_ford,el_s_phone_nio,el_b_mixed_showroom").then(
            function success(showroom) {

                if (showroom && showroom.el_s_name_for_sms) {

                    SMS_FIELDS.showRoomName = showroom.el_name;
                    SMS_FIELDS.showRoomNameForSms = showroom.el_s_name_for_sms;
                    SMS_FIELDS.el_b_mixed_showroom = showroom.el_b_mixed_showroom;

                    SMS_FIELDS.showroomPhoneBMW = showroom.el_s_phone;
                    SMS_FIELDS.showroomPhoneMazda = showroom.el_s_phone_mazda;
                    SMS_FIELDS.showroomPhoneFord = showroom.el_s_phone_ford;
                    SMS_FIELDS.showroomPhoneNIO = showroom.el_s_phone_nio;
                }
            },
            function error(error) {
                console.log(error.message);
            }
        );
    }

    /*function getAccountName(accountId) { //tbd
        var service = motors.Services.XrmService.V81;
        var accountRequest = motors.Services.XrmService.RetrieveRequest();
        accountRequest.logicalName = "account";
        accountRequest.attributes = "el_s_first_name,el_s_last_name,telephone1,telephone2";
        accountRequest.count = true;
        accountRequest.filters = [{ field: "accountid", filterOperator: 'eq', value: accountId }];
        var results = service.Retrieve(accountRequest);
        if (results != null && results.value != null) {
            var workingTel = results.value[0].telephone1 ? results.value[0].telephone1 : results.value[0].telephone2;
            Xrm.Page.getAttribute("el_s_telephone_num").setValue(workingTel);
            motors.Utilities.setLookupValue(accountId,
                results.value[0].el_s_first_name + " " + results.value[0].el_s_last_name, "account", "el_id_account");
            return results.value[0].el_s_first_name;
        } else {
            console.log("el_sms,getAccountName - el_s_first_name EMPTY");
            return "";
        }
    }*/

    el_sms.getAccountName = function (accountId) {
        if (!accountId) {
            console.log("el_sms,getAccountName - accountId EMPTY");
            return Promise.resolve("");
        }

        accountId = accountId.replace(/[{}]/g, "");

        return Common.RetrieveRecord("account", accountId, "?$select=el_s_first_name,el_s_last_name,telephone1,telephone2").then(
            function success(account) {
                if (!account) {
                    console.log("el_sms,getAccountName - account EMPTY");
                    return "";
                }

                var workingTel = account.telephone1 ? account.telephone1 : account.telephone2;

                Common.SetFieldValue("el_s_telephone_num", workingTel || null);

                Common.SetFieldValue("el_id_account", [{
                    id: accountId,
                    name: ((account.el_s_first_name || "") + " " + (account.el_s_last_name || "")).trim(),
                    entityType: "account"
                }]);

                return account.el_s_first_name || "";
            },
            function error(error) {
                console.log(error.message);
                return "";
            }
        );
    }

    /*function setManufacturer(familyid) { //tbd
        if (familyid != null) {
            var familyRequest = motors.Services.XrmService.RetrieveRequest();
            familyRequest.logicalName = "el_family";
            familyRequest.attributes = "el_name,el_familyid,el_l_sub_manufacturer";
            familyRequest.expand = "el_id_manufacturer($select=el_name,el_manufacturerid)";
            familyRequest.count = true;
            familyRequest.filters = [{ field: "el_familyid", filterOperator: 'eq', value: familyid }];
            var results = SERVICE.Retrieve(familyRequest);
            if (results != null && results.value != null && results.value[0] != null && results.value[0].el_id_manufacturer != null) {
                SMS_FIELDS.manufacturer = results.value[0].el_id_manufacturer.el_name;
                SMS_FIELDS.manufacturerid = results.value[0].el_id_manufacturer.el_manufacturerid;
                SMS_FIELDS.family = results.value[0].el_name;
                if (results.value[0].el_l_sub_manufacturer === 1)
                    SMS_FIELDS.familyMini = true;
            }
        }
    }*/

    el_sms.setManufacturer = function (familyId) {

        if (!familyId) {
            return;
        }

        familyId = familyId.replace(/[{}]/g, "");

        Common.RetrieveRecord("el_family", familyId, "?$select=el_name,el_familyid,el_l_sub_manufacturer&$expand=el_id_manufacturer($select=el_name,el_manufacturerid)").then(
            function success(family) {

                if (family && family.el_id_manufacturer) {
                    SMS_FIELDS.manufacturer = family.el_id_manufacturer.el_name;
                    SMS_FIELDS.manufacturerid = family.el_id_manufacturer.el_manufacturerid;
                    SMS_FIELDS.family = family.el_name;

                    if (family.el_l_sub_manufacturer === 1) {
                        SMS_FIELDS.familyMini = true;
                    }
                }
            },
            function error(error) {
                console.log(error.message);
            }
        );
    }

    el_sms.el_sms_onSave = function (eContext) {
        debugger;
        var regardingObject = Common.GetFieldValue("regardingobjectid");
        var msgType = Common.GetFieldValue("el_l_msg_type");
        if (regardingObject && regardingObject[0] && regardingObject[0].entityType == "incident")
            //updateMessageText();
            el_sms.updateTemplateSms(msgType);
        if (regardingObject && regardingObject[0] && (SMS_FROM == SMS_FROM_ENUM.LEAD)) {
            //messageTextFromTemplate(SMS_FROM_ENUM.LEAD);
            el_sms.updateTemplateSms(msgType);
        }
        if (regardingObject && regardingObject[0] && (SMS_FROM == SMS_FROM_ENUM.OPPORTUNITY)) {
            //messageTextFromTemplate(SMS_FROM_ENUM.OPPORTUNITY);
            el_sms.updateTemplateSms(msgType);
        }
        if (!validatePhoneField()) {
            eContext.getEventArgs().preventDefault();
        }
    }

    el_sms.updateSubjectText = function () {
        var accountName = Common.GetFieldValue("el_id_account") ? Common.GetLookupName("el_id_account") : "";
        if (!Common.GetFieldValue('subject')) {
            Common.SetFieldValue('subject', "הודעת SMS יוצאת ללקוח" + ' ' + accountName);
        }

        if (Common.GetFieldValue("el_id_template_sms") != null) {
            var subject = Common.GetLookupName("el_id_template_sms");
            Common.SetFieldValue('subject', subject);
        }
    }

    //el_sms.updateTemplateSms = function(msgType) { //tbd
    //    debugger;
    //    var OdataUtilObj = new OdataUtil();
    //    var regardingSms = Xrm.Page.getAttribute("regardingobjectid").getValue();
    //    var entityTypeFormregardingSms = regardingSms[0].entityType;

    //    switch (msgType) {
    //        case MESSAGE_TYPE.NO_ANSWER:
    //            if (entityTypeFormregardingSms == 'lead') {
    //                var lead = OdataUtilObj.RetrieveData("LeadSet", regardingSms[0].id, "el_id_manufacturer", null, null, null, false);
    //                if (SMS_FIELDS.manufacturer == "NIO") {
    //                    var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 1 and el_l_entity/Value eq 1 and el_id_manufacturer/Id eq guid'" + lead.el_id_manufacturer.Id + "'";
    //                    var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //                    if (results && results.results && results.results.length >= 1) {
    //                        var lookupValueTemplate = new Array();
    //                        lookupValueTemplate[0] = new Object();
    //                        lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                        lookupValueTemplate[0].name = results.results[0].el_name;
    //                        lookupValueTemplate[0].entityType = "el_sms_template";
    //                        Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                    }
    //                }
    //                else {
    //                    var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 1 and el_l_entity/Value eq 1 and el_id_manufacturer/Id eq null";
    //                    var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //                    if (results && results.results && results.results.length >= 1) {
    //                        var lookupValueTemplate = new Array();
    //                        lookupValueTemplate[0] = new Object();
    //                        lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                        lookupValueTemplate[0].name = results.results[0].el_name;
    //                        lookupValueTemplate[0].entityType = "el_sms_template";
    //                        Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);

    //                    }
    //                }
    //            }
    //            else if (entityTypeFormregardingSms == 'opportunity') {
    //                var opportunity = OdataUtilObj.RetrieveData("OpportunitySet", regardingSms[0].id, "el_id_manufacturer", null, null, null, false);
    //                if (SMS_FIELDS.manufacturer == "NIO") {
    //                    var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 1 and el_l_entity/Value eq 3 and el_id_manufacturer/Id eq guid'" + opportunity.el_id_manufacturer.Id + "'";
    //                    var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //                    if (results && results.results && results.results.length >= 1) {
    //                        var lookupValueTemplate = new Array();
    //                        lookupValueTemplate[0] = new Object();
    //                        lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                        lookupValueTemplate[0].name = results.results[0].el_name;
    //                        lookupValueTemplate[0].entityType = "el_sms_template";
    //                        Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                        Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //                    }
    //                }
    //                else {
    //                    var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 1 and el_l_entity/Value eq 3 and el_id_manufacturer/Id eq null";
    //                    var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //                    if (results && results.results && results.results.length >= 1) {
    //                        var lookupValueTemplate = new Array();
    //                        lookupValueTemplate[0] = new Object();
    //                        lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                        lookupValueTemplate[0].name = results.results[0].el_name;
    //                        lookupValueTemplate[0].entityType = "el_sms_template";
    //                        Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                        Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //                    }
    //                }
    //            }
    //            else if (entityTypeFormregardingSms == 'incident') {
    //                var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 1 and el_l_entity/Value eq 6";
    //                var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //                if (results && results.results && results.results.length >= 1) {
    //                    var lookupValueTemplate = new Array();
    //                    lookupValueTemplate[0] = new Object();
    //                    lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                    lookupValueTemplate[0].name = results.results[0].el_name;
    //                    lookupValueTemplate[0].entityType = "el_sms_template";
    //                    Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                    Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //                }
    //            }
    //            break;
    //        case MESSAGE_TYPE.DOAR_RASHUM:
    //            var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 2";
    //            var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //            if (results && results.results && results.results.length >= 1) {
    //                var lookupValueTemplate = new Array();
    //                lookupValueTemplate[0] = new Object();
    //                lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                lookupValueTemplate[0].name = results.results[0].el_name;
    //                lookupValueTemplate[0].entityType = "el_sms_template";
    //                Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //            }
    //            break;
    //        case MESSAGE_TYPE.EMAIL:
    //            var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 3";
    //            var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //            if (results && results.results && results.results.length >= 1) {
    //                var lookupValueTemplate = new Array();
    //                lookupValueTemplate[0] = new Object();
    //                lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                lookupValueTemplate[0].name = results.results[0].el_name;
    //                lookupValueTemplate[0].entityType = "el_sms_template";
    //                Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //            }
    //            break;
    //        case MESSAGE_TYPE.NO_ANSWER_CENTRAL_GARAGE:
    //            var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 4";
    //            var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //            if (results && results.results && results.results.length >= 1) {
    //                var lookupValueTemplate = new Array();
    //                lookupValueTemplate[0] = new Object();
    //                lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                lookupValueTemplate[0].name = results.results[0].el_name;
    //                lookupValueTemplate[0].entityType = "el_sms_template";
    //                Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //            }
    //            break;
    //        case MESSAGE_TYPE.MISSING_PART_CENTRAL_GARAGE:
    //            var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 5";
    //            var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //            if (results && results.results && results.results.length >= 1) {
    //                var lookupValueTemplate = new Array();
    //                lookupValueTemplate[0] = new Object();
    //                lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                lookupValueTemplate[0].name = results.results[0].el_name;
    //                lookupValueTemplate[0].entityType = "el_sms_template";
    //                Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //            }
    //            break;
    //        case MESSAGE_TYPE.SEVERAL_NO_ANSWER_CENTRAL_GARAGE:
    //            var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 6";
    //            var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //            if (results && results.results && results.results.length >= 1) {
    //                var lookupValueTemplate = new Array();
    //                lookupValueTemplate[0] = new Object();
    //                lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                lookupValueTemplate[0].name = results.results[0].el_name;
    //                lookupValueTemplate[0].entityType = "el_sms_template";
    //                Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //            }
    //            break;
    //        case MESSAGE_TYPE.CLOSE_CASE_CENTRAL_GARAGE:
    //            var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 7";
    //            var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //            if (results && results.results && results.results.length >= 1) {
    //                var lookupValueTemplate = new Array();
    //                lookupValueTemplate[0] = new Object();
    //                lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                lookupValueTemplate[0].name = results.results[0].el_name;
    //                lookupValueTemplate[0].entityType = "el_sms_template";
    //                Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //            }
    //            break;
    //        case MESSAGE_TYPE.DOAR_RASHUM_CENTRAL_GARAGE:
    //            var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 8";
    //            var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //            if (results && results.results && results.results.length >= 1) {
    //                var lookupValueTemplate = new Array();
    //                lookupValueTemplate[0] = new Object();
    //                lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //                lookupValueTemplate[0].name = results.results[0].el_name;
    //                lookupValueTemplate[0].entityType = "el_sms_template";
    //                Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //                Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //            }
    //            break;
    //        ////TASK 1359 - adding new type of SMS - on HOLD from 26/1/25
    //        //case MESSAGE_TYPE.MEETING_AT_A_CLIENTS_HOME:
    //        //    var url = "el_sms_templateSet?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateId&$filter=el_l_msg_type/Value eq 9";
    //        //    var results = OdataUtilObj.RetrieveDataByUrl("", url, null, null, true);
    //        //    if (results && results.results && results.results.length >= 1) {
    //        //        var lookupValueTemplate = new Array();
    //        //        lookupValueTemplate[0] = new Object();
    //        //        lookupValueTemplate[0].id = results.results[0].el_sms_templateId;
    //        //        lookupValueTemplate[0].name = results.results[0].el_name;
    //        //        lookupValueTemplate[0].entityType = "el_sms_template";
    //        //        Xrm.Page.getAttribute("el_id_template_sms").setValue(lookupValueTemplate);
    //        //        Xrm.Page.getAttribute("subject").setValue(results.results[0].el_name);
    //        //    }
    //        //    break;

    //        default:

    //            break;

    //    }
    //    Xrm.Page.getAttribute("el_b_send_now").setValue(true);
    //}

    el_sms.setSmsTemplateByFilter = function (filter, setSubject) {
        return Xrm.WebApi.online.retrieveMultipleRecords("el_sms_template", `?$select=el_l_entity,el_name,el_l_msg_type,el_sms_templateid&$filter=${filter}`).then(
            function success(results) {
                if (!results || !results.entities || results.entities.length < 1) {
                    return;
                }

                var template = results.entities[0];

                Common.SetFieldValue("el_id_template_sms", [{
                    id: template.el_sms_templateid,
                    name: template.el_name,
                    entityType: "el_sms_template"
                }]);

                if (setSubject) {
                    Common.SetFieldValue("subject", template.el_name);
                }
            },
            function error(error) {
                console.log(error.message);
            }
        );
    }

    el_sms.updateTemplateSms = function (msgType) {
        var regardingSms = Common.GetFieldValue("regardingobjectid");

        if (!regardingSms || !regardingSms[0]) {
            return;
        }

        var regardingId = regardingSms[0].id.replace(/[{}]/g, "");
        var entityType = regardingSms[0].entityType;

        switch (msgType) {
            case MESSAGE_TYPE.NO_ANSWER:
                if (entityType === "lead") {
                    Common.RetrieveRecord("lead", regardingId, "?$select=_el_id_manufacturer_value").then(function (lead) {
                        var filter;

                        if (SMS_FIELDS.manufacturer === "NIO") {
                            filter =
                                "el_l_msg_type eq 1" +
                                " and el_l_entity eq 1" +
                                " and _el_id_manufacturer_value eq " + lead._el_id_manufacturer_value;
                        } else {
                            filter =
                                "el_l_msg_type eq 1" +
                                " and el_l_entity eq 1" +
                                " and _el_id_manufacturer_value eq null";
                        }

                        return el_sms.setSmsTemplateByFilter(filter, false);
                    });

                } else if (entityType === "opportunity") {
                    Common.RetrieveRecord("opportunity", regardingId, "?$select=_el_id_manufacturer_value").then(function (opportunity) {
                        var filter;

                        if (SMS_FIELDS.manufacturer === "NIO") {
                            filter =
                                "el_l_msg_type eq 1" +
                                " and el_l_entity eq 3" +
                                " and _el_id_manufacturer_value eq " + opportunity._el_id_manufacturer_value;
                        } else {
                            filter =
                                "el_l_msg_type eq 1" +
                                " and el_l_entity eq 3" +
                                " and _el_id_manufacturer_value eq null";
                        }

                        return el_sms.setSmsTemplateByFilter(filter, true);
                    });

                } else if (entityType === "incident") {
                    el_sms.setSmsTemplateByFilter("el_l_msg_type eq 1 and el_l_entity eq 6", true);
                }

                break;

            case MESSAGE_TYPE.DOAR_RASHUM:
                el_sms.setSmsTemplateByFilter("el_l_msg_type eq 2", true);
                break;

            case MESSAGE_TYPE.EMAIL:
                el_sms.setSmsTemplateByFilter("el_l_msg_type eq 3", true);
                break;

            case MESSAGE_TYPE.NO_ANSWER_CENTRAL_GARAGE:
                el_sms.setSmsTemplateByFilter("el_l_msg_type eq 4", true);
                break;

            case MESSAGE_TYPE.MISSING_PART_CENTRAL_GARAGE:
                el_sms.setSmsTemplateByFilter("el_l_msg_type eq 5", true);
                break;

            case MESSAGE_TYPE.SEVERAL_NO_ANSWER_CENTRAL_GARAGE:
                el_sms.setSmsTemplateByFilter("el_l_msg_type eq 6", true);
                break;

            case MESSAGE_TYPE.CLOSE_CASE_CENTRAL_GARAGE:
                el_sms.setSmsTemplateByFilter("el_l_msg_type eq 7", true);
                break;

            case MESSAGE_TYPE.DOAR_RASHUM_CENTRAL_GARAGE:
                el_sms.setSmsTemplateByFilter("el_l_msg_type eq 8", true);
                break;
            case MESSAGE_TYPE.SERVICE_VEHICLE:
                el_sms.setSmsTemplateByFilter("el_l_msg_type eq 102910000", true);
                break;
        }

        Common.SetFieldValue("el_b_send_now", true);
    };

    el_sms.updateMessageText = function () {
        //var msgtype = Xrm.Page.getAttribute("el_l_msg_type") ? Xrm.Page.getAttribute("el_l_msg_type").getValue() : null;
        //var el_s_tracking_numberAttr = Xrm.Page.getAttribute("el_s_tracking_number");
        //var el_s_part_info = Xrm.Page.getAttribute("el_s_part_info");

        //var el_s_tracking_linkAttr = Xrm.Page.getAttribute("el_s_tracking_link");
        //var el_s_emailAttr = Xrm.Page.getAttribute("el_s_email");

        //var accountName = Xrm.Page.getAttribute("el_id_account") && Xrm.Page.getAttribute("el_id_account").getValue() && Xrm.Page.getAttribute("el_id_account").getValue()[0] ? Xrm.Page.getAttribute("el_id_account").getValue()[0].name : null;
        //var ownerName = Xrm.Page.getAttribute("ownerid") && Xrm.Page.getAttribute("ownerid").getValue() && Xrm.Page.getAttribute("ownerid").getValue()[0] ? Xrm.Page.getAttribute("ownerid").getValue()[0].name : null;
        //if (!ownerName)
        //    ownerName = getIncidentOwner();

        //var txt = '';
        //var contactedon = Xrm.Page.getAttribute("el_dt_contactedon") ? Xrm.Page.getAttribute("el_dt_contactedon").getValue() : new Date();
        //if (accountName != null)
        //    txt += "שלום " + accountName + ", \n";
        //switch (msgtype) {
        //    case MESSAGE_TYPE.NO_ANSWER:
        //        txt += ' בתאריך ' + getDate(contactedon) + ' בשעה  ' + getTime(contactedon) + ' בוצע ניסיון להשיגך בטלפון על ידי נציג/ת  השרות ' + ownerName + ' ללא הצלחה. ' + 'ננסה שוב מאוחר יותר. ';
        //        break;
        //    case MESSAGE_TYPE.DOAR_RASHUM:
        //        txt += ' לידיעתך , נשלח אליך דואר רשום מדלק מוטורס בתאריך ' + getDate(contactedon) + '.' + ' מספר למעקב באתר דואר ישראל ' + el_s_tracking_numberAttr.getValue() + ' בקישור ' + el_s_tracking_linkAttr.getValue();
        //        break;
        //    case MESSAGE_TYPE.EMAIL:
        //        txt += ' לידיעתך נשלחה אליך הודעת דוא"ל מדלק מוטורס לכתובת  ' + el_s_emailAttr.getValue();
        //        break;
        //    case MESSAGE_TYPE.NO_ANSWER_CENTRAL_GARAGE:
        //        txt += ' בתאריך ' + getDate(contactedon) + ' בשעה  ' + getTime(contactedon) + ' בוצע ניסיון להשיגך בטלפון על ידי נציג/ת  השרות ' + ownerName + ' ללא הצלחה. ' + 'ננסה שוב מאוחר יותר. ' + '\n';
        //        break;
        //    case MESSAGE_TYPE.MISSING_PART_CENTRAL_GARAGE:
        //        txt += ' בתאריך ' + getDate(contactedon) + ' בשעה  ' + getTime(contactedon) + ' הוזמן עבור רכבך החלק ' + el_s_part_info.getValue() + '\n';
        //        break;
        //    case MESSAGE_TYPE.SEVERAL_NO_ANSWER_CENTRAL_GARAGE:
        //        txt += ' בתאריך ' + getDate(contactedon) + ' ניסינו להשיגך בקשר לחלק שהוזמן עבור רכבך.\n יש ליצור עימנו קשר.\n';
        //        break;
        //    case MESSAGE_TYPE.CLOSE_CASE_CENTRAL_GARAGE:
        //        txt += ' לצערנו לא יצרת עימנו קשר, ולפיכך הפסקנו את הטיפול בעניינך .\nלצורך חידוש הטיפול יש ליצור עמנו קשר.\n';
        //        break;
        //    case MESSAGE_TYPE.DOAR_RASHUM_CENTRAL_GARAGE:
        //        txt += ' לידיעתך , נשלח אליך דואר רשום בתאריך ' + getDate(contactedon) + '.' + ' מספר למעקב באתר דואר ישראל ' + el_s_tracking_numberAttr.getValue() + ' בקישור ' + el_s_tracking_linkAttr.getValue();
        //        break;
        //}
        //if (Central_Garage) {
        //    txt += ' לבירורים ניתן לפנות למוסך המרכזי דלק מוטורס בטלפון: 08-9139111. \n אין להשיב להודעה זו.';
        //}
        //else {
        //    txt += ' לברורים ניתן לפנות למוקד שירות הלקוחות 08-9139995 או בדוא"ל service1@delekmotors.co.il. אין להשיב להודעה זו. ';
        //}
        //Xrm.Page.getAttribute("el_s_message_text").setValue(txt);
        Common.SetFieldValue("el_b_send_now", true);
    }

    function messageTextFromTemplate(type) {
        //    debugger;
        //    var msgtype = Xrm.Page.getAttribute("el_l_msg_type") ? Xrm.Page.getAttribute("el_l_msg_type").getValue() : null;
        //    var accountName = Xrm.Page.getAttribute("el_id_account") && Xrm.Page.getAttribute("el_id_account").getValue() && Xrm.Page.getAttribute("el_id_account").getValue()[0] ? Xrm.Page.getAttribute("el_id_account").getValue()[0].name : null;
        //    var accountId = Xrm.Page.getAttribute("el_id_account") && Xrm.Page.getAttribute("el_id_account").getValue() && Xrm.Page.getAttribute("el_id_account").getValue()[0] ? Xrm.Page.getAttribute("el_id_account").getValue()[0].name : null;

        //    //var url = "https://api.whatsapp.com/send/?phone=%2B972747976110&amp;text=%D7%94%D7%99%D7%99+NIO%2C+%D7%A0%D7%A2%D7%99%D7%9D+%D7%9C%D7%94%D7%9B%D7%99%D7%A8";
        //    var url = "https://bit.ly/3sSyVX0";
        //    //URL changed at the reques of MEITAL' TASK 1647

        //    var messageTemplateText = '';
        //    var txt = '';
        //    switch (msgtype) {
        //        case MESSAGE_TYPE.NO_ANSWER:
        //            var tempRequest = motors.Services.XrmService.RetrieveRequest();
        //            tempRequest.logicalName = "el_sms_template";
        //            tempRequest.attributes = "el_s_message_text";
        //            tempRequest.count = true;
        //            //if (SMS_FIELDS.manufacturer == "BMW" && SMS_FIELDS.familyMini)
        //            //    tempRequest.filters = [{ field: "el_s_template_type", filterOperator: 'eq', value: 'NoAnswerFromLeadOrOpportunityMini' }];
        //            if (SMS_FIELDS.manufacturer != "NIO")
        //                tempRequest.filters = [{ field: "el_s_template_type", filterOperator: 'eq', value: 'NoAnswerFromLeadOrOpportunity' }];
        //            else
        //                tempRequest.filters = [{ field: "el_s_template_type", filterOperator: 'eq', value: 'NoAnswerFromLeadOrOpportunityNio' }];


        //            var results = SERVICE.Retrieve(tempRequest);

        //            if (results != null && results.value != null && results.value[0].el_s_message_text != null) {

        //                var rightPhone = "";
        //                if (SMS_FIELDS.manufacturer == "BMC" || SMS_FIELDS.manufacturer == "BMW") rightPhone = SMS_FIELDS.showroomPhoneBMW;
        //                if (SMS_FIELDS.manufacturer == "MAZDA") rightPhone = SMS_FIELDS.showroomPhoneMazda;
        //                if (SMS_FIELDS.manufacturer == "FORD") rightPhone = SMS_FIELDS.showroomPhoneFord;
        //                if (SMS_FIELDS.manufacturer == "NIO") rightPhone = SMS_FIELDS.showroomPhoneNIO;

        //                var showRoomText=SMS_FIELDS.showRoomNameForSms;
        //                if (SMS_FIELDS.el_b_mixed_showroom == true) {
        //                    showRoomText = SMS_FIELDS.manufacturer + " " + SMS_FIELDS.showRoomName;
        //                }

        //                messageTemplateText = results.value[0].el_s_message_text;
        //                messageTemplateText = messageTemplateText.replace("_FirstName_", SMS_FIELDS.accountName);
        //                messageTemplateText = messageTemplateText.replace("_DateTime_", getDate());
        //                if (type === SMS_FROM_ENUM.LEAD) {
        //                    messageTemplateText = messageTemplateText.replace("_שם_נציג_", SMS_FIELDS.ownerLead);
        //                }
        //                else {
        //                    messageTemplateText = messageTemplateText.replace("_שם_נציג_", Xrm.Page.getAttribute("ownerid").getValue()[0].name);
        //                }
        //                messageTemplateText = messageTemplateText.replace("_ShowroomName_", showRoomText);
        //                messageTemplateText = messageTemplateText.replace("_Showroom_", SMS_FIELDS.showRoomName);
        //                messageTemplateText = messageTemplateText.replace("_ShoroomPhone_", rightPhone);
        //                messageTemplateText = messageTemplateText.replace("_Manufacturer_", SMS_FIELDS.manufacturer);
        //                messageTemplateText = messageTemplateText.replace("_family_", SMS_FIELDS.family);
        //                messageTemplateText = messageTemplateText.replace("_whatsapp_", url);

        //                txt = messageTemplateText;
        //            }
        //            break;
        //    }
        //    Xrm.Page.getAttribute("el_s_message_text").setValue(txt);
        //    Xrm.Page.getAttribute("el_b_send_now").setValue(true);
        //    if (type === SMS_FROM_ENUM.LEAD) {
        //        Xrm.Page.getAttribute("subject").setValue(SMS_FIELDS.leadName);
        //    }
    }

    /*function getIncidentOwner() {
        var odatautil = new OdataUtil();
        var incident;
        if (Xrm.Page.getAttribute("regardingobjectid"))
            incident = Xrm.Page.getAttribute("regardingobjectid").getValue();
        if (incident) {
            var incidentId = incident[0].id;
            var url = "incidentSet?$select=incident_owning_user/FullName,incident_owning_user/SystemUserId&$expand=incident_owning_user&$filter=IncidentId eq guid'" + incidentId + "'";
            var owner = odatautil.RetrieveDataByUrl("", url, null, null, true);
            if (owner && owner.results && owner.results[0] && owner.results[0].incident_owning_user) {
                return owner.results[0].incident_owning_user.FullName;
            }
        }
        return null;
    }*/

    el_sms.getIncidentOwner = function () {
        var incident = Common.GetFieldValue("regardingobjectid");

        if (!incident || !incident[0] || !incident[0].id) {
            return Promise.resolve(null);
        }

        var incidentId = incident[0].id.replace(/[{}]/g, "");

        return Common.RetrieveRecord("incident", incidentId, "?$expand=incident_owning_user($select=fullname,systemuserid)").then(
            function success(result) {
                if (result && result.incident_owning_user) {
                    return result.incident_owning_user.fullname;
                }

                return null;
            },
            function error(error) {
                console.log(error.message);
                return null;
            }
        );
    }

    el_sms.getDate = function (date) {
        if (!date) {
            date = new Date();
        }
        var yyyy = date.getFullYear();
        var mm = date.getMonth() + 1; // getMonth() is zero-based
        var dd = date.getDate();

        return dd + '/' + mm + '/' + yyyy;
    }

    el_sms.getTime = function (date) {
        if (!date) {
            date = new Date();
        }

        var min = date.getMinutes();
        min = min.toString();
        if (min.length == 1)
            min = '0' + min;
        var hour = date.getHours();
        return hour + ':' + min;
    }

})(window.el_sms = window.el_sms || {})