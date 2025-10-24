# Internationalization (i18n) Guide

This application supports English (default) and French translations using `next-intl`.

## Quick Start

### 1. Using Translations in Components

For client components:

```tsx
'use client';

import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('dashboard'); // Load 'dashboard' namespace
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
    </div>
  );
}
```

For server components:

```tsx
import { getTranslations } from 'next-intl/server';

export default async function MyPage() {
  const t = await getTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('welcome')}</p>
    </div>
  );
}
```

### 2. Adding New Translations

Edit the translation files:
- `messages/en.json` - English translations
- `messages/fr.json` - French translations

Example structure:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "welcome": "Welcome to ZacFX Trader"
  },
  "settings": {
    "title": "Settings",
    "save": "Save Settings"
  }
}
```

### 3. Language Switching

The language switcher is already integrated into the Header component. Users can switch languages by:
- Desktop: Clicking the language dropdown in the header
- Mobile: Using the language switcher in the mobile menu

The selected language is saved to localStorage and persists across sessions.

## Available Namespaces

Current translation namespaces in the app:

- `nav` - Navigation items (Dashboard, Prompts, Settings, etc.)
- `auth` - Authentication pages (login, signup)
- `dashboard` - Dashboard page content
- `tradeIdeas` - Trade ideas widget and modal
- `prompts` - System prompts page
- `settings` - Settings page
- `common` - Common UI elements (buttons, errors, etc.)

## Translation File Structure

```
ai-fx-trader/
├── messages/
│   ├── en.json    # English translations
│   └── fr.json    # French translations
└── src/
    ├── i18n/
    │   ├── config.ts    # i18n configuration
    │   └── request.ts   # Server-side i18n setup
    └── components/
        ├── LanguageProvider.tsx  # Client-side provider
        └── LanguageSwitcher.tsx  # Language switcher UI
```

## Examples

### Using nested translations:

```tsx
const t = useTranslations('auth.login');
// Accesses: messages/en.json -> auth -> login

<h1>{t('title')}</h1>  // "Sign In"
<button>{t('submit')}</button>  // "Sign In"
```

### Using parameters in translations:

In `messages/en.json`:
```json
{
  "greeting": "Hello, {name}!"
}
```

In your component:
```tsx
const t = useTranslations();
<p>{t('greeting', { name: 'John' })}</p>  // "Hello, John!"
```

### Using pluralization:

In `messages/en.json`:
```json
{
  "items": "{count, plural, =0 {No items} =1 {One item} other {# items}}"
}
```

In your component:
```tsx
const t = useTranslations();
<p>{t('items', { count: 5 })}</p>  // "5 items"
```

## Best Practices

1. **Always use translation keys** - Never hardcode text in components
2. **Organize by feature** - Group translations by page/feature in namespaces
3. **Keep keys descriptive** - Use clear, descriptive keys like `auth.login.submit` rather than `btn1`
4. **Update both files** - When adding translations, update both `en.json` and `fr.json`
5. **Test both languages** - Always test your changes in both English and French

## Adding More Languages

To add additional languages:

1. Create a new translation file: `messages/[locale].json`
2. Update `src/i18n/config.ts`:
   ```ts
   export const locales = ['en', 'fr', 'es'] as const; // Add 'es'
   export const localeNames: Record<Locale, string> = {
     en: 'English',
     fr: 'Français',
     es: 'Español', // Add new language name
   };
   ```
3. The language switcher will automatically show the new option

## Troubleshooting

### Translation not updating
- Clear localStorage and refresh
- Check that the translation key exists in both language files
- Verify you're using the correct namespace

### "Missing message" error
- Ensure the key exists in the translation file
- Check the namespace is correct
- Verify the file structure matches the key path

### Language not persisting
- Check browser localStorage is enabled
- Verify the LanguageProvider is wrapping your app in layout.tsx


