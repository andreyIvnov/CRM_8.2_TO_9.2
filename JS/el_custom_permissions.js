(function (el_custom_permissions) {
    var commons;
    var userEmail;
    var allowedEmailsFromCrm;
    var hebrow;

    el_custom_permissions.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            hebrow = Const.Message.Hebrew;

            el_custom_permissions.onLoadEvents();
            el_custom_permissions.onChangeEvents();
            el_custom_permissions.onSaveEvents();

        } catch (error) {
            commons.PageErrorHandler(error, "el_custom_permissions.onLoad");
        }
    }

    el_custom_permissions.onLoadEvents = function () {
        el_custom_permissions.setRequiredAries();
        el_custom_permissions.setSystemUserLookupData();
    }

    el_custom_permissions.onChangeEvents = function () {
        commons.AddOnChange('el_id_systemuser', el_custom_permissions.setBusinessUnitOfUser);
    }

    el_custom_permissions.onSaveEvents = function () {
        commons.AddOnSave(el_custom_permissions.onSaveActions);
    }

    el_custom_permissions.setBusinessUnitOfUser = function () {
        let systemUserId = commons.GetLookupId("el_id_systemuser");
        if (systemUserId) {
            el_custom_permissions.getSystemUser("_businessunitid_value,internalemailaddress", systemUserId)
                .then(
                    function (result) {
                        if (result) {
                            const businessUnitOfSelectedUser = result.businessunitid;
                            userEmail = result.internalemailaddress;

                            if (allowedEmailsFromCrm && userEmail && !allowedEmailsFromCrm.includes(userEmail)) {
                                commons.OpenAlertDialog(hebrow.UserIsntIncludesInAllowedUsers, null, { height: 120, width: 260 }, null);
                            }

                            //To Check: If a value seted currect
                            commons.SetLookupValue("el_id_businessunit", businessUnitOfSelectedUser.id, businessUnitOfSelectedUser.entityname, businessUnitOfSelectedUser.entitytype);

                            //To Check: If a retrieved data is based on options
                            const userRolesOpts = "?$select=systemuserroleid&$filter=systemuserid eq '" + commons.StripGuid(systemUserId) + "'";

                            commons.RetrieveMultipleRecords("systemuserroles", userRolesOpts, null, true)
                                .then(
                                    function (results) {
                                        if (results && results.length > 0) {
                                            let valueToSet = "";
                                            results.forEach(function (element) {
                                                valueToSet += element.systemuserroleid + ";";
                                            });

                                            commons.SetFieldValue("el_s_selected_guids", valueToSet);
                                            commons.RefreshWebResourceArea("WebResource_security_roles_table")
                                        }
                                    },
                                    function (error) {
                                        commons.SetFormNotification("Response is failed in commons.RetrieveMultipleRecords('SystemUserRoles'): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from commons.RetrieveMultipleRecords("SystemUserRoles")');
                                    }
                                )
                                .catch(error => {
                                    commons.SetFormNotification("Error on retrieving an 'SystemUserRoles' into el_custom_permissions.setBusinessUnitOfUser(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_custom_permissions.setBusinessUnitOfUser');
                                })
                        }
                    },
                    function (error) {
                        commons.SetFormNotification("Response is failed in el_custom_permissions.getSystemUser(): " + error.message, commons.FormNotificationLevel.ERROR, 'Fault response from el_custom_permissions.getSystemUser');
                    }
                )
                .catch(err => {
                    commons.SetFormNotification("Error on retrieving an 'SystemUser' into el_custom_permissions.setBusinessUnitOfUser(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_custom_permissions.setBusinessUnitOfUser');
                })
        }
    }

    el_custom_permissions.setRequiredAries = function () {
        commons.SetRequiredLevel("el_id_systemuser", "required");
    }

    el_custom_permissions.setAllowedEmails = function () {
        return new Promise((resolve, reject) => {
            commons.GetGlobalParameterValueByName("Manage_Custom_Permissions_As_Default_Security_Role")
                .then(
                    function (result) {
                        if (result) {
                            allowedEmailsFromCrm = result;
                        }
                        resolve();
                    },
                    err => {
                        commons.SetFormNotification("Error on retrieving an 'el_general_system_parameter' into el_custom_permissions.setAllowedEmails(): " + error.message, commons.FormNotificationLevel.ERROR, 'el_custom_permissions.setAllowedEmails');
                        reject();
                    }
                )
        })
    }

    el_custom_permissions.onSaveActions = function (executionContext) {
        const eventArgs = executionContext.getEventArgs();
        if ((eventArgs.getSaveMode() == 70 || eventArgs.getSaveMode() == 2 || eventArgs.getSaveMode() == 1) &&
            (allowedEmailsFromCrm && userEmail && !allowedEmailsFromCrm.includes(userEmail))) {
            eventArgs.preventDefault();
            commons.OpenAlertDialog(hebrow.UserIsntIncludesInAllowedUsers, null, { height: 120, width: 260 }, null);
        }
        else if (eventArgs.getSaveMode() == 70) {
            eventArgs.preventDefault();
        }
    }

    el_custom_permissions.setSystemUserLookupData = async function () {
        try {
            await el_custom_permissions.setAllowedEmails();
            if (allowedEmailsFromCrm) {
                commons.AddPreSearch("el_id_systemuser", el_custom_permissions.setFilteredUsers);
            }
        } catch (error) {
            commons.SetFormNotification("Error on SetSystemUserLookupData(): " + error.message, commons.FormNotificationLevel.ERROR, "setSystemUserLookupData");
            console.error(error);
        }
    }

    el_custom_permissions.getSystemUser = (fieldsToGet, userId) => commons.RetrieveRecord("systemuser", userId, "?$select=" + fieldsToGet);

    el_custom_permissions.setFilteredUsers = function (executionContext) {

        allowedEmailsFromCrm = allowedEmailsFromCrm.length - 1 === ';' ? allowedEmailsFromCrm.substring(0, allowedEmailsFromCrm.length - 1) : allowedEmailsFromCrm;
        const allowedEmailsArray = allowedEmailsFromCrm.split(';');

        let control = executionContext.getEventSource();

        let allowedEmailsFilters = "<filter type='and'><filter type='or'>";
        allowedEmailsArray.forEach(function (email) {
            allowedEmailsFilters += "<condition attribute='internalemailaddress' operator='eq' value='" + email + "'/>";
        })
        allowedEmailsFilters += "</filter></filter>";

        control.addCustomFilter(allowedEmailsFilters);
    }

})(window.el_custom_permissions = window.el_custom_permissions || {});