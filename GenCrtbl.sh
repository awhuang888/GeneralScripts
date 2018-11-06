#!/bin/bash 

cat crtblTest02.txt \
    | sed '/^$/N;/^\n$/D' \
    | awk -F"\t" \
        '{\
            if ($2 == "DataType") print "\n Create Table", $1, "("; \
            else if ($2 == "") print ")" "\n" "go"; \
            else { printf "%1s %-36s %-20s %s\n", ",", $1 ,$2, ($3=="Y")?"":"Not Null"}\
        }' \
    | sed ':a;N;$!ba;s/(\n,/(\n /g'
    

#  
# Explanation -> sed '/^$/N;/^\n$/D'
# Replace multiple empty lines into on empty line

#  
# Explanation -> sed ':a;N;$!ba;s/(\n,/\n /g':
# Create a label via :a.
# Append the current and next line to the pattern space via N.
# If we are before the last line, branch to the created label $!ba ($! means not to do it on the last line as there should be one final newline).
# Finally the substitution replaces every newline with a space on the pattern space (which is the whole file).

# *************** Example File format is ********************
# Company	DataType	Nullable	Notes
# ExternalReference	nvarchar(32)		
# RegisteredName	nvarchar(256)		
# TradingName	nvarchar(256)		
# CompanyRegistrationNumber	nvarchar(64)	Y	
# TaxRegistrationNumber	nvarchar(64)	Y	
# RegistrationDate	date	Y	
# LicenceNumber	nvarchar(64)	Y	
# PhoneNumber	nvarchar(32)	Y	
# Fax	nvarchar(32)	Y	ACOAL_Company. FaxNumber but the target field is yet to be included by Product Team
# EmailAddress	varchar(128)	Y	
# SecondaryEmail	varchar(128)	Y	
# WebsiteUrl	varchar(512)	Y	
# CompanyType	int		"1 - Employer, 2 - Financial Planning, 3 - Investment Advice"
# DomiciledCountryCode	char(2)	Y	
# DomiciledRegion	nvarchar(64)	Y	
# BaseCurrencyCode	char(3)	Y	Defaults to AUD
# ConversationId	uniqueidentifier	Y	