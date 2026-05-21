module.exports = {
  useTranslations: jest.fn(() => (key) => key),
  useLocale: jest.fn(() => 'en'),
  IntlProvider: ({ children }) => children,
};
