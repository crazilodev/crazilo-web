export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      site_settings: {
        Row: {
          scope: string
          store_name: string
          support_phone: string | null
          support_email: string | null
          support_address: string | null
          support_hours: string | null
          footer_description: string | null
          free_shipping_threshold: number
          currency_code: string
          instagram_url: string | null
          facebook_url: string | null
          twitter_url: string | null
          youtube_url: string | null
          privacy_policy_url: string | null
          terms_url: string | null
          returns_policy_url: string | null
          store_locator_url: string | null
          faqs_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          scope?: string
          store_name?: string
          support_phone?: string | null
          support_email?: string | null
          support_address?: string | null
          support_hours?: string | null
          footer_description?: string | null
          free_shipping_threshold?: number
          currency_code?: string
          instagram_url?: string | null
          facebook_url?: string | null
          twitter_url?: string | null
          youtube_url?: string | null
          privacy_policy_url?: string | null
          terms_url?: string | null
          returns_policy_url?: string | null
          store_locator_url?: string | null
          faqs_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          scope?: string
          store_name?: string
          support_phone?: string | null
          support_email?: string | null
          support_address?: string | null
          support_hours?: string | null
          footer_description?: string | null
          free_shipping_threshold?: number
          currency_code?: string
          instagram_url?: string | null
          facebook_url?: string | null
          twitter_url?: string | null
          youtube_url?: string | null
          privacy_policy_url?: string | null
          terms_url?: string | null
          returns_policy_url?: string | null
          store_locator_url?: string | null
          faqs_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          role: Database['public']['Enums']['user_role']
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: Database['public']['Enums']['user_role']
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          icon_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          icon_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          icon_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          short_description: string | null
          category_id: string | null
          price: number
          compare_price: number | null
          cost_price: number | null
          sku: string | null
          stock_quantity: number
          low_stock_threshold: number
          track_inventory: boolean
          weight_grams: number | null
          unit: Database['public']['Enums']['product_unit']
          images: string[]
          thumbnail_url: string | null
          is_active: boolean
          is_featured: boolean
          is_bestseller: boolean
          is_new: boolean
          is_organic: boolean
          no_added_sugar: boolean
          meta_title: string | null
          meta_description: string | null
          tags: string[]
          nutritional_info: Json
          average_rating: number
          review_count: number
          total_sold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          price: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          track_inventory?: boolean
          weight_grams?: number | null
          unit?: Database['public']['Enums']['product_unit']
          images?: string[]
          thumbnail_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_bestseller?: boolean
          is_new?: boolean
          is_organic?: boolean
          no_added_sugar?: boolean
          meta_title?: string | null
          meta_description?: string | null
          tags?: string[]
          nutritional_info?: Json
          average_rating?: number
          review_count?: number
          total_sold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          category_id?: string | null
          price?: number
          compare_price?: number | null
          cost_price?: number | null
          sku?: string | null
          stock_quantity?: number
          low_stock_threshold?: number
          track_inventory?: boolean
          weight_grams?: number | null
          unit?: Database['public']['Enums']['product_unit']
          images?: string[]
          thumbnail_url?: string | null
          is_active?: boolean
          is_featured?: boolean
          is_bestseller?: boolean
          is_new?: boolean
          is_organic?: boolean
          no_added_sugar?: boolean
          meta_title?: string | null
          meta_description?: string | null
          tags?: string[]
          nutritional_info?: Json
          average_rating?: number
          review_count?: number
          total_sold?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          sku: string | null
          price: number
          compare_price: number | null
          stock_quantity: number
          weight_grams: number | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          sku?: string | null
          price: number
          compare_price?: number | null
          stock_quantity?: number
          weight_grams?: number | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          sku?: string | null
          price?: number
          compare_price?: number | null
          stock_quantity?: number
          weight_grams?: number | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      banners: {
        Row: {
          id: string
          title: string
          subtitle: string | null
          badge_text: string | null
          image_url: string
          mobile_image_url: string | null
          cta_text: string
          cta_link: string
          display_order: number
          is_active: boolean
          bg_color: string
          text_color: string
          starts_at: string | null
          ends_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          subtitle?: string | null
          badge_text?: string | null
          image_url: string
          mobile_image_url?: string | null
          cta_text?: string
          cta_link?: string
          display_order?: number
          is_active?: boolean
          bg_color?: string
          text_color?: string
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          subtitle?: string | null
          badge_text?: string | null
          image_url?: string
          mobile_image_url?: string | null
          cta_text?: string
          cta_link?: string
          display_order?: number
          is_active?: boolean
          bg_color?: string
          text_color?: string
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          text: string
          link: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          text: string
          link?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          text?: string
          link?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      testimonials: {
        Row: {
          id: string
          name: string
          location: string
          rating: number
          text: string
          product_name: string
          avatar_initial: string
          avatar_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          location: string
          rating: number
          text: string
          product_name: string
          avatar_initial: string
          avatar_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          rating?: number
          text?: string
          product_name?: string
          avatar_initial?: string
          avatar_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      home_feature_cards: {
        Row: {
          id: string
          section_key: string
          eyebrow_text: string | null
          title: string
          subtitle: string
          description: string | null
          image_url: string
          category_id: string | null
          link_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_key: string
          eyebrow_text?: string | null
          title: string
          subtitle: string
          description?: string | null
          image_url: string
          category_id?: string | null
          link_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          section_key?: string
          eyebrow_text?: string | null
          title?: string
          subtitle?: string
          description?: string | null
          image_url?: string
          category_id?: string | null
          link_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      home_highlights: {
        Row: {
          id: string
          icon_key: string
          title: string
          description: string
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          icon_key: string
          title: string
          description: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          icon_key?: string
          title?: string
          description?: string
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      coupons: {
        Row: {
          id: string
          code: string
          description: string | null
          discount_type: Database['public']['Enums']['coupon_discount_type']
          discount_value: number
          minimum_order_amount: number
          maximum_discount: number | null
          usage_limit: number | null
          used_count: number
          is_active: boolean
          starts_at: string
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          discount_type: Database['public']['Enums']['coupon_discount_type']
          discount_value: number
          minimum_order_amount?: number
          maximum_discount?: number | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          starts_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          discount_type?: Database['public']['Enums']['coupon_discount_type']
          discount_value?: number
          minimum_order_amount?: number
          maximum_discount?: number | null
          usage_limit?: number | null
          used_count?: number
          is_active?: boolean
          starts_at?: string
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          pincode: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name: string
          phone: string
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          pincode: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string
          phone?: string
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          pincode?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          shipping_address: Json
          billing_address: Json | null
          subtotal: number
          discount_amount: number
          shipping_amount: number
          tax_amount: number
          total_amount: number
          coupon_code: string | null
          coupon_id: string | null
          status: Database['public']['Enums']['order_status']
          payment_status: Database['public']['Enums']['payment_status']
          payment_method: string
          payment_id: string | null
          tracking_number: string | null
          tracking_url: string | null
          customer_notes: string | null
          admin_notes: string | null
          confirmed_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          user_id?: string | null
          shipping_address: Json
          billing_address?: Json | null
          subtotal: number
          discount_amount?: number
          shipping_amount?: number
          tax_amount?: number
          total_amount: number
          coupon_code?: string | null
          coupon_id?: string | null
          status?: Database['public']['Enums']['order_status']
          payment_status?: Database['public']['Enums']['payment_status']
          payment_method?: string
          payment_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          confirmed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          shipping_address?: Json
          billing_address?: Json | null
          subtotal?: number
          discount_amount?: number
          shipping_amount?: number
          tax_amount?: number
          total_amount?: number
          coupon_code?: string | null
          coupon_id?: string | null
          status?: Database['public']['Enums']['order_status']
          payment_status?: Database['public']['Enums']['payment_status']
          payment_method?: string
          payment_id?: string | null
          tracking_number?: string | null
          tracking_url?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          confirmed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          variant_id: string | null
          product_name: string
          variant_name: string | null
          sku: string | null
          thumbnail_url: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          variant_id?: string | null
          product_name: string
          variant_name?: string | null
          sku?: string | null
          thumbnail_url?: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          variant_id?: string | null
          product_name?: string
          variant_name?: string | null
          sku?: string | null
          thumbnail_url?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          body: string | null
          images: string[]
          is_verified_purchase: boolean
          is_approved: boolean
          helpful_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          body?: string | null
          images?: string[]
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          body?: string | null
          images?: string[]
          is_verified_purchase?: boolean
          is_approved?: boolean
          helpful_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          is_active: boolean
          subscribed_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_active?: boolean
          subscribed_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      create_order_with_items: {
        Args: {
          p_shipping_address: Json
          p_billing_address: Json | null
          p_coupon_code: string | null
          p_payment_method: string | null
          p_customer_notes: string | null
          p_items: Json
        }
        Returns: Database['public']['Tables']['orders']['Row']
      }
    }
    Enums: {
      user_role: 'customer' | 'admin'
      product_unit: 'g' | 'kg' | 'ml' | 'l' | 'pcs' | 'pack'
      coupon_discount_type: 'percentage' | 'fixed'
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<
  TableName extends keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Row']

export type TableInsert<
  TableName extends keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Insert']

export type TableUpdate<
  TableName extends keyof Database['public']['Tables']
> = Database['public']['Tables'][TableName]['Update']
