import SectionPage from "@/components/SectionPage";
import ProductGrid, { Product } from "@/components/ProductGrid";

const printingProducts: Product[] = [
  {
    id: "t-shirt",
    title: "طباعة القمصان",
    description: "طباعة ملونة على القمصان. تصاميم مخصصة وفريدة. جودة عالية وألوان زاهية. متينة وتدوم طويلاً.",
    image: "https://via.placeholder.com/300x300?text=قمصان",
    category: "printing",
  },
  {
    id: "hoodie",
    title: "طباعة الهودي",
    description: "طباعة على بلوزات الهودي الدافئة. تصاميم عصرية وجميلة. جودة عالية وراحة. مثالية للشتاء.",
    image: "https://via.placeholder.com/300x300?text=هودي",
    category: "printing",
  },
  {
    id: "pantalon",
    title: "طباعة البنطالات",
    description: "طباعة على البنطالات الرياضية والكاجوال. تصاميم فريدة ومميزة. جودة احترافية. راحة ومتانة.",
    image: "https://via.placeholder.com/300x300?text=بنطال",
    category: "printing",
  },
  {
    id: "pull",
    title: "طباعة البولو",
    description: "طباعة على البولوهات والسترات. تصاميم أنيقة وفخمة. جودة احترافية. مناسبة للاستخدام الرسمي.",
    image: "https://via.placeholder.com/300x300?text=بولو",
    category: "printing",
  },
  {
    id: "chaussures",
    title: "طباعة الأحذية",
    description: "طباعة مخصصة على الأحذية. تصاميم حسب الطلب. جودة عالية وقوية. تصميم فريد.",
    image: "https://via.placeholder.com/300x300?text=أحذية",
    category: "printing",
  },
  {
    id: "personnalisation",
    title: "التخصيص والطلبات المخصصة",
    description: "طلبات مخصصة حسب احتياجاتك. تصاميم فريدة وحسب الطلب. جودة عالية وتنفيذ احترافي. تواصل معنا للحصول على عرض.",
    image: "https://via.placeholder.com/300x300?text=تخصيص",
    category: "printing",
  },
];

export default function ProjectsPrinting() {
  return (
    <SectionPage
      title="الطباعة والتصاميم"
      description="طباعة ملابس وملحقات بتصاميم فريدة"
      icon="🖨️"
      color="from-purple-600 to-indigo-700"
      backHref="/projects"
      backLabel="عودة إلى المشاريع"
    >
      <ProductGrid products={printingProducts} />
    </SectionPage>
  );
}
