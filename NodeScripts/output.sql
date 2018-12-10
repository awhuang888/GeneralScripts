IF Object_id('[dbo].CompanyExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].CompanyExtract
go
Create Table  CompanyExtract  (
  ExternalReference                    nvarchar(32)         Not Null
, RegisteredName                       nvarchar(256)        Not Null
, TradingName                          nvarchar(256)        Not Null
, CompanyRegistrationNumber            nvarchar(64)         
, TaxRegistrationNumber                nvarchar(64)         
, RegistrationDate                     date                 
, LicenceNumber                        nvarchar(64)         
, PhoneNumber                          nvarchar(32)         
, Fax                                  nvarchar(32)         
, EmailAddress                         varchar(128)         
, SecondaryEmail                       varchar(128)         
, WebsiteUrl                           varchar(512)         
, CompanyType                          int                  Not Null
  CONSTRAINT [CHK_CompanyExtract_CompanyType]
	CHECK ( CompanyType in (1,2,3) ) -- 1 - Employer, 2 - Financial Planning, 3 - Investment Advice
, DomiciledCountryCode                 char(2)              
, DomiciledRegion                      nvarchar(64)         
, BaseCurrencyCode                     char(3)              	default 'AUD'
, ConversationId                       uniqueidentifier     
  CONSTRAINT [PK_CompanyExtract]
	PRIMARY KEY CLUSTERED ( ExternalReference ASC )
)go

IF Object_id('[dbo].EmployerExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].EmployerExtract
go
Create Table  EmployerExtract  (
  ExternalReference                    nvarchar(32)         Not Null
, RegisteredName                       nvarchar(256)        Not Null
, TradingName                          nvarchar(256)        Not Null
, CompanyRegistrationNumber            nvarchar(64)         
, TaxRegistrationNumber                nvarchar(64)         
, RegistrationDate                     date                 
, LicenceNumber                        nvarchar(64)         
, PhoneNumber                          nvarchar(32)         
, Fax                                  nvarchar(32)         
, EmailAddress                         varchar(128)         
, SecondaryEmail                       varchar(128)         
, WebsiteUrl                           varchar(512)         
, CompanyType                          int                  Not Null
  CONSTRAINT [CHK_EmployerExtract_CompanyType]
	CHECK ( CompanyType in (1,2,3) ) -- 1 - Employer, 2 - Financial Planning, 3 - Investment Advice
, DomiciledCountryCode                 char(2)              
, DomiciledRegion                      nvarchar(64)         
, BaseCurrencyCode                     char(3)              	default 'AUD'
, EmployerType                         nvarchar(128)        Not Null
, StartDate                            date                 Not Null
, EndDate                              date                 
, ApplicationReceivedDate              date                 
, DateFundBecomesDefault               date                 
)go

IF Object_id('[dbo].IndividualExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].IndividualExtract
go
Create Table  IndividualExtract  (
  ExternalReference                    nvarchar(32)         Not Null
, Title                                nvarchar(32)         Not Null
, FirstName                            nvarchar(64)         Not Null
, MiddleName                           nvarchar(64)         
, LastName                             nvarchar(64)         Not Null
, Birthdate                            datetime             
, Gender                               char(1)              
, HomePhone                            nvarchar(32)         
, WorkPhone                            nvarchar(32)         
, MobilePhone                          nvarchar(32)         
, Fax                                  nvarchar(32)         
, EmailAddress                         varchar(128)         
, SecondaryEmail                       varchar(128)         
, ContactMethodTypeId                  int                  
  CONSTRAINT [CHK_IndividualExtract_ContactMethodTypeId]
	CHECK ( ContactMethodTypeId in (1,2,3) ) -- 1 = Phone, 2 = Email, 3 = Post
, ConversationId                       uniqueidentifier     
)go

IF Object_id('[dbo].EntityAssociationExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].EntityAssociationExtract
go
Create Table  EntityAssociationExtract  (
  ID                                   int identity         Not Null
, EntityExternalReference              nvarchar(32)         Not Null
, AssociatedEntityExternalReference    nvarchar(32)         Not Null
, AssociationType                      int                  Not Null
  CONSTRAINT [CHK_EntityAssociationExtract_AssociationType]
	CHECK ( AssociationType in (4,7,8) ) -- 4 = Financial Adviser, 7 = Primary Contact, 8 = Secondary Contact
, AssociationStartDate                 date                 
, AssociationEndDate                   date                 
  CONSTRAINT [PK_EntityAssociationExtract]
	PRIMARY KEY CLUSTERED ( "ID" ASC )
)go

IF Object_id('[dbo].MemberExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].MemberExtract
go
Create Table  MemberExtract  (
  ExternalReference                    nvarchar(32)         Not Null
, Title                                nvarchar(32)         
, FirstName                            nvarchar(64)         Not Null
, MiddleName                           nvarchar(64)         
, LastName                             nvarchar(64)         Not Null
, Birthdate                            date                 Not Null
, BirthdateVerified                    bit                  
, Gender                               char(1)              
, EmailAddress                         varchar(128)         
, SecondaryEmail                       varchar(128)         
, HomePhone                            nvarchar(32)         
, WorkPhone                            nvarchar(32)         
, MobilePhone                          nvarchar(32)         
, Fax                                  nvarchar(32)         
, TaxFileNumber                        varchar(32)          
, DeceasedDate                         date                 
, DeceasedDateVerified                 bit                  
, ContactMethodTypeId                  int                  
  CONSTRAINT [CHK_MemberExtract_ContactMethodTypeId]
	CHECK ( ContactMethodTypeId in (1,2,3) ) -- 1 = Phone, 2 = Email, 3 = Post
, Restricted                           bit                  Not Null	default 0
, ApplicationReceivedDate              date                 
, AmlRiskLevel                         varchar(32)          
, AmlKyc                               bit                  
, AtoTfnStatus                         varchar(32)          
, OptOutOfConsolidation                bit                  
, OptOutOfConsolidationDate            date                 
, TpdDate                              date                 
, TiStartDate                          date                 
, TiEndDate                            date                 
, JoinedFundDate                       date                 
, TfnExemption                         bit                  
, TfnValidationDate                    date                 
, TfnInterfundConsentDate              date                 
, PermanentExclusionFromLostReport     bit                  
, AtoHeldSuperConsolidationConsentDate date                 
, IntraFundConsolidationConsentDate    date                 
, NzKiwiSaverAccountNumber             varchar(32)          
, NzIrd                                varchar(32)          
, Occupation                           varchar(64)          
, Smoker                               bit                  
, LastContactDate                      date                 
, ConversationId                       uniqueidentifier     
)go

IF Object_id('[dbo].EmploymentHistoryExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].EmploymentHistoryExtract
go
Create Table  EmploymentHistoryExtract  (
  EmploymentHistoryId                  uniqueidentifier     Not Null
, EntityExternalReference              nvarchar(32)         Not Null
, EmployerExternalReference            nvarchar(32)         Not Null
, StartDate                            date                 Not Null
, TerminationDate                      date                 
, EmploymentTypeId                     int                  Not Null
  CONSTRAINT [CHK_EmploymentHistoryExtract_EmploymentTypeId]
	CHECK ( EmploymentTypeId in (1,2,3,8) ) -- 1 Full-Time, 2	Part-Time, 3 Casual, 8 Self employed
, EmploymentTerminationTypeId          int                  
  CONSTRAINT [CHK_EmploymentHistoryExtract_EmploymentTerminationTypeId]
	CHECK ( EmploymentTerminationTypeId in (1,2,3,4,6,7,8,9,10,11,13,14) ) -- See documents
, EmploymentTerminationReason          nvarchar(max)        
, ChoiceOfFundDate                     date                 
  CONSTRAINT [PK_EmploymentHistoryExtract]
	PRIMARY KEY CLUSTERED ( EmploymentHistoryId ASC )
)go

IF Object_id('[dbo].EmploymentServiceHistoryExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].EmploymentServiceHistoryExtract
go
Create Table  EmploymentServiceHistoryExtract  (
  ID                                   int identity         Not Null
, EmploymentHistoryId                  uniqueidentifier     Not Null
, EffectiveDate                        date                 Not Null
, EmploymentFraction                   decimal(9,4)         Not Null
, ServiceEventReasonId                 int                  Not Null
  CONSTRAINT [CHK_EmploymentServiceHistoryExtract_ServiceEventReasonId]
	CHECK ( ServiceEventReasonId in (1,2,3,4,5,6,7) ) -- See Document
  CONSTRAINT [PK_EmploymentServiceHistoryExtract]
	PRIMARY KEY CLUSTERED ( "ID" ASC )
)go

IF Object_id('[dbo].EmploymentSalaryHistoryExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].EmploymentSalaryHistoryExtract
go
Create Table  EmploymentSalaryHistoryExtract  (
  EmploymentHistoryId                  uniqueidentifier     Not Null
, StartDate                            date                 Not Null
, EndDate                              date                 
, Salary                               decimal(18,6)        Not Null
  CONSTRAINT [PK_EmploymentSalaryHistoryExtract]
	PRIMARY KEY CLUSTERED ( EmploymentHistoryId, StartDate ASC )
)go

IF Object_id('[dbo].WorkTestInformationExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].WorkTestInformationExtract
go
Create Table  WorkTestInformationExtract  (
  EntityExternalReference              nvarchar(32)         Not Null
, FinancialYear                        int                  Not Null
, EffectiveDate                        date                 Not Null
  CONSTRAINT [PK_WorkTestInformationExtract]
	PRIMARY KEY CLUSTERED ( EntityExternalReference, FinancialYear ASC )
)go

IF Object_id('[dbo].BankAccountExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].BankAccountExtract
go
Create Table  BankAccountExtract  (
  ID                                   int Identity         Not Null
, OwnerExternalReference               nvarchar(32)         Not Null
, BSB                                  nvarchar(64)         Not Null
, AccountNumber                        nvarchar(32)         Not Null
, AccountName                          nvarchar(256)        Not Null
, IsPrimary                            bit                  Not Null
, StartDate                            date                 Not Null
, EndDate                              date                 
  CONSTRAINT [PK_BankAccountExtract]
	PRIMARY KEY CLUSTERED ( "ID" ASC )
)go

IF Object_id('[dbo].AddressDetailsExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].AddressDetailsExtract
go
Create Table  AddressDetailsExtract  (
  OwnerExternalReference               nvarchar(32)         Not Null
, AddressTypeId                        int                  Not Null
  CONSTRAINT [CHK_AddressDetailsExtract_AddressTypeId]
	CHECK ( AddressTypeId in (1,2,3) ) -- 1. Residential (Person only), 2. Office (Company only), 3. Postal
, AddressLine1                         nvarchar(256)        Not Null
, AddressLine2                         nvarchar(256)        
, AddressLine3                         nvarchar(256)        
, Suburb                               nvarchar(256)        Not Null
, State                                nvarchar(64)         Not Null
, Postcode                             nvarchar(32)         Not Null
, CountryCode                          nvarchar(2)          Not Null
, DPID                                 nvarchar(256)        
, ReturnMailCount                      int                  Not Null
)go

IF Object_id('[dbo].SuperAccountExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].SuperAccountExtract
go
Create Table  SuperAccountExtract  (
  OwnerExternalReference               nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, InvestmentVehicleExternalReference   nvarchar(256)        Not Null
, ServiceOfferName                     nvarchar(256)        Not Null
, AccountTypeId                        int                  Not Null
CONSTRAINT [CHK_SuperAccountExtract_AccountTypeId]
	CHECK ( AccountTypeId in (1) ) --Only 1
, StartDate                            date                 Not Null
, ClosedDate                           date                 
, LockedDatetime                       date                 
, Flags                                int                  
, WelcomeLetterDate                    date                 
, ApplicationReceivedDate              date                 
, IsSpouse                             bit                  Not Null	default 0
, ConversationId                       uniqueidentifier     
)go

IF Object_id('[dbo].AccountLostExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].AccountLostExtract
go
Create Table  AccountLostExtract  (
  Id                                   int identity         Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, LostPeriodEndDate                    date                 Not Null
, LostStatusId                         int                  Not Null
  CONSTRAINT [CHK_AccountLostExtract_LostStatusId]
	CHECK ( LostStatusId in (1,2,3,4,5) ) -- 1 = Lost, 2 = Inactive, 3 = Transferred, 4 = Found, 5 = Error
, DateReported                         datetime             Not Null
  CONSTRAINT [PK_AccountLostExtract]
	PRIMARY KEY CLUSTERED ( Id ASC )
)go

IF Object_id('[dbo].PensionAccountExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].PensionAccountExtract
go
Create Table  PensionAccountExtract  (
  OwnerExternalReference               nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, InvestmentVehicleExternalReference   nvarchar(256)        Not Null
, ServiceOfferName                     nvarchar(256)        Not Null
, AccountTypeId                        int                  Not Null
CONSTRAINT [CHK_PensionAccountExtract_AccountTypeId]
	CHECK ( AccountTypeId in (2,4,7) ) --2 = ABP Pension, 4 - TRP/TTR/NCAP, 7 = TAP
, StartDate                            date                 Not Null
, ClosedDate                           date                 
, LockedDatetime                       date                 
, Flags                                int                  
, BSB                                  nvarchar(32)         Not Null
, AccountNumber                        nvarchar(32)         Not Null
, AccountName                          nvarchar(256)        Not Null
, DrawdownFrequency                    int                  Not Null
CONSTRAINT [CHK_PensionAccountExtract_DrawdownFrequency]
	CHECK ( DrawdownFrequency in (4,5,7,8,9,10,11) ) --4 = weekly, 5 = fortnightly, 7 = monthly, 8 = bi-monthly, 9 = quarterly, 10 = bi-anually, 11 = annually
, DrawdownStartDate                    date                 Not Null
, DrawdownEndDate                      date                 
, DrawdownPreference                   int                  Not Null
CONSTRAINT [CHK_PensionAccountExtract_DrawdownPreference]
	CHECK ( DrawdownPreference in (0,1,2,3,4,5) ) --0 = minimum, 1 = maximum, 2 = annual, 3 = prescribed amount, 4 = regular, 5 = percentage
, DrawdownNextPaymentDate              date                 
, DrawdownAmount                       money                Not Null
, DrawdownAnnualAmount                 money                
, DrawdownAnnualMinimum                money                
, DrawdownAnnualMaximum                money                
, DrawdownAnnualisedAmount             money                
, TaxOverride                          money                
, AdditionalTaxAmount                  money                
, ApplyTaxOffset                       bit                  Not Null	default 1
CONSTRAINT [CHK_PensionAccountExtract_ApplyTaxOffset]
	CHECK ( ApplyTaxOffset in (1,2) ) --1 = Default, 2 = Claim Tax Free Threshold
, TaxScale                             int                  Not Null
, PensionTerm                          int                  
, PrescribedAmount                     money                
, RevertToExternalReference            nvarchar(256)        
, RevertedFromExternalReference        nvarchar(256)        
, RevertedDate                         date                 
, RelevantNumber                       decimal(9,4)         
, WelcomeLetterDate                    date                 
, ApplicationReceivedDate              date                 
, IsSpouse                             bit                  Not Null	default 0
, ConversationId                       uniqueidentifier     
)go

IF Object_id('[dbo].DefinedBenefitAccountExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].DefinedBenefitAccountExtract
go
Create Table  DefinedBenefitAccountExtract  (
  OwnerExternalReference               nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, EmployerExternalReference            nvarchar(256)        Not Null
, InvestmentVehicleExternalReference   nvarchar(256)        Not Null
, ServiceOfferName                     nvarchar(256)        Not Null
, StartDate                            date                 Not Null
, ClosedDate                           date                 
, LockedDatetime                       date                 
, Flags                                int                  	default 0
, WelcomeLetterDate                    date                 
, ApplicationReceivedDate              date                 
, IsSpouse                             bit                  Not Null	default 0
, ConversationId                       uniqueidentifier     
)go

IF Object_id('[dbo].InsuranceExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].InsuranceExtract
go
Create Table  InsuranceExtract  (
  InsuredExternalReference             nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, ServiceProviderExternalReference     nvarchar(256)        Not Null
, PolicyHolderExternalReference        nvarchar(256)        Not Null
, PolicyNumber                         nvarchar(64)         Not Null
, PolicyStartDate                      date                 Not Null
, PolicyEndDate                        date                 
, InsuranceCoverTypeId                 int                  Not Null
  CONSTRAINT [CHK_InsuranceExtract_InsuranceCoverTypeId]
	CHECK ( InsuranceCoverTypeId in (3,7,8,9,10) ) -- 3 = Income Protection, 8 = Basic Death/TI, 10 = Basic TPD, 9 = Vol Death/TI, 7 = Vol TPD
, InsuranceStatusId                    int                  Not Null
  CONSTRAINT [CHK_InsuranceExtract_InsuranceStatusId]
	CHECK ( InsuranceStatusId in (1,2,3,4,5,6,7,8,9,10,11) ) -- See Document
, LimitedCover                         bit                  Not Null	default 0
, InsuredAmount                        numeric(19,2)        Not Null
, AnnualPremium                        numeric(19,2)        Not Null
, WaitingPeriod                        varchar(64)          
, BenefitPeriod                        varchar(64)          
, Salary                               numeric(19,2)        
, SalarySuppliedBy                     varchar(64)          
, PolicyType                           varchar(64)          
, Smoker                               bit                  
, ApplySmokerLoading                   bit                  
, InsurerLoading                       numeric(19,2)        
, InsurerLoadingCoverAmount            numeric(19,2)        
, InsurerLoadingDetails                nvarchar(max)        
, ApplyInsurerLoading                  bit                  
, Exclusions                           nvarchar(max)        
, ExclusionCoverAmount                 numeric(19,2)        
, ConversationId                       uniqueidentifier     
, Birthdate                            date                 
, Gender                               char(1)              
, Age                                  int                  
, Occupation                           varchar(64)          
, SmokerLoading                        numeric(19,2)        
, WaitingPeriodLoading                 numeric(19,2)        
, BenefitPeriodLoading                 numeric(19,2)        
, IPIncomeGuarantee                    numeric(19,2)        
, IPSuperGuarantee                     numeric(19,2)        
, BaseRate                             numeric(19,2)        
, OccupationRating                     numeric(19,2)        
, BenefitAmount                        numeric(19,2)        
, AnnualBasePremium                    numeric(19,2)        
, Loading                              numeric(19,2)        
)go

IF Object_id('[dbo].InsuranceHistoryExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].InsuranceHistoryExtract
go
Create Table  InsuranceHistoryExtract  (
  InsuranceHistoryId                   int                  Not Null
, InsuredExternalReference             nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, ServiceProviderExternalReference     nvarchar(256)        Not Null
, PolicyHolderExternalReference        nvarchar(256)        Not Null
, PolicyNumber                         nvarchar(64)         Not Null
, PolicyStartDate                      date                 Not Null
, PolicyEndDate                        date                 Not Null
, InsuranceCoverTypeId                 int                  Not Null
  CONSTRAINT [CHK_InsuranceHistoryExtract_InsuranceCoverTypeId]
	CHECK ( InsuranceCoverTypeId in (3,7,8,9,10) ) -- 3 = Income Protection, 8 = Basic Death/TI, 10 = Basic TPD, 9 = Vol Death/TI, 7 = Vol TPD
, InsuranceStatusId                    int                  Not Null
  CONSTRAINT [CHK_InsuranceHistoryExtract_InsuranceStatusId]
	CHECK ( InsuranceStatusId in (1,2,3,4,5,6,7,8,9,10,11) ) -- See Document
, InsuredAmount                        numeric(19,2)        Not Null
, AnnualPremium                        numeric(19,2)        Not Null
, ConversationId                       uniqueidentifier     
, WaitingPeriod                        nvarchar(64)         
, BenefitPeriod                        nvarchar(64)         
, Salary                               numeric(19,2)        
, SalarySuppliedBy                     nvarchar(64)         
, Smoker                               bit                  
, ApplySmokerLoading                   bit                  
, Birthdate                            date                 
, Gender                               char(1)              
, Age                                  int                  
, Occupation                           varchar(64)          
, SmokerLoading                        bit                  
, WaitingPeriodLoading                 numeric(19,2)        
, BenefitPeriodLoading                 numeric(19,2)        
, IPIncomeGuarantee                    numeric(19,2)        
, IPSuperGuarantee                     numeric(19,2)        
, BaseRate                             numeric(19,2)        
, OccupationRating                     numeric(19,2)        
, BenefitAmount                        numeric(19,2)        
, AnnualBasePremium                    numeric(19,2)        
, Loading                              numeric(19,2)        
, PolicyType                           varchar(64)          
, Exclusions                           nvarchar(max)        
, ExclusionCoverAmount                 numeric(19,2)        
, InsurerLoading                       numeric(19,2)        
, InsurerLoadingCoverAmount            numeric(19,2)        
, InsurerLoadingDetails                nvarchar(max)        
, ApplyInsurerLoading                  bit                  
  CONSTRAINT [PK_InsuranceHistoryExtract]
	PRIMARY KEY CLUSTERED ( InsuranceHistoryId ASC )
)go

IF Object_id('[dbo].BeneficiaryExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].BeneficiaryExtract
go
Create Table  BeneficiaryExtract  (
  ID                                   int identity         Not Null
, MemberExternalReference              nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, Title                                nvarchar(32)         Not Null
, FirstName                            nvarchar(64)         Not Null
, MiddleName                           nvarchar(64)         
, LastName                             nvarchar(64)         Not Null
, Birthdate                            date                 
, Active                               bit                  Not Null
, RelationshipType                     int                  Not Null
  CONSTRAINT [CHK_BeneficiaryExtract_RelationshipType]
	CHECK ( RelationshipType between 1 and 11 ) -- See Document
, NominationType                       int                  Not Null
  CONSTRAINT [CHK_BeneficiaryExtract_NominationType]
	CHECK ( NominationType between 1 and  4) -- 1 Binding,2 NonBinding, 3 ReversionaryPension, 4 Final
, Amount                               decimal(9,4)         Not Null
, EffectiveDate                        date                 Not Null
, ExpiryDate                           date                 
  CONSTRAINT [PK_BeneficiaryExtract]
	PRIMARY KEY CLUSTERED ( "ID" ASC )
)go

IF Object_id('[dbo].AssetManagementStrategyExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].AssetManagementStrategyExtract
go
Create Table  AssetManagementStrategyExtract  (
  StrategyId                           uniqueidentifier     Not Null
, InvestmentVehicleExternalReference   nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, StrategyTypeId                       int                  Not Null
CONSTRAINT [CHK_AssetManagementStrategyExtract_StrategyTypeId]
	CHECK ( StrategyTypeId in (2,3,5) ) --2 = Deposit, 3 = Withdrawal, 5 = Switch
, InstructionTypeId                    int                  Not Null
CONSTRAINT [CHK_AssetManagementStrategyExtract_InstructionTypeId]
	CHECK ( InstructionTypeId in (1, 3)) --1 = Proportional, 3 = Specific Instruction
, StartDate                            date                 Not Null
, EndDate                              date                 
, FrequencyId                          int                  Not Null
, SwitchReasonId                       int                  Not Null
CONSTRAINT [CHK_AssetManagementStrategyExtract_SwitchReasonId]
	CHECK ( SwitchReasonId in (1,2) ) --1 = MemberInstruction, 2 = AgeBasedDefault, 3 = ProductChange, 4 = DrawdownExhausted
, StatusId                             int                  Not Null
, ConversationId                       uniqueidentifier     
  CONSTRAINT [PK_AssetManagementStrategyExtract]
	PRIMARY KEY CLUSTERED ( StrategyId ASC )
)go

IF Object_id('[dbo].AssetManagementInstructionExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].AssetManagementInstructionExtract
go
Create Table  AssetManagementInstructionExtract  (
  StrategyId                           uniqueidentifier     Not Null
, AssetCode                            nvarchar(16)         Not Null
, PercentageAmount                     decimal(9,4)         Not Null
)go

IF Object_id('[dbo].TermDepositExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].TermDepositExtract
go
Create Table  TermDepositExtract  (
  MemberExternalReference              nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, ProviderExternalReference            nvarchar(256)        Not Null
, AssetCode                            nvarchar(16)         Not Null
, Name                                 nvarchar(64)         Not Null
, DisplayName                          nvarchar(256)        Not Null
, ContractNumber                       nvarchar(64)         Not Null
, StartDate                            date                 Not Null
, MaturityDate                         date                 Not Null
, NominalRate                          decimal(9,4)         Not Null
, CommissionRate                       decimal(9,4)         Not Null
, InterestPaymentFrequencyId           int                  Not Null
, ConversationId                       uniqueidentifier     
)go

IF Object_id('[dbo].AccountCategoryChangeExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].AccountCategoryChangeExtract
go
Create Table  AccountCategoryChangeExtract  (
  ID                                   int identity         Not Null
, MemberExternalReference              nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, Category                             nvarchar(256)        Not Null
, StartDate                            date                 Not Null
, EndDate                              date                 
  CONSTRAINT [PK_AccountCategoryChangeExtract]
	PRIMARY KEY CLUSTERED ( "ID" ASC )
)go

IF Object_id('[dbo].NoteExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].NoteExtract
go
Create Table  NoteExtract  (
  OwnerExternalReference               nvarchar(256)        Not Null
, CreatedDatetime                      datetime             Not Null
, ExpiryDatetime                       datetime             
, NoteType                             nvarchar(64)         Not Null
, ContentType                          nvarchar(64)         Not Null
, Content                              nvarchar(max)        Not Null
)go

IF Object_id('[dbo].ConditionOfReleaseExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].ConditionOfReleaseExtract
go
Create Table  ConditionOfReleaseExtract  (
  Id                                   int identity         Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, TypeId                               int                  Not Null
CONSTRAINT [CHK_ConditionOfReleaseExtract_TypeId]
	CHECK ( TypeId between 1 and 5 ) --1 = Retirement, 2 = CeasedEmploymentAged60AndAbove, 3 = TPD, 4 = TI/Death, 5 = PPD
, ReleaseDate                          date                 Not Null
  CONSTRAINT [PK_ConditionOfReleaseExtract]
	PRIMARY KEY CLUSTERED ( Id ASC )
)go

IF Object_id('[dbo].DocumentExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].DocumentExtract
go
Create Table  DocumentExtract  (
  DocumentId                           int                  Not Null
, OwnerExternalReference               nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        
, CreatedDatetime                      datetime             Not Null
, Subject                              nvarchar(256)        Not Null
, Source                               int                  Not Null
CONSTRAINT [CHK_DocumentExtract_Source]
	CHECK ( Source between 1 and 3 ) --1 = Outgoing, 2 = Incoming, 3 = Internal
, ArtefactTypeId                       int                  Not Null	default 3
, ContentTypeId                        int                  Not Null
, VisibilityId                         int                  Not Null	default 10000000
CONSTRAINT [CHK_DocumentExtract_VisibilityId]
	CHECK ( VisibilityId in (1000, 10000, 10000000) ) --10000000 = Admins only, 10000 = Visible to member, 1000 = Visible to service provider but not member
, StatusId                             int                  Not Null
CONSTRAINT [CHK_DocumentExtract_StatusId]
	CHECK ( StatusId in (3,6)) --3 = Complete, 6 = Deleted
, ConversationId                       uniqueidentifier     
)go

IF Object_id('[dbo].SignificantLifeEventExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].SignificantLifeEventExtract
go
Create Table  SignificantLifeEventExtract  (
  MemberExternalReference              nvarchar(64)         Not Null
, SignificantEventTypeId               int                  Not Null
CONSTRAINT [CHK_SignificantLifeEventExtract_SignificantEventTypeId]
	CHECK ( SignificantEventTypeId between 1 and 10) --See Document
, StartDate                            datetime             Not Null
, EndDate                              datetime             
)go

IF Object_id('[dbo].UnitPriceExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].UnitPriceExtract
go
Create Table  UnitPriceExtract  (
  AssetCode                            nvarchar(16)         Not Null
, PriceDate                            date                 Not Null
, BuyPrice                             numeric(18,6)        Not Null
, SellPrice                            numeric(18,6)        Not Null
, LastTradePrice                       numeric(18,6)        Not Null
, CreatedDatetime                      datetime             
)go

IF Object_id('[dbo].InsuranceUnderwitingHistoryExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].InsuranceUnderwitingHistoryExtract
go
Create Table  InsuranceUnderwitingHistoryExtract  (
  InsuranceCoverTypeId                 int                  Not Null
  CONSTRAINT [CHK_InsuranceUnderwitingHistoryExtract_InsuranceCoverTypeId]
	CHECK ( InsuranceCoverTypeId in (3,7,8,9,10) ) -- 3 = Income Protection, 8 = Basic Death/TI, 10 = Basic TPD, 9 = Vol Death/TI, 7 = Vol TPD
, OwnerExternalReference               nvarchar(256)        Not Null
, AccountExternalReference             nvarchar(256)        Not Null
, RequestedDate                        date                 Not Null
, RequestedAmount                      numeric(19,2)        
, OtherRequestTypeId                   int                  
CONSTRAINT [CHK_InsuranceUnderwitingHistoryExtract_OtherRequestTypeId]
	CHECK ( OtherRequestTypeId in (1)) --1 = Special offer (double your cover)
, InsurerLoading                       numeric(19,2)        
, InsurerLoadingCoverAmount            numeric(19,2)        
, InsurerLoadingDetails                nvarchar(max)        
, Exclusions                           nvarchar(4000)       
, ExclusionCoverAmount                 numeric(19,2)        
, WaitingPeriod                        nvarchar(64)         
, BenefitPeriod                        nvarchar(64)         
, Salary                               numeric(19,2)        
, DecisionDate                         date                 
, ApprovedAmount                       numeric(19,2)        
, StatusId                             int                  Not Null
CONSTRAINT [CHK_InsuranceUnderwitingHistoryExtract_StatusId]
	CHECK ( StatusId in (1,2,3)) --1 = Requested, 2 = Approved, 3 = Declined
)go

IF Object_id('[dbo].DocumentContentExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].DocumentContentExtract
go
Create Table  DocumentContentExtract  (
  DocumentId                           int                  Not Null
, DocumentContent                      varbinary(max)       Not Null
, ContentTypeId                        int                  Not Null
CONSTRAINT [CHK_DocumentContentExtract_ContentTypeId]
	CHECK ( ContentTypeId between 1 and 13) -- See Document
, Filename                             nvarchar(256)        Not Null
  CONSTRAINT [PK_DocumentContentExtract]
	PRIMARY KEY CLUSTERED ( DocumentId ASC )
)go

IF Object_id('[dbo].SuperFundExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].SuperFundExtract
go
Create Table  SuperFundExtract  (
  AustralianBusinessNumber             nvarchar(64)         Not Null
, Name                                 nvarchar(128)        Not Null
, TaxFileNumber                        varchar(32)          
, EstablishmentDate                    date                 Not Null
, WindUpDate                           date                 
, PhoneNumber                          nvarchar(32)         
  CONSTRAINT [PK_SuperFundExtract]
	PRIMARY KEY CLUSTERED ( "AustralianBusinessNumber" ASC )
)go

IF Object_id('[dbo].SuperFundProductExtract', 'U') IS NOT NULL 
	DROP TABLE [dbo].SuperFundProductExtract
go
Create Table  SuperFundProductExtract  (
  AustralianBusinessNumber             nvarchar(64)         Not Null
, Usi                                  varchar(50)          Not Null
, ProductName                          nvarchar(128)        Not Null
, ContributionBankAccountBSB           nvarchar(64)         
, ContributionBankAccountNumber        nvarchar(32)         
, RolloverBankAccountBSB               nvarchar(64)         
, RolloverBankAccountNumber            nvarchar(32)         
  CONSTRAINT [PK_SuperFundProductExtract]
	PRIMARY KEY CLUSTERED ( "AustralianBusinessNumber", Usi ASC )
)go

IF Object_id('[dbo].EmployerExtendedProperty', 'U') IS NOT NULL 
	DROP TABLE [dbo].EmployerExtendedProperty
go
Create Table  EmployerExtendedProperty  (
  ExternalReference                    nvarchar(32)         Not Null
, Name                                 nvarchar(64)         Not Null
, Value                                nvarchar(1024)       Not Null
)go

IF Object_id('[dbo].EntityAssociationExtendedProperty', 'U') IS NOT NULL 
	DROP TABLE [dbo].EntityAssociationExtendedProperty
go
Create Table  EntityAssociationExtendedProperty  (
  ExternalReference                    nvarchar(32)         Not Null
, AssociatedEntityExternalReference    nvarchar(32)         Not Null
, AssociationType                      int                  Not Null
, Name                                 nvarchar(64)         Not Null
, Value                                nvarchar(1024)       Not Null
)go

IF Object_id('[dbo].MemberExtendedProperty', 'U') IS NOT NULL 
	DROP TABLE [dbo].MemberExtendedProperty
go
Create Table  MemberExtendedProperty  (
  ExternalReference                    nvarchar(32)         Not Null
, Name                                 nvarchar(64)         Not Null
, Value                                nvarchar(1024)       Not Null
)go

IF Object_id('[dbo].AccountExtendedProperty', 'U') IS NOT NULL 
	DROP TABLE [dbo].AccountExtendedProperty
go
Create Table  AccountExtendedProperty  (
  AccountExternalReference             nvarchar(32)         Not Null
, AccountTypeId                        int                  Not Null
, Name                                 nvarchar(64)         Not Null
, Value                                nvarchar(1024)       Not Null
)go

IF Object_id('[dbo].InsuranceExtendedProperty', 'U') IS NOT NULL 
	DROP TABLE [dbo].InsuranceExtendedProperty
go
Create Table  InsuranceExtendedProperty  (
  PolicyNumber                         nvarchar(32)         Not Null
, InsuranceCoverTypeId                 int                  Not Null
, Name                                 nvarchar(64)         Not Null
, Value                                nvarchar(1024)       Not Null
)go

