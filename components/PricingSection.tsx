
import React from 'react';
import { IconCheck, IconStar, IconLock } from './Icons';

export const PricingSection: React.FC = () => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/mo',
      description: 'Essential audit for personal projects',
      features: ['Basic SEO Audit', 'Performance Overview', '5 Audits/month', 'Community Support'],
      active: true,
      buttonText: 'Current Plan',
      primary: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/mo',
      description: 'Deep insights for growing businesses',
      features: ['Advanced Code Analysis', 'Competitor Comparison', 'Real-time Monitoring', 'Priority Support', 'Unlimited Audits', 'PDF Reports'],
      active: false,
      buttonText: 'Upgrade to Pro',
      primary: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large scale organizations',
      features: ['API Access', 'Custom Integration', 'Dedicated Account Manager', 'SLA Support', 'Team Collaboration'],
      active: false,
      buttonText: 'Contact Sales',
      primary: false
    }
  ];

  return (
    <div className="py-24 w-full max-w-6xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-slate-600 max-w-xl mx-auto text-lg">Start optimizing for free, upgrade as you grow. No hidden fees. Cancel anytime.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {plans.map((plan, index) => (
          <div 
            key={index} 
            className={`relative rounded-2xl p-8 border transition-all duration-300 flex flex-col h-full ${
              plan.primary 
                ? 'bg-white border-primary shadow-glow scale-105 z-10 ring-1 ring-primary/20' 
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md'
            }`}
          >
            {plan.primary && (
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                 Most Popular
               </div>
            )}
            
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 font-medium">{plan.period}</span>
              </div>
              <p className="text-slate-500 text-sm mt-3 leading-relaxed">{plan.description}</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-full p-0.5 ${plan.primary ? 'bg-blue-100 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                    <IconCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-slate-600 text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                plan.active
                  ? 'bg-slate-100 text-slate-500 cursor-default border border-slate-200'
                  : plan.primary
                    ? 'bg-primary hover:bg-primaryDark text-white shadow-lg shadow-blue-500/30'
                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'
              }`}
            >
              {plan.active ? 'Current Plan' : plan.buttonText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
