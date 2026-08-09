(function (el_tradein_offer) {

    var TRADEIN_WAITING_FOR_QUOTE = 2;
    var TRADEIN_FIRST_OFFER = 3;
    var TRADEIN_WAITING_FOR_LAST_OFFER = 4;
    var TRADEIN_LAST_OFFER = 5;
    var TRADEIN_DEAL_COMPLETED = 6;
    var TRADEIN_IS_BMW_FALSE = 2;
    var TOPTRADE_FACTOR = 1;
    var BPS_FACTOR = 2;


    var commons;
    var isQuickCreateForm = false;

    el_tradein_offer.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_tradein_offer.onLoadEvents();

            el_tradein_offer.onChange();

            el_tradein_offer.onSave();

        } catch (error) {
            commons.PageErrorHandler(error, "el_tradein_offer.onLoad");
        }
    }

    el_tradein_offer.onLoadEvents = function () {
        el_tradein_offer.setFormCreateType();
        el_tradein_offer.updateTradeInFactor();
        el_tradein_offer.setModelAndManufacturerFields();
        el_tradein_offer.setMazdaFordLicenseExpiryDateField();
        el_tradein_offer.onFormTypeLogic();
    }

    el_tradein_offer.onloadQuickCreateFrom = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_tradein_offer.qickFormOnloadEvents();

        } catch (error) {
            commons.SetFormNotification("ERROR on el_tradein_offer.onloadQuickCreateFrom(): " + error.message, commons.FormNotificationLevel.ERROR, "el_tradein_offer.onloadQuickCreateFrom");
            console.error(error);
        }
    }


    el_tradein_offer.qickFormOnloadEvents = function () {
        resizeQuickCreateForm();
        //Part of task 1560 - car licenses fields maping
        commons.SetRequiredLevel("el_s_managed_licence_plate", "required");
        commons.SetRequiredLevel(["el_id_competitor", "el_id_global_model", "el_s_manufacturer", "el_s_model", "el_l_trade_in_factor",
            "el_s_tr_manuf_year", "el_s_tr_engine_volume", "el_s_doors", "el_l_transmission_type", "el_s_tr_number_of_owners", "el_l_owner_type",
            "el_s_tr_distance", "el_s_tr_car_color", "el_s_tr_accessories", "el_l_tr_accident", "el_l_is_bmw", "el_dt_license_expiry_date"], "none");
    }

    el_tradein_offer.onChange = function () {
        commons.AddOnChange("el_s_manufacturer", el_tradein_offer.updateMainField);
        commons.AddOnChange("el_s_model", el_tradein_offer.updateMainField);
        commons.AddOnChange("el_id_competitor", el_tradein_offer.updateMainField);
        commons.AddOnChange("el_id_global_model", el_tradein_offer.updateMainField);
        commons.AddOnChange("el_id_opportunity", el_tradein_offer.updateTradeInFactor);
        commons.AddOnChange("el_s_tr_number_of_owners", el_tradein_offer.testValidationOfFieldNumberOfOwners);
        commons.AddOnChange("el_b_model_not_exist", el_tradein_offer.setModelAndManufacturerFields);

        if (commons.GetFormType() != Enum.FormType.Create) {
            commons.AddOnChange("el_l_tradein_offer_status", el_tradein_offer.initializeTradeinStatus);
            commons.AddOnChange("el_n_pricelist_price", el_tradein_offer.initializeTradeinStatus);
            commons.AddOnChange("el_s_tr_pricelist_price", el_tradein_offer.initializeTradeinStatus);
            commons.AddOnChange("el_n_bid", el_tradein_offer.initializeTradeinStatus);
            commons.AddOnChange("el_s_tr_bid", el_tradein_offer.initializeTradeinStatus);
            commons.AddOnChange("el_dt_tradein_quot", el_tradein_offer.initializeTradeinStatus);
            commons.AddOnChange("el_n_final_bid", el_tradein_offer.initializeTradeinStatus);
            commons.AddOnChange("el_s_final_bid_notes", el_tradein_offer.initializeTradeinStatus);
            commons.AddOnChange("el_dt_final_bid_date", el_tradein_offer.initializeTradeinStatus);
        }
    }

    el_tradein_offer.onSave = function () {
        if (commons.GetFormType() != Enum.FormType.Create) {
            commons.AddOnSave(el_tradein_offer.preventSavingWrongTradeinStatus);
            commons.AddOnSave(el_tradein_offer.testValidationOfFieldNumberOfOwners);
        }
    }

    el_tradein_offer.initializeTradeinStatus = function () {
        commons.ClearNotification("el_l_tradein_offer_status");
    }

    el_tradein_offer.setAccount = function () {
        el_tradein_offer.getSalesProcessAccount()
            .then(
                function success(result) {
                    if (result && result.id) {
                        commons.SetLookupValue("el_id_account", result.id, result.entityName, Enum.EntityLogicalName.Account);
                        commons.SetSubmitMode("el_id_account", "always")
                    }
                }
            )


    }

    //To Check
    el_tradein_offer.updateTradeInFactor = async function () {
        commons.PageClearMessages("el_tradein_offer.updateTradeInFactor");
        var opportunityId = commons.GetLookupId("el_id_opportunity");
        if (opportunityId) {
            try {
                const oppResult = await commons.RetrieveRecord(Enum.EntityLogicalName.Opportunity, opportunityId, "?$select=el_id_manufacturer");
                // var url = "OpportunitySet?$select=el_id_manufacturer&$filter=OpportunityId eq guid'" + opportunityId + "'";
                // result = odatautil.RetrieveDataByUrl("", url, null, null, true);
                if (oppResult && oppResult._el_id_manufacturer_value) {
                    const manufResult = await commons.RetrieveRecord("el_manufacturer", oppResult._el_id_manufacturer_value, "?$select=el_name");
                    // var url = "el_manufacturerSet?$select=el_name&$filter=el_manufacturerId eq guid'" + result.results[0].el_id_manufacturer.Id + "'";
                    // result = odatautil.RetrieveDataByUrl("", url, null, null, true);

                    if (manufResult && manufResult.el_name) {

                        switch (manufResult.el_name) {
                            case 'NIO':
                            case 'BMW':
                            case 'BMC':
                                commons.SetFieldValue("el_l_trade_in_factor", BPS_FACTOR);
                                break;

                            case 'MAZDA':
                            case 'FORD':
                                commons.SetFieldValue("el_l_trade_in_factor", TOPTRADE_FACTOR);
                                break;

                            default:
                                break;
                        }
                    }
                }
            } catch (err) {
                console.error(err)
                commons.SetFormNotification("Error on el_tradein_offer.updateTradeInFactor(): " + err.message, commons.FormNotificationLevel.ERROR, "el_tradein_offer.updateTradeInFactor");
            }
        }
    }

    //To Check
    el_tradein_offer.setAccountFields = function () {
        commons.PageClearMessages("el_tradein_offer.setAccountFields");
        var accountId = commons.GetLookupId("el_id_account");
        if (accountId) {

            var url = "AccountSet?$select=Name,Telephone2,Telephone1&$filter=AccountId eq guid'" + accountId + "'";
            var result = odatautil.RetrieveDataByUrl("", url, null, null, true);

            commons.RetrieveRecord(Enum.EntityLogicalName.Account, accountId, "?$select=Name,Telephone2,Telephone1")
                .then(
                    function success(reult) {
                        if (result) {
                            if (result.name && result.name != commons.GetFieldValue("el_s_customer_name"))
                                commons.SetFieldValue("el_s_customer_name", result.tame);
                            if (result.telephone1 && result.telephone1 != commons.GetFieldValue("el_s_mobile_phone"))
                                commons.SetFieldValue("el_s_mobile_phone", result.telephone1);
                            if (result.telephone2 && result.telephone2 != commons.GetFieldValue("el_s_additional_phone"))
                                commons.SetFieldValue("el_s_additional_phone", result.telephone2);
                        }
                    },
                    err => {
                        console.error("Error on retrieve 'account' into el_tradein_offer.setAccountFields: ", err);
                        commons.SetFormNotification("Error on retrieve 'account' into el_tradein_offer.setAccountFields: " + err.message, commons.FormNotificationLevel.ERROR, "el_tradein_offer.setAccountFields");
                    }
                )
        }
    }

    el_tradein_offer.setTradeinStatus = function () {
        //el_l_tradein_offer_status = 2 (waiting for tradein offer)
        el_tradein_offer.isOpportunityForBMW()
            .then(
                function success(result) {
                    if (result && result === false && commons.GetFieldValue("el_l_tradein_offer_status") !== TRADEIN_WAITING_FOR_QUOTE) {
                        commons.SetFieldValue("el_l_tradein_offer_status", TRADEIN_WAITING_FOR_QUOTE);
                        commons.SetSubmitMode("el_l_tradein_offer_status", "always");
                    }
                },
            )
    }

    el_tradein_offer.updateMainField = function () {
        const competitorName = commons.GetLookupName("el_id_competitor");
        const globalModelName = commons.GetLookupName("el_id_global_model");

        var manufacturer, model
        //manufacturer
        if (competitorName) {
            manufacturer = competitorName;
            commons.SetFieldValue("el_s_manufacturer", manufacturer);
        }
        else
            manufacturer = commons.GetFieldValue("el_s_manufacturer") ? commons.GetFieldValue("el_s_manufacturer") : '';

        //model
        if (globalModelName) {
            model = globalModelName;
            commons.SetFieldValue("el_s_model", model);
        }
        else
            model = commons.GetFieldValue("el_s_model") ? commons.GetFieldValue("el_s_model") : '';

        commons.SetFieldValue("el_name", (manufacturer ? manufacturer + ' ' : "") + (model ? model : ""));
    }

    el_tradein_offer.setMazdaFordLicenseExpiryDateField = async function () {
        try {
            const opportunityId = commons.GetLookupId("el_id_opportunity");

            if (opportunityId) {
                // var url = "OpportunitySet?$select=el_id_family&$filter=OpportunityId eq guid'" + opportunityId + "'";
                // result = odatautil.RetrieveDataByUrl("", url, null, null, true);
                const oppResult = await commons.RetrieveRecord(Enum.EntityLogicalName.Opportunity, opportunityId, "?$select=el_id_family")

                if (oppResult) {
                    // var url = "el_familySet?$select=el_id_manufacturer&$filter=el_familyId eq guid'" + result.results[0].el_id_family.Id + "'";
                    // result = odatautil.RetrieveDataByUrl("", url, null, null, true);
                    const familyResult = await commons.RetrieveRecord("el_family", oppResult._el_id_family_value, "?$select=el_id_manufacturer");

                    if (familyResult) {
                        var url = "el_manufacturerSet?$select=el_name&$filter=el_manufacturerId eq guid'" + result.results[0].el_id_manufacturer.Id + "'";
                        result = odatautil.RetrieveDataByUrl("", url, null, null, true);
                        const manufResult = await commons.RetrieveRecord("el_manufacturer", familyResult._el_id_manufacturer_value, "?$select=el_name");
                        if (manufResult && manufResult.el_name) {
                            switch (manufResult.el_name) {
                                case "FORD":
                                case "MAZDA":
                                case "NIO":
                                case "DONGFENG":
                                    el_tradein_offer.updateMandatoryExpiryDateField(true);
                                    break;

                                default:
                                    el_tradein_offer.updateMandatoryExpiryDateField(false);
                                    break;
                            }
                        }
                    }
                    else {
                        el_tradein_offer.updateMandatoryExpiryDateField(false);
                    }
                }
                else {
                    if (commons.GetFieldValue("el_dt_license_expiry_date"))
                        commons.SetVisible("el_dt_license_expiry_date", true);
                    else
                        commons.SetVisible("el_dt_license_expiry_date", false);
                }
            }
        } catch (error) {
            console.error("Error into el_tradein_offer.setMazdaFordLicenseExpiryDateField: ", error);
            commons.SetFormNotification("Error into el_tradein_offer.setMazdaFordLicenseExpiryDateField: " + error.message, commons.FormNotificationLevel.ERROR, "el_tradein_offer.setMazdaFordLicenseExpiryDateField")
        }
    }

    el_tradein_offer.updateMandatoryExpiryDateField = function (trueFalse) {
        if (trueFalse) {
            commons.SetRequiredLevel("el_dt_license_expiry_date", "required");
        }
        else {
            commons.SetRequiredLevel("el_dt_license_expiry_date", "none");
        }
        commons.SetVisible("el_dt_license_expiry_date", trueFalse);
    }

    el_tradein_offer.setModelAndManufacturerFields = function () {
        if (el_tradein_offer.isOpportunityForBMW()) {
            commons.SetRequiredLevel("el_id_competitor", "none");
            commons.SetRequiredLevel("el_id_global_model", "none");
            commons.SetVisible("el_id_competitor", false);
            commons.SetVisible("el_id_global_model", false);
            commons.SetVisible("el_b_model_not_exist", false);
        }
        else {
            commons.SetVisible("el_s_manufacturer", false);
            commons.SetRequiredLevel("el_s_manufacturer", "none");
            commons.SetRequiredLevel("el_id_competitor", "required");

            if (commons.GetFieldValue("el_b_model_not_exist")) {
                commons.SetRequiredLevel("el_s_model", "required");
                commons.SetRequiredLevel("el_id_global_model", "none");
                commons.SetFieldValue("el_id_global_model", null);
                commons.SetVisible("el_id_global_model", false);
                commons.SetVisible("el_s_model", true);
            }
            else {
                commons.SetRequiredLevel("el_s_model", "none");
                commons.SetRequiredLevel("el_id_global_model", "required");
                commons.SetVisible("el_id_global_model", true);
                commons.SetVisible("el_s_model", false);
            }
        }
    }

    el_tradein_offer.setFieldsByManufacturer = function () {

        el_tradein_offer.isOpportunityForBMW()
            .then(
                function success(result) {
                    if (result && result === true) {
                        commons.SetRequiredLevel("el_l_is_bmw", "required");
                    }
                    else {
                        commons.SetRequiredLevel("el_l_is_bmw", "none");
                        commons.SetFieldValue("el_l_is_bmw", TRADEIN_IS_BMW_FALSE);
                    }
                })
    }

    el_tradein_offer.preventSavingWrongTradeinStatus = function (Context) {
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(Context);
        }
        commons.ClearNotification("el_l_tradein_offer_status", "el_l_tradein_offer_status_preventSavingWrongTradeinStatus")

        const preventSave = false;
        const msg = "";
        const el_l_tradein_offer_status = commons.GetFieldValue("el_l_tradein_offer_status");

        switch (el_l_tradein_offer_status) {
            case TRADEIN_FIRST_OFFER:
            case TRADEIN_WAITING_FOR_LAST_OFFER:
                if (!commons.GetFieldValue("el_dt_tradein_quot") ||
                    (!commons.GetFieldValue("el_n_bid") && !commons.GetFieldValue("el_s_tr_bid"))
                    || (!commons.GetFieldValue("el_n_pricelist_price") && !commons.GetFieldValue("el_s_tr_pricelist_price"))) {
                    msg = 'יש למלא שדה "תאריך הצעה";\n אחד השדות: "הצעת מחיר", "הערות להצעת מחיר";\n ואחד השדות: "מחיר מחירון","הערות למחיר מחירון"';
                    preventSave = true;
                }
                break;
            case TRADEIN_LAST_OFFER:
            case TRADEIN_DEAL_COMPLETED:
                if (!commons.GetFieldValue("el_dt_final_bid_date") || (!commons.GetFieldValue("el_n_final_bid") && !commons.GetFieldValue("el_s_final_bid_notes"))
                    || (!commons.GetFieldValue("el_n_pricelist_price") && !commons.GetFieldValue("el_s_tr_pricelist_price"))) {
                    msg = ' יש למלא שדה "תאריך הצעה סופית";\n אחד השדות: "הצעת מחיר סופית", "הערות להצעת מחיר סופית";\n ואחד השדות: "מחיר מחירון","הערות למחיר מחירון"';
                    preventSave = true;
                }
                break;
        }


        if (preventSave) {
            commons.OpenAlertDialog(msg);
            Context.getEventArgs().preventDefault();

            commons.SetFocus("el_l_tradein_offer_status");
            commons.SetNotification("el_l_tradein_offer_status", msg, "el_l_tradein_offer_status_preventSavingWrongTradeinStatus");
        }
    }

    el_tradein_offer.updateRecordUrlField = function () {
        if (commons.GetAttribute("el_s_record_url")) {

            // var orgURL = Xrm.Page.context.getClientUrl();
            // var recordId = Xrm.Page.data.entity.getId().replace("{", "").replace("}", "");
            // var entityName = Xrm.Page.data.entity.getEntityName();

            // var objectTypeCode = 10053;

            // var recordURL = orgURL + "/main.aspx?etc=" + objectTypeCode +
            //     "&id=%7b" + recordId + "%7d&pagetype=entityrecord";

            const recordUrl = `${commons.getGlobalContext().getCurrentAppUrl()}&pagetype=entityrecord&etn=${commons.GetCurrentEntityName()}&id=${commons.StripGuid(commons.GetCurrentEntityId())}`;
            commons.SetFieldValue("el_s_record_url", recordUrl);
        }
    }

    el_tradein_offer.isOpportunityForBMW = function () {
        commons.PageClearMessages("el_tradein_offer.isOpportunityForBMW");

        return new Promise((resolve, reject) => {
            if (commons.GetLookupId("el_id_opportunity_tradein")) {
                commons.SetRequiredLevel("el_id_opportunity", "none");
                resolve(true);
            }

            const opportunityId = commons.GetLookupId("el_id_opportunity");
            if (opportunityId) {
                // var url = "OpportunitySet?$select=el_l_manufacturers&$filter=OpportunityId eq guid'" + opportunityId + "'";
                // var opportunity = odatautil.RetrieveDataByUrl("", url, null, null, true);
                commons.RetrieveRecord(Enum.EntityLogicalName.Opportunity, opportunityId, "?$select=el_l_manufacturers")
                    .then(
                        function success(result) {
                            if (result && result.el_l_manufacturers && result.el_l_manufacturers.Value) {
                                resolve(result.el_l_manufacturers.Value === 1)
                            }
                        },
                        err => {
                            console.error("Error on retrieving Opportunity into el_tradein_offer.isOpportunityForBMW: ", err);
                            commons.SetFormNotification("Error on retrieving Opportunity into el_tradein_offer.isOpportunityForBMW: " + err.message, commons.FormNotificationLevel.ERROR, "el_tradein_offer.isOpportunityForBMW")
                            reject(err);
                        }
                    )
            }
            resolve(false);
        })
    }

    /**
     * Checks to see if the current user is a member of a team with the passed in name.
     * @param {String} teamName Represending a name of the team to check if the user is a memer of
     * @returns true if user is a member
     */
    //To Check -> Retrieving and variables using
    el_tradein_offer.userHasTeam = function (teamName) {

        return new Promise((resolve, reject) => {
            try {
                if (teamName) {
                    commons.RetrieveMultipleRecords("team", commons.Query("name,teamid", `(name eq ${teamName})`), null, true)
                        .then(
                            function success(teamRetrieveResults) {
                                if (teamRetrieveResults && teamRetrieveResults.length > 0) {
                                    // iterate through all of the matching teams, checking to see if the current user has a membership
                                    for (let teamCounter = 0; teamCounter < teamRetrieveResults.length; teamCounter++) {
                                        const teamId = teamRetrieveResults[teamCounter].teamid;

                                        // get current user teams
                                        el_tradein_offer.getUserTeams(teamId)
                                            .then(
                                                currentUserTeamsResults => {

                                                    // Check whether current user teams matches the target team
                                                    if (currentUserTeamsResults != null) {
                                                        for (let i = 0; i < currentUserTeamsResults.length; i++) {
                                                            let userTeam = currentUserTeamsResults[i];

                                                            // check to see if the team guid matches the user team membership id
                                                            if (el_tradein_offer.guidsAreEqual(userTeam.teamid, teamId)) {
                                                                resolve(true);
                                                            }
                                                        }
                                                    } else {
                                                        resolve(false);
                                                    }
                                                },
                                                err => resolve(false)
                                            )
                                    }
                                }
                                else {
                                    commons.OpenAlertDialog("Team with name '" + teamName + "' not found");
                                    resolve(false);
                                }
                            },
                            err => {
                                console.error("Error on retrieve 'team' into el_tradein_offer.userHasTeam: ", err);
                                commons.SetFormNotification("Error on retrieve 'team' into el_tradein_offer.userHasTeam: " + err.message, Enum.FormNotificationLevel.ERROR, "el_tradein_offer.userHasTeam")
                                resolve(false)
                            }
                        )
                }
                else {
                    commons.OpenAlertDialog("No team name passed");
                    resolve(false)
                }
            } catch (error) {
                console.error("Error into el_tradein_offer.userHasTeam(): ", error);
                resolve(false);
            }
        })

        // if (teamName) {

        //     // build endpoint URL
        //     var serverUrl = Xrm.Page.context.getServerUrl();
        //     var oDataEndpointUrl = serverUrl + "/XRMServices/2011/OrganizationData.svc/";
        //     // query to get the teams that match the name
        //     oDataEndpointUrl += "TeamSet?$select=Name,TeamId&$filter=Name eq '" + teamName + "'";

        //     var service = el_tradein_offer.getRequestObject();
        //     if (service != null) {
        //         // execute the request
        //         service.open("GET", oDataEndpointUrl, false);
        //         service.setRequestHeader("X-Requested-Width", "XMLHttpRequest");
        //         service.setRequestHeader("Accept", "application/json,text/javascript, */*");
        //         service.send(null);
        //         // parse the results
        //         var requestResults = eval('(' + service.responseText + ')').d;
        //         if (requestResults != null && requestResults.results.length > 0) {
        //             var teamCounter;
        //             // iterate through all of the matching teams, checking to see if the current user has a membership
        //             for (teamCounter = 0; teamCounter < requestResults.results.length; teamCounter++) {
        //                 var team = requestResults.results[teamCounter];
        //                 var teamId = team.TeamId;
        //                 // get current user teams
        //                 var currentUserTeams = await el_tradein_offer.getUserTeams(teamId);
        //                 // Check whether current user teams matches the target team
        //                 if (currentUserTeams != null) {
        //                     for (var i = 0; i < currentUserTeams.length; i++) {
        //                         var userTeam = currentUserTeams[i];
        //                         // check to see if the team guid matches the user team membership id
        //                         if (el_tradein_offer.guidsAreEqual(userTeam.TeamId, teamId)) {
        //                             return true;
        //                         }
        //                     }
        //                 } else {
        //                     return false;
        //                 }
        //             }
        //         } else {
        //             alert("Team with name '" + teamName + "' not found");
        //             return false;
        //         }
        //         return false;
        //     }
        // } else {
        //     alert("No team name passed");
        //     return false;
        // }
    }

    //To Check -> Retrieving and variables using
    el_tradein_offer.getUserTeams = function (teamToCheckId) {
        return new Promise((resolve, reject) => {
            try {
                // gets the current users team membership
                const userId = commons.StripGuid(commons.GetCurrentUserId());
                commons.RetrieveMultipleRecords("teammembership", commons.Query("teamid,teammembershipid", `systemuserid eq ${userId} and teamid eq ${teamToCheckId}`))
                    .then(
                        function success(results) {
                            if (results && results.length > 0) {
                                resolve(results);
                            }
                            else
                                resolve(null);
                        },
                        err => {
                            console.error("Error on retrieve 'teammembership' into el_tradein_offer.getUserTeams: ", err);
                            commons.SetFormNotification("Error on retrieve 'teammembership' into el_tradein_offer.getUserTeams: " + err.message, Enum.FormNotificationLevel.ERROR, "el_tradein_offer.getUserTeams")
                            resolve(null)
                        }
                    )
            } catch (error) {
                reject(error);
            }
        })

        // var serverUrl = Xrm.Page.context.getServerUrl();
        // var oDataEndpointUrl = serverUrl + "/XRMServices/2011/OrganizationData.svc/";
        // oDataEndpointUrl += "TeamMembershipSet?$filter=SystemUserId eq guid' " + userId + " ' and TeamId eq guid' " + teamToCheckId + " '";

        // var service = el_tradein_offer.getRequestObject();
        // if (service != null) {
        //     service.open("GET", oDataEndpointUrl, false);
        //     service.setRequestHeader("X-Requested-Width", "XMLHttpRequest");
        //     service.setRequestHeader("Accept", "application/json,text/javascript, */*");
        //     service.send(null);
        //     var requestResults = eval('(' + service.responseText + ')').d;
        //     if (requestResults != null && requestResults.results.length > 0) {
        //         return requestResults.results;
        //     }
        // }
    }

    el_tradein_offer.guidsAreEqual = function (guid1, guid2) {
        // compares two guids
        let isEqual = false;
        if (guid1 == null || guid2 == null) {
            isEqual = false;
        } else {
            isEqual = (guid1.replace(/[{}]/g, "").toLowerCase() === guid2.replace(/[{}]/g, "").toLowerCase());
        }
        return isEqual;
    }

    el_tradein_offer.validateMazdaFordManufacturer = function () {
        return new Promise((resolve, reject) => {
            let oppId = commons.GetLookupId("el_id_opportunity");
            if (oppId) {
                // var odatautil = new OdataUtil();
                // var url = "OpportunitySet?$select=el_id_manufacturer&$filter=OpportunityId eq (guid'" + oppId + "')"
                // var opportunity = odatautil.RetrieveDataByUrl("", url, null, null, true);

                commons.RetrieveRecord("opportunity", oppId, "?$select=_el_id_manufacturer_value&$expand=el_id_manufacturer($select=name)")
                    .then(
                        function success(result) {
                            if (result && result.el_id_manufacturer) {
                                switch (result.el_id_manufacturer.name) {
                                    case "MAZDA":
                                    case "FORD":
                                        resolve(true);
                                        break;

                                    default:
                                        resolve(false);
                                        break;
                                }
                            } else {
                                resolve(false);
                            }
                        },
                        err => {
                            console.error("el_tradein_offer.validateMazdaFordManufacturer: ", err);
                            commons.SetFormNotification("el_tradein_offer.validateMazdaFordManufacturer: " + err.message, common.FormNotificationLevel.ERROR, "el_tradein_offer.validateMazdaFordManufacturer");
                            reject(err);
                        }
                    )
            }
        })
    }

    el_tradein_offer.testValidationOfFieldNumberOfOwners = function () {
        const value = commons.GetFieldValue("el_s_tr_number_of_owners"); // קבלת הערך של השדה
        if (value) {
            // אם הערך לא תקין (לא מספר חיובי, או אם הוא מתחיל באפס)
            if (!/^[1-9][0-9]*$/.test(value)) {
                // הצגת הודעה למשתמש
                common.OpenAlertDialog('הכנס מספר יד חיובי תקין (לא אפס ולא אותיות)');
                commons.SetFieldValue("el_s_tr_number_of_owners", null); // מחיקת הערך הלא תקין
                return false; // חזרה על הפעולה
            }
        }
    }

    /**
    * Method is recognaze a Form Type: Quick Create \ Regular Create
    */
    el_tradein_offer.setFormCreateType = function () {
        if (commons.GetFormType() === 10) {
            isQuickCreateForm = true;
        }
    }

    el_tradein_offer.onFormTypeLogic = function () {

        //On Create type
        if (commons.GetFormType() === Enum.FormType.Create) {
            el_tradein_offer.setFieldsByManufacturer();
            el_tradein_offer.setTradeinStatus();
            el_tradein_offer.setAccount();
            el_tradein_offer.updateTradeInFactor();
        }

        //On Update type
        if (commons.GetFormType() === Enum.FormType.Update) {

            commons.IsCurrentUserInSecurityRolesArrayGeneric(Const.SecurityRolesName.DM_Pailot_Scan_Car_Licenses)
                .then(
                    userHasRoleOrIsSystemManager => {
                        if (userHasRoleOrIsSystemManager && userHasRoleOrIsSystemManager === true) {
                            //Part of task 1560 - car licenses fields maping
                            el_tradein_offer.setFieldsRequiredLevel(["el_s_manufacturer", "el_s_model", "el_l_trade_in_factor", "el_s_tr_manuf_year", "el_s_tr_engine_volume", "el_s_tr_number_of_owners", "el_s_tr_car_color", "el_s_tr_accessories"], 'none');
                        }
                    }
                )
        }

        //On all types EXEPT create
        if (commons.GetFormType() !== Enum.FormType.Create) {
            el_tradein_offer.setAccountFields();
        }
    }

    /**
     * Method set a each fields of array as 'required' or 'none'
     * @param {Array} fieldsArr 
     * @param {string} isRequired 
     */
    el_tradein_offer.setFieldsRequiredLevel = function (fieldsArr, isRequired) {
        fieldsArr.map(function (fieldName) {
            commons.SetRequiredLevel(fieldName, isRequired);
        });
    }

    //To Check
    el_tradein_offer.getSalesProcessAccount = function () {
        let opportunityId;
        if (commons.GetAttribute("regardingobjectid"))
            opportunityId = commons.GetLookupId("regardingobjectid");
        if (commons.GetAttribute("el_id_opportunity"))
            opportunityId = commons.GetLookupId("el_id_opportunity");


        return new Promise((resolve, reject) => {
            if (opportunityId) {

                commons.RetrieveRecord(Enum.EntityLogicalName.Opportunity, opportunityId, "?$select=_customerid_value&$expand=customerid_account($select=accountid,name)")
                    .then(
                        function success(result) {
                            if (result && result.customerid_account) {
                                resolve({
                                    id: result.customerid_account.accountid,
                                    entityName: result.customerid_account.name,
                                })
                            }
                            resolve(null);
                        },
                        err => {
                            console.error("Error on retrieving Opportunity into el_tradein_offer.getSalesProcessAccount: ", err);
                            commons.SetFormNotification("Error on retrieving Opportunity into el_tradein_offer.getSalesProcessAccount: ", err.message, commons.FormNotificationLevel.ERROR, "el_tradein_offer.getSalesProcessAccount");
                            reject(err)
                        }
                    )

            }
            else
                resolve(null);
        })
        // var url = "OpportunitySet?$select=opportunity_customer_accounts/AccountId,opportunity_customer_accounts/Name&$expand=opportunity_customer_accounts&$filter=OpportunityId eq guid'" + opportunityId + "'";
        // var account = odatautil.RetrieveDataByUrl("", url, null, null, true);
        // if (account && account.results && account.results[0] && account.results[0].opportunity_customer_accounts) {
        //     var id = account.results[0].opportunity_customer_accounts.AccountId;
        //     var name = account.results[0].opportunity_customer_accounts.Name;
        //     accountLookup = getLookupField(id, name, "account");
        // }
    }



    var buttonClicked = false;

    el_tradein_offer.Ribbon = {};

    //To Check
    el_tradein_offer.Ribbon.getDocRegardingOffer = function (primaryControl) {
        // var guid = Xrm.Page.data.entity.getId();

        // var odatautil = new OdataUtil();
        // var url = "el_tradein_offerSet?$select=el_s_proposal_url&$filter=el_tradein_offerId eq (guid'" + guid + "')"
        // var proposals = odatautil.RetrieveDataByUrl("", url, null, null, true);
        // if (proposals && proposals.results && proposals.results.length > 0) {
        //     //window.open("file:" + proposals.results[0].el_s_proposal_url)
        //     var win = window.open(Xrm.Page.context.getClientUrl() + '/webresources/el_open_document.htm?data=' + encodeURIComponent(proposals.results[0].el_s_proposal_url), "_blank", "status=0,resizable=1,top=100,left=100,width=400px,height=300px");
        // }

        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        commons.RetrieveRecord("el_tradein_offer", commons.GetCurrentEntityId(), "?$select=el_s_proposal_url")
            .then(
                function success(tradeinOfferResult) {
                    if (tradeinOfferResult) {
                        let pageInput = {
                            pageType: "webresource",
                            webresourceName: "el_open_document.htm", //Point to problem -> schem name or name
                            data: tradeinOfferResult.el_s_proposal_url
                        };

                        let navigationOptions = {
                            target: 2, // 2 opens the page as a modal dialog
                            width: 400,
                            height: 300,
                            position: 1 // 1 for center, 2 for side pane
                        };

                        commons.NavigateTo(pageInput, navigationOptions)
                    }
                },
                err => console.error("Error on retrieve el_tradein_offer into el_tradein_offer.Ribbon.getDocRegardingOffer(): ", err)
            )

    }

    //To Check
    el_tradein_offer.Ribbon.executeCreateMazdaFordProposalWorkFlow = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        if (buttonClicked)
            return;
        buttonClicked = true;

        let guid = commons.GetCurrentEntityId();
        if (guid != '' || guid != null)
            commons.ExecuteWorkflow("E27B084B-6402-4093-811B-5F0AFB3A9D46", commons.StripGuid(commons.GetCurrentEntityId()))
        commons.RefreshForm(true);
    }



    el_tradein_offer.Ribbon.EnableRules = {};

    el_tradein_offer.Ribbon.EnableRules.dysplayMazdaFordCreateDoc = function (primaryControl) {
        return new Promise((resolve, reject) => {
            debugger;
            if (!commons) {
                commons = new elad_commons();
                commons.SetFormContext(primaryControl);
            }

            if (commons.IsMobile())
                resolve(false);
            if (commons.GetFormType() == Enum.FormType.Create)
                resolve(false);

            el_tradein_offer.validateMazdaFordManufacturer()
                .then(
                    success => {
                        if (success === true && commons.GetFieldValue("el_n_bid") && !commons.GetFieldValue("el_s_proposal_url")) {
                            resolve(true);
                        } else
                            resolve(false);
                    },
                    err => resolve(false)
                )
        })
    }

    el_tradein_offer.Ribbon.EnableRules.dysplayMazdaFordOpenDoc = function (primaryControl) {
        debugger;
        if (!commons) {
            commons = new elad_commons();
            commons.SetFormContext(primaryControl);
        }

        if (commons.getGlobalContext().client.getClient() == "Mobile")
            return false;
        if (commons.GetFormType() == Enum.FormType.Create)
            return false;

        if (commons.GetFieldValue("el_s_proposal_url")) {
            return true;
        }
    }



})(window.el_tradein_offer = window.el_tradein_offer || {})