'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ShippingSettings = {
  freeShippingThreshold: number
  shippingFee: number
  loading: boolean
}

let cachedSettings: { freeShippingThreshold: number; shippingFee: number } | null = null

export function useShippingSettings() {
  const [settings, setSettings] = useState({
    freeShippingThreshold: cachedSettings?.freeShippingThreshold ?? 599,
    shippingFee: cachedSettings?.shippingFee ?? 50,
    loading: !cachedSettings,
  })

  useEffect(() => {
    let isMounted = true

    const fetchSettings = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('site_settings')
          .select('free_shipping_threshold, shipping_fee')
          .eq('scope', 'global')
          .maybeSingle()

        if (data && isMounted) {
          const threshold = Number(data.free_shipping_threshold ?? 599)
          const fee = Number((data as any).shipping_fee ?? 50)
          cachedSettings = { freeShippingThreshold: threshold, shippingFee: fee }
          setSettings({
            freeShippingThreshold: threshold,
            shippingFee: fee,
            loading: false,
          })
        }
      } catch {
        if (isMounted) {
          setSettings((prev) => ({ ...prev, loading: false }))
        }
      }
    }

    fetchSettings()

    return () => {
      isMounted = false
    }
  }, [])

  const calculateShipping = (subtotal: number) => {
    if (subtotal <= 0) return 0
    return subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingFee
  }

  const isFreeShipping = (subtotal: number) => {
    return subtotal > 0 && subtotal >= settings.freeShippingThreshold
  }

  const remainingForFreeShipping = (subtotal: number) => {
    return Math.max(0, settings.freeShippingThreshold - subtotal)
  }

  const progressPercentage = (subtotal: number) => {
    if (settings.freeShippingThreshold <= 0) return 100
    return Math.min(100, Math.round((subtotal / settings.freeShippingThreshold) * 100))
  }

  return {
    ...settings,
    calculateShipping,
    isFreeShipping,
    remainingForFreeShipping,
    progressPercentage,
  }
}

