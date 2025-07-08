import React from "react";
import { X, Loader2 } from "lucide-react";

interface FormData {
  name: string;
  anonymous: boolean;
  dari: string;
  untuk: string;
  pesan: string;
}

interface ModalProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  submitting: boolean;
}

const Modal: React.FC<ModalProps> = ({
  formData,
  setFormData,
  onSubmit,
  onClose,
  submitting,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Tambah Surat Baru
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama:
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
              disabled={submitting}
            />
            <div className="mt-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={formData.anonymous}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      anonymous: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  disabled={submitting}
                />
                <span>Anonymous</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dari:
              </label>
              <input
                type="number"
                placeholder="contoh : 22"
                value={formData.dari}
                onChange={(e) =>
                  setFormData({ ...formData, dari: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={submitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Untuk:
              </label>
              <input
                type="number"
                placeholder="contoh: 16"
                value={formData.untuk}
                onChange={(e) =>
                  setFormData({ ...formData, untuk: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesan:
            </label>
            <textarea
              value={formData.pesan}
              onChange={(e) =>
                setFormData({ ...formData, pesan: e.target.value })
              }
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Tulis pesanmu untuk diri masa lalu..."
              required
              disabled={submitting}
            />
            <div className="text-right mt-1">
              <span className="text-sm text-gray-500">
                {formData.pesan.length}/500 karakter
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Mengirim...</span>
              </>
            ) : (
              <span>KIRIM SURAT</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
