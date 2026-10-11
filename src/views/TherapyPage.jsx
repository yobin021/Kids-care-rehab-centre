"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  PlusCircle,
  Activity,
  ArrowRight,
  Sparkles,
  FileText,
  Filter,
  CheckCircle2,
  Brain,
  Zap,
  Clock,
  BookOpen
} from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Input from "../components/ui/Input";
import { SkeletonCard } from "../components/ui/Skeleton";
import { therapyService, THERAPY_CATEGORIES } from "../services/therapyService";
import { childAssignmentService } from "../services/childAssignmentService";
import { detectChildCategory } from "../utils/categoryHelpers";

const CATEGORY_ICONS = {
  ASD: Brain,
  ADHD: Zap,
  "Developmental Delay": Clock,
  "Learning Disability": BookOpen
};

export default function TherapyPage() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [children, setChildren] = useState([]);
  const [stats, setStats] = useState({ total: 0, ASD: 0, ADHD: 0, "Developmental Delay": 0, "Learning Disability": 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    loadTherapyData();
  }, [user, isAdmin]);

  const loadTherapyData = async () => {
    try {
      setLoading(true);
      const [list, countStats] = await Promise.all([
        therapyService.getTherapyChildren(),
        therapyService.getTherapyStats()
      ]);
      const accessibleList = (!user || user.role === "admin")
        ? (list || [])
        : childAssignmentService.filterChildrenForUser(list || [], user);
      setChildren(accessibleList);
      setStats(countStats || { total: 0, ASD: 0, ADHD: 0, "Developmental Delay": 0, "Learning Disability": 0 });
    } catch (err) {
      console.warn("TherapyPage load fallback:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredChildren = useMemo(() => {
    return children.filter((c) => {
      const matchesCat =
        selectedCategory === "All" ||
        (c.therapy_category || "ASD") === selectedCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !search ||
        c.name?.toLowerCase().includes(q) ||
        c.id?.toLowerCase().includes(q) ||
        c.therapy_category?.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [children, selectedCategory, search]);

  return (
    <div className="space-y-6 text-[#2C2C2A]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0F6E56]/10 via-[#185FA5]/5 to-transparent p-6 rounded-[12px] border border-[#0F6E56]/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#0F6E56] animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#0F6E56]">Therapy Management Hub</p>
          </div>
          <h1 className="text-2xl font-black text-[#2C2C2A] tracking-tight">Therapy Programs</h1>
          <p className="text-xs text-[#5F5E5A] font-semibold mt-1">
            Clinical therapy tracking &amp; targeted exercise programs across 4 specialized categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={PlusCircle}
            onClick={() => navigate(`/children/new?program=therapy${selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`)}
          >
            Register Therapy Child
          </Button>
        </div>
      </div>

      {/* ═══ 4 MAIN THERAPY CATEGORIES ═══ */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#5F5E5A]">Therapy Pathways</h2>
          {selectedCategory !== "All" && (
            <button
              onClick={() => setSelectedCategory("All")}
              className="text-xs font-bold text-[#185FA5] hover:underline cursor-pointer"
            >
              View All ({stats.total})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {THERAPY_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Activity;
            const count = stats[cat.id] || 0;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? "All" : cat.id)}
                className={`flex flex-col justify-between p-5 rounded-[12px] border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? `${cat.bg} border-2 shadow-sm scale-[1.02]`
                    : "bg-white border-[#D3D1C7] hover:border-[#185FA5]/60 hover:shadow-xs"
                }`}
                style={{ borderColor: isSelected ? cat.color : undefined }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="h-10 w-10 rounded-[10px] flex items-center justify-center shadow-2xs"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className="text-lg font-black font-mono px-2.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                    >
                      {count}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#2C2C2A]">{cat.name}</h3>
                    <p className="text-[11px] font-semibold text-[#5F5E5A] line-clamp-1">{cat.fullName}</p>
                  </div>

                  <p className="text-[11px] text-[#5F5E5A] leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#D3D1C7]/60 mt-3 flex items-center justify-between text-xs font-bold" style={{ color: cat.color }}>
                  <span>{isSelected ? "Active Filter" : "Filter Roster"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster Controls */}
      <Card padding="p-4" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#2C2C2A]">
              Therapy Students {selectedCategory !== "All" && `— ${selectedCategory}`}
            </h3>
            <span className="text-xs font-bold text-[#5F5E5A] bg-[#F8F8F6] px-2 py-0.5 rounded-full border border-[#D3D1C7]">
              {filteredChildren.length} {filteredChildren.length === 1 ? "child" : "children"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#5F5E5A]" />
              <input
                type="text"
                placeholder="Search therapy child..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-[#F8F8F6] border border-[#D3D1C7] rounded-[6px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#185FA5] focus:bg-white"
              />
            </div>
            {selectedCategory !== "All" && (
              <Button size="sm" variant="outlined" onClick={() => setSelectedCategory("All")}>
                Clear Filter
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && <SkeletonCard count={3} />}

        {/* Empty State */}
        {!loading && filteredChildren.length === 0 && (
          <div className="text-center py-10 space-y-3 bg-[#F8F8F6] rounded-[10px] border border-dashed border-[#D3D1C7]">
            <Users className="h-10 w-10 text-[#9B9A96] mx-auto" />
            <div>
              <p className="text-sm font-bold text-[#2C2C2A]">
                No therapy children found {selectedCategory !== "All" ? `in ${selectedCategory}` : ""}
              </p>
              <p className="text-xs text-[#5F5E5A] mt-0.5">
                Register a child under this therapy pathway to manage exercises and clinical reports.
              </p>
            </div>
            <Button
              size="sm"
              icon={PlusCircle}
              onClick={() => navigate(`/children/new?program=therapy${selectedCategory !== 'All' ? `&category=${encodeURIComponent(selectedCategory)}` : ''}`)}
            >
              Register Child in {selectedCategory !== "All" ? selectedCategory : "Therapy"}
            </Button>
          </div>
        )}

        {/* Children Roster Grid */}
        {!loading && filteredChildren.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredChildren.map((c) => {
              const catObj = THERAPY_CATEGORIES.find((cat) => cat.id === c.therapy_category) || THERAPY_CATEGORIES[0];
              const Icon = CATEGORY_ICONS[catObj.id] || Activity;

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/children/${c.id}`)}
                  className="bg-white p-4 rounded-[10px] border border-[#D3D1C7] hover:border-[#185FA5] transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-[#2C2C2A]">{c.name}</h4>
                        <span className="font-mono text-[10px] text-[#5F5E5A] font-semibold">{c.id}</span>
                      </div>
                      <Badge label={c.therapy_category || "ASD"} variant={catObj.badge || "blue"} size="sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#F8F8F6] p-2 rounded-[6px]">
                      <div>
                        <span className="text-[#5F5E5A] font-semibold">Age / Gender:</span>
                        <p className="font-bold text-[#2C2C2A]">{c.age || "—"} · {c.gender || "—"}</p>
                      </div>
                      <div>
                        <span className="text-[#5F5E5A] font-semibold">Parent:</span>
                        <p className="font-bold text-[#2C2C2A] truncate">{c.parent?.name || "—"}</p>
                      </div>
                    </div>

                    {c.primary_concern && (
                      <p className="text-[11px] text-[#5F5E5A] line-clamp-1 italic">
                        Concern: {c.primary_concern}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#D3D1C7]/60 flex items-center justify-between gap-1.5 flex-wrap">
                    {(() => {
                      const childCat = detectChildCategory(c);
                      const CatIcon = childCat.icon || Activity;
                      return (
                        <Button
                          size="sm"
                          variant="primary"
                          icon={CatIcon}
                          className="text-[11px] px-2.5 py-1 text-white shadow-2xs font-semibold"
                          style={{ backgroundColor: childCat.color }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(childCat.assessmentRoute);
                          }}
                        >
                          {childCat.assessmentBtnShort}
                        </Button>
                      );
                    })()}
                    <Button
                      size="sm"
                      variant="outlined"
                      icon={Activity}
                      className="text-[11px] px-2.5 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/children/${c.id}?tab=exercises`);
                      }}
                    >
                      Exercises
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      icon={FileText}
                      className="text-[11px] px-2.5 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/reports/new/${c.id}`);
                      }}
                    >
                      Report
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
