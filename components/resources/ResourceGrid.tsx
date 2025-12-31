"use client";

import React from 'react';
import { BarChart3, ClipboardCheck, Map, Scale, Lock, AlertTriangle, Download } from 'lucide-react';

const resources = [
    {
        title: "Understanding Your Valuation",
        description: "Learn how EBITDA and SDE determine your market price.",
        icon: BarChart3,
        filename: "Valuation_Guide_2024.pdf"
    },
    {
        title: "The Pre-Diligence Checklist",
        description: "The master list of documents every buyer will request.",
        icon: ClipboardCheck,
        filename: "Pre_Diligence_Checklist.pdf"
    },
    {
        title: "The M&A Roadmap",
        description: "A step-by-step timeline from Engagement to Closing.",
        icon: Map,
        filename: "MA_Roadmap_Timeline.pdf"
    },
    {
        title: "Asset vs. Stock Sale",
        description: "Key tax differences between the two deal structures.",
        icon: Scale,
        filename: "Asset_vs_Stock_Comparison.pdf"
    },
    {
        title: "Confidentiality Protocols",
        description: "How to market your business without alerting staff.",
        icon: Lock,
        filename: "Confidentiality_Playbook.pdf"
    },
    {
        title: "Seller's \"Red Flag\" Audit",
        description: "Identify and fix common deal-killers before going to market.",
        icon: AlertTriangle,
        filename: "Red_Flag_Audit_Template.pdf"
    }
];

export default function ResourceGrid() {
    const handleDownload = (filename: string) => {
        alert(`Demo Mode: ${filename} download started...`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {resources.map((resource, index) => (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-start h-full hover:shadow-md transition-shadow duration-200">
                    <div className="bg-[#0B3D2E]/5 p-3 rounded-lg mb-6">
                        <resource.icon className="text-[#0B3D2E]" size={32} />
                    </div>

                    <h3 className="text-xl font-bold text-[#0B3D2E] mb-3 leading-tight">
                        {resource.title}
                    </h3>

                    <p className="text-gray-500 mb-8 leading-relaxed flex-1">
                        {resource.description}
                    </p>

                    <button
                        onClick={() => handleDownload(resource.filename)}
                        className="w-full mt-auto flex items-center justify-center gap-2 border border-[#0B3D2E] text-[#0B3D2E] font-bold py-3 rounded-lg hover:bg-[#0B3D2E]/5 transition-colors"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                </div>
            ))}
        </div>
    );
}
