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
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response:', errorText);
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    // Get the blob directly instead of parsing as JSON
    const blob = await response.blob();
    
    // Create a download link for the STL file
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.(step|stp)$/i, '.stl');
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true, message: 'File converted and downloaded' };

  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};