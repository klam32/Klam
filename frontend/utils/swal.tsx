import React from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const confirmDestructive = async (title: string, text: string) => {
  const result = await MySwal.fire({
    title: <span className="font-bold text-purple-200">{title}</span>,
    html: <p className="text-gray-400 italic">{text}</p>,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#374151',
    confirmButtonText: 'Xác nhận xóa',
    cancelButtonText: 'Quay lại',
    background: '#0d0d16',
    color: '#e5e7eb',
    borderRadius: '24px',
    customClass: {
        popup: 'rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
    }
  });
  return result.isConfirmed;
};

export const promptInput = async (title: string, label: string, defaultValue: string = '', type: 'text' | 'password' = 'text') => {
  const result = await MySwal.fire({
    title: <span className="font-bold text-purple-200">{title}</span>,
    input: type,
    inputLabel: label,
    inputValue: defaultValue,
    showCancelButton: true,
    confirmButtonColor: '#9333ea',
    cancelButtonColor: '#374151',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Hủy',
    background: '#0d0d16',
    color: '#e5e7eb',
    borderRadius: '24px',
    customClass: {
        popup: 'rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3',
        input: 'rounded-xl border-white/10 bg-black/30 text-white focus:ring-purple-500 focus:border-purple-500'
    }
  });
  return result.value;
};

export const confirmAction = async (title: string, text: string) => {
  const result = await MySwal.fire({
    title: <span className="font-bold text-purple-200">{title}</span>,
    html: <p className="text-gray-400 italic">{text}</p>,
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#9333ea',
    cancelButtonColor: '#374151',
    confirmButtonText: 'Xác nhận',
    cancelButtonText: 'Quay lại',
    background: '#0d0d16',
    color: '#e5e7eb',
    borderRadius: '24px',
    customClass: {
        popup: 'rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl',
        confirmButton: 'rounded-xl font-bold px-6 py-3',
        cancelButton: 'rounded-xl font-bold px-6 py-3'
    }
  });
  return result.isConfirmed;
};

export const promptTokenAdjustment = async (title: string, username: string) => {
    const result = await MySwal.fire({
        title: <span className="font-bold text-purple-200">{title}</span>,
        html: (
            <div className="space-y-4 text-left">
                <p className="text-gray-400 text-sm italic">Người dùng: <span className="font-bold text-purple-400">{username}</span></p>
                <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Loại điều chỉnh</label>
                    <select id="swal-tx-type" className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-purple-500 font-bold text-sm text-white">
                        <option value="in" className="bg-[#0d0d16]">Cộng thêm (+)</option>
                        <option value="out" className="bg-[#0d0d16]">Khấu trừ (-)</option>
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2 block">Số lượng tokens</label>
                    <input id="swal-amount" type="number" step="0.01" className="w-full bg-black/30 border border-white/10 p-3 rounded-xl focus:outline-none focus:border-purple-500 font-bold text-lg text-purple-400" placeholder="0.00" />
                </div>
            </div>
        ),
        showCancelButton: true,
        confirmButtonColor: '#9333ea',
        cancelButtonColor: '#374151',
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        background: '#0d0d16',
        color: '#e5e7eb',
        borderRadius: '24px',
        preConfirm: () => {
            const type = (document.getElementById('swal-tx-type') as HTMLSelectElement).value;
            const amount = (document.getElementById('swal-amount') as HTMLInputElement).value;
            if (!amount || parseFloat(amount) <= 0) {
                Swal.showValidationMessage('Vui lòng nhập số lượng hợp lệ');
                return false;
            }
            return { type, amount: parseFloat(amount) };
        }
    });
    return result.value;
};

export const alertSuccess = (title: string, text: string) => {
    MySwal.fire({
        title: <span className="font-bold text-purple-200">{title}</span>,
        html: <p className="text-gray-400">{text}</p>,
        icon: 'success',
        confirmButtonColor: '#9333ea',
        background: '#0d0d16',
        color: '#e5e7eb',
        borderRadius: '24px',
        customClass: {
            popup: 'rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl',
            confirmButton: 'rounded-xl font-bold px-6 py-3'
        }
    });
};
