import snapshot from "../../public/api/site.json";

export interface Badge { text: string; color: string; icon: string }
export interface Stat { value: string; label: string }
export interface Offer { image: string; amount: string; company: string; role: string; note: string }
export interface Lesson { id: string; sectionId: string; title: string; description: string; videoUrl: string; duration: string; order: number; links: Array<{ label: string; url: string }> }
export interface LibrarySection { id: string; title: string; description: string; order: number }
export interface RoadmapItem { title: string; text: string }
export interface Guarantee { icon: string; title: string; text: string }
export interface DocumentItem { label: string; url: string; note: string }
export interface Plan { name: string; price: string; period: string; features: string[]; highlighted: boolean; cta: string; ctaLink: string }
export interface Review { name: string; role: string; offerSummary: string; text: string; finalOffer: string; avatar: string; link: string }
export interface FaqItem { q: string; a: string }
export interface PaymentMethod { label: string; image: string }
export interface UiCopy { [key: string]: string }

export interface ReferenceData {
  rev: number;
  sections: LibrarySection[];
  lessons: Lesson[];
  settings: {
    brand: string;
    heroTitle: string;
    heroSubtitle: string;
    badges: Badge[];
    stats: Stat[];
    ctaText: string;
    ctaLink: string;
    jobOffers: Offer[];
    roadmap: RoadmapItem[];
    about: string;
    skills: string[];
    guarantees: Guarantee[];
    documents: DocumentItem[];
    paymentMethods: PaymentMethod[];
    plans: Plan[];
    reviews: Review[];
    faq: FaqItem[];
    contacts: Record<string, string>;
    ui: UiCopy;
  };
}

export const data = snapshot as ReferenceData;

export const orderedSections = [...data.sections]
  .sort((a, b) => a.order - b.order)
  .map((section) => ({
    ...section,
    lessons: data.lessons
      .filter((lesson) => lesson.sectionId === section.id)
      .sort((a, b) => a.order - b.order),
  }));
