const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/api/convert-step`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type when using FormData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};