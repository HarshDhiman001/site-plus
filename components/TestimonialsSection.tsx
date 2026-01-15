
import React from 'react';
import { IconStar, IconQuote, IconMapPin } from './Icons';

export const TestimonialsSection: React.FC = () => {
  const reviews = [
    {
      name: "Dr. Emily Carter",
      role: "Founder",
      company: "Carter Dermatology",
      location: "London, UK",
      content: "Finally, an audit tool that understands context. It didn't just give me generic errors; it flagged a specific booking form issue that was costing us patient appointments. We fixed it and bookings increased by 30% in a week.",
      stars: 5,
      initials: "EC",
      color: "bg-purple-600"
    },
    {
      name: "Mark Thompson",
      role: "SEO Lead",
      company: "TechScale Agency",
      location: "San Francisco, CA",
      content: "The global routing analysis is brilliant. Most tools ignore latency from different countries. SitePulse showed us our East Coast load times were lagging, allowing us to optimize our CDN configuration immediately.",
      stars: 5,
      initials: "MT",
      color: "bg-blue-600"
    },
    {
      name: "Jessica Rodriguez",
      role: "Owner",
      company: "Elite HVAC Solutions",
      location: "Toronto, CA",
      content: "Simple, clear, and actually actionable. I handed the PDF report to my developer, and we jumped to #1 for 'Houston AC Repair' within a month. The local schema suggestions were spot on.",
      stars: 5,
      initials: "JR",
      color: "bg-orange-600"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Trusted by Industry Leaders</h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Join thousands of Global businesses who use SitePulse to uncover hidden revenue opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review, index) => (
          <div key={index} className="bg-white rounded-2xl p-8 border border-slate-200 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 relative group shadow-lg shadow-slate-200/50">
            {/* Quote Icon */}
            <div className="absolute top-6 right-8 text-slate-100 group-hover:text-blue-50 transition-colors">
              <IconQuote className="w-10 h-10" />
            </div>

            <div className="flex gap-1 mb-6">
              {[...Array(review.stars)].map((_, i) => (
                <React.Fragment key={i}>
                  <IconStar className="w-5 h-5 text-orange-400 fill-current" />
                </React.Fragment>
              ))}
            </div>

            <p className="text-slate-700 text-lg leading-relaxed mb-8 relative z-10">
              "{review.content}"
            </p>

            <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${review.color} shadow-md`}>
                {review.initials}
              </div>
              <div>
                <h4 className="text-slate-900 font-bold">{review.name}</h4>
                <div className="text-sm text-slate-500 flex flex-col">
                   <span>{review.role}, {review.company}</span>
                   <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                     <IconMapPin className="w-3 h-3" /> {review.location}
                   </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
