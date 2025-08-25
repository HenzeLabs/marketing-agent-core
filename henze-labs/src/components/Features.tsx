import React from "react";
import {
  BriefcaseIcon,
  DollarSignIcon,
  EyeIcon,
  WandIcon,
  ChatBubbleIcon,
} from "./Icons";

const features = [
  {
    icon: BriefcaseIcon,
    title: "Daily Briefs",
    description:
      "A morning summary that highlights what moved and why, so you can start your day with clarity.",
  },
  {
    icon: DollarSignIcon,
    title: "Revenue Lens",
    description:
      "See the exact pages, products, and cohorts driving (or draining) your revenue.",
  },
  {
    icon: EyeIcon,
    title: "UX Watch",
    description:
      "PageSpeed and Clarity patterns are automatically tied to their conversion and revenue impact.",
  },
  {
    icon: WandIcon,
    title: "Action Engine",
    description:
      "Get guided fixes with impact estimates and tracking to see your improvements in real-time.",
  },
  {
    icon: ChatBubbleIcon,
    title: "AI Agent Mode",
    description:
      "Ask natural-language questions like “Why did AOV drop last week?” and get instant answers with charts.",
  },
];

const Features: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-marketing-slate/5">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-marketing-text-light">
            A smarter way to monitor performance
          </h2>
          <p className="text-lg text-marketing-gray-light">
            Go beyond dashboards. Get actionable insights delivered to you.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-marketing-slate-10 border border-marketing-slate-30 p-8 rounded-2xl ${
                index === features.length - 1 && features.length % 2 !== 0
                  ? "md:col-span-2"
                  : ""
              }`}
            >
              <div className="w-12 h-12 bg-marketing-cyan-10 text-marketing-cyan rounded-lg flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-marketing-cyan" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-marketing-text-light">
                {feature.title}
              </h3>
              <p className="text-marketing-gray-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
