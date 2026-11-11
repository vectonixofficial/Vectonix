"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { COUNTRY_DIAL_CODES, CountryDialCode, getCountryByDialCode } from "@/lib/data/geoData";

interface CountryCodeDropdownProps {
    value: string; // Dial code e.g. "+91"
    onChange: (dialCode: string, country: CountryDialCode) => void;
    title?: string;
    id?: string;
}

export const CountryCodeDropdown: React.FC<CountryCodeDropdownProps> = ({
    value,
    onChange,
    title = "Select Country Code",
    id
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Selected country data (defaults to India)
    const selectedCountry = useMemo(() => {
        return getCountryByDialCode(value);
    }, [value]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Filtered countries strictly alphabetical
    const filteredCountries = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return COUNTRY_DIAL_CODES;
        return COUNTRY_DIAL_CODES.filter(
            (c) =>
                c.name.toLowerCase().includes(q) ||
                c.dialCode.includes(q) ||
                c.code.toLowerCase().includes(q)
        );
    }, [search]);

    const handleSelect = (c: CountryDialCode) => {
        onChange(c.dialCode, c);
        setIsOpen(false);
        setSearch("");
    };

    return (
        <div ref={dropdownRef} className="relative w-full" id={id}>
            {/* Trigger Button with Flag Image */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="w-full h-[42px] px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 flex items-center justify-between gap-2 shadow-xs cursor-pointer text-left transition-all"
                title={title}
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <img
                        src={`https://flagcdn.com/w40/${selectedCountry.code.toLowerCase()}.png`}
                        alt={selectedCountry.name}
                        width={20}
                        height={14}
                        className="w-5 h-3.5 object-cover rounded-xs border border-slate-200 shadow-2xs flex-shrink-0"
                    />
                    <span className="font-semibold text-slate-800 text-sm truncate">
                        {selectedCountry.dialCode}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-[50px]">
                        {selectedCountry.code}
                    </span>
                </div>
                <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-150 ${
                        isOpen ? "rotate-180 text-indigo-600" : ""
                    }`}
                />
            </button>

            {/* Dropdown Popover */}
            {isOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 max-h-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col z-50">
                    {/* Search Input Box */}
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search country or code..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    {/* Scrollable Alphabetical Country List with Flag Images */}
                    <div className="overflow-y-auto max-h-64 divide-y divide-slate-50 py-1">
                        {filteredCountries.length === 0 ? (
                            <div className="px-4 py-6 text-center text-xs text-slate-500">
                                No countries found matching &ldquo;{search}&rdquo;
                            </div>
                        ) : (
                            filteredCountries.map((c) => {
                                const isSelected = c.code === selectedCountry.code;
                                return (
                                    <button
                                        key={`${c.code}-${c.dialCode}`}
                                        type="button"
                                        onClick={() => handleSelect(c)}
                                        className={`w-full px-3 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 transition-colors text-xs ${
                                            isSelected ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-700"
                                        }`}
                                    >
                                        <img
                                            src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                                            alt={c.name}
                                            width={20}
                                            height={14}
                                            className="w-5 h-3.5 object-cover rounded-xs border border-slate-200 shadow-2xs flex-shrink-0"
                                            loading="lazy"
                                        />
                                        <span className="truncate flex-1 text-slate-800 font-medium">{c.name}</span>
                                        <span className="font-mono text-slate-500 text-[11px] font-semibold flex-shrink-0">
                                            {c.dialCode}
                                        </span>
                                        {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" />
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

