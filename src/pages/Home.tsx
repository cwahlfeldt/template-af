import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTemplates } from "../templates/_core/TemplateProvider";

// Industry definitions with their display properties
const industries = [
  { id: "business", name: "Business", icon: "💼", color: "bg-blue-100" },
  { id: "marketing", name: "Marketing", icon: "📢", color: "bg-green-100" },
  { id: "education", name: "Education", icon: "🎓", color: "bg-yellow-100" },
  { id: "healthcare", name: "Healthcare", icon: "🏥", color: "bg-red-100" },
  { id: "technology", name: "Technology", icon: "💻", color: "bg-purple-100" },
  {
    id: "hospitality",
    name: "Hospitality",
    icon: "🏨",
    color: "bg-blue-100",
  },
];

function Home() {
  // Use our template context to get all templates
  const { templates, loading } = useTemplates();
  const [featuredTemplates, setFeaturedTemplates] = useState<Array<any>>([]);
  
  // Select a few templates to feature on the homepage
  useEffect(() => {
    if (!loading && templates.length > 0) {
      // Just take the first 3 templates for now, or however many we have
      setFeaturedTemplates(templates.slice(0, 3));
    }
  }, [templates, loading]);
  return (
    <div className="mx-auto container">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Template AF</h1>
        <p className="text-xl text-gray-600 mb-6">
          Professional templates for any business or platform. Customize, edit,
          and download in minutes.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Browse by Industry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => (
            <Link
              key={industry.id}
              to={`/templates/${industry.id}`}
              className={`${industry.color} rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center">
                <span className="text-4xl mr-4">{industry.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold">{industry.name}</h3>
                  <p className="text-gray-600">
                    Browse {industry.name} templates
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center py-10">
              <p>Loading templates...</p>
            </div>
          ) : featuredTemplates.length === 0 ? (
            <div className="col-span-3 text-center py-10">
              <p>No templates available yet.</p>
            </div>
          ) : (
            featuredTemplates.map((template) => (
              <Link
                key={template.id}
                to={`/editor/${template.id}`}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  <span className="text-3xl">{template.icon}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-gray-600 text-sm">
                    {template.description}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
