import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, // Replace with your Sanity project ID
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production", // Replace with your dataset name
  apiVersion: "2024-12-09", // Use the latest or specific API version
  useCdn: false, // Set to false for real-time updates
  token: "skGf8dp50rYdfnAsPssArxt8NEdlabVnmbrtdQgnxzmxqL4FGomOYwHnCbHxtnqWaYeqsI2SA3VkPyKxhHd25SLfOkGSD43uPocyZKzESQRxY2fE17QqjpYc3v5OEbMZuUPkCbcphjzuJXt6sJ77Q4cdCxd5eygHV4AyFYw6VxeWi5JfPuc2", // Use the API token with write permissions

});
