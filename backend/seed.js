import dotenv from 'dotenv';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const rawPool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const origQuery = rawPool.query.bind(rawPool);
rawPool.query = (text, params) => {
  if (params && params.length > 0) {
    let i = 0;
    text = text.replace(/\?/g, () => `$${++i}`);
    params = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);
  }
  return origQuery(text, params).then(result => [result.rows]);
};

async function run() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf8');
    await rawPool.query(schema);
    try { await rawPool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100) NOT NULL DEFAULT ''`); } catch {}
    console.log('[Seed] Tables ensured');

    const gardens = [
      {
        id: 'g_b5n8d2c1f',
        titleEn: 'Programming HTML with Real Videos',
        titleAr: 'برمجة HTML فيديوهات واقعية',
        titleTr: 'Gerçek Videolarla HTML Programlama',
        descriptionEn: 'Learn HTML programming from scratch with hands-on video tutorials. Build real websites and understand modern web development fundamentals including HTML5, responsive design, and best practices.',
        descriptionAr: 'تعلم برمجة HTML من الصفر فيديوهات تعليمية عملية. قم ببناء مواقع ويب حقيقية وفهم أساسيات تطوير الويب الحديثة بما في ذلك HTML5 والتصميم المتجاوب وأفضل الممارسات.',
        descriptionTr: 'Sıfırdan HTML programlamayı uygulamalı video eğitimleriyle öğrenin. HTML5, duyarlı tasarım ve en iyi uygulamalar dahil olmak üzere modern web geliştirme temellerini anlayarak gerçek web siteleri oluşturun.',
        category: 'Programming',
        priceEGP: 600,
        priceTRY: 180,
        rating: '4.7',
        image: '/uploads/1782238556307-dlvpua.png',
      },
      {
        id: 'g_h4r7t9w1q',
        titleEn: 'Marketing with Real Videos',
        titleAr: 'التسويق فيديوهات واقعية',
        titleTr: 'Gerçek Videolarla Pazarlama',
        descriptionEn: 'Master digital marketing strategies through real-world video case studies. Covers SEO, Google Ads, social media marketing, email marketing, content marketing, and brand building.',
        descriptionAr: 'إتقان استراتيجيات التسويق الرقمي من خلال دراسات حالة فيديو واقعية. يغطي تحسين محركات البحث وإعلانات جوجل والتسويق عبر وسائل التواصل الاجتماعي والتسويق عبر البريد الإلكتروني وتسويق المحتوى وبناء العلامة التجارية.',
        descriptionTr: 'Gerçek dünya video vaka çalışmalarıyla dijital pazarlama stratejilerinde ustalaşın. SEO, Google Ads, sosyal medya pazarlaması, e-posta pazarlaması, içerik pazarlaması ve marka oluşturmayı kapsar.',
        category: 'Marketing',
        priceEGP: 550,
        priceTRY: 165,
        rating: '4.6',
        image: '',
      },
      {
        id: 'g_k7m3x9p2r',
        titleEn: 'English with Real Videos',
        titleAr: 'الإنجليزية فيديوهات واقعية',
        titleTr: 'Gerçek Videolarla İngilizce',
        descriptionEn: 'A practical English course using real-world video content to improve your listening, speaking, and comprehension skills. Includes slow listening exercises, shadowing practice, and everyday conversations.',
        descriptionAr: 'دورة إنجليزية عملية باستخدام محتوى فيديو واقعي لتحسين مهارات الاستماع والتحدث والفهم. تتضمن تمارين استماع بطيء وتمارين التظليل والمحادثات اليومية.',
        descriptionTr: 'Dinleme, konuşma ve anlama becerilerinizi geliştirmek için gerçek dünya video içeriği kullanan pratik bir İngilizce kursu. Yavaş dinleme alıştırmaları, gölgeleme pratiği ve günlük konuşmaları içerir.',
        category: 'Languages',
        priceEGP: 500,
        priceTRY: 150,
        rating: '4.5',
        image: '',
      },
    ];

    for (const g of gardens) {
      await rawPool.query(
        `INSERT INTO gardens (id, titleEn, titleAr, titleTr, descriptionEn, descriptionAr, descriptionTr, category, priceEGP, priceTRY, rating, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           titleEn=EXCLUDED.titleEn, titleAr=EXCLUDED.titleAr, titleTr=EXCLUDED.titleTr,
           descriptionEn=EXCLUDED.descriptionEn, descriptionAr=EXCLUDED.descriptionAr, descriptionTr=EXCLUDED.descriptionTr,
           category=EXCLUDED.category, priceEGP=EXCLUDED.priceEGP, priceTRY=EXCLUDED.priceTRY,
           rating=EXCLUDED.rating, image=EXCLUDED.image`,
        [g.id, g.titleEn, g.titleAr, g.titleTr, g.descriptionEn, g.descriptionAr, g.descriptionTr,
         g.category, g.priceEGP, g.priceTRY, g.rating, g.image]
      );
    }
    console.log('[Seed] 3 gardens inserted');

    const seedData = [
      { id: 's_h_1', gardenId: 'g_b5n8d2c1f', titleEn: 'Introduction to HTML & Web Basics', titleAr: 'مقدمة في HTML وأساسيات الويب', titleTr: 'HTML ve Web Temellerine Giriş', duration: '12:30', section: 'Getting Started', sortOrder: 1, tags: 'HTML,Web,Basics', videoUrl: 'https://www.youtube.com/embed/-CNdRywgF7M' },
      { id: 's_h_2', gardenId: 'g_b5n8d2c1f', titleEn: 'Setting Up Your Development Environment', titleAr: 'إعداد بيئة التطوير', titleTr: 'Geliştirme Ortamını Kurma', duration: '15:00', section: 'Getting Started', sortOrder: 2, tags: 'Tools,Setup', videoUrl: 'https://www.youtube.com/embed/JZugtm7VwFk' },
      { id: 's_h_3', gardenId: 'g_b5n8d2c1f', titleEn: 'HTML Document Structure & Elements', titleAr: 'هيكل مستند HTML والعناصر', titleTr: 'HTML Belge Yapısı ve Öğeler', duration: '18:45', section: 'Getting Started', sortOrder: 3, tags: 'HTML,Structure', videoUrl: 'https://www.youtube.com/embed/h30Bvg4MhY0' },
      { id: 's_h_4', gardenId: 'g_b5n8d2c1f', titleEn: 'Headings, Paragraphs & Text Formatting', titleAr: 'العناوين والفقرات وتنسيق النص', titleTr: 'Başlıklar, Paragraflar ve Metin Biçimlendirme', duration: '14:20', section: 'HTML Fundamentals', sortOrder: 4, tags: 'HTML,Text,Formatting', videoUrl: 'https://www.youtube.com/embed/urT4pdM3sr4' },
      { id: 's_h_5', gardenId: 'g_b5n8d2c1f', titleEn: 'Links, Images & Multimedia', titleAr: 'الروابط والصور والوسائط المتعددة', titleTr: 'Bağlantılar, Görseller ve Multimedya', duration: '20:10', section: 'HTML Fundamentals', sortOrder: 5, tags: 'HTML,Links,Images', videoUrl: 'https://www.youtube.com/embed/gOioxltfh48' },
      { id: 's_h_6', gardenId: 'g_b5n8d2c1f', titleEn: 'Lists: Ordered, Unordered & Description', titleAr: 'القوائم: المرتبة وغير المرتبة والوصفية', titleTr: 'Listeler: Sıralı, Sırasız ve Açıklamalı', duration: '11:30', section: 'HTML Fundamentals', sortOrder: 6, tags: 'HTML,Lists', videoUrl: 'https://www.youtube.com/embed/oUm7rvMUNq8' },
      { id: 's_h_7', gardenId: 'g_b5n8d2c1f', titleEn: 'Tables & Tabular Data', titleAr: 'الجداول والبيانات الجدولية', titleTr: 'Tablolar ve Tablo Verileri', duration: '16:40', section: 'HTML Fundamentals', sortOrder: 7, tags: 'HTML,Tables', videoUrl: 'https://www.youtube.com/embed/iDA0kF5lrVk' },
      { id: 's_h_8', gardenId: 'g_b5n8d2c1f', titleEn: 'Forms & Input Elements', titleAr: 'النماذج وعناصر الإدخال', titleTr: 'Formlar ve Giriş Öğeleri', duration: '22:15', section: 'Interactive HTML', sortOrder: 8, tags: 'HTML,Forms,Input', videoUrl: 'https://www.youtube.com/embed/2O8pkybH6po' },
      { id: 's_h_9', gardenId: 'g_b5n8d2c1f', titleEn: 'Form Validation & Advanced Input Types', titleAr: 'التحقق من صحة النموذج وأنواع الإدخال المتقدمة', titleTr: 'Form Doğrulama ve Gelişmiş Giriş Türleri', duration: '19:50', section: 'Interactive HTML', sortOrder: 9, tags: 'HTML,Forms,Validation', videoUrl: 'https://www.youtube.com/embed/dymj6TDzMpE' },
      { id: 's_h_10', gardenId: 'g_b5n8d2c1f', titleEn: 'Semantic HTML5 Elements', titleAr: 'عناصر HTML5 الدلالية', titleTr: 'Semantik HTML5 Öğeleri', duration: '17:25', section: 'Interactive HTML', sortOrder: 10, tags: 'HTML5,Semantic', videoUrl: 'https://www.youtube.com/embed/JNFdCgmMkPk' },
      { id: 's_h_11', gardenId: 'g_b5n8d2c1f', titleEn: 'HTML5 APIs: Canvas & SVG', titleAr: 'واجهات برمجة تطبيقات HTML5: كانفاس وSVG', titleTr: 'HTML5 API: Canvas ve SVG', duration: '25:00', section: 'Advanced HTML', sortOrder: 11, tags: 'HTML5,Canvas,SVG', videoUrl: 'https://www.youtube.com/embed/Yvz_axxWG4Y' },
      { id: 's_h_12', gardenId: 'g_b5n8d2c1f', titleEn: 'Audio & Video Embedding', titleAr: 'تضمين الصوت والفيديو', titleTr: 'Ses ve Video Ekleme', duration: '13:35', section: 'Advanced HTML', sortOrder: 12, tags: 'HTML5,Audio,Video', videoUrl: 'https://www.youtube.com/embed/uof_zYxtnp0' },
      { id: 's_h_13', gardenId: 'g_b5n8d2c1f', titleEn: 'HTML Best Practices & Accessibility', titleAr: 'أفضل ممارسات HTML وإمكانية الوصول', titleTr: 'HTML En İyi Uygulamalar ve Erişilebilirlik', duration: '16:10', section: 'Advanced HTML', sortOrder: 13, tags: 'HTML,Accessibility,Best Practices', videoUrl: 'https://www.youtube.com/embed/_9zMrs8_XHM' },
      { id: 's_h_14', gardenId: 'g_b5n8d2c1f', titleEn: 'Responsive Design with HTML', titleAr: 'التصميم المتجاوب مع HTML', titleTr: 'HTML ile Duyarlı Tasarım', duration: '14:45', section: 'Advanced HTML', sortOrder: 14, tags: 'Responsive,HTML5', videoUrl: 'https://www.youtube.com/embed/srvUrASNj0s' },
      { id: 's_h_15', gardenId: 'g_b5n8d2c1f', titleEn: 'Building a Complete Landing Page', titleAr: 'بناء صفحة هبوط كاملة', titleTr: 'Tam Bir Açılış Sayfası Oluşturma', duration: '28:30', section: 'Projects', sortOrder: 15, tags: 'Project,HTML,CSS', videoUrl: 'https://www.youtube.com/embed/zizm-rEGlgA' },
      { id: 's_h_16', gardenId: 'g_b5n8d2c1f', titleEn: 'Building a Multi-Page Website', titleAr: 'بناء موقع ويب متعدد الصفحات', titleTr: 'Çok Sayfalı Bir Web Sitesi Oluşturma', duration: '32:00', section: 'Projects', sortOrder: 16, tags: 'Project,HTML', videoUrl: 'https://www.youtube.com/embed/iXSSHlOe47s' },
      { id: 's_h_17', gardenId: 'g_b5n8d2c1f', titleEn: 'HTML Email Templates', titleAr: 'قوالب البريد الإلكتروني HTML', titleTr: 'HTML E-posta Şablonları', duration: '18:20', section: 'Projects', sortOrder: 17, tags: 'Email,HTML', videoUrl: 'https://www.youtube.com/embed/Fazo5hXEdv4' },
      { id: 's_h_18', gardenId: 'g_b5n8d2c1f', titleEn: 'SEO Basics for HTML', titleAr: 'أساسيات تحسين محركات البحث لـHTML', titleTr: 'HTML için SEO Temelleri', duration: '15:50', section: 'Advanced HTML', sortOrder: 18, tags: 'SEO,HTML', videoUrl: 'https://www.youtube.com/embed/ORazAn-Iigg' },
      { id: 's_h_19', gardenId: 'g_b5n8d2c1f', titleEn: 'HTML Meta Tags & Open Graph', titleAr: 'علامات HTML الوصفية وOpen Graph', titleTr: 'HTML Meta Etiketleri ve Open Graph', duration: '12:10', section: 'Advanced HTML', sortOrder: 19, tags: 'Meta,SEO,HTML', videoUrl: 'https://www.youtube.com/embed/bi5bfH_gVWE' },
      { id: 's_h_20', gardenId: 'g_b5n8d2c1f', titleEn: 'Course Wrap-Up & Next Steps', titleAr: 'ختام الدورة والخطوات التالية', titleTr: 'Kurs Özeti ve Sonraki Adımlar', duration: '10:00', section: 'Projects', sortOrder: 20, tags: 'Wrap-Up', videoUrl: 'https://www.youtube.com/embed/HD13eq_Pmp8' },
      { id: 's_m_1', gardenId: 'g_h4r7t9w1q', titleEn: 'Introduction to Digital Marketing', titleAr: 'مقدمة في التسويق الرقمي', titleTr: 'Dijital Pazarlamaya Giriş', duration: '15:00', section: 'Marketing Fundamentals', sortOrder: 1, tags: 'Marketing,Digital', videoUrl: 'https://www.youtube.com/embed/6RNJpItArSQ' },
      { id: 's_m_2', gardenId: 'g_h4r7t9w1q', titleEn: 'SEO Fundamentals - How Search Engines Work', titleAr: 'أساسيات تحسين محركات البحث - كيف تعمل محركات البحث', titleTr: 'SEO Temelleri - Arama Motorları Nasıl Çalışır', duration: '22:30', section: 'Marketing Fundamentals', sortOrder: 2, tags: 'SEO,Search', videoUrl: 'https://www.youtube.com/embed/OYRkIGaP80M' },
      { id: 's_m_3', gardenId: 'g_h4r7t9w1q', titleEn: 'Keyword Research & Strategy', titleAr: 'بحث الكلمات المفتاحية والاستراتيجية', titleTr: 'Anahtar Kelime Araştırması ve Stratejisi', duration: '18:45', section: 'Marketing Fundamentals', sortOrder: 3, tags: 'SEO,Keywords', videoUrl: 'https://www.youtube.com/embed/VG4l39h_qFU' },
      { id: 's_m_4', gardenId: 'g_h4r7t9w1q', titleEn: 'On-Page SEO Optimization', titleAr: 'تحسين SEO على الصفحة', titleTr: 'Sayfa İçi SEO Optimizasyonu', duration: '20:15', section: 'SEO & Search', sortOrder: 4, tags: 'SEO,On-Page', videoUrl: 'https://www.youtube.com/embed/cqDJYffvqFE' },
      { id: 's_m_5', gardenId: 'g_h4r7t9w1q', titleEn: 'Off-Page SEO & Link Building', titleAr: 'SEO خارج الصفحة وبناء الروابط', titleTr: 'Sayfa Dışı SEO ve Bağlantı Oluşturma', duration: '17:30', section: 'SEO & Search', sortOrder: 5, tags: 'SEO,Link Building', videoUrl: 'https://www.youtube.com/embed/9Zp9cSyOkkY' },
      { id: 's_m_6', gardenId: 'g_h4r7t9w1q', titleEn: 'Google Ads & PPC Campaigns', titleAr: 'إعلانات جوجل وحملات الدفع بالنقرة', titleTr: 'Google Ads ve Tıklama Başına Ödeme Kampanyaları', duration: '25:00', section: 'SEO & Search', sortOrder: 6, tags: 'Google Ads,PPC', videoUrl: 'https://www.youtube.com/embed/i3-Dvy4Wjb4' },
      { id: 's_m_7', gardenId: 'g_h4r7t9w1q', titleEn: 'Social Media Marketing Strategy', titleAr: 'استراتيجية التسويق عبر وسائل التواصل الاجتماعي', titleTr: 'Sosyal Medya Pazarlama Stratejisi', duration: '21:10', section: 'Social Media', sortOrder: 7, tags: 'Social Media,Strategy', videoUrl: 'https://www.youtube.com/embed/InUm7A-Ws-M' },
      { id: 's_m_8', gardenId: 'g_h4r7t9w1q', titleEn: 'Facebook & Instagram Advertising', titleAr: 'الإعلان على فيسبوك وانستغرام', titleTr: 'Facebook ve Instagram Reklamcılığı', duration: '24:40', section: 'Social Media', sortOrder: 8, tags: 'Facebook,Instagram,Ads', videoUrl: 'https://www.youtube.com/embed/0R_3iarc8IA' },
      { id: 's_m_9', gardenId: 'g_h4r7t9w1q', titleEn: 'LinkedIn & Twitter Marketing', titleAr: 'التسويق عبر لينكد إن وتويتر', titleTr: 'LinkedIn ve Twitter Pazarlaması', duration: '16:55', section: 'Social Media', sortOrder: 9, tags: 'LinkedIn,Twitter', videoUrl: 'https://www.youtube.com/embed/OrbhGa4aeAM' },
      { id: 's_m_10', gardenId: 'g_h4r7t9w1q', titleEn: 'Content Marketing & Blogging', titleAr: 'تسويق المحتوى والتدوين', titleTr: 'İçerik Pazarlaması ve Blog Yazarlığı', duration: '19:20', section: 'Content Marketing', sortOrder: 10, tags: 'Content,Marketing', videoUrl: 'https://www.youtube.com/embed/McD5I1PavK8' },
      { id: 's_m_11', gardenId: 'g_h4r7t9w1q', titleEn: 'Email Marketing & Newsletters', titleAr: 'التسويق عبر البريد الإلكتروني والنشرات البريدية', titleTr: 'E-posta Pazarlaması ve Bültenler', duration: '18:05', section: 'Content Marketing', sortOrder: 11, tags: 'Email,Marketing', videoUrl: 'https://www.youtube.com/embed/_rm4SNmhDXA' },
      { id: 's_m_12', gardenId: 'g_h4r7t9w1q', titleEn: 'Video Marketing & Content', titleAr: 'التسويق عبر الفيديو والمحتوى', titleTr: 'Video Pazarlaması ve İçerik', duration: '23:15', section: 'Content Marketing', sortOrder: 12, tags: 'Video,Content', videoUrl: 'https://www.youtube.com/embed/vV3g5VuSrIQ' },
      { id: 's_m_13', gardenId: 'g_h4r7t9w1q', titleEn: 'Marketing Analytics & KPIs', titleAr: 'تحليلات التسويق ومؤشرات الأداء', titleTr: 'Pazarlama Analitiği ve KPI', duration: '20:30', section: 'Analytics & Optimization', sortOrder: 13, tags: 'Analytics,KPI', videoUrl: 'https://www.youtube.com/embed/bsMUsPCblS8' },
      { id: 's_m_14', gardenId: 'g_h4r7t9w1q', titleEn: 'A/B Testing & Conversion Optimization', titleAr: 'اختبار A/B وتحسين التحويل', titleTr: 'A/B Testi ve Dönüşüm Optimizasyonu', duration: '16:40', section: 'Analytics & Optimization', sortOrder: 14, tags: 'Testing,Conversion', videoUrl: 'https://www.youtube.com/embed/ExV24jFfi_g' },
      { id: 's_m_15', gardenId: 'g_h4r7t9w1q', titleEn: 'Google Analytics Mastery', titleAr: 'إتقان جوجل أناليتكس', titleTr: 'Google Analytics Ustalığı', duration: '27:50', section: 'Analytics & Optimization', sortOrder: 15, tags: 'Google Analytics,Tools', videoUrl: 'https://www.youtube.com/embed/yleOEYiQohI' },
      { id: 's_m_16', gardenId: 'g_h4r7t9w1q', titleEn: 'Brand Building & Positioning', titleAr: 'بناء العلامة التجارية وتحديد المواقع', titleTr: 'Marka Oluşturma ve Konumlandırma', duration: '14:25', section: 'Brand & Strategy', sortOrder: 16, tags: 'Brand,Strategy', videoUrl: 'https://www.youtube.com/embed/3dW5RJxX_gQ' },
      { id: 's_m_17', gardenId: 'g_h4r7t9w1q', titleEn: 'Influencer Marketing Strategies', titleAr: 'استراتيجيات التسويق عبر المؤثرين', titleTr: 'Influencer Pazarlama Stratejileri', duration: '13:40', section: 'Brand & Strategy', sortOrder: 17, tags: 'Influencer,Marketing', videoUrl: 'https://www.youtube.com/embed/g-UuWvyOb1w' },
      { id: 's_m_18', gardenId: 'g_h4r7t9w1q', titleEn: 'Marketing Budget Planning', titleAr: 'تخطيط ميزانية التسويق', titleTr: 'Pazarlama Bütçesi Planlaması', duration: '17:15', section: 'Brand & Strategy', sortOrder: 18, tags: 'Budget,Planning', videoUrl: 'https://www.youtube.com/embed/5altc8xTzBg' },
      { id: 's_m_19', gardenId: 'g_h4r7t9w1q', titleEn: 'Building a Marketing Campaign', titleAr: 'بناء حملة تسويقية', titleTr: 'Pazarlama Kampanyası Oluşturma', duration: '30:00', section: 'Campaign Projects', sortOrder: 19, tags: 'Campaign,Project', videoUrl: 'https://www.youtube.com/embed/-dCls0VoY58' },
      { id: 's_m_20', gardenId: 'g_h4r7t9w1q', titleEn: 'Course Wrap-Up & Marketing Career Path', titleAr: 'ختام الدورة والمسار المهني في التسويق', titleTr: 'Kurs Özeti ve Pazarlama Kariyer Yolu', duration: '11:30', section: 'Campaign Projects', sortOrder: 20, tags: 'Wrap-Up,Career', videoUrl: 'https://www.youtube.com/embed/DUAxT7RNGZ4' },
      { id: 's_e_1', gardenId: 'g_k7m3x9p2r', titleEn: 'Why Learn English? Mindset & Goals', titleAr: 'لماذا نتعلم الإنجليزية؟ العقلية والأهداف', titleTr: 'Neden İngilizce Öğrenmeli? Zihniyet ve Hedefler', duration: '12:00', section: 'Foundations', sortOrder: 1, tags: 'Introduction,Goals', videoUrl: 'https://www.youtube.com/embed/QxQUapA-2w4' },
      { id: 's_e_2', gardenId: 'g_k7m3x9p2r', titleEn: 'English Alphabet & Pronunciation Basics', titleAr: 'الأبجدية الإنجليزية وأساسيات النطق', titleTr: 'İngiliz Alfabesi ve Telaffuz Temelleri', duration: '14:30', section: 'Foundations', sortOrder: 2, tags: 'Pronunciation,Alphabet', videoUrl: 'https://www.youtube.com/embed/ZlO8Si2OkKk' },
      { id: 's_e_3', gardenId: 'g_k7m3x9p2r', titleEn: 'Common Greetings & Introductions', titleAr: 'التحيات الشائعة والتعارف', titleTr: 'Yaygın Selamlaşmalar ve Tanışmalar', duration: '16:15', section: 'Foundations', sortOrder: 3, tags: 'Greetings,Conversation', videoUrl: 'https://www.youtube.com/embed/JFmLF_xOAog' },
      { id: 's_e_4', gardenId: 'g_k7m3x9p2r', titleEn: 'Numbers, Dates & Time Expressions', titleAr: 'الأرقام والتواريخ والتعبيرات الزمنية', titleTr: 'Sayılar, Tarihler ve Zaman İfadeleri', duration: '18:40', section: 'Everyday English', sortOrder: 4, tags: 'Numbers,Time', videoUrl: 'https://www.youtube.com/embed/yay1OUgMSlo' },
      { id: 's_e_5', gardenId: 'g_k7m3x9p2r', titleEn: 'Describing People & Places', titleAr: 'وصف الأشخاص والأماكن', titleTr: 'İnsanları ve Yerleri Tanımlama', duration: '19:20', section: 'Everyday English', sortOrder: 5, tags: 'Description,Vocabulary', videoUrl: 'https://www.youtube.com/embed/x0YQX7gGkQs' },
      { id: 's_e_6', gardenId: 'g_k7m3x9p2r', titleEn: 'Food, Shopping & Restaurants', titleAr: 'الطعام والتسوق والمطاعم', titleTr: 'Yemek, Alışveriş ve Restoranlar', duration: '21:05', section: 'Everyday English', sortOrder: 6, tags: 'Food,Shopping', videoUrl: 'https://www.youtube.com/embed/4C4wlOAscvY' },
      { id: 's_e_7', gardenId: 'g_k7m3x9p2r', titleEn: 'Present Simple & Continuous Tenses', titleAr: 'زمن المضارع البسيط والمستمر', titleTr: 'Geniş Zaman ve Şimdiki Zaman', duration: '23:30', section: 'Grammar', sortOrder: 7, tags: 'Grammar,Tenses', videoUrl: 'https://www.youtube.com/embed/X6LuWwb9whM' },
      { id: 's_e_8', gardenId: 'g_k7m3x9p2r', titleEn: 'Past Tenses: Simple, Continuous & Perfect', titleAr: 'أزمنة الماضي: البسيط والمستمر والتام', titleTr: 'Geçmiş Zamanlar: Basit, Sürekli ve Mükemmel', duration: '25:10', section: 'Grammar', sortOrder: 8, tags: 'Grammar,Past Tense', videoUrl: 'https://www.youtube.com/embed/OqOrfiv2Sfg' },
      { id: 's_e_9', gardenId: 'g_k7m3x9p2r', titleEn: 'Future Tenses & Plans', titleAr: 'أزمنة المستقبل والخطط', titleTr: 'Gelecek Zamanlar ve Planlar', duration: '20:45', section: 'Grammar', sortOrder: 9, tags: 'Grammar,Future', videoUrl: 'https://www.youtube.com/embed/uqpkkMR7EII' },
      { id: 's_e_10', gardenId: 'g_k7m3x9p2r', titleEn: 'Listening Practice: Slow & Clear Speech', titleAr: 'تمارين الاستماع: كلام بطيء وواضح', titleTr: 'Dinleme Pratiği: Yavaş ve Net Konuşma', duration: '22:00', section: 'Listening & Speaking', sortOrder: 10, tags: 'Listening,Slow Speech', videoUrl: 'https://www.youtube.com/embed/8vPXIsAqmjg' },
      { id: 's_e_11', gardenId: 'g_k7m3x9p2r', titleEn: 'Shadowing Technique for Fluency', titleAr: 'تقنية التظليل للطلاقة', titleTr: 'Akıcılık için Gölgeleme Tekniği', duration: '17:35', section: 'Listening & Speaking', sortOrder: 11, tags: 'Speaking,Shadowing', videoUrl: 'https://www.youtube.com/embed/cBCh2bAu2aA' },
      { id: 's_e_12', gardenId: 'g_k7m3x9p2r', titleEn: 'Everyday Conversations & Role Plays', titleAr: 'محادثات يومية ولعب الأدوار', titleTr: 'Günlük Konuşmalar ve Rol Oyunları', duration: '26:15', section: 'Listening & Speaking', sortOrder: 12, tags: 'Conversation,Roles', videoUrl: 'https://www.youtube.com/embed/vpLAEWlkL4k' },
      { id: 's_e_13', gardenId: 'g_k7m3x9p2r', titleEn: 'Reading Comprehension: News & Articles', titleAr: 'فهم القراءة: الأخبار والمقالات', titleTr: 'Okuma Anlama: Haberler ve Makaleler', duration: '18:50', section: 'Reading & Writing', sortOrder: 13, tags: 'Reading,Articles', videoUrl: 'https://www.youtube.com/embed/ORHniANns7k' },
      { id: 's_e_14', gardenId: 'g_k7m3x9p2r', titleEn: 'Writing Emails & Messages', titleAr: 'كتابة البريد الإلكتروني والرسائل', titleTr: 'E-posta ve Mesaj Yazma', duration: '16:25', section: 'Reading & Writing', sortOrder: 14, tags: 'Writing,Email', videoUrl: 'https://www.youtube.com/embed/_Mv7fBqauvc' },
      { id: 's_e_15', gardenId: 'g_k7m3x9p2r', titleEn: 'Vocabulary Building: 100 Essential Words', titleAr: 'بناء المفردات: 100 كلمة أساسية', titleTr: 'Kelime Dağarcığı: 100 Temel Kelime', duration: '24:10', section: 'Reading & Writing', sortOrder: 15, tags: 'Vocabulary,Words', videoUrl: 'https://www.youtube.com/embed/hmhKtWZor7k' },
      { id: 's_e_16', gardenId: 'g_k7m3x9p2r', titleEn: 'Phrasal Verbs & Idioms', titleAr: 'الأفعال المركبة والتعابير الاصطلاحية', titleTr: 'Phrasal Verbs ve Deyimler', duration: '19:40', section: 'Advanced English', sortOrder: 16, tags: 'Phrasal Verbs,Idioms', videoUrl: 'https://www.youtube.com/embed/ZDRz6Xn8Ha0' },
      { id: 's_e_17', gardenId: 'g_k7m3x9p2r', titleEn: 'Conditionals & Reported Speech', titleAr: 'الجمل الشرطية والكلام المنقول', titleTr: 'Koşul Cümleleri ve Aktarılan Konuşma', duration: '21:55', section: 'Advanced English', sortOrder: 17, tags: 'Grammar,Conditionals', videoUrl: 'https://www.youtube.com/embed/pvoqkQHb3lo' },
      { id: 's_e_18', gardenId: 'g_k7m3x9p2r', titleEn: 'Business English & Meetings', titleAr: 'الإنجليزية للأعمال والاجتماعات', titleTr: 'İş İngilizcesi ve Toplantılar', duration: '23:20', section: 'Advanced English', sortOrder: 18, tags: 'Business,Meetings', videoUrl: 'https://www.youtube.com/embed/Jpz9xUJ9FWQ' },
      { id: 's_e_19', gardenId: 'g_k7m3x9p2r', titleEn: 'English for Travel & Tourism', titleAr: 'الإنجليزية للسفر والسياحة', titleTr: 'Seyahat ve Turizm için İngilizce', duration: '15:30', section: 'Practical English', sortOrder: 19, tags: 'Travel,Tourism', videoUrl: 'https://www.youtube.com/embed/pfRw6wg-QqE' },
      { id: 's_e_20', gardenId: 'g_k7m3x9p2r', titleEn: 'Final Assessment & Fluency Check', titleAr: 'التقييم النهائي وفحص الطلاقة', titleTr: 'Final Değerlendirmesi ve Akıcılık Kontrolü', duration: '28:00', section: 'Practical English', sortOrder: 20, tags: 'Assessment,Fluency', videoUrl: 'https://www.youtube.com/embed/RTAwB-5Fv48' },
    ];

    for (const s of seedData) {
      await rawPool.query(
        `INSERT INTO seeds (id, gardenId, titleEn, titleAr, titleTr, duration, videoUrl, status, section, sortOrder)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'bloomed', $8, $9)
         ON CONFLICT (id) DO UPDATE SET
           gardenId=EXCLUDED.gardenId, titleEn=EXCLUDED.titleEn, titleAr=EXCLUDED.titleAr, titleTr=EXCLUDED.titleTr,
           duration=EXCLUDED.duration, videoUrl=EXCLUDED.videoUrl,
           section=EXCLUDED.section, sortOrder=EXCLUDED.sortOrder`,
        [s.id, s.gardenId, s.titleEn, s.titleAr, s.titleTr, s.duration, s.videoUrl, s.section, s.sortOrder]
      );
      if (s.tags) {
        const tags = s.tags.split(',');
        for (const tag of tags) {
          await rawPool.query(
            'INSERT INTO seed_tags (seedId, tag) VALUES ($1, $2) ON CONFLICT (seedId, tag) DO UPDATE SET tag=EXCLUDED.tag',
            [s.id, tag.trim()]
          );
        }
      }
    }
    console.log('[Seed] 60 seeds inserted');

    const users = [
      {
        id: 'u_0xosos8w3',
        email: 'mazeneika2009@gmail.com',
        phone: '000',
        name: 'طالب',
        passwordHash: 'M',
        isVerified: 1,
        verificationCode: '',
        createdAt: '2026-06-22 04:34:32',
        currentSessionId: null,
        country: 'Egypt',
        paidGardens: JSON.stringify(['g_h4r7t9w1q', 'g_k7m3x9p2r', 'g_b5n8d2c1f']),
      },
    ];

    for (const u of users) {
      await rawPool.query(
        `INSERT INTO users (id, email, phone, name, passwordHash, isVerified, verificationCode, createdAt, current_session_id, country, paidGardens)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           email=EXCLUDED.email, phone=EXCLUDED.phone, name=EXCLUDED.name,
           passwordHash=EXCLUDED.passwordHash, isVerified=EXCLUDED.isVerified,
           verificationCode=EXCLUDED.verificationCode, country=EXCLUDED.country,
           paidGardens=EXCLUDED.paidGardens`,
        [u.id, u.email, u.phone, u.name, u.passwordHash, u.isVerified, u.verificationCode, u.createdAt, u.currentSessionId, u.country || '', u.paidGardens]
      );
    }
    console.log('[Seed] 1 user inserted');

    const payments = [
      { id: 'TXN_EG_PX6B4PDFV', userId: 'u_0xosos8w3', userEmail: 'mazeneika2009@gmail.com', gardenId: 'g_h4r7t9w1q', currency: 'EGP', amount: 550, gateway: 'instapay', paymentMethod: 'InstaPay', screenshot: null, status: 'approved', timestamp: '2026-06-22 05:09:21' },
      { id: 'TXN_EG_CGIO7ICI2', userId: 'u_0xosos8w3', userEmail: 'mazeneika2009@gmail.com', gardenId: 'g_k7m3x9p2r', currency: 'EGP', amount: 500, gateway: 'instapay', paymentMethod: 'InstaPay', screenshot: null, status: 'approved', timestamp: '2026-06-22 05:23:02' },
      { id: 'TXN_EG_F6R89KRI7', userId: 'u_0xosos8w3', userEmail: 'mazeneika2009@gmail.com', gardenId: 'g_b5n8d2c1f', currency: 'EGP', amount: 600, gateway: 'instapay', paymentMethod: 'InstaPay', screenshot: null, status: 'approved', timestamp: '2026-06-22 05:35:00' },
    ];

    for (const p of payments) {
      await rawPool.query(
        `INSERT INTO payments (id, userId, userEmail, gardenId, currency, amount, gateway, paymentMethod, screenshot, status, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           userId=EXCLUDED.userId, userEmail=EXCLUDED.userEmail, gardenId=EXCLUDED.gardenId,
           currency=EXCLUDED.currency, amount=EXCLUDED.amount, gateway=EXCLUDED.gateway,
           paymentMethod=EXCLUDED.paymentMethod, screenshot=EXCLUDED.screenshot,
           status=EXCLUDED.status`,
        [p.id, p.userId, p.userEmail, p.gardenId, p.currency, p.amount, p.gateway, p.paymentMethod, p.screenshot, p.status, p.timestamp]
      );
    }
    console.log('[Seed] 3 payments inserted');

    const quizQuestions = [
      { id: 'qq_h_1', seedId: 's_h_1', questionEn: 'What does HTML stand for?', questionAr: 'ماذا تعني HTML؟', questionTr: 'HTML ne anlama gelir?', optionsEn: JSON.stringify(['HyperText Markup Language', 'HighText Machine Language', 'HyperTool Markup Language', 'HomeTool Markup Language']), optionsAr: JSON.stringify(['لغة ترميز النص التشعبي', 'لغة آلة النص العالي', 'لغة ترميز الأدوات', 'لغة ترميز المنزل']), optionsTr: JSON.stringify(['Köprü Metni İşaretleme Dili', 'Yüksek Metin Makine Dili', 'Araç İşaretleme Dili', 'Ev Aracı İşaretleme Dili']), correctIndex: 0 },
      { id: 'qq_h_2', seedId: 's_h_1', questionEn: 'Which tag is used for the largest heading?', questionAr: 'ما هي العلامة المستخدمة لأكبر عنوان؟', questionTr: 'En büyük başlık için hangi etiket kullanılır?', optionsEn: JSON.stringify(['<h6>', '<heading>', '<h1>', '<head>']), optionsAr: JSON.stringify(['<h6>', '<heading>', '<h1>', '<head>']), optionsTr: JSON.stringify(['<h6>', '<heading>', '<h1>', '<head>']), correctIndex: 2 },
      { id: 'qq_h_3', seedId: 's_h_3', questionEn: 'What is the correct HTML element for inserting a line break?', questionAr: 'ما هو عنصر HTML الصحيح لإدراج فاصل أسطر؟', questionTr: 'Satır sonu eklemek için doğru HTML öğesi hangisidir?', optionsEn: JSON.stringify(['<break>', '<lb>', '<br>', '<newline>']), optionsAr: JSON.stringify(['<break>', '<lb>', '<br>', '<newline>']), optionsTr: JSON.stringify(['<break>', '<lb>', '<br>', '<newline>']), correctIndex: 2 },
      { id: 'qq_h_4', seedId: 's_h_5', questionEn: 'Which attribute is used to specify the URL of an image?', questionAr: 'ما هي السمة المستخدمة لتحديد عنوان URL للصورة؟', questionTr: 'Bir görselin URL\'sini belirtmek için hangi özellik kullanılır?', optionsEn: JSON.stringify(['href', 'src', 'link', 'url']), optionsAr: JSON.stringify(['href', 'src', 'link', 'url']), optionsTr: JSON.stringify(['href', 'src', 'link', 'url']), correctIndex: 1 },
      { id: 'qq_h_5', seedId: 's_h_8', questionEn: 'Which input type creates a password field?', questionAr: 'أي نوع إدخال ينشئ حقل كلمة مرور؟', questionTr: 'Hangi girdi türü bir parola alanı oluşturur?', optionsEn: JSON.stringify(['<input type="text">', '<input type="password">', '<input type="secret">', '<input type="hidden">']), optionsAr: JSON.stringify(['نص', 'كلمة مرور', 'سري', 'مخفي']), optionsTr: JSON.stringify(['metin', 'parola', 'gizli', 'gizlenmiş']), correctIndex: 1 },
      { id: 'qq_h_6', seedId: 's_h_15', questionEn: 'What is the purpose of a landing page?', questionAr: 'ما هو الغرض من صفحة الهبوط؟', questionTr: 'Açılış sayfasının amacı nedir?', optionsEn: JSON.stringify(['To show all products', 'To capture leads or conversions', 'To display contact info', 'To load the homepage']), optionsAr: JSON.stringify(['عرض جميع المنتجات', 'جمع العملاء المحتملين أو التحويلات', 'عرض معلومات الاتصال', 'تحميل الصفحة الرئيسية']), optionsTr: JSON.stringify(['Tüm ürünleri göstermek', 'Potansiyel müşteri veya dönüşüm toplamak', 'İletişim bilgilerini göstermek', 'Ana sayfayı yüklemek']), correctIndex: 1 },
      { id: 'qq_m_1', seedId: 's_m_1', questionEn: 'What is digital marketing?', questionAr: 'ما هو التسويق الرقمي؟', questionTr: 'Dijital pazarlama nedir?', optionsEn: JSON.stringify(['Marketing using digital channels', 'Marketing only on TV', 'Print advertising', 'Billboard advertising']), optionsAr: JSON.stringify(['التسويق باستخدام القنوات الرقمية', 'التسويق فقط على التلفزيون', 'الإعلانات المطبوعة', 'الإعلانات على اللوحات الإعلانية']), optionsTr: JSON.stringify(['Dijital kanalları kullanarak pazarlama', 'Sadece TV\'de pazarlama', 'Basılı reklamcılık', 'Reklam panosu reklamcılığı']), correctIndex: 0 },
      { id: 'qq_m_2', seedId: 's_m_2', questionEn: 'What does SEO stand for?', questionAr: 'ماذا تعني SEO؟', questionTr: 'SEO ne anlama gelir?', optionsEn: JSON.stringify(['Search Engine Optimization', 'Social Engagement Online', 'Site Evaluation Output', 'Systematic Entry Overview']), optionsAr: JSON.stringify(['تحسين محرك البحث', 'المشاركة الاجتماعية عبر الإنترنت', 'مخرجات تقييم الموقع', 'نظرة عامة على الإدخال المنهجي']), optionsTr: JSON.stringify(['Arama Motoru Optimizasyonu', 'Çevrimiçi Sosyal Etkileşim', 'Site Değerlendirme Çıktısı', 'Sistematik Giriş Genel Bakış']), correctIndex: 0 },
      { id: 'qq_m_3', seedId: 's_m_7', questionEn: 'Which platform has the largest user base for social media marketing?', questionAr: 'أي منصة لديها أكبر قاعدة مستخدمين للتسويق عبر وسائل التواصل الاجتماعي؟', questionTr: 'Sosyal medya pazarlaması için en büyük kullanıcı tabanına hangi platform sahiptir?', optionsEn: JSON.stringify(['Twitter', 'LinkedIn', 'Facebook', 'Pinterest']), optionsAr: JSON.stringify(['تويتر', 'لينكد إن', 'فيسبوك', 'بينتريست']), optionsTr: JSON.stringify(['Twitter', 'LinkedIn', 'Facebook', 'Pinterest']), correctIndex: 2 },
      { id: 'qq_m_4', seedId: 's_m_13', questionEn: 'What is a KPI in marketing?', questionAr: 'ما هو KPI في التسويق؟', questionTr: 'Pazarlamada KPI nedir?', optionsEn: JSON.stringify(['Key Performance Indicator', 'Known Product Index', 'Key Planning Initiative', 'Knowledge Process Integration']), optionsAr: JSON.stringify(['مؤشر الأداء الرئيسي', 'مؤشر المنتج المعروف', 'مبادرة التخطيط الرئيسية', 'تكامل عملية المعرفة']), optionsTr: JSON.stringify(['Anahtar Performans Göstergesi', 'Bilinen Ürün Endeksi', 'Anahtar Planlama Girişimi', 'Bilgi Süreci Entegrasyonu']), correctIndex: 0 },
      { id: 'qq_m_5', seedId: 's_m_14', questionEn: 'What is A/B testing?', questionAr: 'ما هو اختبار A/B؟', questionTr: 'A/B testi nedir?', optionsEn: JSON.stringify(['Testing two versions to compare performance', 'Testing one version multiple times', 'Testing with group A only', 'Testing with group B only']), optionsAr: JSON.stringify(['اختبار نسختين لمقارنة الأداء', 'اختبار نسخة واحدة عدة مرات', 'الاختبار مع المجموعة أ فقط', 'الاختبار مع المجموعة ب فقط']), optionsTr: JSON.stringify(['Performansı karşılaştırmak için iki sürümü test etme', 'Bir sürümü birden çok kez test etme', 'Sadece A grubuyla test etme', 'Sadece B grubuyla test etme']), correctIndex: 0 },
      { id: 'qq_m_6', seedId: 's_m_19', questionEn: 'What is the first step in building a marketing campaign?', questionAr: 'ما هي الخطوة الأولى في بناء حملة تسويقية؟', questionTr: 'Bir pazarlama kampanyası oluşturmanın ilk adımı nedir?', optionsEn: JSON.stringify(['Creating ads', 'Defining goals and target audience', 'Setting a budget', 'Measuring results']), optionsAr: JSON.stringify(['إنشاء الإعلانات', 'تحديد الأهداف والجمهور المستهدف', 'تحديد الميزانية', 'قياس النتائج']), optionsTr: JSON.stringify(['Reklam oluşturma', 'Hedefleri ve hedef kitleyi tanımlama', 'Bütçe belirleme', 'Sonuçları ölçme']), correctIndex: 1 },
      { id: 'qq_e_1', seedId: 's_e_1', questionEn: 'What is the best way to learn English?', questionAr: 'ما هي أفضل طريقة لتعلم الإنجليزية؟', questionTr: 'İngilizce öğrenmenin en iyi yolu nedir?', optionsEn: JSON.stringify(['Only grammar books', 'Regular practice with real content', 'Watching movies without subtitles', 'Memorizing the dictionary']), optionsAr: JSON.stringify(['كتب القواعد فقط', 'الممارسة المنتظمة مع محتوى حقيقي', 'مشاهدة الأفلام بدون ترجمة', 'حفظ القاموس']), optionsTr: JSON.stringify(['Sadece dilbilgisi kitapları', 'Gerçek içerikle düzenli pratik', 'Altyazısız film izlemek', 'Sözlüğü ezberlemek']), correctIndex: 1 },
      { id: 'qq_e_2', seedId: 's_e_4', questionEn: 'How do you say "2026" in English?', questionAr: 'كيف تقول "2026" بالإنجليزية؟', questionTr: 'İngilizce "2026" nasıl söylenir?', optionsEn: JSON.stringify(['Two thousand twenty-six', 'Twenty twenty-six', 'Two zero two six', 'Two thousand and twenty-six']), optionsAr: JSON.stringify(['ألفان وستة وعشرون', 'عشرون وستة وعشرون', 'اثنان صفر اثنان ستة', 'ألفان وستة وعشرون']), optionsTr: JSON.stringify(['İki bin yirmi altı', 'Yirmi yirmi altı', 'İki sıfır iki altı', 'İki bin ve yirmi altı']), correctIndex: 1 },
      { id: 'qq_e_3', seedId: 's_e_7', questionEn: '"She ___ to school every day." Choose the correct verb form.', questionAr: '"هي ___ إلى المدرسة كل يوم." اختر صيغة الفعل الصحيحة.', questionTr: '"O her gün okula ___." Doğru fiil formunu seçin.', optionsEn: JSON.stringify(['go', 'goes', 'going', 'went']), optionsAr: JSON.stringify(['تذهب', 'تذهب', 'ذاهبة', 'ذهبت']), optionsTr: JSON.stringify(['gider', 'gider', 'gidiyor', 'gitti']), correctIndex: 1 },
      { id: 'qq_e_4', seedId: 's_e_10', questionEn: 'What is shadowing in language learning?', questionAr: 'ما هي تقنية التظليل في تعلم اللغة؟', questionTr: 'Dil öğreniminde gölgeleme nedir?', optionsEn: JSON.stringify(['Following a speaker and repeating immediately', 'Reading a transcript silently', 'Writing what you hear', 'Translating word by word']), optionsAr: JSON.stringify(['متابعة المتحدث والتكرار فوراً', 'قراءة النص بصمت', 'كتابة ما تسمع', 'الترجمة كلمة بكلمة']), optionsTr: JSON.stringify(['Bir konuşmacıyı takip edip hemen tekrar etme', 'Bir metni sessizce okuma', 'Duyduğunu yazma', 'Kelime kelime çevirme']), correctIndex: 0 },
      { id: 'qq_e_5', seedId: 's_e_16', questionEn: 'What does "break down" mean?', questionAr: 'ماذا تعني "break down"؟', questionTr: '"Break down" ne anlama gelir?', optionsEn: JSON.stringify(['To stop working', 'To destroy', 'To analyze in detail', 'All of the above']), optionsAr: JSON.stringify(['التوقف عن العمل', 'تدمير', 'تحليل بالتفصيل', 'كل ما سبق']), optionsTr: JSON.stringify(['Çalışmayı durdurmak', 'Yok etmek', 'Detaylı analiz etmek', 'Hepsi']), correctIndex: 3 },
      { id: 'qq_e_6', seedId: 's_e_18', questionEn: 'What is a common phrase used in business meetings to start a discussion?', questionAr: 'ما هي العبارة الشائعة المستخدمة في اجتماعات العمل لبدء المناقشة؟', questionTr: 'İş toplantılarında tartışmayı başlatmak için kullanılan yaygın bir ifade nedir?', optionsEn: JSON.stringify(["Let's call it a day", "Let's get down to business", 'See you later', 'Take care']), optionsAr: JSON.stringify(['لننهي اليوم', 'لنبدأ العمل', 'أراك لاحقاً', 'اعتن بنفسك']), optionsTr: JSON.stringify(['Günü bitirelim', 'Hadi işe koyulalım', 'Sonra görüşürüz', 'Kendine iyi bak']), correctIndex: 1 },
    ];

    for (const q of quizQuestions) {
      await rawPool.query(
        `INSERT INTO quiz_questions (id, seedId, questionEn, questionAr, questionTr, optionsEn, optionsAr, optionsTr, correctIndex, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, EXTRACT(EPOCH FROM NOW())::INTEGER)
         ON CONFLICT (id) DO UPDATE SET
           seedId=EXCLUDED.seedId, questionEn=EXCLUDED.questionEn, questionAr=EXCLUDED.questionAr, questionTr=EXCLUDED.questionTr,
           optionsEn=EXCLUDED.optionsEn, optionsAr=EXCLUDED.optionsAr, optionsTr=EXCLUDED.optionsTr,
           correctIndex=EXCLUDED.correctIndex`,
        [q.id, q.seedId, q.questionEn, q.questionAr, q.questionTr, q.optionsEn, q.optionsAr, q.optionsTr, q.correctIndex]
      );
    }
    console.log('[Seed] 18 quiz questions inserted');

    console.log('[Seed] All data restored successfully!');
    await rawPool.end();
  } catch (e) {
    console.error('[Seed] Error:', e.message);
  }
}

run();
