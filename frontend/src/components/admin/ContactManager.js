import React, { useState, useEffect } from 'react';

const ContactManager = () => {
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    linkedin: '',
    availability: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`);
      if (response.ok) {
        const data = await response.json();
        setContactInfo(data);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      setMessage({ type: 'error', text: 'Failed to load contact information' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setContactInfo({
      ...contactInfo,
      [e.target.name]: e.target.value
    });
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/contact`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactInfo),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Contact information updated successfully!' });
        // Optionally refresh the data
        await fetchContactInfo();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.detail || 'Failed to update contact information' });
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    fetchContactInfo();
    setMessage({ type: '', text: '' });
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
          Contact Information
        </h1>
        <p className="text-gray-400">Update your contact details displayed on the website</p>
      </div>

      <div className="max-w-2xl">
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

        {/* Contact Form */}
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12C16 13.1046 15.1046 14 14 14H10C8.89543 14 8 13.1046 8 12V8C8 6.89543 8.89543 6 10 6H14C15.1046 6 16 6.89543 16 8V12Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 8L16 14L10 8" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={contactInfo.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="julian@drozario.blog"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={contactInfo.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="+971 55 386 8045"
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452H16.893V14.883C16.893 13.555 16.866 11.846 15.041 11.846C13.188 11.846 12.905 13.291 12.905 14.785V20.452H9.351V9H12.765V10.561H12.811C13.288 9.661 14.448 8.711 16.181 8.711C19.782 8.711 20.448 11.081 20.448 14.166V20.452H20.447ZM5.337 7.433C4.193 7.433 3.274 6.507 3.274 5.368C3.274 4.23 4.194 3.305 5.337 3.305C6.477 3.305 7.401 4.23 7.401 5.368C7.401 6.507 6.476 7.433 5.337 7.433ZM7.119 20.452H3.555V9H7.119V20.452ZM22.225 0H1.771C0.792 0 0 0.774 0 1.729V22.271C0 23.227 0.792 24 1.771 24H22.222C23.2 24 24 23.227 24 22.271V1.729C24 0.774 23.2 0 22.222 0H22.225Z"/>
                  </svg>
                </div>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={contactInfo.linkedin}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="https://www.linkedin.com/in/julian-d-rozario"
                />
              </div>
            </div>

            {/* Availability */}
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-gray-300 mb-2">
                Availability Status
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V12L16 16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="availability"
                  name="availability"
                  value={contactInfo.availability}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Available for consultation"
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-none sm:px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Update Contact Info'
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isSaving}
                className="px-6 py-3 bg-white/10 text-gray-300 font-medium rounded-lg hover:bg-white/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="mt-8 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: 'Encode Sans Semi Expanded, sans-serif' }}>
            Preview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <span className="text-gray-400 w-20">Email:</span>
              <span className="text-white">{contactInfo.email || 'Not set'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-400 w-20">Phone:</span>
              <span className="text-white">{contactInfo.phone || 'Not set'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-400 w-20">LinkedIn:</span>
              <span className="text-white truncate">{contactInfo.linkedin || 'Not set'}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-gray-400 w-20">Status:</span>
              <span className="text-green-400">{contactInfo.availability || 'Not set'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;