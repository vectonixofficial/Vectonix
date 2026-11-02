export interface CollegeRecord {
    id: string;
    name: string;
    city: string;
    state: string;
    category?: string;
}

export const INDIAN_COLLEGES: CollegeRecord[] = [
    // Tamil Nadu
    { id: "tn-001", name: "Anna University, Chennai", city: "Chennai", state: "Tamil Nadu", category: "University" },
    { id: "tn-002", name: "College of Engineering, Guindy (CEG)", city: "Chennai", state: "Tamil Nadu", category: "Engineering" },
    { id: "tn-003", name: "Madras Institute of Technology (MIT)", city: "Chennai", state: "Tamil Nadu", category: "Engineering" },
    { id: "tn-004", name: "Indian Institute of Technology Madras (IIT Madras)", city: "Chennai", state: "Tamil Nadu", category: "Institute of National Importance" },
    { id: "tn-005", name: "National Institute of Technology, Tiruchirappalli (NIT Trichy)", city: "Tiruchirappalli", state: "Tamil Nadu", category: "NIT" },
    { id: "tn-006", name: "PSG College of Technology", city: "Coimbatore", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-007", name: "Coimbatore Institute of Technology (CIT)", city: "Coimbatore", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-008", name: "V.S.B. Engineering College", city: "Karur", state: "Tamil Nadu", category: "Engineering" },
    { id: "tn-009", name: "V.S.B. College of Engineering Technical Campus", city: "Coimbatore", state: "Tamil Nadu", category: "Engineering" },
    { id: "tn-010", name: "Vellore Institute of Technology (VIT)", city: "Vellore", state: "Tamil Nadu", category: "Deemed University" },
    { id: "tn-011", name: "SRM Institute of Science and Technology", city: "Kattankulathur", state: "Tamil Nadu", category: "Deemed University" },
    { id: "tn-012", name: "SSN College of Engineering", city: "Kalavakkam", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-013", name: "Thiagarajar College of Engineering", city: "Madurai", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-014", name: "Government College of Technology (GCT)", city: "Coimbatore", state: "Tamil Nadu", category: "Government Engineering" },
    { id: "tn-015", name: "Kongu Engineering College", city: "Perundurai", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-016", name: "Bannari Amman Institute of Technology", city: "Sathyamangalam", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-017", name: "Kumaraguru College of Technology", city: "Coimbatore", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-018", name: "Sri Krishna College of Engineering and Technology (SKCET)", city: "Coimbatore", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-019", name: "SASTRA Deemed University", city: "Thanjavur", state: "Tamil Nadu", category: "Deemed University" },
    { id: "tn-020", name: "Loyola College", city: "Chennai", state: "Tamil Nadu", category: "Arts & Science" },
    { id: "tn-021", name: "Madras Christian College (MCC)", city: "Chennai", state: "Tamil Nadu", category: "Arts & Science" },
    { id: "tn-022", name: "St. Joseph's College of Engineering", city: "Chennai", state: "Tamil Nadu", category: "Engineering" },
    { id: "tn-023", name: "Sona College of Technology", city: "Salem", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-024", name: "Mepco Schlenk Engineering College", city: "Sivakasi", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-025", name: "K.S. Rangasamy College of Technology", city: "Tiruchengode", state: "Tamil Nadu", category: "Autonomous Engineering" },
    { id: "tn-026", name: "Alagappa Chettiar Government College of Engineering and Technology", city: "Karaikudi", state: "Tamil Nadu", category: "Government Engineering" },
    { id: "tn-027", name: "Central Polytechnic College", city: "Chennai", state: "Tamil Nadu", category: "Polytechnic" },
    { id: "tn-028", name: "Ramakrishna Mission Vivekananda College", city: "Chennai", state: "Tamil Nadu", category: "Arts & Science" },

    // Karnataka
    { id: "ka-001", name: "Indian Institute of Science (IISc Bangalore)", city: "Bengaluru", state: "Karnataka", category: "Institute of National Importance" },
    { id: "ka-002", name: "National Institute of Technology Karnataka (NIT Surathkal)", city: "Surathkal", state: "Karnataka", category: "NIT" },
    { id: "ka-003", name: "RV College of Engineering (RVCE)", city: "Bengaluru", state: "Karnataka", category: "Autonomous Engineering" },
    { id: "ka-004", name: "BMS College of Engineering (BMSCE)", city: "Bengaluru", state: "Karnataka", category: "Autonomous Engineering" },
    { id: "ka-005", name: "Ramaiah Institute of Technology (MSRIT)", city: "Bengaluru", state: "Karnataka", category: "Autonomous Engineering" },
    { id: "ka-006", name: "PES University", city: "Bengaluru", state: "Karnataka", category: "State University" },
    { id: "ka-007", name: "Visvesvaraya Technological University (VTU)", city: "Belagavi", state: "Karnataka", category: "University" },
    { id: "ka-008", name: "International Institute of Information Technology (IIIT Bangalore)", city: "Bengaluru", state: "Karnataka", category: "IIIT" },
    { id: "ka-009", name: "Manipal Institute of Technology (MIT Manipal)", city: "Manipal", state: "Karnataka", category: "Deemed University" },
    { id: "ka-010", name: "Dayananda Sagar College of Engineering", city: "Bengaluru", state: "Karnataka", category: "Autonomous Engineering" },
    { id: "ka-011", name: "Siddaganga Institute of Technology (SIT)", city: "Tumakuru", state: "Karnataka", category: "Autonomous Engineering" },
    { id: "ka-012", name: "National Institute of Engineering (NIE)", city: "Mysuru", state: "Karnataka", category: "Autonomous Engineering" },
    { id: "ka-013", name: "Christ University", city: "Bengaluru", state: "Karnataka", category: "Deemed University" },
    { id: "ka-014", name: "St. Joseph's University", city: "Bengaluru", state: "Karnataka", category: "University" },

    // Kerala
    { id: "kl-001", name: "National Institute of Technology Calicut (NIT Calicut)", city: "Kozhikode", state: "Kerala", category: "NIT" },
    { id: "kl-002", name: "College of Engineering Trivandrum (CET)", city: "Thiruvananthapuram", state: "Kerala", category: "Government Engineering" },
    { id: "kl-003", name: "Government Engineering College Barton Hill", city: "Thiruvananthapuram", state: "Kerala", category: "Government Engineering" },
    { id: "kl-004", name: "Government Engineering College Thrissur", city: "Thrissur", state: "Kerala", category: "Government Engineering" },
    { id: "kl-005", name: "Cochin University of Science and Technology (CUSAT)", city: "Kochi", state: "Kerala", category: "University" },
    { id: "kl-006", name: "APJ Abdul Kalam Technological University (KTU)", city: "Thiruvananthapuram", state: "Kerala", category: "University" },
    { id: "kl-007", name: "Model Engineering College (MEC)", city: "Kochi", state: "Kerala", category: "Engineering" },
    { id: "kl-008", name: "TKM College of Engineering", city: "Kollam", state: "Kerala", category: "Autonomous Engineering" },
    { id: "kl-009", name: "Indian Institute of Space Science and Technology (IIST)", city: "Thiruvananthapuram", state: "Kerala", category: "Institute of National Importance" },

    // Andhra Pradesh
    { id: "ap-001", name: "Indian Institute of Technology Tirupati (IIT Tirupati)", city: "Tirupati", state: "Andhra Pradesh", category: "IIT" },
    { id: "ap-002", name: "National Institute of Technology Andhra Pradesh (NIT AP)", city: "Tadepalligudem", state: "Andhra Pradesh", category: "NIT" },
    { id: "ap-003", name: "Andhra University College of Engineering", city: "Visakhapatnam", state: "Andhra Pradesh", category: "University College" },
    { id: "ap-004", name: "JNTU College of Engineering Kakinada", city: "Kakinada", state: "Andhra Pradesh", category: "University College" },
    { id: "ap-005", name: "JNTU College of Engineering Anantapur", city: "Ananthapuramu", state: "Andhra Pradesh", category: "University College" },
    { id: "ap-006", name: "KL Deemed to be University", city: "Vaddeswaram", state: "Andhra Pradesh", category: "Deemed University" },
    { id: "ap-007", name: "Gayatri Vidya Parishad College of Engineering", city: "Visakhapatnam", state: "Andhra Pradesh", category: "Autonomous Engineering" },
    { id: "ap-008", name: "Vignan's Foundation for Science, Technology and Research", city: "Guntur", state: "Andhra Pradesh", category: "Deemed University" },

    // Telangana
    { id: "tg-001", name: "Indian Institute of Technology Hyderabad (IIT Hyderabad)", city: "Kandi, Sangareddy", state: "Telangana", category: "IIT" },
    { id: "tg-002", name: "National Institute of Technology Warangal (NIT Warangal)", city: "Warangal", state: "Telangana", category: "NIT" },
    { id: "tg-003", name: "International Institute of Information Technology (IIIT Hyderabad)", city: "Hyderabad", state: "Telangana", category: "IIIT" },
    { id: "tg-004", name: "Jawaharlal Nehru Technological University (JNTUH)", city: "Hyderabad", state: "Telangana", category: "University" },
    { id: "tg-005", name: "Osmania University College of Engineering", city: "Hyderabad", state: "Telangana", category: "University College" },
    { id: "tg-006", name: "BITS Pilani, Hyderabad Campus", city: "Hyderabad", state: "Telangana", category: "Deemed University" },
    { id: "tg-007", name: "Chaitanya Bharathi Institute of Technology (CBIT)", city: "Hyderabad", state: "Telangana", category: "Autonomous Engineering" },
    { id: "tg-008", name: "Vasavi College of Engineering", city: "Hyderabad", state: "Telangana", category: "Autonomous Engineering" },
    { id: "tg-009", name: "VNR Vignana Jyothi Institute of Engineering and Technology", city: "Hyderabad", state: "Telangana", category: "Autonomous Engineering" },
    { id: "tg-010", name: "Gokaraju Rangaraju Institute of Engineering and Technology", city: "Hyderabad", state: "Telangana", category: "Autonomous Engineering" },

    // Maharashtra
    { id: "mh-001", name: "Indian Institute of Technology Bombay (IIT Bombay)", city: "Mumbai", state: "Maharashtra", category: "IIT" },
    { id: "mh-002", name: "Visvesvaraya National Institute of Technology (VNIT Nagpur)", city: "Nagpur", state: "Maharashtra", category: "NIT" },
    { id: "mh-003", name: "College of Engineering Pune (COEP Technological University)", city: "Pune", state: "Maharashtra", category: "State University" },
    { id: "mh-004", name: "Veermata Jijabai Technological Institute (VJTI)", city: "Mumbai", state: "Maharashtra", category: "Autonomous Engineering" },
    { id: "mh-005", name: "Savitribai Phule Pune University (SPPU)", city: "Pune", state: "Maharashtra", category: "University" },
    { id: "mh-006", name: "University of Mumbai", city: "Mumbai", state: "Maharashtra", category: "University" },
    { id: "mh-007", name: "Sardar Patel Institute of Technology (SPIT)", city: "Mumbai", state: "Maharashtra", category: "Autonomous Engineering" },
    { id: "mh-008", name: "Maharashtra Institute of Technology (MIT-WPU)", city: "Pune", state: "Maharashtra", category: "Private University" },
    { id: "mh-009", name: "Walchand College of Engineering", city: "Sangli", state: "Maharashtra", category: "Autonomous Engineering" },
    { id: "mh-010", name: "Vishwakarma Institute of Technology (VIT Pune)", city: "Pune", state: "Maharashtra", category: "Autonomous Engineering" },
    { id: "mh-011", name: "St. Xavier's College", city: "Mumbai", state: "Maharashtra", category: "Arts & Science" },

    // Delhi & NCR
    { id: "dl-001", name: "Indian Institute of Technology Delhi (IIT Delhi)", city: "New Delhi", state: "Delhi", category: "IIT" },
    { id: "dl-002", name: "Delhi Technological University (DTU)", city: "New Delhi", state: "Delhi", category: "State University" },
    { id: "dl-003", name: "Netaji Subhas University of Technology (NSUT)", city: "New Delhi", state: "Delhi", category: "State University" },
    { id: "dl-004", name: "Indraprastha Institute of Information Technology Delhi (IIIT-Delhi)", city: "New Delhi", state: "Delhi", category: "State University" },
    { id: "dl-005", name: "University of Delhi (DU)", city: "New Delhi", state: "Delhi", category: "Central University" },
    { id: "dl-006", name: "Jamia Millia Islamia", city: "New Delhi", state: "Delhi", category: "Central University" },
    { id: "dl-007", name: "National Institute of Technology Delhi (NIT Delhi)", city: "New Delhi", state: "Delhi", category: "NIT" },
    { id: "dl-008", name: "Guru Gobind Singh Indraprastha University (GGSIPU)", city: "New Delhi", state: "Delhi", category: "State University" },
    { id: "dl-009", name: "St. Stephen's College", city: "New Delhi", state: "Delhi", category: "Arts & Science" },
    { id: "dl-010", name: "Hindu College", city: "New Delhi", state: "Delhi", category: "Arts & Science" },

    // Uttar Pradesh
    { id: "up-001", name: "Indian Institute of Technology Kanpur (IIT Kanpur)", city: "Kanpur", state: "Uttar Pradesh", category: "IIT" },
    { id: "up-002", name: "Indian Institute of Technology (BHU) Varanasi", city: "Varanasi", state: "Uttar Pradesh", category: "IIT" },
    { id: "up-003", name: "Motilal Nehru National Institute of Technology (MNNIT Allahabad)", city: "Prayagraj", state: "Uttar Pradesh", category: "NIT" },
    { id: "up-004", name: "Indian Institute of Information Technology Allahabad (IIIT Allahabad)", city: "Prayagraj", state: "Uttar Pradesh", category: "IIIT" },
    { id: "up-005", name: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)", city: "Lucknow", state: "Uttar Pradesh", category: "University" },
    { id: "up-006", name: "Harcourt Butler Technical University (HBTU)", city: "Kanpur", state: "Uttar Pradesh", category: "State University" },
    { id: "up-007", name: "Madan Mohan Malaviya University of Technology (MMMUT)", city: "Gorakhpur", state: "Uttar Pradesh", category: "State University" },
    { id: "up-008", name: "Aligarh Muslim University (AMU)", city: "Aligarh", state: "Uttar Pradesh", category: "Central University" },
    { id: "up-009", name: "Banaras Hindu University (BHU)", city: "Varanasi", state: "Uttar Pradesh", category: "Central University" },
    { id: "up-010", name: "Jaypee Institute of Information Technology (JIIT)", city: "Noida", state: "Uttar Pradesh", category: "Deemed University" },
    { id: "up-011", name: "Amity University Uttar Pradesh", city: "Noida", state: "Uttar Pradesh", category: "Private University" },
    { id: "up-012", name: "Shiv Nadar University", city: "Greater Noida", state: "Uttar Pradesh", category: "Private University" },

    // Gujarat
    { id: "gj-001", name: "Indian Institute of Technology Gandhinagar (IIT Gandhinagar)", city: "Gandhinagar", state: "Gujarat", category: "IIT" },
    { id: "gj-002", name: "Sardar Vallabhbhai National Institute of Technology (SVNIT Surat)", city: "Surat", state: "Gujarat", category: "NIT" },
    { id: "gj-003", name: "Gujarat Technological University (GTU)", city: "Ahmedabad", state: "Gujarat", category: "University" },
    { id: "gj-004", name: "Dhirubhai Ambani Institute of Information and Communication Technology (DA-IICT)", city: "Gandhinagar", state: "Gujarat", category: "State University" },
    { id: "gj-005", name: "Nirma University", city: "Ahmedabad", state: "Gujarat", category: "Private University" },
    { id: "gj-006", name: "Pandit Deendayal Energy University (PDEU)", city: "Gandhinagar", state: "Gujarat", category: "Private University" },
    { id: "gj-007", name: "Maharaja Sayajirao University of Baroda (MSU)", city: "Vadodara", state: "Gujarat", category: "State University" },
    { id: "gj-008", name: "LD College of Engineering", city: "Ahmedabad", state: "Gujarat", category: "Government Engineering" },

    // Rajasthan
    { id: "rj-001", name: "Indian Institute of Technology Jodhpur (IIT Jodhpur)", city: "Jodhpur", state: "Rajasthan", category: "IIT" },
    { id: "rj-002", name: "Malaviya National Institute of Technology Jaipur (MNIT Jaipur)", city: "Jaipur", state: "Rajasthan", category: "NIT" },
    { id: "rj-003", name: "Birla Institute of Technology and Science (BITS Pilani)", city: "Pilani", state: "Rajasthan", category: "Deemed University" },
    { id: "rj-004", name: "Rajasthan Technical University (RTU)", city: "Kota", state: "Rajasthan", category: "University" },
    { id: "rj-005", name: "University of Rajasthan", city: "Jaipur", state: "Rajasthan", category: "University" },
    { id: "rj-006", name: "Manipal University Jaipur", city: "Jaipur", state: "Rajasthan", category: "Private University" },

    // West Bengal
    { id: "wb-001", name: "Indian Institute of Technology Kharagpur (IIT Kharagpur)", city: "Kharagpur", state: "West Bengal", category: "IIT" },
    { id: "wb-002", name: "National Institute of Technology Durgapur (NIT Durgapur)", city: "Durgapur", state: "West Bengal", category: "NIT" },
    { id: "wb-003", name: "Indian Institute of Engineering Science and Technology (IIEST Shibpur)", city: "Howrah", state: "West Bengal", category: "Institute of National Importance" },
    { id: "wb-004", name: "Jadavpur University", city: "Kolkata", state: "West Bengal", category: "State University" },
    { id: "wb-005", name: "Maulana Abul Kalam Azad University of Technology (MAKAUT)", city: "Kolkata", state: "West Bengal", category: "University" },
    { id: "wb-006", name: "University of Calcutta", city: "Kolkata", state: "West Bengal", category: "Central/State University" },
    { id: "wb-007", name: "Presidency University", city: "Kolkata", state: "West Bengal", category: "State University" },
    { id: "wb-008", name: "Heritage Institute of Technology", city: "Kolkata", state: "West Bengal", category: "Autonomous Engineering" },
    { id: "wb-009", name: "Institute of Engineering and Management (IEM)", city: "Kolkata", state: "West Bengal", category: "Autonomous Engineering" },

    // Punjab, Haryana & Chandigarh
    { id: "pb-001", name: "Indian Institute of Technology Ropar (IIT Ropar)", city: "Rupnagar", state: "Punjab", category: "IIT" },
    { id: "pb-002", name: "Dr B R Ambedkar National Institute of Technology Jalandhar (NIT Jalandhar)", city: "Jalandhar", state: "Punjab", category: "NIT" },
    { id: "pb-003", name: "Thapar Institute of Engineering and Technology", city: "Patiala", state: "Punjab", category: "Deemed University" },
    { id: "pb-004", name: "Punjab Engineering College (PEC Chandigarh)", city: "Chandigarh", state: "Chandigarh", category: "Deemed University" },
    { id: "pb-005", name: "Panjab University (PU)", city: "Chandigarh", state: "Chandigarh", category: "University" },
    { id: "hr-001", name: "National Institute of Technology Kurukshetra (NIT Kurukshetra)", city: "Kurukshetra", state: "Haryana", category: "NIT" },
    { id: "hr-002", name: "YMCA University of Science and Technology (J.C. Bose UST)", city: "Faridabad", state: "Haryana", category: "State University" },
    { id: "pb-006", name: "Lovely Professional University (LPU)", city: "Phagwara", state: "Punjab", category: "Private University" },
    { id: "pb-007", name: "Chandigarh University", city: "Mohali", state: "Punjab", category: "Private University" },

    // Madhya Pradesh & Chhattisgarh
    { id: "mp-001", name: "Indian Institute of Technology Indore (IIT Indore)", city: "Indore", state: "Madhya Pradesh", category: "IIT" },
    { id: "mp-002", name: "Maulana Azad National Institute of Technology (MANIT Bhopal)", city: "Bhopal", state: "Madhya Pradesh", category: "NIT" },
    { id: "mp-003", name: "Atal Bihari Vajpayee IIITM Gwalior", city: "Gwalior", state: "Madhya Pradesh", category: "IIIT" },
    { id: "mp-004", name: "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)", city: "Bhopal", state: "Madhya Pradesh", category: "University" },
    { id: "mp-005", name: "Shri Govindram Seksaria Institute of Technology and Science (SGSITS)", city: "Indore", state: "Madhya Pradesh", category: "Autonomous Engineering" },
    { id: "cg-001", name: "National Institute of Technology Raipur (NIT Raipur)", city: "Raipur", state: "Chhattisgarh", category: "NIT" },
    { id: "cg-002", name: "Indian Institute of Technology Bhilai (IIT Bhilai)", city: "Bhilai", state: "Chhattisgarh", category: "IIT" },

    // Odisha, Bihar & Jharkhand
    { id: "or-001", name: "National Institute of Technology Rourkela (NIT Rourkela)", city: "Rourkela", state: "Odisha", category: "NIT" },
    { id: "or-002", name: "Indian Institute of Technology Bhubaneswar (IIT BBS)", city: "Bhubaneswar", state: "Odisha", category: "IIT" },
    { id: "or-003", name: "KIIT Deemed to be University", city: "Bhubaneswar", state: "Odisha", category: "Deemed University" },
    { id: "or-004", name: "Siksha 'O' Anusandhan (SOA)", city: "Bhubaneswar", state: "Odisha", category: "Deemed University" },
    { id: "or-005", name: "College of Engineering and Technology (OUTR Bhubaneswar)", city: "Bhubaneswar", state: "Odisha", category: "State University" },
    { id: "br-001", name: "Indian Institute of Technology Patna (IIT Patna)", city: "Patna", state: "Bihar", category: "IIT" },
    { id: "br-002", name: "National Institute of Technology Patna (NIT Patna)", city: "Patna", state: "Bihar", category: "NIT" },
    { id: "jh-001", name: "Indian Institute of Technology (ISM) Dhanbad", city: "Dhanbad", state: "Jharkhand", category: "IIT" },
    { id: "jh-002", name: "National Institute of Technology Jamshedpur (NIT Jamshedpur)", city: "Jamshedpur", state: "Jharkhand", category: "NIT" },
    { id: "jh-003", name: "Birla Institute of Technology, Mesra (BIT Mesra)", city: "Ranchi", state: "Jharkhand", category: "Deemed University" },

    // Assam, Northeast & Others
    { id: "as-001", name: "Indian Institute of Technology Guwahati (IIT Guwahati)", city: "Guwahati", state: "Assam", category: "IIT" },
    { id: "as-002", name: "National Institute of Technology Silchar (NIT Silchar)", city: "Silchar", state: "Assam", category: "NIT" },
    { id: "as-003", name: "Assam Engineering College", city: "Guwahati", state: "Assam", category: "Government Engineering" },
    { id: "ut-001", name: "Indian Institute of Technology Roorkee (IIT Roorkee)", city: "Roorkee", state: "Uttarakhand", category: "IIT" },
    { id: "ut-002", name: "National Institute of Technology Uttarakhand (NIT UK)", city: "Srinagar (Garhwal)", state: "Uttarakhand", category: "NIT" },
    { id: "ga-001", name: "National Institute of Technology Goa (NIT Goa)", city: "Ponda", state: "Goa", category: "NIT" },
    { id: "jk-001", name: "National Institute of Technology Srinagar (NIT Srinagar)", city: "Srinagar", state: "Jammu & Kashmir", category: "NIT" },
    { id: "jk-002", name: "Indian Institute of Technology Jammu (IIT Jammu)", city: "Jammu", state: "Jammu & Kashmir", category: "IIT" },
    { id: "py-001", name: "Pondicherry Engineering College (Puducherry Technological University)", city: "Puducherry", state: "Puducherry", category: "State University" }
];
