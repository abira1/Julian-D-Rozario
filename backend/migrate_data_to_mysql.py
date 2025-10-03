"""
Data Migration Script: Firebase Mock Data to MySQL
Migrates all 6 blog articles, categories, and contact info to MySQL database
"""

import aiomysql
import asyncio
import os
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# MySQL Configuration
MYSQL_CONFIG = {
    'host': os.environ.get('MYSQL_HOST', 'localhost'),
    'port': int(os.environ.get('MYSQL_PORT', 3306)),
    'user': os.environ.get('MYSQL_USER'),
    'password': os.environ.get('MYSQL_PASSWORD'),
    'db': os.environ.get('MYSQL_DATABASE'),
    'charset': 'utf8mb4',
    'autocommit': True
}

# Blog Data from Firebase Mock
BLOG_DATA = [
    {
        'id': str(uuid.uuid4()),
        'title': "Ultimate Guide to Dubai Business Formation in 2024",
        'excerpt': "Comprehensive insights into setting up your business in Dubai's thriving economy, including free zones, mainland options, and regulatory requirements.",
        'content': """<h2>Why Dubai is the Ultimate Business Hub</h2>
<p>Dubai has emerged as the premier destination for international businesses seeking to establish their presence in the Middle East. With its strategic location, business-friendly policies, and world-class infrastructure, Dubai offers unparalleled opportunities for entrepreneurs and established companies alike.</p>

<h3>Key Advantages of Dubai Business Formation</h3>
<ul>
    <li><strong>Tax Benefits:</strong> Zero corporate tax for most business activities</li>
    <li><strong>Strategic Location:</strong> Gateway between East and West</li>
    <li><strong>100% Foreign Ownership:</strong> Available in free zones and mainland</li>
    <li><strong>World-Class Infrastructure:</strong> Advanced logistics and telecommunications</li>
    <li><strong>Diverse Workforce:</strong> Access to international talent pool</li>
</ul>

<h3>Free Zone vs Mainland: Making the Right Choice</h3>
<p>The choice between free zone and mainland company formation depends on your business model, target market, and growth plans. Free zones offer 100% foreign ownership and tax exemptions but limit local market access, while mainland companies can trade freely within the UAE market.</p>

<h3>Essential Steps for Business Setup</h3>
<ol>
    <li>Choose your business structure and jurisdiction</li>
    <li>Reserve your company name</li>
    <li>Prepare required documentation</li>
    <li>Submit application and pay fees</li>
    <li>Obtain necessary licenses and permits</li>
    <li>Set up corporate banking</li>
</ol>

<p>With over 10 years of experience in UAE business formation, I've helped thousands of entrepreneurs successfully establish their presence in Dubai. The key is understanding the nuances of each jurisdiction and aligning them with your business objectives.</p>""",
        'category': "Company Formation",
        'author': "Julian D'Rozario",
        'read_time': 8,
        'featured': True,
        'tags': ["dubai", "business formation", "free zone", "mainland", "setup"],
        'image_url': "https://images.unsplash.com/photo-1523270918669-1fd17ac1742d",
        'views': 0,
        'likes': 0
    },
    {
        'id': str(uuid.uuid4()),
        'title': "UAE Corporate Advisory: Navigating Compliance and Governance",
        'excerpt': "Expert guidance on regulatory compliance, corporate governance, and strategic planning for businesses operating in the UAE market.",
        'content': """<h2>Corporate Advisory Excellence in the UAE</h2>
<p>Navigating the UAE's business landscape requires expert knowledge of local regulations, market dynamics, and growth opportunities. As a seasoned Business Relations Manager, I provide comprehensive corporate advisory services to help businesses thrive.</p>

<h3>Compliance Framework</h3>
<p>Understanding UAE compliance requirements is crucial for sustainable business operations. Key areas include:</p>
<ul>
    <li>Annual compliance and renewal procedures</li>
    <li>VAT registration and reporting</li>
    <li>Labor law compliance and visa management</li>
    <li>Industry-specific regulatory requirements</li>
    <li>Corporate governance best practices</li>
</ul>

<h3>Strategic Growth Planning</h3>
<p>Successful businesses in the UAE leverage strategic planning to capitalize on market opportunities. This includes market analysis, competitor research, and expansion strategies tailored to the local market dynamics.</p>

<h3>Partnership and Joint Ventures</h3>
<p>The UAE offers unique opportunities for strategic partnerships and joint ventures. Understanding the legal framework and cultural nuances is essential for successful collaborations.</p>""",
        'category': "Compliance",
        'author': "Julian D'Rozario",
        'read_time': 6,
        'featured': False,
        'tags': ["compliance", "corporate governance", "advisory", "regulation"],
        'image_url': "https://images.unsplash.com/photo-1521791136064-7986c2920216",
        'views': 0,
        'likes': 0
    },
    {
        'id': str(uuid.uuid4()),
        'title': "Immigration and Visa Services: Your Gateway to the UAE",
        'excerpt': "Complete guide to UAE visa processes, residency permits, and immigration requirements for business professionals and investors.",
        'content': """<h2>UAE Immigration: Opening Doors to Opportunity</h2>
<p>The UAE's progressive immigration policies create opportunities for global professionals and investors to establish long-term residency. Understanding the various visa categories and requirements is essential for successful immigration.</p>

<h3>Investor Visa Programs</h3>
<ul>
    <li><strong>Golden Visa:</strong> Long-term residency for investors and entrepreneurs</li>
    <li><strong>Green Visa:</strong> Self-sponsored residency options</li>
    <li><strong>Business Visa:</strong> For company owners and partners</li>
    <li><strong>Freelancer Visa:</strong> For independent professionals</li>
</ul>

<h3>Employment-Based Immigration</h3>
<p>Employment visas remain the most common pathway for UAE residency. Key considerations include salary requirements, educational qualifications, and industry-specific regulations.</p>

<h3>Family Sponsorship</h3>
<p>UAE residents can sponsor family members under specific conditions. Understanding the requirements and documentation process ensures smooth family reunification.</p>""",
        'category': "Immigration",
        'author': "Julian D'Rozario",
        'read_time': 7,
        'featured': False,
        'tags': ["visa", "immigration", "golden visa", "residency"],
        'image_url': "https://images.unsplash.com/photo-1523271076791-627581d559fa",
        'views': 0,
        'likes': 0
    },
    {
        'id': str(uuid.uuid4()),
        'title': "Technology and Innovation in UAE Business Landscape",
        'excerpt': "Exploring the role of technology in transforming business operations and the UAE's commitment to becoming a global innovation hub.",
        'content': """<h2>UAE's Digital Transformation Journey</h2>
<p>The UAE has positioned itself as a global leader in digital innovation, with ambitious initiatives like UAE Vision 2071 and the National AI Strategy 2031. This commitment to technology creates unprecedented opportunities for businesses.</p>

<h3>Fintech Revolution</h3>
<p>The UAE's fintech sector is rapidly evolving, with regulatory sandboxes and progressive policies encouraging innovation. Key developments include digital banking, blockchain adoption, and cryptocurrency regulations.</p>

<h3>Smart City Initiatives</h3>
<p>Dubai and Abu Dhabi's smart city projects create opportunities for technology companies and service providers. From IoT infrastructure to AI-powered government services, the possibilities are endless.</p>

<h3>Startup Ecosystem</h3>
<p>The UAE's thriving startup ecosystem, supported by government initiatives and private sector investment, provides a fertile ground for technology entrepreneurs and innovators.</p>""",
        'category': "Technology",
        'author': "Julian D'Rozario",
        'read_time': 5,
        'featured': False,
        'tags': ["technology", "innovation", "fintech", "startups"],
        'image_url': "https://images.unsplash.com/photo-1706322075100-48a5530648ca",
        'views': 0,
        'likes': 0
    },
    {
        'id': str(uuid.uuid4()),
        'title': "Operations Excellence: Streamlining Business Processes",
        'excerpt': "Best practices for operational efficiency, process optimization, and performance management in the UAE business environment.",
        'content': """<h2>Operational Excellence in the UAE Market</h2>
<p>Achieving operational excellence in the UAE requires understanding local market dynamics, cultural considerations, and regulatory frameworks while implementing global best practices.</p>

<h3>Process Optimization Strategies</h3>
<ul>
    <li>Lean management principles adapted for UAE context</li>
    <li>Digital transformation of business processes</li>
    <li>Quality management systems and certifications</li>
    <li>Performance measurement and KPI development</li>
</ul>

<h3>Human Resources Management</h3>
<p>Managing a diverse workforce in the UAE requires cultural sensitivity, compliance with labor laws, and effective communication strategies. Building high-performing teams across different nationalities and backgrounds is both a challenge and opportunity.</p>

<h3>Supply Chain Excellence</h3>
<p>Leveraging the UAE's strategic location and world-class logistics infrastructure to optimize supply chain operations and reduce costs while maintaining quality standards.</p>""",
        'category': "Operations",
        'author': "Julian D'Rozario",
        'read_time': 6,
        'featured': False,
        'tags': ["operations", "efficiency", "processes", "management"],
        'image_url': "https://images.unsplash.com/photo-1595133452708-75b6517a34dd",
        'views': 0,
        'likes': 0
    },
    {
        'id': str(uuid.uuid4()),
        'title': "Comprehensive Business Development Strategies",
        'excerpt': "Strategic approaches to market entry, partnership building, and sustainable growth in the competitive UAE business environment.",
        'content': """<h2>Building Sustainable Business Growth</h2>
<p>Successful business development in the UAE requires a deep understanding of market dynamics, cultural nuances, and strategic relationship building. My approach combines global best practices with local market insights.</p>

<h3>Market Entry Strategies</h3>
<p>Entering the UAE market successfully requires careful planning and execution. Key considerations include market research, competitive analysis, regulatory compliance, and cultural adaptation.</p>

<h3>Partnership Development</h3>
<ul>
    <li>Identifying strategic partners and stakeholders</li>
    <li>Building long-term business relationships</li>
    <li>Negotiating win-win partnership agreements</li>
    <li>Managing partner networks effectively</li>
</ul>

<h3>Channel Partner Relations</h3>
<p>With over 100 active channel partners, I understand the importance of building strong distributor and reseller networks. Effective channel management drives revenue growth and market expansion.</p>

<h3>Sustainable Growth Planning</h3>
<p>Long-term success requires sustainable growth strategies that balance profitability, market share, and stakeholder value. This includes diversification strategies, market expansion, and continuous innovation.</p>""",
        'category': "Business Development",
        'author': "Julian D'Rozario",
        'read_time': 7,
        'featured': False,
        'tags': ["strategy", "partnerships", "growth", "market entry"],
        'image_url': "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
        'views': 0,
        'likes': 0
    }
]


async def migrate_data():
    """Main migration function"""
    print("🚀 Starting data migration to MySQL...")
    
    try:
        # Create connection pool
        pool = await aiomysql.create_pool(**MYSQL_CONFIG)
        
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                # Migrate blogs
                print("\n📝 Migrating 6 blog articles...")
                for i, blog in enumerate(BLOG_DATA, 1):
                    import json
                    tags_json = json.dumps(blog['tags'])
                    
                    await cursor.execute("""
                        INSERT INTO blogs 
                        (id, title, excerpt, content, category, author, read_time, 
                         featured, tags, image_url, views, likes, is_published)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """, (
                        blog['id'], blog['title'], blog['excerpt'], blog['content'],
                        blog['category'], blog['author'], blog['read_time'],
                        blog['featured'], tags_json, blog['image_url'],
                        blog['views'], blog['likes'], True
                    ))
                    print(f"  ✅ Migrated blog {i}/6: {blog['title'][:50]}...")
                
                print(f"\n✅ Successfully migrated {len(BLOG_DATA)} blog articles!")
                print("\n📊 Migration Summary:")
                print(f"  • Blogs: {len(BLOG_DATA)}")
                print(f"  • Featured: {sum(1 for b in BLOG_DATA if b['featured'])}")
                print(f"  • Categories: {len(set(b['category'] for b in BLOG_DATA))}")
                
        pool.close()
        await pool.wait_closed()
        
        print("\n🎉 Data migration completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        raise


if __name__ == "__main__":
    asyncio.run(migrate_data())
