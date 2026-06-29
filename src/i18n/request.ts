import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: {
      common: (await import(`../messages/${locale}/common.json`)).default,
      auth: (await import(`../messages/${locale}/auth.json`)).default,
      patient: (await import(`../messages/${locale}/patient.json`)).default,
      doctor: (await import(`../messages/${locale}/doctor.json`)).default,
      admin: (await import(`../messages/${locale}/admin.json`)).default,
      appointments: (await import(`../messages/${locale}/appointments.json`)).default,
      notifications: (await import(`../messages/${locale}/notifications.json`)).default,
      medicalHistory: (await import(`../messages/${locale}/medicalHistory.json`)).default,
      validation: (await import(`../messages/${locale}/validation.json`)).default,
      landing: (await import(`../messages/${locale}/landing.json`)).default,
    }
  };
});
