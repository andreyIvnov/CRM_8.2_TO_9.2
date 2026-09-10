(function (el_incident) {
    // =====================
    // Private Global Variables
    // =====================

    var commons;
    var availableDefaultViewId;
    var representativeHasExtension = false;
    var _Hebrow;
    var _currentEntityConsts;
    var _IncidentChannels;
    var common;
    var oDataUtil;
    // =====================
    // Public Form Functions
    // =====================

    _Hebrow = Const.Message.Hebrew;
    _currentEntityConsts = Enum.incident;
    _IncidentChannels = _currentEntityConsts.el_l_channel;

    el_incident.OnLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());
            el_incident.OnLoadEvents();
            el_incident.setupBasicEvents();

        } catch (error) {
            if (commons) {
                commons.SetFormNotification("ERROR on el_incident.onLoad(): " + error.message, "ERROR", "el_incident.onLoad");
            }
            console.error(error);
        }

    };
    el_incident.OnLoadEvents = function () {
        try {
            var formType = commons.GetFormType();
            var stateCode = commons.GetFieldValue("statecode");

            el_incident.OnCaseTypeCodeLogic();
            el_incident.setCarModelNumberHiddenFields();
            el_incident.showCreateOrInprogressTabs();
            el_incident.setFirstActualTreatmentDate();
            el_incident.showOnHoldDateAndReason();
            el_incident.showBuyCarExpiration();
            el_incident.setIdCarRequired();
            el_incident.showBenefitCode();
            el_incident.showRespondentSection();
            el_incident.showServicePointOrDelekUnit();
            el_incident.showUserForThanks();
            el_incident.recallHandler();
            el_incident.setCustomerHiddenFields();
            el_incident.setContactPhoneHiddenField();
            el_incident.filterCarLookup();
            el_incident.showRentTradeinDate();
            el_incident.showOperationalVehicleTab();
            if (formType != Enum.FormType.Create) {
                el_incident.showIncidentChannelFields();
                el_incident.showNoCustomerIdNotification();
                el_incident.showCarHolderUpdateNeededNotification();
                el_incident.showCompensationNotification();
            }

            if (formType == Enum.FormType.Create) {
                if (commons.GetFieldValue("el_s_fromemail_guid")) {
                    commons.ToggleSection("new_incident", "originate_from_email_section", true);
                }

                el_incident.setCarModelNumberHiddenFields();
            }

            if (stateCode != null && stateCode == Enum.General.StateCode.Active && formType != Enum.FormType.Create) {
                el_incident.showSurveyReason();
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.OnLoadEvents");
        }
    };

    el_incident.showOnHoldDateAndReason = function () {
        var statusCode = commons.GetFieldValue("statuscode");
        if (statusCode && statusCode == _currentEntityConsts.statuscode.ON_HOLD_TILL_DATE) {
            commons.SetVisible("el_dt_onhold_date", true);
            commons.SetRequiredLevel("el_dt_onhold_date", "required");
            commons.SetVisible("el_l_onhold_reason", true);
            commons.SetRequiredLevel("el_l_onhold_reason", "required");
        } else {
            commons.SetRequiredLevel("el_dt_onhold_date", "none");
            commons.SetFieldValue("el_dt_onhold_date", null);
            commons.SetVisible("el_dt_onhold_date", false);
            commons.SetRequiredLevel("el_l_onhold_reason", "none");
            commons.SetFieldValue("el_l_onhold_reason", null);
            commons.SetVisible("el_l_onhold_reason", false);
        }
    }

    el_incident.showBuyCarExpiration = function () {
        var solution_type = commons.GetFieldValue("el_l_solution_type");
        if (solution_type && solution_type == _currentEntityConsts.el_l_solution_type.BUY_CAR) {
            commons.SetVisible("el_s_benefit", true);
            commons.SetRequiredLevel("el_s_benefit", "required");
        } else {
            commons.SetFieldValue("el_dt_buy_car_exp", null);
            commons.SetVisible("el_dt_buy_car_exp", false);
            commons.SetRequiredLevel("el_dt_buy_car_exp", "none");
            if (solution_type != _currentEntityConsts.el_l_solution_type.BENEFIT_GIVEN)
                commons.SetFieldValue("el_s_benefit", null);
            commons.SetVisible("el_s_benefit", false);
            commons.SetRequiredLevel("el_s_benefit", "none");
        }
    }

    el_incident.showUserForThanks = function () {
        if (commons.GetFieldValue("el_l_respondent_delek_unit") == _currentEntityConsts.el_l_respondent_delek_unit.SERVICE_DEP) {
            commons.SetVisible("el_id_systemuser_thanks", true);
            el_incident.setServiceUsersLookupFilter();
        }
        else {
            if (commons.GetLookupFieldValue("el_id_systemuser_thanks") && !el_incident.incidentClosed())
                commons.SetLookupValue("el_id_systemuser_thanks", null);
            commons.SetVisible("el_id_systemuser_thanks", false);
        }
    }

    el_incident.showOperationalVehicleTab = function () {
        try {
            var manufacturer = commons.GetLookupFieldValue("el_id_manufacturer_hidden");

            if (!manufacturer) {
                commons.SetTabVisibility("tab_operational_vehicle", false);

                return;
            }

            commons.RetrieveRecord("el_manufacturer", commons.StripGuid(manufacturer.id), "?$select=el_b_operational_manufacturer").then(function (result) {

                var isOperationalManufacturer = result && result.el_b_operational_manufacturer === true;

                commons.SetTabVisibility("tab_operational_vehicle", isOperationalManufacturer);

                if (isOperationalManufacturer) {
                    el_incident.showExternalServiceSection();
                }

            }).catch(function (error) {
                commons.PageErrorHandler(error, "el_incident.showOperationalVehicleTab");
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showOperationalVehicleTab");
        }
    };

    el_incident.showExternalServiceSection = function () {
        try {
            commons.SetSectionVisibility(
                "tab_operational_vehicle",
                "tab_operational_vehicle_section_external_service",
                commons.GetFieldValue("el_b_activation_external_service_vehicle") === true
            );

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showExternalServiceSection");
        }
    };
    el_incident.setupBasicEvents = function () {
        try {
            commons.AddOnChange("el_id_parent_incident", el_incident.setFieldsFromParentIncident);
            commons.AddOnChange("statuscode", el_incident.showOnHoldDateAndReason);
            commons.AddOnChange("el_s_car_status", el_incident.setStatusDate);
            commons.AddOnChange("el_b_car_not_provided", el_incident.setIdCarRequired);
            commons.AddOnChange("el_id_main_subject", el_incident.showRespondentSection);
            commons.AddOnChange("el_l_respondent", el_incident.showServicePointOrDelekUnit);
            commons.AddOnChange("el_l_respondent_delek_unit", el_incident.showUserForThanks);
            commons.AddOnChange("el_id_contact", el_incident.setContactPhoneHiddenField);
            commons.AddOnChange("el_s_car_number", el_incident.createCarWithOdata);
            commons.AddOnChange("el_l_initial_stage_completed", el_incident.initialStageCompleted);
            commons.AddOnChange("el_id_carholder", el_incident.showCarHolderUpdateNeededNotification);
            commons.AddOnChange("el_b_rent_tradein", el_incident.showRentTradeinDate);
            commons.AddOnChange("el_l_service_survey", el_incident.el_l_service_surveyOnchange);
            commons.AddOnChange("el_b_activation_external_service_vehicle", el_incident.showExternalServiceSection);

            commons.AddOnChangeMultipleCallback("casetypecode", [
                el_incident.setFieldsFromParentIncident,
                el_incident.setMainSubject,
                el_incident.showRespondentSection,
                el_incident.recallHandler,
                el_incident.OnCaseTypeCodeLogic,
                el_incident.showSurveyReason
            ]);

            commons.AddOnChangeMultipleCallback("el_id_car", [
                el_incident.setUpdateCarHolder,
                el_incident.setCarModelNumberHiddenFields,
                el_incident.setTempCustomerFields,
                el_incident.getCustomerFromCarHolder,
                el_incident.showCompensationNotification
            ]);

            commons.AddOnChangeMultipleCallback("customerid", [
                el_incident.setUpdateCarHolder,
                el_incident.setCustomerHiddenFields,
                el_incident.emptyCustomerFromCarHolderFields,
                el_incident.filterCarLookup,
                el_incident.showCompensationNotification
            ]);

            commons.AddOnChangeMultipleCallback("el_l_solution_type", [
                el_incident.showBuyCarExpiration,
                el_incident.showBenefitCode,
                el_incident.setCompensationGiven,
                el_incident.showSurveyReason
            ]);

            commons.AddOnChangeMultipleCallback("el_id_secondary_subject", [
                el_incident.showElseSecondarySubject,
                el_incident.showSurveyReason
            ]);

            commons.AddOnChangeMultipleCallback("el_l_channel", [
                el_incident.showIncidentChannelFields,
                el_incident.showSurveyReason
            ]);

            commons.AddOnChangeMultipleFields([
                "el_dt_rent_start",
                "el_dt_rent_end",
                "el_dt_estimated_rental_end_date"
            ], el_incident.calculateRentalDays);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.OnChangeEvents");
        }
    };
    el_incident.setStatusDate = function () {
        try {
            if (commons.GetFieldValue("el_s_car_status") != null) {
                commons.SetFieldValue("el_dt_status_date", new Date(), commons.OnChangeBehavior.None);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setStatusDate");
        }
    };
    el_incident.showCompensationNotification = function () {
        try {
            commons.PageClearMessages("compensationMsg");

            var compensationExists = false;
            var car = commons.GetLookupFieldValue("el_id_car");
            var account = commons.GetLookupFieldValue("customerid");

            if (!car || !account) {
                return;
            }

            commons.RetrieveMultipleRecords("el_compensation", "?$select=el_s_approved_by,el_s_comp_reaon,el_m_comp_sum,el_dt_comp_day&$filter=_el_id_car_value eq " + commons.StripGuid(car.id) + " and _el_id_account_value eq " + commons.StripGuid(account.id))
                .then(function (results) {

                    if (results && results.length > 0 && results[0].el_s_approved_by) {
                        commons.SetFormNotification(_Hebrow.NoteThereIsCompensationForTheVehicleAndTheCustomer, "INFORMATION", "compensationMsg");
                        compensationExists = true;
                    }

                    if (compensationExists && commons.GetFormType() == Enum.FormType.Create && commons.GetFieldValue("el_b_car_acc_compensation")) {
                        commons.OpenAlertDialog(_Hebrow.PleaseNoteThereIsCompensationForTheVehicleAndTheCustome);
                        commons.SetFieldValue("el_b_car_acc_compensation", true, commons.OnChangeBehavior.None);
                    }

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.showCompensationNotification");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showCompensationNotification");
        }
    };
    el_incident.calculateRentalDays = function () {
        try {
            if (!commons.GetAttribute("el_n_rental_days_count")) {
                return;
            }

            var rentStart = commons.GetFieldValue("el_dt_rent_start");
            var rentEnd = commons.GetFieldValue("el_dt_rent_end");
            var estimatedRentEnd = commons.GetFieldValue("el_dt_estimated_rental_end_date");

            if (rentStart && rentEnd) {
                commons.SetFieldValue("el_n_rental_days_count", el_incident.differenceInDays(rentStart, rentEnd), commons.OnChangeBehavior.None);
                return;
            }

            if (rentStart && estimatedRentEnd) {
                commons.SetFieldValue("el_n_rental_days_count", el_incident.differenceInDays(rentStart, estimatedRentEnd), commons.OnChangeBehavior.None);
                return;
            }

            commons.SetFieldValue("el_n_rental_days_count", null, commons.OnChangeBehavior.None);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.calculateRentalDays");
        }
    };

    el_incident.differenceInDays = function (firstDate, secondDate) {
        try {
            if (!firstDate || !secondDate) {
                return null;
            }

            return Math.round((secondDate - firstDate) / (1000 * 60 * 60 * 24));

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.differenceInDays");
            return null;
        }
    };
    el_incident.showRentTradeinDate = function () {
        try {
            commons.SetVisible("el_dt_rent_tradein_start", commons.GetFieldValue("el_b_rent_tradein") === true);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showRentTradeinDate");
        }
    };
    el_incident.showSurveyReason = function () {
        debugger;
        try {
            commons.SetVisible("el_l_service_survey", commons.GetFieldValue("el_l_solution_type") != null);

            var serviceSurvey = null;

            if (commons.GetAttribute("el_l_service_survey")) {
                serviceSurvey = commons.GetFieldValue("el_l_service_survey");
            }

            if (serviceSurvey != _currentEntityConsts.el_l_service_survey.NO) {
                var incidentRequiresSurvey = el_incident.incidentForServiceSurvey();

                if (incidentRequiresSurvey) {
                    commons.SetFieldValue("el_l_service_survey", _currentEntityConsts.el_l_service_survey.YES, commons.OnChangeBehavior.None);
                    el_incident.filterOptionSetsServiceSurrvey();
                }
                else {
                    commons.SetFieldValue("el_l_service_survey", _currentEntityConsts.el_l_service_survey.NO_NEED, commons.OnChangeBehavior.None);
                    el_incident.filterOptionSetsServiceSurrvey();
                }
            }

            serviceSurvey = commons.GetFieldValue("el_l_service_survey");

            switch (serviceSurvey) {

                case _currentEntityConsts.el_l_service_survey.YES:
                    commons.SetVisibleArray([
                        "el_s_survey_prevention_reason",
                        "el_s_manager_comments",
                        "el__b_manager_excluding_approve"
                    ], false);
                    commons.SetVisible("el_s_survey_response", true);
                    break;

                case _currentEntityConsts.el_l_service_survey.NO:
                    commons.SetVisibleArray([
                        "el_s_survey_prevention_reason",
                        "el_s_manager_comments",
                        "el__b_manager_excluding_approve"
                    ], true);
                    commons.SetVisible("el_s_survey_response", false);

                    commons.SetRequiredLevel("el_s_survey_prevention_reason", "required");
                    break;

                case _currentEntityConsts.el_l_service_survey.NO_NEED:
                    commons.SetVisibleArray([
                        "el_s_survey_prevention_reason",
                        "el_s_manager_comments",
                        "el__b_manager_excluding_approve",
                        "el_s_survey_response",
                        "el_l_service_survey"
                    ], false);
                    break;
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showSurveyReason");
        }
    };
    el_incident.incidentForServiceSurvey = function () {
        try {
            var caseTypeCode = commons.GetFieldValue("casetypecode");
            var secondarySubject = commons.GetFieldValue("el_id_secondary_subject");

            if (!caseTypeCode) {
                return false;
            }

            if (!secondarySubject || !secondarySubject[0]) {
                return false;
            }

            if (commons.GetFieldValue("el_l_channel") == _IncidentChannels.CarFleet) {
                return false;
            }

            if (caseTypeCode == _currentEntityConsts.casetypecode.APPROVAL_INFO && (secondarySubject[0].name == _Hebrow.BonusPetition || secondarySubject[0].name == _Hebrow.CarEnter)) {
                return false;
            }

            if (commons.GetFieldValue("el_l_solution_type") == null) {
                return false;
            }

            if (caseTypeCode != _currentEntityConsts.casetypecode.CASE_66 &&
                caseTypeCode != _currentEntityConsts.casetypecode.COMPLAINT &&
                caseTypeCode != _currentEntityConsts.casetypecode.CAR_DETAILS_MISSING &&
                caseTypeCode != _currentEntityConsts.casetypecode.THANK &&
                caseTypeCode != _currentEntityConsts.casetypecode.APPROVAL_INFO) {
                return false;
            }

            return true;

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.incidentForServiceSurvey");
            return false;
        }
    };
    el_incident.el_l_service_surveyOnchange = function () {
        try {
            var serviceSurvey = commons.GetFieldValue("el_l_service_survey");

            if (serviceSurvey == _currentEntityConsts.el_l_service_survey.NO) {
                commons.SetRequiredLevel("el_s_survey_prevention_reason", "required");

                commons.SetVisibleArray([
                    "el_s_survey_prevention_reason",
                    "el_s_manager_comments",
                    "el__b_manager_excluding_approve"
                ], true);
                commons.SetVisible("el_s_survey_response", false);

                if (commons.GetFieldValue("el_s_survey_response") != null) {
                    commons.SetFieldValue("el_s_survey_response", null, commons.OnChangeBehavior.None);
                }

                return;
            }

            if (serviceSurvey == _currentEntityConsts.el_l_service_survey.NO_NEED) {
                commons.SetRequiredLevel("el_s_survey_prevention_reason", "none");

                commons.SetVisibleArray([
                    "el_s_survey_prevention_reason",
                    "el_s_manager_comments",
                    "el__b_manager_excluding_approve",
                    "el_s_survey_response"
                ], false);

                if (commons.GetFieldValue("el_s_survey_prevention_reason") != null) {
                    commons.SetFieldValue("el_s_survey_prevention_reason", null, commons.OnChangeBehavior.None);
                }

                if (commons.GetFieldValue("el_s_survey_response") != null) {
                    commons.SetFieldValue("el_s_survey_response", null, commons.OnChangeBehavior.None);
                }

                return;
            }

            commons.SetRequiredLevel("el_s_survey_prevention_reason", "none");

            commons.SetVisibleArray([
                "el_s_survey_prevention_reason",
                "el_s_manager_comments",
                "el__b_manager_excluding_approve"
            ], false);
            commons.SetVisible("el_s_survey_response", true);

            if (commons.GetFieldValue("el_s_survey_prevention_reason") != null) {
                commons.SetFieldValue("el_s_survey_prevention_reason", null, commons.OnChangeBehavior.None);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.el_l_service_surveyOnchange");
        }
    };
    el_incident.filterOptionSetsServiceSurrvey = function () {
        try {
            var optionSetControl = commons.GetControl("el_l_service_survey");

            if (!optionSetControl) {
                return;
            }

            var options = optionSetControl.getAttribute().getOptions();
            var filterValue = commons.GetFieldValue("el_l_service_survey");
            var currentValue = filterValue;

            optionSetControl.clearOptions();

            if (filterValue == _currentEntityConsts.el_l_service_survey.YES) {
                optionSetControl.addOption(options[0]);
                optionSetControl.addOption(options[1]);
            }
            else if (filterValue == _currentEntityConsts.el_l_service_survey.NO) {
                optionSetControl.addOption(options[0]);
                optionSetControl.addOption(options[1]);
            }
            else if (filterValue == _currentEntityConsts.el_l_service_survey.NO_NEED) {
                optionSetControl.addOption(options[0]);
                optionSetControl.addOption(options[1]);
                optionSetControl.addOption(options[2]);
            }

            if (currentValue != null) {
                commons.SetFieldValue("el_l_service_survey", currentValue, commons.OnChangeBehavior.None);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.filterOptionSetsServiceSurrvey");
        }
    };

    el_incident.incidentClosed = function () {
        try {
            return commons.GetFieldValue("statecode") != Enum.General.StateCode.Active;

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.incidentClosed");
            return false;
        }
    };
    el_incident.setServiceUsersLookupFilter = function () {
        try {
            var userTypeService = Enum.systemuser.el_l_user_type.SalesTeam;
            var userTypeAsha = Enum.systemuser.el_l_user_type.Asha;
            var entityLogicalName = Const.EntityLogicalName.SystemUser;
            var viewId = Const.ViewsGuids.IncidentSystemUsersThanks;
            var viewDisplayName = _Hebrow.UsersInServiceDepartment ? _Hebrow.UsersInServiceDepartment : "";

            var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>" +
                "<entity name='" + entityLogicalName + "'>" +
                "<attribute name='systemuserid' />" +
                "<attribute name='fullname' />" +
                "<order attribute='fullname' descending='false' />" +
                "<filter type='and'>" +
                "<condition attribute='el_l_user_type' operator='in'>" +
                "<value>" + userTypeService + "</value>" +
                "<value>" + userTypeAsha + "</value>" +
                "</condition>" +
                "</filter>" +
                "</entity>" +
                "</fetch>";

            var layoutXml = "<grid name='resultset' object='1' jump='systemuserid' select='1' icon='1' preview='1'>" +
                "<row name='result' id='systemuserid'>" +
                "<cell name='משתמש' width='200' />" +
                "</row>" +
                "</grid>";

            commons.GetControl("el_id_systemuser_thanks").addCustomView(viewId, entityLogicalName, viewDisplayName, fetchXml, layoutXml, true);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setServiceUsersLookupFilter");
        }
    };
    el_incident.saveIncident = function (onSaveExecutionContext) {
        try {
            var resolveByForEdit = commons.GetFieldValue("el_dt_resolve_by_for_edit");
            var resolveBy = commons.GetFieldValue("resolveby");
            var slaChangeComments = commons.GetFieldValue("el_s_sla_change_comments");

            if (resolveByForEdit && resolveBy < resolveByForEdit && !slaChangeComments) {
                var eventArgs = onSaveExecutionContext.getEventArgs();

                if (eventArgs) {
                    eventArgs.preventDefault();
                }

                var alertStrings = commons.GetNewXrmAlertStrings(_Hebrow.PleaseFillinSLAchangeReasonForClosing);

                commons.OpenAlerDialog(alertStrings, null, function () {
                    commons.SetFocus("el_s_sla_change_comments");
                });
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.saveIncident");
        }
    };
    el_incident.checkExistingIncidents = function () {
        try {
            var relatedCar = commons.GetLookupFieldValue("el_id_car");

            if (!relatedCar) {
                return;
            }

            commons.RetrieveMultipleRecords("incident", "?$select=incidentid,el_s_incident_number&$filter=_el_id_car_value eq " + commons.StripGuid(relatedCar.id) + " and statecode eq " + Enum.General.StateCode.Active)
                .then(function (incidents) {

                    if (incidents && incidents.length > 0) {
                        var alertStrings = commons.GetNewXrmAlertStrings(_Hebrow.ThereIsAnOpenIncidentForThisLicencePlate + incidents[0].el_s_incident_number);

                        commons.OpenAlerDialog(alertStrings, null, null);
                    }

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.checkExistingIncidents");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.checkExistingIncidents");
        }
    };
    el_incident.showNoCustomerIdNotification = function () {
        debugger;
        try {
            commons.PageClearMessages("accountMsg");

            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return;
            }
            commons.RetrieveRecord("account", commons.StripGuid(customer.id), "?$select=el_s_idnumber_text")
                .then(function (account) {

                    if (account && !account.el_s_idnumber_text) {
                        commons.SetFormNotification("שים לב, לא קיים מספר ת.ז. ללקוח", "INFORMATION", "accountMsg");
                    }

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.showNoCustomerIdNotification");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showNoCustomerIdNotification");
        }
    };
    el_incident.showCarHolderUpdateNeededNotification = function () {
        try {
            commons.PageClearMessages("cholderMsg");

            var carHolder = commons.GetLookupFieldValue("el_id_carholder");

            if (!carHolder) {
                return;
            }

            commons.RetrieveRecord("el_carholder", commons.StripGuid(carHolder.id), "?$select=el_b_approved,el_b_current_holder,el_name,el_dt_ownership_transfer")
                .then(function (result) {

                    if (!result) {
                        return;
                    }

                    var isApproved = result.el_b_approved;
                    var isCurrentHolder = result.el_b_current_holder;
                    var isOwnershipEnded = false;

                    /*
                    var isOwnershipEnded = result.el_dt_ownership_transfer != null;
                    */

                    if (isApproved === false || isCurrentHolder === false || isOwnershipEnded === true) {
                        commons.SetFormNotification(el_incident.carHolderAlert(isApproved, isCurrentHolder, isOwnershipEnded), "INFORMATION", "cholderMsg");
                    }

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.showCarHolderUpdateNeededNotification");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showCarHolderUpdateNeededNotification");
        }
    };
    /*el_incident.SetTabDisplayStatesAsCollapsedAndUnvisible = function (tabsNameArray) {
        try {
            if (!tabsNameArray || tabsNameArray.length == 0) {
                return;
            }

            tabsNameArray.forEach(function (tabName) {

                if (typeof tabName != "string") {
                    return;
                }

                commons.SetTabDisplayState(tabName, "collapsed");
                commons.ToggleTab(tabName, false);

            });

        } catch (error) {
            commons.PageErrorHandler(error, "commons.SetTabDisplayStatesAsCollapsedAndUnvisible");
        }
    };*/
    el_incident.OnCaseTypeCodeLogic = function () {
        try {
            var caseTypeCode = commons.GetFieldValue("casetypecode");

            switch (caseTypeCode) {

                case _currentEntityConsts.casetypecode.CAR_RENTAL:
                    commons.deleteAllAttributesValuesInSection("car_buyback");
                    commons.deleteAllAttributesValuesInSection("future_tradein");
                    //commons.SetTabDisplayStatesAsCollapsedAndUnvisible(["future_tradein", "car_buyback"]);
                    //commons.SetTabDisplayState("car_rental", "expanded");
                    commons.ToggleTab("car_rental", true);
                    break;

                case _currentEntityConsts.casetypecode.FUTURE_TRADEIN:
                    commons.deleteAllAttributesValuesInSection("car_buyback");
                    //commons.SetTabDisplayStatesAsCollapsedAndUnvisible(["car_rental", "car_buyback"]);
                    //commons.SetTabDisplayState("future_tradein", "expanded");
                    commons.ToggleTab("future_tradein", true);

                    var manufacturerHidden = commons.GetLookupFieldValue("el_id_manufacturer_hidden");
                    var carFamilyHidden = commons.GetFieldValue("el_s_car_family_hidden");
                    var deliveredHiddenDate = commons.GetFieldValue("el_dt_delivered_hidden");

                    if (manufacturerHidden) {
                        commons.SetLookupValue("el_id_manufacturer_td", manufacturerHidden.id, manufacturerHidden.name, Const.EntityLogicalName.Manufacturer, Const.Runtime.OnChangeBehavior.IfChanged);
                    }

                    if (carFamilyHidden) {
                        commons.SetFieldValue("el_s_car_model_td", carFamilyHidden, commons.OnChangeBehavior.None);
                    }

                    if (deliveredHiddenDate) {
                        commons.SetFieldValue("el_dt_delivered_td", deliveredHiddenDate, commons.OnChangeBehavior.None);
                    }

                    break;

                case _currentEntityConsts.casetypecode.CAR_BUYBACK:
                    commons.deleteAllAttributesValuesInSection("future_tradein");
                    /*commons.SetTabDisplayStatesAsCollapsedAndUnvisible(["car_rental", "future_tradein"]);
                    commons.SetTabDisplayState("car_buyback", "expanded");*/
                    commons.ToggleTab("car_buyback", true);

                    var car = commons.GetLookupFieldValue("el_id_car");

                    if (!car || !car.id) {
                        return;
                    }

                    commons.RetrieveMultipleRecords("el_car", "?$select=el_dt_purchase,_el_id_family_value,_el_id_manufacturer_value,_el_id_model_value&$expand=el_id_family($select=el_name),el_id_manufacturer($select=el_name),el_id_model($select=el_name)&$filter=el_carid eq " + commons.StripGuid(car.id))
                        .then(function (results) {

                            if (!results || results.length == 0) {
                                return;
                            }

                            var carResult = results[0];

                            if (carResult.el_id_manufacturer && carResult.el_id_manufacturer.el_name && carResult._el_id_manufacturer_value) {
                                commons.SetLookupValue("el_id_manufacturer_td", carResult._el_id_manufacturer_value, carResult.el_id_manufacturer.el_name, "el_manufacturer", commons.OnChangeBehavior.None);
                            }

                            if (carResult.el_id_family && carResult.el_id_family.el_name) {
                                commons.SetFieldValue("el_s_car_family", carResult.el_id_family.el_name, commons.OnChangeBehavior.None);
                            }

                            if (carResult.el_id_model && carResult.el_id_model.el_name) {
                                commons.SetFieldValue("el_s_car_model_td", carResult.el_id_model.el_name, commons.OnChangeBehavior.None);
                            }

                            if (carResult.el_dt_purchase) {
                                commons.SetFieldValue("el_dt_delivered_td", commons.ParseDate(carResult.el_dt_purchase), commons.OnChangeBehavior.None);
                            }

                        })
                        .catch(function (error) {
                            commons.PageErrorHandler(error, "el_incident.OnCaseTypeCodeLogic");
                        });

                    break;

                default:
                    commons.deleteAllAttributesValuesInSection("car_buyback");
                    commons.deleteAllAttributesValuesInSection("future_tradein");
                    //commons.SetTabDisplayStatesAsCollapsedAndUnvisible(["future_tradein", "car_buyback", "car_rental"]);
                    break;
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.OnCaseTypeCodeLogic");
        }
    };
    el_incident.filterCarLookup = function () {
        try {
            if (el_incident.incidentClosed()) {
                return;
            }

            if (!commons.GetLookupFieldValue("el_id_car")) {
                var availableDefaultViewId = commons.GetGuidOfTheDefaultLookupDialogView("el_id_car");

                el_incident.setCarLookupFilter(availableDefaultViewId);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.filterCarLookup");
        }
    };

    el_incident.setCarLookupFilter = function (availableDefaultViewId) {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer) {
                commons.SetDefaultLookupDialogView("el_id_car", availableDefaultViewId);
                return;
            }

            var viewId = "{CD964B15-16EC-4CD5-B30D-E9AD7AA72F45}";
            var entityName = Const.EntityLogicalName.Car;
            var viewDisplayName = _Hebrow.OwnedVehicles + customer.name;

            var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'>" +
                "<entity name='el_car'>" +
                "<attribute name='el_carid' />" +
                "<attribute name='el_name' />" +
                "<order attribute='el_name' descending='false' />" +
                "<link-entity name='el_carholder' from='el_id_car' to='el_carid' alias='ac'>" +
                "<filter type='and'>" +
                "<condition attribute='el_id_customer' operator='eq' value='" + customer.id + "' />" +
                "</filter>" +
                "</link-entity>" +
                "</entity>" +
                "</fetch>";

            var layoutXml = "<grid name='resultset' object='1' jump='el_carid' select='1' icon='1' preview='1'>" +
                "<row name='result' id='el_carid'>" +
                "<cell name='רכב' width='200' />" +
                "<cell name='נוצר ב-' width='200' />" +
                "</row>" +
                "</grid>";

            commons.GetControl("el_id_car").addCustomView(viewId, entityName, viewDisplayName, fetchXml, layoutXml, true);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setCarLookupFilter");
        }
    };
    el_incident.initialStageCompleted = function () {
        try {
            if (commons.GetFieldValue("el_l_initial_stage_completed") != _currentEntityConsts.el_l_initial_stage_completed.Completed) {
                return;
            }

            //commons.SetTabDisplayState("incident_details_tab", "expanded");
            commons.ToggleTab("incident_details_tab", true);

            if (commons.IsRequiredField("el_id_carholder")) {
                commons.SetFocus("el_id_carholder");
                return;
            }

            //commons.SetTabDisplayState("new_incident", "collapsed");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.initialStageCompleted");
        }
    };

    el_incident.carHolderUpdate = function (primaryControl) {
        debugger;
        try {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
            var customer = commons.GetLookupFieldValue("customerid");
            var car = commons.GetLookupFieldValue("el_id_car");

            if (!customer || !car) {
                return;
            }

            var carHolder = commons.GetLookupFieldValue("el_id_carholder");

            var pageInput = {
                pageType: "entityrecord",
                entityName: Const.EntityLogicalName.CarHolder
            };

            var navigationOptions = {
                target: 2,
                position: 1,
                width: {
                    value: 70,
                    unit: "%"
                },
                height: {
                    value: 80,
                    unit: "%"
                },
                title: "מחזיק רכב"
            };

            if (carHolder && carHolder.id) {

                pageInput.entityId = commons.StripGuid(carHolder.id);

                commons.NavigateTo(pageInput, navigationOptions)
                    .catch(function (error) {
                        commons.PageErrorHandler(error, "el_incident.carHolderUpdate");
                    });

                return;
            }

            pageInput.data = {
                el_b_current_holder: true,
                el_dt_startdate: new Date()
            };

            if (customer.id && customer.name) {
                pageInput.data.el_id_customer = commons.StripGuid(customer.id);
                pageInput.data.el_id_customername = commons.ReplaceAll(customer.name, "`", "'");
            }

            if (car.id && car.name) {
                pageInput.data.el_id_car = commons.StripGuid(car.id);
                pageInput.data.el_id_carname = car.name;
            }

            commons.NavigateTo(pageInput, navigationOptions)
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.carHolderUpdate");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.carHolderUpdate");
        }
    };

    el_incident.setFieldsFromParentIncident = function () {
        try {
            if (el_incident.incidentClosed()) {
                return;
            }

            var parentIncident = commons.GetLookupFieldValue("el_id_parent_incident");
            var caseTypeCode = commons.GetFieldValue("casetypecode");

            if (!parentIncident || !parentIncident.id || !caseTypeCode || caseTypeCode != _currentEntityConsts.casetypecode.RECALL) {
                return;
            }

            commons.RetrieveMultipleRecords("incident", "?$select=title,description,prioritycode,_el_id_main_subject_value,_el_id_secondary_subject_value&$expand=el_el_main_subject_incident_id_main_subject($select=el_name),el_el_secondary_subject_incident_id_secondary_subject($select=el_name)&$filter=incidentid eq " + commons.StripGuid(parentIncident.id))
                .then(function (results) {

                    if (!results || results.length == 0) {
                        return;
                    }

                    var incidentResult = results[0];

                    if (incidentResult.description) {
                        commons.SetFieldValue("description", incidentResult.description, commons.OnChangeBehavior.None);
                    }

                    if (incidentResult._el_id_main_subject_value && incidentResult.el_el_main_subject_incident_id_main_subject) {
                        commons.SetLookupValue("el_id_main_subject", incidentResult._el_id_main_subject_value, incidentResult.el_el_main_subject_incident_id_main_subject.el_name, Const.EntityLogicalName.MainSubject, commons.OnChangeBehavior.None);
                    }

                    if (incidentResult._el_id_secondary_subject_value && incidentResult.el_el_secondary_subject_incident_id_secondary_subject) {
                        commons.SetLookupValue("el_id_secondary_subject", incidentResult._el_id_secondary_subject_value, incidentResult.el_el_secondary_subject_incident_id_secondary_subject.el_name, Const.EntityLogicalName.SecondarySubject, commons.OnChangeBehavior.None);
                    }

                    if (incidentResult.title) {
                        commons.SetFieldValue("title", incidentResult.title, commons.OnChangeBehavior.None);
                    }

                    if (incidentResult.prioritycode != null) {
                        commons.SetFieldValue("prioritycode", incidentResult.prioritycode, commons.OnChangeBehavior.None);
                    }

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.setFieldsFromParentIncident");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setFieldsFromParentIncident");
        }
    };
    el_incident.setMainSubject = async function () {
        debugger;
        try {
            var caseTypeCode = commons.GetFieldValue("casetypecode");

            if (!caseTypeCode) {
                commons.SetFieldValue("el_id_main_subject", null);
                commons.SetFieldValue("el_id_secondary_subject", null);
                return;
            }

            var mainSubjectOrder = null;
            var secondarySubjectOrder = null;

            switch (caseTypeCode) {
                case _currentEntityConsts.casetypecode.APPROVAL_INFO:
                    mainSubjectOrder =
                        Enum.el_main_sub.el_n_order_value.APPROVAL_INFO;
                    break;

                case _currentEntityConsts.casetypecode.CAR_RENTAL:
                    mainSubjectOrder =
                        Enum.el_main_sub.el_n_order_value.CAR_RENTAL;
                    break;

                case _currentEntityConsts.casetypecode.CAR_DETAILS_MISSING:
                    mainSubjectOrder =
                        Enum.el_main_sub.el_n_order_value.SPARE_PARTS;

                    secondarySubjectOrder =
                        Enum.el_secondary_subject.el_n_order_value.PART_MISSING;
                    break;

                case _currentEntityConsts.casetypecode.CHANGE_OWNERSHIP:
                    mainSubjectOrder =
                        Enum.el_main_sub.el_n_order_value.APPROVAL_INFO;

                    secondarySubjectOrder =
                        Enum.el_secondary_subject.el_n_order_value.INFO;
                    break;

                default:
                    commons.SetFieldValue("el_id_main_subject", null);
                    commons.SetFieldValue("el_id_secondary_subject", null);
                    return;
            }

            var secondaryLookupField = null;

            if (secondarySubjectOrder != null) {
                var secondaryResults =
                    await commons.RetrieveMultipleRecords(
                        "el_secondary_subject",
                        "?$select=el_name,el_secondary_subjectid" +
                        "&$filter=el_n_order eq " + secondarySubjectOrder
                    );

                if (
                    secondaryResults &&
                    secondaryResults.length > 0 &&
                    secondaryResults[0].el_secondary_subjectid
                ) {
                    secondaryLookupField = {
                        Id: secondaryResults[0].el_secondary_subjectid,
                        Name: secondaryResults[0].el_name,
                        LogicalName:
                            Const.EntityLogicalName.SecondarySubject
                    };
                }
            }

            var mainResults =
                await commons.RetrieveMultipleRecords(
                    "el_main_subject",
                    "?$select=el_name,el_main_subjectid" +
                    "&$filter=el_n_order eq " + mainSubjectOrder
                );

            if (
                mainResults &&
                mainResults.length > 0 &&
                mainResults[0].el_main_subjectid
            ) {
                commons.SetLookupValue(
                    "el_id_main_subject",
                    mainResults[0].el_main_subjectid,
                    mainResults[0].el_name,
                    Const.EntityLogicalName.MainSubject
                );

                if (secondaryLookupField) {
                    commons.SetLookupValue(
                        "el_id_secondary_subject",
                        secondaryLookupField.Id,
                        secondaryLookupField.Name,
                        secondaryLookupField.LogicalName
                    );
                } else {
                    /*
                     * The selected case type does not require a secondary
                     * subject, so remove a value left by a previous type.
                     */
                    commons.SetFieldValue(
                        "el_id_secondary_subject",
                        null
                    );
                }

                return;
            }

            /*
             * No matching Main Subject record was found.
             */
            commons.SetLookupValue("el_id_main_subject", null);
            commons.SetFireOnChange("el_id_main_subject");

            /*
             * Preserve the original intention: set the Secondary Subject
             * when one was found; otherwise clear it.
             */
            if (secondaryLookupField) {
                commons.SetLookupValue(
                    "el_id_secondary_subject",
                    secondaryLookupField.Id,
                    secondaryLookupField.Name,
                    secondaryLookupField.LogicalName
                );
            } else {
                commons.SetLookupValue(
                    "el_id_secondary_subject",
                    null
                );
            }

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_incident.setMainSubject"
            );
        }
    };
    el_incident.showRespondentSection = function () {
        try {
            var caseTypeCode = commons.GetFieldValue("casetypecode");
            var mainSubject = commons.GetLookupFieldValue("el_id_main_subject");

            switch (caseTypeCode) {

                case _currentEntityConsts.casetypecode.THANK:
                    commons.SetFieldAsVisibleAndRequired("el_l_respondent");
                    break;

                case _currentEntityConsts.casetypecode.COMPLAINT:
                    if (!mainSubject || !mainSubject.id) {
                        return;
                    }

                    commons.RetrieveMultipleRecords("el_main_subject", "?$select=el_n_order&$filter=el_main_subjectid eq " + commons.StripGuid(mainSubject.id))
                        .then(function (results) {

                            if (!results || results.length == 0 || !results[0].el_n_order) {
                                return;
                            }

                            var mainSubjectOrder = results[0].el_n_order;

                            if (mainSubjectOrder == Enum.el_main_sub.el_n_order_value.SERVICE_QUALITY) {
                                commons.SetFieldAsVisibleAndRequired("el_l_respondent");
                            }

                        })
                        .catch(function (error) {
                            commons.PageErrorHandler(error, "el_incident.showRespondentSection");
                        });

                    break;

                default:
                    commons.deleteAllAttributesValuesInSection("incident_details_defendant");
                    commons.SetFieldAsUNvisibleAndNONrequired("el_l_respondent");

                    if (!el_incident.incidentClosed()) {
                        commons.SetFieldValue("el_l_respondent", null, commons.OnChangeBehavior.None);
                        commons.SetFireOnChange("el_l_respondent");
                    }

                    break;
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showRespondentSection");
        }
    };
    el_incident.recallHandler = function () {
        try {
            var caseTypeCode = commons.GetFieldValue("casetypecode");

            if (caseTypeCode == _currentEntityConsts.casetypecode.RECALL) {
                commons.ToggleTab("incident_recall", true);
                commons.SetFieldAsVisibleAndRequired("el_id_incident_collection_recall");
                commons.SetFieldAsVisibleAndRequired("el_s_recall_work_number");
                commons.SetVisible("el_l_channel", false);
                commons.SetVisible("el_id_contact", false);

                return;
            }

            commons.SetFieldAsUNvisibleAndNONrequired("el_id_incident_collection_recall");

            if (!el_incident.incidentClosed()) {
                commons.SetLookupValue("el_id_incident_collection_recall", null);
            }

            commons.SetFieldAsUNvisibleAndNONrequired("el_s_recall_work_number");

            if (!el_incident.incidentClosed()) {
                commons.SetFieldValue("el_s_recall_work_number", null, commons.OnChangeBehavior.None);
            }

            commons.ToggleTab("incident_recall", false);
            commons.SetVisible("el_l_channel", true);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.recallHandler");
        }
    };

    el_incident.showSendSlaAlertField = function () {
        try {
            var priorityCode = commons.GetFieldValue("prioritycode");

            commons.SetVisible("el_b_send_alert_mail", priorityCode && priorityCode != _currentEntityConsts.prioritycode.REGULAR);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showSendSlaAlertField");
        }
    };
    el_incident.showBenefitCode = function () {
        try {
            var solutionType = commons.GetFieldValue("el_l_solution_type");

            if (solutionType && solutionType == _currentEntityConsts.el_l_solution_type.BENEFIT_GIVEN) {
                commons.SetVisible("el_s_benefit", true);
                commons.SetRequiredLevel("el_s_benefit", "required");

                return;
            }

            if (!el_incident.incidentClosed()) {
                commons.SetFieldValue("el_s_benefit", null, commons.OnChangeBehavior.None);
            }

            commons.SetVisible("el_s_benefit", false);
            commons.SetRequiredLevel("el_s_benefit", "none");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showBenefitCode");
        }
    };

    el_incident.setCompensationGiven = function () {
        try {
            var solutionType = commons.GetFieldValue("el_l_solution_type");
            var compensationGiven = false;

            switch (solutionType) {

                case _currentEntityConsts.el_l_solution_type.EXPLANATION:
                case _currentEntityConsts.el_l_solution_type.LEGAL_DISCUSSION:
                    compensationGiven = false;
                    break;

                case _currentEntityConsts.el_l_solution_type.BENEFIT_GIVEN:
                case _currentEntityConsts.el_l_solution_type.GOOD_WILL_MANUFACTURER:
                case _currentEntityConsts.el_l_solution_type.GOOD_WILL_DELEKMOTORS:
                case _currentEntityConsts.el_l_solution_type.BUY_CAR:
                    compensationGiven = true;
                    break;

                default:
                    compensationGiven = false;
                    break;
            }

            commons.SetFieldValue("el_b_compensation", compensationGiven, commons.OnChangeBehavior.None);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setCompensationGiven");
        }
    };
    el_incident.setIdCarRequired = function () {
        try {
            var isCarIdNotRequired = commons.GetFieldValue("el_b_car_not_provided");

            if (!isCarIdNotRequired) {
                commons.SetRequiredLevel("el_s_car_number", "none");
                commons.SetRequiredLevel("el_id_carholder", "none");

                if (!el_incident.incidentClosed()) {
                    commons.SetFieldValue("el_s_car_number", null, commons.OnChangeBehavior.None);
                    commons.SetLookupValue("el_id_car", null);
                    commons.SetLookupValue("el_id_carholder", null);
                    commons.SetFieldValue("el_n_current_speedometer", null, commons.OnChangeBehavior.None);
                }

                commons.SetVisibleArray([
                    "el_s_car_number",
                    "el_id_car",
                    "el_n_current_speedometer",
                    "el_id_carholder"
                ], false);

                return;
            }

            commons.SetVisibleArray([
                "el_s_car_number",
                "el_id_car",
                "el_n_current_speedometer",
                "el_id_carholder"
            ], true);

            commons.SetRequiredLevel("el_s_car_number", "required");
            commons.SetRequiredLevel("el_id_carholder", "required");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setIdCarRequired");
        }
    };

    el_incident.showSecondarySubject = function () {
        try {
            var mainSubject = commons.GetLookupFieldValue("el_id_main_subject");

            if (!mainSubject || !mainSubject.id) {
                return;
            }

            commons.RetrieveMultipleRecords("el_main_subject", "?$select=el_n_order&$filter=el_main_subjectid eq " + commons.StripGuid(mainSubject.id))
                .then(function (results) {

                    if (!results || results.length == 0 || !results[0].el_n_order) {
                        return;
                    }

                    var mainSubjectOrder = results[0].el_n_order;

                    var shouldShowSecondarySubject = mainSubjectOrder == Enum.el_main_sub.el_n_order_value.TECHNICAL ||
                        mainSubjectOrder == Enum.el_main_sub.el_n_order_value.APPROVAL_INFO;

                    if (shouldShowSecondarySubject) {
                        commons.SetVisible("el_id_secondary_subject", true);
                        commons.SetRequiredLevel("el_id_secondary_subject", "required");
                        commons.SetFocus("el_id_secondary_subject");

                        return;
                    }

                    commons.SetLookupValue("el_id_secondary_subject", null);
                    commons.SetVisible("el_id_secondary_subject", false);
                    commons.SetRequiredLevel("el_id_secondary_subject", "none");
                    commons.SetFireOnChange("el_id_secondary_subject");

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.showSecondarySubject");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showSecondarySubject");
        }
    };
    el_incident.showSubjectTree = function () {
        try {
            commons.SetVisible("subjectid", true);
            commons.SetRequiredLevel("subjectid", "required");
            commons.SetFocus("subjectid");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showSubjectTree");
        }
    };

    el_incident.showElseSecondarySubject = function () {
        debugger;
        try {
            var secondarySubject = commons.GetLookupFieldValue("el_id_secondary_subject");

            if (!secondarySubject || !secondarySubject.id) {
                commons.SetVisible("el_s_manual_subject", false);
                commons.SetRequiredLevel("el_s_manual_subject", "none");
                commons.SetFieldValue("el_s_manual_subject", null, commons.OnChangeBehavior.None);

                return;
            }

            commons.RetrieveMultipleRecords("el_secondary_subject", "?$select=el_n_order&$filter=el_secondary_subjectid eq " + commons.StripGuid(secondarySubject.id))
                .then(function (results) {

                    if (!results || results.length == 0 || !results[0].el_n_order) {
                        return;
                    }

                    var secondarySubjectOrder = results[0].el_n_order;

                    var shouldShowManualSubject =
                        secondarySubjectOrder == Enum.el_secondary_subject.el_n_order_value.TECHNICAL ||
                        secondarySubjectOrder == Enum.el_secondary_subject.el_n_order_value.SERVICE_QUALITY ||
                        secondarySubjectOrder == Enum.el_secondary_subject.el_n_order_value.APPROVAL_INFO ||
                        secondarySubjectOrder == Enum.el_secondary_subject.el_n_order_value.SPARE_PARTS;

                    if (shouldShowManualSubject) {
                        commons.SetVisible("el_s_manual_subject", true);
                        commons.SetRequiredLevel("el_s_manual_subject", "required");

                        return;
                    }

                    commons.SetVisible("el_s_manual_subject", false);
                    commons.SetRequiredLevel("el_s_manual_subject", "none");
                    commons.SetFieldValue("el_s_manual_subject", null, commons.OnChangeBehavior.None);

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.showElseSecondarySubject");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showElseSecondarySubject");
        }
    };

    el_incident.showIncidentChannelFields = function () {
        try {
            //commons.SetTabDisplayState("incident_old", "collapsed");

            commons.SetVisibleArray([
                "el_dt_fax_recieved",
                "el_id_showroom",
                "el_id_agent",
                "el_id_car_fleet",
                "el_id_systemuser_rental",
                "el_id_service_point",
                "el_id_systemuser",
                "el_s_channel_facebook_page",
                "el_id_manufacturer"
            ], false);

            var incidentChannel = commons.GetFieldValue("el_l_channel");

            var fieldsToClear = [
                "el_dt_fax_recieved",
                "el_id_showroom",
                "el_id_agent",
                "el_id_car_fleet",
                "el_id_service_point",
                "el_id_systemuser",
                "el_s_channel_facebook_page",
                "el_id_manufacturer"
            ];

            switch (incidentChannel) {

                case _IncidentChannels.FAX:
                    commons.SetVisible("el_dt_fax_recieved", true);

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_id_showroom",
                        "el_id_agent",
                        "el_id_car_fleet",
                        "el_id_service_point",
                        "el_id_systemuser",
                        "el_s_channel_facebook_page",
                        "el_id_manufacturer"
                    ]);

                    break;

                case _IncidentChannels.Showroom:
                    commons.SetVisibleArray([
                        "el_id_showroom",
                        "el_id_agent"
                    ], true);

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_id_showroom",
                        "el_id_agent",
                        "el_dt_fax_recieved",
                        "el_id_car_fleet",
                        "el_id_service_point",
                        "el_id_systemuser",
                        "el_s_channel_facebook_page",
                        "el_id_manufacturer"
                    ]);

                    break;

                case _IncidentChannels.CarFleet:
                    commons.SetVisible("el_id_car_fleet", true);

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_dt_fax_recieved",
                        "el_id_showroom",
                        "el_id_agent",
                        "el_id_service_point",
                        "el_id_systemuser",
                        "el_s_channel_facebook_page",
                        "el_id_manufacturer"
                    ]);

                    break;

                case _IncidentChannels.ServiceCenter:
                    commons.SetVisible("el_id_service_point", true);

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_dt_fax_recieved",
                        "el_id_showroom",
                        "el_id_agent",
                        "el_id_car_fleet",
                        "el_id_systemuser",
                        "el_s_channel_facebook_page",
                        "el_id_manufacturer"
                    ]);

                    break;

                case _IncidentChannels.Internal:
                    commons.SetVisible("el_id_systemuser", true);

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_dt_fax_recieved",
                        "el_id_showroom",
                        "el_id_agent",
                        "el_id_car_fleet",
                        "el_id_service_point",
                        "el_s_channel_facebook_page",
                        "el_id_manufacturer"
                    ]);

                    break;

                case _IncidentChannels.FACEBOOK:
                    commons.SetVisible("el_s_channel_facebook_page", true);

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_dt_fax_recieved",
                        "el_id_showroom",
                        "el_id_agent",
                        "el_id_car_fleet",
                        "el_id_service_point",
                        "el_id_systemuser",
                        "el_id_manufacturer"
                    ]);

                    break;

                case _IncidentChannels.MANUFACTURER:
                    commons.SetVisible("el_id_manufacturer", true);

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_dt_fax_recieved",
                        "el_id_showroom",
                        "el_id_agent",
                        "el_id_car_fleet",
                        "el_id_service_point",
                        "el_id_systemuser",
                        "el_s_channel_facebook_page"
                    ]);

                    break;

                case _IncidentChannels.WEBSITE:
                    //commons.SetTabDisplayState("incident_old", "expanded");

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_id_showroom",
                        "el_id_agent",
                        "el_id_car_fleet",
                        "el_id_service_point",
                        "el_id_systemuser",
                        "el_s_channel_facebook_page",
                        "el_id_manufacturer",
                        "el_dt_fax_recieved"
                    ]);

                    break;

                case _IncidentChannels.ClientSummons:
                    commons.SetVisibleArray([
                        "el_id_systemuser_rental",
                        "el_id_service_point"
                    ], true);

                    //commons.SetTabDisplayState("incident_old", "expanded");

                    el_incident.clearFieldsExcept(fieldsToClear, [
                        "el_id_systemuser_rental",
                        "el_id_service_point",
                        "incident_old",
                        "el_id_showroom",
                        "el_id_agent",
                        "el_id_car_fleet",
                        "el_id_service_point",
                        "el_id_systemuser",
                        "el_s_channel_facebook_page",
                        "el_id_manufacturer",
                        "el_dt_fax_recieved"
                    ]);

                    break;

                default:
                    break;
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showIncidentChannelFields");
        }
    };
    el_incident.clearFieldsExcept = function (fieldsToClear, excludedFields) {
        try {
            if (!fieldsToClear || fieldsToClear.length == 0) {
                return;
            }

            excludedFields = excludedFields || [];

            fieldsToClear.forEach(function (fieldName) {

                if (excludedFields.indexOf(fieldName) > -1) {
                    return;
                }

                var attribute = commons.GetAttribute(fieldName);

                if (!attribute) {
                    return;
                }

                var value = attribute.getValue();

                if (value === null || value === undefined) {
                    return;
                }

                attribute.setValue(null);

            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.clearFieldsExcept");
        }
    };

    el_incident.showServicePointOrDelekUnit = function () {
        try {
            var respondent = commons.GetFieldValue("el_l_respondent");

            commons.SetVisible("el_l_respondent_delek_unit", false);
            commons.SetRequiredLevel("el_l_respondent_delek_unit", "none");

            commons.SetVisible("el_id_service_point_respondent", false);
            commons.SetRequiredLevel("el_id_service_point_respondent", "none");

            switch (respondent) {

                case _currentEntityConsts.el_l_respondent.DELEKMOTORS:
                    commons.SetVisible("el_l_respondent_delek_unit", true);
                    commons.SetRequiredLevel("el_l_respondent_delek_unit", "required");

                    if (!el_incident.incidentClosed()) {
                        commons.SetLookupValue("el_id_service_point_respondent", null);
                    }

                    break;

                case _currentEntityConsts.el_l_respondent.SERVICE_POINT:
                    commons.SetVisible("el_id_service_point_respondent", true);
                    commons.SetRequiredLevel("el_id_service_point_respondent", "required");

                    if (!el_incident.incidentClosed()) {
                        commons.SetFieldValue("el_l_respondent_delek_unit", null, commons.OnChangeBehavior.None);
                    }

                    break;

                default:
                    break;
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showServicePointOrDelekUnit");
        }
    };

    el_incident.isBenefitAndLicenseNotVerified = function () {
        try {
            var compensation = commons.GetFieldValue("el_b_compensation");

            if (compensation !== true) {
                return Promise.resolve(false);
            }

            var carHolder = commons.GetLookupFieldValue("el_id_carholder");

            if (!carHolder || !carHolder.id) {
                return Promise.resolve(false);
            }

            return commons.RetrieveMultipleRecords("el_carholder", "?$select=el_carholderid&$filter=el_carholderid eq " + commons.StripGuid(carHolder.id) + " and el_b_approved eq false")
                .then(function (results) {

                    return results && results.length > 0;

                })
                .catch(function (error) {

                    commons.PageErrorHandler(error, "el_incident.isBenefitAndLicenseNotVerified");

                    return false;
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.isBenefitAndLicenseNotVerified");

            return Promise.resolve(false);
        }
    };
    el_incident.setUpdateCarHolder = function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");
            var car = commons.GetLookupFieldValue("el_id_car");

            var customerId = customer && customer.id ? customer.id : null;
            var carId = car && car.id ? car.id : null;

            if (customerId && carId) {
                commons.RetrieveMultipleRecords("el_carholder", "?$select=el_carholderid,el_name,el_b_approved,el_b_current_holder,el_dt_ownership_transfer&$filter=_el_id_customer_value eq " + commons.StripGuid(customerId) + " and _el_id_car_value eq " + commons.StripGuid(carId))
                    .then(function (results) {

                        if (!results || results.length == 0 || !results[0].el_carholderid) {
                            return;
                        }

                        commons.SetLookupValue("el_id_carholder", results[0].el_carholderid, results[0].el_name, "el_carholder", commons.OnChangeBehavior.None);

                    })
                    .catch(function (error) {
                        commons.PageErrorHandler(error, "el_incident.setUpdateCarHolder");
                    });
            }
            else {
                commons.SetLookupValue("el_id_carholder", null);
                commons.SetFieldValue("el_b_show_car_holder", true, commons.OnChangeBehavior.None);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setUpdateCarHolder");
        }
    };

    el_incident.carHolderAlert = function (isApproved, isCurrentHolder, isOwnershipEnded) {
        try {
            var message = "";

            if (isApproved === false) {
                message += _Hebrow.CarHolderAlertNotVerified + "\n";
            }

            if (isCurrentHolder === false) {
                message += _Hebrow.TheCustomerEnteredIsNotTheCurrentOwner + "\n";
            }

            return message;

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.carHolderAlert");

            return "";
        }
    };

    el_incident.setCarModelNumberHiddenFields = function () {
        try {
            if (el_incident.incidentClosed()) {
                return;
            }

            var car = commons.GetLookupFieldValue("el_id_car");

            if (!car || !car.id) {
                return;
            }

            commons.RetrieveMultipleRecords("el_car", "?$select=el_name,el_s_model_year,el_dt_purchase&$expand=el_id_model($select=el_name),el_id_manufacturer($select=el_name,el_manufacturerid),el_id_family($select=el_name)&$filter=el_carid eq " + commons.StripGuid(car.id))
                .then(function (results) {

                    if (!results || results.length == 0 || !commons.GetAttribute("el_s_car_model_hidden")) {
                        return;
                    }

                    var carResult = results[0];

                    if (carResult.el_id_model && carResult.el_id_model.el_name) {
                        commons.SetFieldValue("el_s_car_model_hidden", carResult.el_id_model.el_name, commons.OnChangeBehavior.None);
                    }

                    if (carResult.el_name && commons.GetAttribute("el_s_car_number")) {
                        commons.SetFieldValue("el_s_car_number_hidden", carResult.el_name, commons.OnChangeBehavior.None);

                        if (!commons.GetFieldValue("el_s_car_number")) {
                            commons.SetFieldValue("el_s_car_number", carResult.el_name, commons.OnChangeBehavior.None);
                        }
                    }

                    if (carResult.el_id_manufacturer && commons.GetAttribute("el_id_manufacturer_hidden")) {
                        commons.SetLookupValue("el_id_manufacturer_hidden", carResult.el_id_manufacturer.el_manufacturerid, carResult.el_id_manufacturer.el_name, "el_manufacturer", commons.OnChangeBehavior.None);
                    }

                    if (carResult.el_id_family && carResult.el_id_family.el_name && commons.GetAttribute("el_s_car_family_hidden")) {
                        commons.SetFieldValue("el_s_car_family_hidden", carResult.el_id_family.el_name, commons.OnChangeBehavior.None);
                    }

                    if (carResult.el_s_model_year && commons.GetAttribute("el_s_car_year_hidden")) {
                        commons.SetFieldValue("el_s_car_year_hidden", carResult.el_s_model_year, commons.OnChangeBehavior.None);
                    }

                    if (carResult.el_dt_purchase && commons.GetAttribute("el_dt_delivered_hidden")) {
                        var deliveryDate = el_incident.getdataDateFormDt(carResult.el_dt_purchase);

                        commons.SetFieldValue("el_dt_delivered_hidden", new Date(deliveryDate), commons.OnChangeBehavior.None);
                    }

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.setCarModelNumberHiddenFields");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setCarModelNumberHiddenFields");
        }
    };
    el_incident.getdataDateFormDt = function (dateField) {
        try {
            if (!dateField) {
                return "";
            }

            dateField = dateField.replace("/Date(", "");
            dateField = dateField.replace(")/", "");

            var dateValue = new Date(parseInt(dateField, 10));

            dateValue.setDate(dateValue.getDate());

            return [
                dateValue.getMonth() + 1,
                dateValue.getDate(),
                dateValue.getFullYear()
            ];

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.getdataDateFormDt");

            return "";
        }
    };

    el_incident.setTempCustomerFields = function () {
        try {
            var car = commons.GetLookupFieldValue("el_id_car");

            if (!car || !car.id) {
                return;
            }

            commons.RetrieveMultipleRecords("el_car", "?$select=el_s_customer_name,el_s_idnumber,el_s_phone1,el_s_phone2,el_s_email&$filter=el_carid eq " + commons.StripGuid(car.id))
                .then(function (results) {

                    if (!results || results.length == 0 || !results[0].el_s_customer_name) {
                        return;
                    }

                    var carResult = results[0];

                    commons.SetFieldValue("el_s_customer_name", carResult.el_s_customer_name, commons.OnChangeBehavior.None);
                    commons.SetFieldValue("el_s_idnumber", carResult.el_s_idnumber, commons.OnChangeBehavior.None);
                    commons.SetFieldValue("el_s_phone1", carResult.el_s_phone1, commons.OnChangeBehavior.None);
                    commons.SetFieldValue("el_s_phone2", carResult.el_s_phone2, commons.OnChangeBehavior.None);
                    commons.SetFieldValue("el_s_email", carResult.el_s_email, commons.OnChangeBehavior.None);

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.setTempCustomerFields");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setTempCustomerFields");
        }
    };
    el_incident.getCustomerFromCarHolder = function () {
        try {
            commons.SetSectionVisibility("new_incident", "new_incident_new_customer", false);

            var car = commons.GetLookupFieldValue("el_id_car");
            var customer = commons.GetLookupFieldValue("customerid");

            if (!car || !car.id || customer) {
                return;
            }

            commons.RetrieveMultipleRecords("el_carholder", "?$select=createdon&$expand=el_id_customer($select=accountid,name)&$filter=_el_id_car_value eq " + commons.StripGuid(car.id) + " and _el_id_customer_value ne null&$orderby=createdon desc")
                .then(function (results) {

                    if (results && results.length > 0 && results[0].el_account_el_carholder_id_customer && results[0].el_account_el_carholder_id_customer.accountid) {
                        var account = results[0].el_account_el_carholder_id_customer;

                        commons.SetLookupValue("customerid", account.accountid, account.name, "account", commons.OnChangeBehavior.None);
                        commons.SetFireOnChange("customerid");
                    }

                    if (commons.GetFieldValue("el_s_customer_name")) {
                        commons.SetSectionVisibility("new_incident", "new_incident_new_customer", true);
                    }

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.getCustomerFromCarHolder");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.getCustomerFromCarHolder");
        }
    };

    el_incident.setCustomerHiddenFields = function () {
        try {
            if (el_incident.incidentClosed()) {
                return;
            }

            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id) {
                return;
            }

            commons.RetrieveMultipleRecords("account", "?$select=telephone1,name&$filter=accountid eq " + commons.StripGuid(customer.id))
                .then(function (results) {

                    if (!results || results.length == 0 || !results[0].telephone1) {
                        return;
                    }

                    var accountResult = results[0];

                    commons.SetFieldValue("el_s_customer_phone_hidden", accountResult.telephone1, commons.OnChangeBehavior.None);
                    commons.SetFieldValue("el_s_customer_name_hidden", accountResult.name, commons.OnChangeBehavior.None);

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.setCustomerHiddenFields");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setCustomerHiddenFields");
        }
    };

    el_incident.emptyCustomerFromCarHolderFields = function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer) {
                return;
            }

            commons.SetFieldValue("el_s_customer_name", null, commons.OnChangeBehavior.None);
            commons.SetFieldValue("el_s_idnumber", null, commons.OnChangeBehavior.None);
            commons.SetFieldValue("el_s_phone1", null, commons.OnChangeBehavior.None);
            commons.SetFieldValue("el_s_phone2", null, commons.OnChangeBehavior.None);
            commons.SetFieldValue("el_s_email", null, commons.OnChangeBehavior.None);

            commons.SetSectionVisibility("new_incident", "new_incident_new_customer", false);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.emptyCustomerFromCarHolderFields");
        }
    };
    el_incident.setContactPhoneHiddenField = function () {
        try {
            if (el_incident.incidentClosed()) {
                return;
            }

            var contact = commons.GetLookupFieldValue("el_id_contact");

            if (!contact || !contact.id) {
                return;
            }

            commons.RetrieveMultipleRecords("contact", "?$select=mobilephone&$filter=contactid eq " + commons.StripGuid(contact.id))
                .then(function (results) {

                    if (!results || results.length == 0 || !results[0].mobilephone) {
                        return;
                    }

                    commons.SetFieldValue("el_s_contact_phone_hidden", results[0].mobilephone, commons.OnChangeBehavior.None);

                })
                .catch(function (error) {
                    commons.PageErrorHandler(error, "el_incident.setContactPhoneHiddenField");
                });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setContactPhoneHiddenField");
        }
    };

    el_incident.setFirstActualTreatmentDate = function () {
        try {
            if (el_incident.incidentClosed()) {
                return;
            }

            var firstTreatmentDate = commons.GetAttribute("el_dt_first_response_actual");

            if (!firstTreatmentDate || firstTreatmentDate.getValue()) {
                return;
            }

            commons.SetFieldValue("el_dt_first_response_actual", new Date(), commons.OnChangeBehavior.None);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setFirstActualTreatmentDate");
        }
    };

    el_incident.showCarStateFields = function () {
        try {
            commons.SetVisible("el_b_staying_car", commons.GetFieldValue("el_b_staying_car") === true);
            commons.SetVisible("el_b_waiting_car", commons.GetFieldValue("el_b_waiting_car") === true);
            commons.SetVisible("el_b_66", commons.GetFieldValue("el_b_66") === true);
            commons.SetVisible("el_b_33", commons.GetFieldValue("el_b_33") === true);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showCarStateFields");
        }
    };
    el_incident.createCarWithOdata = function () {
        try {
            var carNumber = commons.GetFieldValue("el_s_car_number");

            if (!carNumber) {
                return;
            }

            var message = "לא נמצאה רשומת רכב התואמת למספר הרישוי: " + carNumber + "\n האם ליצור רשומת רכב חדשה?";

            commons.RetrieveMultipleRecords("el_car", "?$select=el_carid,el_name&$filter=el_name eq '" + carNumber + "'").then(function (results) {

                if (results && results.length > 0 && results[0].el_carid && results[0].el_name) {
                    commons.SetLookupValue("el_id_car", results[0].el_carid, results[0].el_name, "el_car", commons.OnChangeBehavior.None);
                    commons.SetFireOnChange("el_id_car");
                    el_incident.checkExistingIncidents();

                    return;
                }

                commons.OpenConfirmDialog(
                    message,
                    "",
                    "כן",
                    "לא",
                    200,
                    450
                ).then(function (result) {
                    if (result.confirmed) {
                        el_incident.createCarRecord(carNumber);
                    } else {
                        commons.SetFieldValue(
                            "el_s_car_number",
                            null,
                            commons.OnChangeBehavior.None
                        );
                    }
                });

            }).catch(function (error) {
                commons.PageErrorHandler(error, "el_incident.createCarWithOdata");
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createCarWithOdata");
        }
    };

    el_incident.createCarCompleted = function (car) {
        try {
            if (!car || !car.el_carId || !car.el_name) {
                return;
            }

            commons.SetLookupValue("el_id_car", car.el_carId, car.el_name, "el_car", commons.OnChangeBehavior.None);
            commons.SetFireOnChange("el_id_car");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createCarCompleted");
        }
    };

    el_incident.createCarFailed = function (error) {
        try {
            var errorText = null;

            if (error && error.message) {
                errorText = error.message;
            } else if (error && error.responseText) {
                errorText = error.responseText;
                errorText = errorText.substring(errorText.lastIndexOf('value": ') + 9, errorText.lastIndexOf('"'));
            }

            if (errorText == "Car doesn't exist in AS400") {
                errorText = "הרכב אינו קיים";
            }

            commons.OpenAlertDialog(errorText || "אירעה שגיאה בעת יצירת הרכב");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createCarFailed");
        }
    };

    el_incident.createCarRecord = function (carNumber) {
        try {
            var car = {
                el_name: carNumber
            };

            commons.CreateRecordWebApi("el_car", car).then(function (result) {
                return commons.RetrieveRecord("el_car", result.id, "?$select=el_carid,el_name");
            }).then(function (createdCar) {
                el_incident.createCarCompleted({
                    el_carId: createdCar.el_carid,
                    el_name: createdCar.el_name
                });
            }).catch(function (error) {
                el_incident.createCarFailed(error);
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createCarRecord");
        }
    };
    el_incident.createNewCustomer = function () {
        try {
            var shouldCreateCustomer = commons.GetFieldValue("el_b_create_customer");

            if (!shouldCreateCustomer) {
                return;
            }

            var message = "האם ליצור לקוח חדש?";

            var confirmStrings = {
                text: commons.RTLString(message),
                title: ""
            };

            var confirmOptions = {
                height: 200,
                width: 450
            };

            Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions).then(function (result) {

                if (!result.confirmed) {
                    return;
                }

                var customer = {
                    el_s_first_name: commons.GetFieldValue("el_s_customer_first_name"),
                    el_s_last_name: commons.GetFieldValue("el_s_customer_last_name"),
                    Name: commons.GetFieldValue("el_s_customer_name"),
                    el_s_idnumber_text: commons.GetFieldValue("el_s_idnumber"),
                    Telephone1: commons.GetFieldValue("el_s_phone1"),
                    Telephone2: commons.GetFieldValue("el_s_phone2"),
                    EMailAddress1: commons.GetFieldValue("el_s_email")
                };

                commons.CreateRecordWebApi("account", customer).then(function (createdAccount) {
                    return commons.RetrieveRecord("account", createdAccount.id, "?$select=accountid,name");
                }).then(function (account) {
                    el_incident.createCustomerCompleted({
                        AccountId: account.accountid,
                        Name: account.name
                    });
                }).catch(function (error) {
                    el_incident.createCustomerFailed(error);
                });

            }).catch(function (error) {
                commons.PageErrorHandler(error, "el_incident.createNewCustomer");
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createNewCustomer");
        }
    };

    el_incident.createCustomerCompleted = function (customer) {
        try {
            if (!customer || !customer.AccountId || !customer.Name) {
                return;
            }

            commons.SetLookupValue("customerid", customer.AccountId, customer.Name, "account", commons.OnChangeBehavior.None);
            commons.SetFireOnChange("customerid");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createCustomerCompleted");
        }
    };

    el_incident.createCustomerFailed = function (error) {
        try {
            var errorText = null;

            if (error && error.message) {
                errorText = error.message;
            } else if (error && error.responseText) {
                errorText = error.responseText;
                errorText = errorText.substring(errorText.lastIndexOf('value": ') + 9, errorText.lastIndexOf('"'));
            }

            commons.OpenAlertDialog(errorText || "אירעה שגיאה בעת יצירת הלקוח");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createCustomerFailed");
        }
    };

    el_incident.setCustomerLookup = function (id, name) {
        try {
            commons.SetLookupValue("customerid", id, name, "account", commons.OnChangeBehavior.None);
            commons.SetFireOnChange("customerid");

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setCustomerLookup");
        }
    };

    el_incident.openAccount = function (primaryControl) {
        debugger;
        commons = new elad_commons();
        commons.SetFormContext(primaryControl);
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            // Existing account: original function did nothing.
            if (customer) {
                commons.SetSubmitMode("customerid", "always");
                return;
            }

            var customerName = commons.GetFieldValue("el_s_customer_name");

            var pageInput = {
                pageType: "entityrecord",
                entityName: Const.EntityLogicalName.Account || "account"
            };

            var navigationOptions = {
                target: 2,
                position: 1,
                width: {
                    value: 70,
                    unit: "%"
                },
                height: {
                    value: 80,
                    unit: "%"
                },
                title: "לקוח"
            };

            if (customerName) {
                var firstSpaceIndex = customerName.indexOf(" ");
                var firstName = customerName;
                var lastName = "";

                if (firstSpaceIndex > -1) {
                    firstName = customerName.slice(0, firstSpaceIndex);
                    lastName = customerName.slice(firstSpaceIndex + 1);
                }

                pageInput.data = {
                    el_s_first_name: firstName,
                    el_s_last_name: lastName,
                    el_s_idnumber_text: commons.GetFieldValue("el_s_idnumber"),
                    telephone1: commons.GetFieldValue("el_s_phone1") || "",
                    telephone2: commons.GetFieldValue("el_s_phone2") || "",
                    emailaddress1: commons.GetFieldValue("el_s_email") || ""
                };
            }

            return commons.NavigateTo(pageInput, navigationOptions)
                .then(function (result) {
                    if (
                        result &&
                        result.savedEntityReference &&
                        result.savedEntityReference.length > 0
                    ) {
                        var savedAccount = result.savedEntityReference[0];

                        commons.SetLookupValue(
                            "customerid",
                            commons.StripGuid(savedAccount.id),
                            savedAccount.name,
                            "account",
                            commons.OnChangeBehavior.None
                        );

                        commons.SetFireOnChange("customerid");
                    }

                    commons.GetAttribute("customerid").setSubmitMode("always");
                })
                .catch(function (error) {
                    commons.PageErrorHandler(
                        error,
                        "el_incident.openAccount"
                    );
                });

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_incident.openAccount"
            );
        }
    };

    el_incident.showCreateOrInprogressTabs = function () {
        try {
            var isCreateForm = commons.GetFormType() == Enum.FormType.Create;

            if (isCreateForm) {
                //commons.SetTabDisplayState("new_incident", "expanded");

                //commons.SetTabDisplayState("incident_details_tab", "collapsed");
                commons.ToggleTab("incident_details_tab", false);

                //commons.SetTabDisplayState("incident_inprogress", "collapsed");
                commons.ToggleTab("incident_inprogress", false);

                //commons.SetTabDisplayState("car_rental", "collapsed");
                commons.ToggleTab("car_rental", false);

                //commons.SetTabDisplayState("future_tradein", "collapsed");
                commons.ToggleTab("future_tradein", false);

                //commons.SetTabDisplayState("incident_recall", "collapsed");
                commons.ToggleTab("incident_recall", false);

                //commons.SetTabDisplayState("incident_resolution", "collapsed");
                commons.ToggleTab("incident_resolution", false);

                //commons.SetTabDisplayState("incident_old", "collapsed");
                commons.ToggleTab("incident_old", false);
            }
            else {
                //commons.SetTabDisplayState("new_incident", "collapsed");

                commons.ToggleTab("incident_details_tab", true);
                //commons.SetTabDisplayState("incident_details_tab", "collapsed");

                //commons.SetTabDisplayState("incident_inprogress", "expanded");
                commons.ToggleTab("incident_inprogress", true);

                //commons.SetTabDisplayState("incident_resolution", "collapsed");
                commons.ToggleTab("incident_resolution", true);

                if (commons.GetFieldValue("el_s_convert_created_by")) {
                    //commons.SetTabDisplayState("incident_old", "expanded");
                    commons.ToggleTab("incident_old", true);
                }
                else {
                    //commons.SetTabDisplayState("incident_old", "collapsed");
                    commons.ToggleTab("incident_old", false);
                }
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.showCreateOrInprogressTabs");
        }
    };

    el_incident.openContact = function (primaryControl) {
        debugger;
        commons = new elad_commons();
        commons.SetFormContext(primaryControl);
        try {
            var contact = commons.GetLookupFieldValue("el_id_contact");

            var pageInput = {
                pageType: "entityrecord",
                entityName: Const.EntityLogicalName.Contact
            };

            var navigationOptions = {
                target: 2,
                position: 1,
                width: {
                    value: 70,
                    unit: "%"
                },
                height: {
                    value: 80,
                    unit: "%"
                },
                title: "איש קשר"
            };

            if (contact && contact.id) {
                pageInput.entityId = commons.StripGuid(contact.id);
            }

            commons.NavigateTo(pageInput, navigationOptions)
                .then(function (result) {
                    if (
                        result &&
                        result.savedEntityReference &&
                        result.savedEntityReference.length > 0
                    ) {
                        var savedContact = result.savedEntityReference[0];

                        commons.SetLookupValue(
                            "el_id_contact",
                            savedContact.id,
                            savedContact.name,
                            Const.EntityLogicalName.Contact,
                            commons.OnChangeBehavior.None
                        );
                    }

                    commons.GetAttribute("el_id_contact")
                        .setSubmitMode("always");
                })
                .catch(function (error) {
                    commons.PageErrorHandler(
                        error,
                        "el_incident.openContact"
                    );
                });

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_incident.openContact"
            );
        }
    };

    el_incident.setContactLookup = function (id, name) {
        try {
            commons.SetLookupValue("el_id_contact", id, name, "contact", commons.OnChangeBehavior.None);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setContactLookup");
        }
    };

    el_incident.isSummaryEmpty = function () {
        try {
            var caseTypeCode = commons.GetFieldValue("casetypecode");
            var caseSummary = commons.GetFieldValue("el_s_case_summary");

            var isComplaintOrServiceInspection = caseTypeCode != null && (
                caseTypeCode == _currentEntityConsts.casetypecode.COMPLAINT ||
                caseTypeCode == _currentEntityConsts.casetypecode.SERVICE_INSPECTION ||
                caseTypeCode == _currentEntityConsts.casetypecode.CAR_RENTAL
            );

            return isComplaintOrServiceInspection && caseSummary == null;

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.isSummaryEmpty");

            return false;
        }
    };

    el_incident.isOpenActivities = function () {
        try {
            var incidentId = commons.GetCurrentEntityId();

            return commons.RetrieveMultipleRecords("activitypointer", "?$select=activityid&$filter=_regardingobjectid_value eq " + commons.StripGuid(incidentId) + " and (statecode eq 0 or statecode eq 3) and activitytypecode ne 'el_doc'").then(function (results) {

                return results && results.length > 0;

            }).catch(function (error) {

                commons.PageErrorHandler(error, "el_incident.isOpenActivities");

                return false;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.isOpenActivities");

            return Promise.resolve(false);
        }
    };
    el_incident.isNotReadyForRentalCarClosure = function () {
        try {
            var caseTypeCode = commons.GetFieldValue("casetypecode");

            if (caseTypeCode == _currentEntityConsts.casetypecode.CAR_RENTAL) {
                var rentalDaysCount = commons.GetFieldValue("el_n_rental_days_count");
                var rentEndDate = commons.GetFieldValue("el_dt_rent_end");

                return (
                    (commons.GetAttribute("el_n_rental_days_count") && !rentalDaysCount) ||
                    (commons.GetAttribute("el_dt_rent_end") && !rentEndDate)
                );
            }

            return false;

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.isNotReadyForRentalCarClosure");

            return false;
        }
    };

    el_incident.closeIncident = function (primaryControl) {
        debugger;
        commons = new elad_commons();
        commons.SetFormContext(primaryControl);
        try {
            var message = "קיימות משימות פתוחות בפניה. האם אתה בטוח שברצונך לסגור אותן?";

            el_incident.isOpenActivities().then(function (hasOpenActivities) {

                if (!hasOpenActivities) {
                    return;
                }

                var confirmStrings = {
                    text: commons.RTLString(message),
                    title: ""
                };

                var confirmOptions = {
                    height: 200,
                    width: 450
                };

                return commons.OpenConfirmDialog(confirmStrings, confirmOptions).then(function (result) {

                    if (!result.confirmed) {
                        commons.SetFocus("activities_subgrid");

                        return Promise.reject("UserCancelled");
                    }
                });

            }).then(function () {

                var isSecondarySubjectRequiredAndNull =
                    commons.GetAttribute("el_id_secondary_subject") &&
                    commons.GetAttribute("el_id_secondary_subject").getRequiredLevel() == "required" &&
                    commons.GetFieldValue("el_id_secondary_subject") == null;

                var resolutionType = commons.GetFieldValue("el_l_solution_type");

                return el_incident.isBenefitAndLicenseNotVerified().then(function (isBenefitLicenseNotVerified) {

                    var isSummaryEmpty = el_incident.isSummaryEmpty();

                    var isResolutionTypeNull = resolutionType == null;

                    var isNotReadyForRentalCarClosure =
                        el_incident.isNotReadyForRentalCarClosure();

                    if (
                        isBenefitLicenseNotVerified ||
                        isSummaryEmpty ||
                        isResolutionTypeNull ||
                        isNotReadyForRentalCarClosure
                    ) {

                        commons.OpenAlertDialog(
                            el_incident.closeIncidentAlert(
                                isBenefitLicenseNotVerified,
                                isSummaryEmpty,
                                isResolutionTypeNull,
                                isNotReadyForRentalCarClosure
                            )
                        );

                        /*commons.SetTabDisplayState(
                            "incident_resolution",
                            "expanded"
                        );*/

                        commons.SetFocus(
                            "el_l_solution_type"
                        );

                        return;
                    }

                    if (isSecondarySubjectRequiredAndNull) {
                        commons.SetFocus("el_id_secondary_subject");

                        return;
                    }

                    if (commons.GetFieldValue("subjectid") == null) {
                        commons.SetFocus("subjectid");

                        return;
                    }

                    commons.Save();

                    var incidentId = commons.GetCurrentEntityId();

                    el_incident.CloseIncidentRequest(
                        incidentId,
                        resolutionType
                    );
                });

            }).catch(function (error) {

                if (error == "UserCancelled") {
                    return;
                }

                commons.PageErrorHandler(
                    error,
                    "el_incident.closeIncident"
                );
            });

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_incident.closeIncident"
            );
        }
    };

    el_incident.closeIncidentAlert = function (
        isBenefitLicenseNotVerified,
        isSummaryEmpty,
        isResolutionTypeNull,
        isNotReadyForRentalCarClosure
    ) {
        try {
            var message = "";

            if (isBenefitLicenseNotVerified) {
                message +=
                    _Hebrow.CannotCloseWithCompensationWhenLicenseNotVerified +
                    "\n";
            }

            if (isSummaryEmpty) {
                message +=
                    _Hebrow.SummaryFieldIsAMandatoryField +
                    "\n";
            }

            if (isResolutionTypeNull) {
                message +=
                    _Hebrow.MostChooseASolutionType +
                    "\n";
            }

            if (isNotReadyForRentalCarClosure) {
                message +=
                    _Hebrow.ItIsMandatoryToFillInTheRentalEndDateAndTheNumberOfRentalays +
                    "\n";
            }

            return message;

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_incident.closeIncidentAlert"
            );

            return "";
        }
    };
    el_incident.successCallback = function () {
        try {
            commons.RefreshForm();

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.successCallback");
        }
    };

    /*el_incident.CloseIncidentRequest = function (incidentId, resolutionTypeValue) {
        debugger;
        try {
            var statusCodeText = commons.GetAttribute("statuscode").getText();

            var actionFailedCallback = Mscrm.InternalUtilities.DialogUtility.actionFailedCallbackForMoca;

            var fieldsMetadata = {};
            var fieldsValues = {};
            var changedFields = [];

            fieldsMetadata["incidentid"] = 6;
            fieldsValues["incidentid"] = new Xrm.Objects.EntityReference("incident", new Microsoft.Crm.Client.Core.Framework.Guid(incidentId));
            changedFields.push("incidentid");

            fieldsMetadata["timespent"] = 5;
            fieldsValues["timespent"] = 15;
            changedFields.push("timespent");

            fieldsMetadata["description"] = 14;
            fieldsValues["description"] = "";
            changedFields.push("description");

            fieldsMetadata["subject"] = 14;
            fieldsValues["subject"] = statusCodeText || "";
            changedFields.push("subject");

            var incidentResolutionReference = new Xrm.Objects.EntityReference("incidentresolution", Microsoft.Crm.Client.Core.Framework.Guid.get_empty());

            var incidentResolution = new Microsoft.Crm.Client.Core.Storage.Common.ObjectModel.EntityRecord(
                incidentResolutionReference,
                fieldsValues,
                fieldsMetadata,
                {},
                {},
                new Microsoft.Crm.Client.Core.Storage.Common.ObjectModel.RelatedEntityCollection([])
            );

            incidentResolution.get_changedFieldNames().addRange(changedFields);

            Xrm.Internal.messages.closeIncident(incidentResolution, resolutionTypeValue).then(
                el_incident.successCallback,
                actionFailedCallback
            );

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.CloseIncidentRequest");
        }
    };*/

    el_incident.CloseIncidentRequest = function (incidentId, resolutionTypeValue) {
        debugger;
        try {
            incidentId = incidentId.replace(/[{}]/g, "");

            var statusAttribute = commons.GetAttribute("statuscode");
            var statusCodeText = statusAttribute
                ? statusAttribute.getText()
                : "";

            var request = {
                IncidentResolution: {
                    "@odata.type": "Microsoft.Dynamics.CRM.incidentresolution",
                    subject: statusCodeText || "",
                    description: "",
                    timespent: 15,
                    "incidentid@odata.bind": "/incidents(" + incidentId + ")"
                },

                Status: resolutionTypeValue,

                getMetadata: function () {
                    return {
                        boundParameter: null,
                        parameterTypes: {
                            IncidentResolution: {
                                typeName: "mscrm.incidentresolution",
                                structuralProperty: 5
                            },
                            Status: {
                                typeName: "Edm.Int32",
                                structuralProperty: 1
                            }
                        },
                        operationType: 0,
                        operationName: "CloseIncident"
                    };
                }
            };

            return Xrm.WebApi.online.execute(request).then(
                function (response) {
                    if (!response.ok) {
                        throw new Error(
                            "CloseIncident failed. HTTP status: " + response.status
                        );
                    }

                    return el_incident.successCallback(response);
                }
            ).catch(function (error) {
                commons.PageErrorHandler(
                    error,
                    "el_incident.CloseIncidentRequest"
                );

                throw error;
            });

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_incident.CloseIncidentRequest"
            );

            return Promise.reject(error);
        }
    };

    el_incident.setCarHolderLookupAndRequired = function (id, name, isCarHolderUpdateRequired) {
        try {
            commons.SetLookupValue("el_id_carholder", id, name, "el_carholder", commons.OnChangeBehavior.None);

            commons.SetFieldValue("el_b_show_car_holder", isCarHolderUpdateRequired, commons.OnChangeBehavior.None);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.setCarHolderLookupAndRequired");
        }
    };

    el_incident.openCarStatusInOpenLegacy = function (primaryControl) {
        commons = new elad_commons();
        commons.SetFormContext(primaryControl);
        try {
            var car = commons.GetLookupFieldValue("el_id_car");

            if (car && car.name) {
                commons.showOpenLegacyRibbon(Const.OpenLegacyUrl.carStatusUrl, null, null, null);

                return;
            }

            commons.OpenAlertDialog(_Hebrow.TheVehicleFieldMustBeFilledInToViewAVehicleImage);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.openCarStatusInOpenLegacy");
        }
    };
    el_incident.createBenefitInOpenLegacy = function (primaryControl) {
        commons = new elad_commons();
        commons.SetFormContext(primaryControl);
        try {
            commons.showOpenLegacyRibbon(Const.OpenLegacyUrl.benefitUrl, "customerid", null, null);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createBenefitInOpenLegacy");
        }
    };

    el_incident.AddRental = function () {
        try {
            var incidentType = commons.GetFieldValue("casetypecode");

            if (
                incidentType !=
                Enum.incident.IncidentType.CAR_RENTAL
            ) {
                commons.OpenAlertDialog(
                    "ניתן להוסיף השכרת רכב לפניות מסוג השכרת רכב בלבד."
                );

                return;
            }

            var incidentId = commons.StripGuid(
                commons.GetCurrentEntityId()
            );

            var car =
                commons.GetLookupFieldValue("el_id_car");

            var customer =
                commons.GetLookupFieldValue("customerid");

            var pageInput = {
                pageType: "entityrecord",
                entityName: "el_car_rental",
                createFromEntity: {
                    entityType: "incident",
                    id: incidentId,
                    name: commons.GetFieldValue("title") || ""
                },
                data: {}
            };

            var navigationOptions = {
                target: 2,
                position: 1,
                width: 1000,
                height: 600,
                title: "השכרת רכב"
            };

            var recordNameParts = [];

            if (car && car.id && car.name) {
                pageInput.data.el_id_car =
                    commons.StripGuid(car.id);

                pageInput.data.el_id_carname =
                    car.name;

                recordNameParts.push(car.name);
            }

            if (customer && customer.name) {
                pageInput.data.el_s_customer_name =
                    customer.name;

                recordNameParts.push(customer.name);
            }

            var openRentalForm = function () {
                pageInput.data.el_name =
                    recordNameParts.join(" ");

                return commons.NavigateTo(
                    pageInput,
                    navigationOptions
                );
            };

            if (!car || !car.id) {
                return openRentalForm()
                    .catch(function (error) {
                        commons.PageErrorHandler(
                            error,
                            "el_incident.AddRental"
                        );
                    });
            }

            return commons.RetrieveRecord(
                "el_car",
                commons.StripGuid(car.id),
                "?$select=_el_id_model_value" +
                "&$expand=el_id_model($select=el_name)"
            ).then(function (carResult) {

                if (
                    carResult &&
                    carResult._el_id_model_value &&
                    carResult.el_id_model
                ) {
                    pageInput.data.el_id_model =
                        commons.StripGuid(
                            carResult._el_id_model_value
                        );

                    pageInput.data.el_id_modelname =
                        carResult.el_id_model.el_name;
                }

                return openRentalForm();

            }).catch(function (error) {
                commons.PageErrorHandler(
                    error,
                    "el_incident.AddRental"
                );
            });

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_incident.AddRental"
            );
        }
    };

    el_incident.dialCustomer = async function () {
        debugger;
        try {
            var isIvrCallEnabled = commons.GetFieldValue("el_b_ivr_call");

            if (commons.GetAttribute("el_b_ivr_call") && !isIvrCallEnabled) {
                return;
            }

            var extension = await el_incident.getUserExtension();

            if (!extension) {
                commons.OpenAlertDialog("לא קיימת שלוחה למשתמש. פנה למנהל מערכת");

                return;
            }

            var accountPhone = await el_incident.getAccountPhone();

            if (!accountPhone) {
                commons.OpenAlertDialog("טלפון לקוח לא מעודכן. פנה למנהל מערכת");

                return;
            }

            var url = await commons.GetGlobalParameterValueByName(Const.OpenLegacyUrl.clickToDialUrl);

            url += "clid=" + accountPhone + "&ext=" + extension;

            representativeHasExtension = true;

            var win = commons.openUrl(url);

            setTimeout(el_incident.closeWindow, 1000, win);

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.dialCustomer");
        }
    };
    el_incident.closeWindow = function () {
        try {
            commons.ClosePage();

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.closeWindow");
        }
    };

    el_incident.getUserExtension = function () {
        try {
            var userId = commons.GetCurrentUserId();

            return commons.RetrieveRecord("systemuser", commons.StripGuid(userId), "?$select=el_n_extension").then(function (user) {

                if (user && user.el_n_extension) {
                    return user.el_n_extension;
                }

                return null;

            }).catch(function (error) {

                commons.PageErrorHandler(error, "el_incident.getUserExtension");

                return null;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.getUserExtension");

            return Promise.resolve(null);
        }
    };

    el_incident.getAccountPhone = function () {
        try {
            var customer = commons.GetLookupFieldValue("customerid");

            if (!customer || !customer.id || !customer.entityType) {
                return Promise.resolve(null);
            }

            return commons.RetrieveRecord(
                customer.entityType,
                commons.StripGuid(customer.id),
                "?$select=telephone1"
            ).then(function (result) {

                if (result && result.telephone1) {
                    return result.telephone1;
                }

                return null;

            }).catch(function (error) {

                commons.PageErrorHandler(error, "el_incident.getAccountPhone");

                return null;
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.getAccountPhone");

            return Promise.resolve(null);
        }
    };

    el_incident.createTelephoneExchCall = async function (primaryControl) {
        commons = new elad_commons();
        commons.SetFormContext(primaryControl);
        try {
            /*
             * שיחת מרכזיה
             */

            representativeHasExtension = false;

            await el_incident.dialCustomer();

            if (representativeHasExtension) {
                setTimeout(el_incident.openPhonecallForm, 2000);
            }

        } catch (error) {
            commons.PageErrorHandler(error, "el_incident.createTelephoneExchCall");
        }
    };

    el_incident.openPhonecallForm = function () {
        try {
            var incidentId = commons.StripGuid(
                commons.GetCurrentEntityId()
            );

            var incidentName =
                commons.GetFieldValue("title") || "";

            var customer =
                commons.GetLookupFieldValue("customerid");

            var pageInput = {
                pageType: "entityrecord",
                entityName: "phonecall",
                data: {
                    
                }
            };

            if (customer && customer.id) {
                pageInput.data.el_id_account =
                    commons.StripGuid(customer.id);

                pageInput.data.el_id_accountname =
                    customer.name || "";

                pageInput.data.el_id_accounttype =
                    "account";
            }

            var navigationOptions = {
                target: 2,
                position: 1,
                width: 1000,
                height: 600,
                title: "שיחת טלפון"
            };

            return commons.NavigateTo(
                pageInput,
                navigationOptions
            ).catch(function (error) {
                commons.PageErrorHandler(
                    error,
                    "el_incident.openPhonecallForm"
                );
            });

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_incident.openPhonecallForm"
            );
        }
    };
    // =========================
    // Ribbon Commands
    // =========================

    el_incident.Ribbon = {};

    el_incident.Ribbon.function1 = function () {
    };

    el_incident.Ribbon.function2 = function (primaryControl, agreementType) {
    };

    el_incident.Ribbon.function3 = function (primaryControl) {
    };

    el_incident.CreateOutgoingWhatsappConversationByChannel = function (primaryControl, channelName, entityName) {
        commons = new elad_commons();
        commons.SetFormContext(primaryControl);
        return commons.CreateOutgoingWhatsappConversationByChannel(channelName, entityName);
    }

    el_incident.AddFileRibbon = function (primaryControl) {
        debugger;
        commons = new elad_commons();
        commons.SetFormContext(primaryControl);

        var name;

        if (commons.GetFieldValue("name") != null)
            name = commons.GetFieldValue("name");
        else if (commons.GetFieldValue("el_name") != null)
            name = commons.GetFieldValue("el_name");
        else if (commons.GetFieldValue("title") != null)
            name = commons.GetFieldValue("title");
        else
            name = commons.GetCurrentEntityName();

        var pageInput = {
            pageType: "entityrecord",
            entityName: "el_doc",
            createFromEntity: {
                entityType: commons.GetCurrentEntityName(),
                id: commons.StripGuid(commons.GetCurrentEntityId()),
                name: name
            },
            data: {
            }
        };

        var navigationOptions = {
            target: 2,
            position: 1,
            width: {
                value: 70,
                unit: "%"
            },
            height: {
                value: 80,
                unit: "%"
            },
            title: "מסמך"
        };

        return commons.NavigateTo(pageInput, navigationOptions)
            .catch(function (error) {
                commons.PageErrorHandler(error, "el_incident.AddFileRibbon");
            });
    };

    // =========================
    // Ribbon Enable Rules
    // =========================

    el_incident.Ribbon.EnableRules = {};

    el_incident.Ribbon.EnableRules.enableRule1 = async function (primaryControl) {
    };

    el_incident.Ribbon.EnableRules.enableRule2 = async function (primaryControl) {
    };

    // =========================
    // Private Functions
    // =========================

    async function privatFunction1() {
    }

})(window.el_incident = window.el_incident || {});