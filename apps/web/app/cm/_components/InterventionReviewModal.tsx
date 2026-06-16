"use client";

import React from "react";
import { X, Building2 } from "lucide-react";
import { Intervention } from "./cm-types";

export interface InterventionReviewModalProps {
  intervention: Intervention | null;
  onClose: () => void;
  onMarkReviewed: (item: Intervention) => void;
}

export const InterventionReviewModal: React.FC<InterventionReviewModalProps> = ({
  intervention,
  onClose,
  onMarkReviewed,
}) => {
  if (!intervention) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex flex-col max-h-[90vh]">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
          <div>
            <span
              className={`px-2 py-0.5 text-[8px] font-black rounded uppercase ${
                intervention.severity === "critical"
                  ? "bg-red-100 text-red-700 dark:bg-red-950/40"
                  : "bg-orange-100 text-orange-700 dark:bg-orange-950/40"
              }`}
            >
              {intervention.severity}
            </span>
            <h3 className="text-base font-bold text-slate-800 dark:text-white mt-1.5 leading-snug">
              {intervention.title}
            </h3>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5">
              {intervention.ward ? `${intervention.ward}` : intervention.locality}
              {intervention.zone ? ` • ${intervention.zone}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 dark:hover:bg-zinc-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Status Overview</h4>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Pending Action</span>
              </div>
              <span className="text-xs text-slate-400">|</span>
              <span className="text-xs text-slate-500 font-semibold">Active for: {intervention.time}</span>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Assigned Departments</h4>
            <div className="flex gap-2">
              {intervention.departments.map((dept, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-slate-100 rounded-md text-xs font-bold text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 flex items-center gap-1"
                >
                  <Building2 size={11} /> {dept}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Issue Details</h4>
            <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-semibold">
              {intervention.description}
            </p>
          </div>
        </div>

        <div className="flex gap-3 border-t border-slate-100 pt-3 dark:border-zinc-800 shrink-0">
          <button
            className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors animate-pulse"
            onClick={() => onMarkReviewed(intervention)}
          >
            Mark Reviewed
          </button>
        </div>
      </div>
    </div>
  );
};
