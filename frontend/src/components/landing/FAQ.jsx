import { useRef, useState, useCallback, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from '../../hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

function FAQItem({ item, index, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const itemRef = useRef(null);
  const wasOpenRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  // Animate close when isOpen transitions from true -> false
  // (happens when a different item is opened)
  useEffect(() => {
    if (wasOpenRef.current && !isOpen) {
      // Was open, now closed by parent — animate the close
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: prefersReducedMotion ? 0 : 0.35,
        ease: 'power3.inOut',
      });
      gsap.to(itemRef.current?.querySelector('.faq-chevron'), {
        rotation: 0,
        duration: prefersReducedMotion ? 0 : 0.25,
        ease: 'power2.out'
      });
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, prefersReducedMotion]);

  const handleClick = () => {
    if (isOpen) {
      // Clicking the currently open item — close it
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: prefersReducedMotion ? 0 : 0.4,
        ease: 'power3.inOut',
      });
      gsap.to(itemRef.current.querySelector('.faq-chevron'), {
        rotation: 0,
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'power2.out'
      });
    } else {
      // Opening this item
      gsap.set(contentRef.current, { height: 'auto' });
      const fullHeight = contentRef.current.scrollHeight;
      gsap.fromTo(contentRef.current,
        { height: 0, opacity: 0 },
        { height: fullHeight, opacity: 1, duration: prefersReducedMotion ? 0 : 0.5, ease: 'power3.out' }
      );
      gsap.to(itemRef.current.querySelector('.faq-chevron'), {
        rotation: 180,
        duration: prefersReducedMotion ? 0 : 0.3,
        ease: 'back.out(1.7)'
      });
    }
    onToggle(index);
  };

  return (
    <div ref={itemRef} className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
      <button className="faq-question" onClick={handleClick}>
        <span className="faq-question-index">0{index + 1}</span>
        <span className="faq-question-text">{item.question}</span>
        <ChevronDown size={20} className="faq-chevron" />
      </button>
      <div ref={contentRef} className="faq-answer" style={{ height: 0, opacity: 0, overflow: 'hidden' }}>
        <p className="faq-answer-text">{item.answer}</p>
      </div>
    </div>
  );
}

export default function FAQ() {
  const sectionRef = useRef(null);
  const [openIndex, setOpenIndex] = useState(-1);
  const prefersReducedMotion = useReducedMotion();
  const { t } = useTranslation(['landing']);

  const faqItems = t('landing:faq.items', { returnObjects: true });

  const handleToggle = useCallback((index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  }, []);

  useGSAP(() => {
    if (prefersReducedMotion) return;

    // Section heading reveal
    gsap.fromTo('.faq-heading-word',
      { y: 60, opacity: 0, rotateX: -30 },
      {
        y: 0, opacity: 1, rotateX: 0,
        duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );

    // FAQ items stagger in
    gsap.fromTo('.faq-item',
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.6, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.faq-list',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }, { scope: sectionRef, dependencies: [prefersReducedMotion] });

  const headingWords = t('landing:faq.title').split(" ");

  return (
    <section ref={sectionRef} id="faq" className="faq-section">
      <div className="faq-container">
        <h2 className="faq-heading">
          {headingWords.map((word, i) => (
            <span key={i} className="faq-heading-word">
              <span className={i === 2 ? 'faq-heading-accent' : 'faq-heading-default'}>
                {word}
              </span>
              {i < headingWords.length - 1 ? '\u00A0' : ''}
            </span>
          ))}
        </h2>
        
        <div className="faq-list">
          {faqItems.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
