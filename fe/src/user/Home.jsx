import React, { useCallback, useEffect, useState } from 'react';
import { LightBulbIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const API_URL = 'http://localhost:3000/api/v1';

const DEVICE_OPTIONS = [
  { feed: 'temp', label: 'Cảm biến nhiệt độ', type: 'Sensor', defaultName: 'Cảm biến Nhiệt độ' },
  { feed: 'humid', label: 'Cảm biến độ ẩm', type: 'Sensor', defaultName: 'Cảm biến Độ ẩm' },
  { feed: 'light', label: 'Cảm biến ánh sáng', type: 'Sensor', defaultName: 'Cảm biến Ánh sáng' },
  { feed: 'fan', label: 'Quạt', type: 'Actuator', defaultName: 'Quạt thông gió' },
  { feed: 'servo', label: 'Cửa servo', type: 'Actuator', defaultName: 'Cửa tự động' },
  { feed: 'ledrgb', label: 'Đèn RGB', type: 'Actuator', defaultName: 'Đèn RGB' },
];

const emptyForm = {
  name: '',
  feed_name: '',
  type: '',
  model: '',
  pin: '',
  pin_mode: '',
  status: 'Tắt',
};

const getHomeId = (homeId) => {
  if (!homeId) return '';
  return typeof homeId === 'string' ? homeId : homeId._id;
};

const getDeviceOption = (feedName) => {
  return DEVICE_OPTIONS.find(option => option.feed === feedName);
};

const compactPayload = (form) => {
  const option = getDeviceOption(form.feed_name);
  const payload = {
    name: form.name.trim(),
    feed_name: form.feed_name,
    type: option?.type || form.type,
    status: form.status,
  };

  ['model', 'pin_mode'].forEach((field) => {
    if (form[field].trim()) payload[field] = form[field].trim();
  });

  if (form.pin !== '') payload.pin = Number(form.pin);
  return payload;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('vi-VN');
};

const Home = () => {
  const [devices, setDevices] = useState([]);
  const [userHome, setUserHome] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingDevice, setEditingDevice] = useState(null);
  const [isSubmittingDevice, setIsSubmittingDevice] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState({ type: '', text: '' });

  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');
  const isHomeAdmin = currentUser?.role === 'Admin';

  const fetchUserHomeInfo = useCallback(async () => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Không thể tải thông tin người dùng');

    setCurrentUser(result.data);
    const homeId = getHomeId(result.data?.homeId);
    if (homeId) {
      setUserHome({ id: homeId, name: 'Nhà của tôi' });
    }
  }, [token]);

  const fetchDevices = useCallback(async () => {
    const res = await fetch(`${API_URL}/devices`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Không thể tải thiết bị');
    setDevices(result.data || []);
  }, [token]);

  useEffect(() => {
    const init = async () => {
      try {
        await fetchUserHomeInfo();
        await fetchDevices();
      } catch (error) {
        setDeviceMessage({ type: 'error', text: error.message });
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [fetchDevices, fetchUserHomeInfo]);

  const updateForm = (field, value) => {
    if (field === 'feed_name') {
      const option = getDeviceOption(value);
      setForm(prev => ({
        ...prev,
        feed_name: value,
        type: option?.type || '',
        name: prev.name || option?.defaultName || '',
        status: option?.type === 'Sensor' ? 'Tắt' : prev.status,
      }));
      return;
    }

    setForm(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingDevice(null);
  };

  const startEdit = (device) => {
    setEditingDevice(device);
    setForm({
      name: device.name || '',
      feed_name: device.feed_name || '',
      type: device.type || '',
      model: device.model || '',
      pin: device.pin === undefined || device.pin === null ? '' : String(device.pin),
      pin_mode: device.pin_mode || '',
      status: device.status || 'Tắt',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeviceSubmit = async (event) => {
    event.preventDefault();

    if (!isHomeAdmin) return;
    if (!form.name.trim()) {
      setDeviceMessage({ type: 'error', text: 'Tên thiết bị là bắt buộc' });
      return;
    }
    if (!form.feed_name) {
      setDeviceMessage({ type: 'error', text: 'Vui lòng chọn feed thiết bị' });
      return;
    }
    if (!editingDevice && !userHome?.id) {
      setDeviceMessage({ type: 'error', text: 'Không tìm thấy nhà để thêm thiết bị' });
      return;
    }

    try {
      setIsSubmittingDevice(true);
      setDeviceMessage({ type: '', text: '' });
      const payload = compactPayload(form);
      const url = editingDevice
        ? `${API_URL}/devices/${editingDevice._id}`
        : `${API_URL}/devices`;
      const method = editingDevice ? 'PUT' : 'POST';

      if (!editingDevice) payload.homeId = userHome.id;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Không thể lưu thiết bị');

      setDeviceMessage({ type: 'success', text: editingDevice ? 'Đã cập nhật thiết bị' : 'Đã thêm thiết bị' });
      resetForm();
      fetchDevices();
    } catch (error) {
      setDeviceMessage({ type: 'error', text: error.message });
    } finally {
      setIsSubmittingDevice(false);
    }
  };

  const handleDelete = async (device) => {
    if (!isHomeAdmin) return;
    if (!window.confirm(`Xóa thiết bị ${device.name}?`)) return;

    try {
      setDeviceMessage({ type: '', text: '' });
      const res = await fetch(`${API_URL}/devices/${device._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Không thể xóa thiết bị');

      setDeviceMessage({ type: 'success', text: 'Đã xóa thiết bị' });
      fetchDevices();
    } catch (error) {
      setDeviceMessage({ type: 'error', text: error.message });
    }
  };

  if (isLoading) {
    return <div className="p-9 text-center text-gray-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-9 max-w-7xl mx-auto">
      <div className="mb-8 border-b pb-4">
        <h1 className="font-bold text-3xl text-gray-900">Nhà của tôi</h1>
        <p className="text-gray-500 mt-2">
          {isHomeAdmin
            ? 'Quản lý thiết bị trong nhà và chia sẻ quyền truy cập cho thành viên.'
            : 'Xem danh sách thiết bị đang có trong nhà của bạn.'}
        </p>
      </div>

      {deviceMessage.text && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${deviceMessage.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'}`}>
          {deviceMessage.text}
        </div>
      )}

      <div className="space-y-6">
          {isHomeAdmin && (
            <form onSubmit={handleDeviceSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-gray-900">{editingDevice ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}</h2>
                {editingDevice && (
                  <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:text-gray-900">Hủy sửa</button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select value={form.feed_name} onChange={(event) => updateForm('feed_name', event.target.value)} required className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
                  <option value="">Chọn loại thiết bị</option>
                  {DEVICE_OPTIONS.map((option) => (
                    <option key={option.feed} value={option.feed}>{option.feed} - {option.label}</option>
                  ))}
                </select>
                <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} required placeholder="Tên thiết bị" className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10" />
                <input value={form.model} onChange={(event) => updateForm('model', event.target.value)} placeholder="Model" className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10" />
                <input type="number" value={form.pin} onChange={(event) => updateForm('pin', event.target.value)} placeholder="Pin" className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10" />
                <input value={form.pin_mode} onChange={(event) => updateForm('pin_mode', event.target.value)} placeholder="Pin mode" className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10" />
                <select value={form.status} onChange={(event) => updateForm('status', event.target.value)} className="border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-black/10">
                  <option value="Tắt">Tắt</option>
                  <option value="Bật">Bật</option>
                </select>
              </div>

              <button disabled={isSubmittingDevice} className="mt-5 bg-black text-white rounded-xl px-5 py-2.5 font-medium hover:bg-gray-800 disabled:opacity-50">
                {isSubmittingDevice ? 'Đang lưu...' : editingDevice ? 'Cập nhật thiết bị' : 'Thêm thiết bị'}
              </button>
            </form>
          )}

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Thiết bị hiện có</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                Tổng: {devices.length}
              </span>
            </div>

            {devices.length === 0 ? (
              <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <LightBulbIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Bạn chưa có thiết bị nào.</p>
                {isHomeAdmin && <p className="text-sm">Hãy thêm thiết bị bằng form phía trên.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {devices.map((device) => {
                  const option = getDeviceOption(device.feed_name);
                  return (
                    <div key={device._id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-white hover:shadow-md transition duration-200">
                      <div className="flex justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${option?.type === 'Sensor' ? 'bg-blue-100 text-blue-600' : 'bg-yellow-100 text-yellow-600'}`}>
                            <LightBulbIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{device.name}</h3>
                            <p className="text-xs text-gray-500">{option?.label || device.type || '-'}</p>
                            <p className="text-xs text-gray-400">Feed: {device.feed_name || '-'}</p>
                          </div>
                        </div>

                        {isHomeAdmin && (
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(device)} className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100" title="Sửa">
                              <PencilSquareIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(device)} className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-red-50 text-red-700 hover:bg-red-100" title="Xóa">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 text-xs text-gray-400">
                        Lần cuối: {formatDateTime(device.last_seen)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default Home;
