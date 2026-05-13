"use client";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useTransition } from "react";

const languages = [
  { value: "en", label: "English" },
  { value: "nl", label: "Nederlands" },
];

export default function Language() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [, startTransition] = useTransition();

  const currentLocale = params?.locale ? (Array.isArray(params.locale) ? params.locale[0] : params.locale) : "en";

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
      const path = pathname.split("/");
      path[1] = newLocale;
      router.push(path.join("/"));
    });
  };

  const currentLanguageLabel = languages.find((l) => l.value === currentLocale)?.label || "Language";

  return (
    <Menu as="div" className="relative inline-block text-left">
      <MenuButton className="btn">
        {currentLanguageLabel} <span className="ml-2">▾</span>
      </MenuButton>
      <MenuItems className="absolute Padding right-0 focus:outline-none z-50">
        <div className="Wrapper Border flex-col">
          {languages.map((lang) => (
            <MenuItem key={lang.value}>
              {() => (
                <button
                  className={`flex Padding`}
                  onClick={() => {
                    handleLanguageChange(lang.value);
                  }}
                >
                  {lang.label}
                </button>
              )}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
}
