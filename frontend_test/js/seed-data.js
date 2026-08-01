document.addEventListener("DOMContentLoaded", async () => {
    const { fakerVI: faker } = await import("https://esm.sh/@faker-js/faker");

    // --- BẮT ĐẦU PHẦN SEED SPECIES ---
    const btnSeedUsers = document.getElementById("btn-seed-users");
    if (btnSeedUsers) {
        btnSeedUsers.addEventListener("click", async () => {
            const originalText = btnSeedUsers.innerHTML;
            const amount = 33;

            try {
                btnSeedUsers.disabled = true;
                btnSeedUsers.innerHTML =
                    "<i class='bx bx-loader-alt bx-spin'></i> Đang xử lý...";
                window.showToast("Bắt đầu dọn dẹp và bơm dữ liệu Users...", "success");

                let successCount = 0;
                let failCount = 0;
                let errorDetails = [];
                let createdUsers = [];

                // 1. Xóa toàn bộ dữ liệu cũ
                try {
                    await apiClient.delete("/users");
                } catch (error) {
                    console.warn(error);
                }

                // 2. Bơm tài khoản Admin
                const adminPayload = {
                    username: "admin",
                    fullName: "A Đê Min",
                    email: "admin@little-paws.com",
                    phoneNumber: "0900000009",
                    password: "Admin@123",
                    confirmPassword: "Admin@123",
                };

                try {
                    await apiClient.post("/auth/register", adminPayload);
                    successCount++;
                    createdUsers.push("[ADMIN] " + adminPayload.username);
                } catch (error) {
                    failCount++;
                    const errMsg = error.response?.data?.message || error.message;
                    errorDetails.push(`Admin: ${errMsg}`);
                }

                // 3. Bơm user giả đầu tiên
                const userPayload = {
                    username: "user1",
                    fullName: "Iu Sơ Số Một",
                    email: "user1@little-paws.com",
                    phoneNumber: "0900000001",
                    password: "User@123",
                    confirmPassword: "User@123",
                };

                try {
                    await apiClient.post("/auth/register", userPayload);
                    successCount++;
                    createdUsers.push("[User 1] " + userPayload.username);
                } catch (error) {
                    failCount++;
                    const errMsg = error.response?.data?.message || error.message;
                    errorDetails.push(`User 1: ${errMsg}`);
                }

                // 4. Bơm tài khoản User giả
                for (let i = 0; i < amount; i++) {
                    const fakePassword = "User@123";
                    const payload = {
                        username: faker.string.alphanumeric({ length: { min: 3, max: 16 } }),
                        fullName: faker.person.fullName(),
                        email: faker.internet.email().toLowerCase(),
                        phoneNumber: "09" + faker.string.numeric(8),
                        password: fakePassword,
                        confirmPassword: fakePassword,
                    };

                    try {
                        await apiClient.post("/auth/register", payload);
                        successCount++;
                        createdUsers.push("[USER] " + payload.username);
                    } catch (error) {
                        failCount++;
                        const errMsg = error.response?.data?.message || error.message;
                        errorDetails.push(`${payload.username}: ${errMsg}`);
                    }
                }

                // 5. Xử lý Popup báo cáo
                let modalContent = `
                <div style="margin-bottom: 10px;">
                    <p><strong>Tổng số request:</strong> ${amount + 2}</p>
                    <p><strong>Thành công:</strong> <span style="color: var(--success-color); font-weight: bold;">${successCount}</span></p>
                    <p><strong>Thất bại:</strong> <span style="color: var(--error-color); font-weight: bold;">${failCount}</span></p>
                </div>
            `;

                if (failCount > 0) {
                    modalContent += `
                    <p style="margin-top: 10px;"><strong>Chi tiết lỗi:</strong></p>
                    <ul style="padding-left: 20px; color: var(--error-color); font-size: 0.85rem;">
                        ${errorDetails.slice(0, 5).join("<br>")}
                        ${failCount > 5 ? "<br>..." : ""}
                    </ul>
                `;
                }

                if (successCount > 0) {
                    modalContent += `
                    <p style="margin-top: 10px;"><strong>Đã tạo:</strong></p>
                    <ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.85rem; max-height: 150px; overflow-y: auto;">
                        ${createdUsers.map((u) => `<li>${u}</li>`).join("")}
                    </ul>
                `;
                }

                window.openModal("Kết quả Seed", modalContent);

                if (failCount === 0) {
                    window.showToast("Hoàn tất quá trình. Thành công.", "success");
                } else {
                    window.showToast("Hoàn tất quá trình. Lỗi.", "error");
                }
            } catch (error) {
                window.showToast("Lỗi hệ thống.", "error");
            } finally {
                btnSeedUsers.disabled = false;
                btnSeedUsers.innerHTML = originalText;
            }
        });
    }

    // --- BẮT ĐẦU PHẦN SEED SPECIES ---
    const btnSeedSpecies = document.getElementById("btn-seed-species");
    if (btnSeedSpecies) {
        btnSeedSpecies.addEventListener("click", async () => {
            const originalText = btnSeedSpecies.innerHTML;

            try {
                btnSeedSpecies.disabled = true;
                btnSeedSpecies.innerHTML =
                    "<i class='bx bx-loader-alt bx-spin'></i> Đang xử lý...";
                window.showToast("Bắt đầu dọn dẹp và bơm dữ liệu Species...", "success");

                let successCount = 0;
                let failCount = 0;
                let errorDetails = [];
                let createdSpecies = [];

                // 1. Xóa toàn bộ Species cũ
                try {
                    await apiClient.delete("/species");
                } catch (error) {
                    console.warn(error);
                }

                // 2. Dữ liệu cứng (Chó, Mèo)
                const speciesList = [
                    {
                        name: "Chó",
                        description:
                            "Động vật có vú thuộc họ Chó, thường được nuôi làm thú cưng giữ nhà hoặc bạn đồng hành.",
                    },
                    {
                        name: "Mèo",
                        description:
                            "Động vật có vú nhỏ nhắn thuộc họ Mèo, được nuôi phổ biến để làm thú cưng bắt chuột hoặc bầu bạn.",
                    },
                ];

                // 3. Gọi API tạo mới cho từng loài
                for (const item of speciesList) {
                    try {
                        await apiClient.post("/species", item);
                        successCount++;
                        createdSpecies.push(item.name);
                    } catch (error) {
                        failCount++;
                        const errMsg = error.response?.data?.message || error.message;
                        errorDetails.push(`${item.name}: ${errMsg}`);
                    }
                }

                // 4. Xử lý Popup báo cáo
                let modalContent = `
                    <div style="margin-bottom: 10px;">
                        <p><strong>Tổng số request:</strong> ${speciesList.length}</p>
                        <p><strong>Thành công:</strong> <span style="color: var(--success-color); font-weight: bold;">${successCount}</span></p>
                        <p><strong>Thất bại:</strong> <span style="color: var(--error-color); font-weight: bold;">${failCount}</span></p>
                    </div>
                `;

                if (failCount > 0) {
                    modalContent += `
                        <p style="margin-top: 10px;"><strong>Chi tiết lỗi:</strong></p>
                        <ul style="padding-left: 20px; color: var(--error-color); font-size: 0.85rem;">
                            ${errorDetails.join("<br>")}
                        </ul>
                    `;
                }

                if (successCount > 0) {
                    modalContent += `
                        <p style="margin-top: 10px;"><strong>Đã tạo:</strong></p>
                        <ul style="padding-left: 20px; color: var(--text-secondary); font-size: 0.85rem;">
                            ${createdSpecies.map((s) => `<li>${s}</li>`).join("")}
                        </ul>
                    `;
                }

                window.openModal("Kết quả Seed Species", modalContent);

                if (failCount === 0) {
                    window.showToast("Hoàn tất quá trình.", "success");
                } else {
                    window.showToast("Chạy xong nhưng có lỗi.", "error");
                }
            } catch (error) {
                window.showToast("Lỗi hệ thống.", "error");
            } finally {
                btnSeedSpecies.disabled = false;
                btnSeedSpecies.innerHTML = originalText;
            }
        });
    }
    // --- KẾT THÚC PHẦN SEED SPECIES ---
});
