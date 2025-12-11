# 🔄 One World Visa - System Flowcharts

> **Complete Visual Guide to System Workflows and Processes**

This document contains comprehensive flowcharts for the One World Visa management system, covering all major workflows and user interactions.

---

## 📋 **Table of Contents**

1. [Complete Application Workflow](#1-complete-application-workflow)
2. [User Authentication & Role Management](#2-user-authentication--role-management-flow)
3. [Payment Processing Flow](#3-payment-processing-flow)
4. [Document Management Flow](#4-document-management-flow)
5. [Agent Registration & Management](#5-agent-registration--management-flow)
6. [Admin System Management](#6-admin-system-management-flow)
7. [Email Notification System](#7-email-notification-system-flow)
8. [WhatsApp Integration Flow](#8-whatsapp-integration-flow)
9. [Form Builder Workflow](#9-form-builder-workflow)
10. [Status Management System](#10-status-management-system)

---

## **1. Complete Application Workflow**

```mermaid
flowchart TD
    A[🔐 User Registration/Login] --> B{👤 User Role?}
    B -->|Customer| C[🌍 Browse Countries & Visa Types]
    B -->|Agent| D[🏢 Agent Dashboard]
    B -->|Employee| E[👨💼 Employee Dashboard]
    B -->|Admin| F[⚙️ Admin Panel]
    
    C --> G[📋 Select Visa Type]
    G --> H[📝 Fill Application Form]
    H --> I{📊 Application Type?}
    I -->|Individual| J[👤 Single Applicant Form]
    I -->|Family| K[👨👩👧👦 Multiple Applicants]
    I -->|Group| L[👥 Group Application]
    
    J --> M[📎 Upload Documents]
    K --> M
    L --> M
    
    M --> N[👁️ Review Application]
    N --> O{✅ All Correct?}
    O -->|No| H
    O -->|Yes| P[💾 Save as Draft or Submit]
    
    P --> Q[📧 Email Notification Sent]
    Q --> R[👨💼 Agent Assignment]
    R --> S[📞 Agent Contacts Customer]
    S --> T[💳 Payment Processing]
    T --> U[✅ Payment Confirmed]
    U --> V[🔄 Application Processing]
    V --> W[🏛️ Embassy Submission]
    W --> X[📊 Status Updates]
    X --> Y{🎯 Final Status?}
    Y -->|Approved| Z[✅ Visa Issued]
    Y -->|Rejected| AA[❌ Application Rejected]
    Y -->|Additional Docs| BB[📋 Request More Documents]
    
    Z --> CC[🚚 Document Delivery]
    BB --> M
    AA --> DD[📧 Rejection Notification]
    CC --> EE[🎉 Process Complete]
```

---

## **2. User Authentication & Role Management Flow**

```mermaid
flowchart TD
    A[🌐 User Visits System] --> B{🔐 Logged In?}
    B -->|No| C[📝 Registration/Login Page]
    B -->|Yes| D{👤 User Role Check}
    
    C --> E{📋 New User?}
    E -->|Yes| F[📝 Registration Form]
    E -->|No| G[🔐 Login Form]
    
    F --> H[📧 Email Verification]
    H --> I[✅ Account Activated]
    I --> J[🎯 Role Assignment]
    
    G --> K{🔑 Valid Credentials?}
    K -->|No| L[❌ Error Message]
    K -->|Yes| M[🎫 JWT Token Generated]
    
    L --> G
    M --> N[🍪 Token Stored]
    N --> D
    
    J --> D
    
    D -->|Customer| O[🏠 Customer Dashboard]
    D -->|Agent| P[🏢 Agent Dashboard]
    D -->|Employee| Q[👨💼 Employee Dashboard]
    D -->|Manager| R[📊 Manager Dashboard]
    D -->|Admin| S[⚙️ Admin Panel]
    
    O --> T[📋 My Applications]
    O --> U[💳 Payment History]
    O --> V[👤 Profile Management]
    
    P --> W[👥 Client Management]
    P --> X[💰 Commission Tracking]
    P --> Y[📊 Agent Analytics]
    
    Q --> Z[📋 Assigned Applications]
    Q --> AA[📞 Customer Communication]
    Q --> BB[📊 Processing Status]
    
    R --> CC[📈 Team Performance]
    R --> DD[👥 User Management]
    R --> EE[📊 System Reports]
    
    S --> FF[🌐 System Configuration]
    S --> GG[👥 All User Management]
    S --> HH[📊 Complete Analytics]
```

---

## **3. Payment Processing Flow**

```mermaid
flowchart TD
    A[📋 Application Submitted] --> B[👨💼 Agent Assignment]
    B --> C[📞 Agent Contacts Customer]
    C --> D{💰 Payment Method?}
    
    D -->|Online| E[💳 Razorpay Gateway]
    D -->|Offline| F[🏦 Bank Transfer/Cash]
    
    E --> G[🔐 Secure Payment Form]
    G --> H{✅ Payment Success?}
    H -->|Yes| I[✅ Payment Confirmed]
    H -->|No| J[❌ Payment Failed]
    
    J --> K[📧 Failure Notification]
    K --> L[🔄 Retry Payment]
    L --> D
    
    F --> M[📋 Manual Verification]
    M --> N{✅ Payment Verified?}
    N -->|Yes| I
    N -->|No| O[📞 Contact Customer]
    O --> F
    
    I --> P[📧 Payment Confirmation Email]
    P --> Q[📱 WhatsApp Notification]
    Q --> R[📊 Update Application Status]
    R --> S[🔄 Begin Processing]
    S --> T[🏛️ Embassy Submission]
    T --> U[📈 Payment Analytics Update]
```

---

## **4. Document Management Flow**

```mermaid
flowchart TD
    A[📋 Application Form] --> B[📎 Document Upload Section]
    B --> C{📁 File Type Check}
    
    C -->|Valid| D[📏 Size Validation]
    C -->|Invalid| E[❌ File Type Error]
    
    E --> F[📧 Error Message]
    F --> B
    
    D -->|< 5MB| G[🔐 Secure Upload]
    D -->|> 5MB| H[❌ Size Error]
    
    H --> I[📧 Size Limit Message]
    I --> B
    
    G --> J[🖼️ Image Compression]
    J --> K[💾 File Storage]
    K --> L[🔗 Generate File URL]
    L --> M[✅ Upload Success]
    
    M --> N[👁️ File Preview]
    N --> O{📋 Multiple Files?}
    O -->|Yes| P[📚 File Gallery]
    O -->|No| Q[📄 Single File View]
    
    P --> R[🗂️ File Management]
    Q --> R
    
    R --> S{🔄 Action Required?}
    S -->|View| T[👁️ File Viewer]
    S -->|Download| U[⬇️ File Download]
    S -->|Delete| V[🗑️ File Removal]
    S -->|Replace| W[🔄 File Replacement]
    
    T --> X[📱 Modal Display]
    U --> Y[💾 Local Download]
    V --> Z[✅ Deletion Confirmed]
    W --> B
```

---

## **5. Agent Registration & Management Flow**

```mermaid
flowchart TD
    A[🌐 Agent Registration Page] --> B[📝 Company Information Form]
    B --> C[📋 Required Documents]
    
    C --> D[📄 PAN Card Upload]
    D --> E[🏢 GST Certificate]
    E --> F[🏛️ MSME Certificate]
    F --> G[🏦 Cancelled Cheque]
    G --> H[🆔 Aadhaar Card]
    
    H --> I[📧 Submit Application]
    I --> J[✅ Application Received]
    J --> K[📧 Confirmation Email]
    K --> L[👨💼 Admin Review]
    
    L --> M{🔍 Document Verification}
    M -->|Valid| N[✅ Documents Approved]
    M -->|Invalid| O[❌ Documents Rejected]
    
    O --> P[📧 Rejection Email]
    P --> Q[📋 Resubmission Request]
    Q --> C
    
    N --> R[🎯 Agent Status: Active]
    R --> S[📧 Activation Email]
    S --> T[🔐 Login Credentials]
    T --> U[🏢 Agent Dashboard Access]
    
    U --> V[💰 Special Pricing Access]
    V --> W[👥 Client Management]
    W --> X[📊 Commission Tracking]
    X --> Y[📈 Performance Analytics]
```

---

## **6. Admin System Management Flow**

```mermaid
flowchart TD
    A[⚙️ Admin Login] --> B[🏠 Admin Dashboard]
    B --> C{📊 Management Area}
    
    C -->|Users| D[👥 User Management]
    C -->|Applications| E[📋 Application Management]
    C -->|Payments| F[💳 Payment Management]
    C -->|System| G[⚙️ System Configuration]
    C -->|Reports| H[📊 Analytics & Reports]
    
    D --> I[➕ Add New User]
    D --> J[✏️ Edit User Details]
    D --> K[🔄 Change User Status]
    D --> L[🗑️ Delete User]
    
    E --> M[👁️ View All Applications]
    E --> N[📝 Update Status]
    E --> O[👨💼 Assign to Employee]
    E --> P[📧 Send Notifications]
    
    F --> Q[💰 Payment Overview]
    F --> R[✅ Confirm Payments]
    F --> S[📊 Revenue Analytics]
    F --> T[💳 Refund Processing]
    
    G --> U[🌍 Country Management]
    G --> V[📋 Visa Type Configuration]
    G --> W[📝 Form Builder]
    G --> X[📧 Email Templates]
    
    H --> Y[📈 Application Statistics]
    H --> Z[💰 Revenue Reports]
    H --> AA[👥 User Analytics]
    H --> BB[📊 Performance Metrics]
    
    U --> CC[➕ Add Country]
    U --> DD[🖼️ Upload Country Images]
    U --> EE[📋 Set Visa Requirements]
    
    W --> FF[📝 Create Form Sections]
    W --> GG[🔧 Add Form Fields]
    W --> HH[⚙️ Configure Validations]
```

---

## **7. Email Notification System Flow**

```mermaid
flowchart TD
    A[🎯 System Event Triggered] --> B{📧 Event Type?}
    
    B -->|Registration| C[👋 Welcome Email]
    B -->|Application| D[📋 Application Status]
    B -->|Payment| E[💳 Payment Confirmation]
    B -->|Agent| F[🏢 Agent Notifications]
    B -->|Admin| G[⚙️ Admin Alerts]
    
    C --> H[📝 Generate Welcome Template]
    D --> I[📊 Generate Status Template]
    E --> J[💰 Generate Payment Template]
    F --> K[🏢 Generate Agent Template]
    G --> L[⚙️ Generate Admin Template]
    
    H --> M[📧 Send Email via Nodemailer]
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N{✅ Email Sent?}
    N -->|Yes| O[📝 Log Success]
    N -->|No| P[❌ Log Error]
    
    O --> Q[📊 Update Notification Status]
    P --> R[🔄 Retry Mechanism]
    R --> M
    
    Q --> S[📈 Analytics Update]
```

---

## **8. WhatsApp Integration Flow**

```mermaid
flowchart TD
    A[📱 WhatsApp Event Trigger] --> B{🎯 Message Type?}
    
    B -->|Welcome| C[👋 Welcome Message]
    B -->|Status Update| D[📊 Status Change]
    B -->|Payment| E[💳 Payment Alert]
    B -->|Embassy| F[🏛️ Embassy Reminder]
    B -->|Visa Ready| G[✅ Visa Approval]
    
    C --> H[📝 Format Welcome Template]
    D --> I[📊 Format Status Template]
    E --> J[💰 Format Payment Template]
    F --> K[🏛️ Format Embassy Template]
    G --> L[✅ Format Approval Template]
    
    H --> M[🔧 MSG91 API Call]
    I --> M
    J --> M
    K --> M
    L --> M
    
    M --> N{📱 Message Sent?}
    N -->|Yes| O[✅ Log Success]
    N -->|No| P[❌ Log Failure]
    
    O --> Q[📊 Update Delivery Status]
    P --> R[🔄 Retry Logic]
    R --> M
    
    Q --> S[📈 Analytics Update]
```

---

## **9. Form Builder Workflow**

```mermaid
flowchart TD
    A[📝 Admin Access Form Builder] --> B[🌍 Select Country & Visa Type]
    B --> C[📋 Create Form Sections]
    
    C --> D[➕ Add Section Details]
    D --> E[📝 Section Name & Description]
    E --> F[🔢 Set Section Order]
    F --> G[📊 Section Status]
    
    G --> H[🔧 Add Form Fields]
    H --> I{📝 Field Type?}
    
    I -->|Text| J[📝 Text Input Field]
    I -->|Select| K[📋 Dropdown Field]
    I -->|File| L[📎 File Upload Field]
    I -->|Checkbox| M[☑️ Checkbox Field]
    I -->|Radio| N[🔘 Radio Button Field]
    I -->|Textarea| O[📄 Textarea Field]
    
    J --> P[⚙️ Configure Field Properties]
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P
    
    P --> Q[📝 Field Label & Placeholder]
    Q --> R[✅ Required/Optional Setting]
    R --> S[🔢 Field Order]
    S --> T[📊 Field Validation Rules]
    
    T --> U[💾 Save Field Configuration]
    U --> V{➕ Add More Fields?}
    V -->|Yes| H
    V -->|No| W[👁️ Preview Form]
    
    W --> X[✅ Publish Form]
    X --> Y[🌐 Form Available to Users]
```

---

## **10. Status Management System**

```mermaid
flowchart TD
    A[📋 Application Submitted] --> B[📊 Initial Status: Submitted]
    B --> C[👨💼 Agent Assignment]
    C --> D[📊 Status: Agent Assigned]
    
    D --> E[📞 Agent Contact]
    E --> F[📊 Status: Customer Contacted]
    F --> G{💳 Payment Received?}
    
    G -->|No| H[📊 Status: Payment Pending]
    G -->|Yes| I[📊 Status: Payment Confirmed]
    
    H --> J[📧 Payment Reminder]
    J --> G
    
    I --> K[📊 Status: Under Processing]
    K --> L[📝 Document Review]
    L --> M{📄 Documents Complete?}
    
    M -->|No| N[📊 Status: Additional Documents Required]
    M -->|Yes| O[📊 Status: Documents Verified]
    
    N --> P[📧 Document Request Email]
    P --> Q[📎 Customer Uploads Documents]
    Q --> L
    
    O --> R[🏛️ Embassy Submission]
    R --> S[📊 Status: Submitted to Embassy]
    S --> T[📅 Embassy Processing]
    T --> U{🎯 Embassy Decision?}
    
    U -->|Approved| V[📊 Status: Visa Approved]
    U -->|Rejected| W[📊 Status: Visa Rejected]
    U -->|Interview| X[📊 Status: Interview Scheduled]
    
    V --> Y[📄 Visa Document Preparation]
    Y --> Z[📊 Status: Visa Ready]
    Z --> AA[🚚 Document Dispatch]
    AA --> BB[📊 Status: In Transit]
    BB --> CC[📊 Status: Delivered]
    
    W --> DD[📧 Rejection Notification]
    X --> EE[📧 Interview Notification]
    EE --> FF[📅 Interview Completion]
    FF --> U
    
    CC --> GG[🎉 Process Complete]
    DD --> HH[📊 Case Closed]
```

---

## 📊 **Flowchart Legend**

### **Symbols Used**
- **🔐** - Authentication/Security
- **👤** - User/Person
- **📋** - Forms/Applications
- **💳** - Payments
- **📧** - Email Notifications
- **📱** - WhatsApp/SMS
- **🏛️** - Embassy/Government
- **⚙️** - System/Admin
- **📊** - Status/Analytics
- **🔄** - Process/Workflow
- **✅** - Success/Approval
- **❌** - Error/Rejection
- **🎯** - Decision Point
- **📎** - Documents/Files

### **Color Coding**
- **Green Paths** - Success flows
- **Red Paths** - Error/rejection flows
- **Blue Paths** - Information/status flows
- **Orange Paths** - Action required flows

---

## 🎯 **Usage Instructions**

1. **For Developers** - Use these flowcharts to understand system logic and implementation requirements
2. **For Business Users** - Reference these flows to understand process steps and user journeys
3. **For Training** - Use as visual aids for onboarding new team members
4. **For Documentation** - Include in technical specifications and user manuals
5. **For Stakeholders** - Present system capabilities and process flows

---

## 📞 **Support**

For questions about these flowcharts or system processes:
- **Email**: support@oneworldvisa.in
- **Phone**: +91 9167447700
- **Documentation**: https://docs.oneworldvisa.in

---

**© 2025 One World Visa. All rights reserved.**