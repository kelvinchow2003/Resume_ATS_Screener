// src/components/upload/UploadZone.tsx
"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone, FileRejection } from "react-dropzone";

// ============================================================
// Types
// ============================================================

export interface UploadZoneSubmitPayload {
  file: File;
  jobDescription: string;
}

interface UploadZoneProps {
  /** Called when the user submits a valid file + JD */
  onSubmit: (payload: UploadZoneSubmitPayload) => void;
  /** Whether a submission is currently being processed */
  isLoading?: boolean;
}

type DropState = "idle" | "hover" | "accepted" | "rejected";

// ============================================================
// Helper: human-readable file size
// ============================================================
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

// ============================================================
// Sub-component: File Preview Strip
// ============================================================
interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

function FilePreview({ file, onRemove }: FilePreviewProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-950/30 backdrop-blur-sm">
      {/* PDF icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
        <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{file.name}</p>
        <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove file"
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center 
                   text-slate-400 hover:text-red-400 hover:bg-red-500/10 
                   transition-colors duration-150"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ============================================================
// Main Component: UploadZone
// ============================================================
export default function UploadZone({ onSubmit, isLoading = false }: UploadZoneProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [dropState, setDropState] = useState<DropState>("idle");
  const [fileError, setFileError] = useState<string | null>(null);
  const [jdError, setJdError] = useState<string | null>(null);

  const JD_MIN_LENGTH = 50;
  const JD_MAX_LENGTH = 8000;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  // ---- Dropzone configuration ----
  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      setFileError(null);

      if (rejections.length > 0) {
        const reason = rejections[0].errors[0];
        if (reason.code === "file-too-large") {
          setFileError(`File exceeds 5 MB limit (${formatBytes(rejections[0].file.size)}).`);
        } else if (reason.code === "file-invalid-type") {
          setFileError("Only PDF files are accepted.");
        } else {
          setFileError(reason.message);
        }
        setDropState("rejected");
        return;
      }

      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setDropState("accepted");
      }
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: MAX_FILE_SIZE,
    maxFiles: 1,
    multiple: false,
    disabled: isLoading,
    onDragEnter: () => setDropState("hover"),
    onDragLeave: () => setDropState(selectedFile ? "accepted" : "idle"),
  });

  // ---- Validation & Submit ----
  function handleSubmit() {
    let valid = true;

    if (!selectedFile) {
      setFileError("Please upload your resume PDF.");
      valid = false;
    }

    const trimmedJD = jobDescription.trim();
    if (trimmedJD.length < JD_MIN_LENGTH) {
      setJdError(`Job description must be at least ${JD_MIN_LENGTH} characters.`);
      valid = false;
    } else if (trimmedJD.length > JD_MAX_LENGTH) {
      setJdError(`Job description must not exceed ${JD_MAX_LENGTH} characters.`);
      valid = false;
    } else {
      setJdError(null);
    }

    if (valid && selectedFile) {
      onSubmit({ file: selectedFile, jobDescription: trimmedJD });
    }
  }

  // ---- Drop zone visual state ----
  const dropZoneStyles: Record<DropState, string> = {
    idle:     "border-slate-600 bg-slate-800/40 hover:border-slate-500 hover:bg-slate-800/60",
    hover:    "border-blue-400 bg-blue-950/40 scale-[1.01]",
    accepted: "border-emerald-500/60 bg-emerald-950/20",
    rejected: "border-red-500/60 bg-red-950/20",
  };

  const currentState: DropState = isDragActive ? "hover" : dropState;
  const canSubmit = !!selectedFile && jobDescription.trim().length >= JD_MIN_LENGTH && !isLoading;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 font-sans">

      {/* ---- Section 1: PDF Upload ---- */}
      <section>
        <label className="block text-sm font-semibold text-slate-300 mb-2 tracking-wide uppercase">
          Resume PDF
        </label>

        {/* Drop Zone */}
        {!selectedFile ? (
          <div
            {...getRootProps()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed p-10
              transition-all duration-200 ease-out outline-none
              ${dropZoneStyles[currentState]}
              ${isLoading ? "cursor-not-allowed opacity-60" : ""}
            `}
          >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center gap-3 text-center pointer-events-none">
              {/* Upload icon */}
              <div className={`
                w-14 h-14 rounded-2xl flex items-center justify-center
                transition-colors duration-200
                ${currentState === "hover" ? "bg-blue-500/20 text-blue-400" : "bg-slate-700/50 text-slate-400"}
              `}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div>
                <p className="text-base font-medium text-white">
                  {isDragActive ? "Drop it here" : "Drag & drop your resume"}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  or{" "}
                  <span className="text-blue-400 font-medium underline underline-offset-2">
                    browse files
                  </span>
                  {" "}— PDF only, max 5 MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <FilePreview
            file={selectedFile}
            onRemove={() => {
              setSelectedFile(null);
              setDropState("idle");
              setFileError(null);
            }}
          />
        )}

        {/* File error */}
        {fileError && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd" />
            </svg>
            {fileError}
          </p>
        )}
      </section>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-700" />
        <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">then</span>
        <div className="flex-1 h-px bg-slate-700" />
      </div>

      {/* ---- Section 2: Job Description ---- */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="job-description"
            className="block text-sm font-semibold text-slate-300 tracking-wide uppercase"
          >
            Target Job Description
          </label>
          <span className={`text-xs font-mono ${
            jobDescription.length > JD_MAX_LENGTH ? "text-red-400" : "text-slate-500"
          }`}>
            {jobDescription.length.toLocaleString()} / {JD_MAX_LENGTH.toLocaleString()}
          </span>
        </div>

        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => {
            setJobDescription(e.target.value);
            if (jdError) setJdError(null);
          }}
          disabled={isLoading}
          rows={9}
          placeholder={`Paste the full job description here…\n\nInclude the requirements, responsibilities, and preferred qualifications for the most accurate analysis.`}
          className={`
            w-full rounded-2xl border px-4 py-3 text-sm text-slate-200 placeholder-slate-500
            bg-slate-800/60 backdrop-blur-sm resize-none outline-none
            transition-all duration-200 leading-relaxed
            focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/60
            disabled:opacity-60 disabled:cursor-not-allowed
            ${jdError
              ? "border-red-500/60 bg-red-950/10"
              : "border-slate-600 hover:border-slate-500"
            }
          `}
        />

        {/* JD error */}
        {jdError && (
          <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd" />
            </svg>
            {jdError}
          </p>
        )}

        {/* Helper tip */}
        {!jdError && (
          <p className="mt-2 text-xs text-slate-500">
            Tip: Include the full posting — requirements, responsibilities, and preferred skills — for the most accurate analysis.
          </p>
        )}
      </section>

      {/* ---- Submit Button ---- */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit}
        aria-label="Analyze resume against job description"
        className={`
          w-full py-4 px-6 rounded-2xl font-semibold text-base tracking-wide
          transition-all duration-200 ease-out flex items-center justify-center gap-3
          ${canSubmit
            ? `bg-gradient-to-r from-blue-600 to-violet-600 text-white 
               hover:from-blue-500 hover:to-violet-500 hover:shadow-lg hover:shadow-blue-500/25
               active:scale-[0.98]`
            : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }
        `}
      >
        {isLoading ? (
          <>
            {/* Spinner */}
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Running 3 ATS Engines…
          </>
        ) : (
          <>
            {/* Scan icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Benchmark Against 3 ATS Engines
          </>
        )}
      </button>

      {/* Engine legend */}
      <div className="flex items-center justify-center gap-5 pt-1">
        {[
          { label: "Legacy ATS",     color: "bg-amber-500",  },
          { label: "Semantic ATS",   color: "bg-sky-500",    },
          { label: "AI Recruiter",   color: "bg-violet-500", },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}