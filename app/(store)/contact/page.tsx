'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, CheckCircle2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error('Please fill out all required fields.')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      toast.success('Thank you! Your message has been sent successfully.')
    }, 800)
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0]/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#B91C1C] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C1C] flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight font-heading">
            Contact Us
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Have questions about your order, our dry fruits, or corporate bulk gifting? We&apos;d love to hear from you. Send us a message or reach out using the details below.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Phone Support</h4>
            <p className="text-xs font-bold text-[#B91C1C]">+91 98765 43210</p>
            <p className="text-[11px] text-gray-500">Mon–Sat: 9:00 AM – 6:00 PM IST</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Email Inquiry</h4>
            <p className="text-xs font-bold text-[#B91C1C]">hello@crazilo.com</p>
            <p className="text-[11px] text-gray-500">Fast response within 24 hours</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-2">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C1C] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Headquarters</h4>
            <p className="text-xs text-gray-700 font-semibold">Mumbai, Maharashtra, India</p>
            <p className="text-[11px] text-gray-500">Pan-India Warehousing & Express Shipping</p>
          </div>
        </div>

        {/* Contact Form Container */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-gray-900 font-heading">Send Us a Message</h2>
            <p className="text-xs text-gray-500">Fill out the form below and our customer experience team will get back to you shortly.</p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900">Message Received!</h3>
              <p className="text-xs text-emerald-700 max-w-md mx-auto">
                Thank you for reaching out to Crazilo. Our customer team has received your message and will respond via email shortly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
                }}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#B91C1C]"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#B91C1C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#B91C1C]"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="e.g. Order Inquiry / Bulk Gifting"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#B91C1C]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Message Details *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can we help you today?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-xs text-gray-900 focus:outline-none focus:border-[#B91C1C]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#B91C1C] hover:bg-[#7F1D1D] text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
