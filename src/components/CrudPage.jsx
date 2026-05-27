import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export const CrudPage = ({ entityType, title, columns }) => {
  const context = useAppContext();
  const data = context[entityType] || [];
  const addRecord = context.addRecord;
  const updateRecord = context.updateRecord;
  const softDeleteRecord = context.softDeleteRecord;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const activeData = data.filter(item => !item.isDeleted);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      const initialData = {};
      columns.forEach(c => initialData[c.key] = '');
      setFormData(initialData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateRecord(entityType, formData);
    } else {
      addRecord(entityType, formData);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      softDeleteRecord(entityType, id);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 style={{ fontSize: '24px', fontWeight: 600 }}>{title} Management</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={16} /> Add {title}
        </button>
      </div>

      <div className="card glass">
        <div className="table-container">
          {activeData.length === 0 ? (
            <div className="empty-state">
              <p>No {title.toLowerCase()} found. Add your first one to get started.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  {columns.filter(col => !col.hideInTable).map(col => <th key={col.key}>{col.label}</th>)}
                  <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeData.map((item) => (
                  <tr key={item.id}>
                    {columns.filter(col => !col.hideInTable).map(col => (
                      <td key={col.key}>
                        {col.render ? col.render(item[col.key], item) : item[col.key]}
                      </td>
                    ))}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(item)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon" style={{ color: 'var(--danger-color)' }} onClick={() => handleDelete(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h3 className="modal-title">{editingItem ? 'Edit' : 'Add'} {title}</h3>
                <button type="button" className="btn-icon" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body">
                {columns.filter(col => !col.hideInForm).map(col => (
                  <div className="form-group" key={col.key}>
                    <label className="form-label">{col.label}</label>
                    {col.type === 'select' ? (
                      <select 
                        className="form-control" 
                        name={col.key} 
                        value={formData[col.key] || ''} 
                        onChange={handleChange}
                        required={col.required !== false}
                      >
                        <option value="">Select {col.label}</option>
                        {(typeof col.options === 'function' ? col.options(formData) : col.options)?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type={col.type || 'text'} 
                        className="form-control" 
                        name={col.key} 
                        value={formData[col.key] || ''} 
                        onChange={handleChange}
                        placeholder={`Enter ${col.label.toLowerCase()}`}
                        required={col.required !== false}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
