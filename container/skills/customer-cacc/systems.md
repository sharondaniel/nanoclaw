# CACC — Technical Environment & Constraints

## Their Systems
- [Cargo management system / airline system name and version]
- [Database / messaging platform they use]
- [Any IATA-certified messaging platform, e.g. Cargo Community System]

## Integration Points
- **ACI submission**: Cargo-XML messages sent to Egyptian customs authority
- **Data levels**: Flight → ULD → MAWB → HAWB → Pieces/Commodities

## Constraints & Known Issues
- [Any data quality issues on their side — missing fields, inconsistent formats]
- [Timing constraints — how far in advance ACI must be filed]
- [Volume — approximate daily flight / AWB count]
- [Connectivity — how messages are exchanged: SFTP, API, direct DB, etc.]

## HLT Components Used
- [Any other HLT modules or integrations in use]

## Environment Details
- Test environment: [URL / access details]
- Production environment: [URL / access details]
- Credentials / access: [how HLT connects — VPN, API key, etc.]
