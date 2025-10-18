import { database } from '../firebase/config';
import { ref, set, push } from 'firebase/database';

/**
 * Seed sample blog data to Firebase
 * Run this once to populate the database with sample blogs
 */

const sampleBlogs = [
  {
    title: "Complete Guide to Company Formation in Dubai Free Zones 2025",
    excerpt: "Everything you need to know about setting up your business in Dubai Free Zones, including license types, costs, and step-by-step procedures.",
    content: `
      <h2>Introduction</h2>
      <p>Dubai has emerged as one of the world's leading business hubs, attracting entrepreneurs and investors from across the globe. The emirate's strategic location, world-class infrastructure, and business-friendly policies make it an ideal destination for company formation.</p>
      
      <h2>Why Choose Dubai Free Zones?</h2>
      <p>Dubai Free Zones offer numerous advantages for businesses:</p>
      <ul>
        <li>100% foreign ownership</li>
        <li>Zero corporate tax</li>
        <li>Full repatriation of capital and profits</li>
        <li>No personal income tax</li>
        <li>Streamlined business setup process</li>
        <li>Access to global markets</li>
      </ul>
      
      <h2>Popular Free Zones in Dubai</h2>
      <p>Some of the most popular free zones include:</p>
      <ul>
        <li><strong>DMCC (Dubai Multi Commodities Centre)</strong> - For trading and commodities</li>
        <li><strong>DIFC (Dubai International Financial Centre)</strong> - For financial services</li>
        <li><strong>Dubai Internet City</strong> - For technology companies</li>
        <li><strong>JAFZA (Jebel Ali Free Zone)</strong> - For manufacturing and logistics</li>
      </ul>
      
      <h2>Step-by-Step Setup Process</h2>
      <ol>
        <li>Choose your business activity and free zone</li>
        <li>Reserve your company name</li>
        <li>Submit required documents</li>
        <li>Pay license fees</li>
        <li>Receive your license and establish visa quota</li>
      </ol>
      
      <h2>Required Documents</h2>
      <p>The typical documents needed include:</p>
      <ul>
        <li>Passport copies of shareholders and directors</li>
        <li>No objection certificate (if applicable)</li>
        <li>Bank reference letters</li>
        <li>Educational certificates (for some activities)</li>
      </ul>
      
      <h2>Costs and Timeline</h2>
      <p>Setup costs vary by free zone and business activity, typically ranging from AED 15,000 to AED 50,000. The process usually takes 3-5 working days once all documents are submitted.</p>
      
      <h2>Conclusion</h2>
      <p>Dubai Free Zones provide an excellent platform for international businesses to establish their presence in the Middle East. With proper planning and guidance, the setup process can be smooth and efficient.</p>
    `,
    category: "Business Formation",
    image_url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop",
    featured_image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=400&fit=crop",
    author: "Julian D'Rozario",
    date: "2025-01-15",
    read_time: "8 min read",
    status: "published",
    is_featured: true,
    views: 0,
    likes: 0,
    commentsCount: 0
  },
  {
    title: "UAE Visa Requirements: A Complete Guide for Business Owners",
    excerpt: "Navigate through UAE visa requirements with confidence. Learn about different visa types, application processes, and documentation needed for business success.",
    content: `
      <h2>Understanding UAE Visas</h2>
      <p>The UAE offers various visa types for entrepreneurs and business owners, each designed to meet specific needs and circumstances.</p>
      
      <h2>Types of Business Visas</h2>
      <h3>1. Investor Visa</h3>
      <p>For those investing in UAE businesses or real estate.</p>
      
      <h3>2. Partner Visa</h3>
      <p>For business partners in UAE companies.</p>
      
      <h3>3. Employment Visa</h3>
      <p>For those employed by UAE companies.</p>
      
      <h3>4. Golden Visa</h3>
      <p>Long-term residency for investors, entrepreneurs, and skilled professionals.</p>
      
      <h2>Application Process</h2>
      <p>The visa application process involves several steps:</p>
      <ol>
        <li>Determine visa type</li>
        <li>Prepare required documents</li>
        <li>Submit application</li>
        <li>Complete medical examination</li>
        <li>Complete Emirates ID registration</li>
      </ol>
      
      <h2>Required Documentation</h2>
      <ul>
        <li>Valid passport</li>
        <li>Passport-sized photographs</li>
        <li>Educational certificates</li>
        <li>Employment contract or business license</li>
        <li>Medical fitness certificate</li>
        <li>No objection certificate</li>
      </ul>
      
      <h2>Processing Time and Fees</h2>
      <p>Processing times vary from 3-15 working days depending on visa type. Fees range from AED 1,000 to AED 5,000.</p>
    `,
    category: "Immigration",
    image_url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    featured_image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    author: "Julian D'Rozario",
    date: "2025-01-12",
    read_time: "6 min read",
    status: "published",
    is_featured: false,
    views: 0,
    likes: 0,
    commentsCount: 0
  },
  {
    title: "Top 10 Business Opportunities in Dubai for 2025",
    excerpt: "Discover the most promising business sectors in Dubai for 2025. From technology to hospitality, explore opportunities with high growth potential.",
    content: `
      <h2>Dubai's Growing Economy</h2>
      <p>Dubai continues to attract investors and entrepreneurs from around the world. Here are the top business opportunities for 2025.</p>
      
      <h2>1. Technology and AI</h2>
      <p>With Dubai's smart city initiatives, technology and AI businesses are thriving.</p>
      
      <h2>2. Renewable Energy</h2>
      <p>Dubai's commitment to sustainability creates opportunities in renewable energy sector.</p>
      
      <h2>3. Healthcare and Wellness</h2>
      <p>Growing population and health awareness drive healthcare business opportunities.</p>
      
      <h2>4. E-commerce and Digital Services</h2>
      <p>Digital transformation continues to create new business opportunities.</p>
      
      <h2>5. Food and Beverage</h2>
      <p>Dubai's diverse population and tourism industry support F&B businesses.</p>
      
      <h2>6. Tourism and Hospitality</h2>
      <p>Recovery and growth in tourism sector present numerous opportunities.</p>
      
      <h2>7. Financial Services</h2>
      <p>Dubai's position as a financial hub creates opportunities in fintech and financial services.</p>
      
      <h2>8. Education and Training</h2>
      <p>Growing demand for quality education and professional training.</p>
      
      <h2>9. Real Estate and Construction</h2>
      <p>Ongoing development projects create opportunities in real estate.</p>
      
      <h2>10. Logistics and Supply Chain</h2>
      <p>Dubai's strategic location makes it ideal for logistics businesses.</p>
    `,
    category: "Business Opportunities",
    image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
    featured_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=400&fit=crop",
    author: "Julian D'Rozario",
    date: "2025-01-10",
    read_time: "7 min read",
    status: "published",
    is_featured: false,
    views: 0,
    likes: 0,
    commentsCount: 0
  },
  {
    title: "Corporate Tax in UAE: What Businesses Need to Know",
    excerpt: "Understanding the UAE's corporate tax implementation and its impact on businesses. A comprehensive guide to compliance and planning.",
    content: `
      <h2>Introduction to UAE Corporate Tax</h2>
      <p>The UAE introduced corporate tax on business profits from June 1, 2023, marking a significant change in the tax landscape.</p>
      
      <h2>Tax Rates</h2>
      <p>The corporate tax rates are:</p>
      <ul>
        <li>0% for profits up to AED 375,000</li>
        <li>9% for profits exceeding AED 375,000</li>
      </ul>
      
      <h2>Who is Subject to Corporate Tax?</h2>
      <p>Corporate tax applies to:</p>
      <ul>
        <li>UAE resident businesses</li>
        <li>Foreign businesses with permanent establishment in UAE</li>
        <li>Natural persons conducting business activities</li>
      </ul>
      
      <h2>Exemptions</h2>
      <p>Certain entities are exempt including:</p>
      <ul>
        <li>Government entities</li>
        <li>Extractive businesses (subject to Emirate-level taxation)</li>
        <li>Non-commercial activities</li>
        <li>Investment funds (subject to conditions)</li>
      </ul>
      
      <h2>Compliance Requirements</h2>
      <p>Businesses must:</p>
      <ol>
        <li>Register for corporate tax</li>
        <li>Maintain proper books and records</li>
        <li>Submit annual tax returns</li>
        <li>Pay tax within specified deadlines</li>
      </ol>
      
      <h2>Impact on Free Zone Entities</h2>
      <p>Free Zone entities remain exempt from corporate tax if they meet specific conditions.</p>
    `,
    category: "Taxation",
    image_url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    featured_image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=400&fit=crop",
    author: "Julian D'Rozario",
    date: "2025-01-08",
    read_time: "5 min read",
    status: "published",
    is_featured: false,
    views: 0,
    likes: 0,
    commentsCount: 0
  }
];

const seedFirebaseBlogs = async () => {
  try {
    console.log('Starting to seed Firebase with sample blogs...');
    
    const blogsRef = ref(database, 'blogs');
    
    for (const blogData of sampleBlogs) {
      const newBlogRef = push(blogsRef);
      await set(newBlogRef, {
        ...blogData,
        slug: blogData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, ''),
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      console.log(`Added blog: ${blogData.title}`);
    }
    
    console.log('Successfully seeded Firebase with sample blogs!');
    
  } catch (error) {
    console.error('Error seeding blogs:', error);
  }
};

export default seedFirebaseBlogs;