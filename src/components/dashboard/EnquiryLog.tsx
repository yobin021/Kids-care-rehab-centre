"use client";

import React, { useState } from "react";
import { useDashboard, Enquiry } from "@/context/DashboardContext";
import { Phone, UserPlus, CheckCircle2, Clock } from "lucide-react";

export default function EnquiryLog() {
  const { enquiries, updateEnquiryStatus, setPrefillRegistrationData, setActiveTab } = useDashboard();
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  const getStatusBadge = (status: Enquiry["status"]) => {
    switch (status) {
      case "New":
        return "bg-[#993C1D]/10 text-[#993C1D] border-[#993C1D]/30";
      case "Called":
        return "bg-[#854F0B]/10 text-[#854F0B] border-[#854F0B]/30";
      case "Appointment Booked":
        return "bg-[#3B6D11]/10 text-[#3B6D11] border-[#3B6D11]/30";
      case "Not Interested":
        return "bg-slate-100 text-[#5F5E5A] border-slate-300";
      default:
        return "bg-slate-100 text-[#5F5E5A]";
    }
  };

  const handleConvert = (enq: Enquiry) => {
    setPrefillRegistrationData({
      name: enq.childName,
      parentName: enq.parentName,
      whatsapp: enq.phone,
      address: enq.area,
      primaryConcern: enq.mainConcern
    });
    setActiveTab("children-new");
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#2C2C2A]">Clinic Enquiry Log</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Track prospective parent enquiries and convert to registrations.</p>
        </div>
        <span className="px-3 py-1 bg-[#185FA5] text-white text-xs font-bold rounded-full">
          {enquiries.length} Enquiries Logged
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#5F5E5A]">
                <th className="p-3.5 font-extrabold">Date</th>
                <th className="p-3.5 font-extrabold">Parent Name</th>
                <th className="p-3.5 font-extrabold">Child Name</th>
                <th className="p-3.5 font-extrabold">Phone</th>
                <th className="p-3.5 font-extrabold">Area</th>
                <th className="p-3.5 font-extrabold">Main Concern</th>
                <th className="p-3.5 font-extrabold">Status</th>
                <th className="p-3.5 font-extrabold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq.id} className="border-b border-[#D3D1C7]/40 hover:bg-[#F8F8F6]/60">
                  <td className="p-3.5 font-semibold text-[#5F5E5A] whitespace-nowrap">{enq.date}</td>
                  <td className="p-3.5 font-bold text-[#2C2C2A]">{enq.parentName}</td>
                  <td className="p-3.5 font-bold text-[#185FA5]">{enq.childName}</td>
                  <td className="p-3.5 font-mono text-[#5F5E5A]">{enq.phone}</td>
                  <td className="p-3.5 font-semibold text-[#5F5E5A]">{enq.area}</td>
                  <td className="p-3.5 font-semibold text-[#2C2C2A] max-w-xs truncate">{enq.mainConcern}</td>
                  <td className="p-3.5">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusBadge(enq.status)}`}>
                      {enq.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => updateEnquiryStatus(enq.id, enq.status === "New" ? "Called" : "Appointment Booked")}
                      className="px-2.5 py-1 bg-[#F8F8F6] hover:bg-slate-200 text-[#2C2C2A] rounded-[6px] border border-[#D3D1C7] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Phone className="h-3 w-3 text-[#5F5E5A]" />
                      <span>Update</span>
                    </button>
                    
                    <button
                      onClick={() => handleConvert(enq)}
                      className="px-2.5 py-1 bg-[#185FA5] hover:bg-[#12487e] text-white rounded-[6px] text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="h-3 w-3" />
                      <span>Convert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
