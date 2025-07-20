# MIT License Compliance - Aura VS Code Fork

## Overview

This document outlines the MIT license compliance requirements for the Aura VS Code fork, ensuring proper attribution to Microsoft Corporation and adherence to the MIT license terms.

## License Information

**Original Work**: Visual Studio Code  
**Copyright**: (c) Microsoft Corporation  
**License**: MIT License  
**Fork**: Aura - AI-First VS Code Fork  
**Fork Maintainer**: Aura Development Team  

## MIT License Requirements

### 1. License Text Preservation

The MIT license text must be preserved in all distributions:

```
MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 2. Copyright Attribution

All original Microsoft copyright notices must be preserved in modified files:

```typescript
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
```

### 3. Fork-Specific Attribution

For new files created for Aura, use the following header:

```typescript
/*---------------------------------------------------------------------------------------------
 *  Aura - AI-First VS Code Fork
 *  Copyright (c) Aura Development Team. All rights reserved.
 *  
 *  Based on Visual Studio Code
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
```

## Compliance Checklist

### ✅ Required Actions

- [x] **LICENSE File**: Root LICENSE file contains original MIT license text
- [x] **NOTICE File**: NOTICE file with Microsoft attribution created
- [x] **Copyright Headers**: Original Microsoft headers preserved in modified files
- [x] **Fork Identification**: Clear identification as a fork, not original VS Code
- [x] **Attribution in Documentation**: Microsoft attribution in README and docs

### ⚠️ Compliance Areas

#### File Header Compliance

**Original Microsoft Files (Modified)**:
- Preserve original copyright header
- Add modification notice if substantially changed
- Maintain MIT license reference

**New Aura Files**:
- Include both Microsoft and Aura attribution
- Clearly indicate derivation from VS Code
- Include MIT license reference

#### Distribution Compliance

**Binary Distributions**:
- Include LICENSE file
- Include NOTICE file with attributions
- Include copyright information in About dialog
- Ensure no trademark violations

**Source Code Distributions**:
- Maintain all original license headers
- Include attribution documentation
- Preserve license chain for dependencies

## Microsoft Attribution Requirements

### 1. Visual Studio Code Attribution

In all documentation and user interfaces:

> "Based on Visual Studio Code, Copyright (c) Microsoft Corporation"

### 2. About Dialog Attribution

The application's About dialog must include:

```
Aura - AI-First Development Environment
Based on Visual Studio Code
Copyright (c) Microsoft Corporation

Aura Extensions and Enhancements
Copyright (c) Aura Development Team

Licensed under the MIT License
```

### 3. Website/Marketing Attribution

On the project website and marketing materials:

> "Aura is a fork of Visual Studio Code, an open-source project by Microsoft Corporation. We extend our gratitude to Microsoft and the VS Code team for their foundational work."

## Dependency Attribution

### Third-Party Components

All third-party dependencies must be properly attributed:

1. **Generate SBOM** (Software Bill of Materials)
2. **License Compatibility Check** - Ensure all dependencies are MIT-compatible
3. **Attribution in NOTICE** - Include all required attributions

### Example NOTICE File Entry

```
This software contains components from the following projects:

Visual Studio Code
Copyright (c) Microsoft Corporation
Licensed under the MIT License

Monaco Editor
Copyright (c) Microsoft Corporation  
Licensed under the MIT License

TypeScript
Copyright (c) Microsoft Corporation
Licensed under the Apache License 2.0

[Additional dependencies listed...]
```

## Trademark Considerations

### ✅ Allowed Usage

- Referencing VS Code as the base project
- Stating "based on Visual Studio Code"
- Using Microsoft's name in attribution

### ❌ Prohibited Usage

- Using "Visual Studio Code" in product name
- Using Microsoft logos or branding
- Implying official Microsoft endorsement
- Using confusingly similar branding

## Compliance Validation

### Automated Checks

```bash
# Check for proper license headers
find . -name "*.ts" -exec grep -L "Licensed under the MIT License" {} \;

# Validate attribution in package.json files
find . -name "package.json" -exec cat {} \; | grep -i "microsoft\|license"

# Check for trademark violations
grep -r "Visual Studio Code" --include="*.md" --include="*.json" .
```

### Manual Review Items

1. **README Files** - Ensure proper attribution
2. **Package Manifests** - Verify license fields
3. **Documentation** - Check for appropriate attribution
4. **UI Text** - Verify no trademark violations
5. **Build Scripts** - Ensure compliance in distribution

## Legal Risk Mitigation

### Low Risk Items ✅

- Preserving original license headers
- Adding proper attribution
- Using MIT-compatible dependencies
- Clear fork identification

### Medium Risk Items ⚠️

- Substantial modifications to core files
- New branding and naming
- Distribution and packaging
- Third-party integrations

### High Risk Items 🚨

- Trademark usage violations
- Missing attribution requirements
- Incompatible license dependencies
- Misleading origin claims

## Compliance Maintenance

### Regular Reviews

1. **Quarterly License Audits** - Review all dependencies
2. **Attribution Verification** - Ensure proper attribution maintained
3. **Trademark Monitoring** - Check for accidental violations
4. **Documentation Updates** - Keep compliance docs current

### Update Procedures

When updating from upstream VS Code:

1. **Preserve Attribution** - Maintain Microsoft copyright headers
2. **Review Changes** - Check for new license requirements
3. **Update NOTICE** - Add any new dependency attributions
4. **Validate Compliance** - Run automated compliance checks

## Contact Information

For legal compliance questions:

- **Legal Team**: legal@aura-dev.io
- **Compliance Officer**: compliance@aura-dev.io
- **Open Source Review**: opensource@aura-dev.io

## Documentation Version

- **Version**: 1.0
- **Last Updated**: December 2024
- **Next Review**: March 2025
- **Approved By**: Aura Legal Team

---

**Disclaimer**: This document provides guidance for MIT license compliance. For specific legal questions, consult with qualified legal counsel. 