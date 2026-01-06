// REPLACE client/src/lib/wallpaperPresets.js with this:

export const wallpaperPresets = {
  gradients: [
    {
      id: 'sunset',
      name: 'Sunset Glow',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'ocean',
      name: 'Ocean Breeze',
      value: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)',
      thumbnail: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)'
    },
    {
      id: 'forest',
      name: 'Forest Mist',
      value: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)',
      thumbnail: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)'
    },
    {
      id: 'sunrise',
      name: 'Morning Sunrise',
      value: 'linear-gradient(135deg, #FF9A56 0%, #FFD39A 100%)',
      thumbnail: 'linear-gradient(135deg, #FF9A56 0%, #FFD39A 100%)'
    },
    {
      id: 'lavender',
      name: 'Lavender Dream',
      value: 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)',
      thumbnail: 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)'
    },
    {
      id: 'midnight',
      name: 'Midnight Blue',
      value: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
      thumbnail: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)'
    },
    {
      id: 'aurora',
      name: 'Aurora',
      value: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)',
      thumbnail: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)'
    },
    {
      id: 'peachy',
      name: 'Peachy',
      value: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)',
      thumbnail: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)'
    },
    {
      id: 'cosmic',
      name: 'Cosmic Purple',
      value: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)',
      thumbnail: 'linear-gradient(135deg, #7F00FF 0%, #E100FF 100%)'
    },
    {
      id: 'ember',
      name: 'Ember',
      value: 'linear-gradient(135deg, #FF4E50 0%, #F9D423 100%)',
      thumbnail: 'linear-gradient(135deg, #FF4E50 0%, #F9D423 100%)'
    },
    {
      id: 'mint',
      name: 'Mint Fresh',
      value: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)',
      thumbnail: 'linear-gradient(135deg, #00B4DB 0%, #0083B0 100%)'
    },
    {
      id: 'rose',
      name: 'Rose Garden',
      value: 'linear-gradient(135deg, #ED4264 0%, #FFEDBC 100%)',
      thumbnail: 'linear-gradient(135deg, #ED4264 0%, #FFEDBC 100%)'
    }
  ],

  patterns: [
    {
      id: 'dots',
      name: 'Dots',
      value: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
      backgroundSize: '30px 30px',
      backgroundColor: '#1a1a1a'
    },
    {
      id: 'grid',
      name: 'Grid',
      value: 'linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      backgroundColor: '#0a0a0a'
    },
    {
      id: 'waves',
      name: 'Waves',
      value: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)',
      backgroundColor: '#1a1a2e'
    }
  ],

  // NEW: Curated image wallpapers
  images: [
    {
      id: 'abstract-waves',
      name: 'Abstract Waves',
      value: '/wallpapers/abstract-waves.jpg'
    },
    {
      id: 'gradient-mesh',
      name: 'Gradient Mesh',
      value: '/wallpapers/gradient-mesh.jpg'
    },
    {
      id: 'mountain-sunset',
      name: 'Mountain Sunset',
      value: '/wallpapers/mountain-sunset.jpg'
    },
    {
      id: 'ocean-blur',
      name: 'Ocean Blur',
      value: '/wallpapers/ocean-blur.jpeg'
    },
    {
      id: 'northern-lights',
      name: 'Northern Lights',
      value: '/wallpapers/northern-lights.jpg'
    },
    {
      id: 'desert-dunes',
      name: 'Desert Dunes',
      value: '/wallpapers/desert-dunes.jpg'
    },
    {
      id: 'forest-mist',
      name: 'Forest Mist',
      value: '/wallpapers/forest-mist.jpg'
    },
    {
      id: 'city-lights',
      name: 'City Lights',
      value: '/wallpapers/city-lights.jpg'
    },
    {
      id: 'space-nebula',
      name: 'Space Nebula',
      value: '/wallpapers/space-nebula.jpg'
    },
    {
      id: 'minimalist-texture',
      name: 'Minimalist',
      value: '/wallpapers/minimalist-texture.jpg'
    },
    {
      id: 'black-mist',
      name: 'Black Mist',
      value: '/wallpapers/black-mist.jpg'
    },
    {
      id: 'heavens-gate',
      name: 'Heaven"s Gate',
      value: '/wallpapers/heavens-gate.jpg'
    }
  ]
};

// Helper to get wallpaper CSS
export const getWallpaperCSS = (type, value, blur = 0, brightness = 100) => {
  const allPresets = [
    ...wallpaperPresets.gradients, 
    ...wallpaperPresets.patterns,
    ...wallpaperPresets.images
  ];
  
  const preset = allPresets.find(p => p.id === value);

  let style = {};

  if (type === 'gradient' && preset) {
    style.background = preset.value;
    if (preset.backgroundSize) {
      style.backgroundSize = preset.backgroundSize;
    }
    if (preset.backgroundColor) {
      style.backgroundColor = preset.backgroundColor;
    }
  } else if (type === 'pattern' && preset) {
    style.background = preset.value;
    style.backgroundSize = preset.backgroundSize;
    style.backgroundColor = preset.backgroundColor;
  } else if (type === 'image') {
    // For curated images, value is the ID
    const imagePreset = wallpaperPresets.images.find(img => img.id === value);
    if (imagePreset) {
      style.backgroundImage = `url(${imagePreset.value})`;
    } else {
      // Fallback if value is already a path
      style.backgroundImage = `url(${value})`;
    }
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
    style.backgroundRepeat = 'no-repeat';
    style.backgroundAttachment = 'fixed';
  }

  // Apply blur and brightness
  if (blur > 0) {
    style.filter = `blur(${blur}px) brightness(${brightness}%)`;
  } else {
    style.filter = `brightness(${brightness}%)`;
  }

  return style;
};