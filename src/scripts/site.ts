const API_BASE = '/api';
const applyRussianTypography = (root: Node = document.body) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (parent && !['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'OPTION'].includes(parent.tagName)) nodes.push(node);
  }
  nodes.forEach(node => {
    node.data = node.data.replace(/(^|[\s(«„])([АВИКОСУавикосу])\s+(?=[А-Яа-яЁё0-9])/g, '$1$2\u00a0');
  });
};
applyRussianTypography();
const dialog = document.querySelector<HTMLDialogElement>('#brief-dialog');
const form = document.querySelector<HTMLFormElement>('#brief-form');
const steps = [...document.querySelectorAll<HTMLElement>('.brief-step')];
const progress = document.querySelector<HTMLElement>('[data-progress]');
const previous = document.querySelector<HTMLButtonElement>('[data-prev]');
const next = document.querySelector<HTMLButtonElement>('[data-next]');
const submit = document.querySelector<HTMLButtonElement>('[data-submit]');
const errorBox = document.querySelector<HTMLElement>('[data-error]');
const paymentButton = document.querySelector<HTMLButtonElement>('[data-payment-button]');
const paymentError = document.querySelector<HTMLElement>('[data-payment-error]');
let currentStep = 0;

const randomId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const visitorId = localStorage.getItem('professorit_visitor_id') || randomId();
localStorage.setItem('professorit_visitor_id', visitorId);
const params = new URLSearchParams(location.search);
const incomingLeadMagnetToken = params.get('lead_magnet_token') || '';
const storedLeadMagnetToken = localStorage.getItem('professorit_lead_magnet_token') || '';
const leadMagnetToken = /^[A-Za-z0-9_-]{12,64}$/.test(incomingLeadMagnetToken)
  ? incomingLeadMagnetToken
  : (/^[A-Za-z0-9_-]{12,64}$/.test(storedLeadMagnetToken) ? storedLeadMagnetToken : '');
if (leadMagnetToken && leadMagnetToken === incomingLeadMagnetToken) {
  localStorage.setItem('professorit_lead_magnet_token', leadMagnetToken);
}
const landingPageUrl = () => {
  const url = new URL(location.href);
  if (leadMagnetToken && !url.searchParams.has('lead_magnet_token')) {
    url.searchParams.set('lead_magnet_token', leadMagnetToken);
  }
  return url.toString();
};
const attributionEntries = ['utm_source','utm_medium','utm_campaign','utm_content','campaign_id']
  .map(key => [key, params.get(key) || localStorage.getItem(`professorit_${key}`)] as const)
  .filter((entry): entry is readonly [string, string] => Boolean(entry[1]));
const attribution: Record<string, string | number> = Object.fromEntries(
  attributionEntries.map(([key,value]) => [key, key === 'campaign_id' ? Number(value) : value]),
);
if (typeof attribution.campaign_id === 'number' && (!Number.isInteger(attribution.campaign_id) || attribution.campaign_id < 1)) delete attribution.campaign_id;
attributionEntries.forEach(([key,value]) => localStorage.setItem(`professorit_${key}`, value));

const metricaId = Number(document.documentElement.dataset.metricaId || 0);
const getMetricaClientId = () => new Promise<string | null>(resolve => {
  const ym = (window as Window & {ym?: (...args: unknown[]) => void}).ym;
  if (!ym || !metricaId) return resolve(null);
  let done = false; const finish = (value: string | null) => {if (!done) {done = true; resolve(value);}};
  ym(metricaId, 'getClientID', (id: string) => finish(id)); setTimeout(() => finish(null), 800);
});

async function track(eventType: string, meta: Record<string, unknown> = {}, briefToken?: string) {
  const payload = {event_id: randomId(), event_type: eventType, visitor_id: visitorId, brief_token: briefToken, path: location.pathname, ...attribution, metrica_client_id: await getMetricaClientId(), meta};
  fetch(`${API_BASE}/public/events`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),keepalive:true}).catch(()=>{});
  const ym = (window as Window & {ym?: (...args: unknown[]) => void}).ym;
  if (ym && metricaId) ym(metricaId, 'reachGoal', eventType, meta);
}

function showStep(index: number) {currentStep=index;steps.forEach((step,i)=>step.classList.toggle('active',i===index));if(progress)progress.style.width=`${((index+1)/steps.length)*100}%`;if(previous)previous.hidden=index===0;if(next)next.hidden=index===steps.length-1;if(submit)submit.hidden=index!==steps.length-1;errorBox!.textContent='';}
function validateStep() {return [...steps[currentStep].querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('input,select,textarea')].every(field=>field.reportValidity());}
function openBrief(persona?:string){dialog?.showModal();document.body.style.overflow='hidden';if(persona){const radio=form?.querySelector<HTMLInputElement>(`input[name="persona"][value="${persona}"]`);if(radio)radio.checked=true;}showStep(0);track('brief_started',{persona:persona||null});}
document.querySelectorAll<HTMLElement>('[data-open-brief]').forEach(el=>el.addEventListener('click',()=>openBrief()));
document.querySelectorAll<HTMLElement>('[data-select-persona]').forEach(el=>el.addEventListener('click',()=>{const persona=el.dataset.selectPersona;track('persona_selected',{persona});openBrief(persona);}));
const requestedPersona=params.get('persona');
if(params.get('checkout')==='1'){
  const validPersona=requestedPersona&&form?.querySelector(`input[name="persona"][value="${requestedPersona}"]`)?requestedPersona:undefined;
  setTimeout(()=>openBrief(validPersona),180);
}
document.querySelector('[data-close]')?.addEventListener('click',()=>dialog?.close());dialog?.addEventListener('close',()=>document.body.style.overflow='');
next?.addEventListener('click',()=>{if(!validateStep())return;track('brief_step_completed',{step:currentStep+1});showStep(currentStep+1);});previous?.addEventListener('click',()=>showStep(Math.max(0,currentStep-1)));
form?.addEventListener('submit',async event=>{event.preventDefault();if(!validateStep())return;submit!.disabled=true;errorBox!.textContent='';const data=Object.fromEntries(new FormData(form).entries());const idempotencyKey=localStorage.getItem('professorit_checkout_key')||`checkout:${randomId()}`;localStorage.setItem('professorit_checkout_key',idempotencyKey);try{track('checkout_started',{persona:data.persona});const response=await fetch(`${API_BASE}/public/briefs`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify({...data,consent:data.consent==='on',desired_format:'test_drive',visitor_id:visitorId,landing_page:landingPageUrl(),referrer:document.referrer,...attribution,metrica_client_id:await getMetricaClientId()})});const result=await response.json();if(!response.ok){const validation=Array.isArray(result.detail)?result.detail.map((item:{msg?:string})=>item.msg).filter(Boolean).join('; '):null;throw new Error(result.detail?.message||validation||`Не удалось отправить заявку (${response.status})`);}localStorage.setItem('professorit_enrollment_token',result.enrollment_token);track('brief_submitted',{persona:data.persona,price:1000},result.enrollment_token);form.hidden=true;document.querySelector<HTMLElement>('[data-success]')!.hidden=false;localStorage.removeItem('professorit_checkout_key');}catch(error){errorBox!.textContent=error instanceof Error?error.message:'Ошибка отправки';submit!.disabled=false;}});
paymentButton?.addEventListener('click',async()=>{const token=localStorage.getItem('professorit_enrollment_token');if(!token){if(paymentError)paymentError.textContent='Не найден номер заявки. Заполните форму ещё раз.';return;}paymentButton.disabled=true;if(paymentError)paymentError.textContent='';try{const response=await fetch(`${API_BASE}/public/test-drive/${encodeURIComponent(token)}/payment-link`,{method:'POST'});const result=await response.json();if(!response.ok)throw new Error(result.detail?.message||'Не удалось открыть оплату');if(result.already_paid){location.assign(`/payment/success/?enrollment=${encodeURIComponent(token)}`);return;}if(!result.payment_url)throw new Error('Платёжная ссылка пока недоступна');track('checkout_started',{provider:'prodamus',price:1000},token);location.assign(result.payment_url);}catch(error){if(paymentError)paymentError.textContent=error instanceof Error?error.message:'Ошибка открытия оплаты';paymentButton.disabled=false;}});
document.querySelectorAll<HTMLAnchorElement>('[data-contact-channel]').forEach(link=>link.addEventListener('click',()=>track('checkout_contact_channel_clicked',{channel:link.dataset.contactChannel||'unknown',persona:form?.querySelector<HTMLInputElement>('input[name="persona"]:checked')?.value||null},localStorage.getItem('professorit_enrollment_token')||undefined)));
const revealTargets=[...document.querySelectorAll<HTMLElement>('.reveal, .contrast article, .journey-stop, .persona-card, .drive-steps li, .faq details, .mentor-facts span')];
revealTargets.forEach((element,index)=>{element.classList.add('reveal-item');element.style.setProperty('--reveal-delay',`${Math.min(index%6,5)*85}ms`);});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('visible');observer.unobserve(entry.target);}),{threshold:.1,rootMargin:'0px 0px -7%'});
revealTargets.forEach(element=>observer.observe(element));
const roadmapDataElement=document.querySelector<HTMLScriptElement>('[data-roadmap-data]');
const roadmapDetail=document.querySelector<HTMLElement>('[data-roadmap-detail]');
if(roadmapDataElement&&roadmapDetail){const roadmapData=JSON.parse(roadmapDataElement.textContent||'[]') as Array<{number:string;title:string;text:string;result:string}>;document.querySelectorAll<HTMLButtonElement>('[data-roadmap-step]').forEach(button=>button.addEventListener('click',()=>{const index=Number(button.dataset.roadmapStep);const item=roadmapData[index];if(!item)return;document.querySelectorAll<HTMLButtonElement>('[data-roadmap-step]').forEach(node=>{const active=node===button;node.classList.toggle('active',active);node.setAttribute('aria-pressed',String(active));});roadmapDetail.innerHTML=`<div class="journey-detail-index"><span>${item.number}</span><small>ЭТАП МАРШРУТА</small></div><div class="journey-detail-copy"><h3>${item.title}</h3><p>${item.text}</p></div><div class="journey-detail-result"><small>РЕЗУЛЬТАТ ЭТАПА</small><strong>${item.result}</strong></div>`;applyRussianTypography(roadmapDetail);}));}
track('landing_view');
