import AnnouncementBar from '@/components/layout/AnnouncementBar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import { getActiveAnnouncements, getHomeHighlights, getSiteSettings } from '@/lib/data/content'
import { getMainCategories } from '@/lib/data/categories'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const [siteSettings, announcements, mainCategories, highlights] = await Promise.all([
    getSiteSettings(supabase),
    getActiveAnnouncements(supabase),
    getMainCategories(supabase),
    getHomeHighlights(supabase),
  ])

  return (
    <>
      <AnnouncementBar announcements={announcements} siteSettings={siteSettings} highlights={highlights} />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer categories={mainCategories} siteSettings={siteSettings} />
    </>
  )
}
