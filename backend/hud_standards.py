# HUD FY2026 Data Standards - Field Definitions
# Reference: https://www.hudexchange.info/resource/3824/hmis-data-dictionary/

# ==================== UNIVERSAL DATA ELEMENTS (UDE) ====================

# 3.01 Name
NAME_DATA_QUALITY = {
    1: "Full name reported",
    2: "Partial, street name, or code name reported",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# 3.02 Social Security Number
SSN_DATA_QUALITY = {
    1: "Full SSN reported",
    2: "Approximate or partial SSN reported",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# 3.03 Date of Birth
DOB_DATA_QUALITY = {
    1: "Full DOB reported",
    2: "Approximate or partial DOB reported",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# 3.04 Race (Multi-select allowed)
RACE_OPTIONS = {
    1: "American Indian, Alaska Native, or Indigenous",
    2: "Asian or Asian American",
    3: "Black, African American, or African",
    4: "Native Hawaiian or Pacific Islander",
    5: "White",
    6: "Middle Eastern or North African",  # New for 2026
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# 3.05 Ethnicity
ETHNICITY_OPTIONS = {
    0: "Non-Hispanic/Non-Latin(a)(o)(x)",
    1: "Hispanic/Latin(a)(o)(x)",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# 3.06 Gender (FY2026 Update - Multiple select allowed)
GENDER_OPTIONS = {
    0: "Woman (Girl, if child)",
    1: "Man (Boy, if child)",
    2: "Non-Binary",
    3: "Culturally Specific Identity",
    4: "Transgender",
    5: "Questioning",
    6: "Different Identity",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# 3.06a Sex Assigned at Birth (NEW - Required separately from Gender)
SEX_AT_BIRTH = {
    0: "Female",
    1: "Male",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# 3.07 Veteran Status
VETERAN_STATUS = {
    0: "No",
    1: "Yes",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# ==================== PROJECT ENTRY/EXIT (3.10-3.20) ====================

# 3.10 Project Start Date - Just a date field

# 3.15 Relationship to Head of Household
RELATIONSHIP_TO_HOH = {
    1: "Self (head of household)",
    2: "Head of household's child",
    3: "Head of household's spouse or partner",
    4: "Head of household's other relation member",
    5: "Other: non-relation member"
}

# 3.917 Prior Living Situation (CRITICAL for funding)
PRIOR_LIVING_SITUATION = {
    # Homeless Situations
    1: "Emergency shelter, including hotel or motel paid for with emergency shelter voucher",
    2: "Transitional housing for homeless persons",
    3: "Permanent housing (other than RRH) for formerly homeless persons",
    4: "Psychiatric hospital or other psychiatric facility",
    5: "Substance abuse treatment facility or detox center",
    6: "Hospital or other residential non-psychiatric medical facility",
    7: "Jail, prison or juvenile detention facility",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    10: "Rental by client, no ongoing housing subsidy",
    11: "Owned by client, no ongoing housing subsidy",
    12: "Staying or living in a family member's room, apartment, or house",
    13: "Staying or living in a friend's room, apartment, or house",
    14: "Hotel or motel paid for without emergency shelter voucher",
    15: "Foster care home or foster care group home",
    16: "Place not meant for habitation (street, vehicle, park, abandoned building)",
    17: "Other",
    18: "Safe Haven",
    19: "Rental by client, with VASH housing subsidy",
    20: "Rental by client, with other ongoing housing subsidy",
    21: "Owned by client, with ongoing housing subsidy",
    22: "Staying or living in a family member's room, apartment, or house",
    23: "Staying or living in a friend's room, apartment, or house",
    24: "Long-term care facility or nursing home",
    25: "Rental by client in a public housing unit",
    26: "Residential project or halfway house with no homeless criteria",
    27: "Moved from one HOPWA funded project to HOPWA PH",
    28: "Rental by client, with GPD TIP housing subsidy",
    29: "Residential care home",
    99: "Data not collected"
}

# Living Situation Categories (for 3.917 logic tree)
LIVING_SITUATION_CATEGORY = {
    "homeless": [1, 2, 16, 18],  # Emergency shelter, TH, Street, Safe Haven
    "institutional": [4, 5, 6, 7, 15, 24, 29],  # Psychiatric, Substance abuse, Hospital, Jail, Foster, Nursing, Residential care
    "transitional_permanent": [3, 10, 11, 12, 13, 14, 19, 20, 21, 22, 23, 25, 26, 27, 28],  # Various housing
}

# Length of Stay in Prior Living Situation
LENGTH_OF_STAY = {
    1: "One night or less",
    2: "Two to six nights",
    3: "One week or more, but less than one month",
    4: "One month or more, but less than 90 days",
    5: "90 days or more, but less than one year",
    6: "One year or longer",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# Times Homeless in Past 3 Years
TIMES_HOMELESS = {
    1: "One time",
    2: "Two times",
    3: "Three times",
    4: "Four or more times",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# Months Homeless in Past 3 Years
MONTHS_HOMELESS = {
    1: "1 month",
    2: "2 months",
    3: "3 months",
    4: "4 months",
    5: "5 months",
    6: "6 months",
    7: "7 months",
    8: "8 months",
    9: "9 months",
    10: "10 months",
    11: "11 months",
    12: "12 months",
    101: "More than 12 months",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# 3.12 Destination (Exit)
DESTINATION = {
    1: "Emergency shelter, including hotel or motel paid for with emergency shelter voucher",
    2: "Transitional housing for homeless persons",
    3: "Permanent housing (other than RRH) for formerly homeless persons",
    4: "Psychiatric hospital or other psychiatric facility",
    5: "Substance abuse treatment facility or detox center",
    6: "Hospital or other residential non-psychiatric medical facility",
    7: "Jail, prison or juvenile detention facility",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    10: "Rental by client, no ongoing housing subsidy",
    11: "Owned by client, no ongoing housing subsidy",
    12: "Staying or living in a family member's room, apartment, or house",
    13: "Staying or living in a friend's room, apartment, or house",
    14: "Hotel or motel paid for without emergency shelter voucher",
    15: "Foster care home or foster care group home",
    16: "Place not meant for habitation",
    17: "Other",
    18: "Safe Haven",
    19: "Rental by client, with VASH housing subsidy",
    20: "Rental by client, with other ongoing housing subsidy",
    21: "Owned by client, with ongoing housing subsidy",
    22: "Staying or living with family, temporary tenure",
    23: "Staying or living with friends, temporary tenure",
    24: "Deceased",
    25: "Long-term care facility or nursing home",
    26: "Moved from one HOPWA funded project to HOPWA PH",
    27: "Rental by client, with GPD TIP housing subsidy",
    28: "Rental by client in a public housing unit",
    29: "Residential project or halfway house with no homeless criteria",
    30: "No exit interview completed",
    31: "Rental by client, with RRH or equivalent subsidy",
    32: "Rental by client, with HCV voucher",
    33: "Rental by client in a public housing unit",
    34: "Rental by client, with ongoing housing subsidy",
    35: "Staying or living with family, permanent tenure",
    36: "Staying or living with friends, permanent tenure",
    37: "Deceased",
    99: "Data not collected"
}

# ==================== COORDINATED ENTRY (4.19-4.20) ====================

# 4.19 Coordinated Entry Assessment
ASSESSMENT_TYPE = {
    1: "Phone",
    2: "Virtual",
    3: "In Person"
}

ASSESSMENT_LEVEL = {
    1: "Crisis Needs Assessment",
    2: "Housing Needs Assessment"
}

PRIORITIZATION_STATUS = {
    1: "Placed on prioritization list",
    2: "Not placed on prioritization list"
}

# ==================== INCOME & BENEFITS (4.02-4.04) ====================

INCOME_SOURCES = {
    "earned": "Earned Income",
    "unemployment": "Unemployment Insurance",
    "ssi": "Supplemental Security Income (SSI)",
    "ssdi": "Social Security Disability Income (SSDI)",
    "va_disability": "VA Service-Connected Disability Compensation",
    "va_pension": "VA Non-Service-Connected Disability Pension",
    "private_disability": "Private Disability Insurance",
    "workers_comp": "Worker's Compensation",
    "tanf": "TANF",
    "ga": "General Assistance (GA)",
    "retirement": "Retirement Income from Social Security",
    "pension": "Pension or retirement income from a former job",
    "child_support": "Child Support",
    "alimony": "Alimony and other spousal support",
    "other": "Other source"
}

NON_CASH_BENEFITS = {
    "snap": "SNAP (Food Stamps)",
    "wic": "Special Supplemental Nutrition Program for Women, Infants, and Children (WIC)",
    "tanf_childcare": "TANF Child Care services",
    "tanf_transport": "TANF transportation services",
    "other_tanf": "Other TANF-funded services",
    "section8": "Section 8, Public Housing, or other ongoing rental assistance",
    "other_source": "Other source"
}

HEALTH_INSURANCE = {
    "medicaid": "Medicaid",
    "medicare": "Medicare",
    "schip": "State Children's Health Insurance Program",
    "va_medical": "VA Medical Services",
    "employer": "Employer-Provided Health Insurance",
    "cobra": "COBRA",
    "private": "Private Pay Health Insurance",
    "state": "State Health Insurance for Adults",
    "indian": "Indian Health Services Program"
}

# ==================== DISABILITIES (4.05-4.10) ====================

DISABILITY_TYPES = {
    "physical": "Physical Disability",
    "developmental": "Developmental Disability", 
    "chronic_health": "Chronic Health Condition",
    "hiv_aids": "HIV/AIDS",
    "mental_health": "Mental Health Disorder",
    "substance_use": "Substance Use Disorder"
}

DISABILITY_RESPONSE = {
    0: "No",
    1: "Yes",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# ==================== DOMESTIC VIOLENCE (4.11) ====================

DV_VICTIM = {
    0: "No",
    1: "Yes",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

DV_WHEN = {
    1: "Within the past three months",
    2: "Three to six months ago",
    3: "Six months to one year ago",
    4: "One year ago or more",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

DV_FLEEING = {
    0: "No",
    1: "Yes",
    8: "Client doesn't know",
    9: "Client prefers not to answer",
    99: "Data not collected"
}

# ==================== SERVICES (4.12) ====================

SERVICE_TYPES = {
    1: "Food",
    2: "Housing search and placement",
    3: "Case management",
    4: "Outreach",
    5: "Transportation",
    6: "Other"
}
