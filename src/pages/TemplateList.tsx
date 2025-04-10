import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { getTemplatesByIndustry } from "../data/templates";
import { Template } from "../types/templates";
import React from "react";

const TemplateList: React.FC = () => {
  const { industry } = useParams<{ industry?: string }>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching templates
    setLoading(true);
    if (industry) {
      const fetchedTemplates = getTemplatesByIndustry(industry);
      setTemplates(fetchedTemplates);
    }
    setLoading(false);
  }, [industry]);

  // Safely handle undefined industry parameter
  const industryDisplayName = industry
    ? industry.charAt(0).toUpperCase() + industry.slice(1)
    : "All";

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {industryDisplayName} Templates
      </h1>

      {loading ? (
        <div className="flex justify-center">
          <p>Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600">
            No templates found for this industry.
          </p>
          <Link
            to="/"
            className="mt-4 inline-block text-indigo-600 hover:underline"
          >
            Return to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: Template) => (
            <Link
              key={template.id}
              to={`/editor/${template.id}`}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-4xl">{template.icon}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-gray-600 text-sm">{template.description}</p>
                <div className="mt-2 flex space-x-2">
                  {template.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateList;
