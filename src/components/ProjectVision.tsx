import React from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, ShieldCheck, CheckCircle2, Layout, Zap, Users, Globe } from 'lucide-react';

export const ProjectVision: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-black font-changa text-[#006233] mb-4">
          رؤية التحول الرقمي
        </h1>
        <p className="text-lg text-gray-600 font-tajawal max-w-2xl mx-auto">
          مشروع عصرنة الإدارة وتقريبها من المواطن بولاية الوادي نحو إدارة ذكية، شفافة، وفعالة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-changa text-gray-900 mb-3">أهداف المنصة</h3>
          <ul className="space-y-3 font-tajawal text-gray-600">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-[#006233] shrink-0" /> القضاء على البيروقراطية</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-[#006233] shrink-0" /> تتبع شفاف لمسار الملفات</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-[#006233] shrink-0" /> ربح الوقت والجهد للمواطن والإدارة</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-6">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-changa text-gray-900 mb-3">مراحل الإنجاز</h3>
          <ul className="space-y-3 font-tajawal text-gray-600">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-[#006233] shrink-0" /> <span className="font-bold">المرحلة 1:</span> إطلاق النسخة التجريبية (الحالية)</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-gray-300 shrink-0" /> <span className="font-bold">المرحلة 2:</span> الربط مع قواعد البيانات</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-gray-300 shrink-0" /> <span className="font-bold">المرحلة 3:</span> الإطلاق الرسمي عبر النطاق الحكومي</li>
          </ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-12 h-12 bg-green-50 text-[#006233] rounded-xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-changa text-gray-900 mb-3">البنية التقنية (المستقبلية)</h3>
          <ul className="space-y-3 font-tajawal text-gray-600">
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-[#006233] shrink-0" /> قاعدة بيانات PostgreSQL مؤمنة</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-[#006233] shrink-0" /> نظام إشعارات SMS والبريد</li>
            <li className="flex gap-2 items-start"><CheckCircle2 className="w-5 h-5 text-[#006233] shrink-0" /> سجل عمليات Audit Log لضمان الشفافية</li>
          </ul>
        </motion.div>
      </div>

      <div className="bg-[#006233] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-black font-changa mb-6">نحو إدارة ذكية ومبتكرة</h2>
          <p className="font-tajawal text-green-50 text-lg leading-relaxed mb-8">
            تأتي هذه المنصة كخطوة أساسية في مشروع التحول الرقمي للولاية، بهدف جعل الخدمات الحكومية أقرب إلى المواطن، أسرع في الاستجابة، وأكثر كفاءة في معالجة الملفات الإدارية.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <Layout className="w-8 h-8 text-green-300 mb-3" />
              <div className="font-bold font-changa text-xl mb-1">UX/UI</div>
              <div className="text-xs text-green-100 font-tajawal">تصميم موجه للمواطن</div>
            </div>
            <div>
              <Zap className="w-8 h-8 text-green-300 mb-3" />
              <div className="font-bold font-changa text-xl mb-1">أداء</div>
              <div className="text-xs text-green-100 font-tajawal">سرعة في المعالجة</div>
            </div>
            <div>
              <Users className="w-8 h-8 text-green-300 mb-3" />
              <div className="font-bold font-changa text-xl mb-1">RBAC</div>
              <div className="text-xs text-green-100 font-tajawal">صلاحيات إدارية متقدمة</div>
            </div>
            <div>
              <Globe className="w-8 h-8 text-green-300 mb-3" />
              <div className="font-bold font-changa text-xl mb-1">Accessible</div>
              <div className="text-xs text-green-100 font-tajawal">متاح للجميع وفي كل وقت</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
