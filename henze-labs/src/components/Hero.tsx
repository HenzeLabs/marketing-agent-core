import React from "react";
import Button from "./Button";
import { ArrowRightIcon, CheckIcon } from "./Icons";

const AnimatedInsight = ({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: string;
}) => (
  <div
    className="flex items-center gap-3 bg-white/5 p-3 rounded-lg animate-fade-in-up"
    style={{ animationDelay: delay }}
  >
    <div className="w-6 h-6 bg-marketing-cyan-10 text-marketing-cyan rounded-full flex items-center justify-center flex-shrink-0">
      <CheckIcon className="w-3.5 h-3.5" />
    </div>
    <span className="text-sm text-marketing-gray-light">{children}</span>
  </div>
);

const Hero: React.FC = () => {
  return (
    <section className="pt-40 pb-20 md:pt-48 md:pb-28 bg-marketing-charcoal">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-6 leading-tight text-marketing-text-light">
              Your marketing data,
              <span className="block bg-gradient-to-r from-sky-400 to-marketing-cyan bg-clip-text text-transparent">
                explained like a human.
              </span>
            </h1>
            <p className="text-lg text-marketing-gray-light max-w-xl mx-auto md:mx-0 mb-8">
              Connect Google Analytics, Shopify, and Clarity to get daily,
              plain‑English briefs with the “so what” and the next step. No more
              dashboard diving.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mb-12">
              <Button
                href="#"
                variant="primary"
                size="lg"
                className="text-marketing-navy"
              >
                <span>See the Demo</span>
                <ArrowRightIcon className="w-5 h-5 text-marketing-navy" />
              </Button>
              <Button
                href="#"
                variant="secondary"
                size="lg"
                className="text-marketing-cyan"
              >
                Book a Call
              </Button>
            </div>
          </div>

          <div className="relative hidden md:block w-full max-w-md mx-auto">
            <div className="absolute -inset-8 bg-gradient-to-br from-marketing-navy/50 via-marketing-cyan/20 to-marketing-slate/50 rounded-3xl filter blur-2xl"></div>
            <div className="relative border border-marketing-slate-50 bg-marketing-charcoal-50 rounded-2xl p-6 backdrop-blur-lg shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <p className="font-semibold text-lg text-marketing-text-light">
                  Yesterday's Brief
                </p>
                <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-green-400">
                  LIVE
                </span>
              </div>
              <div className="space-y-3">
                <AnimatedInsight delay="200ms">
                  <span className="font-bold text-green-400">
                    +12% sessions
                  </span>{" "}
                  driven by organic search.
                </AnimatedInsight>
                <AnimatedInsight delay="400ms">
                  Average order value{" "}
                  <span className="font-bold text-marketing-text-light">
                    up 8%
                  </span>{" "}
                  post-promo.
                </AnimatedInsight>
                <AnimatedInsight delay="600ms">
                  <span className="font-bold text-marketing-orange">
                    3 pages slowing checkout
                  </span>
                  , see report.
                </AnimatedInsight>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { 
          animation: fade-in-up 0.5s ease-out forwards;
          opacity: 0; /* Start hidden */
        }
        .bg-grid-white\\[\/0\\.05\\] {
            background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 40px 40px;
        }
      `}</style>
    </section>
  );
};

export default Hero;
