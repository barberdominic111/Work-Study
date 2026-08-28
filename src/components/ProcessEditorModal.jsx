import React, { useState } from 'react';
import { overlay, modalCard, fieldLabel, inputStyle, btnPrimary, btnDestructive, btnSecondary, sectionLabel } from '../lib/styles.js';

export default function ProcessEditorModal({ process, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({ ...process });

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [key]: e.target.type === 'number' ? Number(val) : val }));
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={sectionLabel}>Process</div>
        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Process Name</label>
          <input style={inputStyle} value={form.name} onChange={set('name')} />
        </div>

        <Row>
          <Field label="Cycle Time">
            <input type="number" style={inputStyle} value={form.cycleTimeValue} onChange={set('cycleTimeValue')} />
          </Field>
          <Field label="Unit">
            <select style={inputStyle} value={form.cycleTimeUnit} onChange={set('cycleTimeUnit')}>
              <option value="seconds">seconds</option>
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
            </select>
          </Field>
        </Row>

        <Row>
          <Field label="Setup / Changeover Time">
            <input type="number" style={inputStyle} value={form.setupTimeValue} onChange={set('setupTimeValue')} />
          </Field>
          <Field label="Unit">
            <select style={inputStyle} value={form.setupTimeUnit} onChange={set('setupTimeUnit')}>
              <option value="seconds">seconds</option>
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
            </select>
          </Field>
        </Row>

        <Row>
          <Field label="Available Time (sec/day)">
            <input type="number" style={inputStyle} value={form.availableTimeSec} onChange={set('availableTimeSec')} />
          </Field>
          <Field label="Batch Size (pcs)">
            <input type="number" style={inputStyle} value={form.batchSize} onChange={set('batchSize')} />
          </Field>
        </Row>

        <Row>
          <Field label="Machines">
            <input type="number" style={inputStyle} value={form.machines} onChange={set('machines')} />
          </Field>
          <Field label="Operators">
            <input type="number" style={inputStyle} value={form.operators} onChange={set('operators')} />
          </Field>
        </Row>

        <Row>
          <Field label="Uptime %">
            <input type="number" style={inputStyle} value={form.uptimePct} onChange={set('uptimePct')} />
          </Field>
          <Field label="Demand (pcs/day, optional)">
            <input type="number" style={inputStyle} value={form.demand} onChange={set('demand')} />
          </Field>
        </Row>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button style={{ ...btnSecondary, flex: 1 }} onClick={onClose}>Cancel</button>
          {onDelete && (
            <button style={btnDestructive} onClick={() => onDelete(process.id)}>Delete</button>
          )}
          <button style={{ ...btnPrimary, flex: 1 }} onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>{children}</div>;
}

function Field({ label, children }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      {children}
    </div>
  );
}
