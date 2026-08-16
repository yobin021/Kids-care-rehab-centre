"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Edit3, School, Activity } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { childrenService } from "../services/childrenService";
import { THERAPY_CATEGORIES } from "../services/therapyService";

export default function ChildEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { childrenList, updateChildDetails, showToast } = useAuth();

  const child = childrenList.find((c) => c.id === id) || childrenList[1] || childrenList[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    program_type: child?.program_type || "iep",
    therapy_category: child?.therapy_category || "ASD",
    name: child?.name || "",
    dob: child?.dob || child?.date_of_birth || "",
    gender: child?.gender || "Male",
    diagnosis: child?.diagnosis || (child?.program_type === "iep" ? "IEP Special School" : "ASD"),
    profile: child?.profile || (child?.program_type === "iep" ? "IEP" : "ASD"),
    school: child?.school || "",
    class: child?.class || "",
    primaryConcern: child?.primaryConcern || child?.primary_concern || "",
    referredBy: child?.referredBy || child?.referred_by || "Self",
    previousTherapy: child?.previousTherapy || false,
    previousTherapyDetails: child?.previousTherapyDetails || "",
    parentName: child?.parent?.name || "",
    relationship: child?.parent?.relationship || "Father",
    phone: child?.parent?.phone || "",
    email: child?.parent?.email || "",
    address: child?.parent?.address || ""
  });

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isIep = formData.program_type === "iep";

    const childPayload = {
      name: formData.name,
      gender: formData.gender,
      program_type: formData.program_type,
      therapy_category: isIep ? null : formData.therapy_category,
      diagnosis: isIep ? "IEP Special School" : formData.therapy_category,
      profile: isIep ? "IEP" : formData.therapy_category,
      school: formData.school,
      class: formData.class,
      primaryConcern: formData.primaryConcern,
      referredBy: formData.referredBy,
      previousTherapy: formData.previousTherapy,
      previousTherapyDetails: formData.previousTherapyDetails
    };

    try {
      await childrenService.update(id, childPayload);
      updateChildDetails(id, {
        ...formData,
        ...childPayload,
        parent: {
          name: formData.parentName,
          relationship: formData.relationship,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          portalActive: child?.parent?.portalActive || false,
          portalPassword: child?.parent?.portalPassword || ""
        }
      });
      showToast(`Updated details for ${formData.name}`, "success");
      navigate(`/children/${id}`);
    } catch (err) {
      console.warn("Using local child update fallback:", err.message);
      updateChildDetails(id, {
        ...formData,
        ...childPayload,
        parent: {
          name: formData.parentName,
          relationship: formData.relationship,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          portalActive: child?.parent?.portalActive || false,
          portalPassword: child?.parent?.portalPassword || ""
        }
      });
      showToast(`Updated details for ${formData.name}`, "success");
      navigate(`/children/${id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/children/${id}`)}
          className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
        </button>
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Edit Child Profile</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Update program enrollment &amp; information for {child?.name} ({id})</p>
        </div>
      </div>

      <Card title="Program & Student Information">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Program Type Switcher */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#2C2C2A] uppercase tracking-wider">
              Enrolled Program Pathway *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => {
                  updateField("program_type", "iep");
                  updateField("therapy_category", null);
                  updateField("diagnosis", "IEP Special School");
                  updateField("profile", "IEP");
                }}
                className={`p-3.5 rounded-[10px] border-2 cursor-pointer transition-all ${
                  formData.program_type === "iep"
                    ? "bg-[#EEF4FB] border-[#185FA5] shadow-xs"
                    : "bg-white border-[#D3D1C7] hover:border-[#185FA5]/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <School className="h-5 w-5 text-[#185FA5]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#2C2C2A]">IEP – Special School</h4>
                    <p className="text-[10px] text-[#5F5E5A]">Special Education, 24-Section IEP &amp; 3-Month Cycle Reviews (Zero exercises)</p>
                  </div>
                </div>
              </div>

              <div
                onClick={() => {
                  updateField("program_type", "therapy");
                  updateField("therapy_category", formData.therapy_category || "ASD");
                  updateField("diagnosis", formData.therapy_category || "ASD");
                  updateField("profile", formData.therapy_category || "ASD");
                }}
                className={`p-3.5 rounded-[10px] border-2 cursor-pointer transition-all ${
                  formData.program_type === "therapy"
                    ? "bg-[#E1F5EE] border-[#0F6E56] shadow-xs"
                    : "bg-white border-[#D3D1C7] hover:border-[#0F6E56]/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="h-5 w-5 text-[#0F6E56]" />
                  <div>
                    <h4 className="text-xs font-bold text-[#2C2C2A]">Therapy Program</h4>
                    <p className="text-[10px] text-[#5F5E5A]">Clinical therapy, exercises &amp; category-specific interventions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* IF THERAPY: Category Selector */}
          {formData.program_type === "therapy" && (
            <div className="space-y-1.5 p-3.5 bg-[#F8F8F6] rounded-[8px] border border-[#D3D1C7]">
              <label className="block text-xs font-bold text-[#2C2C2A]">Therapy Category Pathway *</label>
              <select
                value={formData.therapy_category || "ASD"}
                onChange={(e) => {
                  updateField("therapy_category", e.target.value);
                  updateField("diagnosis", e.target.value);
                  updateField("profile", e.target.value);
                }}
                className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-semibold outline-none focus:border-[#185FA5]"
              >
                {THERAPY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} — {cat.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#D3D1C7]/60">
            <Input label="Child Full Name" required value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2C2C2A]">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => updateField("gender", e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input label="School / Center Name" value={formData.school} onChange={(e) => updateField("school", e.target.value)} />
            <Input label="Class / Grade" value={formData.class} onChange={(e) => updateField("class", e.target.value)} />
          </div>

          <Input label="Primary Concern / Focus" type="textarea" rows={2} value={formData.primaryConcern} onChange={(e) => updateField("primaryConcern", e.target.value)} />

          <div className="pt-4 border-t border-[#D3D1C7]/60 space-y-4">
            <h4 className="text-xs font-bold text-[#185FA5] uppercase">Parent Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Parent Name" value={formData.parentName} onChange={(e) => updateField("parentName", e.target.value)} />
              <Input label="Relationship" value={formData.relationship} onChange={(e) => updateField("relationship", e.target.value)} />
              <Input label="Phone Number" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
              <Input label="Email Address" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#D3D1C7]/60">
            <Button variant="outlined" onClick={() => navigate(`/children/${id}`)}>Cancel</Button>
            <Button type="submit" icon={Save} loading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
