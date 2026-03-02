# SEO优化实施计划

## 当前状态分析
基于网站检查，发现以下SEO问题：

### 1. 元标签缺失
- 缺少meta description
- 缺少Open Graph标签
- 缺少Twitter卡片
- 缺少结构化数据

### 2. 技术SEO
- 已有robots.txt和sitemap（良好）
- 缺少JSON-LD结构化数据
- 缺少面包屑导航

## 实施步骤

### 步骤1：创建SEO组件
创建 `src/components/SEO.tsx` 组件：

```tsx
// src/components/SEO.tsx
import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  siteName?: string;
  twitterCard?: string;
  twitterSite?: string;
  structuredData?: Record<string, any>;
}

export default function SEO({
  title = 'Nano Banana 提示词库 - 746个AI提示词精选',
  description = '免费AI提示词库，包含746个Nano Banana和Nano Banana Pro提示词。支持标签筛选、搜索和一键复制。每日更新，助力AI创作。',
  keywords = 'AI,提示词,Nano Banana,人工智能,创作工具,AI工具,提示工程',
  image = 'https://nano-prompts-five.vercel.app/og-image.png',
  url = 'https://nano-prompts-five.vercel.app',
  type = 'website',
  locale = 'zh_CN',
  siteName = 'Nano Banana 提示词库',
  twitterCard = 'summary_large_image',
  twitterSite = '@nano_prompts',
  structuredData,
}: SEOProps) {
  const fullTitle = title.includes('Nano Banana') ? title : `${title} | Nano Banana 提示词库`;
  
  // 默认结构化数据
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Collection',
    name: 'Nano Banana 提示词库',
    description: 'AI提示词集合',
    numberOfItems: 746,
    keywords: 'AI,提示词,Nano Banana,人工智能,创作工具',
    url: 'https://nano-prompts-five.vercel.app',
    publisher: {
      '@type': 'Organization',
      name: 'Nano Banana 提示词库',
      url: 'https://nano-prompts-five.vercel.app',
    },
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Head>
      {/* 基础元标签 */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      
      {/* Open Graph (Facebook) */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter卡片 */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(finalStructuredData),
        }}
      />
      
      {/* 其他SEO标签 */}
      <link rel="canonical" href={url} />
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
    </Head>
  );
}
```

### 步骤2：更新布局文件
更新 `src/app/layout.tsx`：

```tsx
// src/app/layout.tsx
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/react";
import SEO from "@/components/SEO";
import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") || "zh";
  const lang = locale === "en" ? "en" : "zh-CN";
  
  // 根据语言设置不同的SEO内容
  const seoConfig = locale === "en" ? {
    title: "Nano Banana Prompts Library - 746 AI Prompts Collection",
    description: "Free AI prompts library with 746 Nano Banana and Nano Banana Pro prompts. Supports tag filtering, search, and one-click copy. Daily updates to boost AI creativity.",
    keywords: "AI, prompts, Nano Banana, artificial intelligence, creative tools, AI tools, prompt engineering",
    locale: "en_US",
  } : {
    title: "Nano Banana 提示词库 - 746个AI提示词精选",
    description: "免费AI提示词库，包含746个Nano Banana和Nano Banana Pro提示词。支持标签筛选、搜索和一键复制。每日更新，助力AI创作。",
    keywords: "AI,提示词,Nano Banana,人工智能,创作工具,AI工具,提示工程",
    locale: "zh_CN",
  };

  return (
    <html lang={lang}>
      <SEO {...seoConfig} />
      <body className="antialiased bg-stone-950 text-stone-100 min-h-screen">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 步骤3：创建页面级SEO组件
创建 `src/components/PageSEO.tsx` 用于具体页面：

```tsx
// src/components/PageSEO.tsx
import SEO from './SEO';

interface PageSEOProps {
  pageTitle?: string;
  pageDescription?: string;
  pageImage?: string;
  pageUrl?: string;
  pageType?: string;
  category?: string;
  tags?: string[];
}

export default function PageSEO({
  pageTitle,
  pageDescription,
  pageImage,
  pageUrl,
  pageType = 'article',
  category,
  tags = [],
}: PageSEOProps) {
  // 构建完整标题
  const fullTitle = pageTitle 
    ? `${pageTitle} | Nano Banana 提示词库`
    : 'Nano Banana 提示词库 - 746个AI提示词精选';
  
  // 构建完整描述
  const fullDescription = pageDescription || 
    '免费AI提示词库，包含746个Nano Banana和Nano Banana Pro提示词。支持标签筛选、搜索和一键复制。';
  
  // 构建结构化数据
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': pageType === 'article' ? 'Article' : 'WebPage',
    headline: pageTitle || 'Nano Banana 提示词库',
    description: fullDescription,
    image: pageImage || 'https://nano-prompts-five.vercel.app/og-image.png',
    datePublished: new Date().toISOString(),
    dateModified: new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: 'Nano Banana 提示词库',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nano Banana 提示词库',
      logo: {
        '@type': 'ImageObject',
        url: 'https://nano-prompts-five.vercel.app/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': pageUrl || 'https://nano-prompts-five.vercel.app',
    },
    keywords: tags.join(', '),
    articleSection: category,
  };

  return (
    <SEO
      title={fullTitle}
      description={fullDescription}
      image={pageImage}
      url={pageUrl}
      type={pageType}
      structuredData={structuredData}
    />
  );
}
```

### 步骤4：创建面包屑导航组件
```tsx
// src/components/Breadcrumb.tsx
import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: item.href ? `https://nano-prompts-five.vercel.app${item.href}` : undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <nav className="text-sm text-stone-400 mb-6" aria-label="面包屑导航">
        <ol className="flex items-center space-x-2">
          <li>
            <Link href="/" className="hover:text-stone-300 transition-colors">
              首页
            </Link>
          </li>
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="mx-2">/</span>
              {item.href ? (
                <Link
                  href={item.href}
                  className="hover:text-stone-300 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-stone-300">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

### 步骤5：更新首页使用示例
```tsx
// src/app/page.tsx 或具体页面
import PageSEO from '@/components/PageSEO';
import Breadcrumb from '@/components/Breadcrumb';

export default function HomePage() {
  return (
    <>
      <PageSEO
        pageTitle="AI提示词库首页"
        pageDescription="探索746个精选AI提示词，支持标签筛选和搜索"
        tags={['AI', '提示词', 'Nano Banana', '人工智能']}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={[
          { label: '首页', href: '/' },
          { label: '提示词库', href: '/prompts' },
        ]} />
        
        {/* 页面内容 */}
      </div>
    </>
  );
}
```

### 步骤6：创建OG图片
创建基本的OG图片（可后续优化）：
```bash
# 创建public/og-image.png
# 尺寸：1200x630像素
# 包含网站名称和描述
```

### 步骤7：验证工具设置
1. **Google Search Console** - 提交sitemap
2. **Bing Webmaster Tools** - 提交网站
3. **百度站长平台** - 如需中文市场
4. **Schema Markup Validator** - 验证结构化数据

## 实施时间线

### 第1天：基础SEO组件
1. 创建SEO组件
2. 更新布局文件
3. 测试基本功能

### 第2天：高级功能
1. 创建页面级SEO组件
2. 添加面包屑导航
3. 创建OG图片

### 第3天：验证和测试
1. 提交到搜索引擎
2. 验证结构化数据
3. 测试多语言SEO

### 第1周：监控和优化
1. 监控搜索排名
2. 分析流量变化
3. 持续优化内容

## 预期效果

### 技术指标
- ✅ 完整的元标签覆盖
- ✅ 结构化数据验证通过
- ✅ 面包屑导航提升用户体验
- ✅ Open Graph分享优化

### 业务指标
- 📈 搜索流量提升30-50%
- 📈 社交媒体分享增加
- 📈 用户停留时间延长
- 📈 跳出率降低

## 注意事项

### 多语言支持
- 确保中英文SEO内容正确
- 语言标记正确设置
- hreflang标签（如需）

### 移动端优化
- 确保所有SEO标签在移动端有效
- 移动端页面速度优化
- 移动端结构化数据

### 持续维护
- 定期更新SEO内容
- 监控搜索算法变化
- 及时调整策略

---

**实施状态**: 准备就绪  
**预计完成时间**: 3天  
**监控指标**: 搜索流量、排名、结构化数据验证