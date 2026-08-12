var CommonsRibbonCrmActionParameters = window.CommonsRibbonCrmActionParameters || {

};

var CommonsCrmActionParameters = window.CommonsRibbonCrmActionParameters || {  };
CommonsCrmActionParameters.CheckForDuplicates = function ( duplicateType, targetId, userId, fromTime, untilTime) {

    this.DuplicateType = duplicateType;
    this.TargetId = targetId;
    this.UserId = userId;
    this.FromTime = fromTime;
    this.UntilTime = untilTime;
};

CommonsCrmActionParameters.CheckForDuplicates.prototype.getMetadata = function () {
    return {
        boundParameter: null,
        operationType: 0,      // Action
        operationName: "el_action_duplicate_detection_records",
        parameterTypes: {
            DuplicateType: {
                typeName: "Edm.Int32",
                structuralProperty: 1
            },
            TargetId: {
                typeName: "Edm.Guid",
                structuralProperty: 1
            },
            UserId: {
                typeName: "Edm.Guid",
                structuralProperty: 1
            },
           
            recordColumns: {
                typeName: "Edm.String",
                structuralProperty: 1
            }
        }
    };
};

(function (elad_commons_obj) {
    //Public parameters
    elad_commons_obj._formContext = elad_commons_obj._formContext || null;
    //elad_commons_obj.MAX_CHECK_IS_DIRTY_AFTER_SAVE = 25;
    //elad_commons_obj.IS_DIRTY_CHECK_SKIP_MS = 150;
    /*    elad_commons_obj.SAVE_REJECT_TIMEOUT = 750; //since reject is also sent on success*/
    elad_commons_obj.DirtyCheckRecurse = 0;
    elad_commons_obj.InSaveRecurse = 0;
    elad_commons_obj.InSave = elad_commons_obj.InSave || { value: false };

    elad_commons_obj.SAVE_MODES = {
        Save: 1,
        SaveAndClose: 2,
        Deactivate: 5,
        Reactivate: 6,
        SaveAndNew: 59,
        AutoSave: 70
    };

    elad_commons_obj.ConditionOperator = {
        Equal: 1,
        LessThan: 2,
        GreaterThan: 3,
        LessThanOrEqual: 4,
        GreaterThanOrEqual: 5
    };

    elad_commons_obj.FormType = {
        Undefined: 0,
        CREATE_FORM: 1,
        EDIT_FORM: 2,
        Read_Only: 3,
        DISABLED_FORM: 4,
        BULK_EDIT_FORM: 6
    };

    //elad_commons_obj.DataLoadState = {
    //    InitialLoad: 1,
    //    Save: 2,
    //    Refresh: 3
    //};

    //elad_commons_obj.EntityStates = {
    //    Active: "0",
    //    Inactive: "1"
    //};

    elad_commons_obj.OnChangeBehavior = {
        None: 0,
        IfChanged: 1,
        Always: 2
    };
    elad_commons_obj.FormFactor = {
        Unknown: 0,
        Desktop: 1,
        Tablet: 2,
        Phone: 3
    };

    //elad_commons_obj.LogLevel = {
    //    Error: 1,
    //    Warning: 2,
    //    Info: 3,
    //    Debug: 4
    //};

    //elad_commons_obj.LogSource = {
    //    OutgoingWs: 1,
    //    IncomingWs: 2,
    //    Job: 3,
    //    TripTracking: 4
    //};

    elad_commons_obj.GridLoadEventIndicators = {
        refreshDataCounter: 0,
        isInitialFormLoad: true,
        gridRecordsTotalCount: null
    }

    elad_commons_obj.FormNotificationLevel = {
        ERROR: "ERROR",
        WARNING: "WARNING",
        INFO: "INFO"
    };

    elad_commons_obj.TypeOfDateFormat = {
        OnlyDate: 1,
        OnlyTime: 2,
        DateAndTime: 3
    };

    elad_commons_obj.IncidentFormType = {
        MainForm: 1,
        QuickCreate: 2,
    };

    /*
        --elad_commons_obj.ErrorToIgnore--
        -----------------------------------
        There is same value in the "GlobalConsts.cs" file of the "RamatGanMunicipality.Common.DataModel" with the parameter
        name "Message_InRepeatedTreatmentError",please - any changes that are made in 
        this file scope should also be in the "GlobalConsts.cs" file on "RamatGanMunicipality.Common.DataModel".
    */

    elad_commons_obj.DataCache = elad_commons_obj.DataCache || {};

    elad_commons_obj.CurrentUserFieldSecurityProfiles = elad_commons_obj.CurrentUserFieldSecurityProfiles || { IsFilled: false };

    elad_commons_obj.CurrentUserSecurityRoles = elad_commons_obj.CurrentUserSecurityRoles || { IsFilled: false };

    elad_commons_obj.SetFormContext = function (context) {
        elad_commons_obj._formContext = context;
    };

    elad_commons_obj.GetFormContext = function () {
        return elad_commons_obj._formContext;
    };

    elad_commons_obj.GetContext = function () {
        return Xrm.Utility.getGlobalContext();
    };

    elad_commons_obj.GetCurrentEntityId = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.data.entity.getId();
        return null;
    };

    elad_commons_obj.GetCurrentEntityName = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.data.entity.getEntityName();
        return null;
    };

    elad_commons_obj.GetCurrentEntityReference = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.data.entity.getEntityReference();
        return null;
    };

    elad_commons_obj.GetCurrentUserName = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.context.getUserName();
        return null;
    };

    elad_commons_obj.GetCurrentUserId = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.context.getUserId();
        return null;
    };
    elad_commons_obj.GetUserId = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.context.getUserId();
        return null;
    };

    //From entity form: gets current form.
    elad_commons_obj.GetCurrentItem = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.ui.formSelector.getCurrentItem();
        return null;
    }

    //From entity form: gets current form GUID.
    elad_commons_obj.GetCurrentItemId = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.ui.formSelector.getCurrentItem().getId();
        return null;
    }

    elad_commons_obj.getEntityReference = function () {
        return elad_commons_obj.GetFormContext().data.entity.getEntityReference();

    }

    elad_commons_obj.isFormPage = function () {
        var pageContext = Xrm.Utility.getPageContext();
        var input = pageContext.input;
        return input.pageType == "entityrecord";
    }

    elad_commons_obj.OpenWebResource = function (webResourceUrl, data, w, h) {
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        if (webResourceUrl) {
            var params = 'fullscreen=yes,scrollbars=no,resizable=no,status=no,location=no,titlebar=no,toolbar=no,menubar=no,width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;
            open(webResourceUrl + data, 'MichaelWebResource', params);
        }
    };

    elad_commons_obj.OpenAlertDialog = function (message, callback, alertOptions, errorCallback) {
        if (!callback) {
            Xrm.Navigation.openAlertDialog({ text: elad_commons_obj.RTLString(message) }, alertOptions);
        }
        else {
            Xrm.Navigation.openAlertDialog({ text: elad_commons_obj.RTLString(message) }, alertOptions).then(callback, errorCallback);
        }
    }

    elad_commons_obj.ClosePage = function () {
        if (elad_commons_obj._formContext)
            elad_commons_obj._formContext.ui.close();
        return;
    }

    elad_commons_obj.OpenProgressIndicator = function (message, timeout = null) {
        Xrm.Utility.showProgressIndicator(message, timeout);

        if (timeout != null)
            setTimeout(elad_commons_obj.CloseProgressIndicator, timeout);
    }

    elad_commons_obj.CloseProgressIndicator = function () {
        Xrm.Utility.closeProgressIndicator();
    }

    elad_commons_obj.Sdk = elad_commons_obj.Sdk || {
        RetrievePrincipalAccess: function (userId, targetType, targetId) {
            this.entity = { entityType: "systemuser", id: userId };
            this.Target = { entityType: targetType, id: targetId };

            this.getMetadata = function () {
                return {
                    boundParameter: "entity", //the name of the bound parameter
                    parameterTypes: {
                        "entity": {
                            "typeName": "mscrm.systemuser",
                            "structuralProperty": 5 // Entity Type
                        },
                        "Target": {
                            "typeName": "mscrm.crmbaseentity",
                            "structuralProperty": 5 // Entity Type
                        }
                    },
                    operationType: 1, // This is a function. Use '0' for actions and '2' for CRUD
                    operationName: "RetrievePrincipalAccess",
                };
            };
        }
    };

    //does not work on mobile so ignore error in reject callback
    elad_commons_obj.UserHasEditRightsOnRecord = function (entitySet, id) {
        return new Promise(function (resolve, reject) {
            var hasAccess = false; //RetrievePrincipalAccess
            var globalContext = elad_commons_obj.GetContext();
            var userId = elad_commons_obj.StripGuid(globalContext.userSettings.userId);

            var retrievePrincipalAccessRequest = new elad_commons_obj.Sdk.RetrievePrincipalAccess(userId, entitySet, elad_commons_obj.StripGuid(id));

            Xrm.WebApi.online.execute(retrievePrincipalAccessRequest).then(function (result) {
                if (result == null || !result.ok) {
                    resolve(false);
                    return;
                }
                var res = JSON.parse(result.responseText);

                if (res.AccessRights != null && res.AccessRights.indexOf('WriteAccess') >= 0) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
            }, reject);
        });
    };

    elad_commons_obj.CurrentUserInFieldSecurityProfile = function (profileName) {
        return new Promise(function (resolve, reject) {
            elad_commons_obj.GetCurrentUserFieldSecurityProfiles().then(
                function (results) {
                    resolve((profileName != null && results[profileName] != null) || results["מנהל מערכת"] != null || results["System Administrator"] != null);
                }, reject);
        });
    };

    elad_commons_obj.CurrentUserInSecurityRole = function (roleName, excludeAdmin) {
        return new Promise(function (resolve, reject) {
            elad_commons_obj.GetCurrentUserSecurityRoles().then(
                function (results) {
                    resolve((roleName != null && results[roleName] != null) || (!excludeAdmin && (results["מנהל מערכת"] != null || results["System Administrator"] != null)));
                }, reject);
        });
    };

    elad_commons_obj.CurrentUserInSystemAdminSecurityRole = function (formContext) {
        elad_commons_obj.SetFormContext(formContext);

        return new Promise(function (resolve, reject) {
            elad_commons_obj.GetCurrentUserSecurityRoles().then(
                function (results) {
                    resolve(((results["מנהל מערכת"] != null || results["System Administrator"] != null)));
                }, reject);
        });
    };

    elad_commons_obj.GetBusinessUnitByUserId = function (userId, columns) {
        return new Promise(function (resolve, reject) {
            userId = userId || elad_commons_obj.GetCurrentUserId();
            columns = columns || "name";

            elad_commons_obj.RetrieveRecord("systemuser", userId, "?$select=businessunitid&$expand=businessunitid($select=" + columns + ")").then(function (result) {
                if (result != null && result.businessunitid != null) {
                    resolve(result.businessunitid);
                }
                else {
                    reject("elad_commons_obj.GetCurrentUserBusinessUnit: Failed to retrieve " +
                        (result == null ? "SystemUser " : "BusinessUnit of SystemUser ") + userId);
                }
            }, reject);
        });
    }

    elad_commons_obj.GetCurrentUserSecurityRoles = function () {
        return new Promise(function (resolve, reject) {
            if (elad_commons_obj.CurrentUserSecurityRoles.IsFilled) {
                resolve(elad_commons_obj.CurrentUserSecurityRoles);
            }
            else {
                var globalContext = elad_commons_obj.GetContext();
                var userId = globalContext.userSettings.userId;
                var fetch = '?fetchXml=<fetch version="1.0" output-format="xml-platform" mapping="logical" distinct="true">' +
                    '<entity name="role">' +
                    '<attribute name="roleid" />' +
                    '<attribute name="name" />' +
                    '<order attribute="name" descending="false" />' +
                    '<link-entity name="systemuserroles" from="roleid" to="roleid">' +
                    '<link-entity name="systemuser" from="systemuserid" to="systemuserid" alias="af">' +
                    '<filter type="and">' +
                    '<condition attribute="systemuserid" operator="eq" value="' + userId + '"/>' +
                    '</filter>' +
                    '</link-entity>' +
                    '</link-entity>' +
                    '</entity>' +
                    '</fetch>';

                elad_commons_obj.RetrieveMultipleRecords("role", fetch, null, true).then(function (results) {
                    if (results != null) {
                        elad_commons_obj.CurrentUserSecurityRoles.IsFilled = true;
                        for (var i = 0; i < results.length; i++) {
                            elad_commons_obj.CurrentUserSecurityRoles[results[i].name] = 1;
                        }
                        resolve(elad_commons_obj.CurrentUserSecurityRoles);
                    }
                }, reject);
            }
        });
    };

    elad_commons_obj.IsDuplicateRecordExist = function (DuplicateType, TargetId, UserId, recordColumns) { //recordColumnsrecordColumns
        //Each error message is different, to separate the steps that could cause an error.
        return new Promise(function (resolve, reject) {
            try {
                var errorObj = {};

                var checkForDuplicates = new CommonsCrmActionParameters.CheckForDuplicates(DuplicateType, TargetId, UserId, recordColumns);
                Xrm.WebApi.online.execute(checkForDuplicates).then(function (result) {
                    if (result.ok) {
                        result.json().then(
                            function (response) {
                                if (!response) {
                                    errorObj.message = "checkForDuplicates Error: JSON parse did not return a response";
                                    reject(errorObj);
                                }
                                else {
                                    if (response.Success) {
                                        resolve(response.IsDuplicate);
                                    }
                                    else {
                                        errorObj.message = "checkForDuplicates Error: The action returned a failed status";
                                        reject(errorObj);
                                    }
                                }
                            },
                            function (error) {
                                errorObj.message = "checkForDuplicates Error: error parsing JSON response";
                                reject(errorObj);
                            }
                        );
                    }
                    else {
                        errorObj.message = "checkForDuplicates Error: results status error";
                        reject(errorObj);
                    }
                }, function (error) {
                    reject(error);
                });
            } catch (e) {
                reject(e);
            }
        });
    };

    /*----------------------------------------------------------------------------------------------------------------------------------------
     * Editable Grid (Home) Section Start.
     ----------------------------------------------------------------------------------------------------------------------------------------*/
    elad_commons_obj.GetHomeGridAttribute = function (fieldName) {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.getData().getEntity().attributes.getByName(fieldName);
        return null;
    }

    elad_commons_obj.GetHomeGridFieldValue = function (fieldName) {
        var attr = elad_commons_obj.GetHomeGridAttribute(fieldName)
        if (attr == null) {
            return null
        }
        return attr.getValue();
    }

    elad_commons_obj.SetHomeGridFieldValue = function (fieldName, newValue) {
        var attr = elad_commons_obj.GetHomeGridAttribute(fieldName);
        if (attr != null) {
            var oldValue = attr.getValue();
            if (!elad_commons_obj.CRMEquals(oldValue, newValue)) {
                attr.setValue(newValue);
                return true;
            }
        }
        return false;
    }

    /*
     * Parameters:
     * executionContext - in order to make sure that the context is of the selected record.
     * msg: if has value - set notification, if null - clear notification.
     */
    elad_commons_obj.SetHomeGridNotification = function (executionContext, fieldName, msg, uniqueName) {
        var editableGridFormContext = executionContext.getFormContext();
        var attr = editableGridFormContext.getData().getEntity().attributes.getByName(fieldName);
        if (attr != null) {
            attr.controls.forEach(function (control, i) {
                if (control) {
                    if (msg)
                        control.setNotification(msg, uniqueName);
                    else
                        control.clearNotification(uniqueName);
                }
            });
        }
    }

    /*
    * Parameters:
    * executionContext - in order to make sure that the context is of the selected record.
    */
    elad_commons_obj.GetHomeGridFieldRequiredLevel = function (executionContext, fieldName) {
        var editableGridFormContext = executionContext.getFormContext();
        var attr = editableGridFormContext.getData().getEntity().attributes.getByName(fieldName);

        if (attr != null) {
            return attr.getRequiredLevel();
        }
        return null;
    };

    /*
     * Parameters:
     * executionContext - in order to make sure that the context is of the selected record.
     */
    elad_commons_obj.SetHomeGridFieldRequiredLevel = function (executionContext, fieldName, requiredLevel) {
        var editableGridFormContext = executionContext.getFormContext();
        var attr = editableGridFormContext.getData().getEntity().attributes.getByName(fieldName);

        if (attr != null && attr.getRequiredLevel() != requiredLevel) {
            attr.setRequiredLevel(requiredLevel);
        }
    }
    /*----------------------------------------------------------------------------------------------------------------------------------------
     * Editable Grid (Home) Section End.
     ----------------------------------------------------------------------------------------------------------------------------------------*/

    elad_commons_obj.GetAttribute = function (fieldName) {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.getAttribute(fieldName);
        return null;
    };

    elad_commons_obj.GetControl = function (controlName) {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.getControl(controlName);
        return null;
    };

    elad_commons_obj.GetSelectedOption = function (fieldName) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (!attr) {
            return null;
        }
        return attr.getSelectedOption();
    };

    elad_commons_obj.GetParameterValue = function (paramName) {
        var attr = null;
        var attrs = elad_commons_obj._formContext ? elad_commons_obj._formContext.data.attributes : null; //only in unified interface
        if (attrs != null) {
            attr = elad_commons_obj._formContext.data.attributes.get(paramName);

            if (attr == null) {
                return null;
            }
            return attr.getValue();
        }

        //use deprecated method when attributes is not available 
        var params = elad_commons_obj.GetContext().getQueryStringParameters();
        return params[paramName];
    };

    elad_commons_obj.RefreshRibbon = function (refreshAll) {
        if (!elad_commons_obj._formContext || elad_commons_obj._formContext.ui == null) {
            refreshRibbon();
        }
        else {
            if (refreshAll == undefined || refreshAll == null)
                elad_commons_obj._formContext.ui.refreshRibbon(true);
            else
                elad_commons_obj._formContext.ui.refreshRibbon(refreshAll);
        }
    }

    elad_commons_obj.HideRibbonButton = function () {
        //This function can be used on a demi-ribbon button as an enable rule, to load the commons script.
        //The button has to be placed first in order in the ribbon, this rule will hide it.
        return false;
    }

    elad_commons_obj.RefreshData = function (save, successCallback, errorCallback) {
        var formContext = elad_commons_obj.GetFormContext();
        if (formContext)
            formContext.data.refresh(save).then(successCallback, errorCallback);
    }

    elad_commons_obj.RefreshControl = function (ctrlName) {
        var ctrl = elad_commons_obj.GetControl(ctrlName);
        if (ctrl == null) {
            return null;
        }
        return ctrl.refresh();
    }

    elad_commons_obj.GetFieldValue = function (fieldName) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr == null) {
            return null;
        }
        return attr.getValue();
    };


    elad_commons_obj.GetLookupField = function (id, name, type) {
        return [{
            id: id,
            name: name,
            entityType: type
        }];
    };
    elad_commons_obj.GetLookupEntityType = function (fieldName) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr == null) {
            return null;
        }
        var value = attr.getValue();

        if (value != null && value.length > 0) {
            return value[0].entityType;
        }

        return null;
    };

    elad_commons_obj.GetLookupName = function (fieldName) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr == null) {
            return null;
        }
        var value = attr.getValue();

        if (value != null && value.length > 0) {
            return value[0].name;
        }

        return null;
    };

    elad_commons_obj.GetLookupId = function (fieldName) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr == null) {
            return null;
        }
        var value = attr.getValue();

        if (value != null && value.length > 0) {
            return value[0].id;
        }

        return null;
    };

    elad_commons_obj.IsLookupEmpty = function (fieldName) {
        var val = elad_commons_obj.GetFieldValue(fieldName);
        return (val == null || val.length == 0);
    };

    elad_commons_obj.SetFieldValue = function (fieldName, newValue, onChangeBehavior = 0) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr != null) {
            var oldValue = attr.getValue();
            if (!elad_commons_obj.CRMEquals(oldValue, newValue)) {
                attr.setValue(newValue);
                if (onChangeBehavior == elad_commons_obj.OnChangeBehavior.IfChanged || onChangeBehavior == elad_commons_obj.OnChangeBehavior.Always)
                    attr.fireOnChange();
                return true;
            }
            else if (onChangeBehavior == elad_commons_obj.OnChangeBehavior.Always) {
                attr.fireOnChange();
                return false;
            }
        }

        return false;
    };


    elad_commons_obj.EmptyFieldsValue = function (fieldsNamesArr, alternateValue) {
        if (fieldsNamesArr && Array.isArray(fieldsNamesArr))
            fieldsNamesArr.forEach(field => elad_commons_obj.SetFieldValue(field, (alternateValue ? alternateValue : null)));
    };

    elad_commons_obj.SetFilterXml = function (gridName, filter) {
        var grid = elad_commons_obj.GetControl(gridName);
        if (grid && filter) {
            grid.setFilterXml(filter);
            grid.refresh();
        }
    };

    elad_commons_obj.SetLookupValue = function (fieldName, id, name, entityType, onChangeBehavior = 0) {
        if (fieldName != null && id != null) {
            var attr = elad_commons_obj.GetAttribute(fieldName);
            if (attr != null) {
                var oldValue = attr.getValue();
                if (id.indexOf('{') == -1)
                    id = '{' + id;
                if (id.indexOf('}') == -1)
                    id = id + '}';
                id = id.toUpperCase();
                var lookupValue = [{
                    id: id,
                    name: name,
                    entityType: entityType
                }];
                if (!elad_commons_obj.CRMEquals(oldValue, lookupValue)) {
                    attr.setValue(lookupValue);
                    if (onChangeBehavior == elad_commons_obj.OnChangeBehavior.IfChanged || onChangeBehavior == elad_commons_obj.OnChangeBehavior.Always)
                        attr.fireOnChange();
                    return true;
                }
                else if (onChangeBehavior == elad_commons_obj.OnChangeBehavior.Always) {
                    attr.fireOnChange();
                    return false;
                }
            }
        }

        return false;
    };

    elad_commons_obj.CRMEquals = function (oldValue, newValue) {
        //"to" field in activities might NOT be NULL. it can have an empty array as a value,
        //  the second part of each condition below treats this situation in "to" field as a "null".
        var oldIsNull = (oldValue == null || oldValue.length <= 0);
        var newIsNull = (newValue == null || newValue.length <= 0);

        if (oldIsNull != newIsNull) {
            return false;
        }

        if (oldIsNull) { //both null
            return true;
        }

        if (Array.isArray(oldValue)) { //lookup
            return (oldValue[0].id == newValue[0].id);
        }

        if (typeof oldValue.getMonth === 'function' && typeof newValue.getMonth === 'function') //datetime
            return (oldValue.getTime() === newValue.getTime());

        return (oldValue == newValue);
    };

    elad_commons_obj.AddOnChange = function (fieldName, callback) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr != null) {
            attr.addOnChange(callback);
        }
    };

    elad_commons_obj.AddOnLoad = function (gridName, callback) {
        var grid = elad_commons_obj.GetControl(gridName);
        if (grid != null) {
            grid.addOnLoad(callback);
        }
    };

    elad_commons_obj.RemoveOnLoad = function (gridName, callback) {
        var grid = elad_commons_obj.GetControl(gridName);
        if (grid != null) {
            grid.removeOnLoad(callback);
        }
    };

    elad_commons_obj.GetGridRows = function (gridName) {
        var grid = elad_commons_obj.GetControl(gridName);
        if (grid != null && grid.getGrid() != null) {
            return grid.getGrid().getRows();
        }
        return null;
    }

    elad_commons_obj.GetGridRow = function (gridName, index) {
        var resp = {};
        var grid = elad_commons_obj.GetControl(gridName);
        if (grid != null && grid.getGrid() != null) {
            var rows = grid.getGrid().getRows();
            if (rows) {
                var row = rows.get(index);
                if (row) {
                    resp["id"] = row.getData().entity.getId();
                    resp["entityName"] = row.getData().entity.getEntityName();
                    resp["name"] = row.getData().entity.getPrimaryAttributeValue();
                    var attributes = row.getData().entity.attributes.getAll();
                    if (attributes && attributes.length > 0) {
                        for (var i = 0; i < attributes.length; i++) {
                            resp[attributes[i].getName()] = attributes[i].getValue();
                        }
                    }
                    return resp;
                }
            }
        }
        return null;
    }

    elad_commons_obj.GetGridCellValue = function (gridName, index, fieldName) {
        var grid = elad_commons_obj.GetControl(gridName);
        if (grid != null && grid.getGrid() != null) {
            var rows = grid.getGrid().getRows();
            if (rows) {
                var row = rows.get(index);
                if (row) {
                    var field = row.getData().entity.attributes.getByName(fieldName);
                    if (field)
                        return field.getValue();
                }
            }
        }
        return null;
    }

    elad_commons_obj.GetGridTotalRecordsCount = function (gridName) {
        var grid = elad_commons_obj.GetControl(gridName);
        if (grid != null && grid.getGrid() != null) {
            return grid.getGrid().getTotalRecordCount();
        }
        return null;
    };

    elad_commons_obj.OnGridLoadRefreshFormOrUpdateFields = function (gridName, updateFieldsWaitMessage, fieldsToUpdate, hebrewEntityName) {
        //when a record in a sub grid is created/deleted (the number of grid records changes) and there's a server's-side logic to update current record -
        //  Refresh current record form if there's no unsaved data, otherwise - retrieve records values from server and update them on form.
        var gridRecordsNewTotalCount = elad_commons_obj.GetGridTotalRecordsCount(gridName);
        var fieldsToUpdateArr = Array.isArray(fieldsToUpdate) ? fieldsToUpdate : [fieldsToUpdate];

        //gridRecordsTotalCount && gridRecordsNewTotalCount: run logic if sub grid records count changed.
        elad_commons_obj.GridLoadEventIndicators.gridRecordsTotalCount =
            (elad_commons_obj.GridLoadEventIndicators.isInitialFormLoad ? gridRecordsNewTotalCount : elad_commons_obj.GridLoadEventIndicators.gridRecordsTotalCount);

        //refreshDataCounter: prevent infinite loop (elad_commons_obj.RefreshData refreshes also offenses sub grid, which triggers this function).
        //isInitialFormLoad: prevent running logic if it's onload.
        if (elad_commons_obj.GridLoadEventIndicators.refreshDataCounter > 0 || elad_commons_obj.GridLoadEventIndicators.isInitialFormLoad
            || (gridRecordsNewTotalCount != null && gridRecordsNewTotalCount == elad_commons_obj.GridLoadEventIndicators.gridRecordsTotalCount)) {
            elad_commons_obj.GridLoadEventIndicators.refreshDataCounter = 0;
            elad_commons_obj.GridLoadEventIndicators.isInitialFormLoad = false;
        }
        else {
            //  In order to update fields - if form is dirty - retrieve the fields values (updated in plugin)
            //      because refreshing the form will alert the user to save the form (not user friendly).
            if (elad_commons_obj.GetIsDirty() == false) {
                elad_commons_obj.RefreshData();
                elad_commons_obj.GridLoadEventIndicators.refreshDataCounter++;
            }
            else {
                try {
                    elad_commons_obj.OpenProgressIndicator(updateFieldsWaitMessage);
                    var recordFields = "?$select=" + fieldsToUpdateArr.join(",");
                    elad_commons_obj.RetrieveRecord(elad_commons_obj.GetCurrentEntityName(), elad_commons_obj.GetCurrentEntityId(), recordFields, true).then(
                        function (retrievedRecord) {
                            if (retrievedRecord) {
                                fieldsToUpdateArr.forEach(fieldName => {
                                    var valueToUpdate = (retrievedRecord[fieldName] ? retrievedRecord[fieldName] : null);
                                    elad_commons_obj.SetFieldValue(fieldName, valueToUpdate, elad_commons_obj.OnChangeBehavior.IfChanged);
                                });

                                elad_commons_obj.Save();
                            }
                            else {
                                elad_commons_obj.HandlePageErrorAndIndicator("שגיאה בשליפת רשומת " + hebrewEntityName + " נוכחית ממסד הנתונים לצורך רענון: ", error, "\n(אין פרטי שגיאה להצגה)", "", "OnGridLoadRefreshFormOrUpdateFields", false, true);
                            }

                            elad_commons_obj.CloseProgressIndicator();
                        },
                        function (error) {
                            elad_commons_obj.HandlePageErrorAndIndicator("שגיאה ברענון טופס רשומת  " + hebrewEntityName + "  נוכחית: ", error, "\n(אין פרטי שגיאה להצגה)", "", "OnGridLoadRefreshFormOrUpdateFields", false, true);
                        }
                    );
                }
                catch (error) {
                    elad_commons_obj.HandlePageErrorAndIndicator("שגיאה בקריאה לשליפת ערכים מעודכנים של רשומת  " + hebrewEntityName + "  נוכחית לצורך רענון: ", error, "\n(אין פרטי שגיאה להצגה)", "", "OnGridLoadRefreshFormOrUpdateFields", false, true);
                }
            }

            gridRecordsTotalCount = gridRecordsNewTotalCount;
        }
    };

    elad_commons_obj.AddOnSave = function (callback) {
        elad_commons_obj._formContext.data.entity.addOnSave(callback);
    };

    elad_commons_obj.SetEntityTypes = function (fieldName, typesArray) {
        var ctrl = elad_commons_obj.GetControl(fieldName);
        if (ctrl != null) {
            ctrl.setEntityTypes(typesArray);
        }
    }

    elad_commons_obj.GetFormType = function () {
        if (elad_commons_obj._formContext)
            return elad_commons_obj._formContext.ui.getFormType();
        return null;
    };

    elad_commons_obj.GetAllFieldsOnForm = function () {
        return elad_commons_obj._formContext.data.entity.attributes.get();
    }

    elad_commons_obj.GetDirtyFieldsList = function () {
        var attribs = elad_commons_obj.GetAllFieldsOnForm();

        var filterDirty = attribs.filter(function (elem, index, attribs) {
            var name = elem.getName();
            return (elad_commons_obj.GetIsDirty(name) === true);
        });

        return filterDirty;
    };
    elad_commons_obj.GetIsDirty = function (fieldName) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr != null) {
            return attr.getIsDirty();
        }
        return false;
    };

    elad_commons_obj.SetRequiredLevel = function (fieldName, requirementLevel) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr != null) {
            attr.setRequiredLevel(requirementLevel);
        }
    };

    elad_commons_obj.GetRequiredLevel = function (fieldName) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr != null) {
            return attr.getRequiredLevel();
        }
        return null;
    };

    elad_commons_obj.SetSubmitMode = function (fieldName, mode) {
        var attr = elad_commons_obj.GetAttribute(fieldName);
        if (attr != null) {
            attr.setSubmitMode(mode);
        }
    };

    elad_commons_obj.GetUserPrivilege = function (fieldName) {
        return new Promise(function (resolve, reject) {
            var attr = elad_commons_obj.GetAttribute(fieldName);
            if (attr != null) {
                resolve(attr.getUserPrivilege());
            }
        });
    };

    elad_commons_obj.SubmitIfDirty = function (fieldName) {
        if (elad_commons_obj.GetIsDirty(fieldName)) {
            elad_commons_obj.SetSubmitMode(fieldName, "always");
        }
        else {
            elad_commons_obj.SetSubmitMode(fieldName, "dirty");
        }
    };

    elad_commons_obj.SetFocus = function (fieldName) {
        var ctl = elad_commons_obj.GetControl(fieldName);
        if (ctl != null) {
            ctl.setFocus();
        }
    };

    elad_commons_obj.FocusOnTab = function (tabName) {
        if (!elad_commons_obj._formContext)
            return null;

        elad_commons_obj._formContext.ui.tabs.get(tabName).setFocus();
    };

    elad_commons_obj.GetDisabled = function (fieldName, isControlCollection) {
        if (isControlCollection) {
            var isAtLeastOneControlDisabled = false;
            var attr = elad_commons_obj.GetAttribute(fieldName);
            if (attr != null) {
                attr.controls.forEach(function (control, i) {
                    if (control && control.getDisabled()) {
                        isAtLeastOneControlDisabled = true;
                    }
                });

                return isAtLeastOneControlDisabled;
            }
        }
        else {
            var ctl = elad_commons_obj.GetControl(fieldName);
            if (ctl != null) {
                return ctl.getDisabled();
            }
        }
    };

    elad_commons_obj.SetDisabled = function (fieldName, disabled, isControlCollection) {
        if (isControlCollection) {
            var attr = elad_commons_obj.GetAttribute(fieldName);
            if (attr != null) {
                attr.controls.forEach(function (control, i) {
                    if (control) {
                        control.setDisabled(disabled);
                    }
                });
            }
        }
        else {
            var ctl = elad_commons_obj.GetControl(fieldName);
            if (ctl != null) {
                ctl.setDisabled(disabled);
            }
        }
    };

    elad_commons_obj.SetVisible = function (fieldName, visible, isControlCollection) {
        if (isControlCollection) {
            var attr = elad_commons_obj.GetAttribute(fieldName);
            if (attr != null) {
                attr.controls.forEach(function (control, i) {
                    if (control) {
                        control.setVisible(visible);
                    }
                });
            }
        }
        else {
            var ctl = elad_commons_obj.GetControl(fieldName);
            if (ctl != null) {
                ctl.setVisible(visible);
            }
        }
    };

    elad_commons_obj.GetVisible = function (fieldName) {
        var ctl = elad_commons_obj.GetControl(fieldName);
        if (ctl != null) {
            return ctl.getVisible();
        }
        return null;
    };

    elad_commons_obj.AddPreSearch = function (fieldName, callback) {
        var ctl = elad_commons_obj.GetControl(fieldName);
        if (ctl != null) {
            ctl.addPreSearch(callback);
        }
    };

    elad_commons_obj.SetNotification = function (fieldName, msg, uniqueName, isControlCollection) {
        if (isControlCollection) {
            var attr = elad_commons_obj.GetAttribute(fieldName);
            if (attr != null) {
                attr.controls.forEach(function (control, i) {
                    if (control) {
                        control.setNotification(msg, uniqueName);
                    }
                });
            }
        }
        else {
            var ctl = elad_commons_obj.GetControl(fieldName);
            if (ctl != null) {
                ctl.setNotification(msg, uniqueName);
            }
        }
    };

    elad_commons_obj.ClearNotification = function (fieldName, uniqueName, isControlCollection) {
        if (isControlCollection) {
            var attr = elad_commons_obj.GetAttribute(fieldName);
            if (attr != null) {
                attr.controls.forEach(function (control, i) {
                    if (control) {
                        control.clearNotification(uniqueName);
                    }
                });
            }
        }
        else {
            var ctl = elad_commons_obj.GetControl(fieldName);
            if (ctl != null) {
                ctl.clearNotification(uniqueName);
            }
        }
    };

    elad_commons_obj.SaveCommand = function (formContext) {
        commons = new elad_commons();
        elad_commons_obj.SetFormContext(formContext);
        try {
            elad_commons_obj.Save();
        }
        catch (err) {
            elad_commons_obj.PageErrorHandler(err, "SaveCommand");
        }
    };

    elad_commons_obj.Save = function () {
        return new Promise(function (resolve, reject) {
            var saved = false;
            elad_commons_obj.WaitForExclusiveSave(elad_commons_obj.IS_DIRTY_CHECK_SKIP_MS).then(
                function () {
                    var formContext = elad_commons_obj.GetFormContext();
                    if (!formContext)
                        return null;
                    formContext.data.save().then(function () {
                        saved = true;

                        elad_commons_obj.WaitUntilNotDirty(elad_commons_obj.IS_DIRTY_CHECK_SKIP_MS).then(function () {
                            elad_commons_obj.InSave.value = false;
                            resolve();
                        }, function (err) {
                            elad_commons_obj.InSave.value = false;
                            reject(err);
                        });
                    }, function (err) {
                        setTimeout(function () {
                            elad_commons_obj.InSave.value = false;
                            if (!saved) {
                                reject(err);
                            }
                        }, elad_commons_obj.SAVE_REJECT_TIMEOUT);
                    });
                },
                function (err) {
                    elad_commons_obj.InSave.value = false;
                    reject(err);
                });
        });
    };

    elad_commons_obj.WaitForExclusiveSave = function (wait) {
        return new Promise(function (resolve, reject) {
            if (!elad_commons_obj.InSave.value) {
                elad_commons_obj.InSaveRecurse = 0;
                elad_commons_obj.InSave.value = true;
                resolve();
            }
            else {
                if (elad_commons_obj.InSaveRecurse < elad_commons_obj.MAX_CHECK_IS_DIRTY_AFTER_SAVE) {
                    setTimeout(function () {
                        elad_commons_obj.InSaveRecurse++;
                        elad_commons_obj.WaitForExclusiveSave(wait).then(resolve, reject);
                    }, elad_commons_obj.InSaveRecurse == 0 ? 0 : wait);
                }
                else {
                    elad_commons_obj.InSaveRecurse = 0;
                    reject(new Error("WaitForExclusiveSave recurse overflow"));
                }
            }
        });
    };

    elad_commons_obj.GetIsDirty = function (fieldName) {
        if (fieldName) {
            var attr = elad_commons_obj.GetAttribute(fieldName);
            if (attr != null) {
                return attr.getIsDirty();
            }
            return false;
        }
        else {
            var formContext = elad_commons_obj.GetFormContext();

            if (formContext) {
                return formContext.data.entity.getIsDirty();
            }
        }

    };

    elad_commons_obj.WaitUntilNotDirty = function (wait) {
        return new Promise(function (resolve, reject) {
            var formContext = elad_commons_obj.GetFormContext();
            if (!formContext)
                reject("null");
            if (!formContext.data.entity.getIsDirty()) {
                elad_commons_obj.DirtyCheckRecurse = 0;
                resolve();
            }
            else {
                if (elad_commons_obj.DirtyCheckRecurse < elad_commons_obj.MAX_CHECK_IS_DIRTY_AFTER_SAVE) {
                    setTimeout(function () {
                        elad_commons_obj.DirtyCheckRecurse++;
                        elad_commons_obj.WaitUntilNotDirty(wait).then(resolve, reject);
                    }, elad_commons_obj.DirtyCheckRecurse == 0 ? 0 : wait);
                }
                else {
                    elad_commons_obj.DirtyCheckRecurse = 0;
                    reject(new Error("יש עדיין שינויים שלא נשמרו בטופס"));
                }
            }
        });
    };

    elad_commons_obj.SetRegardingFromQueryString = function () {
        if (elad_commons_obj.GetFormType() == elad_commons_obj.FormType.CREATE_FORM && elad_commons_obj.IsMobile()) {
            var regardingIdParam = elad_commons_obj.GetParameterValue('el_regid');
            var regardingNameParam = elad_commons_obj.GetParameterValue('el_regname');
            var parentEntityName = elad_commons_obj.GetParameterValue('el_regtype');

            if (regardingIdParam && regardingNameParam && parentEntityName) {
                elad_commons_obj.SetLookupValue("regardingobjectid", regardingIdParam, regardingNameParam, parentEntityName, elad_commons_obj.OnChangeBehavior.None);
            }
        }
    };

    elad_commons_obj.IsWeb = function () {
        var context = elad_commons_obj.GetContext();
        if (!context)
            return null;
        return (context.client.getClient() == "Web");
    };

    elad_commons_obj.IsMobile = function () {
        var context = elad_commons_obj.GetContext();
        if (!context)
            return null;
        var formFactor = context.client.getFormFactor();
        return (formFactor == elad_commons_obj.FormFactor.Tablet || formFactor == elad_commons_obj.FormFactor.Phone);
    };


    elad_commons_obj.RetrieveMultipleRecords = function (entityLogicalName, options, maxPageSize, forceNotCached) {
        var cacheKey = [entityLogicalName, options].join('');
        return new Promise(function (resolve, reject) {
            if (!forceNotCached && elad_commons_obj.DataCache[cacheKey] != null) {
                resolve(elad_commons_obj.DataCache[cacheKey]);
            }
            else {
                Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, options, maxPageSize).then(function (result) {
                    var results = null;
                    if (result != null) {
                        results = result.entities;
                    }
                    if (!forceNotCached) {
                        elad_commons_obj.DataCache[cacheKey] = results;
                    }
                    resolve(results);
                }, reject);
            }
        });
    };


    //Retrieve main entity record + list of related records from a many to many relation.
    //To access the main record - inspect result[0] (it's a retrieve multiple).
    //To access the related entity records - inspect the result[0].<relationship_name> array (it's an array of the related records).
    elad_commons_obj.RetrieveMultipleRecordsManyToMany = function (entityLogicalName, mainEntityColumns, mainEntityFilter, relationshipLogicalName, relatedEntitiesColumns, forceNotCached) {
        console.log("RetrieveMultipleRecordsManyToMany Started");

        var extendedData = "$expand=" + relationshipLogicalName + "($select=" + relatedEntitiesColumns + ")";
        var queryOptions = elad_commons_obj.Query(mainEntityColumns, mainEntityFilter, extendedData);
        var cacheKey = [entityLogicalName, queryOptions].join('');

        return new Promise(function (resolve, reject) {
            try {
                if (!forceNotCached && elad_commons_obj.DataCache[cacheKey] != null) {
                    resolve(elad_commons_obj.DataCache[cacheKey]);
                }
                else {
                    Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, queryOptions).then(
                        function (results) {

                            if (results == null || results.entities == null) {
                                reject("Error retrieving result for many to many records (" + relationshipLogicalName + ")");
                            }
                            else {

                                if (!forceNotCached)
                                    elad_commons_obj.DataCache[cacheKey] = results;

                                resolve(results.entities);
                            }
                        },
                        function (error) {
                            reject(error);
                        });
                }
            }
            catch (error) {
                reject(error);
            }
        });
    };

    elad_commons_obj.RetrieveMultipleRecordsCount = function (entityName, countedAttribute, filterType, conditions) {
        return new Promise(function (resolve, reject) {
            try {
                var fetch = '?fetchXml=';
                fetch += '<fetch version="1.0" output-format="xml-platform" aggregate="true" mapping="logical" distinct="false">' +
                    '<entity name="' + entityName + '">' +
                    '<attribute name="' + countedAttribute + '" aggregate="count" alias="count"/>';

                if (filterType != null && conditions != null) {
                    fetch += '<filter type="' + filterType + '">';
                    fetch += conditions;
                    fetch += '</filter>';
                }

                fetch += '</entity>';
                fetch += '</fetch>';

                elad_commons_obj.RetrieveMultipleRecords("el_attached_document", fetch, null, true).then(
                    function (results) {
                        resolve(results == null || results.length <= 0 || results[0] == null || results[0].count == null ? 0 : results[0].count);
                    },
                    function (error) {
                        reject(error);
                    });
            }
            catch (error) {
                reject(error);
            }
        });
    };

    elad_commons_obj.RecordsCountCondition = function (entityName, countedAttribute, filterType, conditions, conditionOperator, compareToValue) {
        return new Promise(function (resolve, reject) {
            elad_commons_obj.RetrieveMultipleRecordsCount(entityName, countedAttribute, filterType, conditions).then(
                function (result) {

                    switch (conditionOperator) {
                        case elad_commons_obj.ConditionOperator.Equal:
                            resolve(result == compareToValue);
                            break;
                        case elad_commons_obj.ConditionOperator.LessThan:
                            resolve(result < compareToValue);
                            break;
                        case elad_commons_obj.ConditionOperator.GreaterThan:
                            resolve(result > compareToValue);
                            break;
                        case elad_commons_obj.ConditionOperator.LessThanOrEqual:
                            resolve(result <= compareToValue);
                            break;
                        case elad_commons_obj.ConditionOperator.GreaterThanOrEqual:
                            resolve(result >= compareToValue);
                            break;
                        default:
                            resolve(false);
                            break;
                    }
                },
                function (error) {
                    elad_commons_obj.HandlePageErrorAndIndicator("elad_commons_obj.RecordsCountCondition Error:", error, "\n(אין פרטי שגיאה להצגה)", "", "RecordsCountCondition", false, true);
                    reject(error);
                }
            )
        })
    };

    elad_commons_obj.MergeODataLookupFields = function (record) {
        if (!record || typeof record !== "object") {
            return record;
        }

        Object.keys(record).forEach(function (key) {
            if (!key || key.indexOf("_") !== 0 || key.lastIndexOf("_value") !== key.length - 6) {
                return;
            }

            var navPropertyKey = key + "@Microsoft.Dynamics.CRM.associatednavigationproperty";
            var logicalNameKey = key + "@Microsoft.Dynamics.CRM.lookuplogicalname";
            var formattedValueKey = key + "@OData.Community.Display.V1.FormattedValue";
            var idValue = record[key];
            var fallbackPropertyName = key.substring(1, key.length - 6);
            var propertyName = record[navPropertyKey] || fallbackPropertyName;

            if (!propertyName || record[propertyName] != null) {
                return;
            }

            record[propertyName] = {
                id: idValue,
                entityname: record[formattedValueKey] || null,
                entitytype: record[logicalNameKey] || null
            };
        });

        return record;
    };

    elad_commons_obj.RetrieveRecord = function (entityLogicalName, id, options, forceNotCached) {
        var id = elad_commons_obj.StripGuid(id);
        var cacheKey = [entityLogicalName, '(', id, ')?', options].join('');
        return new Promise(function (resolve, reject) {
            if (!forceNotCached && elad_commons_obj.DataCache[cacheKey] != null) {
                resolve(elad_commons_obj.DataCache[cacheKey]);
            }
            else {
                Xrm.WebApi.retrieveRecord(entityLogicalName, id, options).then(function (result) {
                    result = elad_commons_obj.MergeODataLookupFields(result);
                    if (!forceNotCached) {
                        elad_commons_obj.DataCache[cacheKey] = result;
                    }
                    resolve(result);
                }, reject);
            }
        });
    };

    elad_commons_obj.RTLString = function (str) {
        return [unescape("%u200F%u200F"), str, unescape("%u200F")].join('');
    };

    elad_commons_obj.Query = function (select, filter, other) {
        var query = [];

        var queryStarted = false;

        function addPartSeparator() {
            if (!queryStarted) {
                query.push("?");
                queryStarted = true;
            }
            else {
                query.push("&");
            }
        };

        if (select != null) {
            addPartSeparator();
            query.push("$select=", select);
        }

        if (filter != null) {
            addPartSeparator();
            query.push("$filter=", filter);
        }

        if (other != null) {
            addPartSeparator();
            query.push(other);
        }

        return query.join("");
    };

    elad_commons_obj.StripGuid = function (id) {
        return id.replace('{', '').replace('}', '');
    };

    elad_commons_obj.GuidsEqual = function (id1, id2) {
        id1 = elad_commons_obj.StripGuid(id1).toLowerCase();
        id2 = elad_commons_obj.StripGuid(id2).toLowerCase();
        return (id1 == id2);
    };

    elad_commons_obj.TestIsraeliPhoneNumber = function (israeliPhoneNumber) {
        var regExp = new RegExp(/^[0|1][1-9][0-9]?-?[1-9][0-9]{6}$/);
        return regExp.test(israeliPhoneNumber);
    };

    elad_commons_obj.TestName = function (name) {
        var regExp = new RegExp(/(\d|[a-z]|[A-Z])/);
        return !regExp.test(name);
    };
    elad_commons_obj.TestStringNoNumbers = function (name) {
        var regExp = new RegExp(/\d/);
        return !regExp.test(name);
    };

    elad_commons_obj.TestNameExtended = function (name) {
        var regExp = new RegExp(/^[a-z\u05D0-\u05EA ',"]+$/i);
        return regExp.test(name);
    };

    elad_commons_obj.TestPhone = function (phone) {
        var regExp = new RegExp(/([a-z]|[A-Z]|[\u05D0-\u05EA])/);
        return !regExp.test(phone);
    };

    elad_commons_obj.TestPhoneExtended = function (phone) {
        var regExp = new RegExp(/^0[5|7]{1}[\d]{1}[-]{0,1}\d{7}$/);
        return regExp.test(phone);
    };

    elad_commons_obj.TestNumerical = function (value) {
        var regExp = new RegExp(/^\d+$/)
        return regExp.test(value);
    };

    elad_commons_obj.TestEmail = function (email) {
        var regExp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        return regExp.test(email);
    };

    elad_commons_obj.SetTabVisibility = function (tabName, isVisible) {
        var formContext = elad_commons_obj.GetFormContext();
        if (formContext) {
            var tab = formContext.ui.tabs.get(tabName);
            if (tab != null) {
                tab.setVisible(isVisible);
            }
        }
    };

    elad_commons_obj.SetSectionVisibility = function (tabName, sectionName, flag) {
        var formContext = elad_commons_obj.GetFormContext();
        if (formContext) {
            var tab = formContext.ui.tabs.get(tabName);
            if (tab == null) return;
            var sec = tab.sections.get(sectionName);
            if (sec == null) return;
            sec.setVisible(flag);
        }
    };

    elad_commons_obj.HandlePageErrorAndIndicator = function (errorPrefix, error, noErrorMessage, errorSuffix, methodName, isShowMessageToUser, isUserFriendlyMessage) {
        errorPrefix = errorPrefix ? errorPrefix : "";
        noErrorMessage = noErrorMessage ? noErrorMessage : "no error message";
        errorSuffix = errorSuffix ? errorSuffix : "";

        var errorMessage = errorPrefix + (error ? (error.message ? error.message : error) : noErrorMessage) + errorSuffix;

        if (isUserFriendlyMessage) {
            Xrm.Navigation.openErrorDialog({ message: errorMessage, details: errorMessage });
            elad_commons_obj.HandleScriptErrors(errorMessage, methodName, false);
        }
        else {
            elad_commons_obj.HandleScriptErrors(errorMessage, methodName, isShowMessageToUser);
        }

        elad_commons_obj.CloseProgressIndicator();
    }

    elad_commons_obj.HandleScriptErrors = function (error, functionName, showErrorMessageToUser) {
        console.log((error ? (error.message ? error.message : "error:" + error) : "no error data") +
            " - " + (error && error.inerror && error.inerror.message ? error.inerror.message : "(No inner msg)"));

        if (showErrorMessageToUser && (showErrorMessageToUser == true || showErrorMessageToUser.toLowerCase() == "true"))
            elad_commons_obj.PageErrorHandler(error, functionName);
    }

    elad_commons_obj.PageErrorHandler = function (err, methodName, isGeneralError) {
        var msg = null;
        var error = err != null && err.message ? err.message : err;

        if (methodName != null && error != null) {
            msg = ["Error in ", methodName, ": ", error].join("");
            Xrm.Navigation.openErrorDialog({
                message: msg, details: msg
            });
        }
        else if (error != null) {
            msg = [(isGeneralError ? "Error: " : "Error in callback function: "), error].join("");
            Xrm.Navigation.openErrorDialog({
                message: msg, details: msg
            });
        }
    };

    elad_commons_obj.OpenErrorDialog = function (error, isWriteToConsole = true, isShowToUser = true, title = null) {
        var errorMsg = elad_commons_obj.GetErrorMessageFromError(error, "לא נמצא תוכן שגיאה להצגה!");
        title = title != null ? title : ((error && error.title ? error.title + ": " : "") + errorMsg);

        if (isWriteToConsole)
            console.error(title + ": " + errorMsg);

        //message: is the text that the user sees in the message
        //details: is the extended data in the text file that can be downloaded from the error dialog.
        if (isShowToUser)
            Xrm.Navigation.openErrorDialog({ message: title, details: errorMsg });
    };

    elad_commons_obj.PageInfoHandler = function (msg, methodName) {
        var formContext = elad_commons_obj.GetFormContext();

        if (formContext != null && methodName != null && msg != null) {
            formContext.ui.setFormNotification(msg, "INFO", methodName);
        }
    };

    elad_commons_obj.PageWarningHandler = function (msg, methodName) {
        var formContext = elad_commons_obj.GetFormContext();

        if (formContext != null && methodName != null && msg != null) {
            formContext.ui.setFormNotification([msg].join(""), "WARNING", methodName);
        }
    };

    elad_commons_obj.PageClearMessages = function (methodName) {
        var formContext = elad_commons_obj.GetFormContext();

        if (formContext != null && methodName != null) {
            formContext.ui.clearFormNotification(methodName);
        }
    };

    elad_commons_obj.StringBlankOrEmpty = function (stringValue) {
        if (stringValue) {
            return (stringValue.length === 0 && !stringValue.trim());
        }
        return true;
    };

    elad_commons_obj.GetCurrentViewName = function () {
        if (!elad_commons_obj._formContext)
            return null;
        if (!elad_commons_obj._formContext.getViewSelector || !elad_commons_obj._formContext.getViewSelector().getCurrentView)
            return null;
        var view = elad_commons_obj._formContext.getViewSelector().getCurrentView();
        if (!view)
            return null;
        return view.name;
    };

    elad_commons_obj.GetCurrentViewId = function () {
        if (!elad_commons_obj._formContext)
            return null;
        var url = elad_commons_obj._formContext.getUrl();
        var searchParam = "viewId=%7B";
        var GUID_LENGTH = 36;
        var start = url.indexOf(searchParam);
        if (start == -1)
            return null;
        else {
            return url.substring(start + searchParam.length, start + searchParam.length + GUID_LENGTH);
        }
    };

    elad_commons_obj.Delay = function (t, v) {
        return new Promise(function (resolve) {
            setTimeout(resolve.bind(null, v), t)
        });
    }

    elad_commons_obj.getGlobalContext = function () {
        if (elad_commons_obj.globalContext)
            return elad_commons_obj.globalContext;
        elad_commons_obj.globalContext = Xrm.Utility.getGlobalContext();
        return elad_commons_obj.globalContext;
    }

    elad_commons_obj.GetClientUrl = function () {
        var globalContext = Xrm.Utility.getGlobalContext();
        if (globalContext)
            return globalContext.getClientUrl();

        return null;
    }

    elad_commons_obj.isNullOrEmpty = function (value) {
        return (value == null || value === "");
    }

    elad_commons_obj.openUrl = function (url, urlOptions) {
        Xrm.Navigation.openUrl(url, (urlOptions == null ? null : urlOptions));
    }

    elad_commons_obj.openGridInNewtab = function (viewControl) {
        var url = viewControl.getUrl().toLowerCase();
        var urlOptions = {
            height: 200,
            width: 300
        }
        Xrm.Navigation.openUrl(url, urlOptions);
    }


    elad_commons_obj.isUrlContains = function (param) {
        return window.parent.location.href.includes(param);
    }

    /*
     * elad_commons_obj.NavigateToView:
     * --------------------------------
     * The purpose of this function is to replace "Xrm.Navigation.navigateTo(<view details>)", because it's unsupported on-premise.
     */
    //elad_commons_obj.NavigateToView = function (viewid, entityName) {
    //    var globalContext = Xrm.Utility.getGlobalContext();

    //    if (globalContext) {
    //        var clientUrl = globalContext.getClientUrl();

    //        if (elad_commons_obj.MichaelViews.APPID == null || elad_commons_obj.MichaelViews.APPID == "") {
    //            Xrm.Utility.getGlobalContext().getCurrentAppProperties().then(function (result) {
    //                if (result != null) {
    //                    elad_commons_obj.MichaelViews.APPID = result.appId;
    //                    window.top.location.href = clientUrl + '/main.aspx?appid=' + elad_commons_obj.MichaelViews.APPID + '&pagetype=entitylist&etn=' + entityName + '&viewid=' + viewid + '&viewType=' + elad_commons_obj.ViewType.SYSTEM_VIEW;
    //                }
    //            });
    //        }
    //        else {
    //            window.top.location.href = clientUrl + '/main.aspx?appid=' + elad_commons_obj.MichaelViews.APPID + '&pagetype=entitylist&etn=' + entityName + '&viewid=' + viewid + '&viewType=' + elad_commons_obj.ViewType.SYSTEM_VIEW;;
    //        }
    //    }
    //};

    /*
     * Function: navigate the user away from its current location
     *
     * Parameters:
     *  - closePage: wheter you want to close the form you are in and go back or navigate to a given view
     *  - viewId: the id of the view you want to navigate to.
     *  - entityName: the name of the entity you want to navigate to its view.
     */
    elad_commons_obj.NavigateAway = function (navigateToView, viewId = null, entityName = null) {
        if (elad_commons_obj.IsMobile() || !navigateToView)
            //For tablet: the behavior will be: close form and go back to previous page (formContext.ui.Close(), from common.js)
            elad_commons_obj.ClosePage();
        else if (navigateToView && viewId && entityName)
            elad_commons_obj.NavigateToView(viewId, entityName);
    }

    elad_commons_obj.ConvertMapToObject = function (map) {
        const out = Object.create(null);
        map.forEach((value, key) => {
            if (value instanceof Map) {
                out[key] = map_to_object(value);
            }
            else {
                out[key] = value;
            }
        })
        return out;
    };

    elad_commons_obj.toQueryString = function (obj) {
        var parts = [];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                parts.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
            }
        }
        return "?data=" + parts.join("&");
    }

    elad_commons_obj.IsValidIsraeliId = function (id) {
        if (!id && id !== 0)
            return false;

        if (id.length > 9)
            return false;

        if ((/^0*$/).test(id))
            return false;

        id = id.length < 9 ? ("00000000" + id).slice(-9) : id;

        var idDigitSum = 0;
        var idAllDigitsSum = 0

        for (var i = 0; i < 9; i++) {
            idDigitSum = Number(id[i]) * ((i % 2) + 1);
            idAllDigitsSum += (idDigitSum > 9) ? idDigitSum - 9 : idDigitSum;
        }

        return (idAllDigitsSum % 10 === 0);
    };

    elad_commons_obj.GetDataLoadState = function (context) {
        if (context) {
            return context.getEventArgs().getDataLoadState();
        }
        return null;
    };

    elad_commons_obj.ValidateAndInitializeDateTimeField = function (fieldName) {
        var dateTimeFieldValue = elad_commons_obj.GetFieldValue(fieldName);

        if (!dateTimeFieldValue) {
            elad_commons_obj.ClearNotification(fieldName, fieldName + "_error");
            return -1; // Means error or field is null
        }

        var currentTime = new Date();
        var currentDate = new Date();

        currentDate.setHours(0, 0, 0, 0)

        if (dateTimeFieldValue.getTime() < currentDate.getTime()) {
            elad_commons_obj.SetNotification(fieldName, "אין להכניס תאריך שחלף", fieldName + "_error");
            return 0; // Means the date in the field has passed
        }
        else if (dateTimeFieldValue.toDateString() === currentDate.toDateString()) {
            if (dateTimeFieldValue.getTime() < currentTime.getTime()) {
                if (dateTimeFieldValue.getHours() == 0) {
                    dateTimeFieldValue.setHours(currentTime.getHours() + 1);
                    elad_commons_obj.SetFieldValue(fieldName, dateTimeFieldValue);
                }
                else {
                    elad_commons_obj.SetNotification(fieldName, "אין להכניס זמן שחלף", fieldName + "_error");
                    return 0;
                }
            }
        }
        else {
            if (dateTimeFieldValue.getHours() == 0) {
                dateTimeFieldValue.setHours(8);
                elad_commons_obj.SetFieldValue(fieldName, dateTimeFieldValue);
            }
        }

        elad_commons_obj.ClearNotification(fieldName, fieldName + "_error");

        return 1; // Means everything is ok
    };

    elad_commons_obj.GetFormattedDate = function (date, dateFormat, isTimeBeforeDate, dateSapratorChar = "/", timeSaprtorChar = ":") {
        var year = date.getFullYear();
        var month = (1 + date.getMonth()).toString();
        month = month.length > 1 ? month : "0" + month;
        var day = date.getDate().toString();
        day = day.length > 1 ? day : "0" + day;

        var hours = date.getHours().toString();
        hours = hours.length > 1 ? hours : "0" + hours;
        var minutes = date.getMinutes().toString();
        minutes = minutes.length > 1 ? minutes : "0" + minutes;

        var fullDateTime = "";

        switch (dateFormat) {
            case elad_commons_obj.TypeOfDateFormat.OnlyDate:
                fullDateTime = day + dateSapratorChar + month + dateSapratorChar + year;
                break;

            case elad_commons_obj.TypeOfDateFormat.OnlyTime:
                fullDateTime = hours + timeSaprtorChar + minutes;
                break;

            case elad_commons_obj.TypeOfDateFormat.DateAndTime:
                if (isTimeBeforeDate)
                    fullDateTime = hours + timeSaprtorChar + minutes + " " + day + dateSapratorChar + month + dateSapratorChar + year;
                else
                    fullDateTime = day + dateSapratorChar + month + dateSapratorChar + year + " " + hours + timeSaprtorChar + minutes;

                break;

            default:
                break;
        }
        return fullDateTime;
    };

    elad_commons_obj.ValidateStartEndDateTimeFields = function (startDateField, endDateField) {
        var startDate = elad_commons_obj.GetFieldValue(startDateField);
        var endDate = elad_commons_obj.GetFieldValue(endDateField);

        if (endDate < startDate) {
            elad_commons_obj.SetNotification(endDateField, "אין להכניס תאריך הקודם לזמן התחלה", "endTimeError");
            return false;
        }

        elad_commons_obj.ClearNotification(endDateField, "endTimeError");
        return true;
    };

    elad_commons_obj.IsDateAfterOtherDate = function (firstDate, secondDate, isOnlyCompareDates, isOnOrAfter, isDateOnly) {
        if (isDateOnly) {
            firstDate = firstDate.setHours(0, 0, 0, 0);
            secondDate = secondDate.setHours(0, 0, 0, 0);
        }
        else {
            firstDate = firstDate.getTime();
            secondDate = secondDate.getTime();
        }

        return (isOnlyCompareDates ? firstDate == secondDate : (isOnOrAfter ? firstDate >= secondDate : firstDate > secondDate));
    };

    elad_commons_obj.ConvertStringDdMmYyyyToDate = function (stringDate, divider) {
        var stringDatePartsArray = stringDate.split(divider);

        if (stringDatePartsArray.length != 3)
            return null;

        return new Date(+stringDatePartsArray[2], stringDatePartsArray[1] - 1, +stringDatePartsArray[0]);
    }

    //Code is duplicated in server-side: CommonLogic --> GetExtendedDateByBusinessDays. Code changes here require changes in server side as well.
    elad_commons_obj.GetExtendedDateByBusinessDays = function (startDate, intervalInDays, isOnlyLastDateAsBusinessDay = false) {
        return new Promise(
            function (resolve, reject) {
                if (Object.prototype.toString.call(startDate) === '[object Date]' && startDate && intervalInDays != null && !isNaN(intervalInDays) && intervalInDays >= 0) {
                    elad_commons_obj.GetBreakPeriods().then(
                        function (result) {
                            if (result) {
                                var extensionDaysForCalculation = intervalInDays;
                                var dateAfterExtension = new Date(startDate);

                                if (isOnlyLastDateAsBusinessDay) {
                                    dateAfterExtension.setDate(dateAfterExtension.getDate() + extensionDaysForCalculation);
                                    var isBreakPeriodCalculationEnded = false;

                                    while (!isBreakPeriodCalculationEnded) {
                                        isBreakPeriodCalculationEnded = true;

                                        for (var i = 0; i < result.length; i++) //This function has to be re-validated if used.
                                            if (result[i].startDate <= dateAfterExtension && result[i].endDate >= dateAfterExtension) {
                                                dateAfterExtension.setDate((result[i].endDate.getDate() + 1));
                                                isBreakPeriodCalculationEnded = false;
                                            }

                                        if (dateAfterExtension.getDay() == 5 || dateAfterExtension.getDay() == 6) {
                                            isBreakPeriodCalculationEnded = false;
                                            dateAfterExtension.setDate(dateAfterExtension.getDate() + (dateAfterExtension.getDay() == 5 ? 2 : (dateAfterExtension.getDay() == 6 ? 1 : 0)));
                                        }
                                    }
                                }
                                else {
                                    while (extensionDaysForCalculation > 1) {//Until > 1 and not > 0 because counting starts from current day and not the day after.
                                        for (var i = 0; i < result.length; i++)
                                            if (result[i].startDate <= dateAfterExtension && result[i].endDate >= dateAfterExtension)
                                                dateAfterExtension.setDate(result[i].endDate.getDate());

                                        if (dateAfterExtension.getDay() != 5 && dateAfterExtension.getDay() != 6)
                                            extensionDaysForCalculation--;

                                        dateAfterExtension.setDate(dateAfterExtension.getDate() + 1);
                                    }
                                }

                                resolve(dateAfterExtension);
                            }
                            else {
                                reject(error);
                            }
                        },
                        function (error) {
                            reject(error);
                        }
                    );
                }
                else {
                    reject(new Error("Invalid input parameters"));
                }
            }
        );
    };

    //Code is duplicated in server-side: CommonLogic --> GetBreakPeriods. Code changes here require changes in server side as well.
    elad_commons_obj.GetBreakPeriods = function () {
        return new Promise(
            function (resolve, reject) {
                if (elad_commons_obj.DataCache[elad_commons_obj.SanctionCaseBreakPeriodsConfigName] != null) {
                    resolve(elad_commons_obj.DataCache[elad_commons_obj.SanctionCaseBreakPeriodsConfigName]);
                }
                else {
                    elad_commons_obj.SanctionConfigurationRetrieveAndLogic(elad_commons_obj.SanctionCaseBreakPeriodsConfigName, "el_s_break_periods").then(
                        function (result) {
                            if (result && result.length == 1 && result[0].el_s_break_periods) {
                                var breakPeriodDatesStringArray = null;
                                var breakPeriodStringArray = result[0].el_s_break_periods.split("|");
                                var breakPeriods = new Array(breakPeriodStringArray.length);

                                for (var i = 0; i < breakPeriodStringArray.length; i++) {
                                    breakPeriodDatesStringArray = breakPeriodStringArray[i].split("-");

                                    if (breakPeriodDatesStringArray.length == 2) {
                                        breakPeriods[i] = new Object();
                                        breakPeriods[i].startDate = elad_commons_obj.ConvertStringDdMmYyyyToDate(breakPeriodDatesStringArray[0], "/");
                                        breakPeriods[i].endDate = elad_commons_obj.ConvertStringDdMmYyyyToDate(breakPeriodDatesStringArray[1], "/");
                                    }
                                }

                                elad_commons_obj.DataCache[elad_commons_obj.SanctionCaseBreakPeriodsConfigName] = breakPeriods;
                                resolve(breakPeriods);
                            }
                            else {
                                reject(new Error("Could not find sanction configuration by the name " + sanctionCaseConfigurationRecordsNames.breakPeriods));
                            }
                        },
                        function (error) {
                            reject(error);
                        }
                    );
                }
            }
        );
    }

    //Temporary fix for date & time field bug (clock icon within the time value) - until Microsoft's fix
    elad_commons_obj.FixClockLocation = function () {
        //#unsupported
        window.setInterval(function () {
            top.$(".ms-ComboBox-Input").css("padding-right", "30px");
        }, 1000);
    };

    //Temporary fix for date field bug (calendar icon within the date value) - until Microsoft's fix
    elad_commons_obj.FixCalendarLocation = function () {
        //#unsupported
        window.setInterval(function () {
            top.$(".iconStyle-65").css("right", "-15px");//el_investigation
            top.$(".iconStyle-38").css("right", "-15px");//report
            top.$(".iconStyle-66").css("right", "-15px");//el_coordinatingsummonsforinvestigator

        }, 1000);
    }

    elad_commons_obj.ShowFieldNotEmpty = function (fieldName) {
        var fieldValue = elad_commons_obj.GetFieldValue(fieldName);

        if (fieldValue != "" && fieldValue != null)
            elad_commons_obj.SetVisible(fieldName, true);
        else
            elad_commons_obj.SetVisible(fieldName, false);
    }

    elad_commons_obj.CreateGuid = function () {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }

    elad_commons_obj.CreateRecordWebApi = function (entityLogicalName, data) {
        return Xrm.WebApi.createRecord(entityLogicalName, data);
    }

    elad_commons_obj.CallGlobalAction = function (actionName, data, successCallback, errorCallback) {
        var req = new XMLHttpRequest();
        req.open("POST", elad_commons_obj.GetClientUrl() + "/api/data/v9.1/" + actionName, true);
        req.setRequestHeader("OData-MaxVersion", "4.0");
        req.setRequestHeader("OData-Version", "4.0");
        req.setRequestHeader("Accept", "application/json");
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = function () {
            if (this.readyState === 4) {
                req.onreadystatechange = null;
                if (this.status === 204) {
                    successCallback(req.response);
                } else {
                    errorCallback("Error in elad_commons_obj.CallGlobalAction: the status code is: " + this.status + " and the response is: " + this.responseText)
                }
            }
        };
        req.send(JSON.stringify(data));
    }

    elad_commons_obj.executeRequest = function (req, successCallback, errorCallback) {
        Xrm.WebApi.online.execute(req).then(
            function (result) {
                if (result.ok) {
                    result.json().then(function (response) {
                        if (successCallback)
                            successCallback(response)
                    }, function (error) {
                        elad_commons_obj.HandlePageErrorAndIndicator("executeRequest error: ", error, "\n(אין פרטי שגיאה להצגה)", "", "executeRequest", false, true);
                    });
                }
                else {
                    if (errorCallback)
                        errorCallback(response);
                }
            },
            function (error) {
                if (errorCallback)
                    errorCallback(error);
            }
        );
    }

    elad_commons_obj.OpenConfirmDialog = function (confirmText, confirmTitle, okButtonLabel, cancelButtonLabel, heightInit, widthInit) {
        var confirmStrings = {
            text: confirmText,
            title: confirmTitle,
            confirmButtonLabel: okButtonLabel != null ? okButtonLabel : "OK",
            cancelButtonLabel: cancelButtonLabel != null ? cancelButtonLabel : "Cancel"
        };
        var confirmOptions = {
            height: (heightInit != null && !isNaN(heightInit) && heightInit > 0 ? heightInit : 200),
            width: (widthInit != null && !isNaN(widthInit) && widthInit > 0 ? widthInit : 450)
        };
        return Xrm.Navigation.openConfirmDialog(confirmStrings, confirmOptions);
    }

    elad_commons_obj.LockAllFieldsInForm = function () {
        var formContext = elad_commons_obj.GetFormContext();
        formContext.ui.controls.forEach(function (control, index) {
            var controlType = control.getControlType();
            if (controlType != "iframe" && controlType != "webresource" && controlType != "subgrid") {
                control.setDisabled(true);
            }
        });
    }

    elad_commons_obj.GetTab = function (tabName) {
        var formContext = elad_commons_obj.GetFormContext();
        if (formContext) {
            return formContext.ui.tabs.get(tabName);
        }
    };

    elad_commons_obj.OpenEntityForm = function (entityFormOptions, formParameters, successCallback, errorCallback) {
        if (!entityFormOptions) {
            elad_commons_obj.PageErrorHandler("הועברו פרמטרים ללא ערך", "OpenEntityForm");
            return;
        }
        var parameters = formParameters != null ? formParameters : null;
        if (successCallback && errorCallback)
            Xrm.Navigation.openForm(entityFormOptions, parameters).then(successCallback, errorCallback);
        else
            Xrm.Navigation.openForm(entityFormOptions, parameters);
    };

    elad_commons_obj.EntityFormOptions = function (entityName, entityId, openInNewWindow, createFromEntity, useQuickCreateForm) {
        var res = {};
        if (entityName)
            res["entityName"] = entityName;
        else
            return null;

        if (entityId)
            res["entityId"] = entityId;

        if (openInNewWindow)
            res["openInNewWindow"] = openInNewWindow;
        else
            res["openInNewWindow"] = false;

        if (createFromEntity)
            res["createFromEntity"] = createFromEntity;
        if (useQuickCreateForm)
            res["useQuickCreateForm"] = useQuickCreateForm;
        return res;
    };

    elad_commons_obj.GetGlobalParameterValueByName = function (fieldNameValue) {
        return new Promise(function (resolve, reject) {
            try {
                var options = "?$select=el_s_value&$filter=el_name eq '" + fieldNameValue + "'";
                elad_commons_obj.RetrieveMultipleRecords("el_general_system_parameter", options, null, false).then(
                    function (response) {
                        if (response != null && response.length == 1 && response[0] != null && response[0].el_s_value != null) {
                            resolve(response[0].el_s_value);
                        } else {
                            var errorMessage = (response == null || response.length <= 0 ? "No system parameter exists for record name: " + fieldNameValue :
                                (response.length == 1 && response[0].el_s_value == null ? "System parameter record " + fieldNameValue + " has no value" :
                                    "There are " + response.length + " system parameter for record name: " + fieldNameValue));
                            reject(errorMessage);
                        }
                    },
                    function (error) {
                        reject(error);
                    });
            } catch (error) {
                reject("Error retrieving multiple + \"" + systemSettingsRecordName + "\" records from system: " + elad_commons_obj.GetErrorMessageFromError(error))
            }
        });
    };

    elad_commons_obj.GetErrorMessageFromError = function (error, defaultErrorMessage) {
        return (error && error.message ? error.message : (error ? error : (defaultErrorMessage ? defaultErrorMessage : "no error details")));
    };

    /*
    *   The function get a array of security roles names and
    *   checks if the one of roles equals to the security
    *   roles of current user.
    */
    elad_commons_obj.IsCurrentUserInSecurityRolesArrayGeneric = function (securityArrayRoles, excludeAdmin) {
        return new Promise(function (resolve, reject) {
            if (securityArrayRoles == null || securityArrayRoles == undefined) {
                reject("No security roles exist!");
                return;
            }
            var securityRolesFromSysParamArr = Array.isArray(securityArrayRoles) ? securityArrayRoles : [securityArrayRoles];
            try {
                elad_commons_obj.GetCurrentUserSecurityRoles().then(
                    function (currentUserSecurityRolesObject) {
                        if (currentUserSecurityRolesObject != null) {
                            currentUserSecurityRolesObject = Object.keys(currentUserSecurityRolesObject).filter(key => currentUserSecurityRolesObject[key] === 1);
                            for (var i = 0; i < securityRolesFromSysParamArr.length; i++) {
                                for (var k = 0; k < currentUserSecurityRolesObject.length; k++) {
                                    if (currentUserSecurityRolesObject[k] == securityRolesFromSysParamArr[i]
                                        || (!excludeAdmin && (currentUserSecurityRolesObject[k] == "מנהל מערכת" || currentUserSecurityRolesObject[k] == "System Administrator"))) {
                                        resolve(true);
                                        return;
                                    }
                                }
                            }
                            resolve(false);
                        }
                    }, function (error) {
                        reject(error);
                    });

            } catch (error) {
                reject(error);
            }
        });
    };

    elad_commons_obj.SetFormNotification = function (message, level, uniqueId) {
        var formContext = elad_commons_obj.GetFormContext();
        formContext.ui.setFormNotification(message, level, uniqueId);
    };

    elad_commons_obj.isValidIsraeliPhoneNumber = function (phoneNumber) {
        if (!phoneNumber) {
            return false;
        }

        phoneNumber = phoneNumber.toString().replace(/[\s\-()]/g, "");

        if (phoneNumber.startsWith("+972")) {
            phoneNumber = "0" + phoneNumber.slice(4);
        }

        const phoneRegex = /^0(2|3|4|8|9|7[1-46-9]|5[0-578])[2-9][0-9]{6}$/;

        return phoneRegex.test(phoneNumber);
    }

    elad_commons_obj.EnsureAtLeastOneFieldHasValue = function (fields) {
        var atLeastOne = false;
        var emptyFields = [];

        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            if (elad_commons_obj.GetFieldValue(field) !== null) {
                atLeastOne = true;
                elad_commons_obj.SetRequiredLevel(field, "required");
            } else {
                emptyFields.push(field);
            }
        }

        for (var j = 0; j < emptyFields.length; j++) {
            var field = emptyFields[j];
            if (atLeastOne === true) {
                elad_commons_obj.SetRequiredLevel(field, "none");
            } else {
                elad_commons_obj.SetRequiredLevel(field, "required");
            }
        }

        return atLeastOne;
    };


    elad_commons_obj.getAccountData = function (accountId, successCallback, errorCallback) {

        var query =
            "?$select=el_dt_date_of_birth," +
            "el_s_first_name," +
            "el_s_idnumber_text," +
            "el_s_last_name," +
            "emailaddress1," +
            "fax," +
            "telephone1," +
            "telephone2," +
            "name" +

            "&$expand=" +
            "el_el_address_account(" +
            "$select=" +
            "el_s_city_text," +
            "el_s_name," +
            "el_id_city," +
            "el_id_pob_city," +
            "el_id_street," +
            "el_id_street_synonym," +
            "el_s_street_text," +
            "el_n_house_number," +
            "el_n_old_zip," +
            "el_n_zip," +
            "el_n_pob_zip," +
            "el_s_entrance," +
            "el_n_pob" +
            ")," +

            "el_id_type_account(" +
            "$select=el_n_id_type_code" +
            ")";

        return Xrm.WebApi.retrieveRecord("account", accountId, query)
            .then(
                function (result) {

                    if (successCallback) {
                        successCallback(result);
                    }
                    return result;
                },
                function (error) {

                    console.log(error.message);

                    if (errorCallback) {
                        errorCallback(error);
                    }
                    throw error;
                }
            );
    };

    /**
     * Method for refresh web resource
     * @param {String} webresourceName
     */
    elad_commons_obj.RefreshWebResourceArea = function (webresourceName) {
        var webResourceControl = elad_commons_obj.GetControl(webresourceName);
        if (webResourceControl) {
            var src = webResourceControl.getSrc();
            webResourceControl.setSrc("about:blank");
            webResourceControl.setSrc(src);
        }
        else
            elad_commons_obj.SetFormNotification("elad_commons_obj.RefreshWebResourceArea(): Web resource control with name '" + webresourceName + "' dose not existed !", elad_commons_obj.FormNotificationLevel.WARNING, "elad_commons_obj.RefreshWebResourceArea");
    }

    /**
     * Method check if a current user has specific security role or is Admin
     * @param {String} roleName
     */
    elad_commons_obj.UserHasRoleOrIsAdmin = function (roleName) {
        return new Promise(function (resolve, reject) {
            elad_commons_obj.GetCurrentUserSecurityRoles()
                .then(
                    function (userRoles) {
                        Object.keys(userRoles).forEach(rName => {
                            if (rName === roleName || rName === "מנהל מערכת") {
                                resolve(true);
                            }
                        });
                        resolve(false);
                    },
                    err => reject(err)
                )
        })
    }
    elad_commons_obj.UserHasRole = function (roleName) {
        return new Promise(function (resolve, reject) {
            elad_commons_obj.GetCurrentUserSecurityRoles()
                .then(
                    function (userRoles) {
                        Object.keys(userRoles).forEach(rName => {
                            if (rName === roleName ) {
                                resolve(true);
                            }
                        });
                        resolve(false);
                    },
                    err => reject(err)
                )
        })
    }

    /**
     * Method return an Opener information
     * */
    elad_commons_obj.GetOpenerEntityInfo = function () {
        try {
            var pageContext = Xrm.Utility.getPageContext();

            // Check if the current record was opened/created from another entity
            if (pageContext.input && pageContext.input.createFromEntity) {
                return {
                    openerId: pageContext.input.createFromEntity.id,
                    openerType: pageContext.input.createFromEntity.entityType
                }
            }
            return null;
        } catch (error) {
            elad_commons_obj.SetFormNotification("Error on elad_commons_obj.GetOpenerEntityInfo(): " + error.message, elad_commons_obj.FormNotificationLevel.ERROR, "elad_commons_obj.GetOpenerEntityInfo()")
        }
    }

    /**
     * Method for bavigate to other pages \ webresources by credantions
     * Replacenebt for Xrm.Internal.openDialog from CRM 8.2
     * Example on el_account.js -> checkDuplicatesOnLoad
     * @param {any} pageInput
     * @param {any} navigationOptions
     */
    elad_commons_obj.NavigateTo = function (pageInput, navigationOptions) {
        var entityType = elad_commons_obj.GetCurrentEntityName();
        var id = elad_commons_obj.GetCurrentEntityId();
        var name = elad_commons_obj.GetCurrentRecordName();
        pageInput.createFromEntity = {
            entityType: entityType,
            id: id,
            name: name
        }
        return new Promise((resolve, reject) => {
            try {
                Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                    successResponse => resolve(successResponse),
                    errorResponse => reject(errorResponse)
                )
            } catch (error) {
                reject(error);
            }
        })
    }

    elad_commons_obj.GetCurrentRecordName = function () {
        var name;
        if (elad_commons_obj.GetFieldValue("name"))
            name = elad_commons_obj.GetFieldValue("name");
        else if (elad_commons_obj.GetFieldValue("el_name"))
            name = elad_commons_obj.GetFieldValue("el_name");
        else if (elad_commons_obj.GetFieldValue("title"))
            name = elad_commons_obj.GetFieldValue("title");
        else
            name = elad_commons_obj.GetCurrentEntityName();

        return name;
    }

    /**
     * Method set an table as collapsed or expanded
     * @param {String} tabName
     * @param {String} state "expanded" OR "collapsed"
     */
    /*elad_commons_obj.SetTabDisplayState = function (tabName, state) {
        var formContext = elad_commons_obj.GetFormContext();
        if (formContext) {
            var tab = formContext.ui.tabs.get(tabName);
            if (tab && state === "expanded" || state === "collapsed") {
                tab.setDisplayState(state)
            }
        }
    }*/

    /**
     * Method set 1 callback for many fields
     * @param {Array} fieldsArray
     * @param {Function} callback
     */
    elad_commons_obj.AddOnChangeMultipleFields = function (fieldsArray, callback) {
        for (var i = 0; i < fieldsArray.length; i++) {
            elad_commons_obj.AddOnChange(fieldsArray[i], callback);
        }
    }

    /**
     * Method for execute any custom workflow
     * @param {String} workflowId
     * @param {String} entityId Entity related to workflow
     */
    elad_commons_obj.ExecuteWorkflow = function (workflowId, entityId) {

        return new Promise((resolve, reject) => {
            try {
                var executeCustomWorkflow = function (entityId, workflowId) {
                    this.EntityId = { "guid": entityId };
                    this.entity = {
                        id: workflowId,
                        entityType: "workflow"
                    };

                    this.getMetadata = function () {
                        return {
                            boundParameter: "entity",
                            parameterTypes: {
                                "entity": {
                                    "typeName": "Microsoft.Dynamics.CRM.workflow",
                                    "structuralProperty": 5
                                },
                                "EntityId": {
                                    "typeName": "Edm.Guid",
                                    "structuralProperty": 1
                                }
                            },
                            operationType: 0,
                            operationName: "ExecuteWorkflow"
                        }
                    }
                }

                elad_commons_obj.executeRequest(new executeCustomWorkflow(entityId, workflowId),

                    function (result) {

                        resolve(result);

                    },

                    function (error) {

                        reject(error);

                    })

            } catch (error) {
                reject(error);
            }
        })

    };

    /**
     * Method set a filtred result to lookup field
     * @param {String} lookupFieldName lookup schem name
     * @param {String} entityLogicalNameOfLookupField Entity logical name of lookup field
     * @param {String} filterXml Fetch xml filter <filter> </filter>
     */
    elad_commons_obj.SetCustomFilterToLookupField = function (lookupFieldName, entityLogicalNameOfLookupField, filterXml) {
        var ctr = elad_commons_obj.GetControl(lookupFieldName);
        if (ctr)
            ctr.addPreSearch(() => ctr.addCustomFilter(filterXml, entityLogicalNameOfLookupField));
        else
            return null;
    }

    /**
     * Method set many callbacks for 1 field
     * @param {String} fieldName
     * @param {FunctionsArray} callbacksArray
     */
    elad_commons_obj.AddOnChangeMultipleCallback = function (fieldName, callbacksArray) {
        for (var i = 0; i < callbacksArray.length; i++) {
            elad_commons_obj.AddOnChange(fieldName, callbacksArray[i]);
        }
    }



    elad_commons_obj.ChangeRecordStatus = function (recordId, stateCode, statusCode, entityName) {
        try {
            var updateEntity = {
                statecode: stateCode,
                statuscode: statusCode
            };

            return elad_commons_obj.UpdateRecord(
                entityName,
                elad_commons_obj.StripGuid(recordId),
                updateEntity
            ).then(function (result) {
                return result;
            });

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "common.ChangeRecordStatus");
        }
    };
    /**
     * Method update target entity with spesific data by hers Id
     * Using example into el_lead.js
     * @param {String} entityName Entity schem name
     * @param {String} recordId Guid of updated record
     * @param {Object} updateEntity Data to update into record
     */
    elad_commons_obj.updateRecord = function (entityName, recordId, updateEntity) {
        return new Promise((resolve, reject) => {
            if (entityName && recordId) {
                Xrm.WebApi.updateRecord(entityName, recordId, updateEntity)
                    .then(
                        function success(result) {
                            resolve(result)
                        },
                        err => reject(err)
                    )
                    .catch(err => reject(err))
            }
            else
                reject("There is no required args passed");
        })

    };

    // Aya - functions from el_incident
    elad_commons_obj.ToggleTab = function (tabName, visible) {
        var tab = elad_commons_obj.GetFormContext().ui.tabs.get(tabName);
        if (!tab) {
            return;
        }
        tab.setVisible(visible);
    };
    elad_commons_obj.GetLookupFieldValue = function (fieldName) {
        var lookupValue = elad_commons_obj.GetFieldValue(fieldName);

        if (lookupValue && lookupValue.length > 0) {
            return lookupValue[0];
        }

        return null;
    };
    elad_commons_obj.GetOdataDate = function (dateField) {
        try {
            if (!dateField) return "";
            dateField = dateField.replace("/Date(", "");
            dateField = dateField.replace(")/", "");
            var dateValue = new Date(parseInt(dateField, 10));
            dateValue.setDate(dateValue.getDate());
            return [dateValue.getMonth() + 1, dateValue.getDate(), dateValue.getFullYear()].join("/");
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "commons.GetOdataDate");
            return "";
        }
    };
    elad_commons_obj.deleteAllAttributesValuesInSection = function (sectionName) {
        try {
            if (!sectionName) return;
            var tabs = elad_commons_obj.GetFormContext().ui.tabs;
            for (var i = 0; i < tabs.getLength(); i++) {
                var tab = tabs.get(i);
                if (!tab) continue;
                var sections = tab.sections;
                for (var j = 0; j < sections.getLength(); j++) {
                    var section = sections.get(j);
                    if (!section || !section.getName() || section.getName().toLowerCase() !== sectionName.toLowerCase()) continue;
                    elad_commons_obj.GetFormContext().ui.controls.forEach(function (control) {
                        if (!control || !control.getParent || !control.getParent() || control.getParent().getName() !== sectionName || control.getControlType() === "subgrid" || !control.getAttribute || !control.getAttribute()) return;
                        control.getAttribute().setValue(null);
                        control.getAttribute().setSubmitMode("always");
                    });
                    break;
                }
            }
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.deleteAllAttributesValuesInSection");
        }
    };
    elad_commons_obj.replaceAll = function (txt, replace, with_this) {
        try {
            if (!txt || !replace) return txt;
            return txt.replace(new RegExp(replace, "g"), with_this);
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.replaceAll");
            return txt;
        }
    };
    elad_commons_obj.notNullParam = function (param) {
        try {
            if (param == null) return "";
            if (typeof (param) == "string") return encodeURI(elad_commons_obj.replaceAll(elad_commons_obj.replaceAll(param, "\"", ""), "`", "'"));
            return encodeURI(param);
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.notNullParam");
            return "";
        }
    };
    elad_commons_obj.notNullLookupParam = function (param) {
        try {
            if (param == null) return "";
            if (typeof (param) == "string") return elad_commons_obj.notNullParam(elad_commons_obj.replaceAll(param, "\"", ""));
            return elad_commons_obj.notNullParam(param.Name);
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.notNullLookupParam");
            return "";
        }
    };

    elad_commons_obj.GetCityCode4Params = function (address, addressType) {
        try {
            if (!address || ((!address.el_id_city || !address.el_id_city.Id) && (!address.el_id_pob_city || !address.el_id_pob_city.Id))) {
                return Promise.resolve("");
            }

            var cityId = null;

            if (addressType == "address" && address.el_id_city && address.el_id_city.Id) {
                cityId = address.el_id_city.Id;
            }

            if (addressType == "pob" && address.el_id_pob_city && address.el_id_pob_city.Id) {
                cityId = address.el_id_pob_city.Id;
            }

            if (!cityId) {
                return Promise.resolve("");
            }

            cityId = elad_commons_obj.StripGuid(cityId);

            return elad_commons_obj.RetrieveRecord("el_city", cityId, "?$select=el_n_ministry_city_code").then(function (result) {
                return result && result.el_n_ministry_city_code ? result.el_n_ministry_city_code : "";
            }).catch(function (error) {
                elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.GetCityCode4Params");
                return "";
            });

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.GetCityCode4Params");
            return Promise.resolve("");
        }
    };
    elad_commons_obj.getTypeId = function (type) {
        try {
            if (type == null || type.el_n_id_type_code == null) return "";
            return type.el_n_id_type_code < 10 ? encodeURI("0" + type.el_n_id_type_code) : encodeURI(type.el_n_id_type_code);
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.getTypeId");
            return "";
        }
    };
    elad_commons_obj.sendWhatsapp = function () {
        try {
            var telephoneAccount = null;
            var chatBrand = null;
            var service = motors.Services.XrmService.V81;
            var txtTelephone = "\nחסר טלפון ללקוח\n";
            var txtChannel = "\nלא נמצא ערוץ\n";
            var txtChatBrand = "\nלא קיים מותג צ'אט\n";
            var txtAction = "\nהפעולה התקבלה\n";
            var incidentId = elad_commons_obj.GetCurrentEntityId();

            var customer = elad_commons_obj.GetLookupFieldValue("customerid");

            if (customer && customer.id) {
                var accountId = motors.Utilities.FormatId(customer.id);
                var accountRequest = motors.Services.XrmService.RetrieveRequest();
                accountRequest.logicalName = "account";
                accountRequest.attributes = "name,telephone1,telephone2";
                accountRequest.count = true;
                accountRequest.filters = [{ field: "accountid", filterOperator: "eq", value: accountId }];

                var accountResults = service.Retrieve(accountRequest);

                if (accountResults != null && accountResults.value != null && accountResults.value[0] != null) {
                    if (accountResults.value[0].telephone1 != null) telephoneAccount = accountResults.value[0].telephone1;
                    else elad_commons_obj.OpenAlertDialog(txtTelephone);
                }
            }

            var car = elad_commons_obj.GetLookupFieldValue("el_id_car");

            if (car && car.id) {
                var carId = motors.Utilities.FormatId(car.id);
                var carRequest = motors.Services.XrmService.RetrieveRequest();
                carRequest.logicalName = "el_car";
                carRequest.attributes = "el_name,_el_id_family_value";
                carRequest.count = true;
                carRequest.filters = [{ field: "el_carid", filterOperator: "eq", value: carId }];

                var carResults = service.Retrieve(carRequest);

                if (carResults != null && carResults.value != null && carResults.value[0] != null) {
                    var familyId = carResults.value[0]._el_id_family_value;

                    var familyRequest = motors.Services.XrmService.RetrieveRequest();
                    familyRequest.logicalName = "el_family";
                    familyRequest.attributes = "el_name,el_p_chat_brand";
                    familyRequest.count = true;
                    familyRequest.filters = [{ field: "el_familyid", filterOperator: "eq", value: familyId }];

                    var familyResults = service.Retrieve(familyRequest);

                    if (familyResults != null && familyResults.value != null && familyResults.value[0] != null && familyResults.value[0].el_p_chat_brand != null) chatBrand = familyResults.value[0].el_p_chat_brand;
                }
            }

            if (chatBrand != null) {
                var configurationSimpleChatRequest = motors.Services.XrmService.RetrieveRequest();

                configurationSimpleChatRequest.logicalName = "el_text_server_configuration";
                configurationSimpleChatRequest.attributes = "el_s_name,el_p_chat_brand,el_p_server_type";
                configurationSimpleChatRequest.count = true;
                configurationSimpleChatRequest.filters = [
                    {
                        field: "el_p_server_type",
                        filterOperator: "eq",
                        value: Enum.el_text_server_configuration.el_p_server_type.WhatsApp,
                        conditionOperator: "and"
                    },
                    {
                        field: "el_p_chat_brand",
                        filterOperator: "eq",
                        value: chatBrand
                    }
                ];
                var configurationResults = service.Retrieve(configurationSimpleChatRequest);
                if (configurationResults != null && configurationResults.value != null && configurationResults.value[0] != null) {
                    var channelConfigId = configurationResults.value[0].el_text_server_configurationid;
                    var simpleChatTemplateConfig = motors.Services.XrmService.RetrieveRequest();
                    simpleChatTemplateConfig.logicalName = "el_simplechat_template_config";
                    simpleChatTemplateConfig.attributes = "el_s_template_id,_el_id_bot_value";
                    simpleChatTemplateConfig.count = true;
                    simpleChatTemplateConfig.filters = [
                        {
                            field: "el_l_template_type",
                            filterOperator: "eq",
                            value: Enum.el_simplechat_template_config.el_l_template_type.CustomService,
                            conditionOperator: "and"
                        },
                        {
                            field: "_el_id_channel_value",
                            filterOperator: "eq",
                            value: channelConfigId
                        }
                    ];
                    var templateResults = service.Retrieve(simpleChatTemplateConfig);
                    if (templateResults != null && templateResults.value != null && templateResults.value[0] != null) {
                        var bot = templateResults.value[0]._el_id_bot_value;
                        var parameters = {
                            channelId: {
                                el_text_server_configurationid: configurationResults.value[0].el_text_server_configurationid,
                                "@odata.type": "Microsoft.Dynamics.CRM.el_text_server_configuration"
                            },
                            customerPhone: telephoneAccount,
                            botId: {
                                el_text_input_questionid: bot,
                                "@odata.type": "Microsoft.Dynamics.CRM.el_text_input_question"
                            }
                        };
                        var request = motors.Utilities.buildActionRequest("incident", incidentId, false, "el_OutgoingWhatsappForIncident", parameters, null, false);
                        var result = service.CallAction(request);
                        if (result != null && result.success == true) elad_commons_obj.OpenAlertDialog(txtAction);
                    }
                } else elad_commons_obj.OpenAlertDialog(txtChannel);
            } else elad_commons_obj.OpenAlertDialog(txtChatBrand);

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.sendWhatsapp");
        }
    };
    elad_commons_obj.addOpenLegacyParameters = async function (accountid) {
        try {
            if (!accountid) return "";
            //TODO: Add address reference (el_address isn't exist into CRM)
            // var account = await elad_commons_obj.RetrieveRecord("account", elad_commons_obj.StripGuid(accountid),
            //     "?$select=el_s_first_name,donotbulkemail,el_s_last_name,el_dt_date_of_birth,el_s_idnumber_text,telephone1,telephone2,fax,emailaddress1&$expand=el_id_type_code($select=el_n_id_type_code),el_el_address_account($select=el_s_city_text,el_s_street_text,el_n_house_number,el_s_entrance,el_n_zip,el_n_pob_zip,el_n_pob)");

            var account = await elad_commons_obj.RetrieveRecord("account", elad_commons_obj.StripGuid(accountid), "?$select=el_s_first_name,donotbulkemail,el_s_last_name,el_dt_date_of_birth,el_s_idnumber_text,telephone1,telephone2,fax,emailaddress1&$expand=el_id_type_code($select=el_n_id_type_code)");

            var parameters = "";
            if (account != null) {
                parameters += "cpd.shemPrati=" + elad_commons_obj.notNullParam(account.el_s_first_name).trim() + "&";
                parameters += "cpd.hasumLeDivur=" + elad_commons_obj.notNullParam(account.donotbulkemail).trim() + "&";
                parameters += "cpd.shemMishpaha=" + elad_commons_obj.notNullParam(account.el_s_last_name).trim() + "&";
                parameters += "cpd.taarihLeda=" + elad_commons_obj.GetOdataDate(account.el_dt_date_of_birth) + "&";
                parameters += "cmd.sugLakoah=" + elad_commons_obj.getTypeId(account.el_id_type_code) + "&";
                parameters += "cpd.misparZeutHevra=" + elad_commons_obj.notNullParam(account.el_s_idnumber_text).trim() + "&";
                parameters += "tel.telephoneCelolari=" + elad_commons_obj.notNullParam(account.telephone1).trim() + "&";
                parameters += "tel.misparTelephoneA=" + elad_commons_obj.notNullParam(account.telephone2).trim() + "&";
                parameters += "tel.misparTelephoneB=" + elad_commons_obj.notNullParam(account.telephone1).trim() + "&";
                parameters += "tel.misparFax=" + elad_commons_obj.notNullParam(account.fax).trim() + "&";
                parameters += "cpd.ktovetEmail=" + elad_commons_obj.notNullParam(account.emailaddress1).trim() + "&";
                var address = account.el_el_address_account;
                if (address != null) {
                    var city = address.el_id_city != null && address.el_id_city.Name != "אחר" ? elad_commons_obj.notNullLookupParam(address.el_id_city) : elad_commons_obj.notNullParam(address.el_s_city_text) == "" ? "" : elad_commons_obj.notNullParam(address.el_s_city_text);
                    if (city == "") city = elad_commons_obj.notNullLookupParam(address.el_id_pob_city);
                    parameters += "cpd.ir=" + city + "&";
                    var semelIshuv = await elad_commons_obj.getCityCode4Params(address, "address");
                    if (semelIshuv == "") semelIshuv = await elad_commons_obj.getCityCode4Params(address, "pob");
                    parameters += "cpd.semelIshuv=" + semelIshuv + "&";
                    var street = address.el_id_street_synonym != null && address.el_id_street_synonym.Name != "אחר" ? elad_commons_obj.notNullLookupParam(address.el_id_street_synonym) : elad_commons_obj.notNullParam(address.el_s_street_text) == "" ? "" : elad_commons_obj.notNullParam(address.el_s_street_text);
                    parameters += "cpd.rehov=" + street + "&";
                    parameters += "cpd.mispar=" + elad_commons_obj.notNullParam(address.el_n_house_number) + "&";
                    parameters += "cpd.knisa=" + elad_commons_obj.notNullParam(address.el_s_entrance).trim() + "&";
                    var zip = address.el_n_zip != null ? elad_commons_obj.notNullParam(address.el_n_zip) : elad_commons_obj.notNullParam(address.el_n_pob_zip);
                    parameters += "cpd.mikud=" + zip + "&";
                    parameters += "cpd.tdMispar=" + elad_commons_obj.notNullParam(address.el_n_pob) + "&";
                    parameters += "cpd.tdIshuv=" + elad_commons_obj.notNullLookupParam(address.el_id_pob_city);
                } else {
                    parameters += "cpd.ir=&cpd.semelIshuv=&cpd.rehov=&cpd.mispar=&cpd.knisa=&cpd.mikud=&cpd.tdMispar=&cpd.tdIshuv=";
                }

            } else {
                parameters += "cpd.shemPrati=&cpd.hasumLeDivur=&cpd.shemMishpaha=&cpd.taarihLeda=&cmd.sugLakoah=&cpd.misparZeutHevra=&tel.telephoneCelolari=&tel.misparTelephoneA=&tel.misparTelephoneB=&tel.misparFax=&cpd.ktovetEmail=&cpd.ir=&cpd.semelIshuv=&cpd.rehov=&cpd.mispar=&cpd.knisa=&cpd.mikud=&cpd.tdMispar=&cpd.tdIshuv=";
            }
            return parameters;
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.addOpenLegacyParameters");
            return "";
        }
    };
    elad_commons_obj.addOpenLegacyTradeinParameters = async function (accountid, opportunityTradeinid, as400accountcode) {
        try {
            if (!accountid) return "";
            //TODO: Add address reference (el_address isn't exist into CRM)
            // var account = await elad_commons_obj.RetrieveRecord("account", elad_commons_obj.StripGuid(accountid), "?$select=name,el_s_idnumber_text,telephone1,telephone2,fax,emailaddress1&$expand=el_el_address_account($select=el_s_city_text,el_s_street_text,el_n_house_number,el_n_zip)");

            var account = await elad_commons_obj.RetrieveRecord("account", elad_commons_obj.StripGuid(accountid), "?$select=name,el_s_idnumber_text,telephone1,telephone2,fax,emailaddress1");
            var parameters = "";
            if (account != null) {
                parameters += "msLakoah=" + elad_commons_obj.notNullParam(as400accountcode).trim() + "&";
                parameters += "shemLakoah=" + elad_commons_obj.notNullParam(account.name).trim() + "&";
                parameters += "tzHp=" + elad_commons_obj.notNullParam(account.el_s_idnumber_text).trim() + "&";
                parameters += "nayad=" + elad_commons_obj.notNullParam(account.telephone1).trim() + "&";
                parameters += "telephone1=" + elad_commons_obj.notNullParam(account.telephone2).trim() + "&";
                parameters += "fax=" + elad_commons_obj.notNullParam(account.fax).trim() + "&";
                parameters += "mail=" + elad_commons_obj.notNullParam(account.emailaddress1).trim() + "&";
                parameters += "misparIzdamnut=" + elad_commons_obj.notNullParam(opportunityTradeinid.replace("{", "").replace("}", "")) + "&";
                if (account.el_el_address_account != null) {
                    var city = account.el_el_address_account.el_id_city != null && account.el_el_address_account.el_id_city.Name != "אחר" ? elad_commons_obj.notNullLookupParam(account.el_el_address_account.el_id_city) : elad_commons_obj.notNullParam(account.el_el_address_account.el_s_city_text) == "" ? "" : elad_commons_obj.notNullParam(account.el_el_address_account.el_s_city_text);
                    var street = account.el_el_address_account.el_id_street_synonym != null && account.el_el_address_account.el_id_street_synonym.Name != "אחר" ? elad_commons_obj.notNullLookupParam(account.el_el_address_account.el_id_street_synonym) : elad_commons_obj.notNullParam(account.el_el_address_account.el_s_street_text) == "" ? "" : elad_commons_obj.notNullParam(account.el_el_address_account.el_s_street_text);
                    parameters += "cpd.mispar=" + elad_commons_obj.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                    parameters += "ir=" + city + "&";
                    parameters += "ktovet=" + street + " " + elad_commons_obj.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                    parameters += "mikud=" + elad_commons_obj.notNullParam(account.el_el_address_account.el_n_zip);
                } else {
                    parameters += "ir=&ktovet=&mikud=";
                }
            } else {
                parameters += "shemLakoah=&tzHp=&nayad=&telephone1=&fax=&mail=&ir=&ktovet=&mikud=";
            }
            return parameters;
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.addOpenLegacyTradeinParameters");
            return "";
        }
    };
    elad_commons_obj.addOpenLegacyTradeinQuotParameters = async function (accountid, opportunityTradeinid) {
        try {
            if (!accountid) return "";
            //TODO: Add address reference (el_address isn't exist into CRM)
            // var account = await elad_commons_obj.RetrieveRecord("account", elad_commons_obj.StripGuid(accountid), "?$select=name,telephone1,emailaddress1&$expand=el_el_address_account($select=el_s_city_text,el_s_street_text,el_n_house_number,el_n_zip)");
            var account = await elad_commons_obj.RetrieveRecord("account", elad_commons_obj.StripGuid(accountid), "?$select=name,telephone1,emailaddress1");
            var parameters = "";
            if (account != null) {
                parameters += "shemLakoah=" + elad_commons_obj.notNullParam(account.name).trim() + "&";
                if (account.el_el_address_account != null) {
                    var city = account.el_el_address_account.el_id_city != null && account.el_el_address_account.el_id_city.Name != "אחר" ? elad_commons_obj.notNullLookupParam(account.el_el_address_account.el_id_city) : elad_commons_obj.notNullParam(account.el_el_address_account.el_s_city_text) == "" ? "" : elad_commons_obj.notNullParam(account.el_el_address_account.el_s_city_text);
                    var street = account.el_el_address_account.el_id_street_synonym != null && account.el_el_address_account.el_id_street_synonym.Name != "אחר" ? elad_commons_obj.notNullLookupParam(account.el_el_address_account.el_id_street_synonym) : elad_commons_obj.notNullParam(account.el_el_address_account.el_s_street_text);
                    parameters += "ktovet=" + street + " " + elad_commons_obj.notNullParam(account.el_el_address_account.el_n_house_number) + "&";
                    parameters += "ir=" + city + "&";
                    parameters += "mikud=" + elad_commons_obj.notNullParam(account.el_el_address_account.el_n_zip) + "&";

                } else {
                    parameters += "ir=&ktovet=&mikud=&";
                }
                parameters += "telephone=" + elad_commons_obj.notNullParam(account.telephone1).trim() + "&";
                parameters += "email=" + elad_commons_obj.notNullParam(account.emailaddress1).trim();
            } else {
                parameters += "shemLakoah=&ktovet=&ir=&mikud=&telephone=&email=";
            }
            return parameters;

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.addOpenLegacyTradeinQuotParameters");
            return "";
        }
    };
    elad_commons_obj.showOpenLegacyRibbon = async function (field, customerfieldname, actionType, as400code) {
        try {
            if (elad_commons_obj.GetOpenerEntityInfo()) {
                elad_commons_obj.OpenAlertDialog("לא ניתן לבצע פעולה זו מתוך חלון מוקפץ.\nיש לחזור לחלון הראשי ולנסות שנית");
                return;
            }
            var addIncidentGuidAndID = false;
            var addCarNumber = false;
            var addAccountParams = false;
            var addTradeinAccountParams = false;
            var addTradeinQuotAccountParams = false;
            var addTradeinDealParams = false;
            var addOpportunityNum = false;
            var addPurchaseNum = false;
            var addOrderParams = false;

            var url = await elad_commons_obj.GetGlobalParameterValueByName(field) + "?";
            var customer = customerfieldname ? elad_commons_obj.GetLookupFieldValue(customerfieldname) : null;
            var accountid = customer && customer.id ? customer.id : "00000000-0000-0000-0000-000000000000";
            switch (field) {
                case Const.OpenLegacyUrl.benefitUrl:
                    addCarNumber = true;
                    addIncidentGuidAndID = true;
                case Const.OpenLegacyUrl.carStatusUrl:
                    addCarNumber = true;
                    break;

                case Const.OpenLegacyUrl.prodTreeOrderUrl:
                case Const.OpenLegacyUrl.stockOrderUrl:
                    addAccountParams = true;
                    addOpportunityNum = true;
                    break;

                case Const.OpenLegacyUrl.specialQuoteUrl:
                    addAccountParams = true;
                    break;

                case Const.OpenLegacyUrl.updateOrderUrl:
                    addOrderParams = true;
                    break;

                case Const.OpenLegacyUrl.tradeinSystemUrlAssign:
                case Const.OpenLegacyUrl.tradeinSystemUrlMaagar:
                    addTradeinAccountParams = true;
                    break;

                case Const.OpenLegacyUrl.updateTradeinDealUrl:
                case Const.OpenLegacyUrl.cancelTradeinDealUrl:
                case Const.OpenLegacyUrl.invoiceTradeinDealUrl:
                case Const.OpenLegacyUrl.cancelTradeinAdvanceUrl:
                case Const.OpenLegacyUrl.receiptTradeinDealUrl:
                case Const.OpenLegacyUrl.restoreInvoiceTradeinDealUrl:
                    addTradeinDealParams = true;
                    break;

                case Const.OpenLegacyUrl.tradeinQuot:
                    addTradeinQuotAccountParams = true;
                    break;
            }
            if (addCarNumber) {
                var entityName = elad_commons_obj.GetCurrentEntityName();
                var carLicense = entityName == "incident" ? elad_commons_obj.GetLookupFieldValue("el_id_car").name : elad_commons_obj.GetFieldValue("el_name");
                url += "license=" + carLicense;
            }
            if (addIncidentGuidAndID) {
                var customerIdentification = await elad_commons_obj.getCustomerIdentification(accountid);
                var incidentID = elad_commons_obj.notNullParam(elad_commons_obj.GetCurrentEntityId().replace(/[{}]/g, ""));
                var incidentNumber = elad_commons_obj.GetFieldValue("el_s_incident_number");
                url += "&tz=" + customerIdentification + "&guid=" + incidentID + "&asmachta=" + incidentNumber;
            }
            if (addAccountParams) url += await elad_commons_obj.addOpenLegacyParameters(accountid);
            if (addTradeinAccountParams) url += await elad_commons_obj.addOpenLegacyTradeinParameters(accountid, elad_commons_obj.GetCurrentEntityId(), as400code);
            if (addTradeinQuotAccountParams) url += await elad_commons_obj.addOpenLegacyTradeinQuotParameters(accountid, elad_commons_obj.GetCurrentEntityId());
            if (addOpportunityNum) url += "&cmd.misparIzdamnut=" + elad_commons_obj.notNullParam(elad_commons_obj.GetCurrentEntityId().replace("{", "").replace("}", ""));
            if (addPurchaseNum) {
                url += addAccountParams ? "&" : "";
                url += "cmd.misparTeuda=" + elad_commons_obj.GetFieldValue("el_s_purchase_num");
            }
            if (addOrderParams) {
                url += "recordId=" + elad_commons_obj.GetFieldValue("el_s_ratz_number");
            }
            if (addTradeinDealParams) {
                url = url.replace("?", "");
                url += "/" + elad_commons_obj.GetFieldValue("el_s_purchase_num") + "?product=" + elad_commons_obj.GetFieldValue("el_l_car_type");
            }
            if (actionType) {
                url += "&actionType=" + actionType;
            }
            //TODO CRM Online: replace opener logic
            var win = top.window.open(url, "OpenLegacy");
            if (win) win.focus();

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.showOpenLegacyRibbon");
        }
    };
    elad_commons_obj.getCustomerIdentification = async function (accountID) {
        try {
            if (!accountID) return "";
            var customer = await elad_commons_obj.RetrieveRecord("account", elad_commons_obj.StripGuid(accountID), "?$select=el_s_idnumber_text");
            if (customer != null && customer.el_s_idnumber_text) return customer.el_s_idnumber_text;
            return "";

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.getCustomerIdentification");
            return "";
        }
    };
    elad_commons_obj.SetFieldAsVisibleAndRequired = function (fieldName) {
        try {
            elad_commons_obj.SetVisible(fieldName, true);
            elad_commons_obj.SetRequiredLevel(fieldName, "required");
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.SetFieldAsVisibleAndRequired");
        }
    };
    elad_commons_obj.SetFieldAsUNvisibleAndNONrequired = function (fieldName) {
        try {
            elad_commons_obj.SetVisible(fieldName, false);
            elad_commons_obj.SetRequiredLevel(fieldName, "none");
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.SetFieldAsUNvisibleAndNONrequired");
        }
    };

    elad_commons_obj.GetGuidOfTheDefaultLookupDialogView = function (lookupFieldName) {
        var control = elad_commons_obj.GetControl(lookupFieldName);
        if (control)
            return control.getDefaultView();
        return null;
    }

    elad_commons_obj.SetDefaultLookupDialogView = function (lookupFieldName, viewGuidToSetWithBraces) {
        var control = elad_commons_obj.GetControl(lookupFieldName);
        try {
            if (control) {
                if (viewGuidToSetWithBraces) {
                    control.setDefaultView(viewGuidToSetWithBraces)
                }
                else {
                    control.setDefaultView(elad_commons_obj.GetGuidOfTheDefaultLookupDialogView(lookupFieldName))
                }
            }

        } catch (error) {
            console.error(error);
        }
    }

    elad_commons_obj.IsDigitsOnly = function (value) {
        return /^\d+$/.test(value);
    }

    elad_commons_obj.SetFireOnChange = function (attributeSchemname) {
        var attribute = elad_commons_obj.GetAttribute(attributeSchemname);
        if (!attribute) {
            console.log("common => elad_commons_obj.SetFireOnChange: Attribute is Incurrect OR isn't exist")
            return;
        }
        else {
            attribute.fireOnChange();
        }
    }

    // el_opportunity
    elad_commons_obj.FillShowRoom = async function () {
        try {
            if (elad_commons_obj.GetFormType() != Enum.FormType.Create) {
                return;
            }

            if (!elad_commons_obj.GetAttribute("el_id_showroom")) {
                return;
            }

            var currShowRoomLookupValue = elad_commons_obj.GetLookupFieldValue("el_id_showroom");

            var user = await elad_commons_obj.RetrieveRecord("systemuser", elad_commons_obj.GetCurrentUserId(), "?$select=_businessunitid_value");

            if (user == null || user._businessunitid_value == null) {
                return;
            }
            //AYA
            var showroomResult = await elad_commons_obj.RetrieveMultipleRecords("businessunit", "?$select=businessunitid&$expand=el_id_showroom($select=el_b_mixed_showroom,el_name,el_showroomid)&$filter=businessunitid eq " + user._businessunitid_value);

            if (showroomResult && showroomResult.length > 0 && showroomResult[0].el_el_showroom_businessunit && showroomResult[0].el_el_showroom_businessunit.el_name) {
                var showroom = showroomResult[0].el_el_showroom_businessunit;

                var lookupValue = [{
                    id: showroom.el_showroomid,
                    name: showroom.el_name,
                    entityType: "el_showroom",
                    type: SHOWROOM_TYPECODE
                }];

                if (currShowRoomLookupValue) {
                    var newValue = new RegExp(lookupValue[0].id, "i");

                    if (!newValue.test(currShowRoomLookupValue.id)) {
                        elad_commons_obj.SetLookupValue("el_id_showroom", lookupValue);
                        elad_commons_obj.SetFireOnChange("el_id_showroom");
                    }

                } else {
                    elad_commons_obj.SetLookupValue("el_id_showroom", lookupValue);
                    elad_commons_obj.SetFireOnChange("el_id_showroom");
                }

                if (elad_commons_obj.GetAttribute("el_b_mixed_showroom")) {
                    elad_commons_obj.SetFieldValue("el_b_mixed_showroom", showroom.el_b_mixed_showroom);

                    if (elad_commons_obj.GetControl("el_id_manufacturer")) {
                        elad_commons_obj.SetVisible("el_id_manufacturer", showroom.el_b_mixed_showroom === true);
                    }
                }

            } else {
                elad_commons_obj.OpenAlertDialog("לא משויך אולם ליחידה העסקית שלך. פנה לתמיכה.");
            }

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "commons.fillShowRoom");
        }
    };
    elad_commons_obj.FillManufacturer = async function () {
        try {
            var showroom = elad_commons_obj.GetLookupFieldValue("el_id_showroom");

            if (!showroom || !showroom.id) {
                return;
            }

            var showroomRecord = await elad_commons_obj.RetrieveRecord("el_showroom", elad_commons_obj.StripGuid(showroom.id), "?$select=el_b_mixed_showroom&$expand=el_id_manufacturer($select=el_manufacturerid,el_name)");

            if (showroomRecord != null && showroomRecord.el_id_manufacturer != null && !showroomRecord.el_b_mixed_showroom) {
                //var lookupValue = [{
                //    id: showroomRecord.el_id_manufacturer.el_manufacturerid,
                //    name: showroomRecord.el_id_manufacturer.el_name,
                //    entityType: "el_manufacturer",
                //    //type: EL_MANUFACTURER_TYPECODE
                //}];

                elad_commons_obj.SetLookupValue("el_id_manufacturer", showroomRecord.el_id_manufacturer.el_manufacturerid, showroomRecord.el_id_manufacturer.el_name, "el_manufacturer" );
                elad_commons_obj.SetFireOnChange("el_id_manufacturer");
            }

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.fillManufacturer");
        }
    };
    elad_commons_obj.SaveForm = async function () {
        try {
            if (elad_commons_obj.GetFormContext() && elad_commons_obj.GetFormContext().data) {
                await elad_commons_obj.GetFormContext().data.save();
            }
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "commons.SaveForm");
        }
    };
    elad_commons_obj.GetNewXrmAlertStrings = function (messageText, titleText, okButtonText) {
        var alertTexts = new Xrm.AlertDialogStrings;
        alertTexts.confirmButtonLabel = okButtonText ? okButtonText : undefined;
        alertTexts.text = messageText ? messageText : undefined;
        alertTexts.title = titleText ? titleText : undefined;
        return alertTexts;
    };
    elad_commons_obj.RefreshForm = async function (save) {
        try {
            debugger; //AYA
            if (elad_commons_obj._formContext && elad_commons_obj._formContext.data) {
                await elad_commons_obj._formContext.data.refresh(save === true);
            }
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "commons.RefreshForm");
        }
    };

    elad_commons_obj.yyyymmdd = function (dateIn, utcMatchNeeded) {
        try {
            var yyyy = dateIn.getFullYear();
            var mm = dateIn.getMonth() + 1; // getMonth() is zero-based
            var dd = dateIn.getDate();

            if (utcMatchNeeded) {
                var utcMils = Date.UTC(yyyy, mm, dd);
                var localMils = new Date(yyyy, mm, dd).getTime();
                var utcDiff = utcMils - localMils;
                var todayUtc = new Date(yyyy, mm - 1, dd);

                todayUtc.setTime(todayUtc.getTime() - utcDiff); // less 2-3 hours

                yyyy = todayUtc.getFullYear();
                mm = todayUtc.getMonth() + 1; // getMonth() is zero-based
                dd = todayUtc.getDate();
            }

            var result = String(10000 * yyyy + 100 * mm + dd);

            return result.substring(0, 4) + "-" + result.substring(4, 6) + "-" + result.substring(6, 8);

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "common.yyyymmdd");
            return "";
        }
    };
    elad_commons_obj.ParseDate = function (dateField) {
        try {
            if (dateField != null) {
                return dateField.replace("/Date(", "").replace(")/", "");
            }

            return "";

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.parseDate");
            return "";
        }
    };
    //el_digital_doc
    elad_commons_obj.TicksToDate = function (ticks) {
        try {
            if (!ticks) {
                return null;
            }
            var ticksString =
                ticks.replace("/Date(", "").replace(")/", "");
            var parsedTicks = parseInt(ticksString);
            return new Date(parsedTicks);
        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "commons.TicksToDate");
            return null;
        }
    };
    elad_commons_obj.LogOnConsoleAndOpenAlertDialog = function (textOnAlert) {
        try {
            var alertStrings = elad_commons_obj.GetNewXrmAlertStrings(textOnAlert);

            console.log(textOnAlert);

            elad_commons_obj.OpenAlertDialog(alertStrings, null, null);

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "commons.LogOnConsoleAndOpenAlertDialog");
        }
    };
    //20260713
    elad_commons_obj.SetSectionsVisibilityArray = function (tabName, sections) {
        try {
            if (!tabName || !sections || sections.length == 0) {
                return;
            }

            var tab = elad_commons_obj.GetTab(tabName);

            if (!tab) {
                return;
            }

            sections.forEach(function (section) {
                if (!section || !section.sectionName) {
                    return;
                }

                var sectionControl = tab.sections.get(section.sectionName);

                if (!sectionControl) {
                    return;
                }

                sectionControl.setVisible(section.visible === true);
            });

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "commons.SetSectionsArrayVisibility");
        }
    };
    elad_commons_obj.SetRequiredLevelArray = function (fieldNames, requiredLevel) {
        try {
            if (!fieldNames || fieldNames.length == 0) {
                return;
            }

            fieldNames.forEach(function (fieldName) {
                elad_commons_obj.SetRequiredLevel(fieldName, requiredLevel);
            });

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "commons.SetRequiredLevels");
        }
    }

    elad_commons_obj.IsRequiredField = function (fieldName) {
        var attribute = elad_commons_obj.GetAttribute(fieldName)

        if (attribute) {
            var level = attribute.getRequiredLevel();
            return level == "required" ? true : false;
        }
        return null;
    }

    elad_commons_obj.SetVisibleArray = function (fieldsNameArray, visible, isControlCollection) {
        try {
            if (!fieldsNameArray || fieldsNameArray.length === 0) {
                return;
            }

            fieldsNameArray.forEach(function (fieldName) {
                elad_commons_obj.SetVisible(fieldName, visible, isControlCollection);
            });

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.SetVisibleArray");
        }
    };
    //---Ribbon---
    elad_commons_obj.CreateOutgoingWhatsappConversationByChannel = async function (channelName, entityName) {
        try {

            var recordId = elad_commons_obj.GetCurrentEntityId();

            var actionName = "el_CreateOutgoingWhatsappByChannelFor" + entityName;

            var channels = await commons.RetrieveMultipleRecords(
                "el_text_server_configuration",
                "?$select=el_text_server_configurationid,el_s_name" +
                "&$filter=el_s_whatsapp_btn_name eq '" + channelName + "'" +
                " and statecode eq 0" +
                " and el_p_server_type eq 15"
            );

            if (!channels || channels.length == 0) {
                elad_commons_obj.OpenAlertDialog("ערוץ וואטספ לא קיים.");
                return;
            }

            var channelId = channels[0].el_text_server_configurationid;

            var accountConversations = await elad_commons_obj.RetrieveMultipleRecords(
                "el_text_conversation",
                "?$select=subject" +
                "&$filter=_el_l_account_value eq " + elad_commons_obj.StripGuid(recordId) +
                " and statecode eq 0" +
                " and _el_l_text_server_value eq " + elad_commons_obj.StripGuid(channelId)
            );

            if (accountConversations && accountConversations.length > 0) {
                elad_commons_obj.OpenAlertDialog("ללקוח זה קיימת שיחה פתוחה בערוץ הנבחר");
                return;
            }

            var regardingConversations = await elad_commons_obj.RetrieveMultipleRecords(
                "el_text_conversation",
                "?$select=subject" +
                "&$filter=_regardingobjectid_value eq " + elad_commons_obj.StripGuid(recordId) +
                " and statecode eq 0" +
                " and _el_l_text_server_value eq " + elad_commons_obj.StripGuid(channelId)
            );

            if (regardingConversations && regardingConversations.length > 0) {
                elad_commons_obj.OpenAlertDialog("ללקוח זה קיימת שיחה פתוחה בערוץ הנבחר");
                return;
            }

            var request = {
                entity: {
                    "@odata.type": "Microsoft.Dynamics.CRM." + entityName.toLowerCase()
                },
                ChannelId: {
                    el_text_server_configurationid: channelId,
                    "@odata.type": "Microsoft.Dynamics.CRM.el_text_server_configuration"
                },
                getMetadata: function () {
                    return {
                        boundParameter: "entity",
                        operationType: 0,
                        operationName: actionName,
                        parameterTypes: {
                            entity: {
                                typeName: "mscrm." + entityName.toLowerCase(),
                                structuralProperty: 5
                            },
                            ChannelId: {
                                typeName: "mscrm.el_text_server_configuration",
                                structuralProperty: 5
                            }
                        }
                    };
                }
            };

            request.entity[entityName.toLowerCase() + "id"] = elad_commons_obj.StripGuid(recordId);

            var response = await Xrm.WebApi.online.execute(request);

            if (response.ok) {
                elad_commons_obj.OpenAlertDialog("שיחת וואטספ נוצרה בהצלחה");
            }

        } catch (error) {
            elad_commons_obj.PageErrorHandler(error, "elad_commons_obj.CreateOutgoingWhatsappConversationByChannel");
        }
    };
    //CRMCommon.SetFilterOnLookupField = function (filtredFieldName, filtredEntityLogicalName, filter) {
    //    if (!filtredFieldName || !filtredEntityLogicalName || !filter) {
    //        console.log("el_common.js => SetFilterOnLookupField(): one of parameters is NULL or Undefined");
    //        return null;
    //    }

    //    var control = CRMCommon.GetControl(filtredFieldName);

    //    if (!control) {
    //        console.log("el_common.js => SetFilterOnLookupField(): No control with name: " + filtredFieldName);
    //        return null;
    //    }

    //    control.addPreSearch(function () { control.addCustomFilter(filter, filtredEntityLogicalName) });
    //}

    elad_commons_obj.SetFilterOnLookupField = function (filteredFieldName, filteredEntityLogicalName, filter) {
        if (!filteredFieldName || !filteredEntityLogicalName || !filter) {
            console.log("el_common.js => SetFilterOnLookupField(): one of parameters is NULL or Undefined");
            return null;
        }

        var control = elad_commons_obj.GetControl(filteredFieldName);

        if (!control) {
            console.log("el_common.js => SetFilterOnLookupField(): No control with name: " + filteredFieldName);
            return null;
        }

        control.addPreSearch(function () {
            control.addCustomFilter(filter, filteredEntityLogicalName);
        });

        return true;
    };
    //--- AYA END ---
})(window.elad_commons_obj = window.elad_commons_obj || {});

function elad_commons() {
    return elad_commons_obj;
}

var win = function () {
    if (document.URL.indexOf("ClientApiWrapper.aspx") > -1)
        return window.parent;
    else
        return window;
}

win().ScriptForm = window;
