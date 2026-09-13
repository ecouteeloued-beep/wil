import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCheck, LockKeyhole, Mail, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SystemUser } from '../../types';

type Recipient = { id: string; name: string; role: string; department?: string | null };
type Message = { id: string; sender_id: string; recipient_id: string; subject: string; body: string; created_at: string; read_at?: string | null };

const roleLabels: Record<string, string> = { supervisor: 'مشرف', head_department: 'رئيس مصلحة', employee: 'موظف', super_admin: 'مسؤول النظام' };

export const InternalMessagesView: React.FC<{ user: SystemUser; addToast: (toast: { type: 'success' | 'info' | 'warning' | 'error'; title: string; message: string }) => void }> = ({ user, addToast }) => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selected, setSelected] = useState<Message | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!supabase) { setError('خدمة الرسائل غير مفعلة حالياً.'); setLoading(false); return; }
    setLoading(true);
    const [{ data: people, error: peopleError }, { data: items, error: messageError }] = await Promise.all([
      supabase.rpc('list_message_recipients'),
      supabase.from('internal_messages').select('id,sender_id,recipient_id,subject,body,created_at,read_at').order('created_at', { ascending: false }).limit(100),
    ]);
    if (peopleError || messageError) setError('تعذر تحميل الرسائل الخاصة. تحقق من اتصال الحساب والصلاحيات.');
    else { setRecipients((people || []) as Recipient[]); setMessages((items || []) as Message[]); setError(''); }
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase || !recipientId || !body.trim()) return;
    setSending(true);
    const { error: sendError } = await supabase.from('internal_messages').insert({ sender_id: user.id, recipient_id: recipientId, subject: subject.trim() || 'رسالة داخلية', body: body.trim() });
    setSending(false);
    if (sendError) { setError('تعذر إرسال الرسالة. تأكد من أن حسابك نشط.'); return; }
    setSubject(''); setBody(''); setRecipientId('');
    addToast({ type: 'success', title: 'تم إرسال الرسالة السرية', message: 'لن تظهر الرسالة إلا لك وللمستلم المحدد.' });
    await load();
  };

  const openMessage = async (message: Message) => {
    setSelected(message);
    if (!message.read_at && message.recipient_id === user.id && supabase) {
      await supabase.rpc('mark_internal_message_read', { p_message_id: message.id });
      setMessages(prev => prev.map(item => item.id === message.id ? { ...item, read_at: new Date().toISOString() } : item));
    }
  };

  const unreadCount = useMemo(() => messages.filter(message => message.recipient_id === user.id && !message.read_at).length, [messages, user.id]);
  const personName = (id: string) => id === user.id ? 'أنت' : recipients.find(person => person.id === id)?.name || 'موظف مصرح';

  return <div className="space-y-6 font-tajawal">
    <div className="flex flex-col sm:flex-row justify-between gap-4"><div><div className="flex items-center gap-2"><h2 className="text-2xl font-bold font-changa text-gray-900">الدردشة الداخلية السرية</h2><span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">{unreadCount} غير مقروءة</span></div><p className="text-xs text-gray-500 mt-1">المراسلات محمية: لا يستطيع رؤية الرسالة إلا المرسل والمستلم المحدد.</p></div><button onClick={() => void load()} className="self-start inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:text-[#006233]"><RefreshCw className="w-4 h-4" />تحديث</button></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">{error}</div>}
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-5">
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-100 flex items-center gap-2"><Mail className="w-5 h-5 text-[#006233]" /><h3 className="font-changa font-bold text-base">صندوق الرسائل الخاصة</h3></div>{loading ? <div className="p-8 text-center text-xs text-gray-500">جارٍ تحميل الرسائل...</div> : messages.length === 0 ? <div className="p-10 text-center text-sm text-gray-500">لا توجد رسائل داخلية بعد.</div> : <div className="divide-y divide-gray-100">{messages.map(message => <button key={message.id} onClick={() => void openMessage(message)} className={`w-full text-right p-4 hover:bg-emerald-50/50 transition-colors ${message.recipient_id === user.id && !message.read_at ? 'bg-amber-50/50' : ''}`}><div className="flex items-center justify-between gap-3"><div className="min-w-0"><p className="font-bold text-sm text-gray-900 truncate">{message.subject}</p><p className="text-xs text-gray-500 mt-1">من: {personName(message.sender_id)} — إلى: {personName(message.recipient_id)}</p></div><span className="shrink-0 text-[10px] text-gray-400">{new Date(message.created_at).toLocaleString('ar-DZ')}</span></div><p className="text-xs text-gray-600 mt-2 truncate">{message.body}</p></button>)}</div>}</section>
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"><div className="flex items-center gap-2 mb-5"><LockKeyhole className="w-5 h-5 text-[#006233]" /><h3 className="font-changa font-bold text-base">إرسال رسالة سرية</h3></div><form onSubmit={send} className="space-y-3"><label className="block text-xs font-bold text-gray-700">المستلم<select required value={recipientId} onChange={event => setRecipientId(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs outline-none focus:border-[#006233]"><option value="">اختر موظفاً أو مسؤولاً</option>{recipients.map(person => <option key={person.id} value={person.id}>{person.name} — {roleLabels[person.role] || person.role}</option>)}</select></label><label className="block text-xs font-bold text-gray-700">الموضوع<input value={subject} onChange={event => setSubject(event.target.value)} maxLength={180} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs outline-none focus:border-[#006233]" placeholder="موضوع الرسالة" /></label><label className="block text-xs font-bold text-gray-700">نص الرسالة<textarea required value={body} onChange={event => setBody(event.target.value)} maxLength={5000} rows={6} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs leading-6 outline-none focus:border-[#006233]" placeholder="اكتب المراسلة هنا..." /></label><div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-[11px] leading-5 text-emerald-800 flex gap-2"><ShieldCheck className="w-4 h-4 shrink-0" />تُفرض الخصوصية على مستوى قاعدة البيانات، وليس فقط على مستوى واجهة الشاشة.</div><button type="submit" disabled={sending || !recipientId || !body.trim()} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#006233] px-4 py-3 text-xs font-bold text-white disabled:opacity-50"><Send className="w-4 h-4" />{sending ? 'جارٍ الإرسال...' : 'إرسال الرسالة'}</button></form></section>
    </div>
    {selected && <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}><article className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-6" dir="rtl" onClick={event => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><h3 className="font-changa font-bold text-lg text-gray-900">{selected.subject}</h3><p className="text-xs text-gray-500 mt-1">من {personName(selected.sender_id)} إلى {personName(selected.recipient_id)}</p></div><CheckCheck className="w-5 h-5 text-emerald-600" /></div><div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 p-4 text-sm leading-8 text-gray-800 whitespace-pre-wrap">{selected.body}</div><button onClick={() => setSelected(null)} className="mt-5 rounded-xl bg-[#006233] px-5 py-2 text-xs font-bold text-white">إغلاق</button></article></div>}
  </div>;
};
