'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Announcement } from '@/types'
import { Diamond } from 'lucide-react'

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
      if (data) setAnnouncements(data)
    }
    fetchAnnouncements()
  }, [])

  // Professional human-crafted announcements without cheesy emojis
  const defaultAnnouncements = [
    'COMPLIMENTARY SHIPPING ON ORDERS ABOVE ₹599',
    '100% NATURAL & DIRECT FARM SOURCED SELECTION',
    'USE CODE CRAZILO10 FOR 10% OFF YOUR FIRST PURCHASE',
    'EXPRESS DISPATCH ON ORDERS PLACED BEFORE 2 PM',
  ]

  const items =
    announcements.length > 0
      ? announcements.map((a) => a.text)
      : defaultAnnouncements

  const repeated = [...items, ...items]

  return (
    <div className="bg-brand-red text-white py-2.5 overflow-hidden ticker-wrapper">
      <div className="ticker-content flex animate-ticker whitespace-nowrap">
        {repeated.map((text, index) => (
          <span
            key={index}
            className="inline-flex items-center mx-8 flex-shrink-0"
          >
            <Diamond className="w-2.5 h-2.5 fill-brand-gold text-brand-gold mr-3 flex-shrink-0" />
            <span className="text-xs font-medium tracking-widest uppercase">
              {text}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
