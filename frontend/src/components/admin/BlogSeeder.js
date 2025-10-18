import React, { useState } from 'react';
import { useFirebaseAuth } from '../../contexts/FirebaseAuthContext';
import seedFirebaseBlogs from '../../scripts/seedBlogs';
import seedFirebaseCategories from '../../scripts/seedCategories';

const BlogSeeder = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useFirebaseAuth();

  // Check if user is admin
  const isAdmin = user && (
    user.email === 'juliandrozario@gmail.com' || 
    user.email === 'abirsabirhossain@gmail.com'
  );

  const handleSeedBlogs = async () => {
    if (!isAdmin) {
      setMessage('Access denied: Admin privileges required');
      return;
    }

    try {
      setIsSeeding(true);
      setMessage('Seeding categories and blogs to Firebase...');
      
      // First seed categories
      await seedFirebaseCategories();
      setMessage('✅ Categories seeded. Now seeding blogs...');
      
      // Then seed blogs
      await seedFirebaseBlogs();
      
      setMessage('✅ Successfully seeded sample categories and blogs to Firebase!');
    } catch (error) {
      console.error('Error seeding data:', error);
      setMessage('❌ Error seeding data: ' + error.message);
    } finally {
      setIsSeeding(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Access Denied</h3>
        <p className="text-red-300">You need admin privileges to seed blog data.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-lg">
      <h3 className="text-lg font-semibold text-white mb-4">Blog Data Seeder</h3>
      <p className="text-gray-300 mb-4">
        This will add sample blog posts and categories to your Firebase database. Only run this once.
      </p>
      
      <button
        onClick={handleSeedBlogs}
        disabled={isSeeding}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed px-6 py-2 rounded-lg text-white font-medium transition-colors"
      >
        {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
      </button>
      
      {message && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-600 rounded text-gray-300">
          {message}
        </div>
      )}
    </div>
  );
};

export default BlogSeeder;