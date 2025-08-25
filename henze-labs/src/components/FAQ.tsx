import React, { useState } from "react";
import { PlusIcon, MinusIcon } from "./Icons";

interface AccordionItemProps {
  question: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  question,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-marketing-slate/50">
      <button
        className="flex justify-between items-center w-full py-5 text-left"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-lg text-marketing-text-light">
          {question}
        </span>
        {isOpen ? (
          <MinusIcon className="w-6 h-6 text-marketing-cyan" />
        ) : (
          <PlusIcon className="w-6 h-6 text-marketing-cyan" />
        )}
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="pb-5 text-marketing-gray-light">{children}</div>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-12 max-w-3xl mx-auto">
          <AccordionItem question="Does this replace a BI tool?">
            <p>
              For many marketing and leadership teams, yes. Marketing Copilot is
              designed to give you the "so what" from your data without the
              overhead of building and maintaining dashboards. For deep, custom
              analysis, you may still use a BI tool alongside it.
            </p>
          </AccordionItem>
          <AccordionItem question="Where is my data stored?">
            <p>
              Your data stays in your cloud. We connect to your Google Analytics
              and other sources, and process the data within your own BigQuery
              project. We never store your raw data on our servers.
            </p>
          </AccordionItem>
          <AccordionItem question="How are insights generated?">
            <p>
              We use a combination of statistical analysis, proprietary business
              logic for marketing, and large language models (LLMs) to analyze
              trends, detect anomalies, and translate complex data points into
              plain-English summaries and actionable advice.
            </p>
          </AccordionItem>
          <AccordionItem question="What’s required to get started?">
            <p>
              All you need is access to your data sources (like Google Analytics
              or Shopify) and a Google Cloud project to host BigQuery. Our
              onboarding process guides you through the connection steps, which
              typically take less than 10 minutes.
            </p>
          </AccordionItem>
          <AccordionItem question="Can I ask the AI specific questions about my data?">
            <p>
              Absolutely. Our AI Agent Mode is designed for exactly that. You
              can ask natural-language questions like "Which marketing channel
              had the best ROI last month?" or "Why did our conversion rate drop
              on Tuesday?" and get immediate, data-backed answers and
              visualizations, saving you hours of manual analysis.
            </p>
          </AccordionItem>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
