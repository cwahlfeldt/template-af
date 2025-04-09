// Template data structure
const templates = [
  {
    id: 'business-card',
    name: 'Business Card',
    description: 'Professional business card template',
    industry: 'business',
    tags: ['card', 'professional', 'contact'],
    icon: '🪪',
    template: {
      type: 'business-card',
      fields: [
        { id: 'name', label: 'Full Name', type: 'text', default: 'John Doe' },
        { id: 'title', label: 'Job Title', type: 'text', default: 'Software Engineer' },
        { id: 'company', label: 'Company Name', type: 'text', default: 'Tech Solutions Inc.' },
        { id: 'email', label: 'Email', type: 'text', default: 'john.doe@example.com' },
        { id: 'phone', label: 'Phone', type: 'text', default: '(555) 123-4567' },
        { id: 'website', label: 'Website', type: 'text', default: 'www.example.com' },
        { id: 'address', label: 'Address', type: 'text', default: '123 Business St, City, State 12345' },
        { 
          id: 'logo', 
          label: 'Logo', 
          type: 'image', 
          default: 'https://via.placeholder.com/150' 
        }
      ]
    }
  },
  {
    id: 'invoice',
    name: 'Invoice Template',
    description: 'Clean and professional invoice layout',
    industry: 'business',
    tags: ['finance', 'billing', 'professional'],
    icon: '📝',
    template: {
      type: 'invoice',
      fields: [
        { id: 'companyName', label: 'Your Company', type: 'text', default: 'Your Business Name' },
        { id: 'companyInfo', label: 'Company Info', type: 'text', default: 'Address, Contact Details' },
        { id: 'invoiceNumber', label: 'Invoice #', type: 'text', default: 'INV-001' },
        { id: 'invoiceDate', label: 'Date', type: 'text', default: '04/09/2025' },
        { id: 'dueDate', label: 'Due Date', type: 'text', default: '04/23/2025' },
        { id: 'clientName', label: 'Bill To', type: 'text', default: 'Client Name' },
        { id: 'clientAddress', label: 'Client Address', type: 'text', default: 'Client Address' },
        { id: 'items', label: 'Invoice Items', type: 'array', default: [
          { description: 'Service 1', quantity: 1, rate: 100, amount: 100 },
          { description: 'Service 2', quantity: 2, rate: 50, amount: 100 }
        ]},
        { id: 'subtotal', label: 'Subtotal', type: 'calculated', default: 200 },
        { id: 'tax', label: 'Tax', type: 'text', default: '10%' },
        { id: 'total', label: 'Total', type: 'calculated', default: 220 },
        { id: 'notes', label: 'Notes', type: 'text', default: 'Thank you for your business!' },
        { 
          id: 'logo', 
          label: 'Logo', 
          type: 'image', 
          default: 'https://via.placeholder.com/150' 
        }
      ]
    }
  },
  {
    id: 'social-media-post',
    name: 'Social Media Post',
    description: 'Engaging social media template',
    industry: 'marketing',
    tags: ['social media', 'digital', 'graphic'],
    icon: '📱',
    template: {
      type: 'social-post',
      fields: [
        { id: 'headline', label: 'Headline', type: 'text', default: 'Amazing New Product!' },
        { id: 'subtext', label: 'Supporting Text', type: 'text', default: 'Limited time offer - 25% off!' },
        { id: 'callToAction', label: 'Call to Action', type: 'text', default: 'Shop Now' },
        { 
          id: 'backgroundImage', 
          label: 'Background Image', 
          type: 'image', 
          default: 'https://via.placeholder.com/800x600' 
        },
        { id: 'brandColor', label: 'Brand Color', type: 'color', default: '#ff5722' },
        { 
          id: 'logo', 
          label: 'Logo', 
          type: 'image', 
          default: 'https://via.placeholder.com/150' 
        }
      ]
    }
  },
  {
    id: 'lesson-plan',
    name: 'Lesson Plan',
    description: 'Structured education lesson plan',
    industry: 'education',
    tags: ['education', 'teaching', 'planning'],
    icon: '📚',
    template: {
      type: 'lesson-plan',
      fields: [
        { id: 'title', label: 'Lesson Title', type: 'text', default: 'Introduction to Biology' },
        { id: 'gradeLevel', label: 'Grade Level', type: 'text', default: '9th Grade' },
        { id: 'subject', label: 'Subject', type: 'text', default: 'Biology' },
        { id: 'duration', label: 'Duration', type: 'text', default: '45 minutes' },
        { id: 'objectives', label: 'Learning Objectives', type: 'text', default: 'Students will be able to identify basic cell structures and explain their functions.' },
        { id: 'materials', label: 'Materials Needed', type: 'text', default: 'Textbook, worksheets, projector' },
        { id: 'procedures', label: 'Procedures', type: 'text', default: '1. Introduction (5 min)\\n2. Direct Instruction (15 min)\\n3. Guided Practice (15 min)\\n4. Independent Practice (5 min)\\n5. Closure (5 min)' },
        { id: 'assessment', label: 'Assessment', type: 'text', default: 'Quiz on cell structures and functions' },
        { id: 'homework', label: 'Homework', type: 'text', default: 'Read textbook pages 25-30 and complete worksheet' }
      ]
    }
  },
  {
    id: 'patient-form',
    name: 'Patient Intake Form',
    description: 'Medical patient information form',
    industry: 'healthcare',
    tags: ['medical', 'patient', 'form'],
    icon: '🏥',
    template: {
      type: 'medical-form',
      fields: [
        { id: 'clinicName', label: 'Clinic Name', type: 'text', default: 'Wellness Medical Center' },
        { id: 'patientName', label: 'Patient Name', type: 'text', default: 'Patient Name' },
        { id: 'patientDOB', label: 'Date of Birth', type: 'text', default: 'MM/DD/YYYY' },
        { id: 'patientAddress', label: 'Address', type: 'text', default: 'Street Address, City, State, ZIP' },
        { id: 'patientPhone', label: 'Phone Number', type: 'text', default: '(XXX) XXX-XXXX' },
        { id: 'patientEmail', label: 'Email', type: 'text', default: 'patient@example.com' },
        { id: 'insuranceProvider', label: 'Insurance Provider', type: 'text', default: 'Insurance Company' },
        { id: 'insuranceID', label: 'Insurance ID', type: 'text', default: 'ID Number' },
        { id: 'currentMedications', label: 'Current Medications', type: 'text', default: 'List any medications you are currently taking' },
        { id: 'allergies', label: 'Allergies', type: 'text', default: 'List any known allergies' },
        { id: 'medicalHistory', label: 'Medical History', type: 'text', default: 'List any past surgeries or medical conditions' },
        { 
          id: 'logo', 
          label: 'Clinic Logo', 
          type: 'image', 
          default: 'https://via.placeholder.com/150' 
        }
      ]
    }
  },
  {
    id: 'tech-spec-sheet',
    name: 'Technical Specification Sheet',
    description: 'Product technical specifications',
    industry: 'technology',
    tags: ['technical', 'product', 'specifications'],
    icon: '💻',
    template: {
      type: 'spec-sheet',
      fields: [
        { id: 'productName', label: 'Product Name', type: 'text', default: 'Product Model X-1000' },
        { id: 'productDescription', label: 'Description', type: 'text', default: 'High-performance computing solution for enterprise applications' },
        { id: 'processor', label: 'Processor', type: 'text', default: 'Intel Core i7, 3.6GHz' },
        { id: 'memory', label: 'Memory', type: 'text', default: '16GB DDR4' },
        { id: 'storage', label: 'Storage', type: 'text', default: '512GB SSD' },
        { id: 'dimensions', label: 'Dimensions', type: 'text', default: '13.3" x 9.2" x 0.6"' },
        { id: 'weight', label: 'Weight', type: 'text', default: '3.5 lbs' },
        { id: 'operatingSystem', label: 'Operating System', type: 'text', default: 'Windows 11 Pro' },
        { id: 'warranty', label: 'Warranty', type: 'text', default: '2-year limited hardware warranty' },
        { 
          id: 'productImage', 
          label: 'Product Image', 
          type: 'image', 
          default: 'https://via.placeholder.com/400x300' 
        },
        { 
          id: 'companyLogo', 
          label: 'Company Logo', 
          type: 'image', 
          default: 'https://via.placeholder.com/150' 
        }
      ]
    }
  },
  {
    id: 'hotel-flyer',
    name: 'Hotel Promotional Flyer',
    description: 'Hotel promotion and information',
    industry: 'hospitality',
    tags: ['hotel', 'promotion', 'travel'],
    icon: '🏨',
    template: {
      type: 'hotel-flyer',
      fields: [
        { id: 'hotelName', label: 'Hotel Name', type: 'text', default: 'Luxury Resort & Spa' },
        { id: 'tagline', label: 'Tagline', type: 'text', default: 'Experience Extraordinary Comfort' },
        { id: 'description', label: 'Description', type: 'text', default: 'Nestled in the heart of paradise, our luxury resort offers unparalleled amenities and exceptional service for an unforgettable stay.' },
        { id: 'amenities', label: 'Amenities', type: 'text', default: '• 5-Star Restaurant\\n• Infinity Pool\\n• Luxury Spa\\n• Fitness Center\\n• Private Beach' },
        { id: 'specialOffer', label: 'Special Offer', type: 'text', default: 'Book Now and Save 20% - Limited Time Offer!' },
        { id: 'contactInfo', label: 'Contact Information', type: 'text', default: 'Phone: (555) 123-4567\\nEmail: reservations@luxuryresort.com\\nWebsite: www.luxuryresort.com' },
        { id: 'address', label: 'Address', type: 'text', default: '123 Paradise Blvd, Tropical Island, TI 12345' },
        { 
          id: 'heroImage', 
          label: 'Featured Image', 
          type: 'image', 
          default: 'https://via.placeholder.com/800x400' 
        },
        { 
          id: 'logo', 
          label: 'Hotel Logo', 
          type: 'image', 
          default: 'https://via.placeholder.com/150' 
        }
      ]
    }
  }
];

// Helper functions
export const getAllTemplates = () => {
  return templates;
};

export const getTemplatesByIndustry = (industry) => {
  return templates.filter(template => template.industry === industry);
};

export const getTemplateById = (id) => {
  return templates.find(template => template.id === id);
};
