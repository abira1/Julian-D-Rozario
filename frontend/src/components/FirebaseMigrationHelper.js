import React, { useState } from 'react';
import migrateData from '../scripts/migrateToFirebase';

/**
 * Firebase Migration Helper Component
 * This component provides a button to migrate existing data to Firebase
 * Run this once after setting up Firebase, then you can remove it
 */
const FirebaseMigrationHelper = () => {
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleMigrate = async () => {
    try {
      setMigrating(true);
      setStatus('Starting migration...');
      setError('');
      
      await migrateData();
      
      setStatus('✅ Migration completed successfully!');
      setMigrating(false);
    } catch (err) {
      console.error('Migration error:', err);
      setError(`❌ Migration failed: ${err.message}`);
      setMigrating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      background: '#1f2937',
      border: '2px solid #7c3aed',
      borderRadius: '12px',
      padding: '20px',
      maxWidth: '400px',
      boxShadow: '0 10px 40px rgba(124, 58, 237, 0.3)'
    }}>
      <h3 style={{ color: '#fff', marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
        🔄 Firebase Data Migration
      </h3>
      <p style={{ color: '#9ca3af', marginBottom: '15px', fontSize: '14px' }}>
        Click the button below to migrate existing blog data to Firebase Realtime Database.
        This should only be done once.
      </p>
      <button
        onClick={handleMigrate}
        disabled={migrating}
        style={{
          width: '100%',
          padding: '12px',
          background: migrating ? '#6b7280' : 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: migrating ? 'not-allowed' : 'pointer',
          marginBottom: '10px'
        }}
      >
        {migrating ? 'Migrating...' : 'Start Migration'}
      </button>
      {status && (
        <div style={{
          padding: '10px',
          background: '#10b981',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '13px',
          marginTop: '10px'
        }}>
          {status}
        </div>
      )}
      {error && (
        <div style={{
          padding: '10px',
          background: '#ef4444',
          color: '#fff',
          borderRadius: '6px',
          fontSize: '13px',
          marginTop: '10px'
        }}>
          {error}
        </div>
      )}
      <p style={{ color: '#6b7280', fontSize: '11px', marginTop: '10px' }}>
        💡 After migration, you can remove this component from App.js
      </p>
    </div>
  );
};

export default FirebaseMigrationHelper;
