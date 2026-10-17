# CIA CASA STREET COMMAND PORTAL — النسخة المتصلة بـ Supabase

واجهة Roleplay خيالية بتصميم أسود/أحمر Elite. تحتوي على تسجيل/دخول، تقديم طلب، مراجعة الطلبات، قائمة الأعضاء، الرتب، المهام ورسائل الفريق. هذه النسخة تستخدم Supabase Auth وPostgres مع سياسات RLS بدلاً من تخزين البيانات محلياً.

## الملفات
- `index.html` — الصفحة الرئيسية والتسجيل والتقديم وحالة الطلب.
- `admin.html` — لوحة الإدارة (لا تفتح إلا لحساب role=admin).
- `members.html` — بوابة الأعضاء المقبولين.
- `app.js`, `portal.js` — وظائف الموقع.
- `config.js` — ضع فيه Project URL وPublishable key فقط.
- `supabase/schema.sql` — الجداول وسياسات الوصول.
- `style.css`, `portal.css`, `elite.css` — التصميم.

## الإعداد خطوة بخطوة

1. **أنشئ مشروع Supabase** من لوحة Supabase، ثم افتح SQL Editor.
2. افتح الملف `supabase/schema.sql`، انسخ محتواه إلى SQL Editor وشغّله مرة واحدة.
3. من إعدادات مشروع Supabase، افتح صفحة API Keys / Connect وخذ **Project URL** و**Publishable key** (أو مفتاح `anon` القديم إذا كان مشروعك يعرضه).
4. افتح `config.js` وبدّل `PASTE_SUPABASE_PROJECT_URL_HERE` و`PASTE_SUPABASE_PUBLISHABLE_KEY_HERE` بالقيم الحقيقية. لا تضع `service_role` أو `secret` key هنا أبداً.
5. في Supabase Authentication، راجع إعدادات تأكيد البريد. إذا كان تأكيد البريد مفعلاً، المستخدم يحتاج يؤكد البريد قبل تسجيل الدخول.
6. ارفع **محتويات المجلد** إلى جذر مستودع GitHub Pages الجديد أو المستودع الذي قررت تحديثه؛ لا ترفع ملف ZIP وحده. يجب أن يكون `index.html` في الجذر.
7. أنشئ حسابك من صفحة الموقع. بعد إنشاء الحساب، افتح Supabase SQL Editor وشغّل الأمر التالي مع بريد حسابك:

```sql
update public.profiles
set role = 'admin', status = 'approved', display_name = 'Command Admin'
where email = 'YOUR_LOGIN_EMAIL_HERE';
```

استبدل البريد بالبريد الذي سجلت به. لا تجعل حسابات الأعضاء `admin`.
8. سجّل الدخول من جديد. ينبغي أن يظهر رابط لوحة الإدارة. اختبر طلب عضو تجريبي من بريد آخر، ثم اقبل الطلب من لوحة الإدارة.

## ما الذي تتم مشاركته؟
- طلبات الانضمام، حالات القبول والرفض، الأعضاء المقبولون، الرتب، المهام ورسائل الفريق محفوظة في قاعدة Supabase المشتركة.
- التغييرات لا تظهر على الموقع المنشور حتى ترفع الملفات إلى GitHub Pages.
- رسائل الفريق يمكن تحديثها تلقائياً عبر Realtime إذا كان متاحاً ومفعّلاً في مشروعك؛ زر/تحديث الصفحة يعيد تحميل البيانات أيضاً.

## الأمان
- صلاحيات الوصول مفروضة في سياسات Row Level Security داخل قاعدة البيانات، وليس عبر إخفاء الأزرار فقط.
- لا يوجد كود إدارة ثابت مثل `1937` في النسخة المتصلة. الإدارة تُمنح لحساب محدد من SQL Editor.
- لا تنشر `service_role` أو `secret` key. المفتاح المسموح داخل `config.js` هو Publishable/anon فقط، مع RLS.
- هذه بوابة Roleplay خيالية وليست موقعاً حكومياً أو رسمياً.

## ملاحظات/استكشاف الأخطاء
- إذا ظهرت رسالة `Supabase غير مُعدّ`: راجع القيم في `config.js` واحفظها.
- إذا ظهر `relation does not exist`: شغّل `supabase/schema.sql`.
- إذا ظهر `row-level security` أو `permission denied`: تحقق من سياسات RLS ومن أن حساب الإدارة مُرقّى إلى `admin` بعد إنشاء الحساب.
- إذا كان الموقع يعمل محلياً فقط: ارفع جميع الملفات إلى GitHub Pages مع `index.html` في الجذر.
