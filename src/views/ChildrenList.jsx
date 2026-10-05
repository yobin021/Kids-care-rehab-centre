"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  PlusCircle,
  Eye,
  FilePlus,
  Filter,
  CheckCircle2,
  School,
  Activity
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Badge from "../components/ui/Badge";
import { SkeletonCard } from "../components/ui/Skeleton";
import ErrorMessage from "../components/ui/ErrorMessage";
import { childrenService } from "../services/childrenService";
import { THERAPY_CATEGORIES } from "../services/therapyService";
import { detectChildCategory } from "../utils/categoryHelpers";

export default function ChildrenList() {
  const navigate = useNavigate();
  const { childrenList } = useAuth();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const fetchChildren = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await childrenService.getAll();
      if (res && res.length > 0) {
        setData(res);
      } else {
        setData(childrenList || []);
      }
    } catch (err) {
      console.warn("Using local fallback children:", err.message);
      setData(childrenList || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [childrenList]);

  const filteredChildren = useMemo(() => {
    const list = data.length > 0 ? data : childrenList;
    return list.filter((child) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        child.name?.toLowerCase().includes(q) ||
        child.id?.toLowerCase().includes(q) ||
        child.school?.toLowerCase().includes(q) ||
        child.therapy_category?.toLowerCase().includes(q);

      if (selectedFilter === "all") return matchesQuery;
      if (selectedFilter === "iep") return matchesQuery && child.program_type === "iep";
      return matchesQuery && child.program_type === "therapy" && child.therapy_category === selectedFilter;
    });
  }, [data, childrenList, searchQuery, selectedFilter]);

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-bold text-[#2C2C2A]">Children &amp; Students Registry</h2>
          <p className="text-xs font-semibold text-[#5F5E5A] mt-0.5">
            Complete roster across IEP Special School and Specialized Therapy pathways.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button icon={PlusCircle} onClick={() => navigate("/children/new")}>
            Register New Child
          </Button>
        </div>
      </div>

      <Card padding="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Input
              placeholder="Search by name, ID, or school..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            <Search className="h-4 w-4 text-[#9B9A96] absolute left-3 top-3.5" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Students" },
              { id: "iep", label: "IEP (Special School)" },
              { id: "ASD", label: "Therapy: ASD" },
              { id: "ADHD", label: "Therapy: ADHD" },
              { id: "Developmental Delay", label: "Therapy: Dev Delay" },
              { id: "Learning Disability", label: "Therapy: Learning Dis." }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === f.id
                    ? "bg-[#185FA5] text-white shadow-xs"
                    : "bg-[#F8F8F6] text-[#5F5E5A] hover:bg-slate-200 border border-[#D3D1C7]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Roster Table */}
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
                  <th className="px-4 py-3">Program Pathway</th>
                  <th className="px-4 py-3">Parent Name &amp; Phone</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3D1C7]/60 font-semibold">
                {filteredChildren.map((c) => {
                  const isIep = c.program_type === "iep";

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-[#185FA5]">{c.id}</td>
                      <td className="px-4 py-3 font-bold text-[#2C2C2A]">{c.name}</td>
                      <td className="px-4 py-3 text-[#5F5E5A]">{c.age || "—"} / {c.gender || "—"}</td>
                      <td className="px-4 py-3">
                        {isIep ? (
                          <Badge label="IEP Special School" variant="blue" size="sm" />
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Badge label={c.therapy_category || "ASD"} variant="green" size="sm" />
                            <span className="text-[10px] text-[#5F5E5A] font-semibold">Therapy</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#5F5E5A]">
                        <div>{c.parent?.name || "Parent"}</div>
                        <div className="text-[10px] font-mono text-[#9B9A96]">{c.parent?.phone || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {(() => {
                          const childCat = detectChildCategory(c);
                          return (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/children/${c.id}`)}>
                                Profile
                              </Button>
                              <Button variant="outlined" size="sm" icon={FilePlus} onClick={() => navigate(childCat.assessmentRoute)}>
                                + Assessment
                              </Button>
                              {!childCat.isIep && (
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/reports/new/${c.id}`)}>
                                  + Report
                                </Button>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredChildren.map((c) => {
              const childCat = detectChildCategory(c);
              return (
                <Card key={c.id} padding="p-4" className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-[#2C2C2A]">{c.name}</h3>
                      <span className="font-mono text-xs text-[#185FA5]">{c.id}</span>
                    </div>
                    {childCat.isIep ? (
                      <Badge label="IEP Special School" variant="blue" size="sm" />
                    ) : (
                      <Badge label={childCat.categoryLabel} variant={childCat.badgeVariant} size="sm" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#D3D1C7]/60">
                    <Button variant="outlined" size="sm" fullWidth icon={Eye} onClick={() => navigate(`/children/${c.id}`)}>
                      Profile
                    </Button>
                    <Button
                      size="sm"
                      fullWidth
                      icon={FilePlus}
                      onClick={() => navigate(childCat.assessmentRoute)}
                    >
                      + Assessment
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
