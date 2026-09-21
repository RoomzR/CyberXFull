import { useState } from 'react';
import { Link } from 'react-router-dom';

const DEMO_TOKEN = 'cyberx-demo-gsi-token-001';

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [ok, setOk] = useState(false);
  const copy = () => {
    void navigator.clipboard.writeText(text).then(() => {
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    });
  };
  return (
    <button type="button" className="gsi-guide__copy-btn" onClick={copy}>
      {ok ? 'Скопировано ✓' : label}
    </button>
  );
}

interface SectionProps {
  num: number;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function Section({ num, title, children, defaultOpen = false }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="gsi-guide__section">
      <button type="button" className="gsi-guide__toggle" onClick={() => setOpen(v => !v)}>
        <span>
          <span className="gsi-guide__toggle-num">{num}</span>
          {title}
        </span>
        <span style={{ color: '#555', fontSize: 18 }}>{open ? '−' : '+'}</span>
      </button>
      {open && <div className="gsi-guide__body">{children}</div>}
    </div>
  );
}

interface GsiSetupGuideProps {
  compact?: boolean;
  apiHost?: string;
}

export function GsiSetupGuide({ compact, apiHost = 'http://ВАШ_IP:5006' }: GsiSetupGuideProps) {
  const gsiUrl = `${apiHost}/api/gsi/{TOKEN}`;
  const cfgPathWin = 'csgo\\cfg\\gamestate_integration_cyberx.cfg';

  return (
    <div className="gsi-guide">
      {!compact && (
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #222' }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginBottom: 6 }}>
            Полная инструкция: CS2 GSI → CyberX Live Stats
          </div>
          <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>
            Game State Integration (GSI) — официальный механизм Valve. CS2 отправляет JSON с картой,
            счётом, игроками и статистикой на ваш API. Сайт показывает live-данные в стиле HLTV.
          </div>
        </div>
      )}

      <Section num={1} title="Требования" defaultOpen={!compact}>
        <ul>
          <li><strong>CS2</strong> — dedicated server или клиент с матчем (competitive / casual / wingman)</li>
          <li><strong>CyberX API</strong> запущен и доступен с машины CS2 по сети</li>
          <li>Порт API по умолчанию: <code>5006</code> (HTTP)</li>
          <li>Аккаунт <strong>Admin</strong> для создания серверов в панели</li>
        </ul>
        <div className="gsi-guide__warn">
          GSI работает только когда CS2 запущен и идёт матч. Меню / главный экран — данных нет.
        </div>
      </Section>

      <Section num={2} title="Запуск API (разработка / клуб)" defaultOpen={compact}>
        <ol>
          <li>SQL Server с базой <code>CyberXDb</code> (см. <code>appsettings.json</code>)</li>
          <li>В папке API:
            <div className="gsi-guide__copy-row">
              <CopyBtn text="cd api/src/CyberX.WebApi && dotnet run" label="Копировать команду" />
            </div>
          </li>
          <li>API слушает <code>http://localhost:5006</code></li>
          <li>Для клуба укажите в <code>appsettings.json</code>:
            <pre style={{ marginTop: 8, padding: 12, background: '#111', borderRadius: 4, fontSize: 11, color: '#8899bb', overflow: 'auto' }}>
{`"Gsi": {
  "PublicHost": "http://192.168.1.50:5006"
}`}
            </pre>
          </li>
        </ol>
        <div className="gsi-guide__ok">
          Проверка: откройте <code>{apiHost}/api/live</code> — должен вернуть JSON (может быть пустой массив).
        </div>
      </Section>

      <Section num={3} title="Создание сервера в Admin Panel">
        <ol>
          <li>Войдите: <code>admin@cyberx.by</code> / <code>Admin123!</code></li>
          <li>Откройте <Link to="/admin-panel" style={{ color: '#ff5500' }}>/admin-panel</Link> → вкладка <strong>Серверы CS2</strong></li>
          <li>Нажмите <strong>+ Добавить сервер</strong>:
            <ul>
              <li>Название — например <code>STAGE #1</code> или <code>PC-12 CS2</code></li>
              <li>IP / Port — адрес игрового сервера (для отображения, опционально)</li>
              <li>Привязка к ПК — если сервер на конкретном месте в клубе</li>
            </ul>
          </li>
          <li>После создания — уникальный <strong>GSI Token</strong> и URL endpoint</li>
        </ol>
        <div className="gsi-guide__copy-row">
          <CopyBtn text={DEMO_TOKEN} label="Demo token (тест)" />
          <CopyBtn text={gsiUrl} label="Шаблон GSI URL" />
        </div>
      </Section>

      <Section num={4} title="Файл gamestate_integration_cyberx.cfg — имя И содержимое">
        <div className="gsi-guide__warn" style={{ marginBottom: 12 }}>
          <strong>Важно:</strong> недостаточно просто создать пустой файл с правильным именем.
          Внутри должен быть JSON-блок с URI, token и списком data-полей — CS2 читает именно содержимое.
        </div>
        <ol>
          <li><strong>Имя файла:</strong> <code>gamestate_integration_cyberx.cfg</code>
            <ul>
              <li>Обязательный префикс <code>gamestate_integration_</code> — без него CS2 игнорирует файл</li>
              <li>Суффикс <code>cyberx</code> — любой, но уникальный если несколько интеграций</li>
            </ul>
          </li>
          <li><strong>Содержимое:</strong> генерируется в Admin → Серверы → <strong>GSI cfg</strong>. Пример структуры:</li>
        </ol>
        <pre style={{ marginTop: 8, padding: 12, background: '#111', borderRadius: 4, fontSize: 10, color: '#8899bb', overflow: 'auto', lineHeight: 1.5 }}>{`"CyberX GSI Configuration"
{
    "uri" "http://192.168.1.50:5006/api/gsi/ВАШ_TOKEN"
    "timeout" "5.0"
    "auth" { "token" "ВАШ_TOKEN" }
    "data"
    {
        "map" "1"
        "allplayers_id" "1"
        "allplayers_state" "1"
        "allplayers_match_stats" "1"
        "allplayers_weapons" "1"
        ...
    }
}`}</pre>
        <ol start={3}>
          <li>В поле <strong>Public Host</strong> укажите IP API, доступный с машины CS2</li>
          <li>Скопируйте <strong>весь</strong> cfg из модального окна (кнопка «Скопировать cfg»)</li>
          <li>Сохраните в:
            <ul>
              <li>Windows: <code>{cfgPathWin}</code></li>
              <li>Steam: <code>.../Counter-Strike Global Offensive/game/csgo/cfg/</code></li>
            </ul>
          </li>
        </ol>
        <div className="gsi-guide__ok">
          URI в cfg = адрес вашего API + token. Token должен совпадать с Admin Panel. При «Новый token» — перегенерируйте cfg.
        </div>
      </Section>

      <Section num={5} title="Перезапуск CS2 и проверка">
        <ol>
          <li>Полностью закройте CS2 и запустите снова (cfg читается при старте)</li>
          <li>Зайдите в матч (не главное меню!)</li>
          <li>Откройте <Link to="/live" style={{ color: '#ff5500' }}>/live</Link> — сервер должен стать <strong>ONLINE</strong></li>
          <li>Кликните на сервер — live scoreboard с K/D/A, HS%, оружием</li>
        </ol>
        <div className="gsi-guide__ok">
          Без CS2 можно протестировать на <Link to="/gsi-test" style={{ color: '#22c55e' }}>/gsi-test</Link> — симулятор шлёт GSI на API.
        </div>
      </Section>

      <Section num={6} title="Сеть, firewall, продакшен в клубе">
        <ul>
          <li><strong>Windows Firewall</strong> — разрешите входящие на порт 5006 для API</li>
          <li>CS2 шлёт HTTP POST — сервер CS2 должен <em>видеть</em> API (исходящие запросы обычно открыты)</li>
          <li>Если API дома, а клуб отдельно — нужен VPN, проброс порта или VPS с API</li>
          <li>Рекомендация: API на мини-ПК / NUC в локальной сети клуба</li>
        </ul>
        <p>Endpoint (POST, без авторизации JWT):</p>
        <div className="gsi-guide__copy-row">
          <CopyBtn text={`POST ${gsiUrl}`} label="Копировать endpoint" />
        </div>
        <div className="gsi-guide__warn">
          Token в URL — секрет. Не публикуйте cfg в открытый доступ. При утечке: Admin → <strong>Новый token</strong>.
        </div>
      </Section>

      <Section num={7} title="Что сохраняется на сайте">
        <ul>
          <li><strong>Live</strong> — текущий матч, счёт, раунд, bomb state, scoreboard игроков (обновление ~3 сек)</li>
          <li><strong>Matches</strong> — завершённые матчи с полной статистикой (HLTV-style)</li>
          <li>Матч создаётся при старте карты, завершается при <code>gameover</code> или смене карты</li>
          <li>Данные игроков: K, D, A, MVP, Score, HS%, K/D</li>
        </ul>
      </Section>

      <Section num={8} title="Troubleshooting">
        <ul>
          <li><strong>OFFLINE на /live</strong> — нет GSI 45+ сек. Проверьте cfg, URI, firewall, что идёт матч</li>
          <li><strong>404 / unknown token</strong> — token в cfg не совпадает с Admin Panel. Сгенерируйте cfg заново</li>
          <li><strong>Connection refused</strong> — API не запущен или неверный IP:port в uri</li>
          <li><strong>Нет игроков</strong> — в cfg должны быть <code>allplayers_*</code> поля (генерируются автоматически)</li>
          <li><strong>CORS ошибки</strong> — только для браузера; CS2 GSI CORS не использует</li>
        </ul>
        <p style={{ marginTop: 10 }}>
          Лог симулятора: <Link to="/gsi-test" style={{ color: '#ff5500' }}>/gsi-test</Link>.
          Лог API: консоль <code>CyberX.WebApi</code>.
        </p>
      </Section>
    </div>
  );
}
