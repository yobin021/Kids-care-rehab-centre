"use client";

import React from "react";

/**
 * COMPONENT A — 0 to 3 Rating Row
 */
export function RatingRow0to3({
  label,
  value,
  onChange,
  remarks,
  onRemarksChange,
  showRemarks = true
}) {
  const options = [
    { num: 0, label: "0 - Not Developed", color: "bg-red-600 text-white" },
    { num: 1, label: "1 - Emerging", color: "bg-amber-600 text-white" },
    { num: 2, label: "2 - Partial Support", color: "bg-yellow-500 text-white" },
    { num: 3, label: "3 - Independent", color: "bg-emerald-600 text-white" }
  ];

  return (
    <tr className="border-b border-[#E8E6DF] hover:bg-[#F9F9F8] transition-colors">
      <td className="py-2.5 px-3 text-xs font-semibold text-[#2C2C2A]">{label}</td>
      {[0, 1, 2, 3].map((score) => (
        <td key={score} className="py-2.5 px-2 text-center w-12">
          <input
            type="radio"
            name={`rating-${label.replace(/\s+/g, "_")}`}
            checked={value === score}
            onChange={() => onChange(score)}
            className="h-4 w-4 text-[#185FA5] focus:ring-[#185FA5] cursor-pointer accent-[#185FA5]"
          />
        </td>
      ))}
      {showRemarks && (
        <td className="py-2.5 px-3">
          <input
            type="text"
            value={remarks || ""}
            onChange={(e) => onRemarksChange && onRemarksChange(e.target.value)}
            placeholder="Remarks..."
            className="w-full h-7 px-2 border border-[#D3D1C7] rounded-[4px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#185FA5]"
          />
        </td>
      )}
    </tr>
  );
}

/**
 * COMPONENT: IEP Rating Table (Columns: Skill Area | 0 | 1 | 2 | 3 | Remarks)
 */
export function IepRatingTable({ items = [], values = {}, remarks = {}, onRatingChange, onRemarksChange }) {
  return (
    <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px] bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F0F4F8] border-b border-[#D3D1C7] text-[#185FA5] font-bold">
            <th className="py-2.5 px-3">Skill Area</th>
            <th className="py-2.5 px-2 text-center w-12" title="0 – Not Developed">0</th>
            <th className="py-2.5 px-2 text-center w-12" title="1 – Emerging / With Full Support">1</th>
            <th className="py-2.5 px-2 text-center w-12" title="2 – With Partial Support">2</th>
            <th className="py-2.5 px-2 text-center w-12" title="3 – Independent / Age Appropriate">3</th>
            <th className="py-2.5 px-3 min-w-[140px]">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const key = item.key;
            const label = item.label;
            return (
              <RatingRow0to3
                key={key}
                label={label}
                value={values[key] ?? 0}
                onChange={(score) => onRatingChange(key, score)}
                remarks={remarks[key] || ""}
                onRemarksChange={(text) => onRemarksChange(key, text)}
                showRemarks={true}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * COMPONENT: Milestones Table (Columns: Area | Achieved on Time | Delayed | Remarks)
 */
export function MilestoneTable({ items = [], values = {}, onStatusChange, onRemarksChange }) {
  return (
    <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px] bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F0F4F8] border-b border-[#D3D1C7] text-[#185FA5] font-bold">
            <th className="py-2.5 px-3">Area</th>
            <th className="py-2.5 px-2 text-center w-36">Achieved on Time</th>
            <th className="py-2.5 px-2 text-center w-28">Delayed</th>
            <th className="py-2.5 px-3 min-w-[140px]">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const key = item.key;
            const label = item.label;
            const current = values[key] || { status: "ontime", remarks: "" };
            return (
              <tr key={key} className="border-b border-[#E8E6DF] hover:bg-[#F9F9F8] transition-colors">
                <td className="py-2.5 px-3 text-xs font-semibold text-[#2C2C2A]">{label}</td>
                <td className="py-2.5 px-2 text-center">
                  <input
                    type="radio"
                    name={`milestone-${key}`}
                    checked={current.status === "ontime"}
                    onChange={() => onStatusChange(key, "ontime")}
                    className="h-4 w-4 text-[#185FA5] focus:ring-[#185FA5] cursor-pointer accent-[#185FA5]"
                  />
                </td>
                <td className="py-2.5 px-2 text-center">
                  <input
                    type="radio"
                    name={`milestone-${key}`}
                    checked={current.status === "delayed"}
                    onChange={() => onStatusChange(key, "delayed")}
                    className="h-4 w-4 text-[#185FA5] focus:ring-[#185FA5] cursor-pointer accent-[#185FA5]"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    value={current.remarks || ""}
                    onChange={(e) => onRemarksChange(key, e.target.value)}
                    placeholder="Remarks..."
                    className="w-full h-7 px-2 border border-[#D3D1C7] rounded-[4px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#185FA5]"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * COMPONENT: Behaviour Table (Columns: Behaviour / Area | Present | Not Present | Frequency / Remarks)
 */
export function BehaviourTable({ items = [], values = {}, onPresenceChange, onRemarksChange }) {
  return (
    <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px] bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F0F4F8] border-b border-[#D3D1C7] text-[#185FA5] font-bold">
            <th className="py-2.5 px-3">Behaviour / Area</th>
            <th className="py-2.5 px-2 text-center w-28">Present</th>
            <th className="py-2.5 px-2 text-center w-28">Not Present</th>
            <th className="py-2.5 px-3 min-w-[160px]">Frequency / Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const key = item.key;
            const label = item.label;
            const current = values[key] || { present: false, remarks: "" };
            return (
              <tr key={key} className="border-b border-[#E8E6DF] hover:bg-[#F9F9F8] transition-colors">
                <td className="py-2.5 px-3 text-xs font-semibold text-[#2C2C2A]">{label}</td>
                <td className="py-2.5 px-2 text-center">
                  <input
                    type="radio"
                    name={`behaviour-${key}`}
                    checked={current.present === true}
                    onChange={() => onPresenceChange(key, true)}
                    className="h-4 w-4 text-[#185FA5] focus:ring-[#185FA5] cursor-pointer accent-[#185FA5]"
                  />
                </td>
                <td className="py-2.5 px-2 text-center">
                  <input
                    type="radio"
                    name={`behaviour-${key}`}
                    checked={current.present === false}
                    onChange={() => onPresenceChange(key, false)}
                    className="h-4 w-4 text-[#185FA5] focus:ring-[#185FA5] cursor-pointer accent-[#185FA5]"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    value={current.remarks || ""}
                    onChange={(e) => onRemarksChange(key, e.target.value)}
                    placeholder="Frequency / Remarks..."
                    className="w-full h-7 px-2 border border-[#D3D1C7] rounded-[4px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#185FA5]"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * COMPONENT: Sensory Table (Columns: Sensory Area | Over Responsive | Under Responsive | Seeking | Remarks)
 */
export function SensoryTable({ items = [], values = {}, onResponseChange, onRemarksChange }) {
  return (
    <div className="overflow-x-auto border border-[#D3D1C7] rounded-[8px] bg-white shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-[#F0F4F8] border-b border-[#D3D1C7] text-[#185FA5] font-bold">
            <th className="py-2.5 px-3">Sensory Area</th>
            <th className="py-2.5 px-2 text-center w-36">Over Responsive</th>
            <th className="py-2.5 px-2 text-center w-36">Under Responsive</th>
            <th className="py-2.5 px-2 text-center w-28">Seeking</th>
            <th className="py-2.5 px-3 min-w-[140px]">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const key = item.key;
            const label = item.label;
            const current = values[key] || { response: "", remarks: "" };
            return (
              <tr key={key} className="border-b border-[#E8E6DF] hover:bg-[#F9F9F8] transition-colors">
                <td className="py-2.5 px-3 text-xs font-semibold text-[#2C2C2A]">{label}</td>
                <td className="py-2.5 px-2 text-center">
                  <input
                    type="radio"
                    name={`sensory-${key}`}
                    checked={current.response === "over"}
                    onChange={() => onResponseChange(key, "over")}
                    className="h-4 w-4 text-[#185FA5] focus:ring-[#185FA5] cursor-pointer accent-[#185FA5]"
                  />
                </td>
                <td className="py-2.5 px-2 text-center">
                  <input
                    type="radio"
                    name={`sensory-${key}`}
                    checked={current.response === "under"}
                    onChange={() => onResponseChange(key, "under")}
                    className="h-4 w-4 text-[#185FA5] focus:ring-[#185FA5] cursor-pointer accent-[#185FA5]"
                  />
                </td>
                <td className="py-2.5 px-2 text-center">
                  <input
                    type="radio"
                    name={`sensory-${key}`}
                    checked={current.response === "seeking"}
                    onChange={() => onResponseChange(key, "seeking")}
                    className="h-4 w-4 text-[#185FA5] focus:ring-[#185FA5] cursor-pointer accent-[#185FA5]"
                  />
                </td>
                <td className="py-2.5 px-3">
                  <input
                    type="text"
                    value={current.remarks || ""}
                    onChange={(e) => onRemarksChange(key, e.target.value)}
                    placeholder="Remarks..."
                    className="w-full h-7 px-2 border border-[#D3D1C7] rounded-[4px] text-xs font-medium text-[#2C2C2A] outline-none focus:border-[#185FA5]"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * COMPONENT: Checkbox Grid
 */
export function CheckboxGrid({
  label,
  options = [],
  value = [],
  onChange,
  cols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
}) {
  const isChecked = (opt) => Array.isArray(value) && value.includes(opt);

  const handleToggle = (opt) => {
    const arr = Array.isArray(value) ? [...value] : [];
    if (arr.includes(opt)) {
      onChange(arr.filter((item) => item !== opt));
    } else {
      onChange([...arr, opt]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-[#2C2C2A]">{label}</label>}
      <div className={`grid ${cols} gap-2.5 bg-[#F8F8F6] p-3.5 rounded-[8px] border border-[#D3D1C7]/80`}>
        {options.map((opt) => {
          const checked = isChecked(opt);
          return (
            <label
              key={opt}
              className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2C2C2A] select-none hover:text-[#185FA5] transition-colors"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(opt)}
                className="h-4 w-4 rounded border-[#D3D1C7] text-[#185FA5] focus:ring-[#185FA5] accent-[#185FA5]"
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
