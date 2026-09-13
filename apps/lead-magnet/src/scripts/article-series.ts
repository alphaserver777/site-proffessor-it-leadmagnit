export {};

type Attribution = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  campaign_id: number | null;
};

const API_BASE = '/api';
const main = document.querySelector<HTMLElement>('[data-longread-part]');
const part = Number(main?.dataset.longreadPart || 1);
const partCount = Number(main?.dataset.longreadParts || 4);
const params = new URLSearchParams(location.search);
const incomingLeadMagnetToken = params.get('lead_magnet_token') || '';
const storedLeadMagnetToken = localStorage.getItem('professorit_lead_magnet_token') || '';
const leadMagnetToken = /^[A-Za-z0-9_-]{12,64}$/.test(incomingLeadMagnetToken)
  ? incomingLeadMagnetToken
  : (/^[A-Za-z0-9_-]{12,64}$/.test(storedLeadMagnetToken) ? storedLeadMagnetToken : '');
if (leadMagnetToken && leadMagnetToken === incomingLeadMagnetToken) {
  localStorage.setItem('professorit_lead_magnet_token', leadMagnetToken);
}
const randomId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const visitorId = localStorage.getItem('professorit_visitor_id') || randomId();
localStorage.setItem('professorit_visitor_id', visitorId);

// A session belongs to this browser tab. Never trust a sid from the URL:
// shared links would otherwise merge different readers into one journey.
const sid = sessionStorage.getItem('professorit_longread_sid') || randomId();
sessionStorage.setItem('professorit_longread_sid', sid);

const firstTouchValue = (key: string) => {
  const stored = localStorage.getItem(`professorit_${key}`);
  const incoming = params.get(key);
  if (!stored && incoming) localStorage.setItem(`professorit_${key}`, incoming);
  return stored || incoming || '';
};
const campaignIdRaw = firstTouchValue('campaign_id');
const attribution: Attribution = {
  utm_source: firstTouchValue('utm_source'),
  utm_medium: firstTouchValue('utm_medium'),
  utm_campaign: firstTouchValue('utm_campaign'),
  utm_content: firstTouchValue('utm_content'),
  campaign_id: /^\d+$/.test(campaignIdRaw) ? Number(campaignIdRaw) : null,
};

const sentKey = (eventType: string, suffix = '') => `professorit_event:${sid}:${part}:${eventType}:${suffix}`;
async function track(eventType: string, meta: Record<string, unknown> = {}, suffix = '') {
  const key = sentKey(eventType, suffix);
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, '1');
  const payload = {
    event_id: `lr:${sid}:${part}:${eventType}:${suffix}`.slice(0, 80),
    event_type: eventType,
    visitor_id: visitorId,
    path: location.pathname,
    ...attribution,
    meta: {series: 'it-entry-map-2026', sid, part, part_count: partCount, ...meta},
  };
  try {
    const response = await fetch(`${API_BASE}/public/events`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!response.ok) sessionStorage.removeItem(key);
  } catch {
    sessionStorage.removeItem(key);
  }
}

const bar = document.querySelector<HTMLElement>('[data-series-progress]');
const thresholds = [25, 50, 75, 100];
const update = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const progress = max > 0 ? Math.min(100, Math.round(scrollY / max * 100)) : 100;
  if (bar) bar.style.width = `${progress}%`;
  thresholds.forEach(threshold => {
    if (progress >= threshold) track(`longread_${threshold}`, {depth_percent: threshold});
  });
  if (progress >= 90) track('longread_part_completed', {part});
  if (part === partCount && progress >= 90) track('longread_completed', {part_count: partCount});
};
addEventListener('scroll', update, {passive: true});
update();

document.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(link => {
  try {
    const url = new URL(link.href);
    if (url.origin === location.origin) {
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'campaign_id'].forEach(key => {
        const value = params.get(key) || localStorage.getItem(`professorit_${key}`);
        if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
      });
      if (leadMagnetToken && !url.searchParams.has('lead_magnet_token')) {
        url.searchParams.set('lead_magnet_token', leadMagnetToken);
      }
      link.href = url.toString();
    }
  } catch {/* Ignore non-HTTP links. */}

  link.addEventListener('click', () => {
    if (link.matches('[data-longread-next], .series-next a, .series-pagination a')) {
      track('longread_next_clicked', {from_part: part, href: link.pathname}, link.pathname);
    }
    if (link.matches('[data-longread-cta], .series-header-cta, .offer-button')) {
      const placement = link.dataset.placement || (link.className || 'cta').toString();
      track('longread_cta_clicked', {part, placement, href: link.href}, `${placement}:${link.pathname}`);
    }
  });
});

document.querySelectorAll<HTMLElement>('[data-profession], .profession-card').forEach(card => {
  card.addEventListener('click', () => {
    const profession = card.dataset.profession || (card.classList.contains('devops') ? 'devops' : card.classList.contains('security') ? 'security' : card.classList.contains('pentest') ? 'hacker' : 'unknown');
    track('profession_interest_clicked', {part, profession}, profession);
  });
});

track('longread_view', {part, title: document.title});

let visibleSeconds = 0;
const engagementThresholds = [15, 30, 60, 120];
setInterval(() => {
  if (document.visibilityState !== 'visible') return;
  visibleSeconds += 1;
  engagementThresholds.forEach(seconds => {
    if (visibleSeconds >= seconds) track('longread_engaged', {part, engaged_seconds: seconds}, String(seconds));
  });
}, 1000);
