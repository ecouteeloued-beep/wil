begin;

-- Keep custom staff metadata intact; only normalize labels that were generated
-- by the previous defaults.
update public.users
set rank = 'رئيس الخلية', position = 'رئيس الخلية'
where role = 'supervisor'
  and (rank is null or trim(rank) in ('', 'مسؤول خلية', 'رئيس خلية الإصغاء والتكفل'));

update public.users
set rank = 'تقني النظام', position = 'تقني النظام'
where role = 'super_admin'
  and (rank is null or trim(rank) in ('', 'تقني مكلف', 'المشرف التقني العام'));

update public.users
set rank = 'رئيس الديوان', position = 'رئيس الديوان'
where role = 'head_department'
  and (rank is null or trim(rank) in ('', 'رئيس الديوان — تابع لديوان الوالي'));

commit;
