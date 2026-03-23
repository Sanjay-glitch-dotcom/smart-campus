// Helper function to construct image URLs
export const getImageUrl = (photoUrl) => {
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8082';
    return `${baseUrl}${photoUrl}`;
};

// Helper function to get API base URL
export const getApiUrl = () => {
    return import.meta.env.VITE_API_URL || 'http://localhost:8082/api';
};
