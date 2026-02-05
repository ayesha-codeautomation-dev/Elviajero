import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion, // Use the latest or specific API version
  useCdn: false, // Set to false for real-time updates
  token: "skGf8dp50rYdfnAsPssArxt8NEdlabVnmbrtdQgnxzmxqL4FGomOYwHnCbHxtnqWaYeqsI2SA3VkPyKxhHd25SLfOkGSD43uPocyZKzESQRxY2fE17QqjpYc3v5OEbMZuUPkCbcphjzuJXt6sJ77Q4cdCxd5eygHV4AyFYw6VxeWi5JfPuc2", // Use the API token with write permissions
})
