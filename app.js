(() => {
  const $ = s => document.querySelector(s);
  const cfg = window.CIA_CONFIG || {};
  const configured = cfg.SUPABASE_URL && cfg.SUPABASE_PUBLISHABLE_KEY && !cfg.SUPABASE_URL.includes('PASTE_') && !cfg.SUPABASE_PUBLISHABLE_KEY.includes('PASTE_');
  const client = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY) : null;
  const say = (id, msg, good=false) => { const el=$(id); if(el){el.textContent=msg;el.className='message '+(good?'good':'bad');} };
  const toast = msg => {const el=$('#toast'); if(el){el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),3500)}};
  if(!client){$('#connectionState').textContent='Supabase غير مُعدّ';say('#authMessage','أولاً ضع رابط Supabase والمفتاح العام في config.js، ثم نفّذ supabase/schema.sql.');}
  else {$('#connectionState').textContent='Supabase configured'; refreshAccount();}

  $('#authForm')?.addEventListener('submit', async e=>{
    e.preventDefault(); if(!client)return say('#authMessage','أكمل إعداد Supabase أولاً.');
    const email=$('#authEmail').value.trim(), password=$('#authPassword').value;
    const {error}=await client.auth.signInWithPassword({email,password});
    if(error)return say('#authMessage',error.message);
    say('#authMessage','تم تسجيل الدخول بنجاح.',true); await refreshAccount();
  });
  $('#signUpBtn')?.addEventListener('click', async()=>{
    if(!client)return say('#authMessage','أكمل إعداد Supabase أولاً.');
    const email=$('#authEmail').value.trim(), password=$('#authPassword').value;
    if(!email || password.length<8)return say('#authMessage','أدخل البريد الإلكتروني وكلمة مرور من 8 أحرف على الأقل.');
    const {data,error}=await client.auth.signUp({email,password});
    if(error)return say('#authMessage',error.message);
    say('#authMessage',data.session?'تم إنشاء الحساب. يمكنك الآن تقديم طلبك.':'تم إنشاء الحساب. افحص بريدك لتأكيده، ثم سجّل الدخول.',true); await refreshAccount();
  });
  $('#applicationForm')?.addEventListener('submit',async e=>{
    e.preventDefault(); if(!client)return say('#applicationMessage','أكمل إعداد Supabase أولاً.');
    const {data:{user}}=await client.auth.getUser(); if(!user)return say('#applicationMessage','خاصك تسجّل الدخول قبل إرسال الطلب.');
    const payload={user_id:user.id,display_name:$('#appName').value.trim(),discord_name:$('#appDiscord').value.trim(),age:Number($('#appAge').value),availability:$('#appHours').value.trim(),skills:$('#appSkills').value.trim(),reason:$('#appReason').value.trim(),status:'pending'};
    const {error}=await client.from('applications').insert(payload);
    if(error)return say('#applicationMessage',error.code==='23505'?'عندك طلب سابق. انتظر قرار الإدارة.':error.message);
    await client.from('profiles').update({display_name:payload.display_name}).eq('id',user.id);
    $('#applicationForm').reset(); say('#applicationMessage','تسيفط الطلب بنجاح. غادي تراجعو الإدارة.',true); await refreshAccount();
  });
  $('#logoutBtn')?.addEventListener('click',async()=>{if(client)await client.auth.signOut();await refreshAccount();toast('تم تسجيل الخروج');});
  async function refreshAccount(){
    const box=$('#accountState'); if(!client){if(box)box.textContent='Supabase غير مُعدّ بعد.';return;}
    const {data:{user}}=await client.auth.getUser();
    if(!user){if(box)box.textContent='سجّل الدخول لعرض حالة حسابك وإرسال طلب الانضمام.';return;}
    const {data:profile}=await client.from('profiles').select('display_name,role,status').eq('id',user.id).maybeSingle();
    const {data:apps}=await client.from('applications').select('status,created_at').eq('user_id',user.id).order('created_at',{ascending:false}).limit(1);
    const status=profile?.status||'pending'; const labels={pending:'قيد المراجعة',approved:'مقبول',rejected:'مرفوض'};
    if(box){box.innerHTML=`<b>${esc(profile?.display_name||user.email)}</b><p>الحالة: <span class="${status==='approved'?'good':status==='rejected'?'bad':''}">${labels[status]||status}</span></p><p>البريد: ${esc(user.email)}</p>${profile?.role==='admin'?'<p><a class="btn danger" href="admin.html">فتح لوحة الإدارة ↗</a></p>':''}${status==='approved'?'<p><a class="btn primary" href="members.html">دخول بوابة الأعضاء ↗</a></p>':''}${apps?.length?`<p class="small-note">آخر طلب: ${new Date(apps[0].created_at).toLocaleString()}</p>`:''}`;}
  }
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  // Minimal language switch for the main navigation and core headings.
  const translations={en:{nav:['Home','Access','About'],hero:['Command Center','and Covert Operations'],enter:'Enter Portal',learn:'Explore Division',section:'Access Portal',desc:'Create an account or sign in. Internal access requires administrator approval.'},es:{nav:['Inicio','Acceso','Acerca de'],hero:['Centro de mando','y operaciones'],enter:'Entrar al portal',learn:'Explorar división',section:'Portal de acceso',desc:'Crea una cuenta o inicia sesión. El acceso interno requiere aprobación.'}};
  $('#language')?.addEventListener('change',e=>{const lang=e.target.value;document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';if(lang==='ar'){location.reload();return;}const t=translations[lang];if(!t)return;const nav=$('.topbar nav');if(nav)nav.querySelectorAll('a').forEach((a,i)=>a.textContent=t.nav[i]);const h=$('.hero h1');if(h)h.innerHTML=`${t.hero[0]}<br><em>${t.hero[1]}</em>`;const buttons=$('.hero-actions');if(buttons){buttons.querySelectorAll('a')[0].textContent=t.enter;buttons.querySelectorAll('a')[1].textContent=t.learn;}const sh=$('.section-heading');if(sh){sh.querySelector('h2').textContent=t.section;sh.querySelector('p').textContent=t.desc;}});
})();
