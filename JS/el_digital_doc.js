(function (el_digital_doc) {
    var commons;
    el_digital_doc.Ribbon = el_appointment.Ribbon || {};
    el_digital_doc.OnLoad = function (executionContext) {
        try {
            formContext = executionContext.getFormContext();
            commons = new elad_commons(executionContext.getFormContext());
            commons.SetFormContext(formContext);
            el_digital_doc.setRequiredField("none");
            el_digital_doc.ShowTab();
            el_digital_doc.setupBasicEvents();
            el_digital_doc.initialChecks();

        } catch (error) {

            if (commons) {
                commons.SetFormNotification(
                    "ERROR on el_digital_doc.onLoad(): " + error.message,
                    "ERROR",
                    "el_digital_doc.onLoad"
                );
            }

            console.error(error);
        }

    }
    el_digital_doc.setupBasicEvents = function () {
        try {
            commons.AddOnChange("el_id_document_type", el_digital_doc.ShowTab);
            commons.AddOnChange("el_id_document_type", el_digital_doc.initialChecks);

        } catch (error) {
            commons.PageErrorHandler(error, "el_digital_doc.assignEventActions");
        }
    };

    el_digital_doc.ShowTab = function () {
        try {
            el_digital_doc.hideAllTabs();

            var documentType =
                commons.GetFieldValue("el_id_document_type");

            if (!documentType || !documentType[0]) {
                return;
            }

            var documentTypeName = documentType[0].name;

            if (documentTypeName == "רצון טוב") {
                el_digital_doc.setRequiredField("required");
            }
            else if (documentTypeName == "TCM") {
                el_digital_doc.setRequiredFieldForTCM("required");
            }
            else if (documentTypeName == "אישור קבלת רכב חליפי") {
                el_digital_doc.setRequiredFieldReplacementCar("required");
            }
            else if (documentTypeName == "טופס החזרת רכב") {
                el_digital_doc.setRequiredFieldForReturnCar("required");
            }
            else {
                el_digital_doc.setRequiredField("none");
            }

            var documentTypeId =
                commons.StripGuid(documentType[0].id);

            commons.RetrieveMultipleRecords(
                "el_document_type",
                "?$select=el_s_tab_name&$filter=el_document_typeid eq " + documentTypeId
            ).then(function (results) {

                if (!results || results.length == 0) {
                    return;
                }

                results.forEach(function (result) {
                    var tabName = result.el_s_tab_name;
                    if (tabName == "general_tab") {
                        return;
                    }
                    var tab = formContext.ui.tabs.get(tabName);

                    if (tab) {
                        tab.setVisible(true);
                        tab.setDisplayState("expanded");
                    }
                });

            }).catch(function (error) {
                commons.PageErrorHandler(error,"el_digital_doc.ShowTab" );
            });

        } catch (error) {
            commons.PageErrorHandler(error, "el_digital_doc.ShowTab");
        }
    };
    
    el_digital_doc.retrieveAndSetValues = async function (entityId, entityType) {
        try {
            var customerDetails = null;
            var carDetails = null;
            var incidentNumber = null;
            var incidentCreatedDate = null;

            if (entityType == "account") {

                var account = await commons.RetrieveRecord(
                    "account",
                    commons.StripGuid(entityId),
                    "?$select=" +
                    "el_s_first_name," +
                    "el_s_last_name," +
                    "emailaddress1," +
                    "telephone1"
                );
                if (account) {
                    customerDetails = {
                        mobilephone: account.telephone1,
                        firstname: account.el_s_first_name,
                        lastname: account.el_s_last_name,
                        email: account.emailaddress1
                    };
                }
            }
            else if (entityType == "incident") {

                var incident = await commons.RetrieveRecord(
                    "incident",
                    commons.StripGuid(entityId),
                    "?$select=" +
                    "el_s_incident_number," +
                    "createdon" +
                    "&$expand=" +
                    "el_id_car(" +
                    "$select=" +
                    "el_name," +
                    "el_s_chassis," +
                    "el_dt_purchase;" +
                    "$expand=" +
                    "el_id_manufacturer($select=el_name)," +
                    "el_id_family($select=el_name)," +
                    "el_id_model($select=el_name)" +
                    ")," +
                    "customerid_account(" +
                    "$select=" +
                    "el_s_first_name," +
                    "el_s_last_name," +
                    "telephone1," +
                    "emailaddress1," +
                    "el_s_idnumber_text;" +
                    "$expand=" +
                    "el_id_address($select=el_name)" +
                    ")," +
                    "ownerid($select=fullname)"
                );
                if (incident) {
                    var formType =
                        commons.GetFieldValue("el_id_document_type");
                    incidentNumber = incident.el_s_incident_number;
                    incidentCreatedDate = incident.createdon;
                    if (incident.customerid_account) {
                        customerDetails = {
                            mobilephone:
                                incident.customerid_account.telephone1,
                            firstname:
                                incident.customerid_account.el_s_first_name,
                            lastname:
                                incident.customerid_account.el_s_last_name,
                            idnumber:
                                incident.customerid_account.el_s_idnumber_text,
                            address:
                                incident.customerid_account.el_id_address,
                            email:
                                incident.customerid_account.emailaddress1
                        };
                    }
                    if (incident.el_id_car) {

                        carDetails = {
                            licensNumber:
                                incident.el_id_car.el_name,
                            shildNumber:
                                incident.el_id_car.el_s_chassis,
                            model:
                                incident.el_id_car.el_id_model,
                            family:
                                incident.el_id_car.el_id_family,
                            manufacturer:
                                incident.el_id_car.el_id_manufacturer,
                            dateRecived:
                                incident.el_id_car.el_dt_purchase
                        };
                    }
                    if (formType && formType[0]) {
                        var formTypeName = formType[0].name;

                        if (formTypeName == "רצון טוב") {
                            commons.SetFieldValue("el_s_incident_number", incidentNumber, commons.OnChangeBehavior.None);

                            var dateReceived = commons.TicksToDate(carDetails.dateRecived);

                            if (dateReceived instanceof Date && !isNaN(dateReceived)) {
                                commons.SetFieldValue("el_dt_vehicle_delivery_date", dateReceived, commons.OnChangeBehavior.None);
                            }
                        }

                        if (formTypeName == "אישור קבלת רכב חליפי") {
                            commons.SetLookupValue("el_id_approves_replacement_vehicle_accout", incident.ownerid.systemuserid, incident.ownerid.fullname, "systemuser", true);
                        }

                        if (formTypeName == "טופס החזרת רכב") {
                            commons.SetLookupValue("el_id_name_of_owner", incident.ownerid.systemuserid, incident.ownerid.fullname, "systemuser", true);
                        }
                    }

                    if (customerDetails && carDetails) {

                        if (carDetails.manufacturer) {
                            commons.SetLookupValue("el_id_manufacturer", carDetails.manufacturer.el_manufacturerid, carDetails.manufacturer.el_name, "el_manufacturer", true);
                        }

                        if (carDetails.family) {
                            commons.SetLookupValue("el_id_family", carDetails.family.el_familyid, carDetails.family.el_name, "el_family", true);
                        }

                        if (carDetails.model) {
                            commons.SetLookupValue("el_id_car_model", carDetails.model.el_modelid, carDetails.model.el_name, "el_model", true);
                        }

                        if (customerDetails.address) {
                            commons.SetLookupValue("el_id_address", customerDetails.address.el_addressid, customerDetails.address.el_name, "el_address", true);
                        }

                        if (carDetails.licensNumber != null) {
                            commons.SetFieldValue("el_s_car_number", carDetails.licensNumber, commons.OnChangeBehavior.None);
                        }

                        if (carDetails.shildNumber != null) {
                            commons.SetFieldValue("el_s_shield_number", carDetails.shildNumber, commons.OnChangeBehavior.None);
                        }

                        if (customerDetails.idnumber != null) {
                            commons.SetFieldValue("el_s_idnumber_text", customerDetails.idnumber, commons.OnChangeBehavior.None);
                        }

                        if (customerDetails.mobilephone != null) {
                            commons.SetFieldValue("el_s_mobilephone_number", customerDetails.mobilephone, commons.OnChangeBehavior.None);
                        }

                        if (customerDetails.email != null) {
                            commons.SetFieldValue("el_s_email", customerDetails.email, commons.OnChangeBehavior.None);
                        }
                    }

                    return [
                        customerDetails,
                        carDetails,
                        incidentNumber,
                        incidentCreatedDate
                    ];

                }
            }
        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_digital_doc.retrieveAndSetValues"
            );

            return [null, null, null, null];
        }
    };
    el_digital_doc.OpenForm = async function () {
        try {
            var regarding = commons.GetFieldValue("regardingobjectid");

            if (regarding && regarding[0]) {
                var entityId = regarding[0].id;
                var entityType = regarding[0].entityType;

                if (entityId && entityType) {
                    var retrievedValues = await el_digital_doc.retrieveAndSetValues(entityId, entityType);

                    var customerDetails = retrievedValues[0];
                    var carDetails = retrievedValues[1];
                    var incidentNumber = retrievedValues[2];
                    var incidentCreatedDate = retrievedValues[3];

                    if (customerDetails && carDetails) {
                        el_digital_doc.sendAndOpenForm(new FormData(), formContext.data.entity.attributes.get("el_id_document_type"),
                            customerDetails, carDetails, incidentNumber, incidentCreatedDate);
                    }
                }
            }
            el_digital_doc.ShowTab();
        } catch (error) {
            commons.PageErrorHandler(error, "el_digital_doc.OpenForm");
        }
    };
    el_digital_doc.setRequiredField = function (requiredLevel) {
        try {
            commons.SetRequiredLevelToArray(
                [
                    "el_s_order_number",
                    "el_n_credit_amount",
                    "el_n_special_discount_amount",
                    "el_n_additional_charge",
                    "el_n_km_distance",
                    "el_dt_vehicle_delivery_date"
                ],
                requiredLevel
            );

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_digital_doc.setRequiredField"
            );
        }
    };
    el_digital_doc.setRequiredFieldReplacementCar = function (requiredLevel) {
        try {
            commons.SetRequiredLevelToArray(
                [
                    "el_n_replacement_license_number",
                    "el_n_starting_km",
                    "el_s_car_type",
                    "el_n_replacement_car_year_manufacture"
                ],
                requiredLevel
            );

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_digital_doc.setRequiredFieldReplacementCar"
            );
        }
    };
    el_digital_doc.setRequiredFieldForTCM = function (requiredLevel) {
        try {
            commons.SetRequiredLevel("el_n_refund", requiredLevel);

        } catch (error) {
            commons.PageErrorHandler(error, "el_digital_doc.setRequiredFieldForTCM");
        }
    };
    el_digital_doc.setRequiredFieldForReturnCar = function (requiredLevel) {
        try {
            commons.SetRequiredLevel("el_s_endkm", requiredLevel);

        } catch (error) {
            commons.PageErrorHandler(error, "el_digital_doc.setRequiredFieldForReturnCar");
        }
    };
    el_digital_doc.sendAndOpenForm = async function (formData, formType,customerDetails, carDetails,incidentNumber, incidentCreatedDate) {
        try {
            el_digital_doc.hideAllTabs();

            var isWriteRole = commons.UserHasRole(Const.SecurityRolesName.DIGITAL_DOC_WRITE_ROLE);
            var isReadRole = commons.UserHasRole(Const.SecurityRolesName.DIGITAL_DOC_READ_ROLE);

            if (isWriteRole) {
                formData.append("user_permission", "1");
            }
            else if (isReadRole) {
                formData.append("user_permission", "2");
            }

            var formId = formContext.data.entity.getId();

            var family = carDetails.family ? carDetails.family.Name : null;
            var reference = incidentNumber ? incidentNumber : null;
            var carModel = carDetails.model ? carDetails.model.Name : null;
            var carFactory = carDetails.manufacturer ? carDetails.manufacturer.Name : null;
            var carId = carDetails.licensNumber ? carDetails.licensNumber : null;

            if (carModel) {
                formData.append("carModal", carModel);
            }

            if (family) {
                formData.append("modal", family);
            }

            if (reference) {
                formData.append("reference", reference);
            }

            if (carFactory) {
                formData.append("carFactory", carFactory);
            }

            if (carId) {
                formData.append("carId", carId);
            }

            var documentTypeId = commons.StripGuid(formType.getValue()[0].id);

            var documentTypeResults = await commons.RetrieveMultipleRecords("el_document_type", "?$select=el_s_document_code&$filter=el_document_typeid eq " + documentTypeId);

            var documentCode = null;

            if (documentTypeResults && documentTypeResults.length > 0) {
                documentCode = documentTypeResults[0].el_s_document_code;
            }
            if (formType) {

                switch (formType.getValue()[0].name) {

                    case "רצון טוב":
                        var carMile = commons.GetFieldValue("el_n_km_distance");
                        var orderNumber = commons.GetFieldValue("el_s_order_number");
                        var userAddress = customerDetails.address ? customerDetails.address.Name : null;
                        var shieldNumber = carDetails.shildNumber ? carDetails.shildNumber : null;
                        var dealSalePrice = commons.GetFieldValue("el_n_credit_amount");
                        var dealDiscount = commons.GetFieldValue("el_n_special_discount_amount");
                        var additionalCharge = commons.GetFieldValue("el_n_additional_charge");
                        var dateReceived = commons.ParseDate(carDetails.dateRecived);
                        var formattedDateReceived = null;
                        if (dateReceived) {
                            var timezoneOffset = dateReceived.getTimezoneOffset() * 60000;
                            var localIsoTime = (new Date(dateReceived - timezoneOffset)).toISOString().slice(0, -1);

                            formattedDateReceived = localIsoTime ? localIsoTime.slice(0, 19).replace("T", " ") : null;
                        }
                        if (carMile) {
                            formData.append("carMile", carMile);
                        }
                        if (orderNumber) {
                            formData.append("orderNumber", orderNumber);
                        }
                        if (userAddress) {
                            formData.append("userAdress", userAddress);
                        }
                        if (shieldNumber) {
                            formData.append("shildNumber", shieldNumber);
                        }
                        if (dealDiscount) {
                            formData.append("dealSalePrice", dealDiscount);
                        }
                        if (additionalCharge) {
                            formData.append("dealDiscount", additionalCharge);
                        }
                        if (dealSalePrice) {
                            formData.append("dealPrice", dealSalePrice);
                        }
                        if (formattedDateReceived) {
                            formData.append("dateRecived", formattedDateReceived);
                        }
                        break;
                    case "TCM":
                        var incidentDate = commons.ParseDate(incidentCreatedDate);
                        var check = commons.GetFieldValue("el_n_refund");
                        var formattedIncidentDate = null;

                        if (incidentDate) {
                            var incidentTimezoneOffset = incidentDate.getTimezoneOffset() * 60000;
                            var incidentLocalIsoTime = (new Date(incidentDate - incidentTimezoneOffset)).toISOString().slice(0, -1);
                            formattedIncidentDate = incidentLocalIsoTime ? incidentLocalIsoTime.slice(0, 19).replace("T", " ") : null;
                        }

                        if (formattedIncidentDate) {
                            formData.append("dateRecived", formattedIncidentDate);
                        }

                        if (check) {
                            formData.append("check", check);
                        }

                        break;

                    case "שירות לקוחות כללי":
                        var subject = commons.GetFieldValue("el_s_subject");

                        if (subject) {
                            formData.append("subject", subject);
                        }

                        break;

                    case "הסכמה לדיוור":
                        var email = customerDetails.email ? customerDetails.email : null;

                        if (email) {
                            formData.append("email", email);
                        }

                        break;

                    case "אישור קבלת רכב חליפי":
                        var carPickUpAddress = customerDetails.address ? customerDetails.address.Name : null;
                        var userFirstName = customerDetails.firstname ? customerDetails.firstname : null;
                        var userLastName = customerDetails.lastname ? customerDetails.lastname : null;
                        var replacementLicenseNumber = commons.GetFieldValue("el_n_replacement_license_number");
                        var startingKm = commons.GetFieldValue("el_n_starting_km");
                        var carType = commons.GetFieldValue("el_s_car_type");
                        var replacementCarYear = commons.GetFieldValue("el_n_replacement_car_year_manufacture");
                        var approveCarName = commons.GetFieldValue("el_id_approves_replacement_vehicle_accout");

                        if (approveCarName) {
                            formData.append("approveCar", approveCarName[0].name);
                        }

                        formData.append("darkMode", true);
                        formData.append("carPickUpAdress", carPickUpAddress);
                        formData.append("userFirstName", userFirstName);
                        formData.append("userLastName", userLastName);

                        if (replacementLicenseNumber) {
                            formData.append("subCarId", replacementLicenseNumber);
                        }

                        if (startingKm) {
                            formData.append("subStartKm", startingKm);
                        }

                        if (carType) {
                            formData.append("subCarType", carType);
                        }

                        if (replacementCarYear) {
                            formData.append("subCarYear", replacementCarYear);
                        }

                        break;

                    case "טופס החזרת רכב":
                        var currentDateTime = new Date();
                        var currentTimezoneOffset = currentDateTime.getTimezoneOffset() * 60000;
                        var currentLocalIsoTime = (new Date(currentDateTime - currentTimezoneOffset)).toISOString().slice(0, -1);
                        var formattedCurrentDate = currentLocalIsoTime ? currentLocalIsoTime.slice(0, 19).replace("T", " ") : null;
                        var owner = commons.GetFieldValue("el_id_name_of_owner");
                        var endKm = commons.GetFieldValue("el_s_endkm");

                        if (owner) {
                            formData.append("approveCar", owner[0].name);
                        }

                        formData.append("darkMode", true);

                        if (formattedCurrentDate) {
                            formData.append("dateRecived", formattedCurrentDate);
                        }

                        if (endKm) {
                            formData.append("endKm", endKm);
                        }

                        break;

                    default:
                        break;
                }
            }

            var ownerName = formContext.data.entity.attributes.get("ownerid").getValue() ? formContext.data.entity.attributes.get("ownerid").getValue()[0].name : null;
            var userName = customerDetails.firstname + " " + customerDetails.lastname;
            var userId = customerDetails.idnumber;
            var phone = customerDetails.mobilephone ? customerDetails.mobilephone : null;

            if (ownerName) {
                formData.append("owner", ownerName);
            }

            if (userName) {
                formData.append("userName", userName);
            }

            if (userId) {
                formData.append("userId", userId);
            }

            if (phone) {
                formData.append("phone", phone);
            }

            formData.append("file", documentCode);
            formData.append("DigitalDocId", formId);

            var digitalFormsUrl = await commons.GetGlobalParameterValueByName("DIGITAL_FORMS_URL");

            var response = await fetch(digitalFormsUrl, {
                method: "POST",
                body: formData,
                redirect: "follow"
            });

            if (!response.ok) {
                throw new Error("Request failed with status: " + response.status);
            }

            var result = await response.json();

            commons.OpenUrl(result.link);

            console.log(result);

        } catch (error) {
            console.log("error", error); commons.PageErrorHandler(error, "el_digital_doc.sendAndOpenForm");
        }
    };

    el_digital_doc.hideAllTabs = function () {
        try {
            var generalTab = null;

            formContext.ui.tabs.getAll().forEach(function (tab) {

                if (!tab || !tab.getLabel) {
                    return;
                }

                var label = tab.getLabel();

                if (label == "כללי") {

                    generalTab = tab;
                    return;
                }

                tab.setVisible(false);
            });

            if (generalTab) {
                generalTab.setDisplayState("expanded");
            }

            return generalTab;

        } catch (error) {
            commons.PageErrorHandler(
                error,
                "el_digital_doc.hideAllTabs"
            );

            return null;
        }
    };
    el_digital_doc.initialChecks = async function () {
        try {
            var regarding =
                commons.GetFieldValue("regardingobjectid");

            if (!regarding || !regarding[0]) {
                return;
            }

            var entityId = regarding[0].id;
            var entityType = regarding[0].entityType;

            if (!entityId || !entityType) {
                return;
            }

            await el_digital_doc.retrieveAndSetValues(entityId,entityType );

        } catch (error) {
            commons.PageErrorHandler(error,"el_digital_doc.initialChecks");
        }
    };
   
})((window.el_digital_doc = window.el_digital_doc || {}))
