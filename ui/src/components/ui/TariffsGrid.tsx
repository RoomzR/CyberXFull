import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  TARIFF_ROWS,
  TARIFF_TIME_SLOTS,
  TARIFF_ZONES,
  formatTariffRate,
  type TariffZone,
} from '../../data/tariffs';

function TariffPriceCell({ zone, rowId }: { zone: TariffZone; rowId: string }) {
  const row = TARIFF_ROWS.find((item) => item.id === rowId);
  if (!row) return null;

  const { weekday, weekend } = formatTariffRate(row.rates[zone]);

  return (
    <td className="tariffs-table__cell">
      {weekend === null ? (
        <span className="tariffs-table__price tariffs-table__price--fixed">{weekday}</span>
      ) : (
        <span className="tariffs-table__price">
          <span className="tariffs-table__price-weekday">{weekday}</span>
          <span className="tariffs-table__price-sep">/</span>
          <span className="tariffs-table__price-weekend">{weekend}</span>
        </span>
      )}
    </td>
  );
}

export function TariffsGrid() {
  const { t } = useTranslation();

  return (
    <div className="tariffs-board">
      <div className="tariffs-board__legend">
        <span className="tariffs-board__legend-item">
          <span className="tariffs-board__legend-dot tariffs-board__legend-dot--weekday" />
          {t('tariffs.weekday')}
        </span>
        <span className="tariffs-board__legend-sep">/</span>
        <span className="tariffs-board__legend-item">
          <span className="tariffs-board__legend-dot tariffs-board__legend-dot--weekend" />
          {t('tariffs.weekend')}
        </span>
        <span className="tariffs-board__legend-currency">· {t('tariffs.currency')}</span>
      </div>

      <motion.div
        className="tariffs-table-wrap"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <table className="tariffs-table">
          <thead>
            <tr>
              <th className="tariffs-table__head tariffs-table__head--label" scope="col" />
              {TARIFF_ZONES.map((zone) => (
                <th key={zone} className={`tariffs-table__head${zone === 'stage' ? ' tariffs-table__head--featured' : ''}`} scope="col">
                  <span className="tariffs-table__zone">{t(`tariffs.zones.${zone}`)}</span>
                  <span className="tariffs-table__zone-hint">{t('tariffs.weekday_weekend')}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TARIFF_ROWS.map((row) => (
              <tr key={row.id} className="tariffs-table__row">
                <th className="tariffs-table__row-label" scope="row">
                  <span className="tariffs-table__row-name">{t(`tariffs.rows.${row.id}`)}</span>
                  {row.id === 'summer' && (
                    <span className="tariffs-table__row-hours">{t('tariffs.summer_hours')}</span>
                  )}
                </th>
                {TARIFF_ZONES.map((zone) => (
                  <TariffPriceCell key={`${row.id}-${zone}`} zone={zone} rowId={row.id} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div className="tariffs-slots">
        <p className="tariffs-slots__title">{t('tariffs.time_slots')}</p>
        <div className="tariffs-slots__grid">
          {TARIFF_TIME_SLOTS.map((slot) => (
            <div key={slot.id} className="tariffs-slots__item">
              <span className="tariffs-slots__name">{t(`tariffs.slots.${slot.id}`)}</span>
              <span className="tariffs-slots__hours">{slot.hours}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="tariffs-board__cta">
        <a href="#contact" className="tariffs-board__cta-link">
          <span>{t('tariffs.book')}</span>
          <ArrowRight size={14} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
}
