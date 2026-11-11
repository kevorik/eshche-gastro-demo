'use strict';
const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = motionPreference.matches;
const dishes = [
 {id:'fish',category:'local',title:'Таганрогские семечки',tag:'С ЮЖНЫМ АКЦЕНТОМ',short:'Маленькая рыбка. Большая любовь.',description:'Хрустящая жареная рыбка — тот самый местный вкус, с которого хочется начать знакомство с Таганрогом. Отличный повод задержаться за столом.',image:'assets/hero-fish.png',position:'43% 50%'},
 {id:'pizza',category:'share',title:'Пицца на всех',tag:'ЕЩЁ ПО КУСОЧКУ',short:'Когда делиться — в удовольствие.',description:'Пицца в центре стола, друзья вокруг. Простая формула встречи, которой не нужен особый повод. Варианты начинок уточняйте у команды кафе.',image:'assets/pizza.png',position:'50% 50%'},
 {id:'mussels',category:'local',title:'Попкорн из мидий',tag:'ПОПРОБУЕМ?',short:'Море, хруст и ещё один разговор.',description:'Мидии в формате хрустящей закуски — ещё одна идея для знакомства с кухней. Состав и соусы подскажут в кафе.',image:'assets/evening.png',position:'61% 70%'},
 {id:'lemonade',category:'drinks',title:'Что-нибудь освежающее',tag:'ЛЁД. ЦИТРУС. ПАУЗА.',short:'Лимонад и никуда не спешить.',description:'Лимонады для дневной паузы и долгих разговоров. Актуальные вкусы и напитки из барной карты можно узнать у команды кафе.',image:'assets/hero-fish.png',position:'100% 30%'}
];
const renderMenu = (category='all') => {
 const list = category==='all' ? dishes.slice(0,3) : category==='share' ? dishes.filter(d=>['pizza','mussels'].includes(d.id)) : dishes.filter(d=>d.category===category);
 $('#menu-grid').innerHTML=list.map(d=>`<article class="food-card"><button data-dish="${d.id}" aria-label="Подробнее: ${d.title}"><div class="food-image"><img src="${d.image}" alt="Концептуальная подача: ${d.title.toLowerCase()}" width="640" height="540" loading="lazy" style="object-position:${d.position}"><span class="food-tag">${d.tag}</span><span class="food-arrow" aria-hidden="true">↗</span></div><div class="food-text"><h3>${d.title}</h3><p>${d.short}</p></div></button></article>`).join('');
};
renderMenu();
$$('[data-category]').forEach(tab=>{
 tab.addEventListener('click',()=>{
  $$('[data-category]').forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',selected);t.tabIndex=selected?0:-1;});
  $('#menu-grid').setAttribute('aria-labelledby',tab.id);renderMenu(tab.dataset.category);
 });
 tab.addEventListener('keydown',e=>{
  const tabs=$$('[data-category]');let next=tabs.indexOf(tab);
  if(e.key==='ArrowRight')next=(next+1)%tabs.length;else if(e.key==='ArrowLeft')next=(next-1+tabs.length)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;
  e.preventDefault();tabs[next].focus();tabs[next].click();
 });
});
let previousFocus=null;
function openDialog(id){
 const current=$('dialog[open]');
 if(current)current.close();
 previousFocus=document.activeElement;
 document.body.classList.add('modal-open');
 $(id).showModal();
}
$$('dialog').forEach(dialog=>{
 $('[data-close]',dialog)?.addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{if(!$('dialog[open]')){document.body.classList.remove('modal-open');previousFocus?.focus();}});
});
$('#menu-grid').addEventListener('click',e=>{
 const target=e.target.closest('[data-dish]');if(!target)return;
 const d=dishes.find(item=>item.id===target.dataset.dish);
 $('#dish-title').textContent=d.title;$('#dish-tag').textContent=d.tag;$('#dish-description').textContent=d.description;$('#dish-image').src=d.image;$('#dish-image').alt='Визуализация подачи: '+d.title;$('#dish-image').style.objectPosition=d.position;openDialog('#dish-dialog');
});
$('#full-menu').addEventListener('click',()=>openDialog('#menu-dialog'));
$('#concept-open').addEventListener('click',()=>openDialog('#concept-dialog'));
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const currentHour=()=>Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Moscow',hour:'2-digit',hourCycle:'h23'}).format(new Date()));
const dayField=$('#booking-date');dayField.min=today();dayField.value=today();
function fillTimes(){
 const old=$('#booking-time').value;
 const times=[12,13,14,15,16,17,18,19,20,21].filter(hour=>dayField.value!==today()||hour>currentHour());
 $('#booking-time').innerHTML=times.length?times.map(hour=>`<option value="${hour}:00">${hour}:00</option>`).join(''):'<option value="">Сегодня уже поздно</option>';
 if(times.includes(Number(old.split(':')[0])))$('#booking-time').value=old;else if(times.includes(19))$('#booking-time').value='19:00';
}
fillTimes();dayField.addEventListener('change',fillTimes);
$$('[data-book]').forEach(button=>button.addEventListener('click',()=>{closeMobileNav();dayField.min=today();if(dayField.value<today())dayField.value=today();fillTimes();$('#booking-step-one').hidden=false;$('#booking-step-two').hidden=true;$('#booking-error').hidden=true;openDialog('#booking-dialog');}));
$('#booking-form').addEventListener('submit',e=>{
 e.preventDefault();const date=dayField.value,time=$('#booking-time').value,guests=$('#booking-guests').value;
 if(!date||date<today()||!time||(date===today()&&Number(time.split(':')[0])<=currentHour())){$('#booking-error').textContent='Выберите будущую дату и время встречи.';$('#booking-error').hidden=false;fillTimes();return;}
 const formattedDate=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Moscow'}).format(new Date(date+'T12:00:00+03:00'));
 const guestText=guests==='8'?'8 и более гостей':guests==='1'?'1 гостя':`${guests} гостей`;
 $('#booking-message').value=`Здравствуйте! Хотим заглянуть в «Ещё… ещё…» ${formattedDate} в ${time}. Подскажите, пожалуйста, есть ли столик для ${guestText}? Будем ждать подтверждения.`;
 $('#booking-step-one').hidden=true;$('#booking-step-two').hidden=false;$('#copy-booking').focus();
});
$('#booking-back').addEventListener('click',()=>{$('#booking-step-two').hidden=true;$('#booking-step-one').hidden=false;dayField.focus();});
let toastTimer;function toast(message){clearTimeout(toastTimer);$('.toast').textContent=message;$('.toast').classList.add('visible');toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),3200);}
$('#copy-booking').addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText($('#booking-message').value);$('#copy-booking').innerHTML='Текст скопирован <span>✓</span>';setTimeout(()=>$('#copy-booking').innerHTML='Скопировать текст <span>⧉</span>',2500);}catch{const field=$('#booking-message');field.focus();field.select();$('#copy-booking').innerHTML='Выделено — скопируйте текст';setTimeout(()=>$('#copy-booking').innerHTML='Скопировать текст <span>⧉</span>',3500);}
});
const moods={evening:{title:'ЕЩЁ ОДИН<br><span>ХОРОШИЙ</span><br>ВЕЧЕР.',description:'Собраться за одним столом. Заказать что-нибудь на всех. И забыть, который час.',image:'assets/evening.png',alt:'Иллюстрация вечернего настроения: напитки и закуски при свечах',note:'Ну ещё<br>пять минуточек!'},day:{title:'ЕЩЁ ОДИН<br><span>ВКУСНЫЙ</span><br>ПЕРЕРЫВ.',description:'Погулять по городу. Заглянуть на пиццу и лимонад. Подарить себе немного южного настроения.',image:'assets/pizza.png',alt:'Визуализация: пицца в солнечном свете',note:'Хороший день<br>на вкус.'}};
$$('.mood-switch button').forEach(b=>b.addEventListener('click',()=>{
 const mood=moods[b.dataset.mood];$('.mood-section').dataset.mood=b.dataset.mood;
 $$('.mood-switch button').forEach(t=>t.setAttribute('aria-pressed',t===b));
 $('#mood-title').innerHTML=mood.title;$('#mood-description').textContent=mood.description;$('#mood-image').src=mood.image;$('#mood-image').alt=mood.alt;$('#mood-note').innerHTML=mood.note;
}));
const slides=[{image:'assets/hero-fish.png',caption:'Те самые таганрогские семечки',alt:'Концептуальная фуд-съёмка: хрустящая рыбка с лимоном'},{image:'assets/pizza.png',caption:'Разделим ещё одну пиццу?',alt:'Концептуальная фуд-съёмка: пицца с томатами и базиликом'},{image:'assets/evening.png',caption:'Для вечеров, которые хочется продлить',alt:'Иллюстрация: напитки и закуски на вечернем столе'}];let slideIndex=0;let slideTimer;
$('#next-slide').addEventListener('click',()=>{
 clearTimeout(slideTimer);slideIndex=(slideIndex+1)%slides.length;const slide=slides[slideIndex];const photo=$('#hero-photo');photo.style.opacity=paused?'1':'.35';
 slideTimer=setTimeout(()=>{photo.src=slide.image;photo.alt=slide.alt;$('#slide-caption').textContent=slide.caption;$('#slide-number').textContent=`0${slideIndex+1} / 03`;photo.style.opacity='1';},paused?0:160);
});
function closeMobileNav(){$('#mobile-nav').hidden=true;$('.mobile-toggle').setAttribute('aria-expanded','false');$('.mobile-toggle').setAttribute('aria-label','Открыть навигацию');}
$('.mobile-toggle').addEventListener('click',()=>{const isOpen=$('.mobile-toggle').getAttribute('aria-expanded')==='true';$('#mobile-nav').hidden=isOpen;$('.mobile-toggle').setAttribute('aria-expanded',!isOpen);$('.mobile-toggle').setAttribute('aria-label',isOpen?'Открыть навигацию':'Закрыть навигацию');});
$$('#mobile-nav a').forEach(a=>a.addEventListener('click',closeMobileNav));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMobileNav();});
function updateMotion(){document.documentElement.classList.toggle('motion-paused',paused);$('.motion-toggle').setAttribute('aria-pressed',paused);$('.motion-toggle').textContent=paused?'Включить анимацию':'Приостановить анимацию';}
$('.motion-toggle').addEventListener('click',()=>{paused=!paused;updateMotion();});motionPreference.addEventListener('change',e=>{paused=e.matches;updateMotion();});updateMotion();
if('IntersectionObserver'in window){document.documentElement.classList.add('js-ready');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});$$('.reveal').forEach(el=>observer.observe(el));const heroObserver=new IntersectionObserver(entries=>$('.mobile-bottom').classList.toggle('visible',!entries[0].isIntersecting),{threshold:0});heroObserver.observe($('.hero'));}
