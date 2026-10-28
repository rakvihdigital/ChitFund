// Shared with the server layout, so it lives outside the client-only i18n module
export const LANGUAGE_STORAGE_KEY = 'rakvih-language';

// Runs before the page paints: hides it while a saved non-English dictionary loads, so English never flashes
export const languageBootScript = `(function(){try{var l=localStorage.getItem('${LANGUAGE_STORAGE_KEY}');if(l&&l!=='en'&&location.pathname.indexOf('/admin')!==0){var r=document.documentElement;r.lang=l;r.classList.add('i18n-loading');setTimeout(function(){r.classList.remove('i18n-loading')},2500)}}catch(e){}})();`;
