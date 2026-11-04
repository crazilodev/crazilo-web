'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Calendar, Clock, User, ArrowRight, Tag, BookOpen,
  ChevronRight, Sparkles, CheckCircle2, X, Share2,
  Bookmark, Heart, ShoppingBag, Search
} from 'lucide-react'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface BlogPost {
  id: string
  title: string
  subtitle: string
  slug: string
  excerpt: string
  content: {
    lead: string
    sections: {
      heading: string
      body: string
      points?: string[]
    }[]
    nutritionTips: string[]
  }
  category: string
  author: {
    name: string
    role: string
    avatar: string
  }
  date: string
  readTime: string
  image: string
  tags: string[]
  featured?: boolean
  recommendedProducts?: {
    name: string
    category: string
    href: string
  }[]
}

const BLOG_POSTS: BlogPost[] = [
  {
    id: 'saffron-mongra-guide',
    title: 'The Kashmiri Saffron Secret: How to Identify 100% Pure Mongra & Daily Benefits',
    subtitle: 'Unlocking the golden threads of Pampore: purity tests, bioactive compounds, and traditional morning rituals.',
    slug: 'kashmiri-saffron-mongra-guide',
    category: 'Spice Secrets',
    excerpt:
      'Known as red gold, authentic Kashmiri Mongra saffron is world-renowned for its intense aroma and deep crimson hue. Learn how to verify purity at home and harness its mood-elevating properties.',
    content: {
      lead:
        'Harvested exclusively from the high-altitude purple crocus fields of Pampore, Kashmir, Grade A1 Mongra saffron represents the pinnacle of global saffron cultivation. Each delicate crimson stigma is hand-harvested at dawn to preserve the delicate essential oils—crocin, picrocrocin, and safranal.',
      sections: [
        {
          heading: '1. The Cold Water Float & Bleed Test',
          body: 'Adulterated saffron artificially colored with food dyes releases a crimson streak immediately when touched by water. Authentic Kashmiri Mongra behaves differently: the threads slowly release a golden-yellow hue over 10 to 15 minutes while the physical stigma retains its dark red structure without dissolving.',
          points: [
            'Pure threads never turn white or disintegrate in warm water.',
            'The aroma should be sweet and floral, yet the taste is distinctly bitter.',
            'Look for trumpet-shaped ends on genuine stigmas.',
          ],
        },
        {
          heading: '2. Science-Backed Wellness Benefits',
          body: 'Modern clinical research confirms what Ayurvedic vaidyas have taught for centuries. Saffron is rich in potent carotenoid antioxidants that help neutralize oxidative stress, promote restful sleep, enhance cognitive memory, and naturally elevate serotonin levels for emotional balance.',
        },
        {
          heading: '3. Daily Morning Ritual: Saffron Golden Milk',
          body: 'Gently warm a cup of milk (dairy or almond) with 3–4 crushed saffron strands, a pinch of crushed green cardamom, and a dash of raw honey. Drink 20 minutes before bedtime or as a soothing morning tonic.',
        },
      ],
      nutritionTips: [
        'Contains over 150 volatile & aroma-yielding active bio-compounds.',
        'High natural concentration of Crocin responsible for deep pigmentation.',
        'Zero additives, completely free from preservatives and artificial glazes.',
      ],
    },
    author: {
      name: 'Dr. Ananya Sharma',
      role: 'Ayurvedic Wellness Consultant',
      avatar: 'AS',
    },
    date: 'Nov 3, 2026',
    readTime: '4 min read',
    image: '/images/cat-spices.png',
    tags: ['Saffron', 'Kashmir', 'Ayurveda', 'Spice Secrets'],
    featured: true,
    recommendedProducts: [
      { name: 'Kashmiri Mongra Saffron (1g)', category: 'Spices', href: '/category/spices' },
      { name: 'Green Cardamom Extra Bold', category: 'Spices', href: '/category/spices' },
    ],
  },
  {
    id: 'mamra-vs-california-almonds',
    title: 'Mamra vs. California Almonds: Which Delivers Higher Nutrient Density?',
    subtitle: 'Decoding oil content, origin differences, and why cold-pressed Iranian/Afghan Mamra almonds command the crown.',
    slug: 'mamra-vs-california-almonds',
    category: 'Dry Fruits & Nuts',
    excerpt:
      'Not all almonds are created equal. Discover why indigenous Mamra almonds boast up to 50% natural oil content compared to mass-cultivated commercial varieties.',
    content: {
      lead:
        'When strolling through dry fruit markets, you will notice a stark difference between smooth, uniform California almonds and smaller, concave Mamra almonds. The difference lies not just in aesthetic, but in biological purity and genetic heritage.',
      sections: [
        {
          heading: 'Organic Heritage vs. Commercial Hybridization',
          body: 'California almonds are extensively cultivated hybrids grown using mechanized farming, chemical pastes, and automated steam pasteurization. In contrast, Mamra almonds grow in the rocky foothills of Afghanistan, Iran, and Kashmir without chemical pesticides, relying on traditional organic cultivation.',
          points: [
            'Mamra contains 45% - 50% natural oil, compared to just 18% - 25% in California varieties.',
            'Zero pasteurization ensures living enzymes remain intact.',
            'Higher concentration of Vitamin E, riboflavin, and dietary fiber.',
          ],
        },
        {
          heading: 'Why Soaking Overnight is Non-Negotiable',
          body: 'The brown skin of almonds contains phytic acid and tannins that bind to minerals and hinder intestinal absorption. Soaking almonds overnight in filtered water activates lipase enzymes and removes phytic acid, making iron, magnesium, and protein 3x more bioavailable.',
        },
      ],
      nutritionTips: [
        'Rich in Monounsaturated Fatty Acids (MUFA) for cardiovascular longevity.',
        'Provides 6g of plant-based protein per 30g serving.',
        'Exceptional Vitamin E source for youthful skin cellular regeneration.',
      ],
    },
    author: {
      name: 'Rohan Mehra',
      role: 'Clinical Nutritionist & Founder',
      avatar: 'RM',
    },
    date: 'Oct 28, 2026',
    readTime: '5 min read',
    image: '/images/cat-nuts.png',
    tags: ['Almonds', 'Mamra', 'Nutrient Density', 'Brain Food'],
    recommendedProducts: [
      { name: 'Original Kashmiri Mamra Badam', category: 'Nuts', href: '/category/nuts' },
      { name: 'Jumbo California Almonds', category: 'Nuts', href: '/category/nuts' },
    ],
  },
  {
    id: 'roasted-makhana-superfood',
    title: 'Roasted Phool Makhana: Why It’s the Ultimate Guilt-Free Evening Snack',
    subtitle: 'Swap fried chips for fox nuts: high protein, low glycemic index, and packed with anti-aging flavonoids.',
    slug: 'roasted-makhana-superfood-snack',
    category: 'Health & Superfoods',
    excerpt:
      'Sourced directly from the lotus wetlands of Mithila, Bihar, roasted makhanas provide crunch without empty calories, making them a diabetic-friendly pantry staple.',
    content: {
      lead:
        'Phool Makhana, or gorgon nut, has transformed from a traditional fasting staple into a globally celebrated superfood. Naturally gluten-free and low in sodium, these puffed seeds deliver satisfying crunch with extraordinary nutritional efficiency.',
      sections: [
        {
          heading: 'The Calorie-to-Satiety Champion',
          body: 'A generous bowl of roasted makhana (30 grams) contains only ~105 calories, yet offers 4 grams of protein, zero trans fat, and a slow-burning low glycemic load that keeps insulin spikes at bay.',
          points: [
            'Rich in Kaempferol, a natural flavonoid that fights cellular inflammation.',
            'High potassium-to-sodium ratio supports healthy blood pressure regulation.',
            'Perfect light snack for diabetic diets and weight management plans.',
          ],
        },
        {
          heading: 'How to Roast to Crispy Perfection at Home',
          body: 'Warm a teaspoon of A2 Desi Ghee in a heavy-bottomed kadhai. Add raw makhanas and roast on low flame for 6–8 minutes until brittle. Finish with Himalayan pink salt, crushed black pepper, and a touch of chaat masala.',
        },
      ],
      nutritionTips: [
        'Naturally gluten-free and easily digestible for all age groups.',
        'Abundant in magnesium and phosphorus for skeletal strength.',
        'Low caloric density with zero refined sugars or chemical flavor enhancers.',
      ],
    },
    author: {
      name: 'Pooja Hegde',
      role: 'Culinary Nutrition Specialist',
      avatar: 'PH',
    },
    date: 'Oct 22, 2026',
    readTime: '3 min read',
    image: '/images/cat-makhana.png',
    tags: ['Makhana', 'Superfoods', 'Healthy Snacks', 'Weight Loss'],
    recommendedProducts: [
      { name: 'Classic Salted Roasted Makhana', category: 'Makhana', href: '/category/makhana' },
      { name: 'Peri-Peri Crisp Makhana', category: 'Makhana', href: '/category/makhana' },
    ],
  },
  {
    id: 'ayurvedic-herbal-teas-spices',
    title: '5 Ayurvedic Herbal Teas Infused with Kerala Cardamom & Cloves',
    subtitle: 'Revitalize digestion and enhance immunity with time-honored botanical infusions straight from the Malabar coast.',
    slug: 'ayurvedic-herbal-teas-cardamom-cloves',
    category: 'Recipes & Culinary',
    excerpt:
      'Experience the warming restorative magic of whole spices. These five comforting decoctions soothe digestion, relieve seasonal coughs, and calm the nervous system.',
    content: {
      lead:
        'In the lush rainforests of Idukki and Wayanad, high-grade spices develop intense aromatic volatile compounds. When extracted into steaming water, whole spices release bioactive terpenes that stimulate digestive agni and soothe respiratory pathways.',
      sections: [
        {
          heading: '1. The Soothing Elaichi-Ginger Digestive Brew',
          body: 'Crush 3 green cardamom pods and a half-inch slice of fresh ginger in 300ml of boiling water. Simmer for 5 minutes, strain, and sip warm after lunch. Cardamom Cineole acts as a carminative, easing bloating and post-meal sluggishness.',
        },
        {
          heading: '2. The Immunity-Boosting Clove & Cinnamon Kadha',
          body: 'Simmer 4 whole cloves, 1 Ceylon cinnamon stick, and fresh tulsi leaves. Eugenol in cloves acts as an antibacterial and throat-soothing agent during transitional weather.',
        },
      ],
      nutritionTips: [
        'Eugenol in cloves provides natural analgesic and anti-inflammatory properties.',
        'Cardamom terpenes support oral freshness and digestive enzyme secretion.',
        'Zero caffeine—ideal for evening wind-down routines.',
      ],
    },
    author: {
      name: 'Dr. Ananya Sharma',
      role: 'Ayurvedic Wellness Consultant',
      avatar: 'AS',
    },
    date: 'Oct 15, 2026',
    readTime: '6 min read',
    image: '/images/cat-spices.png',
    tags: ['Herbal Tea', 'Cardamom', 'Digestive Health', 'Recipes'],
    recommendedProducts: [
      { name: 'Green Cardamom (Elaichi)', category: 'Spices', href: '/category/spices' },
      { name: 'Whole Cloves (Laung)', category: 'Spices', href: '/category/spices' },
    ],
  },
  {
    id: 'walnuts-brain-food-omega3',
    title: 'The Golden Nut: Why Daily Soaked Walnuts Boost Cognitive Agility',
    subtitle: 'High concentrations of plant-based ALA Omega-3 and polyphenols make Kashmiri Akhrot nature’s premier brain fuel.',
    slug: 'walnuts-cognitive-health-omega3',
    category: 'Health & Superfoods',
    excerpt:
      'Notice how a walnut kernel uncannily resembles the human brain? Modern science affirms nature’s visual clue: walnuts are unmatched in plant-based Omega-3 fatty acids.',
    content: {
      lead:
        'Among all edible tree nuts, walnuts contain the highest proportion of alpha-linolenic acid (ALA), a vital plant-derived Omega-3 fatty acid that the human body cannot produce on its own. Kashmir’s Kagzi walnuts are renowned for their thin shells and buttery, high-oil kernels.',
      sections: [
        {
          heading: 'Neuroprotective Antioxidant Matrix',
          body: 'Walnuts contain double the antioxidant polyphenols of almost any other common nut. These polyphenols help combat oxidative stress and neuro-inflammation, supporting sharp memory recall, focus, and long-term neurocognitive resilience.',
          points: [
            '2.5g of plant Omega-3 ALA per ounce—meeting 100% of the recommended daily intake.',
            'Natural source of Melatonin that gently signals biological circadian rhythm.',
            'Supports arterial flexibility and endothelial heart health.',
          ],
        },
        {
          heading: 'The Best Way to Consume',
          body: 'Soak 2 to 3 whole walnut halves in fresh water for 6 to 8 hours before eating in the morning. Soaking reduces natural bitterness and unlocks maximum nutrient absorption.',
        },
      ],
      nutritionTips: [
        'Richest plant-based nut source of anti-inflammatory Omega-3 ALA.',
        'High in copper, manganese, and vitamin B6.',
        'Promotes microbiome diversity by nourishing beneficial gut bacteria.',
      ],
    },
    author: {
      name: 'Rohan Mehra',
      role: 'Clinical Nutritionist & Founder',
      avatar: 'RM',
    },
    date: 'Oct 09, 2026',
    readTime: '4 min read',
    image: '/images/hero-cashews.png',
    tags: ['Walnuts', 'Omega-3', 'Brain Food', 'Kashmir'],
    recommendedProducts: [
      { name: 'Kashmiri Kagzi Walnuts (Snow White)', category: 'Nuts', href: '/category/nuts' },
      { name: 'Premium Cashew W-240', category: 'Nuts', href: '/category/nuts' },
    ],
  },
  {
    id: 'mindful-gifting-dry-fruits',
    title: 'Natural Festive Gifting: Why Wholesome Dry Fruit Boxes Win Over Refined Sweets',
    subtitle: 'Celebrate milestones with wellness: the cultural and health significance of exchanging premium nuts and dry fruits.',
    slug: 'festive-gifting-dry-fruits-over-sweets',
    category: 'Mindful Living',
    excerpt:
      'Say goodbye to adulterated sweets and single-use gift clutter. Premium dry fruit hampers express profound care, timeless elegance, and wholesome longevity.',
    content: {
      lead:
        'In Indian hospitality, presenting guest-loved dry fruits has symbolized prosperity, purity, and good health for centuries. As modern families become increasingly health-conscious, thoughtful gift boxes filled with sun-dried fruits and fresh nuts have reclaimed their rightful place.',
      sections: [
        {
          heading: 'Zero Guilt, Maximum Shelf Life',
          body: 'Traditional syrup-soaked sweets often spoil within 48 hours and carry synthetic colors and refined white sugars. In contrast, premium dry fruit gift boxes remain crisp and delicious for months, allowing recipients to enjoy wholesome nourishment at their own leisure.',
        },
        {
          heading: 'Tailored for Every Celebration',
          body: 'Whether for Diwali, Eid, weddings, or corporate appreciation, custom dry fruit boxes featuring golden raisins, Afghan anjeer, and roasted cashews communicate premium taste and genuine goodwill.',
        },
      ],
      nutritionTips: [
        '100% shelf-stable without refrigeration or chemical stabilizers.',
        'Universally cherished across dietary preferences: vegan, diabetic, keto.',
        'Packaged in recyclable, heirloom-worthy keepsake presentation boxes.',
      ],
    },
    author: {
      name: 'Pooja Hegde',
      role: 'Culinary Nutrition Specialist',
      avatar: 'PH',
    },
    date: 'Sep 29, 2026',
    readTime: '4 min read',
    image: '/images/cat-gifts.png',
    tags: ['Gifting', 'Festivals', 'Mindful Living', 'Combos'],
    recommendedProducts: [
      { name: 'Royal Heritage Dry Fruit Gift Box', category: 'Gifts', href: '/category/gift-boxes' },
      { name: 'Festive Delight 4-in-1 Combo', category: 'Combos', href: '/category/combos' },
    ],
  },
  {
    id: 'sun-dried-anjeer-figs-health',
    title: 'Sun-Dried Afghani Anjeer (Figs): Iron, Fiber and Digestive Health Explained',
    subtitle: 'How this ancient sacred fruit restores gut harmony, fuels hemoglobin, and satisfies sweet cravings naturally.',
    slug: 'sun-dried-anjeer-figs-digestive-health',
    category: 'Dry Fruits & Nuts',
    excerpt:
      'Loaded with soluble pectin fiber and natural iron, soaked Afghani figs are a gentle, potent remedy for sluggish digestion and sustained energy.',
    content: {
      lead:
        'Sun-dried naturally under the desert skies of Kandahar and Herat, Afghani Anjeer condenses the fruit’s sweet nectar into chewy, golden discs with delightful crunch from internal seeds. They are a celebrated powerhouse for digestive wellness.',
      sections: [
        {
          heading: 'The Digestive Fiber Miracle',
          body: 'Dried figs are exceptionally rich in soluble fiber (pectin), which acts as a gentle prebiotic food source for beneficial intestinal probiotics while absorbing water to promote natural digestive ease.',
          points: [
            'Soaking 2 figs in water overnight softens the fruit and releases soothing mucilage.',
            'Natural source of calcium for individuals avoiding dairy.',
            'Abundant in copper and non-heme iron for healthy red blood cell production.',
          ],
        },
      ],
      nutritionTips: [
        'High soluble and insoluble fiber balance supports digestive motility.',
        'Natural fruit sweetness with zero added sucrose or chemical bleaching.',
        'Excellent plant calcium and magnesium content for skeletal vitality.',
      ],
    },
    author: {
      name: 'Dr. Ananya Sharma',
      role: 'Ayurvedic Wellness Consultant',
      avatar: 'AS',
    },
    date: 'Sep 18, 2026',
    readTime: '5 min read',
    image: '/images/cat-dryfruits.png',
    tags: ['Anjeer', 'Figs', 'Digestive Health', 'Dry Fruits'],
    recommendedProducts: [
      { name: 'Afghani Jumbo Sun-Dried Anjeer', category: 'Dry Fruits', href: '/category/dry-fruits' },
      { name: 'Kashmiri Black Raisins (Kishmish)', category: 'Dry Fruits', href: '/category/dry-fruits' },
    ],
  },
]

const CATEGORIES = [
  'All Articles',
  'Spice Secrets',
  'Dry Fruits & Nuts',
  'Health & Superfoods',
  'Recipes & Culinary',
  'Mindful Living',
]

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All Articles')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null)
  const [emailSub, setEmailSub] = useState('')

  const featuredPost = BLOG_POSTS.find((p) => p.featured) || BLOG_POSTS[0]

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All Articles' || post.category === selectedCategory
    const matchesQuery =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesQuery
  })

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailSub.trim() || !emailSub.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    toast.success('Thank you for subscribing to Crazilo Wellness Journal! 🌿')
    setEmailSub('')
  }

  const handleShare = (article: BlogPost) => {
    if (navigator.share) {
      navigator
        .share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        })
        .catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Article link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-gray-800">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-amber-900/10 bg-white/70 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#B91C1C] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-900">Blog & Wellness Journal</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-amber-700 font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Honest Nutrition • Farm Insights</span>
          </div>
        </div>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-[#FCFBF7] to-white pt-12 pb-16 border-b border-amber-900/10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-red-100/50 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-100/60 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-amber-200/80 shadow-xs mb-4">
            <BookOpen className="w-4 h-4 text-[#B91C1C]" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              The Crazilo Wellness Journal
            </span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 tracking-tight max-w-3xl mx-auto leading-tight">
            Ancient Wisdom, Pure Harvests & Wholesome Living
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Curated articles by nutritionists and farm experts exploring the origins, bioactive health
            benefits, and culinary delights of premium dry fruits and spices.
          </p>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Featured Article Hero Card (Visible when not actively filtering by search) */}
        {!searchQuery && selectedCategory === 'All Articles' && (
          <div className="mb-14">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
              <span className="text-xs font-black uppercase tracking-widest text-[#B91C1C]">
                Spotlight Feature
              </span>
            </div>

            <div className="bg-white border border-gray-200/90 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 group">
              {/* Image container */}
              <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto min-h-[300px] overflow-hidden bg-amber-50/50">
                <Image
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#B91C1C] text-white shadow-md">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              {/* Text content */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      {featuredPost.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-extrabold text-gray-900 leading-snug group-hover:text-[#B91C1C] transition-colors">
                    {featuredPost.title}
                  </h2>

                  <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-3">
                    {featuredPost.excerpt}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {featuredPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium bg-amber-50 text-amber-900 border border-amber-200/60 px-2.5 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Pills Filter */}
       


        {/* Newsletter / Digest Box */}
        <div className="mt-16 sm:mt-20 bg-gradient-to-br from-[#450A0A] to-[#2B0606] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-4">
           
              <span>Weekly Ayurvedic Digest</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Get Wholesome Nutrition Guides in Your Inbox
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-lg mx-auto leading-relaxed">
              Join 20,000+ conscious food lovers. Receive weekly harvest alerts, traditional recipes, and
              nutritional breakdowns without spam.
            </p>

            <form onSubmit={handleSubscribe} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-xs sm:text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20 focus:border-amber-400 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-[#D97706] hover:bg-[#B45309] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
              >
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-white/50 mt-3">
              We respect your privacy. Unsubscribe anytime with 1-click.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Full Article Reader Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div
            className="fixed inset-0"
            onClick={() => setActiveArticle(null)}
          />

          <div className="relative bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 border border-gray-100">
            {/* Modal Header Bar */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-gray-100 flex items-center justify-between z-20">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-[#B91C1C]">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">{activeArticle.readTime}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleShare(activeArticle)}
                  aria-label="Share article"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Hero Image */}
            <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-amber-50">
              <Image
                src={activeArticle.image}
                alt={activeArticle.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-10">
              {/* Author and Date */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full bg-[#B91C1C] text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {activeArticle.author.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-gray-900">{activeArticle.author.name}</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <p className="text-xs text-gray-500">{activeArticle.author.role} • {activeArticle.date}</p>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-gray-900 leading-snug">
                {activeArticle.title}
              </h2>
              <p className="mt-2 text-sm sm:text-base text-gray-600 italic font-serif">
                &ldquo;{activeArticle.subtitle}&rdquo;
              </p>

              {/* Lead Paragraph */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-sm text-amber-950 font-medium leading-relaxed">
                {activeArticle.content.lead}
              </div>

              {/* Sections */}
              <div className="mt-8 space-y-6 text-sm sm:text-base text-gray-700 leading-relaxed">
                {activeArticle.content.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="font-heading text-lg font-bold text-gray-900">
                      {section.heading}
                    </h3>
                    <p className="text-sm text-gray-600">{section.body}</p>
                    {section.points && (
                      <ul className="mt-2 space-y-1.5 pl-2">
                        {section.points.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 text-xs sm:text-sm text-gray-700">
                            <span className="text-[#B91C1C] font-black shrink-0 mt-0.5">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Nutritional Highlights */}
              <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Key Nutritional Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeArticle.content.nutritionTips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Products */}
              {activeArticle.recommendedProducts && activeArticle.recommendedProducts.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-800 mb-3 flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#B91C1C]" />
                    Featured In This Story
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeArticle.recommendedProducts.map((prod, idx) => (
                      <Link
                        key={idx}
                        href={prod.href}
                        onClick={() => setActiveArticle(null)}
                        className="p-3 rounded-xl border border-gray-200 hover:border-[#B91C1C] bg-white flex items-center justify-between group transition-all"
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-900 group-hover:text-[#B91C1C] transition-colors">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-gray-500">{prod.category}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#B91C1C] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">Pure. Honest. Preservative-Free.</span>
              <button
                onClick={() => setActiveArticle(null)}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-colors"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

