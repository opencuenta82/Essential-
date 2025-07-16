export function setupImageCompression() {
  const script = document.createElement('script');
  script.innerHTML = `
    window.compressAndSetImage = function(file) {
      const originalText = document.querySelector('[style*="Arrastra tu logo"]');
      if (originalText) {
        originalText.innerHTML = '⏳ Procesando imagen...';
      }
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        const maxSize = 128;
        let { width, height } = img;
        
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
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.8;
        let compressedData;
        
        do {
          compressedData = canvas.toDataURL('image/jpeg', quality);
          quality -= 0.1;
        } while (compressedData.length > 40000 && quality > 0.1);
        
        if (compressedData.length > 40000) {
          compressedData = canvas.toDataURL('image/png');
        }
        
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
        
        window.dispatchEvent(new CustomEvent('logoCompressed', {
          detail: { data: compressedData }
        }));
        
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
      
      const reader = new FileReader();
      reader.onload = function(e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    window.addEventListener('logoCompressed', function(event) {
      const logoData = event.detail.data;
      const event2 = new CustomEvent('updateLogo', { detail: logoData });
      document.dispatchEvent(event2);
    });
  `;
  document.head.appendChild(script);

  return () => {
    document.head.removeChild(script);
  };
}