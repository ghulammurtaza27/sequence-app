const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    console.log('Uploading to:', `${API_URL}/api/convert-step`);

    const response = await fetch(`${API_URL}/api/convert-step`, {
      method: 'POST',
      body: formData,
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': '*/*',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload response:', result);
    return result;

  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};