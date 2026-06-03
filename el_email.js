(function (el_email) {
    var commons;

    el_email.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_email.onLoadEvents();

            el_email.onChangeEvents();

            el_email.onSaveEvents();

        } catch (error) {
            commons.PageErrorHandler(error, "el_email.onLoad");
        }
    }

    el_email.onLoadEvents = function () {
        el_email.SetRecipientForIncident();
        el_email.assignToMyself();
    }

    el_email.onChangeEvents = function () {
        commons.AddOnChange("from", el_email.el_email_onSave);
    }

    el_email.onSaveEvents = function () {
        commons.AddOnSave(el_email.el_email_onSave);
    }

    el_email.convertToIncident = function () {
        commons.OpenConfirmDialog("האם אתה בטוח שברצונך ליצור פניה חדשה?", "")
            .then(
                function (success) {
                    if (success.confirmed) {

                        var formParameters = {};
                        formParameters["el_s_fromemail_guid"] = commons.GetCurrentEntityId();

                        var formOptions = {
                            entityName: "incident",
                            entityId: null
                        };

                        //To Check -> If the OpenEntityForm opened correct
                        commons.OpenEntityForm(formOptions, formParameters);
                    }
                }
            )
    }

    el_email.canConvertToIncident = function () {
        if (commons.GetLookupId("regardingobjectid"))
            return false;
        if (commons.GetFormType() === Enum.FormType.Create)
            return false;
        return true;
    }

    el_email.assignToMyself = async function () {
        try {
            var entityId = commons.GetCurrentEntityId();
            //check if the email related to  queue item that wasn't assign
            var message = "האם ברצונך לעבוד על פריט זה?"
            var workflowId = 'E406BEEA-2596-46A1-BF70-1DBB0A77B841';

            var options = "?$select=_ownerid_value,Email_QueueItem/WorkerId&$expand=Email_QueueItem";
            var emailResult = await commons.RetrieveRecord("email", entityId, options);
            if (emailResult && emailResult._ownerid_value && emailResult._ownerid_value && emailResult.Email_QueueItem && emailResult.Email_QueueItem.WorkerId) {
                if (commons.GetCurrentUserId() !== emailResult._ownerid_value) {
                    var confirmResult = await commons.OpenConfirmDialog(message)
                    if (confirmResult && confirmResult.confirmed) {
                        el_email.runWorkflow(workflowId, entityId, el_email.assignResponse, el_email.assignResponse);
                    }
                }
            }

        } catch (error) {
            console.error(error);
            commons.SetFormNotification("ERROR on el_email.assignToMyself(): " + error.message, commons.FormNotificationLevel.ERROR, "el_email.assignToMyself");
        }
    }

    el_email.runWorkflow = function (workflowId, entityId, successCallback, errorCallback) {
        commons.ExecuteWorkflow(workflowId, entityId)
            .then(
                successResponse => successCallback(successResponse),
                errorResponse => errorCallback(errorResponse)
            )
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
        // req.onreadystatechange = function () { el_email.assignResponse(req); };
        // req.send(request);
    }

    el_email.assignResponse = function (response) {
        if (response.status === 200) {
            window.setTimeout(() => {
                //To Check -> If the OpenEntityForm opened correct
                commons.OpenEntityForm({ entityName: "email", entityId: commons.GetCurrentEntityId() });
            }, 3000);
        } else {
            commons.SetFormNotification("Error on Execute")
        }
    }

    //To Check -> If the Promise working correct for Ribbon bar buttons
    el_email.ribbonShowSetQueueItemNotActive = function () {
        return new Promise(function (resolve, reject) {
            var options = "?$select=activityid&$expand=Email_QueueItem($select=queueitemid)";
            commons.RetrieveRecord("email", commons.GetCurrentEntityId(), options)
                .then(
                    function (result) {
                        if (result && result.Email_QueueItem && result.Email_QueueItem.length > 0) {
                            if (!result.Email_QueueItem[0].queueitemid) resolve(true);
                        }
                        resolve(false);
                    },
                    err => resolve(false)
                )
            resolve(false)
        })

        ////OLD version for CRM 8.2
        // var url = "EmailSet?$select=Email_QueueItem/QueueItemId&$expand=Email_QueueItem&$filter=ActivityId eq guid'" + Xrm.Page.data.entity.getId() + "'";
        // var odatautil = new OdataUtil();
        // var result = odatautil.RetrieveDataByUrl("", url, null, null, true);


        // if (result && result.results && result.results[0] && result.results[0].Email_QueueItem && result.results[0].Email_QueueItem.results[0] && result.results[0].Email_QueueItem.results[0].QueueItemId && result.results[0].Email_QueueItem.results[0].QueueItemId.Id == null) {
        //     return true;
        // }
        // return false;
    }

    el_email.ribbonSetQueueItemNotActive = function () {
        var options = "?$select=activityid&$expand=Email_QueueItem($select=queueitemid)";
        var workflowId = '9509C9A7-F631-4FB5-BFAD-5EF959F76A3D';

        commons.RetrieveRecord("email", commons.GetCurrentEntityId(), options)
            .then(
                function (result) {
                    if (result && result.Email_QueueItem && result.Email_QueueItem.length > 0) {
                        if (!result.Email_QueueItem[0].queueitemid) {
                            el_email.runWorkflow(workflowId, result.results[0].Email_QueueItem[0].queueitemid);
                            commons.ClosePage();
                        }
                    }
                },
            )

        ////OLD version for CRM 8.2
        // var url = "EmailSet?$select=Email_QueueItem/QueueItemId&$expand=Email_QueueItem&$filter=ActivityId eq guid'" + Xrm.Page.data.entity.getId() + "'";
        // var odatautil = new OdataUtil();
        // var result = odatautil.RetrieveDataByUrl("", url, null, null, true);
        // if (result && result.results && result.results[0] && result.results[0].Email_QueueItem && result.results[0].Email_QueueItem.results[0] && result.results[0].Email_QueueItem.results[0].QueueItemId && result.results[0].Email_QueueItem.results[0].QueueItemId.Id == null) {
        //     el_email.runWorkflow(workflowId, result.results[0].Email_QueueItem.results[0].QueueItemId);
        //     Xrm.Page.ui.close();
        // }

    }

    el_email.fixedObjectTypesNamesOnSave = function (attributeName) {
        var fromAttribute = commons.GetAttribute(attributeName);
        var fromValue = fromAttribute.getValue();
        if (fromValue == null) return;

        if (el_email.checkLookupTypesExist(fromAttribute)) return;
        el_email.addLookupFrom(fromAttribute, fromValue);
    }

    el_email.addLookupFrom = function (attribute, value) {
        var prop = {
            lookupDataAttribute: "$2_2",
            lookupTypeNames: ["$26_3", "$Ac_3", "$1j_3"],
            //CRM2016 Spec
            lookupTypes2016: "$5x_2"
        };
        var lookupTypeName = [{//DisplayName: getMetadata(value[0].entityType).DisplayName.UserLocalizedLabel.Label,
            EntityID: value[0].type,
            EntityName: value[0].entityType,
            EntityTypeId: value[0].type
        }];

        var lookupAttribute = attribute[prop.lookupDataAttribute];
        el_email.setPropertiesValue(lookupAttribute, prop.lookupTypeNames, lookupTypeName);

        lookupAttribute[prop.lookupTypes2016]["LookupTypeNames"] = lookupTypeName;
    }

    el_email.checkLookupTypesExist = function (attribute) {
        var prop = {
            lookupDataAttribute: "$2_2",
            lookupTypeNames: ["$26_3", "$Ac_3", "$1j_3"],
            //CRM2016 Spec
            lookupTypes2016: "$5x_2"
        };
        var lookupAttribute = attribute[prop.lookupDataAttribute];
        var lookupTypes = el_email.getValueLookupProperty(lookupAttribute, prop.lookupTypeNames);
        if (lookupTypes.length > 0) {
            return true;
        }
        return false;
    }

    el_email.getValueLookupProperty = function (object, property) {
        for (var i = 0; i < property.length; i++) {
            if (property[i] in object)
                return object[property[i]];
        }
        return null;
    }

    el_email.setPropertiesValue = function (lookupAttribute, properties, value) {
        for (var i = 0; i < properties.length; i++) {
            lookupAttribute[properties[i]] = value;
        }
    };

    el_email.el_email_onSave = function () {
        //el_email.fixedObjectTypesNamesOnSave("from");
    }


    el_email.SetRecipientForIncident = function () {
        try {
            var regardingObjectEntityType = commons.GetLookupEntityType("regardingobjectid");
            if (regardingObjectEntityType && regardingObjectEntityType === "incident") {
                if (commons.GetFormType() === Enum.FormType.Create) {
                    commons.SetFieldValue("to", null);
                }
                commons.SetVisible("el_id_email_type", true);
            }
        } catch (error) {
            console.error(error);
            throw new Error("el_email.SetRecipientForIncident: " + error.message);
        }
    }

})((window.el_email = window.el_email || {}))