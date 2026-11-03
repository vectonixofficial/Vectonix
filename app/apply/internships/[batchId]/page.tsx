"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Briefcase,
    CheckCircle2,
    Check,
    AlertCircle,
    Building2,
    User,
    GraduationCap,
    Send,
    Loader2,
    ArrowRight,
    ArrowLeft,
    MapPin,
    Search,
    Globe,
    Sparkles,
    ShieldCheck,
    Package,
    Gift
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { internshipService, PACKAGES_CONFIG, INTERNSHIP_DOMAINS } from "@/lib/services/internshipService";
import { DatabaseInternshipBatch, DatabaseInternshipApplication, GenderType, InternshipPackageType } from "@/lib/supabase";
import { INDIAN_STATES, COUNTRIES } from "@/lib/data/geoData";
import { CollegeRecord } from "@/lib/data/collegesData";

export default function InternshipApplyPage() {
    const params = useParams();
    const router = useRouter();
    const batchId = (params?.batchId as string) || "wi26";

    const [batch, setBatch] = useState<DatabaseInternshipBatch | null>(null);
    const [loadingBatch, setLoadingBatch] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        // Personal
        fullName: "",
        email: "",
        phone: "",
        whatsappNumber: "",
        gender: "Male" as GenderType,
        dateOfBirth: "",

        // College & Academic
        collegeName: "",
        collegeId: "",
        collegeCity: "",
        collegeState: "",
        collegeSelectionType: "official_directory" as "official_directory" | "manual",
        isManualCollege: false,
        degree: "B.Tech",
        department: "",
        yearOfStudy: "3rd Year",
        graduationYear: "2027",

        // Residential Address
        houseNumber: "",
        streetName: "",
        locality: "",
        city: "",
        district: "",
        state: "Tamil Nadu",
        postalCode: "",
        country: "India",

        // Track & Profile
        domain: "Full Stack Development",
        technicalSkills: "",
        programmingLanguages: "",
        linkedinUrl: "",
        githubUrl: "",
        portfolioUrl: "",

        // Package Selection
        packageName: "Premium" as InternshipPackageType, // Default to most popular

        // Consents
        termsAccepted: false,
        privacyConsent: false,
        marketingConsent: false
    });

    // College Search Autocomplete State
    const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
    const [collegeSuggestions, setCollegeSuggestions] = useState<CollegeRecord[]>([]);
    const [isSearchingColleges, setIsSearchingColleges] = useState(false);
    const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Live Email Validation State (No OTP)
    const [emailValidation, setEmailValidation] = useState<{
        checking: boolean;
        status: "idle" | "checking" | "valid" | "invalid_format" | "invalid_domain" | "disposable" | "unable_to_check";
        message: string;
    }>({
        checking: false,
        status: "idle",
        message: ""
    });
    const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced Live Email Verification Handler
    const handleEmailChange = (val: string) => {
        setFormData((prev) => ({ ...prev, email: val }));

        if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);

        const clean = val.trim();
        if (!clean) {
            setEmailValidation({ checking: false, status: "idle", message: "" });
            return;
        }

        setEmailValidation({ checking: true, status: "checking", message: "Checking email availability..." });

        emailTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/validate-email?email=${encodeURIComponent(clean)}`);
                const data = await res.json();
                setEmailValidation({
                    checking: false,
                    status: data.status || (data.valid ? "valid" : "invalid_format"),
                    message: data.message
                });
            } catch (err) {
                setEmailValidation({
                    checking: false,
                    status: "unable_to_check",
                    message: "Unable to check email availability. Please try again."
                });
            }
        }, 400);
    };

    // Submission State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submittedApplication, setSubmittedApplication] = useState<DatabaseInternshipApplication | null>(null);

    // Load Batch
    useEffect(() => {
        const loadBatch = async () => {
            setLoadingBatch(true);
            try {
                const data = await internshipService.getBatch(batchId);
                setBatch(data);
                if (data && data.domains.length > 0) {
                    setFormData((prev) => ({ ...prev, domain: data.domains[0] }));
                }
            } catch (err) {
                console.error("Error loading batch:", err);
            } finally {
                setLoadingBatch(false);
            }
        };
        loadBatch();
    }, [batchId]);

    // Debounced College Autocomplete Search
    const handleCollegeSearchChange = (value: string) => {
        setCollegeSearchQuery(value);
        setFormData((prev) => ({
            ...prev,
            collegeName: value,
            collegeId: "",
            collegeSelectionType: "manual"
        }));

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (!value.trim()) {
            setCollegeSuggestions([]);
            setShowCollegeDropdown(false);
            return;
        }

        setIsSearchingColleges(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/colleges/search?q=${encodeURIComponent(value.trim())}`);
                const data = await res.json();
                if (data.colleges) {
                    setCollegeSuggestions(data.colleges);
                    setShowCollegeDropdown(true);
                }
            } catch (e) {
                console.error("Failed to fetch college suggestions:", e);
            } finally {
                setIsSearchingColleges(false);
            }
        }, 250);
    };

    const handleSelectCollege = (col: CollegeRecord) => {
        setFormData((prev) => ({
            ...prev,
            collegeName: col.name,
            collegeId: col.id,
            collegeCity: col.city,
            collegeState: col.state,
            collegeSelectionType: "official_directory",
            isManualCollege: false
        }));
        setCollegeSearchQuery(col.name);
        setShowCollegeDropdown(false);
    };

    // Validation
    const validateStep1 = () => {
        if (!formData.fullName.trim()) return "Full name is required";
        if (!formData.email.trim() || !formData.email.includes("@")) return "A valid email is required";
        if (!formData.phone.trim() || formData.phone.length < 10) return "A valid 10-digit mobile number is required";
        if (!formData.gender) return "Please select your gender";

        // College
        if (!formData.collegeName.trim()) return "Please select or enter your college/university name";
        if (!formData.department.trim()) return "Department/Branch is required";

        // Address
        if (!formData.houseNumber.trim()) return "Door / House Number is required";
        if (!formData.streetName.trim()) return "Street name is required";
        if (!formData.locality.trim()) return "Area / Locality is required";
        if (!formData.city.trim()) return "Village / Town / City is required";
        if (!formData.district.trim()) return "District is required";
        if (!formData.state) return "State is required";

        // PIN Code (Indian 6-digit format)
        const pinClean = formData.postalCode.trim();
        if (!pinClean || !/^[1-9][0-9]{5}$/.test(pinClean)) {
            return "Please enter a valid 6-digit Indian PIN Code";
        }

        return null;
    };

    const validateStep2 = () => {
        if (!formData.domain) return "Please select an internship domain";
        return null;
    };

    const validateStep3 = () => {
        if (!formData.packageName) return "Please choose an internship package";
        if (!formData.termsAccepted) return "Please accept the Terms & Conditions and Privacy Policy";
        return null;
    };

    const handleNext = () => {
        setSubmitError(null);
        if (currentStep === 1) {
            const err = validateStep1();
            if (err) {
                setSubmitError(err);
                return;
            }
            setCurrentStep(2);
        } else if (currentStep === 2) {
            const err = validateStep2();
            if (err) {
                setSubmitError(err);
                return;
            }
            setCurrentStep(3);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        const err = validateStep3();
        if (err) {
            setSubmitError(err);
            return;
        }

        setIsSubmitting(true);
        try {
            const selectedPkg = PACKAGES_CONFIG[formData.packageName];
            const verifiedPrice = selectedPkg?.price || 749;

            const result = await internshipService.submitApplication({
                batchId: batch?.id || batchId,
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                mobileNumber: formData.phone,
                whatsappNumber: formData.whatsappNumber || formData.phone,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,

                // College
                collegeName: formData.collegeName,
                collegeId: formData.collegeId,
                collegeCity: formData.collegeCity,
                collegeState: formData.collegeState,
                collegeSelectionType: formData.collegeSelectionType,

                // Academic
                degree: formData.degree,
                department: formData.department,
                yearOfStudy: formData.yearOfStudy,
                graduationYear: formData.graduationYear,

                // Track & Profile
                domain: formData.domain,
                technicalSkills: formData.technicalSkills,
                programmingLanguages: formData.programmingLanguages,
                linkedinUrl: formData.linkedinUrl,
                githubUrl: formData.githubUrl,
                portfolioUrl: formData.portfolioUrl,

                // Address
                houseNumber: formData.houseNumber,
                streetName: formData.streetName,
                locality: formData.locality,
                city: formData.city,
                district: formData.district,
                state: formData.state,
                postalCode: formData.postalCode,
                country: formData.country,

                // Package
                packageName: formData.packageName,
                packageAmount: verifiedPrice,

                // Consents
                termsAccepted: formData.termsAccepted,
                privacyConsent: true,
                marketingConsent: formData.marketingConsent
            });

            setSubmittedApplication(result);
            setCurrentStep(4);
        } catch (error: any) {
            console.error("Submission error:", error);
            setSubmitError(error.message || "Failed to submit application. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loadingBatch) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-slate-600 font-medium">Loading internship details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-28 pb-20 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header Banner */}
                <div className="text-center mb-10">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-3 uppercase tracking-wider">
                        <Briefcase className="h-3.5 w-3.5" />
                        {batch?.title || "Winter Internship 2026"} (Batch {batchId.toUpperCase()})
                    </span>
                    <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
                        Internship <span className="text-indigo-600">Application Portal</span>
                    </h1>
                    <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
                        Join Vectonix for hands-on, live-project experience mentored by industry engineers. Complete your registration below.
                    </p>
                </div>

                {/* Stepper Progress Bar */}
                {currentStep < 4 && (
                    <div className="mb-8 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            {[
                                { step: 1, label: "Personal, Academic & Address" },
                                { step: 2, label: "Track & Professional Profile" },
                                { step: 3, label: "Package Selection & Confirmation" },
                            ].map((item, idx) => (
                                <div key={item.step} className="flex items-center flex-1 last:flex-none">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                                currentStep === item.step
                                                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100"
                                                    : currentStep > item.step
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-slate-100 text-slate-500"
                                            }`}
                                        >
                                            {currentStep > item.step ? <Check className="h-4 w-4" /> : item.step}
                                        </div>
                                        <span
                                            className={`text-xs sm:text-sm font-medium hidden sm:inline ${
                                                currentStep === item.step ? "text-slate-900 font-semibold" : "text-slate-500"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                    </div>
                                    {idx < 2 && (
                                        <div
                                            className={`flex-1 mx-3 h-1 rounded-full transition-all ${
                                                currentStep > item.step ? "bg-emerald-500" : "bg-slate-200"
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {submitError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm"
                    >
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{submitError}</span>
                    </motion.div>
                )}

                {/* Form Container */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-10">
                    {/* STEP 1: Personal, Academic & Address Details */}
                    {currentStep === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* SECTION A: Personal Details */}
                            <div className="border-b border-slate-100 pb-3">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <User className="h-5 w-5 text-indigo-600" />
                                    Personal Information
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Rahul Sharma"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Email Address *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            required
                                            placeholder="rahul@example.com"
                                            value={formData.email}
                                            onChange={(e) => handleEmailChange(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {emailValidation.checking && (
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600 absolute right-3 top-3" />
                                        )}
                                    </div>
                                    {/* Live Email Availability State Indicators */}
                                    {emailValidation.status !== "idle" && (
                                        <div className="mt-1.5 flex items-center gap-1.5 text-xs">
                                            {emailValidation.status === "checking" && (
                                                <span className="text-slate-500 flex items-center gap-1">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> Checking email availability...
                                                </span>
                                            )}
                                            {emailValidation.status === "valid" && (
                                                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium text-[11px]">
                                                    <Check className="h-3 w-3 text-emerald-600" />
                                                    Valid email format. Email domain is configured to receive email.
                                                </span>
                                            )}
                                            {(emailValidation.status === "invalid_format" || emailValidation.status === "invalid_domain" || emailValidation.status === "disposable") && (
                                                <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium text-[11px]">
                                                    <AlertCircle className="h-3 w-3 text-red-600" />
                                                    {emailValidation.message || "Email domain does not appear to accept email."}
                                                </span>
                                            )}
                                            {emailValidation.status === "unable_to_check" && (
                                                <span className="text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1 font-medium text-[11px]">
                                                    <AlertCircle className="h-3 w-3 text-amber-600" />
                                                    Unable to check email availability. Please try again.
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Mobile / Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="10-digit mobile number"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        WhatsApp Number
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="If different from mobile number"
                                        value={formData.whatsappNumber}
                                        onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Gender *
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderType })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Date of Birth (Optional)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    />
                                </div>
                            </div>

                            {/* SECTION B: College & Academic Info with Autocomplete */}
                            <div className="border-b border-slate-100 pt-4 pb-3">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-indigo-600" />
                                    College & Academic Information
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Search our comprehensive directory of colleges and universities across India.
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Searchable College Autocomplete */}
                                <div className="relative">
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        College / University Name *
                                    </label>
                                    <div className="relative">
                                        <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Type to search (e.g. V.S.B., Anna University, IIT, NIT, RVCE...)"
                                            value={formData.collegeName}
                                            onChange={(e) => handleCollegeSearchChange(e.target.value)}
                                            onFocus={() => {
                                                if (collegeSuggestions.length > 0) setShowCollegeDropdown(true);
                                            }}
                                            className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                        {isSearchingColleges && (
                                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600 absolute right-3 top-3" />
                                        )}
                                    </div>

                                    {/* Autocomplete Dropdown */}
                                    {showCollegeDropdown && collegeSuggestions.length > 0 && (
                                        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                                            {collegeSuggestions.map((col) => (
                                                <button
                                                    key={col.id}
                                                    type="button"
                                                    onClick={() => handleSelectCollege(col)}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors flex items-center justify-between text-xs"
                                                >
                                                    <div>
                                                        <span className="font-semibold text-slate-900 block text-sm">
                                                            {col.name}
                                                        </span>
                                                        <span className="text-slate-500 text-[11px]">
                                                            {col.city}, {col.state} {col.category ? `• ${col.category}` : ""}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                                                        Select
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Manual entry toggle */}
                                    <div className="mt-2 flex items-center justify-between text-xs">
                                        <span className="text-slate-500">
                                            {formData.isManualCollege
                                                ? "Entered manually. Switch back to search official directory?"
                                                : "Can't find your college in the list?"}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    isManualCollege: !prev.isManualCollege,
                                                    collegeSelectionType: !prev.isManualCollege ? "manual" : "official_directory"
                                                }));
                                                setShowCollegeDropdown(false);
                                            }}
                                            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                                        >
                                            {formData.isManualCollege ? "Use Search Directory" : "Add College Manually"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Degree / Program *
                                        </label>
                                        <select
                                            value={formData.degree}
                                            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="B.Tech">B.Tech / B.E.</option>
                                            <option value="BCA">BCA</option>
                                            <option value="MCA">MCA</option>
                                            <option value="M.Tech">M.Tech</option>
                                            <option value="B.Sc">B.Sc CS / IT</option>
                                            <option value="Diploma">Polytechnic Diploma</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Department / Branch *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. CSE, ECE, IT, AI&DS"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Year of Study *
                                        </label>
                                        <select
                                            value={formData.yearOfStudy}
                                            onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="1st Year">1st Year</option>
                                            <option value="2nd Year">2nd Year</option>
                                            <option value="3rd Year">3rd Year</option>
                                            <option value="4th Year">4th Year (Final Year)</option>
                                            <option value="Graduated">Recent Graduate</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SECTION C: Complete Residential Address */}
                            <div className="border-b border-slate-100 pt-4 pb-3">
                                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-indigo-600" />
                                    Residential Address
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Required for dispatch of welcome kits (Premium package) and official verification.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Door No. / House Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 12/B, Flat 301"
                                        value={formData.houseNumber}
                                        onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Street Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Gandhi Nagar 2nd Street"
                                        value={formData.streetName}
                                        onChange={(e) => setFormData({ ...formData, streetName: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Area / Locality *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Anna Nagar, Kothrud"
                                        value={formData.locality}
                                        onChange={(e) => setFormData({ ...formData, locality: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Village / Town / City *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Chennai, Karur, Bangalore"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        District *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Coimbatore, Karur, Pune"
                                        value={formData.district}
                                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        State *
                                    </label>
                                    <select
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        {INDIAN_STATES.map((st) => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        PIN Code (6 digits) *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        placeholder="e.g. 600001"
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.replace(/[^0-9]/g, "") })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                        Country *
                                    </label>
                                    <select
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                    >
                                        {COUNTRIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button onClick={handleNext} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                    Next: Track & Profile
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2: Internship Track & Professional Profile (Resume upload REMOVED) */}
                    {currentStep === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-indigo-600" />
                                    Internship Track & Professional Profile
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Select your preferred technical domain for the {batch?.title || "Winter Internship 2026"}.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                                    Select Internship Domain *
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {INTERNSHIP_DOMAINS.map((d) => (
                                        <label
                                            key={d}
                                            className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                                                formData.domain === d
                                                    ? "border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20 font-semibold"
                                                    : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="domain"
                                                value={d}
                                                checked={formData.domain === d}
                                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                                                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            />
                                            {d}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-slate-100 pt-4">
                                <h3 className="text-sm font-bold text-slate-900 mb-1">
                                    Professional Profiles & Links (Optional)
                                </h3>
                                <p className="text-xs text-slate-500 mb-3">
                                    Provide links to your online work or coding profiles to assist our review team.
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            LinkedIn Profile URL
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://linkedin.com/in/username"
                                            value={formData.linkedinUrl}
                                            onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            GitHub Profile URL
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://github.com/username"
                                            value={formData.githubUrl}
                                            onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Portfolio / Personal Website URL
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://yourportfolio.com"
                                            value={formData.portfolioUrl}
                                            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                            Key Technical Skills / Languages (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Python, React, JavaScript, SQL, C++, Figma"
                                            value={formData.technicalSkills}
                                            onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                                <Button onClick={handleNext} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                                    Next: Package Selection
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: Package Selection & Confirmation (NO PAYMENT GATEWAY) */}
                    {currentStep === 3 && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="border-b border-slate-100 pb-4">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-indigo-600" />
                                    Internship Package Selection
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Choose your preferred registration package. There is no online payment required at this step.
                                </p>
                            </div>

                            {/* Selectable Pricing Cards - 3 Tiered Options */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {/* PACKAGE 1: 100% FREE */}
                                <div
                                    onClick={() => setFormData({ ...formData, packageName: "Free" })}
                                    className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                        formData.packageName === "Free"
                                            ? "border-emerald-600 bg-emerald-50/20 shadow-lg ring-2 ring-emerald-500/20"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                                                100% Free Internship
                                            </span>
                                            <input
                                                type="radio"
                                                name="package"
                                                checked={formData.packageName === "Free"}
                                                onChange={() => setFormData({ ...formData, packageName: "Free" })}
                                                className="text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                            />
                                        </div>
                                        <div className="mt-3 flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-slate-900">₹0</span>
                                            <span className="text-xs text-slate-500 font-medium">/ 100% Free</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Learn, build and gain practical project experience with full mentor support.
                                        </p>

                                        <div className="mt-3 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800">
                                            No Certificate Included
                                        </div>

                                        <ul className="mt-4 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                                            {PACKAGES_CONFIG.Free.features.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <CheckCircle2 className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${item.includes("No") ? "text-slate-400" : "text-emerald-500"}`} />
                                                    <span className={item.includes("No") ? "text-slate-500 italic" : ""}>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-slate-100">
                                        <span
                                            className={`block text-center py-2 rounded-xl text-xs font-semibold ${
                                                formData.packageName === "Free"
                                                    ? "bg-emerald-600 text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {formData.packageName === "Free" ? "Selected Free" : "Select Free (₹0)"}
                                        </span>
                                    </div>
                                </div>

                                {/* PACKAGE 2: STANDARD */}
                                <div
                                    onClick={() => setFormData({ ...formData, packageName: "Standard" })}
                                    className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                        formData.packageName === "Standard"
                                            ? "border-indigo-600 bg-indigo-50/20 shadow-lg ring-2 ring-indigo-500/20"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                                Standard Certificate
                                            </span>
                                            <input
                                                type="radio"
                                                name="package"
                                                checked={formData.packageName === "Standard"}
                                                onChange={() => setFormData({ ...formData, packageName: "Standard" })}
                                                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            />
                                        </div>
                                        <div className="mt-3 flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-slate-900">₹749</span>
                                            <span className="text-xs text-slate-500 font-medium">/ complete cohort</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Comprehensive program access, hands-on tasks, and verified industry certificate.
                                        </p>

                                        <ul className="mt-4 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                                            {PACKAGES_CONFIG.Standard.features.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-slate-100">
                                        <span
                                            className={`block text-center py-2 rounded-xl text-xs font-semibold ${
                                                formData.packageName === "Standard"
                                                    ? "bg-indigo-600 text-white"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {formData.packageName === "Standard" ? "Selected Package" : "Select Standard (₹749)"}
                                        </span>
                                    </div>
                                </div>

                                {/* PACKAGE 3: PREMIUM (MOST POPULAR) */}
                                <div
                                    onClick={() => setFormData({ ...formData, packageName: "Premium" })}
                                    className={`relative rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                        formData.packageName === "Premium"
                                            ? "border-indigo-600 bg-indigo-50/30 shadow-xl ring-2 ring-indigo-500/20"
                                            : "border-slate-200 bg-white hover:border-slate-300"
                                    }`}
                                >
                                    {/* Most Popular Badge */}
                                    <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md flex items-center gap-1">
                                        <Sparkles className="h-3 w-3" />
                                        Most Popular
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                                                Premium + Kit
                                            </span>
                                            <input
                                                type="radio"
                                                name="package"
                                                checked={formData.packageName === "Premium"}
                                                onChange={() => setFormData({ ...formData, packageName: "Premium" })}
                                                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                                            />
                                        </div>
                                        <div className="mt-3 flex items-baseline gap-1">
                                            <span className="text-3xl font-extrabold text-slate-900">₹999</span>
                                            <span className="text-xs text-slate-500 font-medium">/ complete cohort</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Full curriculum + digital certificate + physical framed certificate & welcome kit delivered.
                                        </p>

                                        <ul className="mt-4 space-y-2 text-xs text-slate-700 border-t border-slate-100 pt-3">
                                            {PACKAGES_CONFIG.Premium.features.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span className={idx === 0 ? "font-semibold text-slate-900" : ""}>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-slate-100">
                                        <span
                                            className={`block text-center py-2 rounded-xl text-xs font-semibold ${
                                                formData.packageName === "Premium"
                                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                                                    : "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {formData.packageName === "Premium" ? "Selected Package" : "Select Premium (₹999)"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Banner */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                                <div>
                                    <span className="text-slate-500 block">Selected Option:</span>
                                    <span className="font-bold text-slate-900 text-sm">
                                        {formData.packageName} Package — ₹{PACKAGES_CONFIG[formData.packageName].price}
                                    </span>
                                </div>
                                <div className="text-slate-500">
                                    Domain Track: <strong className="text-slate-800">{formData.domain}</strong>
                                </div>
                            </div>

                            {/* Legal & Consent Checkboxes */}
                            <div className="space-y-3 pt-2">
                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={formData.termsAccepted}
                                        onChange={(e) => setFormData({ ...formData, termsAccepted: e.target.checked })}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                                        I agree to Vectonix&apos;s{" "}
                                        <Link href="/terms-and-conditions" target="_blank" className="text-indigo-600 underline font-medium">
                                            Terms & Conditions
                                        </Link>{" "}
                                        and acknowledge the{" "}
                                        <Link href="/privacy-policy" target="_blank" className="text-indigo-600 underline font-medium">
                                            Privacy Policy
                                        </Link>
                                        . I declare that the submitted information is accurate and authentic. *
                                    </label>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <input
                                        type="checkbox"
                                        id="marketing"
                                        checked={formData.marketingConsent}
                                        onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="marketing" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                                        Keep me informed about future tech workshops, hackathons, job placements, and learning resources from Vectonix Technologies (Optional).
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-between">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCurrentStep(2)}
                                    disabled={isSubmitting}
                                    className="gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 shadow-lg shadow-indigo-600/25"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Submitting Application...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Submit Internship Application
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    {/* STEP 4: Success & Confirmation */}
                    {currentStep === 4 && submittedApplication && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-6 space-y-6"
                        >
                            <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>

                            <div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                                    Application Submitted Successfully!
                                </h2>
                                <p className="text-slate-600 mt-2 text-sm sm:text-base">
                                    Welcome to Vectonix, <strong>{submittedApplication.full_name}</strong>. Your registration for the Winter Internship 2026 has been recorded.
                                </p>
                            </div>

                            {/* Application ID Card */}
                            <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border border-indigo-100 rounded-2xl p-6 max-w-lg mx-auto shadow-sm">
                                <span className="text-xs uppercase font-bold tracking-wider text-indigo-700">
                                    Official Application ID
                                </span>
                                <div className="text-3xl font-mono font-extrabold text-slate-900 mt-2 tracking-wider">
                                    {submittedApplication.application_id || submittedApplication.application_number}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    An acknowledgement has been queued for your email ({submittedApplication.email}).
                                </p>
                            </div>

                            {/* Summary Table */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left max-w-lg mx-auto text-xs space-y-2">
                                <div className="flex justify-between py-1 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">Selected Domain</span>
                                    <span className="font-semibold text-slate-800">{submittedApplication.domain}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">Chosen Package</span>
                                    <span className="font-semibold text-indigo-700">
                                        {submittedApplication.package_name} (₹{submittedApplication.package_amount})
                                    </span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">College / Institution</span>
                                    <span className="font-semibold text-slate-800 truncate max-w-xs">{submittedApplication.college_name}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-200">
                                    <span className="text-slate-500 font-medium">City & State</span>
                                    <span className="font-semibold text-slate-800">{submittedApplication.city}, {submittedApplication.state}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-slate-500 font-medium">Application Status</span>
                                    <span className="font-semibold text-blue-600 uppercase">Received / Under Review</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                                <Button
                                    onClick={() => router.push(`/internship/dashboard?appId=${submittedApplication.application_id || submittedApplication.application_number}&email=${encodeURIComponent(submittedApplication.email)}`)}
                                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-lg shadow-indigo-600/25"
                                >
                                    <span>Access Student Dashboard</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.print()}
                                    className="w-full sm:w-auto"
                                >
                                    Print / Save Confirmation
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => router.push("/")}
                                    className="w-full sm:w-auto text-slate-600"
                                >
                                    Return to Home
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
