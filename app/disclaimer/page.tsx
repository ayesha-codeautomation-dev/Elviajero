import React from 'react';

const DisclaimerPage = () => {
  return (
    <div className="min-h-screen bg-teal-50 py-10 px-6">
      <div className="max-w-3xl mt-10 mx-auto">
        <h1 className="text-4xl font-bold text-center text-[#003b73] mb-6">Disclaimer</h1>
        <p className="text-center text-gray-700 mb-10">
          This disclaimer outlines the terms and conditions regarding the use of our website and the information provided herein.
        </p>

        <div className="bg-white shadow-lg rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-[#003b73] mb-4">General Information</h2>
          <p className="text-gray-700 mb-6">
            The content on this website is provided for informational purposes only. While we strive to ensure the accuracy of the information, 
            <span className="font-semibold"> ElViajero</span> makes no guarantees regarding the completeness, reliability, or suitability of the content for your needs.
          </p>

          <h2 className="text-2xl font-semibold text-[#003b73] mb-4">Product Descriptions</h2>
          <p className="text-gray-700 mb-6">
            We do our best to provide accurate and detailed descriptions of our home appliances and self-care products. However, slight variations may occur due to differences in manufacturing or display settings. Please refer to the product specifications for exact details.
          </p>

          <h2 className="text-2xl font-semibold text-[#003b73] mb-4">Third-Party Links</h2>
          <p className="text-gray-700 mb-6">
            Our website may contain links to third-party websites. These are provided for your convenience and do not imply endorsement by 
            <span className="font-semibold"> ElViajero</span>. We are not responsible for the content or practices of these external sites.
          </p>

          <h2 className="text-2xl font-semibold text-[#003b73] mb-4">Health and Safety Disclaimer</h2>
          <p className="text-gray-700 mb-6">
            Our self-care products are designed to promote well-being, but they are not intended to diagnose, treat, cure, or prevent any disease. Please consult a healthcare professional before using any product if you have specific health concerns.
          </p>

          <h2 className="text-2xl font-semibold text-[#003b73] mb-4">Limitation of Liability</h2>
          <p className="text-gray-700 mb-6">
            <span className="font-semibold"> ElViajero</span> shall not be held liable for any direct, indirect, or incidental damages resulting from the use of this website or the purchase and use of our products. Your use of this site is at your own risk.
          </p>

          <h2 className="text-2xl font-semibold text-[#003b73] mb-4">Updates to This Disclaimer</h2>
          <p className="text-gray-700 mb-6">
            We reserve the right to update or modify this disclaimer at any time without prior notice. Any changes will be posted on this page, and it is your responsibility to review it regularly.
          </p>

          <h2 className="text-2xl font-semibold text-[#003b73] mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions or concerns regarding this disclaimer, please feel free to contact us at{' '}
            <a
              href="mailto:eduard@elviajeropr.com"
              className="text-[#003b73] underline"
            >
              eduard@elviajeropr.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerPage;
