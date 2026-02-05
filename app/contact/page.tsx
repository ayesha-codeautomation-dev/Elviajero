"use client"
import React, { useState } from 'react';

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}


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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is not valid";
    if (!formData.message) newErrors.message = "Message cannot be empty";
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
      } else {
        throw new Error('Failed to send message');
      }
    } catch {
      setStatus({ loading: false, success: false, error: true });
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 py-10 px-6">
      <div className="max-w-5xl mt-10 mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#003b73] mb-6">
          Contact Us
        </h1>
        <p className="text-center text-gray-700 mb-10">
          Feel free to reach out to us for any inquiries or special requests. We&apos;re here to help!
        </p>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Get in Touch</h2>
            <ul className="space-y-3 text-gray-700">
              <li>
                <strong>Address:</strong> #60, Unit B, Calle Dr. Lopez, Fajardo, Puerto Rico, 00738
              </li>
              <li>
                <strong>Phone:</strong> +1 787 988-9321
              </li>
              <li>
                <strong>Email:</strong> eduard@elviajeropr.com
              </li>
              <li>
                <strong>Follow us:</strong>
                <div className="flex space-x-4 mt-2">
                  <a
                    href="https://www.facebook.com/profile.php?id=61578483729063"
                    className="text-blue-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/el_viajero_pr/"
                    className="text-pink-600 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>

                  <a
                    href="https://wa.me/17879889321"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    Whatsapp
                  </a>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Location</h2>
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3812.1610204510703!2d-65.6544967!3d18.3243322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c0497df9f8c12e9%3A0x2154aa782f4cbe75!2sEl%20Viajero!5e1!3m2!1sen!2s!4v1753715143330!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </div>

      {/* Contact Form */}
      <div className="bg-white max-w-4xl mx-auto shadow-lg rounded-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Us a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              className={`mt-1 w-full p-3 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400`}
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium">
              Your Email
            </label>
            <input
              type="email"
              id="email"
              className={`mt-1 w-full p-3 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400`}
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 font-medium">
              Your Message
            </label>
            <textarea
              id="message"
              rows={4}
              className={`mt-1 w-full p-3 border ${errors.message ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400`}
              placeholder="Write your message here..."
              value={formData.message}
              onChange={handleInputChange}
              required
            ></textarea>
            {errors.message && <p className="text-red-600 text-sm mt-1">{errors.message}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors"
            disabled={status.loading}
          >
            {status.loading ? 'Sending...' : 'Send Message'}
          </button>
          {status.success && <p className="text-green-600 mt-4">Message sent successfully!</p>}
          {status.error && <p className="text-red-600 mt-4">Failed to send the message. Please try again.</p>}
        </form>
      </div>
    </div>
  );
};

export default ContactUs;
