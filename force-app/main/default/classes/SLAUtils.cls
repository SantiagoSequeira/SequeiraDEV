public class SLAUtils  {

    static Map<Id, Account> accountsById = new Map<Id, Account> ();
	static Map<String, SlaProcess> slaProcessesByName = new Map<String, SlaProcess> ();
	static Map<Id, Schema.RecordTypeInfo> recordTypesById = new Map<Id, Schema.RecordTypeInfo>();
    static List<SLACriterion__c> slaCriterions = [SELECT Name,Checked__c,FieldName__c, FieldType__c, IsNot__c, SelectedOptions__c, SLAProcess__c FROM SLACriterion__c];
    static Map<String, List<SLACriterion__c>> slaCriterionsByProcessNames = new Map<String, List<SLACriterion__c>>();
    static Id defaultAccount = [SELECT defaultAccountId__c FROM DefaultAccount__mdt LIMIT 1].defaultAccountId__c;
    //static Map<String,Object> fieldsOfSLA = SLA__mdt.sObjectType.getDescribe().fields.getMap();
    
    public static void assignEntitlements (List<Case> casesToProcess) {
        Set<Id> idsAccounts = new Set<Id> ();
		Set<Id> idsSlaProcesses = new Set<Id> ();
		Set<String> namesSlaProcesses = new Set<String> ();

        for(SLACriterion__c criterion :slaCriterions) {
            if (slaCriterionsByProcessNames.containsKey(criterion.SLAProcess__c)) {
                slaCriterionsByProcessNames.get(criterion.SLAProcess__c).add(criterion);           
            } else {
                List<SLACriterion__c> newList = new List<SLACriterion__c>();
                newList.add(criterion);
                slaCriterionsByProcessNames.put(criterion.SLAProcess__c, newList);
            }
        }


		for(Schema.RecordTypeInfo rT : Schema.SObjectType.Case.getRecordTypeInfos()){
			recordTypesById.put(rT.getRecordTypeId(),rT);
		}

		for (Case aCase : casesToProcess) {

			Boolean isAnEmailCase = String.isNotBlank(aCase.Origin) && aCase.Origin.equalsIgnoreCase('Email');
			Boolean isCreated = aCase.Id == null;
			if (String.isBlank(aCase.AccountId) && ((isAnEmailCase && !isCreated) || !isAnEmailCase)) {
                aCase.AccountId = defaultAccount;
				//continue;
			}
			if (String.isBlank(aCase.AccountId) && String.isBlank(aCase.ContactId) && isAnEmailCase && isCreated) {
                aCase.AccountId = defaultAccount; 
				//continue;
			}

			String config = getSlaProcessForCase(aCase);

			if (config == null || String.isBlank(aCase.AccountId)) {
				continue;
			}

            
			idsAccounts.add(aCase.AccountId);
			namesSlaProcesses.add(config);
		}
		for (SlaProcess latestVersion : [
		     SELECT Id, Name
		     FROM SlaProcess
		     WHERE IsActive = true
             AND IsVersionDefault = true
		     ]) {
			idsSlaProcesses.add(latestVersion.Id);
			slaProcessesByName.put(latestVersion.Name, latestVersion);
		}

		Map<Id, List<Entitlement>> entitlementsByAccount = new Map<Id, List<Entitlement>> ();

		for (Entitlement accountEntitlement :[
		     SELECT Id, AccountId, SLAProcessId
		     FROM Entitlement
		     WHERE AccountId IN :idsAccounts
		     AND SlaProcessId IN :idsSlaProcesses
		     ]) {
			if (!entitlementsByAccount.containsKey(accountEntitlement.AccountId)) {
				entitlementsByAccount.put(accountEntitlement.AccountId, new List<Entitlement>());
			} else {
			    entitlementsByAccount.get(accountEntitlement.AccountId).add(accountEntitlement);
            }
		}

		List<Case> casesToCreateEntitlement = new List<Case> ();
		for (Case aCase : casesToProcess) {

			String config = getSlaProcessForCase(aCase);
			if (config == null
			    || slaProcessesByName.get(config) == null
			    || String.isBlank(aCase.AccountId)
			) {
				aCase.EntitlementId = null;
				continue;
			}

			SlaProcess latestVersion = slaProcessesByName.get(config);
            if(!entitlementsByAccount.containsKey(aCase.AccountId)){
                casesToCreateEntitlement.add(aCase);
				continue;
            }
            List<Entitlement> entitlements = entitlementsByAccount.get(aCase.AccountId);
			for (Entitlement accountEntitlement : entitlements) {
				if (accountEntitlement.SlaProcessId == latestVersion.Id
				    && aCase.EntitlementId != accountEntitlement.Id
				) {
					aCase.EntitlementId = accountEntitlement.Id;
					break;
				}
			}

			if (String.isBlank(aCase.EntitlementId)) {
				casesToCreateEntitlement.add(aCase);
			}
		}

		if (!casesToCreateEntitlement.isEmpty()) {
			for (Account cuenta :[
			     SELECT Id, Name
			     FROM Account
			     WHERE Id IN :idsAccounts
			     ]) {
				accountsById.put(cuenta.Id, cuenta);
			}
			createAndAssignEntitlements(casesToCreateEntitlement);
		}
	}

	public static void createAndAssignEntitlements(List<Case> casesToProcess) {
		List<Entitlement> newEntitlements = new List<Entitlement> ();

		Map<String, Entitlement> entitlementsByAccountAndSLA = new Map<String, Entitlement> ();

		for (Case aCase : casesToProcess) {

			String processSelected = getSlaProcessForCase(aCase);

			SlaProcess latestVersion = slaProcessesByName.get(processSelected);

			String newEntitlementKey = aCase.AccountId + '-' + latestVersion.Id;

			if (!entitlementsByAccountAndSLA.containsKey(newEntitlementKey)) {
				Entitlement newEntitlement = new Entitlement();
				newEntitlement.AccountId = aCase.AccountId;
				newEntitlement.SlaProcessId = latestVersion.Id;
				newEntitlement.Name = processSelected + ' ' + accountsById.get(aCase.AccountId).Name;
				newEntitlement.StartDate = Date.today();
				newEntitlements.add(newEntitlement);
				entitlementsByAccountAndSLA.put(newEntitlementKey, newEntitlement);
			}
		}

		insert newEntitlements;

		for (Case aCase : casesToProcess) {

			String config = getSlaProcessForCase(aCase);

			SlaProcess latestVersion = slaProcessesByName.get(config);

			String newEntitlementKey = aCase.AccountId + '-' + latestVersion.Id;
			aCase.EntitlementId = entitlementsByAccountAndSLA.get(newEntitlementKey).Id;
		}
	}

    public static void closeMilestonesInClosedCases (List<Case> cases, Map<Id,Case> oldCases) {
        List<Case> casesForCloseMilestones = new List<Case>();
        for(Case aCase : cases) {
            if(aCase.IsClosed && (aCase.IsClosed != oldCases.get(aCase.Id).IsClosed)) {
                casesForCloseMilestones.add(aCase);
                
            }
        }  
        if(!casesForCloseMilestones.isEmpty()) {
            closeMilestones(casesForCloseMilestones);
        }  
    }

	public static List<CaseMilestone> getCaseMilestonesFromCases(List<Case> casesToProcess) {
		return  [SELECT Id, CompletionDate, IsCompleted, MilestoneType.Name
		            FROM CaseMilestone
		            WHERE CaseId in : casesToProcess
		            AND IsCompleted = false
		        ];
	}

	public static void closeMilestones(List<Case> casesToProcess) {
		List<CaseMilestone> caseMilestones = getCaseMilestonesFromCases(casesToProcess);
		DateTime now = DateTime.now();

		for (CaseMilestone milestone : caseMilestones) {
			milestone.CompletionDate = now;
		}

		update caseMilestones;
	}

	public static String getSlaProcessForCase(Case aCase) {
		String rTypeId = aCase.RecordTypeId;
        String temporarySelectedProcess;
		if(recordTypesById.containsKey(rTypeId)){
            Integer maxCantOfCriterions = 0;
			for(String key :slaCriterionsByProcessNames.keySet()) {
                Integer cantOfCriterion = 0;
                Boolean rejected = false;
                for(SLACriterion__c criterion :slaCriterionsByProcessNames.get(key)) {
                    if(criterion.FieldType__c != 'BOOLEAN') {
                        Integer passedValues = 0;
                        String fieldvalue = String.valueOf(aCase.get(criterion.FieldName__c));
                        List<String> values = (List<String>) JSON.deserialize(criterion.SelectedOptions__c, List<String>.class);
						Boolean hasInvalid = false;
						
                        for(String filterVal : values) {
                            if(criterion.IsNot__c) {
                                if(filterVal != fieldvalue) {
                                    passedValues++;
                                    break;
                                } else {
									hasInvalid = true;
                                	break;
								}
                            } else {
                                if(filterVal == fieldvalue) {
                                    passedValues++;
                                    break;
                                }
                            } 
                        }
                        if(passedValues > 0 && !hasInvalid) {
                            cantOfCriterion++;
                            continue;
                        }
                        rejected = true;
                        break;
                    } else {
                        if(criterion.IsNot__c) {
                            if(aCase.get(criterion.FieldName__c) != criterion.Checked__c) {
                                cantOfCriterion++;
                                continue; 
                            }
                            rejected = true;
                            break; 
                        } else {
                            System.debug(aCase.get(criterion.FieldName__c));
                            System.debug(criterion.Checked__c);
                            if(aCase.get(criterion.FieldName__c) == criterion.Checked__c) {
                                cantOfCriterion++; 
                                continue;
                            }
                            rejected = true;
                            break;
                        } 
                    }   
                }
                if(!rejected) {
                    if(cantOfCriterion > maxCantOfCriterions) {
                        temporarySelectedProcess = key;
                    }
                }
            }
            return temporarySelectedProcess;
		}
		return null;
	}
}