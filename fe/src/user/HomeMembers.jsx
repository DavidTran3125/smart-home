import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:3000/api/v1";

const getHomeId = (homeId) => {
  if (!homeId) return "";
  return typeof homeId === "string" ? homeId : homeId._id;
};

const HomeMembers = () => {
  const [homeId, setHomeId] = useState("");
  const [members, setMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCurrentHome = useCallback(async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Không thể tải thông tin nhà");

    const currentHomeId = getHomeId(result.data?.homeId);
    if (!currentHomeId) throw new Error("Tài khoản chưa gắn với nhà nào");

    setHomeId(currentHomeId);
    return currentHomeId;
  }, []);

  const fetchMembers = useCallback(async (targetHomeId = homeId) => {
    if (!targetHomeId) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/homes/${targetHomeId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Không thể tải thành viên");

      setMembers(result.data || []);
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [homeId]);

  useEffect(() => {
    const init = async () => {
      try {
        const currentHomeId = await loadCurrentHome();
        await fetchMembers(currentHomeId);
      } catch (error) {
        setMessage({ type: "error", text: error.message });
        setIsLoading(false);
      }
    };

    init();
  }, [fetchMembers, loadCurrentHome]);

  const handleInvite = async (event) => {
    event.preventDefault();
    if (!homeId) return;

    try {
      setIsSubmitting(true);
      setMessage({ type: "", text: "" });
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/homes/${homeId}/members/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Không thể gửi lời mời");

      setInviteEmail("");
      setMessage({ type: "success", text: `Đã gửi lời mời tới ${inviteEmail}` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (member) => {
    if (member.role === "Admin") return;
    if (!window.confirm(`Gỡ ${member.full_name || member.email} khỏi nhà này?`)) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/homes/${homeId}/members/${member._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Không thể gỡ thành viên");

      setMessage({ type: "success", text: "Đã gỡ thành viên khỏi nhà" });
      fetchMembers();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Quản lý thành viên</h1>
        <p className="text-gray-500">Mời người thân và quản lý quyền truy cập vào nhà của bạn.</p>
      </div>

      {message.text && (
        <div className={`mb-6 px-4 py-3 rounded-xl border text-sm font-medium ${message.type === "error" ? "bg-red-50 border-red-200 text-red-700" : "bg-green-50 border-green-200 text-green-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">
        <form onSubmit={handleInvite} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Mời thành viên mới</h2>
          <p className="text-sm text-gray-500 mb-5">Người được mời sẽ đăng ký bằng link trong email.</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
            placeholder="nguoinha@gmail.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
          <button
            disabled={isSubmitting}
            className="w-full mt-4 bg-black text-white py-2.5 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {isSubmitting ? "Đang gửi..." : "Gửi lời mời"}
          </button>
        </form>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900">Thành viên trong nhà</h2>
            <span className="text-sm text-gray-500">{members.length} tài khoản</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                <tr>
                  <th className="p-4">Người dùng</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Vai trò</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {isLoading ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">Đang tải thành viên...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan="5" className="p-8 text-center text-gray-500">Chưa có thành viên nào.</td></tr>
                ) : members.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="p-4 font-semibold text-gray-900">
                      <div>{member.full_name || member.username}</div>
                      <div className="text-xs text-gray-400 font-normal">@{member.username}</div>
                    </td>
                    <td className="p-4 text-gray-600">{member.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.role === "Admin" ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${member.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {member.status === "active" ? "Hoạt động" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {member.role === "Admin" ? (
                        <span className="text-xs text-gray-400">Chủ nhà</span>
                      ) : (
                        <button
                          onClick={() => handleRemove(member)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100"
                        >
                          Gỡ khỏi nhà
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeMembers;
