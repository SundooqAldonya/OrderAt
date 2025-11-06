import React, { useEffect, useState } from "react";
import "./TimeRangeModal.css";

export default function TimeRangeModal({
  isOpen,
  onClose,
  onConfirm,
  initialFrom = "",
  initialTo = "",
  title = "Select time range",
  minGapMinutes = 0,
  allowAcrossMidnight = false,
}) {
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFrom(initialFrom || "");
      setTo(initialTo || "");
      setError("");
    }
  }, [isOpen, initialFrom, initialTo]);

  const parseMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [h, m] = timeStr.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  const validate = () => {
    setError("");
    const fromMin = parseMinutes(from);
    const toMin = parseMinutes(to);

    if (fromMin === null || toMin === null) {
      setError("Please provide both start and end times.");
      return false;
    }

    if (!allowAcrossMidnight && toMin <= fromMin) {
      setError("End time must be after start time.");
      return false;
    }

    if (minGapMinutes > 0) {
      let gap = toMin - fromMin;
      if (allowAcrossMidnight && gap <= 0) gap = toMin + 24 * 60 - fromMin;
      if (gap < minGapMinutes) {
        setError(`Please choose a range of at least ${minGapMinutes} minutes.`);
        return false;
      }
    }

    return true;
  };

  const handleConfirm = () => {
    if (!validate()) return;
    onConfirm && onConfirm({ from, to });
    onClose && onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="trm-overlay">
      <div className="trm-modal">
        <div className="trm-header">
          <h3>{title}</h3>
          <button className="trm-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="trm-body">
          <div className="trm-row">
            <label>
              <span>From</span>
              <input
                type="time"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
            </label>

            <label>
              <span>To</span>
              <input
                type="time"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </label>
          </div>

          <div className="trm-presets">
            <button
              onClick={() => {
                const now = new Date();
                const fromStr = now.toTimeString().slice(0, 5);
                const plus1 = new Date(now.getTime() + 60 * 60 * 1000);
                const toStr = plus1.toTimeString().slice(0, 5);
                setFrom(fromStr);
                setTo(toStr);
              }}
            >
              Now → +1h
            </button>

            <button
              onClick={() => {
                setFrom("09:00");
                setTo("17:00");
              }}
            >
              09:00 → 17:00
            </button>
            <button
              onClick={() => {
                setFrom("00:00");
                setTo("00:00");
              }}
            >
              Closed
            </button>
          </div>

          {error && <div className="trm-error">{error}</div>}

          {allowAcrossMidnight && (
            <p className="trm-note">
              End time can be earlier than start time (wraps after midnight).
            </p>
          )}
        </div>

        <div className="trm-footer">
          <button
            onClick={() => {
              setFrom(initialFrom || "");
              setTo(initialTo || "");
              setError("");
            }}
          >
            Reset
          </button>
          <button onClick={onClose} className="trm-cancel">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="trm-confirm"
            style={{ backgroundColor: "#32620e" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function PresetButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="text-sm px-3 py-1 rounded-lg border hover:bg-slate-50"
    >
      {label}
    </button>
  );
}

/*
Usage example (in a parent component):

import React, { useState } from 'react'
import TimeRangeModal from './TimeRangeModal'

function Example() {
  const [open, setOpen] = useState(false)
  const [range, setRange] = useState(null)

  return (
    <div>
      <button onClick={() => setOpen(true)}>Open modal</button>
      <TimeRangeModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={({ from, to }) => setRange({ from, to })}
        initialFrom="08:30"
        initialTo="12:30"
        minGapMinutes={15}
        allowAcrossMidnight={true}
      />

      {range && <div>Selected: {range.from} → {range.to}</div>}
    </div>
  )
}
*/
