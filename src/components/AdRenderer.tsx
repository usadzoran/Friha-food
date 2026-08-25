import React, { useEffect, useRef, useState } from 'react';
import { AdPlacement, AdSlot } from '../types';
import { Megaphone, X } from 'lucide-react';

interface AdRendererProps {
  placement: AdPlacement;
  ads?: AdSlot[];
  className?: string;
  showAdminPlaceholder?: boolean;
}

export const AdRenderer: React.FC<AdRendererProps> = ({
  placement,
  ads = [],
  className = '',
  showAdminPlaceholder = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPopupDismissed, setIsPopupDismissed] = useState(false);

  // Find active ads for this placement
  const activeAds = ads.filter((ad) => ad.placement === placement && ad.is_active && ad.html_code?.trim());
  const currentAd = activeAds[0];

  useEffect(() => {
    if (!currentAd || !currentAd.html_code) return;

    // Handle custom_head_script separately
    if (placement === 'custom_head_script') {
      const scriptWrapperId = `head_script_${currentAd.id}`;
      let existingWrapper = document.getElementById(scriptWrapperId);
      if (!existingWrapper) {
        existingWrapper = document.createElement('div');
        existingWrapper.id = scriptWrapperId;
        existingWrapper.style.display = 'none';
        document.body.appendChild(existingWrapper);
      }

      existingWrapper.innerHTML = currentAd.html_code;
      executeScriptsInElement(existingWrapper);

      return () => {
        if (existingWrapper && existingWrapper.parentNode) {
          existingWrapper.parentNode.removeChild(existingWrapper);
        }
      };
    }

    // Handle in-page container HTML & script execution
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = currentAd.html_code;
    executeScriptsInElement(container);

  }, [currentAd, placement]);

  // Helper to execute embedded <script> tags
  function executeScriptsInElement(element: HTMLElement) {
    const scripts = element.querySelectorAll('script');
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');
      
      // Copy all attributes (src, type, async, defer, crossorigin, etc.)
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy inner script code
      newScript.textContent = oldScript.textContent;

      // Replace old script with newly created executable script
      if (oldScript.parentNode) {
        oldScript.parentNode.replaceChild(newScript, oldScript);
      }
    });
  }

  // Head script renders no visible UI
  if (placement === 'custom_head_script') {
    return null;
  }

  // Popup ad
  if (placement === 'popup_ad') {
    if (!currentAd || isPopupDismissed) return null;

    return (
      <div 
        id={`ad-popup-${currentAd.id}`}
        className="fixed bottom-4 left-4 z-50 max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700">
            <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>إعلان ترويجي</span>
          </div>
          <button
            onClick={() => setIsPopupDismissed(true)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="إغلاق الإعلان"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div ref={containerRef} className="ad-content-slot overflow-hidden" />
      </div>
    );
  }

  // If no active ad
  if (!currentAd) {
    if (showAdminPlaceholder) {
      return (
        <div className={`p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50 ${className}`}>
          <p className="text-xs text-slate-400 font-bold">مساحة إعلانية فارغة ({placement})</p>
        </div>
      );
    }
    return null;
  }

  // Standard in-page ad container
  return (
    <div
      id={`ad-slot-${placement}`}
      className={`ad-container-wrapper overflow-hidden transition-all duration-300 ${className}`}
    >
      <div ref={containerRef} className="ad-html-content w-full" />
    </div>
  );
};
