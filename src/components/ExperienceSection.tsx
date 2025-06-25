import React from 'react';
import { MapPin, Calendar, CheckCircle, GraduationCap, Award } from 'lucide-react';
import { experienceData, educationData, certificationData } from '../data/portfolioData';
// import type { Experience } from '../types';

interface ExperienceSectionProps {
    reference: React.RefObject<HTMLElement | null>;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ reference }) => {
  return (
    <section ref={reference} id="experience" className="py-20 bg-app px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4 font-montserrat">
            Experience & Education
          </h2>
          <p className="text-xl text-secondary font-actor">
            Building expertise through hands-on experience and continuous learning
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {/* Professional Experience Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-main font-roboto mb-6">
              Professional Experience
            </h3>
            {experienceData.map((exp, index) => (
              <div key={index} className="bg-surface rounded-xl p-6 shadow-light-md border border-soft hover:border-primary transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-main font-roboto">{exp.title}</h4>
                    <p className="text-primary font-semibold font-actor">{exp.company}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-secondary font-actor mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {exp.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {exp.period}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold font-actor ${
                    exp.type === 'Internship' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'
                  }`}>
                    {exp.type}
                  </span>
                </div>
                <ul className="space-y-2">
                  {exp.achievements.map((achievement, achievementIndex) => (
                    <li key={achievementIndex} className="flex items-start gap-2 text-secondary font-actor">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Education & Certifications Section */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-main font-roboto mb-6">
              Education & Certifications
            </h3>
            {/* Education Card */}
            <div className="bg-surface rounded-xl p-6 shadow-light-md border border-soft hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <GraduationCap className="w-6 h-6 text-primary" />
                <h4 className="text-lg font-semibold text-main font-roboto">
                  {educationData.degree}
                </h4>
              </div>
              <p className="text-secondary font-actor mb-2">
                Specialization: {educationData.specialization}
              </p>
              <p className="text-primary font-semibold font-actor mb-1">
                {educationData.institution}
              </p>
              <p className="text-sm text-muted font-actor">{educationData.period}</p>
            </div>
            {/* Recent Certifications Card */}
            <div className="bg-surface rounded-xl p-6 shadow-light-md border border-soft hover:border-primary transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <Award className="w-6 h-6 text-primary" />
                <h4 className="text-lg font-semibold text-main font-roboto">
                  Recent Certifications
                </h4>
              </div>
              <ul className="space-y-3">
                {certificationData.map((cert, index) => (
                  <li key={index} className="flex items-start gap-2 text-secondary font-actor">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
