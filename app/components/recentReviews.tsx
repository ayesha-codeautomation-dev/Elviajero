"use client";

import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";


interface Review {
  quote: string;
  author: string;
  location: string;
  customerPhotos: (string | { _type: string; asset: { _type: string; _ref: string; } })[]; // Updated to allow both strings and objects
  image: string | { _type: string; asset: { _type: string; _ref: string; } }; // Updated to allow both string and object
}

const CustomerReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState<Review>({
    quote: "",
    author: "",
    location: "",
    customerPhotos: [] as (string | { _type: string; asset: { _type: string; _ref: string; } })[], // Corrected type for customerPhotos
    image: "", // Initialize as a string
  });
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function getData() {
      const query = `*[_type == 'review'] | order(_createdAt desc)`; // Sort by creation date in descending order
      try {
        const fetchData = await client.fetch(query);
        setReviews(fetchData); // Store fetched data in state
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    getData(); // Call the function to fetch data
  }, []); // Empty dependency array means this effect runs once when the component mounts

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReview((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      console.log("Uploading file:", file);

      try {
        // Upload the image to Sanity and wait for the response
        const uploadedImage = await client.assets.upload('image', file);
        console.log("Uploaded Image:", uploadedImage);  // Check the uploaded image response

        if (uploadedImage && uploadedImage._id) {
          setNewReview((prev) => ({
            ...prev,
            image: {
              _type: 'image',
              asset: {
                _type: 'reference',
                _ref: uploadedImage._id, // This is now valid as per the updated state type
              },
            },
          }));
        } else {
          console.error("Uploaded image asset is undefined");
          alert("Image upload failed. Please try again.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error uploading image:", error.message);
          alert(`An error occurred: ${error.message}. Please try again.`);
        } else {
          console.error("Unknown error occurred");
          alert("An unknown error occurred. Please try again.");
        }
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files); // Convert FileList to an array
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          // Upload each file to Sanity and wait for the response
          const uploadedFile = await client.assets.upload('image', file);

          return {
            _key: crypto.randomUUID(), // Ensure each file has a unique key
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: uploadedFile._id, // Reference to the uploaded file's asset ID
            },
          };
        })
      );

      // Update the state with the array of asset references
      setNewReview((prev) => ({
        ...prev,
        customerPhotos: [...prev.customerPhotos, ...uploadedFiles],
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Check if image is already uploaded
    if (!newReview.image) {
      alert("Please upload an image before submitting the review.");
      setLoading(false);
      return;
    }

    console.log("Submitting review:", newReview);

    try {
      await client.create({
        _type: 'review',
        quote: newReview.quote,
        author: newReview.author,
        location: newReview.location,
        customerPhotos: newReview.customerPhotos,
        image: newReview.image, // Profile image asset reference
      });

      const updatedReviews = await client.fetch(`*[_type == 'review'] | order(_createdAt desc)`);
      setReviews(updatedReviews);
      setModalVisible(false);

      setNewReview({
        quote: '',
        author: '',
        location: '',
        customerPhotos: [],
        image: '',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error submitting review:', error.message);
        alert(`An error occurred: ${error.message}. Please try again.`);
      } else {
        console.error('Unknown error occurred');
        alert("An unknown error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e3e4ee] py-16">
      <h2 className="text-center text-3xl font-semibold mb-8">What Our Customers Say</h2>

      <div className="bg-white bg-opacity-40 rounded-lg shadow-lg max-w-5xl mx-auto px-4 relative">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          navigation={{
            prevEl: ".prev-button",
            nextEl: ".next-button",
          }}
          pagination={{ clickable: true }}
          className="swiper-container"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={index}>
              <div className="p-6 flex flex-col items-center text-center">
                {/* Profile Image */}
                {review.image ? (
                  <img
                    src={urlFor(review.image)?.url()} // Use optional chaining for safety
                    alt={`Review by ${review.author}`}
                    className="w-[60px] h-[60px] mb-6 object-cover rounded-full shadow-sm"
                  />
                ) : (
                  <img
                    src="/user.svg" // Default user image
                    alt="user"
                    className="w-15 h-15 mb-6 object-cover rounded-md shadow-sm"
                  />
                )}

                {/* Quote */}
                <p className="text-lg italic text-gray-700 max-w-2xl">“{review.quote}”</p>

                {/* Author and Location */}
                <p className="text-gray-900 font-semibold mt-4">{review.author}</p>
                <p className="text-gray-600 mb-6">{review.location}</p>

                {/* Customer Photos */}
                <div className="flex mb-6 flex-wrap justify-center gap-4 mt-4">
                  {review.customerPhotos?.length > 0 ? (
                    review.customerPhotos.map((photo, i) => (
                      <img
                        key={i}
                        src={urlFor(photo)?.url()} // Use optional chaining for safety
                        alt={`Customer photo ${i + 1}`}
                        className="w-40 h-30 object-cover rounded-md shadow-sm"
                      />
                    ))
                  ) : (
                    <p>No customer photos available.</p>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="absolute top-1/2 transform -translate-y-1/2 left-4 z-10">
          <button className="prev-button bg-white hover:bg-black text-black hover:text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>
        <div className="absolute top-1/2 transform -translate-y-1/2 right-4 z-10">
          <button className="next-button bg-white hover:bg-black text-black hover:text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition transform hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Centered Write Review Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => setModalVisible(true)} // Show the modal when clicked
          className="px-3 py-2 w-48 bg-blue-500 mt-4 text-white rounded-lg shadow-md hover:bg-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105"
        >
          Write a Review
        </button>
      </div>



      {/* Modal */}
      {modalVisible && (
        <div className="fixed px-6 inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-xl w-full relative">
            {/* Close Button */}
            <button
              onClick={() => setModalVisible(false)} // Close modal when clicked
              className="absolute top-2 left-2 p-2 bg-transparent hover:bg-transparent text-gray-600 hover:text-gray-800"
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>


            <h3 className="text-center text-2xl mt-10 font-semibold mb-4">Submit Your Review</h3>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <input
                type="text"
                name="quote"
                value={newReview.quote}
                onChange={handleInputChange}
                placeholder="Enter your review"
                className="mb-4 p-2 border rounded-md w-3/4"
                required
              />
              <input
                type="text"
                name="author"
                value={newReview.author}
                onChange={handleInputChange}
                placeholder="Your name"
                className="mb-4 p-2 border rounded-md w-3/4"
                required
              />
              <input
                type="text"
                name="location"
                value={newReview.location}
                onChange={handleInputChange}
                placeholder="Your location"
                className="mb-4 p-2 border rounded-md w-3/4"
                required
              />
              <div className="flex flex-col items-start">
                <p className="mb-2">Your Image</p>
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="mb-4 "
                  required
                />
              </div>
              <div className="flex flex-col items-start">
                <p className="mb-2">Your Experience</p> {/* Align text to the left */}
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mb-4 "
                  multiple
                />
              </div>


              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 mb-3 bg-blue-600 text-white rounded-md w-3/4"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;
