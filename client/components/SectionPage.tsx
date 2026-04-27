import React from "react";
import Layout from "./Layout";
import { ArrowRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface SectionPageProps {
  title: string;
  description: string;
  icon: string;
  color?: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function SectionPage({
  title,
  description,
  icon,
  color = "from-red-600 to-red-700",
  children,
  backHref,
  backLabel,
}: SectionPageProps) {
  return (
    <Layout>
      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${color} py-16`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl text-white">{icon}</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {title}
            </h1>
          </div>
          <p className="text-white/90 text-lg">{description}</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div>{children}</div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center items-center">
          {backHref && (
            <Link
              to={backHref}
              className="inline-flex items-center gap-2 text-[#8b0000] font-semibold hover:translate-x-2 transition-transform"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>{backLabel || "عودة"}</span>
            </Link>
          )}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#8b0000] font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>الرئيسية</span>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
