---
name: air-cargo-domain
description: Air cargo industry terminology, standards, and 
HLT product context. Load when discussing cargo operations, 
AWBs, ULDs, customs, airline systems, or HLT products.
---

# Air Cargo Domain Knowledge

## Core Document Types
- **AWB** (Air Waybill) — master contract of carriage between shipper and airline
- **HAWB** (House Air Waybill) — issued by freight forwarder to their customer
- **MAWB** (Master AWB) — consolidates multiple HAWBs under one shipment
- **ULD** (Unit Load Device) — container/pallet used to load cargo onto aircraft
- **BUP** (Bulk Unitisation Program) — pre-built ULDs from forwarder

## Cargo Operations
- **GHA** (Ground Handling Agent) — handles physical cargo at airport
- **IATA** — sets standards for air cargo (e.g. Cargo-XML, e-AWB)
- **CASS** — cargo accounting settlement system
- **CTO** (Cargo Terminal Operator)
- **FFM** — Freight Forwarder Message (IATA Cargo-IMP)
- **FHL/FWB** — IATA messaging for house/master waybill data

## Customs & Compliance
- **ACI** (Advance Cargo Information) — pre-arrival declaration to customs
- **XBCR / XUWS** — HLT message generation systems for customs compliance
- **CACC** — Egyptian customs compliance system (client: Ahmed)
- **ICS2** — EU Import Control System 2 (advance security filing)
- **MRN** — Movement Reference Number (customs declaration ID)

## HLT Products
- **HPS** (Hermes Planning System) — core cargo management platform
- **Velora** — [add your description]
- **XUWS** — message generation system (~€45k quote, 14 modules)

## Data Hierarchy
Flight → ULD/Bulk → AWB (MAWB) → HAWB → Pieces/Commodities

## Standards
- **Cargo-XML** — IATA XML messaging standard
- **IATA Cargo-IMP** — older telex-based messaging (FFM, FHL, FWB, etc.)
- **OWASP** — security standard applied to all HLT APIs
