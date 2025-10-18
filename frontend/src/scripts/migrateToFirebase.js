/**
 * Firebase Data Migration Script
 * This script migrates existing blog data to Firebase Realtime Database
 * Run this once to populate your Firebase database
 */

import { database } from '../firebase/config';
import { ref, set } from 'firebase/database';

// Data to migrate (from your existing database)
const blogData = [
  {
    "id": "blog-1",
    "title": "Complete Guide to Company Formation in Dubai Free Zones 2025",
    "excerpt": "Everything you need to know about setting up your business in Dubai Free Zones, including license types, costs, and step-by-step procedures.",
    "content": "<h2>Introduction</h2><p>Dubai has emerged as one of the world's leading business hubs. In this comprehensive guide, we'll walk you through everything you need to know about company formation in Dubai Free Zones.</p><h2>Why Choose Dubai Free Zones?</h2><p>Dubai Free Zones offer numerous advantages including 100% foreign ownership, zero corporate tax, full repatriation of capital and profits.</p>",
    "image_url": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop",
    "featured_image": "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop",
    "date": "2025-01-09",
    "read_time": "5 min read",
    "category": "Company Formation",
    "author": "Julian D'Rozario",
    "views": 9,
    "likes": 0,
    "commentsCount": 0,
    "status": "published",
    "slug": "complete-guide-company-formation-dubai-free-zones-2025"
  },
  {
    "id": "blog-2",
    "title": "UAE Visa Requirements: A Complete Guide for Business Owners",
    "excerpt": "Navigate through UAE visa requirements with confidence. Learn about different visa types, application processes, and documentation needed.",
    "content": "<h2>Understanding UAE Visas</h2><p>The UAE offers various visa types for entrepreneurs and business owners. Understanding the requirements is essential for successful application.</p>",
    "image_url": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "featured_image": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    "date": "2025-01-08",
    "read_time": "7 min read",
    "category": "Immigration",
    "author": "Julian D'Rozario",
    "views": 5,
    "likes": 0,
    "commentsCount": 0,
    "status": "published",
    "slug": "uae-visa-requirements-complete-guide-business-owners"
  },
  {
    "id": "blog-3",
    "title": "Top 10 Business Opportunities in Dubai for 2025",
    "excerpt": "Discover the most promising business sectors in Dubai for 2025. From technology to hospitality, explore opportunities with high growth potential.",
    "content": "<h2>Dubai's Growing Economy</h2><p>Dubai continues to attract investors and entrepreneurs from around the world. Here are the top business opportunities for 2025.</p>",
    "image_url": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "featured_image": "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop",
    "date": "2025-01-07",
    "read_time": "8 min read",
    "category": "Business Development",
    "author": "Julian D'Rozario",
    "views": 12,
    "likes": 0,
    "commentsCount": 0,
    "status": "published",
    "slug": "top-10-business-opportunities-dubai-2025"
  },
  {
    "id": "blog-4",
    "title": "Understanding UAE Corporate Tax: What Business Owners Need to Know",
    "excerpt": "A comprehensive guide to UAE's corporate tax system, including exemptions, compliance requirements, and planning strategies.",
    "content": "<h2>UAE Corporate Tax Overview</h2><p>The UAE introduced corporate tax in 2023. Understanding its implications is crucial for business planning and compliance.</p>",
    "image_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop",
    "featured_image": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=400&fit=crop",
    "date": "2025-01-06",
    "read_time": "10 min read",
    "category": "Compliance",
    "author": "Julian D'Rozario",
    "views": 8,
    "likes": 0,
    "commentsCount": 0,
    "status": "published",
    "slug": "understanding-uae-corporate-tax-business-owners"
  },
  {
    "id": "blog-5",
    "title": "How to Choose the Right Business Activity for Your UAE Company",
    "excerpt": "Selecting the right business activity is crucial for licensing and operations. Learn how to make the best choice for your company.",
    "content": "<h2>Business Activities in UAE</h2><p>The UAE offers hundreds of business activities across various sectors. Choosing the right one affects your license, operations, and growth potential.</p>",
    "image_url": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop",
    "featured_image": "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&h=400&fit=crop",
    "date": "2025-01-05",
    "read_time": "6 min read",
    "category": "Business Formation",
    "author": "Julian D'Rozario",
    "views": 6,
    "likes": 0,
    "commentsCount": 0,
    "status": "published",
    "slug": "choose-right-business-activity-uae-company"
  }
];

const categories = [
  { "name": "Company Formation", "slug": "company-formation" },
  { "name": "Immigration", "slug": "immigration" },
  { "name": "Business Development", "slug": "business-development" },
  { "name": "Compliance", "slug": "compliance" },
  { "name": "Business Formation", "slug": "business-formation" }
];

const contactInfo = [
  {
    "id": "email",
    "label": "Email",
    "value": "julian@drozario.blog",
    "contact_type": "email",
    "icon": "mail",
    "is_visible": true
  },
  {
    "id": "phone",
    "label": "Phone",
    "value": "+971 55 386 8045",
    "contact_type": "phone",
    "icon": "phone",
    "is_visible": true
  },
  {
    "id": "linkedin",
    "label": "LinkedIn",
    "value": "linkedin.com/in/julian-d-rozario",
    "contact_type": "social",
    "icon": "linkedin",
    "is_visible": true
  },
  {
    "id": "location",
    "label": "Location",
    "value": "Dubai, UAE",
    "contact_type": "address",
    "icon": "map-pin",
    "is_visible": true
  }
];

async function migrateData() {
  try {
    console.log('Starting Firebase migration...');

    // Migrate blogs
    console.log('Migrating blogs...');
    for (const blog of blogData) {
      const blogRef = ref(database, `blogs/${blog.id}`);
      const { id, ...blogWithoutId } = blog;
      await set(blogRef, {
        ...blogWithoutId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      console.log(`✓ Migrated blog: ${blog.title}`);
    }

    // Migrate categories
    console.log('\nMigrating categories...');
    for (const category of categories) {
      const categoryRef = ref(database, `categories/${category.slug}`);
      await set(categoryRef, category);
      console.log(`✓ Migrated category: ${category.name}`);
    }

    // Migrate contact info
    console.log('\nMigrating contact info...');
    for (const contact of contactInfo) {
      const contactRef = ref(database, `contactInfo/${contact.id}`);
      const { id, ...contactWithoutId } = contact;
      await set(contactRef, contactWithoutId);
      console.log(`✓ Migrated contact: ${contact.label}`);
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('\nYou can now:');
    console.log('1. View your data in Firebase Console');
    console.log('2. Start using the app with Firebase backend');
    console.log('3. Delete this migration script if no longer needed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

export default migrateData;

// If running directly (for testing)
if (typeof window !== 'undefined') {
  window.migrateToFirebase = migrateData;
  console.log('Migration function available as window.migrateToFirebase()');
}
