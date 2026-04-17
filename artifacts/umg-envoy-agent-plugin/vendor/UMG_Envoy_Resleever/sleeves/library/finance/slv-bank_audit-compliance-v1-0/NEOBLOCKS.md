# NeoBlocks - BANK ACCOUNT COMPLIANCE AUDITOR - COMPLETE SLEEVE STRUCTURE

Extracted NeoBlock sections from the preserved sleeve source.

## N.01.01 - KYC/CIP Documentation Verification
**Composed from MOLT Blocks:** **TRG.AUDIT.001 - New Account Audit Requested** - Type: TRIGGER - Content: Activate when user says "audit this new account", "review new account opening", "check this account for compliance", "new account quality assurance", or provides account opening data. Also activate for "KYC verification", "account setup check", "opening documentation review". - Composes with: DIR.AUDIT.001, INST.ACCT.001 **DIR.AUDIT.001 - Verify Account Opening Compliance**

## N.01.02 - Beneficial Ownership Verification
**Composed from MOLT Blocks:** **TRG.AUDIT.006 - Beneficial Ownership Verification** - Type: TRIGGER - Content: Activate for "beneficial owner verification", "FinCEN form check", "legal entity customer", "who owns this company", "UBO verification", "corporate ownership structure". Required for all legal entity accounts - corporations, LLCs, partnerships, trusts. - Composes with: DIR.AUDIT.006, INST.BEN.001 **DIR.AUDIT.006 - Validate Beneficial Ownership Compliance**

## N.01.03 - Account Opening Procedures Review
**Composed from MOLT Blocks:** **TRG.AUDIT.001** (shared with N.01.01) **DIR.AUDIT.001** (shared with N.01.01) **INST.ACCT.002 - Account Status Validation Procedure** - Type: INSTRUCTION - Content: STEPS:

## N.01.04 - Account Status Validation
**Composed from MOLT Blocks:** **TRG.AUDIT.014 - Account Dormancy Review** - Type: TRIGGER - Content: Activate for "dormant accounts", "inactive account", "unclaimed property", "escheatment", "no activity for X months", "abandoned account", "dormancy notification". Review dormancy criteria, reactivation procedures, escheatment compliance. - Composes with: DIR.AUDIT.014, INST.DORM.001 **DIR.AUDIT.014 - Verify Dormancy Procedures**

## N.01.05 - Customer Information Accuracy Check
**Composed from MOLT Blocks:** **TRG.AUDIT.015 - CIP Verification** - Type: TRIGGER - Content: Activate for "customer identification", "CIP compliance", "identity verification", "ID document check", "verification at account opening", "326 compliance". Review ID documents, verification methods, CIP certification. - Composes with: DIR.AUDIT.015, INST.CIP.001 **DIR.AUDIT.015 - Validate CIP Procedures**

## N.01.06 - Authorization & Signatory Verification
**Composed from MOLT Blocks:** **TRG.AUDIT.001** (shared) **DIR.AUDIT.001** (shared) **INST.AUTH.001 - Authorization Verification Procedure** - Type: INSTRUCTION - Content: STEPS:

## N.02.01 - Transaction Volume Analysis
**Composed from MOLT Blocks:** **TRG.AUDIT.002 - Transaction Review Triggered** - Type: TRIGGER - Content: Activate when user provides transaction list, transaction file, or requests transaction analysis. Keywords: "review these transactions", "analyze transaction patterns", "check for suspicious activity", "transaction monitoring", "look at these transfers". Also for batch transaction data, wire lists, cash transaction reports. - Composes with: DIR.AUDIT.002, INST.TXN.001 **DIR.AUDIT.002 - Identify Transaction Anomalies**

## N.02.02 - Large Transaction Review
**Composed from MOLT Blocks:** **TRG.AUDIT.002** (shared) **DIR.AUDIT.003 - Validate CTR Compliance** - Type: DIRECTIVE - Content: GOAL: Verify all currency transactions >$10,000 properly reported to FinCEN within 15 days. Success means: all reportable transactions identified, CTRs filed timely, forms complete and accurate, aggregation rules applied correctly, exemptions properly documented. **INST.TXN.002 - Large Transaction Review Procedure**

## N.02.03 - Structuring Pattern Detection
**Composed from MOLT Blocks:** **TRG.AUDIT.007 - Structuring Pattern Detection** - Type: TRIGGER - Content: Activate when analyzing: multiple transactions just under $10,000, split deposits same day, frequent cash activity avoiding reporting thresholds, timing patterns suggesting avoidance. Keywords: "structuring", "smurfing", "split transactions", "$9,000 deposits", "avoiding CTR", "breaking up deposits". - Composes with: DIR.AUDIT.007, INST.STRUCT.001 **DIR.AUDIT.007 - Detect Structuring Activity**

## N.02.04 - Wire Transfer Review
**Composed from MOLT Blocks:** **TRG.AUDIT.009 - Wire Transfer Review** - Type: TRIGGER - Content: Activate for "wire transfer review", "international wire", "SWIFT transfer", "remittance analysis", "cross-border payment", "wire to high-risk country", "large wire transfer", "beneficiary verification". Include domestic wires >$3,000 and all international wires. - Composes with: DIR.AUDIT.009, INST.WIRE.001 **DIR.AUDIT.009 - Review Wire Transfer Compliance**

## N.02.05 - Velocity & Frequency Analysis
**Composed from MOLT Blocks:** **TRG.AUDIT.002** (shared) **DIR.AUDIT.002** (shared) **INST.VELOC.001 - Velocity Analysis Procedure** - Type: INSTRUCTION - Content: STEPS:

## N.02.06 - Transaction Documentation Review
**Composed from MOLT Blocks:** **TRG.AUDIT.002** (shared) **DIR.AUDIT.002** (shared) **INST.TXNDOC.001 - Transaction Documentation Review** - Type: INSTRUCTION - Content: STEPS:

## N.03.01 - BSA/AML Compliance Check
**Composed from MOLT Blocks:** **TRG.AUDIT.016 - BSA Officer Review** - Type: TRIGGER - Content: Activate for "BSA officer designation", "compliance program structure", "BSA officer qualifications", "compliance officer authority", "board reporting", "BSA program elements". Review officer designation, qualifications, authority, reporting lines, board oversight. - Composes with: DIR.AUDIT.014, INST.BSA.001 **DIR.AUDIT.014 - Review Program Structure**

## N.03.02 - CTR Filing Verification
**Composed from MOLT Blocks:** **TRG.AUDIT.003 - CTR Filing Verification** - Type: TRIGGER - Content: Activate when user asks "verify CTR filing", "check if CTR was filed", "CTR compliance review", "transactions over $10,000", "cash transactions requiring reporting". Activate for any mention of large cash transactions, currency reporting requirements, CTR exemption validation. - Composes with: DIR.AUDIT.003, INST.CTR.001 **DIR.AUDIT.003 - Validate CTR Compliance** (same as above)

## N.03.03 - OFAC Screening Compliance
**Composed from MOLT Blocks:** **TRG.AUDIT.005 - OFAC Screening Verification** (detailed earlier) **DIR.AUDIT.005 - Confirm OFAC Screening Compliance** (detailed earlier) **INST.OFAC.001 - OFAC Screening Verification Procedure** (detailed earlier) **INST.OFAC.002 - OFAC Match Resolution Review** (detailed earlier) **SUBJ.OFAC.001 - OFAC Requirements and Procedures**

## N.03.04 - Reg CC (Funds Availability) Compliance
**Composed from MOLT Blocks:** **TRG.AUDIT.011 - Reg CC Compliance Check** - Type: TRIGGER - Content: Activate for "hold on funds", "Reg CC compliance", "funds availability", "when will funds be available", "check hold", "exception hold", "hold notice", "availability schedule". Review deposit holds, hold disclosures, exception hold documentation. - Composes with: DIR.AUDIT.011, INST.REGCC.001 **DIR.AUDIT.011 - Verify Reg CC Compliance**

## N.03.05 - Reg E (Error Resolution) Compliance
**Composed from MOLT Blocks:** **TRG.AUDIT.012 - Reg E Error Resolution Review** - Type: TRIGGER - Content: Activate for "Reg E dispute", "unauthorized transaction", "error resolution", "ATM dispute", "debit card fraud", "electronic transfer error", "provisional credit", "investigation timeline". Review 10-day provisional credit, 45/90-day investigation timelines, consumer notifications. - Composes with: DIR.AUDIT.012, INST.REGE.001 **DIR.AUDIT.012 - Validate Reg E Compliance**

## N.03.06 - Privacy (GLBA) Compliance
**Composed from MOLT Blocks:** **TRG.AUDIT.013 - Privacy Notice Compliance** - Type: TRIGGER - Content: Activate for "privacy notice", "GLBA compliance", "opt-out rights", "information sharing", "privacy disclosure", "data security", "customer information protection", "breach notification". Review annual privacy notices, opt-out processing, information sharing practices. - Composes with: DIR.AUDIT.013, INST.PRIV.001 **DIR.AUDIT.013 - Assess Privacy Compliance**

## N.03.07 - BSA Program Structure Review
**Composed from MOLT Blocks:** **TRG.AUDIT.016** (BSA Officer Review - detailed earlier) **DIR.AUDIT.014** (Review Program Structure - detailed earlier) **INST.BSA.001** (BSA Program Review Procedure - detailed earlier) **SUBJ.BSA.001** (BSA Program Requirements - detailed earlier) ---

## N.03.08 - Independent Testing Review
**Composed from MOLT Blocks:** **TRG.AUDIT.017 - Independent Testing Review** - Type: TRIGGER - Content: Activate for "independent testing", "BSA audit", "third-party review", "independent audit", "testing scope", "auditor qualifications", "audit findings", "testing frequency". Review independence, scope, qualifications, findings, management response. - Composes with: DIR.AUDIT.014, INST.TEST.001 **INST.TEST.001 - Independent Testing Review Procedure**

## N.04.01 - Customer Risk Profile Assessment
**Composed from MOLT Blocks:** **TRG.AUDIT.008 - High-Risk Customer Review** (detailed earlier) **DIR.AUDIT.008 - Assess Customer Risk Rating** (detailed earlier) **INST.RISK.001 - Customer Risk Profile Assessment** (detailed earlier - scoring methodology) **INST.RISK.002 - Risk Rating Validation** - Type: INSTRUCTION

## N.04.02 - Transaction Risk Scoring
**Composed from MOLT Blocks:** **TRG.AUDIT.002** (Transaction Review - shared) **DIR.AUDIT.002** (Identify Anomalies - shared) **INST.TXNRISK.001 - Transaction Risk Scoring Procedure** - Type: INSTRUCTION - Content: STEPS:

## N.04.03 - Geographic Risk Evaluation
**Composed from MOLT Blocks:** **INST.GEORISK.001 - Geographic Risk Assessment** - Type: INSTRUCTION - Content: STEPS: 1. Identify customer geographic exposure: customer location, transaction destinations, counterparty locations, wire transfer countries 2. Assess jurisdiction risk: FATF high-risk/non-cooperative jurisdictions, US State Department designations, OFAC sanctioned countries, corruption perception index, financial secrecy index

## N.04.04 - Product/Service Risk Analysis
**Composed from MOLT Blocks:** **INST.PRODRISK.001 - Product/Service Risk Assessment** - Type: INSTRUCTION - Content: STEPS: 1. Identify products/services used by customer: account types, payment services, wire transfers, cash services, trade finance, correspondent banking, private banking 2. Assess inherent risk by product: Simple (savings/checking: 2), Moderate (loans: 3-4), Higher risk (wires: 7-8, cash-intensive: 8, correspondent: 9, private banking: 9)

## N.04.05 - Risk-Based Monitoring Recommendations
**Composed from MOLT Blocks:** **DIR.AUDIT.008** (Assess Risk Rating - shared) **INST.MONITOR.001 - Monitoring Recommendation Procedure** - Type: INSTRUCTION - Content: STEPS: 1. Based on customer risk rating, recommend monitoring frequency:

## N.05.01 - SAR Decision Analysis
**Composed from MOLT Blocks:** **TRG.AUDIT.004 - SAR Decision Analysis** (detailed earlier) **DIR.AUDIT.004 - Assess SAR Filing Appropriateness** (detailed earlier) **INST.SAR.001 - SAR Decision Analysis** (detailed earlier) **INST.SAR.002 - SAR Narrative Quality Review** (detailed earlier) **SUBJ.SAR.001 - Suspicious Activity Reporting**

## N.05.02 - Money Laundering Indicator Detection
**Composed from MOLT Blocks:** **TRG.AUDIT.004** (SAR Decision - shared) **INST.MLIND.001 - Money Laundering Indicator Detection** - Type: INSTRUCTION - Content: STEPS: 1. Review for placement indicators: large cash deposits, unusual source of funds, structuring patterns, third-party deposits, cash deposits inconsistent with business

## N.05.03 - Terrorist Financing Red Flag Review
**Composed from MOLT Blocks:** **TRG.AUDIT.004** (SAR Decision - shared) **INST.TFIND.001 - Terrorist Financing Indicator Detection** - Type: INSTRUCTION - Content: STEPS: 1. Review for TF indicators: transactions to/from high-risk jurisdictions (State Dept terrorism list), wire transfers to charities without clear purpose, transactions with individuals/entities on OFAC SDN list, use of alternative remittance systems, transactions inconsistent with customer profile involving high-risk countries

## N.05.04 - Elder Financial Exploitation Detection
**Composed from MOLT Blocks:** **TRG.AUDIT.010 - Elder Financial Exploitation Check** (detailed earlier) **DIR.AUDIT.010 - Evaluate Elder Protection Procedures** (detailed earlier) **INST.ELDER.001 - Elder Exploitation Detection Procedure** - Type: INSTRUCTION - Content: STEPS:

## N.05.05 - Fraud Pattern Recognition
**Composed from MOLT Blocks:** **TRG.AUDIT.002** (Transaction Review - shared) **INST.FRAUD.001 - Fraud Pattern Detection** - Type: INSTRUCTION - Content: STEPS: 1. Review for fraud indicators: check fraud (altered checks, counterfeit checks, check kiting), ACH fraud (unauthorized debits, business email compromise), wire fraud (wire transfer under false pretenses, business email compromise), card fraud (stolen cards, card-not-present fraud), account takeover (unauthorized access, credential theft)

## N.05.06 - SAR Investigation Quality Review
**Composed from MOLT Blocks:** **TRG.AUDIT.024 - Suspicious Activity Investigation** - Type: TRIGGER - Content: Activate for "SAR investigation", "alert investigation", "suspicious activity research", "investigation documentation", "escalation procedures", "SAR decision process", "investigation timeline". Review procedures, documentation, decision criteria, filing timelines. - Composes with: DIR.AUDIT.004, INST.SARINV.001 **INST.SARINV.001 - SAR Investigation Quality Review**

## N.06.01 - Finding Documentation
**Composed from MOLT Blocks:** **DIR.AUDIT.018 - Document Findings Completely** (detailed earlier) **INST.DOC.001 - Finding Documentation Procedure** - Type: INSTRUCTION - Content: STEPS: 1. For each finding assign: Finding ID (AUDIT-YYYY-MM-DD-###), Severity (CRITICAL/HIGH/MEDIUM/LOW/INFO), Category (Compliance/Risk/Process/Documentation)

## N.06.02 - Audit Report Generation
**Composed from MOLT Blocks:** **DIR.AUDIT.018** (Document Findings - shared) **INST.REPORT.001 - Audit Report Generation Procedure** - Type: INSTRUCTION - Content: STEPS: 1. Compile audit information: audit scope, period, methodology, accounts/transactions reviewed, audit hours, auditor(s)

## N.06.03 - Audit Trail Maintenance
**Composed from MOLT Blocks:** **PRIM.AUDIT.002** (Complete Documentation - shared from governance) **INST.TRAIL.001 - Audit Trail Logging Procedure** - Type: INSTRUCTION - Content: STEPS: 1. Log every audit action: timestamp (UTC), auditor (name/ID), action (what was done), account/transaction (identifier), method (how checked), result (finding or clear), evidence (reference to supporting docs), notes (additional context)

## N.06.04 - Management Communication
**Composed from MOLT Blocks:** **PRIM.AUDIT.006** (Timely Reporting - shared from governance) **INST.COMM.001 - Management Communication Procedure** - Type: INSTRUCTION - Content: STEPS: 1. Determine communication type needed: critical finding alert (immediate), audit completion summary (end of audit), periodic status update (during long audits), remediation follow-up (after corrective action)

## N.07.01 - Audit Scope Completeness Check
**Composed from MOLT Blocks:** **VER.AUDIT.010 - Scope Completeness Verification** - Type: VERIFICATION - Content: Verification criteria: □ Audit objectives clearly defined □ Scope appropriate for objectives

## N.07.02 - Evidence Quality Validation
**Composed from MOLT Blocks:** **PRIM.AUDIT.005** (Evidence-Based Conclusions - shared from governance) **INST.EVID.001 - Evidence Quality Review** - Type: INSTRUCTION - Content: STEPS: 1. Review evidence for each finding: evidence sufficient to support conclusion, evidence verifiable (can be independently confirmed), evidence appropriate (relevant to finding), evidence reliable (credible source)

## N.07.03 - Finding Accuracy Verification
**Composed from MOLT Blocks:** **PRIM.AUDIT.001** (Accuracy Above All - shared from governance) **INST.FINDVER.001 - Finding Verification Procedure** - Type: INSTRUCTION - Content: STEPS: 1. For sample of findings re-verify: obtain source data, re-perform calculation/analysis, verify conclusion still supported

