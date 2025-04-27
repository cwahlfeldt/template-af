import React from "react";
import { Link } from "react-router-dom";
import { useTemplates } from "../templates/_core/TemplateProvider";

function Home() {
  // Use our template context to get all templates
  const { templates, loading } = useTemplates();

  return (
    <div className="mx-auto container px-4 py-6">
      <section className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Template AF</h1>
        <p className="text-gray-600">
          Customize and download professional templates in minutes.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">All Templates</h2>
        {loading ? (
          <div className="text-center py-6">
            <p>Loading templates...</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-6">
            <p>No templates available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {templates.map((template) => (
              <Link
                key={template.id}
                to={`/editor/${template.id}`}
                className="bg-white rounded border border-gray-200 overflow-hidden shadow-sm hover:shadow transition-shadow"
              >
                <div className="h-24 bg-gray-100 flex items-center justify-center">
                  <span className="text-2xl">{template.icon}</span>
                </div>
                <div className="p-2">
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <p className="text-gray-500 text-xs truncate">
                    {template.description}
                  </p>
                  <div className="mt-1">
                    <span className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600">
                      {template.industry}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;