import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTemplates } from "../templates/_core/TemplateProvider";
import { TemplateDefinition } from "../templates/_core/types";
import React from "react";

const TemplateList: React.FC = () => {
  const { industry } = useParams<{ industry?: string }>();
  const [templates, setTemplates] = useState<TemplateDefinition[]>([]);
  const { getTemplatesByIndustry, loading: contextLoading } = useTemplates();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get templates from the template system
    if (!contextLoading && industry) {
      setLoading(true);
      const industryTemplates = getTemplatesByIndustry(industry as any);
      setTemplates(industryTemplates);
      setLoading(false);
    }
  }, [industry, contextLoading, getTemplatesByIndustry]);

  // Safely handle undefined industry parameter
  const industryDisplayName = industry
    ? industry.charAt(0).toUpperCase() + industry.slice(1)
    : "All";

  return (
    <div className="container mx-auto">
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
          {templates.map((template: TemplateDefinition) => (
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
                <div className="mt-2 flex flex-wrap gap-2">
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
