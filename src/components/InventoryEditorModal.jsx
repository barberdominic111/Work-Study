import React, { useState } from 'react';
import { overlay, modalCard, fieldLabel, inputStyle, btnPrimary, btnSecondary, sectionLabel } from '../lib/styles.js';

export default function InventoryEditorModal({ inventory, onSave, onClose }) {
  const [form, setForm] = useState({ ...inventory });

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, [key]: e.target.type === 'number' ? Number(val) : val }));
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modalCard} onClick={(e) => e.stopPropagation()}>
        <div style={sectionLabel}>Inventory Buffer</div>
        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Name</label>
          <input style={inputStyle} value={form.name} onChange={set('name')} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Starting Quantity</label>
          <input type="number" style={inputStyle} value={form.initialQty} onChange={set('initialQty')} />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={fieldLabel}>Unit</label>
          <select style={inputStyle} value={form.unit} onChange={set('unit')}>
            <option value="pieces">pieces</option>
            <option value="jobs">jobs</option>
            <option value="orders">orders</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button style={{ ...btnSecondary, flex: 1 }} onClick={onClose}>Cancel</button>
          <button style={{ ...btnPrimary, flex: 1 }} onClick={() => onSave(form)}>Save</button>
        </div>
      </div>
    </div>
  );
}
