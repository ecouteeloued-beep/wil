-- ملف إدارة حسابات لوحة التحكم
-- الاستخدام: نفّذ هذا الملف من Supabase SQL Editor بعد إنشاء المستخدمين من Authentication > Users.
-- مهم: استبدل كل UUID وبيانات المثال قبل التنفيذ.
-- كلمة المرور لا تُحفظ هنا؛ تُدار حصراً بواسطة Supabase Auth.

begin;

-- تحقق اختياري: يجب أن يكون UUID موجوداً في auth.users قبل إدخاله هنا.
-- select id, email, created_at from auth.users order by created_at desc limit 20;

-- إنشاء/تحديث ملف المدير التقني.
insert into public.users (id, name, email, role, department, phone, is_active)
values (
  'ضع-UUID-حساب-SUPER-ADMIN-هنا'::uuid,
  'مسؤول النظام',
  'admin@example.gov.dz',
  'super_admin',
  'مديرية الرقمنة وعصرنة الإدارة',
  '0550000000',
  true
)
on conflict (id) do update set
  name = excluded.name,
  email = excluded.email,
  role = excluded.role,
  department = excluded.department,
  phone = excluded.phone,
  is_active = excluded.is_active;

-- إنشاء/تحديث ملف الوالي.
-- احذف التعليق عن هذا الجزء بعد استبدال UUID والبيانات.
-- insert into public.users (id, name, email, role, department, phone, is_active)
-- values (
--   'ضع-UUID-حساب-WALI-هنا'::uuid,
--   'والي الولاية',
--   'wali@example.gov.dz',
--   'wali',
--   'ديوان والي ولاية الوادي',
--   '0550000001',
--   true
-- )
-- on conflict (id) do update set
--   name = excluded.name,
--   email = excluded.email,
--   role = excluded.role,
--   department = excluded.department,
--   phone = excluded.phone,
--   is_active = excluded.is_active;

-- إنشاء/تحديث ملف موظف معالجة.
-- insert into public.users (id, name, email, role, department, phone, is_active)
-- values (
--   'ضع-UUID-حساب-EMPLOYEE-هنا'::uuid,
--   'اسم الموظف',
--   'employee@example.gov.dz',
--   'employee',
--   'مصلحة معالجة الشكاوى',
--   '0550000002',
--   true
-- )
-- on conflict (id) do update set
--   name = excluded.name,
--   email = excluded.email,
--   role = excluded.role,
--   department = excluded.department,
--   phone = excluded.phone,
--   is_active = excluded.is_active;

commit;

-- تحقق بعد التنفيذ.
select id, name, email, role, department, is_active
from public.users
order by created_at desc
limit 50;
