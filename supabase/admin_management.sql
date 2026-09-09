-- ملف تعديل حسابات وصلاحيات لوحة التحكم
-- نفّذ الأوامر المطلوبة فقط بعد استبدال UUID والقيم بين الأقواس.
-- لا يحتوي هذا الملف على كلمات مرور؛ كلمات المرور تُدار من Supabase Auth.

-- ============================================================
-- 1) عرض الحسابات الإدارية الحالية
-- ============================================================
select id, name, email, role, department, is_active
from public.users
order by created_at desc
limit 100;

-- ============================================================
-- 2) تعديل دور مستخدم
-- الأدوار المدعومة: wali, super_admin, supervisor,
-- head_department, employee
-- ============================================================
update public.users
set role = 'employee',
    department = 'مصلحة معالجة الشكاوى',
    is_active = true
where id = 'ضع-UUID-المستخدم-هنا'::uuid;

-- ============================================================
-- 3) تفعيل أو تعطيل حساب
-- التعطيل يمنع تسجيل الدخول من خلال RLS.
-- ============================================================
update public.users
set is_active = false
where id = 'ضع-UUID-المستخدم-هنا'::uuid;

-- لإعادة التفعيل:
-- update public.users
-- set is_active = true
-- where id = 'ضع-UUID-المستخدم-هنا'::uuid;

-- ============================================================
-- 4) تغيير اسم أو مصلحة أو هاتف مستخدم
-- ============================================================
update public.users
set name = 'الاسم الجديد',
    department = 'المصلحة الجديدة',
    phone = '0550000000'
where id = 'ضع-UUID-المستخدم-هنا'::uuid;

-- ============================================================
-- 5) إسناد شكوى إلى موظف موثق
-- استبدل رقم التتبع وUUID الموظف.
-- ============================================================
update public.complaints
set assigned_user_id = 'ضع-UUID-الموظف-هنا'::uuid,
    assigned_department = 'مصلحة معالجة الشكاوى',
    status = 'تم التوجيه',
    updated_at = timezone('utc'::text, now())
where tracking_id = 'WL-2026-000000';

-- ============================================================
-- 6) تحديث حالة شكوى وإضافة رد رسمي
-- ============================================================
update public.complaints
set status = 'تم الرد',
    official_response = jsonb_build_object(
      'text', 'اكتب الرد الرسمي هنا',
      'preparedAt', timezone('utc'::text, now()),
      'approved', false
    ),
    updated_at = timezone('utc'::text, now())
where tracking_id = 'WL-2026-000000';

-- ============================================================
-- 7) استعلامات تحقق محدودة
-- ============================================================
select id, name, email, role, department, is_active
from public.users
where id = 'ضع-UUID-المستخدم-هنا'::uuid
limit 1;

select tracking_id, status, assigned_user_id, assigned_department, updated_at
from public.complaints
where tracking_id = 'WL-2026-000000'
limit 1;
