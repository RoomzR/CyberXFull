import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { easeCyber } from '../../lib/motion';
import type { FaqItem } from '../../types/api';

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

interface FaqAccordionItemProps {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FaqAccordionItem({ item, index, isOpen, onToggle }: FaqAccordionItemProps) {
  const indexLabel = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      custom={index}
      variants={itemVariant}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className={`faq-item${isOpen ? ' faq-item--open' : ''}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="faq-item__trigger"
      >
        <span className="faq-item__index">{indexLabel}</span>
        <span className="faq-item__question">{item.question}</span>
        <span className={`faq-item__toggle${isOpen ? ' faq-item__toggle--open' : ''}`} aria-hidden>
          <Plus size={16} strokeWidth={1.5} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.55, ease: easeCyber }}
            className="faq-item__panel"
          >
            <p className="faq-item__answer">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface FaqShowcaseProps {
  items: FaqItem[];
}

export function FaqShowcase({ items }: FaqShowcaseProps) {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);

  if (items.length === 0) return null;

  return (
    <div className="faq-showcase">
      <div className="faq-showcase__frame" aria-hidden>
        <span className="faq-showcase__corner faq-showcase__corner--tl" />
        <span className="faq-showcase__corner faq-showcase__corner--tr" />
        <span className="faq-showcase__corner faq-showcase__corner--bl" />
        <span className="faq-showcase__corner faq-showcase__corner--br" />
      </div>

      <div className="faq-showcase__list">
        {items.map((item, index) => (
          <FaqAccordionItem
            key={item.id}
            item={item}
            index={index}
            isOpen={openId === item.id}
            onToggle={() => setOpenId(openId === item.id ? null : item.id)}
          />
        ))}
      </div>
    </div>
  );
}
