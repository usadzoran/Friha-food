import React from 'react';
import { useApp } from '../../context/AppContext';
import { Users, UserCheck, UserX, Trash2, Shield, Phone, Mail } from 'lucide-react';

export default function UsersTab() {
  const { users, toggleUserStatus, deleteUser } = useApp();

  return (
    <div className="space-y-6 font-cairo dir-rtl text-right">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900 p-5 rounded-2xl border border-stone-800">
        <div className="space-y-1 w-full sm:w-auto">
          <h2 className="text-2xl font-bold font-kufi text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>إدارة المستخدمين والعملاء</span>
          </h2>
          <p className="text-xs text-stone-400">
            متابعة الحسابات المسجلة، الصلاحيات وحظر الحسابات عند الحاجة
          </p>
        </div>
        <div className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 text-xs font-bold border border-stone-700">
          إجمالي المسجلين: <span className="text-white font-mono">{users.length}</span>
        </div>
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-950/60 text-stone-400 text-xs font-bold">
                <th className="py-4 px-5">اسم المستخدم</th>
                <th className="py-4 px-5">بيانات التواصل</th>
                <th className="py-4 px-5">نوع الحساب</th>
                <th className="py-4 px-5">عدد الطلبات</th>
                <th className="py-4 px-5">تاريخ التسجيل</th>
                <th className="py-4 px-5">الحالة</th>
                <th className="py-4 px-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-extrabold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5 text-xs text-stone-300">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      <span>{u.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-stone-400 dir-ltr text-right">
                      <Phone className="w-3.5 h-3.5 text-stone-500" />
                      <span>{u.phone}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {u.role === 'admin' ? (
                      <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold flex items-center gap-1 w-fit">
                        <Shield className="w-3 h-3" /> مدير نظام
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-xs font-bold w-fit">
                        عميل
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 font-bold text-emerald-400 font-mono">
                    {u.ordersCount} طلب
                  </td>
                  <td className="py-4 px-5 text-xs text-stone-400">
                    {u.createdAt}
                  </td>
                  <td className="py-4 px-5">
                    {u.status === 'active' ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                        نشط
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold">
                        محظور
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      {u.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/50'
                                : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50'
                            }`}
                            title={u.status === 'active' ? 'حظر الحساب' : 'تنشيط الحساب'}
                          >
                            {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت تأكد من حذف حساب ${u.name}؟`)) {
                                deleteUser(u.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/50 transition-colors cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
