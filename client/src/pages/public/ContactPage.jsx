import React, { useState } from 'react';
import { contactService } from '../../services/contactService';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ScrollReveal from '../../components/common/ScrollReveal';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await contactService.sendMessage(formData);
      if (res.success) {
        setSubmitted(true);
        toast.success('Your message has been sent to the FoodLink team!');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(res.message || 'Failed to deliver message');
      }
    } catch (err) {
      toast.error(err.message || 'Error submitting contact form');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 relative">
      {/* Floating Ambient Element 1 */}
      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-300 shadow-md text-xs font-bold text-forest-900 absolute top-8 right-10 pointer-events-none select-none float-gentle z-10">
        <Clock className="w-3.5 h-3.5 text-emerald-600" />
        <span>24/7 Support Desk Active</span>
      </div>

      {/* Floating Ambient Element 2 */}
      <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-blue-300 shadow-md text-xs font-bold text-slate-800 absolute top-[45%] left-8 pointer-events-none select-none float-delayed z-10">
        <MapPin className="w-3.5 h-3.5 text-blue-600" />
        <span>Coimbatore Logistics Hub</span>
      </div>

      {/* Header */}
      <ScrollReveal variant="fade-up">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-black text-forest-700 tracking-wider uppercase bg-forest-50 px-3.5 py-1 rounded-full border border-forest-200">
            Get in Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-brandText-primary tracking-tight">
            Contact the FoodLink Team
          </h1>
          <p className="text-sm sm:text-base text-brandText-muted font-medium">
            Have questions about institutional donor onboarding, NGO verification, or volunteering? Send us a message and our support desk will respond promptly.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Contact Cards */}
        <ScrollReveal variant="fade-left" delay={80} className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-surface-border shadow-xs card-interactive space-y-6 hover:shadow-xl hover:border-emerald-300 transition-all duration-300">
            <h3 className="text-xl font-black text-brandText-primary">Headquarters & Support</h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-brandText-primary">Platform Operational Hub</strong>
                  <p className="text-xs text-brandText-muted mt-0.5">
                    Civil Aerodrome Post, Coimbatore, Tamil Nadu, 641014
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-brandText-primary">Support Desk</strong>
                  <p className="text-xs text-brandText-muted mt-0.5">support@foodlink.org</p>
                  <p className="text-xs text-brandText-muted">partnerships@foodlink.org</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-brandText-primary">Hotline & Urgent Dispatch</strong>
                  <p className="text-xs text-brandText-muted mt-0.5">+91 98765 43210 (Toll Free)</p>
                </div>
              </div>

              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest-800 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-brandText-primary">Support Availability</strong>
                  <p className="text-xs text-brandText-muted mt-0.5">24/7 Hotline for active food redistributions</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-forest-900 rounded-3xl p-6 sm:p-8 text-white space-y-3 card-interactive hover:shadow-xl transition-all duration-300">
            <h4 className="font-bold text-base">Are you a hotel or catering chain?</h4>
            <p className="text-xs text-forest-200 leading-relaxed font-medium">
              We offer dedicated automated integrations and batch donation scheduling for large convention centers and hospitality groups.
            </p>
          </div>
        </ScrollReveal>

        {/* Right Column: Contact Form */}
        <ScrollReveal variant="fade-right" delay={120} className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-surface-border shadow-xs card-interactive hover:shadow-xl hover:border-emerald-300 transition-all duration-300">
            {submitted ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-forest-100 text-forest-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-brandText-primary">Message Received!</h3>
                <p className="text-sm text-brandText-muted max-w-md mx-auto">
                  Thank you for reaching out. An administrator has received your inquiry and will follow up with you via email shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 bg-forest-900 text-white rounded-xl text-sm font-semibold"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. ramesh@organization.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inquiry regarding NGO verification documents"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brandText-primary uppercase mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Provide details about your query or donation requirement..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-forest-900 hover:bg-forest-800 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Transmitting...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
