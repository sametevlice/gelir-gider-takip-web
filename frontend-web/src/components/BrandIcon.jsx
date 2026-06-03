import { useState, useMemo } from 'react';
import { BRAND_LOGOS } from '../store/useStore';

export default function BrandIcon({ domain: initialDomain, brand, color, size = 'w-8 h-8', iconSize = 'w-5 h-5', className = "" }) {
  const [error, setError] = useState(false);
  
  // Try to find domain from brand name if missing
  const brandInfo = useMemo(() => {
    if (initialDomain && initialDomain !== 'generic') return null;
    if (!brand) return null;
    const lower = brand.toLowerCase();
    return BRAND_LOGOS.find(b => b.keywords.some(k => lower.includes(k)));
  }, [initialDomain, brand]);

  const domain = initialDomain && initialDomain !== 'generic' ? initialDomain : brandInfo?.domain;
  const storeIcon = brandInfo?.icon;

  // High quality logo APIs
  const logoUrl = domain && domain !== 'generic' 
    ? `https://logo.clearbit.com/${domain}` 
    : null;

  const fallbackLogoUrl = domain && domain !== 'generic'
    ? `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`
    : null;

  const letter = brand ? brand.charAt(0).toUpperCase() : '?';

  // Gradient generator for fallback
  const getGradient = (name) => {
    const gradients = [
      'from-indigo-500 to-purple-500',
      'from-emerald-500 to-teal-500',
      'from-orange-500 to-red-500',
      'from-blue-500 to-indigo-500',
      'from-pink-500 to-rose-500'
    ];
    const index = name ? name.length % gradients.length : 0;
    return gradients[index];
  };

  return (
    <div className={`${size} flex items-center justify-center shadow-sm border border-gray-100 shrink-0 overflow-hidden relative ${color || 'bg-gray-50'} ${className || 'rounded-xl'}`}>
      {logoUrl && !error ? (
        <img 
          src={logoUrl} 
          alt={brand}
          className={`${iconSize} object-contain transition-transform group-hover:scale-110`}
          style={{ width: '70%', height: '70%' }} // Increased scale to 70% for better visibility
          onError={() => {
             // Try fallback Google API if Clearbit fails
             setError(true);
          }}
        />
      ) : fallbackLogoUrl && error !== 'final' ? (
        <img 
          src={fallbackLogoUrl} 
          alt={brand}
          className={`${iconSize} object-contain`}
          onError={() => setError('final')}
        />
      ) : storeIcon ? (
        <span className={`${iconSize} flex items-center justify-center text-[18px]`}>{storeIcon}</span>
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${getGradient(brand)} flex items-center justify-center`}>
          <span className="text-white font-extrabold text-[10px] tracking-tighter">{letter}</span>
        </div>
      )}
    </div>
  );
}
