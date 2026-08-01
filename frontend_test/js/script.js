// frontend_test/js/script.js
const apiClient = axios.create({
    baseURL: "http://localhost:1111/api/v1",
    headers: {
        "Content-Type": "application/json",
    },
});

// Cấu hình Axios Interceptor cho Request
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Bắt lỗi 401 (Access Token hết hạn)
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Bỏ qua nếu chính API rotate token cũng bị 401
            if (originalRequest.url.includes("/auth/rotate-token")) {
                return Promise.reject(error);
            }

            // Đưa các request đồng thời vào hàng đợi
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem("refreshToken");
            const deviceId = localStorage.getItem("deviceId") || "default-device-id";

            if (!refreshToken) {
                isRefreshing = false;
                window.showToast(
                    "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại.",
                    "error",
                );
                return Promise.reject(error);
            }

            try {
                // Gọi API refresh token
                const { data } = await axios.post(
                    "http://localhost:1111/api/v1/auth/rotate-token",
                    { refreshToken },
                    { headers: { "x-device-id": deviceId } },
                );

                // Trích xuất token mới (thay đổi 'metadata' nếu hàm success() trả về key khác)
                const newAccessToken = data.metadata.token.accessToken;
                const newRefreshToken = data.metadata.token.refreshToken;

                // Cập nhật Storage
                localStorage.setItem("accessToken", newAccessToken);
                localStorage.setItem("refreshToken", newRefreshToken);

                // Chạy lại request ban đầu với token mới
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                processQueue(null, newAccessToken);

                return apiClient(originalRequest);
            } catch (err) {
                processQueue(err, null);
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                // --- ĐÃ THÊM: Xóa username và cập nhật lại giao diện ---
                localStorage.removeItem("username");
                if (typeof window.updateNavUserInfo === "function") {
                    window.updateNavUserInfo();
                }

                window.showToast(
                    "Phiên đăng nhập đã hết hạn hoàn toàn, vui lòng đăng nhập lại.",
                    "error",
                );
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        // Bắt các lỗi khác 401
        const message = error.response?.data?.message || "Đã xảy ra lỗi hệ thống nội bộ.";
        if (window.showToast) {
            window.showToast(message, "error");
        }
        return Promise.reject(error);
    },
);

// Cấu hình Dark Mode
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");

function getPreferredTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    return "dark"; // Thiết lập giao diện mặc định
}

function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
        themeIcon.classList.replace("bx-moon", "bx-sun");
    } else {
        themeIcon.classList.replace("bx-sun", "bx-moon");
    }
}
setTheme(getPreferredTheme());

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        setTheme(currentTheme === "dark" ? "light" : "dark");
    });
}

// Thành phần Toast Notification
window.showToast = function (message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icon = type === "success" ? "bx-check-circle" : "bx-error-circle";

    toast.innerHTML = `
        <div class="toast-content">
            <i class="bx ${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i class="bx bx-x"></i></button>
    `;
    container.appendChild(toast);

    // Tự động ẩn Toast sau 6 giây
    const autoDismiss = setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 6000);

    toast.querySelector(".toast-close").addEventListener("click", () => {
        clearTimeout(autoDismiss);
        toast.remove();
    });
};

// Thành phần Modal
const modalOverlay = document.getElementById("info-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalCloseBtn = document.getElementById("modal-close-btn");

window.openModal = function (title, contentHTML) {
    if (!modalOverlay) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = contentHTML;
    modalOverlay.classList.add("active");
};

window.closeModal = function () {
    if (!modalOverlay) return;
    modalOverlay.classList.remove("active");
};

if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

// --- ĐÃ THÊM: Xử lý hiển thị Username trên thẻ Nav ---
window.updateNavUserInfo = function () {
    const username = localStorage.getItem("username");
    const signedInSpan = document.getElementById("signed-in-username");

    if (signedInSpan) {
        if (username) {
            // Có dữ liệu đăng nhập -> Gắn HTML và hiện thẻ lên
            signedInSpan.innerHTML = `<i class='bx bx-user-circle' style='font-size: 1.1em; transform: translateY(2px);'></i> ${username}`;
            signedInSpan.style.display = "inline-flex";
            signedInSpan.style.gap = "5px";
            signedInSpan.style.alignItems = "center";
            signedInSpan.style.fontWeight = "bold";
            signedInSpan.style.color = "var(--primary-color)";
            signedInSpan.style.textDecoration = "none";
        } else {
            // Không có dữ liệu -> Ẩn thẻ đi
            signedInSpan.innerHTML = "";
            signedInSpan.style.display = "none";
        }
    }
};

// Chạy hàm cập nhật ngay khi vừa load xong HTML
document.addEventListener("DOMContentLoaded", window.updateNavUserInfo);
