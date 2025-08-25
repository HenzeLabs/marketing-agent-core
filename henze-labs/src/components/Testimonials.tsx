import React from "react";
import { QuoteIcon } from "./Icons";

const testimonials = [
  {
    quote:
      "Five minutes to connect. By week two we fixed two leaks and lifted AOV 9%. This is a no-brainer for any e-commerce marketing team.",
    author: "Lauren H.",
    title: "Director of Marketing, Lab Essentials",
  },
  {
    quote:
      "Marketing Copilot cut checkout abandonment by 14% in 21 days by identifying a key UX issue we had missed for months. It paid for itself in the first week.",
    author: "David R.",
    title: "RevOps Lead, Hot Ash",
  },
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Loved by data-driven teams
          </h2>
          <p className="text-lg text-marketing-gray-light">
            Don't take our word for it. Here's what our customers are saying.
          </p>
        </div>

        <div className="mt-16 grid lg:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="bg-marketing-slate-10 border border-marketing-slate-30 p-8 rounded-2xl"
            >
              <QuoteIcon className="w-8 h-8 text-marketing-cyan mb-4" />
              <blockquote className="text-lg text-marketing-text-light italic">
                “{testimonial.quote}”
              </blockquote>
              <cite className="mt-6 block not-italic">
                <span className="font-bold">{testimonial.author}</span>
                <br />
                <span className="text-marketing-gray-light">
                  {testimonial.title}
                </span>
              </cite>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
