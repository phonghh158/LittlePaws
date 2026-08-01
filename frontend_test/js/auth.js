// frontend_test/js/auth.js
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    // Kiểm tra tham số token từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get("token");
    if (tokenParam) {
        window.showToast(
            `Phát hiện Token xác thực thiết bị: ${tokenParam.substring(0, 15)}...`,
            "success",
        );
        // Xử lý logic kích hoạt thiết bị bằng token
    }

    // Logic Đăng nhập
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const identity = document.getElementById("login-identity").value;
            const password = document.getElementById("login-password").value;

            try {
                // Khởi tạo thông tin thiết bị
                const deviceInfo = {
                    deviceId: localStorage.getItem("deviceId") || "",
                    ipAddress: "127.0.0.1",
                    userAgent: navigator.userAgent,
                };

                // Gửi yêu cầu đăng nhập kèm thông tin thiết bị
                const response = await apiClient.post(
                    "/auth/login",
                    {
                        identity,
                        password,
                    },
                    {
                        headers: { "x-device-info": JSON.stringify(deviceInfo) },
                    },
                );

                const result = response.data.data || response.data;

                // Xử lý luồng xác thực thiết bị mới
                if (result.requireVerification) {
                    window.showToast(result.message, "success");

                    // Nhận OTP đầu vào từ người dùng
                    const otpInput = prompt(
                        "Thiết bị mới! Vui lòng kiểm tra mã OTP ở console backend và điền vào đây:",
                    );

                    if (otpInput) {
                        window.showToast("Đang xác thực mã OTP hệ thống...", "success");

                        // Yêu cầu cấp phiên đăng nhập (Session) mới
                        const verifyResponse = await apiClient.post("/auth/issue-device-id", {
                            userId: result.userId,
                        });

                        const verifyResult = verifyResponse.data.data || verifyResponse.data;
                        handleAuthSuccess(verifyResult);
                    }
                } else {
                    handleAuthSuccess(result);
                }
            } catch (error) {
                // Lỗi được xử lý tại Axios Interceptor
            }
        });
    }

    // Logic Đăng ký
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = document.getElementById("reg-username").value;
            const fullName = document.getElementById("reg-fullName").value;
            const email = document.getElementById("reg-email").value;
            const phoneNumber = document.getElementById("reg-phone").value;
            const password = document.getElementById("reg-password").value;
            const confirmPassword = document.getElementById("reg-confirmPassword").value;

            try {
                await apiClient.post("/auth/register", {
                    username,
                    fullName,
                    email,
                    phoneNumber,
                    password,
                    confirmPassword,
                });

                window.showToast(
                    "Đăng ký tài khoản mới thành công! Bạn có thể sử dụng thông tin này để đăng nhập.",
                    "success",
                );
                registerForm.reset();
            } catch (error) {
                // Lỗi được xử lý tại Axios Interceptor
            }
        });
    }

    // Xử lý dữ liệu phiên đăng nhập và hiển thị thông tin
    function handleAuthSuccess(authData) {
        localStorage.setItem("accessToken", authData.token.accessToken);
        localStorage.setItem("refreshToken", authData.token.refreshToken);
        localStorage.setItem("username", authData.user.username);

        // Trích xuất device_id từ Access Token
        if (authData.token.accessToken) {
            try {
                const base64Url = authData.token.accessToken.split(".")[1];
                const decodedPayload = JSON.parse(atob(base64Url));
                if (decodedPayload.device_id) {
                    localStorage.setItem("deviceId", decodedPayload.device_id);
                }
            } catch (e) {
                console.error("Không thể giải mã dữ liệu token:", e);
            }
        }

        const user = authData.user;
        window.showToast("Xác thực hệ thống hoàn tất. Chào mừng quay trở lại!", "success");

        // Render thông tin người dùng lên Modal
        const contentHTML = `
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 5px;">
                <p><i class='bx bx-id-card' style='color: var(--primary-color)'></i> <strong>Mã số User:</strong> ${user._id}</p>
                <p><i class='bx bx-user' style='color: var(--primary-color)'></i> <strong>Tên tài khoản:</strong> ${user.username}</p>
                <p><i class='bx bx-shield-quarter' style='color: var(--primary-color)'></i> <strong>Quyền hạn hệ thống:</strong> <span style="color: var(--success-color); font-weight: bold;">${user.role}</span></p>
            </div>
        `;
        window.openModal("Thông tin tài khoản đăng nhập", contentHTML);
    }
});
