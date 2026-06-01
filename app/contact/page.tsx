"use client"
import React, { useState } from 'react';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

// Icon Components
const PhoneIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const BoltIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const LoadingSpinner = () => (
  <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (errors[id as keyof FormErrors]) {
      setErrors({ ...errors, [id]: undefined });
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is not valid";
    if (!formData.message.trim()) newErrors.message = "Message cannot be empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus({ loading: true, success: false, error: false });
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ name: '', email: '', message: '' });
        setStatus({ loading: false, success: true, error: false });
        setTimeout(() => setStatus({ loading: false, success: false, error: false }), 3000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch {
      setStatus({ loading: false, success: false, error: true });
      setTimeout(() => setStatus({ loading: false, success: false, error: false }), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-medium">Fast Response Time</span>
            <BoltIcon />
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-sky-200 bg-clip-text text-transparent px-2">
            Let&apos;s Plan Your Adventure
          </h1>
          
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-200 max-w-xl mx-auto leading-relaxed px-4">
            Expert help for boat rentals, jet ski trips, and island excursions in Puerto Rico.
          </p>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative h-12 sm:h-16 w-full text-white">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28 70.36-5.37 136.33-33.31 206.8-37.5 70.85-4.2 144.54 15.67 215.2 34.04 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34 36.25-12.05 86.95-27.55 145.85-21.92 44.2 4.23 85.6 19.62 124.3 40.25 27.9 14.86 52.7 32.94 74.4 53.81V0Z" fill="currentColor"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10 pb-16 sm:pb-20">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl overflow-hidden border border-slate-200">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Info */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-slate-50 to-sky-50 p-5 sm:p-6 md:p-8 lg:p-10">
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">Get in Touch</h2>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    Whether you&apos;re planning a family outing, a romantic getaway, or an adventurous group trip, 
                    we&apos;re here to make your water experience unforgettable.
                  </p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-lg sm:rounded-xl flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
                      <PhoneIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Call Us</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1 break-all">+1 787 988-9321</p>
                      <p className="text-xs sm:text-sm text-gray-500">Mon-Fri, 9am-6pm AST</p>
                    </div>
                  </div>

                  <div className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-lg sm:rounded-xl flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
                      <EmailIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Email Us</p>
                      <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 mt-1 break-all">eduard@elviajeropr.com</p>
                      <p className="text-xs sm:text-sm text-gray-500">We reply within 24 hours</p>
                    </div>
                  </div>

                  <div className="group flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white hover:shadow-lg transition-all duration-300">
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-sky-100 rounded-lg sm:rounded-xl flex items-center justify-center text-sky-700 group-hover:scale-110 transition-transform">
                      <LocationIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider">Visit Us</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-800 mt-1">Fajardo, Puerto Rico</p>
                      <p className="text-xs sm:text-sm text-gray-500">By appointment only</p>
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="bg-white/60 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">Why choose us?</h3>
                  <div className="space-y-2 sm:space-y-3">
                    {[
                      "Instant booking confirmation",
                      "Personalized recommendations",
                      "Group & family packages",
                      "Free cancellation up to 24h"
                    ].map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 sm:gap-3 text-gray-600 text-sm sm:text-base">
                        <span className="text-sky-600 flex-shrink-0"><CheckIcon /></span>
                        <span className="break-words">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 p-5 sm:p-6 md:p-8 lg:p-10">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Send us a message</h2>
                <p className="text-sm sm:text-base text-gray-500">Fill out the form below and we&apos;ll get back to you shortly</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Full Name *</label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'name' ? 'transform scale-[1.01] sm:scale-[1.02]' : ''}`}>
                    <input
                      type="text"
                      id="name"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 bg-white transition-all outline-none text-sm sm:text-base ${errors.name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-sky-500'} ${focusedField === 'name' ? 'shadow-md sm:shadow-lg' : ''}`}
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                    />
                    {formData.name && !errors.name && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckIcon />
                      </div>
                    )}
                  </div>
                  {errors.name && <p className="mt-1 text-xs sm:text-sm text-red-500 animate-fadeIn">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email Address *</label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'transform scale-[1.01] sm:scale-[1.02]' : ''}`}>
                    <input
                      type="email"
                      id="email"
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 bg-white transition-all outline-none text-sm sm:text-base ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-sky-500'} ${focusedField === 'email' ? 'shadow-md sm:shadow-lg' : ''}`}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                    />
                    {formData.email && !errors.email && /\S+@\S+\.\S+/.test(formData.email) && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <CheckIcon />
                      </div>
                    )}
                  </div>
                  {errors.email && <p className="mt-1 text-xs sm:text-sm text-red-500 animate-fadeIn">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Message *</label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'message' ? 'transform scale-[1.01] sm:scale-[1.02]' : ''}`}>
                    <textarea
                      id="message"
                      rows={4}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl border-2 bg-white transition-all outline-none resize-none text-sm sm:text-base ${errors.message ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-sky-500'} ${focusedField === 'message' ? 'shadow-md sm:shadow-lg' : ''}`}
                      placeholder="Tell us about your plans, dates, and any special requests..."
                      value={formData.message}
                      onChange={handleInputChange}
                      onFocus={() => setFocusedField('message')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  {errors.message && <p className="mt-1 text-xs sm:text-sm text-red-500 animate-fadeIn">{errors.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={status.loading}
                  className="relative w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-sky-600 to-blue-700 text-white font-semibold rounded-lg sm:rounded-xl hover:from-sky-700 hover:to-blue-800 transform transition-all duration-200 hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md sm:shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {status.loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <LoadingSpinner />
                      Sending...
                    </span>
                  ) : (
                    "Send Message →"
                  )}
                </button>

                {status.success && (
                  <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl animate-slideUp">
                    <p className="text-green-700 text-center flex items-center justify-center gap-2 text-xs sm:text-sm">
                      <CheckIcon /> Message sent successfully! We&apos;ll get back to you soon.
                    </p>
                  </div>
                )}
                {status.error && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl animate-slideUp">
                    <p className="text-red-700 text-center text-xs sm:text-sm">
                      Failed to send message. Please try again or call us directly.
                    </p>
                  </div>
                )}
              </form>

              <p className="text-[11px] sm:text-xs text-center text-gray-400 mt-6">
                By submitting, you agree to our privacy policy. We never share your information.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 items-center">
          {[
            { text: "500+ Happy Customers", icon: <SparkleIcon /> },
            { text: "4.9 ★ Rating", icon: <StarIcon /> },
            { text: "24h Response", icon: <BoltIcon /> },
            { text: "Best Price", icon: <ShieldIcon /> }
          ].map((badge, idx) => (
            <div key={idx} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 backdrop-blur-sm rounded-full shadow-sm border border-slate-200">
              <span className="text-sky-700 text-xs sm:text-base">{badge.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700 whitespace-nowrap">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
          
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        
        /* Improve touch targets on mobile */
        @media (max-width: 640px) {
          button, 
          input, 
          textarea,
          [role="button"] {
            touch-action: manipulation;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactUs;