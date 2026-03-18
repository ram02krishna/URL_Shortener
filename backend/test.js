async function test() {
  const email = "test1@example.com";
  // 1. Signup
  let res = await fetch("http://localhost:8000/user/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstname: "Test",
      lastname: "User",
      email,
      password: "password123",
      confirmPassword: "password123"
    })
  });
  console.log("Signup:", await res.json());

  // 2. Forgot Password
  res = await fetch("http://localhost:8000/user/forgot-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  console.log("Forgot Password:", await res.json());

  // We can't easily test Reset Password without the OTP, but we can verify it doesn't crash
  res = await fetch("http://localhost:8000/user/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp: "123456", newPassword: "newpassword" })
  });
  console.log("Reset Password (invalid setup):", await res.json());
}

test();
