// Script para manejar la compresión de imágenes
export const imageCompressionScript = `
window.compressAndSetImage = function(file) {
  // Mostrar indicador de procesamiento
  const originalText = document.querySelector('[style*="Arrastra tu logo"]');
  if (originalText) {
    originalText.innerHTML = '⏳ Procesando imagen...';
  }
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  img.onload = function() {
    // Configurar tamaño máximo (128x128 para logos)
    const maxSize = 128;
    let { width, height } = img;
    
    // Calcular nuevas dimensiones manteniendo proporción
    if (width > height) {
      if (width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      }
    } else {
      if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
    }
    
    // Configurar canvas
    canvas.width = width;
    canvas.height = height;
    
    // Dibujar imagen redimensionada
    ctx.drawImage(img, 0, 0, width, height);
    
    // Convertir a base64 con compresión
    let quality = 0.8;
    let compressedData;
    
    do {
      compressedData = canvas.toDataURL('image/jpeg', quality);
      quality -= 0.1;
    } while (compressedData.length > 40000 && quality > 0.1);
    
    // Si aún es muy grande, intentar con PNG
    if (compressedData.length > 40000) {
      compressedData = canvas.toDataURL('image/png');
    }
    
    // Si todavía es muy grande, reducir más el tamaño
    if (compressedData.length > 40000) {
      canvas.width = width * 0.7;
      canvas.height = height * 0.7;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      compressedData = canvas.toDataURL('image/jpeg', 0.6);
    }
    
    console.log('📸 Imagen comprimida:', {
      originalSize: file.size,
      compressedLength: compressedData.length,
      dimensions: width + 'x' + height,
      format: 'JPEG/PNG optimizado'
    });
    
    // Actualizar el estado
    window.dispatchEvent(new CustomEvent('logoCompressed', {
      detail: { data: compressedData }
    }));
    
    // Restaurar texto original
    setTimeout(() => {
      if (originalText) {
        originalText.innerHTML = 'Arrastra tu logo aquí o haz clic para seleccionar';
      }
    }, 100);
  };
  
  img.onerror = function() {
    alert('❌ Error al procesar la imagen. Por favor, intenta con otra imagen.');
    if (originalText) {
      originalText.innerHTML = 'Arrastra tu logo aquí o haz clic para seleccionar';
    }
  };
  
  // Crear URL para la imagen
  const reader = new FileReader();
  reader.onload = function(e) {
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Event listener para la compresión
window.addEventListener('logoCompressed', function(event) {
  const logoData = event.detail.data;
  const event2 = new CustomEvent('updateLogo', { detail: logoData });
  document.dispatchEvent(event2);
});
`;