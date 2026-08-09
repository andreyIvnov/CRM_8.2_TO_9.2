using Elad.DynamicsCRM.DelekMotors.Plugins;
using Elad.DynamicsCRM.DelekMotors.Plugins.Queries;
using Microsoft.Crm.Sdk.Messages;
using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using Delek.DynamicsCRM.Model;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Linq;

namespace Delek.DynamicsCRM.PluginCommon
{
    public partial class UtilsPlugin
    {
        public static string GetGeneralSystemParamValue(string key, Plugin.LocalPluginContext context)
        {
            string value = string.Empty;
            QueryExpression query = new QueryExpression("el_general_system_parameter");
            query.ColumnSet = new ColumnSet("el_s_value");
            #region Filter
            FilterExpression filter = new FilterExpression();
            ConditionExpression condition = new ConditionExpression("el_name", ConditionOperator.In, key);
            filter.AddCondition(condition);
            query.Criteria = filter;

            #endregion

            try
            {
                EntityCollection entityCol = context.OrganizationService.RetrieveMultiple(query);
                for (int i = 0; i < entityCol.Entities.Count; i++)
                    value = entityCol[i]["el_s_value"].ToString();

                return value;

            }
            catch (Exception ex)
            {
                context.Trace(ex);
                throw new ApplicationException("GetGeneralSystemParamValue threw this error: " + ex.Message, ex);
            }
        }

        public static void SendEmailInterfaceFailure(string interfaceName, string failureText, Plugin.LocalPluginContext context)
        {
            try
            {
                // Retrieve requiredTime from app config
                NameValueCollection appSettings = ConfigurationManager.AppSettings;
                string requiredTimeStr = appSettings["RequiredTime"];
                TimeSpan requiredTime;

                if (!string.IsNullOrEmpty(requiredTimeStr) && TimeSpan.TryParse(requiredTimeStr, out requiredTime))
                {
                    // Check if it's not Saturday and not after the required time
                    if (DateTime.Now.DayOfWeek != DayOfWeek.Saturday &&
                        !(DateTime.Now.DayOfWeek == DayOfWeek.Friday && DateTime.Now.TimeOfDay > requiredTime))
                    {
                        string[] arrEmails = GetGeneralSystemParamValue(Plugin.SYSTEM_PARAM_FAILURE_EMAILS, context).Split(';');
                        string sLastSent = GetGeneralSystemParamValue(Plugin.SYSTEM_PARAM_FAILURE_LAST_SENT, context);
                        int iDelay = int.Parse(GetGeneralSystemParamValue(Plugin.SYSTEM_PARAM_FAILURE_SEND_DELAY, context));

                        DateTime dtLastSent;
                        if (string.IsNullOrEmpty(sLastSent) || !DateTime.TryParse(sLastSent, out dtLastSent) || dtLastSent.AddMinutes(iDelay) < DateTime.Now)
                        {
                            Email Email = new Email();
                            Email.Subject = string.Format("׳“׳׳§ ׳׳•׳˜׳•׳¨׳¡ CRM - ׳×׳§׳׳” ׳‘׳׳׳©׳§ {0}", interfaceName);
                            Email.Description = failureText;
                            Email.From = new ActivityParty[] { new ActivityParty { PartyId = new EntityReference(SystemUser.EntityLogicalName, context.PluginExecutionContext.UserId) } };

                            List<ActivityParty> lst = new List<ActivityParty>();
                            foreach (string str in arrEmails)
                                lst.Add(new ActivityParty() { AddressUsed = str });
                            Email.To = lst.ToArray();
                            Guid emailId = context.OrganizationService.Create(Email);

                            SendEmailRequest reqSendEmail = new SendEmailRequest();
                            reqSendEmail.EmailId = emailId;
                            reqSendEmail.TrackingToken = string.Empty;
                            reqSendEmail.IssueSend = true;

                            SendEmailResponse res = (SendEmailResponse)context.OrganizationService.Execute(reqSendEmail);
                            SetGeneralSystemParamValue(Plugin.SYSTEM_PARAM_FAILURE_LAST_SENT, DateTime.Now.ToString(), context);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                context.Trace(ex);
            }
        }

        public static void SetGeneralSystemParamValue(string key, string value, Plugin.LocalPluginContext context)
        {
            try
            {
                EntityCollection ec = context.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_general_system_parameter")
                {
                    Attributes = { "el_name" },
                    Values = { key },
                    ColumnSet = new ColumnSet(true)
                });
                if (ec.Entities.Count == 0)
                {
                    context.OrganizationService.Create(new EL_General_System_Parameter()
                    {
                        EL_Name = key,
                        EL_S_Value = value
                    });
                }
                else if (ec.Entities[0].ToEntity<EL_General_System_Parameter>().EL_S_Value != value)
                {
                    EL_General_System_Parameter entity = ec.Entities[0].ToEntity<EL_General_System_Parameter>();
                    entity.EL_S_Value = value;
                    context.OrganizationService.Update(entity);
                }
            }
            catch (Exception ex)
            {
                context.Trace(ex);
            }

        }

        public static EL_Address GetAddress(Guid addressId, Plugin.LocalPluginContext context)
        {
            try
            {
                return context.OrganizationService.RetrieveMultiple(new QueryExpression(EL_Address.EntityLogicalName)
                {
                    ColumnSet = new ColumnSet(true),
                    Criteria = new FilterExpression() { Conditions = { new ConditionExpression("el_addressid", ConditionOperator.Equal, addressId) } },
                    LinkEntities =
                    {
                        new LinkEntity("el_address", "el_city", "el_id_city", "el_cityid", JoinOperator.LeftOuter) { EntityAlias = "city", Columns = new ColumnSet("el_s_name", "el_n_ministry_city_code") },
                        new LinkEntity("el_address", "el_street", "el_id_street", "el_streetid", JoinOperator.LeftOuter) { EntityAlias = "street", Columns = new ColumnSet("el_s_name", "el_n_ministry_street_code") },
                        new LinkEntity("el_address", "el_city", "el_id_pob_city", "el_cityid", JoinOperator.LeftOuter) { EntityAlias = "po_city", Columns = new ColumnSet("el_s_name", "el_n_ministry_city_code") },
                    }
                }).Entities[0].ToEntity<EL_Address>();
            }
            catch (Exception ex)
            {
                context.Trace(ex);
                throw;
            }
        }

        public static Account GetAccount(Guid accountId, Plugin.LocalPluginContext context)
        {
            try
            {
                return context.OrganizationService.RetrieveMultiple(new QueryExpression(Account.EntityLogicalName)
                {
                    ColumnSet = new ColumnSet(true),
                    Criteria = new FilterExpression() { Conditions = { new ConditionExpression("accountid", ConditionOperator.Equal, accountId) } },
                    LinkEntities =
                {
                    new LinkEntity("account", "el_id_type", "el_id_type_code", "el_id_typeid", JoinOperator.LeftOuter) { EntityAlias = "type", Columns = new ColumnSet("el_n_id_type_code") }
                }
                }).Entities[0].ToEntity<Account>();
            }
            catch (Exception ex)
            {
                context.Trace(ex);
                throw;
            }
        }

        public static EntityCollection GetAS400AccountsForAccount(Guid accountId, Plugin.LocalPluginContext context)
        {
            try
            {

                return context.OrganizationService.RetrieveMultiple(new QueryExpression(EL_As400_Account.EntityLogicalName)
                {
                    ColumnSet = new ColumnSet(true),
                    NoLock = true,
                    Criteria = new FilterExpression() { Conditions = { new ConditionExpression("el_id_account", ConditionOperator.Equal, accountId), new ConditionExpression("el_b_tradein_customer_only", ConditionOperator.Equal, false) } },
                    Orders = { new OrderExpression("modifiedon", OrderType.Descending), new OrderExpression("el_b_updated_account_details", OrderType.Descending) }
                });

            }
            catch (Exception ex)
            {
                context.Trace(ex);
                throw;
            }
        }

        public static Account GetAccountWithNoLock(Guid accountId, Plugin.LocalPluginContext context, ColumnSet columns)
        {
            try
            {
                return context.OrganizationService.RetrieveMultiple(new QueryExpression(Account.EntityLogicalName)
                {
                    ColumnSet = columns,
                    Criteria = new FilterExpression() { Conditions = { new ConditionExpression("accountid", ConditionOperator.Equal, accountId) } },
                    NoLock = true
                }).Entities[0].ToEntity<Account>();
            }
            catch (Exception ex)
            {
                context.Trace(ex);
                throw;
            }
        }

        public static EL_As400_Account GetAccountAs400(string accountcode, Plugin.LocalPluginContext localContext, ColumnSet columns = null)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_as400_account")
            {
                ColumnSet = (columns == null) ? new ColumnSet("el_as400_accountid") : columns,
                Attributes = { "el_name" },
                Values = { accountcode }
            });
            if (ec != null && ec.Entities != null && ec.Entities.Count > 0)
            {
                return ec[0].ToEntity<EL_As400_Account>();
            }
            return null;
        }

        public static EL_Car_Purchase GetCarPurchase(string purchaseNumber, Plugin.LocalPluginContext localContext)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_car_purchase")
            {
                ColumnSet = new ColumnSet(true),
                Attributes = { "el_s_purchase_num" },
                Values = { purchaseNumber }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_Car_Purchase>();
            else
                return null;
        }

        public static EL_Car_Purchase GetCarPurchaseByOrderNumber(string orderNumber, Plugin.LocalPluginContext localContext)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_car_purchase")
            {
                ColumnSet = new ColumnSet(true),
                Attributes = { "el_s_order_num" },
                Values = { orderNumber }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_Car_Purchase>();
            else
                return null;
        }

        public static Guid RetrieveOpportunityGuid(Plugin.LocalPluginContext localContext, EL_As400_Account as400)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_car_purchase")
            {
                ColumnSet = new ColumnSet("el_id_opportunity"),
                Attributes = { "el_id_as400_account" },
                Values = { as400.Id },
                Orders = { new OrderExpression("createdon", OrderType.Descending) }
            });

            Guid opportunityGuid = Guid.Empty;
            if (ec != null && ec.Entities != null && ec.Entities.Count > 0)
            {
                foreach (Entity entity in ec.Entities)
                {
                    EL_Car_Purchase pur = entity.ToEntity<EL_Car_Purchase>();
                    opportunityGuid = (pur.EL_Id_Opportunity == null) ? Guid.Empty : pur.EL_Id_Opportunity.Id;
                    if (opportunityGuid != Guid.Empty)
                        break;
                }
            }
            return opportunityGuid;

        }

        public static EL_Showroom GetShowRoom(Plugin.LocalPluginContext localContext, string showRoomCode)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_showroom")
            {
                Attributes = { "el_s_showroom_cod" },
                Values = { showRoomCode },
                ColumnSet = new ColumnSet("el_s_showroom_cod")
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_Showroom>();
            else
                return null;

        }

        public static Campaign GetCampaign(Plugin.LocalPluginContext localContext, int campaignCode)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("campaign")
            {
                Attributes = { "el_n_auto_number" },
                Values = { campaignCode }
            });

            if (ec.Entities.Count == 0)
            {
                Campaign entity = new Campaign()
                {
                    EL_N_Auto_Number = campaignCode,
                    Name = "<׳׳ ׳™׳“׳•׳¢>"
                };
                entity.Id = localContext.OrganizationService.Create(entity);
                return entity;
            }
            else
                return ec.Entities[0].ToEntity<Campaign>();

        }

        public static EL_Primary_Channel GetChannel(Plugin.LocalPluginContext localContext, int channelCode)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_primary_channel")
            {
                Attributes = { "el_n_code" },
                Values = { channelCode }
            });

            if (ec.Entities.Count == 0)
            {
                EL_Primary_Channel entity = new EL_Primary_Channel()
                {
                    EL_N_Code = channelCode,
                    EL_Name = "<׳׳ ׳™׳“׳•׳¢>"
                };
                entity.Id = localContext.OrganizationService.Create(entity);
                return entity;
            }
            else
                return ec.Entities[0].ToEntity<EL_Primary_Channel>();

        }

        public static EL_Secondary_Channel GetPlatform(Plugin.LocalPluginContext localContext, int platformCode)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_secondary_channel")
            {
                Attributes = { "el_n_code" },
                Values = { platformCode }
            });

            if (ec.Entities.Count == 0)
            {
                EL_Secondary_Channel entity = new EL_Secondary_Channel()
                {
                    EL_N_Code = platformCode,
                    EL_Name = "<׳׳ ׳™׳“׳•׳¢>"
                };
                entity.Id = localContext.OrganizationService.Create(entity);
                return entity;
            }
            else
                return ec.Entities[0].ToEntity<EL_Secondary_Channel>();

        }

        public static EL_Family GetFamily(Plugin.LocalPluginContext localContext, int familyCode)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_family")
            {
                Attributes = { "el_n_family_cod", "StateCode" },
                Values = { familyCode, 0 },
                ColumnSet = new ColumnSet("el_name")
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_Family>();
            else
                return null;

        }

        public static EL_City GetCity(Plugin.LocalPluginContext localContext, int cityCode)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_city")
            {
                ColumnSet = new ColumnSet("el_s_name"),
                Attributes = { "el_n_postal_city_code" },
                Values = { cityCode }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_City>();
            else
                return null;
        }

        public static EL_TradeIn_Deal GetTradeinDeal(string purchaseNumber, Plugin.LocalPluginContext localContext)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_tradein_deal")
            {
                ColumnSet = new ColumnSet(true),
                Attributes = { "el_s_purchase_num" },
                Values = { purchaseNumber }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_TradeIn_Deal>();
            else
                return null;
        }

        public static EL_Car_Purchase GetCarPurchaseByLicenceNumber(string licenceNumber, Plugin.LocalPluginContext localContext)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_car_purchase")
            {
                ColumnSet = new ColumnSet(true),
                Attributes = { "el_s_licence_plate" },
                Values = { licenceNumber }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_Car_Purchase>();
            else
                return null;
        }

        public static Guid RetrieveManufacturerByCode(string manufacturerCode, Plugin.LocalPluginContext localContext)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_manufacturer")
            {
                Attributes = { "el_s_supllier_as400cod" },
                Values = { manufacturerCode }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_Manufacturer>().Id;
            else
                return Guid.Empty;

        }

        public static Entity GetEmailBasedTemplate(IOrganizationService service, string templateName, string objetType, Guid objectTypeId)
        {
            try
            {
                InstantiateTemplateResponse instTemplateResp = EmailTemplateQuery.GetEmailTemplateResponse(service, templateName, objetType, objectTypeId);

                if (instTemplateResp != null && instTemplateResp.EntityCollection.Entities.Count > 0)
                    return instTemplateResp.EntityCollection.Entities[0];
                return null;
            }
            catch (Exception)
            {
                return null;
            }
        }

        public static bool DuplicateAccountIdNumberExists(int? idNumber, Guid? idType, Plugin.LocalPluginContext context, Guid? accountid)
        {

            QueryExpression query = new QueryExpression("account");
            #region Filter
            ConditionExpression condition;
            FilterExpression filter = new FilterExpression();
            condition = new ConditionExpression("el_n_idnumber_int", ConditionOperator.Equal, idNumber);
            ConditionExpression condition1 = idType == null ? new ConditionExpression("el_id_type_code", ConditionOperator.Null) : new ConditionExpression("el_id_type_code", ConditionOperator.Equal, idType);

            ConditionExpression condition2 = new ConditionExpression("StateCode", ConditionOperator.In, 0);
            filter.AddCondition(condition);
            filter.AddCondition(condition1);
            filter.AddCondition(condition2);
            if (accountid.HasValue)
            {
                ConditionExpression condition3 = new ConditionExpression("accountid", ConditionOperator.NotEqual, accountid);
                filter.AddCondition(condition3);
            }

            query.Criteria = filter;

            #endregion

            try
            {
                EntityCollection entityCol = context.OrganizationService.RetrieveMultiple(query);
                return entityCol.Entities.Count > 0;
            }
            catch (Exception ex)
            {
                context.Trace(ex);
                throw new ApplicationException("DuplicateAccountIdNumberExists threw this error: " + ex.Message, ex);
            }

        }

        public static void UpdateDisplayOrderOfEntities<TEntity>(Elad.DynamicsCRM.DelekMotors.Plugins.Plugin.LocalPluginContext localContext, List<TEntity> tEntityListToUpdate, int justSettedDisplayOrderNumber) where TEntity : Entity
        {
            int previousNumber = -1;
            for (int i = 0; i < tEntityListToUpdate.Count; i++)
            {
                #region Check a current entity Data for continue (If contain el_n_display_order_in_the_digital_assets field and IS one of the entities)

                if (!tEntityListToUpdate[i].Attributes.Contains("el_n_display_order_in_the_digital_assets"))
                    continue;
                switch (tEntityListToUpdate[i].LogicalName)
                {
                    case EL_Model.EntityLogicalName:
                    case EL_Showroom.EntityLogicalName:
                    case EL_Family.EntityLogicalName:
                        break;          // If the entity is one of the entities above start UPDATE locig
                    default:
                        continue;
                }

                #endregion

                int currentEntityDisplayOrderNumber = (int)tEntityListToUpdate[i].Attributes["el_n_display_order_in_the_digital_assets"];

                #region Update a display order number if They Equal to just updated number of entity (PreUpdateEntity before) OR if is Equal to previous number of Loop

                if (currentEntityDisplayOrderNumber == justSettedDisplayOrderNumber || (previousNumber != -1 && previousNumber + 1 == currentEntityDisplayOrderNumber))
                {
                    if (tEntityListToUpdate[i].Id != Guid.Empty)
                    {
                        Entity entToUp = new Entity()
                        {
                            Id = tEntityListToUpdate[i].Id,
                            LogicalName = tEntityListToUpdate[i].LogicalName,
                            Attributes = new AttributeCollection(){
                                {"el_n_display_order_in_the_digital_assets", currentEntityDisplayOrderNumber + 1}
                            }
                        };
                        previousNumber = currentEntityDisplayOrderNumber;
                        localContext.OrganizationService.Update(entToUp);
                    }
                    else
                        localContext.TracingService.Trace("Guid of entity is Empty");
                }
                else
                {
                    previousNumber = -1;
                }

                #endregion
            }
        }

        public static Guid GetSalesCampaign(string manufacturerCode, string code, Plugin.LocalPluginContext localContext)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_sales_campaign")
            {
                Attributes = { "el_s_promotion_code", "el_s_manufacturer_code" },
                Values = { code, manufacturerCode }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_Sales_Campaign>().Id;
            else
                return Guid.Empty;

        }

        public static Guid GetShowRoomByUser(Plugin.LocalPluginContext localContext, Guid userId)
        {
            QueryExpression qe = new QueryExpression();
            qe.EntityName = "systemuser";
            qe.ColumnSet = new ColumnSet();
            qe.Criteria = new FilterExpression
            {
                Conditions =
                        {
                            new ConditionExpression
                            {
                                AttributeName = "systemuserid",
                                Operator = ConditionOperator.Equal,
                                Values = { userId }
                            }
                        }
            };

            qe.LinkEntities.Add(new LinkEntity("systemuser", "businessunit", "businessunitid", "businessunitid", JoinOperator.Inner));
            qe.LinkEntities[0].Columns.AddColumns("el_id_showroom");
            qe.LinkEntities[0].EntityAlias = "userBU";

            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(qe);
            if (ec.Entities.Count > 0 && ec.Entities[0].Contains("userBU.EL_Id_Showroom"))
                return ((EntityReference)(((AliasedValue)ec.Entities[0]["userBU.EL_Id_Showroom"]).Value)).Id;
            return Guid.Empty;
        }

        public static Guid RetrieveTradeinManufacturerByCode(string manufacturerCode, Plugin.LocalPluginContext localContext)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_tradein_manufacturer")
            {
                Attributes = { "el_s_man_code", "StateCode" },
                Values = { manufacturerCode, 0 }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_TradeIn_Manufacturer>().Id;
            else
                return Guid.Empty;

        }

        public static Guid RetrieveTradeiFamilyByCodeAndManufacturer(string manufacturerCode, string familyCode, Plugin.LocalPluginContext localContext)
        {
            EntityCollection ec = localContext.OrganizationService.RetrieveMultiple(new QueryByAttribute("el_global_family")
            {
                Attributes = { "el_s_man_code", "el_s_code", "StateCode" },
                Values = { manufacturerCode, familyCode, 0 }
            });

            if (ec.Entities.Count != 0)
                return ec.Entities[0].ToEntity<EL_Global_Family>().Id;
            else
                return Guid.Empty;

        }

    }
}
