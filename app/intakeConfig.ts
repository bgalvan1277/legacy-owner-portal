
export type QuestionType =
    | "text"
    | "tel"
    | "email"
    | "boolean"
    | "select"
    | "textarea"
    | "number"
    | "checkbox-group"
    | "file"
    | "date"
    | "url"; // Added url type if needed, though 'text' works fine. User asked for 'url (or text)'. I'll stick to text but add url to type just in case.

export interface QuestionOption {
    label: string;
    value: string;
}

export interface LogicRule {
    triggerValue: string | boolean;
    action: "show_questions" | "jump_to_phase" | "flag_attorney" | "require_upload";
    targetIds?: string[]; // IDs of questions or phases to show/jump to
    message?: string; // For flags
}

export interface Question {
    id: string;
    label: string;
    type: QuestionType;
    options?: string[] | QuestionOption[];
    required?: boolean;
    placeholder?: string; // Added placeholder
    conditional?: {
        dependsOn: string;
        value: string | boolean;
    };
    logic?: LogicRule[];
}

export interface Phase {
    id: string;
    title: string;
    description: string;
    questions: Question[];
}

export const intakePhases: Phase[] = [
    {
        id: "phase-1",
        title: "Initial Screening",
        description: "Let's start with the basics to establish your timeline and current status.",
        questions: [
            { id: "q1_1", label: "Seller Legal Name", type: "text", required: true },
            { id: "q1_2", label: "Company Name", type: "text", required: true },
            { id: "q1_3", label: "Phone", type: "tel", required: true },
            { id: "q1_4", label: "Email", type: "email", required: true },
            { id: "q1_5", label: "Preferred communication method", type: "select", options: ["Phone", "Email", "Text"], required: true },

            // Immediate Fit Questions
            {
                id: "q1_6",
                label: "Do you already have a buyer?",
                type: "boolean",
                required: true,
                logic: [
                    // Was targeting q6_x (Buyer Info), now that is Phase 7, so targeting q7_x
                    { triggerValue: true, action: "show_questions", targetIds: ["q7_1", "q7_2", "q7_3"] }
                ]
            },
            {
                id: "q1_7",
                label: "Are you looking for help finding a buyer?",
                type: "boolean",
                conditional: { dependsOn: "q1_6", value: false }
            },
            {
                id: "q1_8",
                label: "What is your approximate target sale timeframe?",
                type: "select",
                options: ["Within 30 days (urgent)", "1–3 months", "3–12 months", "No timeline (“just exploring”)"],
                required: true
            },
            {
                id: "q1_9",
                label: "Has the business been listed publicly before?",
                type: "boolean",
                required: true
            },
            {
                id: "q1_10",
                label: "Please provide listing details (price, where listed, how long, any offers)",
                type: "textarea",
                conditional: { dependsOn: "q1_9", value: true }
            },
            {
                id: "q1_11",
                label: "Is the business currently operational?",
                type: "select",
                options: ["Fully operational", "Semi-operational", "Closed but assets remain"],
                required: true
            },
            // Red Flags (q1_12) removed previously
        ]
    },
    {
        id: "phase-2",
        title: "Business Information",
        description: "Tell us about your business model, operations, and what makes your company unique.",
        questions: [
            {
                id: "q2_business_desc",
                label: "Business Description",
                type: "textarea",
                placeholder: "In your own words, tell us what you do...",
                required: true
            },
            {
                id: "q2_competitive_adv",
                label: "Competitive Advantages",
                type: "textarea",
                placeholder: "Does your business have any unique advantages, growth potential, or location benefits?",
                required: true
            },
            {
                id: "q2_has_website",
                label: "Do you have a website?",
                type: "boolean",
                required: true
            },
            {
                id: "q2_website_url",
                label: "Website URL",
                type: "text",
                conditional: { dependsOn: "q2_has_website", value: true }
            }
        ]
    },
    {
        id: "phase-3", // Formerly Phase 2
        title: "Business Identity & Structure",
        description: "Confirm your legal entity type and list all current ownership percentages.",
        questions: [
            {
                id: "q3_1", // Formerly q2_1
                label: "What type of entity is the business?",
                type: "select",
                options: ["LLC", "Corporation (C or S)", "Partnership", "Sole Proprietorship", "Other"],
                required: true
            },
            {
                id: "q3_2",
                label: "Upload Articles of Incorporation / Organization",
                type: "file"
            },
            {
                id: "q3_3",
                label: "Upload Operating Agreement / Bylaws",
                type: "file"
            },
            {
                id: "q3_4",
                label: "Upload Shareholder or Partnership Agreements",
                type: "file"
            },
            {
                id: "q3_5",
                label: "Who owns the business? (list all owners, % ownership)",
                type: "textarea",
                required: true
            },
            {
                id: "q3_6",
                label: "Do all owners agree to sell?",
                type: "boolean",
                required: true,
                logic: [
                    { triggerValue: false, action: "flag_attorney", message: "Attorney Flag: Owners do not agree" }
                ]
            },
            {
                id: "q3_7",
                label: "Does this business own or control any other companies or DBAs?",
                type: "boolean",
                required: true
            },
            {
                id: "q3_8",
                label: "List all subsidiaries or related entities",
                type: "textarea",
                conditional: { dependsOn: "q3_7", value: true }
            }
        ]
    },
    {
        id: "phase-4", // Formerly Phase 3
        title: "Financial Snapshot",
        description: "Provide a high-level overview of your revenue, profit, and financial health.",
        questions: [
            {
                id: "q4_1",
                label: "Do you have the last three years of financial statements?",
                type: "boolean",
                logic: [
                    { triggerValue: false, action: "flag_attorney", message: "CPA Coordination Needed" }
                ]
            },
            {
                id: "q4_1_upload",
                label: "Upload Financial Statements",
                type: "file",
                conditional: { dependsOn: "q4_1", value: true }
            },
            {
                id: "q4_2",
                label: "Do you have the last three years of tax returns?",
                type: "boolean",
                logic: [
                    { triggerValue: false, action: "flag_attorney", message: "CPA Coordination Needed" }
                ]
            },
            {
                id: "q4_2_upload",
                label: "Upload Tax Returns",
                type: "file",
                conditional: { dependsOn: "q4_2", value: true }
            },
            { id: "q4_3", label: "What is your approximate annual revenue?", type: "number" },
            { id: "q4_4", label: "What is your approximate annual net profit?", type: "number" },
            {
                id: "q4_5",
                label: "Does the business have existing debt, loans, or credit lines?",
                type: "boolean",
                required: true
            },
            {
                id: "q4_6",
                label: "Lender info & payoff amounts",
                type: "textarea",
                conditional: { dependsOn: "q4_5", value: true }
            },
            {
                id: "q4_7",
                label: "Are there outstanding taxes, liens, or judgments?",
                type: "boolean",
                logic: [
                    { triggerValue: true, action: "flag_attorney", message: "Attorney Flag: Outstanding Liens" }
                ]
            }
        ]
    },
    {
        id: "phase-5", // Formerly Phase 4
        title: "Assets Being Sold",
        description: "Identify the inventory, equipment, intellectual property, and other assets included in the sale.",
        questions: [
            {
                id: "q5_1",
                label: "What assets are included in the sale?",
                type: "checkbox-group",
                options: [
                    "Equipment",
                    "Vehicles",
                    "Inventory",
                    "Tools",
                    "Customer lists",
                    "Website & domain",
                    "Social media",
                    "IP (trademarks, logos, copyrighted content)",
                    "Real Estate"
                ],
                logic: [
                    // Formerly targeted phase-9 (Real Estate). Now that is Phase 10.
                    { triggerValue: "Real Estate", action: "jump_to_phase", targetIds: ["phase-10"] }
                ]
            },
            {
                id: "q5_2",
                label: "Does the business have active contracts with customers or vendors?",
                type: "boolean"
            },
            {
                id: "q5_3",
                label: "Upload contracts",
                type: "file",
                conditional: { dependsOn: "q5_2", value: true }
            },
            {
                id: "q5_4",
                label: "Are these contracts assignable?",
                type: "select",
                options: ["Yes", "No", "Unsure"],
                conditional: { dependsOn: "q5_2", value: true }
            }
        ]
    },
    {
        id: "phase-6", // Formerly Phase 5
        title: "Employees & HR",
        description: "Outline your current team structure, benefits, and key employee details.",
        questions: [
            { id: "q6_1", label: "How many employees do you have?", type: "number" },
            {
                id: "q6_2",
                label: "Do employees know about the potential sale?",
                type: "boolean",
                logic: [
                    { triggerValue: true, action: "show_questions", message: "Discuss HR Strategy" },
                    { triggerValue: false, action: "show_questions", message: "Discuss Confidentiality Plan" }
                ]
            },
            {
                id: "q6_3",
                label: "Do you have employment agreements, non-competes, or handbooks?",
                type: "boolean"
            },
            {
                id: "q6_3_upload",
                label: "Upload HR Documents",
                type: "file",
                conditional: { dependsOn: "q6_3", value: true }
            },
            {
                id: "q6_4",
                label: "Do you offer benefits?",
                type: "checkbox-group",
                options: ["Health insurance", "Retirement", "PTO policies", "None"]
            },
            {
                id: "q6_5",
                label: "Upload Benefit Plan Docs",
                type: "file"
            }
        ]
    },
    {
        id: "phase-7", // Formerly Phase 6
        title: "Buyer Information",
        description: "If you are already speaking with a potential buyer, record their details here.",
        questions: [
            {
                id: "q7_1",
                label: "Is the buyer an individual or a company?",
                type: "text"
            },
            {
                id: "q7_2",
                label: "Has the buyer seen your financials?",
                type: "boolean"
            },
            {
                id: "q7_3",
                label: "Has an LOI (Letter of Intent) been signed?",
                type: "boolean"
            },
            {
                id: "q7_3_upload",
                label: "Upload LOI",
                type: "file",
                conditional: { dependsOn: "q7_3", value: true }
            },
            {
                id: "q7_4",
                label: "Is the buyer using financing?",
                type: "select",
                options: ["Bank loan", "SBA loan", "Seller financing", "Cash", "Unknown"],
                logic: [
                    { triggerValue: "Bank loan", action: "show_questions", message: "Trigger Lender Coordination" },
                    { triggerValue: "SBA loan", action: "show_questions", message: "Trigger SBA Checklist" },
                    { triggerValue: "Seller financing", action: "flag_attorney", message: "Attorney Review: Seller Financing" }
                ]
            }
        ]
    },
    {
        id: "phase-8", // Formerly Phase 7
        title: "Deal Structure Preferences",
        description: "Help us understand your preferred sale terms, such as asset vs. stock sale.",
        questions: [
            {
                id: "q8_1",
                label: "Are you interested in an asset sale or selling your shares/interests?",
                type: "select",
                options: ["Asset Sale", "Stock Sale", "Not sure"]
            },
            {
                id: "q8_2",
                label: "Do you plan to stay involved for transition support?",
                type: "boolean"
            },
            {
                id: "q8_3",
                label: "Are you willing to sign a non-compete after sale?",
                type: "boolean"
            },
            {
                id: "q8_4",
                label: "Desired Non-Compete Duration",
                type: "text",
                conditional: { dependsOn: "q8_3", value: true }
            },
            {
                id: "q8_5",
                label: "Desired Non-Compete Geographic Scope",
                type: "text",
                conditional: { dependsOn: "q8_3", value: true }
            }
        ]
    },
    {
        id: "phase-9", // Formerly Phase 8
        title: "Legal & Compliance Check",
        description: "Review active licenses, insurance policies, and any potential legal considerations.",
        questions: [
            {
                id: "q9_1",
                label: "Does your business require state or professional licenses?",
                type: "boolean"
            },
            {
                id: "q9_2",
                label: "Is your business currently involved in any lawsuits or disputes?",
                type: "boolean",
                logic: [{ triggerValue: true, action: "flag_attorney", message: "Attorney Flag: Litigation" }]
            },
            {
                id: "q9_3",
                label: "Do you have active insurance policies?",
                type: "boolean"
            },
            {
                id: "q9_3_upload",
                label: "Upload Declarations Pages",
                type: "file",
                conditional: { dependsOn: "q9_3", value: true }
            }
        ]
    },
    {
        id: "phase-10", // Formerly Phase 9
        title: "Real Estate",
        description: "Details regarding the business property, whether you lease or own the location.",
        questions: [
            {
                id: "q10_1",
                label: "Do you lease or own the property where the business operates?",
                type: "select",
                options: ["Lease", "Own"]
            },
            // Lease Logic
            {
                id: "q10_2",
                label: "Upload Lease",
                type: "file",
                conditional: { dependsOn: "q10_1", value: "Lease" }
            },
            {
                id: "q10_3",
                label: "Is landloard notice required?",
                type: "boolean",
                conditional: { dependsOn: "q10_1", value: "Lease" }
            },
            // Own Logic
            {
                id: "q10_4",
                label: "Is property part of the sale or separate transaction?",
                type: "select",
                options: ["Part of sale", "Separate transaction"],
                conditional: { dependsOn: "q10_1", value: "Own" }
            }
        ]
    },
    {
        id: "phase-11", // Formerly Phase 10
        title: "Seller Goals & Motivation",
        description: "Share your primary reasons for selling and your ideal outcome for this transaction.",
        questions: [
            {
                id: "q11_1",
                label: "Why are you selling?",
                type: "checkbox-group",
                options: ["Retirement", "Health reasons", "Burnout", "Opportunity to exit", "Buyer approached me"]
            },
            { id: "q11_2", label: "What is your ideal sale price?", type: "number" },
            { id: "q11_3", label: "What is your minimum acceptable price?", type: "number" },
            {
                id: "q11_4",
                label: "How confidential do you want the sale to be?",
                type: "select",
                options: ["Strictly Confidential", "Standard", "Public Listing"]
            }
        ]
    },
    {
        id: "phase-12", // Formerly Phase 11
        title: "Document Collection Checklist",
        description: "Upload the necessary tax returns, operating agreements, and financial statements.",
        questions: [
            { id: "q12_1", label: "Articles of incorporation / organization", type: "file" },
            { id: "q12_2", label: "Operating agreement / bylaws", type: "file" },
            { id: "q12_3", label: "Tax returns (3 years)", type: "file" },
            { id: "q12_4", label: "Financial statements (3 years)", type: "file" },
            { id: "q12_5", label: "Debt statements", type: "file" },
            { id: "q12_6", label: "Client contracts", type: "file" },
            { id: "q12_7", label: "Vendor contracts", type: "file" },
            { id: "q12_8", label: "Employment agreements", type: "file" },
            { id: "q12_9", label: "Lease agreements", type: "file" },
            { id: "q12_10", label: "Asset lists", type: "file" },
            { id: "q12_11", label: "IP documentation", type: "file" },
            { id: "q12_12", label: "Insurance policies", type: "file" },
            { id: "q12_13", label: "Inventory lists", type: "file" },
            { id: "q12_14", label: "Business plan or marketing materials", type: "file" },
            { id: "q12_15", label: "Website login credentials", type: "text" }
        ]
    }
];