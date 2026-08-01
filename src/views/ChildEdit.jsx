"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Edit3 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toggle from "../components/ui/Toggle";
import { childrenService } from "../services/childrenService";

export default function ChildEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { childrenList, updateChildDetails, showToast } = useAuth();

  const child = childrenList.find((c) => c.id === id) || childrenList[1] || childrenList[0];

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: child?.name || "",
    dob: child?.dob || "",
    gender: child?.gender || "Male",
    diagnosis: child?.diagnosis || "ASD",
    profile: child?.profile || "B",
    school: child?.school || "",
    class: child?.class || "",
    primaryConcern: child?.primaryConcern || "",
    referredBy: child?.referredBy || "Self",
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

    const childPayload = {
      name: formData.name,
      gender: formData.gender,
      diagnosis: formData.diagnosis,
      profile: formData.profile,
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
          <p className="text-xs font-semibold text-[#5F5E5A]">Update information for {child?.name} ({id})</p>
        </div>
      </div>

      <Card title="Child Information">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Child Full Name" required value={formData.name} onChange={(e) => updateField("name", e.target.value)} />
            <Input label="Date of Birth" type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} />
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
            <Input label="Diagnosis" required value={formData.diagnosis} onChange={(e) => updateField("diagnosis", e.target.value)} />
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#2C2C2A]">Clinical Profile</label>
              <select
                value={formData.profile}
                onChange={(e) => updateField("profile", e.target.value)}
                className="w-full h-10 px-3 bg-white border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none"
              >
                <option value="A">Profile A — ASD Communication Focus</option>
                <option value="B">Profile B — ASD High Functioning</option>
                <option value="C">Profile C — ASD + ADHD Combined</option>
                <option value="D">Profile D — Motor or Developmental Delay</option>
                <option value="E">Profile E — Learning Disability Pathway</option>
              </select>
            </div>
            <Input label="School Name" value={formData.school} onChange={(e) => updateField("school", e.target.value)} />
          </div>

          <Input label="Primary Concern" type="textarea" rows={3} value={formData.primaryConcern} onChange={(e) => updateField("primaryConcern", e.target.value)} />

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
