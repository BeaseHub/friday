// LanguageInitializer.tsx
import { useInitializeLanguage } from "@/hooks/useInitializeLanguage";

const LanguageInitializer = () => {
  useInitializeLanguage();
  return null; // No UI needed, just runs the hook
};

export default LanguageInitializer;
