export interface CurrencyInfo {
  code: string;
  symbol: string;
  label: string;
  flag: string;
  region: string;
  ratePerKes: number; // multiplier to convert KES -> this currency
}

export const SUPPORTED_CURRENCIES: Record<string, CurrencyInfo> = {
  KES: {
    code: 'KES',
    symbol: 'KES ',
    label: 'Kenyan Shilling',
    flag: '🇰🇪',
    region: 'Kenya & East Africa',
    ratePerKes: 1,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'US Dollar',
    flag: '🇺🇸',
    region: 'United States & Global',
    ratePerKes: 1 / 130, // 1 USD ~ 130 KES
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'Euro',
    flag: '🇪🇺',
    region: 'European Union',
    ratePerKes: 1 / 142, // 1 EUR ~ 142 KES
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    label: 'British Pound',
    flag: '🇬🇧',
    region: 'United Kingdom',
    ratePerKes: 1 / 168, // 1 GBP ~ 168 KES
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    label: 'Canadian Dollar',
    flag: '🇨🇦',
    region: 'Canada',
    ratePerKes: 1 / 95, // 1 CAD ~ 95 KES
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    label: 'Australian Dollar',
    flag: '🇦🇺',
    region: 'Australia',
    ratePerKes: 1 / 85, // 1 AUD ~ 85 KES
  },
  ZAR: {
    code: 'ZAR',
    symbol: 'R ',
    label: 'South African Rand',
    flag: '🇿🇦',
    region: 'South Africa',
    ratePerKes: 1 / 7.2, // 1 ZAR ~ 7.2 KES
  },
  NGN: {
    code: 'NGN',
    symbol: '₦',
    label: 'Nigerian Naira',
    flag: '🇳🇬',
    region: 'Nigeria',
    ratePerKes: 1 / 0.085, // 1 NGN ~ 0.085 KES
  },
};

export interface DetectedRegion {
  currencyCode: string;
  regionName: string;
  flag: string;
  isAutoDetected: boolean;
}

let cachedDetectedRegion: DetectedRegion | null = null;

/**
 * Silently detects the visitor's geographic region in the background using browser timezone & locale.
 */
export function detectVisitorRegion(): DetectedRegion {
  if (cachedDetectedRegion) return cachedDetectedRegion;

  if (typeof window === 'undefined') {
    return {
      currencyCode: 'KES',
      regionName: 'Kenya (Studio Base)',
      flag: '🇰🇪',
      isAutoDetected: false,
    };
  }

  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.language || '').toLowerCase();
    const languages = (navigator.languages || []).map((l) => l.toLowerCase());

    // 1. Kenya & East Africa
    if (
      tz.includes('Nairobi') ||
      tz.includes('Kampala') ||
      tz.includes('Dar_es_Salaam') ||
      tz.includes('Kigali') ||
      lang.includes('ke') ||
      lang.startsWith('sw') ||
      languages.some((l) => l.includes('-ke'))
    ) {
      cachedDetectedRegion = {
        currencyCode: 'KES',
        regionName: 'Kenya & East Africa',
        flag: '🇰🇪',
        isAutoDetected: true,
      };
      return cachedDetectedRegion;
    }

    // 2. United Kingdom
    if (tz.includes('London') || lang === 'en-gb' || languages.some((l) => l === 'en-gb')) {
      cachedDetectedRegion = {
        currencyCode: 'GBP',
        regionName: 'United Kingdom',
        flag: '🇬🇧',
        isAutoDetected: true,
      };
      return cachedDetectedRegion;
    }

    // 3. Eurozone
    if (
      tz.includes('Paris') ||
      tz.includes('Berlin') ||
      tz.includes('Madrid') ||
      tz.includes('Rome') ||
      tz.includes('Amsterdam') ||
      tz.includes('Brussels') ||
      tz.includes('Vienna') ||
      tz.includes('Dublin') ||
      tz.includes('Helsinki') ||
      tz.includes('Athens') ||
      tz.includes('Lisbon') ||
      ['de', 'fr', 'es', 'it', 'nl', 'pt', 'fi', 'el'].some((c) => lang.startsWith(c))
    ) {
      cachedDetectedRegion = {
        currencyCode: 'EUR',
        regionName: 'European Union',
        flag: '🇪🇺',
        isAutoDetected: true,
      };
      return cachedDetectedRegion;
    }

    // 4. Canada
    if (tz.includes('Toronto') || tz.includes('Vancouver') || tz.includes('Montreal') || lang.includes('-ca')) {
      cachedDetectedRegion = {
        currencyCode: 'CAD',
        regionName: 'Canada',
        flag: '🇨🇦',
        isAutoDetected: true,
      };
      return cachedDetectedRegion;
    }

    // 5. Australia
    if (tz.includes('Sydney') || tz.includes('Melbourne') || tz.includes('Brisbane') || tz.includes('Perth') || lang.includes('-au')) {
      cachedDetectedRegion = {
        currencyCode: 'AUD',
        regionName: 'Australia',
        flag: '🇦🇺',
        isAutoDetected: true,
      };
      return cachedDetectedRegion;
    }

    // 6. Nigeria
    if (tz.includes('Lagos') || lang.includes('-ng')) {
      cachedDetectedRegion = {
        currencyCode: 'NGN',
        regionName: 'Nigeria',
        flag: '🇳🇬',
        isAutoDetected: true,
      };
      return cachedDetectedRegion;
    }

    // 7. South Africa
    if (tz.includes('Johannesburg') || lang.includes('-za')) {
      cachedDetectedRegion = {
        currencyCode: 'ZAR',
        regionName: 'South Africa',
        flag: '🇿🇦',
        isAutoDetected: true,
      };
      return cachedDetectedRegion;
    }

    // Default to USD for United States / Americas / General Global
    cachedDetectedRegion = {
      currencyCode: 'USD',
      regionName: 'United States & Global',
      flag: '🇺🇸',
      isAutoDetected: true,
    };
    return cachedDetectedRegion;
  } catch (err) {
    cachedDetectedRegion = {
      currencyCode: 'KES',
      regionName: 'East Africa / Studio Base',
      flag: '🇰🇪',
      isAutoDetected: false,
    };
    return cachedDetectedRegion;
  }
}

/**
 * Returns the current visitor's background currency code.
 */
export function getVisitorCurrency(): string {
  return detectVisitorRegion().currencyCode;
}

/**
 * Formats a given amount in KES (and optional USD price) automatically for the visitor's detected region.
 */
export function formatAutoCurrency(
  amountInKes: number,
  options?: { priceUSD?: number; includeCode?: boolean; targetCurrency?: string }
): string {
  const targetCode = options?.targetCurrency || getVisitorCurrency();
  const currency = SUPPORTED_CURRENCIES[targetCode] || SUPPORTED_CURRENCIES.KES;

  if (targetCode === 'KES') {
    const val = amountInKes.toLocaleString();
    return options?.includeCode ? `KES ${val}` : `KES ${val}`;
  }

  if (targetCode === 'USD' && options?.priceUSD && options.priceUSD > 0) {
    const val = options.priceUSD.toLocaleString();
    return options?.includeCode ? `$${val} USD` : `$${val}`;
  }

  let converted = 0;
  if (options?.priceUSD && options.priceUSD > 0) {
    const usdRate = SUPPORTED_CURRENCIES.USD.ratePerKes;
    const targetRate = currency.ratePerKes;
    converted = Math.round(options.priceUSD * (targetRate / usdRate));
  } else {
    converted = Math.round(amountInKes * currency.ratePerKes);
  }

  // Round neatly
  if (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(targetCode)) {
    converted = Math.round(converted / 10) * 10;
  }

  const formattedNum = converted.toLocaleString();
  return `${currency.symbol}${formattedNum}${options?.includeCode ? ` ${currency.code}` : ''}`;
}

export function formatRegionalPrice(
  amountInKes: number,
  targetCurrency: string,
  options?: { priceUSD?: number; includeCode?: boolean }
): string {
  return formatAutoCurrency(amountInKes, { ...options, targetCurrency });
}

/**
 * Dynamic budget options appropriate for the visitor's detected region.
 */
export function getBudgetRangesForRegion(currencyCode?: string): { value: string; label: string }[] {
  const code = currencyCode || getVisitorCurrency();

  switch (code) {
    case 'KES':
      return [
        { value: 'KES 250,000 - 500,000', label: 'KES 250,000 – 500,000 (Rapid Sprint)' },
        { value: 'KES 500,000 - 1,000,000', label: 'KES 500,000 – 1,000,000 (Production MVP)' },
        { value: 'KES 1,000,000 - 2,500,000', label: 'KES 1,000,000 – 2,500,000 (Full Platform & Portal)' },
        { value: 'KES 2,500,000+', label: 'KES 2,500,000+ (Enterprise Architecture)' },
      ];
    case 'GBP':
      return [
        { value: '£1,800 - £3,800', label: '£1,800 – £3,800 (Rapid Sprint)' },
        { value: '£3,800 - £7,500', label: '£3,800 – £7,500 (Production MVP)' },
        { value: '£7,500 - £18,000', label: '£7,500 – £18,000 (Full Platform & Portal)' },
        { value: '£18,000+', label: '£18,000+ (Enterprise Architecture)' },
      ];
    case 'EUR':
      return [
        { value: '€2,000 - £4,200', label: '€2,000 – €4,200 (Rapid Sprint)' },
        { value: '€4,200 - £8,500', label: '€4,200 – €8,500 (Production MVP)' },
        { value: '€8,500 - £20,000', label: '€8,500 – €20,000 (Full Platform & Portal)' },
        { value: '€20,000+', label: '€20,000+ (Enterprise Architecture)' },
      ];
    default:
      return [
        { value: '$2,000 - $4,500 USD', label: '$2,000 – $4,500 USD (Rapid Sprint)' },
        { value: '$4,500 - $9,000 USD', label: '$4,500 – $9,000 USD (Production MVP)' },
        { value: '$9,000 - $22,000 USD', label: '$9,000 – $22,000 USD (Full Platform & Portal)' },
        { value: '$22,000+ USD', label: '$22,000+ USD (Enterprise Architecture)' },
      ];
  }
}
