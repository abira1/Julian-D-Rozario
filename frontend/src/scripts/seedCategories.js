import { database } from '../firebase/config';
import { ref, set, push } from 'firebase/database';

/**
 * Seed sample categories to Firebase
 */

const sampleCategories = [
  {
    name: "Business Formation",
    description: "Setting up and establishing businesses in the UAE",
    color: "#7c3aed" // purple
  },
  {
    name: "Immigration",
    description: "Visa requirements and immigration processes",
    color: "#2563eb" // blue
  },
  {
    name: "Business Opportunities",
    description: "Investment and business opportunities in the region",
    color: "#059669" // green
  },
  {
    name: "Taxation",
    description: "Tax compliance and corporate taxation",
    color: "#dc2626" // red
  },
  {
    name: "Corporate Services",
    description: "Company management and corporate services",
    color: "#9333ea" // violet
  },
  {
    name: "Legal Compliance",
    description: "Legal requirements and regulatory compliance",
    color: "#0891b2" // cyan
  }
];

const seedFirebaseCategories = async () => {
  try {
    console.log('Starting to seed Firebase with sample categories...');
    
    const categoriesRef = ref(database, 'categories');
    
    for (const categoryData of sampleCategories) {
      const newCategoryRef = push(categoriesRef);
      await set(newCategoryRef, {
        ...categoryData,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      console.log(`Added category: ${categoryData.name}`);
    }
    
    console.log('Successfully seeded Firebase with sample categories!');
    
  } catch (error) {
    console.error('Error seeding categories:', error);
  }
};

export default seedFirebaseCategories;