"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Search, PlusCircle, Eye, FilePlus } from "lucide-react";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { childrenService } from "../services/childrenService";

export default function ChildrenList() {
  const { childrenList: contextChildren } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await childrenService.getAll();
      setData(result && result.length > 0 ? result : contextChildren);
    } catch (err) {
      console.warn("Children fetch error fallback:", err.message);
      // Fallback to local context if available, otherwise set error
      if (contextChildren && contextChildren.length > 0) {
        setData(contextChildren);
      } else {
        setError(err.message || "Failed to load children list.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const filteredChildren = useMemo(() => {
    const list = data || [];
    return list.filter((child) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        child.name.toLowerCase().includes(q) ||
        child.id.toLowerCase().includes(q) ||
        child.diagnosis.toLowerCase().includes(q);

      if (selectedFilter === "all") return matchesQuery;
      return matchesQuery && child.profile === selectedFilter;
    });
  }, [data, searchQuery, selectedFilter]);

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
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Children Registry</h2>
          <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">Manage registered children, profiles, and assessment records.</p>
        </div>

        <Button icon={PlusCircle} onClick={() => navigate("/children/new")}>
          + Register New Child
        </Button>
      </div>

      <Card padding="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Input
              placeholder="Search by name, ID, or diagnosis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="h-4 w-4 text-[#9B9A96] absolute left-3 top-3.5" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {["all", "A", "B", "C", "D", "E"].map((prof) => (
              <button
                key={prof}
                onClick={() => setSelectedFilter(prof)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === prof
                    ? "bg-[#185FA5] text-white shadow-xs"
                    : "bg-[#F8F8F6] text-[#5F5E5A] hover:bg-slate-200 border border-[#D3D1C7]"
                }`}
              >
                {prof === "all" ? "All Profiles" : `Profile ${prof}`}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* THREE STATES: LOADING, ERROR, DATA */}
      {loading ? (
        <SkeletonCard count={4} />
      ) : error ? (
        <ErrorMessage error={error} onRetry={fetchChildren} />
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-[12px] border border-[#D3D1C7] shadow-[0_1px_3px_rgba(0,0,0,0.08)] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F8F6] border-b border-[#D3D1C7] text-[#5F5E5A] uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-3">Child ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3">Diagnosis</th>
                  <th className="px-4 py-3">Profile</th>
                  <th className="px-4 py-3">Parent Name & Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3D1C7]/60 font-semibold">
                {filteredChildren.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-[#185FA5]">{c.id}</td>
                    <td className="px-4 py-3 font-bold text-[#2C2C2A]">{c.name}</td>
                    <td className="px-4 py-3 text-[#5F5E5A]">{c.age} / {c.gender}</td>
                    <td className="px-4 py-3"><Badge label={c.diagnosis} variant="gray" /></td>
                    <td className="px-4 py-3"><Badge label={`Profile ${c.profile}`} variant={getProfileVariant(c.profile)} /></td>
                    <td className="px-4 py-3 text-[#5F5E5A]">
                      <div>{c.parent?.name || c.parent_accounts?.parent_name || "Parent"}</div>
                      <div className="text-[10px] font-mono text-[#9B9A96]">{c.parent?.phone || c.parent_accounts?.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/children/${c.id}`)}>
                          View Profile
                        </Button>
                        <Button variant="outlined" size="sm" icon={FilePlus} onClick={() => navigate(`/assessment/new/${c.id}`)}>
                          + Assessment
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredChildren.map((c) => (
              <Card key={c.id} padding="p-4" className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#2C2C2A]">{c.name}</h3>
                    <span className="font-mono text-xs text-[#185FA5]">{c.id}</span>
                  </div>
                  <Badge label={`Profile ${c.profile}`} variant={getProfileVariant(c.profile)} />
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#D3D1C7]/60">
                  <Button variant="outlined" size="sm" fullWidth icon={Eye} onClick={() => navigate(`/children/${c.id}`)}>
                    View Profile
                  </Button>
                  <Button size="sm" fullWidth icon={FilePlus} onClick={() => navigate(`/assessment/new/${c.id}`)}>
                    + Assessment
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
