import React from 'react';
import { skillCategoriesData } from '../data/portfolioData';

interface SkillsSectionProps {
  reference: React.RefObject<HTMLElement | null>;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ reference }) => {

  return (
    <section ref={reference} id="skills" className="py-12 md:py-24 bg-app text-main font-actor transition-colors duration-500">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10 md:mb-14 font-montserrat text-primary">
          Technical Skills & Expertise
        </h2>
        <p className="text-xl text-secondary/80 text-center mb-12 font-actor">
          Cutting-edge technologies for modern AI solutions
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillCategoriesData.map((category) => (
            <div key={category.name} className="bg-surface rounded-xl p-8 shadow-light-md border border-soft">
              <h3 className="text-xl font-semibold text-secondary mb-6 font-roboto">{category.name}</h3>
              <div className="space-y-4">
                {category.skills.map((skill, index) => {
                  const IconComponent = skill.icon;
                  return (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {IconComponent && <IconComponent className="w-5 h-5 text-primary" />}
                        <span className="font-actor text-secondary/90">{skill.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-app rounded-full overflow-hidden border border-soft">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-muted font-actor w-8">{skill.level}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillsSection;