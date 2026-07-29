"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function ChildEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { childrenList, updateChildDetails, showToast } = useAuth();

  const child = childrenList.find((c) => c.id === id) || childrenList[1];

  const [childName, setChildName] = useState(child?.name || "");
  const [dob, setDob] = useState(child?.dob || "2021-01-15");
  const [gender, setGender] = useState(child?.gender || "Male");
  const [diagnosis, setDiagnosis] = useState(child?.diagnosis || "ASD");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState(child?.provisionalDiagnosis || "");
  const [school, setSchool] = useState(child?.school || "");
  const [schoolClass, setSchoolClass] = useState(child?.class || "");
  const [languages, setLanguages] = useState(child?.languages || "Tamil, English");

  const [parentName, setParentName] = useState(child?.parent?.name || "");
  const [relationship, setRelationship] = useState(child?.parent?.relationship || "Father");
  const [phone, setPhone] = useState(child?.parent?.phone || "");
  const [email, setEmail] = useState(child?.parent?.email || "");
  const [address, setAddress] = useState(child?.parent?.address || "");

  const [referredBy, setReferredBy] = useState(child?.referredBy || "Self");
  const [registeredDate, setRegisteredDate] = useState(child?.registeredDate || "2022-07-27");
  const [primaryConcern, setPrimaryConcern] = useState(child?.primaryConcern || "");
  const [previousTherapy, setPreviousTherapy] = useState(!!child?.previousTherapy);
  const [previousTherapyDetails, setPreviousTherapyDetails] = useState(child?.previousTherapyDetails || "");
  const [schoolFeedback, setSchoolFeedback] = useState(child?.schoolFeedback || "");

  useEffect(() => {
    if (child) {
      setChildName(child.name);
      setDob(child.dob);
      setGender(child.gender);
      setDiagnosis(child.diagnosis);
      setProvisionalDiagnosis(child.provisionalDiagnosis || "");
      setSchool(child.school);
      setSchoolClass(child.class || "");
      setLanguages(child.languages);
      setParentName(child.parent?.name || "");
      setRelationship(child.parent?.relationship || "Father");
      setPhone(child.parent?.phone || "");
      setEmail(child.parent?.email || "");
      setAddress(child.parent?.address || "");
      setReferredBy(child.referredBy);
      setRegisteredDate(child.registeredDate);
      setPrimaryConcern(child.primaryConcern);
      setPreviousTherapy(!!child.previousTherapy);
      setPreviousTherapyDetails(child.previousTherapyDetails || "");
      setSchoolFeedback(child.schoolFeedback || "");
    }
  }, [child]);

  const handleSave = (e) => {
    e.preventDefault();
    updateChildDetails(child.id, {
      name: childName,
      dob,
      gender,
      diagnosis,
      provisionalDiagnosis,
      school,
      class: schoolClass,
      languages,
      primaryConcern,
      referredBy,
      previousTherapy,
      previousTherapyDetails,
      schoolFeedback,
      parent: {
        ...child.parent,
        name: parentName,
        relationship,
        phone,
        email,
        address
      }
    });

    showToast("Child details updated.");
    navigate(`/children/${child.id}`);
  };

  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-[#D3D1C7]/60 pb-4">
        <button
          onClick={() => navigate(`/children/${child.id}`)}
          className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
        </button>
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">
            Edit — <span className="text-[#185FA5]">{child.name}</span> | <span className="font-mono text-[#9B9A96]">{child.id}</span>
          </h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Update child profile details and parent contact information.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card title="Child & Parent Information">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Child Full Name"
                required
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
              />
              <Input
                label="Date of Birth"
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
              <Input
                label="School Name"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Parent Name"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
              />
              <Input
                label="Phone Number"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <Input
              label="Primary Concern"
              type="textarea"
              rows={3}
              value={primaryConcern}
              onChange={(e) => setPrimaryConcern(e.target.value)}
            />

            <Input
              label="Address"
              type="textarea"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D3D1C7]">
              <Button variant="outlined" onClick={() => navigate(`/children/${child.id}`)}>
                Cancel
              </Button>
              <Button type="submit" icon={Save}>
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
