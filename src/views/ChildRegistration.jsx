"use client";

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Edit3 } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Toggle from "../components/ui/Toggle";

export default function ChildRegistration() {
  const { addChild } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [successChild, setSuccessChild] = useState(null);

  const [childName, setChildName] = useState("");
  const [dob, setDob] = useState("2021-05-10");
  const [gender, setGender] = useState("Male");
  const [diagnosis, setDiagnosis] = useState("ASD");
  const [provisionalDiagnosis, setProvisionalDiagnosis] = useState("");
  const [school, setSchool] = useState("");
  const [schoolClass, setSchoolClass] = useState("");
  const [languages, setLanguages] = useState("Tamil, English");

  const [parentName, setParentName] = useState("");
  const [relationship, setRelationship] = useState("Father");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [referredBy, setReferredBy] = useState("Self");
  const [registeredDate, setRegisteredDate] = useState(new Date().toISOString().split("T")[0]);
  const [primaryConcern, setPrimaryConcern] = useState("");
  const [previousTherapy, setPreviousTherapy] = useState(false);
  const [previousTherapyDetails, setPreviousTherapyDetails] = useState("");
  const [schoolFeedback, setSchoolFeedback] = useState("");

  const [errors, setErrors] = useState({});

  const calculateAgeStr = (dobDate) => {
    if (!dobDate) return "";
    const birth = new Date(dobDate);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months > 0 ? months + "m" : ""}`.trim();
  };

  const validateStep = (currentStep) => {
    const errs = {};
    if (currentStep === 1) {
      if (!childName.trim()) errs.childName = "This field is required";
      if (!dob) errs.dob = "This field is required";
    } else if (currentStep === 2) {
      if (!parentName.trim()) errs.parentName = "This field is required";
      if (!relationship) errs.relationship = "This field is required";
      const cleanPhone = phone.trim().replace(/\D/g, "");
      if (!cleanPhone) {
        errs.phone = "This field is required";
      } else if (cleanPhone.length !== 10) {
        errs.phone = "Phone must be 10 digits";
      }
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        errs.email = "Valid email format required";
      }
    } else if (currentStep === 3) {
      if (!registeredDate) errs.registeredDate = "This field is required";
      if (!primaryConcern.trim()) errs.primaryConcern = "This field is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleSave = () => {
    const newChildObj = addChild({
      name: childName,
      dob,
      age: calculateAgeStr(dob) || "5y",
      gender,
      diagnosis: diagnosis || "Speech Delay",
      provisionalDiagnosis,
      profile: "B",
      school: school || "Not specified",
      class: schoolClass || "N/A",
      registeredDate,
      primaryConcern,
      referredBy,
      previousTherapy,
      previousTherapyDetails,
      parent: {
        name: parentName,
        relationship,
        phone,
        email,
        address,
        portalActive: false,
        portalPassword: ""
      },
      languages,
      schoolFeedback
    });

    setSuccessChild(newChildObj);
  };

  if (successChild) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-6">
        <div className="bg-white p-8 rounded-[16px] border border-[#D3D1C7] shadow-lg space-y-4">
          <div className="h-16 w-16 bg-[#3B6D11]/10 text-[#3B6D11] rounded-full flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="text-2xl font-extrabold text-[#2C2C2A]">Child Registered Successfully!</h2>
          <p className="text-sm font-bold text-[#185FA5] font-mono bg-[#185FA5]/10 py-2 px-4 rounded-full inline-block">
            Child ID: {successChild.id} has been assigned.
          </p>
          <p className="text-xs text-[#5F5E5A]">
            {successChild.name} is now registered in the system. You can set up parent portal access or view profile details.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[#D3D1C7]/60">
            <Button onClick={() => navigate(`/children/${successChild.id}`)}>
              View Child Profile
            </Button>
            <Button variant="outlined" onClick={() => { setSuccessChild(null); setStep(1); setChildName(""); setPhone(""); setParentName(""); }}>
              Register Another Child
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-[#2C2C2A] max-w-3xl mx-auto">
      <div className="flex items-center gap-3 border-b border-[#D3D1C7]/60 pb-4">
        <button
          onClick={() => navigate("/children")}
          className="p-2 rounded-[8px] border border-[#D3D1C7] bg-white hover:bg-slate-100 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#5F5E5A]" />
        </button>
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Register New Child</h2>
          <p className="text-xs font-semibold text-[#5F5E5A]">Follow the 4-step wizard to register a new child patient.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
          {[
            { num: 1, label: "Child Details" },
            { num: 2, label: "Parent Details" },
            { num: 3, label: "Referral Info" },
            { num: 4, label: "Review" }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`p-2 rounded-[8px] border transition-all ${
                step === s.num
                  ? "bg-[#185FA5] text-white border-[#185FA5]"
                  : step > s.num
                  ? "bg-[#3B6D11]/10 text-[#3B6D11] border-[#3B6D11]/40 cursor-pointer"
                  : "bg-[#F8F8F6] text-[#9B9A96] border-[#D3D1C7]/60"
              }`}
            >
              <span className="block text-[10px] uppercase">Step {s.num}</span>
              <span className="truncate block">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <Card title="Step 1 — Child Details">
          <div className="space-y-4">
            <Input
              label="Child's Full Name"
              required
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              placeholder="e.g. Lakshmanan A.R"
              error={errors.childName}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Date of Birth"
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  error={errors.dob}
                />
                {dob && (
                  <span className="text-xs font-bold text-[#185FA5] mt-1 block">
                    Calculated Age: {calculateAgeStr(dob)}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C2C2A] mb-2">
                  Gender <span className="text-[#993C1D]">*</span>
                </label>
                <div className="flex items-center gap-4">
                  {(["Male", "Female", "Other"]).map((g) => (
                    <label key={g} className="inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === g}
                        onChange={() => setGender(g)}
                        className="accent-[#185FA5]"
                      />
                      <span>{g}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Diagnosis / Condition"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. ASD, Speech Delay"
              />

              <Input
                label="Provisional Diagnosis"
                value={provisionalDiagnosis}
                onChange={(e) => setProvisionalDiagnosis(e.target.value)}
                placeholder="Provisional observations"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="School Name"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="Name of school"
              />

              <Input
                label="Class / Grade"
                value={schoolClass}
                onChange={(e) => setSchoolClass(e.target.value)}
                placeholder="e.g. LKG, UKG, Class 1"
              />
            </div>

            <Input
              label="Languages Spoken at Home"
              value={languages}
              onChange={(e) => setLanguages(e.target.value)}
              placeholder="e.g. Tamil, English"
            />

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext}>Next: Parent Details →</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="Step 2 — Parent / Guardian Details">
          <div className="space-y-4">
            <Input
              label="Parent / Guardian Name"
              required
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              placeholder="Full Name"
              error={errors.parentName}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C2C2A] mb-1">
                  Relationship to Child <span className="text-[#993C1D]">*</span>
                </label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full h-10 px-3 border border-[#D3D1C7] rounded-[8px] text-xs font-bold text-[#2C2C2A] bg-white outline-none focus:border-[#185FA5]"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                  <option value="Other">Other</option>
                </select>
                {errors.relationship && <p className="text-[11px] font-bold text-[#993C1D]">{errors.relationship}</p>}
              </div>

              <Input
                label="Phone Number / WhatsApp"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10 digit mobile number"
                error={errors.phone}
              />
            </div>

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="parent@email.com"
              helper="Used for parent portal access"
              error={errors.email}
            />

            <Input
              label="Address"
              type="textarea"
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full residential address"
            />

            <div className="flex items-center justify-between pt-4">
              <Button variant="outlined" onClick={() => setStep(1)}>← Back</Button>
              <Button onClick={handleNext}>Next: Referral Info →</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card title="Step 3 — Referral & Additional Info">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Referred By"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                placeholder="Self / Pediatrician"
              />

              <Input
                label="Date of Registration"
                type="date"
                required
                value={registeredDate}
                onChange={(e) => setRegisteredDate(e.target.value)}
                error={errors.registeredDate}
              />
            </div>

            <Input
              label="Primary Concern"
              type="textarea"
              rows={3}
              required
              value={primaryConcern}
              onChange={(e) => setPrimaryConcern(e.target.value)}
              placeholder="Developmental or behavioural concerns reported by parents"
              error={errors.primaryConcern}
            />

            <Toggle
              label="Previous Therapy Taken?"
              value={previousTherapy}
              onChange={setPreviousTherapy}
            />

            {previousTherapy && (
              <Input
                label="Specify Therapy Type & Duration"
                type="textarea"
                rows={2}
                value={previousTherapyDetails}
                onChange={(e) => setPreviousTherapyDetails(e.target.value)}
                placeholder="e.g. Speech therapy for 6 months"
              />
            )}

            <Input
              label="School Feedback"
              type="textarea"
              rows={2}
              value={schoolFeedback}
              onChange={(e) => setSchoolFeedback(e.target.value)}
              placeholder="Teacher feedback or classroom concerns"
            />

            <div className="flex items-center justify-between pt-4">
              <Button variant="outlined" onClick={() => setStep(2)}>← Back</Button>
              <Button onClick={handleNext}>Next: Review Summary →</Button>
            </div>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card title="Step 4 — Review Summary">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-1">
                <h4 className="text-xs font-bold text-[#185FA5] uppercase tracking-wider">Child Information</h4>
                <button onClick={() => setStep(1)} className="text-xs font-bold text-[#185FA5] hover:underline flex items-center gap-1">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-[#5F5E5A] block">Full Name:</span> <strong>{childName}</strong></div>
                <div><span className="text-[#5F5E5A] block">DOB / Age:</span> <strong>{dob} ({calculateAgeStr(dob)})</strong></div>
                <div><span className="text-[#5F5E5A] block">Gender:</span> <strong>{gender}</strong></div>
                <div><span className="text-[#5F5E5A] block">Diagnosis:</span> <strong>{diagnosis}</strong></div>
                <div><span className="text-[#5F5E5A] block">School:</span> <strong>{school || "N/A"}</strong></div>
                <div><span className="text-[#5F5E5A] block">Languages:</span> <strong>{languages}</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-1">
                <h4 className="text-xs font-bold text-[#185FA5] uppercase tracking-wider">Parent Details</h4>
                <button onClick={() => setStep(2)} className="text-xs font-bold text-[#185FA5] hover:underline flex items-center gap-1">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div><span className="text-[#5F5E5A] block">Parent Name:</span> <strong>{parentName}</strong></div>
                <div><span className="text-[#5F5E5A] block">Relationship:</span> <strong>{relationship}</strong></div>
                <div><span className="text-[#5F5E5A] block">Phone:</span> <strong className="font-mono">{phone}</strong></div>
                <div className="col-span-2"><span className="text-[#5F5E5A] block">Address:</span> <strong>{address || "N/A"}</strong></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#D3D1C7]/60 pb-1">
                <h4 className="text-xs font-bold text-[#185FA5] uppercase tracking-wider">Referral & Primary Concern</h4>
                <button onClick={() => setStep(3)} className="text-xs font-bold text-[#185FA5] hover:underline flex items-center gap-1">
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
              </div>

              <div className="text-xs space-y-2">
                <div><span className="text-[#5F5E5A] block">Primary Concern:</span> <p className="font-semibold bg-[#F8F8F6] p-2 rounded border">{primaryConcern}</p></div>
                <div><span className="text-[#5F5E5A] block">Previous Therapy:</span> <strong>{previousTherapy ? previousTherapyDetails : "No"}</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#D3D1C7]">
              <Button variant="outlined" onClick={() => setStep(3)}>← Back</Button>
              <Button onClick={handleSave} className="h-11 px-6">
                Save + Register Child
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
