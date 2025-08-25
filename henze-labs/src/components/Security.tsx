import React from "react";
import { CheckCircleIcon } from "./Icons";

const securityFeatures = [
  "Secure sign-in with your Google Account",
  "Least-privilege permission scopes for data access",
  "All your data is stored securely in your own BigQuery project",
  "SOC2-friendly practices and enterprise-grade infrastructure",
];

const Security: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-marketing-slate-5">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Built for trust & security
            </h2>
            <p className="text-lg text-marketing-gray-light mb-6">
              Your data, your cloud. We are committed to the highest standards
              of data privacy and security.
            </p>
            <a
              href="/security"
              className="font-semibold text-marketing-cyan hover:underline"
            >
              Learn more about our security practices →
            </a>
          </div>
          <div className="space-y-4">
            {securityFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircleIcon className="w-6 h-6 text-marketing-cyan flex-shrink-0 mt-1" />
                <span className="text-marketing-gray-light">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Security;
