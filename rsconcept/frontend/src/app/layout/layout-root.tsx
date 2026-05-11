'use client';

import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router';

import { type AppLocale, SUPPORTED_LOCALES, useTx } from '@/i18n';

import { useBrowserNavigation } from '@/hooks/use-browser-navigation';
import { usePreferencesStore } from '@/stores/preferences';

import { UnsavedChangesState } from '../changes/unsaved-state';
import { NavigationState } from '../navigation';

export function LayoutRoot() {
  const tx = useTx();
  const locale = usePreferencesStore(state => state.locale);
  const location = useLocation();

  useBrowserNavigation();
  useEffect(
    function syncSeoHead() {
      const pathname = removeLocalePrefix(window.location.pathname);
      const seo = resolveSeoKeys(pathname);
      const title = tx(seo.titleKey);
      const description = tx(seo.descriptionKey);
      const canonical = `${window.location.origin}${pathname}${window.location.search}`;

      document.title = title;
      upsertMeta('description', description);
      upsertLink('canonical', canonical);

      for (const alternateLocale of SUPPORTED_LOCALES) {
        const href = `${window.location.origin}${toLocalizedPath(alternateLocale, pathname)}${window.location.search}`;
        upsertHreflang(alternateLocale, href);
      }
      upsertHreflang('x-default', canonical);
    },
    [locale, location.pathname, location.search, tx]
  );

  return (
    <UnsavedChangesState>
      <NavigationState>
        <Outlet />
      </NavigationState>
    </UnsavedChangesState>
  );
}

// ======= Internals =========
function removeLocalePrefix(pathname: string): string {
  const parts = pathname.split('/');
  if (parts.length > 1 && SUPPORTED_LOCALES.includes(parts[1] as AppLocale)) {
    const normalized = `/${parts.slice(2).join('/')}`.replace(/\/+$/, '');
    return normalized || '/';
  }
  return pathname || '/';
}

function toLocalizedPath(locale: (typeof SUPPORTED_LOCALES)[number], pathname: string): string {
  if (pathname === '/') {
    return `/${locale}/`;
  }
  return `/${locale}${pathname}`;
}

function upsertMeta(name: string, content: string) {
  const selector = `meta[name="${name}"]`;
  const existing = document.head.querySelector(selector);
  if (existing) {
    existing.setAttribute('content', content);
    return;
  }
  const meta = document.createElement('meta');
  meta.setAttribute('name', name);
  meta.setAttribute('content', content);
  document.head.appendChild(meta);
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`;
  const existing = document.head.querySelector(selector);
  if (existing) {
    existing.setAttribute('href', href);
    return;
  }
  const link = document.createElement('link');
  link.setAttribute('rel', rel);
  link.setAttribute('href', href);
  document.head.appendChild(link);
}

function upsertHreflang(hreflang: string, href: string) {
  const selector = `link[rel="alternate"][hreflang="${hreflang}"]`;
  const existing = document.head.querySelector(selector);
  if (existing) {
    existing.setAttribute('href', href);
    return;
  }
  const link = document.createElement('link');
  link.setAttribute('rel', 'alternate');
  link.setAttribute('hreflang', hreflang);
  link.setAttribute('href', href);
  document.head.appendChild(link);
}

function resolveSeoKeys(pathname: string): { titleKey: string; descriptionKey: string } {
  if (pathname === '/library' || pathname.startsWith('/library/')) {
    return {
      titleKey: 'tx.shell.seo.library.title',
      descriptionKey: 'tx.shell.seo.library.description'
    };
  }
  if (pathname === '/manuals' || pathname.startsWith('/manuals/')) {
    return {
      titleKey: 'tx.shell.seo.manuals.title',
      descriptionKey: 'tx.shell.seo.manuals.description'
    };
  }
  if (pathname === '/sandbox' || pathname.startsWith('/sandbox/')) {
    return {
      titleKey: 'tx.shell.seo.sandbox.title',
      descriptionKey: 'tx.shell.seo.sandbox.description'
    };
  }
  return {
    titleKey: 'tx.shell.seo.title',
    descriptionKey: 'tx.shell.seo.description'
  };
}
