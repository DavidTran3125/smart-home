

const API_URL = "http://localhost:3000/api/v1";
let authToken = "";
let homeId = "";
let inviteToken = "";

async function testHomeApi() {
  console.log("🚀 Starting Home API Tests...");

  try {
    // 1. Register a new user (auto-creates a home)
    const uniqueId = Date.now();
    console.log("1. Registering a new user (auto-creates a home)");
    let res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `admin_${uniqueId}`,
        email: `admin_${uniqueId}@example.com`,
        password: "password123",
        full_name: "Admin Tester"
      })
    });
    
    let data = await res.json();
    console.log("Register Response:", data);
    homeId = data?.data?.home?._id || "";
    if (!homeId) throw new Error("Home was not created during register");

    console.log("\n2. Logging in...");
    res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `admin_${uniqueId}@example.com`,
        password: "password123",
      })
    });
    data = await res.json();
    console.log("Login Response:", data.success ? "Success (Token Hidden)" : data);
    
    if (!data.success) throw new Error("Login failed");
    authToken = data.token;
    
    console.log("\n3. Inviting a Member...");
    res = await fetch(`${API_URL}/homes/${homeId}/members/invite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${authToken}`
      },
      body: JSON.stringify({ email: `member_${uniqueId}@example.com` })
    });
    data = await res.json();
    console.log("Invite Member Response:", data);
    
    if (data.success && data.data) {
        inviteToken = data.data.token;
        
        console.log("\n4. Registering the Invited Member...");
        res = await fetch(`${API_URL}/homes/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
              token: inviteToken, 
              email: `member_${uniqueId}@example.com`,
              username: `member_${uniqueId}`,
              password: "password123",
              full_name: "Member Tester"
          })
        });
        data = await res.json();
        console.log("Process Registration Response:", data);
    }
    
    console.log("\n✅ Test completed.");
    process.exit(0);

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

testHomeApi();
