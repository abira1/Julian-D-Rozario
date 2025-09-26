import React, { useState, useEffect } from 'react';

const WorkedWithManager = () => {
  const [partners, setPartners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [formData, setFormData] = useState({
    company_name: '',
    logo_url: '',
    display_order: 0,
    is_active: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/worked-with`);
      if (response.ok) {
        const data = await response.json();
        setPartners(data);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('admin_token');
    const url = editingPartner 
      ? `${process.env.REACT_APP_BACKEND_URL}/api/worked-with/${editingPartner.id}`
      : `${process.env.REACT_APP_BACKEND_URL}/api/worked-with`;
    
    const method = editingPartner ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchPartners();
        handleCloseForm();
        // Show success message (you can implement a toast notification here)
        alert(editingPartner ? 'Partner updated successfully!' : 'Partner added successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to save partner'}`);
      }
    } catch (error) {
      console.error('Error saving partner:', error);
      alert('Error saving partner. Please try again.');
    }
  };

  const handleDelete = async (partnerId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      return;
    }

    const token = localStorage.getItem('admin_token');

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/worked-with/${partnerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        await fetchPartners();
        alert('Partner deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Error: ${error.detail || 'Failed to delete partner'}`);
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
      alert('Error deleting partner. Please try again.');
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      company_name: partner.company_name,
      logo_url: partner.logo_url,
      display_order: partner.display_order,
      is_active: partner.is_active
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPartner(null);
    setFormData({
      company_name: '',
      logo_url: '',
      display_order: 0,
      is_active: true
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB.');
      return;
    }

    setUploadingImage(true);
    const token = localStorage.getItem('admin_token');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataUpload
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, logo_url: result.url }));
      } else {
        alert('Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
            Worked With Partners
          </h1>
          <p className="text-gray-400">Manage business partners and collaborations</p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V20M20 12H4" />
          </svg>
          <span>Add Partner</span>
        </button>
      </div>

      {/* Partners List */}
      <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        {partners.length > 0 ? (
          <div className="divide-y divide-white/10">
            {partners.map((partner) => (
              <div key={partner.id} className="p-6 hover:bg-white/5 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                      {partner.logo_url ? (
                        <img 
                          src={partner.logo_url} 
                          alt={partner.company_name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16L12 8L20 16" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{partner.company_name}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                        <span>Order: {partner.display_order}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          partner.is_active 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {partner.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(partner)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                      title="Edit Partner"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6C4.895 5 4 5.895 4 7V17C4 18.105 4.895 19 6 19H18C19.105 19 20 18.105 20 17V7C20 5.895 19.105 5 18 5H13M11 5C11 6.105 11.895 7 13 7H18M11 5C11 3.895 11.895 3 13 3H16C17.105 3 18 3.895 18 5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id, partner.company_name)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                      title="Delete Partner"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7L5 7M10 11V17M14 11V17M6 7L8 21H16L18 7M9 7V4C9 3.447 9.447 3 10 3H14C14.553 3 15 3.447 15 4V7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5C19 3.9 18.1 3 17 3H7C5.9 3 5 3.9 5 5V21L12 18L19 21Z" />
            </svg>
            <p className="text-lg mb-2">No partners added yet</p>
            <p className="text-sm">Add your first business partner or collaboration to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
                  {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6L12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    placeholder="Enter company name"
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Logo *
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="logo-upload"
                      />
                      <label
                        htmlFor="logo-upload"
                        className={`px-4 py-2 border border-white/20 rounded-lg cursor-pointer hover:bg-white/10 transition-colors duration-200 text-sm ${
                          uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingImage ? 'Uploading...' : 'Choose File'}
                      </label>
                      <span className="text-sm text-gray-400">
                        JPG, PNG, GIF up to 5MB
                      </span>
                    </div>
                    
                    {formData.logo_url && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white/10">
                        <img 
                          src={formData.logo_url} 
                          alt="Logo preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <input
                      type="url"
                      value={formData.logo_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                      placeholder="Or enter logo URL directly"
                      required
                    />
                  </div>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-400 mt-1">Lower numbers appear first</p>
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-white/5 border border-white/20 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-300">
                    Active (visible on website)
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseForm}
                    className="flex-1 px-4 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/10 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!formData.company_name || !formData.logo_url || uploadingImage}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {editingPartner ? 'Update' : 'Add'} Partner
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkedWithManager;