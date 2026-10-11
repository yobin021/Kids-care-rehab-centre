"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import Button from "./Button";

export default function ErrorMessage({ error, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-[12px] p-6 text-center space-y-3 text-red-900 shadow-xs max-w-lg mx-auto my-4">
      <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
      <div className="space-y-1">
        <h4 className="text-sm font-bold">Could not load data. Check your connection.</h4>
        {error && <p className="text-[11px] text-red-700 font-mono font-medium">{error}</p>}
      </div>
      {onRetry && (
        <div className="pt-2">
          <Button
            variant="outlined"
            size="sm"
            icon={RotateCcw}
            className="border-red-300 text-red-800 hover:bg-red-100"
            onClick={onRetry}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
