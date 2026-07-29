"use client";

import React, { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, PlusCircle, Eye, FilePlus } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";

export default function ChildrenList() {
  const { childrenList } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeProfile, setActiveProfile] = useState("All");

  const filteredChildren = useMemo(() => {
    return childrenList.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchProfile = activeProfile === "All" || c.profile === activeProfile;

      return matchSearch && matchProfile;
    });
  }, [childrenList, searchTerm, activeProfile]);

  const getProfileVariant = (profile) => {
    switch (profile) {
      case "A": return "purple";
      case "B": return "blue";
      case "C": return "amber";
      case "D": return "teal";
      case "E": return "coral";
      default: return "blue";
    }
  };

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Children & Reports</h2>
          <Badge label={`${childrenList.length} children`} variant="blue" size="md" />
        </div>

        <Button icon={PlusCircle} onClick={() => navigate("/children/new")}>
          + Register New Child
        </Button>
      </div>

      <div className="bg-white p-4 rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 absolute left-3 top-3 text-[#9B9A96]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or child ID"
            className="w-full h-10 pl-9 pr-3 border border-[#D3D1C7] rounded-[8px] text-xs font-medium outline-none focus:border-[#185FA5]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {["All", "A", "B", "C", "D", "E"].map((p) => {
            const label = p === "All" ? "All" : `Profile ${p}`;
            const isSelected = activeProfile === (p === "All" ? "All" : p);

            return (
              <button
                key={p}
                onClick={() => setActiveProfile(p === "All" ? "All" : p)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-[#185FA5] text-white shadow-xs"
                    : "bg-[#F8F8F6] text-[#5F5E5A] hover:bg-slate-200 border border-[#D3D1C7]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredChildren.length > 0 ? (
        <div className="bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#5F5E5A]">
                  <th className="p-3.5 font-bold">Child ID</th>
                  <th className="p-3.5 font-bold">Name</th>
                  <th className="p-3.5 font-bold">Age</th>
                  <th className="p-3.5 font-bold">Diagnosis</th>
                  <th className="p-3.5 font-bold">Profile</th>
                  <th className="p-3.5 font-bold">Reports</th>
                  <th className="p-3.5 font-bold">Registered</th>
                  <th className="p-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredChildren.map((c, index) => (
                  <tr
                    key={c.id}
                    className={`border-b border-[#D3D1C7]/40 hover:bg-slate-50 transition-colors ${
                      index % 2 === 1 ? "bg-[#F8F8F6]" : "bg-white"
                    }`}
                  >
                    <td className="p-3.5 font-mono text-[#9B9A96]">{c.id}</td>
                    <td className="p-3.5 font-bold text-[#2C2C2A]">{c.name}</td>
                    <td className="p-3.5 font-medium text-[#5F5E5A]">{c.age}</td>
                    <td className="p-3.5 font-semibold text-[#2C2C2A]">{c.diagnosis}</td>
                    <td className="p-3.5">
                      <Badge label={`Profile ${c.profile}`} variant={getProfileVariant(c.profile)} />
                    </td>
                    <td className="p-3.5">
                      {c.reportsCount > 0 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3B6D11]/10 text-[#3B6D11]">
                          {c.reportsCount} report{c.reportsCount > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#9B9A96]">None</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[#5F5E5A]">{c.registeredDate}</td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      <Button
                        variant="outlined"
                        size="sm"
                        icon={Eye}
                        onClick={() => navigate(`/children/${c.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={FilePlus}
                        onClick={() => navigate(`/children/${c.id}`)}
                      >
                        + Assessment
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="block md:hidden divide-y divide-[#D3D1C7]/60">
            {filteredChildren.map((c) => (
              <div key={c.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#2C2C2A]">{c.name}</h4>
                  <Badge label={`Profile ${c.profile}`} variant={getProfileVariant(c.profile)} size="sm" />
                </div>

                <div className="flex items-center justify-between text-xs text-[#5F5E5A]">
                  <span className="font-mono text-[#9B9A96]">{c.id}</span>
                  <span>{c.age} • {c.diagnosis}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#9B9A96] pt-1">
                  <span>Registered: {c.registeredDate}</span>
                  <span>Reports: {c.reportsCount}</span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button
                    variant="outlined"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/children/${c.id}`)}
                  >
                    View Profile
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    fullWidth
                    onClick={() => navigate(`/children/${c.id}`)}
                  >
                    + Assessment
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="No children match your search."
          description="Try a different name or child ID."
          action={
            <Button variant="outlined" onClick={() => { setSearchTerm(""); setActiveProfile("All"); }}>
              Clear Search
            </Button>
          }
        />
      )}
    </div>
  );
}
