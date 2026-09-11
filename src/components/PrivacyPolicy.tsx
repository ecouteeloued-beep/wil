import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <section className="py-12 max-w-4xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 md:p-12"
      >
        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8 text-[#006233]" />
          </div>
          <div>
            <h2 className="font-changa font-bold text-2xl text-gray-900">سياسة الخصوصية وحماية المعطيات الشخصية</h2>
            <p className="font-tajawal text-gray-500 mt-1">وفقاً للقانون 18-07 المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع الشخصي</p>
          </div>
        </div>

        <div className="space-y-8 font-tajawal text-gray-700 leading-relaxed text-sm md:text-base">
          <div>
            <h3 className="font-changa font-bold text-lg text-gray-900 mb-3 text-[#006233]">1. ديباجة ومقدمة</h3>
            <p>
              تلتزم ولاية الوادي، من خلال خلية الإصغاء والتكفل بانشغالات المواطنين، بحماية خصوصية مستخدمي البوابة الإلكترونية. تهدف هذه السياسة إلى توضيح كيفية جمع، استخدام، وحماية المعطيات ذات الطابع الشخصي التي يتم الإدلاء بها أثناء تقديم العرائض والشكاوى.
            </p>
          </div>

          <div>
            <h3 className="font-changa font-bold text-lg text-gray-900 mb-3 text-[#006233]">2. المعطيات التي يتم جمعها</h3>
            <p>لضمان معالجة فعالة للعرائض، نقوم بجمع المعلومات التالية حصرياً:</p>
            <ul className="list-disc list-inside mt-2 space-y-2 pr-4">
              <li>الاسم واللقب الكاملين.</li>
              <li>تاريخ الميلاد والجنس ومعلومات الإقامة لمعالجة الانشغال.</li>
              <li>رقم الهاتف المحمول للتواصل الفوري.</li>
              <li>البلدية ومجال الانشغال وتفاصيل الشكوى.</li>
              <li>المرفقات الداعمة (إن وجدت).</li>
            </ul>
          </div>

          <div>
            <h3 className="font-changa font-bold text-lg text-gray-900 mb-3 text-[#006233]">3. الغرض من معالجة المعطيات</h3>
            <p>
              تُستخدم المعطيات المجمعة بشكل صارم للغرض الذي جُمعت من أجله، وهو:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 pr-4">
              <li>استلام وتوثيق العرائض الإدارية.</li>
              <li>توجيه الانشغال إلى المصالح التقنية والإدارية المختصة.</li>
              <li>التواصل مع المواطن لإعلامه بمآل الشكوى أو طلب توضيحات إضافية.</li>
              <li>إعداد إحصائيات عامة (غير اسمية) لتحسين جودة الخدمة العمومية.</li>
            </ul>
          </div>

          <div>
            <h3 className="font-changa font-bold text-lg text-gray-900 mb-3 text-[#006233]">4. سرية وأمن المعطيات</h3>
            <p>
              تُحفظ المعطيات في قواعد بيانات آمنة، ولا يتم مشاركتها أو بيعها لأي أطراف ثالثة خارج الإطار القانوني والمصالح الإدارية المعنية بمعالجة الشكوى. يتم تطبيق إجراءات تقنية وتنظيمية صارمة لمنع أي وصول غير مصرح به.
            </p>
          </div>

          <div>
            <h3 className="font-changa font-bold text-lg text-gray-900 mb-3 text-[#006233]">5. حقوق المواطن</h3>
            <p>
              طبقاً للقانون الجزائري 18-07، يحق لأي مواطن:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-2 pr-4">
              <li>الوصول إلى معطياته الشخصية المسجلة.</li>
              <li>طلب تصحيح أو تحيين المعطيات الخاطئة.</li>
              <li>طلب حذف المعطيات (ضمن القيود التي يفرضها قانون الأرشيف الإداري).</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg mt-8 border border-gray-200">
            <p className="text-sm font-bold text-gray-900 text-center">
              بتقديمك لعريضة عبر هذه البوابة، فإنك توافق صراحة على شروط هذه السياسة وعلى معالجة بياناتك من طرف مصالح ولاية الوادي.
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
