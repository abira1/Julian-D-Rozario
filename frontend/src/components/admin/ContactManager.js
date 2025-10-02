import React, { useState, useEffect } from 'react';

const ContactManager = () => {
  const [contactEntries, setContactEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [newEntry, setNewEntry] = useState({
    label: '',
    value: '',
    contact_type: 'email',
    icon: 'email',
    display_order: 0,
    is_visible: true
  });

  // Available contact types with corresponding icons
  const contactTypes = [
    { value: 'email', label: 'Email', icon: 'email' },
    { value: 'phone', label: 'Phone', icon: 'phone' },
    { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
    { value: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
    { value: 'website', label: 'Website', icon: 'website' },
    { value: 'location', label: 'Location', icon: 'location' },
    { value: 'status', label: 'Status', icon: 'status' },
    { value: 'twitter', label: 'Twitter', icon: 'twitter' },
    { value: 'instagram', label: 'Instagram', icon: 'instagram' }
  ];

  useEffect(() => {
    fetchContactEntries();
  }, []);

  const fetchContactEntries = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact-info`);
      if (response.ok) {
        const data = await response.json();
        setContactEntries(data);
      }
    } catch (error) {
      console.error('Error fetching contact entries:', error);
      setMessage({ type: 'error', text: 'Failed to load contact information' });
    } finally {
      setIsLoading(false);
    }
  };

  // Get icon SVG for contact type
  const getContactIcon = (iconType) => {
    const icons = {
      email: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
      ),
      phone: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      ),
      linkedin: (
        <path fill="currentColor" d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
      ),
      whatsapp: (
        <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.520-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488z"/>
      ),
      website: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      ),
      location: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      ),
      status: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      twitter: (
        <path fill="currentColor" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
      ),
      instagram: (
        <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      )
    };
    return icons[iconType] || icons.email;
  };

  const handleNewEntryChange = (field, value) => {
    setNewEntry({ ...newEntry, [field]: value });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleEditEntryChange = (field, value) => {
    setEditingEntry({ ...editingEntry, [field]: value });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const startAddingNew = () => {
    setIsAddingNew(true);
    setEditingEntry(null);
    setNewEntry({
      label: '',
      value: '',
      contact_type: 'email',
      icon: 'email',
      display_order: contactEntries.length + 1,
      is_visible: true
    });
  };

  const startEditing = (entry) => {
    setEditingEntry({ ...entry });
    setIsAddingNew(false);
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setIsAddingNew(false);
    setMessage({ type: '', text: '' });
  };

  const saveNewEntry = async () => {
    if (!newEntry.label || !newEntry.value) {
      setMessage({ type: 'error', text: 'Label and value are required' });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact-info`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEntry),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contact entry added successfully!' });
        await fetchContactEntries();
        setIsAddingNew(false);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to add contact entry' });
      }
    } catch (error) {
      console.error('Error adding contact entry:', error);
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const saveEditEntry = async () => {
    if (!editingEntry.label || !editingEntry.value) {
      setMessage({ type: 'error', text: 'Label and value are required' });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact-info/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          label: editingEntry.label,
          value: editingEntry.value,
          contact_type: editingEntry.contact_type,
          icon: editingEntry.icon,
          display_order: editingEntry.display_order,
          is_visible: editingEntry.is_visible
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contact entry updated successfully!' });
        await fetchContactEntries();
        setEditingEntry(null);
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to update contact entry' });
      }
    } catch (error) {
      console.error('Error updating contact entry:', error);
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntry = async (entryId, entryLabel) => {
    if (!window.confirm(`Are you sure you want to delete "${entryLabel}"?`)) {
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact-info/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contact entry deleted successfully!' });
        await fetchContactEntries();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to delete contact entry' });
      }
    } catch (error) {
      console.error('Error deleting contact entry:', error);
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibility = async (entry) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact-info/${entry.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_visible: !entry.is_visible
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `Contact entry ${!entry.is_visible ? 'shown' : 'hidden'} successfully!` });
        await fetchContactEntries();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to update visibility' });
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Component to render add/edit contact form
  const ContactForm = ({ entry, isNew, onSave, onCancel, onChange }) => (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
          {isNew ? 'Add New Contact Entry' : 'Edit Contact Entry'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Label */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Label</label>
          <input
            type="text"
            value={entry.label}
            onChange={(e) => onChange('label', e.target.value)}
            placeholder="e.g., Email Address, Phone Number"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Contact Type & Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Contact Type</label>
          <select
            value={entry.contact_type}
            onChange={(e) => {
              const selectedType = contactTypes.find(type => type.value === e.target.value);
              onChange('contact_type', e.target.value);
              onChange('icon', selectedType?.icon || 'email');
            }}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {contactTypes.map(type => (
              <option key={type.value} value={type.value} className="bg-gray-800">
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Value */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-300 mb-2">Value</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getContactIcon(entry.icon)}
              </svg>
            </div>
            <input
              type="text"
              value={entry.value}
              onChange={(e) => onChange('value', e.target.value)}
              placeholder="Contact information..."
              className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Display Order</label>
          <input
            type="number"
            value={entry.display_order}
            onChange={(e) => onChange('display_order', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Visibility Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Visibility</label>
          <button
            type="button"
            onClick={() => onChange('is_visible', !entry.is_visible)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
              entry.is_visible 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {entry.is_visible ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              )}
            </svg>
            <span>{entry.is_visible ? 'Visible' : 'Hidden'}</span>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4 pt-4 border-t border-white/10">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving || !entry.label || !entry.value}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            isNew ? 'Add Entry' : 'Update Entry'
          )}
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
            Contact Information Manager
          </h1>
          <p className="text-gray-400">Manage contact entries displayed on your website</p>
        </div>
        <button
          onClick={startAddingNew}
          disabled={isSaving || isAddingNew}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add Contact</span>
        </button>
      </div>

      <div className="max-w-4xl">
        {/* Status Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {message.type === 'success' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13L9 17L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
                )}
              </svg>
              {message.text}
            </div>
          </div>
        )}

        {/* Add New Entry Form */}
        {isAddingNew && (
          <div className="mb-6">
            <ContactForm 
              entry={newEntry}
              isNew={true}
              onSave={saveNewEntry}
              onCancel={cancelEditing}
              onChange={handleNewEntryChange}
            />
          </div>
        )}

        {/* Edit Entry Form */}
        {editingEntry && (
          <div className="mb-6">
            <ContactForm 
              entry={editingEntry}
              isNew={false}
              onSave={saveEditEntry}
              onCancel={cancelEditing}
              onChange={handleEditEntryChange}
            />
          </div>
        )}

        {/* Contact Entries List */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              Contact Entries ({contactEntries.length})
            </h3>
          </div>

          {contactEntries.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-lg font-medium text-white mb-2">No contact entries</h3>
              <p className="text-gray-400 mb-4">Get started by adding your first contact entry.</p>
              <button
                onClick={startAddingNew}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                Add First Contact Entry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {contactEntries.map((entry) => (
                <div
                  key={entry.id}
                  className={`p-4 rounded-lg border ${
                    entry.is_visible 
                      ? 'bg-white/5 border-white/10' 
                      : 'bg-white/[0.02] border-white/5 opacity-60'
                  } hover:bg-white/10 transition-all duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        entry.is_visible ? 'bg-purple-500/20' : 'bg-gray-500/20'
                      }`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {getContactIcon(entry.icon)}
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-white font-medium">{entry.label}</h4>
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                            {contactTypes.find(t => t.value === entry.contact_type)?.label || entry.contact_type}
                          </span>
                          {!entry.is_visible && (
                            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-400 rounded-full">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm truncate max-w-md">{entry.value}</p>
                        <p className="text-gray-500 text-xs">Order: {entry.display_order}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Visibility Toggle */}
                      <button
                        onClick={() => toggleVisibility(entry)}
                        disabled={isSaving}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          entry.is_visible 
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title={entry.is_visible ? 'Hide entry' : 'Show entry'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {entry.is_visible ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          )}
                        </svg>
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => startEditing(entry)}
                        disabled={isSaving || editingEntry !== null || isAddingNew}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit entry"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => deleteEntry(entry.id, entry.label)}
                        disabled={isSaving}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete entry"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7L5 7m5-4v4m4-4v4m1 0l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7h14" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Section */}
        {contactEntries.filter(entry => entry.is_visible).length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
              Public Website Preview
            </h3>
            <div className="space-y-3">
              {contactEntries
                .filter(entry => entry.is_visible)
                .map((entry) => (
                  <div key={entry.id} className="flex items-center text-sm">
                    <div className="flex items-center space-x-2 w-32">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {getContactIcon(entry.icon)}
                      </svg>
                      <span className="text-gray-400">{entry.label}:</span>
                    </div>
                    <span className="text-white truncate">{entry.value}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactManager;