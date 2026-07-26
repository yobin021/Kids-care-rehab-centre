"use client";

import React, { useState } from "react";
import { useDashboard, Therapist } from "@/context/DashboardContext";
import { Plus, Edit2, Mail, Phone, BarChart, Check, Smile, Star, MoreVertical } from "lucide-react";
import { Card, Badge, Dialog, Select, Progress } from "@/components/ui/ui";

export default function StaffManagementTab() {
  const { therapists, addTherapist, updateTherapist } = useDashboard();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState<Therapist | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("Occupational Therapist");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(5);

  const handleOpenAdd = () => {
    setName("");
    setSpecialization("Occupational Therapist");
    setEmail("");
    setPhone("");
    setMaxCapacity(5);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (t: Therapist) => {
    setEditingTherapist(t);
    setName(t.name);
    setSpecialization(t.specialization);
    setEmail(t.email);
    setPhone(t.phone);
    setMaxCapacity(t.maxCapacity);
    setIsEditOpen(true);
  };

  const submitAdd = () => {
    if (name && email && phone) {
      addTherapist({
        name,
        specialization: specialization as Therapist["specialization"],
        email,
        phone,
        whatsapp: phone,
        maxCapacity,
        status: "Active",
      });
      setIsAddOpen(false);
    }
  };

  const submitEdit = () => {
    if (editingTherapist && name && email && phone) {
      updateTherapist({
        ...editingTherapist,
        name,
        specialization: specialization as Therapist["specialization"],
        email,
        phone,
        whatsapp: phone,
        maxCapacity,
      });
      setIsEditOpen(false);
      setEditingTherapist(null);
    }
  };

  const getSpecializationBadgeColor = (spec: string) => {
    switch (spec) {
      case "Speech Therapist":
        return "info";
      case "Occupational Therapist":
        return "warning";
      case "Physiotherapist":
        return "success";
      default:
        return "primary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Clinical Staff Directory</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage therapists and monitor patient workload capacities.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700 flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Therapist
        </button>
      </div>

      {/* Grid of Therapists */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {therapists.map((therapist) => {
          const loadPercentage = (therapist.workload / therapist.maxCapacity) * 100;
          return (
            <Card key={therapist.id} className="flex flex-col justify-between border-slate-100 hover:border-blue-150">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 font-black text-blue-700 text-sm">
                      {therapist.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase leading-none">{therapist.id}</h4>
                      <h3 className="text-sm font-extrabold text-slate-800 mt-1.5 leading-none">{therapist.name}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => handleOpenEdit(therapist)}
                    className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-all"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Info tags */}
                <div className="space-y-2 pt-2 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Badge variant={getSpecializationBadgeColor(therapist.specialization)}>
                      {therapist.specialization}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-semibold">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span>{therapist.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-semibold">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    <span>{therapist.phone}</span>
                  </div>
                </div>

                {/* Workload Metric */}
                <div className="space-y-1.5 pt-3 border-t border-slate-50">
                  <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
                    <span>Patient Workload</span>
                    <span className="text-slate-700 font-extrabold">
                      {therapist.workload} / {therapist.maxCapacity} cases
                    </span>
                  </div>
                  <Progress value={therapist.workload} max={therapist.maxCapacity} />
                </div>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-100 text-[10px] font-semibold">
                <span className="text-slate-400">{therapist.activeSessionsPerWeek} sessions/wk scheduled</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                  {therapist.status}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Therapist Dialog Modal */}
      <Dialog isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Clinic Therapist" maxWidth="md">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
              placeholder="e.g. Dr. Preethi Sen"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialization</label>
            <Select
              value={specialization}
              onChange={setSpecialization}
              options={[
                { label: "Speech Therapist", value: "Speech Therapist" },
                { label: "Occupational Therapist", value: "Occupational Therapist" },
                { label: "Physiotherapist", value: "Physiotherapist" },
                { label: "Behavioral Therapist", value: "Behavioral Therapist" },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="name@kidscare.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="+91 99999 99999"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workload Capacity (Max Children)</label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(parseInt(e.target.value))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
              min={1}
              max={15}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsAddOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={submitAdd}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700"
            >
              Save Therapist
            </button>
          </div>
        </div>
      </Dialog>

      {/* Edit Therapist Dialog Modal */}
      <Dialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Therapist Details" maxWidth="md">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Specialization</label>
            <Select
              value={specialization}
              onChange={setSpecialization}
              options={[
                { label: "Speech Therapist", value: "Speech Therapist" },
                { label: "Occupational Therapist", value: "Occupational Therapist" },
                { label: "Physiotherapist", value: "Physiotherapist" },
                { label: "Behavioral Therapist", value: "Behavioral Therapist" },
              ]}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workload Capacity (Max Children)</label>
            <input
              type="number"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(parseInt(e.target.value))}
              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:outline-none"
              min={1}
              max={15}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => setIsEditOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={submitEdit}
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/10 hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
